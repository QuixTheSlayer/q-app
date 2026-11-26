import { emptyDoc } from './doc'
import { breakGroup, emptyHistory, record, redo, undo, type History } from './history'
import { createState, isCollapsed } from './selection'
import { fromTiptap, toTiptap, toTiptapString } from './tiptapJson'
import type { Command, Doc, EditorState, Selection } from './types'

/** What the editing surface offers the controller. */
export interface ViewBridge {
	focus(position?: 'start' | 'end' | 'all' | boolean | number | null): void
	blur(): void
	element(): HTMLElement | null
}

export interface EditorOptions {
	/** TipTap JSON, as an object or its string (what the builder stores). */
	content?: unknown
	/** Or an editor document directly (used by tests and by commands that build one). */
	doc?: Doc
	editable?: boolean
	onCreate?: (editor: RichTextEditorCore) => void
	/** After every change of the document. */
	onUpdate?: (editor: RichTextEditorCore) => void
	/** After the selection moves without the document changing. */
	onSelectionUpdate?: (editor: RichTextEditorCore) => void
	onFocus?: (editor: RichTextEditorCore) => void
	onBlur?: (editor: RichTextEditorCore) => void
}

const sameSelection = (a: Selection, b: Selection) => JSON.stringify(a) === JSON.stringify(b)

/**
 * The editor without a screen: the state, undo history and subscriptions. The view (RichTextEditor) feeds it
 * what the user does, and the TipTap-style handle (handle.ts) lets the property panel drive it.
 */
export class RichTextEditorCore {
	state: EditorState
	history: History = emptyHistory()
	editable: boolean
	isFocused = false
	view: ViewBridge | null = null
	destroyed = false

	private listeners = new Set<() => void>()
	private version = 0
	private options: EditorOptions

	constructor(options: EditorOptions = {}) {
		this.options = options
		this.editable = options.editable ?? true
		this.state = createState(options.doc ?? fromTiptap(options.content))
		options.onCreate?.(this)
	}

	get doc(): Doc {
		return this.state.doc
	}

	/** For useSyncExternalStore: changes whenever the state does. */
	getSnapshot = () => this.version
	subscribe = (listener: () => void) => {
		this.listeners.add(listener)
		return () => {
			this.listeners.delete(listener)
		}
	}

	private emit() {
		this.version++
		this.listeners.forEach((l) => l())
	}

	/** Runs a command. Returns false when it did not apply. `kind` groups undo steps (typing, delete, other). */
	dispatch(command: Command, kind = 'other', now = Date.now()): boolean {
		if (this.destroyed) return false
		const before = this.state
		const next = command(before)
		if (!next) return false
		const docChanged = next.doc !== before.doc
		if (docChanged) this.history = record(this.history, before, kind, now)
		this.state = next
		this.emit()
		if (docChanged) this.options.onUpdate?.(this)
		else if (!sameSelection(before.selection, next.selection)) this.options.onSelectionUpdate?.(this)
		return true
	}

	/** The selection moved (from the screen, or a command that only selects). Stored marks end and the undo group closes. */
	setSelection(selection: Selection) {
		if (this.destroyed || sameSelection(this.state.selection, selection)) return
		this.state = { ...this.state, selection, storedMarks: null }
		this.history = breakGroup(this.history)
		this.emit()
		this.options.onSelectionUpdate?.(this)
	}

	undo(): boolean {
		const result = undo(this.history, this.state)
		if (!result) return false
		this.history = result.history
		this.state = result.state
		this.emit()
		this.options.onUpdate?.(this)
		return true
	}

	redo(): boolean {
		const result = redo(this.history, this.state)
		if (!result) return false
		this.history = result.history
		this.state = result.state
		this.emit()
		this.options.onUpdate?.(this)
		return true
	}

	get canUndo() {
		return this.history.past.length > 0
	}
	get canRedo() {
		return this.history.future.length > 0
	}

	/** Replaces the whole content. `emitUpdate` decides whether onUpdate fires (TipTap's setContent does by default). */
	setContent(content: unknown, emitUpdate = false) {
		const doc = fromTiptap(content)
		this.state = createState(doc)
		this.history = emptyHistory()
		this.emit()
		if (emitUpdate) this.options.onUpdate?.(this)
	}

	clearContent(emitUpdate = true) {
		this.state = createState(emptyDoc())
		this.history = emptyHistory()
		this.emit()
		if (emitUpdate) this.options.onUpdate?.(this)
	}

	setEditable(editable: boolean) {
		if (this.editable === editable) return
		this.editable = editable
		this.emit()
	}

	setFocused(focused: boolean) {
		if (this.isFocused === focused) return
		this.isFocused = focused
		this.emit()
		if (focused) this.options.onFocus?.(this)
		else this.options.onBlur?.(this)
	}

	/** The document as TipTap JSON. */
	getJSON() {
		return toTiptap(this.state.doc)
	}

	getJSONString() {
		return toTiptapString(this.state.doc)
	}

	get isEmpty(): boolean {
		const { content } = this.state.doc
		return content.length === 1 && content[0]!.type === 'paragraph' && !(content[0]!.content ?? []).length
	}

	get selectionIsEmpty(): boolean {
		return isCollapsed(this.state.selection)
	}

	focus(position?: 'start' | 'end' | 'all' | boolean | number | null) {
		this.view?.focus(position)
	}

	blur() {
		this.view?.blur()
	}

	destroy() {
		this.destroyed = true
		this.listeners.clear()
	}
}

