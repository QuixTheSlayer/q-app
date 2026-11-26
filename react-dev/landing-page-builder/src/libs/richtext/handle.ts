import { insertHorizontalRule, isAlignActive, isBlockActive, blockInfo, selectAll, setHeading, setParagraph, setTextAlign, toggleBlockquote, toggleCodeBlock, toggleHeading } from './commands/blocks'
import { isListActive, liftListItem, sinkListItem, toggleBulletList, toggleOrderedList } from './commands/lists'
import { extendMarkRange, getMarkAttrs, isMarkActive, setLink, setMark, toggleMark, unsetAllMarks, unsetLink, unsetMark, unsetMarkAttr } from './commands/marks'
import { addColumnAfter, addColumnBefore, addRowAfter, addRowBefore, clearSelectedCells, deleteColumn, deleteRow, deleteTable, goToNextCell, goToPreviousCell, insertTable, mergeCells, setCellAttribute, splitCell, toggleHeaderCell, toggleHeaderColumn, toggleHeaderRow } from './commands/table'
import { getElement } from './doc'
import type { RichTextEditorCore } from './editor'
import { docToHtml, docToText } from './html'
import { caret, isCollapsed, isTextSelection, ordered, textSelection } from './selection'
import type { Attrs, Command, EditorState } from './types'

// A TipTap-shaped handle over the editor, so the property panel and action menu (which call
// `editor.chain().focus().toggleBold().run()`, `editor.isActive(...)`, `editor.getAttributes(...)`) keep working unchanged.

type Args = unknown[]

const fontAttr = (key: string) => (value: unknown) => setMark('textStyle', { [key]: value })
const unsetFontAttr = (key: string) => () => unsetMarkAttr('textStyle', key)

/** Everything that can sit in a chain, by TipTap's command names. Each builds a command from the call's arguments. */
const FACTORIES: Record<string, (...args: Args) => Command> = {
	toggleBold: () => toggleMark('bold'),
	toggleItalic: () => toggleMark('italic'),
	toggleUnderline: () => toggleMark('underline'),
	toggleStrike: () => toggleMark('strike'),
	toggleCode: () => toggleMark('code'),
	toggleSubscript: () => toggleMark('subscript'),
	toggleSuperscript: () => toggleMark('superscript'),
	toggleHighlight: (attrs) => toggleMark('highlight', attrs as Attrs | undefined),
	setHighlight: (attrs) => setMark('highlight', attrs as Attrs | undefined),
	unsetHighlight: () => unsetMark('highlight'),
	setColor: fontAttr('color'),
	unsetColor: unsetFontAttr('color'),
	setFontSize: fontAttr('fontSize'),
	unsetFontSize: unsetFontAttr('fontSize'),
	setFontFamily: fontAttr('fontFamily'),
	unsetFontFamily: unsetFontAttr('fontFamily'),
	setLineHeight: fontAttr('lineHeight'),
	unsetLineHeight: unsetFontAttr('lineHeight'),
	setTextAlign: (align) => setTextAlign(align as string),
	unsetTextAlign: () => setTextAlign(null),
	setParagraph: () => setParagraph,
	setHeading: (attrs) => setHeading(Number((attrs as { level?: number })?.level) || 1),
	toggleHeading: (attrs) => toggleHeading(Number((attrs as { level?: number })?.level) || 1),
	toggleBulletList: () => toggleBulletList,
	toggleOrderedList: () => toggleOrderedList,
	toggleBlockquote: () => toggleBlockquote,
	toggleCodeBlock: () => toggleCodeBlock,
	setHorizontalRule: () => insertHorizontalRule,
	sinkListItem: () => sinkListItem,
	liftListItem: () => liftListItem,
	extendMarkRange: (name) => extendMarkRange(String(name)),
	setLink: (attrs) => setLink((attrs ?? {}) as Attrs),
	unsetLink: () => unsetLink,
	setMark: (name, attrs) => setMark(String(name), attrs as Attrs | undefined),
	unsetMark: (name) => unsetMark(String(name)),
	toggleMark: (name, attrs) => toggleMark(String(name), attrs as Attrs | undefined),
	unsetAllMarks: () => unsetAllMarks,
	selectAll: () => selectAll,
	insertTable: (options) => insertTable((options ?? {}) as { rows?: number; cols?: number; withHeaderRow?: boolean }),
	deleteTable: () => deleteTable,
	addRowBefore: () => addRowBefore,
	addRowAfter: () => addRowAfter,
	addColumnBefore: () => addColumnBefore,
	addColumnAfter: () => addColumnAfter,
	deleteRow: () => deleteRow,
	deleteColumn: () => deleteColumn,
	mergeCells: () => mergeCells,
	splitCell: () => splitCell,
	mergeOrSplit: () => (state) => mergeCells(state) ?? splitCell(state),
	toggleHeaderRow: () => toggleHeaderRow,
	toggleHeaderColumn: () => toggleHeaderColumn,
	toggleHeaderCell: () => toggleHeaderCell,
	setCellAttribute: (name, value) => setCellAttribute(String(name), value),
	goToNextCell: () => goToNextCell,
	goToPreviousCell: () => goToPreviousCell,
	clearSelectedCells: () => clearSelectedCells,
	setTextSelection: (range) => (state) => {
		if (!isTextSelection(state.selection)) return null
		const { from, to } = typeof range === 'number' ? { from: range, to: range } : (range as { from: number; to: number })
		return { ...state, selection: textSelectionByOffset(state, from, to) }
	},
}

