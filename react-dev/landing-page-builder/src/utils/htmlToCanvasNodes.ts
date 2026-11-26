import editorConfig from '@/configs/editor.config'
import DOMPurify from 'dompurify'
import type { CanvasNode, CssClassRule, JsClassRule, LayoutNode, PageScript } from '@/types/node.type'
import generateCryptoUID from '@/utils/generateCryptoUID'
import type { AnimationEntry, PrototypeActionType } from '@/utils/scrollToInteraction.utils'
import { elementFromString, getSchema } from '@tiptap/react'
import { DOMParser as ProseMirrorParser, type Schema } from '@tiptap/pm/model'
import { extensions } from '@/libs/tiptap/config'
import { RuleIndex, selectorKey, type RuleKey } from '@/utils/ruleIndex'
import { readEmbeddedPageData } from '@/utils/exportHTML'
import { JQUERY_INTEGRITY, JQUERY_SRC, usesJquery } from '@/utils/jquery.utils'
import { sanitizeCanvasTree } from '@/utils/security/sanitizeCanvasTree'
import { isAllowedStylesheetUrl, sanitizeCss } from '@/utils/security/sanitizeCss'
import { buildUnitContext, convertCssUnits, splitFontShorthand, styleToEm, type UnitContext } from '@/utils/unitConversion'
import { applyTailwind, readTailwind, type TailwindReport, type TwTrigger } from '@/utils/tailwind'
import { isContainerTag, keptAttributeName, VOID_TAGS, INLINE_SVG_ATTR, IMPORTED_TEXT_ATTR, IMPORTED_PAGE_ATTR, INLINE_PIECE_ATTR, FORM_ATTR } from '@/utils/nodeAttributes'
import { scopePageVariables } from '@/utils/pageVariables'
import { mapSelectors, scopePageClasses, splitSelectorList } from '@/utils/pageClasses'
import { scopePageCss } from '@/utils/pageScope'
import { ID_FALLBACK_SCRIPT, pageIdNames, scopePageIds } from '@/utils/pageIds'
import { stripJsSideEffects } from '@/utils/stripJsSideEffects'

/**
 * !!!THIS SECTION IS ABSOLUTE MAGIC, MODIFY WITH CAUTION!!!
 * 
 * 
 * MVP HTML → CanvasNode importer. Converts pasted raw HTML (including
 * <style> blocks and class/id/tag selectors) into generic CanvasNode
 * sections — never a Ready Made Template shape, always plain
 * block/text/image/button/table nodes.
 *
 * Known, deliberate simplifications (documented rather than silently
 * wrong):
 * - Selector matching only checks the selector's last compound (so
 *   `.card h3` matches any `h3`, ignoring whether it's really inside a
 *   `.card`) — no real ancestor/combinator resolution.
 * - `@media (max-width: Npx)` is mapped onto this app's own fixed two-tier
 *   responsive system (CanvasNode.responsiveStyle.tablet/mobile, breakpoints
 *   1024px/640px — see RESPONSIVE_BREAKPOINTS in responsive.utils.ts): N≥768
 *   buckets into `tablet`, N<768 into `mobile`. This doesn't reproduce the
 *   source's own exact breakpoint, just the closest of the app's two tiers.
 *   `@supports`/`@keyframes`/other at-rules, and any `@media` condition that
 *   isn't a plain max-width (orientation, print, min-width, ...), are still
 *   skipped entirely.
 * - Specificity is a simplified id*100 + class*10 + tag*1 sum, source
 *   order breaks ties. `!important` IS honored (stripped from the value and
 *   tracked separately - a raw "value!important" string is invalid CSS and
 *   silently voids the whole declaration if left in, which is worse than
 *   ignoring importance entirely).
 * - Text-bearing tags (h1-h6/p/span/li/...) always flatten to plain text
 *   (textContent) — nested inline formatting (bold/links inside a
 *   paragraph) is lost.
 * - Bare top-level text nodes (not wrapped in an element) are skipped.
 * - No CSS or JS is ever stored/executed as raw code: every style
 *   declaration is resolved onto real `node.style`/`responsiveStyle`
 *   (editable via the normal property controllers - color picker, etc.),
 *   and only a small set of common click-driven `onclick`/`href="#id"`
 *   patterns (scrollIntoView/toggle/show/hide) are recognized and turned
 *   into this app's own editable prototype-effect animations (see
 *   `detectOnclickInteraction`/`resolveInteractions` below) — everything
 *   else in a <script> tag or an unrecognized onclick is simply dropped.
 */

type Breakpoint = 'tablet' | 'mobile' | null

interface Declaration {
	value: string
	important: boolean
}

interface CssRule {
	selectors: string[]
	declarations: Record<string, Declaration>
	order: number
	breakpoint: Breakpoint
}

/** Splits declarations on `;` outside quotes and parentheses (`url(data:image/png;base64,...)`). */
export function splitDeclarations(text: string): string[] {
	const parts: string[] = []
	let depth = 0
	let quote = ''
	let current = ''
	for (const char of text) {
		if (quote) {
			if (char === quote) quote = ''
		} else if (char === '"' || char === "'") quote = char
		else if (char === '(') depth++
		else if (char === ')') depth = Math.max(0, depth - 1)
		else if (char === ';' && depth === 0) {
			parts.push(current)
			current = ''
			continue
		}
		current += char
	}
	parts.push(current)
	return parts
}

function parseDeclarations(body: string): Record<string, Declaration> {
	const out: Record<string, Declaration> = {}
	splitDeclarations(body).forEach((decl) => {
		const i = decl.indexOf(':')
		if (i === -1) return
		const prop = decl.slice(0, i).trim()
		let value = decl.slice(i + 1).trim()
		const important = /!\s*important\s*$/i.test(value)
		if (important) value = value.replace(/!\s*important\s*$/i, '').trim()
		if (prop && value) out[prop] = { value, important }
	})
	return out
}

/** N≥768 → tablet, N<768 → mobile, no max-width found (orientation, print,
 * min-width, ...) → null (caller skips it - can't bucket it). */
function extractMaxWidthBreakpoint(condition: string): Breakpoint {
	const match = condition.match(/max-width\s*:\s*(\d+(?:\.\d+)?)/i)
	if (!match) return null
	return Number(match[1]) >= 768 ? 'tablet' : 'mobile'
}

/** Walks raw CSS text (extracted from <style> blocks before sanitizing —
 * DOMPurify strips <style> tags even with ADD_TAGS), recursing into
 * `@media (max-width: ...)` blocks (see extractMaxWidthBreakpoint) and
 * skipping every other @-rule, collecting flat rules tagged with which
 * breakpoint (if any) they came from. */
function parseRulesFromCss(css: string, breakpoint: Breakpoint, rules: CssRule[], orderRef: { value: number }) {
	let i = 0
	while (i < css.length) {
		while (i < css.length && /\s/.test(css[i])) i++
		if (i >= css.length) break

		if (css[i] === '@') {
			const atMatch = css.slice(i).match(/^@([a-zA-Z-]+)/)
			const atKeyword = atMatch ? atMatch[1].toLowerCase() : ''

			let depth = 0
			let sawBrace = false
			let blockStart = -1
			let j = i
			let quote = ''
			for (; j < css.length; j++) {
				// Quoted strings are skipped whole - an @import URL can contain `;` or braces.
				if (quote) {
					if (css[j] === '\\') j++
					else if (css[j] === quote) quote = ''
					continue
				}
				if (css[j] === '"' || css[j] === "'") quote = css[j]
				else if (css[j] === '{') {
					if (depth === 0) blockStart = j
					depth++
					sawBrace = true
				} else if (css[j] === '}') {
					depth--
					if (depth === 0) { j++; break }
				} else if (css[j] === ';' && !sawBrace) { j++; break }
			}

			if (atKeyword === 'media' && sawBrace && blockStart !== -1) {
				const condition = css.slice(i + 6, blockStart)
				const bp = extractMaxWidthBreakpoint(condition)
				if (bp) parseRulesFromCss(css.slice(blockStart + 1, j - 1), bp, rules, orderRef)
			}
			i = j
			continue
		}

		const selEnd = css.indexOf('{', i)
		if (selEnd === -1) break
		const bodyEnd = css.indexOf('}', selEnd)
		if (bodyEnd === -1) break

		const selectorText = css.slice(i, selEnd).trim()
		const declarations = parseDeclarations(css.slice(selEnd + 1, bodyEnd))
		const selectors = selectorText.split(',').map((s) => s.trim()).filter(Boolean)
		if (selectors.length && Object.keys(declarations).length) {
			rules.push({ selectors, declarations, order: orderRef.value++, breakpoint })
		}
		i = bodyEnd + 1
	}
}

