import { emptyDoc } from './doc'
import { normalizeDoc } from './normalize'
import { createElement, isTextblock, kindOf, sortMarks } from './schema'
import type { Attrs, Doc, ElementNode, Mark, TextNode } from './types'

// The boundary with TipTap's JSON (what the builder saves in `node.children`).
// In: a hard break node becomes a "\n" in a text run. Out: a "\n" in a text run becomes a hard break node again
// (but not in a code block, where "\n" is a real newline).

interface Json {
	type?: string
	attrs?: Attrs
	content?: Json[]
	marks?: Mark[]
	text?: string
}

const cleanMarks = (marks: Mark[] | undefined): Mark[] | undefined => {
	if (!marks?.length) return undefined
	const seen = new Set<string>()
	const unique = marks.filter((m) => (seen.has(m.type) ? false : (seen.add(m.type), true)))
	return sortMarks(unique.map((m) => (m.attrs ? { type: m.type, attrs: { ...m.attrs } } : { type: m.type })))
}

function inlineFrom(children: Json[] | undefined): TextNode[] {
	const runs: TextNode[] = []
	for (const child of children ?? []) {
		if (child.type === 'text' && child.text) runs.push({ type: 'text', text: child.text, ...(cleanMarks(child.marks) ? { marks: cleanMarks(child.marks) } : {}) })
		else if (child.type === 'hardBreak') runs.push({ type: 'text', text: '\n', ...(cleanMarks(child.marks) ? { marks: cleanMarks(child.marks) } : {}) })
	}
	return runs
}

function nodeFrom(json: Json): ElementNode | null {
	if (!json.type || json.type === 'text') return null
	const shape: ElementNode = { type: json.type }
	if (json.attrs) shape.attrs = { ...json.attrs }
	const first = json.content?.[0]
	const textual = json.type === 'paragraph' || json.type === 'heading' || json.type === 'codeBlock' || first?.type === 'text' || first?.type === 'hardBreak'
	if (textual && json.type !== 'doc') return { ...shape, content: inlineFrom(json.content) }
	if (json.content) {
		const content = json.content.map(nodeFrom).filter((n): n is ElementNode => n !== null)
		return { ...shape, content }
	}
	return shape
}

/** TipTap JSON (an object or its JSON string) as an editor document. Anything unreadable gives an empty document. */
export function fromTiptap(input: unknown): Doc {
	let json: Json | undefined
	if (typeof input === 'string') {
		try { json = JSON.parse(input) as Json } catch { json = undefined }
	} else if (input && typeof input === 'object') json = input as Json
	if (!json || json.type !== 'doc') return emptyDoc()
	const content = (json.content ?? []).map(nodeFrom).filter((n): n is ElementNode => n !== null)
	return normalizeDoc({ type: 'doc', content })
}

function inlineTo(runs: TextNode[], code: boolean): Json[] {
	const out: Json[] = []
	for (const r of runs) {
		const marks = r.marks?.length ? r.marks : undefined
		if (code) {
			out.push({ type: 'text', text: r.text, ...(marks ? { marks } : {}) })
			continue
		}
		r.text.split('\n').forEach((part, i) => {
			if (i > 0) out.push({ type: 'hardBreak', ...(marks ? { marks } : {}) })
			if (part) out.push({ type: 'text', text: part, ...(marks ? { marks } : {}) })
		})
	}
	return out
}

function nodeTo(node: ElementNode): Json {
	const json: Json = { type: node.type }
	if (node.attrs && Object.keys(node.attrs).length) json.attrs = { ...node.attrs }
	if (isTextblock(node)) {
		const content = inlineTo((node.content ?? []) as TextNode[], node.type === 'codeBlock')
		if (content.length) json.content = content
	} else if (kindOf(node) === 'container' && node.content?.length) {
		json.content = (node.content as ElementNode[]).map(nodeTo)
	}
	return json
}

/** An editor document as TipTap JSON. */
export const toTiptap = (doc: Doc): Json => nodeTo(doc)

/** What the builder stores: the TipTap JSON as a string. */
export const toTiptapString = (doc: Doc): string => JSON.stringify(toTiptap(doc))

