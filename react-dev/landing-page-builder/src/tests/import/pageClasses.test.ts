import { describe, it, expect } from 'vitest'
import { pageClassNames, scopePageClasses } from '@/utils/pageClasses'
import { htmlToJsonTree } from '@/utils/htmlToCanvasNodes'
import { ID_FALLBACK_SCRIPT } from '@/utils/pageIds'

const CSS = `.container { width: min(100%, 76em); }
.nav a.active, .tab:hover { color: red; }
a[href$=".pdf"] { color: blue; }
@media (max-width: 700px) { .container { width: 100%; } }
@keyframes pulse { 0% { opacity: 0.5; } 50.5% { opacity: 1; } }
.lp-already { color: green; }`

describe('pageClassNames', () => {
	it('collects classes from selectors only', () => {
		expect([...pageClassNames(CSS)].sort()).toEqual(['active', 'container', 'nav', 'tab'])
	})
})

describe('scopePageClasses', () => {
	const root = { attributes: { className: 'container main' }, children: [{ attributes: { className: 'nav' }, children: [] }] }
	const js = [
		"document.querySelector('.nav a.active')",
		"el.classList.add('active')",
		"el.className = 'tab active'",
		"fetch('https://cdn.site.com/container.js')",
		"const label = 'Open the container now'",
		"x = 'main'",
	].join(';\n')
	const out = scopePageClasses(root, CSS, js)

	it('prefixes classes in the CSS, keeping quoted parts, at-rules and keyframe steps', () => {
		expect(out.css).toContain('.lp-container { width')
		expect(out.css).toContain('.lp-nav a.lp-active, .lp-tab:hover')
		expect(out.css).toContain('a[href$=".pdf"]')
		expect(out.css).toContain('@media (max-width: 700px) { .lp-container')
		expect(out.css).toContain('50.5% { opacity: 1; }')
		expect(out.css).toContain('.lp-already')
	})

	it('prefixes the node class attributes the CSS styles, leaving others', () => {
		expect(out.root.attributes.className).toBe('lp-container main')
		expect(out.root.children[0].attributes.className).toBe('lp-nav')
	})

	it('prefixes selector and class-list strings in the JS, not prose or URLs', () => {
		expect(out.js).toContain("querySelector('.lp-nav a.lp-active')")
		expect(out.js).toContain("classList.add('lp-active')")
		expect(out.js).toContain("className = 'lp-tab lp-active'")
		expect(out.js).toContain("'https://cdn.site.com/container.js'")
		expect(out.js).toContain("'Open the container now'")
		expect(out.js).toContain("x = 'main'")
	})
})

describe('imported page CSS order', () => {
	const doc = `<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter;wght@400;700">
<style>.hero h1 { color: red; }</style></head><body><section class="hero"><h1>Hi</h1></section></body></html>`
	const { root, css } = htmlToJsonTree(doc)

	it('keeps @import first, then the tag defaults, then the page rules', () => {
		const importAt = css.indexOf('@import')
		const baseAt = css.indexOf(':where([data-lp-page]) h1')
		const pageAt = css.indexOf('.lp-hero h1')
		expect(importAt).toBe(0)
		expect(baseAt).toBeGreaterThan(importAt)
		expect(pageAt).toBeGreaterThan(baseAt)
	})

	it('marks the imported root so the defaults apply inside it only', () => {
		expect(root.attributes).toHaveProperty('data-lp-page', '')
	})
})

describe("tag defaults vs the page's own * reset", () => {
	it("leaves out defaults for properties the page resets on *", () => {
		const { css } = htmlToJsonTree('<style>* { margin: 0; padding: 0 } h1 { color: red }</style><section><h1>Hi</h1><ul><li><a href="#a">A</a></li></ul></section>')
		// No @import here, so the defaults are the first block.
		const base = css.slice(0, css.indexOf('\n\n'))
		expect(base).toContain(':where([data-lp-page]) h1 { color: inherit; font-size: 2em; font-weight: bold; }')
		expect(base).not.toContain('margin-block')
		expect(base).not.toContain('padding-inline-start')
		expect(base).toContain('list-style: disc')
	})
})


describe('imported headings: the wrapper stands for the source element', () => {
	const { root, css } = htmlToJsonTree('<style>.title { font-size: 76px } .about h2 { color: red } h2 + p { margin: 0 }</style><section class="about"><h2 class="title">Hi</h2><p>Text</p></section>')
	const texts: { attributes?: Record<string, string> }[] = []
	const walk = (n: { contentType?: string; children?: unknown; attributes?: Record<string, string> }) => {
		if (n.contentType === 'text') texts.push(n)
		if (Array.isArray(n.children)) n.children.forEach(walk)
	}
	walk(root as never)

	it('marks the wrapper with its source tag and keeps the class on it', () => {
		expect(texts[0].attributes).toMatchObject({ 'data-lp-text': 'h2', className: 'lp-title' })
	})

	it('points tag rules at the wrapper too, and lets the inner heading inherit', () => {
		expect(css).toContain('.lp-about [data-lp-text="h2"]')
		expect(css).toContain('h2 + [data-lp-text="p"]')
		expect(css).toContain('[data-lp-text] :is(p, h1, h2')
		expect(css).toContain(':where([data-lp-page] [data-lp-text="h2"])')
	})
})

