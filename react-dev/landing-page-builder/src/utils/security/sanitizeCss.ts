/**
 * Sanitizes stylesheet text before it goes into a <style> tag:
 * - @import only for Google Fonts
 * - url() only for https, relative, and data: images/fonts
 * - drops declarations that can run script (expression(), -moz-binding, behavior)
 * CSS escapes (`@\69mport`, `u\72l(`) are decoded before any check, so they can't
 * be used to sneak a rule past it.
 */

import { stripInvisible } from '@/utils/security/safeUrl'

const ALLOWED_IMPORT_HOSTS = new Set(['fonts.googleapis.com'])

// Matches CSS that can run script: IE expression(), Firefox -moz-binding, IE behavior,
// and javascript:/vbscript: URLs. Any declaration containing one is dropped.
const SCRIPT_CAPABLE = /expression\s*\(|-moz-binding|behavior\s*:|javascript\s*:|vbscript\s*:/i

// Matches data: URLs of real image/font types (the only data: URLs allowed in url()),
// so data:text/html and similar document types are rejected.
const SAFE_DATA_URL = /^data:(image\/(png|jpe?g|gif|webp|avif|bmp|x-icon|svg\+xml)|font\/[\w.+-]+|application\/(font-woff2?|x-font-[\w-]+|vnd\.ms-fontobject))[;,]/i

// Matches a CSS identifier that may contain escapes (`\69`, `\i`), so escaped names
// like `@\69mport` or `u\72l(` are still found and decoded instead of skipped.
const IDENT = String.raw`(?:[\w-]|\\[0-9a-fA-F]{1,6}\s?|\\[^\n])+`

function decodeEscapes(text: string): string {
	return text
		// Hex escape `\69 ` -> the character it stands for (one optional trailing space is part of it).
		.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex) => {
			const code = parseInt(hex, 16)
			return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''
		})
		// Any other escape `\x` -> the plain character x.
		.replace(/\\([^\n])/g, '$1')
}

// Strips one pair of matching quotes around a value: `"a.png"` / `'a.png'` -> `a.png`.
const unquote = (value: string) => value.trim().replace(/^(['"])([\s\S]*)\1$/, '$2').trim()

function isAllowedCssUrl(raw: string): boolean {
	const url = stripInvisible(decodeEscapes(unquote(raw)))
	if (!url) return true
	// Reads the URL's scheme (`https`, `data`, `javascript`...); none means a relative URL.
	const scheme = url.match(/^([a-z][a-z0-9+.-]*):/i)?.[1].toLowerCase()
	if (!scheme) return true
	if (scheme === 'https') return true
	return scheme === 'data' && SAFE_DATA_URL.test(url)
}

/** Stylesheets we'll load from another site (Google Fonts only). */
export function isAllowedStylesheetUrl(href: string): boolean {
	try {
		const url = new URL(href.trim())
		return url.protocol === 'https:' && ALLOWED_IMPORT_HOSTS.has(url.hostname)
	} catch {
		return false
	}
}

function isAllowedImport(prelude: string): boolean {
	// Pulls the target out of `@import url("x")`, `@import url(x)` or `@import "x"`.
	const target = decodeEscapes(prelude).match(/url\(\s*(['"]?)([^'")]*)\1\s*\)|(['"])([^'"]*)\3/i)
	const href = (target?.[2] ?? target?.[4] ?? '').trim()
	return isAllowedStylesheetUrl(href)
}

export function sanitizeCss(css: string | undefined | null): string {
	if (!css) return ''
	// Removes /* comments */ first, so they can't split a keyword to hide it from the checks.
	let out = css.replace(/\/\*[\s\S]*?\*\//g, '')

	// Matches statement at-rules (`@import ...;`, `@charset ...;`): only an allowlisted
	// @import survives, other statements like `@layer a, b;` pass through. Quoted parts are
	// skipped whole, since a font URL can contain `;` (`wght@400;700`).
	out = out.replace(new RegExp(String.raw`@(${IDENT})((?:"[^"]*"|'[^']*'|[^;{}"'])*);`, 'g'), (rule, name: string, prelude: string) =>
		decodeEscapes(name).toLowerCase() === 'import' ? (isAllowedImport(prelude) ? rule : '') : rule)
	// Matches any at-rule name: an escaped @import that slipped past the pattern above
	// (e.g. `@\69mport url(x) {`) has no legitimate use, so it's removed.
	out = out.replace(new RegExp(String.raw`@(${IDENT})`, 'g'), (rule, name: string) =>
		decodeEscapes(name).toLowerCase() === 'import' && name.includes('\\') ? '' : rule)

	// Matches a CSS function call `name(args)`; only url() and image-set() are checked,
	// every other function (rgb, calc, var...) is returned unchanged.
	out = out.replace(new RegExp(String.raw`(${IDENT})\(\s*("[^"]*"|'[^']*'|[^)]*)\s*\)`, 'g'), (fn, name: string, arg: string) => {
		const fnName = decodeEscapes(name).toLowerCase()
		if (fnName === 'url') return isAllowedCssUrl(arg) ? fn : 'url("")'
		// image-set()/-webkit-image-set()/image() also load URLs, so they get the same check.
		if (/^(-webkit-)?image-set$|^image$/.test(fnName)) {
			// Its sources can be plain quoted strings or nested url(...) - collect both.
			const strings = arg.replace(/url\([^)]*\)?/gi, '').match(/"[^"]*"|'[^']*'/g) ?? []
			const nested = [...arg.matchAll(/url\(\s*("[^"]*"|'[^']*'|[^)]*)/gi)].map((m) => m[1])
			return [...strings, ...nested].every(isAllowedCssUrl) ? fn : 'none'
		}
		return fn
	})

	// Matches each declaration (text up to the next `;` or `}`); drops the ones that
	// can run script once escapes are decoded, so `ex\70ression(` is caught too.
	out = out.replace(/[^;{}]+(?=[;}])/g, (declaration) => (SCRIPT_CAPABLE.test(decodeEscapes(declaration)) ? '' : declaration))
	return out
}
