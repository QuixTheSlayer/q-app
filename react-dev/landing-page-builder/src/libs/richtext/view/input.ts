import { blockText, getElement } from '../doc'
import { insertHorizontalRule, setHeading, setParagraph, setTextAlign, toggleBlockquote, toggleCodeBlock } from '../commands/blocks'
import { liftListItem, listItemOf, sinkListItem, toggleBulletList, toggleOrderedList } from '../commands/lists'
import { toggleMark } from '../commands/marks'
import { deleteDirection, insertHardBreak, insertText, replaceRange, splitBlock } from '../commands/text'
import { cellPathOf, cellSelection, clearSelectedCells, findTable, goToNextCell, goToPreviousCell, isCellSelection, isInTable } from '../commands/table'
import { selectAll } from '../commands/blocks'
import { isTextSelection } from '../selection'
import type { RichTextEditorCore } from '../editor'
import type { Command, Point } from '../types'
import { copySelection, cutSelection, pasteFrom } from './clipboard'
import { parsePath, pathToString, readBlockText, readDomSelection, staticRangeToModel } from './dom'

/** State the editing surface and the input handlers share. */
export interface InputContext {
	composing: boolean
	/** Rebuild the DOM of the block at `path` (an input method changed it behind React's back). */
	rebuild(path: string): void
}

type Key = KeyboardEvent

const mod = (e: Key) => e.metaKey || e.ctrlKey

/** TipTap's keyboard shortcuts, so the editors feel the same. */
function shortcut(e: Key): { command: Command; kind?: string } | null {
	if (!mod(e)) return null
	const key = e.key.toLowerCase()
	const code = e.code
	if (!e.shiftKey && !e.altKey) {
		if (key === 'b') return { command: toggleMark('bold') }
		if (key === 'i') return { command: toggleMark('italic') }
		if (key === 'u') return { command: toggleMark('underline') }
		if (key === 'e') return { command: toggleMark('code') }
		if (key === ',') return { command: toggleMark('subscript') }
		if (key === '.') return { command: toggleMark('superscript') }
	}
	if (e.shiftKey && !e.altKey) {
		if (key === 's') return { command: toggleMark('strike') }
		if (key === 'h') return { command: toggleMark('highlight') }
		if (key === '7' || code === 'Digit7') return { command: toggleOrderedList }
		if (key === '8' || code === 'Digit8') return { command: toggleBulletList }
		if (key === 'b') return { command: toggleBlockquote }
		if (key === 'l') return { command: setTextAlign('left') }
		if (key === 'e') return { command: setTextAlign('center') }
		if (key === 'r') return { command: setTextAlign('right') }
		if (key === 'j') return { command: setTextAlign('justify') }
	}
	if (e.altKey && !e.shiftKey) {
		if (code === 'Digit0') return { command: setParagraph }
		const digit = /^Digit([1-6])$/.exec(code)
		if (digit) return { command: setHeading(Number(digit[1])) }
		if (key === 'c' || code === 'KeyC') return { command: toggleCodeBlock }
	}
	return null
}

