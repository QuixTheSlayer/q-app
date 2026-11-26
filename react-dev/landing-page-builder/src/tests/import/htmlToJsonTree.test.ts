import { describe, it, expect } from 'vitest'
import { htmlToJsonTree, buildImportedScript } from '@/utils/htmlToCanvasNodes'
import type { CanvasNode, LayoutNode } from '@/types/node.type'
import { buildExportHtml } from '@/utils/exportHTML'

type AnyNode = CanvasNode & { attributes?: Record<string, string>; children?: unknown; url?: string; src?: string }

const kids = (n: CanvasNode) => (n as LayoutNode).children as AnyNode[]
const doc = (n: CanvasNode) => JSON.parse((n as { children: string }).children)

const PAGE = `<!doctype html>
<html><head>
<title>Event</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">
<style>
@import url("https://example.com/extra.css");
body { font-family: Inter; }
.hero h1 { color: red; }
@media (max-width: 600px) { .card { padding: 4px; } }
@keyframes spin { from { transform: rotate(0) } to { transform: rotate(360deg) } }
</style>
</head>
<body class="dark">
<div id="app">
	<header class="site-header">
		<nav class="nav"><a href="#about" class="link">About</a> <a href="/tickets" class="link cta">Tickets</a></nav>
	</header>
	<section class="hero" style="padding: 40px; background: #000">
		<h1>Hello <strong>world</strong></h1>
		<p>Read the <a href="/terms">terms</a> first.</p>
		<ul><li>One</li><li>Two</li></ul>
		<img src="/a.png" alt="A" width="200">
		<a href="/x" class="card-link"><div class="card"><h3>Card</h3></div></a>
		<iframe src="https://www.youtube.com/embed/abc"></iframe>
		<input type="text">
		<div class="divider"></div>
	</section>
	<footer>Loose footer text</footer>
</div>
<script>document.addEventListener('DOMContentLoaded', () => { window.__ran = true })</script>
<script type="application/ld+json">{"a":1}</script>
</body></html>`

describe('htmlToJsonTree', () => {
	const { root, css, js, skipped } = htmlToJsonTree(PAGE)

	it('makes the first element inside body the root', () => {
		expect(root.contentType).toBe('root')
		expect(root.attributes?.id).toBe('lp-app')
		expect(root.attributes?.className).toBeUndefined()
	})

	it("turns the root element's children into sections", () => {
		expect(root.children.map((s) => s.contentType)).toEqual(['section', 'section', 'section'])
		expect((root.children[0] as AnyNode).attributes?.className).toBe('site-header')
	})

	it('turns a nav of links into separate button nodes', () => {
		const nav = kids(root.children[0])[0]
		expect(nav.attributes?.className).toBe('nav')
		expect(kids(nav).map((n) => n.contentType)).toEqual(['button', 'button'])
		expect(kids(nav)[1].attributes).toMatchObject({ href: '/tickets', className: 'link cta' })
	})

	it('keeps inline formatting, links and heading tags inside text nodes', () => {
		const hero = root.children[1] as AnyNode
		expect(hero.style).toMatchObject({ padding: '2.5em', background: '#000' })
		const [h1, p, ul] = kids(hero)
		expect(doc(h1).content[0]).toMatchObject({ type: 'heading', attrs: { level: 1 } })
		expect(JSON.stringify(doc(h1))).toContain('"bold"')
		expect(JSON.stringify(doc(p))).toContain('"href":"/terms"')
		// Lists are blocks (enable_import_lists_as_blocks): ul > li, each item holding its text.
		expect(ul).toMatchObject({ contentType: 'block', tag: 'ul' })
		expect(kids(ul).map((li) => (li as { tag?: string }).tag)).toEqual(['li', 'li'])
		expect(JSON.stringify(doc(kids(kids(ul)[0])[0]))).toContain('One')
	})

	it('maps media, linked blocks and iframes to their node types', () => {
		const types = kids(root.children[1]).map((n) => n.contentType)
		expect(types).toEqual(['text', 'text', 'block', 'image', 'block', 'youtube', 'formField', 'block'])
		const img = kids(root.children[1])[3]
		expect(img.style).toMatchObject({ width: '12.5em' })
		expect(kids(root.children[1])[4].attributes).toMatchObject({ href: '/x', className: 'card-link' })
	})

	it('keeps form controls as form field nodes, so nothing here is skipped', () => {
		expect(skipped).toEqual([])
		expect(kids(root.children[1])[6]).toMatchObject({ contentType: 'formField', tag: 'input', field: { type: 'text' } })
	})

	it('wraps bare text in a text node', () => {
		expect(kids(root.children[2])[0].contentType).toBe('text')
	})

	it('keeps CSS as written, with Google Fonts hoisted and other imports dropped', () => {
		const lines = css.split('\n')
		expect(lines[0]).toBe('@import url("https://fonts.googleapis.com/css2?family=Inter");')
		expect(css).not.toContain('example.com/extra.css')
		// body rules land on the imported root, not the editor's own <body>.
		expect(css).toContain(':where([data-lp-page]) { font-family: Inter; }')
		// A rule for a text tag also selects the wrapper that stands for it.
		expect(css).toMatch(/\.lp-hero h1\s*,\s*\.lp-hero \[data-lp-text="h1"\]\s*\{ color: red; \}/)
		expect(css).toContain('@media (max-width: 600px) {.lp-card { padding: 0.25em; }}')
	})

	it('keeps only classic inline scripts', () => {
		expect(js).toContain('window.__ran = true')
		expect(js).not.toContain('"a":1')
	})
})

