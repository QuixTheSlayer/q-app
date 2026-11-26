import { describe, it, expect } from 'vitest'
import { MAX_HTML_FILE_BYTES, readHtmlFile } from '@/utils/readHtmlFile'
import { htmlToJsonTree } from '@/utils/htmlToCanvasNodes'

const file = (content: BlobPart, name = 'page.html') => new File([content], name, { type: 'text/html' })

describe('readHtmlFile', () => {
	it('returns the text of an html file, ready for the importer', async () => {
		const result = await readHtmlFile(file('<!doctype html><html><body><section id="a"><h1>Hello</h1></section></body></html>'))
		expect(result.ok).toBe(true)
		if (!result.ok) return
		expect(htmlToJsonTree(result.text).root.children.length).toBe(1)
	})

	it('keeps non-latin text intact (UTF-8)', async () => {
		const result = await readHtmlFile(file('<p>မင်္ဂလာပါ 你好</p>'))
		expect(result).toEqual({ ok: true, text: '<p>မင်္ဂလာပါ 你好</p>' })
	})

	it('drops a UTF-8 byte order mark', async () => {
		const bytes = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode('<p>x</p>')])
		const result = await readHtmlFile(file(bytes))
		expect(result).toEqual({ ok: true, text: '<p>x</p>' })
	})

	it('rejects an empty or whitespace-only file', async () => {
		expect(await readHtmlFile(file(''))).toEqual({ ok: false, reason: 'empty' })
		expect(await readHtmlFile(file('  \n\t '))).toEqual({ ok: false, reason: 'empty' })
	})

	it('rejects a file over the size limit without reading it', async () => {
		const big = file(new Uint8Array(MAX_HTML_FILE_BYTES + 1))
		expect(await readHtmlFile(big)).toEqual({ ok: false, reason: 'tooLarge' })
	})

	it('reports an unreadable file instead of throwing', async () => {
		const broken = { size: 10, text: () => Promise.reject(new Error('nope')) } as unknown as File
		expect(await readHtmlFile(broken)).toEqual({ ok: false, reason: 'unreadable' })
	})
})
