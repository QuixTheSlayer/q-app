import type { Attrs, ElementNode, Mark, RTNode, TextNode } from './types'

// What each node and mark may do. Names and attributes match the TipTap extensions the builder uses
// (src/libs/tiptap/config.ts), so documents move between the two editors untouched.

export type NodeKind = 'textblock' | 'container' | 'void'

export interface NodeSpec {
	kind: NodeKind
	defaultAttrs?: Attrs
	/** A textblock whose text may carry marks. Code blocks hold plain text. */
	marks?: boolean
	/** Editing never joins across this node's edge (table cells). */
	isolating?: boolean
}

export const NODES: Record<string, NodeSpec> = {
	doc: { kind: 'container' },
	paragraph: { kind: 'textblock', marks: true, defaultAttrs: { textAlign: null } },
	heading: { kind: 'textblock', marks: true, defaultAttrs: { textAlign: null, level: 1 } },
	codeBlock: { kind: 'textblock', marks: false, defaultAttrs: { language: null } },
	blockquote: { kind: 'container' },
	bulletList: { kind: 'container' },
	orderedList: { kind: 'container', defaultAttrs: { start: 1, type: null } },
	listItem: { kind: 'container' },
	horizontalRule: { kind: 'void' },
	table: { kind: 'container' },
	tableRow: { kind: 'container' },
	tableCell: { kind: 'container', isolating: true, defaultAttrs: { colspan: 1, rowspan: 1, colwidth: null } },
	tableHeader: { kind: 'container', isolating: true, defaultAttrs: { colspan: 1, rowspan: 1, colwidth: null } },
}

export const LIST_TYPES = ['bulletList', 'orderedList']
export const CELL_TYPES = ['tableCell', 'tableHeader']

export const isText = (node: RTNode | undefined): node is TextNode => node?.type === 'text'
export const isElement = (node: RTNode | undefined): node is ElementNode => !!node && node.type !== 'text'

/** A node type the schema does not know is read from its shape: text children = textblock, element children = container. */
export function kindOf(node: ElementNode): NodeKind {
	const spec = NODES[node.type]
	if (spec) return spec.kind
	const first = node.content?.[0]
	if (!first) return 'void'
	return first.type === 'text' ? 'textblock' : 'container'
}

export const isTextblock = (node: RTNode | undefined): boolean => isElement(node) && kindOf(node) === 'textblock'
export const isContainer = (node: RTNode | undefined): boolean => isElement(node) && kindOf(node) === 'container'
export const isList = (node: RTNode | undefined) => isElement(node) && LIST_TYPES.includes(node.type)
export const isCell = (node: RTNode | undefined) => isElement(node) && CELL_TYPES.includes(node.type)
export const isIsolating = (node: RTNode | undefined) => isElement(node) && !!NODES[node.type]?.isolating

export const defaultAttrs = (type: string): Attrs => ({ ...(NODES[type]?.defaultAttrs ?? {}) })

export function createElement(type: string, attrs?: Attrs, content?: RTNode[]): ElementNode {
	const base = defaultAttrs(type)
	const merged = { ...base, ...attrs }
	const node: ElementNode = { type }
	if (Object.keys(merged).length) node.attrs = merged
	if (content) node.content = content
	return node
}

export const paragraph = (text = '', attrs?: Attrs, marks?: Mark[]): ElementNode =>
	createElement('paragraph', attrs, text ? [{ type: 'text', text, ...(marks?.length ? { marks } : {}) }] : [])

// ---------------------------------------------------------------- marks

export interface MarkSpec {
	/** Order marks are written and compared in. */
	rank: number
	/** Typing at the edge of the mark continues it (links do not). */
	inclusive: boolean
	/** Marks that cannot sit next to this one: a list of types, or '_' for all. */
	excludes?: string[] | '_'
	/** Attributes and their values when the mark is created without any. */
	defaultAttrs?: Attrs
}

export const MARKS: Record<string, MarkSpec> = {
	link: { rank: 0, inclusive: false, defaultAttrs: { href: null, target: '_blank', rel: 'noopener noreferrer nofollow', class: null, title: null } },
	bold: { rank: 1, inclusive: true },
	italic: { rank: 2, inclusive: true },
	strike: { rank: 3, inclusive: true },
	underline: { rank: 4, inclusive: true },
	code: { rank: 5, inclusive: true, excludes: '_' },
	subscript: { rank: 6, inclusive: true, excludes: ['superscript'] },
	superscript: { rank: 7, inclusive: true, excludes: ['subscript'] },
	highlight: { rank: 8, inclusive: true, defaultAttrs: { color: null } },
	textStyle: { rank: 9, inclusive: true, defaultAttrs: { color: null, fontSize: null, fontFamily: null, lineHeight: null } },
}

export const markRank = (type: string) => MARKS[type]?.rank ?? 100
export const markInclusive = (type: string) => MARKS[type]?.inclusive ?? true

/** Whether adding `adding` to a text that has `existing` is allowed (code excludes every other mark, and vice versa). */
export function excludes(a: string, b: string): boolean {
	const ex = MARKS[a]?.excludes
	if (!ex) return false
	return ex === '_' ? a !== b : ex.includes(b)
}

export function sameAttrs(a: Attrs | undefined, b: Attrs | undefined): boolean {
	const x = a ?? {}
	const y = b ?? {}
	const keys = new Set([...Object.keys(x), ...Object.keys(y)])
	for (const key of keys) if ((x[key] ?? null) !== (y[key] ?? null)) return false
	return true
}

export const sameMark = (a: Mark, b: Mark) => a.type === b.type && sameAttrs(a.attrs, b.attrs)

export function sameMarks(a: Mark[] | undefined, b: Mark[] | undefined): boolean {
	const x = a ?? []
	const y = b ?? []
	if (x.length !== y.length) return false
	return x.every((mark, i) => sameMark(mark, y[i]!))
}

/** Marks sorted by rank, one per type. */
export function sortMarks(marks: Mark[]): Mark[] {
	return [...marks].sort((a, b) => markRank(a.type) - markRank(b.type))
}

/** `marks` plus `mark`. Marks it excludes are removed; nothing is added if a remaining mark excludes it. */
export function addMark(marks: Mark[] | undefined, mark: Mark): Mark[] {
	const list = marks ?? []
	// The new mark first removes what it excludes (so superscript replaces subscript); what is left may still exclude it (code).
	const kept = list.filter((m) => m.type !== mark.type && !excludes(mark.type, m.type))
	if (kept.some((m) => excludes(m.type, mark.type))) return list
	return sortMarks([...kept, mark])
}

export const removeMark = (marks: Mark[] | undefined, type: string): Mark[] => (marks ?? []).filter((m) => m.type !== type)
