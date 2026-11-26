import { describe, it, expect } from 'vitest'
import compact from '@/utils/compact'

describe('compact', () => {
  it('filters out falsy values from an array', () => {
    expect(compact([0, 1, false, 2, '', 3, null, undefined, NaN])).toEqual([1, 2, 3])
  })

  it('returns an empty array for a fully falsy input', () => {
    expect(compact([false, null, undefined, 0, ''])).toEqual([])
  })

  it('returns an empty array when given a non-array value', () => {
    // @ts-expect-error intentionally passing a non-array to verify the guard
    expect(compact('not-an-array')).toEqual([])
    // @ts-expect-error intentionally passing a non-array to verify the guard
    expect(compact(null)).toEqual([])
  })

  it('preserves order and keeps all truthy values', () => {
    expect(compact(['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
  })
})
