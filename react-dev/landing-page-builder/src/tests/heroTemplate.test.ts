import { describe, expect, it } from 'vitest'
import { generateNewNode } from '@/utils/canvas.utils'
import { HERO_SLOT_STYLES, buildHeroChildren, recolorHeroCta, restyleHeroChildren, setHeroSlotText } from '@/utils/readyMadeTemplates'
import { heroBackground } from '@/utils/heroDefaults'
import type { CanvasNode, HeroTemplateNode, HeroUiType } from '@/types/node.type'

const TYPES = Object.keys(HERO_SLOT_STYLES) as HeroUiType[]
const seed = (uiType: HeroUiType = 'centeredClassic') => ({ ...(generateNewNode('heroTemplate') as HeroTemplateNode), uiType })
const fontOf = (node: CanvasNode) => JSON.parse((node as { children: string }).children).content[0].content[0].marks[0].attrs.fontFamily
const textOf = (node: CanvasNode) => JSON.parse((node as { children: string }).children).content[0].content[0].text

describe('Hero template controls', () => {
	it('every variant seeds heading, subheading and CTA with its own style and font', () => {
		for (const uiType of TYPES) {
			const [heading, subheading, cta] = buildHeroChildren(seed(uiType))
			const slots = HERO_SLOT_STYLES[uiType]
			expect(heading.style?.fontSize).toBe(slots.heading.fontSize)
			expect(fontOf(heading)).toBe(slots.heading.fontFamily)
			expect(fontOf(subheading)).toBe(slots.subheading.fontFamily)
			expect(cta.style?.backgroundColor).toBe(slots.cta(seed(uiType).accentColor).backgroundColor)
		}
	})

	it('switching layout restyles the slots, the font marks and clears keys the next layout does not use', () => {
		const hero = seed('centeredClassic')
		const next = restyleHeroChildren(buildHeroChildren(hero), 'minimalLeft', hero.accentColor)
		expect(fontOf(next[0])).toBe(HERO_SLOT_STYLES.minimalLeft.heading.fontFamily)
		expect(next[0].style?.color).toBe('#0f0f10')
		// centeredClassic's italic subheading must not leak into minimalLeft
		expect(next[1].style?.fontStyle).toBeUndefined()
		// the pill CTA's shadow and radius must not leak either
		expect(next[2].style?.boxShadow).toBeUndefined()
		expect(next[2].style?.borderRadius).toBe('0')
	})

	it('heading, subheading and CTA text fields write through to the slots', () => {
		const children = buildHeroChildren(seed())
		const edited = setHeroSlotText(setHeroSlotText(setHeroSlotText(children, 'heading', 'Night of Stars'), 'subheading', 'Doors at 7'), 'cta', 'Get tickets')
		expect(textOf(edited[0])).toBe('Night of Stars')
		expect(textOf(edited[1])).toBe('Doors at 7')
		expect(edited[2].children).toBe('Get tickets')
	})

	it('changing the accent colour repaints only the CTA and keeps typography edits', () => {
		const hero = seed('gradientBold')
		const children = buildHeroChildren(hero)
		children[0] = { ...children[0], style: { ...children[0].style, fontSize: '70px' } } as CanvasNode
		const next = recolorHeroCta(children, 'centeredClassic', '#ff0000')
		expect(next[0].style?.fontSize).toBe('70px')
		expect(next[1]).toBe(children[1])
		expect(next[2].style?.backgroundColor).toBe('#ff0000')
	})

	it('the background control wins over the variant default', () => {
		expect(heroBackground({ uiType: 'centeredClassic', style: {} })).toBe('#fbf7f0')
		expect(heroBackground({ uiType: 'centeredClassic', style: { backgroundColor: '#123456' } })).toBe('#123456')
		expect(heroBackground({ uiType: 'darkOverlay', style: {} })).toBeUndefined()
	})
})
