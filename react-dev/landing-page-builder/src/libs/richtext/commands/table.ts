import { comparePaths, getElement, isEmptyBlock, parentPath, replaceChildren, textblocks, updateAt } from '../doc'
import { normalizeDoc } from '../normalize'
import { createElement, isCell, isTextblock } from '../schema'
import { caret, textSelection } from '../selection'
import type { CellSelection, Command, Doc, EditorState, ElementNode, Path, Selection } from '../types'
import { finish, firstTextblock, pathOfNode } from './util'

// Tables are table > tableRow > (tableCell | tableHeader), like prosemirror-tables. A cell with colspan/rowspan > 1 covers
// several grid slots, and the rows a rowspan covers hold no cell for that slot. Every structural command reads the table
// into a grid of cells with rectangles, edits the grid, and writes the rows back (assemble), so spans stay consistent.

export interface Rect {
	left: number
	top: number
	/** Exclusive. */
	right: number
	/** Exclusive. */
	bottom: number
}

export interface MapCell extends Rect {
	node: ElementNode
	/** Index of the row that holds the cell node. */
	row: number
	/** Index of the cell node inside that row. */
	index: number
}

export interface TableMap {
	width: number
	height: number
	/** Every cell once, in reading (document) order. */
	cells: MapCell[]
	/** The cell that covers a slot (undefined for a hole in a ragged table). */
	cellAt: (row: number, col: number) => MapCell | undefined
}

const num = (v: unknown) => (typeof v === 'number' && v >= 1 ? Math.floor(v) : 1)

export function getTableMap(table: ElementNode): TableMap {
	const rows = table.content ?? []
	const height = rows.length
	const occ: (MapCell | undefined)[][] = rows.map(() => [])
	const cells: MapCell[] = []
	rows.forEach((row, r) => {
		let c = 0
		;((row as ElementNode).content ?? []).forEach((node, index) => {
			if (!isCell(node)) return
			const el = node as ElementNode
			while (occ[r]![c]) c++
			const colspan = num(el.attrs?.colspan)
			const rowspan = num(el.attrs?.rowspan)
			const cell: MapCell = { node: el, row: r, index, left: c, top: r, right: c + colspan, bottom: Math.min(r + rowspan, height) }
			for (let dr = r; dr < cell.bottom; dr++) for (let dc = c; dc < cell.right; dc++) if (!occ[dr]![dc]) occ[dr]![dc] = cell
			cells.push(cell)
			c += colspan
		})
	})
	const width = occ.reduce((w, row) => Math.max(w, row.length), 0)
	return { width, height, cells, cellAt: (row, col) => occ[row]?.[col] }
}

// ---------------------------------------------------------------- positions

/** The nearest table cell that is `blockPath` or holds it, as a path. */
export function cellPathOf(doc: Doc, blockPath: Path): Path | null {
	for (let i = blockPath.length; i > 0; i--) {
		const sub = blockPath.slice(0, i)
		if (isCell(getElement(doc, sub))) return sub
	}
	return null
}

/** The table around `path` and the cell of that table that holds it. */
export function findTable(doc: Doc, path: Path): { table: Path; cell: Path } | null {
	const cell = cellPathOf(doc, path)
	if (!cell) return null
	const table = parentPath(parentPath(cell))
	return getElement(doc, table)?.type === 'table' ? { table, cell } : null
}

export const isCellSelection = (sel: Selection): sel is CellSelection => sel.type === 'cells'

const cellOf = (map: TableMap, cellPath: Path): MapCell | undefined => {
	const index = cellPath[cellPath.length - 1]
	const row = cellPath[cellPath.length - 2]
	return map.cells.find((c) => c.row === row && c.index === index)
}

