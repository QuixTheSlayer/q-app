import { describe, it, expect } from 'vitest'
import { generateHTML } from '@tiptap/react'
import { extensions } from '@/libs/tiptap/config'
import { toTiptap } from '@/libs/richtext/tiptapJson'
import {
	addColumnAfter, addColumnBefore, addRowAfter, addRowBefore, canMergeCells, canSplitCell, cellPathOf, cellSelection, clearSelectedCells,
	deleteColumn, deleteRow, deleteTable, findTable, getTableMap, goToNextCell, goToPreviousCell, insertTable, isCellSelection, isInTable,
	mergeCells, selectedCellPaths, selectionRect, setCellAttribute, setColumnWidth, splitCell, toggleHeaderCell, toggleHeaderColumn, toggleHeaderRow,
} from '@/libs/richtext/commands/table'
import type { ElementNode } from '@/libs/richtext/types'
import { at, doc, outline, p, run, sel } from './helpers'
import { c, cells, expectValidTable, gridOf, hc, inCell, plain, row, structure, tbl } from './tableHelpers'

const tableOf = (s: { doc: { content: ElementNode[] } }, i = 0) => s.doc.content[i]!
const rowCells = (t: ElementNode, r: number) => (t.content![r] as ElementNode).content as ElementNode[]
const cellAt0 = (t: ElementNode) => rowCells(t, 0)[0]!

describe('table map', () => {
	it('places cells with colspan and rowspan', () => {
		const d = doc(tbl(row(c('A', { colspan: 2 }), c('B', { rowspan: 2 })), row(c('C'), c('D'))))
		const map = getTableMap(d.content[0]!)
		expect([map.width, map.height]).toStrictEqual([3, 2])
		expect(map.cells.map((x) => [x.left, x.top, x.right, x.bottom])).toStrictEqual([[0, 0, 2, 1], [2, 0, 3, 2], [0, 1, 1, 2], [1, 1, 2, 2]])
	})
})

describe('positions', () => {
	const d = plain(2, 2)
	it('finds the table and cell around a block', () => {
		expect(findTable(d, [0, 1, 0, 0])).toEqual({ table: [0], cell: [0, 1, 0] })
		expect(cellPathOf(d, [0, 0, 1, 0])).toEqual([0, 0, 1])
	})
	it('knows when the selection is in a table', () => {
		expect(isInTable(inCell(d, [0, 0, 0]))).toBe(true)
		expect(isInTable(at(doc(p('x')), [0], 0))).toBe(false)
		expect(isInTable(cells(d, [0, 0, 0]))).toBe(true)
	})
	it('gives cell paths and the rectangle of a cell selection', () => {
		const s = cells(plain(3, 3), [0, 0, 0], [0, 1, 1])
		expect(selectedCellPaths(s)).toEqual([[0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1]])
		expect(selectionRect(s.doc, s.selection)?.rect).toEqual({ left: 0, top: 0, right: 2, bottom: 2 })
		expect(isCellSelection(s.selection)).toBe(true)
	})
	it('builds a cell selection from paths inside the cells', () => {
		const sl = cellSelection(d, [0], [0, 0, 0, 0], [0, 1, 1, 0])
		expect(sl).toEqual({ type: 'cells', table: [0], anchor: [0, 0, 0], head: [0, 1, 1] })
	})
	it('grows a selection to whole spanning cells', () => {
		const sp = doc(tbl(row(c('A'), c('B', { colspan: 2 })), row(c('C'), c('D'), c('E'))))
		const s = cells(sp, [0, 0, 0], [0, 1, 1])
		expect(selectionRect(s.doc, s.selection)?.rect).toEqual({ left: 0, top: 0, right: 3, bottom: 2 })
	})
})

