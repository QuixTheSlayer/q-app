import { describe, it, expect } from 'vitest'
import { htmlToJsonTree, stripCodeFences } from '@/utils/htmlToCanvasNodes'
import { passthroughAttributes } from '@/utils/nodeAttributes'
import { sanitizeCanvasTree } from '@/utils/security/sanitizeCanvasTree'
import { buildSandboxDocument, needsSandbox } from '@/utils/security/sandboxDocument'
import type { CanvasNode, LayoutNode } from '@/types/node.type'

// Parse rules ported from frontend-editor (D:/Q_P/frontend-editor, model/parse + model/tree/textRules).

type AnyNode = CanvasNode & { attributes?: Record<string, string>; tag?: string; children?: unknown }
const kids = (n: CanvasNode) => (n as LayoutNode).children as AnyNode[]
const page = (body: string) => htmlToJsonTree(`<!doctype html><html><body><div id="page"><section>${body}</section></div></body></html>`)
const first = (body: string) => kids(page(body).root.children[0])[0]
const textOf = (n: AnyNode) => JSON.stringify(n.children)

describe('code fences', () => {
	it('takes the code out of an AI reply, with its css and js fences as <style> and <script>', () => {
		const reply = 'Here is your page:\n```html\n<div class="hero">Hi</div>\n```\nStyles:\n```css\n.hero { color: red; }\n```\n```js\ndocument.title = "x"\n```\nEnjoy!'
		const { root, css, js } = htmlToJsonTree(reply)
		expect(JSON.stringify(root)).toContain('Hi')
		expect(JSON.stringify(root)).not.toContain('Enjoy')
		expect(css).toContain('color: red')
		expect(js).toContain('document.title = "x"')
	})

	it('leaves input that is already markup alone', () => {
		const html = '<p>Use ```code``` here</p>'
		expect(stripCodeFences(html)).toBe(html)
	})
})

describe('inline style', () => {
	it('does not split a declaration on a ; inside url() or quotes', () => {
		const node = first('<div style="background-image: url(data:image/png;base64,AAAA); font-family: \'a;b\', serif">x</div>')
		expect((node as unknown as { style: Record<string, string> }).style.backgroundImage).toBe('url(data:image/png;base64,AAAA)')
		expect((node as unknown as { style: Record<string, string> }).style.fontFamily).toBe("'a;b', serif")
	})
})

describe('every attribute', () => {
	it('keeps safe attributes under their React names, with booleans present', () => {
		const details = first('<details open name="faq"><summary>Q</summary><p>A</p></details>')
		expect(details.attributes).toMatchObject({ open: '', name: 'faq' })
		expect(passthroughAttributes(details.attributes)).toMatchObject({ open: 'open', name: 'faq' })
		const time = first('<div><time datetime="2025-05-01" class="d">May</time> soon</div>')
		expect(JSON.stringify(time)).toContain('"dateTime":"2025-05-01"')
	})

	it('drops handlers, srcset and form actions, and keeps page-only attributes out of the editor', () => {
		const node = first('<div onclick="x()" srcset="a.png 1x" formaction="/x" inert hidden disabled tabindex="2">x</div>')
		expect(Object.keys(node.attributes ?? {}).sort()).toEqual(['disabled', 'hidden', 'inert', 'tabIndex'])
		expect(passthroughAttributes(node.attributes, 'editor')).toEqual({ tabIndex: '2' })
		expect(passthroughAttributes({ href: '/x', target: '_blank' })).toEqual({})
	})
})

