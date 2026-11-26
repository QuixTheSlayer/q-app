import type { CanvasNode } from '@/types/node.type'
import { isSafeNodeTag } from '@/utils/nodeAttributes'
import { safeFrameUrl, safeHref, safeMediaUrl } from '@/utils/security/safeUrl'
import { sanitizeCss } from '@/utils/security/sanitizeCss'

/**
 * Returns a copy of a page tree that's safe to render: every link/media/iframe URL
 * is checked against its allowlist (see safeUrl.ts), link marks inside rich text
 * are checked too, event-handler-style attributes are dropped, and plainCss is
 * sanitized. Runs on every page load and import, so pages saved before these
 * checks existed - or saved by calling the API directly - are covered as well.
 * plainJS is left alone: it only ever runs inside the sandbox (SandboxFrame).
 */

// Field names that hold a link: any `...href` (href, ctaHref, registerHref, links[].href)
// plus `link` (social nodes). Matched by name so every template field is covered.
const HREF_KEY = /href$|^link$/i
// Field names that hold an image/video source: `src`, `poster`, and any `...ImageUrl`
// (imageUrl, logoImageUrl, cards[].imageUrl).
const MEDIA_KEY = /^(src|poster)$|imageurl$/i
const MEDIA_CHILDREN = new Set(['image', 'video'])
// `url` is an iframe source on embed nodes, but an image on slider/carousel items.
const FRAME_NODES = new Set(['youtube', 'vimeo', 'googleMap', 'html'])
// Attribute names that could run script or swap in a whole document: every `on...`
// event handler (onclick, onerror...), srcdoc, dangerouslySetInnerHTML and form actions.
const DANGEROUS_ATTR = /^on|^(srcdoc|dangerouslysetinnerhtml|formaction|action)$/i

type Json = unknown

/** TipTap doc (text/table content): check link hrefs and any image sources. */
function sanitizeDoc(doc: Json): Json {
	if (Array.isArray(doc)) return doc.map(sanitizeDoc)
	if (!doc || typeof doc !== 'object') return doc
	const node = { ...(doc as Record<string, Json>) }
	if (node.attrs && typeof node.attrs === 'object') {
		const attrs = { ...(node.attrs as Record<string, Json>) }
		if (node.type === 'link' && 'href' in attrs) attrs.href = safeHref(attrs.href)
		if ('src' in attrs) attrs.src = safeMediaUrl(attrs.src)
		node.attrs = attrs
	}
	if (node.marks) node.marks = sanitizeDoc(node.marks)
	if (node.content) node.content = sanitizeDoc(node.content)
	return node
}

function sanitizeDocString(value: string): string {
	if (!value.trimStart().startsWith('{')) return value
	try {
		return JSON.stringify(sanitizeDoc(JSON.parse(value)))
	} catch {
		return value
	}
}

function sanitizeAttributes(attributes: Record<string, Json>): Record<string, Json> {
	const out: Record<string, Json> = {}
	for (const [key, value] of Object.entries(attributes)) {
		if (DANGEROUS_ATTR.test(key)) continue
		out[key] = sanitizeValue(key, value, undefined)
	}
	return out
}

/** The root's page scripts: an https `src` (they only run in the sandbox frame), inline code, a plain type. */
function sanitizePageScripts(scripts: Json): Json {
	if (!Array.isArray(scripts)) return undefined
	return scripts.flatMap((script) => {
		if (!script || typeof script !== 'object') return []
		const { src, code, type } = script as Record<string, Json>
		const out: Record<string, string> = {}
		if (typeof type === 'string' && /^[\w/+.-]+$/.test(type)) out.type = type
		if (typeof src === 'string') {
			if (!/^(https:)?\/\/[^/]/i.test(src.trim())) return []
			out.src = src.trim()
		} else if (typeof code === 'string') out.code = code
		else return []
		return [out]
	})
}

/** The root's class rules: name -> rule object. An older Import HTML into node stored the pasted HTML's
 * characters here ({ "0": "<", ... }, or an array once saved), which crashed the class CSS on load. */
function sanitizeRootCss(css: Json): Json {
	if (!css || typeof css !== 'object' || Array.isArray(css)) return undefined
	const rules = Object.entries(css as Record<string, Json>).filter(([, rule]) => !!rule && typeof rule === 'object' && !Array.isArray(rule))
	return Object.fromEntries(rules.map(([name, rule]) => [name, sanitizeValue(name, rule, undefined)]))
}

function sanitizeValue(key: string, value: Json, owner: Record<string, Json> | undefined): Json {
	if (key === 'pageScripts') return sanitizePageScripts(value)
	if (key === 'css' && owner?.contentType === 'root') return sanitizeRootCss(value)
	if (typeof value === 'string') {
		if (key === 'children' && owner) {
			return MEDIA_CHILDREN.has(String(owner.contentType)) ? safeMediaUrl(value) : sanitizeDocString(value)
		}
		// A node's tag becomes an element name, so only allowed tags survive (a meta, iframe, object or embed would not).
		if (key === 'tag' && owner && 'contentType' in owner) return isSafeNodeTag(value) ? value : undefined
		if (key === 'plainCss') return sanitizeCss(value)
		if (HREF_KEY.test(key)) return safeHref(value)
		if (MEDIA_KEY.test(key)) return safeMediaUrl(value)
		if (key === 'url') return FRAME_NODES.has(String(owner?.contentType)) ? safeFrameUrl(value) : safeMediaUrl(value)
		return value
	}
	if (Array.isArray(value)) return value.map((item) => sanitizeValue(key, item, owner))
	if (!value || typeof value !== 'object') return value
	// Table/tableEnterprise keep their TipTap doc as an object.
	if (key === 'children' && (value as { type?: string }).type === 'doc') return sanitizeDoc(value)
	if (key === 'attributes' || key === 'htmlAttributes') return sanitizeAttributes(value as Record<string, Json>)
	const object = value as Record<string, Json>
	const out: Record<string, Json> = {}
	for (const [childKey, childValue] of Object.entries(object)) {
		out[childKey] = sanitizeValue(childKey, childValue, object)
	}
	return out
}

export function sanitizeCanvasTree<T extends CanvasNode | null | undefined>(root: T): T {
	if (!root || typeof root !== 'object') return root
	return sanitizeValue('', root, undefined) as T
}
