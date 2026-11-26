import type { Doc, EditorState, Selection } from './types'

// Undo and redo keep snapshots of the document. The document is immutable and edits share every node they do
// not change, so a snapshot costs only the nodes on the path of the edit, and no inverse operations are needed.

interface Snapshot {
	doc: Doc
	selection: Selection
}

export interface History {
	past: Snapshot[]
	future: Snapshot[]
	/** The kind and time of the last recorded edit, so a run of typing becomes one undo step. */
	group: { kind: string; time: number } | null
}

const MAX_DEPTH = 200
/** Edits of the same kind closer together than this are one undo step. */
export const GROUP_MS = 800
const GROUPED = new Set(['typing', 'delete'])

export const emptyHistory = (): History => ({ past: [], future: [], group: null })

const snapshot = (state: EditorState): Snapshot => ({ doc: state.doc, selection: state.selection })

/** Records an edit. `before` is the state the edit started from. */
export function record(history: History, before: EditorState, kind: string, now: number): History {
	const group = history.group
	if (group && GROUPED.has(kind) && group.kind === kind && now - group.time < GROUP_MS) {
		return { past: history.past, future: [], group: { kind, time: now } }
	}
	const past = [...history.past, snapshot(before)]
	if (past.length > MAX_DEPTH) past.shift()
	return { past, future: [], group: { kind, time: now } }
}

/** Ends the current group: the next edit starts a new undo step (called when the caret moves). */
export const breakGroup = (history: History): History => (history.group ? { ...history, group: null } : history)

export function undo(history: History, current: EditorState): { state: EditorState; history: History } | null {
	const previous = history.past[history.past.length - 1]
	if (!previous) return null
	return {
		state: { doc: previous.doc, selection: previous.selection, storedMarks: null },
		history: { past: history.past.slice(0, -1), future: [...history.future, snapshot(current)], group: null },
	}
}

export function redo(history: History, current: EditorState): { state: EditorState; history: History } | null {
	const next = history.future[history.future.length - 1]
	if (!next) return null
	return {
		state: { doc: next.doc, selection: next.selection, storedMarks: null },
		history: { past: [...history.past, snapshot(current)], future: history.future.slice(0, -1), group: null },
	}
}
