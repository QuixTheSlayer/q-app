import { webcrypto } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest'
import editorConfig from '@/configs/editor.config'
import { decryptCode, encryptCode, protectPageCode, revealPageCode } from '@/utils/security/codeCrypto'

// What a firewall looks for in a request body, and what a page's custom code often contains. These are
// sample strings only: they are encrypted and compared as text, and nothing here ever runs them (no eval).
const TRIGGERS = [
  '<script>alert(1)</script>',
  '@import url("https://fonts.googleapis.com/css2?family=Inter");',
  'a { background: url(javascript:alert(1)) }',
  'button.onclick = function () { document.cookie = "a=b"; eval("x") }',
  'width: expression(document.body.clientWidth)',
]

beforeEach(() => {
  vi.stubGlobal('crypto', webcrypto)
})
afterEach(() => vi.unstubAllGlobals())

describe('encryptCode and decryptCode', () => {
  it('round trips, including non-ASCII and large text', async () => {
    const text = TRIGGERS.join('\n') + '\n/* ünïcödé 日本語 🎉 */\n' + 'x'.repeat(200_000)
    const encrypted = await encryptCode(text)
    expect(encrypted.startsWith('enc1:')).toBe(true)
    expect(await decryptCode(encrypted)).toBe(text)
  })

  it('leaves nothing a firewall would match in the encrypted text', async () => {
    for (const trigger of TRIGGERS) {
      const encrypted = await encryptCode(trigger)
      expect(encrypted).toMatch(/^enc1:[A-Za-z0-9+/=]+$/)
      for (const pattern of ['<script', '@import', 'javascript:', 'expression(', 'onclick', 'eval(', 'cookie']) {
        expect(encrypted.toLowerCase()).not.toContain(pattern)
      }
    }
  })

  it('uses a new IV each time, so the same code never looks the same twice', async () => {
    expect(await encryptCode('a{color:red}')).not.toBe(await encryptCode('a{color:red}'))
  })

  it('leaves empty text and already protected text alone', async () => {
    expect(await encryptCode('')).toBe('')
    const once = await encryptCode('a{color:red}')
    expect(await encryptCode(once)).toBe(once)
  })

  it('passes plain text through, so pages saved before encryption still load', async () => {
    expect(await decryptCode('a { color: red }')).toBe('a { color: red }')
    expect(await decryptCode('')).toBe('')
  })

  it('drops text it cannot decrypt instead of injecting garbage into the page', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const original = editorConfig.content_encryption_passphrase
    onTestFinished(() => { editorConfig.content_encryption_passphrase = original })

    const encrypted = await encryptCode('a{color:red}')
    editorConfig.content_encryption_passphrase = 'a different passphrase'
    expect(await decryptCode(encrypted)).toBe('')
    expect(await decryptCode('enc1:not-valid-base64-or-cipher')).toBe('')
    expect(warn).toHaveBeenCalled()
  })

  it('falls back to base64 where crypto.subtle is missing, and still reads both formats', async () => {
    const aes = await encryptCode('a{color:red}')
    vi.stubGlobal('crypto', { getRandomValues: webcrypto.getRandomValues.bind(webcrypto) })
    const encoded = await encryptCode('<script>x</script>')
    expect(encoded.startsWith('b64:')).toBe(true)
    expect(encoded.toLowerCase()).not.toContain('<script')
    expect(await decryptCode(encoded)).toBe('<script>x</script>')

    vi.stubGlobal('crypto', webcrypto)
    expect(await decryptCode(encoded)).toBe('<script>x</script>')
    expect(await decryptCode(aes)).toBe('a{color:red}')
  })
})

// An inline icon the way an imported page stores it: an image node whose src and children are a data URI.
const ICON = 'data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M3%206h18%22%2F%3E%3C%2Fsvg%3E'
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

