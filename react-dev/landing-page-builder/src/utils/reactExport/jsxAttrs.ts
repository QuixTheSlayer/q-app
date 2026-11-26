import { splitDeclarations } from '@/utils/htmlToCanvasNodes'

/** HTML attribute names React spells differently. */
const RENAMED: Record<string, string> = {
	class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength',
	minlength: 'minLength', colspan: 'colSpan', rowspan: 'rowSpan', srcset: 'srcSet', crossorigin: 'crossOrigin',
	autoplay: 'autoPlay', playsinline: 'playsInline', autocomplete: 'autoComplete', autofocus: 'autoFocus',
	enterkeyhint: 'enterKeyHint', contenteditable: 'contentEditable', spellcheck: 'spellCheck', datetime: 'dateTime',
	frameborder: 'frameBorder', allowfullscreen: 'allowFullScreen', novalidate: 'noValidate', formnovalidate: 'formNoValidate',
	accesskey: 'accessKey', inputmode: 'inputMode', referrerpolicy: 'referrerPolicy', fetchpriority: 'fetchPriority',
	usemap: 'useMap', cellpadding: 'cellPadding', cellspacing: 'cellSpacing', hreflang: 'hrefLang', enctype: 'encType',
	'accept-charset': 'acceptCharset', 'http-equiv': 'httpEquiv', 'xlink:href': 'xlinkHref', 'xml:space': 'xmlSpace',
	'xml:lang': 'xmlLang', 'xmlns:xlink': 'xmlnsXlink', srcdoc: 'srcDoc', marginheight: 'marginHeight', marginwidth: 'marginWidth',
	charset: 'charSet', nomodule: 'noModule', itemprop: 'itemProp', itemscope: 'itemScope', itemtype: 'itemType',
	autocapitalize: 'autoCapitalize', controlslist: 'controlsList', srclang: 'srcLang',
}

/** Attributes that are on/off. In React they take true/false, never "". */
export const BOOLEAN_ATTRS = new Set(['disabled', 'required', 'hidden', 'open', 'multiple', 'muted', 'loop', 'controls',
	'playsinline', 'readonly', 'novalidate', 'formnovalidate', 'allowfullscreen', 'async', 'defer', 'itemscope', 'inert',
	'reversed', 'autoplay', 'autofocus', 'default', 'nomodule', 'checked', 'selected'])

/** Attributes React types as numbers (rows={3}, tabIndex={0}). */
const NUMBER_ATTRS = new Set(['rows', 'cols', 'tabindex', 'colspan', 'rowspan', 'maxlength', 'minlength', 'size', 'span', 'start'])

/**
 * Attributes React's types only accept on some tags (a `novalidate` on a <div> is a type error).
 * Anything not listed is treated as valid everywhere.
 */
const TAG_ONLY: Record<string, string[]> = {
	novalidate: ['form'], enctype: ['form'], method: ['form'], action: ['form'], 'accept-charset': ['form'],
	target: ['a', 'area', 'base', 'form'], rel: ['a', 'area', 'link'], href: ['a', 'area', 'base', 'link'], download: ['a', 'area'],
	name: ['button', 'fieldset', 'form', 'iframe', 'input', 'map', 'meta', 'object', 'output', 'param', 'select', 'slot', 'textarea'],
	src: ['audio', 'embed', 'iframe', 'img', 'input', 'script', 'source', 'track', 'video'],
	alt: ['area', 'img', 'input'],
	value: ['button', 'data', 'input', 'li', 'meter', 'option', 'output', 'param', 'progress', 'select', 'textarea'],
	type: ['a', 'button', 'embed', 'input', 'link', 'menu', 'object', 'ol', 'script', 'source', 'style'],
	disabled: ['button', 'fieldset', 'input', 'optgroup', 'option', 'select', 'textarea'],
	required: ['input', 'select', 'textarea'], placeholder: ['input', 'textarea'], readonly: ['input', 'textarea'],
	checked: ['input'], maxlength: ['input', 'textarea'], minlength: ['input', 'textarea'], pattern: ['input'], accept: ['input'],
	multiple: ['input', 'select'], for: ['label', 'output'], colspan: ['td', 'th'], rowspan: ['td', 'th'],
	width: ['canvas', 'embed', 'iframe', 'img', 'input', 'object', 'source', 'video'],
	height: ['canvas', 'embed', 'iframe', 'img', 'input', 'object', 'source', 'video'],
	open: ['details', 'dialog'], datetime: ['del', 'ins', 'time'], cite: ['blockquote', 'del', 'ins', 'q'],
}

