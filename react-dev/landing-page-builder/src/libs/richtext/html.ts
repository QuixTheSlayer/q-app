import { emptyDoc } from './doc'
import { normalizeInline, run } from './inline'
import { normalizeDoc } from './normalize'
import { addMark, createElement, isElement, isTextblock, MARKS, removeMark, sameAttrs } from './schema'
import type { Attrs, Doc, ElementNode, Mark, RTNode, TextNode } from './types'

// The document <-> HTML layer. Writing matches what TipTap's generateHTML gives for the builder's extensions;
// reading turns pasted or dropped HTML (browsers, Google Docs, Word, Apple Notes) into the editor schema.

// ---------------------------------------------------------------- writing

const escapeText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;')
const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;')
const has = (v: unknown): v is string | number => v !== null && v !== undefined && v !== '' && v !== false

function attrString(attrs: [string, unknown][]): string {
	return attrs.filter(([, v]) => has(v)).map(([k, v]) => ` ${k}="${escapeAttr(String(v))}"`).join('')
}

// ProseMirror writes marks outer to inner in schema order, which for the builder's extensions is this one.
const RENDER_ORDER = ['link', 'textStyle', 'highlight', 'subscript', 'superscript', 'bold', 'italic', 'strike', 'underline', 'code']
const SIMPLE_TAGS: Record<string, string> = { bold: 'strong', italic: 'em', strike: 's', underline: 'u', code: 'code', subscript: 'sub', superscript: 'sup' }

function orderMarks(marks: Mark[] | undefined): Mark[] {
	const seen = new Set<string>()
	const known = (marks ?? []).filter((m) => RENDER_ORDER.includes(m.type) && !seen.has(m.type) && seen.add(m.type))
	return known.sort((a, b) => RENDER_ORDER.indexOf(a.type) - RENDER_ORDER.indexOf(b.type))
}

const fullAttrs = (mark: Mark): Attrs => ({ ...MARKS[mark.type]?.defaultAttrs, ...mark.attrs })
const sameRenderedMark = (a: Mark, b: Mark) => a.type === b.type && sameAttrs(fullAttrs(a), fullAttrs(b))

function styleAttr(decls: [string, unknown][]): string {
	const text = decls.filter(([, v]) => has(v)).map(([k, v]) => `${k}: ${v};`).join(' ')
	return text ? ` style="${escapeAttr(text)}"` : ''
}

function openTag(mark: Mark): string {
	const a = fullAttrs(mark)
	if (mark.type === 'link') return `<a${attrString([['target', a.target], ['rel', a.rel], ['class', a.class], ['href', a.href], ['title', a.title]])}>`
	if (mark.type === 'highlight') {
		const color = has(a.color) ? a.color : null
		return `<mark${color ? ` data-color="${escapeAttr(String(color))}"` : ''}${color ? styleAttr([['background-color', color], ['color', 'inherit']]) : ''}>`
	}
	if (mark.type === 'textStyle') return `<span${styleAttr([['color', a.color], ['font-family', a.fontFamily], ['font-size', a.fontSize], ['line-height', a.lineHeight]])}>`
	return `<${SIMPLE_TAGS[mark.type]}>`
}

const closeTag = (mark: Mark) => `</${mark.type === 'link' ? 'a' : mark.type === 'highlight' ? 'mark' : mark.type === 'textStyle' ? 'span' : SIMPLE_TAGS[mark.type]}>`

/** Text runs as HTML. A "\n" is a `<br>`; a mark shared by neighbouring runs is opened once. */
export function inlineToHtml(runs: TextNode[]): string {
	return writeRuns(runs, false)
}

function writeRuns(runs: TextNode[], plain: boolean): string {
	let out = ''
	let active: Mark[] = []
	for (const r of runs) {
		if (!r.text) continue
		const marks = plain ? [] : orderMarks(r.marks)
		let keep = 0
		while (keep < active.length && keep < marks.length && sameRenderedMark(marks[keep]!, active[keep]!)) keep++
		for (let i = active.length; i > keep; i--) out += closeTag(active[i - 1]!)
		for (let i = keep; i < marks.length; i++) out += openTag(marks[i]!)
		active = marks
		out += plain ? escapeText(r.text) : r.text.split('\n').map(escapeText).join('<br>')
	}
	for (let i = active.length; i > 0; i--) out += closeTag(active[i - 1]!)
	return out
}

