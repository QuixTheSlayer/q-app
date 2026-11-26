import { getElement, parentPath, replaceChildren, lastIndex, textblocks } from '../doc'
import { normalizeDoc } from '../normalize'
import { clampSelection } from '../selection'
import { isElement } from '../schema'
import type { Doc, EditorState, ElementNode, Mark, Path, RTNode, Selection } from '../types'

/** The state after an edit: structure repaired, selection kept in range. */
export function finish(doc: Doc, selection: Selection, storedMarks: Mark[] | null = null): EditorState {
	const next = normalizeDoc(doc)
	return { doc: next, selection: clampSelection(next, selection), storedMarks }
}

/** The path of `node` in `doc`, found by identity. Edits keep the objects they do not change, so this tracks a block through a restructure. */
export function pathOfNode(doc: Doc, node: RTNode): Path | null {
	const walk = (current: RTNode, path: Path): Path | null => {
		if (current === node) return path
		if (!isElement(current)) return null
		const content = current.content ?? []
		for (let i = 0; i < content.length; i++) {
			const found = walk(content[i]!, [...path, i])
			if (found) return found
		}
		return null
	}
	return walk(doc, [])
}

/** The text block that comes first/last in `node`. */
export function firstTextblock(doc: Doc, path: Path) {
	const own = textblocks(getElement(doc, path) ?? doc)
	return own[0] ? { path: [...path, ...own[0].path], node: own[0].node } : undefined
}

export function lastTextblock(doc: Doc, path: Path) {
	const own = textblocks(getElement(doc, path) ?? doc)
	const last = own[own.length - 1]
	return last ? { path: [...path, ...last.path], node: last.node } : undefined
}

/** Removes the node at `path`, and any ancestor that this leaves empty (the document itself is never removed). */
export function removeNode(doc: Doc, path: Path): Doc {
	let current = doc
	let target = path
	while (target.length) {
		const parent = parentPath(target)
		current = replaceChildren(current, parent, lastIndex(target), lastIndex(target) + 1, [])
		const parentNode = getElement(current, parent)
		if (!parent.length || (parentNode?.content?.length ?? 0) > 0) break
		target = parent
	}
	return current
}

export const asElement = (node: RTNode | undefined): ElementNode | undefined => (isElement(node) ? node : undefined)
