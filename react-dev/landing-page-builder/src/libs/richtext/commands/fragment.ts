import { blockLength, getElement, lastIndex, parentPath, replaceChildren, setContent, textblocks } from '../doc'
import { concatInline, insertInline, sliceInline } from '../inline'
import { createElement, isTextblock, kindOf, NODES } from '../schema'
import { caret, isTextSelection, ordered } from '../selection'
import type { Command, Doc, ElementNode, Point, TextNode } from '../types'
import { deleteRangeInDoc } from './text'
import { finish, pathOfNode } from './util'

const runsOf = (block: ElementNode) => (block.content ?? []) as TextNode[]
const stripMarks = (runs: TextNode[]) => runs.map((r) => ({ type: 'text', text: r.text }) as TextNode)

const comparePath = (a: readonly number[], b: readonly number[]) => {
	for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i]! - b[i]!
	return a.length - b.length
}

/**
 * The part of the document between two points, as blocks: the first and last text block are cut, containers
 * (lists, quotes, tables) around the selected blocks are kept so a copied list is still a list.
 */
export function sliceFragment(doc: Doc, from: Point, to: Point): ElementNode[] {
	const walk = (node: ElementNode, path: readonly number[]): ElementNode | null => {
		if (isTextblock(node)) {
			const start = comparePath(path, from.path) === 0 ? from.offset : 0
			const end = comparePath(path, to.path) === 0 ? to.offset : blockLength(node)
			if (comparePath(path, from.path) < 0 || comparePath(path, to.path) > 0) return null
			return { ...node, content: sliceInline(runsOf(node), start, end) }
		}
		if (kindOf(node) === 'void') {
			const inRange = comparePath(path, from.path) >= 0 && comparePath(path, to.path) <= 0
			return inRange ? node : null
		}
		const children = (node.content ?? []).map((child, i) => (child.type === 'text' ? null : walk(child as ElementNode, [...path, i]))).filter((c): c is ElementNode => c !== null)
		return children.length ? { ...node, content: children } : null
	}
	return ((doc.content ?? []) as ElementNode[]).map((child, i) => walk(child, [i])).filter((c): c is ElementNode => c !== null)
}

/** Where a pasted block lands first inside a list item: a list item starts with a paragraph. */
const asParagraph = (block: ElementNode): ElementNode => (block.type === 'paragraph' || !isTextblock(block) ? block : createElement('paragraph', { textAlign: block.attrs?.textAlign ?? null }, runsOf(block)))

/**
 * Pastes blocks at the selection. One text block (or a phrase) is merged into the text around the caret; several blocks split the
 * current block and go in between, the first and last text blocks joining the two halves.
 */
export const insertFragment = (blocks: ElementNode[], options: { closed?: boolean } = {}): Command => (state) => {
	if (!isTextSelection(state.selection) || !blocks.length) return null
	const { from, to } = ordered(state.selection)
	const { doc, point } = deleteRangeInDoc(state.doc, from, to)
	const block = getElement(doc, point.path)
	if (!block) return null
	const prepare = (runs: TextNode[]) => (NODES[block.type]?.marks === false ? stripMarks(runs) : runs)
	const runs = runsOf(block)

	if (blocks.length === 1 && isTextblock(blocks[0])) {
		// A whole block (not a phrase cut out of one) pasted into an empty block takes its place and keeps its type.
		if (options.closed && blockLength(block) === 0 && blocks[0]!.type !== block.type && !(getElement(doc, parentPath(point.path))?.type === 'listItem' && lastIndex(point.path) === 0)) {
			const replaced = replaceChildren(doc, parentPath(point.path), lastIndex(point.path), lastIndex(point.path) + 1, [blocks[0]!])
			const path = pathOfNode(replaced, blocks[0]!)
			if (path) return finish(replaced, caret(path, blockLength(blocks[0]!)))
		}
		const pasted = prepare(runsOf(blocks[0]!))
		const length = pasted.reduce((n, r) => n + r.text.length, 0)
		return finish(setContent(doc, point.path, insertInline(runs, point.offset, pasted)), caret(point.path, point.offset + length))
	}

	let head: ElementNode = { ...block, content: sliceInline(runs, 0, point.offset) }
	let tail: ElementNode = { ...block, content: sliceInline(runs, point.offset) }
	const middle = blocks.slice()
	let mergedFirst = false
	let joinOffset: number | null = null
	// The first and last text blocks join the halves around the caret only when that half has text; otherwise they keep their own type.
	if (isTextblock(middle[0]) && blockLength(head) > 0) {
		head = { ...head, content: concatInline(runsOf(head), prepare(runsOf(middle[0]!))) }
		middle.shift()
		mergedFirst = true
	}
	const last = middle[middle.length - 1]
	if (last && isTextblock(last) && blockLength(tail) > 0) {
		joinOffset = blockLength(last)
		tail = { ...tail, content: concatInline(prepare(runsOf(last)), runsOf(tail)) }
		middle.pop()
	}

	let pieces: ElementNode[] = []
	if (mergedFirst || blockLength(head) > 0 || !middle.length) pieces.push(head)
	pieces.push(...middle)
	if (joinOffset !== null || blockLength(tail) > 0 || !middle.length) pieces.push(tail)
	// A list item starts with a paragraph.
	const parent = parentPath(point.path)
	const index = lastIndex(point.path)
	if (getElement(doc, parent)?.type === 'listItem' && index === 0) {
		const converted = asParagraph(pieces[0]!)
		pieces = [converted, ...pieces.slice(1)]
	}

	const next = replaceChildren(doc, parent, index, index + 1, pieces)
	// The caret goes after the pasted text: where the last block joined the tail, else at the end of the last inserted text block.
	let caretBlock: ElementNode | undefined
	let offset = 0
	if (joinOffset !== null) {
		caretBlock = pieces[pieces.length - 1]
		offset = joinOffset
	} else {
		const inserted = textblocks({ type: 'doc', content: middle } as Doc).pop()
		caretBlock = inserted?.node ?? pieces[pieces.length - 1]
		offset = inserted ? blockLength(inserted.node) : 0
	}
	const path = caretBlock ? pathOfNode(next, caretBlock) : null
	return path ? finish(next, caret(path, offset)) : finish(next, caret(point.path, point.offset))
}