describe('insertTable', () => {
	it('inserts a header row, empty cells and a paragraph after, caret in the first cell', () => {
		const s = run(at(doc(p('Hello')), [0], 5), insertTable())
		expect(s.doc.content.map((n) => n.type)).toEqual(['paragraph', 'table', 'paragraph'])
		expect(outline(tableOf(s, 1))).toBe('table[tr[th[p()], th[p()], th[p()]], tr[td[p()], td[p()], td[p()]], tr[td[p()], td[p()], td[p()]]]')
		expect(sel(s)).toBe('1.0.0.0:0')
		expectValidTable(tableOf(s, 1))
	})
	it('can skip the header row and set the size', () => {
		const s = run(at(doc(p('x')), [0], 0), insertTable({ rows: 2, cols: 4, withHeaderRow: false }))
		expect(gridOf(s.doc, 1)).toBe('_ _ _ _ / _ _ _ _')
	})
	it('replaces an empty paragraph', () => {
		const s = run(at(doc(p('a'), p()), [1], 0), insertTable({ rows: 1, cols: 1 }))
		expect(s.doc.content.map((n) => n.type)).toEqual(['paragraph', 'table', 'paragraph'])
		expect(sel(s)).toBe('1.0.0.0:0')
	})
	it('refuses inside a table and on a cell selection', () => {
		expect(insertTable()(inCell(plain(2, 2), [0, 0, 0]))).toBeNull()
		expect(insertTable()(cells(plain(2, 2), [0, 0, 0]))).toBeNull()
	})
	it('is accepted by TipTap', () => {
		const s = run(at(doc(p('x')), [0], 0), insertTable())
		expect(generateHTML(toTiptap(s.doc) as never, extensions)).toContain('<table')
	})
})

describe('add rows and columns in a plain grid', () => {
	const base = () => plain(2, 2)
	it('adds a row after, caret stays in its cell', () => {
		const s = run(inCell(base(), [0, 0, 0]), addRowAfter)
		expect(gridOf(s.doc)).toBe('A B / _ _ / C D')
		expect(sel(s)).toBe('0.0.0.0:0')
		expectValidTable(tableOf(s))
	})
	it('adds a row before', () => {
		const s = run(inCell(base(), [0, 1, 0]), addRowBefore)
		expect(gridOf(s.doc)).toBe('A B / _ _ / C D')
		expect(sel(s)).toBe('0.2.0.0:0')
	})
	it('adds a column after and before', () => {
		expect(gridOf(run(inCell(base(), [0, 0, 0]), addColumnAfter).doc)).toBe('A _ B / C _ D')
		const s = run(inCell(base(), [0, 0, 1]), addColumnBefore)
		expect(gridOf(s.doc)).toBe('A _ B / C _ D')
		expect(sel(s)).toBe('0.0.2.0:0')
	})
	it('adds after the bottom edge of a selected rectangle', () => {
		const s = run(cells(plain(3, 3), [0, 0, 0], [0, 1, 1]), addRowAfter)
		expect(gridOf(s.doc)).toBe('A B C / D E F / _ _ _ / G H I')
		expect(isCellSelection(s.selection)).toBe(true)
	})
	it('returns null outside a table', () => {
		expect(addRowAfter(at(doc(p('x')), [0], 0))).toBeNull()
	})
	it('copies header type in a header row for a new column, not for a new row after it', () => {
		const d = plain(2, 2, true)
		expect(gridOf(run(inCell(d, [0, 0, 0]), addColumnAfter).doc)).toBe('#A #_ #B / C _ D')
		expect(gridOf(run(inCell(d, [0, 0, 0]), addRowAfter).doc)).toBe('#A #B / _ _ / C D')
	})
	it('a row added before the header row is plain', () => {
		expect(gridOf(run(inCell(plain(2, 2, true), [0, 0, 0]), addRowBefore).doc)).toBe('_ _ / #A #B / C D')
	})
})

