import { webcrypto } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { protectPageCode, setPassphraseOverride } from '@/utils/security/codeCrypto'
import { ConvertError, convert } from '@/utils/security/convertCode'

// Sample page code and SVG a firewall would match. It is converted and compared as text; nothing runs it.
const CSS = '@import url("x.css"); a { color: red }'
const ICON = 'data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C%2Fsvg%3E'
const page = () => ({ id: 'root', plainCss: CSS, plainJS: 'window.x = "<script></script>"', children: [{ id: 'a', src: ICON }] })

beforeEach(() => vi.stubGlobal('crypto', webcrypto))
afterEach(() => {
  setPassphraseOverride(null)
  vi.unstubAllGlobals()
})

describe('converting text', () => {
  it('encrypts and decrypts one piece of text', async () => {
    const encrypted = await convert('encrypt', 'auto', CSS)
    expect(encrypted.kind).toBe('text')
    expect(encrypted.output).toMatch(/^enc1:/)
    const decrypted = await convert('decrypt', 'auto', encrypted.output)
    expect(decrypted.output).toBe(CSS)
    expect(decrypted.changed).toBe(1)
  })

  it('keeps the text exactly as pasted, including a trailing newline', async () => {
    const text = 'a { color: red }\n'
    const { output } = await convert('encrypt', 'text', text)
    expect((await convert('decrypt', 'text', output + '\n')).output).toBe(text)
  })

  it('treats a JSON-looking snippet as text when asked to', async () => {
    const { output } = await convert('encrypt', 'text', '[1, 2, 3]')
    expect(output).toMatch(/^enc1:/)
  })

  it('says so when the text is not encrypted, or already is', async () => {
    await expect(convert('decrypt', 'auto', 'a { color: red }')).rejects.toThrow(/not encrypted/)
    const { output } = await convert('encrypt', 'text', 'x')
    await expect(convert('encrypt', 'text', output)).rejects.toThrow(/already/)
  })

  it('rejects empty input', async () => {
    await expect(convert('encrypt', 'auto', '   ')).rejects.toBeInstanceOf(ConvertError)
  })
})

describe('converting page data', () => {
  it('encrypts the CSS, JS and SVG of a page and decrypts them again', async () => {
    const encrypted = await convert('encrypt', 'auto', JSON.stringify(page()))
    expect(encrypted.kind).toBe('page')
    expect(encrypted.changed).toBe(3)
    expect(encrypted.output).not.toMatch(/svg|<script|@import/i)
    const decrypted = await convert('decrypt', 'auto', encrypted.output)
    expect(JSON.parse(decrypted.output)).toEqual(page())
    expect(decrypted.changed).toBe(3)
  })

  it('reads a page_content value that is itself a JSON string, as the database holds it', async () => {
    const stored = JSON.stringify(JSON.stringify(await protectPageCode(page())))
    const { output, kind } = await convert('decrypt', 'auto', stored)
    expect(kind).toBe('page')
    expect(JSON.parse(output)).toEqual(page())
  })

  it('indents the output only when asked', async () => {
    const compact = await convert('encrypt', 'page', JSON.stringify(page()), { pretty: false })
    const pretty = await convert('encrypt', 'page', JSON.stringify(page()), { pretty: true })
    expect(compact.output).not.toContain('\n')
    expect(pretty.output).toContain('\n  ')
  })

  it('says so when the input is not valid JSON', async () => {
    await expect(convert('encrypt', 'page', '{ not json')).rejects.toThrow(/not valid JSON/)
  })

  it('does not count values that were already encrypted', async () => {
    const once = await protectPageCode(page())
    const again = await convert('encrypt', 'page', JSON.stringify(once))
    expect(again.changed).toBe(0)
  })
})

describe('a different passphrase', () => {
  it('fails clearly with the wrong one and works with the one that was used', async () => {
    setPassphraseOverride('first passphrase')
    const { output } = await convert('encrypt', 'auto', JSON.stringify(page()))

    setPassphraseOverride('second passphrase')
    await expect(convert('decrypt', 'auto', output)).rejects.toThrow(/passphrase/)

    setPassphraseOverride('first passphrase')
    expect(JSON.parse((await convert('decrypt', 'auto', output)).output)).toEqual(page())
  })

  it('returns to the editor passphrase when the override is cleared', async () => {
    const { output } = await convert('encrypt', 'text', 'x')
    setPassphraseOverride('other')
    await expect(convert('decrypt', 'text', output)).rejects.toBeInstanceOf(ConvertError)
    setPassphraseOverride(null)
    expect((await convert('decrypt', 'text', output)).output).toBe('x')
  })
})
