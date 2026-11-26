import React, { useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { selectAll } from '../commands/blocks'
import { blockLength, textblocks } from '../doc'
import type { RichTextEditorCore } from '../editor'
import { selectedCellPaths, isCellSelection } from '../commands/table'
import { caret, isTextSelection } from '../selection'
import { writeDomSelection } from './dom'
import { attachInput, type InputContext } from './input'
import { renderDoc, type RenderContext } from './render'
import './richtext.css'

export interface RichTextEditorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'contentEditable' | 'autoFocus'> {
	editor: RichTextEditorCore
	placeholder?: string
	spellCheck?: boolean
	/** Focus on mount: true keeps the selection, or 'start' / 'end' / 'all'. */
	autoFocus?: boolean | 'start' | 'end' | 'all'
}

/** The editing surface for a RichTextEditorCore: draws the document and turns what the user does into commands. */
export function RichTextEditor({ editor, placeholder, spellCheck = false, autoFocus, className, style, ...rest }: RichTextEditorProps) {
	const rootRef = useRef<HTMLDivElement>(null)
	useSyncExternalStore(editor.subscribe, editor.getSnapshot)

	const shared = useMemo(() => {
		const epochs = new Map<string, number>()
		const input: InputContext = {
			composing: false,
			rebuild: (path) => epochs.set(path, (epochs.get(path) ?? 0) + 1),
		}
		const render: RenderContext = { epochs }
		return { input, render }
	}, [])

	// Put the model's selection on the screen after every change, while the editor has focus (and an input method is not composing).
	useLayoutEffect(() => {
		const root = rootRef.current
		if (!root || shared.input.composing) return
		const active = root.ownerDocument.activeElement
		if (!(active === root || (active && root.contains(active)))) return
		if (isTextSelection(editor.state.selection)) writeDomSelection(root, editor.state.selection)
	})

	// Highlight selected table cells (the attribute is ours; React never sets it).
	useLayoutEffect(() => {
		const root = rootRef.current
		if (!root) return
		root.querySelectorAll('[data-rt-selected]').forEach((el) => el.removeAttribute('data-rt-selected'))
		const sel = editor.state.selection
		const cells = isCellSelection(sel) ? selectedCellPaths(editor.state) : []
		for (const path of cells) root.querySelector(`[data-rt-node="${path.join('.')}"]`)?.setAttribute('data-rt-selected', '')
		root.classList.toggle('rt-cellsel', cells.length > 0)
	})

	useEffect(() => {
		const root = rootRef.current
		if (!root) return
		const detach = attachInput(root, editor, shared.input)
		editor.view = {
			element: () => root,
			blur: () => root.blur(),
			focus: (position) => {
				if (position === null || position === false) return
				if (position === 'start' || position === 'end' || position === 'all') {
					const blocks = textblocks(editor.doc)
					if (position === 'all') editor.dispatch(selectAll)
					else if (blocks.length) {
						const block = position === 'start' ? blocks[0]! : blocks[blocks.length - 1]!
						editor.setSelection(caret(block.path, position === 'start' ? 0 : blockLength(block.node)))
					}
				}
				root.focus()
				if (isTextSelection(editor.state.selection)) writeDomSelection(root, editor.state.selection)
			},
		}
		if (autoFocus) editor.view.focus(autoFocus === true ? undefined : autoFocus)
		return () => {
			detach()
			if (editor.view?.element() === root) editor.view = null
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editor])

	const empty = editor.isEmpty

	return (
		<div
			{...rest}
			ref={rootRef}
			className={[className, 'rt-editor', empty ? 'rt-empty' : ''].filter(Boolean).join(' ')}
			style={{ ...style, ...(placeholder ? ({ '--rt-placeholder': JSON.stringify(placeholder) } as React.CSSProperties) : null) }}
			contentEditable={editor.editable}
			suppressContentEditableWarning
			role="textbox"
			aria-multiline="true"
			aria-readonly={!editor.editable}
			spellCheck={spellCheck}
			autoCapitalize="off"
			autoCorrect="off"
			data-rt-root=""
		>
			{renderDoc(editor.doc, shared.render)}
		</div>
	)
}
