import { describe, it, expect } from 'vitest'
import { checkEventPlaceholders } from '@/utils/checkEventPlaceholders'
import type { PageFile } from '@/types/contentFile.type'

function makePage(content: unknown): PageFile {
  return { content } as unknown as PageFile
}

describe('checkEventPlaceholders', () => {
  it('returns an empty object for falsy input', () => {
    expect(checkEventPlaceholders(undefined as unknown as PageFile)).toEqual({})
  })

  it('detects the submit-entry placeholder', () => {
    const result = checkEventPlaceholders(makePage({ url: '{{event_submit_entry_url}}' }))
    expect(result).toEqual({ hasSubmitEntryUrl: true, hasRegisterUrl: false })
  })

  it('detects the register placeholder', () => {
    const result = checkEventPlaceholders(makePage({ url: '{{event_register_url}}' }))
    expect(result).toEqual({ hasSubmitEntryUrl: false, hasRegisterUrl: true })
  })

  it('detects both placeholders when present', () => {
    const result = checkEventPlaceholders(
      makePage({ a: '{{event_submit_entry_url}}', b: '{{event_register_url}}' })
    )
    expect(result).toEqual({ hasSubmitEntryUrl: true, hasRegisterUrl: true })
  })

  it('returns false for both when neither placeholder is present', () => {
    const result = checkEventPlaceholders(makePage({ text: 'no placeholders here' }))
    expect(result).toEqual({ hasSubmitEntryUrl: false, hasRegisterUrl: false })
  })
})
