import { CanvasNode, PricingToggleNode, PricingToggleUiType } from "@/types/node.type";
import { textNode, withTextContent } from "@/utils/nodeBuilders";

// Per-uiType plan-name slot styling, mirroring each variant's own planName
// rendering. Every entry sets the same keys so switching variant fully resets.
const PLAN_NAME_SLOT: Record<PricingToggleUiType, { align: 'left' | 'center'; extra: React.CSSProperties }> = {
	classicCard: { align: 'center', extra: { letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: '700' } },
	gradientHero: { align: 'center', extra: { letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.9 } },
	minimalFlat: { align: 'left', extra: { fontWeight: '700' } },
	darkGlass: { align: 'center', extra: { letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: '700' } },
	bordered: { align: 'center', extra: { letterSpacing: '0.08em', textTransform: 'uppercase' } },
	split: { align: 'left', extra: { letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '700' } },
	ribbon: { align: 'center', extra: {} },
	compactRow: { align: 'left', extra: {} },
	wristband: { align: 'left', extra: {} },
}

/** Plan-name color the dark variants substitute while it's still the default. */
function planNameColor(uiType: PricingToggleUiType, base?: string): string | undefined {
	if (uiType !== 'gradientHero' && uiType !== 'darkGlass') return base
	if (base && base !== '#2563eb') return base
	return uiType === 'darkGlass' ? '#e5e7eb' : '#fff'
}

/** Full style for the plan-name text node under a given uiType. */
export function pricingToggleSlotStyle(uiType: PricingToggleUiType, base?: React.CSSProperties): React.CSSProperties {
	const entry = PLAN_NAME_SLOT[uiType] ?? PLAN_NAME_SLOT.classicCard
	return {
		letterSpacing: 'normal',
		textTransform: 'none',
		opacity: 1,
		...base,
		...entry.extra,
		color: planNameColor(uiType, base?.color),
		textAlign: entry.align,
	}
}

/** [planName] — prices and monthly/yearly labels stay flat fields. */
export function buildPricingToggleChildren(node: Pick<PricingToggleNode, 'uiType' | 'planName' | 'planNameStyle'>): CanvasNode[] {
	const entry = PLAN_NAME_SLOT[node.uiType] ?? PLAN_NAME_SLOT.classicCard
	return [textNode(node.planName ?? '', pricingToggleSlotStyle(node.uiType, node.planNameStyle), entry.align)]
}

/** Re-skins the plan-name node for a new uiType. */
export function restylePricingToggleChildren(children: CanvasNode[], uiType: PricingToggleUiType, base?: React.CSSProperties): CanvasNode[] {
	if (!children.length) return children
	const next = { ...children[0], style: { ...children[0].style, ...pricingToggleSlotStyle(uiType, base) } } as CanvasNode
	return [next, ...children.slice(1)]
}

/** Writes copy into the plan-name node. */
export function setPricingToggleSlotText(children: CanvasNode[], text: string): CanvasNode[] {
	if (!children.length) return children
	return [withTextContent(children[0], text), ...children.slice(1)]
}
