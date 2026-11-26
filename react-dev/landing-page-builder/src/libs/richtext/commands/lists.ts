import { getElement, lastIndex, parentPath, replaceChildren, samePath } from '../doc'
import { createElement, isList } from '../schema'
import { caret, selectedBlocks, textSelection } from '../selection'
import type { Command, Doc, ElementNode, Path, RTNode, Selection } from '../types'
import { finish, pathOfNode } from './util'

// Lists are  list > listItem > (paragraph, nested list...). A command may rebuild containers but keeps the
// text block objects it does not change, so the caret can be found again with pathOfNode.

type ListKind = 'bulletList' | 'orderedList'

const listKind = (node: ElementNode | undefined): ListKind | null => (node && isList(node) ? (node.type as ListKind) : null)

/** The nearest list around `path`, as the path of the list node. */
export function closestListPath(doc: Doc, path: Path): Path | null {
	for (let i = path.length - 1; i >= 0; i--) {
		const ancestor = path.slice(0, i)
		if (isList(getElement(doc, ancestor))) return ancestor
	}
	return null
}

/** The list item that directly holds the block at `path`, if any. */
export function listItemOf(doc: Doc, path: Path): Path | null {
	const parent = parentPath(path)
	return getElement(doc, parent)?.type === 'listItem' ? parent : null
}

const sameListShape = (a: ElementNode, b: ElementNode) => a.type === b.type

/** Merges neighbouring lists of the same kind into one, around the child at `index` of `parent`. */
function joinAround(doc: Doc, parent: Path, index: number): Doc {
	let current = doc
	let at = index
	const siblings = () => getElement(current, parent)?.content ?? []
	const next = siblings()[at + 1] as ElementNode | undefined
	const here = siblings()[at] as ElementNode | undefined
	if (here && next && isList(here) && isList(next) && sameListShape(here, next)) {
		const merged = { ...here, content: [...(here.content ?? []), ...(next.content ?? [])] }
		current = replaceChildren(current, parent, at, at + 2, [merged])
	}
	const prev = at > 0 ? (siblings()[at - 1] as ElementNode | undefined) : undefined
	const now = siblings()[at] as ElementNode | undefined
	if (prev && now && isList(prev) && isList(now) && sameListShape(prev, now)) {
		const merged = { ...prev, content: [...(prev.content ?? []), ...(now.content ?? [])] }
		current = replaceChildren(current, parent, at - 1, at + 1, [merged])
		at -= 1
	}
	return current
}

/**
 * Takes the list item at `itemPath` one level out. A nested item becomes a sibling of its parent item (the items after it
 * become its own nested list); a top-level item turns into plain blocks and splits the list around it.
 */
export function liftListItemInDoc(doc: Doc, itemPath: Path): Doc | null {
	const item = getElement(doc, itemPath)
	const listPath = parentPath(itemPath)
	const list = getElement(doc, listPath)
	if (!item || item.type !== 'listItem' || !list || !isList(list)) return null
	const k = lastIndex(itemPath)
	const items = list.content ?? []
	const before = items.slice(0, k)
	const after = items.slice(k + 1)
	const holderPath = parentPath(listPath)
	const holder = getElement(doc, holderPath)

	if (holder?.type === 'listItem') {
		const grandPath = parentPath(holderPath)
		const holderIndex = lastIndex(holderPath)
		const moved: ElementNode = after.length
			? { ...item, content: [...(item.content ?? []), { ...list, content: after }] }
			: item
		// The nested list keeps only the items before; it disappears if there are none.
		const holderContent = (holder.content ?? []).flatMap((child) => (child === list ? (before.length ? [{ ...list, content: before }] : []) : [child]))
		const holderNext: ElementNode = { ...holder, content: holderContent }
		return replaceChildren(doc, grandPath, holderIndex, holderIndex + 1, [holderNext, moved])
	}

	const unwrapped: RTNode[] = [...(item.content ?? [])]
	const parts: RTNode[] = [
		...(before.length ? [{ ...list, content: before }] : []),
		...unwrapped,
		...(after.length ? [{ ...list, content: after }] : []),
	]
	return replaceChildren(doc, holderPath, lastIndex(listPath), lastIndex(listPath) + 1, parts)
}

/** Moves the list item at `itemPath` into the item before it (its nested list), one level deeper. */
export function sinkListItemInDoc(doc: Doc, itemPath: Path): Doc | null {
	const item = getElement(doc, itemPath)
	const listPath = parentPath(itemPath)
	const list = getElement(doc, listPath)
	const k = lastIndex(itemPath)
	if (!item || item.type !== 'listItem' || !list || !isList(list) || k === 0) return null
	const items = list.content as ElementNode[]
	const previous = items[k - 1]!
	const last = previous.content?.[previous.content.length - 1] as ElementNode | undefined
	let nextPrevious: ElementNode
	if (last && isList(last) && last.type === list.type) {
		nextPrevious = { ...previous, content: [...(previous.content ?? []).slice(0, -1), { ...last, content: [...(last.content ?? []), item] }] }
	} else {
		const nested = createElement(list.type, list.attrs, [item])
		nextPrevious = { ...previous, content: [...(previous.content ?? []), nested] }
	}
	return replaceChildren(doc, listPath, k - 1, k + 1, [nextPrevious])
}

