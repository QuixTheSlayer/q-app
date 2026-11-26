import { CanvasNode, EventWidgetsGroupTemplateNode, EventWidgetsGroupUiType } from "@/types/node.type";
import { textNode, buttonNode, withTextContent, withFontFamily } from "@/utils/nodeBuilders";

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = 'Arial, sans-serif'

/** Slot order of an event widgets group's `children` tree. The date/hour/
 * timezone fields stay plain fields — they hold {{event_*}} placeholders
 * resolved from live event data at render time. */
export const EVENT_WIDGETS_CHILD_SLOTS = ['heading', 'submitEntry', 'register'] as const
export type EventWidgetsSlot = (typeof EVENT_WIDGETS_CHILD_SLOTS)[number]

interface EventWidgetsSlotStyles {
	heading: React.CSSProperties
	submitEntry: React.CSSProperties
	register: React.CSSProperties
}

export const EVENT_WIDGETS_SLOT_STYLES: Record<EventWidgetsGroupUiType, (accent: string, accent2: string) => EventWidgetsSlotStyles> = {
	classicRow: (a, b) => ({
		heading: { fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.01em' },
		submitEntry: { background: `linear-gradient(135deg, ${a}, ${b})`, color: '#ffffff', fontSize: '13px', fontWeight: '600', padding: '10px 18px', borderRadius: '8px', boxShadow: `0 6px 16px -6px ${a}80` },
		register: { backgroundColor: 'transparent', color: '#334155', border: '1px solid #dfe3ea', fontSize: '13px', fontWeight: '600', padding: '10px 18px', borderRadius: '8px' },
	}),
	countdownCard: (a) => ({
		heading: { fontSize: '12px', fontWeight: '700', letterSpacing: '0.12em', color: a, textTransform: 'uppercase' },
		submitEntry: { backgroundColor: a, color: '#ffffff', fontSize: '13px', fontWeight: '700', padding: '10px 20px', borderRadius: '999px' },
		register: { backgroundColor: 'transparent', color: a, fontSize: '13px', fontWeight: '700', padding: '10px 6px', textDecoration: 'underline' },
	}),
	stackedCentered: (a, b) => ({
		heading: { fontFamily: SERIF, fontSize: '32px', fontWeight: '700', color: '#18181b', letterSpacing: '-0.015em', textAlign: 'center' },
		submitEntry: { background: `linear-gradient(135deg, ${a}, ${b})`, color: '#ffffff', fontSize: '14px', fontWeight: '700', padding: '13px 0', borderRadius: '999px', width: '100%', textAlign: 'center', boxShadow: `0 10px 24px -10px ${a}8c` },
		register: { backgroundColor: 'transparent', color: b, fontSize: '13px', fontWeight: '700', padding: '8px 0', width: '100%', textAlign: 'center' },
	}),
	splitPanel: () => ({
		heading: { fontFamily: SERIF, fontSize: '24px', fontWeight: '700', color: '#ffffff' },
		submitEntry: { backgroundColor: '#111827', color: '#ffffff', fontSize: '13px', fontWeight: '600', padding: '9px 18px', borderRadius: '6px' },
		register: { backgroundColor: 'transparent', color: '#111827', fontSize: '13px', fontWeight: '600', textDecoration: 'underline', padding: '4px 2px' },
	}),
	minimalInline: (a) => ({
		heading: { fontSize: '14px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.01em' },
		submitEntry: { backgroundColor: 'transparent', color: '#0f172a', fontSize: '14px', fontWeight: '700', borderBottom: `2px solid ${a}`, paddingBottom: '1px' },
		register: { backgroundColor: 'transparent', color: '#64748b', fontSize: '14px', fontWeight: '600' },
	}),
	bannerCta: (_a, b) => ({
		heading: { fontFamily: SERIF, fontSize: '26px', fontWeight: '700', color: '#ffffff' },
		submitEntry: { backgroundColor: '#ffffff', color: b, fontSize: '14px', fontWeight: '800', padding: '11px 22px', borderRadius: '999px' },
		register: { backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: '700', padding: '11px 22px', borderRadius: '999px' },
	}),
	darkGlass: (a) => ({
		heading: { fontFamily: SERIF, fontSize: '24px', fontWeight: '700', color: '#f8fafc' },
		submitEntry: { backgroundColor: a, color: '#0f172a', fontSize: '13px', fontWeight: '800', padding: '10px 18px', borderRadius: '8px' },
		register: { backgroundColor: 'transparent', color: '#e2e8f0', border: '1px solid rgba(226,232,240,0.5)', fontSize: '13px', fontWeight: '700', padding: '10px 18px', borderRadius: '8px' },
	}),
	twoColumnCard: (a, b) => ({
		heading: { fontFamily: SERIF, fontSize: '24px', fontWeight: '700', color: '#18181b', letterSpacing: '-0.01em' },
		submitEntry: { background: `linear-gradient(135deg, ${a}, ${b})`, color: '#ffffff', fontSize: '13px', fontWeight: '700', padding: '10px 16px', borderRadius: '8px', textAlign: 'center', boxShadow: `0 8px 18px -8px ${a}80` },
		register: { backgroundColor: 'transparent', color: b, border: `1px solid ${a}4d`, fontSize: '13px', fontWeight: '700', padding: '10px 16px', borderRadius: '8px', textAlign: 'center' },
	}),
}

type EventWidgetsSeed = Pick<EventWidgetsGroupTemplateNode, 'uiType' | 'heading' | 'submitEntryLabel' | 'submitEntryHref' | 'registerLabel' | 'registerHref' | 'accentColor' | 'accentColorSecondary'>

function stylesFor(uiType: EventWidgetsGroupUiType, accent: string, accent2: string): EventWidgetsSlotStyles {
	return (EVENT_WIDGETS_SLOT_STYLES[uiType] ?? EVENT_WIDGETS_SLOT_STYLES.classicRow)(accent || '#4f46e5', accent2 || '#0ea5e9')
}

/** [heading, submitEntry, register] — the two CTAs as real button nodes. */
export function buildEventWidgetsChildren(node: EventWidgetsSeed): CanvasNode[] {
	const s = stylesFor(node.uiType, node.accentColor, node.accentColorSecondary)
	return [
		textNode(node.heading ?? '', s.heading),
		buttonNode(node.submitEntryLabel ?? '', s.submitEntry, node.submitEntryHref ?? ''),
		buttonNode(node.registerLabel ?? '', s.register, node.registerHref ?? ''),
	]
}

const EVENT_WIDGETS_VARIANT_KEYS = ['background', 'backgroundColor', 'border', 'borderBottom', 'boxShadow', 'textDecoration', 'textTransform', 'letterSpacing', 'width', 'textAlign', 'paddingBottom'] as const

/** Re-skins the heading and both CTAs for a new uiType/accent. */
export function restyleEventWidgetsChildren(children: CanvasNode[], uiType: EventWidgetsGroupUiType, accent: string, accent2: string): CanvasNode[] {
	const s = stylesFor(uiType, accent, accent2)
	const perSlot = [s.heading, s.submitEntry, s.register]
	return children.map((child, i) => {
		const patch = perSlot[i]
		if (!patch) return child
		// Keys only some layouts set are cleared first, so they don't leak into the next layout.
		const cleared = Object.fromEntries(EVENT_WIDGETS_VARIANT_KEYS.map((key) => [key, undefined]))
		const next = { ...child, style: { ...child.style, ...cleared, ...patch } } as CanvasNode
		return i === 0 ? withFontFamily(next, typeof patch.fontFamily === 'string' ? patch.fontFamily : SANS) : next
	})
}

/** Writes the panel's heading / CTA label copy into the matching node. */
export function setEventWidgetsSlotText(children: CanvasNode[], slot: EventWidgetsSlot, text: string): CanvasNode[] {
	const index = EVENT_WIDGETS_CHILD_SLOTS.indexOf(slot)
	if (index < 0) return children
	return children.map((child, i) => {
		if (i !== index) return child
		if (child?.contentType === 'button') return { ...child, children: text } as CanvasNode
		return withTextContent(child, text)
	})
}
