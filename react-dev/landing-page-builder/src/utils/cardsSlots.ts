import { CanvasNode, CardItem, CardsTemplateNode, CardsUiType } from "@/types/node.type";
import { textNode, imageNode, blockNode, withTextContent, applyTextStyle } from "@/utils/nodeBuilders";
const SERIF = "Georgia, 'Times New Roman', serif"


/**
 * Per-uiType styling for a card's own block node and the text inside it.
 * `card` is the block's container style — the variant's card chrome, which the
 * user can now restyle because the card is a real node.
 */
export const CARDS_SLOT_STYLES: Record<CardsUiType, {
	heading: React.CSSProperties
	card: (accent: string, index: number) => React.CSSProperties
	title: React.CSSProperties
	description: React.CSSProperties
	image?: React.CSSProperties
}> = {
	gridClassic: {
		heading: { fontFamily: SERIF, fontSize: '32px', fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
		card: (accent) => ({ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.6em', padding: '1.75em 1.5em 1.5em', borderTop: `4px solid ${accent}`, borderRadius: '14px', backgroundColor: '#ffffff', boxShadow: `0 22px 40px -26px ${accent}99, 0 2px 6px rgba(16,16,16,0.05)` }),
		title: { fontFamily: SERIF, fontSize: '19px', fontWeight: '700', color: '#1a1a1a' },
		description: { fontSize: '14px', lineHeight: '1.6', color: '#5a5a5a' },
		image: { width: '100%', height: '7rem', objectFit: 'cover', borderRadius: '2px' },
	},
	imageOverlay: {
		heading: { fontFamily: SERIF, fontSize: '32px', fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
		card: (accent) => ({ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', gap: '0.375em', padding: '1.5em', minHeight: '260px', borderRadius: '18px', background: `linear-gradient(to top, rgba(10,8,20,0.92) 8%, rgba(10,8,20,0.15) 75%), linear-gradient(135deg, ${accent}, #1e1b4b)`, boxShadow: `0 26px 44px -26px ${accent}` }),
		title: { fontFamily: SERIF, fontSize: '19px', fontWeight: '700', color: '#ffffff' },
		description: { fontSize: '14px', lineHeight: '1.6', color: 'rgba(255,255,255,0.85)' },
	},
	iconTop: {
		heading: { fontFamily: SERIF, fontSize: '32px', fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
		card: (accent) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.6em', padding: '2em 1.5em', borderRadius: '18px', backgroundColor: `${accent}0d`, border: `1px solid ${accent}26` }),
		title: { fontFamily: SERIF, fontSize: '19px', fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
		description: { fontSize: '14px', lineHeight: '1.6', color: '#5a5a5a', textAlign: 'center' },
		image: { width: '2rem', height: '2rem', objectFit: 'cover', borderRadius: '999px' },
	},
	horizontalRow: {
		heading: { fontFamily: SERIF, fontSize: '32px', fontWeight: '700', color: '#1a1a1a' },
		card: (accent) => ({ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25em', minWidth: 0, padding: '1.1em 1.4em', borderLeft: `5px solid ${accent}`, borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 14px 28px -20px rgba(16,16,16,0.4)' }),
		title: { fontFamily: SERIF, fontSize: '19px', fontWeight: '700', color: '#1a1a1a' },
		description: { fontSize: '14px', lineHeight: '1.6', color: '#5a5a5a' },
		image: { width: '100%', height: '100%', objectFit: 'cover' },
	},
	minimalBorder: {
		heading: { fontFamily: SERIF, fontSize: '32px', fontWeight: '400', color: '#1a1a1a', textAlign: 'center', letterSpacing: '0.025em' },
		card: (accent, i) => ({ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.6em', padding: '1.75em', borderTop: `3px solid ${accent}`, borderLeft: i === 0 ? '1px solid #e5e5e5' : 'none', borderRight: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }),
		title: { fontFamily: SERIF, fontSize: '19px', fontWeight: '700', color: '#1a1a1a' },
		description: { fontSize: '14px', lineHeight: '1.6', color: '#7a7a7a' },
	},
	shadowFloat: {
		heading: { fontFamily: SERIF, fontSize: '32px', fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
		card: (_accent, i) => ({ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5em', padding: '1.25em', borderRadius: '20px', backgroundColor: '#ffffff', boxShadow: '0 26px 48px -20px rgba(60,40,120,0.45)', transform: i % 2 === 1 ? 'translateY(16px)' : 'translateY(0px)' }),
		title: { fontFamily: SERIF, fontSize: '19px', fontWeight: '700', color: '#1a1a1a' },
		description: { fontSize: '14px', lineHeight: '1.6', color: '#5a5a5a' },
		image: { width: '100%', height: '6rem', objectFit: 'cover', borderRadius: '10px' },
	},
	gradientHeader: {
		heading: { fontFamily: SERIF, fontSize: '32px', fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
		card: (accent) => ({ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.1em', padding: '1.1em 1.25em 1.4em', borderRadius: '14px', border: '1px solid #eee', overflow: 'hidden', background: `linear-gradient(135deg, ${accent}, ${accent}b3) 0 0 / 100% 4em no-repeat, #ffffff`, boxShadow: '0 18px 34px -24px rgba(16,16,16,0.35)' }),
		title: { fontFamily: SERIF, fontSize: '19px', fontWeight: '700', color: '#ffffff' },
		description: { fontSize: '14px', lineHeight: '1.6', color: '#5a5a5a' },
	},
	numberedList: {
		heading: { fontFamily: SERIF, fontSize: '32px', fontWeight: '700', color: '#1a1a1a' },
		card: (accent, i) => ({ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25em', paddingTop: '0.25em', paddingBottom: '1.5em', paddingLeft: '4.5em', minWidth: 0, borderBottom: '1px solid #e8e8ee', backgroundRepeat: 'no-repeat', backgroundPosition: '0 0', backgroundSize: '4em 3em', backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='64' height='48'><text x='0' y='40' font-family='Georgia,serif' font-size='44' font-style='italic' font-weight='700' fill='${accent}'>${String(i + 1).padStart(2, '0')}</text></svg>`)}")` }),
		title: { fontFamily: SERIF, fontSize: '19px', fontWeight: '700', color: '#1a1a1a' },
		description: { fontSize: '14px', lineHeight: '1.6', color: '#5a5a5a' },
	},
	sessionCards: {
		heading: { fontFamily: SERIF, fontSize: '32px', fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
		card: (accent) => ({ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5em', padding: '1.4em 1.5em', borderLeft: `5px solid ${accent}`, borderRadius: '10px', backgroundColor: '#ffffff', boxShadow: '0 18px 32px -22px rgba(16,16,16,0.4)' }),
		title: { fontFamily: SERIF, fontSize: '19px', fontWeight: '700', color: '#1B1D22' },
		description: { fontSize: '14px', lineHeight: '1.6', color: '#4b5563' },
		image: { width: '100%', height: '6rem', objectFit: 'cover' },
	},
}

/** Variants that paint the card image as a CSS background, so it can't be a
 * node — it stays the card's `imageUrl` field, as Hero's image does. */
export const CARDS_UI_TYPES_WITH_BACKGROUND_IMAGE = new Set<CardsUiType>(['imageOverlay'])

function cardBlock(card: CardItem, uiType: CardsUiType, accent: string, index: number): CanvasNode {
	const s = CARDS_SLOT_STYLES[uiType] ?? CARDS_SLOT_STYLES.gridClassic
	const kids: CanvasNode[] = []
	if (card.imageUrl && s.image && !CARDS_UI_TYPES_WITH_BACKGROUND_IMAGE.has(uiType)) {
		kids.push(imageNode(card.imageUrl, s.image, card.title))
	}
	kids.push(textNode(card.title ?? '', s.title))
	kids.push(textNode(card.description ?? '', s.description))
	return { ...blockNode(kids, s.card(accent, index)), name: card.title || `Card ${index + 1}` } as CanvasNode
}

/** [heading, card0, card1, ...] — each card a real block node. */
export function buildCardsChildren(node: Pick<CardsTemplateNode, 'uiType' | 'heading' | 'cards' | 'accentColor'>): CanvasNode[] {
	const s = CARDS_SLOT_STYLES[node.uiType] ?? CARDS_SLOT_STYLES.gridClassic
	return [
		textNode(node.heading ?? '', s.heading),
		...(node.cards ?? []).map((c, i) => cardBlock(c, node.uiType, node.accentColor, i)),
	]
}

const CARD_CHROME_KEYS = ['border', 'borderTop', 'borderLeft', 'borderRight', 'borderBottom', 'borderRadius', 'boxShadow', 'background', 'backgroundColor', 'backgroundImage', 'backgroundRepeat', 'backgroundPosition', 'backgroundSize', 'padding', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'minHeight', 'alignItems', 'justifyContent', 'textAlign', 'overflow', 'transform'] as const

/** Re-skins heading, each card block and its text for a new uiType/accent. */
export function restyleCardsChildren(children: CanvasNode[], uiType: CardsUiType, accent: string): CanvasNode[] {
	const s = CARDS_SLOT_STYLES[uiType] ?? CARDS_SLOT_STYLES.gridClassic
	return children.map((child, i) => {
		if (i === 0) return applyTextStyle(child, s.heading)
		const kids = ((child as { children?: CanvasNode[] }).children ?? [])
		const firstTextId = kids.filter((k) => k?.contentType === 'text')[0]?.id
		const nextKids = kids.map((k) => {
			if (k?.contentType === 'image') return s.image ? { ...k, style: { ...k.style, ...s.image } } as CanvasNode : k
			const isTitle = k?.id === firstTextId
			return applyTextStyle(k, isTitle ? s.title : s.description)
		})
		// Chrome keys only some layouts set are cleared first, so they don't leak into the next layout.
		const cleared = Object.fromEntries(CARD_CHROME_KEYS.map((key) => [key, undefined]))
		return { ...child, style: { ...child.style, ...cleared, ...s.card(accent, i - 1) }, children: nextKids } as CanvasNode
	})
}

/** Writes copy into the heading node, or a card's title/description node. */
export function setCardsSlotText(children: CanvasNode[], target: 'heading' | { card: number; field: 'title' | 'description' }, text: string): CanvasNode[] {
	if (target === 'heading') {
		if (!children.length) return children
		return [withTextContent(children[0], text), ...children.slice(1)]
	}
	const at = target.card + 1
	if (at < 1 || at >= children.length) return children
	return children.map((child, i) => {
		if (i !== at) return child
		const kids = (child as { children?: CanvasNode[] }).children ?? []
		const texts = kids.filter((k) => k?.contentType === 'text')
		const wanted = target.field === 'title' ? texts[0] : texts[1]
		if (!wanted) return child
		return { ...child, children: kids.map((k) => (k?.id === wanted.id ? withTextContent(k, text) : k)) } as CanvasNode
	})
}

/** One new card block, for the panel's "add card" action. */
export function buildCardBlock(card: CardItem, uiType: CardsUiType, accent: string, index: number): CanvasNode {
	return cardBlock(card, uiType, accent, index)
}