describe('lossless text', () => {
	it('keeps bare formatting and plain links inside one text node', () => {
		const node = first('<p>Read the <a href="/t">terms</a> and <b>rules</b>.</p>')
		expect(node.contentType).toBe('text')
		expect(textOf(node)).toContain('bold')
	})

	it('splits a line around an inline tag TipTap would change, keeping its tag and the text around it', () => {
		const p = first('<p>Save <strong class="price">$20</strong> today</p>')
		const pieces = kids(p)
		expect(pieces.map((n) => n.contentType)).toEqual(['text', 'block', 'text'])
		expect(pieces[1]).toMatchObject({ tag: 'strong', attributes: { className: 'price' } })
		expect(pieces.every((n) => n.attributes && 'data-lp-inline' in n.attributes)).toBe(true)
		expect(textOf(pieces[0])).toContain('Save')
		expect(textOf(pieces[2])).toContain('today')
	})

	it('moves a <br> ending a text piece into its own node, and keeps a text-less styled tag empty', () => {
		const html = '<style>.quote small { opacity: .5 } .mark { width: 9px }</style><div class="quote">Wake me.<br><small style="color:gray">— 117</small></div><a href="/"><i class="mark"></i><span>Home</span></a>'
		const { root } = htmlToJsonTree(html)
		const pieces = kids(root.children[0])
		expect(pieces.map((n) => n.tag ?? n.contentType)).toEqual(['text', 'br', 'small'])
		expect(textOf(pieces[0])).not.toContain('hardBreak')
		const mark = kids(root.children[1])[0]
		expect(mark).toMatchObject({ tag: 'i', children: [] })
	})

	it('turns a link with an id into its own node instead of losing the id', () => {
		const pieces = kids(first('<p>See <a id="t" href="/t">terms</a> now</p>'))
		expect(pieces.map((n) => n.contentType)).toEqual(['text', 'button', 'text'])
		expect(pieces[1].attributes).toMatchObject({ id: 'lp-t' })
	})

	it('keeps an inline tag TipTap has no mark for (<small>, <nav> text) as its own tag', () => {
		expect(first('<small>Fine print</small>')).toMatchObject({ contentType: 'block', tag: 'small' })
		expect(first('<nav>Menu</nav>')).toMatchObject({ contentType: 'block', tag: 'nav' })
	})

	it('makes every list ul/ol/li blocks: plain, nested and link items alike', () => {
		const list = first('<ol class="steps"><li>Submit <strong>work</strong></li><li>Judging<ul><li>Round one</li></ul></li><li><a href="/rules">Rules</a></li></ol>')
		expect(list).toMatchObject({ contentType: 'block', tag: 'ol' })
		const [plain, nested, link] = kids(list)
		expect(plain).toMatchObject({ tag: 'li' })
		expect(kids(plain).map((n) => n.contentType)).toEqual(['text'])
		expect(textOf(kids(plain)[0])).toContain('bold')
		expect(kids(plain)[0].attributes).toHaveProperty('data-lp-inline')
		expect(kids(nested).map((n) => n.tag ?? n.contentType)).toEqual(['text', 'ul'])
		expect(kids(kids(nested)[1])[0]).toMatchObject({ tag: 'li' })
		expect(kids(link).map((n) => n.contentType)).toEqual(['button'])
	})

	it('builds a list from blocks when its items carry attributes TipTap would drop', () => {
		const list = first('<ul class="feats"><li class="on">One</li><li>Two</li></ul>')
		expect(list).toMatchObject({ contentType: 'block', tag: 'ul' })
		expect(kids(list).map((li) => li.tag)).toEqual(['li', 'li'])
		expect(kids(list)[0].attributes).toMatchObject({ className: 'on' })
	})

	it('keeps a button holding tags (a hamburger) as a real <button> block with its empty spans', () => {
		const btn = first('<button class="menu-btn" aria-label="Menu"><span></span><span></span><span></span></button>')
		expect(btn).toMatchObject({ contentType: 'block', tag: 'button' })
		expect(kids(btn).map((n) => n.tag)).toEqual(['span', 'span', 'span'])
		expect(first('<a class="cta" href="/go">Go</a>')).toMatchObject({ contentType: 'button', children: 'Go' })
	})
})

describe('every element', () => {
	it('keeps elements with no node type of their own as blocks with their real tag', () => {
		const { root, skipped } = page(
			'<div class="a">One</div><br><div class="b">Two</div>' +
			'<canvas id="chart" width="300" height="150"></canvas>' +
			'<audio controls src="https://x.test/a.mp3"><source src="https://x.test/a.ogg" type="audio/ogg"></audio>' +
			'<progress value="40" max="100">40%</progress>' +
			'<template id="row"><div class="row">Row</div></template>' +
			'<object data="/x.swf"></object>',
		)
		const tags = kids(root.children[0]).map((n) => n.tag ?? n.contentType)
		expect(tags).toEqual(['block', 'br', 'block', 'canvas', 'audio', 'progress', 'template'])
		const [, , , canvas, audio, , template] = kids(root.children[0])
		expect(canvas.attributes).toMatchObject({ id: 'lp-chart', width: '300', height: '150' })
		expect(audio.attributes).toMatchObject({ controls: '', src: 'https://x.test/a.mp3' })
		expect(kids(audio)[0]).toMatchObject({ tag: 'source', children: [] })
		expect(JSON.stringify(template)).toContain('Row')
		expect(skipped).toEqual(['object'])
	})

	it('keeps an image with no src, and empty elements', () => {
		const node = first('<div><img alt="later" data-x="1"><span></span></div>')
		expect(kids(node).map((n) => n.tag)).toEqual(['img', 'span'])
	})
})

