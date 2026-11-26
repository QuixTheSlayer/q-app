import { webcrypto } from 'node:crypto'
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { editorQuery } from '@/store/query'
import { protectPageCode } from '@/utils/security/codeCrypto'

// These strings are sample page code only. They are encrypted, stored and compared as text; nothing runs them.
const CSS = '@import url("https://fonts.googleapis.com/css2?family=Inter"); h1 { letter-spacing: 9px; }'
const JS = 'window.__x = "<script>alert(1)</script>"'

const tree = () => ({ id: 'root', type: 'container', contentType: 'root', layout: 'column', style: {}, plainCss: CSS, plainJS: JS, children: [] })

const makeStore = () => configureStore({ reducer: { [editorQuery.reducerPath]: editorQuery.reducer }, middleware: (gdm) => gdm().concat(editorQuery.middleware) })

const respondWith = (body: unknown) =>
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } })))

const row = (page_content: unknown) => ({ id: 1, title: 'T', page_content, created: '2026-01-01', is_free: 1, user_id: 1 })

beforeEach(() => vi.stubGlobal('crypto', webcrypto))
afterEach(() => vi.unstubAllGlobals())

describe('loading a page decrypts its CSS and JS', () => {
  it('decrypts content that was saved encrypted', async () => {
    const encrypted = await protectPageCode(tree())
    expect(encrypted.plainCss).toMatch(/^enc1:/)
    respondWith(row(JSON.stringify(encrypted)))

    const result = await makeStore().dispatch(editorQuery.endpoints.getPageData.initiate(''))
    expect(result.error).toBeUndefined()
    expect(result.data?.content.plainJS).toBe(JS)
    // plainCss goes through sanitizeCss after decrypting, which keeps it as written here.
    expect(result.data?.content.plainCss).toContain('letter-spacing: 9px')
  })

  it('decrypts inline svg images on load', async () => {
    const icon = 'data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D%220%200%2024%2024%22%3E%3C%2Fsvg%3E'
    const page = { ...tree(), children: [{ id: 'a', type: 'content', contentType: 'image', style: {}, src: icon, children: icon }] }
    const encrypted = await protectPageCode(page)
    expect(JSON.stringify(encrypted)).not.toMatch(/%3Csvg/i)
    respondWith(row(JSON.stringify(encrypted)))

    const result = await makeStore().dispatch(editorQuery.endpoints.getPageData.initiate(''))
    const image = (result.data?.content as unknown as { children: { src: string; children: string }[] }).children[0]
    expect(image.src).toBe(icon)
    expect(image.children).toBe(icon)
  })

  it('still loads a page saved before encryption existed', async () => {
    respondWith(row(JSON.stringify(tree())))
    const result = await makeStore().dispatch(editorQuery.endpoints.getPageData.initiate(''))
    expect(result.data?.content.plainJS).toBe(JS)
    expect(result.data?.content.plainCss).toContain('letter-spacing: 9px')
  })

  it('loads page_content that arrives already decoded as an object', async () => {
    respondWith(row(tree()))
    const result = await makeStore().dispatch(editorQuery.endpoints.getPageData.initiate(''))
    expect(result.error).toBeUndefined()
    expect(result.data?.content.plainJS).toBe(JS)
  })

  it('decrypts the content handed to the server-side thumbnail capture', async () => {
    const encrypted = await protectPageCode(tree())
    respondWith({ data: { content: encrypted, is_boxed: 0 } })
    const result = await makeStore().dispatch(editorQuery.endpoints.getCaptureRenderData.initiate('token'))
    expect(result.error).toBeUndefined()
    expect(result.data?.content.plainJS).toBe(JS)
    expect(result.data?.is_boxed).toBe(0)
  })

  it('decrypts on the published page route too', async () => {
    const encrypted = await protectPageCode(tree())
    respondWith({ data: { landingpage_data: row(JSON.stringify(encrypted)), event_deadline: {}, event_route: {} } })
    const result = await makeStore().dispatch(editorQuery.endpoints.getRenderPageData.initiate('some-event'))
    expect(result.error).toBeUndefined()
    expect(result.data?.landingpage_data.content.plainJS).toBe(JS)
  })
})
