import { describe, it, expect } from 'vitest'
import nodeUpdater from '@/utils/nodeUpdater'
import type { CanvasNode, LayoutNode, ContentNode } from '@/types/node.type'

function textNode(id: string, text = 'hi'): ContentNode {
  return { id, type: 'content', contentType: 'text', style: {}, children: text } as ContentNode
}

function containerNode(id: string, children: CanvasNode[]): LayoutNode {
  return { id, type: 'container', contentType: 'section', layout: 'row', style: {}, children } as LayoutNode
}

describe('nodeUpdater', () => {
  it('updates the target node itself when the path is [NaN] (self-update sentinel)', () => {
    const root = containerNode('root', [textNode('a')])
    const result = nodeUpdater(root, [NaN], (node) => ({ ...node, style: { color: 'red' } }))

    expect(result.style).toEqual({ color: 'red' })
    expect(result.id).toBe('root')
  })

  it('updates a direct child by index', () => {
    const root = containerNode('root', [textNode('a'), textNode('b')])
    const result = nodeUpdater(root, [1], (node) => ({ ...node, style: { color: 'blue' } })) as LayoutNode

    expect(result.children[0]).toEqual(root.children[0])
    expect(result.children[1].style).toEqual({ color: 'blue' })
    expect(result.children[1].id).toBe('b')
  })

  it('updates a deeply nested node via a multi-level path', () => {
    const grandchild = textNode('grandchild')
    const child = containerNode('child', [grandchild])
    const root = containerNode('root', [child])

    const result = nodeUpdater(root, [0, 0], (node) => ({ ...node, children: 'updated' })) as LayoutNode
    const updatedChild = result.children[0] as LayoutNode
    const updatedGrandchild = updatedChild.children[0] as ContentNode

    expect(updatedGrandchild.children).toBe('updated')
    expect(updatedGrandchild.id).toBe('grandchild')
  })

  it('does not mutate the original node tree (immutable update)', () => {
    const root = containerNode('root', [textNode('a')])
    const original = structuredClone(root)

    nodeUpdater(root, [0], (node) => ({ ...node, style: { color: 'green' } }))

    expect(root).toEqual(original)
  })

  it('returns the node unchanged when it has no children capability', () => {
    const leaf = textNode('leaf')
    const result = nodeUpdater(leaf, [0], (node) => ({ ...node, children: 'changed' }))

    expect(result).toBe(leaf)
  })

  it('returns the node unchanged when children is not an array', () => {
    const malformed = { id: 'x', type: 'container', contentType: 'section', layout: 'row', style: {}, children: undefined } as unknown as LayoutNode
    const result = nodeUpdater(malformed, [0], (node) => ({ ...node, style: { color: 'red' } }))

    expect(result).toBe(malformed)
  })

  it('leaves sibling nodes untouched when updating one child', () => {
    const root = containerNode('root', [textNode('a'), textNode('b'), textNode('c')])
    const result = nodeUpdater(root, [1], (node) => ({ ...node, style: { color: 'blue' } })) as LayoutNode

    expect(result.children[0]).toBe(root.children[0])
    expect(result.children[2]).toBe(root.children[2])
  })
})