/** Whether React's types accept this attribute on this tag. */
export function isKnownAttribute(tag: string, name: string): boolean {
	const tags = TAG_ONLY[name.toLowerCase()]
	return !tags || tags.includes(tag)
}

/** The attribute's value as a JavaScript expression: true, a number or a string. */
export function attrValueCode(name: string, value: string): string {
	if (BOOLEAN_ATTRS.has(name.toLowerCase()) && (value === '' || value.toLowerCase() === name.toLowerCase())) return 'true'
	if (NUMBER_ATTRS.has(name.toLowerCase()) && /^-?\d+$/.test(value.trim())) return value.trim()
	return JSON.stringify(value)
}

const camel = (name: string) => name.replace(/[-:]([a-z])/g, (_, letter: string) => letter.toUpperCase())
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/**
 * The React name of an attribute, or null to leave it out. Handlers can't be
 * strings in React, so they are dropped; `style` is written by `styleJsx`.
 * Form defaults become defaultValue / defaultChecked so fields stay editable.
 */
export function jsxAttrName(tag: string, name: string, inSvg: boolean): string | null {
	const lower = name.toLowerCase()
	if (lower.startsWith('on')) return null
	if (lower === 'style' || lower === 'selected') return null // <select> gets defaultValue
	if (lower === 'value' && ['input', 'textarea', 'select'].includes(tag)) return 'defaultValue'
	if (lower === 'checked' && tag === 'input') return 'defaultChecked'
	if (lower.startsWith('data-') || lower.startsWith('aria-')) return lower
	if (RENAMED[lower]) return RENAMED[lower]!
	if (inSvg && /[-:]/.test(name)) return camel(name)
	return name
}

/** A string as a JSX attribute value: "…" when safe, otherwise {"…"}. */
export function jsxString(value: string): string {
	return /["\\{}\n]|&[#\w]+;/.test(value) ? `{${JSON.stringify(value)}}` : `"${value}"`
}

/** One attribute in JSX form (` name="value"`), or '' when it is left out. */
export function jsxAttr(tag: string, name: string, value: string, inSvg: boolean): string {
	const jsxName = jsxAttrName(tag, name, inSvg)
	if (!jsxName) return ''
	if (BOOLEAN_ATTRS.has(name.toLowerCase()) && (value === '' || value.toLowerCase() === name.toLowerCase())) return ` ${jsxName}`
	if (NUMBER_ATTRS.has(name.toLowerCase()) && /^-?\d+$/.test(value.trim())) return ` ${jsxName}={${value.trim()}}`
	return ` ${jsxName}=${jsxString(value)}`
}

/** "background-color" -> backgroundColor, "-webkit-line-clamp" -> WebkitLineClamp, "-ms-x" -> msX; custom properties stay. */
export function cssPropName(name: string): string {
	if (name.startsWith('--')) return name
	const lower = name.toLowerCase()
	if (lower.startsWith('-ms-')) return `ms${capitalize(camel(lower.slice(4)))}`
	if (lower.startsWith('-')) return capitalize(camel(lower.slice(1)))
	return camel(lower)
}

const quote = (value: string) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ')}'`

/** The declarations of an inline style as [React name, value]. `!important` can't be written in a React style, so it is dropped. */
export function styleEntries(css: string): [string, string][] {
	const entries: [string, string][] = []
	for (const declaration of splitDeclarations(css)) {
		const colon = declaration.indexOf(':')
		if (colon < 1) continue
		const name = declaration.slice(0, colon).trim()
		const value = declaration.slice(colon + 1).replace(/\s*!important\s*$/i, '').trim()
		if (name && value) entries.push([cssPropName(name), value])
	}
	return entries
}

/**
 * ` style={{ … }}` for an inline style. With `pad` and three or more
 * declarations the object goes one per line; `pad` null keeps it on one line
 * (text-level elements). Custom properties need a CSSProperties cast to compile.
 */
export function styleJsx(css: string, pad: string | null): { code: string; needsCast: boolean } | null {
	const entries = styleEntries(css)
	if (entries.length === 0) return null
	const needsCast = entries.some(([name]) => name.startsWith('--'))
	const key = (name: string) => (/^[A-Za-z_$][\w$]*$/.test(name) ? name : quote(name))
	const cast = needsCast ? ' as CSSProperties' : ''
	if (pad === null || entries.length < 3) {
		return { code: ` style={{ ${entries.map(([name, value]) => `${key(name)}: ${quote(value)}`).join(', ')} }${cast}}`, needsCast }
	}
	const lines = entries.map(([name, value]) => `${pad}  ${key(name)}: ${quote(value)},`)
	return { code: ` style={{\n${lines.join('\n')}\n${pad}}${cast}}`, needsCast }
}
