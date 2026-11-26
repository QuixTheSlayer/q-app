import { describe, it, expect } from 'vitest'
import { safeFrameUrl, safeHref, safeMediaUrl } from '@/utils/security/safeUrl'
import { sanitizeCss } from '@/utils/security/sanitizeCss'
import { sanitizeCanvasTree } from '@/utils/security/sanitizeCanvasTree'
import { buildSandboxCsp } from '@/utils/security/sandboxGuard'
import { buildSandboxDocument, SANDBOX_PERMISSIONS } from '@/utils/security/sandboxDocument'
import type { CanvasNode } from '@/types/node.type'

const TAB = String.fromCharCode(9)
const ZWSP = String.fromCharCode(0x200b)

describe('safeHref', () => {
	it('keeps normal links, anchors, mail/tel and placeholders', () => {
		for (const url of ['https://a.com/x', 'http://a.com', '/tickets', '#about', '?q=1', 'mailto:a@b.co', 'tel:+123', '{{register}}', '']) {
			expect(safeHref(url)).toBe(url)
		}
	})

	it('blocks script schemes however they are disguised', () => {
		for (const url of ['javascript:alert(1)', 'JavaScript:alert(1)', ` javascript:alert(1)`, `java${TAB}script:alert(1)`, `java${ZWSP}script:alert(1)`, 'vbscript:x', 'data:text/html,<script>alert(1)</script>', 'file:///etc/passwd']) {
			expect(safeHref(url)).toBe('')
		}
	})
})

describe('safeMediaUrl / safeFrameUrl', () => {
	it('allows real media data URLs but not HTML', () => {
		expect(safeMediaUrl('data:image/png;base64,AAAA')).not.toBe('')
		expect(safeMediaUrl('data:image/svg+xml;charset=utf-8,%3Csvg%3E')).not.toBe('')
		expect(safeMediaUrl('/img/a.png')).toBe('/img/a.png')
		expect(safeMediaUrl('data:text/html,<script>alert(1)</script>')).toBe('')
		expect(safeMediaUrl('javascript:alert(1)')).toBe('')
	})

	it('only lets absolute http(s) into iframes', () => {
		expect(safeFrameUrl('https://www.youtube.com/embed/x')).toBe('https://www.youtube.com/embed/x')
		expect(safeFrameUrl('javascript:alert(1)')).toBe('')
		expect(safeFrameUrl('data:text/html,<script>alert(1)</script>')).toBe('')
		expect(safeFrameUrl('/admin')).toBe('')
	})
})

describe('sanitizeCss', () => {
	it('keeps ordinary CSS intact', () => {
		const css = '.a { color: red; background: url(/img/a.png); } .b { background-image: url("https://cdn.x.com/b.png"); }'
		expect(sanitizeCss(css)).toBe(css)
	})

	it('keeps Google Fonts imports and drops every other import', () => {
		const out = sanitizeCss('@import url("https://fonts.googleapis.com/css2?family=Inter");\n@import url("https://evil.com/steal.css");\n@import "http://evil.com/x.css";')
		expect(out).toContain('fonts.googleapis.com')
		expect(out).not.toContain('evil.com')
	})

	it('drops imports hidden behind CSS escapes', () => {
		expect(sanitizeCss(String.raw`@\69mport url(https://evil.com/x.css);`)).not.toContain('evil.com')
		expect(sanitizeCss(String.raw`@\69 mport url(https://evil.com/x.css);`)).not.toContain('evil.com')
	})

	it('blanks url() pointing anywhere unsafe, including escaped url(', () => {
		expect(sanitizeCss('.a { background: url(http://evil.com/?leak) }')).not.toContain('evil.com')
		expect(sanitizeCss('.a { background: url("data:text/html,x") }')).not.toContain('text/html')
		expect(sanitizeCss(String.raw`.a { background: u\72l(http://evil.com/x) }`)).not.toContain('evil.com')
		expect(sanitizeCss('.a { background-image: image-set(url(http://evil.com/x) 1x) }')).not.toContain('evil.com')
		expect(sanitizeCss('.a { background-image: image-set("http://evil.com/x" 1x) }')).not.toContain('evil.com')
	})

	it('drops script-capable declarations', () => {
		const out = sanitizeCss(String.raw`.a { color: red; width: expression(alert(1)); -moz-binding: url(x.xml#y); behavior: url(x.htc) } .b { background: url(javascript:alert(1)) } .c { width: ex\70ression(alert(1)) }`)
		expect(out).toContain('color: red')
		expect(out).not.toMatch(/expression|moz-binding|behavior|javascript|ex\\70/i)
	})
})

