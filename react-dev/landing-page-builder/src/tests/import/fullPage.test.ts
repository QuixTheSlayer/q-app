import { describe, it, expect } from 'vitest'
import { htmlToJsonTree } from '@/utils/htmlToCanvasNodes'
import { passthroughAttributes } from '@/utils/nodeAttributes'
import { sanitizeCss } from '@/utils/security/sanitizeCss'
import type { CanvasNode, LayoutNode } from '@/types/node.type'

// Rules from a full themed page (header/main/footer, :root variables with a dark variant).
type AnyNode = CanvasNode & { tag?: string; attributes?: Record<string, string>; children: unknown }
const kids = (n: CanvasNode) => (n as LayoutNode).children as AnyNode[]
const FONT = 'https://fonts.googleapis.com/css2?family=Young+Serif&family=Figtree:wght@400;500;600;700&display=swap'

const doc = (body: string, css = '') => `<!DOCTYPE html><html><head>
<link href="${FONT}" rel="stylesheet">
<style>
:root { --ink: #2B1B2E; --bg: #E6EBE0; }
:root[data-theme="dark"] { --ink: #EFE9E2; --bg: #1E1521; }
body { margin: 0; background: var(--bg); color: var(--ink); font-size: 1.0625rem; }
${css}
</style></head><body>${body}</body></html>`

const walk = (node: CanvasNode, out: AnyNode[] = []) => {
	const n = node as AnyNode
	out.push(n)
	if (Array.isArray(n.children)) (n.children as AnyNode[]).forEach((c) => walk(c, out))
	return out
}

describe('full page structure', () => {
	it('makes only the direct children of <body> (and of an unwrapped <main>) sections', () => {
		const { root } = htmlToJsonTree(doc('<header class="nav"><div>Brand</div></header><main><section class="hero"><section class="inner"><p>Hi</p></section></section><div class="facts"><p>12</p></div></main><footer><p>c</p></footer>'))
		expect(kids(root).map((s) => [s.contentType, s.tag, s.attributes?.className])).toEqual([
			['section', 'header', 'nav'], ['section', 'section', 'hero'], ['section', 'div', 'facts'], ['section', 'footer', undefined],
		])
		const nested = walk(root).filter((n) => n !== root && !kids(root).includes(n) && n.type === 'container')
		expect(nested.every((n) => n.contentType === 'block')).toBe(true)
		expect(nested.find((n) => n.attributes?.className === 'inner')?.tag).toBe('section')
	})
})

describe('themed variables', () => {
	it('ignores inactive theme variants and keeps :root variables as var()', () => {
		const { root } = htmlToJsonTree(doc('<section><p>Text</p></section>'))
		const text = walk(root).find((n) => n.contentType === 'text')!
		expect(text.style).toMatchObject({ color: 'var(--lp-ink)' })
	})

	it('resolves SVG colors from the default theme, not the dark variant', () => {
		const { root } = htmlToJsonTree(doc('<section><svg viewBox="0 0 10 10"><rect fill="var(--ink)" width="10" height="10"/></svg></section>'))
		const image = walk(root).find((n) => n.contentType === 'image')!
		const svg = decodeURIComponent(String(image.children))
		// Live, so the page's dark theme recolors it; the fallback is the default theme's value.
		expect(svg).toContain('fill="var(--lp-ink, #2B1B2E)"')
	})

	it('gives the root the page background, text color and font size set on <body>', () => {
		const { root } = htmlToJsonTree(doc('<section><p>Text</p></section>'))
		expect(root.style).toMatchObject({ background: 'var(--lp-bg)', color: 'var(--lp-ink)', fontSize: '1.0625em', width: '81.5em' })
	})
})

describe('fonts', () => {
	it('keeps a Google Fonts @import whose URL contains semicolons', () => {
		const { css } = htmlToJsonTree(doc('<section><p>x</p></section>'))
		expect(css).toContain(`@import url("${FONT}");`)
		expect(sanitizeCss(`@import url("${FONT}");\np{}`)).toContain(FONT)
	})

	it('still drops a non-allowlisted @import that hides behind a quoted semicolon', () => {
		expect(sanitizeCss('@import url("https://evil.example/a;b.css");p{}')).not.toContain('evil')
	})
})

describe('tags a parent or CSS depends on', () => {
	it('keeps a text-only <summary> as a real summary inside <details>', () => {
		const { root } = htmlToJsonTree(doc('<section><details><summary>Question?</summary><p>Answer</p></details></section>'))
		const details = walk(root).find((n) => n.tag === 'details')!
		const [summary, answer] = kids(details)
		expect(summary).toMatchObject({ contentType: 'block', tag: 'summary' })
		expect(kids(summary)[0].contentType).toBe('text')
		expect(answer.contentType).toBe('text')
	})

	it('keeps dt/dd and label tags', () => {
		const { root } = htmlToJsonTree(doc('<section><dl><div><dt>Finalists</dt><dd>12</dd></div></dl><label for="x">Name</label></section>'))
		const tags = walk(root).map((n) => n.tag).filter(Boolean)
		expect(tags).toEqual(expect.arrayContaining(['dl', 'dt', 'dd', 'label']))
		expect(walk(root).find((n) => n.tag === 'label')?.attributes?.htmlFor).toBe('x')
	})

	it('keeps an empty CSS-drawn inline element (a meter bar) as its own tag', () => {
		const { root } = htmlToJsonTree(doc('<section><div class="meter"><i style="width:36%"></i></div></section>'))
		expect(walk(root).find((n) => n.tag === 'i')?.style).toMatchObject({ width: '36%' })
	})
})

