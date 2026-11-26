import { describe, it, expect } from 'vitest'
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import { buildReactProject } from '@/utils/reactExport/buildReactProject'
import { attrValueCode, cssPropName, isKnownAttribute, jsxAttr, styleEntries, styleJsx } from '@/utils/reactExport/jsxAttrs'
import { parseRenderedHtml } from '@/utils/reactExport/domToNodes'
import { writeElement } from '@/utils/reactExport/jsxWriter'
import { isElement, type ElementNode } from '@/utils/reactExport/types'
import type { CanvasNode } from '@/types/node.type'

const noIds = () => false
const jsxOf = (html: string) => {
	const { nodes, rootId } = parseRenderedHtml(html, noIds)
	const first = (nodes[rootId] as ElementNode).children[0]!
	return writeElement({ nodes, usage: { cssProperties: false } }, first, '')
}
const project = (body: string, assets = {}, options = {}) => buildReactProject(body, 'My Page', assets, options)
const root = (...sections: string[]) => `<div class="w-full min-h-full">${sections.join('')}</div>`

describe('JSX attributes', () => {
	it('uses React names, numbers and booleans; drops handlers and style', () => {
		expect(jsxAttr('label', 'for', 'email', false)).toBe(' htmlFor="email"')
		expect(jsxAttr('td', 'colspan', '2', false)).toBe(' colSpan={2}')
		expect(jsxAttr('input', 'required', '', false)).toBe(' required')
		expect(jsxAttr('input', 'value', 'Hi', false)).toBe(' defaultValue="Hi"')
		expect(jsxAttr('input', 'checked', '', false)).toBe(' defaultChecked')
		expect(jsxAttr('path', 'stroke-width', '2', true)).toBe(' strokeWidth="2"')
		expect(jsxAttr('button', 'onclick', 'go()', false)).toBe('')
		expect(jsxAttr('div', 'style', 'color: red', false)).toBe('')
		expect(jsxAttr('a', 'title', 'Say "hi" {now}', false)).toBe(' title={"Say \\"hi\\" {now}"}')
		expect(jsxAttr('div', 'data-lp-form', '', false)).toBe(' data-lp-form=""')
	})

	it('knows which attributes React only accepts on some tags', () => {
		expect(isKnownAttribute('div', 'novalidate')).toBe(false)
		expect(isKnownAttribute('form', 'novalidate')).toBe(true)
		expect(isKnownAttribute('div', 'class')).toBe(true)
		expect(isKnownAttribute('a', 'href')).toBe(true)
		expect(isKnownAttribute('td', 'colspan')).toBe(true)
		expect(attrValueCode('novalidate', '')).toBe('true')
		expect(attrValueCode('colspan', '3')).toBe('3')
		expect(attrValueCode('name', 'x')).toBe('"x"')
	})
})

describe('inline styles as React style objects', () => {
	it('names properties the way React does', () => {
		expect(cssPropName('background-color')).toBe('backgroundColor')
		expect(cssPropName('-webkit-line-clamp')).toBe('WebkitLineClamp')
		expect(cssPropName('-ms-transform')).toBe('msTransform')
		expect(cssPropName('--lp-ink')).toBe('--lp-ink')
	})

	it('splits on ; outside quotes and parentheses, and drops !important', () => {
		const entries = styleEntries(`background: url(data:image/png;base64,AAA=); font-family: "A;B", serif; color: red !important;`)
		expect(entries).toEqual([
			['background', 'url(data:image/png;base64,AAA=)'],
			['fontFamily', '"A;B", serif'],
			['color', 'red'],
		])
	})

	it('writes one line for short styles and one declaration per line for long ones', () => {
		expect(styleJsx('color: red; width: 1em', '  ')!.code).toBe(" style={{ color: 'red', width: '1em' }}")
		expect(styleJsx('color: red; width: 1em; gap: 2em', '  ')!.code).toBe(" style={{\n    color: 'red',\n    width: '1em',\n    gap: '2em',\n  }}")
		expect(styleJsx('color: red; width: 1em; gap: 2em', null)!.code).toBe(" style={{ color: 'red', width: '1em', gap: '2em' }}")
	})

	it('casts a style with custom properties so it compiles, and escapes quotes', () => {
		const style = styleJsx(`--lp-ink: #111; font-family: 'Inter'`, null)!
		expect(style.needsCast).toBe(true)
		expect(style.code).toBe(` style={{ '--lp-ink': '#111', fontFamily: '\\'Inter\\'' } as CSSProperties}`)
	})
})

