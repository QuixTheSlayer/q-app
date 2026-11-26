import { getElement, lastIndex, parentPath, replaceChildren, samePath, textblocks } from '../doc'
import { createElement, isTextblock } from '../schema'
import { caret, isTextSelection, selectedBlocks, textSelection } from '../selection'
import type { Attrs, Command, Doc, EditorState, ElementNode, Path, Selection, TextNode } from '../types'
import { finish, pathOfNode } from './util'

// Block commands: paragraph, heading, code block, alignment, quote, rule. A block that sits first in a list item
// stays a paragraph (a list item starts with one).

const runsOf = (block: ElementNode) => (block.content ?? []) as TextNode[]

const insideListItemStart = (doc: Doc, path: Path) => getElement(doc, parentPath(path))?.type === 'listItem' && lastIndex(path) === 0

/** Replace each selected text block, keeping the selection on the same text. */
function mapBlocks(state: EditorState, change: (block: ElementNode, path: Path) => ElementNode): EditorState | null {
	if (!isTextSelection(state.selection)) return null
	const sel = state.selection
	const blocks = selectedBlocks(state.doc, sel)
	if (!blocks.length) return null
	let doc = state.doc
	const map = new Map<ElementNode, ElementNode>()
	for (const b of blocks) {
		const next = change(b.node, b.path)
		if (next === b.node) continue
		map.set(b.node, next)
		doc = replaceChildren(doc, parentPath(b.path), lastIndex(b.path), lastIndex(b.path) + 1, [next])
	}
	if (!map.size) return state
	const anchorBlock = getElement(state.doc, sel.anchor.path)!
	const headBlock = getElement(state.doc, sel.head.path)!
	const anchorPath = pathOfNode(doc, map.get(anchorBlock) ?? anchorBlock)
	const headPath = pathOfNode(doc, map.get(headBlock) ?? headBlock)
	if (!anchorPath || !headPath) return null
	return finish(doc, textSelection({ path: anchorPath, offset: sel.anchor.offset }, { path: headPath, offset: sel.head.offset }), state.storedMarks)
}

function convert(block: ElementNode, type: string, attrs: Attrs | undefined): ElementNode {
	const align = block.attrs?.textAlign ?? null
	const content = type === 'codeBlock' ? runsOf(block).map((r) => ({ type: 'text', text: r.text }) as TextNode) : runsOf(block)
	const base = type === 'codeBlock' ? attrs : { textAlign: align, ...attrs }
	return createElement(type, base, content)
}

export const setBlockType = (type: 'paragraph' | 'heading' | 'codeBlock', attrs?: Attrs): Command => (state) =>
	mapBlocks(state, (block, path) => {
		if (!isTextblock(block)) return block
		if (type !== 'paragraph' && insideListItemStart(state.doc, path)) return block
		const sameType = block.type === type && (type !== 'heading' || block.attrs?.level === attrs?.level)
		return sameType ? block : convert(block, type, attrs)
	})

export const setParagraph: Command = setBlockType('paragraph')
export const setHeading = (level: number): Command => setBlockType('heading', { level })

/** Whether every selected block is of this type (and heading level). */
export function isBlockActive(state: EditorState, type: string, attrs?: Attrs): boolean {
	if (!isTextSelection(state.selection)) return false
	const blocks = selectedBlocks(state.doc, state.selection)
	return blocks.length > 0 && blocks.every((b) => b.node.type === type && (!attrs || Object.entries(attrs).every(([k, v]) => (b.node.attrs?.[k] ?? null) === (v ?? null))))
}

export const toggleHeading = (level: number): Command => (state) => (isBlockActive(state, 'heading', { level }) ? setParagraph(state) : setHeading(level)(state))
export const toggleCodeBlock: Command = (state) => (isBlockActive(state, 'codeBlock') ? setParagraph(state) : setBlockType('codeBlock')(state))

