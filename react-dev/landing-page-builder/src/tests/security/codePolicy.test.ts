import { describe, expect, it } from 'vitest'
import { applyCodePolicy, codeForReview, hasExternalCss, hasRestrictedCode, htmlHasCode, importHasCode, importHasRestrictedCode, parseIsAllow, stripExternalCss, stripImportedCode } from '@/utils/security/codePolicy'
import { htmlToJsonTree } from '@/utils/htmlToCanvasNodes'
import type { CanvasNode } from '@/types/node.type'

const page = (extra: Record<string, unknown>) => ({ id: 'root', type: 'layout', children: [], ...extra }) as unknown as CanvasNode

describe('parseIsAllow', () => {
	it('blocks only an explicit false', () => {
		for (const v of [false, 0, '0', 'false']) expect(parseIsAllow(v)).toBe(false)
		for (const v of [true, 1, '1', undefined, null]) expect(parseIsAllow(v)).toBe(true)
	})
})

describe('external CSS', () => {
	const css = '@import url("https://fonts.googleapis.com/css2?family=A;B"); @import "x.css"; .a { color: red }'

	it('is found and stripped, leaving the rules', () => {
		expect(hasExternalCss(css)).toBe(true)
		expect(hasExternalCss('.a { color: red }')).toBe(false)
		expect(stripExternalCss(css)).toBe('.a { color: red }')
	})
})

describe('applyCodePolicy', () => {
	const content = page({ plainJS: 'run()', plainCss: '@import "x.css"; .a { color: red }', pageScripts: [{ src: 'https://cdn.example.com/a.js' }], htmlAttributes: { class: 'dark' } })

	it('always leaves out JS, scripts and @import, keeps the rest, and does not touch the stored page', () => {
		const shown = applyCodePolicy(content) as unknown as Record<string, unknown>
		expect(shown.plainJS).toBeUndefined()
		expect(shown.pageScripts).toBeUndefined()
		expect(shown.plainCss).toBe('.a { color: red }')
		expect(shown.htmlAttributes).toEqual({ class: 'dark' })
		expect((content as unknown as Record<string, unknown>).plainJS).toBe('run()')
	})

	it('has no flag that switches it off: a page cannot approve its own code', () => {
		const claimsSafe = page({ plainJS: 'run()', is_safe_preview: true, is_safe_render: true, is_safe: true, jsAllowed: true })
		expect((applyCodePolicy(claimsSafe) as unknown as Record<string, unknown>).plainJS).toBeUndefined()
	})

	it('returns the same object when there is nothing to remove', () => {
		const plain = page({ plainCss: '.a { color: red }' })
		expect(hasRestrictedCode(plain as never)).toBe(false)
		expect(applyCodePolicy(plain)).toBe(plain)
	})
})

describe('importHasRestrictedCode', () => {
	it('flags pasted JS, script files and external stylesheets, not plain HTML/CSS', () => {
		expect(importHasRestrictedCode(htmlToJsonTree('<div><p>Hi</p><script>document.addEventListener("DOMContentLoaded", () => { window.__ran = true })</script></div>'))).toBe(true)
		expect(importHasRestrictedCode(htmlToJsonTree('<link rel="stylesheet" href="local.css"><div><p>Hi</p></div>'))).toBe(true)
		expect(importHasRestrictedCode(htmlToJsonTree('<style>.a { color: red }</style><div class="a"><p>Hi</p></div>'))).toBe(false)
	})
})