describe('page scripts and <html> attributes', () => {
	const DOC = `<!doctype html><html lang="fr" class="dark" data-theme="night" onload="x()"><head>
<style>html.dark .card { color: white } .menu { color: red }</style>
<script src="https://cdn.example.com/lib.js"></script>
<script src="local.js"></script>
<script type="application/ld+json">{"@type":"Event"}</script>
</head><body><div id="page"><section><div class="card menu" id="nav">x</div></section></div>
<script>document.getElementById('nav')</script>
<script type="module">document.querySelector('.menu')</script>
</body></html>`
	const { root, js, external } = htmlToJsonTree(DOC)
	const r = root as LayoutNode & { pageScripts?: { src?: string; code?: string; type?: string }[]; htmlAttributes?: Record<string, string> }

	it('keeps https src scripts, typed blocks and modules in page order; local files stay external', () => {
		expect(r.pageScripts?.map((s) => s.src ?? s.type)).toEqual(['https://cdn.example.com/lib.js', 'application/ld+json', 'module'])
		expect(external).toEqual(['local.js'])
		expect(js).toContain("getElementById('lp-nav')")
		// Modules get the same class/id renaming as plainJS.
		expect(r.pageScripts?.[2].code).toContain("'.lp-menu'")
	})

	it('keeps the <html> attributes (its class renamed like the CSS), never handlers; lang also on the root', () => {
		expect(r.htmlAttributes).toEqual({ lang: 'fr', class: 'lp-dark', 'data-theme': 'night' })
		expect(r.attributes).toMatchObject({ lang: 'fr' })
	})

	it('drops non-https scripts and handler attributes from crafted page data', () => {
		const safe = sanitizeCanvasTree({ ...r, pageScripts: [{ src: 'javascript:alert(1)' }, { src: 'http://x.test/a.js' }, { src: 'https://ok.test/a.js', type: 'module' }, { code: 'x()', type: 'bad type"' }], htmlAttributes: { onclick: 'x()', lang: 'en' } } as LayoutNode) as typeof r
		expect(safe.pageScripts).toEqual([{ src: 'https://ok.test/a.js', type: 'module' }, { code: 'x()' }])
		expect(safe.htmlAttributes).toEqual({ lang: 'en' })
	})

	it('runs in the sandbox frame: scripts before the page JS, <html> attributes on the frame', () => {
		expect(needsSandbox({ pageScripts: [{ src: 'https://cdn.example.com/lib.js' }] })).toBe(true)
		expect(needsSandbox({ htmlAttributes: { lang: 'fr' } })).toBe(false)
		expect(needsSandbox({ htmlAttributes: { class: 'lp-dark' } })).toBe(true)
		const element = document.createElement('div')
		document.body.appendChild(element)
		const doc = buildSandboxDocument(element, { title: 't', js: r.plainJS ?? js, pageScripts: r.pageScripts, htmlAttributes: r.htmlAttributes })
		expect(doc).toMatch(/<html lang="fr" class="[^"]*lp-dark" data-theme="night">/)
		expect(doc.indexOf('cdn.example.com/lib.js')).toBeLessThan(doc.indexOf("getElementById('lp-nav')"))
		expect(doc).toContain('<script type="module">')
	})
})

describe('text tag selectors', () => {
	it('points every text-tag compound at its wrapper, so `p + p` still matches imported paragraphs', () => {
		const { css } = htmlToJsonTree('<style>.story p+p { margin-top: 17px } .card h3 ~ p { color: red }</style><div class="story"><p>One</p><p>Two</p></div>')
		expect(css).toContain('.lp-story [data-lp-text="p"]+[data-lp-text="p"]')
		expect(css).toContain('[data-lp-text="h3"] ~ [data-lp-text="p"]')
	})
})
