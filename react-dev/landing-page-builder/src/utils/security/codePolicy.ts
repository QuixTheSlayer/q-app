import type { CanvasNode, LayoutNode } from '@/types/node.type'

/**
 * The backend's `is_allow` flag. It follows the LOGGED IN user's role. Nothing here depends on it any more:
 * a page's JS and external CSS never run, whoever is looking at it (see applyCodePolicy).
 * Only an explicit false (or 0 / "0" / "false") blocks, so an older backend that doesn't send the field keeps working.
 */
export function parseIsAllow(value: unknown): boolean {
	return !(value === false || value === 0 || value === '0' || value === 'false')
}

/** The flag as the backend sends it: `isAllow`, or `is_allow` (what get_landingpage_data sends today). */
export const readAllowFlag = (row: { isAllow?: unknown; is_allow?: unknown } | null | undefined): unknown => row?.isAllow ?? row?.is_allow

/**
 * May the page's own JS run? Unlike parseIsAllow this fails closed: only an explicit true (or 1 / "1" / "true")
 * counts, so a missing flag, or an endpoint that doesn't send it, never runs stored JS.
 */
export function parseJsAllowed(value: unknown): boolean {
	return value === true || value === 1 || value === '1' || value === 'true'
}

type PageCode = { plainCss?: string; plainJS?: string; pageScripts?: unknown[] } | null | undefined

/** `@import` statements in the page CSS: the only way stored CSS pulls in an external stylesheet. */
const IMPORT_RULE = /@import\s+(?:url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\s*\)|"[^"]*"|'[^']*')[^;{}]*;?/gi

export const hasPageJs = (content: PageCode): boolean => !!content?.plainJS?.trim() || !!content?.pageScripts?.length

export const hasExternalCss = (css: string | undefined): boolean => !!css && new RegExp(IMPORT_RULE.source, 'i').test(css)

export const stripExternalCss = (css: string | undefined): string => (css ?? '').replace(IMPORT_RULE, '').trim()

/** True when the page holds JS, imported scripts or external CSS (@import). */
export const hasRestrictedCode = (content: PageCode): boolean => hasPageJs(content) || hasExternalCss(content?.plainCss)

/** The converter's result for pasted HTML: JS, scripts/stylesheets it couldn't include, or `@import`s. */
export function importHasRestrictedCode(result: { css: string; js: string; external: string[]; root: PageCode }): boolean {
	return !!result.js.trim() || result.external.length > 0 || !!result.root?.pageScripts?.length || hasExternalCss(result.css)
}

/** True when pasted HTML itself carries code: a <script>, a <style> block, a stylesheet link or an @import. */
export const htmlHasCode = (html: string): boolean => /<script[\s>]|<style[\s>]|<link\b[^>]*\brel\s*=\s*["']?stylesheet|@import\b/i.test(html)

type ImportResultLike = { root: LayoutNode; css: string; js: string; external: string[]; externalStyles?: string[]; externalScripts?: string[] }

/** The imported HTML carries code: JS, a linked stylesheet or file, `@import`, or CSS from a <style> block. */
export const importHasCode = (result: ImportResultLike): boolean =>
	!!result.css.trim() || !!result.js.trim() || result.external.length > 0 || !!result.externalStyles?.length || !!result.externalScripts?.length || hasRestrictedCode(result.root) || !!result.root.plainCss?.trim()

/**
 * The page content for a save request. Code that came in from imported HTML is never saved: it stays in the editor's
 * state and shows there (the "Code for review" dialog lets the user copy it for support), but plainCss, plainJS and
 * pageScripts are left out of the payload while they are still what the import brought. The page itself is not changed.
 */
export function stripImportedCode<T extends CanvasNode | undefined>(content: T): T {
	const marker = (content as LayoutNode | undefined)?.importedCode
	if (!content || !marker) return content
	const page = { ...(content as LayoutNode), importedCode: undefined }
	if (marker.plainCss !== undefined && page.plainCss === marker.plainCss) page.plainCss = undefined
	if (marker.plainJS !== undefined && page.plainJS === marker.plainJS) page.plainJS = undefined
	if (marker.pageScripts) page.pageScripts = undefined
	return page as unknown as T
}

/**
 * What to render for a page, the same for every viewer and with no flag to switch it: its JS, imported scripts and
 * external CSS (@import) are always left out. The stored page is untouched, so nothing is lost. Code only runs once
 * the support team has checked it by hand and added it for the customer.
 */
export function applyCodePolicy<T extends CanvasNode | undefined>(content: T): T {
	if (!content || !hasRestrictedCode(content as PageCode)) return content
	const page = content as LayoutNode
	return { ...page, plainJS: undefined, pageScripts: undefined, plainCss: stripExternalCss(page.plainCss) || undefined } as T
}

/**
 * The CSS and JavaScript that came with the page, as text, for the "Code for review" dialog: the user copies it for support.
 * Linked files (external stylesheets and scripts) are listed at the top of their tab, then the code itself.
 */
export function codeForReview(content: CanvasNode | undefined): { css: string; js: string } {
	const page = content as LayoutNode | undefined
	const marker = page?.importedCode
	const stylesheets = marker?.externalStyles ?? []
	const scriptSrcs = Array.from(new Set([...(marker?.externalScripts ?? []), ...(page?.pageScripts ?? []).flatMap((script) => (script.src ? [script.src] : []))]))
	const inlineScripts = (page?.pageScripts ?? []).filter((script) => !script.src).map((script) => `// <script${script.type ? ` type="${script.type}"` : ''}>\n${script.code ?? ''}`)

	const cssFiles = stylesheets.length ? `/* External stylesheets (linked, not loaded):\n${stylesheets.map((href) => ` * ${href}`).join('\n')}\n */` : ''
	const jsFiles = scriptSrcs.length ? `// External scripts (linked, not loaded):\n${scriptSrcs.map((src) => `//   ${src}`).join('\n')}` : ''
	return {
		css: [cssFiles, page?.plainCss ?? ''].filter(Boolean).join('\n\n'),
		js: [jsFiles, ...inlineScripts, page?.plainJS ?? ''].filter(Boolean).join('\n\n'),
	}
}