const pathOfCell = (tablePath: Path, c: MapCell): Path => [...tablePath, c.row, c.index]
const overlaps = (c: Rect, r: Rect) => c.left < r.right && c.right > r.left && c.top < r.bottom && c.bottom > r.top
const inside = (c: Rect, r: Rect) => c.left >= r.left && c.right <= r.right && c.top >= r.top && c.bottom <= r.bottom
const unite = (a: Rect, b: Rect): Rect => ({ left: Math.min(a.left, b.left), top: Math.min(a.top, b.top), right: Math.max(a.right, b.right), bottom: Math.max(a.bottom, b.bottom) })
const rectOf = (c: Rect): Rect => ({ left: c.left, top: c.top, right: c.right, bottom: c.bottom })
const cellsIn = (map: TableMap, r: Rect) => map.cells.filter((c) => overlaps(c, r))

/** Grows a rectangle until no cell sticks out of it. */
function expand(map: TableMap, r: Rect): Rect {
	let rect = r
	for (;;) {
		const out = map.cells.find((c) => overlaps(c, rect) && !inside(c, rect))
		if (!out) return rect
		rect = unite(rect, out)
	}
}

interface Ctx {
	state: EditorState
	tablePath: Path
	table: ElementNode
	map: TableMap
	/** The anchor/head cells, and the rectangle they select (grown to whole cells). */
	anchor: MapCell
	head: MapCell
	rect: Rect
}

function context(state: EditorState): Ctx | null {
	const sel = state.selection
	let tablePath: Path
	let anchorPath: Path
	let headPath: Path
	if (sel.type === 'cells') {
		tablePath = sel.table
		anchorPath = sel.anchor
		headPath = sel.head
	} else {
		const found = findTable(state.doc, sel.head.path)
		if (!found) return null
		tablePath = found.table
		headPath = found.cell
		anchorPath = cellPathOf(state.doc, sel.anchor.path) ?? found.cell
	}
	const table = getElement(state.doc, tablePath)
	if (!table || table.type !== 'table') return null
	const map = getTableMap(table)
	const anchor = cellOf(map, anchorPath)
	const head = cellOf(map, headPath)
	if (!anchor || !head) return null
	return { state, tablePath, table, map, anchor, head, rect: expand(map, unite(anchor, head)) }
}

export const isInTable = (state: EditorState): boolean => context(state) !== null

/** The selected rectangle of a table (a caret gives its cell), grown to whole cells, with the table's path and map. */
export function selectionRect(doc: Doc, selection: Selection): { table: Path; map: TableMap; rect: Rect } | null {
	const ctx = context({ doc, selection, storedMarks: null })
	return ctx ? { table: ctx.tablePath, map: ctx.map, rect: ctx.rect } : null
}

/** The paths of the cells in the selection, in reading order (a caret gives its cell). */
export function selectedCellPaths(state: EditorState): Path[] {
	const ctx = context(state)
	return ctx ? cellsIn(ctx.map, ctx.rect).map((c) => pathOfCell(ctx.tablePath, c)) : []
}

/** A cell selection between two cells (paths of cells, or of anything inside them). */
export function cellSelection(doc: Doc, tablePath: Path, anchorCellPath: Path, headCellPath: Path): CellSelection {
	return { type: 'cells', table: tablePath, anchor: cellPathOf(doc, anchorCellPath) ?? anchorCellPath, head: cellPathOf(doc, headCellPath) ?? headCellPath }
}

// ---------------------------------------------------------------- the grid

interface GridCell extends Rect {
	orig: ElementNode
	node: ElementNode
	colwidth: number[] | null
}

const widthsOf = (node: ElementNode): number[] | null => (Array.isArray(node.attrs?.colwidth) ? [...(node.attrs!.colwidth as number[])] : null)

const gridOf = (map: TableMap): GridCell[] => map.cells.map((c) => ({ ...rectOf(c), orig: c.node, node: c.node, colwidth: widthsOf(c.node) }))

const fixWidths = (w: number[] | null, span: number): number[] | null => {
	if (!w) return null
	const out = w.length === span ? w : Array.from({ length: span }, (_, i) => w[i] ?? 0)
	return out.every((x) => !x) ? null : out
}

