// Core types of the rich text editor.
//
// The document is plain immutable JSON in the same shape TipTap stores (`type`, `attrs`, `content`, `marks`, `text`),
// so saved pages, the importer and the published renderer need no migration. One difference inside the editor: a hard
// break is a "\n" character in a text run (converted at the TipTap JSON boundary in tiptapJson.ts), which keeps all
// inline content as text runs only.

export type Attrs = Record<string, unknown>

export interface Mark {
	type: string
	attrs?: Attrs
}

export interface TextNode {
	type: 'text'
	text: string
	marks?: Mark[]
}

export interface ElementNode {
	type: string
	attrs?: Attrs
	content?: RTNode[]
}

export type RTNode = TextNode | ElementNode

export interface Doc extends ElementNode {
	type: 'doc'
	content: ElementNode[]
}

/** Indexes from the doc down to a node, e.g. [2, 0, 1] = third block, its first child, that child's second child. */
export type Path = readonly number[]

/**
 * A caret position: the path of a text block and a character offset in that block's text (a hard break counts as one
 * character). Offsets are block-relative, so merging or splitting text runs never moves a point.
 */
export interface Point {
	path: Path
	offset: number
}

export interface TextSelection {
	type: 'text'
	anchor: Point
	head: Point
}

/** A rectangle of table cells, as picked with the mouse or Shift+arrows. `anchor` and `head` are cell paths. */
export interface CellSelection {
	type: 'cells'
	table: Path
	anchor: Path
	head: Path
}

export type Selection = TextSelection | CellSelection

export interface EditorState {
	doc: Doc
	selection: Selection
	/** Marks to apply to the next typed text when the selection is collapsed (set by toggling bold with no selection). */
	storedMarks: Mark[] | null
}

/** A command takes the state and returns the next state, or null when it does not apply. */
export type Command = (state: EditorState) => EditorState | null
