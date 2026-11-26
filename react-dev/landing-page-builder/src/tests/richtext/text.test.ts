import { describe, it, expect } from 'vitest'
import { deleteBackward, deleteDirection, deleteForward, deleteSelection, insertHardBreak, insertText, splitBlock } from '@/libs/richtext/commands/text'
import { at, code, doc, h, hr, li, mark, outline, p, quote, run, sel, t, ul } from './helpers'

const NL = '↵'

describe('insertText', () => {
	it('types at the caret and moves it', () => {
		const s = run(at(doc(p('Helo')), [0], 3), insertText('l'))
		expect(outline(s.doc)).toBe('p(Hello)')
		expect(sel(s)).toBe('0:4')
	})

	it('replaces a selection', () => {
		const s = run(at(doc(p('Hello world')), [0], 0, { offset: 5 }), insertText('Bye'))
		expect(outline(s.doc)).toBe('p(Bye world)')
		expect(sel(s)).toBe('0:3')
	})

	it('continues the marks before the caret', () => {
		const s = run(at(doc(p(t('bold', 'bold'))), [0], 4), insertText('er'))
		expect(outline(s.doc)).toBe('p([bolder|bold])')
	})

	it('does not continue a link at its end, but does inside it', () => {
		const link = t('link', mark('link', { href: 'x' }))
		expect(outline(run(at(doc(p(link)), [0], 4), insertText('!')).doc)).toBe('p([link|link:href=x]!)')
		expect(outline(run(at(doc(p(link)), [0], 2), insertText('!')).doc)).toBe('p([li!nk|link:href=x])')
	})

	it('uses stored marks when set', () => {
		const state = { ...at(doc(p('ab')), [0], 2), storedMarks: [mark('bold')] }
		expect(outline(run(state, insertText('c')).doc)).toBe('p(ab[c|bold])')
	})

	it('adds no marks inside a code block', () => {
		const s = run(at(doc(code('ab')), [0], 2), insertText('c'))
		expect(outline(s.doc)).toBe('code(abc)')
	})

	it('replaces a selection that spans blocks', () => {
		const s = run(at(doc(p('one'), p('two'), p('three')), [0], 1, { path: [2], offset: 2 }), insertText('X'))
		expect(outline(s.doc)).toBe('p(oXree)')
	})

	it('writes a hard break as a newline character', () => {
		const s = run(at(doc(p('ab')), [0], 1), insertHardBreak)
		expect(outline(s.doc)).toBe(`p(a${NL}b)`)
	})
})

describe('deleteBackward', () => {
	it('removes the character before the caret', () => {
		const s = run(at(doc(p('Hello')), [0], 5), deleteBackward)
		expect(outline(s.doc)).toBe('p(Hell)')
		expect(sel(s)).toBe('0:4')
	})

	it('removes a selection', () => {
		expect(outline(run(at(doc(p('Hello')), [0], 1, { offset: 4 }), deleteBackward).doc)).toBe('p(Ho)')
	})

	it('removes a whole word with the word unit', () => {
		const s = run(at(doc(p('one two three')), [0], 7), deleteDirection(-1, 'word'))
		expect(outline(s.doc)).toBe('p(one  three)')
		expect(sel(s)).toBe('0:4')
	})

	it('joins a block into the one before at the start', () => {
		const s = run(at(doc(p('ab'), p('cd')), [1], 0), deleteBackward)
		expect(outline(s.doc)).toBe('p(abcd)')
		expect(sel(s)).toBe('0:2')
	})

	it('keeps marks of both blocks when joining', () => {
		const s = run(at(doc(p(t('a', 'bold')), p('b')), [1], 0), deleteBackward)
		expect(outline(s.doc)).toBe('p([a|bold]b)')
	})

	it('does nothing at the start of the document', () => {
		expect(deleteBackward(at(doc(p('ab')), [0], 0))).toBeNull()
	})

	it('turns a heading at the very start into a paragraph', () => {
		const s = run(at(doc(h(2, 'Title')), [0], 0), deleteBackward)
		expect(outline(s.doc)).toBe('p(Title)')
	})

	it('takes a list item out of its list at the start', () => {
		const s = run(at(doc(ul(li(p('a')), li(p('b')))), [0, 1, 0], 0), deleteBackward)
		expect(outline(s.doc)).toBe('ul[li[p(a)]] | p(b)')
		expect(sel(s)).toBe('1:0')
	})

	it('takes the first block out of a quote', () => {
		const s = run(at(doc(quote(p('a'), p('b'))), [0, 0], 0), deleteBackward)
		expect(outline(s.doc)).toBe('p(a) | quote[p(b)]')
	})

	it('removes a rule before the block', () => {
		const s = run(at(doc(p('a'), hr(), p('b')), [2], 0), deleteBackward)
		expect(outline(s.doc)).toBe('p(a) | p(b)')
	})

	it('removes the blocks between and joins across blocks', () => {
		const s = run(at(doc(p('one'), p('two'), p('three'), p('four')), [0], 2, { path: [3], offset: 1 }), deleteSelection)
		expect(outline(s.doc)).toBe('p(onour)')
	})
})

