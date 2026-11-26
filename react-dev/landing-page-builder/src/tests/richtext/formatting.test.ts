import { describe, it, expect } from 'vitest'
import { insertHorizontalRule, isAlignActive, isBlockActive, selectAll, setHeading, setParagraph, setTextAlign, toggleBlockquote, toggleCodeBlock, toggleHeading } from '@/libs/richtext/commands/blocks'
import { extendMarkRange, getMarkAttrs, isMarkActive, setLink, setMark, toggleMark, unsetAllMarks, unsetLink, unsetMark, unsetMarkAttr } from '@/libs/richtext/commands/marks'
import { insertText } from '@/libs/richtext/commands/text'
import { at, code, doc, h, li, mark, outline, p, quote, run, sel, t, ul } from './helpers'

describe('toggleMark on a selection', () => {
	it('adds a mark to the selected text only', () => {
		const s = run(at(doc(p('Hello world')), [0], 6, { offset: 11 }), toggleMark('bold'))
		expect(outline(s.doc)).toBe('p(Hello [world|bold])')
		expect(sel(s)).toBe('0:6-0:11')
	})

	it('removes it when the whole selection has it', () => {
		const s = run(at(doc(p(t('Hello', 'bold'))), [0], 0, { offset: 5 }), toggleMark('bold'))
		expect(outline(s.doc)).toBe('p(Hello)')
	})

	it('adds it to everything when only part has it', () => {
		const s = run(at(doc(p(t('He', 'bold'), 'llo')), [0], 0, { offset: 5 }), toggleMark('bold'))
		expect(outline(s.doc)).toBe('p([Hello|bold])')
	})

	it('works across blocks', () => {
		const s = run(at(doc(p('one'), p('two')), [0], 1, { path: [1], offset: 2 }), toggleMark('italic'))
		expect(outline(s.doc)).toBe('p(o[ne|italic]) | p([tw|italic]o)')
	})

	it('keeps neighbouring runs separate when the marks differ and merges equal ones', () => {
		const s = run(at(doc(p(t('ab', 'bold'), 'cd')), [0], 2, { offset: 4 }), toggleMark('bold'))
		expect(outline(s.doc)).toBe('p([abcd|bold])')
	})

	it('does not mark a code block, and code excludes other marks', () => {
		expect(setMark('bold')(at(doc(code('abc')), [0], 0, { offset: 3 }))?.doc).toEqual(doc(code('abc')))
		const s = run(at(doc(p(t('ab', 'bold'))), [0], 0, { offset: 2 }), toggleMark('code'))
		expect(outline(s.doc)).toBe('p([ab|code])')
	})

	it('superscript and subscript replace each other', () => {
		const a = run(at(doc(p('x2')), [0], 1, { offset: 2 }), toggleMark('subscript'))
		const b = run(a, toggleMark('superscript'))
		expect(outline(b.doc)).toBe('p(x[2|superscript])')
	})
})

describe('marks at a caret', () => {
	it('toggling with no selection sets stored marks for the next typing', () => {
		let s = run(at(doc(p('ab')), [0], 2), toggleMark('bold'))
		expect(s.storedMarks).toEqual([{ type: 'bold' }])
		s = run(s, insertText('c'))
		expect(outline(s.doc)).toBe('p(ab[c|bold])')
		expect(s.storedMarks).toBeNull()
	})

	it('reports what is active at the caret and in a range', () => {
		const s = at(doc(p(t('bold', 'bold'), 'plain')), [0], 2)
		expect(isMarkActive(s, 'bold')).toBe(true)
		expect(isMarkActive(at(doc(p(t('bold', 'bold'), 'plain')), [0], 6), 'bold')).toBe(false)
		expect(isMarkActive(at(doc(p(t('bold', 'bold'), 'plain')), [0], 0, { offset: 8 }), 'bold')).toBe(false)
		expect(isMarkActive(at(doc(p(t('bold', 'bold'), 'plain')), [0], 0, { offset: 4 }), 'bold')).toBe(true)
	})
})

