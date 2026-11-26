/**
 * An imported page's class names get a private `lp-` prefix, like its CSS variables
 * (pageVariables.ts). The page renders inside Judgify's site CSS (Bootstrap/Metronic) and the
 * builder's own Tailwind CSS, whose `.container`, `.btn`, `.hidden`... rules would otherwise
 * restyle the page differently in the editor and in Preview.
 */

const PREFIX = 'lp-'

// A class in a selector: `.name` (name can't start with a digit, so `.5em`-like text never matches).
const CLASS_IN_SELECTOR = /\.(-?[_a-zA-Z][\w-]*)/g
// A quoted string inside a selector (`[href$=".pdf"]`), skipped so `.pdf` isn't taken for a class.
const QUOTED = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g
// A JS string literal: '...', "..." or `...` (with escapes).
const JS_STRING = /'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/g
// A whitespace-separated list of plain class-like words ("open", "tab active").
const WORD_LIST = /^\s*[\w-]+(\s+[\w-]+)*\s*$/

/** Calls `onSelector` for each rule's selector text (not at-rule preludes), returning the rebuilt CSS. */
export function mapSelectors(css: string, onSelector: (selector: string) => string): string {
	let out = ''
	let start = 0
	let quote = ''
	for (let i = 0; i < css.length; i++) {
		const c = css[i]
		if (quote) {
			if (c === '\\') i++
			else if (c === quote) quote = ''
			continue
		}
		if (c === '"' || c === "'") { quote = c; continue }
		if (c === '/' && css[i + 1] === '*') {
			const end = css.indexOf('*/', i + 2)
			i = end === -1 ? css.length : end + 1
			continue
		}
		if (c === '{' || c === '}' || c === ';') {
			const prelude = css.slice(start, i)
			const isSelector = c === '{' && !prelude.trim().startsWith('@')
			out += (isSelector ? onSelector(prelude) : prelude) + c
			start = i + 1
		}
	}
	return out + css.slice(start)
}

/** Splits a selector list at its top-level commas (not inside :is(), [attr="a,b"]...). */
export function splitSelectorList(list: string): string[] {
	const parts: string[] = []
	let depth = 0, quote = '', start = 0
	for (let i = 0; i < list.length; i++) {
		const c = list[i]
		if (quote) { if (c === '\\') i++; else if (c === quote) quote = ''; continue }
		if (c === '"' || c === "'") quote = c
		else if (c === '(' || c === '[') depth++
		else if (c === ')' || c === ']') depth--
		else if (c === ',' && depth === 0) { parts.push(list.slice(start, i)); start = i + 1 }
	}
	parts.push(list.slice(start))
	return parts
}

/** Applies `fn` to the class names in a selector, leaving quoted parts alone. */
function mapSelectorClasses(selector: string, fn: (name: string) => string): string {
	const quoted: string[] = []
	// Placeholder: a private-use character, which never appears in real CSS.
	const masked = selector.replace(QUOTED, (q) => `\uE000${quoted.push(q) - 1}\uE000`)
	const renamed = masked.replace(CLASS_IN_SELECTOR, (_, name: string) => `.${fn(name)}`)
	return renamed.replace(/\uE000(\d+)\uE000/g, (_, i: string) => quoted[Number(i)])
}

/** Class names the page's CSS styles (already-private `lp-` names excluded). */
export function pageClassNames(css: string): Set<string> {
	const names = new Set<string>()
	mapSelectors(css, (selector) => mapSelectorClasses(selector, (name) => {
		if (!name.startsWith(PREFIX)) names.add(name)
		return name
	}))
	return names
}

// The markup inside a `data:image/svg+xml,...` URI (after the first comma).
const SVG_DATA_URI = /^data:image\/svg\+xml(;[^,]*)?,/i

/** Rewrites the markup inside an svg data URI (not base64 ones); anything else is returned as is. */
export function mapSvgDataUri(src: string, fn: (markup: string) => string): string {
	const match = src.match(SVG_DATA_URI)
	if (!match || /;base64/i.test(match[1] || '')) return src
	try {
		return match[0] + encodeURIComponent(fn(decodeURIComponent(src.slice(match[0].length))))
	} catch {
		return src
	}
}

type AnyNode = { contentType?: string; attributes?: { className?: string }; children?: unknown; src?: unknown }

// class="..." on an element inside svg markup.
const SVG_CLASS_ATTR = /(\sclass=)(["'])([^"']*)\2/g
const renameSvgClasses = (src: string, rename: (name: string) => string) => mapSvgDataUri(src, (markup) =>
	markup.replace(SVG_CLASS_ATTR, (_, a: string, q: string, list: string) => `${a}${q}${list.split(/\s+/).filter(Boolean).map(rename).join(' ')}${q}`))

function renameNodeClasses(node: AnyNode, rename: (name: string) => string) {
	if (!node || typeof node !== 'object') return
	const className = node.attributes?.className
	if (typeof className === 'string' && className.trim()) {
		node.attributes!.className = className.split(/\s+/).filter(Boolean).map(rename).join(' ')
	}
	// An svg kept as an image: its shapes' classes (`.dial-hand`) are styled by the page CSS once it's inline.
	if (node.contentType === 'image') {
		if (typeof node.children === 'string') node.children = renameSvgClasses(node.children, rename)
		if (typeof node.src === 'string') node.src = renameSvgClasses(node.src, rename)
	}
	if (Array.isArray(node.children)) node.children.forEach((child) => renameNodeClasses(child as AnyNode, rename))
}

/** Renames the page's classes in a JS string: a plain class list ("open", "tab active") or a selector (".tab.active"). */
function renameInJsString(literal: string, names: Set<string>, rename: (name: string) => string): string {
	const quote = literal[0]
	const body = literal.slice(1, -1)
	// URLs ("https://cdn.site.com/a.js") aren't selectors.
	if (body.includes('://')) return literal
	if (WORD_LIST.test(body)) {
		const words = body.trim().split(/\s+/)
		if (words.every((w) => names.has(w))) return quote + body.replace(/[\w-]+/g, (w) => rename(w)) + quote
		return literal
	}
	if (!body.includes('.')) return literal
	return quote + mapSelectorClasses(body, rename) + quote
}

/** Prefixes the page's own class names in its CSS selectors, the node tree's class attributes and its JS. */
export function scopePageClasses<T>(root: T, css: string, js: string): { root: T; css: string; js: string } {
	const names = pageClassNames(css)
	if (!names.size) return { root, css, js }
	const rename = (name: string) => (names.has(name) ? PREFIX + name : name)
	const tree = JSON.parse(JSON.stringify(root)) as T
	renameNodeClasses(tree as AnyNode, rename)
	return {
		root: tree,
		css: mapSelectors(css, (selector) => mapSelectorClasses(selector, rename)),
		js: js.replace(JS_STRING, (literal) => renameInJsString(literal, names, rename)),
	}
}
