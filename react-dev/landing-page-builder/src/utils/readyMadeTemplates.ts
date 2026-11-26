import { ButtonEnterpriseNode, CanvasNode, CardsTemplateNode, EventWidgetsGroupTemplateNode, FaqNode, FooterTemplateNode, HERO_CHILD_SLOTS, HeroTemplateNode, HeroUiType, LayoutNode, LayoutTemplateNode, NavBarTemplateNode, PersonalCardTemplateNode, PricingToggleNode, ProgressBarNode, TableEnterpriseNode, TimelineNode } from "@/types/node.type";
import { generateNewNode } from "@/utils/canvas.utils";
import { textNode, imageNode, buttonNode, withTextContent, withFontFamily } from "@/utils/nodeBuilders";
import { buildFaqChildren } from "@/utils/faqSlots";
import { buildTimelineChildren } from "@/utils/timelineSlots";
import { buildLayoutChildren } from "@/utils/layoutSlots";
import { buildCardsChildren } from "@/utils/cardsSlots";
import { buildPersonalCardChildren } from "@/utils/personalCardSlots";
import { buildEventWidgetsChildren } from "@/utils/eventWidgetsSlots";
import { buildFooterChildren } from "@/utils/footerSlots";
import { buildNavBarChildren } from "@/utils/navBarSlots";
import { buildPricingToggleChildren } from "@/utils/pricingToggleSlots";
import { buildProgressBarChildren } from "@/utils/progressBarSlots";
import { buildButtonEnterpriseChildren } from "@/utils/buttonEnterpriseSlots";

/**
 * Ready Made Templates insert a section wrapping one ready-made content type,
 * plus an editable heading text node. `heroTemplate` also seeds a real
 * `children` tree (buildHeroChildren) so its content is focusable nodes.
 */
function section(style: React.CSSProperties, children: CanvasNode[]): LayoutNode {
	return {
		...(generateNewNode("section") as LayoutNode),
		style,
		children,
	};
}

function headingNode(text: string): CanvasNode {
	return generateNewNode("text", {
		style: { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "2.25em", fontWeight: "700", letterSpacing: "-0.01em", lineHeight: "1.15", textAlign: "center" },
		children: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":"center"},"content":[{"type":"text","marks":[{"type":"textStyle","attrs":{"color":"","fontFamily":"Georgia, 'Times New Roman', serif","fontSize":"1em"}}],"text":"${text}"}]}]}`,
	});
}

const sectionStyle: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "1em",
	width: "100%",
	height: "fit-content",
	minHeight: "8em",
	padding: "2em 1.5em",
	backgroundColor: "#ffffff",
}

// ---------------------------------------------------------------------------
// Hero child slots
// ---------------------------------------------------------------------------

/** Display and body families the Hero slots use; the text marks carry the same value (see withFontFamily). */
export const HERO_SERIF = "Georgia, 'Times New Roman', serif"
export const HERO_SANS = 'Arial, sans-serif'

/** Per-uiType styling for the Hero's slots. Slot nodes carry their own style,
 * so switching uiType re-applies the matching entry here. `cta` is a function
 * because it needs the node's accentColor. */