const sameWidths = (a: unknown, b: number[] | null) => {
	if (!Array.isArray(a)) return b === null
	return !!b && a.length === b.length && a.every((v, i) => v === b[i])
}

function finalCell(g: GridCell): ElementNode {
	const colspan = g.right - g.left
	const rowspan = g.bottom - g.top
	const colwidth = fixWidths(g.colwidth, colspan)
	const attrs = g.node.attrs
	if (attrs?.colspan === colspan && attrs?.rowspan === rowspan && sameWidths(attrs?.colwidth, colwidth)) return g.node
	return { ...g.node, attrs: { ...attrs, colspan, rowspan, colwidth } }
}

interface Assembled {
	table: ElementNode
	/** Original cell node -> the node it became. */
	nodes: Map<ElementNode, ElementNode>
}

/** Writes a grid back as rows. A row left without any cell (all covered by rowspans) is dropped and the spans over it shrink. */
function assemble(table: ElementNode, grid: GridCell[], templates: (ElementNode | undefined)[]): Assembled | null {
	const tpl = templates.slice()
	for (let r = tpl.length - 1; r >= 0; r--) {
		if (grid.some((g) => g.top === r)) continue
		for (const g of grid) {
			if (g.top > r) {
				g.top--
				g.bottom--
			} else if (g.bottom > r) g.bottom--
		}
		tpl.splice(r, 1)
	}
	if (!grid.length || !tpl.length) return null
	const nodes = new Map<ElementNode, ElementNode>()
	const finals = grid.map((g) => {
		const node = finalCell(g)
		nodes.set(g.orig, node)
		return { g, node }
	})
	const rows = tpl.map((t, r) => {
		const cells = finals.filter((f) => f.g.top === r).sort((a, b) => a.g.left - b.g.left).map((f) => f.node)
		const same = t?.content && t.content.length === cells.length && t.content.every((n, i) => n === cells[i])
		return same ? t! : { ...(t ?? createElement('tableRow')), content: cells }
	})
	return { table: { ...table, content: rows }, nodes }
}

interface Built {
	doc: Doc
	tablePath: Path
	table: ElementNode
	nodes: Map<ElementNode, ElementNode>
}

function build(state: EditorState, tablePath: Path, table: ElementNode, grid: GridCell[], templates: (ElementNode | undefined)[]): Built | null {
	const out = assemble(table, grid, templates)
	if (!out) return null
	return { doc: updateAt(state.doc, tablePath, () => out.table), tablePath, table: out.table, nodes: out.nodes }
}

const buildCtx = (ctx: Ctx, grid: GridCell[], templates: (ElementNode | undefined)[]) => build(ctx.state, ctx.tablePath, ctx.table, grid, templates)

const rowTemplates = (table: ElementNode) => [...(table.content ?? [])] as (ElementNode | undefined)[]

/** A caret at the start of the cell that covers (row, col), clamped into the table. */
function caretInCell(doc: Doc, tablePath: Path, row: number, col: number): Selection {
	const table = getElement(doc, tablePath)
	const map = table && getTableMap(table)
	const cell = map?.cellAt(Math.max(0, Math.min(row, map.height - 1)), Math.max(0, Math.min(col, map.width - 1))) ?? map?.cells[0]
	const block = cell && firstTextblock(doc, pathOfCell(tablePath, cell))
	return block ? caret(block.path, 0) : caret([0], 0)
}

/** The old selection followed through the rebuild by node identity (blocks and cells keep their objects), or null when it was lost. */
function carryOver(old: EditorState, built: Built): Selection | null {
	const sel = old.selection
	if (sel.type === 'cells') {
		const find = (p: Path) => {
			const node = getElement(old.doc, p)
			const now = node && (built.nodes.get(node) ?? node)
			return now ? pathOfNode(built.doc, now) : null
		}
		const anchor = find(sel.anchor)
		const head = find(sel.head)
		return anchor && head ? { type: 'cells', table: sel.table, anchor, head } : null
	}
	const find = (p: { path: Path; offset: number }) => {
		const block = getElement(old.doc, p.path)
		const path = block && pathOfNode(built.doc, block)
		return path ? { path, offset: p.offset } : null
	}
	const anchor = find(sel.anchor)
	const head = find(sel.head)
	return anchor && head ? textSelection(anchor, head) : null
}

