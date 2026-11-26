import { blockText, comparePaths, textblocks } from '../doc'
import type { RichTextEditorCore } from '../editor'
import { replaceRange } from '../commands/text'
import { isTextSelection, ordered, point, textSelection } from '../selection'
import type { Path } from '../types'

export interface Match {
	path: Path
	from: number
	to: number
}

/** Every place `query` occurs, in document order (a match never spans two blocks). */
export function findMatches(editor: RichTextEditorCore, query: string, matchCase = false): Match[] {
	if (!query) return []
	const needle = matchCase ? query : query.toLowerCase()
	const out: Match[] = []
	for (const { path, node } of textblocks(editor.doc)) {
		const text = matchCase ? blockText(node) : blockText(node).toLowerCase()
		for (let i = text.indexOf(needle); i !== -1; i = text.indexOf(needle, i + needle.length)) out.push({ path, from: i, to: i + needle.length })
	}
	return out
}

const select = (editor: RichTextEditorCore, m: Match) => {
	editor.setSelection(textSelection(point(m.path, m.from), point(m.path, m.to)))
	editor.view?.focus(null)
}

/** Selects the next match after the caret (wrapping round). Returns false when there is none. */
export function findNext(editor: RichTextEditorCore, query: string, matchCase = false): boolean {
	const matches = findMatches(editor, query, matchCase)
	if (!matches.length) return false
	const sel = editor.state.selection
	const after = isTextSelection(sel) ? ordered(sel).to : null
	const next =
		(after && matches.find((m) => comparePaths(m.path, after.path) > 0 || (comparePaths(m.path, after.path) === 0 && m.from >= after.offset))) ?? matches[0]!
	select(editor, next)
	return true
}

/** Replaces the selected match (or selects the next one first). Returns false when nothing was found. */
export function replaceOne(editor: RichTextEditorCore, query: string, text: string, matchCase = false): boolean {
	const sel = editor.state.selection
	if (isTextSelection(sel)) {
		const { from, to } = ordered(sel)
		const hit = findMatches(editor, query, matchCase).find((m) => m.path.join('.') === from.path.join('.') && m.from === from.offset && m.to === to.offset)
		if (hit) {
			editor.dispatch(replaceRange(point(hit.path, hit.from), point(hit.path, hit.to), text))
			findNext(editor, query, matchCase)
			return true
		}
	}
	return findNext(editor, query, matchCase)
}

/** Replaces every match in one undo step. Returns how many were replaced. */
export function replaceAll(editor: RichTextEditorCore, query: string, text: string, matchCase = false): number {
	const matches = findMatches(editor, query, matchCase)
	if (!matches.length) return 0
	editor.dispatch((state) => {
		let cur = state
		for (const m of [...matches].reverse()) cur = replaceRange(point(m.path, m.from), point(m.path, m.to), text)(cur) ?? cur
		return cur
	})
	return matches.length
}
