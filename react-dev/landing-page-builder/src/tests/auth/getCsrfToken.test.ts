import { describe, it, expect, afterEach } from 'vitest'
import { getCsrfToken } from '@/utils/getCsrfToken'

describe('getCsrfToken', () => {
  afterEach(() => {
    document.head.innerHTML = ''
  })

  it('returns the content of the csrf-token meta tag when present', () => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'csrf-token')
    meta.setAttribute('content', 'test-token-123')
    document.head.appendChild(meta)

    expect(getCsrfToken()).toBe('test-token-123')
  })

  it('returns undefined when the meta tag is missing', () => {
    expect(getCsrfToken()).toBeUndefined()
  })
})