describe('imported lists and inline pieces', () => {
	const collect = (n: { contentType?: string; tag?: string; children?: unknown; attributes?: Record<string, string> }, out: typeof n[] = []) => {
		out.push(n)
		if (Array.isArray(n.children)) n.children.forEach((c) => collect(c, out))
		return out
	}

	it('makes a list a ul block of li blocks, with each item text inline on its marker line', () => {
		const { root } = htmlToJsonTree('<style>.features { list-style: none }</style><section><ul class="features"><li>One</li><li>Two</li></ul></section>')
		const list = collect(root as never).find((n) => n.tag === 'ul')!
		expect(list).toMatchObject({ contentType: 'block', attributes: { className: 'lp-features' } })
		const text = collect(list).find((n) => n.contentType === 'text')!
		expect(text.attributes).toHaveProperty('data-lp-inline')
	})

	it('keeps text and spans that shared a line inline, but not separate blocks', () => {
		const { root } = htmlToJsonTree('<style>.hl { color: green }</style><section><h2>Secure your <span class="hl">deployment.</span></h2><div><span>Alone</span><p>Para</p></div></section>')
		const nodes = collect(root as never)
		const h2 = nodes.find((n) => n.tag === 'h2')!
		const [text, span] = (h2.children as typeof nodes)
		expect(text.attributes).toHaveProperty('data-lp-inline', '')
		expect(span.attributes).toHaveProperty('data-lp-inline', '')
		const alone = nodes.find((n) => n.tag === 'span' && n !== span)!
		expect(alone.attributes).not.toHaveProperty('data-lp-inline')
	})
})

describe('spaces between inline text and spans', () => {
	it('keeps the space before and after a span in one line of text', () => {
		const { root } = htmlToJsonTree('<style>.hl { color: green }</style><section><h2>Secure your <span class="hl">deployment</span> now</h2></section>')
		const h2 = JSON.stringify(root)
		expect(h2).toContain('Secure your\u00a0')
		expect(h2).toContain('\u00a0now')
	})
})

describe('page ids', () => {
	const html = `<style>#nav { color: red } a[href="#faq"] { color: blue } .x { filter: url(#blur) }</style>
<header id="nav"><a href="#faq">FAQ</a><label for="email">Email</label><input id="email"><button aria-controls="faq">Open</button></header>
<section id="faq"><p>See <a href="#nav">top</a></p><svg viewBox="0 0 10 10"><defs><filter id="blur"></filter></defs><use href="#dot"/><circle id="dot" fill="url(#blur)" r="2"/></svg></section>
<script>document.getElementById('nav').classList.add('open'); document.querySelector('#faq a'); var u = 'https://x.com/#nav'; var t = 'nav bar';</script>`
	const { root, css, js } = htmlToJsonTree(html)
	const tree = JSON.stringify(root)

	it('prefixes ids and every reference to them in the tree', () => {
		expect(tree).toContain('"id":"lp-nav"')
		expect(tree).toContain('"href":"#lp-faq"')
		expect(tree).toContain('"htmlFor":"lp-email"')
		expect(tree).toContain('"aria-controls":"lp-faq"')
		// A link inside rich text, and the ids inside a converted SVG.
		expect(tree).toContain('#lp-nav')
		const svg = decodeURIComponent(tree.match(/data:image\/svg\+xml[^"]*/)![0])
		expect(svg).toContain('id="lp-blur"')
		expect(svg).toContain('href="#lp-dot"')
		expect(svg).toContain('url(#lp-blur)')
	})

	it('prefixes ids in CSS selectors, [href="#x"] values and url(#x)', () => {
		expect(css).toContain('#lp-nav {')
		expect(css).toContain('a[href="#lp-faq"]')
		expect(css).toContain('url(#lp-blur)')
	})

	it('prefixes id and selector strings in the JS, not URLs or prose', () => {
		expect(js).toContain("getElementById('lp-nav')")
		expect(js).toContain("querySelector('#lp-faq a')")
		expect(js).toContain("'https://x.com/#nav'")
		expect(js).toContain("'nav bar'")
	})

	it('lets scripts find an element by the id they were written with', () => {
		document.body.innerHTML = '<div id="lp-fname"></div>'
		new Function(ID_FALLBACK_SCRIPT)()
		expect(document.getElementById('fname')?.id).toBe('lp-fname')
		expect(document.getElementById('lp-fname')?.id).toBe('lp-fname')
		expect(document.getElementById('missing')).toBeNull()
	})
})
