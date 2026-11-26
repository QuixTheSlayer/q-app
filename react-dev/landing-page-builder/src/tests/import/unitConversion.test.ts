import { describe, it, expect } from 'vitest'
import { htmlToJsonTree } from '@/utils/htmlToCanvasNodes'
import { lengthsToEm } from '@/utils/unitConversion'
import type { CanvasNode, LayoutNode } from '@/types/node.type'

type AnyNode = CanvasNode & { children?: unknown }
const kids = (n: CanvasNode) => (n as LayoutNode).children as AnyNode[]
const page = (body: string, css = '') => htmlToJsonTree(`<style>${css}</style><div id="page"><section>${body}</section></div>`)

describe('lengthsToEm', () => {
	it('converts every px/rem length and leaves the rest', () => {
		expect(lengthsToEm('10px 20px -8px .5px', 16, 16)).toBe('0.625em 1.25em -0.5em 0.0313em')
		expect(lengthsToEm('0px solid', 16, 16)).toBe('0 solid')
		expect(lengthsToEm('2rem', 16, 10)).toBe('1.25em')
		expect(lengthsToEm('1.5em 50% 10vw', 16, 16)).toBe('1.5em 50% 8.15em')
	})

	it('leaves url() and quoted strings alone', () => {
		expect(lengthsToEm('url(img-10px.png) 16px', 16, 16)).toBe('url(img-10px.png) 1em')
		expect(lengthsToEm('"12px" 32px', 16, 16)).toBe('"12px" 2em')
	})
})

describe('px -> em in node styles', () => {
	it('divides font-size by the parent font and everything else by the own font', () => {
		const { root } = page('<div class="outer" style="font-size: 32px"><p style="font-size: 24px; padding: 16px">Hi</p></div>')
		const outer = kids(root.children[0])[0]
		expect(outer.style).toMatchObject({ fontSize: '2em' })
		const p = kids(outer)[0]
		// 24px inside a 32px parent, and 16px of padding at a 24px font size
		expect(p.style).toMatchObject({ fontSize: '0.75em', padding: '0.6667em' })
	})

	it('uses font sizes that come from the page CSS', () => {
		const { root } = page('<div class="big"><div class="pad" style="margin: 8px">x</div></div>', '.big { font-size: 32px; }')
		const pad = kids(kids(root.children[0])[0])[0]
		expect(pad.style).toMatchObject({ margin: '0.25em' })
	})

	it('converts a span block relative to its paragraph', () => {
		const { root } = page('<p style="font-size: 20px">Hi <span style="font-size: 10px">small</span></p>')
		const [, span] = kids(kids(root.children[0])[0])
		expect(span.style).toMatchObject({ fontSize: '0.5em' })
	})
})

describe('px -> em in the page CSS', () => {
	it('uses the font size of the elements each rule matches', () => {
		const { css } = page('<div class="big"><div class="pad">x</div></div>', '.big { font-size: 32px; } .big .pad { padding: 16px; }')
		expect(css).toContain('.lp-big { font-size: 2em; }')
		expect(css).toContain('.lp-big .lp-pad { padding: 0.5em; }')
	})

	it('converts rem using the page\'s own root size and drops the root font-size', () => {
		const { css } = page('<div class="x">x</div>', 'html { font-size: 62.5%; } .x { margin: 2rem; }')
		// rem meant 10px here; the element's font is 10px too
		expect(css).toContain('.lp-x { margin: 2em; }')
		expect(css).not.toContain('62.5%')
	})

	it('keeps @media conditions in px and converts rules inside them and in @keyframes', () => {
		const { css } = page('<div class="card">x</div>', '@media (max-width: 600px) { .card { padding: 8px; } } @keyframes slide { from { transform: translateX(16px); } }')
		expect(css).toContain('@media (max-width: 600px)')
		expect(css).toContain('.lp-card { padding: 0.5em; }')
		expect(css).toContain('translateX(1em)')
	})

	it('falls back to the page base size for rules that match nothing yet', () => {
		const { css } = page('<div class="bar">x</div>', 'body { font-size: 20px; } .bar.is-open { padding: 10px; }')
		expect(css).toContain('.lp-bar.lp-is-open { padding: 0.5em; }')
	})
})

describe('viewport units and size attributes', () => {
	it('makes 100vw the canvas width and 100vh a 900px screen', () => {
		expect(lengthsToEm('100vw', 16, 16)).toBe('81.5em')
		expect(lengthsToEm('100vh', 16, 16)).toBe('56.25em')
		expect(lengthsToEm('calc(100vh - 80px)', 16, 16)).toBe('calc(56.25em - 5em)')
		expect(lengthsToEm('50dvh 10vmin 10vmax', 16, 16)).toBe('28.125em 5.625em 8.15em')
		// identifiers that merely contain the unit letters stay untouched
		expect(lengthsToEm('var(--hero-vh)', 16, 16)).toBe('var(--hero-vh)')
	})

	it('converts vh/vw in node styles and page CSS, and uses vw font sizes in the cascade', () => {
		const { root, css } = page('<div class="hero" style="min-height: 100vh">x</div>', '.hero { font-size: 2.5vw; padding: 2vw; }')
		const hero = kids(root.children[0])[0]
		// 2.5vw = 32.6px of font, so 100vh (900px) = 27.6074em of it
		expect(hero.style).toMatchObject({ minHeight: '27.6074em' })
		expect(css).toContain('.lp-hero { font-size: 2.0375em; padding: 0.8em; }')
	})

	it('reads width/height attributes on tables', () => {
		const { root } = page('<table width="600" height="200"><tr><td>c</td></tr></table>')
		expect(kids(root.children[0])[0].style).toMatchObject({ width: '37.5em', height: '12.5em' })
	})
})

describe('math font sizes', () => {
	it('evaluates clamp()/min()/calc() font sizes, so other lengths on that element divide by the real size', () => {
		const { css } = htmlToJsonTree('<style>.h { font-size: clamp(34px, 5vw, 62px); margin-bottom: 18px } .c { font-size: calc(10px + 1rem); padding: 13px } .m { font-size: min(40px, 2rem); gap: 16px }</style><section><h2 class="h">A</h2><div class="c">B</div><div class="m">C</div></section>')
		expect(css).toContain('margin-bottom: 0.2903em')
		expect(css).toContain('padding: 0.5em')
		expect(css).toContain('gap: 0.5em')
	})
})

describe('font shorthand', () => {
	it("divides the shorthand's size by the parent font size, and a line-height length by its own", () => {
		const { css } = htmlToJsonTree('<style>.price { font: 800 50px "Barlow Condensed" } .price span { font: 500 12px/18px Inter } .t { font: 800 clamp(44px, 6vw, 76px) "Barlow Condensed"; margin-top: 10px }</style><section><div class="price">$49 <span>/ person</span></div><h2 class="t">Hi</h2></section>')
		expect(css).toContain('.lp-price { font: 800 3.125em "Barlow Condensed" }')
		expect(css).toContain('font: 500 0.24em/1.5em Inter')
		// margin on .t divides by its real (clamped) font size, 76px.
		expect(css).toContain('margin-top: 0.1316em')
	})
})
