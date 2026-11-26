import { describe, it, expect } from 'vitest'
import { generateHTML, generateJSON } from '@tiptap/react'
import { extensions } from '@/libs/tiptap/config'
import { fromTiptap, toTiptap } from '@/libs/richtext/tiptapJson'
import { loadCorpus } from './corpus'

// TipTap itself is the oracle: whatever we write must be read by TipTap exactly as it reads the original.
const canon = (json: unknown) => generateJSON(generateHTML(json as never, extensions), extensions)

describe('TipTap JSON round trip', () => {
	const corpus = loadCorpus()

	it('has a real corpus to test against', () => {
		expect(corpus.length).toBeGreaterThan(20)
	})

	it('writes what TipTap reads back identically, for every sample document', () => {
		const failures: string[] = []
		corpus.forEach((doc, i) => {
			const ours = toTiptap(fromTiptap(doc))
			try { expect(canon(ours)).toEqual(canon(doc)) } catch { failures.push(`#${i} ${JSON.stringify(doc).slice(0, 120)}`) }
		})
		expect(failures).toEqual([])
	}, 120000)

	it('is stable: converting twice changes nothing', () => {
		for (const doc of corpus) {
			const once = toTiptap(fromTiptap(doc))
			expect(toTiptap(fromTiptap(once))).toEqual(once)
		}
	})

	it('turns a hard break into a newline character and back', () => {
		const json = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }, { type: 'hardBreak' }, { type: 'text', text: 'b', marks: [{ type: 'bold' }] }] }] }
		const doc = fromTiptap(json)
		expect(doc.content[0]!.content).toEqual([{ type: 'text', text: 'a\n' }, { type: 'text', text: 'b', marks: [{ type: 'bold' }] }])
		expect(toTiptap(doc)).toEqual({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }, { type: 'hardBreak' }, { type: 'text', text: 'b', marks: [{ type: 'bold' }] }] }] })
	})

	it('keeps a newline in a code block as text', () => {
		const json = { type: 'doc', content: [{ type: 'codeBlock', attrs: { language: null }, content: [{ type: 'text', text: 'a\nb' }] }] }
		expect(toTiptap(fromTiptap(json)).content![0]!.content).toEqual([{ type: 'text', text: 'a\nb' }])
	})

	it('reads a JSON string, and gives an empty document for anything unreadable', () => {
		expect(fromTiptap('{"type":"doc","content":[{"type":"paragraph"}]}').content).toHaveLength(1)
		expect(fromTiptap('not json').content).toEqual([{ type: 'paragraph', attrs: { textAlign: null }, content: [] }])
		expect(fromTiptap(undefined).type).toBe('doc')
		expect(fromTiptap({ type: 'doc' }).content).toHaveLength(1)
	})
})
