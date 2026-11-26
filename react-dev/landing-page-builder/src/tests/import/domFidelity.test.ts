import { describe, it, expect } from 'vitest'
import { htmlToJsonTree } from '@/utils/htmlToCanvasNodes'
import { passthroughAttributes } from '@/utils/nodeAttributes'
import type { CanvasNode, LayoutNode } from '@/types/node.type'

type AnyNode = CanvasNode & { tag?: string; attributes?: Record<string, string> }
const kids = (n: CanvasNode) => (n as LayoutNode).children as AnyNode[]
const page = (body: string) => htmlToJsonTree(`<div id="page"><section>${body}</section></div>`)

describe('real tags', () => {
	it('keeps container tags so tag CSS still matches', () => {
		const { root } = page('<nav class="menu"><ul><li><a href="/a">A</a></li><li><a href="/b">B</a></li></ul></nav>')
		const nav = kids(root.children[0])[0]
		expect(nav).toMatchObject({ contentType: 'block', tag: 'nav' })
		const ul = kids(nav)[0]
		expect(ul.tag).toBe('ul')
		expect(kids(ul).map((li) => li.tag)).toEqual(['li', 'li'])
	})

	it('renders tags off the allowlist as a plain div', () => {
		const { root } = page('<form action="/x"><div class="row"><b>x</b><img src="/a.png"></div></form>')
		const form = kids(root.children[0])[0]
		expect(form.tag).toBeUndefined()
		expect(kids(form)[0].tag).toBeUndefined()
	})

	it('keeps landmark tags on sections and the root', () => {
		const { root } = htmlToJsonTree('<body><header class="top"><div>x</div></header><footer><div>y</div></footer></body>')
		expect(root.children.map((s) => (s as AnyNode).tag)).toEqual(['header', 'footer'])
		const { root: lone } = htmlToJsonTree('<body><main class="page"><section><div>z</div></section></main></body>')
		expect((lone as AnyNode).tag).toBe('main')
	})
})

describe('attributes', () => {
	it('keeps data-*, aria-*, role, title, tabindex and label for', () => {
		const { root } = page('<div data-tab="2" aria-label="Tabs" role="tablist" title="t" tabindex="0" class="c"><label for="email">Email</label></div>')
		const div = kids(root.children[0])[0]
		expect(div.attributes).toMatchObject({ 'data-tab': '2', 'aria-label': 'Tabs', role: 'tablist', title: 't', tabIndex: '0', className: 'c' })
		expect(kids(div)[0].attributes).toMatchObject({ htmlFor: 'email' })
	})

	it('keeps other attributes (like frontend-editor), but never event handlers or the editor\'s own data-* names', () => {
		const { root } = page('<div onclick="alert(1)" onmouseover="x()" data-id="hijack" data-node-path="0" data-radix-x="1" style="color:red" foo="bar" data-ok="1">x</div>')
		const attrs = kids(root.children[0])[0].attributes ?? {}
		expect(Object.keys(attrs).sort()).toEqual(['data-ok', 'foo'])
	})

	it('only passes allowlisted attributes to the rendered element', () => {
		expect(passthroughAttributes({ className: 'c', id: 'i', href: '/x', 'data-tab': '1', 'aria-hidden': 'true', role: 'button', tabIndex: '0', htmlFor: 'f', onClick: 'x', 'data-id': 'no' }))
			.toEqual({ 'data-tab': '1', 'aria-hidden': 'true', role: 'button', tabIndex: '0', htmlFor: 'f' })
	})
})

describe('exact text', () => {
	it('keeps the spaces between words and inline links inside a text node', () => {
		const { root } = page('<p>Read the <a href="/t">terms</a> and <b>rules</b>, then <a href="/go">go</a>.</p>')
		const doc = JSON.parse(String(kids(root.children[0])[0].children))
		const text = doc.content[0].content.map((n: { text: string }) => n.text).join('')
		expect(text).toBe('Read the terms and rules, then go.')
	})
})
