import { inlineLength } from '@/libs/richtext/inline'
import { createElement, isElement, isTextblock } from '@/libs/richtext/schema'
import { caret, textSelection } from '@/libs/richtext/selection'
import type { Command, Doc, EditorState, ElementNode, Mark, RTNode, Selection, TextNode } from '@/libs/richtext/types'

// A tiny way to write documents and read them back in tests.

type Inline = string | TextNode
const toRuns = (parts: Inline[]): TextNode[] => parts.map((x) => (typeof x === 'string' ? ({ type: 'text', text: x } as TextNode) : x)).filter((x) => x.text)

/** A text run with marks: t('bold', 'bold'), t('red', mark('textStyle', { color: 'red' })). */
export const t = (text: string, ...marks: (string | Mark)[]): TextNode => ({
	type: 'text',
	text,
	marks: marks.map((m) => (typeof m === 'string' ? { type: m } : m)),
})
export const mark = (type: string, attrs?: Record<string, unknown>): Mark => ({ type, ...(attrs ? { attrs } : {}) })

export const p = (...parts: Inline[]) => createElement('paragraph', undefined, toRuns(parts))
export const h = (level: number, ...parts: Inline[]) => createElement('heading', { level }, toRuns(parts))
export const code = (...parts: Inline[]) => createElement('codeBlock', undefined, toRuns(parts))
export const li = (...blocks: ElementNode[]) => createElement('listItem', undefined, blocks)
export const ul = (...items: ElementNode[]) => createElement('bulletList', undefined, items)
export const ol = (...items: ElementNode[]) => createElement('orderedList', undefined, items)
export const quote = (...blocks: ElementNode[]) => createElement('blockquote', undefined, blocks)
export const hr = () => createElement('horizontalRule')
export const cell = (...blocks: ElementNode[]) => createElement('tableCell', undefined, blocks)
export const th = (...blocks: ElementNode[]) => createElement('tableHeader', undefined, blocks)
export const tr = (...cells: ElementNode[]) => createElement('tableRow', undefined, cells)
export const table = (...rows: ElementNode[]) => createElement('table', undefined, rows)
export const doc = (...blocks: ElementNode[]): Doc => ({ type: 'doc', content: blocks })

/** The state with a collapsed caret, or a range when `to` is given. Paths are text block paths. */
export function at(d: Doc, path: number[], offset: number, to?: { path?: number[]; offset: number }): EditorState {
	const selection: Selection = to ? textSelection({ path, offset }, { path: to.path ?? path, offset: to.offset }) : caret(path, offset)
	return { doc: d, selection, storedMarks: null }
}

const runText = (r: TextNode) => {
	const marks = (r.marks ?? []).map((m) => {
		const set = Object.entries(m.attrs ?? {}).filter(([, v]) => v !== null && v !== undefined)
		return set.length ? `${m.type}:${set.map(([k, v]) => `${k}=${v}`).join(',')}` : m.type
	})
	return marks.length ? `[${r.text}|${marks.join(',')}]` : r.text.replace(/\n/g, '↵')
}

/** A short readable form: p(Hello [wor|bold]ld), ul[li[p(a)]], h2(Title). */
export function outline(node: RTNode): string {
	if (!isElement(node)) return runText(node)
	if (isTextblock(node)) {
		const level = node.type === 'heading' ? String(node.attrs?.level ?? 1) : ''
		const align = node.attrs?.textAlign ? `{${node.attrs.textAlign}}` : ''
		const name = node.type === 'paragraph' ? 'p' : node.type === 'heading' ? `h${level}` : node.type === 'codeBlock' ? 'code' : node.type
		return `${name}${align}(${((node.content ?? []) as TextNode[]).map(runText).join('')})`
	}
	if (node.type === 'horizontalRule') return 'hr'
	const names: Record<string, string> = { bulletList: 'ul', orderedList: 'ol', listItem: 'li', blockquote: 'quote', table: 'table', tableRow: 'tr', tableCell: 'td', tableHeader: 'th' }
	const inner = (node.content ?? []).map(outline)
	return node.type === 'doc' ? inner.join(' | ') : `${names[node.type] ?? node.type}[${inner.join(', ')}]`
}

/** The selection as 'path:offset' (or 'a-b' for a range). */
export const sel = (s: EditorState) => {
	if (s.selection.type !== 'text') return 'cells'
	const f = (pt: { path: readonly number[]; offset: number }) => `${pt.path.join('.')}:${pt.offset}`
	const { anchor, head } = s.selection
	return anchor.path.join('.') === head.path.join('.') && anchor.offset === head.offset ? f(head) : `${f(anchor)}-${f(head)}`
}

/** Runs a command that must apply. */
export function run(state: EditorState, command: Command): EditorState {
	const next = command(state)
	if (!next) throw new Error('command did not apply')
	return next
}

export const len = (d: Doc, path: number[]) => {
	let n: RTNode = d
	for (const i of path) n = (n as ElementNode).content![i]!
	return inlineLength(((n as ElementNode).content ?? []) as TextNode[])
}