/** The state after a structural edit: the old selection when it survives, otherwise a caret in the cell at (row, col). */
function settle(built: Built, old: EditorState, row: number, col: number, forced?: Selection): EditorState {
	// Identity is followed before normalizing (which may rebuild untouched blocks); the structure is already valid, so paths hold.
	return finish(built.doc, forced ?? carryOver(old, built) ?? caretInCell(built.doc, built.tablePath, row, col))
}

const emptyParagraph = () => createElement('paragraph')
const isEmptyCell = (node: ElementNode) => (node.content ?? []).every((b) => isTextblock(b) && isEmptyBlock(b as ElementNode))
const newCell = (type: string): ElementNode => createElement(type, { colspan: 1, rowspan: 1, colwidth: null }, [emptyParagraph()])

// ---------------------------------------------------------------- insert and delete a table

export function insertTable(options: { rows?: number; cols?: number; withHeaderRow?: boolean } = {}): Command {
	const { rows = 3, cols = 3, withHeaderRow = true } = options
	return (state) => {
		if (rows < 1 || cols < 1 || state.selection.type !== 'text') return null
		const head = state.selection.head.path
		if (cellPathOf(state.doc, head)) return null
		const index = head[0]
		const block = index === undefined ? undefined : state.doc.content[index]
		if (!block || index === undefined) return null
		const replace = head.length === 1 && block.type === 'paragraph' && isEmptyBlock(block)
		const rowNodes = Array.from({ length: rows }, (_, r) =>
			createElement('tableRow', undefined, Array.from({ length: cols }, () => newCell(withHeaderRow && r === 0 ? 'tableHeader' : 'tableCell'))),
		)
		const nodes = [createElement('table', undefined, rowNodes), emptyParagraph()]
		const at = replace ? index : index + 1
		const next = replaceChildren(state.doc, [], at, replace ? index + 1 : at, nodes)
		return finish(next, caret([at, 0, 0, 0], 0))
	}
}

/** The first text block at or after `path`, else the last one before it. */
function caretNear(doc: Doc, path: Path): Selection {
	const all = textblocks(doc)
	const target = all.find((b) => comparePaths(b.path, path) >= 0) ?? all[all.length - 1]
	return caret(target ? target.path : [0], 0)
}

function removeTable(ctx: Ctx): EditorState {
	const { tablePath } = ctx
	const index = tablePath[tablePath.length - 1]!
	const next = normalizeDoc(replaceChildren(ctx.state.doc, parentPath(tablePath), index, index + 1, []))
	return finish(next, caretNear(next, tablePath))
}

export const deleteTable: Command = (state) => {
	const ctx = context(state)
	return ctx ? removeTable(ctx) : null
}

// ---------------------------------------------------------------- rows and columns

type Axis = 'row' | 'col'
const keys = (axis: Axis) => (axis === 'row' ? (['top', 'bottom'] as const) : (['left', 'right'] as const))

const lineIsHeader = (map: TableMap, axis: Axis, i: number) => {
	const size = axis === 'row' ? map.width : map.height
	if (!size) return false
	for (let k = 0; k < size; k++) {
		const c = axis === 'row' ? map.cellAt(i, k) : map.cellAt(k, i)
		if (c?.node.type !== 'tableHeader') return false
	}
	return true
}

