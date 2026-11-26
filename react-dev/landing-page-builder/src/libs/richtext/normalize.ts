import { normalizeInline } from './inline'
import { createElement, isElement, isList, isTextblock, kindOf, CELL_TYPES } from './schema'
import type { Doc, ElementNode, RTNode, TextNode } from './types'

const needsChild = (type: string) => type === 'doc' || type === 'listItem' || CELL_TYPES.includes(type)
const dropWhenEmpty = (type: string) => type === 'bulletList' || type === 'orderedList' || type === 'blockquote' || type === 'table' || type === 'tableRow'

const sameChildren = (a: RTNode[], b: RTNode[]) => a.length === b.length && a.every((n, i) => n === b[i])

function normalizeNode(node: ElementNode): ElementNode | null {
	if (isTextblock(node)) {
		const runs = (node.content ?? []) as TextNode[]
		const next = normalizeInline(runs)
		const unchanged = next.length === runs.length && next.every((r, i) => r === runs[i])
		return unchanged ? node : { ...node, content: next }
	}
	if (kindOf(node) === 'void') return node
	const content = node.content ?? []
	const children = content.map((child) => (isElement(child) ? normalizeNode(child) : child)).filter((child): child is RTNode => child !== null)
	// An empty list, quote, table or row is removed; a list item, cell or the doc always keeps one block.
	let next = children
	if (!next.length && dropWhenEmpty(node.type)) return null
	if (!next.length && needsChild(node.type)) next = [createElement('paragraph')]
	// A list item starts with a paragraph; a nested list alone gets an empty one in front.
	if (node.type === 'listItem' && isList(next[0])) next = [createElement('paragraph'), ...next]
	return sameChildren(next, content) ? node : { ...node, content: next }
}

/** Repairs the structure after an edit: empty containers go, required blocks come back, text runs are merged. Keeps identity of unchanged nodes. */
export function normalizeDoc(doc: Doc): Doc {
	const next = normalizeNode(doc)
	return (next ?? { type: 'doc', content: [createElement('paragraph')] }) as Doc
}
