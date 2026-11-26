import { retargetFormSelectors } from '@/utils/nodeAttributes'

/**
 * px/rem -> em for imported HTML, so imported sizes follow the editor's zoom
 * (the canvas scales by changing its root font size, and only em follows it).
 *
 * em is relative to a font size, so each value is divided by the right one:
 * `font-size` by the parent's font size, every other property by the element's
 * own. Those font sizes come from a small cascade over the pasted page
 * (buildUnitContext) - inline styles and the page's own CSS rules.
 */

export interface UnitRule {
	selectors: string[]
	declarations: Record<string, { value: string; important: boolean }>
	order: number
	breakpoint: 'tablet' | 'mobile' | null
}

export interface UnitContext {
	/** Font size of the element itself, in px. */
	ownPx: (el: Element | null | undefined) => number
	/** Font size the element inherits (its parent's), in px. */
	parentPx: (el: Element | null | undefined) => number
	/** The pasted page's <html> font size - what its rem units meant. */
	rootPx: number
	/** The pasted page's <body> font size - fallback when a rule matches nothing. */
	basePx: number
	/** Font size to divide by for a CSS rule's declarations (see contextFor below). */
	contextFor: (selectorText: string, isFontSize: boolean) => number
	/** Whether a rule only styles shapes inside an <svg>, whose px are viewBox units (they scale with the svg). */
	insideSvgOnly: (selectorText: string) => boolean
}

const DEFAULT_PX = 16

// What viewport units mean on the canvas: 100vw = the page root's width (81.5em at 16px),
// so a full-width element fills the canvas; 100vh = a typical laptop screen height.
export const VIEWPORT_PX = { width: 81.5 * DEFAULT_PX, height: 900 }

/** A length in px/rem/viewport units -> px, or null for any other unit. */
function toPx(n: number, unit: string, rootPx: number): number | null {
	const { width, height } = VIEWPORT_PX
	switch (unit.toLowerCase()) {
		case 'px': return n
		case 'rem': return n * rootPx
		case 'vw': case 'dvw': case 'svw': case 'lvw': return (n / 100) * width
		case 'vh': case 'dvh': case 'svh': case 'lvh': return (n / 100) * height
		case 'vmin': return (n / 100) * Math.min(width, height)
		case 'vmax': return (n / 100) * Math.max(width, height)
		default: return null
	}
}

// Units converted to em: px, rem, and the viewport units (vw/vh, their dynamic/small/large
// variants, vmin/vmax) - none of them follow the canvas zoom.
const CONVERTED_UNITS = 'px|rem|vw|vh|vmin|vmax|dvw|svw|lvw|dvh|svh|lvh'

// CSS keyword font sizes, as browsers compute them with a 16px default.
const KEYWORD_PX: Record<string, number> = {
	'xx-small': 9, 'x-small': 10, small: 13, medium: 16, large: 18, 'x-large': 24, 'xx-large': 32, 'xxx-large': 48,
}

// Pseudo-elements (::before) inherit their element's font; state pseudo-classes (:hover)
// are the same element in another state. Stripped so the selector matches the element.
const PSEUDO_TO_STRIP = /::?(before|after|first-line|first-letter|marker|placeholder|selection)\b|:(hover|active|focus|focus-visible|focus-within|visited|checked|disabled)\b/gi
// Same pattern without the `g` flag, for .test() (a global regex keeps state between calls).
const HAS_PSEUDO = new RegExp(PSEUDO_TO_STRIP.source, 'i')

/** Font size in px for a font-size value, or null when it can't be worked out (calc/vw...). */
function resolveFontSize(value: string, parentPx: number, rootPx: number): number | null {
	const v = value.trim().toLowerCase()
	if (v in KEYWORD_PX) return KEYWORD_PX[v]
	if (v === 'smaller') return parentPx / 1.2
	if (v === 'larger') return parentPx * 1.2
	if (v === 'inherit' || v === 'unset') return parentPx
	if (v === 'initial') return DEFAULT_PX
	// A single length: a number plus its unit (e.g. `24px`, `1.5em`, `62.5%`, `5vw`).
	const match = v.match(/^(-?\d*\.?\d+)([a-z%]+)$/)
	if (!match) return evalMath(v, parentPx, rootPx)
	const n = parseFloat(match[1])
	if (match[2] === 'em') return n * parentPx
	if (match[2] === '%') return (n / 100) * parentPx
	return toPx(n, match[2], rootPx)
}

