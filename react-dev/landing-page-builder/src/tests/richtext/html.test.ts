import { describe, it, expect } from 'vitest'
import { generateHTML, generateJSON } from '@tiptap/react'
import { extensions } from '@/libs/tiptap/config'
import { blocksToHtml, docToHtml, docToText, htmlToDoc, htmlToFragment, inlineToHtml, safeHref, textToBlocks } from '@/libs/richtext/html'
import { fromTiptap, toTiptap } from '@/libs/richtext/tiptapJson'
import type { TextNode } from '@/libs/richtext/types'
import { loadCorpus } from './corpus'
import { cell, code, doc, h, hr, li, mark, ol, outline, p, quote, t, table, th, tr, ul } from './helpers'

// Normalized DOM text: attribute and style order and spacing do not matter.
function canonDom(html: string): string {
	const root = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body
	root.normalize()
	const walk = (n: Node): string => {
		if (n.nodeType === 3) return (n as Text).data
		if (n.nodeType !== 1) return ''
		const el = n as HTMLElement
		const attrs = Array.from(el.attributes)
			.map((a) => {
				if (a.name !== 'style') return `${a.name}="${a.value}"`
				const probe = document.createElement('i')
				probe.style.cssText = a.value
				const decls = probe.style.cssText.split(';').map((d) => d.trim().replace(/\s+/g, ' ')).filter(Boolean).sort()
				return `style="${decls.join(';')}"`
			})
			.sort()
		return `<${el.localName}${attrs.length ? ' ' + attrs.join(' ') : ''}>${Array.from(el.childNodes).map(walk).join('')}</${el.localName}>`
	}
	return Array.from(root.childNodes).map(walk).join('')
}

function mismatch(a: string, b: string): string {
	let i = 0
	while (i < a.length && a[i] === b[i]) i++
	return `at ${i}\n ours: ...${a.slice(Math.max(0, i - 60), i + 80)}\n tipt: ...${b.slice(Math.max(0, i - 60), i + 80)}`
}

const canon = (json: unknown) => generateJSON(generateHTML(json as never, extensions), extensions)
const html = (...blocks: Parameters<typeof doc>) => docToHtml(doc(...blocks))
const parse = (s: string) => outline(htmlToDoc(s))

describe('differential against TipTap', () => {
	const corpus = loadCorpus()

	it('writes the same HTML as generateHTML for every sample document', () => {
		const failures: string[] = []
		corpus.forEach((json, i) => {
			const ours = canonDom(docToHtml(fromTiptap(json)))
			const theirs = canonDom(generateHTML(json as never, extensions))
			if (ours !== theirs) failures.push(`#${i} ${mismatch(ours, theirs)}`)
		})
		expect(failures).toEqual([])
	}, 120000)

	it('reads generateHTML output back into the same document', () => {
		const failures: string[] = []
		corpus.forEach((json, i) => {
			const read = toTiptap(htmlToDoc(generateHTML(json as never, extensions)))
			try {
				expect(canon(read)).toEqual(canon(toTiptap(fromTiptap(json))))
			} catch {
				failures.push(`#${i} ${JSON.stringify(json).slice(0, 150)}`)
			}
		})
		expect(failures).toEqual([])
	}, 120000)

	it('writes a table, marks and attributes like TipTap', () => {
		const json = {
			type: 'doc',
			content: [
				{ type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: 'a<&>', marks: [{ type: 'bold' }, { type: 'link', attrs: { href: 'http://x?a=1&b="2"', target: '_blank', rel: 'r', class: 'k', title: 't' } }, { type: 'highlight', attrs: { color: '#f00' } }, { type: 'textStyle', attrs: { color: 'red', fontSize: '12px', fontFamily: 'Arial', lineHeight: '2' } }] }, { type: 'hardBreak' }, { type: 'text', text: 'x', marks: [{ type: 'subscript' }, { type: 'italic' }, { type: 'underline' }, { type: 'strike' }] }] },
				{ type: 'orderedList', attrs: { start: 3, type: 'a' }, content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }, { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph' }] }] }] }] },
				{ type: 'codeBlock', attrs: { language: 'js' }, content: [{ type: 'text', text: 'a\n<b>' }] },
				{ type: 'table', content: [{ type: 'tableRow', content: [{ type: 'tableHeader', attrs: { colspan: 2, rowspan: 1, colwidth: [100, 50] }, content: [{ type: 'paragraph' }] }, { type: 'tableCell', attrs: { colspan: 1, rowspan: 2, colwidth: null }, content: [{ type: 'paragraph' }] }] }, { type: 'tableRow', content: [{ type: 'tableCell', attrs: { colspan: 1, rowspan: 1, colwidth: [80] }, content: [{ type: 'paragraph' }] }] }] },
				{ type: 'horizontalRule' },
			],
		}
		expect(canonDom(docToHtml(fromTiptap(json)))).toBe(canonDom(generateHTML(json as never, extensions)))
		expect(canon(toTiptap(htmlToDoc(generateHTML(json as never, extensions))))).toEqual(canon(json))
	})
})

