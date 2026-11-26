import { describe, it, expect, afterEach } from 'vitest'
import { getIdFromUrl } from '@/utils/getIdFromUrl'

function setPathname(pathname: string) {
  window.history.pushState({}, '', pathname)
}

describe('getIdFromUrl', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('returns the last path segment', () => {
    setPathname('/landing-page-builder/editor/123')
    expect(getIdFromUrl()).toBe('123')
  })

  it('handles a trailing slash by falling back to the previous segment', () => {
    setPathname('/landing-page-builder/editor/123/')
    expect(getIdFromUrl()).toBe('123')
  })

  it('returns the single segment for a root-level path', () => {
    setPathname('/editor')
    expect(getIdFromUrl()).toBe('editor')
  })

  it('returns empty string for the root path', () => {
    setPathname('/')
    expect(getIdFromUrl()).toBe('')
  })
})
