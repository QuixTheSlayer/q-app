import { insertFragment, sliceFragment } from '../commands/fragment'
import { deleteSelection, insertText } from '../commands/text'
import { blockLength, getElement } from '../doc'
import type { RichTextEditorCore } from '../editor'
import { blocksToHtml, docToText, htmlToFragment, textToBlocks } from '../html'
import { isCollapsed, isTextSelection, ordered } from '../selection'
import type { Doc, ElementNode } from '../types'

/** Our own copy format: lets a paste inside the editor keep everything (the HTML is for other applications). */
export const FRAGMENT_MIME = 'application/x-richtext-fragment'

interface Fragment {
	blocks: ElementNode[]
	/** The copy covered whole blocks, not a phrase cut out of one. */
	closed: boolean
}

function currentFragment(editor: RichTextEditorCore): Fragment | null {
	const sel = editor.state.selection
	if (!isTextSelection(sel) || isCollapsed(sel)) return null
	const { from, to } = ordered(sel)
	const blocks = sliceFragment(editor.doc, from, to)
	if (!blocks.length) return null
	const single = from.path.join('.') === to.path.join('.')
	const block = getElement(editor.doc, from.path)
	const closed = !single || (!!block && from.offset === 0 && to.offset === blockLength(block))
	return { blocks, closed }
}

export function copySelection(editor: RichTextEditorCore, e: ClipboardEvent): void {
	const fragment = currentFragment(editor)
	if (!fragment || !e.clipboardData) return
	e.preventDefault()
	e.clipboardData.setData('text/html', blocksToHtml(fragment.blocks))
	e.clipboardData.setData('text/plain', docToText({ type: 'doc', content: fragment.blocks } as Doc))
	e.clipboardData.setData(FRAGMENT_MIME, JSON.stringify(fragment))
}

export function cutSelection(editor: RichTextEditorCore, e: ClipboardEvent): void {
	if (!currentFragment(editor)) return
	copySelection(editor, e)
	editor.dispatch(deleteSelection, 'delete')
}

/** Pastes what is on the clipboard (or in a drop): our own format first, then HTML, then plain text. */
export function pasteFrom(editor: RichTextEditorCore, data: DataTransfer | null): void {
	if (!data) return
	const sel = editor.state.selection
	const target = isTextSelection(sel) ? getElement(editor.doc, sel.head.path) : undefined
	const plain = data.getData('text/plain')

	// Code stays text, whatever it was copied from.
	if (target?.type === 'codeBlock') {
		if (plain) editor.dispatch(insertText(plain.replace(/\r\n?/g, '\n')), 'other')
		return
	}

	const own = data.getData(FRAGMENT_MIME)
	if (own) {
		try {
			const fragment = JSON.parse(own) as Fragment
			if (Array.isArray(fragment.blocks) && fragment.blocks.length) {
				editor.dispatch(insertFragment(fragment.blocks, { closed: fragment.closed }), 'other')
				return
			}
		} catch {
			// Not ours after all: fall through to the HTML.
		}
	}

	const html = data.getData('text/html')
	if (html) {
		const parsed = htmlToFragment(html)
		if (parsed.blocks.length) {
			editor.dispatch(insertFragment(parsed.blocks, { closed: !parsed.inlineOnly }), 'other')
			return
		}
	}

	if (plain) editor.dispatch(insertFragment(textToBlocks(plain)), 'other')
}
