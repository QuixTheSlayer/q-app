import { describe, it, expect } from 'vitest'
import { cn } from '@/libs/cn'

describe('cn', () => {
  it('joins multiple class name strings', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('filters out falsy values', () => {
    expect(cn('a', false, undefined, null, '', 'b')).toBe('a b')
  })

  it('merges conflicting Tailwind classes, keeping the last one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('supports conditional object syntax', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active')
  })

  it('supports arrays of class names', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c')
  })
})
