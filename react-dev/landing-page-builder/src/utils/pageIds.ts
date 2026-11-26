/**
 * An imported page's element ids get a private `lp-` prefix, like its classes (pageClasses.ts):
 * the page renders inside Judgify's own page and the builder, whose ids (#app, #nav, #modal...)
 * would otherwise clash - duplicate ids break getElementById, CSS and #anchor links.
 */
import { mapSelectors, mapSvgDataUri } from '@/utils/pageClasses'

const PREFIX = 'lp-'

// An id in a selector: `#name` (a name can't start with a digit, so a `#fff` color never matches in selectors).
const ID_IN_SELECTOR = /#(-?[_a-zA-Z][\w-]*)/g
// A quoted string inside a selector (`[href="#x"]`), handled separately.
const QUOTED = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g
// A JS string literal: '...', "..." or `...` (with escapes).
const JS_STRING = /'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/g
// `url(#name)` - an SVG paint server, filter or clip path.
const URL_REF = /url\(\s*(['"]?)#([\w-]+)\1\s*\)/g
// Attributes whose value is one id or a space-separated list of ids.
const ID_REF_ATTRS = ['htmlFor', 'list', 'headers', 'form', 'itemRef', 'popovertarget', 'aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-owns', 'aria-activedescendant', 'aria-flowto', 'aria-details', 'aria-errormessage']

/**
 * Lets page scripts find an element by the id they were written with: `getElementById('fname')`
 * (or `'fname' + '-err'`, built at runtime and so never renamed) also finds `lp-fname`.
 * Runs before the page's own script, wherever that script runs.
 */
export const ID_FALLBACK_SCRIPT = `(function () {
	var byId = Document.prototype.getElementById;
	if (byId.__lpFallback) return;
	var fallback = function (id) {
		return byId.call(this, id) || (typeof id === 'string' && id.indexOf('${PREFIX}') !== 0 ? byId.call(this, '${PREFIX}' + id) : null);
	};
	fallback.__lpFallback = true;
	Document.prototype.getElementById = fallback;
})();`

/** Every id in the pasted page (already-private `lp-` ids excluded). */
export function pageIdNames(body: Element): Set<string> {
	const names = new Set<string>()
	for (const el of [body, ...Array.from(body.querySelectorAll('[id]'))]) {
		const id = el.getAttribute('id')
		if (id && !id.startsWith(PREFIX)) names.add(id)
	}
	return names
}

const renameIdsInSelector = (selector: string, rename: (id: string) => string) => {
	const quoted: string[] = []
	const masked = selector.replace(QUOTED, (q) => `\uE000${quoted.push(q) - 1}\uE000`)
	const renamed = masked.replace(ID_IN_SELECTOR, (_, id: string) => `#${rename(id)}`)
	// Attribute values like [href="#faq"] point at an id too.
	return renamed.replace(/\uE000(\d+)\uE000/g, (_, i: string) => quoted[Number(i)].replace(/^(['"])#([\w-]+)\1$/, (m, q: string, id: string) => `${q}#${rename(id)}${q}`))
}

/** Renames ids inside an SVG's markup: id="x", href="#x" / xlink:href="#x", url(#x). */
function renameIdsInSvg(markup: string, rename: (id: string) => string): string {
	return markup
		.replace(/(\sid=)(["'])([^"']+)\2/g, (_, a: string, q: string, id: string) => `${a}${q}${rename(id)}${q}`)
		.replace(/(\s(?:xlink:)?href=)(["'])#([^"']+)\2/g, (_, a: string, q: string, id: string) => `${a}${q}#${rename(id)}${q}`)
		.replace(URL_REF, (_, q: string, id: string) => `url(${q}#${rename(id)}${q})`)
}

const renameInSvgDataUri = (src: string, rename: (id: string) => string) => mapSvgDataUri(src, (markup) => renameIdsInSvg(markup, rename))

type AnyNode = { contentType?: string; attributes?: Record<string, unknown>; children?: unknown; src?: unknown }

function renameNodeIds(node: AnyNode, rename: (id: string) => string, names: Set<string>) {
	if (!node || typeof node !== 'object') return
	const attrs = node.attributes
	if (attrs) {
		if (typeof attrs.id === 'string' && attrs.id) attrs.id = rename(attrs.id)
		for (const key of ID_REF_ATTRS) {
			if (typeof attrs[key] === 'string') attrs[key] = (attrs[key] as string).split(/\s+/).map(rename).join(' ')
		}
		if (typeof attrs.href === 'string' && attrs.href.startsWith('#')) attrs.href = `#${rename(attrs.href.slice(1))}`
	}
	// Rich text (TipTap JSON): links to #anchors.
	if (node.contentType === 'text' && typeof node.children === 'string') {
		node.children = node.children.replace(/("href":")#([^"]+)"/g, (m, a: string, id: string) => (names.has(id) ? `${a}#${rename(id)}"` : m))
	}
	// An SVG kept as an image carries its own ids (page JS/CSS reach into it once it's inline again).
	if (node.contentType === 'image') {
		if (typeof node.children === 'string') node.children = renameInSvgDataUri(node.children, rename)
		if (typeof node.src === 'string') node.src = renameInSvgDataUri(node.src, rename)
	}
	if (Array.isArray(node.children)) node.children.forEach((child) => renameNodeIds(child as AnyNode, rename, names))
}

/** Renames ids in a JS string: exactly an id ('nav'), or a selector that names one ('#nav a', '#faq'). */
function renameInJsString(literal: string, names: Set<string>, rename: (id: string) => string): string {
	const quote = literal[0]
	const body = literal.slice(1, -1)
	if (names.has(body)) return quote + rename(body) + quote
	// URLs ("https://site.com/#top") and plain prose aren't selectors.
	if (!body.includes('#') || body.includes('://')) return literal
	return quote + renameIdsInSelector(body, rename) + quote
}

/** Prefixes the page's ids in its node tree, CSS and JS. */
export function scopePageIds<T>(root: T, css: string, js: string, names: Set<string>): { root: T; css: string; js: string } {
	if (!names.size) return { root, css, js }
	const rename = (id: string) => (names.has(id) ? PREFIX + id : id)
	const tree = JSON.parse(JSON.stringify(root)) as T
	renameNodeIds(tree as AnyNode, rename, names)
	const withSelectors = mapSelectors(css, (selector) => renameIdsInSelector(selector, rename))
	return {
		root: tree,
		css: withSelectors.replace(URL_REF, (m, q: string, id: string) => (names.has(id) ? `url(${q}#${rename(id)}${q})` : m)),
		js: js.replace(JS_STRING, (literal) => renameInJsString(literal, names, rename)),
	}
}
