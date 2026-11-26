import { blockLength, getElement, setContent } from '../doc'
import { mapMarks, markRangeAround, marksAtCaret, rangeHasMark, sliceInline } from '../inline'
import { addMark, MARKS, NODES, removeMark } from '../schema'
import { caret, isCollapsed, isTextSelection, ordered, selectedBlocks, textSelection } from '../selection'
import type { Attrs, Command, Doc, EditorState, Mark, Path, TextNode, TextSelection } from '../types'
import { finish } from './util'

const runsOf = (doc: Doc, path: Path) => (getElement(doc, path)?.content ?? []) as TextNode[]
const allowsMarks = (doc: Doc, path: Path) => NODES[getElement(doc, path)?.type ?? '']?.marks !== false

interface Part { path: Path; from: number; to: number }

/** The stretch of each selected block that the selection covers, skipping blocks that hold no marks (code blocks) and empty stretches. */
export function selectedParts(doc: Doc, sel: TextSelection): Part[] {
	const { from, to } = ordered(sel)
	const blocks = selectedBlocks(doc, sel)
	return blocks
		.map((b, i) => ({
			path: b.path,
			from: i === 0 ? from.offset : 0,
			to: i === blocks.length - 1 ? to.offset : blockLength(b.node),
		}))
		.filter((part) => part.to > part.from && allowsMarks(doc, part.path))
}

const hasAttrs = (mark: Mark, attrs?: Attrs) => !attrs || Object.entries(attrs).every(([k, v]) => (mark.attrs?.[k] ?? null) === (v ?? null))

/** The marks in force at a collapsed caret: the stored ones, else those before the caret. */
export function marksInForce(state: EditorState): Mark[] {
	if (!isTextSelection(state.selection)) return []
	if (state.storedMarks) return state.storedMarks
	const { head } = state.selection
	return allowsMarks(state.doc, head.path) ? marksAtCaret(runsOf(state.doc, head.path), head.offset) : []
}

/** Whether the selection (or the caret) has the mark, with the given attributes. */
export function isMarkActive(state: EditorState, type: string, attrs?: Attrs): boolean {
	if (!isTextSelection(state.selection)) return false
	if (isCollapsed(state.selection)) return marksInForce(state).some((m) => m.type === type && hasAttrs(m, attrs))
	const parts = selectedParts(state.doc, state.selection)
	return parts.length > 0 && parts.every((part) => rangeHasMark(runsOf(state.doc, part.path), part.from, part.to, type, attrs))
}

/** The attributes of the mark at the caret, or of the first one found in the selection. Empty when there is none. */
export function getMarkAttrs(state: EditorState, type: string): Attrs {
	if (!isTextSelection(state.selection)) return {}
	if (isCollapsed(state.selection)) return marksInForce(state).find((m) => m.type === type)?.attrs ?? {}
	for (const part of selectedParts(state.doc, state.selection)) {
		for (const r of sliceInline(runsOf(state.doc, part.path), part.from, part.to)) {
			const found = r.marks?.find((m) => m.type === type)
			if (found) return found.attrs ?? {}
		}
	}
	return {}
}

const isEmptyTextStyle = (m: Mark) => m.type === 'textStyle' && Object.values(m.attrs ?? {}).every((v) => v === null || v === undefined || v === '')

/** Drops a textStyle mark that has no attribute set any more (what "unset color" leaves behind). */
const cleanMarks = (marks: Mark[]): Mark[] => marks.filter((m) => !isEmptyTextStyle(m))

function applyToMarks(state: EditorState, change: (marks: Mark[]) => Mark[]): EditorState | null {
	if (!isTextSelection(state.selection)) return null
	const sel = state.selection
	if (isCollapsed(sel)) {
		if (!allowsMarks(state.doc, sel.head.path)) return null
		return { ...state, storedMarks: cleanMarks(change(marksInForce(state))) }
	}
	const parts = selectedParts(state.doc, sel)
	if (!parts.length) return state
	let doc = state.doc
	for (const part of parts) doc = setContent(doc, part.path, mapMarks(runsOf(doc, part.path), part.from, part.to, (marks) => cleanMarks(change(marks))))
	return finish(doc, sel, null)
}

const withDefaults = (type: string, attrs?: Attrs): Mark => ({ type, ...(MARKS[type]?.defaultAttrs || attrs ? { attrs: { ...MARKS[type]?.defaultAttrs, ...attrs } } : {}) })

/** Add the mark, or merge `attrs` into the mark of that type that is already there. */
export const setMark = (type: string, attrs?: Attrs): Command => (state) =>
	applyToMarks(state, (marks) => {
		const existing = marks.find((m) => m.type === type)
		if (!existing) return addMark(marks, withDefaults(type, attrs))
		return addMark(marks, { type, attrs: { ...existing.attrs, ...attrs } })
	})

export const unsetMark = (type: string): Command => (state) => applyToMarks(state, (marks) => removeMark(marks, type))

/** Clear one attribute of a mark (unset the color of the text style) and drop the mark when nothing is left. */
export const unsetMarkAttr = (type: string, key: string): Command => (state) =>
	applyToMarks(state, (marks) => marks.map((m) => (m.type === type ? { ...m, attrs: { ...m.attrs, [key]: null } } : m)))

/** Turn the mark off when the selection already has it (with those attributes), on otherwise. */
export const toggleMark = (type: string, attrs?: Attrs): Command => (state) =>
	isMarkActive(state, type, attrs) ? unsetMark(type)(state) : setMark(type, attrs)(state)

export const unsetAllMarks: Command = (state) => applyToMarks(state, () => [])

/** Selects the whole stretch of one mark around the caret or the selection (to edit a link as a unit). */
export const extendMarkRange = (type: string): Command => (state) => {
	if (!isTextSelection(state.selection)) return null
	const { from, to } = ordered(state.selection)
	if (from.path.join('.') !== to.path.join('.')) return null
	const found = markRangeAround(runsOf(state.doc, from.path), from.offset, type)
	if (!found) return null
	return { ...state, selection: textSelection({ path: from.path, offset: found.from }, { path: from.path, offset: found.to }) }
}

export const setLink = (attrs: Attrs): Command => setMark('link', attrs)
export const unsetLink: Command = (state) => {
	const extended = isCollapsed(state.selection) ? extendMarkRange('link')(state) ?? state : state
	const done = unsetMark('link')(extended)
	return done && isCollapsed(state.selection) && isTextSelection(state.selection) ? { ...done, selection: caret(state.selection.head.path, state.selection.head.offset) } : done
}
