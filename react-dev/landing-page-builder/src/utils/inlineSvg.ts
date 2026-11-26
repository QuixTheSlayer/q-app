import DOMPurify from 'dompurify'

// The markup inside a `data:image/svg+xml,...` URI (after the first comma).
const SVG_DATA_URI = /^data:image\/svg\+xml(;[^,]*)?,/i

/**
 * The <svg> markup of an image imported from inline SVG, cleaned with DOMPurify's SVG
 * profile (no scripts, event handlers, foreignObject or javascript: links). Null when the
 * src isn't an SVG data URI. Used where page JS runs and needs to reach into it by id.
 */
export function inlineSvgMarkup(src: string | undefined): string | null {
	const match = (src || '').match(SVG_DATA_URI)
	if (!match) return null
	let markup = ''
	try {
		const data = (src as string).slice(match[0].length)
		markup = /;base64/i.test(match[1] || '') ? atob(data) : decodeURIComponent(data)
	} catch {
		return null
	}
	const clean = DOMPurify.sanitize(markup, { USE_PROFILES: { svg: true, svgFilters: true } })
	return /^\s*<svg[\s>]/i.test(clean) ? clean : null
}