describe('add rows and columns through spans', () => {
	it('extends a rowspan cell instead of adding a cell', () => {
		const d = doc(tbl(row(c('A', { rowspan: 2 }), c('B')), row(c('C'))))
		const s = run(inCell(d, [0, 0, 1]), addRowAfter)
		expect(structure(tableOf(s))).toBe('A[1x3] B / _ / C')
		expect(gridOf(s.doc)).toBe('A B / A _ / A C')
		expectValidTable(tableOf(s))
	})
	it('a row added across a rowspan makes it taller', () => {
		const d = doc(tbl(row(c('A', { rowspan: 2 }), c('B')), row(c('C'))))
		const s = run(inCell(d, [0, 1, 0]), addRowBefore)
		expect(gridOf(s.doc)).toBe('A B / A _ / A C')
	})
	it('extends a colspan cell instead of adding a cell', () => {
		const d = doc(tbl(row(c('A', { colspan: 2 })), row(c('B'), c('C'))))
		const s = run(inCell(d, [0, 1, 0]), addColumnAfter)
		expect(structure(tableOf(s))).toBe('A[3x1] / B _ C'.replace('B _ C', 'B _ C'))
		expect(gridOf(s.doc)).toBe('A A A / B _ C'.replace('B _ C', 'B _ C'))
		expectValidTable(tableOf(s))
	})
	it('keeps a colspan cell width array in step', () => {
		const d = doc(tbl(row(c('A', { colspan: 2, colwidth: [50, 60] })), row(c('B'), c('C'))))
		const s = run(inCell(d, [0, 1, 0]), addColumnAfter)
		expect(cellAt0(tableOf(s)).attrs?.colwidth).toEqual([50, 0, 60])
	})
})

describe('delete rows and columns', () => {
	it('deletes the row of the caret', () => {
		const s = run(inCell(plain(3, 2), [0, 1, 0]), deleteRow)
		expect(gridOf(s.doc)).toBe('A B / E F')
		expect(sel(s)).toBe('0.1.0.0:0')
	})
	it('deletes the rows a selection covers', () => {
		const s = run(cells(plain(4, 2), [0, 1, 0], [0, 2, 1]), deleteRow)
		expect(gridOf(s.doc)).toBe('A B / G H')
	})
	it('deletes a column and moves the caret to the neighbour', () => {
		const s = run(inCell(plain(2, 3), [0, 0, 2]), deleteColumn)
		expect(gridOf(s.doc)).toBe('A B / D E')
		expect(sel(s)).toBe('0.0.1.0:0')
	})
	it('shrinks a rowspan that crosses a deleted row', () => {
		const d = doc(tbl(row(c('A', { rowspan: 3 }), c('B')), row(c('C')), row(c('D'))))
		const s = run(inCell(d, [0, 1, 0]), deleteRow)
		expect(gridOf(s.doc)).toBe('A B / A D')
		expect(structure(tableOf(s))).toBe('A[1x2] B / D')
	})
	it('moves a cell that starts in a deleted row down', () => {
		const d = doc(tbl(row(c('A'), c('B')), row(c('C', { rowspan: 2 }), c('D')), row(c('E'))))
		const s = run(inCell(d, [0, 1, 1]), deleteRow)
		expect(gridOf(s.doc)).toBe('A B / C E')
		expect(structure(tableOf(s))).toBe('A B / C E')
		expectValidTable(tableOf(s))
	})
	it('removes a cell fully inside the deleted rows', () => {
		const d = doc(tbl(row(c('A'), c('B', { rowspan: 2 })), row(c('C')), row(c('D'), c('E'))))
		const s = run(inCell(d, [0, 1, 0]), deleteRow)
		expect(gridOf(s.doc)).toBe('A B / D E')
	})
	it('shrinks a colspan cell when a column goes', () => {
		const d = doc(tbl(row(c('A', { colspan: 2, colwidth: [10, 20] }), c('B')), row(c('C'), c('D'), c('E'))))
		const s = run(inCell(d, [0, 1, 0]), deleteColumn)
		expect(gridOf(s.doc)).toBe('A B / D E')
		expect(cellAt0(tableOf(s)).attrs?.colwidth).toEqual([20])
		expectValidTable(tableOf(s))
	})
	it('drops the table with its last row or column, caret goes to the next block', () => {
		const one = doc(p('before'), tbl(row(c('A'), c('B'))), p('after'))
		const s = run(inCell(one, [1, 0, 0]), deleteRow)
		expect(outline(s.doc)).toBe('p(before) | p(after)')
		expect(sel(s)).toBe('1:0')
		const col = run(inCell(doc(tbl(row(c('A')), row(c('B')))), [0, 0, 0]), deleteColumn)
		expect(col.doc.content.map((n) => n.type)).toEqual(['paragraph'])
	})
	it('deleteTable removes the table', () => {
		const s = run(inCell(doc(p('a'), plain(2, 2).content[0]!), [1, 0, 0]), deleteTable)
		expect(outline(s.doc)).toBe('p(a)')
		expect(sel(s)).toBe('0:0')
	})
	it('does not leave an empty row when a rowspan covers every cell of it', () => {
		const d = doc(tbl(row(c('A', { rowspan: 2 })), row(c('B'))))
		const s = run(inCell(d, [0, 1, 0]), deleteColumn)
		expect(structure(tableOf(s))).toBe('A')
		expectValidTable(tableOf(s))
	})
})

