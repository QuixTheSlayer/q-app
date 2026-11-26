import { describe, it, expect } from 'vitest'
import { clampProgressValue } from '@/utils/progressBar.utils'

describe('clampProgressValue', () => {
  it('leaves an in-range value unchanged', () => {
    expect(clampProgressValue(92)).toBe(92)
  })

  it('clamps values above 100 down to 100', () => {
    expect(clampProgressValue(150)).toBe(100)
  })

  it('clamps negative values up to 0', () => {
    expect(clampProgressValue(-10)).toBe(0)
  })

  it('handles the exact boundaries', () => {
    expect(clampProgressValue(0)).toBe(0)
    expect(clampProgressValue(100)).toBe(100)
  })
})
