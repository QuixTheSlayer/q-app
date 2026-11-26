import { webcrypto } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HIDDEN_TOOLS, hiddenToolFor, hiddenToolUrl } from '@/utils/hiddenTools'
import { convertHtmlToJson } from '@/utils/htmlToJsonTool'
import { revealPageCode } from '@/utils/security/codeCrypto'
import { ConvertError } from '@/utils/security/convertCode'

// Sample page HTML. It is converted to JSON and compared as text; nothing here is run.
const HTML = `<main>
  <section><h1>Hello</h1><p>World</p></section>
  <section><h2>Second</h2></section>
  <style>h1 { color: red } .icon { background: url("data:image/svg+xml;utf8,<svg></svg>") }</style>
  <script>window.__marker = 1</script>
</main>`

beforeEach(() => vi.stubGlobal('crypto', webcrypto))
afterEach(() => vi.unstubAllGlobals())

describe('convertHtmlToJson', () => {
  it('converts HTML into the page tree with its CSS and JS on the root', async () => {
    const { output, stats } = await convertHtmlToJson(HTML)
    const page = JSON.parse(output)
    expect(page.contentType).toBeDefined()
    expect(page.children.length).toBe(stats.sections)
    expect(stats.sections).toBeGreaterThanOrEqual(1)
    expect(stats.nodes).toBeGreaterThan(stats.sections)
    expect(page.plainCss).toContain('color: red')
    expect(page.plainJS).toContain('__marker')
    expect(stats.cssBytes).toBeGreaterThan(0)
    expect(stats.jsBytes).toBeGreaterThan(0)
    expect(JSON.stringify(page)).toContain('Hello')
  })

  it('returns the whole importer result in the full shape', async () => {
    const full = JSON.parse((await convertHtmlToJson(HTML, { shape: 'full' })).output)
    expect(Object.keys(full).sort()).toEqual(['css', 'external', 'js', 'root', 'skipped'])
    expect(full.root.plainCss).toBe(full.css)
    expect(Array.isArray(full.skipped)).toBe(true)
  })

  it('indents the output unless told not to', async () => {
    expect((await convertHtmlToJson(HTML, { pretty: true })).output).toContain('\n  ')
    expect((await convertHtmlToJson(HTML, { pretty: false })).output).not.toContain('\n')
  })

  it('encrypts the CSS, JS and SVG when asked, and they decrypt back to the plain form', async () => {
    const plain = JSON.parse((await convertHtmlToJson(HTML)).output)
    const encrypted = JSON.parse((await convertHtmlToJson(HTML, { encrypt: true })).output)
    expect(encrypted.plainCss).toMatch(/^enc1:/)
    expect(encrypted.plainJS).toMatch(/^enc1:/)
    expect(JSON.stringify(encrypted)).not.toMatch(/<script|@import|image\/svg/i)
    const back = await revealPageCode(encrypted)
    expect(back.plainCss).toBe(plain.plainCss)
    expect(back.plainJS).toBe(plain.plainJS)
  })

  it('reads an AI chat reply with a fenced block', async () => {
    const reply = 'Here is the page:\n```html\n<main><section><h1>From chat</h1></section></main>\n```\nEnjoy.'
    expect((await convertHtmlToJson(reply)).output).toContain('From chat')
  })

  it('says so when there is nothing to convert', async () => {
    await expect(convertHtmlToJson('   ')).rejects.toBeInstanceOf(ConvertError)
    await expect(convertHtmlToJson('<style>a{color:red}</style>')).rejects.toThrow(/no visible content/)
  })
})

describe('hidden tool addresses', () => {
  const at = (pathname: string, search = '') => ({ pathname, search })

  it('finds a tool from the query or from its path', () => {
    expect(hiddenToolFor(at('/landing-page-builder/editor/14', '?converter'))).toBe('converter')
    expect(hiddenToolFor(at('/landing-page-builder/editor/14', '?html-json'))).toBe('html-json')
    expect(hiddenToolFor(at('/landing-page-builder/converter'))).toBe('converter')
    expect(hiddenToolFor(at('/landing-page-builder/html-to-json'))).toBe('html-json')
  })

  it('finds no tool on an ordinary page', () => {
    expect(hiddenToolFor(at('/landing-page-builder/editor/14'))).toBeNull()
    expect(hiddenToolFor(at('/landing-page-builder/editor/14', '?tab=style'))).toBeNull()
    expect(hiddenToolFor(at('/some-event'))).toBeNull()
  })

  it('builds the other tool address from where you are', () => {
    expect(hiddenToolUrl('html-json', at('/landing-page-builder/editor/14', '?converter'))).toBe('/landing-page-builder/editor/14?html-json')
    expect(hiddenToolUrl('converter', at('/landing-page-builder/html-to-json'))).toBe('/landing-page-builder/converter')
  })

  it('lists every tool once', () => {
    expect(new Set(HIDDEN_TOOLS.map((t) => t.tool)).size).toBe(HIDDEN_TOOLS.length)
  })
})
