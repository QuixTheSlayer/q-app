/**
 * An imported page's CSS is injected into the editor's own document, so a rule written for tags only
 * (`section {}`, `* {}`, `body {}`, `button:hover {}`) would also style the builder's panels. Those
 * selectors are limited to the imported root (`[data-lp-page]`); `:where()` keeps their specificity.
 * Selectors with a private `lp-` class/id or a `data-lp-*` attribute only reach the page already.
 */
import { mapSelectors, splitSelectorList } from '@/utils/pageClasses'
import { IMPORTED_PAGE_ATTR } from '@/utils/nodeAttributes'

const PAGE = `:where([${IMPORTED_PAGE_ATTR}])`
// Something only the page's own elements carry.
const PRIVATE_TOKEN = /\.lp-|#lp-|\[data-lp-/
const QUOTED = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g
// `:not(.lp-x)` excludes page elements, it doesn't select them.
const NOT_GROUP = /:not\((?:[^()]|\([^()]*\))*\)/g
// Keyframe steps (`from`, `50%`) aren't element selectors.
const KEYFRAME_STEPS = /^\s*(from|to|\d+(\.\d+)?%)(\s*,\s*(from|to|\d+(\.\d+)?%))*\s*$/i

/** Length of the selector's first compound (up to its first combinator, outside brackets/quotes). */
function firstCompoundLength(selector: string): number {
	let depth = 0, quote = ''
	for (let i = 0; i < selector.length; i++) {
		const c = selector[i]
		if (quote) { if (c === '\\') i++; else if (c === quote) quote = ''; continue }
		if (c === '"' || c === "'") quote = c
		else if (c === '(' || c === '[') depth++
		else if (c === ')' || c === ']') depth--
		else if (depth === 0 && /[\s>+~]/.test(c)) return i
	}
	return selector.length
}

/** Splits off the first compound and the combinator after it. */
function splitFirst(selector: string): [string, string, string] {
	const end = firstCompoundLength(selector)
	const rest = selector.slice(end)
	const combinator = rest.match(/^[\s>+~]*/)?.[0] ?? ''
	return [selector.slice(0, end), combinator, rest.slice(combinator.length)]
}

function scopeSelector(part: string): string[] {
	const selector = part.trim()
	if (!selector) return [part]
	const unquoted = selector.replace(QUOTED, '""').replace(NOT_GROUP, '')
	if (PRIVATE_TOKEN.test(unquoted)) return [part]
	// Keep the whitespace around it (the newline before, the space before `{`).
	const lead = part.slice(0, part.indexOf(selector))
	const trail = part.slice(part.indexOf(selector) + selector.length)

	// `html`/`:root` stay on the document (variables, scroll-behavior); what they lead into is scoped.
	let prefix = ''
	let rest = selector
	const [first, combinator, after] = splitFirst(rest)
	if (/^(html|:root)(?![\w-])/i.test(first)) {
		if (!after) return [part]
		prefix = first + combinator
		rest = after
	}
	// The page's <body> is the imported root.
	const [head, headCombinator, tail] = splitFirst(rest)
	if (/^body(?![\w-])/i.test(head)) return [`${lead}${prefix}${PAGE}${head.slice(4)}${headCombinator}${tail}${trail}`]
	const scoped = `${lead}${prefix}${PAGE} ${rest}`
	// No tag in front (`*`, `::selection`, `[hidden]`): the root itself matched in the original too.
	if (!/^[*:[]/.test(head)) return [scoped + trail]
	return [scoped, ` ${prefix}${PAGE}${rest.replace(/^\*/, '')}${trail}`]
}

/** Limits the page CSS's tag-only selectors to the imported page. Safe to run more than once. */
export function scopePageCss(css: string): string {
	if (!css) return css
	return mapSelectors(css, (list) =>
		KEYFRAME_STEPS.test(list) ? list : splitSelectorList(list).flatMap(scopeSelector).join(','))
}

/** Whether a page root came from Import HTML (its CSS is scoped to it). */
export const isImportedPage = (root: { attributes?: Record<string, unknown> } | null | undefined) =>
	root?.attributes?.[IMPORTED_PAGE_ATTR] !== undefined