const alignStyle = (node: ElementNode) => styleAttr([['text-align', node.attrs?.textAlign]])
const kids = (node: ElementNode): ElementNode[] => ((node.content ?? []) as RTNode[]).filter(isElement)

function tableToHtml(node: ElementNode): string {
	const rows = kids(node)
	let cols = ''
	let style = ''
	const first = rows[0]
	if (first) {
		let total = 0
		let fixed = true
		for (const cell of kids(first)) {
			const span = Math.max(1, Number(cell.attrs?.colspan) || 1)
			const widths = Array.isArray(cell.attrs?.colwidth) ? (cell.attrs!.colwidth as number[]) : null
			for (let j = 0; j < span; j++) {
				const w = widths?.[j]
				total += w || 25
				if (!w) fixed = false
				cols += `<col style="${w ? `width: ${Math.max(w, 25)}px` : 'min-width: 25px'};">`
			}
		}
		style = ` style="${fixed ? 'width' : 'min-width'}: ${total}px;"`
		cols = `<colgroup>${cols}</colgroup>`
	}
	return `<table${style}>${cols}<tbody>${rows.map(blockToHtml).join('')}</tbody></table>`
}

function cellToHtml(node: ElementNode): string {
	const tag = node.type === 'tableHeader' ? 'th' : 'td'
	const a = node.attrs ?? {}
	const width = Array.isArray(a.colwidth) && a.colwidth.length ? a.colwidth.join(',') : null
	return `<${tag}${attrString([['colspan', a.colspan ?? 1], ['rowspan', a.rowspan ?? 1], ['colwidth', width]])}>${blocksToHtml(kids(node))}</${tag}>`
}

function blockToHtml(node: ElementNode): string {
	const a = node.attrs ?? {}
	switch (node.type) {
		case 'paragraph':
			return `<p${alignStyle(node)}>${inlineToHtml((node.content ?? []) as TextNode[])}</p>`
		case 'heading': {
			const level = Math.min(6, Math.max(1, Number(a.level) || 1))
			return `<h${level}${alignStyle(node)}>${inlineToHtml((node.content ?? []) as TextNode[])}</h${level}>`
		}
		case 'codeBlock':
			return `<pre><code${has(a.language) ? ` class="language-${escapeAttr(String(a.language))}"` : ''}>${writeRuns((node.content ?? []) as TextNode[], true)}</code></pre>`
		case 'blockquote':
			return `<blockquote>${blocksToHtml(kids(node))}</blockquote>`
		case 'bulletList':
			return `<ul>${blocksToHtml(kids(node))}</ul>`
		case 'orderedList':
			return `<ol${attrString([['start', a.start === 1 ? null : a.start], ['type', a.type]])}>${blocksToHtml(kids(node))}</ol>`
		case 'listItem':
			return `<li${styleAttr([['color', a.color]])}>${blocksToHtml(kids(node))}</li>`
		case 'horizontalRule':
			return '<hr>'
		case 'table':
			return tableToHtml(node)
		case 'tableRow':
			return `<tr>${blocksToHtml(kids(node))}</tr>`
		case 'tableCell':
		case 'tableHeader':
			return cellToHtml(node)
		default:
			// A node the schema does not know: text children make a paragraph, element children are written in place.
			return isTextblock(node) ? `<p>${inlineToHtml((node.content ?? []) as TextNode[])}</p>` : blocksToHtml(kids(node))
	}
}

export const blocksToHtml = (blocks: ElementNode[]): string => blocks.map(blockToHtml).join('')
export const docToHtml = (doc: Doc): string => blocksToHtml(doc.content ?? [])

// ---------------------------------------------------------------- plain text

const textOf = (node: ElementNode): string => ((node.content ?? []) as RTNode[]).map((c) => (c.type === 'text' ? (c as TextNode).text : '')).join('')
const indentLines = (s: string, by: string) => s.replace(/^(?=[^\n])/gm, by)

