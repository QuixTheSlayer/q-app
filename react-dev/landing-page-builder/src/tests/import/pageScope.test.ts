import { describe, it, expect } from 'vitest'
import { isImportedPage, scopePageCss } from '@/utils/pageScope'
import { htmlToJsonTree } from '@/utils/htmlToCanvasNodes'

const P = ':where([data-lp-page])'

describe('scopePageCss', () => {
	it('limits tag-only selectors to the imported page', () => {
		expect(scopePageCss('section { padding: 1em 0; }')).toBe(`${P} section { padding: 1em 0; }`)
		expect(scopePageCss('a:hover, button > span { color: red; }')).toBe(`${P} a:hover, ${P} button > span { color: red; }`)
	})

	it('keeps selectors that already only reach the page', () => {
		const css = '.lp-hero section { x: 1; } #lp-nav a { x: 1; } [data-lp-text="h2"] { x: 1; }'
		expect(scopePageCss(css)).toBe(css)
	})

	it('scopes selectors whose only private part is inside :not()', () => {
		expect(scopePageCss('section:not(.lp-hero) { x: 1; }')).toBe(`${P} section:not(.lp-hero) { x: 1; }`)
	})

	it('turns body into the page root and leaves html/:root on the document', () => {
		expect(scopePageCss('body { margin: 0; }')).toBe(`${P} { margin: 0; }`)
		expect(scopePageCss('body > section { x: 1; }')).toBe(`${P} > section { x: 1; }`)
		expect(scopePageCss(':root { --lp-ink: #111; } html { scroll-behavior: smooth; }')).toBe(':root { --lp-ink: #111; } html { scroll-behavior: smooth; }')
		expect(scopePageCss(':root[data-theme="dark"] section { x: 1; }')).toBe(`:root[data-theme="dark"] ${P} section { x: 1; }`)
	})

	it('lets universal and pseudo-element rules reach the root too', () => {
		expect(scopePageCss('*, *::before { box-sizing: border-box; }'))
			.toBe(`${P} *, ${P}, ${P} *::before, ${P}::before { box-sizing: border-box; }`)
		expect(scopePageCss('::selection { color: red; }')).toBe(`${P} ::selection, ${P}::selection { color: red; }`)
	})

	it('scopes rules inside @media but not keyframe steps', () => {
		expect(scopePageCss('@media (max-width: 700px) { section { x: 1; } }')).toBe(`@media (max-width: 700px) { ${P} section { x: 1; } }`)
		const keyframes = '@keyframes pulse { from { opacity: 0; } 50% { opacity: 1; } }'
		expect(scopePageCss(keyframes)).toBe(keyframes)
	})

	it('is safe to run twice', () => {
		const once = scopePageCss('section, *, body p { x: 1; }')
		expect(scopePageCss(once)).toBe(once)
	})
})

describe('imported page CSS', () => {
	it('keeps a page section rule off the builder panels', () => {
		const { root, css } = htmlToJsonTree('<style>section { padding: 2em 0; }</style><section><p>Hi</p></section>')
		expect(isImportedPage(root)).toBe(true)
		expect(css).toContain(`${P} section`)
		expect(css).not.toMatch(/(^|[},]\s*)section\s*\{/)
	})
})

describe('imported svg', () => {
	const page = `<style>:root { --ink: #111; } @media (prefers-color-scheme: dark) { :root { --ink: #eee; } }
.dial-hand { transform-origin: 200px 200px; transition: transform 1s; } .timer { padding: 32px; }</style>
<section><div class="timer"><svg viewBox="0 0 400 400"><circle r="10" fill="var(--ink)"/><g class="dial-hand" id="hand"><rect width="8" height="30"/></g></svg></div></section>`
	const svgOf = (root: unknown) => {
		const src = JSON.stringify(root).match(/data:image\/svg\+xml[^"]*/)?.[0] ?? ''
		return decodeURIComponent(src.replace(/^data:image\/svg\+xml[^,]*,/, ''))
	}

	it('prefixes the classes of its shapes, like the page CSS', () => {
		const { root, css } = htmlToJsonTree(page)
		expect(svgOf(root)).toContain('class="lp-dial-hand"')
		expect(css).toContain('.lp-dial-hand')
	})

	it('keeps viewBox px in rules for its shapes, but converts the rest', () => {
		const { css } = htmlToJsonTree(page)
		expect(css).toMatch(/\.lp-dial-hand \{\s*transform-origin: 200px 200px/)
		expect(css).not.toMatch(/\.lp-timer \{[^}]*32px/)
	})

	it('keeps theme variables live, with their value as a fallback', () => {
		const { root } = htmlToJsonTree(page)
		expect(svgOf(root)).toContain('fill="var(--lp-ink, #111)"')
	})
})
