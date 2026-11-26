import { describe, expect, it } from 'vitest'
import { IMPORT_HTML_PROMPT_PRESETS, IMPORT_HTML_PROMPT_RULES, buildImportHtmlPrompt } from '@/components/EditorUI/importHtmlPrompt'
import { htmlToJsonTree } from '@/utils/htmlToCanvasNodes'
import { applyTailwind, readTailwind } from '@/utils/tailwind'
import { htmlHasCode, importHasCode } from '@/utils/security/codePolicy'
import type { LayoutNode } from '@/types/node.type'

type Styled = { id: string; style: Record<string, unknown>; responsiveStyle?: Record<string, Record<string, unknown>>; children?: Styled[] }
type Animated = { animation?: { id: string; trigger_effect: { trigger: string; effects: Record<string, unknown>[] }[] }[] }

const parse = (html: string) => new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
const first = (html: string) => {
	const doc = parse(html)
	const report = applyTailwind(doc)
	return { el: doc.body.firstElementChild as HTMLElement, report }
}
const tree = (html: string) => htmlToJsonTree(html)
const top = (html: string) => ((tree(html).root as unknown as LayoutNode).children[0] as unknown as Styled)

describe('Tailwind classes become element styles', () => {
	it('writes the plain utilities into the element style and removes the classes it understood', () => {
		const { el, report } = first('<div class="hero flex flex-col items-center gap-6 px-6 py-24 bg-[#0B0B12] text-white rounded-2xl"><p>x</p></div>')
		const style = el.style
		expect(style.display).toBe('flex')
		expect(style.flexDirection).toBe('column')
		expect(style.alignItems).toBe('center')
		expect(style.gap).toBe('24px')
		expect(el.getAttribute('style')).toContain('padding-left: 24px')
		expect(el.getAttribute('style')).toContain('padding-top: 96px')
		expect(style.backgroundColor).toBe('rgb(11, 11, 18)')
		expect(style.color).toBe('rgb(255, 255, 255)')
		expect(style.borderRadius).toBe('16px')
		expect(el.getAttribute('class')).toBe('hero')
		expect(report?.unsupported).toEqual([])
	})

	it('reads palette colours with shade and slash opacity, gradients, shadows and arbitrary values', () => {
		const { el } = first('<div class="bg-slate-900 text-amber-400/80 border border-white/10 bg-gradient-to-r from-blue-500 to-purple-600 shadow-[0_10px_30px_rgba(0,0,0,0.35)] w-[420px] -mt-4 max-w-xl"></div>')
		expect(el.style.backgroundImage).toContain('linear-gradient(to right')
		expect(el.style.color).toMatch(/245, 158, 11|rgba\(251, 191, 36/)
		expect(el.style.boxShadow).toContain('rgba(0,0,0,0.35)')
		expect(el.style.width).toBe('420px')
		expect(el.style.marginTop).toBe('-16px')
		expect(el.style.maxWidth).toBe('576px')
		expect(el.style.borderStyle).toBe('solid')
	})

	it('keeps inline style over a class and leaves non-Tailwind classes alone', () => {
		const { el, report } = first('<div class="card text-red-500 mystery-thing" style="color: blue"></div>')
		expect(el.style.color).toBe('blue')
		expect(el.getAttribute('class')).toBe('card mystery-thing')
		expect(report?.unsupported).toEqual([])
	})

	it('refuses values that could break out of a declaration or load code', () => {
		const { el } = first('<div class="bg-[url(javascript:alert(1))] w-[1px;color:red] text-[#fff] bg-[url(http://x.test/a.png)]"></div>')
		expect(el.getAttribute('style') || '').not.toMatch(/javascript|color: red|http:/)
	})

	it('reports classes it has no equivalent for and keeps them', () => {
		const { el, report } = first('<div class="flex focus:ring-2 group-hover:bg-red-500 dark:bg-black space-x-4 prose"></div>')
		expect(report?.unsupported).toEqual(expect.arrayContaining(['focus:ring-2', 'group-hover:bg-red-500', 'dark:bg-black']))
		expect(el.getAttribute('class')).toContain('focus:ring-2')
	})
})

describe('responsive Tailwind', () => {
	it('puts tablet: and mobile: values in the tablet and mobile styles, only what differs', () => {
		const { el } = first('<div class="px-16 grid grid-cols-3 tablet:px-8 tablet:grid-cols-2 mobile:px-4 mobile:grid-cols-1"></div>')
		const data = readTailwind(el)
		expect(data.tablet).toMatchObject({ paddingLeft: '32px', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' })
		expect(data.mobile).toMatchObject({ paddingLeft: '16px', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' })
		expect(data.mobile).not.toHaveProperty('display')
	})

	it('turns mobile-first md: and lg: classes into desktop, tablet and mobile', () => {
		const { el } = first('<div class="flex-col md:flex-row p-4 lg:p-12"></div>')
		expect(el.style.flexDirection).toBe('row')
		expect(el.style.padding).toBe('48px')
		const data = readTailwind(el)
		expect(data.tablet).toMatchObject({ padding: '16px' })
		expect(data.mobile).toMatchObject({ flexDirection: 'column' })
	})

	it('binds them to the node as responsiveStyle in em', () => {
		const section = top('<section class="p-24 tablet:p-12 mobile:p-6"><h1 class="text-6xl tablet:text-4xl mobile:text-3xl">Title</h1></section>')
		expect(section.style).toHaveProperty('padding')
		expect(section.responsiveStyle?.tablet).toHaveProperty('padding')
		expect(section.responsiveStyle?.mobile).toHaveProperty('padding')
		const heading = section.children![0]
		expect(heading.responsiveStyle?.tablet).toHaveProperty('fontSize')
		expect(heading.responsiveStyle?.mobile).toHaveProperty('fontSize')
	})
})

describe('Tailwind interactions become builder animations', () => {
	it('maps hover and active utilities to effects with their timing', () => {
		const { el } = first('<a class="bg-amber-400 transition duration-300 ease-out hover:bg-amber-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl active:scale-95"></a>')
		const fx = readTailwind(el).trigger_effect!
		const hover = fx.find((t) => t.trigger === 'hover')!.effects
		expect(hover.map((e) => e.animation_type).sort()).toEqual(['backgroundColor', 'boxShadow', 'scale', 'translate'])
		expect(hover.find((e) => e.animation_type === 'scale')).toMatchObject({ style: { scale: 1.05 }, duration: 300, easing: 'ease-out' })
		expect(hover.find((e) => e.animation_type === 'translate')).toMatchObject({ style: { 'translate-x': 0, 'translate-y': -4 } })
		expect(fx.find((t) => t.trigger === 'active')!.effects[0]).toMatchObject({ animation_type: 'scale', style: { scale: 0.95 } })
	})

	it('maps view: to the on-view trigger and keeps the starting look as the base style', () => {
		const { el } = first('<div class="opacity-0 translate-y-8 view:opacity-100 view:translate-y-0 duration-700"></div>')
		expect(el.style.opacity).toBe('0')
		expect(el.style.translate).toContain('32px')
		const view = readTailwind(el).trigger_effect!.find((t) => t.trigger === 'onView')!
		expect(view.effects.find((e) => e.animation_type === 'opacity')).toMatchObject({ style: { opacity: 1 }, duration: 700 })
	})

	it('maps animate-* to presets on the matching trigger', () => {
		const fx = readTailwind(first('<div class="animate-spin hover:animate-shake view:animate-fade-up"></div>').el).trigger_effect!
		expect(fx.find((t) => t.trigger === 'auto')!.effects[0]).toMatchObject({ animation_type: 'preset', preset: 'spin', iterations: 0 })
		expect(fx.find((t) => t.trigger === 'hover')!.effects[0]).toMatchObject({ preset: 'shake', iterations: 1 })
		expect(fx.find((t) => t.trigger === 'onView')!.effects[0]).toMatchObject({ preset: 'fadeUp' })
	})

	it('stores the animation on the root, keyed by the node id', () => {
		const result = tree('<section><a class="btn bg-amber-400 hover:bg-amber-300 hover:scale-105" href="#join">Join</a></section>')
		const root = result.root as unknown as Animated & LayoutNode
		expect(root.animation).toHaveLength(1)
		const entry = root.animation![0]
		const ids: string[] = []
		const walk = (n: Styled) => { ids.push(n.id); if (Array.isArray(n.children)) n.children.forEach(walk) }
		walk(root as unknown as Styled)
		expect(ids).toContain(entry.id)
		expect(entry.trigger_effect[0].trigger).toBe('hover')
	})
})

describe('the prompt asks for Tailwind classes', () => {
	it('tells the AI to use utility classes, tablet:/mobile:, hover:/active:/view: and animate-*, with no CSS or script', () => {
		expect(IMPORT_HTML_PROMPT_RULES).toContain('PART 2A')
		expect(IMPORT_HTML_PROMPT_RULES).toContain('Tailwind')
		expect(IMPORT_HTML_PROMPT_RULES).toMatch(/tablet:/)
		expect(IMPORT_HTML_PROMPT_RULES).toMatch(/mobile:/)
		expect(IMPORT_HTML_PROMPT_RULES).toMatch(/hover:/)
		expect(IMPORT_HTML_PROMPT_RULES).toMatch(/view:/)
		expect(IMPORT_HTML_PROMPT_RULES).toMatch(/animate-fade-up/)
		expect(IMPORT_HTML_PROMPT_RULES).toMatch(/Part 2A always wins/)
		expect(IMPORT_HTML_PROMPT_RULES).not.toContain('lp-styles')
		expect(IMPORT_HTML_PROMPT_RULES).not.toContain('data-lp-style')
		expect(IMPORT_HTML_PROMPT_RULES).not.toContain('one single <style> element in <head>')
	})

	it('is part of every preset prompt', () => {
		for (const preset of IMPORT_HTML_PROMPT_PRESETS) expect(buildImportHtmlPrompt(preset.id)).toContain('PART 2A')
	})

	it('a page written the way the prompt asks imports with no code and its styles on the nodes', () => {
		const html = `<section class="hero flex flex-col items-center gap-6 px-24 py-32 bg-[#0B0B12] tablet:px-8 mobile:py-12"><h1 class="text-6xl font-bold text-white mobile:text-4xl">Event</h1><a class="rounded-full bg-[#F5C518] px-7 py-3 text-[#111111] transition duration-300 hover:scale-105" href="#join">Join</a></section>`
		const result = tree(html)
		expect(htmlHasCode(html)).toBe(false)
		expect(importHasCode(result)).toBe(false)
		expect(result.css).toBe('')
		const section = (result.root as unknown as LayoutNode).children[0] as unknown as Styled
		expect(section.style).toMatchObject({ backgroundColor: '#0B0B12', display: 'flex', flexDirection: 'column', alignItems: 'center' })
		expect(section.responsiveStyle?.tablet).toBeTruthy()
		expect(section.responsiveStyle?.mobile).toBeTruthy()
		expect((result.root as unknown as Animated).animation).toHaveLength(1)
		expect(result.tailwind?.unsupported).toEqual([])
	})
})

describe('one nav per screen', () => {
	const nav = (cls: string) => `<nav class="${cls}"><a href="#a">A</a></nav>`
	const html = `<header>${nav('flex tablet:hidden mobile:hidden px-12')}${nav('hidden tablet:flex mobile:hidden px-6')}${nav('hidden mobile:flex px-4')}</header>`

	it('shows each nav only on its own screen', () => {
		const navs = ((tree(html).root as unknown as LayoutNode).children[0] as unknown as Styled).children as Styled[]
		const [desktop, tablet, mobile] = navs
		expect(desktop.style.display).toBe('flex')
		expect(desktop.responsiveStyle?.tablet).toMatchObject({ display: 'none' })
		expect(tablet.style.display).toBe('none')
		expect(tablet.responsiveStyle?.tablet).toMatchObject({ display: 'flex' })
		expect(tablet.responsiveStyle?.mobile).toMatchObject({ display: 'none' })
		expect(mobile.style.display).toBe('none')
		expect(mobile.responsiveStyle?.mobile).toMatchObject({ display: 'flex' })
	})

	it('the prompt teaches the pattern', () => {
		expect(IMPORT_HTML_PROMPT_RULES).toContain('2A.5 Click actions and the navigation bar')
		expect(IMPORT_HTML_PROMPT_RULES).toContain('hidden tablet:flex mobile:hidden')
	})
})

describe('click actions', () => {
	const page = '<header><nav class="hidden mobile:block"><button class="click:toggle-[#mobile-menu]">Menu</button><div id="mobile-menu" class="hidden"><a href="#a" class="block">A</a></div></nav></header>'

	it('points a toggle at the node that has the target id', () => {
		const result = tree(page)
		const root = result.root as unknown as Animated & LayoutNode
		const ids = new Map<string, string>()
		const walk = (n: any) => { if (n.attributes?.id) ids.set(String(n.attributes.id).replace(/^.*?(mobile-menu)$/, '$1'), n.id); if (Array.isArray(n.children)) n.children.forEach(walk) }
		walk(root)
		expect(root.animation).toHaveLength(1)
		const trigger = root.animation![0].trigger_effect[0]
		expect(trigger.trigger).toBe('active')
		expect(trigger.effects[0]).toMatchObject({ animation_type: 'toggle', targetNodeId: ids.get('mobile-menu') })
		expect(trigger.effects[0]).not.toHaveProperty('targetSourceId')
		expect(result.tailwind?.unsupported).toEqual([])
	})

	it('starts the target hidden and drops an action whose target does not exist', () => {
		const result = tree(page)
		const menu = (((result.root as unknown as LayoutNode).children[0] as unknown as Styled).children![0] as Styled).children![1]
		expect(menu.style.display).toBe('none')
		expect((tree('<div><button class="click:toggle-[#nope]">x</button></div>').root as unknown as Animated).animation).toBeUndefined()
	})

	it('supports show, hide and scroll-to', () => {
		const html = '<div><a class="click:show-[#a] hover:hide-[#b]" href="#x">x</a><p id="a">A</p><p id="b">B</p><button class="click:scroll-to-[#a]">go</button></div>'
		const anim = (tree(html).root as unknown as Animated).animation!
		const kinds = anim.flatMap((e) => e.trigger_effect.flatMap((t) => t.effects.map((f) => `${t.trigger}:${f.animation_type}`))).sort()
		expect(kinds).toEqual(['active:scrollTo', 'active:show', 'hover:hide'])
	})
})