/** px for `clamp()`, `min()`, `max()` and `calc()` font sizes (e.g. `clamp(34px, 5vw, 62px)`); null if unsure. */
function evalMath(value: string, parentPx: number, rootPx: number): number | null {
	// A math function call: name( args ).
	const fn = value.match(/^(clamp|min|max|calc)\(([\s\S]*)\)$/)
	if (!fn) return value === '0' ? 0 : null
	const args = splitTopLevel(fn[2], ',').map((a) => a.trim())
	if (fn[1] === 'calc') return evalCalc(fn[2], parentPx, rootPx)
	const px = args.map((a) => resolveFontSize(a, parentPx, rootPx) ?? evalCalc(a, parentPx, rootPx))
	if (px.some((n) => n === null)) return null
	const nums = px as number[]
	if (fn[1] === 'min') return Math.min(...nums)
	if (fn[1] === 'max') return Math.max(...nums)
	return nums.length === 3 ? Math.max(nums[0], Math.min(nums[1], nums[2])) : null
}

/** A calc() body with + - * / and parentheses over lengths and plain numbers, in px. */
function evalCalc(expr: string, parentPx: number, rootPx: number): number | null {
	// Tokens: a number with optional unit, an operator, or a parenthesis.
	const tokens = expr.match(/-?\d*\.?\d+[a-z%]*|[-+*/()]/gi)
	if (!tokens) return null
	let i = 0
	// Each value: px for a length, or { n } for a unitless number (only valid next to * or /).
	const term = (): number | null => {
		let left = factor()
		while (left !== null && (tokens[i] === '*' || tokens[i] === '/')) {
			const op = tokens[i++]
			const right = factor()
			if (right === null) return null
			left = op === '*' ? left * right : right === 0 ? null : left / right
		}
		return left
	}
	const sum = (): number | null => {
		let left = term()
		while (left !== null && (tokens[i] === '+' || tokens[i] === '-')) {
			const op = tokens[i++]
			const right = term()
			if (right === null) return null
			left = op === '+' ? left + right : left - right
		}
		return left
	}
	const factor = (): number | null => {
		const t = tokens[i++]
		if (t === undefined) return null
		if (t === '(') { const inner = sum(); if (tokens[i++] !== ')') return null; return inner }
		// A plain number multiplies/divides; a length resolves to px.
		if (/^-?\d*\.?\d+$/.test(t)) return parseFloat(t)
		return resolveFontSize(t, parentPx, rootPx)
	}
	const result = sum()
	return i === tokens.length ? result : null
}