describe('JSX elements', () => {
	it('keeps the spaces between words and tags, and a non-breaking space', () => {
		expect(jsxOf('<p>Visit\n   <a href="#x">us</a>  today</p>')).toBe('<p>Visit <a href="#x">us</a> today</p>')
		expect(jsxOf('<p>a b</p>')).toBe('<p>a b</p>')
	})

	it('escapes braces, keeps <pre> and <style> text exactly', () => {
		expect(jsxOf('<p>Use {curly}</p>')).toBe('<p>{"Use {curly}"}</p>')
		expect(jsxOf('<pre>a\n  b</pre>')).toBe('<pre>{"a\\n  b"}</pre>')
		expect(jsxOf('<style>.a { color: red }</style>')).toBe('<style>{".a { color: red }"}</style>')
	})

	it('keeps the gap between inline elements that sit on separate lines', () => {
		expect(jsxOf('<div><a class="btn">A</a> <a class="btn">B</a></div>')).toContain("{' '}")
	})

	it('puts an attribute a tag does not accept in an unchecked spread (imported form blocks)', () => {
		expect(jsxOf('<div data-lp-form="" novalidate="">x</div>')).toBe('<div data-lp-form="" {...({ noValidate: true } as object)}>x</div>')
		expect(jsxOf('<form novalidate="">x</form>')).toBe('<form noValidate>x</form>')
	})

	it('writes form fields with defaults, void tags and a select with its chosen option', () => {
		expect(jsxOf('<input type="text" name="n" value="Ann" required>')).toBe('<input type="text" name="n" defaultValue="Ann" required />')
		expect(jsxOf('<select name="s"><option value="a">A</option><option value="b" selected>B</option></select>')).toContain('defaultValue="b"')
		expect(jsxOf('<textarea name="t">Hi</textarea>')).toBe('<textarea name="t" defaultValue={"Hi"} />')
	})
})

describe('reading the rendered page', () => {
	it('drops empty ids, handlers and scripts, and keeps a data-id only when it is referenced', () => {
		const { nodes } = parseRenderedHtml(
			'<div id="" data-id="keep-me" onclick="x()" class="a"><span data-id="drop-me">t</span><script>alert(1)</script></div>',
			(value) => value === 'keep-me',
		)
		const div = Object.values(nodes).find((n) => isElement(n) && n.tag === 'div') as ElementNode
		expect(div.attrs).toEqual({ 'data-id': 'keep-me', class: 'a' })
		const span = Object.values(nodes).find((n) => isElement(n) && n.tag === 'span') as ElementNode
		expect(span.attrs).toEqual({})
		expect(Object.values(nodes).some((n) => isElement(n) && n.tag === 'script')).toBe(false)
	})
})

