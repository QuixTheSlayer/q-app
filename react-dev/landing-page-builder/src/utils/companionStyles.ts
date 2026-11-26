import type { CSSProperties } from 'react'

/** Reads a computed CSS property (kebab-case) of the node being edited. */
export type ComputedReader = (property: string) => string

type Patch = Record<string, unknown>

const has = (patch: Patch, key: string) => patch[key] !== undefined && patch[key] !== null && patch[key] !== ''
const isFlexOrGrid = (display: string) => /flex|grid/.test(display)

const BORDER_WIDTHS = ['borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth']
const BORDER_COLORS = ['borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor']
// Page-level containers whose max-width is a layout setting of its own (Size > Full width).
const KEEP_MAX_WIDTH = new Set(['root', 'section'])

/**
 * Some properties do nothing on their own. When a style patch sets one of them,
 * this returns the extra styles that make the change actually visible - e.g. a
 * border width needs a border style, a gap needs a flex container. Keys the
 * patch already sets are never overridden.
 */
export function companionStyles(patch: Patch, computed: ComputedReader, contentType?: string): CSSProperties {
	const extra: Record<string, string> = {}
	const borderStyleNone = computed('border-top-style') === 'none' && !has(patch, 'borderStyle')

	// A border needs a style, otherwise its width/color are invisible.
	if (borderStyleNone && BORDER_WIDTHS.some((k) => has(patch, k))) extra.borderStyle = 'solid'
	if (borderStyleNone && BORDER_COLORS.some((k) => has(patch, k))) {
		extra.borderStyle = 'solid'
		const width = computed('border-top-width')
		if (!BORDER_WIDTHS.some((k) => has(patch, k)) && (!width || width === '0px')) extra.borderWidth = '0.125em'
	}

	// Direction, alignment and gap only apply inside a flex (or grid) container.
	const display = computed('display')
	if (has(patch, 'flexDirection') && !display.includes('flex') && !has(patch, 'display')) extra.display = 'flex'
	if (['alignItems', 'justifyContent', 'gap'].some((k) => has(patch, k)) && !isFlexOrGrid(display) && !has(patch, 'display')) {
		extra.display = 'flex'
		if (!has(patch, 'flexDirection')) extra.flexDirection = 'column'
	}

	// A width set by hand shouldn't be capped by an existing max-width.
	const maxWidth = computed('max-width')
	if (has(patch, 'width') && maxWidth && maxWidth !== 'none' && !has(patch, 'maxWidth') && !KEEP_MAX_WIDTH.has(contentType ?? '')) {
		extra.maxWidth = 'none'
	}
	return extra as CSSProperties
}
