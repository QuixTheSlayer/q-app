import { addMark, markInclusive, removeMark, sameMarks, sortMarks } from './schema'
import type { Attrs, Mark, TextNode } from './types'

// Inline content is a list of text runs. These helpers work on character offsets in the whole run list,
// and always hand back a normalized list (no empty runs, neighbours with the same marks merged).

export const run = (text: string, marks?: Mark[]): TextNode => (marks && marks.length ? { type: 'text', text, marks } : { type: 'text', text })

export function normalizeInline(runs: TextNode[]): TextNode[] {
	const out: TextNode[] = []
	for (const r of runs) {
		if (!r.text) continue
		const marks = r.marks?.length ? sortMarks(r.marks) : undefined
		const last = out[out.length - 1]
		if (last && sameMarks(last.marks, marks)) out[out.length - 1] = run(last.text + r.text, marks)
		else out.push(run(r.text, marks))
	}
	return out
}

export const inlineLength = (runs: TextNode[]) => runs.reduce((n, r) => n + r.text.length, 0)
export const inlineText = (runs: TextNode[]) => runs.map((r) => r.text).join('')

/** The characters from `from` to `to` (exclusive) with their marks. */
export function sliceInline(runs: TextNode[], from: number, to: number = inlineLength(runs)): TextNode[] {
	const out: TextNode[] = []
	let pos = 0
	for (const r of runs) {
		const start = pos
		const end = pos + r.text.length
		pos = end
		if (end <= from || start >= to) continue
		out.push(run(r.text.slice(Math.max(0, from - start), Math.min(r.text.length, to - start)), r.marks))
	}
	return out
}

export const concatInline = (...lists: TextNode[][]): TextNode[] => normalizeInline(lists.flat())

export const insertInline = (runs: TextNode[], offset: number, inserted: TextNode[]): TextNode[] =>
	concatInline(sliceInline(runs, 0, offset), inserted, sliceInline(runs, offset))

export const deleteInline = (runs: TextNode[], from: number, to: number): TextNode[] =>
	concatInline(sliceInline(runs, 0, from), sliceInline(runs, to))

/** The marks of the character at `offset` (the one after the caret). Empty outside the text. */
export function marksOfCharAt(runs: TextNode[], offset: number): Mark[] {
	let pos = 0
	for (const r of runs) {
		if (offset >= pos && offset < pos + r.text.length) return r.marks ?? []
		pos += r.text.length
	}
	return []
}

/**
 * The marks typed text gets at a caret: those of the character before it, except marks that are not inclusive
 * (a link) when the character after the caret does not carry them too. At the start of a block the character after it is used.
 */
export function marksAtCaret(runs: TextNode[], offset: number): Mark[] {
	if (offset <= 0) return marksOfCharAt(runs, 0)
	const before = marksOfCharAt(runs, offset - 1)
	const after = marksOfCharAt(runs, offset)
	return before.filter((mark) => markInclusive(mark.type) || after.some((m) => m.type === mark.type && sameMarks([m], [mark])))
}

/** Change the marks of the characters from `from` to `to` with `fn`. */
export function mapMarks(runs: TextNode[], from: number, to: number, fn: (marks: Mark[]) => Mark[]): TextNode[] {
	const middle = sliceInline(runs, from, to).map((r) => run(r.text, fn(r.marks ?? [])))
	return concatInline(sliceInline(runs, 0, from), middle, sliceInline(runs, to))
}

export const addMarkInRange = (runs: TextNode[], from: number, to: number, mark: Mark) => mapMarks(runs, from, to, (marks) => addMark(marks, mark))
export const removeMarkInRange = (runs: TextNode[], from: number, to: number, type: string) => mapMarks(runs, from, to, (marks) => removeMark(marks, type))

/** Whether every character from `from` to `to` has a mark of `type` (and the given attributes, if any). */
export function rangeHasMark(runs: TextNode[], from: number, to: number, type: string, attrs?: Attrs): boolean {
	const part = sliceInline(runs, from, to)
	if (!part.length) return false
	return part.every((r) => (r.marks ?? []).some((m) => m.type === type && (!attrs || Object.entries(attrs).every(([k, v]) => (m.attrs?.[k] ?? null) === (v ?? null)))))
}

/** Whether any character from `from` to `to` has a mark of `type`. */
export const rangeHasAnyMark = (runs: TextNode[], from: number, to: number, type: string) =>
	sliceInline(runs, from, to).some((r) => (r.marks ?? []).some((m) => m.type === type))

/** The mark of `type` on the character at `offset - 1` (or `offset` at the start), if any. */
export function markAtCaret(runs: TextNode[], offset: number, type: string): Mark | undefined {
	return marksAtCaret(runs, offset).find((m) => m.type === type)
}

/** The range around `offset` where one mark of `type` (same attributes) continues without a break. */
export function markRangeAround(runs: TextNode[], offset: number, type: string): { from: number; to: number; mark: Mark } | null {
	const text = inlineLength(runs)
	const at = (i: number) => (i < 0 || i >= text ? undefined : marksOfCharAt(runs, i).find((m) => m.type === type))
	const probe = at(offset) ? offset : at(offset - 1) ? offset - 1 : -1
	if (probe < 0) return null
	const mark = at(probe)!
	let from = probe
	let to = probe + 1
	while (from > 0 && at(from - 1) && sameMarks([at(from - 1)!], [mark])) from--
	while (to < text && at(to) && sameMarks([at(to)!], [mark])) to++
	return { from, to, mark }
}