describe('sanitizeCanvasTree', () => {
	const tree = {
		id: 'r', type: 'container', contentType: 'root', layout: 'column', style: {},
		plainCss: '@import url("https://evil.com/x.css"); .a { color: red }',
		plainJS: 'console.log(1)',
		children: [{
			id: 's', type: 'container', contentType: 'section', layout: 'column', style: {},
			attributes: { href: 'javascript:alert(1)', onclick: 'alert(1)', className: 'hero' },
			children: [
				{ id: 'b', type: 'content', contentType: 'button', style: {}, attributes: { href: `java${TAB}script:alert(1)` }, children: 'Go' },
				{ id: 'i', type: 'content', contentType: 'image', style: {}, src: 'javascript:alert(1)', children: 'data:text/html,<script>x</script>', attributes: {} },
				{ id: 'y', type: 'content', contentType: 'youtube', style: {}, url: 'javascript:alert(1)' },
				{ id: 'sl', type: 'content', contentType: 'imageSlider', style: {}, images: [{ url: '/a.png' }, { url: 'javascript:alert(1)' }] },
				{ id: 'n', type: 'content', contentType: 'navBarTemplate', style: {}, ctaHref: 'javascript:alert(1)', links: [{ label: 'x', href: 'javascript:alert(1)' }, { label: 'y', href: '#ok' }], logoImageUrl: 'javascript:x' },
				{ id: 't', type: 'content', contentType: 'text', style: {}, children: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hi', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }] }] }) },
			],
		}],
	} as unknown as CanvasNode
	const clean = sanitizeCanvasTree(tree) as unknown as { plainCss: string; plainJS: string; children: { attributes: Record<string, string>; children: Record<string, unknown>[] }[] }
	const [section] = clean.children
	type Sanitized = {
		attributes: Record<string, string>; children: string; src: string; url: string; ctaHref: string; logoImageUrl: string
		images: { url: string }[]; links: { href: string }[]
	}
	const [button, image, youtube, slider, nav, text] = section.children as unknown as Sanitized[]

	it('blanks unsafe URLs in every kind of field', () => {
		expect(section.attributes.href).toBe('')
		expect(button.attributes.href).toBe('')
		expect(image.src).toBe('')
		expect(image.children).toBe('')
		expect(youtube.url).toBe('')
		expect(slider.images.map((i: { url: string }) => i.url)).toEqual(['/a.png', ''])
		expect(nav.ctaHref).toBe('')
		expect(nav.links.map((l: { href: string }) => l.href)).toEqual(['', '#ok'])
		expect(nav.logoImageUrl).toBe('')
		expect(JSON.parse(text.children).content[0].content[0].marks[0].attrs.href).toBe('')
	})

	it('drops event-handler attributes but keeps the rest', () => {
		expect(section.attributes).not.toHaveProperty('onclick')
		expect(section.attributes.className).toBe('hero')
		expect(button.children).toBe('Go')
	})

	it('sanitizes plainCss and leaves plainJS for the sandbox', () => {
		expect(clean.plainCss).not.toContain('evil.com')
		expect(clean.plainCss).toContain('color: red')
		expect(clean.plainJS).toBe('console.log(1)')
	})

	it('does not mutate the input', () => {
		expect((tree as unknown as { children: { attributes: Record<string, string> }[] }).children[0].attributes.onclick).toBe('alert(1)')
	})
})

describe('buildSandboxDocument', () => {
	it('never grants the frame its parent origin', () => {
		expect(SANDBOX_PERMISSIONS).toContain('allow-scripts')
		expect(SANDBOX_PERMISSIONS).not.toContain('allow-same-origin')
	})

	it('does not let page code open alert/confirm/prompt dialogs', () => {
		expect(SANDBOX_PERMISSIONS).not.toContain('allow-modals')
	})

	it('lets the site hosting the builder (even over http) supply styles, fonts and images, and nothing odd', () => {
		expect(buildSandboxCsp('http://local.newjudgify.me')).toContain("style-src 'unsafe-inline' https: http://local.newjudgify.me")
		expect(buildSandboxCsp('http://local.newjudgify.me')).toContain('img-src https: data: blob: http://local.newjudgify.me')
		expect(buildSandboxCsp('')).not.toMatch(/http:/)
		expect(buildSandboxCsp("javascript:alert(1)")).not.toContain('javascript')
	})

	it('puts a CSP and the guard script ahead of the page code', () => {
		const doc = buildSandboxDocument(document.createElement('main'), { title: 'T', js: 'pageCode()' })
		expect(doc).toContain("connect-src 'none'")
		expect(doc).toContain("form-action 'none'")
		expect(doc.indexOf('lp-sandbox')).toBeGreaterThan(-1)
		expect(doc.indexOf('lp-sandbox')).toBeLessThan(doc.indexOf('pageCode()'))
		expect(doc.indexOf('Content-Security-Policy')).toBeLessThan(doc.indexOf('<script>'))
	})

	it('snapshots the page, keeps anchors in-frame and sends outbound links to the real tab', () => {
		const el = document.createElement('main')
		el.innerHTML = '<a href="#about">About</a><a href="/tickets">Tickets</a><script>bad()</script>'
		document.body.appendChild(el)
		const doc = buildSandboxDocument(el, { title: 'T', js: 'window.x = "</script><b>"' })
		el.remove()
		expect(doc).toContain('href="#about"')
		expect(doc).toMatch(/href="http[^"]*\/tickets" target="_top"/)
		expect(doc).not.toContain('bad()')
		// a "</script>" inside page JS can't close the tag early
		expect(doc).toContain(String.raw`window.x = "<\/script><b>"`)
		expect(doc).not.toContain('window.x = "</script>')
	})

	it('adds jQuery only when the page JS uses it', () => {
		const el = document.createElement('main')
		expect(buildSandboxDocument(el, { title: 'T', js: "$('.a').hide()" })).toContain('jquery-3.7.1')
		expect(buildSandboxDocument(el, { title: 'T', js: 'console.log(1)' })).not.toContain('jquery')
	})
})

describe('buildSandboxDocument media', () => {
	it('keeps a video muted when React only set the muted property', () => {
		const el = document.createElement('main')
		const video = document.createElement('video')
		video.src = 'https://cdn.example.com/v.mp4'
		video.autoplay = true
		video.muted = true // what React's `muted` prop does - no attribute
		el.appendChild(video)
		expect(video.hasAttribute('muted')).toBe(false)
		expect(buildSandboxDocument(el, { title: 'T', js: 'x()' })).toMatch(/<video[^>]*\smuted/)
	})
})

describe('buildSandboxDocument inline svg', () => {
	const svgImage = (markup: string, marked = true) => {
		const el = document.createElement('main')
		const img = document.createElement('img')
		img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
		img.className = 'dial'
		if (marked) img.setAttribute('data-lp-svg', 'inline')
		el.appendChild(img)
		return el
	}

	it('turns an imported svg image back into the <svg> so page scripts find its ids', () => {
		const doc = buildSandboxDocument(svgImage('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><g id="ticks"></g></svg>'), { title: 'T', js: 'x()' })
		expect(doc).toMatch(/<svg[^>]*class="dial"/)
		expect(doc).toContain('id="ticks"')
		expect(doc).not.toContain('data:image/svg+xml')
	})

	it('never brings scripts or event handlers along', () => {
		const doc = buildSandboxDocument(svgImage('<svg xmlns="http://www.w3.org/2000/svg" onload="steal()"><script>steal()</script><rect onclick="steal()"/></svg>'), { title: 'T', js: 'x()' })
		expect(doc).not.toContain('steal()')
	})

	it('leaves other svg images alone', () => {
		const doc = buildSandboxDocument(svgImage('<svg xmlns="http://www.w3.org/2000/svg"><g id="ticks"/></svg>', false), { title: 'T', js: 'x()' })
		expect(doc).toContain('data:image/svg+xml')
	})
})

describe('buildSandboxDocument scrolling and links', () => {
	it("lets the frame's page scroll its own window and drops the parent's 100vh scroll box", () => {
		const el = document.createElement('main')
		el.style.height = '100vh'
		el.style.overflowY = 'scroll'
		const doc = buildSandboxDocument(el, { title: 'T', js: 'x()' })
		expect(doc).toContain('overflow: visible !important')
		expect(doc).not.toMatch(/<main[^>]*style="[^"]*(?<![-\w])height/)
	})

	it('turns in-page #links into scrolls instead of loading the parent URL', () => {
		const doc = buildSandboxDocument(document.createElement('main'), { title: 'T', js: 'x()' })
		expect(doc).toContain('a[href^="#"]')
		// The helper runs before the page's own script.
		expect(doc.indexOf('a[href^="#"]')).toBeLessThan(doc.indexOf('x()'))
	})
})

