import { webcrypto } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest'
import editorConfig from '@/configs/editor.config'
import { prepareSavePayload } from '@/hooks/useSavePage'
import type { PageFile } from '@/types/contentFile.type'

// Sample page code that a firewall rule would match. It is encrypted and compared as text; nothing runs it.
const page = () => ({
  id: 'root',
  plainCss: '@import url("x.css"); a { background: url(data:image/svg+xml;utf8,<svg></svg>) }',
  plainJS: 'document.title = "<script>alert(1)</script>"',
  children: [{ id: 'a', contentType: 'image', src: 'data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C%2Fsvg%3E' }],
})
const file = () => ({ id: 1, title: 'T', content: page(), is_free: 1, user_id: 1 }) as unknown as PageFile

beforeEach(() => vi.stubGlobal('crypto', webcrypto))
afterEach(() => vi.unstubAllGlobals())

describe('the save request', () => {
  it('carries the CSS, JS and SVG encrypted, with nothing a firewall would match', async () => {
    const payload = (await prepareSavePayload({ data: file(), title: 'T' })) as unknown as { page_content: string }
    const content = JSON.parse(payload.page_content)
    expect(content.plainCss).toMatch(/^enc1:/)
    expect(content.plainJS).toMatch(/^enc1:/)
    expect(content.children[0].src).toMatch(/^enc1:/)
    expect(payload.page_content).not.toMatch(/svg|<script|@import/i)
  })

  it('does not change the page it was given', async () => {
    const data = file()
    await prepareSavePayload({ data, title: 'T' })
    expect(data.content).toEqual(page())
  })

  it('sends plain content when encryption is off', async () => {
    editorConfig.enable_code_encryption = false
    onTestFinished(() => { editorConfig.enable_code_encryption = true })
    const payload = (await prepareSavePayload({ data: file(), title: 'T' })) as unknown as { page_content: string }
    expect(JSON.parse(payload.page_content)).toEqual(page())
  })
})

describe('code that came from imported HTML', () => {
  const imported = () => {
    const content = { ...page(), importedCode: { plainCss: page().plainCss, plainJS: page().plainJS, pageScripts: false } }
    return { id: 1, title: 'T', content, is_free: 1, user_id: 1 } as unknown as PageFile
  }

  it('is left out of the save request, with or without encryption, and the page state keeps it', async () => {
    const data = imported()
    for (const encrypt of [true, false]) {
      const original = editorConfig.enable_code_encryption
      editorConfig.enable_code_encryption = encrypt
      onTestFinished(() => { editorConfig.enable_code_encryption = original })
      const payload = (await prepareSavePayload({ data, title: 'T' })) as unknown as { page_content: string }
      const content = JSON.parse(payload.page_content)
      expect(content.plainCss).toBeUndefined()
      expect(content.plainJS).toBeUndefined()
      expect(content.importedCode).toBeUndefined()
      expect(content.children).toHaveLength(1)
    }
    expect((data.content as unknown as Record<string, unknown>).plainJS).toBeTruthy()
  })
})
