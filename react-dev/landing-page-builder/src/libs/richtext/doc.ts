import { isElement, isTextblock } from './schema'
import type { Doc, ElementNode, Path, Point, RTNode } from './types'

// Reading and rewriting the immutable document tree. Every edit copies only the nodes on the way down
// to the change, so untouched subtrees keep their identity (the view and the history rely on that).

export const emptyDoc = (): Doc => ({ type: 'doc', content: [{ type: 'paragraph', attrs: { textAlign: null }, content: [] }] })

export function getNode(doc: RTNode, path: Path): RTNode | undefined {
	let node: RTNode | undefined = doc
	for (const index of path) {
		node = isElement(node) ? node.content?.[index] : undefined
		if (!node) return undefined
	}
	return node
}

export const getElement = (doc: RTNode, path: Path): ElementNode | undefined => {
	const node = getNode(doc, path)
	return isElement(node) ? node : undefined
}

export const parentPath = (path: Path): Path => path.slice(0, -1)
export const lastIndex = (path: Path): number => path[path.length - 1] ?? 0
export const childPath = (path: Path, index: number): Path => [...path, index]
export const samePath = (a: Path, b: Path) => a.length === b.length && a.every((v, i) => v === b[i])
export const isAncestor = (ancestor: Path, path: Path) => ancestor.length < path.length && ancestor.every((v, i) => v === path[i])

/** Document order: negative when `a` comes before `b`. */
export function comparePaths(a: Path, b: Path): number {
	const n = Math.min(a.length, b.length)
	for (let i = 0; i < n; i++) if (a[i] !== b[i]) return a[i]! - b[i]!
	return a.length - b.length
}

export function comparePoints(a: Point, b: Point): number {
	return comparePaths(a.path, b.path) || a.offset - b.offset
}

/** The node at `path` replaced by `fn(node)`. */
export function updateAt<T extends RTNode>(doc: T, path: Path, fn: (node: RTNode) => RTNode): T {
	if (!path.length) return fn(doc) as T
	const [index, ...rest] = path
	const parent = doc as ElementNode
	const content = parent.content ?? []
	if (index === undefined || index < 0 || index >= content.length) return doc
	const next = updateAt(content[index]!, rest, fn)
	if (next === content[index]) return doc
	const copy = content.slice()
	copy[index] = next
	return { ...parent, content: copy } as T
}

/** Children `from`..`to` (exclusive) of the element at `parent` replaced by `nodes`. */
export function replaceChildren<T extends RTNode>(doc: T, parent: Path, from: number, to: number, nodes: RTNode[]): T {
	return updateAt(doc, parent, (node) => {
		const element = node as ElementNode
		const content = element.content ?? []
		return { ...element, content: [...content.slice(0, from), ...nodes, ...content.slice(to)] }
	})
}

export const setContent = <T extends RTNode>(doc: T, path: Path, content: RTNode[]): T =>
	updateAt(doc, path, (node) => ({ ...(node as ElementNode), content }))

export const setAttrs = <T extends RTNode>(doc: T, path: Path, attrs: Record<string, unknown>): T =>
	updateAt(doc, path, (node) => ({ ...(node as ElementNode), attrs: { ...(node as ElementNode).attrs, ...attrs } }))

export interface Textblock {
	path: Path
	node: ElementNode
}

/** Every text block in document order. */
export function textblocks(doc: RTNode): Textblock[] {
	const out: Textblock[] = []
	const walk = (node: RTNode, path: Path) => {
		if (!isElement(node)) return
		if (isTextblock(node)) {
			out.push({ path, node })
			return
		}
		node.content?.forEach((child, i) => walk(child, [...path, i]))
	}
	walk(doc, [])
	return out
}

/** The text blocks from the one holding `from` to the one holding `to`, inclusive. */
export function textblocksBetween(doc: RTNode, from: Path, to: Path): Textblock[] {
	return textblocks(doc).filter((b) => comparePaths(b.path, from) >= 0 && comparePaths(b.path, to) <= 0)
}

/** Total characters in a text block (a hard break counts as one). */
export function blockLength(node: ElementNode): number {
	let n = 0
	for (const child of node.content ?? []) n += child.type === 'text' ? (child as { text: string }).text.length : 0
	return n
}

export function blockText(node: ElementNode): string {
	return (node.content ?? []).map((child) => (child.type === 'text' ? (child as { text: string }).text : '')).join('')
}

/** The text block before/after the one at `path` in document order, or undefined at the edges. */
export function neighbourTextblock(doc: RTNode, path: Path, direction: -1 | 1): Textblock | undefined {
	const all = textblocks(doc)
	const index = all.findIndex((b) => samePath(b.path, path))
	return index < 0 ? undefined : all[index + direction]
}

export const isEmptyBlock = (node: ElementNode) => blockLength(node) === 0