describe('React project', () => {
	const card = (n: number, extra = '') => `<article class="lp-card" ${extra}><img src="d${n}.jpg" alt="Dish ${n}"><h3>Dish ${n}</h3><p>Tasty ${n}</p></article>`
	const cards = [1, 2, 3].map((n) => card(n)).join('')
	const page = root(
		`<header class="lp-site-header"><nav><a href="#menu">Menu</a></nav></header>`,
		`<section id="lp-menu" class="lp-section"><h2>Menu</h2><div class="grid">${cards}</div></section>`,
		`<footer><p>Bye</p></footer>`,
	)
	const files = project(page)

	it('has a runnable Vite + React + TypeScript setup using this app\'s versions', () => {
		for (const path of ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 'src/main.tsx', 'src/App.tsx', 'README.md', '.gitignore']) {
			expect(files[path], path).toBeTruthy()
		}
		const pkg = JSON.parse(files['package.json']!)
		expect(pkg.name).toBe('my-page')
		expect(pkg.dependencies.react).toBe('^18.3.1')
		expect(pkg.devDependencies.vite).toBe('^6.0.5')
		expect(pkg.scripts.build).toBe('vite build')
		expect(files['index.html']).toContain('<div id="root"></div>')
		expect(files['index.html']).toContain('<title>My Page</title>')
	})

	it('keeps the page wrapper in App and makes one component per part', () => {
		expect(files['src/App.tsx']).toContain('<div className="w-full min-h-full">')
		expect(files['src/App.tsx']).toMatch(/<SiteHeader \/>\s+<Menu \/>\s+<Footer \/>/)
		expect(Object.keys(files).filter((p) => p.startsWith('src/components/')).sort()).toEqual([
			'src/components/Card.tsx', 'src/components/Footer.tsx', 'src/components/Menu.tsx', 'src/components/SiteHeader.tsx',
		])
	})

	it('turns repeated cards into one component and a typed list', () => {
		expect(files['src/components/Card.tsx']).toContain('export type CardProps = {\n  image: string\n  imageAlt: string\n  title: string\n  text: string\n}')
		expect(files['src/components/Card.tsx']).toContain('<img src={image} alt={imageAlt} />')
		expect(files['src/components/Menu.tsx']).toContain('{ image: "d2.jpg", imageAlt: "Dish 2", title: "Dish 2", text: "Tasty 2" },')
		expect(files['src/components/Menu.tsx']).toContain('{cardItems.map((item, index) => <Card key={index} {...item} />)}')
	})

	it('does not merge items whose inline style differs', () => {
		const styled = root(`<section><h2>Menu</h2><div>${card(1, 'style="color: red"')}${card(2, 'style="color: blue"')}${card(3, 'style="color: red"')}</div></section>`)
		const out = project(styled)
		expect(Object.keys(out).filter((p) => p.startsWith('src/components/'))).toEqual(['src/components/Menu.tsx'])
	})

	it('keeps a data-id only when CSS points at it, so cards still merge', () => {
		const withIds = root(`<section><h2>Menu</h2><div>${[1, 2, 3].map((n) => card(n, `data-id="id-${n}"`)).join('')}</div></section>`)
		expect(Object.keys(project(withIds)).some((p) => p === 'src/components/Card.tsx')).toBe(true)
		const referenced = project(withIds, { responsiveCss: '[data-id="id-2"] { color: red }' })
		expect(Object.keys(referenced).some((p) => p === 'src/components/Card.tsx')).toBe(false)
		expect(referenced['src/components/Menu.tsx']).toContain('data-id="id-2"')
	})

	it('names parts after an own class or heading, not after Tailwind utilities', () => {
		const out = project(root(
			`<section class="flex items-center mx-auto"><h2>Meet the Mentors</h2></section>`,
			`<section class="mx-auto"><nav><a href="#x">x</a></nav></section>`,
			`<section class="story mx-auto"><p>Hello</p></section>`,
		), { content: { css: { story: {} } } as unknown as CanvasNode })
		expect(Object.keys(out).filter((p) => p.startsWith('src/components/')).sort()).toEqual([
			'src/components/MeetTheMentors.tsx', 'src/components/Navbar.tsx', 'src/components/Story.tsx',
		])
	})

	it('numbers parts that would get the same name', () => {
		const out = project(root('<section><p>a</p></section>', '<section><p>b</p></section>'))
		expect(Object.keys(out).filter((p) => p.startsWith('src/components/')).sort()).toEqual(['src/components/Section.tsx', 'src/components/Section2.tsx'])
	})

	it('wraps the page in the boxed container when the page setting is boxed', () => {
		expect(project(page, {}, { boxed: true })['src/App.tsx']).toMatch(/<div className="main-container-lp">\s+<div className="w-full min-h-full">/)
		expect(files['src/App.tsx']).not.toContain('main-container-lp')
		expect(project(page)['src/styles/builder.css']).toContain('.main-container-lp')
	})

	it('has no wrapper when the page has several top-level elements', () => {
		const out = project('<header><nav>a</nav></header><section><h2>Hi</h2></section>')
		expect(out['src/App.tsx']).toMatch(/<>\s+<Navbar \/>\s+<Hi \/>\s+<\/>/)
	})

	it('carries the page title and <html> attributes into index.html', () => {
		const out = buildReactProject('<div><section>x</section></div>', 'A <b> & "B"', { content: { htmlAttributes: { lang: 'my', class: 'dark', onclick: 'x()' } } as unknown as CanvasNode })
		expect(out['index.html']).toContain('<html lang="my" class="dark">')
		expect(out['index.html']).toContain('<title>A &lt;b&gt; &amp; &quot;B&quot;</title>')
		expect(out['index.html']).not.toContain('onclick')
	})
})