describe('code from imported HTML is never saved', () => {
	const withCode = '<style>.a { color: red }</style><link rel="stylesheet" href="https://cdn.example.com/a.css"><div class="a" style="padding: 20px"><p>Hi</p></div><script>document.addEventListener("DOMContentLoaded", () => { window.__ran = true })</script>'
	// What the editor does on import: the code goes into the page state, with a marker saying where it came from.
	const asEditorState = (imported: ReturnType<typeof htmlToJsonTree>) => ({
		...imported.root,
		plainCss: imported.css || undefined,
		plainJS: imported.js || undefined,
		importedCode: { plainCss: imported.css || undefined, plainJS: imported.js || undefined, pageScripts: false, externalStyles: imported.externalStyles, externalScripts: imported.externalScripts },
	}) as unknown as CanvasNode

	it('spots code in pasted HTML before it is imported, and in the import result', () => {
		expect(htmlHasCode(withCode)).toBe(true)
		expect(htmlHasCode('<style>.a{}</style><div>x</div>')).toBe(true)
		expect(htmlHasCode('<link rel="stylesheet" href="a.css"><div>x</div>')).toBe(true)
		expect(htmlHasCode('<div style="color: red"><p>Hi</p></div>')).toBe(false)
		expect(importHasCode(htmlToJsonTree(withCode))).toBe(true)
		expect(importHasCode(htmlToJsonTree('<div style="color: red"><p>Hi</p></div>'))).toBe(false)
		// a linked file alone is code too
		expect(importHasCode(htmlToJsonTree('<script src="https://cdn.example.com/lib.js"></script><div><p>Hi</p></div>'))).toBe(true)
	})

	it('keeps the code in the editor state but leaves plainCss, plainJS and pageScripts out of the save content', () => {
		const state = asEditorState(htmlToJsonTree(withCode))
		expect((state as unknown as Record<string, unknown>).plainJS).toBeTruthy()

		const saved = stripImportedCode(state) as unknown as Record<string, unknown>
		expect(saved.plainCss).toBeUndefined()
		expect(saved.plainJS).toBeUndefined()
		expect(saved.pageScripts).toBeUndefined()
		expect(saved.importedCode).toBeUndefined()
		expect(JSON.stringify(saved)).not.toContain('__ran')
		expect(JSON.stringify(saved)).not.toContain('cdn.example.com')
		expect((saved.children as unknown[]).length).toBeGreaterThan(0)
		// the state itself is not changed
		expect((state as unknown as Record<string, unknown>).plainJS).toBeTruthy()
		expect((state as unknown as Record<string, unknown>).importedCode).toBeTruthy()
	})

	it('only removes what the import brought: code that is already stored stays saved', () => {
		const state = { ...(asEditorState(htmlToJsonTree(withCode)) as unknown as Record<string, unknown>), plainJS: 'edited()' } as unknown as CanvasNode
		const saved = stripImportedCode(state) as unknown as Record<string, unknown>
		expect(saved.plainJS).toBe('edited()')
		expect(saved.plainCss).toBeUndefined()
		const plain = page({ plainCss: '.a { color: red }' })
		expect(stripImportedCode(plain)).toBe(plain)
	})
})

describe('codeForReview', () => {
	it('gives the CSS and JS text, with every linked file listed at the top of its tab', () => {
		const html = '<link rel="stylesheet" href="https://cdn.example.com/a.css"><style>.a { color: red }</style><div class="a"><p>Hi</p></div><script src="https://cdn.example.com/lib.js"></script><script>window.__ran = true</script>'
		const imported = htmlToJsonTree(html)
		const state = {
			...imported.root,
			plainCss: imported.css,
			plainJS: imported.js,
			importedCode: { plainCss: imported.css, plainJS: imported.js, pageScripts: false, externalStyles: imported.externalStyles, externalScripts: imported.externalScripts },
		} as unknown as CanvasNode

		const { css, js } = codeForReview(state)
		expect(css).toContain('External stylesheets')
		expect(css).toContain('https://cdn.example.com/a.css')
		expect(css).toContain('color: red')
		expect(js).toContain('External scripts')
		expect(js).toContain('https://cdn.example.com/lib.js')
		expect(js).toContain('window.__ran')
		// the list comes first, then the code
		expect(css.indexOf('External stylesheets')).toBeLessThan(css.indexOf('color: red'))
	})

	it('lists loaded page scripts and shows nothing for a page without code', () => {
		const withScripts = page({ pageScripts: [{ src: 'https://cdn.example.com/lib.js' }, { type: 'application/ld+json', code: '{"a":1}' }] })
		const { js } = codeForReview(withScripts)
		expect(js).toContain('https://cdn.example.com/lib.js')
		expect(js).toContain('application/ld+json')
		expect(js).toContain('{"a":1}')
		expect(codeForReview(page({}))).toEqual({ css: '', js: '' })
		expect(codeForReview(undefined)).toEqual({ css: '', js: '' })
	})
})