describe('writing HTML', () => {
	it('writes every block', () => {
		expect(html(p('a'))).toBe('<p>a</p>')
		expect(html(p())).toBe('<p></p>')
		expect(html(h(2, 'T'))).toBe('<h2>T</h2>')
		expect(html(quote(p('q')))).toBe('<blockquote><p>q</p></blockquote>')
		expect(html(hr())).toBe('<hr>')
		expect(html(code('a\nb'))).toBe('<pre><code>a\nb</code></pre>')
		expect(blocksToHtml([{ type: 'codeBlock', attrs: { language: 'ts' }, content: [{ type: 'text', text: '<x>' }] }])).toBe('<pre><code class="language-ts">&lt;x&gt;</code></pre>')
		expect(html(ul(li(p('a'), ul(li(p('b'))))))).toBe('<ul><li><p>a</p><ul><li><p>b</p></li></ul></li></ul>')
		expect(blocksToHtml([{ type: 'orderedList', attrs: { start: 3, type: 'a' }, content: [li(p('x'))] }])).toBe('<ol start="3" type="a"><li><p>x</p></li></ol>')
		expect(html(ol(li(p('x'))))).toBe('<ol><li><p>x</p></li></ol>')
	})

	it('writes alignment', () => {
		expect(blocksToHtml([{ type: 'paragraph', attrs: { textAlign: 'center' }, content: [] }])).toContain('<p style="text-align: center;">')
	})

	it('writes each mark', () => {
		const one = (...m: (string | ReturnType<typeof mark>)[]) => inlineToHtml([t('x', ...m)])
		expect(one('bold')).toBe('<strong>x</strong>')
		expect(one('italic')).toBe('<em>x</em>')
		expect(one('underline')).toBe('<u>x</u>')
		expect(one('strike')).toBe('<s>x</s>')
		expect(one('code')).toBe('<code>x</code>')
		expect(one('subscript')).toBe('<sub>x</sub>')
		expect(one('superscript')).toBe('<sup>x</sup>')
		expect(one(mark('link', { href: 'http://a' }))).toBe('<a target="_blank" rel="noopener noreferrer nofollow" href="http://a">x</a>')
		expect(one(mark('highlight', { color: '#ff0' }))).toBe('<mark data-color="#ff0" style="background-color: #ff0; color: inherit;">x</mark>')
		expect(one(mark('highlight', { color: null }))).toBe('<mark>x</mark>')
		expect(one(mark('textStyle', { color: 'red', fontSize: '12px', fontFamily: 'Arial', lineHeight: '2' }))).toBe('<span style="color: red; font-family: Arial; font-size: 12px; line-height: 2;">x</span>')
	})

	it('nests marks in schema order and shares an outer mark across runs', () => {
		expect(inlineToHtml([t('x', 'underline', 'italic', 'bold')])).toBe('<strong><em><u>x</u></em></strong>')
		expect(inlineToHtml([t('a', 'bold'), t('b', 'bold', 'italic'), t('c', 'italic')])).toBe('<strong>a<em>b</em></strong><em>c</em>')
		const link = mark('link', { href: 'h' })
		expect(inlineToHtml([t('d', link, 'bold'), t('e', link, 'italic')])).toBe('<a target="_blank" rel="noopener noreferrer nofollow" href="h"><strong>d</strong><em>e</em></a>')
	})

	it('writes a hard break as br and escapes text and attributes', () => {
		expect(inlineToHtml([t('a\nb', 'bold')])).toBe('<strong>a<br>b</strong>')
		expect(inlineToHtml([{ type: 'text', text: '<a href="x"> &  ' }])).toBe('&lt;a href="x"&gt; &amp; &nbsp;')
		expect(inlineToHtml([t('x', mark('link', { href: 'a"b&c' }))])).toContain('href="a&quot;b&amp;c"')
	})

	it('writes tables with colgroup and spans', () => {
		const d = doc(table(tr(th(p('h'))), tr(cell(p('c')))))
		expect(docToHtml(d)).toBe('<table style="min-width: 25px;"><colgroup><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>h</p></th></tr><tr><td colspan="1" rowspan="1"><p>c</p></td></tr></tbody></table>')
		const wide = doc(table(tr({ type: 'tableCell', attrs: { colspan: 2, rowspan: 1, colwidth: [100, 50] }, content: [p('x')] })))
		expect(docToHtml(wide)).toBe('<table style="width: 150px;"><colgroup><col style="width: 100px;"><col style="width: 50px;"></colgroup><tbody><tr><td colspan="2" rowspan="1" colwidth="100,50"><p>x</p></td></tr></tbody></table>')
	})
})

