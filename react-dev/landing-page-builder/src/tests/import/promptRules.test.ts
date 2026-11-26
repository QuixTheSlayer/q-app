import { describe, it, expect } from 'vitest'
import { htmlToJsonTree } from '@/utils/htmlToCanvasNodes'
import { editorBreakpoints } from '@/utils/editorBreakpoints'
import { buildSandboxDocument } from '@/utils/security/sandboxDocument'
import type { CanvasNode, LayoutNode } from '@/types/node.type'

// Pages built from codeToNodeTestCodeFiles/prompt.md.
type AnyNode = CanvasNode & { style?: Record<string, string>; attributes?: Record<string, string>; tag?: string }
const kids = (n: CanvasNode) => (n as LayoutNode).children as AnyNode[]

describe('image size attributes', () => {
	it('lets the page CSS size an image, keeping the attributes as hints', () => {
		const { root } = htmlToJsonTree('<style>.card img { width: 100%; height: 220px }</style><section class="card"><img src="https://picsum.photos/seed/a/800/500" width="800" height="500" alt="A"></section>')
		const img = kids(root.children[0])[0]
		expect(img.style?.width).toBeUndefined()
		expect(img.style?.height).toBeUndefined()
		expect(img.attributes).toMatchObject({ width: '800', height: '500' })
	})

	it('still uses the attributes when no CSS sizes the image', () => {
		const { root } = htmlToJsonTree('<section><img src="https://picsum.photos/seed/a/800/500" width="800" height="500" alt="A"></section>')
		expect(kids(root.children[0])[0].style?.width).toBeDefined()
	})
})

describe('editor breakpoints', () => {
	it('turns single width @media rules into container queries on the imported root, in em', () => {
		const css = editorBreakpoints('@media (max-width: 992px) { .grid { display: block } }\n@media only screen and (min-width: 600px) and (max-width: 991px) { .a { color: red } }')
		expect(css).toContain('@container lp-page (max-width: 62em) {')
		expect(css).toContain('@container lp-page (min-width: 37.5em) and (max-width: 61.9375em) {')
		expect(css).toContain('[data-lp-page] { container: lp-page / inline-size; }')
	})

	it('leaves other media queries alone', () => {
		const css = editorBreakpoints('@media (hover: hover) { a { color: red } } @media print { a { color: black } } @media (max-width: 600px), print { b { x: y } }')
		expect(css).toContain('@media (hover: hover)')
		expect(css).toContain('@media print')
		expect(css).toContain('@media (max-width: 600px), print')
		expect(css).not.toContain('@container lp-page (')
	})
})

describe('forms in the sandbox', () => {
	it('turns the imported form block back into a <form> and cancels navigation after the page handler', () => {
		const element = document.createElement('div')
		element.innerHTML = '<div data-lp-form="" class="lp-signup" id="lp-form"><input name="email" required><button>Send</button></div>'
		document.body.appendChild(element)
		const doc = buildSandboxDocument(element, { title: 't', js: "document.getElementById('form').addEventListener('submit', function (e) { e.preventDefault() })" })
		expect(doc).toMatch(/<form data-lp-form="" class="lp-signup" id="lp-form"><input name="email" required="" value=""><button>Send<\/button><\/form>/)
		expect(doc).toContain("document.addEventListener('submit', function (event) { event.preventDefault(); });")
		element.remove()
	})
})

describe('event widgets in imported pages', () => {
	it('keeps the event tokens: button hrefs, deadline text and the countdown target', () => {
		const { root, js } = htmlToJsonTree('<style>.btn { color: red }</style><section id="hero"><a class="btn btn-primary" href="{{event_submit_entry_url}}">Submit an Entry</a><a class="btn" href="{{event_register_url}}">Register</a><p>Closes at {{event_hour}} {{event_timezone}} on {{event_date}}. Last call {{event_date}}.</p><p class="countdown-target" id="countdown-target" hidden>{{event_date}}T{{event_hour}}{{event_timezone_offset}}</p></section><script>document.getElementById("countdown-target")</script>')
		const [submit, register, deadline, target] = kids(root.children[0])
		expect(submit).toMatchObject({ contentType: 'button', attributes: { href: '{{event_submit_entry_url}}' } })
		expect(register).toMatchObject({ contentType: 'button', attributes: { href: '{{event_register_url}}' } })
		expect(String(deadline.children).match(/\{\{event_date\}\}/g)).toHaveLength(2)
		expect(target.attributes).toMatchObject({ id: 'lp-countdown-target', hidden: '' })
		expect(String(target.children)).toContain('{{event_date}}T{{event_hour}}{{event_timezone_offset}}')
		expect(js).toContain('"lp-countdown-target"')
	})
})
