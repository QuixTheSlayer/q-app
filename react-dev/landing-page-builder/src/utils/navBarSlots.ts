import { CanvasNode, NavBarTemplateNode, NavBarUiType, NavLink } from "@/types/node.type";
import { textNode, buttonNode, withTextContent, withFontFamily } from "@/utils/nodeBuilders";

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = 'Arial, sans-serif'

/** Seed colors, derived the same way NavBarTemplateVisual derives them. */
export interface NavColors { bg: string; fg: string; accent: string }

export function navColorsOf(node: Pick<NavBarTemplateNode, 'style'>): NavColors {
	const bg = (node.style?.backgroundColor as string) || '#ffffff'
	const fg = (node.style?.color as string) || '#111827'
	return { bg, fg, accent: fg === '#111827' ? '#2563eb' : fg }
}

/** Flat base so a link button reads as the plain anchor it replaces. */
const FLAT_LINK: React.CSSProperties = { backgroundColor: 'transparent', borderRadius: '0', height: 'auto', paddingLeft: '0', paddingRight: '0', fontWeight: '500', justifyContent: 'flex-start' }

const SOLID_CTA = (accent: string): React.CSSProperties => ({ backgroundColor: accent, color: '#ffffff', fontSize: '13px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', height: 'auto', paddingTop: '0.55em', paddingBottom: '0.55em', borderRadius: '6px' })

