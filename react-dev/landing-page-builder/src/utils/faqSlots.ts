import type { CanvasNode, FaqItem, FaqNode, FaqUiType } from "@/types/node.type";
import { blockNode, textNode, withTextContent, applyTextStyle } from "@/utils/nodeBuilders";
const SERIF = "Georgia, 'Times New Roman', serif"


/**
 * Per-uiType styling for an FAQ item's own block node and the text inside it.
 * `item` is the block's container style, so a whole question/answer pair can
 * be selected and restyled as one unit on the canvas.
 */
export const FAQ_SLOT_STYLES: Record<FaqUiType, {
	item: React.CSSProperties
	question: React.CSSProperties
	answer: React.CSSProperties
}> = {
	classicAccordion: {
		item: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.375em', flex: '1 1 auto', minWidth: 0 },
		question: { fontFamily: SERIF, fontSize: '17px', fontWeight: '600', color: '#1e40af' },
		answer: { fontSize: '15px', lineHeight: '1.65', fontWeight: '400', color: '#4a4a4a' },
	},
	plusMinus: {
		item: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.375em', flex: '1 1 auto', minWidth: 0 },
		question: { fontFamily: SERIF, fontSize: '17px', fontWeight: '600', color: '#1e40af' },
		answer: { fontSize: '15px', lineHeight: '1.65', fontWeight: '400', color: '#4a4a4a' },
	},
	boxed: {
		item: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5em', flex: '1 1 auto', minWidth: 0 },
		question: { fontFamily: SERIF, fontSize: '17px', fontWeight: '600', color: '#1e40af' },
		answer: { fontSize: '15px', lineHeight: '1.65', fontWeight: '400', color: '#4a4a4a' },
	},
	numbered: {
		item: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.375em', flex: '1 1 auto', minWidth: 0 },
		question: { fontFamily: SERIF, fontSize: '17px', fontWeight: '600', color: '#1e40af' },
		answer: { fontSize: '15px', lineHeight: '1.65', fontWeight: '400', color: '#4a4a4a' },
	},
	// Questions sit on a solid accent sidebar here, answers on a light card.
	twoColumn: {
		item: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5em', flex: '1 1 auto', minWidth: 0 },
		question: { fontFamily: SERIF, fontSize: '17px', fontWeight: '600', color: '#ffffff' },
		answer: { fontSize: '15px', lineHeight: '1.65', fontWeight: '400', color: '#4a4a4a' },
	},
	minimalDivider: {
		item: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.375em', flex: '1 1 auto', minWidth: 0 },
		question: { fontFamily: SERIF, fontSize: '17px', fontWeight: '600', color: '#1e40af' },
		answer: { fontSize: '15px', lineHeight: '1.65', fontWeight: '400', color: '#4a4a4a' },
	},
	// Dark tile grid — both slots need light text.
	cardGrid: {
		item: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.625em', flex: '1 1 auto', minWidth: 0 },
		question: { fontFamily: SERIF, fontSize: '17px', fontWeight: '600', color: '#ffffff' },
		answer: { fontSize: '15px', lineHeight: '1.65', fontWeight: '400', color: '#c9c9d4' },
	},
	// Question bubble is the accent gradient, answer bubble is the light card.
	chatBubble: {
		item: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5em', flex: '1 1 auto', minWidth: 0 },
		question: { fontFamily: SERIF, fontSize: '17px', fontWeight: '600', color: '#1e40af' },
		answer: { fontSize: '15px', lineHeight: '1.65', fontWeight: '400', color: '#4a4a4a' },
	},
	credentialList: {
		item: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.375em', flex: '1 1 auto', minWidth: 0 },
		question: { fontFamily: SERIF, fontSize: '17px', fontWeight: '600', color: '#1B1D22' },
		answer: { fontSize: '15px', lineHeight: '1.65', fontWeight: '400', color: '#4a4a4a' },
	},
}

function stylesFor(uiType: FaqUiType) {
	return FAQ_SLOT_STYLES[uiType] ?? FAQ_SLOT_STYLES.classicAccordion
}

/** A child's own child nodes, or [] when it isn't a block (legacy flat tree). */
function kidsOf(node: CanvasNode | undefined): CanvasNode[] {
	const kids = (node as { children?: unknown } | undefined)?.children
	return Array.isArray(kids) ? (kids as CanvasNode[]) : []
}

/** One FAQ item as a block node holding [question, answer]. */
export function buildFaqItemBlock(item: FaqItem, uiType: FaqUiType): CanvasNode {
	const s = stylesFor(uiType)
	const block = blockNode([textNode(item.question, s.question), textNode(item.answer, s.answer)], s.item)
	return { ...block, name: item.question || 'FAQ item' } as CanvasNode
}

/** [item0, item1, ...] — each item a real block node holding its Q and A. */
export function buildFaqChildren(node: Pick<FaqNode, 'uiType' | 'items'>): CanvasNode[] {
	return (node.items ?? []).map((item) => buildFaqItemBlock(item, node.uiType))
}

/** Re-skins each item block and its text for a new uiType, keeping edits. */
export function restyleFaqChildren(children: CanvasNode[], uiType: FaqUiType): CanvasNode[] {
	const s = stylesFor(uiType)
	return children.map((child) => {
		const kids = kidsOf(child)
		if (!kids.length) return child
		const nextKids = kids.map((kid, i) => applyTextStyle(kid, i === 0 ? s.question : s.answer))
		return { ...child, style: { ...child.style, ...s.item }, children: nextKids } as CanvasNode
	})
}

/** Writes a question/answer's copy into its item block so the panel's text
 * fields keep working. */
export function setFaqSlotText(children: CanvasNode[], itemIndex: number, field: 'question' | 'answer', text: string): CanvasNode[] {
	if (itemIndex < 0 || itemIndex >= children.length) return children
	return children.map((child, i) => {
		if (i !== itemIndex) return child
		const kids = kidsOf(child)
		const wanted = field === 'question' ? kids[0] : kids[1]
		if (!wanted) return child
		return { ...child, children: kids.map((k) => (k?.id === wanted.id ? withTextContent(k, text) : k)) } as CanvasNode
	})
}