/** The attributes of the first selected text block (its type is in `type`). */
export function blockInfo(state: EditorState): { type: string; attrs: Attrs } | null {
	if (!isTextSelection(state.selection)) return null
	const first = selectedBlocks(state.doc, state.selection)[0]
	return first ? { type: first.node.type, attrs: first.node.attrs ?? {} } : null
}

/** Text alignment of every selected paragraph and heading; `null` clears it. */
export const setTextAlign = (align: string | null): Command => (state) =>
	mapBlocks(state, (block) => (block.type === 'paragraph' || block.type === 'heading' ? (((block.attrs?.textAlign ?? null) === align) ? block : { ...block, attrs: { ...block.attrs, textAlign: align } }) : block))

export function isAlignActive(state: EditorState, align: string): boolean {
	if (!isTextSelection(state.selection)) return false
	const blocks = selectedBlocks(state.doc, state.selection).filter((b) => b.node.type === 'paragraph' || b.node.type === 'heading')
	return blocks.length > 0 && blocks.every((b) => (b.node.attrs?.textAlign ?? 'left') === align || (align === 'left' && !b.node.attrs?.textAlign))
}

/** Wrap the selected sibling blocks in a quote, or take them out of the quote they are in. */
export const toggleBlockquote: Command = (state) => {
	if (!isTextSelection(state.selection)) return null
	const sel = state.selection
	const blocks = selectedBlocks(state.doc, sel)
	if (!blocks.length) return null
	const quoteOf = (path: Path): Path | null => {
		const parent = parentPath(path)
		return getElement(state.doc, parent)?.type === 'blockquote' ? parent : null
	}
	const anchorBlock = getElement(state.doc, sel.anchor.path)!
	const headBlock = getElement(state.doc, sel.head.path)!
	let doc = state.doc
	if (blocks.every((b) => quoteOf(b.path))) {
		const quotes = [...new Map(blocks.map((b) => [quoteOf(b.path)!.join('.'), quoteOf(b.path)!])).values()].sort((a, b) => b.join('.').localeCompare(a.join('.'), undefined, { numeric: true }))
		for (const q of quotes) {
			const quote = getElement(doc, q)!
			doc = replaceChildren(doc, parentPath(q), lastIndex(q), lastIndex(q) + 1, quote.content ?? [])
		}
	} else {
		const parent = parentPath(blocks[0]!.path)
		if (!blocks.every((b) => samePath(parentPath(b.path), parent))) return null
		const from = lastIndex(blocks[0]!.path)
		const to = lastIndex(blocks[blocks.length - 1]!.path)
		const inner = (getElement(doc, parent)!.content ?? []).slice(from, to + 1)
		doc = replaceChildren(doc, parent, from, to + 1, [createElement('blockquote', undefined, inner)])
	}
	const anchorPath = pathOfNode(doc, anchorBlock)
	const headPath = pathOfNode(doc, headBlock)
	if (!anchorPath || !headPath) return null
	return finish(doc, textSelection({ path: anchorPath, offset: sel.anchor.offset }, { path: headPath, offset: sel.head.offset }), state.storedMarks)
}

/** A horizontal rule after the block with the caret, with a paragraph after it to continue in. */
export const insertHorizontalRule: Command = (state) => {
	if (!isTextSelection(state.selection)) return null
	const path = state.selection.head.path
	const para = createElement('paragraph')
	const doc = replaceChildren(state.doc, parentPath(path), lastIndex(path) + 1, lastIndex(path) + 1, [createElement('horizontalRule'), para])
	const newPath = pathOfNode(doc, para)
	return newPath ? finish(doc, caret(newPath, 0)) : null
}

export const selectAll: Command = (state) => {
	const all = textblocks(state.doc)
	if (!all.length) return null
	const first = all[0]!
	const last = all[all.length - 1]!
	const length = runsOf(last.node).reduce((n, r) => n + r.text.length, 0)
	const selection: Selection = textSelection({ path: first.path, offset: 0 }, { path: last.path, offset: length })
	return { ...state, selection }
}