describe('merge and split', () => {
	it('merges a rectangle, concatenating non-empty content in reading order', () => {
		const d = doc(tbl(row(c('A'), c('B'), c('C')), row(c('D'), c([p()]), c('F'))))
		const s = run(cells(d, [0, 0, 0], [0, 1, 1]), mergeCells)
		expect(structure(tableOf(s))).toBe('A[2x2] C / F')
		expect(outline(cellAt0(tableOf(s)))).toBe('td[p(A), p(B), p(D)]')
		expect(sel(s)).toBe('0.0.0.0:0')
		expectValidTable(tableOf(s))
	})
	it('keeps the type of the top-left cell', () => {
		const d = doc(tbl(row(hc('A'), c('B')), row(c('C'), c('D'))))
		const s = run(cells(d, [0, 0, 0], [0, 0, 1]), mergeCells)
		expect(structure(tableOf(s))).toBe('#A[2x1] / C D')
	})
	it('merges with the head before the anchor', () => {
		const s = run(cells(plain(2, 2), [0, 1, 1], [0, 0, 0]), mergeCells)
		// The second row would hold no cell, so it is dropped and the span shrinks with it.
		expect(gridOf(s.doc)).toBe('A A')
	})
	it('merging everything empty keeps one paragraph', () => {
		const d = doc(tbl(row(c([p()]), c([p()]))))
		const s = run(cells(d, [0, 0, 0], [0, 0, 1]), mergeCells)
		expect(outline(cellAt0(tableOf(s)))).toBe('td[p()]')
	})
	it('refuses a single cell, a caret, and a rectangle that cuts a span', () => {
		expect(canMergeCells(cells(plain(2, 2), [0, 0, 0]))).toBe(false)
		expect(canMergeCells(inCell(plain(2, 2), [0, 0, 0]))).toBe(false)
		expect(mergeCells(inCell(plain(2, 2), [0, 0, 0]))).toBeNull()
		const d = doc(tbl(row(c('A'), c('B', { colspan: 2 })), row(c('C'), c('D'), c('E'))))
		const s = cells(d, [0, 0, 0], [0, 1, 1])
		expect(canMergeCells(s)).toBe(false)
		expect(mergeCells(s)).toBeNull()
	})
	it('can merge whole spanning cells', () => {
		const d = doc(tbl(row(c('A', { colspan: 2 }), c('B')), row(c('C'), c('D'), c('E'))))
		const s = run(cells(d, [0, 0, 0], [0, 0, 1]), mergeCells)
		expect(gridOf(s.doc)).toBe('A A A / C D E')
	})
	it('drops a row that a merge leaves without cells', () => {
		const d = doc(tbl(row(c('A')), row(c('B'))))
		const s = run(cells(d, [0, 0, 0], [0, 1, 0]), mergeCells)
		expect(structure(tableOf(s))).toBe('A[1x1]'.replace('[1x1]', '') + '')
		expect(tableOf(s).content).toHaveLength(1)
		expectValidTable(tableOf(s))
	})
	it('splits a cell into 1x1 cells of the same type', () => {
		const d = doc(tbl(row(hc('A', { colspan: 2 }), hc('B')), row(c('C'), c('D'), c('E'))))
		const state = inCell(d, [0, 0, 0])
		expect(canSplitCell(state)).toBe(true)
		const s = run(state, splitCell)
		expect(structure(tableOf(s))).toBe('#A #_ #B / C D E')
		expect(sel(s)).toBe('0.0.0.0:0')
		expectValidTable(tableOf(s))
	})
	it('splits a rowspan and colspan cell over several rows', () => {
		const d = doc(tbl(row(c('A', { colspan: 2, rowspan: 2 }), c('B')), row(c('C')), row(c('D'), c('E'), c('F'))))
		const s = run(cells(d, [0, 0, 0]), splitCell)
		expect(structure(tableOf(s))).toBe('A _ B / _ _ C / D E F')
		expectValidTable(tableOf(s))
	})
	it('does not split a plain cell or a multi-cell selection', () => {
		expect(canSplitCell(inCell(plain(2, 2), [0, 0, 0]))).toBe(false)
		expect(splitCell(inCell(plain(2, 2), [0, 0, 0]))).toBeNull()
		expect(canSplitCell(cells(plain(2, 2), [0, 0, 0], [0, 1, 1]))).toBe(false)
	})
	it('keeps the split column widths', () => {
		const d = doc(tbl(row(c('A', { colspan: 2, colwidth: [30, 40] })), row(c('B'), c('C'))))
		const s = run(inCell(d, [0, 0, 0]), splitCell)
		expect(rowCells(tableOf(s), 0).map((n) => n.attrs?.colwidth)).toEqual([[30], [40]])
	})
})