/** Puts a new row/column at `index`. A cell that crosses that line grows instead of getting a neighbour. */
function insertAlong(ctx: Ctx, axis: Axis, index: number) {
	const { map } = ctx
	const [lo, hi] = keys(axis)
	const grid = gridOf(map)
	const size = axis === 'row' ? map.height : map.width
	const crossSize = axis === 'row' ? map.width : map.height
	const covered = new Array<boolean>(crossSize).fill(false)
	for (const g of grid) {
		if (g[lo] < index && g[hi] > index) {
			g[hi]++
			if (axis === 'col' && g.colwidth) g.colwidth.splice(index - g.left, 0, 0)
			const [a, b] = axis === 'row' ? [g.left, g.right] : [g.top, g.bottom]
			for (let k = a; k < b; k++) covered[k] = true
		} else if (g[lo] >= index) {
			g[lo]++
			g[hi]++
		}
	}
	// A header line is not copied into the middle of a table: the new cells take the type of the line after it instead.
	let ref: number | null = index > 0 ? index - 1 : 0
	if (lineIsHeader(map, axis, ref)) ref = index === 0 || index === size ? null : index
	for (let k = 0; k < crossSize; k++) {
		if (covered[k]) continue
		const near = ref === null ? undefined : axis === 'row' ? map.cellAt(ref, k) : map.cellAt(k, ref)
		const node = newCell(near?.node.type ?? 'tableCell')
		const rect = axis === 'row' ? { top: index, bottom: index + 1, left: k, right: k + 1 } : { left: index, right: index + 1, top: k, bottom: k + 1 }
		grid.push({ ...rect, orig: node, node, colwidth: null })
	}
	const templates = rowTemplates(ctx.table)
	if (axis === 'row') templates.splice(index, 0, undefined)
	return { grid, templates }
}

const addAlong = (axis: Axis, side: 'before' | 'after'): Command => (state) => {
	const ctx = context(state)
	if (!ctx) return null
	const index = axis === 'row' ? (side === 'before' ? ctx.rect.top : ctx.rect.bottom) : side === 'before' ? ctx.rect.left : ctx.rect.right
	const { grid, templates } = insertAlong(ctx, axis, index)
	const built = buildCtx(ctx, grid, templates)
	return built ? settle(built, state, ctx.head.top, ctx.head.left) : null
}

export const addRowBefore = addAlong('row', 'before')
export const addRowAfter = addAlong('row', 'after')
export const addColumnBefore = addAlong('col', 'before')
export const addColumnAfter = addAlong('col', 'after')

/** Removes rows/columns [a, b). Spanning cells shrink; one that started inside the range moves to its end. */
const deleteAlong = (axis: Axis): Command => (state) => {
	const ctx = context(state)
	if (!ctx) return null
	const { map } = ctx
	const [lo, hi] = keys(axis)
	const a = axis === 'row' ? ctx.rect.top : ctx.rect.left
	const b = axis === 'row' ? ctx.rect.bottom : ctx.rect.right
	const size = axis === 'row' ? map.height : map.width
	if (a <= 0 && b >= size) return removeTable(ctx)
	const len = b - a
	const grid: GridCell[] = []
	for (const g of gridOf(map)) {
		if (g[hi] <= a) {
			grid.push(g)
			continue
		}
		if (g[lo] >= b) {
			g[lo] -= len
			g[hi] -= len
			grid.push(g)
			continue
		}
		if (g[lo] >= a && g[hi] <= b) continue
		if (axis === 'col' && g.colwidth) g.colwidth.splice(Math.max(g[lo], a) - g.left, Math.min(g[hi], b) - Math.max(g[lo], a))
		const newHi = g[hi] <= b ? a : g[hi] - len
		g[lo] = Math.min(g[lo], a)
		g[hi] = newHi
		grid.push(g)
	}
	const templates = rowTemplates(ctx.table)
	if (axis === 'row') templates.splice(a, len)
	const built = buildCtx(ctx, grid, templates)
	if (!built) return removeTable(ctx)
	return settle(built, state, axis === 'row' ? a : ctx.rect.top, axis === 'row' ? ctx.rect.left : a)
}

export const deleteRow = deleteAlong('row')
export const deleteColumn = deleteAlong('col')

