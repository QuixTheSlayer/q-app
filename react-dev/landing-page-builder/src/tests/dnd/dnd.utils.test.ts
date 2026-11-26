import { describe, it, expect } from 'vitest'
import { getNearestSideX, getNearestSideY, getNearestEdge, getNearestEdgeX, getNearestEdgeY } from '@/utils/dnd.utils'
import type { ClientRect } from '@dnd-kit/core'

const rect = { left: 0, top: 0, right: 100, bottom: 50, width: 100, height: 50 } as ClientRect

describe('getNearestSideX', () => {
  it('returns "left" when the point is closer to the left edge', () => {
    expect(getNearestSideX(rect, { x: 10, y: 0 })).toBe('left')
  })

  it('returns "right" when the point is closer to the right edge', () => {
    expect(getNearestSideX(rect, { x: 90, y: 0 })).toBe('right')
  })
})

describe('getNearestSideY', () => {
  it('returns "top" when the point is closer to the top edge', () => {
    expect(getNearestSideY(rect, { x: 0, y: 5 })).toBe('top')
  })

  it('returns "bottom" when the point is closer to the bottom edge', () => {
    expect(getNearestSideY(rect, { x: 0, y: 45 })).toBe('bottom')
  })
})

describe('getNearestEdge', () => {
  it('detects the left edge within padding', () => {
    expect(getNearestEdge(rect, { x: 5, y: 25 }, 10)).toEqual({ x: 'left', y: 'center' })
  })

  it('detects the right edge within padding', () => {
    expect(getNearestEdge(rect, { x: 95, y: 25 }, 10)).toEqual({ x: 'right', y: 'center' })
  })

  it('detects the top edge within padding', () => {
    expect(getNearestEdge(rect, { x: 50, y: 2 }, 10)).toEqual({ x: 'center', y: 'top' })
  })

  it('detects the bottom edge within padding', () => {
    expect(getNearestEdge(rect, { x: 50, y: 48 }, 10)).toEqual({ x: 'center', y: 'bottom' })
  })

  it('returns center for both axes when the point is well inside the rect', () => {
    expect(getNearestEdge(rect, { x: 50, y: 25 }, 5)).toEqual({ x: 'center', y: 'center' })
  })
})

describe('getNearestEdgeX', () => {
  it('returns "left" within the left padding zone', () => {
    expect(getNearestEdgeX(rect, { x: 5, y: 0 }, 10)).toBe('left')
  })

  it('returns "right" within the right padding zone', () => {
    expect(getNearestEdgeX(rect, { x: 95, y: 0 }, 10)).toBe('right')
  })

  it('returns "center" outside the padding zones', () => {
    expect(getNearestEdgeX(rect, { x: 50, y: 0 }, 10)).toBe('center')
  })
})

describe('getNearestEdgeY', () => {
  it('returns "top" within the top padding zone', () => {
    expect(getNearestEdgeY(rect, { x: 0, y: 2 }, 10)).toBe('top')
  })

  it('returns "bottom" within the bottom padding zone', () => {
    expect(getNearestEdgeY(rect, { x: 0, y: 48 }, 10)).toBe('bottom')
  })

  it('returns "center" outside the padding zones', () => {
    expect(getNearestEdgeY(rect, { x: 0, y: 25 }, 10)).toBe('center')
  })
})