/** Attaches the browser event handlers to the editing surface. Returns a function that removes them. */
export function attachInput(root: HTMLElement, editor: RichTextEditorCore, ctx: InputContext): () => void {
	const ownerDoc = root.ownerDocument

	const syncSelection = () => {
		if (ctx.composing) return
		const sel = readDomSelection(root)
		if (!sel) return
		// A drag from one table cell into another selects cells, not text.
		const from = findTable(editor.doc, sel.anchor.path)
		const to = findTable(editor.doc, sel.head.path)
		if (from && to && from.table.join('.') === to.table.join('.') && from.cell.join('.') !== to.cell.join('.')) {
			const anchorCell = cellPathOf(editor.doc, sel.anchor.path)
			const headCell = cellPathOf(editor.doc, sel.head.path)
			if (anchorCell && headCell) return editor.setSelection(cellSelection(editor.doc, from.table, anchorCell, headCell))
		}
		editor.setSelection(sel)
	}

	const run = (e: Event, command: Command, kind: string) => {
		e.preventDefault()
		editor.dispatch(command, kind)
	}

	// ---- beforeinput: nearly every edit arrives here. We stop the browser from changing the DOM and edit the model instead.
	const onBeforeInput = (raw: Event) => {
		const e = raw as InputEvent
		if (!editor.editable) return e.preventDefault()
		// An input method is composing: the browser edits the text, and compositionend brings the model up to date.
		if (e.isComposing || ctx.composing || e.inputType === 'insertCompositionText' || e.inputType === 'deleteCompositionText') return
		syncSelection()
		// With cells selected, deleting or typing empties them.
		if (isCellSelection(editor.state.selection)) {
			e.preventDefault()
			if (e.inputType.startsWith('delete') || e.inputType.startsWith('insert')) editor.dispatch(clearSelectedCells, 'delete')
			return
		}
		const type = e.inputType
		const range = e.getTargetRanges?.()[0]
		const target = range ? staticRangeToModel(root, range) : null
		const hasTarget = target && (target.from.offset !== target.to.offset || target.from.path.join('.') !== target.to.path.join('.'))
		const text = e.data ?? e.dataTransfer?.getData('text/plain') ?? ''

		switch (type) {
			case 'insertText':
				return run(e, insertText(text), 'typing')
			case 'insertReplacementText':
				return hasTarget ? run(e, replaceRange(target.from, target.to, text), 'other') : run(e, insertText(text), 'typing')
			case 'insertParagraph':
				return run(e, splitBlock, 'other')
			case 'insertLineBreak':
				return run(e, insertHardBreak, 'other')
			case 'deleteContentBackward':
			case 'deleteContentForward':
			case 'deleteWordBackward':
			case 'deleteWordForward':
			case 'deleteSoftLineBackward':
			case 'deleteSoftLineForward':
			case 'deleteHardLineBackward':
			case 'deleteHardLineForward': {
				// What the browser would remove (it knows the platform's idea of a character and a word).
				if (hasTarget && isTextSelection(editor.state.selection) && editor.state.selection.anchor.offset === editor.state.selection.head.offset && editor.state.selection.anchor.path.join('.') === editor.state.selection.head.path.join('.')) {
					return run(e, replaceRange(target.from, target.to, ''), 'delete')
				}
				const direction = type.endsWith('Backward') ? -1 : 1
				const unit = type.includes('Word') ? 'word' : type.includes('Line') ? 'line' : 'char'
				return run(e, deleteDirection(direction, unit), 'delete')
			}
			case 'deleteByCut':
			case 'deleteByDrag':
				return run(e, deleteDirection(-1), 'delete')
			case 'historyUndo':
				e.preventDefault()
				return void editor.undo()
			case 'historyRedo':
				e.preventDefault()
				return void editor.redo()
			case 'formatBold': return run(e, toggleMark('bold'), 'other')
			case 'formatItalic': return run(e, toggleMark('italic'), 'other')
			case 'formatUnderline': return run(e, toggleMark('underline'), 'other')
			case 'formatStrikeThrough': return run(e, toggleMark('strike'), 'other')
			case 'insertFromPaste':
			case 'insertFromPasteAsQuotation':
			case 'insertFromYank':
				e.preventDefault()
				return void pasteFrom(editor, e.dataTransfer)
			case 'insertFromDrop':
				return e.preventDefault()
			default:
				// Anything we do not know is refused, so the DOM and the model never disagree.
				return e.preventDefault()
		}
	}

	// ---- composition: let the input method work on the DOM, then read what it did.
	let composingBlock: string | null = null
	const onCompositionStart = () => {
		syncSelection()
		const sel = editor.state.selection
		composingBlock = isTextSelection(sel) ? pathToString(sel.head.path) : null
		ctx.composing = true
	}
	const onCompositionEnd = () => {
		ctx.composing = false
		const path = composingBlock
		composingBlock = null
		if (!path) return
		const block = ownerDoc.querySelector(`[data-rt-path="${path}"]`)
		const element = block && root.contains(block) ? (block as HTMLElement) : null
		if (!element) return
		const modelBlock = getElement(editor.doc, parsePath(path))
		if (!modelBlock) return
		const oldText = blockText(modelBlock)
		const newText = readBlockText(element)
		const after = readDomSelection(root)
		if (newText !== oldText) {
			let start = 0
			while (start < oldText.length && start < newText.length && oldText[start] === newText[start]) start++
			let endOld = oldText.length
			let endNew = newText.length
			while (endOld > start && endNew > start && oldText[endOld - 1] === newText[endNew - 1]) { endOld--; endNew-- }
			const from: Point = { path: parsePath(path), offset: start }
			const to: Point = { path: parsePath(path), offset: endOld }
			ctx.rebuild(path)
			editor.dispatch(replaceRange(from, to, newText.slice(start, endNew)), 'typing')
		}
		if (after) editor.setSelection(after)
	}

	// ---- keyboard
	const onKeyDown = (e: Key) => {
		if (!editor.editable || e.isComposing || ctx.composing) return
		if (mod(e) && !e.altKey && e.key.toLowerCase() === 'z') {
			e.preventDefault()
			return void (e.shiftKey ? editor.redo() : editor.undo())
		}
		if (mod(e) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'y') {
			e.preventDefault()
			return void editor.redo()
		}
		if (e.key === 'Tab' && !mod(e) && !e.altKey) {
			syncSelection()
			const sel = editor.state.selection
			if (isTextSelection(sel) && listItemOf(editor.doc, sel.head.path)) {
				e.preventDefault()
				editor.dispatch(e.shiftKey ? liftListItem : sinkListItem)
			} else if (isInTable(editor.state)) {
				e.preventDefault()
				editor.dispatch(e.shiftKey ? goToPreviousCell : goToNextCell)
			}
			return
		}
		if (mod(e) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'a') {
			e.preventDefault()
			return void editor.dispatch(selectAll)
		}
		if (mod(e) && e.key === 'Enter') {
			e.preventDefault()
			editor.dispatch(insertHorizontalRule)
			return
		}
		const found = shortcut(e)
		if (found) {
			syncSelection()
			e.preventDefault()
			editor.dispatch(found.command, found.kind ?? 'other')
		}
	}

	// ---- selection, focus, clipboard, links
	const onSelectionChange = () => {
		const s = ownerDoc.getSelection()
		if (!s || !s.anchorNode || !root.contains(s.anchorNode)) return
		syncSelection()
	}
	const onFocus = () => editor.setFocused(true)
	const onBlur = () => editor.setFocused(false)
	const onCopy = (e: ClipboardEvent) => (syncSelection(), copySelection(editor, e))
	const onCut = (e: ClipboardEvent) => editor.editable && (syncSelection(), cutSelection(editor, e))
	const onPaste = (e: ClipboardEvent) => {
		if (!editor.editable) return
		e.preventDefault()
		syncSelection()
		void pasteFrom(editor, e.clipboardData)
	}
	const onClick = (e: MouseEvent) => {
		// A link is edited, not followed.
		if ((e.target as Element | null)?.closest?.('a')) e.preventDefault()
	}
	const onDrop = (e: DragEvent) => e.preventDefault()

	root.addEventListener('beforeinput', onBeforeInput)
	root.addEventListener('compositionstart', onCompositionStart)
	root.addEventListener('compositionend', onCompositionEnd)
	root.addEventListener('keydown', onKeyDown)
	root.addEventListener('focus', onFocus)
	root.addEventListener('blur', onBlur)
	root.addEventListener('copy', onCopy)
	root.addEventListener('cut', onCut)
	root.addEventListener('paste', onPaste)
	root.addEventListener('click', onClick)
	root.addEventListener('drop', onDrop)
	ownerDoc.addEventListener('selectionchange', onSelectionChange)
	return () => {
		root.removeEventListener('beforeinput', onBeforeInput)
		root.removeEventListener('compositionstart', onCompositionStart)
		root.removeEventListener('compositionend', onCompositionEnd)
		root.removeEventListener('keydown', onKeyDown)
		root.removeEventListener('focus', onFocus)
		root.removeEventListener('blur', onBlur)
		root.removeEventListener('copy', onCopy)
		root.removeEventListener('cut', onCut)
		root.removeEventListener('paste', onPaste)
		root.removeEventListener('click', onClick)
		root.removeEventListener('drop', onDrop)
		ownerDoc.removeEventListener('selectionchange', onSelectionChange)
	}
}