// ---------------------------------------------------------------- merge and split

/** The rectangle between the anchor and head cells, if whole cells fill it and it holds more than one. */
function mergePlan(state: EditorState) {
	if (state.selection.type !== 'cells') return null
	const ctx = context(state)
	if (!ctx) return null
	const rect = unite(ctx.anchor, ctx.head)
	const cells = cellsIn(ctx.map, rect)
	if (cells.length < 2 || !cells.every((c) => inside(c, rect))) return null
	return { ctx, rect, cells }
}

export const canMergeCells = (state: EditorState): boolean => mergePlan(state) !== null

export const mergeCells: Command = (state) => {
	const plan = mergePlan(state)
	if (!plan) return null
	const { ctx, rect, cells } = plan
	const ordered = [...cells].sort((a, b) => a.top - b.top || a.left - b.left)
	const first = ordered[0]!
	const blocks = ordered.filter((c) => !isEmptyCell(c.node)).flatMap((c) => c.node.content ?? [])
	// One width per merged column, taken from any cell in that column.
	const widths = Array.from({ length: rect.right - rect.left }, (_, i) => {
		const col = rect.left + i
		for (const c of ctx.map.cells) {
			if (c.left > col || c.right <= col) continue
			const w = Array.isArray(c.node.attrs?.colwidth) ? (c.node.attrs!.colwidth as number[])[col - c.left] : 0
			if (w) return w
		}
		return 0
	})
	const merged: ElementNode = { ...first.node, content: blocks.length ? blocks : [emptyParagraph()] }
	const grid: GridCell[] = []
	for (const g of gridOf(ctx.map)) {
		if (g.orig === first.node) grid.push({ ...g, node: merged, right: rect.right, bottom: rect.bottom, colwidth: widths.some((w) => w) ? widths : null })
		else if (!cells.some((c) => c.node === g.orig)) grid.push(g)
	}
	const built = buildCtx(ctx, grid, rowTemplates(ctx.table))
	if (!built) return null
	const node = built.nodes.get(first.node)
	const path = node && pathOfNode(built.doc, node)
	const block = path && firstTextblock(built.doc, path)
	return settle(built, state, rect.top, rect.left, block ? caret(block.path, 0) : undefined)
}

function splitPlan(state: EditorState) {
	const ctx = context(state)
	if (!ctx) return null
	const cells = cellsIn(ctx.map, ctx.rect)
	const cell = cells[0]
	return cells.length === 1 && cell && (cell.right - cell.left > 1 || cell.bottom - cell.top > 1) ? { ctx, cell } : null
}

export const canSplitCell = (state: EditorState): boolean => splitPlan(state) !== null

export const splitCell: Command = (state) => {
	const plan = splitPlan(state)
	if (!plan) return null
	const { ctx, cell } = plan
	const widths = widthsOf(cell.node)
	const grid: GridCell[] = []
	for (const g of gridOf(ctx.map)) {
		if (g.orig !== cell.node) {
			grid.push(g)
			continue
		}
		for (let r = cell.top; r < cell.bottom; r++) {
			for (let c = cell.left; c < cell.right; c++) {
				const w = widths?.[c - cell.left]
				const colwidth = w ? [w] : null
				const rect = { top: r, bottom: r + 1, left: c, right: c + 1 }
				if (r === cell.top && c === cell.left) grid.push({ ...g, ...rect, colwidth })
				else {
					const node = newCell(cell.node.type)
					grid.push({ ...rect, orig: node, node, colwidth })
				}
			}
		}
	}
	const built = buildCtx(ctx, grid, rowTemplates(ctx.table))
	return built ? settle(built, state, cell.top, cell.left) : null
}

// ---------------------------------------------------------------- header toggles and attributes