describe('mark attributes (color, font size, link)', () => {
	const style = (attrs: Record<string, unknown>) => mark('textStyle', attrs)

	it('sets a color and merges attributes into one text style', () => {
		let s = run(at(doc(p('Hello')), [0], 0, { offset: 5 }), setMark('textStyle', { color: '#f00' }))
		s = run(s, setMark('textStyle', { fontSize: '2em' }))
		expect(outline(s.doc)).toBe('p([Hello|textStyle:color=#f00,fontSize=2em])')
		expect(getMarkAttrs(s, 'textStyle')).toMatchObject({ color: '#f00', fontSize: '2em' })
	})

	it('unsets one attribute and drops the style when nothing is left', () => {
		let s = at(doc(p(t('Hello', style({ color: '#f00', fontSize: '2em' })))), [0], 0, { offset: 5 })
		s = run(s, unsetMarkAttr('textStyle', 'color'))
		expect(outline(s.doc)).toBe('p([Hello|textStyle:fontSize=2em])')
		s = run(s, unsetMarkAttr('textStyle', 'fontSize'))
		expect(outline(s.doc)).toBe('p(Hello)')
	})

	it('isMarkActive checks the attribute value', () => {
		const s = at(doc(p(t('Hello', style({ fontFamily: 'Arial' })))), [0], 0, { offset: 5 })
		expect(isMarkActive(s, 'textStyle', { fontFamily: 'Arial' })).toBe(true)
		expect(isMarkActive(s, 'textStyle', { fontFamily: 'Georgia' })).toBe(false)
	})

	it('toggling a highlight with another color changes the color; the same color removes it', () => {
		let s = run(at(doc(p('Hello')), [0], 0, { offset: 5 }), toggleMark('highlight', { color: 'yellow' }))
		expect(outline(s.doc)).toBe('p([Hello|highlight:color=yellow])')
		s = run(s, toggleMark('highlight', { color: 'pink' }))
		expect(outline(s.doc)).toBe('p([Hello|highlight:color=pink])')
		s = run(s, toggleMark('highlight', { color: 'pink' }))
		expect(outline(s.doc)).toBe('p(Hello)')
	})

	it('stores attributes for the next typing at a caret', () => {
		let s = run(at(doc(p('ab')), [0], 2), setMark('textStyle', { color: 'red' }))
		s = run(s, insertText('c'))
		expect(outline(s.doc)).toBe('p(ab[c|textStyle:color=red])')
	})

	it('adds a link with default attributes, finds its range, and removes it from a caret inside it', () => {
		let s = run(at(doc(p('go to site now')), [0], 6, { offset: 10 }), setLink({ href: 'https://x.test' }))
		expect(outline(s.doc)).toContain('[site|link:href=https://x.test,target=_blank,rel=noopener noreferrer nofollow]')
		const inside = { ...s, selection: at(s.doc, [0], 8).selection }
		expect(sel(run(inside, extendMarkRange('link')))).toBe('0:6-0:10')
		s = run(inside, unsetLink)
		expect(outline(s.doc)).toBe('p(go to site now)')
	})

	it('clears every mark', () => {
		const s = run(at(doc(p(t('Hello', 'bold', 'italic'))), [0], 0, { offset: 5 }), unsetAllMarks)
		expect(outline(s.doc)).toBe('p(Hello)')
	})

	it('unsetMark removes just that mark', () => {
		const s = run(at(doc(p(t('Hello', 'bold', 'italic'))), [0], 0, { offset: 5 }), unsetMark('bold'))
		expect(outline(s.doc)).toBe('p([Hello|italic])')
	})
})

describe('block commands', () => {
	it('sets a heading and back to a paragraph, keeping the text and alignment', () => {
		const d = doc({ ...p('Title'), attrs: { textAlign: 'center' } })
		let s = run(at(d, [0], 2), setHeading(2))
		expect(outline(s.doc)).toBe('h2{center}(Title)')
		expect(isBlockActive(s, 'heading', { level: 2 })).toBe(true)
		s = run(s, setParagraph)
		expect(outline(s.doc)).toBe('p{center}(Title)')
	})

	it('toggleHeading goes back to a paragraph on the same level', () => {
		let s = run(at(doc(p('T')), [0], 0), toggleHeading(1))
		s = run(s, toggleHeading(1))
		expect(outline(s.doc)).toBe('p(T)')
		s = run(run(s, toggleHeading(1)), toggleHeading(3))
		expect(outline(s.doc)).toBe('h3(T)')
	})

	it('changes every block in a selection and keeps the selection', () => {
		const s = run(at(doc(p('a'), p('b'), p('c')), [0], 0, { path: [2], offset: 1 }), setHeading(2))
		expect(outline(s.doc)).toBe('h2(a) | h2(b) | h2(c)')
		expect(sel(s)).toBe('0:0-2:1')
	})

	it('turns text into a code block without marks', () => {
		const s = run(at(doc(p(t('abc', 'bold'))), [0], 1), toggleCodeBlock)
		expect(outline(s.doc)).toBe('code(abc)')
	})

	it('leaves the first paragraph of a list item alone when asked for a heading', () => {
		const s = at(doc(ul(li(p('a')))), [0, 0, 0], 0)
		expect(outline(run(s, setHeading(1)).doc)).toBe('ul[li[p(a)]]')
	})

	it('aligns text and reports it', () => {
		let s = run(at(doc(p('a'), p('b')), [0], 0, { path: [1], offset: 1 }), setTextAlign('center'))
		expect(outline(s.doc)).toBe('p{center}(a) | p{center}(b)')
		expect(isAlignActive(s, 'center')).toBe(true)
		expect(isAlignActive(s, 'left')).toBe(false)
		s = run(s, setTextAlign(null))
		expect(isAlignActive(s, 'left')).toBe(true)
	})

	it('wraps blocks in a quote and unwraps them', () => {
		let s = run(at(doc(p('a'), p('b'), p('c')), [0], 0, { path: [1], offset: 1 }), toggleBlockquote)
		expect(outline(s.doc)).toBe('quote[p(a), p(b)] | p(c)')
		s = run(s, toggleBlockquote)
		expect(outline(s.doc)).toBe('p(a) | p(b) | p(c)')
		expect(sel(s)).toBe('0:0-1:1')
	})

	it('inserts a rule and a paragraph after it', () => {
		const s = run(at(doc(p('a'), p('b')), [0], 1), insertHorizontalRule)
		expect(outline(s.doc)).toBe('p(a) | hr | p() | p(b)')
		expect(sel(s)).toBe('2:0')
	})

	it('selects everything', () => {
		const s = run(at(doc(p('one'), quote(p('two'))), [0], 0), selectAll)
		expect(sel(s)).toBe('0:0-1.0:3')
	})
})