function specificity(selector: string): number {
	// Counts ids (#a), classes/attributes/pseudo-classes (.a [x] :hover), and tags (div).
	const ids = (selector.match(/#[\w-]+/g) || []).length
	const classes = (selector.match(/\.[\w-]+|\[[^\]]*\]|:(?!:)[\w-]+/g) || []).length
	const tags = (selector.match(/(^|[\s>+~(])[a-zA-Z][\w-]*/g) || []).length
	return ids * 10000 + classes * 100 + tags
}

/** Runs a selector against the pasted page; an invalid one just matches nothing. */
function select(doc: Document, selector: string): Element[] {
	try {
		return Array.from(doc.querySelectorAll(selector))
	} catch {
		return []
	}
}

/**
 * Works out every element's font size in the pasted page: its own font-size
 * declaration (inline, or the winning stylesheet rule) resolved against its
 * parent's, otherwise the parent's.
 */
export function buildUnitContext(doc: Document, rules: UnitRule[], resolveVars: (value: string) => string = (v) => v): UnitContext {
	// Desktop rules that set font-size, attached to the elements they match.
	type Candidate = { value: string; important: boolean; specificity: number; order: number }
	const candidates = new Map<Element, Candidate[]>()
	for (const rule of rules) {
		const shorthand = rule.declarations.font
		const shorthandSize = shorthand ? splitFontShorthand(shorthand.value)?.size : undefined
		const decl = rule.declarations['font-size'] ?? (shorthandSize ? { value: shorthandSize, important: shorthand!.important } : undefined)
		if (!decl || rule.breakpoint) continue
		for (const selector of rule.selectors) {
			// A :hover/::before font-size isn't the element's normal size.
			if (HAS_PSEUDO.test(selector)) continue
			for (const el of select(doc, selector)) {
				const list = candidates.get(el) ?? []
				list.push({ value: decl.value, important: decl.important, specificity: specificity(selector), order: rule.order })
				candidates.set(el, list)
			}
		}
	}

	// Inline style="" font-size, keeping its !important flag.
	const inlineFontSize = (el: Element): Candidate | null => {
		// Finds `font-size: <value> [!important]` inside the style attribute.
		const match = (el.getAttribute('style') || '').match(/(?:^|;)\s*font-size\s*:\s*([^;]+)/i)
		if (!match) return null
		const important = /!\s*important\s*$/i.test(match[1])
		return { value: match[1].replace(/!\s*important\s*$/i, '').trim(), important, specificity: Infinity, order: Infinity }
	}

	const fontPx = new Map<Element, number>()
	const html = doc.documentElement
	const compute = (el: Element, parentPx: number, rootPx: number) => {
		const all = [...(candidates.get(el) ?? [])]
		const inline = inlineFontSize(el)
		if (inline) all.push(inline)
		// Real cascade order: !important first, then inline, then specificity, then source order.
		all.sort((a, b) => Number(a.important) - Number(b.important) || a.specificity - b.specificity || a.order - b.order)
		let px = parentPx
		for (let i = all.length - 1; i >= 0; i--) {
			const resolved = resolveFontSize(resolveVars(all[i].value), parentPx, rootPx)
			if (resolved !== null) { px = resolved; break }
		}
		fontPx.set(el, px)
		return px
	}

	const rootPx = compute(html, DEFAULT_PX, DEFAULT_PX)
	for (const el of Array.from(html.querySelectorAll('*'))) {
		compute(el, fontPx.get(el.parentElement as Element) ?? rootPx, rootPx)
	}
	const basePx = doc.body ? fontPx.get(doc.body) ?? rootPx : rootPx

	const ownPx = (el: Element | null | undefined) => (el && fontPx.get(el)) || basePx
	const parentPx = (el: Element | null | undefined) => (el?.parentElement && fontPx.get(el.parentElement)) || basePx

	const cache = new Map<string, number>()
	/** A rule can match several elements: use their most common font size (or the body's if none). */
	const contextFor = (selectorText: string, isFontSize: boolean) => {
		const key = `${isFontSize ? 'f' : 'o'}|${selectorText}`
		const cached = cache.get(key)
		if (cached !== undefined) return cached
		const counts = new Map<number, number>()
		for (const selector of splitTopLevel(selectorText, ',')) {
			const base = selector.replace(PSEUDO_TO_STRIP, '').trim() || '*'
			for (const el of select(doc, base)) {
				const px = Math.round((isFontSize ? parentPx(el) : ownPx(el)) * 100) / 100
				counts.set(px, (counts.get(px) ?? 0) + 1)
			}
		}
		const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? basePx
		cache.set(key, best)
		return best
	}

	const insideSvgOnly = (selectorText: string) => {
		const matched = splitTopLevel(selectorText, ',').flatMap((s) => select(doc, s.replace(PSEUDO_TO_STRIP, '').trim() || '*'))
		return matched.length > 0 && matched.every((el) => el.tagName.toLowerCase() !== 'svg' && !!el.closest('svg'))
	}

	return { ownPx, parentPx, rootPx, basePx, contextFor, insideSvgOnly }
}

/** Splits on `sep` outside quotes and parentheses (so `url(a;b)` or `"a,b"` stay whole). */
function splitTopLevel(text: string, sep: string): string[] {
	const out: string[] = []
	let depth = 0
	let quote = ''
	let current = ''
	for (const ch of text) {
		if (quote) {
			if (ch === quote) quote = ''
		} else if (ch === '"' || ch === "'") {
			quote = ch
		} else if (ch === '(') {
			depth++
		} else if (ch === ')') {
			depth--
		} else if (ch === sep && depth === 0) {
			out.push(current)
			current = ''
			continue
		}
		current += ch
	}
	out.push(current)
	return out
}

const formatEm = (em: number) => `${Number(em.toFixed(4))}em`

/**
 * Rewrites every px/rem/viewport-unit length in a CSS value to em, dividing by
 * `contextPx`. url(...) contents and quoted strings are left alone.
 */
export function lengthsToEm(value: string, contextPx: number, rootPx: number): string {
	// A length in one of CONVERTED_UNITS (`24px`, `-0.5rem`, `100vh`) not preceded by a
	// letter/digit, so identifiers that happen to contain "px" or "vh" are left alone.
	const LENGTH = new RegExp(String.raw`(^|[^\w.-])(-?(?:\d+\.?\d*|\.\d+))(${CONVERTED_UNITS})\b`, 'gi')
	// Splits the value into url(...)/quoted pieces (kept as-is) and everything else.
	return value.split(/(url\([^)]*\)|"[^"]*"|'[^']*')/i).map((part, i) => {
		if (i % 2 === 1) return part
		return part.replace(LENGTH, (_, before: string, num: string, unit: string) => {
			const px = toPx(parseFloat(num), unit, rootPx) ?? 0
			return before + (px === 0 ? '0' : formatEm(px / contextPx))
		})
	}).join('')
}

