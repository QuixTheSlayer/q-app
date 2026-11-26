import { describe, it, expect } from 'vitest'
import { camelToSentenceCase } from '@/utils/string.utils'

describe('camelToSentenceCase', () => {
  it('returns an empty string for falsy input', () => {
    expect(camelToSentenceCase('')).toBe('')
  })

  it('converts camelCase to a sentence-cased string', () => {
    expect(camelToSentenceCase('helloWorld')).toBe('Hello World')
  })

  it('converts kebab-case to a sentence-cased string', () => {
    expect(camelToSentenceCase('hello-world')).toBe('Hello world')
  })

  it('converts snake_case to a sentence-cased string', () => {
    expect(camelToSentenceCase('hello_world')).toBe('Hello world')
  })

  it('handles multiple consecutive uppercase letters', () => {
    expect(camelToSentenceCase('someHTMLValue')).toBe('Some H T M L Value')
  })

  it('capitalizes an already-lowercase single word', () => {
    expect(camelToSentenceCase('text')).toBe('Text')
  })

  it('trims and normalizes mixed separators', () => {
    expect(camelToSentenceCase('multi__word--case')).toBe('Multi word case')
  })
})
