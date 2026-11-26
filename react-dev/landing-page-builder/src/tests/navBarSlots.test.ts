import { describe, expect, it } from 'vitest'
import { generateNewNode } from '@/utils/canvas.utils'
import { buildNavBarChildren, restyleNavBarChildren } from '@/utils/navBarSlots'
import type { CanvasNode, NavBarTemplateNode, NavBarUiType } from '@/types/node.type'

const seed = (uiType: NavBarUiType) => ({ ...(generateNewNode('navBarTemplate') as NavBarTemplateNode), uiType, ctaHref: '/register' })
const fontOf = (node: CanvasNode) => JSON.parse((node as { children: string }).children).content[0].content[0].marks[0].attrs.fontFamily

describe('NavBar slots', () => {
	it('seeds the serif brand and a pill CTA for classicRow', () => {
		const node = seed('classicRow')
		const [brand, cta] = buildNavBarChildren(node)
		expect(fontOf(brand)).toContain('Georgia')
		expect(cta.style?.borderRadius).toBe('999px')
	})

	it('switching layout resets the brand font and the keys the old layout set', () => {
		const from = seed('centeredLogo')
		const children = buildNavBarChildren(from)
		expect(children[0].style?.textTransform).toBe('uppercase')
		const to = seed('transparent')
		const next = restyleNavBarChildren(children, to)
		expect(next[0].style?.textTransform).toBe('uppercase') // transparent is uppercase too
		const plain = restyleNavBarChildren(children, seed('pillLinks'))
		expect(plain[0].style?.textTransform).toBeUndefined()
		expect(fontOf(plain[0])).toBe('Arial, sans-serif')
	})
})
