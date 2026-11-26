import { nextBoundary, previousBoundary } from '../boundaries'
import { blockLength, blockText, getElement, lastIndex, neighbourTextblock, parentPath, replaceChildren, setContent, textblocksBetween } from '../doc'
import { concatInline, deleteInline, insertInline, marksAtCaret, run, sliceInline } from '../inline'
import { createElement, NODES } from '../schema'
import { caret, isCollapsed, isTextSelection, ordered, sameIsolation } from '../selection'
import type { Command, Doc, ElementNode, Mark, Point, TextNode } from '../types'
import { liftListItemInDoc, listItemOf } from './lists'
import { finish, pathOfNode, removeNode } from './util'

const runsOf = (block: ElementNode) => (block.content ?? []) as TextNode[]

/** Deletes the text from `from` to `to`. Blocks in between are removed and the last block's rest joins the first. */
export function deleteRangeInDoc(doc: Doc, from: Point, to: Point): { doc: Doc; point: Point } {
	if (from.path.join('.') === to.path.join('.')) {
		const block = getElement(doc, from.path)!
		return { doc: setContent(doc, from.path, deleteInline(runsOf(block), from.offset, to.offset)), point: from }
	}
	let end = to
	// Edits never join across a table cell: a range that leaves the first cell only deletes inside it.
	if (!sameIsolation(doc, from.path, to.path)) end = { path: from.path, offset: blockLength(getElement(doc, from.path)!) }
	if (end.path.join('.') === from.path.join('.')) return deleteRangeInDoc(doc, from, end)

	const blocks = textblocksBetween(doc, from.path, end.path)
	const first = blocks[0]!
	const last = blocks[blocks.length - 1]!
	const merged = concatInline(sliceInline(runsOf(first.node), 0, from.offset), sliceInline(runsOf(last.node), end.offset))
	let next = setContent(doc, first.path, merged)
	for (const b of blocks.slice(1).reverse()) next = removeNode(next, b.path)
	return { doc: next, point: from }
}

/** The collapsed state after deleting a non-empty selection, or the state itself when collapsed. */
function withoutSelection(state: Parameters<Command>[0]) {
	if (!isTextSelection(state.selection)) return null
	if (isCollapsed(state.selection)) return { doc: state.doc, point: state.selection.head, deleted: false }
	const { from, to } = ordered(state.selection)
	return { ...deleteRangeInDoc(state.doc, from, to), deleted: true }
}

export const deleteSelection: Command = (state) => {
	const base = withoutSelection(state)
	if (!base || !base.deleted) return null
	return finish(base.doc, caret(base.point.path, base.point.offset))
}

/** Replaces the range with `text`, typed with the marks around the start (used for typing and for corrections from the browser). */
export function replaceRange(from: Point, to: Point, text: string, marks?: Mark[] | null): Command {
	return (state) => {
		const { doc, point } = deleteRangeInDoc(state.doc, from, to)
		const block = getElement(doc, point.path)
		if (!block) return null
		const useMarks = NODES[block.type]?.marks === false ? [] : (marks ?? marksAtCaret(runsOf(block), point.offset))
		const runs = insertInline(runsOf(block), point.offset, text ? [run(text, useMarks)] : [])
		return finish(setContent(doc, point.path, runs), caret(point.path, point.offset + text.length))
	}
}

export const insertText = (text: string): Command => (state) => {
	if (!isTextSelection(state.selection)) return null
	const { from, to } = ordered(state.selection)
	return replaceRange(from, to, text, state.storedMarks)(state)
}

export const insertHardBreak: Command = insertText('\n')

/** Backspace (`direction` -1) or Delete (1) by character, word or line. */
export const deleteDirection = (direction: -1 | 1, unit: 'char' | 'word' | 'line' = 'char'): Command => (state) => {
	const base = withoutSelection(state)
	if (!base) return null
	if (base.deleted) return finish(base.doc, caret(base.point.path, base.point.offset))
	const { doc, point } = base
	const block = getElement(doc, point.path)!
	const text = blockText(block)

	if (direction === -1 && point.offset > 0) {
		const start = previousBoundary(text, point.offset, unit)
		const next = deleteRangeInDoc(doc, { path: point.path, offset: start }, point)
		return finish(next.doc, caret(point.path, start))
	}
	if (direction === 1 && point.offset < text.length) {
		const end = nextBoundary(text, point.offset, unit)
		const next = deleteRangeInDoc(doc, point, { path: point.path, offset: end })
		return finish(next.doc, caret(point.path, point.offset))
	}
	return direction === -1 ? joinBackward(state) : joinForward(state)
}

export const deleteBackward = deleteDirection(-1)
export const deleteForward = deleteDirection(1)

