import editorConfig from '@/configs/editor.config'

/**
 * Which source tags and attributes an imported node keeps, and which of them a
 * renderer may put on the element. Shared by the importer (htmlToCanvasNodes.ts)
 * and the renderers (Elements.tsx, NodeMap/*), so both agree on the same lists.
 */

/** Container tags a block/section/root renders as itself instead of a plain <div>. */
export const CONTAINER_TAGS = [
	'div', 'span', 'section', 'header', 'footer', 'main', 'nav', 'article', 'aside',
	'figure', 'figcaption', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'address',
	'details', 'summary', 'fieldset', 'legend', 'label', 'blockquote', 'pre',
	// Inline tags that hold blocks or nothing (a CSS-drawn bar like `.meter i`).
	'i', 'b', 'em', 'strong', 'small', 'time', 'cite', 'mark', 'code',
	// Inline tags TipTap would change keep their tag (enable_import_lossless_text).
	'u', 's', 'del', 'ins', 'sub', 'sup', 'abbr', 'kbd', 'q', 'dfn', 'var', 'samp', 'data', 'bdi', 'bdo',
	// A button holding tags (a hamburger's bars) is a block that is still a real <button>.
	'button',
	// Elements with no node type of their own (enable_import_raw_elements).
	'br', 'wbr', 'hr', 'img', 'canvas', 'audio', 'video', 'source', 'track', 'picture', 'dialog', 'progress',
	'meter', 'output', 'map', 'area', 'template', 'noscript',
	// A heading holding a span block (`<h1>Title<span>Sub</span></h1>`) keeps `.hero h1 {}` working.
	'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
] as const
// Left out on purpose: p (the browser moves a <div> out of a <p> when it re-reads the markup),
// a (becomes button/linked nodes), form (a submit would reload the editor).

/** Tags that can't hold children - renderers must not pass any to them. */
export const VOID_TAGS = new Set(['br', 'wbr', 'hr', 'img', 'source', 'track', 'area'])

export type ContainerTag = typeof CONTAINER_TAGS[number]

const CONTAINER_TAG_SET = new Set<string>(CONTAINER_TAGS)
// A custom element name (`my-widget`); it only does something once the page JS defines it.
const CUSTOM_ELEMENT = /^[a-z][a-z0-9]*-[a-z0-9-]*$/
export const isContainerTag = (tag: string): tag is ContainerTag =>
	CONTAINER_TAG_SET.has(tag) || (!!editorConfig.enable_import_raw_elements && CUSTOM_ELEMENT.test(tag))

// Tags a stored node may also carry: a link or button node, and the form field kinds.
const FIELD_AND_LINK_TAGS = new Set(['a', 'input', 'textarea', 'select'])
/** The tags a stored `node.tag` may hold: container tags plus link and form-field tags. Never meta, iframe, object, embed, base, link, script or style. */
export const isSafeNodeTag = (tag: unknown): tag is string =>
	typeof tag === 'string' && (isContainerTag(tag) || FIELD_AND_LINK_TAGS.has(tag))
/** `tag` when it is allowed, otherwise `fallback`. Use it wherever a stored tag becomes an element. */
export const safeTag = <F extends string | undefined>(tag: unknown, fallback: F): ContainerTag | F => (isSafeNodeTag(tag) ? (tag as ContainerTag) : fallback)

// data-* names the editor and page runtime use themselves - an imported value would
// break selection, animations or the sandbox.
const RESERVED_DATA = /^data-(id|node-path|name|cypress|state|disabled|slot|side|align|orientation|lp-tag|lp-tw|capture-ready|class-js|custom-js|imported-jquery|radix.*|sonner.*|dnd.*)$/i

// Source attribute name -> React prop name, for the plain attributes worth keeping.
const PLAIN_ATTRIBUTES: Record<string, string> = {
	role: 'role', title: 'title', lang: 'lang', dir: 'dir', rel: 'rel', tabindex: 'tabIndex', for: 'htmlFor',
	// Content a page script reveals later (e.g. the second tab panel).
	hidden: 'hidden',
}

/** Set on imported text: "block" when the source was a p/h1-h6/blockquote/pre/list, "plain" when it
 * was any other element (a div, dt, label...), whose TipTap <p> must not pick up the page's `p` rules. */
export const IMPORTED_TEXT_ATTR = 'data-lp-text'

/** Imported text (or text with a class) takes its color from the page CSS - no black default. */
export const keepsPageColor = (attributes: Record<string, unknown> | undefined) =>
	!!(attributes?.className || attributes?.[IMPORTED_TEXT_ATTR])

/** Set on an imported page's root; the imported CSS's tag defaults apply inside it only. */
export const IMPORTED_PAGE_ATTR = 'data-lp-page'

/** Set on text and spans that shared one line of text in the source; they display inline. */
export const INLINE_PIECE_ATTR = 'data-lp-inline'

/** Set on the block a <form> becomes (a real form would reload the editor on submit). */
export const FORM_ATTR = 'data-lp-form'