const svgPage = () => ({
  id: 'root',
  children: [
    { id: 'a', contentType: 'image', src: ICON, children: ICON, attributes: { alt: '', 'data-lp-svg': 'inline' } },
    { id: 'b', contentType: 'html', children: '<div><svg width="10"><circle r="4"/></svg></div>' },
    { id: 'c', contentType: 'image', src: 'https://cdn.example.com/logo.SVG', children: 'https://cdn.example.com/logo.SVG' },
    { id: 'd', contentType: 'image', src: PNG, children: PNG },
    { id: 'e', contentType: 'text', children: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Plain words"}]}]}' },
  ],
})

/** Every string value in a tree (not the keys). */
const values = (node: unknown): string[] =>
  typeof node === 'string' ? [node] : Array.isArray(node) ? node.flatMap(values) : node && typeof node === 'object' ? Object.values(node).flatMap(values) : []

describe('svg in the page tree', () => {
  it('encrypts every string value that contains svg, wherever it is', async () => {
    const protectedPage = await protectPageCode(svgPage())
    const [a, b, c] = protectedPage.children
    for (const value of [a.src, a.children, b.children, c.src, c.children]) expect(value).toMatch(/^enc1:/)
    expect(values(protectedPage).filter((v) => /svg/i.test(v))).toEqual([])
  })

  it('leaves other strings alone, including large non-svg images and rich text', async () => {
    const { children } = await protectPageCode(svgPage())
    expect(children[3].src).toBe(PNG)
    expect(children[3].children).toBe(PNG)
    expect(children[4].children).toContain('Plain words')
    expect(children[0].attributes).toEqual({ alt: '', 'data-lp-svg': 'inline' })
  })

  it('restores the tree exactly', async () => {
    expect(await revealPageCode(await protectPageCode(svgPage()))).toEqual(svgPage())
  })

  it('does not change the page it was given', async () => {
    const original = svgPage()
    await protectPageCode(original)
    expect(original).toEqual(svgPage())
  })

  it('never decrypts text that only starts like encrypted data', async () => {
    const page = { id: 'root', note: 'enc1: is how it starts', other: 'b64:not base64!', plain: 'b64:abc' }
    expect(await revealPageCode(page)).toEqual(page)
  })

  it('never produces ciphertext that spells a word a firewall looks for', async () => {
    // Without the retry, random base64 of this length would contain one of them in a few percent of runs.
    const payload = '<svg>' + 'x'.repeat(3000) + '</svg>'
    for (let i = 0; i < 400; i++) {
      expect(await encryptCode(payload)).not.toMatch(/svg|script|eval|import|onerror|onload/i)
    }
    // 400 encryptions of a 3 KB payload is slow when the whole suite runs in parallel, so this test gets longer than the default 5 seconds.
  }, 60_000)
})

describe('protectPageCode and revealPageCode', () => {
  const page = () => ({
    id: 'root',
    plainCss: '@import url("x.css"); a{color:red}',
    plainJS: 'document.querySelector("a").onclick = () => eval("1")',
    pageScripts: [{ src: 'https://cdn.example.com/lib.js' }, { type: 'module', code: 'import x from "./x.js"; x()' }],
    children: [{ id: 'a' }],
  })

  it('encrypts the css, the js and inline page scripts, and nothing else', async () => {
    const original = page()
    const protectedPage = await protectPageCode(original)

    expect(protectedPage.plainCss).toMatch(/^enc1:/)
    expect(protectedPage.plainJS).toMatch(/^enc1:/)
    expect(protectedPage.pageScripts?.[0]).toEqual({ src: 'https://cdn.example.com/lib.js' })
    expect(protectedPage.pageScripts?.[1].code).toMatch(/^enc1:/)
    expect(protectedPage.pageScripts?.[1].type).toBe('module')
    expect(protectedPage.children).toEqual([{ id: 'a' }])
    expect(JSON.stringify(protectedPage)).not.toContain('@import url')
    expect(JSON.stringify(protectedPage)).not.toContain('eval(')
  })

  it('does not change the page it was given', async () => {
    const original = page()
    await protectPageCode(original)
    expect(original).toEqual(page())
  })

  it('reveals what was protected', async () => {
    expect(await revealPageCode(await protectPageCode(page()))).toEqual(page())
  })

  it('handles a page with no code', async () => {
    const bare = { id: 'root', plainCss: undefined as string | undefined }
    expect(await protectPageCode(bare)).toEqual(bare)
    expect(await revealPageCode(bare)).toEqual(bare)
  })
})
