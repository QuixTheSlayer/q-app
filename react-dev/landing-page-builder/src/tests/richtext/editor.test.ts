import { describe, it, expect, vi } from 'vitest'
import { RichTextEditorCore } from '@/libs/richtext/editor'
import { insertFragment, sliceFragment } from '@/libs/richtext/commands/fragment'
import { deleteBackward, insertText, splitBlock } from '@/libs/richtext/commands/text'
import { toggleMark } from '@/libs/richtext/commands/marks'
import { caret, textSelection } from '@/libs/richtext/selection'
import { at, code, doc, h, li, outline, p, quote, run, sel, t, ul } from './helpers'

const editorWith = (d = doc(p('Hello'))) => new RichTextEditorCore({ doc: d })

describe('RichTextEditorCore', () => {
	it('reads TipTap JSON, as an object or a string', () => {
		const json = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hi' }, { type: 'hardBreak' }, { type: 'text', text: 'there' }] }] }
		expect(outline(new RichTextEditorCore({ content: json }).doc)).toBe('p(Hi↵there)')
		expect(outline(new RichTextEditorCore({ content: JSON.stringify(json) }).doc)).toBe('p(Hi↵there)')
		expect(new RichTextEditorCore({ content: undefined }).isEmpty).toBe(true)
	})

	it('writes TipTap JSON back, with hard breaks as nodes', () => {
		const e = new RichTextEditorCore({ content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }, { type: 'hardBreak' }, { type: 'text', text: 'b' }] }] } })
		expect(e.getJSON().content![0]!.content).toEqual([{ type: 'text', text: 'a' }, { type: 'hardBreak' }, { type: 'text', text: 'b' }])
	})

	it('runs commands, notifies subscribers and fires onUpdate only for document changes', () => {
		const onUpdate = vi.fn()
		const onSelectionUpdate = vi.fn()
		const e = new RichTextEditorCore({ doc: doc(p('ab')), onUpdate, onSelectionUpdate })
		const listener = vi.fn()
		e.subscribe(listener)
		e.setSelection(caret([0], 2))
		expect(onSelectionUpdate).toHaveBeenCalledTimes(1)
		expect(e.dispatch(insertText('c'))).toBe(true)
		expect(onUpdate).toHaveBeenCalledTimes(1)
		expect(outline(e.doc)).toBe('p(abc)')
		expect(listener).toHaveBeenCalledTimes(2)
		expect(e.dispatch(deleteBackward, 'delete')).toBe(true)
		expect(e.dispatch(() => null)).toBe(false)
	})

	it('does not notify when the selection is set to what it already is', () => {
		const e = editorWith()
		const listener = vi.fn()
		e.setSelection(caret([0], 2))
		e.subscribe(listener)
		e.setSelection(caret([0], 2))
		expect(listener).not.toHaveBeenCalled()
	})

	it('groups typing into one undo step and undoes and redoes it', () => {
		const e = editorWith(doc(p('')))
		const type = (c: string, now: number) => e.dispatch(insertText(c), 'typing', now)
		type('a', 1000)
		type('b', 1100)
		type('c', 1200)
		expect(outline(e.doc)).toBe('p(abc)')
		expect(e.undo()).toBe(true)
		expect(outline(e.doc)).toBe('p()')
		expect(e.canUndo).toBe(false)
		expect(e.redo()).toBe(true)
		expect(outline(e.doc)).toBe('p(abc)')
		expect(e.canRedo).toBe(false)
	})

	it('starts a new undo step after a pause, after the caret moves and for other kinds of edit', () => {
		const e = editorWith(doc(p('')))
		e.dispatch(insertText('a'), 'typing', 1000)
		e.dispatch(insertText('b'), 'typing', 5000)
		e.setSelection(caret([0], 1))
		e.dispatch(insertText('c'), 'typing', 5100)
		e.dispatch(splitBlock, 'other', 5200)
		expect(e.history.past).toHaveLength(4)
		e.undo()
		expect(outline(e.doc)).toBe('p(acb)')
	})

	it('a new edit clears the redo stack', () => {
		const e = editorWith(doc(p('')))
		e.dispatch(insertText('a'), 'typing', 1000)
		e.undo()
		e.dispatch(insertText('b'), 'typing', 2000)
		expect(e.canRedo).toBe(false)
	})

	it('restores the selection on undo', () => {
		const e = editorWith(doc(p('hello')))
		e.setSelection(textSelection({ path: [0], offset: 0 }, { path: [0], offset: 5 }))
		e.dispatch(toggleMark('bold'))
		e.undo()
		expect(sel({ ...e.state })).toBe('0:0-0:5')
		expect(outline(e.doc)).toBe('p(hello)')
	})

	it('keeps stored marks only until the selection moves', () => {
		const e = editorWith(doc(p('ab')))
		e.setSelection(caret([0], 2))
		e.dispatch(toggleMark('bold'))
		expect(e.state.storedMarks).toEqual([{ type: 'bold' }])
		e.setSelection(caret([0], 1))
		expect(e.state.storedMarks).toBeNull()
	})

	it('setContent replaces the document and clears history; clearContent empties it', () => {
		const onUpdate = vi.fn()
		const e = new RichTextEditorCore({ doc: doc(p('a')), onUpdate })
		e.dispatch(insertText('b'))
		e.setContent({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'new' }] }] })
		expect(outline(e.doc)).toBe('p(new)')
		expect(e.canUndo).toBe(false)
		expect(onUpdate).toHaveBeenCalledTimes(1)
		e.clearContent()
		expect(e.isEmpty).toBe(true)
		expect(onUpdate).toHaveBeenCalledTimes(2)
	})
})

