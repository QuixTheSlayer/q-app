import { describe, it, expect } from 'vitest'
import { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { extensions } from '@/libs/tiptap/config'

// Same shape htmlToJsonTree produces for an imported <h2>.
const HEADING_DOC = { type: 'doc', content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Imported heading' }] }] }

// A click into the text is just a selection change - the first transaction the editor sees.
function clickInto(editor: Editor) {
	editor.commands.setTextSelection(3)
	return editor.getJSON().content?.map((n) => n.type)
}

describe('TipTap trailing paragraph', () => {
	it('does not add an empty <p> when clicking into imported heading text', () => {
		const editor = new Editor({ extensions, content: HEADING_DOC })
		expect(clickInto(editor)).toEqual(['heading'])
		editor.destroy()
	})

	it('StarterKit would add one with trailingNode left on (the cause)', () => {
		const editor = new Editor({ extensions: [StarterKit], content: HEADING_DOC })
		expect(clickInto(editor)).toEqual(['heading', 'paragraph'])
		editor.destroy()
	})
})