function parseStyleRules(cssText: string): CssRule[] {
	const rules: CssRule[] = []
	const css = cssText.replace(/\/\*[\s\S]*?\*\//g, '')
	parseRulesFromCss(css, null, rules, { value: 0 })
	return rules
}

/** ::before/::after (and other pseudo-elements/classes we don't resolve,
 * e.g. :first-child, :hover) target something that isn't a real element, or
 * a state/position we don't track. Naively stripping the `:foo` suffix and
 * matching the bare compound would misapply the rule to the real element
 * itself - e.g. `.hero::before { position:absolute; background:<overlay> }`
 * would otherwise land its overlay styling directly on `.hero`. Safer to
 * skip the whole selector than to guess. */
function hasUnsupportedPseudo(selector: string): boolean {
	return /::|:[a-zA-Z-]+(\(.*?\))?/.test(selector)
}

function lastCompound(selector: string): string {
	const parts = selector.trim().split(/\s+/).filter((p) => p !== '>' && p !== '+' && p !== '~')
	return parts[parts.length - 1] || '*'
}

function compoundSpecificity(compound: string): number {
	const ids = (compound.match(/#/g) || []).length
	const classes = (compound.match(/\./g) || []).length
	const hasTag = /^[a-zA-Z]/.test(compound)
	return ids * 100 + classes * 10 + (hasTag ? 1 : 0)
}

const COMPOUND_PARTS = /(^[a-zA-Z][a-zA-Z0-9-]*)|(\.[a-zA-Z0-9_-]+)|(#[a-zA-Z0-9_-]+)/g

/** The id, class or tag `matchesCompound` requires of a selector's last compound (see RuleIndex). */
function compoundKey(selector: string): RuleKey {
	const compound = lastCompound(selector)
	if (compound === '*') return null
	const parts = compound.match(COMPOUND_PARTS) || []
	if (!parts.length) return false
	const part = parts.find((p) => p.startsWith('#')) ?? parts.find((p) => p.startsWith('.')) ?? parts[0]
	if (part?.startsWith('#')) return { kind: 'id', name: part.slice(1).toLowerCase() }
	if (part?.startsWith('.')) return { kind: 'class', name: part.slice(1).toLowerCase() }
	return { kind: 'tag', name: part?.toLowerCase()||"div" }
}

// A rule list is only filled while parsing, so each one is indexed once, on first use.
const compoundIndexes = new WeakMap<CssRule[], RuleIndex<CssRule>>()
const selectorIndexes = new WeakMap<CssRule[], RuleIndex<CssRule>>()

function indexFor(cache: WeakMap<CssRule[], RuleIndex<CssRule>>, rules: CssRule[], keyOf: (selector: string) => RuleKey): RuleIndex<CssRule> {
	let index = cache.get(rules)
	if (!index) cache.set(rules, (index = new RuleIndex(rules, keyOf)))
	return index
}

/** Candidates for the cheap class/id/tag match (`matchesCompound`). */
const compoundCandidates = (rules: CssRule[], el: Element) => indexFor(compoundIndexes, rules, compoundKey).candidates(el)
/** Candidates for a real `el.matches(selector)`. */
const selectorCandidates = (rules: CssRule[], el: Element) => indexFor(selectorIndexes, rules, selectorKey).candidates(el)

function matchesCompound(el: Element, compound: string): boolean {
	if (compound === '*') return true
	const parts = compound.match(COMPOUND_PARTS) || []
	for (const part of parts) {
		if (part.startsWith('.')) {
			if (!el.classList.contains(part.slice(1))) return false
		} else if (part.startsWith('#')) {
			if (el.id !== part.slice(1)) return false
		} else if (el.tagName.toLowerCase() !== part.toLowerCase()) {
			return false
		}
	}
	return parts.length > 0
}

function toCamelCase(prop: string): string {
	if (prop.startsWith('--')) return prop
	return prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

/** Custom properties (`--name: value`), collected from every rule
 * regardless of which selector defined them - matches this file's already-
 * simplified (non-hierarchical) selector model. Last source-order
 * definition wins for a given name. */
// A selector for the document root alone (`:root`, `html`, `:root[data-theme="dark"]`, `html.dark`),
// with no descendant part after it.
const ROOT_SELECTOR = /^(:root|html)(?![\w-])[^\s>+~]*$/i

/** Root-level rules that don't apply to the page as pasted - e.g. `:root[data-theme="dark"]`
 * or `html.dark` - are theme variants whose values only apply after a script switches them on. */
function isInactiveRootRule(rule: CssRule, doc?: Document): boolean {
	if (!doc || !rule.selectors.every((s) => ROOT_SELECTOR.test(s))) return false
	return !rule.selectors.some((s) => {
		try { return doc.documentElement.matches(s) } catch { return false }
	})
}

/** Names of the custom properties set on the document root - always defined wherever the
 * page CSS is injected, so a reference to them can stay a var() (and follow theme switches). */
function rootVariableNames(rules: CssRule[]): Set<string> {
	const names = new Set<string>()
	for (const rule of rules) {
		if (!rule.selectors.every((s) => ROOT_SELECTOR.test(s))) continue
		for (const prop of Object.keys(rule.declarations)) if (prop.startsWith('--')) names.add(prop)
	}
	return names
}

// Without a document the result only depends on the rules, and computeElementStyle asks for it per element.
const variablesWithoutDoc = new WeakMap<CssRule[], Record<string, string>>()

function collectCssVariables(rules: CssRule[], doc?: Document): Record<string, string> {
	if (!doc) {
		let cached = variablesWithoutDoc.get(rules)
		if (!cached) variablesWithoutDoc.set(rules, (cached = collectVariables(rules)))
		return cached
	}
	return collectVariables(rules, doc)
}

function collectVariables(rules: CssRule[], doc?: Document): Record<string, string> {
	const vars: Record<string, string> = {}
	const withOrder: { name: string; value: string; order: number }[] = []
	for (const rule of rules) {
		if (isInactiveRootRule(rule, doc)) continue
		for (const [prop, decl] of Object.entries(rule.declarations)) {
			if (prop.startsWith('--')) withOrder.push({ name: prop, value: decl.value, order: rule.order })
		}
	}
	withOrder.sort((a, b) => a.order - b.order)
	for (const v of withOrder) vars[v.name] = v.value
	return vars
}

/** Resolves `var(--name)` / `var(--name, fallback)` references to their
 * actual literal value at conversion time, instead of leaving the raw
 * `var()` reference in the node's inline style. A left-in reference would
 * depend on the DOM ancestor that defines it still being an ancestor at
 * render time — fragile in an editor where nodes get moved/duplicated/
 * restyled independently of the HTML they were imported from.
 *
 * Hand-scans for the matching closing paren (rather than a regex) so this
 * works correctly with a fallback that itself contains parens — e.g.
 * `background: linear-gradient(90deg, var(--dark, rgba(0,0,0,.5)), ...)`,
 * a shape that comes up constantly in real gradient values. Recurses (a
 * custom property's own value can reference another one), with a depth
 * guard against circular references. */
function resolveVarReferences(value: string, vars: Record<string, string>, depth = 0): string {
	if (depth > 5 || !value.includes('var(')) return value
	let result = ''
	let i = 0
	let changed = false
	while (i < value.length) {
		const varIdx = value.indexOf('var(', i)
		if (varIdx === -1) { result += value.slice(i); break }
		result += value.slice(i, varIdx)

		let parenDepth = 1
		let j = varIdx + 4
		while (j < value.length && parenDepth > 0) {
			if (value[j] === '(') parenDepth++
			else if (value[j] === ')') parenDepth--
			j++
		}
		const inner = value.slice(varIdx + 4, j - 1)
		const commaIdx = inner.indexOf(',')
		const name = (commaIdx === -1 ? inner : inner.slice(0, commaIdx)).trim()
		const fallback = commaIdx === -1 ? undefined : inner.slice(commaIdx + 1).trim()

		result += name in vars ? vars[name] : (fallback ?? '')
		changed = true
		i = j
	}
	return changed ? resolveVarReferences(result, vars, depth + 1) : result
}

/** Resolves the declarations for one breakpoint bucket ('null' = desktop/
 * base). Inline style="" only ever applies to desktop - HTML attributes
 * aren't conditional on viewport width. `includeInline: false` computes
 * only the stylesheet-rule contribution (no `style=""`) - used to seed
 * `content.css[className]`, the shared/editable rule for the element's
 * class, kept separate from its own one-off inline overrides. */
function resolveBucketStyle(el: Element, rules: CssRule[], breakpoint: Breakpoint, cssVariables: Record<string, string>, includeInline = true): React.CSSProperties {
	const matched: { declarations: Record<string, Declaration>; specificity: number; order: number }[] = []
	// A rule counts once, for its first matching selector.
	let lastMatched: CssRule | null = null
	for (const { rule, selector } of compoundCandidates(rules, el)) {
		if (rule.breakpoint !== breakpoint || rule === lastMatched) continue
		if (hasUnsupportedPseudo(selector)) continue
		const compound = lastCompound(selector)
		if (matchesCompound(el, compound)) {
			matched.push({ declarations: rule.declarations, specificity: compoundSpecificity(compound), order: rule.order })
			lastMatched = rule
		}
	}
	matched.sort((a, b) => a.specificity - b.specificity || a.order - b.order)
	const inline = includeInline && breakpoint === null ? parseDeclarations(el.getAttribute('style') || '') : {}

	// Real CSS cascade priority, lowest to highest: stylesheet normal,
	// inline normal, stylesheet !important, inline !important. Each pass
	// only writes properties matching its important-ness, so the correct
	// value wins regardless of what order rules were declared in.
	const merged: Record<string, string> = {}
	const apply = (declarations: Record<string, Declaration>, important: boolean) => {
		for (const [prop, decl] of Object.entries(declarations)) {
			if (decl.important === important) merged[prop] = decl.value
		}
	}
	for (const m of matched) apply(m.declarations, false)
	apply(inline, false)
	for (const m of matched) apply(m.declarations, true)
	apply(inline, true)

	const style: Record<string, string> = {}
	for (const [prop, value] of Object.entries(merged)) {
		// Custom-property declarations themselves (--green: #176c49) are only
		// useful as a lookup source for var() resolution below - they aren't a
		// real style property to put on the node.
		if (prop.startsWith('--')) continue
		style[toCamelCase(prop)] = resolveVarReferences(value, cssVariables)
	}
	return style as React.CSSProperties
}

interface ElementStyles {
	desktop: React.CSSProperties
	tablet: React.CSSProperties
	mobile: React.CSSProperties
}

function computeElementStyle(el: Element, rules: CssRule[]): ElementStyles {
	const cssVariables = collectCssVariables(rules)
	// The element's Tailwind tablet/mobile styles go on top of the page rules (its desktop ones are already in style="").
	const tw = readTailwind(el)
	return {
		desktop: resolveBucketStyle(el, rules, null, cssVariables),
		tablet: { ...resolveBucketStyle(el, rules, 'tablet', cssVariables), ...tw.tablet },
		mobile: { ...resolveBucketStyle(el, rules, 'mobile', cssVariables), ...tw.mobile },
	}
}

/** Same as `computeElementStyle`, but stylesheet-only (no `style=""`) -
 * this is what gets attributed to the element's primary class in
 * `content.css`, so a shared class's rule doesn't pick up one specific
 * element's own inline overrides. */
function computeClassOnlyStyle(el: Element, rules: CssRule[]): ElementStyles {
	const cssVariables = collectCssVariables(rules)
	return {
		desktop: resolveBucketStyle(el, rules, null, cssVariables, false),
		tablet: resolveBucketStyle(el, rules, 'tablet', cssVariables, false),
		mobile: resolveBucketStyle(el, rules, 'mobile', cssVariables, false),
	}
}

/** Builds the `responsiveStyle` field for a CanvasNode from computed
 * tablet/mobile buckets - omitted entirely when empty, matching how nodes
 * created elsewhere in this app only carry it when there's a real
 * override (see DeviceScopeControl.tsx). */
function buildResponsiveStyle(styles: ElementStyles): { responsiveStyle?: { tablet?: React.CSSProperties; mobile?: React.CSSProperties } } {
	const hasTablet = Object.keys(styles.tablet).length > 0
	const hasMobile = Object.keys(styles.mobile).length > 0
	if (!hasTablet && !hasMobile) return {}
	return {
		responsiveStyle: {
			...(hasTablet ? { tablet: styles.tablet } : {}),
			...(hasMobile ? { mobile: styles.mobile } : {}),
		},
	}
}

/** A text node's color/font have to live on this TipTap `textStyle` mark -
 * the outer CanvasNode's own `style.color`/`style.fontFamily` are NOT
 * enough on their own, the same way createTextNode() in canvas.utils.ts
 * always sets this mark (even with empty values). Without it, ProseMirror's
 * own base styling wins over whatever the outer node has, which read as
 * "every imported text renders white" / "font family doesn't match" (this
 * editor's canvas theme defaults). */
function buildTextDoc(text: string, color?: string, fontFamily?: string): string {
	return JSON.stringify({
		type: 'doc',
		content: [{
			type: 'paragraph',
			attrs: { textAlign: null },
			...(text ? {
				content: [{
					type: 'text',
					marks: [{ type: 'textStyle', attrs: { color: color || '', fontFamily: fontFamily || '', fontSize: '1em' } }],
					text,
				}],
			} : {}),
		}],
	})
}

function tableCellNode(cell: Element) {
	const type = cell.tagName.toLowerCase() === 'th' ? 'tableHeader' : 'tableCell'
	const text = cell.textContent?.trim() || ''
	return {
		type,
		attrs: {
			colspan: Number(cell.getAttribute('colspan')) || 1,
			rowspan: Number(cell.getAttribute('rowspan')) || 1,
			colwidth: null,
			align: null,
		},
		content: [{ type: 'paragraph', attrs: { textAlign: null }, ...(text ? { content: [{ type: 'text', text }] } : {}) }],
	}
}

function convertTable(styles: ElementStyles, tableEl: Element): CanvasNode {
	const rows = Array.from(tableEl.querySelectorAll('tr')).map((tr) => ({
		type: 'tableRow',
		content: Array.from(tr.children).map(tableCellNode),
	}))
	const doc = {
		type: 'doc',
		content: [{ type: 'table', content: rows }, { type: 'paragraph', attrs: { textAlign: null } }],
	}
	return {
		id: generateCryptoUID(),
		type: 'content',
		contentType: 'table',
		uiType: 'classicBordered',
		tableHeadStyle: { backgroundColor: '#bbbbbb', borderColor: '#888888' },
		tableBodyStyle: { borderColor: '#888888' },
		style: styles.desktop,
		...buildResponsiveStyle(styles),
		attributes: sourceAttributes(tableEl),
		children: doc,
	} as unknown as CanvasNode
}

const TEXT_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'li', 'label', 'blockquote', 'small', 'strong', 'em'])

/** The source element's own `class`/`id` - preserved as-is on every
 * converted node's `attributes` (not just read for CSS-rule matching),
 * since the page's own CSS still targets them and anchors/inline scripts
 * may reference them by id. */
function sourceAttributes(el: Element): { className?: string; id?: string } & Record<string, string> {
	const className = el.getAttribute('class') || undefined
	const id = el.getAttribute('id') || undefined
	// data-*, aria-*, role, title... kept too (see nodeAttributes.ts) - page scripts and
	// screen readers rely on them. on* handlers and unknown attributes are never kept.
	const extra: Record<string, string> = {}
	for (const attr of Array.from(el.attributes)) {
		const prop = keptAttributeName(attr.name)
		if (prop) extra[prop] = attr.value
	}
	return { ...extra, ...(className ? { className } : {}), ...(id ? { id } : {}) }
}

interface PendingInteraction {
	/** The generated id of the CanvasNode the user clicks to trigger this. */
	nodeId: string
	action: PrototypeActionType
	/** The *source* HTML id (from href="#id" or an onclick selector) that
	 * this interaction targets - resolved to a generated CanvasNode id only
	 * once the whole tree is converted (see `resolveInteractions`), since
	 * the target element may not have been converted yet at this point. */
	targetSourceId: string
}

interface ConversionContext {
	pending: PendingInteraction[]
}

/** Every distinct class name anywhere in the fragment, mapped to its
 * stylesheet-derived style (see `computeClassOnlyStyle`) - a single upfront
 * pass over the WHOLE fragment via `querySelectorAll('[class]')`, not just
 * the elements that end up becoming their own CanvasNode. This matters
 * because some converted branches (button/a, image, video, table) don't
 * recurse into their own descendants when building the node tree - an
 * icon `<span class="icon">` inside `<button><span class="icon">★</span>
 * Click</button>`, for instance, never gets its own CanvasNode, but its
 * class still needs a `content.css` entry. First occurrence (document
 * order) wins for a given class name. */
function collectAllClassStyles(root: Element, rules: CssRule[]): Map<string, ElementStyles> {
	const classStyles = new Map<string, ElementStyles>()
	const candidates = root.hasAttribute('class') ? [root, ...Array.from(root.querySelectorAll('[class]'))] : Array.from(root.querySelectorAll('[class]'))
	for (const el of candidates) {
		const className = el.getAttribute('class')?.trim().split(/\s+/)[0]
		if (className && !classStyles.has(className)) {
			classStyles.set(className, computeClassOnlyStyle(el, rules))
		}
	}
	return classStyles
}

/** Recognizes a handful of very common inline `onclick` patterns (jQuery or
 * plain DOM) that drive a single, obvious visual action against one other
 * element by id - NOT a general JS interpreter. Anything else (custom
 * logic, multiple actions chained, selectors other than #id/getElementById)
 * is left unrecognized and dropped, matching this converter's existing
 * "never silently guess" stance for the rest of the CSS/HTML conversion. */
function detectOnclickInteraction(onclick: string): { action: PrototypeActionType; targetId: string } | null {
	const idMatch =
		onclick.match(/getElementById\(\s*['"]([\w-]+)['"]\s*\)/) ||
		onclick.match(/querySelector\(\s*['"]#([\w-]+)['"]\s*\)/) ||
		onclick.match(/\$\(\s*['"]#([\w-]+)['"]\s*\)/) ||
		onclick.match(/location\.(?:hash|href)\s*=\s*['"]#([\w-]+)['"]/)
	if (!idMatch) return null
	const targetId = idMatch[1]

	if (/scrollIntoView|\.offset\(\s*\)\s*\.top|location\.(?:hash|href)\s*=/.test(onclick)) {
		return { action: 'scrollTo', targetId }
	}
	if (/classList\.toggle|toggleClass|\.toggle\(\s*\)/.test(onclick)) {
		return { action: 'toggle', targetId }
	}
	if (/\.hide\(\s*\)|display\s*[:=]\s*['"]none['"]/.test(onclick)) {
		return { action: 'hide', targetId }
	}
	if (/\.show\(\s*\)|style\.display\s*=\s*['"](?!none)/.test(onclick)) {
		return { action: 'show', targetId }
	}
	return null
}

/** Walks the converted tree resolving each pending interaction's target
 * HTML id to the generated CanvasNode id that ended up with that id in its
 * `attributes.id` (see `sourceAttributes`), and groups them into this app's
 * own `AnimationEntry[]` shape (stored on the root node's `.animation`,
 * exactly like the Animation panel's own click-to-trigger effects - see
 * scrollToInteraction.utils.ts). Interactions whose target id doesn't
 * survive conversion (e.g. it was only on a <script>/<style> element) are
 * dropped rather than guessed. */
function primaryClassName(node: CanvasNode): string | undefined {
	const className = (node as { attributes?: { className?: string } }).attributes?.className
	return className?.trim().split(/\s+/)[0] || undefined
}

/** Splits resolved interactions two ways: one whose triggering element has
 * a class goes into `js[className]` (shared - every node with that class
 * gets the same behavior, editable via the class's own JS controller);
 * one on a classless element falls back to a plain per-node `animations`
 * entry (the app's existing content.animation, unchanged), since there's
 * nowhere class-based to put it. */
function resolveInteractions(nodes: CanvasNode[], pending: PendingInteraction[]): { animations: AnimationEntry[]; js: Record<string, JsClassRule> } {
	if (pending.length === 0) return { animations: [], js: {} }

	const idBySourceId = new Map<string, string>()
	const classNameByNodeId = new Map<string, string>()
	function collectIds(node: CanvasNode) {
		const sourceId = (node as { attributes?: { id?: string } }).attributes?.id
		if (sourceId) idBySourceId.set(sourceId, node.id)
		const className = primaryClassName(node)
		if (className) classNameByNodeId.set(node.id, className)
		const children = (node as { children?: unknown }).children
		if (Array.isArray(children)) {
			for (const child of children as CanvasNode[]) collectIds(child)
		}
	}
	nodes.forEach(collectIds)

	const byNodeId = new Map<string, AnimationEntry>()
	const byClassName = new Map<string, JsClassRule>()
	for (const interaction of pending) {
		const targetNodeId = idBySourceId.get(interaction.targetSourceId)
		if (!targetNodeId) continue

		const effect = {
			animation_type: interaction.action,
			targetNodeId,
			...(interaction.action === 'scrollTo' ? { scrollBehavior: 'smooth' as const } : {}),
		}

		const className = classNameByNodeId.get(interaction.nodeId)
		if (className) {
			let rule = byClassName.get(className)
			if (!rule) {
				rule = { trigger_effect: [{ trigger: 'active', effects: [] }] }
				byClassName.set(className, rule)
			}
			rule.trigger_effect[0].effects.push(effect)
			continue
		}

		let entry = byNodeId.get(interaction.nodeId)
		if (!entry) {
			entry = { id: interaction.nodeId, trigger_effect: [{ trigger: 'active', effects: [] }] }
			byNodeId.set(interaction.nodeId, entry)
		}
		entry.trigger_effect[0].effects.push(effect)
	}
	return { animations: Array.from(byNodeId.values()), js: Object.fromEntries(byClassName) }
}

function convertElementBase(el: Element, rules: CssRule[], ctx: ConversionContext): CanvasNode | null {
	const tag = el.tagName.toLowerCase()
	const styles = computeElementStyle(el, rules)
	const style = styles.desktop
	const responsiveStyle = buildResponsiveStyle(styles)

	if (tag === 'img') {
		const src = el.getAttribute('src') || ''
		return {
			id: generateCryptoUID(),
			type: 'content',
			contentType: 'image',
			style,
			...responsiveStyle,
			// Production render (Elements.tsx) reads `children` for the <img> src;
			// the editor canvas and ImagePanel's URL field read the top-level
			// `src` - both need the same value to work everywhere.
			children: src,
			src,
			attributes: { alt: el.getAttribute('alt') || '', ...sourceAttributes(el) },
		} as unknown as CanvasNode
	}

	if (tag === 'a' || tag === 'button') {
		// Unlike text nodes, a ButtonNode's `children` is a plain label
		// string - not a JSON-encoded tiptap doc (see NEW_NODES.button in
		// defaultNodeStyle.ts).
		return {
			id: generateCryptoUID(),
			type: 'content',
			contentType: 'button',
			style,
			...responsiveStyle,
			attributes: { href: el.getAttribute('href') || '', ...sourceAttributes(el) },
			children: el.textContent?.trim() || 'Button',
		} as unknown as CanvasNode
	}

	if (tag === 'table') return convertTable(styles, el)

	if (tag === 'video') {
		// The src can be on the <video> itself or on a nested <source>.
		const src = el.getAttribute('src') || el.querySelector('source')?.getAttribute('src') || ''
		if (!src) return null
		return {
			id: generateCryptoUID(),
			type: 'content',
			contentType: 'video',
			style,
			...responsiveStyle,
			src,
			children: src,
			autoPlay: el.hasAttribute('autoplay'),
			loop: el.hasAttribute('loop'),
			muted: el.hasAttribute('muted') || el.hasAttribute('autoplay'),
			controls: el.hasAttribute('controls'),
			attributes: sourceAttributes(el),
		} as unknown as CanvasNode
	}

	if (tag === 'br' || tag === 'hr' || tag === 'script' || tag === 'style' || tag === 'source' || tag === 'track') return null

	const isLeafText = el.children.length === 0 && !!el.textContent?.trim()
	if (TEXT_TAGS.has(tag) || isLeafText) {
		return {
			id: generateCryptoUID(),
			type: 'content',
			contentType: 'text',
			style,
			...responsiveStyle,
			attributes: sourceAttributes(el),
			children: buildTextDoc(el.textContent?.trim() || '', style.color as string | undefined, style.fontFamily as string | undefined),
		} as unknown as CanvasNode
	}

	const children = Array.from(el.children)
		.map((child) => convertElement(child, rules, ctx))
		.filter((n): n is CanvasNode => n !== null)

	// section/header/footer are semantically page sections; everything else
	// (div, nav, article, aside, main, ul, ol, ...) is a generic block.
	const isSection = tag === 'section' || tag === 'header' || tag === 'footer'

	return {
		id: generateCryptoUID(),
		type: 'container',
		contentType: isSection ? 'section' : 'block',
		layout: 'column',
		style,
		...responsiveStyle,
		attributes: sourceAttributes(el),
		children,
	} as CanvasNode
}

/** Wraps `convertElementBase` to also detect a simple click-driven
 * interaction on the source element - either a `href="#id"` anchor or a
 * recognizable inline `onclick` handler (scrollIntoView/toggle/show/hide) -
 * and record it in `ctx.pending` for later resolution into this app's own
 * prototype-effect animation system (see `resolveInteractions`). Not a
 * general JS interpreter: only a small, explicitly documented set of very
 * common patterns is recognized: */
function convertElement(el: Element, rules: CssRule[], ctx: ConversionContext): CanvasNode | null {
	const node = convertElementBase(el, rules, ctx)
	if (!node) return null

	const onclick = el.getAttribute('onclick')
	let interaction = onclick ? detectOnclickInteraction(onclick) : null

	if (!interaction && el.tagName.toLowerCase() === 'a') {
		const href = el.getAttribute('href') || ''
		if (href.startsWith('#') && href.length > 1) {
			interaction = { action: 'scrollTo', targetId: href.slice(1) }
			// The animation entry below drives an editable, smooth scroll-to -
			// clear href so the browser's own instant hash-jump doesn't also fire.
			if ('attributes' in node && node.attributes && 'href' in node.attributes) {
				(node.attributes as { href?: string }).href = '#'
			}
		}
	}

	if (interaction) {
		ctx.pending.push({ nodeId: node.id, action: interaction.action, targetSourceId: interaction.targetId })
	}

	return node
}

/** A plain wrapper block (e.g. `<div id="page">`) whose only job is to hold
 * real page sections - `body > div > (header, section, section, footer)` is
 * a common real-world shape - would otherwise convert into one giant block
 * with those sections buried a level deep inside it, instead of each being
 * its own top-level page section. Unwraps one level at a time, carrying the
 * wrapper's own style (CSS custom properties, font-family, color, etc.)
 * down onto each promoted child first, so anything that depended on
 * inheriting from the wrapper still resolves correctly. */
function flattenWrapperSections(nodes: CanvasNode[]): CanvasNode[] {
	const result: CanvasNode[] = []
	for (const node of nodes) {
		const isBlock = 'contentType' in node && node.contentType === 'block'
		const children = isBlock && 'children' in node && Array.isArray(node.children) ? node.children as CanvasNode[] : null
		const hasSectionChild = children?.some((c) => 'contentType' in c && c.contentType === 'section')

		if (isBlock && children && hasSectionChild) {
			const promoted = children.map((c) => ({
				...c,
				style: { ...node.style, ...c.style },
				responsiveStyle: {
					tablet: { ...node.responsiveStyle?.tablet, ...c.responsiveStyle?.tablet },
					mobile: { ...node.responsiveStyle?.mobile, ...c.responsiveStyle?.mobile },
				},
			})) as CanvasNode[]
			result.push(...flattenWrapperSections(promoted))
		} else {
			result.push(node)
		}
	}
	return result
}

/** Turns the class styles collected during conversion into `content.css`'s
 * shape - each one's `responsiveStyle` only included when it actually has
 * tablet/mobile overrides, same convention `buildResponsiveStyle` uses for
 * nodes. */
function buildCssTree(classStyles: Map<string, ElementStyles>): Record<string, CssClassRule> {
	const css: Record<string, CssClassRule> = {}
	for (const [className, styles] of classStyles) {
		const responsive = buildResponsiveStyle(styles)
		css[className] = { style: styles.desktop, ...(responsive.responsiveStyle ? { responsiveStyle: responsive.responsiveStyle } : {}) }
	}
	return css
}

/** Converts a raw HTML string — a bare fragment or a full document (with
 * <html>/<head>/<body>) — into top-level `section` CanvasNodes, ready for
 * `canvas.insertSections(...)`, plus:
 * - `css`: every class name's own stylesheet-derived rule (see
 *   `computeClassOnlyStyle`) - merge onto the root node's `.css`, keyed by
 *   class name, so the property panel's class-aware controllers (see
 *   EditorContext's `syncClassStyle`) can edit them.
 * - `animations`/`js`: recognized click interactions (see
 *   `detectOnclickInteraction`/`resolveInteractions`) - `animations` merges
 *   onto the root's `.animation` (classless elements), `js` onto the root's
 *   `.js`, keyed by class name (classed elements).
 * External stylesheets (<link rel="stylesheet">) are never fetched — only
 * inline <style> blocks and style="" attributes are converted. */
export function htmlToCanvasSections(html: string): { sections: CanvasNode[]; animations: AnimationEntry[]; css: Record<string, CssClassRule>; js: Record<string, JsClassRule> } {
	// Extract ALL <style> block text (wherever they are - typically <head>
	// for a full document) before sanitizing - DOMPurify strips <style> tags
	// outright even with ADD_TAGS, so they'd never survive into the parsed
	// DOM otherwise.
	const styleText: string[] = []
	const withoutStyleTags = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
		styleText.push(css)
		return ''
	})

	// A full document's real content lives in <body> - <head> can contain
	// stray text (e.g. <title>) that DOMPurify's default (non-whole-document)
	// sanitize mode doesn't reliably keep out of the result. Extracting the
	// body explicitly makes this predictable for both a full document and a
	// bare fragment (which has no <body> tag, so this is a no-op).
	const bodyMatch = withoutStyleTags.match(/<body[^>]*>([\s\S]*)<\/body>/i)
	const bodyHtml = bodyMatch ? bodyMatch[1] : withoutStyleTags

	// onclick is kept through sanitizing purely so detectOnclickInteraction
	// can pattern-match its literal text below - it is never executed, and
	// never copied onto a converted node's own attributes.
	const sanitized = DOMPurify.sanitize(bodyHtml, { USE_PROFILES: { html: true }, ADD_ATTR: ['onclick'] })
	const doc = new DOMParser().parseFromString(sanitized, 'text/html').body.firstElementChild
	const rules = parseStyleRules(styleText.join('\n'))
	const ctx: ConversionContext = { pending: [] }

	const converted = doc ? flattenWrapperSections(
		Array.from(doc?.children)
			.map((el) => convertElement(el, rules, ctx))
			.filter((n): n is CanvasNode => n !== null)
	) : []

	// Every root.children entry in this app is a `section` wrapper holding
	// one real node - match that shape, but don't double-wrap when the
	// top-level element already converted to a section itself (a pasted
	// <section>/<header>/<footer> at the top level).
	const sections = converted.map((node) => {
		if ('contentType' in node && node.contentType === 'section') return node
		return {
			id: generateCryptoUID(),
			type: 'container',
			contentType: 'section',
			layout: 'column',
			style: { display: 'flex', flexDirection: 'column', width: '100%', height: 'fit-content', padding: '0.5em' },
			children: [node],
		} as CanvasNode
	})

	const { animations, js } = resolveInteractions(sections, ctx.pending)
	return { sections, animations, css: doc ? buildCssTree(collectAllClassStyles(doc, rules)) : {}, js }
}

/**
 * Same conversion as `htmlToCanvasSections`, but without the top-level
 * `section` wrapping — used for replacing a single focused node's children
 * (which already provides its own container), not the whole page.
 */
export function htmlToCanvasNode(html: string): { nodes: CanvasNode[]; animations: AnimationEntry[]; css: Record<string, CssClassRule>; js: Record<string, JsClassRule> } {
	const styleText: string[] = []
	const withoutStyleTags = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
		styleText.push(css)
		return ''
	})

	const bodyMatch = withoutStyleTags.match(/<body[^>]*>([\s\S]*)<\/body>/i)
	const bodyHtml = bodyMatch ? bodyMatch[1] : withoutStyleTags

	const sanitized = DOMPurify.sanitize(bodyHtml, { USE_PROFILES: { html: true }, ADD_ATTR: ['onclick'] })
	const doc = new DOMParser().parseFromString(sanitized, 'text/html').body.firstElementChild
	const rules = parseStyleRules(styleText.join('\n'))
	const ctx: ConversionContext = { pending: [] }



	const nodes = doc ? flattenWrapperSections(
		Array.from(doc?.children)
			.map((el) => convertElement(el, rules, ctx))
			.filter((n): n is CanvasNode => n !== null)
	) : []

	const { animations, js } = resolveInteractions(nodes, ctx.pending)

	// Class rules, merged into root.css by the caller - like htmlToCanvasSections (not the raw HTML,
	// whose characters would each become a root.css entry).
	return { nodes, animations, css: doc ? buildCssTree(collectAllClassStyles(doc, rules)) : {}, js }
}


/* HTML → JSON tree (raw CSS/JS mode).
 * Structure becomes real CanvasNodes, while <style>/<script> are kept as
 * plain strings (root.plainCss/plainJS) and styled through preserved
 * class/id attributes. */

export interface ImportedHtmlTree {
	root: LayoutNode
	css: string
	js: string
	/** Tag names that had no CanvasNode equivalent and were dropped, e.g. ['input', 'canvas']. */
	skipped: string[]
	/** Linked files that couldn't be included, e.g. ['styles.css', 'script.js']. */
	external: string[]
	/** Every stylesheet the HTML links (<link rel="stylesheet" href>), loaded or not, so it can be shown for review. */
	externalStyles?: string[]
	/** Every script file the HTML links (<script src>), loaded or not, so it can be shown for review. */
	externalScripts?: string[]
	/** What the Tailwind classes came to, when the HTML has any: how many were applied, which have no equivalent. */
	tailwind?: TailwindReport
}

export interface ExtractedDom {
	css: string
	js: string
	html: HTMLElement
	external: string[]
	externalStyles: string[]
	externalScripts: string[]
	tailwind: TailwindReport | null
	/** https/module/typed scripts kept for the sandbox (enable_import_page_scripts). */
	scripts: PageScript[]
	/** The <html> element's attributes (enable_import_html_attributes). */
	htmlAttributes?: Record<string, string>
}

const NON_CONTENT_TAGS = 'style, script, link, meta, title, base, noscript, template'

function parseDoc(html: string): Document {
	return new DOMParser().parseFromString(html, 'text/html')
}

/** All <style> text plus <link rel="stylesheet"> as @import, with every
 * @import hoisted to the top (it's ignored anywhere else in a sheet). */
function extractCssFromDoc(doc: Document): string {
	const linkImports = Array.from(doc.querySelectorAll('link[rel~="stylesheet"][href]'))
		.map((link) => link.getAttribute('href') || '')
		.filter((href) => /^(https?:)?\/\//i.test(href))
		.map((href) => `@import url("${href}");`)

	const styleCss = Array.from(doc.querySelectorAll('style')).map((s) => s.textContent ?? '').join('\n')
	const imports: string[] = []
	// Matches `@import ...;`, skipping quoted parts whole - a font URL can contain `;`.
	const rest = styleCss.replace(/@import\s+(?:"[^"]*"|'[^']*'|[^;"'])+;/gi, (rule) => {
		imports.push(rule)
		return ''
	})
	return [...linkImports, ...imports, rest].join('\n').trim()
}

/** Inline classic scripts only - external `src` scripts, modules and non-JS types
 * (JSON-LD, templates) are skipped. */
function extractJsFromDoc(doc: Document): string {
	return Array.from(doc.querySelectorAll('script'))
		.filter((s) => !s.hasAttribute('src'))
		.filter((s) => {
			const type = (s.getAttribute('type') || '').trim().toLowerCase()
			return !type || type === 'text/javascript' || type === 'application/javascript'
		})
		.map((s) => s.textContent ?? '')
		.filter((code) => code.trim())
		.join('\n;\n')
}

// An absolute https script address (protocol-relative too); a local path can't be loaded from here.
const LOADABLE_SCRIPT = /^(https:)?\/\/[^/]/i
const loadsScripts = () => !!editorConfig.enable_import_page_scripts

/** Stylesheets that won't be loaded (local paths, or sites outside the CSS allowlist)
 * and `src` scripts that aren't kept - their code isn't in the pasted HTML, so it has to be added by hand. */
function externalFilesFromDoc(doc: Document): string[] {
	const styles = Array.from(doc.querySelectorAll('link[rel~="stylesheet"][href]'))
		.map((link) => link.getAttribute('href') || '')
		.filter((href) => href && !isAllowedStylesheetUrl(href))
	const scripts = Array.from(doc.querySelectorAll('script[src]')).map((s) => (s.getAttribute('src') || '').trim())
		.filter((src) => src && !(loadsScripts() && LOADABLE_SCRIPT.test(src)))
	return Array.from(new Set([...styles, ...scripts]))
}

/** Every stylesheet and script file the HTML links, in page order, loadable or not: the "Code for review" dialog lists them. */
function linkedFilesFromDoc(doc: Document): { styles: string[]; scripts: string[] } {
	const unique = (list: string[]) => Array.from(new Set(list.map((value) => value.trim()).filter(Boolean)))
	return {
		styles: unique(Array.from(doc.querySelectorAll('link[rel~="stylesheet"][href]')).map((link) => link.getAttribute('href') || '')),
		scripts: unique(Array.from(doc.querySelectorAll('script[src]')).map((script) => script.getAttribute('src') || '')),
	}
}

/** Every script plainJS doesn't hold, in page order: https `src` scripts, modules, and typed blocks
 * (JSON-LD, templates) - like frontend-editor's doc.scripts. They run before plainJS in the sandbox. */
function pageScriptsFromDoc(doc: Document): PageScript[] {
	if (!loadsScripts()) return []
	return Array.from(doc.querySelectorAll('script')).flatMap((script): PageScript[] => {
		const type = (script.getAttribute('type') || '').trim().toLowerCase()
		const typed = type && type !== 'text/javascript' && type !== 'application/javascript' ? { type } : {}
		const src = (script.getAttribute('src') || '').trim()
		if (src) return LOADABLE_SCRIPT.test(src) ? [{ src, ...typed }] : []
		const code = script.textContent ?? ''
		// Classic inline code is plainJS.
		return 'type' in typed && code.trim() ? [{ code, type }] : []
	})
}

/** The <html> element's attributes (lang, dir, class="dark", data-theme...), never handlers or style. */
function htmlAttributesFromDoc(doc: Document): Record<string, string> | undefined {
	if (!editorConfig.enable_import_html_attributes) return undefined
	const attrs = Object.fromEntries(Array.from(doc.documentElement.attributes)
		.filter((attr) => /^[a-z][a-z0-9-]*$/i.test(attr.name) && !/^(on.*|style|xmlns.*)$/i.test(attr.name))
		.map((attr) => [attr.name.toLowerCase(), attr.value]))
	return Object.keys(attrs).length ? attrs : undefined
}

export function DomExtractor(html: string): ExtractedDom {
	const doc = parseDoc(html)
	// Tailwind classes become styles and interactions on their elements before anything else reads the document.
	const tailwind = applyTailwind(doc)
	const css = extractCssFromDoc(doc)
	const js = extractJsFromDoc(doc)
	const external = externalFilesFromDoc(doc)
	const linked = linkedFilesFromDoc(doc)
	const scripts = pageScriptsFromDoc(doc)
	const htmlAttributes = htmlAttributesFromDoc(doc)
	// Raw elements: <template> is kept as an element (its content is inert).
	doc.querySelectorAll(editorConfig.enable_import_raw_elements ? NON_CONTENT_TAGS.replace(', template', '') : NON_CONTENT_TAGS).forEach((el) => el.remove())
	return { css, js, html: doc.body, external, externalStyles: linked.styles, externalScripts: linked.scripts, tailwind, scripts, htmlAttributes }
}

export function extractCss(html: string): string {
	return extractCssFromDoc(parseDoc(html))
}

export function extractJs(html: string): string {
	return extractJsFromDoc(parseDoc(html))
}

export function extractHtml(html: string): HTMLElement {
	return DomExtractor(html).html
}

/* ---------- JS runtime wrapper ---------- */

/** Wraps imported JS for injection after the React page has rendered: its
 * own scope (so re-injection can't hit "already declared" errors),
 * DOMContentLoaded/load listeners fired immediately (those events are long
 * past by now), jQuery loaded first when the code uses `$`/`jQuery`, and
 * errors logged instead of breaking the page. */
export function buildImportedScript(js: string): string {
	if (!js.trim()) return ''
	const run = `function () {
	var d = document, w = window, dAdd = d.addEventListener, wAdd = w.addEventListener;
	function shim(orig, target) {
		return function (type, fn, opts) {
			if (type === 'DOMContentLoaded' || type === 'load') {
				setTimeout(function () { typeof fn === 'function' ? fn.call(target, new Event(type)) : fn && fn.handleEvent(new Event(type)) }, 0);
				return;
			}
			return orig.call(this, type, fn, opts);
		};
	}
	d.addEventListener = shim(dAdd, d);
	w.addEventListener = shim(wAdd, w);
	try {
		${ID_FALLBACK_SCRIPT}
		(function () {
${js}
		})();
	} catch (e) {
		console.error('[imported script]', e);
	} finally {
		d.addEventListener = dAdd;
		w.addEventListener = wAdd;
	}
}`
	if (!usesJquery(js)) return `setTimeout(${run}, 0);`
	// jQuery code expects the host page to provide jQuery - load it once, then run.
	return `(function () {
	var run = ${run};
	if (window.jQuery) { setTimeout(run, 0); return; }
	var s = document.querySelector('script[data-imported-jquery]');
	if (s) { s.addEventListener('load', run); return; }
	s = document.createElement('script');
	s.src = '${JQUERY_SRC}';
	s.integrity = '${JQUERY_INTEGRITY}';
	s.crossOrigin = 'anonymous';
	s.setAttribute('data-imported-jquery', '');
	s.onload = run;
	s.onerror = function () { console.error('[imported script] could not load jQuery'); };
	document.head.appendChild(s);
})();`
}

/* ---------- Tree conversion ---------- */

const SKIP_TAGS = new Set(['script', 'style', 'link', 'meta', 'title', 'base', 'noscript', 'template', 'head', 'source', 'track', 'wbr', 'param', 'br'])
// Real content with no CanvasNode equivalent - dropped and reported.
const UNSUPPORTED_TAGS = new Set(['input', 'select', 'textarea', 'canvas', 'audio', 'object', 'embed', 'dialog', 'progress', 'meter', 'output', 'map', 'area'])
// enable_import_raw_elements: like frontend-editor, only these are dropped - noscript too, as React would
// build its content (a tracking <img>) in the live editor; object/embed load plugins and other pages.
const RAW_SKIP_TAGS = new Set(['script', 'style', 'link', 'meta', 'title', 'base', 'head', 'param', 'noscript'])
const RAW_UNSUPPORTED_TAGS = new Set(['object', 'embed'])
const skipsTag = (tag: string) => (editorConfig.enable_import_raw_elements ? RAW_SKIP_TAGS : SKIP_TAGS).has(tag)
const unsupportedTag = (tag: string) => (editorConfig.enable_import_raw_elements ? RAW_UNSUPPORTED_TAGS : UNSUPPORTED_TAGS).has(tag)
const SECTION_TAGS = new Set(['header', 'section', 'footer', 'main'])
// A lone one of these directly in <body> is a page wrapper and becomes the root.
const ROOT_WRAPPER_TAGS = new Set(['div', 'main', 'article'])
// Tags TipTap has its own node for - fed to generateJSON as-is so the tag survives.
const TIPTAP_BLOCK_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre'])
const LIST_TAGS = new Set(['ul', 'ol'])
const PHRASING_TAGS = new Set([
	'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'del', 'dfn', 'em', 'i', 'ins',
	'kbd', 'mark', 'q', 's', 'samp', 'small', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'font',
])
const INTERACTIVE_TAGS = new Set(['a', 'button'])
// Always a block container (as are SECTION_TAGS) - text goes into text node children, never the other way round.
const BLOCK_TAGS = new Set(['div', 'span'])
// Text-only elements whose tag matters to their parent or to CSS (<details> needs a real <summary>,
// dl grids style dt/dd) - a block with that tag holding a text node, instead of a plain text node.
const TAGGED_TEXT_TAGS = new Set(['summary', 'dt', 'dd', 'figcaption', 'legend', 'label'])

interface TreeContext {
	css: string
	skipped: Set<string>
	/** Parsed stylesheet + its custom properties, for the text color fallback. */
	rules: CssRule[]
	vars: Record<string, string>
	/** Custom properties defined on :root (see rootVariableNames). */
	rootVars: Set<string>
}

const tagOf = (el: Element) => el.tagName.toLowerCase()
const isElement = (n: Node): n is Element => n.nodeType === Node.ELEMENT_NODE
const isText = (n: Node) => n.nodeType === Node.TEXT_NODE

/** Only text and inline formatting (no images, blocks, buttons...) anywhere inside. */
function isPhrasingOnly(nodes: ArrayLike<Node>): boolean {
	return Array.from(nodes).every((n) => {
		if (!isElement(n)) return true
		return PHRASING_TAGS.has(tagOf(n)) && isPhrasingOnly(n.childNodes)
	})
}

/** Has visible text that isn't inside a link/button - i.e. real prose, not a nav of links. */
function hasOwnText(nodes: ArrayLike<Node>): boolean {
	return Array.from(nodes).some((n) => {
		if (isText(n)) return !!n.textContent?.trim()
		if (!isElement(n) || INTERACTIVE_TAGS.has(tagOf(n))) return false
		return hasOwnText(n.childNodes)
	})
}

// Formatting TipTap gives back unchanged when bare (it only respells b/i/del as strong/em/s), and the
// link attributes it keeps. A class on a link isn't one: page classes get an lp- prefix TipTap's JSON misses.
const TIPTAP_FORMATTING = new Set(['b', 'strong', 'i', 'em', 'u', 's', 'del', 'strike', 'code', 'sub', 'sup', 'br', 'mark'])
const TIPTAP_LINK_ATTRS = new Set(['href', 'target', 'rel', 'title'])

/** Would TipTap keep this inline element exactly? From frontend-editor's survivesQuill. */
function survivesTiptap(el: Element): boolean {
	const names = Array.from(el.attributes).map((attr) => attr.name.toLowerCase())
	if (TIPTAP_FORMATTING.has(tagOf(el))) return names.length === 0
	if (tagOf(el) === 'a') return names.every((name) => TIPTAP_LINK_ATTRS.has(name))
	return false
}

/** Every element in these nodes survives TipTap (enable_import_lossless_text; always true when off). */
function tiptapSafe(nodes: ArrayLike<Node>): boolean {
	if (!editorConfig.enable_import_lossless_text) return true
	return Array.from(nodes).every((n) => !isElement(n) || (survivesTiptap(n) && tiptapSafe(n.childNodes)))
}

/** A list TipTap keeps whole: no attributes beyond what its wrapper carries, none on its items. */
function tiptapSafeList(list: Element): boolean {
	if (!editorConfig.enable_import_lossless_text) return true
	const own = Array.from(list.attributes).every((attr) => /^(class|id|style)$/i.test(attr.name))
	return own && Array.from(list.children).every((li) => li.attributes.length === 0 && tiptapSafe(li.childNodes))
}

/** A run of inline nodes reads as prose (one text node) unless it's only links/buttons. */
function isProse(nodes: ArrayLike<Node>): boolean {
	const list = Array.from(nodes)
	if (!list.some((n) => n.textContent?.trim()) || !isPhrasingOnly(list) || !tiptapSafe(list)) return false
	const hasInteractive = list.some((n) => isElement(n) && (INTERACTIVE_TAGS.has(tagOf(n)) || !!n.querySelector('a, button')))
	return hasOwnText(list) || !hasInteractive
}

/** `style=""` → React style object. `!important` can't be expressed inline in React, so it's dropped. */
function parseInlineStyle(el: Element): React.CSSProperties {
	const style: Record<string, string> = {}
	for (const [prop, decl] of Object.entries(parseDeclarations(el.getAttribute('style') || ''))) {
		style[toCamelCase(prop.toLowerCase())] = decl.value
	}
	return style as React.CSSProperties
}

// The page CSS of the conversion in progress (set by convertHtmlToJsonTree), for sizeAttributeStyle.
let pageRules: CssRule[] = []

/** True when a page rule (any screen size) that selects `el` sets `prop`. */
function pageCssSets(el: Element, prop: string): boolean {
	return selectorCandidates(pageRules, el).some(({ rule, selector }) => {
		if (!rule.declarations[prop]) return false
		try { return el.matches(selector) } catch { return false }
	})
}

/** width/height HTML attributes (img/video/iframe/svg) as a style fallback. Like in a browser, the page's
 * CSS beats them (`<img width="600">` with `.card img { width: 100% }`), so a size its CSS sets is left out;
 * the attribute itself is still kept (enable_import_all_attributes). */
function sizeAttributeStyle(el: Element): React.CSSProperties {
	const toCss = (v: string | null) => (v ? (/^\d+(\.\d+)?$/.test(v) ? `${v}px` : v) : undefined)
	const width = pageCssSets(el, 'width') ? undefined : toCss(el.getAttribute('width'))
	const height = pageCssSets(el, 'height') ? undefined : toCss(el.getAttribute('height'))
	return { ...(width ? { width } : {}), ...(height ? { height } : {}) }
}

// Font sizes of the page being converted (set for one convertHtmlToJsonTree call), so px/rem
// become em relative to the right font size. See unitConversion.ts.
let unitContext: UnitContext | null = null

function nodeStyle(el: Element, withSizeAttrs = false): React.CSSProperties {
	return styleToEm({ ...(withSizeAttrs ? sizeAttributeStyle(el) : {}), ...parseInlineStyle(el) }, el, unitContext)
}

function linkAttributes(el: Element): { href?: string; target?: string } {
	const href = el.getAttribute('href') || ''
	const target = el.getAttribute('target') || undefined
	const safeHref = /^\s*javascript:/i.test(href) ? '' : href
	return { ...(safeHref ? { href: safeHref } : {}), ...(target ? { target } : {}) }
}

/** Layout hint for the property panel, read from inline style only. */
function detectLayout(style: React.CSSProperties): 'row' | 'column' | 'grid' {
	if (style.display === 'grid' || style.display === 'inline-grid') return 'grid'
	if ((style.display === 'flex' || style.display === 'inline-flex') && !String(style.flexDirection || 'row').startsWith('column')) return 'row'
	return 'column'
}

// Building the schema from the extensions is the costly part of TipTap's generateJSON, so it's built once.
let textSchema: Schema | null = null

function generateTextJson(html: string): Record<string, any> {
	textSchema ??= getSchema(extensions)
	return ProseMirrorParser.fromSchema(textSchema).parse(elementFromString(html)).toJSON()
}

function toTextDoc(html: string, fallbackText: string): string {
	try {
		const doc = generateTextJson(html)
		if (doc?.content?.length) return JSON.stringify(doc)
	} catch (e) {
		console.warn('[htmlToJsonTree] falling back to plain text', e)
	}
	return buildTextDoc(fallbackText)
}

/** Serializes nodes without their wrapper's attributes (those live on the CanvasNode). */
// Inline tags TipTap has no mark for: it drops them, and their inline style with them.
const UNMARKED_INLINE = new Set(['small', 'big', 'time', 'cite', 'abbr', 'dfn', 'kbd', 'samp', 'var', 'data', 'q', 'bdi', 'bdo', 'font', 'ins'])

const toCssText = (style: React.CSSProperties) =>
	Object.entries(style).map(([k, v]) => `${k.startsWith('--') ? k : k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}: ${v}`).join('; ')

/** A style TipTap's text-style marks read correctly: it misreads a `font` shorthand (taking the weight
 * for a line height), and its bold mark takes any weight from 500 up, so only real bold stays. */
function markFriendlyStyle(style: React.CSSProperties): React.CSSProperties {
	const out: Record<string, unknown> = { ...style }
	const isBold = (w: unknown) => /^(bold|bolder|[7-9]00)$/i.test(String(w ?? '').trim())
	if (typeof out.font === 'string') {
		const parts = splitFontShorthand(out.font)
		delete out.font
		if (parts) {
			out.fontSize = parts.size
			if (parts.lineHeight) out.lineHeight = parts.lineHeight
			if (parts.after) out.fontFamily = parts.after
			if (parts.before.split(/\s+/).some(isBold)) out.fontWeight = 'bold'
		}
	}
	if (out.fontWeight !== undefined && !isBold(out.fontWeight)) delete out.fontWeight
	return out as React.CSSProperties
}

function innerHtmlOf(nodes: ArrayLike<Node>): string {
	// Built in the pasted page's own (inert) document: in the live page, <img>s would start loading.
	const holder = (nodes[0]?.ownerDocument ?? document).createElement('div')
	Array.from(nodes).forEach((n) => holder.appendChild(n.cloneNode(true)))
	// `<small style="font: 10px Inter; color: gray">` becomes a styled <span>, which TipTap keeps as a
	// text style (size, color). Its px become em against the source element's own parent.
	const sources = Array.from(nodes).flatMap((n) => (isElement(n) ? [n, ...Array.from(n.querySelectorAll('*'))] : []))
	const copies = Array.from(holder.querySelectorAll('*'))
	copies.forEach((copy, i) => {
		const source = sources[i]
		if (!source || !UNMARKED_INLINE.has(tagOf(copy)) || !copy.getAttribute('style')) return
		const span = holder.ownerDocument.createElement('span')
		span.setAttribute('style', toCssText(markFriendlyStyle(styleToEm(parseInlineStyle(source), source, unitContext))))
		span.append(...Array.from(copy.childNodes))
		copy.replaceWith(span)
	})
	return holder.innerHTML
}

/* ---------- Text color fallback ---------- */

const DEFAULT_TEXT_COLOR = '#ffffff'

const SELECTOR_SPECIFICITY = (selector: string) =>
	(selector.match(/#[\w-]+/g) || []).length * 10000
	+ (selector.match(/\.[\w-]+|\[[^\]]*\]|:(?!:)[\w-]+/g) || []).length * 100
	+ (selector.match(/(^|[\s>+~(])[a-zA-Z][\w-]*/g) || []).length

/** The color an element sets itself - style="" or a matching (desktop, non-pseudo) stylesheet rule.
 * `null` when it only inherits one. */
function ownColor(el: Element, ctx: TreeContext): { value: string; fromCss: boolean } | null {
	const inline = parseDeclarations(el.getAttribute('style') || '').color
	let best: { value: string; important: boolean; specificity: number; order: number } | null = null
	for (const { rule, selector } of selectorCandidates(ctx.rules, el)) {
		const decl = rule.declarations.color
		if (!decl || rule.breakpoint) continue
		if (/::|:(hover|active|focus|focus-visible|focus-within|visited|before|after)(?![\w-])/i.test(selector)) continue
		let matches = false
		try { matches = el.matches(selector) } catch { /* invalid selector */ }
		if (!matches) continue
		const candidate = { value: decl.value, important: decl.important, specificity: SELECTOR_SPECIFICITY(selector), order: rule.order }
		// !important first, then specificity, then source order.
		const better = !best
			|| (candidate.important !== best.important ? candidate.important
				: candidate.specificity !== best.specificity ? candidate.specificity > best.specificity
					: candidate.order > best.order)
		if (better) best = candidate
	}
	// Inline wins over normal rules; an !important rule wins over normal inline.
	if (inline && !(best?.important && !inline.important)) return { value: colorValue(inline.value, ctx), fromCss: false }
	if (best) return { value: colorValue(best.value, ctx), fromCss: true }
	return null
}

// Every var(--name) reference in a value.
const VAR_NAMES = /var\(\s*(--[\w-]+)/g

/** A color that only uses :root variables stays `var(--ink)` - those are always defined, and the
 * page's own theme switch (dark mode) keeps working. Anything else is resolved to its value. */
function colorValue(value: string, ctx: TreeContext): string {
	const names = [...value.matchAll(VAR_NAMES)].map((m) => m[1])
	if (names.length && names.every((name) => ctx.rootVars.has(name))) return value.trim()
	return resolveVarReferences(value, ctx.vars)
}

/** Nearest color set on `el` or one of its ancestors, else white. */
function inheritedColor(el: Element | null, ctx: TreeContext): string {
	for (let current = el; current; current = current.parentElement) {
		const color = ownColor(current, ctx)
		if (color && !/^(inherit|currentcolor|unset|initial)$/i.test(color.value)) return color.value
	}
	return DEFAULT_TEXT_COLOR
}

/** `color` is the inherited fallback, only passed when the text sets no color of its own.
 * It goes on the node's style, not a textStyle mark - a mark renders as a <span> inside the <p>. */
/** `source`: the tag this text came from (h2, p, ul...), or 'plain' for any other element. */
function textNode(html: string, plainText: string, style: React.CSSProperties, attributes: Record<string, string | undefined>, color?: string, source = 'plain'): CanvasNode {
	return {
		id: generateCryptoUID(),
		type: 'content',
		contentType: 'text',
		style: color ? { ...style, color } : style,
		attributes: { ...attributes, [IMPORTED_TEXT_ATTR]: source },
		children: toTextDoc(html, plainText),
	} as unknown as CanvasNode
}

function convertTextElement(el: Element, ctx: TreeContext): CanvasNode {
	const tag = tagOf(el)
	const inner = innerHtmlOf(el.childNodes)
	// Keep h1-h6/p/blockquote/pre/lists as real tags so tag selectors in the imported CSS still match.
	const isBlockTag = TIPTAP_BLOCK_TAGS.has(tag) || LIST_TAGS.has(tag)
	const html = isBlockTag ? `<${tag}>${inner}</${tag}>` : `<p>${inner}</p>`
	// Its own color (inline or from its CSS) is left alone; otherwise it takes the parent's, or white.
	const color = ownColor(el, ctx) ? undefined : inheritedColor(el.parentElement, ctx)
	return textNode(html, el.textContent?.trim() || '', nodeStyle(el), sourceAttributes(el), color, isBlockTag ? tag : 'plain')
}

function imageNode(src: string, el: Element, extraAttrs: Record<string, string | undefined> = {}): CanvasNode {
	return {
		id: generateCryptoUID(),
		type: 'content',
		contentType: 'image',
		style: nodeStyle(el, true),
		children: src,
		src,
		attributes: { alt: el.getAttribute('alt') || '', ...sourceAttributes(el), ...extraAttrs },
	} as unknown as CanvasNode
}

function imgSrc(img: Element): string {
	const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset') || ''
	return img.getAttribute('src') || img.getAttribute('data-src') || srcset.split(',')[0]?.trim().split(/\s+/)[0] || ''
}

/** Inline <svg> → image node with a data URI (xmlns is required for that to render).
 * var() in its attributes is resolved first - inside an <img> the page's variables don't exist. */
/** Like colorValue: :root variables stay live (the page's dark theme recolors the svg), with their
 * value as a fallback for where the svg is drawn as an <img>. */
function svgColorValue(value: string, ctx: TreeContext): string {
	const kept = colorValue(value, ctx)
	if (!kept.includes('var(')) return kept
	return kept.replace(/var\(\s*(--[\w-]+)\s*\)/g, (ref, name: string) => {
		const resolved = resolveVarReferences(ref, ctx.vars)
		return resolved.includes('var(') ? ref : `var(${name}, ${resolved})`
	})
}

const SVG_NODE_ATTRIBUTE = /^(className|id|alt|role|title|tabIndex|data-.*|aria-.*)$/

function convertSvg(svg: Element, ctx: TreeContext): CanvasNode {
	const clone = svg.cloneNode(true) as Element
	if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
	for (const el of [clone, ...Array.from(clone.querySelectorAll('*'))]) {
		for (const attr of Array.from(el.attributes)) {
			if (attr.value.includes('var(')) el.setAttribute(attr.name, svgColorValue(attr.value, ctx))
		}
	}
	const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(clone.outerHTML)}`
	// Marks it so the sandbox (where page JS runs) puts the live <svg> back - scripts reach into it by id.
	const node = imageNode(src, svg, { alt: svg.getAttribute('aria-label') || '', [INLINE_SVG_ATTR]: 'inline' })
	// viewBox, fill, width... belong to the svg markup, which keeps them - not to the node around it.
	const attrs = (node.attributes ?? {}) as Record<string, string>
	node.attributes = Object.fromEntries(Object.entries(attrs).filter(([key]) => SVG_NODE_ATTRIBUTE.test(key))) as typeof node.attributes
	return node
}

function convertIframe(el: Element): CanvasNode | null {
	const url = el.getAttribute('src') || ''
	if (!url) return null
	const contentType = /youtube(-nocookie)?\.com|youtu\.be/i.test(url) ? 'youtube'
		: /vimeo\.com/i.test(url) ? 'vimeo'
			: /google\.[^/]+\/maps|maps\.google\./i.test(url) ? 'googleMap'
				: 'html'
	return {
		id: generateCryptoUID(),
		type: 'content',
		contentType,
		style: nodeStyle(el, true),
		url,
		attributes: sourceAttributes(el),
	} as unknown as CanvasNode
}

function convertVideo(el: Element): CanvasNode | null {
	const src = el.getAttribute('src') || el.querySelector('source')?.getAttribute('src') || ''
	if (!src) return null
	return {
		id: generateCryptoUID(),
		type: 'content',
		contentType: 'video',
		style: nodeStyle(el, true),
		src,
		children: src,
		autoPlay: el.hasAttribute('autoplay'),
		loop: el.hasAttribute('loop'),
		muted: el.hasAttribute('muted') || el.hasAttribute('autoplay'),
		controls: el.hasAttribute('controls'),
		attributes: sourceAttributes(el),
	} as unknown as CanvasNode
}

function convertImportedTable(el: Element): CanvasNode {
	const rows = Array.from(el.querySelectorAll('tr')).map((tr) => ({
		type: 'tableRow',
		content: Array.from(tr.children).filter((c) => /^t[hd]$/i.test(c.tagName)).map(tableCellNode),
	}))
	return {
		id: generateCryptoUID(),
		type: 'content',
		contentType: 'table',
		// Borderless + empty head/body styles so the imported CSS drives the look.
		uiType: 'minimalBorderless',
		tableHeadStyle: {},
		tableBodyStyle: {},
		// width/height attributes included, like img/video/iframe (cells can't take em - see tableCellNode).
		style: nodeStyle(el, true),
		attributes: sourceAttributes(el),
		children: { type: 'doc', content: [{ type: 'table', content: rows }, { type: 'paragraph', attrs: { textAlign: null } }] },
	} as unknown as CanvasNode
}

function buttonNode(el: Element): CanvasNode {
	const label = el.textContent?.replace(/\s+/g, ' ').trim()
		|| el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('value') || 'Button'
	return {
		id: generateCryptoUID(),
		type: 'content',
		contentType: 'button',
		style: nodeStyle(el),
		attributes: { ...sourceAttributes(el), ...linkAttributes(el) },
		children: label,
		tag: tagOf(el) === 'button' ? 'button' : 'a',
	} as unknown as CanvasNode
}

function containerNode(el: Element, children: CanvasNode[], extraAttrs: Record<string, string | undefined> = {}): LayoutNode {
	const style = nodeStyle(el)
	// Text in an inline-level element (`<span>Label</span>`, `<li>`, `<button>`) is inline in the source: it sits on a
	// line box sized by the surrounding font (and on a list marker's line). A block text wrapper would drop that line.
	if (editorConfig.enable_import_lossless_text && INLINE_TEXT_PARENTS.has(tagOf(el))) {
		for (const child of children) {
			if (child.contentType === 'text') child.attributes = { ...(child.attributes ?? {}), [INLINE_PIECE_ATTR]: '' } as unknown as typeof child.attributes
		}
	}
	return {
		id: generateCryptoUID(),
		type: 'container',
		contentType: 'block',
		layout: detectLayout(style),
		style,
		attributes: { ...sourceAttributes(el), ...(tagOf(el) === 'form' ? { [FORM_ATTR]: '' } : {}), ...extraAttrs },
		children,
		// Still a block node, but renders as its source tag (nav, ul, li, span...) so tag
		// CSS rules and inline layout keep working. Anything off the allowlist renders as <div>.
		...(tagOf(el) !== 'div' && isContainerTag(tagOf(el)) ? { tag: tagOf(el) } : {}),
	} as LayoutNode
}

const FORM_FIELD_TAGS = new Set(['input', 'select', 'textarea'])
// <input> types that are buttons, not fields.
const BUTTON_INPUT_TYPES = new Set(['submit', 'button', 'reset'])

/** <input>/<select>/<textarea> -> a form field node that renders as that element (a button-like input -> button node). */
function convertFormField(el: Element): CanvasNode | null {
	const tag = tagOf(el) as 'input' | 'select' | 'textarea'
	const type = (el.getAttribute('type') || 'text').toLowerCase()
	if (tag === 'input' && (type === 'hidden' || type === 'image')) return null
	if (tag === 'input' && BUTTON_INPUT_TYPES.has(type)) {
		return { ...buttonNode(el), children: el.getAttribute('value') || (type === 'reset' ? 'Reset' : 'Submit'), tag: 'button' } as unknown as CanvasNode
	}
	const attr = (name: string) => el.getAttribute(name) ?? undefined
	const options = tag === 'select'
		? Array.from(el.querySelectorAll('option')).map((o) => ({
			value: o.getAttribute('value') ?? (o.textContent || '').trim(),
			label: (o.textContent || '').trim(),
			...(o.hasAttribute('selected') ? { selected: true } : {}),
			...(o.hasAttribute('disabled') ? { disabled: true } : {}),
		}))
		: undefined
	const field = {
		...(tag === 'input' ? { type } : {}),
		name: attr('name'),
		placeholder: attr('placeholder'),
		value: tag === 'textarea' ? (el.textContent ?? '') || undefined : attr('value'),
		...(el.hasAttribute('checked') ? { checked: true } : {}),
		...(el.hasAttribute('required') ? { required: true } : {}),
		rows: tag === 'textarea' && attr('rows') ? Number(attr('rows')) : undefined,
		autoComplete: attr('autocomplete'),
		options,
	}
	return {
		id: generateCryptoUID(),
		type: 'content',
		contentType: 'formField',
		name: `${tag === 'input' ? type : tag} field`,
		tag,
		field: Object.fromEntries(Object.entries(field).filter(([, v]) => v !== undefined)),
		style: nodeStyle(el, true),
		// The field's own data covers these; as attributes, value/checked would lock the element in React.
		attributes: Object.fromEntries(Object.entries(sourceAttributes(el)).filter(([key]) => !FIELD_OWN_ATTRIBUTES.has(key))),
	} as unknown as CanvasNode
}

const FIELD_OWN_ATTRIBUTES = new Set(['type', 'name', 'placeholder', 'value', 'checked', 'required', 'rows', 'autoComplete', 'selected', 'multiple'])

/** a/button: plain label → button node, a > img → linked image, anything richer → linked block. */
function convertInteractive(el: Element, ctx: TreeContext): CanvasNode | null {
	const lossless = editorConfig.enable_import_lossless_text
	// Lossless: a button node's label is plain text, so only plain text (not empty, not tags) becomes one.
	const plainLabel = Array.from(el.childNodes).every(isText) && !!el.textContent?.trim()
	if (lossless ? plainLabel : tagOf(el) === 'button' || isPhrasingOnly(el.childNodes)) return buttonNode(el)

	const meaningful = Array.from(el.childNodes).filter((n) => isElement(n) || n.textContent?.trim())
	const only = meaningful.length === 1 && isElement(meaningful[0]) ? meaningful[0] : null
	if (only && tagOf(only) === 'img') return imageNode(imgSrc(only), only, { ...linkAttributes(el), className: el.getAttribute('class') || only.getAttribute('class') || undefined })

	const children = convertChildNodes(el, ctx)
	if (!children.length && !lossless) return buttonNode(el)
	return containerNode(el, children, linkAttributes(el))
}

/** Converts one element (and its subtree) into a CanvasNode, or null when it has no equivalent. */
/** click:toggle-[#menu] names its target by the id attribute; now that the nodes exist, point it at the node's own id. Unknown targets are dropped. */
function resolveTailwindTargets(root: unknown): void {
	if (!twAnimations.length) return
	const byId = new Map<string, string>()
	const walk = (node: { id?: string; attributes?: { id?: string }; children?: unknown }) => {
		if (node.attributes?.id && node.id) byId.set(node.attributes.id, node.id)
		if (Array.isArray(node.children)) node.children.forEach((child) => walk(child as typeof node))
	}
	walk(root as Parameters<typeof walk>[0])
	for (const entry of twAnimations) {
		for (const trigger of entry.trigger_effect) {
			trigger.effects = trigger.effects.flatMap((effect) => {
				if (!effect.targetSourceId) return [effect]
				const target = byId.get(effect.targetSourceId)
				const { targetSourceId: _source, ...rest } = effect
				return target ? [{ ...rest, targetNodeId: target }] : []
			})
		}
		entry.trigger_effect = entry.trigger_effect.filter((trigger) => trigger.effects.length)
	}
	twAnimations = twAnimations.filter((entry) => entry.trigger_effect.length)
}

// The interactions (hover, active, on view, animate-*) the Tailwind classes gave to the nodes of the conversion in progress.
let twAnimations: { id: string; trigger_effect: TwTrigger[] }[] = []

/** The element's Tailwind tablet and mobile styles as the node's `responsiveStyle` (in em like the rest), and its interactions as an animation entry. */
function withResponsiveObjects(node: CanvasNode | null, el: Element): CanvasNode | null {
	if (!node) return node
	const { tablet, mobile, trigger_effect } = readTailwind(el)
	if (trigger_effect?.length) twAnimations.push({ id: node.id, trigger_effect })
	const hasTablet = !!tablet && Object.keys(tablet).length > 0
	const hasMobile = !!mobile && Object.keys(mobile).length > 0
	if (!hasTablet && !hasMobile) return node
	const responsive = {
		...(hasTablet ? { tablet: styleToEm(tablet, el, unitContext) } : {}),
		...(hasMobile ? { mobile: styleToEm(mobile, el, unitContext) } : {}),
	}
	return { ...node, responsiveStyle: { ...(node as { responsiveStyle?: object }).responsiveStyle, ...responsive } } as CanvasNode
}

function convertTreeElement(el: Element, ctx: TreeContext): CanvasNode | null {
	return withResponsiveObjects(convertTreeElementNode(el, ctx), el)
}

function convertTreeElementNode(el: Element, ctx: TreeContext): CanvasNode | null {
	const tag = tagOf(el)
	if (skipsTag(tag)) return null
	if (editorConfig.enable_form_field_import && FORM_FIELD_TAGS.has(tag)) return convertFormField(el)
	if (unsupportedTag(tag)) {
		ctx.skipped.add(tag)
		return null
	}
	const raw = editorConfig.enable_import_raw_elements

	switch (tag) {
		case 'img': {
			const src = imgSrc(el)
			return src ? imageNode(src, el) : raw ? rawElementNode(el, ctx) : null
		}
		case 'picture': {
			const img = el.querySelector('img')
			if (!img) return raw ? rawElementNode(el, ctx) : null
			return imageNode(imgSrc(img), img, el.getAttribute('class') && !img.getAttribute('class') ? { className: el.getAttribute('class')! } : {})
		}
		case 'svg':
			return convertSvg(el, ctx)
		case 'video':
			return convertVideo(el) ?? (raw ? rawElementNode(el, ctx) : null)
		case 'iframe':
			return convertIframe(el)
		case 'table':
			return convertImportedTable(el)
		case 'a':
		case 'button':
			return convertInteractive(el, ctx)
		case 'hr':
			return containerNode(el, [], {})
	}
	if (raw && RAW_ELEMENT_TAGS.has(tag)) return rawElementNode(el, ctx)

	const listsAsBlocks = !!editorConfig.enable_import_lists_as_blocks
	if (LIST_TAGS.has(tag)) {
		// A plain-text list stays one TipTap list (unless lists are blocks); a list of links/cards becomes blocks.
		const items = Array.from(el.children)
		if (!listsAsBlocks && items.length && items.every((li) => tagOf(li) === 'li' && isProse(li.childNodes)) && tiptapSafeList(el)) return convertTextElement(el, ctx)
	} else if (tag === 'li' && listsAsBlocks) {
		return listItemNode(el, ctx)
	} else if ((TAGGED_TEXT_TAGS.has(tag) || (tag === 'li' && editorConfig.enable_import_lossless_text)) && isProse(el.childNodes)) {
		const text = textNode(`<p>${innerHtmlOf(el.childNodes)}</p>`, el.textContent?.trim() || '', {}, {}, inheritedColor(el, ctx))
		return containerNode(el, [text])
	} else if (!BLOCK_TAGS.has(tag) && !SECTION_TAGS.has(tag) && isProse(el.childNodes)) {
		// Lossless: a tag TipTap has no node for (`<strong>`, `<small class>`, `<nav>`, `<my-badge>`) keeps its tag around its text.
		if (editorConfig.enable_import_lossless_text && !TIPTAP_BLOCK_TAGS.has(tag) && !INTERACTIVE_TAGS.has(tag)) return styledInlineNode(el, ctx)
		return convertTextElement(el, ctx)
	}

	// Empty elements stay too (`.menu-toggle span` bars), like frontend-editor's domToNodes.
	// A <p> holding nodes renders as a <div> (a real <p> would be split when the sandbox re-reads it);
	// marked like imported p text, the page's `p` rules and the p defaults still reach it.
	return containerNode(el, convertChildNodes(el, ctx), tag === 'p' && editorConfig.enable_import_lossless_text ? { [IMPORTED_TEXT_ATTR]: 'p' } : {})
}

/** enable_import_lists_as_blocks: an <li> is a block with its own tag, so items can be added, moved and
 * styled one by one. Its text stays inline, on the marker's line (`li::before` bullets too), like in the source. */
function listItemNode(el: Element, ctx: TreeContext): LayoutNode {
	const children = isProse(el.childNodes)
		? [textNode(`<p>${innerHtmlOf(el.childNodes)}</p>`, el.textContent?.trim() || '', {}, {}, inheritedColor(el, ctx))]
		: convertChildNodes(el, ctx)
	// containerNode marks its text inline (INLINE_TEXT_PARENTS); lists as blocks need that without lossless text too.
	if (!editorConfig.enable_import_lossless_text) {
		for (const child of children) {
			if (child.contentType === 'text') child.attributes = { ...(child.attributes ?? {}), [INLINE_PIECE_ATTR]: '' } as unknown as typeof child.attributes
		}
	}
	return containerNode(el, children)
}

// Inline-level source tags whose text stays inline (see containerNode). Not `a`: a linked block wraps a <div>.
const INLINE_TEXT_PARENTS = new Set([...Array.from(PHRASING_TAGS).filter((tag) => tag !== 'a'), 'span', 'label', 'button', 'li'])

// Elements with no node type of their own, kept as a block with their real tag (enable_import_raw_elements).
const RAW_ELEMENT_TAGS = new Set(['br', 'wbr', 'canvas', 'audio', 'source', 'track', 'dialog', 'progress', 'meter', 'output', 'map', 'area', 'template'])

/** A block standing for the element itself: its tag, attributes and children (none for a void tag). */
function rawElementNode(el: Element, ctx: TreeContext): LayoutNode {
	if (VOID_TAGS.has(tagOf(el))) return containerNode(el, [])
	// <template> keeps its children in a separate (inert) fragment.
	const content = tagOf(el) === 'template' ? (el as HTMLTemplateElement).content : null
	if (!content) return containerNode(el, convertChildNodes(el, ctx))
	const holder = el.ownerDocument.createElement('div')
	holder.appendChild(content.cloneNode(true))
	return containerNode(el, convertChildNodes(holder, ctx))
}

/** Converts child nodes, grouping consecutive inline content (bare text + inline tags)
 * into one text node so mixed markup like `Hello <b>there</b><div>..</div>` isn't lost. */
function convertChildNodes(parent: Element, ctx: TreeContext): CanvasNode[] {
	// Loose text next to spans reads as one line in the source; its pieces stay inline (IMPORTED_TEXT_CSS).
	const children = Array.from(parent.childNodes)
	const inlineContext = children.some((n) => isText(n) && !!n.textContent?.trim())
		&& children.some((n) => isElement(n) && tagOf(n) === 'span')
	const result: CanvasNode[] = []
	let run: Node[] = []
	// In a line of text, whether a span sits right before / after the current run (for the spaces between them).
	let spanBefore = false

	const flushRun = (spanAfter = false) => {
		const nodes = run
		run = []
		if (!nodes.some((n) => n.textContent?.trim() || isElement(n))) return
		// Only inline elements (no loose text of their own), some styled by the page CSS - e.g.
		// `<small>Days</small>` or `<small>Deployment begins in</small><strong>Operation…</strong>`, with `.item small {}`:
		// each keeps its own tag, so those rules still match it. Real prose stays one text node.
		const elements = nodes.filter(isElement)
		const hasLooseText = nodes.some((n) => isText(n) && !!n.textContent?.trim())
		if (!hasLooseText && elements.length > 0 && elements.some((el) => matchesPageRule(el, ctx))) {
			for (const el of elements) {
				const converted = matchesPageRule(el, ctx) && !INTERACTIVE_TAGS.has(tagOf(el)) && isPhrasingOnly(el.childNodes)
					? styledInlineNode(el, ctx)
					: convertTreeElement(el, ctx)
				if (converted) result.push(converted)
			}
			return
		}
		// Loose text around inline tags TipTap would change (`Read <a id="t">terms</a>`, `<small class>`):
		// those tags become their own nodes, and the text pieces around them stay on the same line.
		if (hasLooseText && isPhrasingOnly(nodes) && !tiptapSafe(nodes)) {
			result.push(...inlinePieces(nodes, parent, ctx))
			return
		}
		if (isProse(nodes)) {
			const html = `<p>${innerHtmlOf(nodes)}</p>`
			const plain = nodes.map((n) => n.textContent || '').join('').trim()
			// A run that is a single element keeps that element's own class/style.
			const single = nodes.filter((n) => isElement(n) || n.textContent?.trim())
			if (single.length === 1 && isElement(single[0])) {
				// Lossless: the element keeps its own tag too (convertTreeElement -> styledInlineNode).
				result.push(editorConfig.enable_import_lossless_text ? convertTreeElement(single[0], ctx) ?? convertTextElement(single[0], ctx) : convertTextElement(single[0], ctx))
			} else {
				result.push(textNode(inlineContext ? keepEdgeSpaces(html, nodes, spanBefore, spanAfter) : html, plain, {}, {}, inheritedColor(parent, ctx)))
			}
			return
		}
		for (const n of nodes) {
			if (!isElement(n)) continue
			const converted = convertTreeElement(n, ctx)
			if (converted) result.push(converted)
		}
	}

	for (const child of children) {
		if (isText(child) || (isElement(child) && PHRASING_TAGS.has(tagOf(child)))) {
			run.push(child)
			continue
		}
		const isSpan = isElement(child) && tagOf(child) === 'span'
		flushRun(isSpan)
		spanBefore = isSpan
		if (!isElement(child)) continue
		const converted = convertTreeElement(child, ctx)
		if (converted) result.push(converted)
	}
	flushRun()
	if (inlineContext) {
		for (const node of result) {
			const isInlinePiece = node.contentType === 'text' || (node as LayoutNode).tag === 'span'
			if (isInlinePiece) node.attributes = { ...(node.attributes ?? {}), [INLINE_PIECE_ATTR]: '' } as unknown as typeof node.attributes
		}
	}
	return result
}

/** One line of text holding inline tags TipTap would change: each such tag is its own node (link -> button,
 * others keep their tag), the text between goes into text nodes, and all of them display inline. */
function inlinePieces(nodes: Node[], parent: Element, ctx: TreeContext): CanvasNode[] {
	const pieces: CanvasNode[] = []
	let run: Node[] = []
	let elementBefore = false
	const flushText = (elementAfter: boolean) => {
		const text = run
		run = []
		// A <br> ending the text is its own node: at a paragraph's end the editor adds a line after it.
		const breaks: Element[] = []
		while (editorConfig.enable_import_raw_elements) {
			let i = text.length - 1
			while (i >= 0 && isText(text[i]) && !text[i].textContent?.trim()) i--
			const last = text[i]
			if (!last || !isElement(last) || tagOf(last) !== 'br') break
			breaks.unshift(last)
			text.splice(i)
		}
		const plain = text.map((n) => n.textContent || '').join('')
		// Only a space between two tags: one non-breaking space keeps them apart.
		const html = plain.trim() ? keepEdgeSpaces(`<p>${innerHtmlOf(text)}</p>`, text, elementBefore, elementAfter && !breaks.length) : '<p>&nbsp;</p>'
		if (plain.trim() || (plain && elementBefore && elementAfter && !breaks.length)) pieces.push(textNode(html, plain.trim() || ' ', {}, {}, inheritedColor(parent, ctx)))
		breaks.forEach((br) => pieces.push(containerNode(br, [])))
	}
	for (const n of nodes) {
		if (!isElement(n) || (survivesTiptap(n) && tiptapSafe(n.childNodes))) {
			run.push(n)
			continue
		}
		flushText(true)
		const piece = convertTreeElement(n, ctx)
		if (piece) pieces.push(piece)
		elementBefore = true
	}
	flushText(false)
	for (const piece of pieces) piece.attributes = { ...(piece.attributes ?? {}), [INLINE_PIECE_ATTR]: '' } as unknown as typeof piece.attributes
	return pieces
}

/** TipTap trims the spaces at a paragraph's edges; where a text piece meets a span in one line
 * (`Secure your <span>deployment.</span>`), a non-breaking space keeps the words apart. */
function keepEdgeSpaces(html: string, nodes: Node[], spanBefore: boolean, spanAfter: boolean): string {
	const text = nodes.map((n) => n.textContent || '').join('')
	let out = html
	if (spanAfter && /\s$/.test(text)) out = out.replace(/\s*<\/p>$/, '&nbsp;</p>')
	if (spanBefore && /^\s/.test(text)) out = out.replace(/^<p>\s*/, '<p>&nbsp;')
	return out
}

/** True when a rule of the page CSS (any breakpoint, state pseudo-classes aside) selects this element. */
function matchesPageRule(el: Element, ctx: TreeContext): boolean {
	return selectorCandidates(ctx.rules, el).some(({ selector }) => {
		if (selector.includes('::') || selector.trim() === '*') return false
		try { return el.matches(selector) } catch { return false }
	})
}

/** An inline element the page CSS styles, as a block with its own tag (strong, small, time...) holding its text. */
function styledInlineNode(el: Element, ctx: TreeContext): CanvasNode {
	// No text (a CSS-drawn `.brand-mark`): an empty block, not an empty text node the editor would size.
	if (editorConfig.enable_import_lossless_text && !el.textContent?.trim()) return containerNode(el, convertChildNodes(el, ctx))
	const text = textNode(`<p>${innerHtmlOf(el.childNodes)}</p>`, el.textContent?.trim() || '', {}, {}, inheritedColor(el, ctx))
	return containerNode(el, [text])
}

/** True when the CSS (or inline style) could target this element - so unwrapping it would lose styling. */
function isStyledByCss(el: Element, css: string): boolean {
	if (el.getAttribute('style')) return true
	const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const classes = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean)
	const id = el.getAttribute('id')
	return classes.some((c) => new RegExp(`\\.${escape(c)}(?![\\w-])`).test(css))
		|| (!!id && new RegExp(`#${escape(id)}(?![\\w-])`).test(css))
}

/** An unstyled wrapper like `<div id="app">` around header/section/footer is
 * unwrapped so each becomes its own page section; a styled one is kept whole
 * so its CSS still applies. */
function expandWrapper(el: Element, css: string): Element[] {
	const tag = tagOf(el)
	// <main> is a landmark wrapper, not a section of its own.
	const isWrapper = (!SECTION_TAGS.has(tag) || tag === 'main') && !INTERACTIVE_TAGS.has(tag)
		&& Array.from(el.children).some((c) => SECTION_TAGS.has(tagOf(c)))
	if (!isWrapper || isStyledByCss(el, css)) return [el]
	return Array.from(el.children).flatMap((c) => expandWrapper(c, css))
}

// An untagged section renders as <section>; one made from a <div> (or loose content) keeps
// `div`, so page rules like `section { padding }` don't reach it.
function toSection(node: CanvasNode): LayoutNode {
	if (node.type === 'container' && node.contentType === 'block') {
		const block = node as LayoutNode
		return { ...block, contentType: 'section', tag: block.tag ?? 'div' } as LayoutNode
	}
	return {
		id: generateCryptoUID(),
		type: 'container',
		contentType: 'section',
		layout: 'column',
		style: {},
		tag: 'div',
		children: [node],
	} as LayoutNode
}

/** Converts a parsed <body> into a single `root` node whose children are page sections.
 * `css` is the page's raw CSS, used to decide which wrappers are safe to unwrap. */
export function convertHtmlToJsonTree(body: HTMLElement, css = '', skipped: Set<string> = new Set(), units?: UnitContext): LayoutNode {
	const rules = parseStyleRules(css)
	const vars = collectCssVariables(rules, body.ownerDocument)
	unitContext = units ?? buildUnitContext(body.ownerDocument, rules, (value) => resolveVarReferences(value, vars))
	pageRules = rules
	try {
		return buildRoot(body, css, skipped, rules)
	} finally {
		unitContext = null
		pageRules = []
	}
}

// Page-level properties a `body {}` rule sets that the canvas root should show too.
const BODY_PROPS = ['background', 'background-color', 'background-image', 'color', 'font-family', 'font-size', 'line-height', 'letter-spacing']

/** What the page's CSS sets on <body> (desktop, no :hover etc.), for the root node: the page CSS
 * styles the editor's own <body>, not the canvas, so without this the canvas misses the page look. */
function bodyStyle(body: HTMLElement, ctx: TreeContext): React.CSSProperties {
	const picked: Record<string, { value: string; specificity: number; order: number; important: boolean }> = {}
	for (const rule of ctx.rules) {
		if (rule.breakpoint) continue
		for (const selector of rule.selectors) {
			if (hasUnsupportedPseudo(selector)) continue
			let matches = false
			try { matches = body.matches(selector) } catch { /* invalid selector */ }
			if (!matches) continue
			const specificity = SELECTOR_SPECIFICITY(selector)
			for (const prop of BODY_PROPS) {
				const decl = rule.declarations[prop]
				if (!decl) continue
				const current = picked[prop]
				const wins = !current || (decl.important !== current.important ? decl.important
					: specificity !== current.specificity ? specificity > current.specificity : rule.order > current.order)
				if (wins) picked[prop] = { value: decl.value, specificity, order: rule.order, important: decl.important }
			}
		}
	}
	return Object.fromEntries(Object.entries(picked).map(([prop, { value }]) => [toCamelCase(prop), colorValue(value, ctx)])) as React.CSSProperties
}

function buildRoot(body: HTMLElement, css: string, skipped: Set<string>, rules: CssRule[]): LayoutNode {
	const ctx: TreeContext = { css, skipped, rules, vars: collectCssVariables(rules, body.ownerDocument), rootVars: rootVariableNames(rules) }
	const sections: LayoutNode[] = []

	// Each element child becomes a section; bare text/inline runs get their own section.
	const addSections = (nodes: Node[]) => {
		let loose: Node[] = []
		const flushLoose = () => {
			// The pasted page's own document is inert - nothing in it loads or runs.
			const holder = body.ownerDocument.createElement('div')
			loose.forEach((n) => holder.appendChild(n.cloneNode(true)))
			loose = []
			convertChildNodes(holder, ctx).forEach((n) => sections.push(toSection(n)))
		}
		for (const child of nodes) {
			if (!isElement(child) || PHRASING_TAGS.has(tagOf(child))) {
				loose.push(child)
				continue
			}
			flushLoose()
			for (const el of expandWrapper(child, css)) {
				const node = convertTreeElement(el, ctx)
				if (node) sections.push(toSection(node))
			}
		}
		flushLoose()
	}

	// A lone page wrapper in <body> is the root; with several top-level elements
	// (skip link, header, main, footer...) <body> itself is.
	const topElements = Array.from(body.children).filter((el) => !SKIP_TAGS.has(tagOf(el)))
	const hasLooseText = Array.from(body.childNodes).some((n) => isText(n) && !!n.textContent?.trim())
	const loneWrapper = topElements.length === 1 && !hasLooseText && ROOT_WRAPPER_TAGS.has(tagOf(topElements[0]))
	const rootEl = loneWrapper ? topElements[0] : body
	if (rootEl !== body) addSections(Array.from(rootEl.childNodes))
	// Anything else directly in <body> (siblings after the root) is kept as extra sections.
	addSections(Array.from(body.childNodes).filter((n) => n !== rootEl))

	const rootTag = rootEl !== body ? tagOf(rootEl) : 'div'
	return {
		id: generateCryptoUID(),
		type: 'container',
		contentType: 'root',
		layout: 'column',
		// Tailwind classes on <body> (now in its style="") are the page look too, even when a wrapper is the root.
		style: { width: '81.5em', ...styleToEm({ ...bodyStyle(body, ctx), ...(rootEl !== body ? parseInlineStyle(body) : {}), ...parseInlineStyle(rootEl) }, rootEl, unitContext) },
		// Marks an imported page, so its tag defaults (importedBaseCss) apply inside it only.
		attributes: { ...sourceAttributes(rootEl), [IMPORTED_PAGE_ATTR]: '' },
		children: sections,
		...(rootTag !== 'div' && isContainerTag(rootTag) ? { tag: rootTag } : {}),
	} as LayoutNode
}

/** Full pipeline: raw HTML (document or fragment) → root node + raw CSS + raw JS.
 * Store css/js on the root as plainCss/plainJS; inject JS with buildImportedScript(). */
// The @import statements at the start of the page CSS (quoted URLs can hold `;`).
const LEADING_IMPORTS = /^(\s*@import\s+(?:"[^"]*"|'[^']*'|[^;"'])+;)+\s*/i

// Browser defaults for tags that Tailwind's reset and Judgify's site CSS change (headings lose
// their size/weight/color, lists their bullets). Only inside an imported page ([data-lp-page]);
// :where() keeps them at plain tag weight, so the page's own tag and class rules still win.
const BASE_DEFAULTS: [string[], Record<string, string>][] = [
	[['h1'], { color: 'inherit', 'font-size': '2em', 'font-weight': 'bold', 'margin-block': '0.67em' }],
	[['h2'], { color: 'inherit', 'font-size': '1.5em', 'font-weight': 'bold', 'margin-block': '0.83em' }],
	[['h3'], { color: 'inherit', 'font-size': '1.17em', 'font-weight': 'bold', 'margin-block': '1em' }],
	[['h4'], { color: 'inherit', 'font-size': '1em', 'font-weight': 'bold', 'margin-block': '1.33em' }],
	[['h5'], { color: 'inherit', 'font-size': '0.83em', 'font-weight': 'bold', 'margin-block': '1.67em' }],
	[['h6'], { color: 'inherit', 'font-size': '0.67em', 'font-weight': 'bold', 'margin-block': '2.33em' }],
	[['p', 'dl'], { 'margin-block': '1em' }],
	[['blockquote', 'figure'], { margin: '1em 40px' }],
	[['ul', 'ol'], { 'margin-block': '1em', 'padding-inline-start': '40px' }],
	[['ul'], { 'list-style': 'disc' }],
	[['ol'], { 'list-style': 'decimal' }],
	// The builder's own `li { list-style: none }` would stop items taking their list's marker.
	[['li'], { 'list-style': 'inherit' }],
	// Nested lists, as the browser draws them: no extra margin, circle then square bullets.
	[[':is(ul, ol) :is(ul, ol)'], { 'margin-block': '0' }],
	[[':is(ul, ol) ul'], { 'list-style': 'circle' }],
	[[':is(ul, ol) :is(ul, ol) ul'], { 'list-style': 'square' }],
	[['b', 'strong'], { 'font-weight': 'bolder' }],
	[['small'], { 'font-size': 'smaller' }],
	// Bootstrap (around the editor) makes dt bold, zeroes dd's indent and turns label inline-block.
	[['dt'], { 'font-weight': 'normal' }],
	[['dd'], { 'margin-inline-start': '40px' }],
	[['label'], { display: 'inline' }],
	// Tailwind's reset makes buttons inherit color and lose their face; a page may rely on the browser's.
	[['button'], { color: 'ButtonText', 'background-color': 'ButtonFace' }],
]

/** The property family a declaration belongs to (margin-top -> margin, font -> font-size...). */
const propFamilies = (prop: string): string[] => {
	if (prop.startsWith('margin')) return ['margin']
	if (prop.startsWith('padding')) return ['padding']
	if (prop.startsWith('list-style')) return ['list-style']
	if (prop === 'font') return ['font-size', 'font-weight']
	return [prop]
}

/** The tag defaults, minus what the page's own `*` rule sets: `* { margin: 0 }` beats a browser
 * default in the original, but would lose to these tag-weight rules, so those are left out. */
function importedBaseCss(rules: CssRule[]): string {
	const reset = new Set<string>()
	for (const rule of rules) {
		if (rule.breakpoint || !rule.selectors.some((sel) => sel.trim() === '*')) continue
		Object.keys(rule.declarations).forEach((prop) => propFamilies(prop).forEach((f) => reset.add(f)))
	}
	const lines = BASE_DEFAULTS.flatMap(([tags, decls]) => {
		const kept = Object.entries(decls).filter(([prop]) => !propFamilies(prop).some((f) => reset.has(f)))
		if (!kept.length) return []
		const body = `{ ${kept.map(([k, v]) => `${k}: ${v};`).join(' ')} }`
		const rules = [`${tags.map((t) => `:where([data-lp-page]) ${t}`).join(', ')} ${body}`]
		// The wrapper standing for an imported heading/paragraph, at zero weight (only host CSS competes).
		const wrapped = tags.filter((t) => TEXT_SOURCE_TAGS.has(t))
		if (wrapped.length) rules.push(`:where(${wrapped.map((t) => `[data-lp-page] [data-lp-text="${t}"]`).join(', ')}) ${body}`)
		return rules
	})
	// The page was written for the browser's default light scheme; the editor runs dark, which would
	// turn its system colors (a plain button's ButtonFace/ButtonText) dark too.
	// Line height too: the builder's Tailwind sets 1.5 on <html>; a page without its own (on body, copied to
	// the root, or in its `*` reset) was written for the browser's `normal`.
	const scheme = `:where([data-lp-page]) { color-scheme: light;${reset.has('line-height') ? '' : ' line-height: normal;'} }`
	return ['/* Judgify: browser defaults for imported pages */', scheme, ...lines].join('\n')
}

// An imported text node is a wrapper <div> (the source element: its class, style and the page rules
// for its tag) around TipTap's own <p>/<h2>... That inner element just inherits the wrapper's look,
// so a class's font size isn't applied twice. text-align is left out - the editor's align buttons
// set it on that inner element. A text list's wrapper stands for the <ul>/<ol>: the inner list
// only inherits its list style, and an item's lone TipTap <p> stays on the line of `li::before`.
// Text and spans that sat in one line of text (`Secure your <span>deployment.</span>`) stay inline.
const IMPORTED_TEXT_CSS = `/* Judgify: imported text takes its look from its wrapper */
[data-lp-text] :is(p, h1, h2, h3, h4, h5, h6, blockquote, pre) { margin: 0 !important; color: inherit !important; font-family: inherit !important; font-size: inherit !important; font-weight: inherit !important; font-style: inherit !important; line-height: inherit !important; letter-spacing: inherit !important; text-transform: inherit !important; }
:is([data-lp-text="ul"], [data-lp-text="ol"]) :is(ul, ol):not(li *) { margin: 0 !important; padding: 0 !important; list-style: inherit !important; }
:is([data-lp-text="ul"], [data-lp-text="ol"]) li > p:only-child { display: inline; }
:where([data-lp-inline]), :where([data-lp-inline]) :where(div, p) { display: inline; }`

// Tags whose imported text sits in a wrapper marked data-lp-text="<tag>" (see IMPORTED_TEXT_CSS).
const TEXT_SOURCE_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre', 'ul', 'ol'])
// A selector's last compound starting with one of those tags: `h2`, `h2.title`, `p:first-child`.
const TEXT_TAG_START = /^(h[1-6]|p|blockquote|pre|ul|ol)(?![\w-])/i

/** Page rules written for a text tag (`.about h2 {}`) also select the wrapper that stands for it. */
function alsoTargetTextWrappers(css: string): string {
	return mapSelectors(css, (list) => splitSelectorList(list).flatMap((selector) => {
		// The last compound: whatever follows the last top-level combinator.
		const match = selector.match(/^([\s\S]*[\s>+~])?([^\s>+~]+)\s*$/)
		const last = match?.[2] ?? ''
		const tag = last.match(TEXT_TAG_START)?.[1]?.toLowerCase()
		if (!tag || !TEXT_SOURCE_TAGS.has(tag)) return [selector]
		const lastOnly = `${match?.[1] ?? ''}[data-lp-text="${tag}"]${last.slice(tag.length)}`
		// `p + p`, `h2 ~ p`: the earlier compounds stand for imported text too, so one variant targets every one.
		const everyOne = wrapEveryTextCompound(selector).trim()
		return everyOne !== lastOnly.trim() ? [selector, lastOnly, everyOne] : [selector, lastOnly]
	}).join(','))
}

/** The selector with every compound that starts with a text tag pointed at its wrapper (outside brackets). */
function wrapEveryTextCompound(selector: string): string {
	let out = ''
	let depth = 0
	let atCompoundStart = true
	for (let i = 0; i < selector.length; i++) {
		const c = selector[i]
		if (c === '(' || c === '[') depth++
		else if (c === ')' || c === ']') depth--
		if (depth === 0 && atCompoundStart) {
			const tag = selector.slice(i).match(TEXT_TAG_START)?.[1]?.toLowerCase()
			if (tag && TEXT_SOURCE_TAGS.has(tag)) {
				out += `[data-lp-text="${tag}"]`
				i += tag.length - 1
				atCompoundStart = false
				continue
			}
		}
		atCompoundStart = depth === 0 && /[\s>+~]/.test(c)
		out += c
	}
	return out
}

/** An AI chat reply: the code inside its ```html fences, without the chatter around them.
 * Input that already starts as markup is left alone. From frontend-editor's cleanPaste. */
export function stripCodeFences(input: string): string {
	if (/^\s*</.test(input)) return input
	const fences = [...input.matchAll(/```([\w-]*)[^\S\n]*\n([\s\S]*?)```/g)]
	if (!fences.length) return input
	// Separate ```css / ```js answers join the page as its <style> and <script>.
	return fences.map(([, lang, code = '']) => {
		if (/^css$/i.test(lang)) return `<style>\n${code}</style>`
		if (/^(js|javascript)$/i.test(lang)) return `<script>\n${code}</script>`
		return code
	}).join('\n').trim()
}

export function htmlToJsonTree(source: string): ImportedHtmlTree {
	const html = editorConfig.enable_import_code_fences ? stripCodeFences(source) : source
	// A file from this builder's own Export carries its node tree - restore that exactly.
	const embedded = readEmbeddedPageData(parseDoc(html))
	if (embedded) {
		// A crafted file could carry any node data, so it gets the same checks as a page load.
		const safe = sanitizeCanvasTree(embedded as LayoutNode)
		return { root: safe, css: sanitizeCss(safe.plainCss), js: safe.plainJS || '', skipped: [], external: [] }
	}

	const { css, js: pastedJs, html: body, external, externalStyles, externalScripts, tailwind, scripts, htmlAttributes } = DomExtractor(html)
	const stripJs = (code: string) => editorConfig.enable_import_strip_js_side_effects ? stripJsSideEffects(code) : code
	const classicJs = stripJs(pastedJs)
	const ids = pageIdNames(body)
	const skipped = new Set<string>()
	// One font-size cascade for both the node styles and the page CSS.
	const rules = parseStyleRules(css)
	const vars = collectCssVariables(rules, body.ownerDocument)
	const units = buildUnitContext(body.ownerDocument, rules, (value) => resolveVarReferences(value, vars))
	twAnimations = []
	const converted = convertHtmlToJsonTree(body, css, skipped, units)
	resolveTailwindTargets(converted)
	// The <html> class rides along as a node, so a class the CSS uses (`html.dark`) is renamed too.
	const holder = { attributes: { className: htmlAttributes?.class }, children: [converted] }
	const cssInEm = convertCssUnits(css, units)
	// Page variables and class names get a private prefix, so the builder's theme variables and the
	// Tailwind/Bootstrap classes around the page (.container, .btn...) can't clash with them.
	const withVars = scopePageVariables(holder, cssInEm, classicJs)
	const classed = scopePageClasses(withVars.root, withVars.css, withVars.js)
	// Ids too: Judgify's page and the builder have their own #app, #nav, #modal...
	const identified = scopePageIds(classed.root, classed.css, classed.js, ids)
	// Module scripts get the same renaming as plainJS.
	for (const script of scripts) {
		if (script.type !== 'module' || !script.code) continue
		const vars = scopePageVariables(holder, cssInEm, stripJs(script.code))
		script.code = scopePageIds(holder, css, scopePageClasses(holder, css, vars.js).js, ids).js
	}
	const root = identified.root.children[0] as LayoutNode
	if (scripts.length) root.pageScripts = scripts
	if (twAnimations.length) (root as { animation?: unknown[] }).animation = [...((root as { animation?: unknown[] }).animation ?? []), ...twAnimations]
	if (htmlAttributes) {
		const htmlClass = identified.root.attributes.className
		root.htmlAttributes = { ...htmlAttributes, ...(htmlClass ? { class: htmlClass } : {}) }
		// lang/dir also on the canvas root, where the editor and Preview can apply them.
		const attrs = root.attributes as Record<string, string> | undefined
		root.attributes = { ...(htmlAttributes.lang && !attrs?.lang ? { lang: htmlAttributes.lang } : {}), ...(htmlAttributes.dir && !attrs?.dir ? { dir: htmlAttributes.dir } : {}), ...attrs } as typeof root.attributes
	}
	const scoped = { ...identified, root, css: alsoTargetTextWrappers(identified.css) }
	// @imports must stay first (a browser ignores one after any rule); then the tag defaults (the page's
	// own rules win ties), the page CSS, and the text rule last.
	const imports = scoped.css.match(LEADING_IMPORTS)?.[0] ?? ''
	const pageRules = scoped.css.slice(imports.length)
	const pageCss = scoped.css.trim() ? `${imports}${importedBaseCss(rules)}\n\n${pageRules}\n\n${IMPORTED_TEXT_CSS}` : ''
	return { root: sanitizeCanvasTree(scoped.root), css: sanitizeCss(scopePageCss(pageCss)), js: scoped.js, skipped: Array.from(skipped), external, externalStyles, externalScripts, ...(tailwind ? { tailwind } : {}) }
}
