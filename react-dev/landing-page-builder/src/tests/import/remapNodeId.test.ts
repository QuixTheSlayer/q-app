import { describe, it, expect } from 'vitest'
import { remapNodeId } from '@/utils/remapNodeId'
import { htmlToJsonTree } from '@/utils/htmlToCanvasNodes'
import { buildExportHtml } from '@/utils/exportHTML'

describe('remapNodeId', () => {
	it('moves a generated id everywhere, including inside css text and keys', () => {
		const from = 'a2-8bd4b302fa12-44'
		const tree = { id: from, children: [{ id: 'x1', style: { a: `[data-id="${from}"] { color: red }` } }], animation: { [from]: 1 } }
		const out = remapNodeId(tree, from, 'new-1111-22') as typeof tree
		expect(JSON.stringify(out)).not.toContain(from)
		expect(out.id).toBe('new-1111-22')
		expect(out.children[0].style.a).toContain('[data-id="new-1111-22"]')
	})

	it('keeps contentType "root" when the old root id is the word root', () => {
		const tree = {
			id: 'root', type: 'container', contentType: 'root',
			children: [{ id: 'c1', type: 'container', contentType: 'block', attributes: { className: 'root-bar', title: 'root cause' } }],
			animation: [{ target: 'root' }],
		}
		const out = remapNodeId(tree, 'root', '2af15ec4-44d0-43c3-999f-89529e4f1d1f') as typeof tree
		expect(out.id).toBe('2af15ec4-44d0-43c3-999f-89529e4f1d1f')
		expect(out.contentType).toBe('root')
		expect(out.animation[0].target).toBe('2af15ec4-44d0-43c3-999f-89529e4f1d1f')
		expect(out.children[0].attributes.className).toBe('root-bar')
		expect(out.children[0].attributes.title).toBe('root cause')
	})

	it('returns an independent copy when the ids match', () => {
		const tree = { id: 'p', children: [] as unknown[] }
		const out = remapNodeId(tree, 'p', 'p')
		expect(out).toEqual(tree)
		expect(out).not.toBe(tree)
	})

	it('a restored export whose root id is "root" is still a root node', () => {
		const content = { id: 'root', type: 'container', contentType: 'root', layout: 'column', style: {}, children: [{ id: 's1', type: 'container', contentType: 'section', layout: 'column', style: {}, children: [] }] }
		const exported = buildExportHtml('<div></div>', 'Page', { content } as never)
		const restored = htmlToJsonTree(exported).root
		const out = remapNodeId(restored, restored.id, '2af15ec4-44d0-43c3-999f-89529e4f1d1f')
		expect(out.contentType).toBe('root')
		expect(out.id).toBe('2af15ec4-44d0-43c3-999f-89529e4f1d1f')
	})
})