describe('React project styles', () => {
	it('writes the builder defaults to src/styles and the page CSS to public/styles, linked at the end of <body>', () => {
		const files = project(root('<section><p>Hi</p></section>'), {
			animationCss: '.a { color: red }', responsiveCss: '@media (max-width: 600px) { .b { color: blue } }', classCss: '.c { color: green }',
			plainCss: '@import url("https://fonts.googleapis.com/css2?family=Inter");\nbody > header { color: red }\n.d { color: black }',
		})
		expect(Object.keys(files).filter((p) => p.includes('styles/')).sort()).toEqual([
			'public/styles/animation.css', 'public/styles/classes.css', 'public/styles/page.css', 'public/styles/responsive.css',
			'src/styles/base.css', 'src/styles/builder.css',
		])
		expect(files['src/main.tsx']).toContain("import './styles/base.css'\nimport './styles/builder.css'")
		expect(files['src/main.tsx']).not.toContain('animation.css')
		const html = files['index.html']!
		const order = ['animation.css', 'responsive.css', 'classes.css', 'page.css'].map((name) => html.indexOf(`/styles/${name}`))
		expect(order.every((i) => i > html.indexOf('/src/main.tsx'))).toBe(true)
		expect([...order].sort((a, b) => a - b)).toEqual(order)
		// "@import" stays first in the page's own file, and "body >" rules go through #root
		expect(files['public/styles/page.css']!.startsWith('@import url(')).toBe(true)
		expect(files['public/styles/page.css']).toContain('body > #root > header')
	})

	it('only writes stylesheets the page has', () => {
		const files = project(root('<section><p>Hi</p></section>'))
		expect(Object.keys(files).some((p) => p.startsWith('public/styles/'))).toBe(false)
		expect(files['src/styles/builder.css']).toContain('table-layout: fixed')
		expect(files['src/styles/builder.css']).toContain('font-family: Arial')
	})

	it('has the builder\'s flattened list rules', () => {
		const css = project(root('<section><p>Hi</p></section>'))['src/styles/builder.css']!
		expect(css).toContain('ul:not([data-type="taskList"]):not([data-lp-tag]):not([data-lp-text] *) > li {\n  list-style-type: disc !important;')
		expect(css).toContain('ol:not([data-lp-tag]):not([data-lp-text] *) > li > ol:not([data-lp-tag]) > li {\n  list-style-type: upper-alpha !important;')
		expect(css).not.toContain('&')
	})
})

describe('React project scripts', () => {
	const body = root('<section><p>Hi</p></section>')

	it('has no runner when the page has no code', () => {
		const files = project(body)
		expect(files['src/runPageScripts.ts']).toBeUndefined()
		expect(files['src/App.tsx']).not.toContain('runPageScripts')
	})

	it('moves the page JS to public/scripts and runs it after mount, id fallback first', () => {
		const files = project(body, { plainJS: "document.querySelector('.a')" })
		expect(files['public/scripts/page-1.js']).toContain('Document.prototype.getElementById')
		expect(files['public/scripts/page-1.js']).toContain("document.querySelector('.a')")
		expect(files['src/runPageScripts.ts']).toContain("{ src: 'scripts/page-1.js', module: false },")
		expect(files['src/App.tsx']).toContain('useEffect(() => runPageScripts(), [])')
		expect(files['index.html']).not.toContain('document.querySelector')
	})

	it('runs the page libraries, class interactions and page JS in the export order', () => {
		const files = project(body, {
			plainJS: '$(".x").hide()', classJs: 'window.__cls = 1',
			content: { pageScripts: [
				{ src: 'https://cdn.example.com/lib.js' },
				{ type: 'module', code: 'export const a = 1' },
				{ type: 'application/ld+json', code: '{"@type":"Event"}' },
				{ src: 'javascript:alert(1)' },
			] } as unknown as CanvasNode,
		})
		const html = files['index.html']!
		expect(html).toContain('code.jquery.com/jquery-3.7.1.min.js')
		expect(html).toContain('<script src="https://cdn.example.com/lib.js"></script>')
		expect(html).toContain('"@type":"Event"')
		expect(html).not.toContain('javascript:alert')
		expect(html.indexOf('jquery')).toBeLessThan(html.indexOf('cdn.example.com'))
		expect(files['public/scripts/module-1.js']).toBe('export const a = 1\n')
		expect(files['public/scripts/page-2.js']).toBe('window.__cls = 1\n')
		expect(files['public/scripts/page-3.js']).toContain('$(".x").hide()')
		expect(files['src/runPageScripts.ts']).toContain("{ src: 'scripts/module-1.js', module: true },")
	})

	it('does not add jQuery when the page loads its own', () => {
		const files = project(body, { plainJS: '$(".x")', content: { pageScripts: [{ src: 'https://cdn.example.com/jquery.min.js' }] } as unknown as CanvasNode })
		expect(files['index.html']).not.toContain('code.jquery.com')
	})
})

describe('zip', () => {
	it('keeps every file, including non-latin text, through a zip round trip', () => {
		const files = project(root('<section><h2>မင်္ဂလာပါ</h2></section>'))
		const zip = zipSync(Object.fromEntries(Object.entries(files).map(([path, text]) => [`my-page-react/${path}`, strToU8(text)])))
		const back = unzipSync(zip)
		expect(Object.keys(back).length).toBe(Object.keys(files).length)
		expect(strFromU8(back['my-page-react/src/components/Section.tsx'] ?? back['my-page-react/src/components/PartMyanmar.tsx'] ?? new Uint8Array())).toContain('မင်္ဂလာပါ')
	})
})
