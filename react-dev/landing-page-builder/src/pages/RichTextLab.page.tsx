import { useMemo } from 'react'
import { RichTextEditorCore } from '@/libs/richtext/editor'
import { createHandle } from '@/libs/richtext/handle'
import { RichTextEditorBox } from '@/libs/richtext/view/RichTextEditorBox'

// Dev-only playground for the from-scratch rich text editor. Exposes window.__rt for browser tests.
export default function RichTextLab() {
	const { editor, handle } = useMemo(() => {
		const editor = new RichTextEditorCore({})
		const handle = createHandle(editor)
		;(window as unknown as Record<string, unknown>).__rt = { editor, handle }
		return { editor, handle }
	}, [])
	return (
		<div style={{ padding: 24, maxWidth: 1000 }}>
			<RichTextEditorBox editor={editor} handle={handle} placeholder="Type here" data-testid="rt" />
		</div>
	)
}
