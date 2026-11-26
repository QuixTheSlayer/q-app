import { describe, it, expect } from 'vitest'
import { htmlToCanvasNode } from '@/utils/htmlToCanvasNodes'
import { sanitizeCanvasTree } from '@/utils/security/sanitizeCanvasTree'
import type { LayoutNode } from '@/types/node.type'

// The action menu's "Import HTML" into the focused node merges `css` into root.css.
describe('htmlToCanvasNode (Import HTML into a node)', () => {
	it('returns class rules for root.css, not the pasted HTML', () => {
		const { nodes, css } = htmlToCanvasNode('<style>.card { color: red; padding: 8px }</style><div><div class="card">Hi</div></div>')
		expect(nodes).toHaveLength(1)
		expect(typeof css).toBe('object')
		expect(Object.keys(css)).toEqual(['card'])
		expect(css.card.style).toMatchObject({ color: 'red' })
	})

	it('drops the broken entries an older import saved into root.css, so the page loads again', () => {
		const broken = { id: 'r', type: 'container', contentType: 'root', style: {}, children: [], css: { 0: '<', 1: null, card: { style: { color: 'red' } } } }
		expect((sanitizeCanvasTree(broken as unknown as LayoutNode) as LayoutNode).css).toEqual({ card: { style: { color: 'red' } } })
		const savedAsArray = { ...broken, css: ['<', '!', null] }
		expect((sanitizeCanvasTree(savedAsArray as unknown as LayoutNode) as LayoutNode).css).toBeUndefined()
	})
})