/** Backspace at the start of a block. */
function joinBackward(state: Parameters<Command>[0]) {
	if (!isTextSelection(state.selection)) return null
	const { doc } = state
	const path = state.selection.head.path
	const block = getElement(doc, path)!
	const parent = getElement(doc, parentPath(path))

	// First paragraph of a list item: take the item out of the list (one level).
	const itemPath = listItemOf(doc, path)
	if (itemPath && lastIndex(path) === 0) {
		const next = liftListItemInDoc(doc, itemPath)
		const newPath = next && pathOfNode(next, block)
		if (next && newPath) return finish(next, caret(newPath, 0))
	}
	// First block of a quote: take it out of the quote.
	if (parent?.type === 'blockquote' && lastIndex(path) === 0) {
		const quotePath = parentPath(path)
		const rest = (parent.content ?? []).slice(1)
		const replacement = rest.length ? [block, { ...parent, content: rest }] : [block]
		const next = replaceChildren(doc, parentPath(quotePath), lastIndex(quotePath), lastIndex(quotePath) + 1, replacement)
		const newPath = pathOfNode(next, block)
		if (newPath) return finish(next, caret(newPath, 0))
	}
	// A rule right before the block goes away.
	const before = lastIndex(path) > 0 ? getElement(doc, [...parentPath(path), lastIndex(path) - 1]) : undefined
	if (before?.type === 'horizontalRule') {
		const next = replaceChildren(doc, parentPath(path), lastIndex(path) - 1, lastIndex(path), [])
		return finish(next, caret([...parentPath(path), lastIndex(path) - 1], 0))
	}

	const previous = neighbourTextblock(doc, path, -1)
	if (!previous || !sameIsolation(doc, previous.path, path)) {
		// Nothing before: a heading or code block at the very start becomes a paragraph.
		if (block.type !== 'paragraph') {
			const para = createElement('paragraph', { textAlign: block.attrs?.textAlign ?? null }, runsOf(block))
			return finish(replaceChildren(doc, parentPath(path), lastIndex(path), lastIndex(path) + 1, [para]), caret(path, 0))
		}
		return null
	}
	const prevLength = blockLength(previous.node)
	const joined = concatInline(runsOf(previous.node), runsOf(block))
	let next = setContent(doc, previous.path, joined)
	// The previous path stays valid: only blocks after it are removed.
	next = removeNode(next, path)
	return finish(next, caret(previous.path, prevLength))
}

/** Delete at the end of a block. */
function joinForward(state: Parameters<Command>[0]) {
	if (!isTextSelection(state.selection)) return null
	const { doc } = state
	const path = state.selection.head.path
	const block = getElement(doc, path)!
	const length = blockLength(block)
	const following = neighbourTextblock(doc, path, 1)
	const after = getElement(doc, [...parentPath(path), lastIndex(path) + 1])
	if (after?.type === 'horizontalRule') {
		const next = replaceChildren(doc, parentPath(path), lastIndex(path) + 1, lastIndex(path) + 2, [])
		return finish(next, caret(path, length))
	}
	if (!following || !sameIsolation(doc, following.path, path)) return null
	const joined = concatInline(runsOf(block), runsOf(following.node))
	let next = setContent(doc, path, joined)
	next = removeNode(next, following.path)
	return finish(next, caret(path, length))
}

/** Enter. */
export const splitBlock: Command = (state) => {
	const base = withoutSelection(state)
	if (!base) return null
	const { doc, point } = base
	const path = point.path
	const block = getElement(doc, path)!
	const parentP = parentPath(path)
	const parent = getElement(doc, parentP)
	const runs = runsOf(block)
	const length = blockLength(block)
	const index = lastIndex(path)

	if (block.type === 'codeBlock') {
		// Two blank lines at the end leave the code block.
		if (point.offset === length && blockText(block).endsWith('\n\n')) {
			const trimmed = { ...block, content: sliceInline(runs, 0, length - 2) }
			const para = createElement('paragraph')
			const next = replaceChildren(doc, parentP, index, index + 1, [trimmed, para])
			return finish(next, caret([...parentP, index + 1], 0))
		}
		const next = setContent(doc, path, insertInline(runs, point.offset, [run('\n')]))
		return finish(next, caret(path, point.offset + 1))
	}

	const itemPath = parent?.type === 'listItem' && index === 0 ? parentP : null
	if (itemPath && length === 0 && (parent!.content?.length ?? 0) === 1) {
		const next = liftListItemInDoc(doc, itemPath)
		const newPath = next && pathOfNode(next, block)
		return next && newPath ? finish(next, caret(newPath, 0)) : null
	}
	if (parent?.type === 'blockquote' && length === 0 && index === (parent.content?.length ?? 0) - 1) {
		const quotePath = parentPath(parentP)
		const quoteIndex = lastIndex(parentP)
		const rest = (parent.content ?? []).slice(0, -1)
		const para = createElement('paragraph', { textAlign: block.attrs?.textAlign ?? null })
		const next = replaceChildren(doc, quotePath, quoteIndex, quoteIndex + 1, rest.length ? [{ ...parent, content: rest }, para] : [para])
		const newPath = pathOfNode(next, para)
		return newPath ? finish(next, caret(newPath, 0)) : null
	}

	const sameType = point.offset < length || block.type === 'paragraph'
	const firstHalf: ElementNode = { ...block, content: sliceInline(runs, 0, point.offset) }
	const secondHalf: ElementNode = sameType
		? { ...block, content: sliceInline(runs, point.offset) }
		: createElement('paragraph', { textAlign: block.attrs?.textAlign ?? null }, [])
	const marks = point.offset > 0 ? marksAtCaret(runs, point.offset) : null

	if (itemPath) {
		const item = parent!
		const listPath = parentPath(itemPath)
		const itemIndex = lastIndex(itemPath)
		const rest = (item.content ?? []).slice(1)
		const first = { ...item, content: [firstHalf] }
		const second = { ...item, content: [{ ...secondHalf, type: 'paragraph' }, ...rest] }
		const next = replaceChildren(doc, listPath, itemIndex, itemIndex + 1, [first, second])
		return finish(next, caret([...listPath, itemIndex + 1, 0], 0), marks?.length ? marks : null)
	}
	const next = replaceChildren(doc, parentP, index, index + 1, [firstHalf, secondHalf])
	return finish(next, caret([...parentP, index + 1], 0), marks?.length ? marks : null)
}
