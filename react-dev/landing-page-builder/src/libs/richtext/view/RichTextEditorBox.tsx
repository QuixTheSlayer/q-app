import { useState } from 'react'
import { sanitizeHtml } from '@/utils/sanitizeHtml'
import type { RichTextEditorCore } from '../editor'
import type { RichTextHandle } from '../handle'
import { docToHtml, htmlToDoc } from '../html'
import { RichTextEditor, type RichTextEditorProps } from './RichTextEditor'
import { RichTextToolbar, type EditorView } from './RichTextToolbar'

interface BoxProps extends Omit<RichTextEditorProps, 'editor'> {
	editor: RichTextEditorCore
	handle: RichTextHandle
	/** Height of the writing area in px (the box can be resized taller or shorter from its corner). */
	height?: number
}

/** The editor with its toolbar docked on top, a Source (HTML) view, a Preview, and a resizable writing area. */
export function RichTextEditorBox({ editor, handle, height = 220, className, style, ...rest }: BoxProps) {
	const [mode, setMode] = useState<EditorView>('edit')
	const [source, setSource] = useState('')

	const changeMode = (next: EditorView) => {
		if (mode === 'source' && next !== 'source') editor.setContent(htmlToDoc(source), true)
		if (next === 'source') setSource(docToHtml(editor.doc))
		setMode(next)
	}

	return (
		<div className="rt-boxed rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-900">
			<RichTextToolbar handle={handle} view={{ mode, onChange: changeMode }} className="rounded-b-none rounded-t-2xl border-0 border-b border-dashed shadow-none" />
			<div className="overflow-auto p-3" style={{ height, minHeight: 100, resize: 'vertical' }}>
				{mode === 'edit' && <RichTextEditor editor={editor} className={['prose max-w-none outline-none', className].filter(Boolean).join(' ')} style={{ minHeight: '100%', ...style }} {...rest} />}
				{mode === 'source' && <textarea aria-label="HTML source" value={source} onChange={(e) => setSource(e.target.value)} spellCheck={false} className="size-full resize-none bg-transparent font-mono text-sm outline-none" />}
				{mode === 'preview' && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(docToHtml(editor.doc)) as string }} />}
			</div>
		</div>
	)
}