describe('header toggles', () => {
	it('turns the first row into headers, then back', () => {
		const a = run(inCell(plain(2, 2), [0, 1, 1]), toggleHeaderRow)
		expect(gridOf(a.doc)).toBe('#A #B / C D')
		expect(sel(a)).toBe('0.1.1.0:0')
		expect(gridOf(run(a, toggleHeaderRow).doc)).toBe('A B / C D')
	})
	it('toggles the first column', () => {
		const a = run(inCell(plain(2, 2), [0, 0, 0]), toggleHeaderColumn)
		expect(gridOf(a.doc)).toBe('#A B / #C D')
		expect(gridOf(run(a, toggleHeaderColumn).doc)).toBe('A B / C D')
	})
	it('a partly header row becomes all headers', () => {
		const d = doc(tbl(row(hc('A'), c('B')), row(c('C'), c('D'))))
		expect(gridOf(run(inCell(d, [0, 0, 0]), toggleHeaderRow).doc)).toBe('#A #B / C D')
	})
	it('toggles the selected cells', () => {
		const s = run(cells(plain(2, 2), [0, 0, 1], [0, 1, 1]), toggleHeaderCell)
		expect(gridOf(s.doc)).toBe('A #B / C #D')
		expect(isCellSelection(s.selection)).toBe(true)
		expect(gridOf(run(s, toggleHeaderCell).doc)).toBe('A B / C D')
	})
	it('toggles the cell with the caret', () => {
		expect(gridOf(run(inCell(plain(2, 2), [0, 1, 0]), toggleHeaderCell).doc)).toBe('A B / #C D')
	})
	it('returns null outside a table', () => {
		expect(toggleHeaderRow(at(doc(p('x')), [0], 0))).toBeNull()
	})
})

