import { describe, it, expect } from 'vitest'
import { isListActive, liftListItem, sinkListItem, toggleBulletList, toggleList, toggleOrderedList } from '@/libs/richtext/commands/lists'
import { at, doc, li, ol, outline, p, run, sel, ul, h } from './helpers'

describe('toggleList', () => {
	it('wraps a paragraph in a bullet list', () => {
		const s = run(at(doc(p('a')), [0], 1), toggleBulletList)
		expect(outline(s.doc)).toBe('ul[li[p(a)]]')
		expect(sel(s)).toBe('0.0.0:1')
	})

	it('wraps several blocks into one list', () => {
		const s = run(at(doc(p('a'), p('b'), p('c')), [0], 0, { path: [2], offset: 1 }), toggleBulletList)
		expect(outline(s.doc)).toBe('ul[li[p(a)], li[p(b)], li[p(c)]]')
		expect(sel(s)).toBe('0.0.0:0-0.2.0:1')
	})

	it('joins the new list with a neighbouring list of the same kind', () => {
		const s = run(at(doc(ul(li(p('a'))), p('b'), ul(li(p('c')))), [1], 0), toggleBulletList)
		expect(outline(s.doc)).toBe('ul[li[p(a)], li[p(b)], li[p(c)]]')
	})

	it('does not join a list of the other kind', () => {
		const s = run(at(doc(ol(li(p('a'))), p('b')), [1], 0), toggleBulletList)
		expect(outline(s.doc)).toBe('ol[li[p(a)]] | ul[li[p(b)]]')
	})

	it('turns a heading into a paragraph inside the list', () => {
		const s = run(at(doc(h(2, 'T')), [0], 0), toggleOrderedList)
		expect(outline(s.doc)).toBe('ol[li[p(T)]]')
	})

	it('takes the blocks out when they are already in that kind of list', () => {
		const s = run(at(doc(ul(li(p('a')), li(p('b')), li(p('c')))), [0, 1, 0], 0), toggleBulletList)
		expect(outline(s.doc)).toBe('ul[li[p(a)]] | p(b) | ul[li[p(c)]]')
		expect(sel(s)).toBe('1:0')
	})

	it('changes the kind of the list the caret is in', () => {
		const s = run(at(doc(ul(li(p('a')), li(p('b')))), [0, 1, 0], 0), toggleOrderedList)
		expect(outline(s.doc)).toBe('ol[li[p(a)], li[p(b)]]')
	})

	it('reports whether the selection is in a list of a kind', () => {
		const s = at(doc(ul(li(p('a')))), [0, 0, 0], 0)
		expect(isListActive(s, 'bulletList')).toBe(true)
		expect(isListActive(s, 'orderedList')).toBe(false)
		expect(isListActive(at(doc(p('a')), [0], 0), 'bulletList')).toBe(false)
	})

	it('keeps the start of an ordered list', () => {
		const s = run(at(doc(p('a')), [0], 0), toggleList('orderedList', { start: 3 }))
		expect(s.doc.content[0]!.attrs).toMatchObject({ start: 3 })
	})
})

describe('sink and lift', () => {
	it('sinks an item into the item before it, and lifts it back', () => {
		const start = at(doc(ul(li(p('a')), li(p('b')))), [0, 1, 0], 0)
		const sunk = run(start, sinkListItem)
		expect(outline(sunk.doc)).toBe('ul[li[p(a), ul[li[p(b)]]]]')
		expect(sel(sunk)).toBe('0.0.1.0.0:0')
		const lifted = run(sunk, liftListItem)
		expect(outline(lifted.doc)).toBe('ul[li[p(a)], li[p(b)]]')
	})

	it('cannot sink the first item', () => {
		expect(sinkListItem(at(doc(ul(li(p('a')), li(p('b')))), [0, 0, 0], 0))).toBeNull()
	})

	it('adds a sunk item to an existing nested list', () => {
		const d = doc(ul(li(p('a'), ul(li(p('x')))), li(p('b'))))
		const s = run(at(d, [0, 1, 0], 0), sinkListItem)
		expect(outline(s.doc)).toBe('ul[li[p(a), ul[li[p(x)], li[p(b)]]]]')
	})

	it('lifting a nested item gives it the items after it as children', () => {
		const d = doc(ul(li(p('a'), ul(li(p('x')), li(p('y')), li(p('z'))))))
		const s = run(at(d, [0, 0, 1, 1, 0], 0), liftListItem)
		expect(outline(s.doc)).toBe('ul[li[p(a), ul[li[p(x)]]], li[p(y), ul[li[p(z)]]]]')
	})

	it('lifting the only nested item removes the empty nested list', () => {
		const d = doc(ul(li(p('a'), ul(li(p('x'))))))
		const s = run(at(d, [0, 0, 1, 0, 0], 0), liftListItem)
		expect(outline(s.doc)).toBe('ul[li[p(a)], li[p(x)]]')
	})
})