/** Edits the grid in place and writes it back; structure does not move, so the selection paths stay valid. */
function editCells(state: EditorState, edit: (grid: GridCell[], ctx: Ctx) => void): EditorState | null {
	const ctx = context(state)
	if (!ctx) return null
	const grid = gridOf(ctx.map)
	edit(grid, ctx)
	const built = buildCtx(ctx, grid, rowTemplates(ctx.table))
	return built ? finish(built.doc, state.selection, state.storedMarks) : null
}

const toggleType = (cells: GridCell[]) => {
	const type = cells.every((g) => g.node.type === 'tableHeader') ? 'tableCell' : 'tableHeader'
	for (const g of cells) if (g.node.type !== type) g.node = { ...g.node, type }
}

export const toggleHeaderRow: Command = (state) => editCells(state, (grid) => toggleType(grid.filter((g) => g.top === 0)))
export const toggleHeaderColumn: Command = (state) => editCells(state, (grid) => toggleType(grid.filter((g) => g.left === 0)))
export const toggleHeaderCell: Command = (state) => editCells(state, (grid, ctx) => toggleType(grid.filter((g) => overlaps(g, ctx.rect))))

/** Sets an attribute on the selected cells. Spans are not set this way (use mergeCells/splitCell). */
export const setCellAttribute = (name: string, value: unknown): Command => (state) => {
	if (name === 'colspan' || name === 'rowspan') return null
	return editCells(state, (grid, ctx) => {
		for (const g of grid) {
			if (!overlaps(g, ctx.rect)) continue
			if (name === 'colwidth') g.colwidth = Array.isArray(value) ? [...(value as number[])] : null
			else g.node = { ...g.node, attrs: { ...g.node.attrs, [name]: value } }
		}
	})
}

/** Sets the width of one column in every cell over it (a spanning cell keeps one entry per column; unset ones are 0). */
export const setColumnWidth = (tablePath: Path, columnIndex: number, width: number): Command => (state) => {
	const table = getElement(state.doc, tablePath)
	if (!table || table.type !== 'table') return null
	const map = getTableMap(table)
	if (columnIndex < 0 || columnIndex >= map.width) return null
	const grid = gridOf(map)
	for (const g of grid) {
		if (g.left > columnIndex || g.right <= columnIndex) continue
		const widths = g.colwidth ? [...g.colwidth] : new Array<number>(g.right - g.left).fill(0)
		widths[columnIndex - g.left] = width
		g.colwidth = widths
	}
	const built = build(state, tablePath, table, grid, rowTemplates(table))
	return built ? finish(built.doc, state.selection, state.storedMarks) : null
}

// ---------------------------------------------------------------- navigation

function goToCell(offset: 1 | -1): Command {
	return (state) => {
		const ctx = context(state)
		if (!ctx) return null
		const i = ctx.map.cells.findIndex((c) => c === ctx.head)
		const target = ctx.map.cells[i + offset]
		if (target) {
			const block = firstTextblock(state.doc, pathOfCell(ctx.tablePath, target))
			return block ? finish(state.doc, caret(block.path, 0)) : null
		}
		if (offset < 0) return null
		// Tab in the last cell adds a row and moves into it.
		const { grid, templates } = insertAlong(ctx, 'row', ctx.map.height)
		const built = buildCtx(ctx, grid, templates)
		if (!built) return null
		return settle(built, state, ctx.map.height, 0, caretInCell(normalizeDoc(built.doc), built.tablePath, ctx.map.height, 0))
	}
}

export const goToNextCell = goToCell(1)
export const goToPreviousCell = goToCell(-1)

// ---------------------------------------------------------------- cell selections

/** Backspace/Delete on a cell selection: every selected cell is emptied to one empty paragraph and the selection stays. */
export const clearSelectedCells: Command = (state) => {
	if (state.selection.type !== 'cells') return null
	return editCells(state, (grid, ctx) => {
		for (const g of grid) {
			if (!overlaps(g, ctx.rect)) continue
			const single = g.node.content?.length === 1 && isEmptyCell(g.node)
			if (!single) g.node = { ...g.node, content: [emptyParagraph()] }
		}
	})
}
