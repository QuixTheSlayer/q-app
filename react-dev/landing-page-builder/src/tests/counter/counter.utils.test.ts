import { describe, it, expect } from 'vitest'
import { formatCounterValue } from '@/utils/counter.utils'

describe('formatCounterValue', () => {
  it('formats a whole number with no decimals by default', () => {
    expect(formatCounterValue(10000, 0, false)).toBe('10000')
  })

  it('adds thousands separators when enabled', () => {
    expect(formatCounterValue(10000, 0, true)).toBe('10,000')
    expect(formatCounterValue(1234567, 0, true)).toBe('1,234,567')
  })

  it('does not add separators to numbers under 1000', () => {
    expect(formatCounterValue(999, 0, true)).toBe('999')
  })

  it('respects the requested decimal places', () => {
    expect(formatCounterValue(4.5, 1, false)).toBe('4.5')
    expect(formatCounterValue(4, 2, false)).toBe('4.00')
  })

  it('combines decimals with thousands separators', () => {
    expect(formatCounterValue(12345.678, 2, true)).toBe('12,345.68')
  })

  it('clamps negative decimals to zero', () => {
    expect(formatCounterValue(42, -3, false)).toBe('42')
  })

  it('handles zero', () => {
    expect(formatCounterValue(0, 0, true)).toBe('0')
  })

  it('handles negative values', () => {
    expect(formatCounterValue(-1000, 0, true)).toBe('-1,000')
  })
})