describe('attributes and column widths', () => {
	it('sets an attribute on the selected cells', () => {
		const s = run(cells(plain(2, 2), [0, 0, 0], [0, 0, 1]), setCellAttribute('colwidth', [120]))
		expect(rowCells(tableOf(s), 0).map((n) => n.attrs?.colwidth)).toEqual([[120], [120]])
	})
	it('refuses to set spans by attribute', () => {
		expect(setCellAttribute('colspan', 2)(inCell(plain(2, 2), [0, 0, 0]))).toBeNull()
	})
	it('sets a column width in every cell of the column', () => {
		const s = run(inCell(plain(2, 2), [0, 0, 0]), setColumnWidth([0], 1, 200))
		const widths = (tableOf(s).content as ElementNode[]).map((r) => (r.content as ElementNode[]).map((n) => n.attrs?.colwidth))
		expect(widths).toEqual([[null, [200]], [null, [200]]])
		expect(sel(s)).toBe('0.0.0.0:0')
	})
	it('stores one entry per column for a colspan cell', () => {
		const d = doc(tbl(row(c('A', { colspan: 2 })), row(c('B'), c('C'))))
		const s = run(inCell(d, [0, 0, 0]), setColumnWidth([0], 1, 80))
		expect(cellAt0(tableOf(s)).attrs?.colwidth).toEqual([0, 80])
		const t = run(s, setColumnWidth([0], 0, 50))
		expect(cellAt0(tableOf(t)).attrs?.colwidth).toEqual([50, 80])
		expectValidTable(tableOf(t))
	})
	it('refuses a column outside the table', () => {
		expect(setColumnWidth([0], 5, 10)(inCell(plain(2, 2), [0, 0, 0]))).toBeNull()
	})
})

describe('Tab navigation', () => {
	it('moves to the start of the next cell in reading order', () => {
		const s = run(inCell(plain(2, 2), [0, 0, 1]), goToNextCell)
		expect(sel(s)).toBe('0.1.0.0:0')
	})
	it('moves to the previous cell, and refuses in the first one', () => {
		expect(sel(run(inCell(plain(2, 2), [0, 1, 0]), goToPreviousCell))).toBe('0.0.1.0:0')
		expect(goToPreviousCell(inCell(plain(2, 2), [0, 0, 0]))).toBeNull()
	})
	it('appends a row from the last cell and moves into it', () => {
		const s = run(inCell(plain(2, 2), [0, 1, 1]), goToNextCell)
		expect(gridOf(s.doc)).toBe('A B / C D / _ _')
		expect(sel(s)).toBe('0.2.0.0:0')
		expectValidTable(tableOf(s))
	})
	it('skips covered slots using reading order of cells', () => {
		const d = doc(tbl(row(c('A', { rowspan: 2 }), c('B')), row(c('C'))))
		expect(sel(run(inCell(d, [0, 0, 1]), goToNextCell))).toBe('0.1.0.0:0')
	})
	it('returns null outside a table', () => {
		expect(goToNextCell(at(doc(p('x')), [0], 0))).toBeNull()
	})
})

describe('clearSelectedCells', () => {
	it('empties every selected cell and keeps the selection', () => {
		const s = run(cells(plain(2, 2), [0, 0, 0], [0, 0, 1]), clearSelectedCells)
		expect(gridOf(s.doc)).toBe('_ _ / C D')
		expect(isCellSelection(s.selection)).toBe(true)
		expectValidTable(tableOf(s))
	})
	it('collapses several blocks to one empty paragraph', () => {
		const d = doc(tbl(row(c([p('a'), p('b')]), c('B'))))
		const s = run(cells(d, [0, 0, 0]), clearSelectedCells)
		expect(outline(cellAt0(tableOf(s)))).toBe('td[p()]')
	})
	it('only applies to a cell selection', () => {
		expect(clearSelectedCells(inCell(plain(2, 2), [0, 0, 0]))).toBeNull()
	})
})

describe('results stay valid', () => {
	it('survives a chain of edits and TipTap accepts it', () => {
		let s = inCell(plain(3, 3, true), [0, 1, 1])
		for (const cmd of [addRowAfter, addColumnBefore, deleteRow, addColumnAfter, toggleHeaderColumn]) s = run(s, cmd)
		s = run({ ...s, selection: cellSelection(s.doc, [0], [0, 0, 0], [0, 1, 1]) }, mergeCells)
		expectValidTable(tableOf(s))
		s = run({ ...s, selection: cellSelection(s.doc, [0], [0, 0, 0], [0, 0, 0]) }, splitCell)
		expectValidTable(tableOf(s))
		expect(generateHTML(toTiptap(s.doc) as never, extensions)).toContain('<table')
	})
})
