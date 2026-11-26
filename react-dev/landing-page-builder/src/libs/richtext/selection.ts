import { comparePoints, getElement, isAncestor, samePath, textblocks, textblocksBetween } from './doc'
import type { Textblock } from './doc'
import { isIsolating, isTextblock } from './schema'
import type { Doc, EditorState, Path, Point, Selection, TextSelection } from './types'

export const point = (path: Path, offset: number): Point => ({ path, offset })

export const caret = (path: Path, offset: number): TextSelection => ({ type: 'text', anchor: { path, offset }, head: { path, offset } })

export const textSelection = (anchor: Point, head: Point = anchor): TextSelection => ({ type: 'text', anchor, head })

export const isTextSelection = (sel: Selection): sel is TextSelection => sel.type === 'text'
export const isCollapsed = (sel: Selection) => isTextSelection(sel) && sel.anchor.offset === sel.head.offset && samePath(sel.anchor.path, sel.head.path)

/** The selection's start and end in document order. */
export function ordered(sel: TextSelection): { from: Point; to: Point } {
	return comparePoints(sel.anchor, sel.head) <= 0 ? { from: sel.anchor, to: sel.head } : { from: sel.head, to: sel.anchor }
}

/** The start of the document: the first text block, offset 0. */
export function startOfDoc(doc: Doc): TextSelection {
	const first = textblocks(doc)[0]
	return caret(first ? first.path : [0], 0)
}

export function createState(doc: Doc, selection?: Selection): EditorState {
	return { doc, selection: selection ?? startOfDoc(doc), storedMarks: null }
}

/** The text blocks a text selection touches, in order. */
export function selectedBlocks(doc: Doc, sel: TextSelection): Textblock[] {
	const { from, to } = ordered(sel)
	return textblocksBetween(doc, from.path, to.path)
}

/** The closest ancestor of `path` that edits never cross (a table cell), or [] for the document. */
export function isolatingAncestor(doc: Doc, path: Path): Path {
	for (let i = path.length - 1; i >= 0; i--) {
		const ancestor = path.slice(0, i)
		if (isIsolating(getElement(doc, ancestor))) return ancestor
	}
	return []
}

/** Whether two text blocks are inside the same table cell (or both outside any). */
export const sameIsolation = (doc: Doc, a: Path, b: Path) => samePath(isolatingAncestor(doc, a), isolatingAncestor(doc, b))

/** A selection inside the document after an edit that may have shortened it: offsets and paths are kept in range. */
export function clampSelection(doc: Doc, sel: Selection): Selection {
	if (sel.type === 'cells') return sel
	const fix = (p: Point): Point => {
		const block = getElement(doc, p.path)
		if (block && isTextblock(block)) {
			const len = (block.content ?? []).reduce((n, c) => n + ((c as { text?: string }).text?.length ?? 0), 0)
			return { path: p.path, offset: Math.max(0, Math.min(p.offset, len)) }
		}
		const first = textblocks(doc)[0]
		return { path: first ? first.path : [0], offset: 0 }
	}
	return { type: 'text', anchor: fix(sel.anchor), head: fix(sel.head) }
}

export { isAncestor }