/** Takes the item completely out of every list it is in, leaving its blocks in place. */
function exitLists(doc: Doc, firstBlock: ElementNode): Doc {
	let current = doc
	for (let guard = 0; guard < 16; guard++) {
		const path = pathOfNode(current, firstBlock)
		const itemPath = path ? listItemOf(current, path) : null
		if (!itemPath) break
		const next = liftListItemInDoc(current, itemPath)
		if (!next) break
		current = next
	}
	return current
}

/** Lifts the list item holding the caret out of its list (Enter in an empty item, Backspace at its start). */
export const liftListItem: Command = (state) => {
	if (state.selection.type !== 'text') return null
	const path = state.selection.head.path
	const itemPath = listItemOf(state.doc, path)
	const block = getElement(state.doc, path)
	if (!itemPath || !block) return null
	const next = liftListItemInDoc(state.doc, itemPath)
	if (!next) return null
	const newPath = pathOfNode(next, block)
	if (!newPath) return null
	return finish(next, caret(newPath, state.selection.head.offset), state.storedMarks)
}

/** Makes the list item holding the caret a child of the item above it (Tab). */
export const sinkListItem: Command = (state) => {
	if (state.selection.type !== 'text') return null
	const sel = state.selection
	const path = sel.head.path
	const itemPath = listItemOf(state.doc, path)
	const block = getElement(state.doc, path)
	if (!itemPath || !block) return null
	const next = sinkListItemInDoc(state.doc, itemPath)
	if (!next) return null
	const headPath = pathOfNode(next, block)
	const anchorBlock = getElement(state.doc, sel.anchor.path)
	const anchorPath = anchorBlock ? pathOfNode(next, anchorBlock) : null
	if (!headPath || !anchorPath) return null
	return finish(next, textSelection({ path: anchorPath, offset: sel.anchor.offset }, { path: headPath, offset: sel.head.offset }), state.storedMarks)
}

/** Whether the whole selection is inside lists of `kind`. */
export function isListActive(state: { doc: Doc; selection: Selection }, kind: ListKind): boolean {
	if (state.selection.type !== 'text') return false
	return selectedBlocks(state.doc, state.selection).every((b) => {
		const p = closestListPath(state.doc, b.path)
		return p !== null && listKind(getElement(state.doc, p)) === kind
	})
}

/** Wrap the selected blocks in a list of `kind`, turn the list they are in into `kind`, or take them out of the list when it is already `kind`. */
export const toggleList = (kind: ListKind, attrs?: Record<string, unknown>): Command => (state) => {
	if (state.selection.type !== 'text') return null
	const sel = state.selection
	const blocks = selectedBlocks(state.doc, sel)
	if (!blocks.length) return null
	const { doc } = state
	const map = new Map<ElementNode, ElementNode>()
	const anchorBlock = getElement(doc, sel.anchor.path)!
	const headBlock = getElement(doc, sel.head.path)!

	const lists = blocks.map((b) => closestListPath(doc, b.path))
	const allInLists = lists.every((p) => p !== null)

	let next: Doc = doc
	if (allInLists && isListActive(state, kind)) {
		// Already this kind everywhere: take the blocks out, last first so earlier paths stay valid.
		for (const b of [...blocks].reverse()) next = exitLists(next, b.node)
	} else if (allInLists) {
		// A different kind: change the lists the blocks are in.
		const unique = [...new Map(lists.map((p) => [(p as Path).join('.'), p as Path])).values()].sort((a, b) => b.length - a.length || b.join('.').localeCompare(a.join('.')))
		for (const listPath of unique) {
			const current = getElement(next, listPath)
			if (!current) continue
			const parent = parentPath(listPath)
			next = replaceChildren(next, parent, lastIndex(listPath), lastIndex(listPath) + 1, [{ ...current, type: kind, attrs: { ...createElement(kind).attrs, ...attrs } }])
		}
	} else {
		// Wrap runs of neighbouring blocks that are not in a list yet.
		const loose = blocks.filter((_, i) => lists[i] === null)
		const groups: { parent: Path; from: number; to: number }[] = []
		for (const b of loose) {
			const parent = parentPath(b.path)
			const index = lastIndex(b.path)
			const last = groups[groups.length - 1]
			if (last && samePath(last.parent, parent) && last.to === index - 1) last.to = index
			else groups.push({ parent, from: index, to: index })
		}
		// Later groups first: wrapping replaces several children with one, which shifts the paths after it.
		for (const g of [...groups].reverse()) {
			const parentNode = getElement(next, g.parent)!
			const original = (parentNode.content ?? []).slice(g.from, g.to + 1) as ElementNode[]
			const items = original.map((block) => {
				const para = block.type === 'paragraph' ? block : { ...block, type: 'paragraph', attrs: { textAlign: block.attrs?.textAlign ?? null } }
				if (para !== block) map.set(block, para)
				return createElement('listItem', undefined, [para])
			})
			const list = createElement(kind, attrs, items)
			next = replaceChildren(next, g.parent, g.from, g.to + 1, [list])
			next = joinAround(next, g.parent, g.from)
		}
	}

	const resolve = (block: ElementNode, offset: number) => {
		const target = map.get(block) ?? block
		const path = pathOfNode(next, target)
		return path ? { path, offset } : null
	}
	const anchor = resolve(anchorBlock, sel.anchor.offset)
	const head = resolve(headBlock, sel.head.offset)
	if (!anchor || !head) return null
	return finish(next, textSelection(anchor, head), state.storedMarks)
}

export const toggleBulletList: Command = toggleList('bulletList')
export const toggleOrderedList: Command = toggleList('orderedList')

