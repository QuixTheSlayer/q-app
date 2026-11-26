import { describe, it, expect, afterEach, vi } from 'vitest'
import { isMacOS, getCtrlShortcutKey } from '@/utils/platform.utils'

describe('isMacOS', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when navigator.platform contains "Mac"', () => {
    vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue('MacIntel')
    expect(isMacOS()).toBe(true)
  })

  it('returns false when navigator.platform does not contain "Mac"', () => {
    vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue('Win32')
    expect(isMacOS()).toBe(false)
  })
})

describe('getCtrlShortcutKey', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the command symbol on Mac user agents', () => {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    )
    expect(getCtrlShortcutKey()).toBe('⌘')
  })

  it('returns "Ctrl" on non-Mac user agents', () => {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    )
    expect(getCtrlShortcutKey()).toBe('Ctrl')
  })
})