describe('deleteForward', () => {
	it('removes the character after the caret', () => {
		expect(outline(run(at(doc(p('Hello')), [0], 0), deleteForward).doc)).toBe('p(ello)')
	})

	it('joins the next block at the end', () => {
		const s = run(at(doc(p('ab'), p('cd')), [0], 2), deleteForward)
		expect(outline(s.doc)).toBe('p(abcd)')
		expect(sel(s)).toBe('0:2')
	})

	it('does nothing at the end of the document', () => {
		expect(deleteForward(at(doc(p('ab')), [0], 2))).toBeNull()
	})
})

describe('splitBlock (Enter)', () => {
	it('splits a paragraph at the caret', () => {
		const s = run(at(doc(p('abcd')), [0], 2), splitBlock)
		expect(outline(s.doc)).toBe('p(ab) | p(cd)')
		expect(sel(s)).toBe('1:0')
	})

	it('keeps a heading level when splitting in the middle, and starts a paragraph at the end', () => {
		expect(outline(run(at(doc(h(2, 'abcd')), [0], 2), splitBlock).doc)).toBe('h2(ab) | h2(cd)')
		expect(outline(run(at(doc(h(2, 'abcd')), [0], 4), splitBlock).doc)).toBe('h2(abcd) | p()')
	})

	it('keeps the text alignment', () => {
		const d = doc({ ...p('abcd'), attrs: { textAlign: 'center' } })
		expect(outline(run(at(d, [0], 2), splitBlock).doc)).toBe('p{center}(ab) | p{center}(cd)')
	})

	it('carries the marks to the new block so typing continues in them', () => {
		const s = run(at(doc(p(t('ab', 'bold'))), [0], 2), splitBlock)
		expect(s.storedMarks).toEqual([{ type: 'bold' }])
	})

	it('splits a list item into two items', () => {
		const s = run(at(doc(ul(li(p('abcd')))), [0, 0, 0], 2), splitBlock)
		expect(outline(s.doc)).toBe('ul[li[p(ab)], li[p(cd)]]')
		expect(sel(s)).toBe('0.1.0:0')
	})

	it('moves nested items to the new list item', () => {
		const d = doc(ul(li(p('abcd'), ul(li(p('x'))))))
		const s = run(at(d, [0, 0, 0], 2), splitBlock)
		expect(outline(s.doc)).toBe('ul[li[p(ab)], li[p(cd), ul[li[p(x)]]]]')
	})

	it('leaves the list on Enter in an empty item', () => {
		const s = run(at(doc(ul(li(p('a')), li(p('')))), [0, 1, 0], 0), splitBlock)
		expect(outline(s.doc)).toBe('ul[li[p(a)]] | p()')
		expect(sel(s)).toBe('1:0')
	})

	it('leaves a quote on Enter in an empty last block', () => {
		const s = run(at(doc(quote(p('a'), p(''))), [0, 1], 0), splitBlock)
		expect(outline(s.doc)).toBe('quote[p(a)] | p()')
	})

	it('inserts a newline in a code block, and leaves it after two blank lines', () => {
		expect(outline(run(at(doc(code('ab')), [0], 1), splitBlock).doc)).toBe(`code(a${NL}b)`)
		const s = run(at(doc(code('ab\n\n')), [0], 4), splitBlock)
		expect(outline(s.doc)).toBe('code(ab) | p()')
	})

	it('replaces a selection when splitting', () => {
		expect(outline(run(at(doc(p('abcd')), [0], 1, { offset: 3 }), splitBlock).doc)).toBe('p(a) | p(d)')
	})
})