describe('sliceFragment', () => {
	it('cuts a range inside one block', () => {
		const d = doc(p('Hello world'))
		const blocks = sliceFragment(d, { path: [0], offset: 6 }, { path: [0], offset: 11 })
		expect(blocks.map((b) => outline(b))).toEqual(['p(world)'])
	})

	it('keeps marks and the partial first and last blocks', () => {
		const d = doc(p(t('bold', 'bold'), ' text'), p('middle'), p('end of it'))
		const blocks = sliceFragment(d, { path: [0], offset: 2 }, { path: [2], offset: 3 })
		expect(blocks.map((b) => outline(b))).toEqual(['p([ld|bold] text)', 'p(middle)', 'p(end)'])
	})

	it('keeps the list around selected items', () => {
		const d = doc(ul(li(p('a')), li(p('b')), li(p('c'))))
		const blocks = sliceFragment(d, { path: [0, 1, 0], offset: 0 }, { path: [0, 2, 0], offset: 1 })
		expect(blocks.map((b) => outline(b))).toEqual(['ul[li[p(b)], li[p(c)]]'])
	})
})

describe('insertFragment (paste)', () => {
	it('merges a single text block into the text at the caret and puts the caret after it', () => {
		const s = run(at(doc(p('ad')), [0], 1), insertFragment([p('bc')]))
		expect(outline(s.doc)).toBe('p(abcd)')
		expect(sel(s)).toBe('0:3')
	})

	it('keeps the pasted marks', () => {
		const s = run(at(doc(p('ad')), [0], 1), insertFragment([p(t('bc', 'bold'))]))
		expect(outline(s.doc)).toBe('p(a[bc|bold]d)')
	})

	it('pastes into a code block without marks', () => {
		const s = run(at(doc(code('ad')), [0], 1), insertFragment([p(t('bc', 'bold'))]))
		expect(outline(s.doc)).toBe('code(abcd)')
	})

	it('replaces a selection', () => {
		const s = run(at(doc(p('one two')), [0], 0, { offset: 3 }), insertFragment([p('1')]))
		expect(outline(s.doc)).toBe('p(1 two)')
	})

	it('splits the block for several paragraphs and joins the first and last to the halves', () => {
		const s = run(at(doc(p('abXYcd')), [0], 2, { offset: 4 }), insertFragment([p('1'), p('2'), p('3')]))
		expect(outline(s.doc)).toBe('p(ab1) | p(2) | p(3cd)')
		expect(sel(s)).toBe('2:1')
	})

	it('does not leave an empty paragraph when pasting blocks at the start of a block', () => {
		const s = run(at(doc(p('abc')), [0], 0), insertFragment([h(1, 'Title'), p('body')]))
		expect(outline(s.doc)).toBe('h1(Title) | p(bodyabc)')
	})

	it('lets a whole copied block replace an empty block and keep its type', () => {
		const s = run(at(doc(p('')), [0], 0), insertFragment([h(2, 'Title')], { closed: true }))
		expect(outline(s.doc)).toBe('h2(Title)')
		expect(outline(run(at(doc(p('')), [0], 0), insertFragment([h(2, 'Title')])).doc)).toBe('p(Title)')
	})

	it('inserts a list between the halves', () => {
		const s = run(at(doc(p('abcd')), [0], 2), insertFragment([ul(li(p('x')), li(p('y')))]))
		expect(outline(s.doc)).toBe('p(ab) | ul[li[p(x)], li[p(y)]] | p(cd)')
		expect(sel(s)).toBe('1.1.0:1')
	})

	it('replaces an empty paragraph with pasted blocks', () => {
		const s = run(at(doc(p('')), [0], 0), insertFragment([quote(p('q'))]))
		expect(outline(s.doc)).toBe('quote[p(q)]')
	})

	it('keeps a list item starting with a paragraph', () => {
		const s = run(at(doc(ul(li(p('')))), [0, 0, 0], 0), insertFragment([h(1, 'T'), p('b')]))
		expect(outline(s.doc)).toBe('ul[li[p(T), p(b)]]')
	})
})