// The type selector `form` in a selector (not `.form`, `#form`, `[form]` or `my-form`).
const FORM_TYPE_SELECTOR = /(^|[\s>+~,(])form(?![\w-])/gi

/** Page CSS written for `form` targets the marked block instead: `form .btn` -> `[data-lp-form] .btn`. */
export const retargetFormSelectors = (selector: string) => selector.replace(FORM_TYPE_SELECTOR, `$1[${FORM_ATTR}]`)

/** Set on an image made from an inline <svg>; the sandbox snapshot turns it back into that <svg>. */
export const INLINE_SVG_ATTR = 'data-lp-svg'

// enable_import_all_attributes: source attribute -> React prop, where the two names differ.
const REACT_NAMES: Record<string, string> = {
	tabindex: 'tabIndex', for: 'htmlFor', colspan: 'colSpan', rowspan: 'rowSpan', readonly: 'readOnly',
	maxlength: 'maxLength', minlength: 'minLength', crossorigin: 'crossOrigin', datetime: 'dateTime',
	referrerpolicy: 'referrerPolicy', accesskey: 'accessKey', spellcheck: 'spellCheck', autocomplete: 'autoComplete',
	enterkeyhint: 'enterKeyHint', inputmode: 'inputMode', itemprop: 'itemProp', itemscope: 'itemScope',
	itemtype: 'itemType', itemid: 'itemID', itemref: 'itemRef', usemap: 'useMap', novalidate: 'noValidate',
	playsinline: 'playsInline', allowfullscreen: 'allowFullScreen', frameborder: 'frameBorder',
	cellpadding: 'cellPadding', cellspacing: 'cellSpacing', hreflang: 'hrefLang', enctype: 'encType',
	'accept-charset': 'acceptCharset', autoplay: 'autoPlay', formnovalidate: 'formNoValidate', nomodule: 'noModule',
	srclang: 'srcLang', controlslist: 'controlsList', disablepictureinpicture: 'disablePictureInPicture',
	disableremoteplayback: 'disableRemotePlayback',
}
const REACT_NAME_SET = new Set(Object.values(REACT_NAMES))

// React leaves a boolean prop out when given "", so these are written with a non-empty value.
const BOOLEAN_PROPS = new Set(['allowFullScreen', 'async', 'autoPlay', 'controls', 'default', 'defer', 'disabled',
	'formNoValidate', 'hidden', 'loop', 'noModule', 'noValidate', 'open', 'playsInline', 'readOnly', 'required',
	'reversed', 'itemScope', 'checked', 'multiple', 'muted', 'selected', 'disablePictureInPicture', 'disableRemotePlayback'])

// Never kept: handlers, fields a node has itself (style, class, id), anything that loads or sends
// something (srcdoc, form actions, ping; srcset would beat an image the user changes), and what
// fights the editor (contenteditable, autofocus).
const DROPPED_ATTRIBUTE = /^(on.*|style|class|id|srcdoc|action|formaction|ping|background|srcset|sizes|imagesrcset|imagesizes|contenteditable|autofocus|is|nonce|xmlns.*)$/i

// Applied on the page, not the editor canvas: there the content stays visible, still and clickable.
const PAGE_ONLY_PROPS = new Set(['hidden', 'inert', 'popover', 'disabled', 'draggable', 'autoPlay'])

/** React prop name for a source attribute that should be kept, or null to drop it. */
export function keptAttributeName(name: string): string | null {
	const lower = name.toLowerCase()
	// Custom data and accessibility attributes pass through under their own names.
	if (/^(data|aria)-[\w-]+$/.test(lower)) return RESERVED_DATA.test(lower) ? null : lower
	if (!editorConfig.enable_import_all_attributes) return PLAIN_ATTRIBUTES[lower] ?? null
	// Like frontend-editor's readAttributes: everything else is kept, under React's name for it.
	if (DROPPED_ATTRIBUTE.test(lower) || !/^[a-z][a-z0-9-]*$/.test(lower)) return null
	return REACT_NAMES[lower] ?? lower
}

/** True when `key` is a prop keptAttributeName produces (attributes are stored under that name). */
const isKeptProp = (key: string) => REACT_NAME_SET.has(key)
	? !!editorConfig.enable_import_all_attributes || key === 'tabIndex' || key === 'htmlFor'
	: keptAttributeName(key) === key

/** Extra attributes a renderer may spread onto the node's element (before its own props).
 * The editor canvas leaves out `hidden` (and PAGE_ONLY_PROPS), so that content stays visible and editable. */
export function passthroughAttributes(attributes: Record<string, unknown> | undefined, where: 'page' | 'editor' = 'page'): Record<string, string> {
	const out: Record<string, string> = {}
	if (!attributes) return out
	for (const [key, value] of Object.entries(attributes)) {
		// Renderers place links themselves (checked, and never live in the editor).
		if (typeof value !== 'string' || key === 'href' || key === 'target' || !isKeptProp(key)) continue
		if (where === 'editor' && PAGE_ONLY_PROPS.has(key)) continue
		out[key] = BOOLEAN_PROPS.has(key) ? key : value
	}
	return out
}