function blockToText(node: ElementNode): string {
	if (isTextblock(node)) return textOf(node)
	switch (node.type) {
		case 'horizontalRule':
			return '---'
		case 'bulletList':
		case 'orderedList': {
			const start = node.type === 'orderedList' ? Number(node.attrs?.start) || 1 : 0
			return kids(node)
				.map((item, i) => {
					const mark = node.type === 'orderedList' ? `${start + i}. ` : '- '
					const body = kids(item).map(blockToText)
					const [head = '', ...rest] = body
					return [mark + head, ...rest.map((b) => indentLines(b, '  '))].join('\n')
				})
				.join('\n')
		}
		case 'table':
			return kids(node)
				.map((row) => kids(row).map((cell) => kids(cell).map(blockToText).join(' ').replace(/\n/g, ' ')).join('\t'))
				.join('\n')
		default:
			return kids(node).map(blockToText).join('\n')
	}
}

/** The document as plain text: blocks on lines, "- " or "1. " before list items, tabs between table cells. */
export const docToText = (doc: Doc): string => (doc.content ?? []).map(blockToText).join('\n')

/** Plain text as paragraphs, one per line (blank lines stay as empty paragraphs). */
export function textToBlocks(text: string): ElementNode[] {
	return text.split(/\r\n|\r|\n/).map((line) => createElement('paragraph', undefined, line ? [run(line)] : []))
}

// ---------------------------------------------------------------- reading

