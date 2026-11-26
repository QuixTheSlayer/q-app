import { describe, it, expect } from 'vitest'
import { formatRatingSummary, getStarFillPercent } from '@/utils/rating.utils'

describe('formatRatingSummary', () => {
  it('builds the default summary text', () => {
    expect(formatRatingSummary({ value: 4.5, maxStars: 5, reviewCount: 3982, customSummaryText: undefined }))
      .toBe('4.5 out of 5 — based on 3,982 reviews')
  })

  it('uses singular "review" for a review count of 1', () => {
    expect(formatRatingSummary({ value: 5, maxStars: 5, reviewCount: 1, customSummaryText: undefined }))
      .toBe('5 out of 5 — based on 1 review')
  })

  it('uses plural "reviews" for a review count of 0', () => {
    expect(formatRatingSummary({ value: 0, maxStars: 5, reviewCount: 0, customSummaryText: undefined }))
      .toBe('0 out of 5 — based on 0 reviews')
  })

  it('formats large review counts with thousands separators', () => {
    expect(formatRatingSummary({ value: 4.8, maxStars: 5, reviewCount: 1234567, customSummaryText: undefined }))
      .toBe('4.8 out of 5 — based on 1,234,567 reviews')
  })

  it('prefers customSummaryText when set, ignoring the other fields', () => {
    expect(formatRatingSummary({ value: 4.5, maxStars: 5, reviewCount: 3982, customSummaryText: 'Loved by thousands' }))
      .toBe('Loved by thousands')
  })
})

describe('getStarFillPercent', () => {
  it('is fully filled for a star index well below the value', () => {
    expect(getStarFillPercent(0, 4.5)).toBe(100)
    expect(getStarFillPercent(3, 4.5)).toBe(100)
  })

  it('is half filled for the star straddling a .5 value', () => {
    expect(getStarFillPercent(4, 4.5)).toBe(50)
  })

  it('is empty for a star index above the value', () => {
    expect(getStarFillPercent(4, 3)).toBe(0)
  })

  it('handles a whole-number value with no partial star', () => {
    expect(getStarFillPercent(2, 3)).toBe(100)
    expect(getStarFillPercent(3, 3)).toBe(0)
  })

  it('handles a zero rating', () => {
    expect(getStarFillPercent(0, 0)).toBe(0)
  })

  it('clamps fill to 100 even if value exceeds maxStars', () => {
    expect(getStarFillPercent(0, 7)).toBe(100)
  })

  it('handles arbitrary fractional precision, not just halves', () => {
    expect(getStarFillPercent(2, 2.3)).toBe(30)
  })
})