describe('buildSandboxDocument base font', () => {
	it("keeps the page root's base font size, whatever the copied host CSS sets on html", () => {
		const host = document.createElement('div')
		host.style.fontSize = '16px'
		const el = document.createElement('div')
		host.appendChild(el)
		document.body.appendChild(host)
		const doc = buildSandboxDocument(el, { title: 'T', js: 'x()' })
		host.remove()
		expect(doc).toMatch(/<div[^>]*style="[^"]*font-size: 16px/)
	})
})

describe('buildSandboxDocument stylesheets', () => {
	it("copies the builder's CSS and the page CSS, not the host site's own stylesheets", () => {
		const added: Element[] = []
		const add = (el: Element) => { document.head.appendChild(el); added.push(el) }
		const link = (href: string) => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; return l }
		const style = (attr: string | null, text: string) => { const s = document.createElement('style'); if (attr) s.setAttribute(attr, ''); s.textContent = text; return s }
		add(link('http://local.site/css/style.bundle.css'))
		add(link('http://local.site/js/landing-page-builder/style.css'))
		add(link('https://fonts.googleapis.com/css?family=Inter'))
		add(style(null, '#app { background: gray }'))
		add(style('css-class', '.lp-hero { color: red }'))
		const doc = buildSandboxDocument(document.createElement('main'), { title: 'T', js: 'x()' })
		added.forEach((el) => el.remove())
		expect(doc).not.toContain('style.bundle.css')
		expect(doc).not.toContain('#app { background')
		expect(doc).toContain('/js/landing-page-builder/style.css')
		expect(doc).toContain('fonts.googleapis.com')
		expect(doc).toContain('.lp-hero { color: red }')
	})
})

describe('buildSandboxDocument form fields', () => {
	it('writes the live value, checked and selected state onto the copy', () => {
		const el = document.createElement('main')
		el.innerHTML = '<input id="a"><input type="checkbox" id="b"><select id="c"><option>x</option><option>y</option></select><textarea id="d"></textarea>'
		;(el.querySelector('#a') as HTMLInputElement).value = 'hello'
		;(el.querySelector('#b') as HTMLInputElement).checked = true
		;(el.querySelector('#c') as HTMLSelectElement).selectedIndex = 1
		;(el.querySelector('#d') as HTMLTextAreaElement).value = 'notes'
		const doc = buildSandboxDocument(el, { title: 'T', js: 'x()' })
		expect(doc).toMatch(/<input id="a" value="hello">/)
		expect(doc).toMatch(/<input type="checkbox" id="b" checked="">/)
		expect(doc).toMatch(/<option selected="">y<\/option>/)
		expect(doc).toContain('<textarea id="d">notes</textarea>')
	})
})