describe('hidden content', () => {
	it('keeps `hidden` for the page but not on the editor canvas', () => {
		const { root } = htmlToJsonTree(doc('<section><ol id="day2" hidden><li><a href="#a">A</a></li></ol></section>'))
		const list = walk(root).find((n) => n.attributes?.id === 'lp-day2')!
		expect(passthroughAttributes(list.attributes)).toMatchObject({ hidden: 'hidden' })
		expect(passthroughAttributes(list.attributes, 'editor')).not.toHaveProperty('hidden')
	})
})

describe('page variables and text', () => {
	it('prefixes the page variables everywhere so they cannot clash with the builder theme', () => {
		const { root, css, js } = htmlToJsonTree(doc('<section><div class="t" style="--r: 2deg">x</div></section><script>el.style.stroke = "var(--ink)"; let i = 3; --i;</script>', '.t { transform: rotate(var(--r)); }'))
		expect(css).toContain('--lp-ink:')
		expect(css).toContain('rotate(var(--lp-r))')
		expect(css).not.toMatch(/(^|[^-\w])--ink:/)
		expect(walk(root).find((n) => n.attributes?.className === 'lp-t')?.style).toMatchObject({ '--lp-r': '2deg' })
		expect(js).toContain('"var(--lp-ink)"')
		expect(js).toContain('--i;')
	})

	it('marks text from non-<p> elements so the page p rules skip its inner <p>', () => {
		const { root, css } = htmlToJsonTree(doc('<section><div class="time">Sat</div><p class="lede">Para</p></section>'))
		const texts = walk(root).filter((n) => n.contentType === 'text')
		expect(texts.map((t) => t.attributes?.['data-lp-text'])).toEqual(['plain', 'p'])
		expect(css).toContain('[data-lp-text] :is(p, h1')
	})

	it('points page CSS written for <form> at the block the form becomes', () => {
		const { root, css } = htmlToJsonTree(doc('<section><form id="reg"><button type="submit" class="btn">Go</button></form></section>', 'form .btn { color: red } .form, #form, my-form { color: blue }'))
		expect(css).toContain('[data-lp-form] .lp-btn')
		expect(css).toContain('.lp-form, :where([data-lp-page]) #form, :where([data-lp-page]) my-form')
		expect(walk(root).find((n) => n.attributes?.id === 'lp-reg')?.attributes).toHaveProperty('data-lp-form', '')
	})

	it('keeps a heading holding a span block as a heading, and records link/button tags', () => {
		const { root } = htmlToJsonTree(doc('<section class="hero"><h1>Title<span>Sub</span></h1><a class="btn" href="#x">Go</a><button id="b">B</button></section>'))
		const h1 = walk(root).find((n) => n.tag === 'h1')!
		expect(h1.contentType).toBe('block')
		expect(kids(h1).map((n) => n.contentType)).toEqual(['text', 'block'])
		const buttons = walk(root).filter((n) => n.contentType === 'button')
		expect(buttons.map((b) => b.tag)).toEqual(['a', 'button'])
	})
})

describe('form fields', () => {
	it('keeps inputs, selects and textareas with their settings; submit inputs become buttons', () => {
		const { root, skipped } = htmlToJsonTree(doc(`<section><form id="f">
			<input id="email" name="email" type="email" placeholder="you@example.com" required class="in">
			<select name="day"><option value="">Pick</option><option selected>Sat</option></select>
			<textarea name="diet" rows="3">None</textarea>
			<label class="check"><input type="checkbox" name="news" checked> Send me news</label>
			<input type="hidden" name="token" value="x">
			<input type="submit" value="Reserve">
		</form></section>`))
		const nodes = walk(root)
		const fields = nodes.filter((n) => n.contentType === 'formField') as unknown as { tag: string; field: Record<string, unknown>; attributes?: Record<string, string> }[]
		expect(fields.map((f) => f.tag)).toEqual(['input', 'select', 'textarea', 'input'])
		expect(fields[0]).toMatchObject({ field: { type: 'email', name: 'email', placeholder: 'you@example.com', required: true }, attributes: { id: 'lp-email' } })
		expect(fields[1].field.options).toEqual([{ value: '', label: 'Pick' }, { value: 'Sat', label: 'Sat', selected: true }])
		expect(fields[2].field).toMatchObject({ rows: 3, value: 'None' })
		expect(fields[3].field).toMatchObject({ type: 'checkbox', checked: true })
		expect(nodes.some((n) => n.contentType === 'button' && n.children === 'Reserve')).toBe(true)
		expect(skipped).toEqual([])
	})
})
