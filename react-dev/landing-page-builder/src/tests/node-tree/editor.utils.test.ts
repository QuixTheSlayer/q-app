import { describe, it, expect } from 'vitest'
import {
  isLayoutNode,
  isTabNode,
  isAllowedToInsert,
  hasChildNode,
  isAdvancedWidget,
} from '@/utils/editor.utils'
import type { CanvasNode } from '@/types/node.type'

function makeContainer(): CanvasNode {
  return { id: '1', type: 'container', contentType: 'section', layout: 'row', style: {}, children: [] } as CanvasNode
}

function makeTab(): CanvasNode {
  return { id: '2', type: 'content', contentType: 'tab', style: {}, children: [] } as unknown as CanvasNode
}

function makeAccordion(): CanvasNode {
  return { id: '3', type: 'content', contentType: 'accordion', style: {}, children: [] } as unknown as CanvasNode
}

function makeText(): CanvasNode {
  return { id: '4', type: 'content', contentType: 'text', style: {}, children: 'hi' } as CanvasNode
}

describe('isLayoutNode', () => {
  it('returns true only for container nodes', () => {
    expect(isLayoutNode(makeContainer())).toBe(true)
    expect(isLayoutNode(makeText())).toBe(false)
  })
})

describe('isTabNode', () => {
  it('returns true only for tab content nodes', () => {
    expect(isTabNode(makeTab())).toBe(true)
    expect(isTabNode(makeText())).toBe(false)
  })
})

describe('isAllowedToInsert', () => {
  it('allows containers, accordions, and tabs', () => {
    expect(isAllowedToInsert(makeContainer())).toBe(true)
    expect(isAllowedToInsert(makeAccordion())).toBe(true)
    expect(isAllowedToInsert(makeTab())).toBe(true)
  })

  it('disallows plain content nodes', () => {
    expect(isAllowedToInsert(makeText())).toBe(false)
  })
})

describe('hasChildNode (editor.utils)', () => {
  it('returns true for containers and accordions', () => {
    expect(hasChildNode(makeContainer())).toBe(true)
    expect(hasChildNode(makeAccordion())).toBe(true)
  })

  it('returns false for tabs and plain content nodes', () => {
    expect(hasChildNode(makeTab())).toBe(false)
    expect(hasChildNode(makeText())).toBe(false)
  })
})

describe('isAdvancedWidget', () => {
  it('returns true for accordion and tab nodes', () => {
    expect(isAdvancedWidget(makeAccordion())).toBe(true)
    expect(isAdvancedWidget(makeTab())).toBe(true)
  })

  it('returns false for containers and plain content nodes', () => {
    expect(isAdvancedWidget(makeContainer())).toBe(false)
    expect(isAdvancedWidget(makeText())).toBe(false)
  })
})