/** Per-uiType styling for the brand text, each link button and the CTA. */
export const NAVBAR_SLOT_STYLES: Record<NavBarUiType, (c: NavColors) => {
	brand: React.CSSProperties
	link: React.CSSProperties
	cta: React.CSSProperties
}> = {
	classicRow: (c) => ({
		brand: { fontFamily: SERIF, fontSize: '22px', fontWeight: '700', letterSpacing: '-0.01em', color: c.fg },
		link: { ...FLAT_LINK, fontSize: '14px', letterSpacing: '0.02em', color: c.fg },
		cta: { ...SOLID_CTA(c.accent), borderRadius: '999px' },
	}),
	centeredLogo: (c) => ({
		brand: { fontFamily: SERIF, fontSize: '26px', fontWeight: '700', color: c.fg, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' },
		link: { ...FLAT_LINK, fontSize: '14px', color: c.fg },
		cta: { backgroundColor: 'transparent', border: `1px solid ${c.accent}`, color: c.accent, fontSize: '12px', fontWeight: '600', height: 'auto', paddingTop: '0.25em', paddingBottom: '0.25em', borderRadius: '999px' },
	}),
	pillLinks: (c) => ({
		brand: { fontSize: '16px', fontWeight: '700', color: c.fg, textAlign: 'center' },
		link: { fontSize: '14px', fontWeight: '500', color: c.fg, backgroundColor: `${c.accent}1a`, border: `1px solid ${c.accent}55`, borderRadius: '999px', height: 'auto', paddingTop: '0.5em', paddingBottom: '0.5em' },
		cta: { ...SOLID_CTA(c.accent), borderRadius: '999px' },
	}),
	transparent: (c) => ({
		brand: { fontSize: '14px', fontWeight: '600', color: c.fg, textTransform: 'uppercase', letterSpacing: '0.15em' },
		link: { ...FLAT_LINK, fontSize: '12px', color: c.fg, textTransform: 'uppercase', letterSpacing: '0.1em' },
		cta: { ...SOLID_CTA(c.accent), fontSize: '12px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.1em' },
	}),
	darkBar: (c) => {
		const darkBg = c.bg === '#ffffff' ? '#0f172a' : c.bg
		const darkFg = c.fg === '#111827' ? '#f8fafc' : c.fg
		return {
			brand: { fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: darkFg },
			link: { ...FLAT_LINK, fontSize: '14px', color: `${darkFg}cc`, backgroundColor: darkBg, justifyContent: 'center', paddingLeft: '0.75em', paddingRight: '0.75em', paddingTop: '0.75em', paddingBottom: '0.75em' },
			cta: { ...SOLID_CTA(c.accent), borderRadius: '0' },
		}
	},
	underlineActive: (c) => ({
		brand: { fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: c.fg },
		link: { ...FLAT_LINK, fontSize: '14px', color: c.fg, paddingLeft: '0.75em' },
		cta: SOLID_CTA(c.accent),
	}),
	splitCta: (c) => ({
		brand: { fontFamily: SERIF, fontSize: '20px', fontWeight: '700', color: c.fg },
		link: { ...FLAT_LINK, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: c.fg },
		cta: { ...SOLID_CTA(c.accent), borderRadius: '0' },
	}),
	stacked: (c) => ({
		brand: { fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: c.fg },
		link: { ...FLAT_LINK, fontSize: '14px', color: c.fg },
		cta: { ...SOLID_CTA(c.accent), fontSize: '12px' },
	}),
	floatingCard: (c) => ({
		brand: { fontFamily: SERIF, fontSize: '20px', fontWeight: '700', color: c.fg },
		link: { ...FLAT_LINK, fontSize: '14px', letterSpacing: '0.02em', color: c.fg },
		cta: { ...SOLID_CTA(c.accent), borderRadius: '999px', boxShadow: `0 10px 18px -8px ${c.accent}` },
	}),
	darkBorderedRow: (c) => {
		const darkFg = c.fg === '#111827' ? '#f4f4f6' : c.fg
		return {
			brand: { fontSize: '18px', fontWeight: '700', color: darkFg },
			link: { fontSize: '14px', fontWeight: '500', color: darkFg, backgroundColor: 'transparent', border: `1px solid ${darkFg}22`, borderRadius: '6px', height: 'auto', paddingTop: '0.375em', paddingBottom: '0.375em' },
			cta: { backgroundColor: 'transparent', border: `1px solid ${darkFg}`, color: darkFg, fontSize: '14px', fontWeight: '600', height: 'auto', paddingTop: '0.5em', paddingBottom: '0.5em', borderRadius: '999px' },
		}
	},
	pillIslandLight: () => ({
		brand: { fontSize: '14px', fontWeight: '700', color: '#111827' },
		link: { ...FLAT_LINK, fontSize: '14px', color: '#374151' },
		cta: { backgroundColor: '#111827', color: '#ffffff', fontSize: '14px', fontWeight: '600', height: 'auto', paddingTop: '0.375em', paddingBottom: '0.375em', borderRadius: '999px' },
	}),
	iconWordmark: (c) => ({
		brand: { fontSize: '14px', fontWeight: '600', color: c.fg, letterSpacing: '0.05em' },
		link: { ...FLAT_LINK, fontSize: '12px', color: c.fg, textTransform: 'uppercase', letterSpacing: '0.12em' },
		cta: { backgroundColor: 'transparent', border: `1px solid ${c.fg}55`, color: c.fg, fontSize: '12px', fontWeight: '600', height: 'auto', paddingTop: '0.5em', paddingBottom: '0.5em', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.08em' },
	}),
	actionIconBar: (c) => {
		const darkFg = c.fg === '#111827' ? '#e5e7eb' : c.fg
		return {
			brand: { fontSize: '16px', fontWeight: '700', color: darkFg },
			link: { ...FLAT_LINK, fontSize: '14px', color: `${darkFg}cc` },
			cta: { ...SOLID_CTA(c.accent), background: `linear-gradient(120deg, ${c.accent}, ${c.accent}cc)`, borderRadius: '8px' },
		}
	},
}

function stylesOf(node: NavBarSeed) {
	const build = NAVBAR_SLOT_STYLES[node.uiType] ?? NAVBAR_SLOT_STYLES.classicRow
	return build(navColorsOf(node))
}

export type NavBarSeed = Pick<NavBarTemplateNode, 'uiType' | 'brand' | 'links' | 'ctaLabel' | 'ctaHref' | 'showCta' | 'brandDisplayMode' | 'style'>

/** Slot positions, -1 when that slot isn't a node for this node's settings.
 * Brand is a node only in text mode; the CTA only when it actually renders. */
export function navBarSlotIndexes(node: NavBarSeed): { brand: number; cta: number; links: number } {
	const hasBrand = node.brandDisplayMode !== 'image'
	const hasCta = node.showCta !== false && !!node.ctaLabel && !!node.ctaHref
	const brand = hasBrand ? 0 : -1
	const cta = hasCta ? (hasBrand ? 1 : 0) : -1
	return { brand, cta, links: (hasBrand ? 1 : 0) + (hasCta ? 1 : 0) }
}

/** One link node, for the panel's "add link" action. */
export function buildNavBarLinkButton(node: NavBarSeed, link: NavLink): CanvasNode {
	return buttonNode(link.label ?? '', stylesOf(node).link, link.href ?? '')
}

/** [brand?, cta?, link0, link1, ...]. */
export function buildNavBarChildren(node: NavBarSeed): CanvasNode[] {
	const s = stylesOf(node)
	const idx = navBarSlotIndexes(node)
	const out: CanvasNode[] = []
	if (idx.brand >= 0) out.push(textNode(node.brand ?? '', s.brand))
	if (idx.cta >= 0) out.push(buttonNode(node.ctaLabel ?? '', s.cta, node.ctaHref ?? ''))
	for (const link of node.links ?? []) out.push(buildNavBarLinkButton(node, link))
	return out
}

const NAVBAR_VARIANT_KEYS = ['textTransform', 'letterSpacing', 'boxShadow', 'border', 'background', 'textAlign'] as const

/** Re-skins brand/cta/links for a new uiType or color. */
export function restyleNavBarChildren(children: CanvasNode[], node: NavBarSeed): CanvasNode[] {
	const s = stylesOf(node)
	const idx = navBarSlotIndexes(node)
	return children.map((child, i) => {
		const isBrand = i === idx.brand
		const patch = isBrand ? s.brand : i === idx.cta ? s.cta : s.link
		// Keys only some variants set are cleared first, so they don't leak into the next variant.
		const cleared = Object.fromEntries(NAVBAR_VARIANT_KEYS.map((key) => [key, undefined]))
		const next = { ...child, style: { ...child.style, ...cleared, ...patch } } as CanvasNode
		return isBrand ? withFontFamily(next, typeof patch.fontFamily === 'string' ? patch.fontFamily : SANS) : next
	})
}

type NavBarTextTarget = 'brand' | 'ctaLabel' | 'ctaHref' | { link: number; field: 'label' | 'href' }

/** Writes panel edits through to the matching slot node. */
export function setNavBarSlotText(children: CanvasNode[], node: NavBarSeed, target: NavBarTextTarget, text: string): CanvasNode[] {
	const idx = navBarSlotIndexes(node)
	const at = typeof target === 'string'
		? (target === 'brand' ? idx.brand : idx.cta)
		: idx.links + target.link
	if (at < 0 || at >= children.length) return children
	return children.map((child, i) => {
		if (i !== at) return child
		if (target === 'brand') return withTextContent(child, text)
		const field = typeof target === 'string' ? (target === 'ctaLabel' ? 'label' : 'href') : target.field
		return field === 'label'
			? { ...child, children: text } as CanvasNode
			: { ...child, attributes: { ...child.attributes, href: text } } as CanvasNode
	})
}

/** Adds/removes the brand or CTA node when their toggles change, keeping the
 * link nodes and any edits already made to the slots that stay. */
export function syncNavBarChildren(children: CanvasNode[], prev: NavBarSeed, next: NavBarSeed): CanvasNode[] {
	const prevIdx = navBarSlotIndexes(prev)
	const nextIdx = navBarSlotIndexes(next)
	if (prevIdx.brand === nextIdx.brand && prevIdx.cta === nextIdx.cta) return children
	const s = stylesOf(next)
	const brand = prevIdx.brand >= 0 ? children[prevIdx.brand] : undefined
	const cta = prevIdx.cta >= 0 ? children[prevIdx.cta] : undefined
	const links = children.slice(prevIdx.links)
	const out: CanvasNode[] = []
	if (nextIdx.brand >= 0) out.push(brand ?? textNode(next.brand ?? '', s.brand))
	if (nextIdx.cta >= 0) out.push(cta ?? buttonNode(next.ctaLabel ?? '', s.cta, next.ctaHref ?? ''))
	return [...out, ...links]
}