describe('htmlToJsonTree root element', () => {
	it("makes a lone page wrapper the root, with its own class/style", () => {
		const { root } = htmlToJsonTree(
			'<body><div class="page" style="max-width: 900px"><section>A</section><section>B</section></div><script src="x.js"></script></body>',
		)
		expect(root.attributes?.className).toBe('page')
		expect(root.style).toMatchObject({ maxWidth: '56.25em' })
		expect(root.children).toHaveLength(2)
	})

	it('uses <body> as the root when it holds several top-level elements', () => {
		const { root } = htmlToJsonTree(
			'<body class="theme"><a class="skip-link" href="#main">Skip</a><header class="bar">H</header><main id="main"><section class="a">A</section><section class="b">B</section></main><footer>F</footer></body>',
		)
		expect(root.attributes?.className).toBe('theme')
		// <main> is unwrapped, so its sections are page sections of their own
		const classes = root.children.map((s) => (s as AnyNode).attributes?.className)
		expect(classes).toEqual([undefined, 'bar', 'a', 'b', undefined])
		expect(root.children).toHaveLength(5)
	})

	it('keeps a lone <section> fragment as one section instead of splitting it', () => {
		const { root } = htmlToJsonTree('<section class="hero"><h1>Hi</h1><p>There</p></section>')
		expect(root.children).toHaveLength(1)
		expect((root.children[0] as AnyNode).attributes?.className).toBe('hero')
	})

	it('reports linked files it could not include', () => {
		const { external, css } = htmlToJsonTree(
			'<link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="https://cdn.example.com/a.css"><script src="script.js"></script><div>x</div>',
		)
		// Only Google Fonts is loaded from other sites; other CDN stylesheets are reported too.
		expect(external).toEqual(['styles.css', 'https://cdn.example.com/a.css', 'script.js'])
		expect(css).not.toContain('cdn.example.com')
	})
})

describe('buildImportedScript', () => {
	it('runs DOMContentLoaded handlers even though the event already fired', async () => {
		const code = buildImportedScript("document.addEventListener('DOMContentLoaded', () => { window.__ok = 1 }); const a = 1;")
		new Function(code)()
		new Function(code)() // re-injection must not throw on `const a`
		await new Promise((r) => setTimeout(r, 20))
		expect((window as unknown as { __ok: number }).__ok).toBe(1)
	})
})