/** A selection from character offsets counted across the text blocks (the builder only uses this to restore a caret). */
function textSelectionByOffset(state: EditorState, from: number, to: number) {
	const blocks: { path: readonly number[]; length: number }[] = []
	const walk = (node: { content?: unknown[]; type: string }, path: readonly number[]) => {
		const content = (node.content ?? []) as { type: string; text?: string; content?: unknown[] }[]
		if (content.length && content.every((c) => c.type === 'text')) blocks.push({ path, length: content.reduce((n, c) => n + (c.text?.length ?? 0), 0) })
		else content.forEach((c, i) => c.type !== 'text' && walk(c as never, [...path, i]))
		if (!content.length && node.type !== 'doc' && node.type !== 'horizontalRule') blocks.push({ path, length: 0 })
	}
	walk(state.doc as never, [])
	const locate = (target: number) => {
		let left = target
		for (const b of blocks) {
			if (left <= b.length) return { path: b.path, offset: left }
			left -= b.length + 1
		}
		const last = blocks[blocks.length - 1]!
		return { path: last.path, offset: last.length }
	}
	return textSelection(locate(from), locate(to))
}

export interface ChainApi {
	focus(position?: 'start' | 'end' | 'all' | boolean | number | null): ChainApi
	run(): boolean
	[command: string]: (...args: never[]) => unknown
}

export interface RichTextHandle {
	readonly editor: RichTextEditorCore
	readonly isFocused: boolean
	readonly isEmpty: boolean
	readonly isEditable: boolean
	readonly state: { selection: { empty: boolean; from: number; to: number } }
	getJSON(): unknown
	getHTML(): string
	getText(): string
	getAttributes(name: string): Attrs
	isActive(nameOrAttrs: string | Attrs, attrs?: Attrs): boolean
	chain(): ChainApi
	commands: Record<string, (...args: unknown[]) => boolean>
	destroy(): void
}

function isActive(state: EditorState, nameOrAttrs: string | Attrs, attrs?: Attrs): boolean {
	if (typeof nameOrAttrs !== 'string') {
		const align = (nameOrAttrs as { textAlign?: string }).textAlign
		return align ? isAlignActive(state, align) : false
	}
	switch (nameOrAttrs) {
		case 'bold': case 'italic': case 'underline': case 'strike': case 'code': case 'subscript': case 'superscript':
		case 'highlight': case 'link': case 'textStyle':
			return isMarkActive(state, nameOrAttrs, attrs)
		case 'paragraph': case 'heading': case 'codeBlock':
			return isBlockActive(state, nameOrAttrs, attrs)
		case 'bulletList': case 'orderedList':
			return isListActive(state, nameOrAttrs)
		case 'blockquote': case 'listItem': case 'table': {
			if (!isTextSelection(state.selection)) return false
			let path = state.selection.head.path
			while (path.length) {
				path = path.slice(0, -1)
				if (getElement(state.doc, path)?.type === nameOrAttrs) return true
			}
			return false
		}
		default:
			return false
	}
}

function getAttributes(state: EditorState, name: string): Attrs {
	if (['bold', 'italic', 'underline', 'strike', 'code', 'subscript', 'superscript', 'highlight', 'link', 'textStyle'].includes(name)) return getMarkAttrs(state, name)
	const info = blockInfo(state)
	return info && info.type === name ? info.attrs : {}
}

export function createHandle(editor: RichTextEditorCore): RichTextHandle {
	const commandNames = Object.keys(FACTORIES)

	const chain = (): ChainApi => {
		const steps: Command[] = []
		let focusAfter: Parameters<ChainApi['focus']>[0] | undefined
		let wantsFocus = false
		const api = new Proxy({} as ChainApi, {
			get(_t, prop: string) {
				if (prop === 'focus') {
					return (position?: Parameters<ChainApi['focus']>[0]) => {
						wantsFocus = true
						focusAfter = position
						return api
					}
				}
				if (prop === 'run') {
					return () => {
						if (wantsFocus) editor.focus(focusAfter)
						let ok = true
						// One undo step for the whole chain; a step that does not apply is skipped, like TipTap's chain.
						editor.dispatch((state) => {
							let current = state
							for (const step of steps) {
								const next = step(current)
								if (next) current = next
								else ok = false
							}
							return current
						})
						return ok
					}
				}
				const make = FACTORIES[prop]
				if (!make) throw new Error(`The rich text editor has no command "${prop}"`)
				return (...args: Args) => {
					steps.push(make(...args))
					return api
				}
			},
		})
		return api
	}

	const commands = Object.fromEntries(commandNames.map((name) => [name, (...args: Args) => editor.dispatch(FACTORIES[name]!(...args))])) as RichTextHandle['commands']
	commands.focus = (position?: unknown) => (editor.focus(position as never), true)
	commands.clearContent = () => (editor.clearContent(), true)
	commands.undo = () => editor.undo()
	commands.redo = () => editor.redo()

	return {
		editor,
		get isFocused() {
			return editor.isFocused
		},
		get isEmpty() {
			return editor.isEmpty
		},
		get isEditable() {
			return editor.editable
		},
		get state() {
			const sel = editor.state.selection
			if (!isTextSelection(sel)) return { selection: { empty: false, from: 0, to: 0 } }
			const { from, to } = ordered(sel)
			return { selection: { empty: isCollapsed(sel), from: from.offset, to: to.offset } }
		},
		getJSON: () => editor.getJSON(),
		getHTML: () => docToHtml(editor.doc),
		getText: () => docToText(editor.doc),
		getAttributes: (name) => getAttributes(editor.state, name),
		isActive: (nameOrAttrs, attrs) => isActive(editor.state, nameOrAttrs, attrs),
		chain,
		commands,
		destroy: () => editor.destroy(),
	}
}

export { caret }