// The size[/line-height] part of a `font` shorthand: a length, % or math function, optionally `/line-height`.
const FONT_SIZE_TOKEN = /^(-?[\d.]+[a-z%]*|(?:clamp|min|max|calc)\(.*\)|xx?x?-(?:small|large)|small|medium|large|smaller|larger)(?:\/(.+))?$/i

/** Splits `font: 800 12px/1.5 Inter` into what comes before the size, the size, the line height and the rest. */
export function splitFontShorthand(value: string): { before: string; size: string; lineHeight?: string; after: string } | null {
	const parts = splitTopLevel(value.trim(), ' ').filter((p) => p !== '')
	for (let i = 0; i < parts.length; i++) {
		const match = parts[i].match(FONT_SIZE_TOKEN)
		// Weights like 800 are unitless numbers, not sizes.
		if (!match || /^\d+$/.test(match[1])) continue
		return { before: parts.slice(0, i).join(' '), size: match[1], lineHeight: match[2], after: parts.slice(i + 1).join(' ') }
	}
	return null
}

/** `font` shorthand to em: its size divides by the parent's font size (like font-size), a line-height length by the element's own. */
function convertFontShorthand(value: string, parentPx: number, ownPx: number, rootPx: number): string | null {
	const parts = splitFontShorthand(value)
	if (!parts) return null
	const size = lengthsToEm(parts.size, parentPx, rootPx)
	const lineHeight = parts.lineHeight ? `/${lengthsToEm(parts.lineHeight, ownPx, rootPx)}` : ''
	// Keeps the value's own surrounding whitespace (`font: 12px Inter }`).
	const lead = value.match(/^\s*/)?.[0] ?? ''
	const trail = value.match(/\s*$/)?.[0] ?? ''
	return `${lead}${[parts.before, size + lineHeight, parts.after].filter(Boolean).join(' ')}${trail}`
}

/** React style object (camelCase keys) -> same object with px/rem as em, for one source element. */
export function styleToEm<T extends object>(style: T, el: Element, units: UnitContext | null): T {
	if (!units) return style
	const out: Record<string, unknown> = {}
	for (const [key, value] of Object.entries(style)) {
		if (typeof value !== 'string') { out[key] = value; continue }
		// Custom properties are used elsewhere, so the page's base size is the best guess.
		const context = key === 'fontSize' ? units.parentPx(el) : key.startsWith('--') ? units.basePx : units.ownPx(el)
		const font = key === 'font' ? convertFontShorthand(value, units.parentPx(el), units.ownPx(el), units.rootPx) : null
		out[key] = font ?? lengthsToEm(value, context, units.rootPx)
	}
	return out as T
}

// Block at-rules whose body is more style rules (recursed into), vs. ones left untouched.
const NESTED_AT_RULES = new Set(['media', 'supports', 'container', 'layer', 'document', 'scope'])