const IGNORED = new Set(['script', 'style', 'head', 'meta', 'link', 'noscript', 'template', 'iframe', 'object', 'embed', 'svg', 'img', 'title', 'canvas', 'video', 'audio', 'picture', 'input', 'button', 'select', 'textarea', 'math'])
const BLOCKISH = new Set(['p', 'div', 'section', 'article', 'header', 'footer', 'main', 'aside', 'nav', 'figure', 'figcaption', 'address', 'details', 'summary', 'fieldset', 'form', 'dl', 'dt', 'dd', 'center', 'li', 'tr', 'td', 'th'])
const SAFE_CHARS = /^[\p{L}\p{N}_#(),.%\s'"\-]+$/u
const UNSAFE_FN = /(?:url|expression|javascript|import|var|attr)\s*\(/i
const NO_COLOR = new Set(['inherit', 'initial', 'unset', 'revert', 'currentcolor', 'windowtext', 'transparent', 'none', 'auto'])

const safeValue = (v: string | undefined): string | null => {
	const s = v?.trim()
	return s && s.length < 200 && SAFE_CHARS.test(s) && !UNSAFE_FN.test(s) ? s : null
}
const safeColor = (v: string | undefined | null) => {
	const s = safeValue(v ?? undefined)
	return s && !NO_COLOR.has(s.toLowerCase()) ? s : null
}

/** An href that is safe to keep, or null: http(s), mailto, tel, fragments and relative URLs only. */
export function safeHref(href: string | null | undefined): string | null {
	const value = (href ?? '').trim()
	if (!value) return null
	const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value.replace(/[\u0000-  ]/g, ''))
	if (scheme && !['http', 'https', 'mailto', 'tel'].includes(scheme[1]!.toLowerCase())) return null
	return value
}

function splitDeclarations(css: string): string[] {
	const out: string[] = []
	let quote = ''
	let depth = 0
	let start = 0
	for (let i = 0; i < css.length; i++) {
		const ch = css[i]!
		if (quote) {
			if (ch === quote) quote = ''
		} else if (ch === '"' || ch === "'") quote = ch
		else if (ch === '(') depth++
		else if (ch === ')') depth = Math.max(0, depth - 1)
		else if (ch === ';' && !depth) {
			out.push(css.slice(start, i))
			start = i + 1
		}
	}
	out.push(css.slice(start))
	return out
}

function parseStyle(css: string | null): Record<string, string> {
	const out: Record<string, string> = {}
	if (!css) return out
	for (const decl of splitDeclarations(css)) {
		const at = decl.indexOf(':')
		if (at < 1) continue
		out[decl.slice(0, at).trim().toLowerCase()] = decl.slice(at + 1).trim().replace(/\s*!important\s*$/i, '')
	}
	return out
}

interface Ctx { marks: Mark[]; align: string | null }
interface Desc { type: 'paragraph' | 'heading'; level?: number; align: string | null }

const ALIGNS: Record<string, string> = { left: 'left', right: 'right', center: 'center', justify: 'justify', '-webkit-center': 'center', '-moz-center': 'center' }
const alignOf = (el: Element, style: Record<string, string>): string | null =>
	ALIGNS[(style['text-align'] ?? '').toLowerCase()] ?? ALIGNS[(el.getAttribute('align') ?? '').toLowerCase()] ?? null

const TEXT_STYLE_KEYS = ['color', 'fontSize', 'fontFamily', 'lineHeight']

function withTextStyle(marks: Mark[], patch: Attrs): Mark[] {
	const current = marks.find((m) => m.type === 'textStyle')
	const attrs: Attrs = { color: null, fontSize: null, fontFamily: null, lineHeight: null, ...current?.attrs }
	for (const [k, v] of Object.entries(patch)) if (v) attrs[k] = v
	if (TEXT_STYLE_KEYS.every((k) => !attrs[k])) return marks
	return addMark(marks, { type: 'textStyle', attrs })
}

function linkMark(el: Element): Mark | null {
	const href = safeHref(el.getAttribute('href'))
	if (!href) return null
	const d = MARKS.link!.defaultAttrs!
	const attr = (name: string, fallback: unknown) => el.getAttribute(name) ?? fallback
	return { type: 'link', attrs: { href, target: attr('target', d.target), rel: attr('rel', d.rel), class: attr('class', null) || null, title: attr('title', null) } }
}

/** The marks in force inside `el`: those of the parent plus what the tag and its inline style add. */
function marksFor(el: Element, tag: string, style: Record<string, string>, inherited: Mark[], inPre: boolean): Mark[] {
	let marks = inherited
	const add = (type: string, attrs?: Attrs) => {
		marks = addMark(marks, attrs ? { type, attrs } : { type })
	}
	if (tag === 'strong' || tag === 'b') add('bold')
	else if (tag === 'em' || tag === 'i') add('italic')
	else if (tag === 'u' || tag === 'ins') add('underline')
	else if (tag === 's' || tag === 'strike' || tag === 'del') add('strike')
	else if ((tag === 'code' || tag === 'kbd' || tag === 'samp' || tag === 'tt') && !inPre) add('code')
	else if (tag === 'sub') add('subscript')
	else if (tag === 'sup') add('superscript')
	else if (tag === 'a') {
		const link = linkMark(el)
		if (link) marks = addMark(marks, link)
	} else if (tag === 'mark') {
		add('highlight', { color: safeColor(el.getAttribute('data-color')) ?? safeColor(style['background-color']) ?? null })
	} else if (tag === 'font') {
		marks = withTextStyle(marks, { color: safeColor(el.getAttribute('color')), fontFamily: safeValue(el.getAttribute('face') ?? undefined) })
	}

	const weight = style['font-weight']?.toLowerCase()
	if (weight) {
		const n = Number(weight)
		if (weight === 'bold' || weight === 'bolder' || n >= 600) add('bold')
		else if (weight === 'normal' || weight === 'lighter' || n < 600) marks = removeMark(marks, 'bold')
	}
	const fontStyle = style['font-style']?.toLowerCase()
	if (fontStyle === 'italic' || fontStyle === 'oblique') add('italic')
	else if (fontStyle === 'normal') marks = removeMark(marks, 'italic')
	const decoration = (style['text-decoration-line'] ?? style['text-decoration'] ?? '').toLowerCase()
	if (decoration.includes('underline')) add('underline')
	if (decoration.includes('line-through')) add('strike')
	const vertical = style['vertical-align']?.toLowerCase()
	if (vertical === 'super') add('superscript')
	else if (vertical === 'sub') add('subscript')
	else if (vertical === 'baseline') marks = removeMark(removeMark(marks, 'subscript'), 'superscript')

	const patch: Attrs = {}
	patch.color = safeColor(style.color)
	const size = safeValue(style['font-size'])
	if (size && !['inherit', 'initial', 'unset', 'medium'].includes(size.toLowerCase())) patch.fontSize = size
	const family = safeValue(style['font-family'])
	if (family && !['inherit', 'initial', 'unset'].includes(family.toLowerCase())) patch.fontFamily = family
	const line = safeValue(style['line-height'])
	if (line && !['normal', 'inherit', 'initial', 'unset'].includes(line.toLowerCase())) patch.lineHeight = line
	if (Object.values(patch).some(Boolean)) marks = withTextStyle(marks, patch)

	// A highlight from background-color (a mark element keeps its own colour).
	if (tag !== 'mark') {
		const bg = safeColor(style['background-color']) ?? safeColor(style['mso-highlight'])
		if (bg && bg.toLowerCase() !== 'white') add('highlight', { color: bg })
	}
	return marks
}

const para = (align: string | null): Desc => ({ type: 'paragraph', align })

const buildTextblock = (desc: Desc, runs: TextNode[]): ElementNode =>
	desc.type === 'heading' ? createElement('heading', { level: desc.level ?? 1, textAlign: desc.align }, runs) : createElement('paragraph', { textAlign: desc.align }, runs)

class Collector {
	out: ElementNode[] = []
	buf: TextNode[] = []
	constructor(public desc: Desc) {}

	private lastChar(): string {
		const last = this.buf[this.buf.length - 1]
		return last ? last.text[last.text.length - 1]! : ''
	}

	text(raw: string, marks: Mark[]) {
		let s = raw.replace(/[ \t\n\r\f]+/g, ' ')
		const prev = this.lastChar()
		if (s.startsWith(' ') && (prev === '' || prev === ' ' || prev === '\n')) s = s.slice(1)
		if (s) this.buf.push(run(s, marks))
	}

	br(marks: Mark[]) {
		const last = this.buf[this.buf.length - 1]
		if (last && last.text.endsWith(' ')) this.buf[this.buf.length - 1] = run(last.text.replace(/ +$/, ''), last.marks)
		this.buf.push(run('\n', marks))
	}

	flush(force = false) {
		const buf = this.buf
		this.buf = []
		while (buf.length) {
			const last = buf[buf.length - 1]!
			const trimmed = last.text.replace(/ +$/, '')
			if (trimmed === last.text) break
			if (trimmed) buf[buf.length - 1] = run(trimmed, last.marks)
			else buf.pop()
		}
		let runs = normalizeInline(buf)
		// A line that is only a break is an empty line.
		if (runs.length === 1 && runs[0]!.text === '\n') runs = []
		if (!runs.length && !force) return
		this.out.push(buildTextblock(this.desc, runs))
	}
}

class Reader {
	sawBlock = false

	walkChildren(node: Node, ctx: Ctx, c: Collector, inPre = false) {
		for (const child of Array.from(node.childNodes)) this.walk(child, ctx, c, inPre)
	}

	blocksOf(node: Node, ctx: Ctx, align: string | null = ctx.align): ElementNode[] {
		const sc = new Collector(para(align))
		this.walkChildren(node, ctx, sc)
		sc.flush()
		return sc.out
	}

	walk(node: Node, ctx: Ctx, c: Collector, inPre = false) {
		if (node.nodeType === 3) {
			c.text((node as Text).data, ctx.marks)
			return
		}
		if (node.nodeType !== 1) return
		const el = node as Element
		const tag = el.localName.toLowerCase()
		if (IGNORED.has(tag)) return
		const style = parseStyle(el.getAttribute('style'))
		if (/^none\b/i.test(style.display ?? '') || el.hasAttribute('hidden')) return
		if (tag === 'br') {
			if (!/Apple-interchange-newline/.test(el.getAttribute('class') ?? '')) c.br(ctx.marks)
			return
		}
		if (tag === 'o:p' && !(el.textContent ?? '').replace(/[\s ]+/g, '')) return

		const own = alignOf(el, style) ?? (tag === 'center' ? 'center' : null)
		const inner: Ctx = { marks: marksFor(el, tag, style, ctx.marks, inPre), align: own ?? ctx.align }

		if (/^h[1-6]$/.test(tag)) return this.textblock(el, inner, c, { type: 'heading', level: Number(tag[1]), align: inner.align }, true)
		if (tag === 'p') return this.textblock(el, inner, c, para(inner.align), true)
		if (BLOCKISH.has(tag)) return this.textblock(el, inner, c, para(inner.align), false)
		switch (tag) {
			case 'pre':
				return this.pre(el, c)
			case 'blockquote': {
				this.sawBlock = true
				c.flush()
				const blocks = this.blocksOf(el, inner)
				if (blocks.length) c.out.push(createElement('blockquote', undefined, blocks))
				return
			}
			case 'ul':
			case 'ol':
				this.sawBlock = true
				c.flush()
				return this.list(el, inner, c.out)
			case 'hr':
				this.sawBlock = true
				c.flush()
				c.out.push(createElement('horizontalRule'))
				return
			case 'table':
				this.sawBlock = true
				c.flush()
				return this.table(el, inner, c.out)
			default:
				this.walkChildren(el, inner, c, inPre)
		}
	}

	private textblock(el: Element, ctx: Ctx, c: Collector, desc: Desc, force: boolean) {
		this.sawBlock = true
		c.flush()
		const saved = c.desc
		c.desc = desc
		this.walkChildren(el, ctx, c)
		c.flush(force)
		c.desc = saved
	}

	private pre(el: Element, c: Collector) {
		this.sawBlock = true
		c.flush()
		const codeEl = el.querySelector('code')
		const classes = `${codeEl?.getAttribute('class') ?? ''} ${el.getAttribute('class') ?? ''}`
		const language = /(?:^|\s)(?:language|lang)-([\w+#.-]+)/.exec(classes)?.[1] ?? el.getAttribute('data-language') ?? null
		const text = preText(el)
		c.out.push(createElement('codeBlock', { language }, text ? [run(text)] : []))
	}

	private list(el: Element, ctx: Ctx, out: ElementNode[]) {
		const ordered = el.localName.toLowerCase() === 'ol'
		const items: ElementNode[] = []
		const itemFrom = (nodes: Node[], liCtx: Ctx): ElementNode => {
			const sc = new Collector(para(liCtx.align))
			for (const n of nodes) this.walk(n, liCtx, sc)
			sc.flush()
			return createElement('listItem', undefined, fixItemContent(sc.out))
		}
		for (const child of Array.from(el.childNodes)) {
			if (child.nodeType === 3) {
				if ((child as Text).data.trim()) items.push(itemFrom([child], ctx))
				continue
			}
			if (child.nodeType !== 1) continue
			const ce = child as Element
			const tag = ce.localName.toLowerCase()
			if (IGNORED.has(tag)) continue
			const style = parseStyle(ce.getAttribute('style'))
			if (tag === 'li') {
				const liCtx: Ctx = { marks: marksFor(ce, tag, style, ctx.marks, false), align: alignOf(ce, style) ?? ctx.align }
				items.push(itemFrom(Array.from(ce.childNodes), liCtx))
			} else if (tag === 'ul' || tag === 'ol') {
				// A list placed straight inside a list (Word does this) belongs to the item before it.
				const nested: ElementNode[] = []
				this.list(ce, ctx, nested)
				const last = items[items.length - 1]
				if (last) items[items.length - 1] = { ...last, content: [...(last.content ?? []), ...nested] }
				else items.push(createElement('listItem', undefined, [createElement('paragraph'), ...nested]))
			} else items.push(itemFrom([child], ctx))
		}
		if (!items.length) return
		if (ordered) {
			const start = parseInt(el.getAttribute('start') ?? '', 10)
			out.push(createElement('orderedList', { start: Number.isFinite(start) ? start : 1, type: el.getAttribute('type') || null }, items))
		} else out.push(createElement('bulletList', undefined, items))
	}

	private table(el: Element, ctx: Ctx, out: ElementNode[]) {
		const colWidths = Array.from(el.querySelectorAll('col')).map((col) => {
			const w = /^\s*([\d.]+)px/i.exec(parseStyle(col.getAttribute('style')).width ?? '') ?? /^\s*(\d+)\s*(?:px)?\s*$/i.exec(col.getAttribute('width') ?? '')
			return w ? Math.round(Number(w[1])) : null
		})
		const rows: ElementNode[] = []
		for (const tr of Array.from(el.querySelectorAll('tr'))) {
			if (tr.closest('table') !== el) continue
			const cells: ElementNode[] = []
			let col = 0
			for (const td of Array.from(tr.children)) {
				const tag = td.localName.toLowerCase()
				if (tag !== 'td' && tag !== 'th') continue
				const style = parseStyle(td.getAttribute('style'))
				const cellCtx: Ctx = { marks: marksFor(td, tag, style, ctx.marks, false), align: alignOf(td, style) ?? ctx.align }
				const colspan = Math.max(1, parseInt(td.getAttribute('colspan') ?? '', 10) || 1)
				const rowspan = Math.max(1, parseInt(td.getAttribute('rowspan') ?? '', 10) || 1)
				const raw = td.getAttribute('data-colwidth') ?? td.getAttribute('colwidth')
				let colwidth: number[] | null = raw ? raw.split(',').map((n) => Math.round(Number(n))) : null
				if (colwidth && !colwidth.every((n) => Number.isFinite(n) && n > 0)) colwidth = null
				if (!colwidth) {
					const fromCols = colWidths.slice(col, col + colspan)
					colwidth = fromCols.length === colspan && fromCols.every((n): n is number => !!n) ? fromCols : null
				}
				col += colspan
				cells.push(createElement(tag === 'th' ? 'tableHeader' : 'tableCell', { colspan, rowspan, colwidth }, this.blocksOf(td, cellCtx)))
			}
			if (cells.length) rows.push(createElement('tableRow', undefined, cells))
		}
		if (rows.length) out.push(createElement('table', undefined, rows))
	}
}

/** The first child of a list item is a paragraph. */
function fixItemContent(blocks: ElementNode[]): ElementNode[] {
	const first = blocks[0]
	if (!first || first.type === 'paragraph') return blocks
	if (isTextblock(first) && first.type !== 'codeBlock') return [createElement('paragraph', { textAlign: first.attrs?.textAlign ?? null }, first.content), ...blocks.slice(1)]
	return [createElement('paragraph'), ...blocks]
}

function preText(node: Node): string {
	let s = ''
	for (const child of Array.from(node.childNodes)) {
		if (child.nodeType === 3) s += (child as Text).data
		else if (child.nodeType === 1) {
			const el = child as Element
			const tag = el.localName.toLowerCase()
			if (IGNORED.has(tag)) continue
			if (tag === 'br') s += '\n'
			else {
				if (BLOCKISH.has(tag) && s && !s.endsWith('\n')) s += '\n'
				s += preText(el)
			}
		}
	}
	return s
}

/** Pasted HTML as top-level blocks. `inlineOnly` means it held no block element at all (a copied phrase): then `blocks` is one paragraph. */
export function htmlToFragment(html: string): { blocks: ElementNode[]; inlineOnly: boolean } {
	try {
		if (typeof DOMParser === 'undefined' || !html) return { blocks: [], inlineOnly: false }
		const body = new DOMParser().parseFromString(html, 'text/html').body
		const reader = new Reader()
		const root = new Collector(para(null))
		reader.walkChildren(body, { marks: [], align: null }, root)
		root.flush()
		if (!root.out.length) return { blocks: [], inlineOnly: false }
		const blocks = normalizeDoc({ type: 'doc', content: root.out }).content
		const inlineOnly = !reader.sawBlock
		return { blocks: inlineOnly ? blocks.slice(0, 1) : blocks, inlineOnly }
	} catch {
		return { blocks: [], inlineOnly: false }
	}
}

/** Pasted or dropped HTML as a valid document (an empty document when there is nothing usable). */
export function htmlToDoc(html: string): Doc {
	try {
		const { blocks } = htmlToFragment(html)
		return blocks.length ? normalizeDoc({ type: 'doc', content: blocks }) : emptyDoc()
	} catch {
		return emptyDoc()
	}
}
