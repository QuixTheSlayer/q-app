/**
 * The editor's tablet/mobile views narrow the canvas root (41.5em / 21.5em), not the browser window,
 * so an imported page's `@media (max-width: 992px)` rules never apply there. In the editor only,
 * width media queries become container queries on the imported root, with px turned into em:
 * em in a container condition follows the root's font size, which is what the editor's zoom changes.
 * Preview and the published page keep the real @media rules (their frame is the page's viewport).
 */
import { IMPORTED_PAGE_ATTR } from '@/utils/nodeAttributes'

export const PAGE_CONTAINER = 'lp-page'
// The importer's base font size (see unitConversion VIEWPORT_PX: 100vw = 81.5em = 1304px).
const BASE_PX = 16

// One width feature: `(max-width: 992px)`, `(min-width:48em)`.
const WIDTH_FEATURE = /^\(\s*(min-width|max-width)\s*:\s*(\d*\.?\d+)(px|em|rem)\s*\)$/i

/** A width-only media query as a container condition, or null when it tests anything else. */
function toContainerCondition(prelude: string): string | null {
	// A list (`a, b`) can't be one container query; print/hover/orientation aren't widths.
	if (prelude.includes(',')) return null
	const query = prelude.trim().replace(/^(only\s+)?(screen|all)\s+and\s+/i, '')
	const features = query.split(/\s+and\s+/i)
	const converted = features.map((feature) => {
		const match = feature.trim().match(WIDTH_FEATURE)
		if (!match) return null
		const [, name, value, unit] = match
		const em = unit.toLowerCase() === 'px' ? Number(value) / BASE_PX : Number(value)
		return `(${name.toLowerCase()}: ${Number(em.toFixed(4))}em)`
	})
	return converted.every(Boolean) ? converted.join(' and ') : null
}

/** The page CSS for the editor canvas: width @media rules become `@container lp-page` rules, and the
 * imported root becomes that container. */
export function editorBreakpoints(css: string): string {
	if (!css) return css
	const rewritten = css.replace(/@media\s+([^{;]+)\{/gi, (rule, prelude: string) => {
		const condition = toContainerCondition(prelude)
		return condition ? `@container ${PAGE_CONTAINER} ${condition} {` : rule
	})
	return `${rewritten}\n/* Judgify: the editor's device views narrow this root, not the window */\n[${IMPORTED_PAGE_ATTR}] { container: ${PAGE_CONTAINER} / inline-size; }`
}
