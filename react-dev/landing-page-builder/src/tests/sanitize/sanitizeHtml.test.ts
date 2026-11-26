import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '@/utils/sanitizeHtml'

describe('sanitizeHtml', () => {
  it('preserves safe, well-formed HTML', () => {
    expect(sanitizeHtml('<p>Hello <b>world</b></p>')).toBe('<p>Hello <b>world</b></p>')
  })

  it('strips <script> tags', () => {
    const result = sanitizeHtml('<p>hi</p><script>alert(1)</script>')
    expect(result).not.toContain('<script>')
    expect(result).toContain('<p>hi</p>')
  })

  it('strips inline event handler attributes', () => {
    const result = sanitizeHtml('<img src="x.png" onerror="alert(1)">')
    expect(result).not.toContain('onerror')
  })

  it('strips javascript: URLs from href attributes', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>')
    expect(result).not.toContain('javascript:')
  })

  it('returns an empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('')
  })
})
