import { describe, it, expect } from 'vitest'
import isNullOrUndefined from '@/utils/isNullOrUndefined'

describe('isNullOrUndefined', () => {
  it('returns true for null and undefined', () => {
    expect(isNullOrUndefined(null)).toBe(true)
    expect(isNullOrUndefined(undefined)).toBe(true)
  })

  it('returns false for falsy but defined values', () => {
    expect(isNullOrUndefined(0)).toBe(false)
    expect(isNullOrUndefined('')).toBe(false)
    expect(isNullOrUndefined(false)).toBe(false)
    expect(isNullOrUndefined(NaN)).toBe(false)
  })

  it('returns false for objects, arrays, and truthy values', () => {
    expect(isNullOrUndefined({})).toBe(false)
    expect(isNullOrUndefined([])).toBe(false)
    expect(isNullOrUndefined('value')).toBe(false)
    expect(isNullOrUndefined(1)).toBe(false)
  })
})
