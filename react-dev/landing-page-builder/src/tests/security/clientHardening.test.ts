import { describe, expect, it } from 'vitest'
import { isSafeNodeTag, safeTag } from '@/utils/nodeAttributes'
import { parseIsAllow, parseJsAllowed, readAllowFlag } from '@/utils/security/codePolicy'
import { sanitizeCanvasTree } from '@/utils/security/sanitizeCanvasTree'

// Sample trees only: they are sanitised and compared as data, nothing is rendered or run.
const block = (tag: string) => ({ id: 'b', type: 'container', contentType: 'block', tag, style: {}, attributes: {}, children: [] })
const tree = (...children: unknown[]) => ({ id: 'root', type: 'container', contentType: 'root', layout: 'column', style: {}, children })
const tagOf = (root: unknown) => (sanitizeCanvasTree(root as never) as unknown as { children: { tag?: string }[] }).children[0].tag

describe('node tag allowlist', () => {
	it('keeps container, link and form-field tags', () => {
		for (const tag of ['div', 'section', 'ul', 'h1', 'button', 'a', 'textarea', 'select']) expect(tagOf(tree(block(tag))), tag).toBe(tag)
	})

	it('drops tags that would load or redirect to other content', () => {
		for (const tag of ['meta', 'iframe', 'object', 'embed', 'base', 'link', 'script', 'style', 'form', 'frame', 'svg', 'IFRAME', 'not a tag']) {
			expect(tagOf(tree(block(tag))), tag).toBeUndefined()
		}
	})

	it('only treats a key named tag as a tag on a node', () => {
		const root = tree({ ...block('div'), attributes: { tag: 'iframe' } }) as { children: { attributes: { tag: string } }[] }
		expect((sanitizeCanvasTree(root as never) as unknown as typeof root).children[0].attributes.tag).toBe('iframe')
	})

	it('safeTag falls back for anything not allowed', () => {
		expect(safeTag('iframe', 'div')).toBe('div')
		expect(safeTag(undefined, 'section')).toBe('section')
		expect(safeTag('nav', 'div')).toBe('nav')
		expect(isSafeNodeTag('meta')).toBe(false)
		expect(isSafeNodeTag(5)).toBe(false)
	})
})

describe('page JS flag', () => {
	it('reads the flag under either name the backend uses', () => {
		expect(readAllowFlag({ is_allow: true })).toBe(true)
		expect(readAllowFlag({ isAllow: false, is_allow: true })).toBe(false)
		expect(readAllowFlag({})).toBeUndefined()
		expect(readAllowFlag(undefined)).toBeUndefined()
	})

	it('allows page JS only for an explicit yes, and a missing flag blocks it', () => {
		for (const yes of [true, 1, '1', 'true']) expect(parseJsAllowed(yes), String(yes)).toBe(true)
		for (const no of [undefined, null, false, 0, '0', 'false', '', 'yes', {}]) expect(parseJsAllowed(no), String(no)).toBe(false)
	})

	it('leaves the code and CSS flag as it was, so a missing flag does not strip fonts', () => {
		expect(parseIsAllow(undefined)).toBe(true)
		expect(parseIsAllow(false)).toBe(false)
	})
})

describe('a saved component from another user', () => {
	it('loses a stored tag and an unsafe src when run through the sanitiser, as the insert path now does', () => {
		const stored = tree({ ...block('iframe'), attributes: { src: 'javascript:window.__x=1' } })
		const clean = sanitizeCanvasTree(stored as never) as unknown as { children: { tag?: string; attributes: { src: string } }[] }
		expect(clean.children[0].tag).toBeUndefined()
		expect(clean.children[0].attributes.src).not.toMatch(/^javascript:/i)
	})
})
