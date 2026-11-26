import { describe, expect, it } from 'vitest'
import { generateNewNode } from '@/utils/canvas.utils'
import { buildFooterChildren, restyleFooterChildren } from '@/utils/footerSlots'
import { buildEventWidgetsChildren, restyleEventWidgetsChildren } from '@/utils/eventWidgetsSlots'
import type { CanvasNode, EventWidgetsGroupTemplateNode, FooterTemplateNode } from '@/types/node.type'

const fontOf = (node: CanvasNode) => JSON.parse((node as { children: string }).children).content[0].content[0].marks[0].attrs.fontFamily

describe('Footer layouts', () => {
	it('seeds a serif brand and resets it when switching to a sans layout', () => {
		const footer = { ...(generateNewNode('footerTemplate') as FooterTemplateNode), uiType: 'classicColumns' as const }
		const children = buildFooterChildren(footer)
		expect(fontOf(children[0])).toContain('Georgia')
		const next = restyleFooterChildren(children, 'compactBar')
		expect(fontOf(next[0])).toBe('Arial, sans-serif') // compactBar's brand is plain sans, so the serif is reset
		const centered = restyleFooterChildren(children, 'centeredMinimal')
		expect(centered[0].style?.textAlign).toBe('center')
		// the centred alignment must not leak back into the left-aligned layout
		expect(restyleFooterChildren(centered, 'classicColumns')[0].style?.textAlign).toBeUndefined()
	})
})

describe('Event widgets layouts', () => {
	it('seeds a serif heading and clears the old layout keys on switch', () => {
		const node = { ...(generateNewNode('eventWidgetsGroupTemplate') as EventWidgetsGroupTemplateNode), uiType: 'bannerCta' as const, submitEntryHref: '/s', registerHref: '/r' }
		const children = buildEventWidgetsChildren(node)
		expect(fontOf(children[0])).toContain('Georgia')
		const next = restyleEventWidgetsChildren(children, 'classicRow', node.accentColor, node.accentColorSecondary)
		// bannerCta's white translucent register button must not keep its background or border
		expect(next[2].style?.backgroundColor).toBe('transparent')
		expect(next[2].style?.border).toBe('1px solid #dfe3ea')
		expect(next[1].style?.background).toContain('linear-gradient')
		expect(next[1].style?.backgroundColor).toBeUndefined()
	})
})

describe('Other Ready Made Templates', () => {
	const headingOf = (nodes: CanvasNode[]) => nodes.filter((n) => n.contentType === 'text').length

	it('the cards template no longer adds a second heading above its own', async () => {
		const { generateCardsTemplate } = await import('@/utils/readyMadeTemplates')
		const nodes = generateCardsTemplate()
		expect(nodes).toHaveLength(1)
		expect(headingOf(nodes)).toBe(0)
	})

	it('section headings use the serif display font', async () => {
		const { generateFaqTemplate } = await import('@/utils/readyMadeTemplates')
		const [heading] = generateFaqTemplate()
		expect(fontOf(heading)).toContain('Georgia')
	})

	it('the table template seeds an event schedule instead of Header 1 / Cell 1', async () => {
		const { generateTableEnterpriseTemplate } = await import('@/utils/readyMadeTemplates')
		const [, table] = generateTableEnterpriseTemplate()
		expect(JSON.stringify((table as { children: unknown }).children)).toContain('Opening keynote')
	})
})

describe('Table layouts', () => {
	it('every layout produces its own scoped CSS and keeps the user colours', async () => {
		const { buildTableUiTypeStyle } = await import('@/utils/tableUiTypeStyles')
		const { generateTableEnterpriseTemplate } = await import('@/utils/readyMadeTemplates')
		const table = generateTableEnterpriseTemplate()[1] as import('@/types/node.type').TableEnterpriseNode
		const types = ['classicBordered', 'striped', 'minimalBorderless', 'darkHeader', 'cardRows', 'compact', 'roundedSoft', 'highContrast'] as const
		const css = types.map((uiType) => buildTableUiTypeStyle({ ...table, uiType }, 't1'))
		expect(new Set(css).size).toBe(types.length)
		css.forEach((c) => expect(c).toContain('.t1 table'))
		expect(css[0]).toContain('#ddd6fe') // the classic layout keeps the head border colour
	})
})

describe('Cards, Layout and FAQ layouts', () => {
	it('numberedList cards carry their own ordinal and the chrome resets on switch', async () => {
		const { generateNewNode } = await import('@/utils/canvas.utils')
		const { buildCardsChildren, restyleCardsChildren } = await import('@/utils/cardsSlots')
		const node = { ...(generateNewNode('cardsTemplate') as import('@/types/node.type').CardsTemplateNode), uiType: 'numberedList' as const }
		const children = buildCardsChildren(node)
		expect(String(children[1].style?.backgroundImage)).toContain('%3E01%3C')
		expect(String(children[2].style?.backgroundImage)).toContain('%3E02%3C')
		const next = restyleCardsChildren(children, 'gridClassic', node.accentColor)
		expect(next[1].style?.backgroundImage).toBeUndefined()
		expect(next[1].style?.borderTop).toContain('4px solid')
	})

	it('the chat bubble question is dark enough to read on its white bubble', async () => {
		const { FAQ_SLOT_STYLES } = await import('@/utils/faqSlots')
		expect(FAQ_SLOT_STYLES.chatBubble.question.color).not.toBe('#ffffff')
	})

	it('left-aligned card and column blocks do not centre their text', async () => {
		const { CARDS_SLOT_STYLES } = await import('@/utils/cardsSlots')
		expect(CARDS_SLOT_STYLES.gridClassic.card('#7c3aed', 0).alignItems).toBe('flex-start')
	})
})
