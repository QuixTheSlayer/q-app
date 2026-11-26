import { describe, it, expect } from 'vitest'
import { hasChildNode } from '@/utils/hasChildNode'
import type { CanvasNode } from '@/types/node.type'

function makeContainer(children: CanvasNode[] = []): CanvasNode {
  return {
    id: 'container-1',
    type: 'container',
    contentType: 'section',
    layout: 'row',
    style: {},
    children,
  } as CanvasNode
}

function makeAccordion(): CanvasNode {
  return {
    id: 'accordion-1',
    type: 'content',
    contentType: 'accordion',
    style: {},
    children: [],
  } as unknown as CanvasNode
}

function makeText(): CanvasNode {
  return {
    id: 'text-1',
    type: 'content',
    contentType: 'text',
    style: {},
    children: 'hello',
  } as CanvasNode
}

describe('hasChildNode', () => {
  it('returns true for container nodes', () => {
    expect(hasChildNode(makeContainer())).toBe(true)
  })

  it('returns true for accordion nodes', () => {
    expect(hasChildNode(makeAccordion())).toBe(true)
  })

  it('returns false for plain content nodes', () => {
    expect(hasChildNode(makeText())).toBe(false)
  })

  it('returns false for a node missing a type', () => {
    expect(hasChildNode({} as CanvasNode)).toBe(false)
  })

  it('returns false for a null-ish node', () => {
    expect(hasChildNode(null as unknown as CanvasNode)).toBe(false)
  })
})