describe('export → import round trip', () => {
	const page = {
		id: 'root-1', type: 'container', contentType: 'root', layout: 'column', style: { width: '81.5em' },
		plainCss: '.hero { color: red; }', plainJS: 'console.log(1)',
		animation: [{ id: 't1', trigger_effect: [{ trigger: 'hover', effects: [{ animation_type: 'backgroundColor', style: { 'background-color': '#000' } }] }] }],
		children: [{
			id: 's1', type: 'container', contentType: 'section', layout: 'column',
			style: { padding: '20px' }, responsiveStyle: { mobile: { padding: '8px' } }, attributes: { className: 'hero' },
			children: [{ id: 't1', type: 'content', contentType: 'text', style: { fontSize: '2em' }, children: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tricky </script> text' }] }] }) }],
		}],
	} as unknown as CanvasNode

	it('restores the exact node tree from an exported file', () => {
		const html = buildExportHtml('<div class="rendered">ignored markup</div>', 'Page', { plainCss: page.plainCss, plainJS: page.plainJS, content: page })
		const { root, css, js, skipped } = htmlToJsonTree(html)
		expect(root).toEqual(page)
		expect(css).toBe('.hero { color: red; }')
		expect(js).toBe('console.log(1)')
		expect(skipped).toEqual([])
	})

	it('falls back to converting the markup when no tree is embedded', () => {
		const { root } = htmlToJsonTree(buildExportHtml('<div><section class="x">Hi</section></div>', 'Page'))
		expect(root.children).toHaveLength(1)
	})
})

describe('div and span are always blocks', () => {
	const { root } = htmlToJsonTree(
		'<div id="page"><section>' +
			'<div class="only-text">Just text</div>' +
			'<div class="mixed">Price <span class="amount">$20</span> per <b>seat</b></div>' +
		'</section></div>',
	)
	const [onlyText, mixed] = kids(root.children[0])

	it('keeps a text-only div as a block with one text node', () => {
		expect(onlyText).toMatchObject({ type: 'container', contentType: 'block', attributes: { className: 'only-text' } })
		expect(onlyText).not.toHaveProperty('tag')
		expect(kids(onlyText).map((n) => n.contentType)).toEqual(['text'])
		expect(JSON.stringify(doc(kids(onlyText)[0]))).toContain('Just text')
	})

	it('turns spans into blocks and wraps the text around them in text nodes', () => {
		expect(kids(mixed).map((n) => n.contentType)).toEqual(['text', 'block', 'text'])
		const [before, span, after] = kids(mixed)
		expect(JSON.stringify(doc(before))).toContain('Price')
		expect(span.attributes).toMatchObject({ className: 'amount' })
		// still a block node, but it renders as a real <span>
		expect(span).toMatchObject({ contentType: 'block', tag: 'span' })
		expect(kids(span).map((n) => n.contentType)).toEqual(['text'])
		expect(JSON.stringify(doc(kids(span)[0]))).toContain('$20')
		// inline formatting next to the text still stays inside the text node
		expect(JSON.stringify(doc(after))).toContain('"bold"')
	})
})

describe('empty elements', () => {
	it('keeps empty elements with no attributes, like hamburger bars', () => {
		const { root } = htmlToJsonTree(
			'<div id="page"><nav><div class="menu-toggle">\n<span></span>\n<span></span>\n<span></span>\n</div><div></div></nav></div>',
		)
		const [toggle, bare] = kids(root.children[0])
		expect(kids(toggle)).toHaveLength(3)
		expect(kids(toggle)[0]).toMatchObject({ contentType: 'block', tag: 'span', children: [] })
		expect(bare).toMatchObject({ contentType: 'block', children: [] })
	})
})

describe('text color fallback', () => {
	const markColor = (n: CanvasNode) => JSON.stringify(doc(n)).match(/"color":"([^"]*)"/)?.[1]
	const { root } = htmlToJsonTree(
		'<style>:root { --brand: #0a5; } .tinted { color: var(--brand); } .own { color: gold; }</style>' +
		'<div id="page"><section>' +
			'<div style="color: red"><p>Inline parent</p></div>' +
			'<div class="tinted"><h2>CSS parent</h2>Bare text</div>' +
			'<p>No color anywhere</p>' +
			'<p class="own">Own class color</p>' +
			'<p style="color: blue">Own inline color</p>' +
		'</section></div>',
	)
	const [inlineParent, cssParent, noColor, ownClass, ownInline] = kids(root.children[0])

	it("uses the parent's inline color when the text has none", () => {
		const text = kids(inlineParent)[0]
		expect(text.style).toMatchObject({ color: 'red' })
		// on the node's style only - a textStyle mark would render a <span> inside the <p>
		expect(markColor(text)).toBeUndefined()
	})

	it("uses the parent's stylesheet color (a :root variable stays var()), for text elements and bare text", () => {
		const [heading, bare] = kids(cssParent)
		expect(heading.style).toMatchObject({ color: 'var(--lp-brand)' })
		expect(bare.style).toMatchObject({ color: 'var(--lp-brand)' })
		expect(markColor(bare)).toBeUndefined()
	})

	it('falls back to white when no ancestor has a color', () => {
		expect(noColor.style).toMatchObject({ color: '#ffffff' })
		expect(markColor(noColor)).toBeUndefined()
	})

	it('leaves text that sets its own color alone', () => {
		expect(ownClass.style).not.toHaveProperty('color')
		expect(markColor(ownClass)).toBeUndefined()
		expect(ownInline.style).toMatchObject({ color: 'blue' })
		expect(markColor(ownInline)).toBeUndefined()
	})
})

describe('buildImportedScript with jQuery', () => {
	it('loads jQuery before running code that uses it', () => {
		const code = buildImportedScript("$('.x').addClass('y')")
		expect(code).toContain('code.jquery.com/jquery-3.7.1.min.js')
		expect(code).toContain('integrity')
		expect(buildImportedScript('document.title = "a"')).not.toContain('jquery')
	})

	it('runs straight away when jQuery is already on the page', async () => {
		const w = window as unknown as { jQuery?: unknown; __jqRan?: boolean }
		w.jQuery = () => undefined
		new Function(buildImportedScript('jQuery.fn; window.__jqRan = true'))()
		await new Promise((r) => setTimeout(r, 20))
		expect(w.__jqRan).toBe(true)
		delete w.jQuery
	})
})

describe('span text wrapping', () => {
	it("wraps a span's text in a <p> with no extra <span> inside it", () => {
		const { root } = htmlToJsonTree('<div id="page"><section><span class="a">text </span></section></div>')
		const span = kids(root.children[0])[0]
		expect(span).toMatchObject({ contentType: 'block', tag: 'span' })
		const [text] = kids(span)
		expect(doc(text).content).toMatchObject([{ type: 'paragraph', content: [{ type: 'text', text: 'text' }] }])
		expect(doc(text).content[0].content[0].marks).toBeUndefined()
	})
})
