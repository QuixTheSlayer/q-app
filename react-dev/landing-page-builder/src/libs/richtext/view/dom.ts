import type { Path, Point, TextSelection } from '../types'

// Mapping between the screen (DOM nodes and offsets) and the model (a text block path and a character offset).
// Every text block is rendered with a data-rt-path attribute. Inside a block, text nodes count their characters and a
// <br> counts as one character (a hard break); a <br data-rt-filler> is only there so an empty line has height.

export const PATH_ATTR = 'data-rt-path'
export const NODE_ATTR = 'data-rt-node'
export const FILLER_ATTR = 'data-rt-filler'

export const pathToString = (path: Path) => path.join('.')
export const parsePath = (value: string): Path => (value === '' ? [] : value.split('.').map(Number))

const isElement = (node: Node): node is Element => node.nodeType === 1
const isFiller = (node: Node) => isElement(node) && node.hasAttribute(FILLER_ATTR)

/** The text block element around `node`, inside `root`. */
export function blockElementOf(node: Node | null, root: HTMLElement): HTMLElement | null {
	let current: Node | null = node
	while (current && current !== root) {
		if (isElement(current) && current.hasAttribute(PATH_ATTR)) return current as HTMLElement
		current = current.parentNode
	}
	return null
}

/** The element of the model node at `path` (any node, not only text blocks). */
export function elementAtPath(root: HTMLElement, path: Path, attr: string = NODE_ATTR): HTMLElement | null {
	return root.querySelector(`[${attr}="${pathToString(path)}"]`)
}

/** How many characters of a block's content a DOM fragment holds. */
function contentLength(fragment: DocumentFragment | Element): number {
	let n = 0
	const walk = (node: Node) => {
		if (node.nodeType === 3) n += (node as Text).data.length
		else if (isElement(node)) {
			if (isFiller(node)) return
			if (node.tagName === 'BR') n += 1
			else node.childNodes.forEach(walk)
		}
	}
	fragment.childNodes.forEach(walk)
	return n
}

export const blockContentLength = (block: Element) => contentLength(block)

/** The text of a block as the screen shows it (a <br> is "\n"). Used to see what an input method changed. */
export function readBlockText(block: Element): string {
	let text = ''
	const walk = (node: Node) => {
		if (node.nodeType === 3) text += (node as Text).data
		else if (isElement(node)) {
			if (isFiller(node)) return
			if (node.tagName === 'BR') text += '\n'
			else node.childNodes.forEach(walk)
		}
	}
	block.childNodes.forEach(walk)
	return text
}

function offsetInBlock(block: HTMLElement, node: Node, offset: number): number {
	const range = document.createRange()
	range.setStart(block, 0)
	try {
		range.setEnd(node, offset)
	} catch {
		return 0
	}
	return contentLength(range.cloneContents())
}

const blocksIn = (element: Element): HTMLElement[] => [...element.querySelectorAll<HTMLElement>(`[${PATH_ATTR}]`)]

/** A DOM point as a model point, or null when it is outside the editor's text blocks. */
export function domPointToModel(root: HTMLElement, node: Node, offset: number): Point | null {
	const block = blockElementOf(node, root)
	if (block) return { path: parsePath(block.getAttribute(PATH_ATTR)!), offset: offsetInBlock(block, node, offset) }
	if (!isElement(node) || !root.contains(node)) return null
	// The point sits between blocks (in the root, a list, a table row): use the nearest text block.
	const children = [...node.childNodes]
	const after = children.slice(offset).find((c) => isElement(c) && (c.hasAttribute(PATH_ATTR) || c.querySelector(`[${PATH_ATTR}]`)))
	if (after && isElement(after)) {
		const target = after.hasAttribute(PATH_ATTR) ? (after as HTMLElement) : blocksIn(after)[0]!
		return { path: parsePath(target.getAttribute(PATH_ATTR)!), offset: 0 }
	}
	const before = children.slice(0, offset).reverse().find((c) => isElement(c) && (c.hasAttribute(PATH_ATTR) || c.querySelector(`[${PATH_ATTR}]`)))
	if (before && isElement(before)) {
		const all = before.hasAttribute(PATH_ATTR) ? [before as HTMLElement] : blocksIn(before)
		const target = all[all.length - 1]!
		return { path: parsePath(target.getAttribute(PATH_ATTR)!), offset: contentLength(target) }
	}
	return null
}

export interface DomPoint {
	node: Node
	offset: number
}

/** A model point as a DOM point. */
export function modelPointToDom(root: HTMLElement, point: Point): DomPoint | null {
	const block = elementAtPath(root, point.path, PATH_ATTR)
	if (!block) return null
	let remaining = point.offset
	let found: DomPoint | null = null
	const walk = (node: Node): boolean => {
		if (node.nodeType === 3) {
			const length = (node as Text).data.length
			if (remaining <= length) {
				found = { node, offset: remaining }
				return true
			}
			remaining -= length
			return false
		}
		if (!isElement(node) || isFiller(node)) return false
		if (node.tagName === 'BR') {
			if (remaining === 0) {
				found = { node: node.parentNode!, offset: [...node.parentNode!.childNodes].indexOf(node as ChildNode) }
				return true
			}
			remaining -= 1
			return false
		}
		for (const child of [...node.childNodes]) if (walk(child)) return true
		return false
	}
	if (!walk(block)) {
		// Past the last character: at the end of the block, before a trailing filler.
		const last = block.lastChild
		found = { node: block, offset: last && isFiller(last) ? block.childNodes.length - 1 : block.childNodes.length }
	}
	return found
}

/** The selection on the screen as a model selection, or null when it is not inside the editor. */
export function readDomSelection(root: HTMLElement): TextSelection | null {
	const selection = root.ownerDocument.getSelection()
	if (!selection || !selection.anchorNode || !selection.focusNode) return null
	if (!root.contains(selection.anchorNode) || !root.contains(selection.focusNode)) return null
	const anchor = domPointToModel(root, selection.anchorNode, selection.anchorOffset)
	const head = domPointToModel(root, selection.focusNode, selection.focusOffset)
	return anchor && head ? { type: 'text', anchor, head } : null
}

/** Puts the model selection on the screen. Does nothing when it is already there. */
export function writeDomSelection(root: HTMLElement, sel: TextSelection): void {
	const anchor = modelPointToDom(root, sel.anchor)
	const head = modelPointToDom(root, sel.head)
	if (!anchor || !head) return
	const selection = root.ownerDocument.getSelection()
	if (!selection) return
	if (
		selection.anchorNode === anchor.node && selection.anchorOffset === anchor.offset &&
		selection.focusNode === head.node && selection.focusOffset === head.offset
	) return
	selection.setBaseAndExtent(anchor.node, anchor.offset, head.node, head.offset)
}

/** A DOM range (from a beforeinput event) as model points. */
export function staticRangeToModel(root: HTMLElement, range: StaticRange): { from: Point; to: Point } | null {
	const from = domPointToModel(root, range.startContainer, range.startOffset)
	const to = domPointToModel(root, range.endContainer, range.endOffset)
	return from && to ? { from, to } : null
}