describe('reading HTML', () => {
	it('reads marks from tags', () => {
		expect(parse('<p><strong>a</strong><b>b</b><em>c</em><i>d</i></p>')).toBe('p([ab|bold][cd|italic])')
		expect(parse('<p><u>a</u><s>b</s><strike>c</strike><del>d</del></p>')).toBe('p([a|underline][bcd|strike])')
		expect(parse('<p><code>a</code><sub>b</sub><sup>c</sup></p>')).toBe('p([a|code][b|subscript][c|superscript])')
		expect(parse('<p>a <mark>b</mark> <mark data-color="#f00">c</mark></p>')).toBe('p(a [b|highlight] [c|highlight:color=#f00])')
	})

	it('reads blocks', () => {
		expect(parse('<h3 style="text-align:center">T</h3>')).toBe('h3{center}(T)')
		expect(parse('<blockquote><p>q</p></blockquote>')).toBe('quote[p(q)]')
		expect(parse('<hr>')).toBe('hr')
		expect(parse('<div>a</div><section>b</section><article>c</article>')).toBe('p(a) | p(b) | p(c)')
		expect(parse('<p></p>')).toBe('p()')
	})

	it('reads pre and code blocks with language', () => {
		const d = htmlToDoc('<pre><code class="language-js">a\n  b &lt;c&gt;</code></pre>')
		expect(d.content[0]).toEqual({ type: 'codeBlock', attrs: { language: 'js' }, content: [{ type: 'text', text: 'a\n  b <c>' }] })
		expect(htmlToDoc('<pre>x\ny</pre>').content[0]!.content).toEqual([{ type: 'text', text: 'x\ny' }])
	})

	it('reads nested lists and plain list items', () => {
		expect(parse('<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>')).toBe('ul[li[p(a), ul[li[p(b)]]], li[p(c)]]')
		const d = htmlToDoc('<ol start="4" type="a"><li><p>x</p></li></ol>')
		expect(d.content[0]!.attrs).toEqual({ start: 4, type: 'a' })
		expect(parse('<ul><li>a</li><ul><li>b</li></ul></ul>')).toBe('ul[li[p(a), ul[li[p(b)]]]]')
	})

	it('reads tables with spans, headers and widths', () => {
		const d = htmlToDoc('<table><colgroup><col style="width: 100px"><col style="min-width: 25px"></colgroup><tr><th colspan="2" data-colwidth="100,50">h</th></tr><tr><td rowspan="2">a</td><td>b</td></tr></table>')
		const t0 = d.content[0]!
		const row0 = t0.content![0] as { content: { type: string; attrs: Record<string, unknown> }[] }
		expect(row0.content[0]!.type).toBe('tableHeader')
		expect(row0.content[0]!.attrs).toEqual({ colspan: 2, rowspan: 1, colwidth: [100, 50] })
		const row1 = t0.content![1] as { content: { attrs: Record<string, unknown> }[] }
		expect(row1.content[0]!.attrs).toEqual({ colspan: 1, rowspan: 2, colwidth: [100] })
		expect(row1.content[1]!.attrs.colwidth).toBeNull()
	})

	it('reads hard breaks and collapses whitespace', () => {
		expect(parse('<p>a<br>b</p>')).toBe('p(a↵b)')
		expect(parse('<p>  a \n\n  b   <b> c </b>  </p>')).toBe('p(a b [c|bold])')
		expect(htmlToDoc('<div>\n  <p>a</p>\n  <p>b</p>\n</div>').content).toHaveLength(2)
		expect(htmlToDoc('<pre>a   b</pre>').content[0]!.content![0]).toMatchObject({ text: 'a   b' })
	})

	it('reads inline styles', () => {
		const marks = (s: string) => (htmlToDoc(s).content[0]!.content![0] as TextNode).marks
		expect(marks('<p><span style="font-weight:700">a</span></p>')).toEqual([{ type: 'bold' }])
		expect(marks('<p><span style="font-weight: 400">a</span></p>')).toBeUndefined()
		expect(marks('<p><span style="font-style:italic;text-decoration:underline line-through">a</span></p>')).toEqual([{ type: 'italic' }, { type: 'strike' }, { type: 'underline' }])
		expect(marks('<p><span style="color:#ff0000;font-size:14pt;font-family:\'Open Sans\', sans-serif;line-height:1.5">a</span></p>')).toEqual([{ type: 'textStyle', attrs: { color: '#ff0000', fontSize: '14pt', fontFamily: "'Open Sans', sans-serif", lineHeight: '1.5' } }])
		expect(marks('<p><span style="background-color: rgb(255, 255, 0)">a</span></p>')).toEqual([{ type: 'highlight', attrs: { color: 'rgb(255, 255, 0)' } }])
		expect(marks('<p style="color:red">a</p>')).toEqual([{ type: 'textStyle', attrs: { color: 'red', fontSize: null, fontFamily: null, lineHeight: null } }])
	})

	it('drops unsafe style values', () => {
		const marks = (s: string) => (htmlToDoc(s).content[0]!.content![0] as TextNode).marks
		expect(marks('<p><span style="color:expression(alert(1))">a</span></p>')).toBeUndefined()
		expect(marks('<p><span style="font-family:url(http://x)">a</span></p>')).toBeUndefined()
		expect(marks('<p><span style="background-color:url(x)">a</span></p>')).toBeUndefined()
	})

	it('keeps safe links and drops unsafe ones', () => {
		const link = (href: string) => (htmlToDoc(`<p><a href="${href}">x</a></p>`).content[0]!.content![0] as TextNode)
		expect(link('https://a.com/?q=1').marks![0]).toEqual({ type: 'link', attrs: { href: 'https://a.com/?q=1', target: '_blank', rel: 'noopener noreferrer nofollow', class: null, title: null } })
		for (const ok of ['mailto:a@b.c', 'tel:123', '#top', '/rel/path', 'page.html']) expect(link(ok).marks).toBeDefined()
		for (const bad of ['javascript:alert(1)', ' JaVa\tScript:alert(1)', 'data:text/html,x', 'vbscript:x']) {
			const node = link(bad)
			expect(node.text).toBe('x')
			expect(node.marks).toBeUndefined()
		}
		expect(safeHref('')).toBeNull()
	})

	it('drops images, scripts, styles and comments', () => {
		expect(parse('<p>a<img src="x.png" alt="pic">b<script>alert(1)</script><style>p{}</style><!-- c --></p>')).toBe('p(ab)')
		expect(parse('<p><a href="http://x"><img src="x"></a></p>')).toBe('p()')
		expect(htmlToDoc('').content).toEqual([{ type: 'paragraph', attrs: { textAlign: null }, content: [] }])
	})

	it('reads Google Docs markup', () => {
		const gd = '<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-1"><p dir="ltr" style="line-height:1.38;"><span style="font-size:11pt;font-weight:700;">Bold</span><span style="font-size:11pt;font-weight:400;"> plain</span></p></b>'
		const d = htmlToDoc(gd)
		expect(d.content).toHaveLength(1)
		const runs = d.content[0]!.content as { text: string; marks?: { type: string }[] }[]
		expect(runs.map((r) => [r.text, (r.marks ?? []).map((m) => m.type)])).toEqual([['Bold', ['bold', 'textStyle']], [' plain', ['textStyle']]])
	})

	it('reads Word markup', () => {
		const word = '<html xmlns:o="urn:x"><body><!--[if gte mso 9]><xml>x</xml><![endif]--><p class="MsoNormal" style="mso-margin-top-alt:auto"><span style="font-family:Calibri;mso-bidi-font-family:Arial">Hello<o:p></o:p></span></p><p class="MsoNormal"><o:p>&nbsp;</o:p></p></body></html>'
		const d = htmlToDoc(word)
		expect(d.content).toHaveLength(2)
		expect(d.content[0]!.content![0]).toMatchObject({ text: 'Hello', marks: [{ type: 'textStyle', attrs: { fontFamily: 'Calibri' } }] })
		expect(d.content[1]).toEqual({ type: 'paragraph', attrs: { textAlign: null }, content: [] })
	})

	it('reads a browser fragment with a meta prefix', () => {
		expect(parse('<meta charset="utf-8"><p>x</p>')).toBe('p(x)')
	})

	it('reports inlineOnly', () => {
		const inline = htmlToFragment('some <b>bold</b> words')
		expect(inline.inlineOnly).toBe(true)
		expect(inline.blocks).toHaveLength(1)
		expect(outline(inline.blocks[0]!)).toBe('p(some [bold|bold] words)')
		expect(htmlToFragment('<p>a</p><p>b</p>')).toMatchObject({ inlineOnly: false })
		expect(htmlToFragment('<p>a</p><p>b</p>').blocks).toHaveLength(2)
		expect(htmlToFragment('')).toEqual({ blocks: [], inlineOnly: false })
	})

	it('never throws and always gives a valid document', () => {
		for (const bad of ['<<<>>>', '<p><b><i>x</p></b>', '<table><td>x', '<ul><li>', '\u0000', '<div><div><div>']) {
			const d = htmlToDoc(bad)
			expect(d.type).toBe('doc')
			expect(d.content.length).toBeGreaterThan(0)
		}
	})
})

describe('plain text', () => {
	it('writes text with list prefixes, tabs and breaks', () => {
		const d = doc(p('a', t('\nb')), h(1, 'T'), ul(li(p('x'), ul(li(p('y')))), li(p('z'))), ol(li(p('one'))), table(tr(cell(p('1')), cell(p('2'))), tr(cell(p('3')), cell(p('4')))))
		expect(docToText(d)).toBe('a\nb\nT\n- x\n  - y\n- z\n1. one\n1\t2\n3\t4')
	})

	it('reads text into paragraphs', () => {
		expect(textToBlocks('a\r\n\nb\tc\rd').map((b) => outline(b))).toEqual(['p(a)', 'p()', 'p(b\tc)', 'p(d)'])
		expect(textToBlocks('')).toHaveLength(1)
	})
})
