/**
 * URL allowlists for everything that ends up in an href/src attribute. Anything
 * with a scheme outside the list (javascript:, vbscript:, data:text/html, file:...)
 * is replaced with '' - relative URLs, #anchors and {{placeholders}} pass through.
 */

// Browsers ignore control/whitespace/zero-width characters while reading a scheme,
// so "java<tab>script:" still runs - strip them before checking.
const isInvisible = (code: number) =>
	code <= 0x20 || (code >= 0x7f && code <= 0x9f) || code === 0xad
	|| (code >= 0x200b && code <= 0x200f) || code === 0x2028 || code === 0x2029 || code === 0xfeff

export function stripInvisible(text: string): string {
	return Array.from(text).filter((ch) => !isInvisible(ch.codePointAt(0) ?? 0)).join('')
}

function schemeOf(url: string): string | null {
	// Reads the scheme before the first `:` (`https`, `javascript`...); no match means a
	// relative URL, #anchor or {{placeholder}}, which can't run script.
	const match = stripInvisible(url).match(/^([a-z][a-z0-9+.-]*):/i)
	return match ? match[1].toLowerCase() : null
}

const HREF_SCHEMES = new Set(['http', 'https', 'mailto', 'tel', 'sms'])
const MEDIA_SCHEMES = new Set(['http', 'https', 'blob'])
// Matches data: URLs of real media types (images incl. SVG, video, audio). Rejects
// data:text/html and other document types, which would load as a page and run script.
const SAFE_DATA_MEDIA = /^data:(image\/(png|jpe?g|gif|webp|avif|bmp|x-icon|svg\+xml)|video\/[\w.+-]+|audio\/[\w.+-]+)[;,]/i

/** Links (a/button/section href, template CTA links). */
export function safeHref(url: unknown): string {
	if (typeof url !== 'string') return ''
	const scheme = schemeOf(url)
	return scheme === null || HREF_SCHEMES.has(scheme) ? url : ''
}

/** img/video/audio sources. data: only for real media types (an SVG in <img> can't run script). */
export function safeMediaUrl(url: unknown): string {
	if (typeof url !== 'string') return ''
	const scheme = schemeOf(url)
	if (scheme === null || MEDIA_SCHEMES.has(scheme)) return url
	return scheme === 'data' && SAFE_DATA_MEDIA.test(stripInvisible(url)) ? url : ''
}

/** iframe sources (YouTube/Vimeo/Map/WebView embeds): absolute http(s) only. */
export function safeFrameUrl(url: unknown): string {
	if (typeof url !== 'string') return ''
	const scheme = schemeOf(url)
	return scheme === 'http' || scheme === 'https' ? url : ''
}
