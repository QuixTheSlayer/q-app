import { getTableMap } from '@/libs/richtext/commands/table'
import { isElement } from '@/libs/richtext/schema'
import { caret } from '@/libs/richtext/selection'
import { createElement } from '@/libs/richtext/schema'
import type { Doc, EditorState, ElementNode } from '@/libs/richtext/types'
import { cellSelection } from '@/libs/richtext/commands/table'
import { p } from './helpers'

interface CellOpts {
	colspan?: number
	rowspan?: number
	header?: boolean
	colwidth?: number[] | null
}

/** A table cell holding one paragraph of `text`, with optional spans: c('A', { colspan: 2 }). */
export const c = (text: string | ElementNode[], opts: CellOpts = {}): ElementNode =>
	createElement(opts.header ? 'tableHeader' : 'tableCell', { colspan: opts.colspan ?? 1, rowspan: opts.rowspan ?? 1, colwidth: opts.colwidth ?? null }, typeof text === 'string' ? [p(text)] : text)

export const hc = (text: string, opts: CellOpts = {}) => c(text, { ...opts, header: true })

export const row = (...cells: ElementNode[]) => createElement('tableRow', undefined, cells)
export const tbl = (...rows: ElementNode[]) => createElement('table', undefined, rows)

/** A rows x cols table of cells named A, B, C... in reading order (header cells in the first row when asked). */
export function plain(rows: number, cols: number, header = false): Doc {
	let n = 0
	const body = Array.from({ length: rows }, (_, r) => row(...Array.from({ length: cols }, () => c(String.fromCharCode(65 + n++), { header: header && r === 0 }))))
	return { type: 'doc', content: [tbl(...body)] }
}

const textOf = (node: ElementNode): string => {
	const first = node.content?.[0]
	return first && isElement(first) ? ((first.content ?? []) as { text?: string }[]).map((r) => r.text ?? '').join('') : ''
}

/** The grid of the first table: slots of a row joined by spaces (a spanning cell shows in every slot it covers), rows by ' / '. # marks a header cell, _ an empty cell. */
export function gridOf(d: Doc | ElementNode, tableIndex = 0): string {
	const table = (isElement(d) && d.type === 'table' ? d : (d as Doc).content[tableIndex]) as ElementNode
	const map = getTableMap(table)
	const rows: string[] = []
	for (let r = 0; r < map.height; r++) {
		const slots: string[] = []
		for (let col = 0; col < map.width; col++) {
			const cell = map.cellAt(r, col)
			slots.push(cell ? `${cell.node.type === 'tableHeader' ? '#' : ''}${textOf(cell.node) || '_'}` : '?')
		}
		rows.push(slots.join(' '))
	}
	return rows.join(' / ')
}

/** Every row's cells in the document, with their spans: "A A2x1 / B" style, to see the real node structure. */
export function structure(table: ElementNode): string {
	return (table.content ?? [])
		.map((r) =>
			((r as ElementNode).content ?? [])
				.map((cell) => {
					const el = cell as ElementNode
					const cs = el.attrs?.colspan as number
					const rs = el.attrs?.rowspan as number
					return `${el.type === 'tableHeader' ? '#' : ''}${textOf(el) || '_'}${cs > 1 || rs > 1 ? `[${cs}x${rs}]` : ''}`
				})
				.join(' '),
		)
		.join(' / ')
}

/** Throws when the table breaks the rules: ragged rows, empty rows, bad spans or colwidth lengths. */
export function expectValidTable(table: ElementNode) {
	const map = getTableMap(table)
	const rows = table.content ?? []
	if (!rows.length) throw new Error('table has no rows')
	rows.forEach((r, i) => {
		if (!(r as ElementNode).content?.length) throw new Error(`row ${i} is empty`)
	})
	for (let r = 0; r < map.height; r++) for (let col = 0; col < map.width; col++) if (!map.cellAt(r, col)) throw new Error(`hole at ${r},${col}`)
	for (const cell of map.cells) {
		const a = cell.node.attrs ?? {}
		if (a.colspan !== cell.right - cell.left || a.rowspan !== cell.bottom - cell.top) throw new Error(`span mismatch at ${cell.row},${cell.index}`)
		if (a.colwidth != null && (a.colwidth as number[]).length !== a.colspan) throw new Error(`colwidth length at ${cell.row},${cell.index}`)
		if (!cell.node.content?.length) throw new Error(`cell ${cell.row},${cell.index} has no content`)
	}
	// Each row's own cells plus the slots covered from above fill the width.
	const covered = rows.map((_, r) => map.cells.filter((x) => x.row === r).reduce((n, x) => n + (x.right - x.left), 0))
	covered.forEach((n, r) => {
		const above = map.cells.filter((x) => x.top < r && x.bottom > r).reduce((m, x) => m + (x.right - x.left), 0)
		if (n + above !== map.width) throw new Error(`row ${r} has ${n + above} slots, table is ${map.width} wide`)
	})
}

/** A caret at the start of the first block of the cell at `cellPath`. */
export const inCell = (d: Doc, cellPath: number[]): EditorState => ({ doc: d, selection: caret([...cellPath, 0], 0), storedMarks: null })

/** A cell selection from the cell at `anchor` to the cell at `head` (paths of cells) in the table at `tablePath`. */
export const cells = (d: Doc, anchor: number[], head: number[] = anchor, tablePath: number[] = [0]): EditorState => ({
	doc: d,
	selection: cellSelection(d, tablePath, anchor, head),
	storedMarks: null,
})
