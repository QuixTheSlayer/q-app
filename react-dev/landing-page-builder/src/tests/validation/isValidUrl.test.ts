import { describe, it, expect } from 'vitest'
import { isValidUrl, isValidEmail } from '@/utils/isValidUrl'

describe('isValidUrl', () => {
  it('accepts a well-formed https URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('https://example.com/path?query=1')).toBe(true)
  })

  it('rejects non-https protocols', () => {
    expect(isValidUrl('http://example.com')).toBe(false)
    expect(isValidUrl('ftp://example.com')).toBe(false)
  })

  it('rejects javascript: URLs even if parseable', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejects URLs containing template placeholders', () => {
    expect(isValidUrl('https://example.com/{{id}}')).toBe(false)
  })

  it('rejects URLs containing a $ character', () => {
    expect(isValidUrl('https://example.com/$user')).toBe(false)
  })

  it('rejects malformed URLs', () => {
    expect(isValidUrl('not a url')).toBe(false)
    expect(isValidUrl('')).toBe(false)
  })
})

describe('isValidEmail', () => {
  it('accepts well-formed emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('first.last+tag@sub.example.co')).toBe(true)
  })

  it('rejects malformed emails', () => {
    expect(isValidEmail('not-an-email')).toBe(false)
    expect(isValidEmail('missing-domain@')).toBe(false)
    expect(isValidEmail('@missing-local.com')).toBe(false)
    expect(isValidEmail('has spaces@example.com')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})
