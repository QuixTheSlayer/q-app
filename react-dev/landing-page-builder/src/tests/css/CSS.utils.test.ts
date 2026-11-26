import { describe, it, expect } from 'vitest'
import CSSUtils from '@/utils/CSS.utils'

describe('CSSUtils.emToPx', () => {
  it('converts em to px using the default root font size (16)', () => {
    expect(CSSUtils.emToPx(1)).toBe(16)
    expect(CSSUtils.emToPx(2.5)).toBe(40)
  })

  it('accepts a custom root font size', () => {
    expect(CSSUtils.emToPx(2, 10)).toBe(20)
  })

  it('handles zero and negative values', () => {
    expect(CSSUtils.emToPx(0)).toBe(0)
    expect(CSSUtils.emToPx(-1)).toBe(-16)
  })
})

describe('CSSUtils.pxToEm', () => {
  it('converts px to em using the default root font size (16)', () => {
    expect(CSSUtils.pxToEm(16)).toBe(1)
    expect(CSSUtils.pxToEm(8)).toBe(0.5)
  })

  it('accepts a custom root font size', () => {
    expect(CSSUtils.pxToEm(20, 10)).toBe(2)
  })

  it('handles zero', () => {
    expect(CSSUtils.pxToEm(0)).toBe(0)
  })
})

describe('CSSUtils.extractEmValue', () => {
  it('returns NaN for falsy input', () => {
    expect(CSSUtils.extractEmValue(undefined)).toBeNaN()
    expect(CSSUtils.extractEmValue('')).toBeNaN()
    expect(CSSUtils.extractEmValue(0)).toBeNaN()
  })

  it('converts a number input to em (treated as px)', () => {
    expect(CSSUtils.extractEmValue(16)).toBe(1)
  })

  it('parses an em string and converts it to px via emToPx', () => {
    // implementation quirk: parses the numeric part of an em string
    // and re-runs it through emToPx (not a pass-through)
    expect(CSSUtils.extractEmValue('2em')).toBe(32)
    expect(CSSUtils.extractEmValue('1.5em')).toBe(24)
  })

  it('returns undefined for a non-em string value', () => {
    expect(CSSUtils.extractEmValue('10px')).toBeUndefined()
  })
})

describe('CSSUtils.setEmValue', () => {
  it('formats a pixel value as an em string', () => {
    expect(CSSUtils.setEmValue(16)).toBe('1em')
    expect(CSSUtils.setEmValue(8)).toBe('0.5em')
  })

  it('formats zero correctly', () => {
    expect(CSSUtils.setEmValue(0)).toBe('0em')
  })
})

describe('CSSUtils.hasNumericValue', () => {
  it('returns true for numbers', () => {
    expect(CSSUtils.hasNumericValue(10)).toBe(true)
    expect(CSSUtils.hasNumericValue(0)).toBe(true)
    expect(CSSUtils.hasNumericValue(-5)).toBe(true)
  })

  it('returns true for valid em strings', () => {
    expect(CSSUtils.hasNumericValue('1em')).toBe(true)
    expect(CSSUtils.hasNumericValue('1.5em')).toBe(true)
    expect(CSSUtils.hasNumericValue('.5em')).toBe(true)
    expect(CSSUtils.hasNumericValue('  2em  ')).toBe(true)
  })

  it('returns false for non-em strings or malformed values', () => {
    expect(CSSUtils.hasNumericValue('10px')).toBe(false)
    expect(CSSUtils.hasNumericValue('em')).toBe(false)
    expect(CSSUtils.hasNumericValue('abc')).toBe(false)
    expect(CSSUtils.hasNumericValue('')).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(CSSUtils.hasNumericValue(undefined)).toBe(false)
  })
})

describe('CSSUtils.getGridCount', () => {
  it('extracts the column count from a repeat() grid template', () => {
    expect(CSSUtils.getGridCount('repeat(3, 1fr)')).toBe(3)
    expect(CSSUtils.getGridCount('repeat(12, minmax(0, 1fr))')).toBe(12)
  })

  it('returns NaN for non-repeat grid templates', () => {
    expect(CSSUtils.getGridCount('1fr 1fr 1fr')).toBeNaN()
  })

  it('returns NaN for empty/undefined input', () => {
    expect(CSSUtils.getGridCount('')).toBeNaN()
  })
})

describe('CSSUtils.getScale', () => {
  it('returns 1 when device width equals the design width (1200)', () => {
    expect(CSSUtils.getScale(1200)).toBeCloseTo(1, 5)
  })

  it('returns a value less than 1 for smaller device widths', () => {
    expect(CSSUtils.getScale(600)).toBeLessThan(1)
  })

  it('returns a value greater than 1 for larger device widths', () => {
    expect(CSSUtils.getScale(2400)).toBeGreaterThan(1)
  })

  it('returns 0 for a device width of 0', () => {
    expect(CSSUtils.getScale(0)).toBe(0)
  })
})