export const HERO_SLOT_STYLES: Record<HeroUiType, {
	heading: React.CSSProperties
	subheading: React.CSSProperties
	cta: (accentColor: string) => React.CSSProperties
}> = {
	// Gala invitation: cream paper, serif, a pill CTA.
	centeredClassic: {
		heading: { fontFamily: HERO_SERIF, fontSize: '46px', fontWeight: '700', lineHeight: '1.12', color: '#2b1b3d', textAlign: 'center', letterSpacing: '-0.01em' },
		subheading: { fontFamily: HERO_SERIF, fontSize: '18px', fontWeight: '400', fontStyle: 'italic', lineHeight: '1.5', color: '#6b5b73', textAlign: 'center' },
		cta: (accent) => ({ backgroundColor: accent, color: '#ffffff', borderRadius: '999px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700', boxShadow: `0 14px 26px -12px ${accent}` }),
	},
	// Editorial split: arched photo, left-aligned serif.
	splitImage: {
		heading: { fontFamily: HERO_SERIF, fontSize: '44px', fontWeight: '700', lineHeight: '1.1', color: '#1c1917', textAlign: 'left', letterSpacing: '-0.01em' },
		subheading: { fontFamily: HERO_SANS, fontSize: '16px', fontWeight: '400', lineHeight: '1.6', color: '#57534e', textAlign: 'left' },
		cta: (accent) => ({ backgroundColor: accent, color: '#ffffff', borderRadius: '0', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '700' }),
	},
	// Festival burst: full gradient, huge sans type, a ticker strip.
	gradientBold: {
		heading: { fontFamily: HERO_SANS, fontSize: '58px', fontWeight: '900', lineHeight: '1.02', color: '#ffffff', textAlign: 'left', letterSpacing: '-0.03em' },
		subheading: { fontFamily: HERO_SANS, fontSize: '18px', fontWeight: '500', lineHeight: '1.5', color: 'rgba(255,255,255,0.88)', textAlign: 'left' },
		cta: (accent) => ({ backgroundColor: '#ffffff', color: accent, borderRadius: '999px', fontWeight: '800', letterSpacing: '0.04em' }),
	},
	// Swiss poster: oversized grotesque on off-white.
	minimalLeft: {
		heading: { fontFamily: HERO_SANS, fontSize: '56px', fontWeight: '800', lineHeight: '1.02', color: '#0f0f10', textAlign: 'left', letterSpacing: '-0.035em' },
		subheading: { fontFamily: HERO_SANS, fontSize: '16px', fontWeight: '400', lineHeight: '1.6', color: '#52525b', textAlign: 'left' },
		cta: () => ({ backgroundColor: 'transparent', color: '#0f0f10', borderRadius: '0', borderBottom: '2px solid #0f0f10', height: 'auto', paddingLeft: '0', paddingRight: '0', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '700' }),
	},
	// Cinematic billboard: full-bleed photo, serif at the base.
	darkOverlay: {
		heading: { fontFamily: HERO_SERIF, fontSize: '50px', fontWeight: '700', lineHeight: '1.08', color: '#ffffff', textAlign: 'left', letterSpacing: '-0.01em' },
		subheading: { fontFamily: HERO_SANS, fontSize: '12px', fontWeight: '700', lineHeight: '1.4', color: 'rgba(255,255,255,0.7)', textAlign: 'left', letterSpacing: '0.22em', textTransform: 'uppercase' },
		cta: () => ({ backgroundColor: 'transparent', color: '#ffffff', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '0', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: '700' }),
	},
	// Boarding-pass ticket: the CTA is the tear-off stub.
	stackedCta: {
		heading: { fontFamily: HERO_SERIF, fontSize: '34px', fontWeight: '700', lineHeight: '1.15', color: '#1f2937', textAlign: 'left' },
		subheading: { fontFamily: HERO_SANS, fontSize: '14px', fontWeight: '400', lineHeight: '1.55', color: '#6b7280', textAlign: 'left' },
		cta: (accent) => ({ backgroundColor: accent, color: '#ffffff', borderRadius: '0', width: '100%', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase' }),
	},
	// Photo mosaic: three crops of one photo beside the copy.
	sideBySideStats: {
		heading: { fontFamily: HERO_SERIF, fontSize: '42px', fontWeight: '700', lineHeight: '1.12', color: '#111827', textAlign: 'left', letterSpacing: '-0.01em' },
		subheading: { fontFamily: HERO_SANS, fontSize: '16px', fontWeight: '400', lineHeight: '1.6', color: '#4b5563', textAlign: 'left' },
		cta: (accent) => ({ backgroundColor: accent, color: '#ffffff', borderRadius: '0.75em', fontWeight: '700' }),
	},
	// Aurora stage: dark navy, northern-light glow, a lit arch for the photo.
	glowScreenshot: {
		heading: { fontFamily: HERO_SANS, fontSize: '48px', fontWeight: '800', lineHeight: '1.06', color: '#ffffff', textAlign: 'center', letterSpacing: '-0.025em' },
		subheading: { fontFamily: HERO_SANS, fontSize: '17px', fontWeight: '400', lineHeight: '1.55', color: 'rgba(255,255,255,0.72)', textAlign: 'center' },
		cta: (accent) => ({ backgroundColor: accent, color: '#ffffff', borderRadius: '999px', fontWeight: '700', boxShadow: `0 0 32px -4px ${accent}` }),
	},
	// Neon night: spotlight beams over a faint grid.
	darkBlurBackdrop: {
		heading: { fontFamily: HERO_SANS, fontSize: '54px', fontWeight: '900', lineHeight: '1.02', color: '#ffffff', textAlign: 'left', letterSpacing: '-0.03em', textTransform: 'uppercase' },
		subheading: { fontFamily: HERO_SANS, fontSize: '15px', fontWeight: '400', lineHeight: '1.55', color: 'rgba(255,255,255,0.7)', textAlign: 'left' },
		cta: () => ({ backgroundColor: '#ffffff', color: '#0a0a0d', border: '1px solid #ffffff', borderRadius: '0', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase' }),
	},
	// Evergreen editorial: deep green, italic serif, lime glow.
	cinematicBlob: {
		heading: { fontFamily: HERO_SERIF, fontSize: '52px', fontWeight: '700', lineHeight: '1.05', color: '#f4f4e6', textAlign: 'left', letterSpacing: '-0.015em' },
		subheading: { fontFamily: HERO_SANS, fontSize: '12px', fontWeight: '700', lineHeight: '1.4', color: 'rgba(255,255,255,0.85)', textAlign: 'left', letterSpacing: '0.2em', textTransform: 'uppercase' },
		cta: () => ({ backgroundColor: 'transparent', color: '#f4f4e6', borderRadius: '0', borderBottom: '1px solid rgba(244,244,230,0.5)', height: 'auto', paddingLeft: '0', paddingRight: '0', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '700' }),
	},
	// Warm community: cream, a soft blob portrait, friendly serif.
	photoBadges: {
		heading: { fontFamily: HERO_SERIF, fontSize: '42px', fontWeight: '700', lineHeight: '1.12', color: '#3b2314', textAlign: 'left' },
		subheading: { fontFamily: HERO_SANS, fontSize: '16px', fontWeight: '400', lineHeight: '1.6', color: '#78604f', textAlign: 'left' },
		cta: (accent) => ({ backgroundColor: accent, color: '#ffffff', borderRadius: '999px', fontWeight: '700', boxShadow: `0 12px 22px -10px ${accent}` }),
	},
	// Eclipse: a glowing photo orb ringed in orbits.
	darkImageOrb: {
		heading: { fontFamily: HERO_SERIF, fontSize: '44px', fontWeight: '700', lineHeight: '1.1', color: '#ffffff', textAlign: 'center', letterSpacing: '-0.01em' },
		subheading: { fontFamily: HERO_SANS, fontSize: '16px', fontWeight: '400', lineHeight: '1.6', color: 'rgba(255,255,255,0.68)', textAlign: 'center' },
		cta: (accent) => ({ backgroundColor: accent, color: '#ffffff', borderRadius: '999px', fontWeight: '700', boxShadow: `0 0 28px -4px ${accent}` }),
	},
	// Festival poster: huge uppercase type, a diagonal colour band and a tape strip.
	diagonalPhoto: {
		heading: { fontFamily: HERO_SANS, fontSize: '60px', fontWeight: '900', lineHeight: '0.98', color: '#ffffff', textAlign: 'left', letterSpacing: '-0.03em', textTransform: 'uppercase' },
		subheading: { fontFamily: HERO_SANS, fontSize: '15px', fontWeight: '500', lineHeight: '1.5', color: 'rgba(255,255,255,0.85)', textAlign: 'left' },
		cta: () => ({ backgroundColor: '#ffffff', color: '#18181b', borderRadius: '999px', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase' }),
	},
	// Attendee badge: security-paper card with a barcode and tear-off tab.
	credentialBadge: {
		heading: { fontFamily: HERO_SERIF, fontSize: '28px', fontWeight: '700', lineHeight: '1.15', color: '#1B1D22', textAlign: 'center' },
		subheading: { fontFamily: HERO_SANS, fontSize: '12px', fontWeight: '700', lineHeight: '1.4', color: '#2563eb', textAlign: 'center', letterSpacing: '0.14em', textTransform: 'uppercase' },
		cta: (accent) => ({ backgroundColor: accent, color: '#ffffff', borderRadius: '0', width: '100%', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' }),
	},
}

type HeroSeed = Pick<HeroTemplateNode, 'uiType' | 'heading' | 'subheading' | 'ctaLabel' | 'ctaHref' | 'imageUrl' | 'accentColor'>

/** Builds the Hero's slots from its flat fields, so a new Hero looks identical
 * to an old one. The image stays a field — variants paint it as a CSS
 * background, which a rendered node can't be. */
export function buildHeroChildren(node: HeroSeed): CanvasNode[] {
	const slots = HERO_SLOT_STYLES[node.uiType] ?? HERO_SLOT_STYLES.centeredClassic
	const align = (slots.heading.textAlign === 'center' ? 'center' : 'left') as 'center' | 'left'
	return [
		{ ...textNode(node.heading, slots.heading, align), responsiveStyle: headingResponsive(slots.heading) } as CanvasNode,
		textNode(node.subheading, slots.subheading, align),
		buttonNode(node.ctaLabel, slots.cta(node.accentColor), node.ctaHref),
	]
}

/** Writes a slot's copy into the child tree so the panel's Heading /
 * Subheading / CTA Label fields keep working. */
export function setHeroSlotText(children: CanvasNode[], slot: (typeof HERO_CHILD_SLOTS)[number], text: string): CanvasNode[] {
	const index = HERO_CHILD_SLOTS.indexOf(slot)
	if (index < 0) return children
	return children.map((child, i) => {
		if (i !== index) return child
		// The CTA is a button, whose `children` is just the plain label.
		if (child?.contentType === 'button') return { ...child, children: text } as CanvasNode
		return withTextContent(child, text)
	})
}

/** Re-skins an existing child tree for a new uiType/accent, so a variant swap
 * can't strand dark text on a dark background. Keeps the user's edits. */
export function restyleHeroChildren(children: CanvasNode[], uiType: HeroUiType, accentColor: string): CanvasNode[] {
	const slots = HERO_SLOT_STYLES[uiType] ?? HERO_SLOT_STYLES.centeredClassic
	const perSlot: (React.CSSProperties | undefined)[] = [slots.heading, slots.subheading, slots.cta(accentColor), undefined]
	return children.map((child, index) => {
		const patch = perSlot[index]
		if (!patch) return child
		// Keys only some variants set are cleared first, so they don't leak into the next variant.
		const cleared = Object.fromEntries(HERO_VARIANT_KEYS.map((key) => [key, undefined]))
		const next = { ...child, style: { ...child.style, ...cleared, ...patch }, ...(index === 0 ? { responsiveStyle: headingResponsive(patch) } : {}) } as CanvasNode
		return typeof patch.fontFamily === 'string' ? withFontFamily(next, patch.fontFamily) : next
	})
}

/** A big headline steps down on tablet and phone, so long words fit narrow screens. */
function headingResponsive(heading: React.CSSProperties): { tablet?: React.CSSProperties; mobile?: React.CSSProperties } | undefined {
	const size = parseFloat(String(heading.fontSize ?? ''))
	if (!size || size <= 34) return undefined
	return { tablet: { fontSize: `${Math.round(size * 0.85)}px` }, mobile: { fontSize: `${Math.max(28, Math.round(size * 0.62))}px` } }
}

/** Repaints only the CTA when the accent colour changes, so the user's heading and subheading styling stays. */
export function recolorHeroCta(children: CanvasNode[], uiType: HeroUiType, accentColor: string): CanvasNode[] {
	const slots = HERO_SLOT_STYLES[uiType] ?? HERO_SLOT_STYLES.centeredClassic
	return children.map((child, index) => (index === 2 ? { ...child, style: { ...child.style, ...slots.cta(accentColor) } } as CanvasNode : child))
}

const HERO_VARIANT_KEYS = ['fontStyle', 'textTransform', 'letterSpacing', 'lineHeight', 'boxShadow', 'border', 'borderBottom', 'width', 'height', 'paddingLeft', 'paddingRight'] as const

export function generateFaqTemplate(): CanvasNode[] {
	// Seeds the FAQ's question/answer copy as a real child tree, same as the
	// Hero above — see buildFaqChildren in @/utils/faqSlots.
	const faq = generateNewNode("faq") as FaqNode
	return [headingNode("Frequently Asked Questions"), { ...faq, children: buildFaqChildren(faq) }]
}

export function generateTimelineTemplate(): CanvasNode[] {
	// Seeds the step titles/descriptions as real child nodes, same as the Hero.
	const timeline = generateNewNode("timeline") as TimelineNode
	return [headingNode("How It Works"), { ...timeline, children: buildTimelineChildren(timeline) }]
}

export function generatePricingToggleTemplate(): CanvasNode[] {
	// Seeds the plan name as a real node — see buildPricingToggleChildren.
	const pricing = generateNewNode("pricingToggle") as PricingToggleNode
	return [headingNode("Simple, Transparent Pricing"), { ...pricing, children: buildPricingToggleChildren(pricing) }]
}

export function generateCardsTemplate(): CanvasNode[] {
	// Seeds the heading and each card as real nodes — see buildCardsChildren.
	const cards = generateNewNode("cardsTemplate") as CardsTemplateNode
	return [{ ...cards, children: buildCardsChildren(cards) }]
}

export function generateNavBarTemplate(): CanvasNode[] {
	// Seeds the brand, CTA and each link as real nodes — see buildNavBarChildren.
	const navBar = generateNewNode("navBarTemplate") as NavBarTemplateNode
	return [{ ...navBar, children: buildNavBarChildren(navBar) }]
}

export function generateEventWidgetsGroupTemplate(): CanvasNode[] {
	// Seeds the heading and both CTAs as real nodes — see buildEventWidgetsChildren.
	const widgets = generateNewNode("eventWidgetsGroupTemplate") as EventWidgetsGroupTemplateNode
	return [headingNode("Event Details"), { ...widgets, children: buildEventWidgetsChildren(widgets) }]
}

export function generateHeroTemplate(): CanvasNode[] {
	const hero = generateNewNode("heroTemplate") as HeroTemplateNode
	return [{ ...hero, children: buildHeroChildren(hero) }]
}

export function generateFooterTemplate(): CanvasNode[] {
	// Seeds brand/tagline/copyright and each column block as real nodes.
	const footer = generateNewNode("footerTemplate") as FooterTemplateNode
	return [{ ...footer, children: buildFooterChildren(footer) }]
}

export function generatePersonalCardTemplate(): CanvasNode[] {
	// Seeds name/role/bio and each social link as real nodes.
	const card = generateNewNode("personalCardTemplate") as PersonalCardTemplateNode
	return [headingNode("Meet the Team"), { ...card, children: buildPersonalCardChildren(card) }]
}

export function generateLayoutTemplate(): CanvasNode[] {
	// Seeds the heading and each column's title/description as real child nodes.
	const layout = generateNewNode("layoutTemplate") as LayoutTemplateNode
	return [{ ...layout, children: buildLayoutChildren(layout) }]
}

export function generateTableEnterpriseTemplate(): CanvasNode[] {
	const tableNode = generateNewNode("tableEnterprise") as TableEnterpriseNode
	const cell = (type: 'tableHeader' | 'tableCell', text: string) => ({ type, attrs: { colspan: 1, rowspan: 1, colwidth: null }, content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] })
	const row = (type: 'tableHeader' | 'tableCell', cells: string[]) => ({ type: 'tableRow', content: cells.map((text) => cell(type, text)) })
	tableNode.children = {
		type: 'doc',
		content: [{
			type: 'table',
			content: [
				row('tableHeader', ['Session', 'Time', 'Hall']),
				row('tableCell', ['Opening keynote', '09:00', 'Main Hall']),
				row('tableCell', ['Judges panel', '11:30', 'Hall B']),
				row('tableCell', ['Awards night', '19:00', 'Grand Ballroom']),
			],
		}],
	}
	// A soft violet head and quiet borders, instead of the default heavy grey.
	tableNode.tableHeadStyle = { ...tableNode.tableHeadStyle, backgroundColor: '#ede9fe', borderColor: '#ddd6fe' }
	tableNode.tableBodyStyle = { ...tableNode.tableBodyStyle, borderColor: '#e4e4ee' }
	return [headingNode("Event Schedule"), tableNode]
}

export function generateProgressBarTemplate(): CanvasNode[] {
	// Seeds the label as a real node — see buildProgressBarChildren.
	const bar = generateNewNode("progressBar") as ProgressBarNode
	const seeded = {
		...bar,
		label: "Early-bird tickets claimed",
		color: "#7c3aed",
		trackColor: "#e9e4f5",
		barHeight: 14,
		labelStyle: { ...bar.labelStyle, fontSize: "13px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase" as const },
		percentageStyle: { ...bar.percentageStyle, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "28px", fontWeight: "700" },
	}
	return [headingNode("Tickets Are Going Fast"), { ...seeded, children: buildProgressBarChildren(seeded) }]
}

export function generateButtonEnterpriseTemplate(): CanvasNode[] {
	// Seeds label/subLabel as real nodes — see buildButtonEnterpriseChildren.
	const button = { ...(generateNewNode("buttonEnterprise") as ButtonEnterpriseNode), label: "Reserve your seat", subLabel: "Early-bird pricing ends soon", color: "#5b21b6", textColor: "#ffffff" }
	return [{ ...button, children: buildButtonEnterpriseChildren(button) }]
}
