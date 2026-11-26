import { attrValueCode, isKnownAttribute, jsxAttr, jsxAttrName, styleJsx } from './jsxAttrs'
import { VOID_TAGS, collapseSpaces, hasRealText, isBlankText, isElement, type ElementNode, type NodeMap } from './types'

/** A run of repeated siblings written as one `{list.map(...)}` line. */
export type RepeatSlot = { ids: string[]; expression: string }

export type JsxContext = {
	nodes: NodeMap
	/** Inside an item component: text id or `${elementId}@${attr}` -> prop name. */
	props?: Map<string, string>
	/** Repeated runs to replace, keyed by their first item's id. */
	repeats?: Map<string, RepeatSlot>
	/** Set when a style needed the CSSProperties type, so the file imports it. */
	usage: { cssProperties: boolean }
}

/** Tags that sit in a line of text: the space between two of them is visible. */
const INLINE_TAGS = new Set(['a', 'abbr', 'b', 'br', 'button', 'cite', 'code', 'em', 'i', 'img', 'input', 'kbd', 'label',
	'mark', 'q', 's', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'svg', 'textarea', 'time', 'u', 'picture'])
const INDENT = '  '
// Text inside these keeps every space and line break.
const RAW_TAGS = new Set(['pre', 'style'])

const isBlank = (nodes: NodeMap, id: string) => {
	const node = nodes[id]
	return node?.kind === 'text' && isBlankText(node.text)
}
const isInline = (nodes: NodeMap, id: string | undefined) => Boolean(id && isElement(nodes[id]) && INLINE_TAGS.has((nodes[id] as ElementNode).tag))

/** Text as JSX: spaces collapsed like the browser does; {"…"} when it holds JSX-special characters. */
function textJsx(ctx: JsxContext, id: string, raw: boolean): string {
	const prop = ctx.props?.get(id)
	if (prop) return `{${prop}}`
	const node = ctx.nodes[id]
	const text = node?.kind === 'text' ? node.text : ''
	if (raw) return `{${JSON.stringify(text)}}`
	const collapsed = collapseSpaces(text)
	return /[{}<>]|&[#\w]+;/.test(collapsed) ? `{${JSON.stringify(collapsed)}}` : collapsed
}

/** <select> remembers its chosen <option> as defaultValue. */
function selectDefault(nodes: NodeMap, node: ElementNode): string | undefined {
	const option = node.children.map((id) => nodes[id]).find((child) => isElement(child) && 'selected' in child.attrs)
	if (!isElement(option)) return undefined
	const text = option.children.map((id) => (nodes[id]?.kind === 'text' ? (nodes[id] as { text: string }).text : '')).join('').trim()
	return option.attrs.value ?? text
}

/** The attributes of an element in JSX; the style (if any) goes last. `pad` null = a text-level element. */
function attrsJsx(ctx: JsxContext, node: ElementNode, inSvg: boolean, pad: string | null): string {
	const attrs: Record<string, string> = { ...node.attrs }
	if (node.tag === 'select') {
		const chosen = selectDefault(ctx.nodes, node)
		if (chosen !== undefined) attrs.value = chosen
	}
	const propNames = [...(ctx.props?.keys() ?? [])].filter((key) => key.startsWith(`${node.id}@`)).map((key) => key.split('@')[1]!)
	const names = [...new Set([...Object.keys(attrs), ...propNames])].filter((name) => name !== 'style')
	// An attribute the tag's React type doesn't accept (an imported form's `novalidate` on a <div>) goes in a spread
	// of a plain object, which TypeScript doesn't check. React still sets it on the element.
	const unchecked: string[] = []
	const written = names.map((name) => {
		const prop = ctx.props?.get(`${node.id}@${name}`)
		if (!prop && !inSvg && !isKnownAttribute(node.tag, name)) {
			const jsxName = jsxAttrName(node.tag, name, inSvg)
			if (jsxName) unchecked.push(`${jsxName}: ${attrValueCode(name, attrs[name]!)}`)
			return ''
		}
		if (!prop) return jsxAttr(node.tag, name, attrs[name]!, inSvg)
		const jsxName = jsxAttrName(node.tag, name, inSvg)
		return jsxName ? ` ${jsxName}={${prop}}` : ''
	}).join('') + (unchecked.length ? ` {...({ ${unchecked.join(', ')} } as object)}` : '')
	const style = attrs.style ? styleJsx(attrs.style, pad) : null
	if (style?.needsCast) ctx.usage.cssProperties = true
	return written + (style?.code ?? '')
}

/** Children on one line (elements with text in them): keeps the spaces between words and tags. */
function inlineChildren(ctx: JsxContext, ids: string[], inSvg: boolean, raw: boolean): string {
	return ids.map((id) => {
		if (ctx.nodes[id]?.kind === 'text') return isBlank(ctx.nodes, id) && !raw ? ' ' : textJsx(ctx, id, raw)
		return writeElement(ctx, id, null, inSvg, raw)
	}).join('')
}

/** Children one per line. A space between two inline elements (buttons in a row) becomes {' '}. */
function blockChildren(ctx: JsxContext, ids: string[], pad: string, inSvg: boolean): string[] {
	const lines: string[] = []
	const skip = new Set<string>()
	ids.forEach((id, index) => {
		if (skip.has(id)) return
		const slot = ctx.repeats?.get(id)
		if (slot) {
			slot.ids.forEach((itemId) => skip.add(itemId))
			lines.push(`${pad}${slot.expression}`)
		} else if (isBlank(ctx.nodes, id)) {
			if (isInline(ctx.nodes, ids[index - 1]) && isInline(ctx.nodes, ids[index + 1]) && !skip.has(ids[index + 1]!)) lines.push(`${pad}{' '}`)
		} else {
			lines.push(writeElement(ctx, id, pad, inSvg))
		}
	})
	return lines
}

/** One element and everything inside it, as JSX, indented by `pad` (null = inside a line of text). */
export function writeElement(ctx: JsxContext, id: string, pad: string | null, inSvg = false, inRaw = false): string {
	const node = ctx.nodes[id]
	if (!isElement(node)) return ''
	const lead = pad ?? ''
	const svg = inSvg || node.tag === 'svg'
	const childSvg = svg && node.tag !== 'foreignObject'
	const children = node.children
	const attrs = attrsJsx(ctx, node, svg, pad)
	if (node.tag === 'textarea') {
		const text = children.map((child) => (ctx.nodes[child]?.kind === 'text' ? (ctx.nodes[child] as { text: string }).text : '')).join('')
		const value = text ? ` defaultValue={${JSON.stringify(text)}}` : ''
		return `${lead}<textarea${attrs}${value} />`
	}
	const open = `<${node.tag}${attrs}`
	if (VOID_TAGS.has(node.tag) || children.length === 0) return `${lead}${open} />`
	const raw = inRaw || RAW_TAGS.has(node.tag) // keep every space and line break
	if (raw || hasRealText(ctx.nodes, node)) return `${lead}${open}>${inlineChildren(ctx, children, childSvg, raw)}</${node.tag}>`
	const lines = blockChildren(ctx, children, `${lead}${INDENT}`, childSvg)
	return lines.length ? `${lead}${open}>\n${lines.join('\n')}\n${lead}</${node.tag}>` : `${lead}${open} />`
}

/** `<tag …attributes>` for an element whose children are written separately (App's wrapper). */
export function openTag(ctx: JsxContext, node: ElementNode, pad: string): string {
	return `<${node.tag}${attrsJsx(ctx, node, false, pad)}>`
}