function findBlockEnd(css: string, open: number): number {
	let depth = 0
	for (let i = open; i < css.length; i++) {
		if (css[i] === '{') depth++
		else if (css[i] === '}' && --depth === 0) return i
	}
	return css.length - 1
}

function convertDeclarations(body: string, selectorText: string, units: UnitContext, inKeyframes: boolean): string {
	// Selectors that target only the page root: its font-size would resize the editor's own UI
	// (it's rem-based), and the page no longer needs it once rem is converted.
	const rootOnly = !inKeyframes && splitTopLevel(selectorText, ',').every((s) => /^\s*(html|:root)\s*$/i.test(s))
	// `transform-origin: 200px 200px` on a dial hand is a point in the svg's viewBox: em would move it.
	const svgUnits = !inKeyframes && units.insideSvgOnly(selectorText)
	return splitTopLevel(body, ';').map((declaration) => {
		const colon = declaration.indexOf(':')
		if (colon === -1) return declaration
		const prop = declaration.slice(0, colon).trim().toLowerCase()
		if (rootOnly && prop === 'font-size') return ''
		const isFontSize = prop === 'font-size'
		if (svgUnits && !isFontSize) return declaration
		const context = inKeyframes || prop.startsWith('--') ? units.basePx : units.contextFor(selectorText, isFontSize)
		if (prop === 'font' && !inKeyframes) {
			const value = convertFontShorthand(declaration.slice(colon + 1), units.contextFor(selectorText, true), context, units.rootPx)
			if (value !== null) return declaration.slice(0, colon + 1) + value
		}
		return declaration.slice(0, colon + 1) + lengthsToEm(declaration.slice(colon + 1), context, units.rootPx)
	}).join(';')
}

/**
 * Rewrites the page's CSS so px/rem become em, keeping its structure. @media
 * conditions stay in px (they're about the screen, not the content); @font-face,
 * @page and statement at-rules (@import...) are left as they are.
 */
/** Index of the next `ch` at or after `from`, skipping quoted strings (a font URL can hold `;`). -1 if none. */
export function indexOutsideQuotes(src: string, ch: string, from: number): number {
	let quote = ''
	for (let k = from; k < src.length; k++) {
		const c = src[k]
		if (quote) {
			if (c === '\\') k++
			else if (c === quote) quote = ''
		} else if (c === '"' || c === "'") quote = c
		else if (c === ch) return k
	}
	return -1
}

export function convertCssUnits(css: string, units: UnitContext, inKeyframes = false): string {
	const src = css.replace(/\/\*[\s\S]*?\*\//g, '')
	const out: string[] = []
	let i = 0
	while (i < src.length) {
		const open = src.indexOf('{', i)
		const semi = indexOutsideQuotes(src, ';', i)
		const trimmedStart = src.slice(i).search(/\S/)
		if (trimmedStart === -1) break
		const start = i + trimmedStart

		if (src[start] === '@') {
			// Statement at-rule (`@import ...;`) - no block of its own.
			if (open === -1 || (semi !== -1 && semi < open)) {
				const end = semi === -1 ? src.length : semi + 1
				out.push(src.slice(start, end))
				i = end
				continue
			}
			const close = findBlockEnd(src, open)
			const prelude = src.slice(start, open)
			// The at-rule's name, e.g. `media` from `@media (max-width: 600px)`.
			const name = (prelude.match(/^@([\w-]+)/)?.[1] || '').toLowerCase()
			const inner = src.slice(open + 1, close)
			if (NESTED_AT_RULES.has(name)) out.push(`${prelude}{${convertCssUnits(inner, units, inKeyframes)}}`)
			else if (/keyframes$/.test(name)) out.push(`${prelude}{${convertCssUnits(inner, units, true)}}`)
			else out.push(src.slice(start, close + 1))
			i = close + 1
			continue
		}

		if (open === -1) break
		const close = findBlockEnd(src, open)
		const selectorText = src.slice(start, open).trim()
		// Matched against the pasted page as written; written out for the converted tree.
		out.push(`${retargetFormSelectors(selectorText)} {${convertDeclarations(src.slice(open + 1, close), selectorText, units, inKeyframes)}}`)
		i = close + 1
	}
	return out.join('\n')
}
