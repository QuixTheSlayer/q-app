import { CanvasNode, FooterLink, PersonalCardTemplateNode, PersonalCardUiType } from "@/types/node.type";
import { textNode, buttonNode, withTextContent, applyTextStyle } from "@/utils/nodeBuilders";
const SERIF = "Georgia, 'Times New Roman', serif"


/** Slot order of a personal card's `children` tree. */
export const PERSONAL_CARD_TEXT_SLOTS = ['name', 'role', 'bio'] as const
export type PersonalCardTextSlot = (typeof PERSONAL_CARD_TEXT_SLOTS)[number]

interface PersonalCardSlotStyles {
	name: React.CSSProperties
	role: React.CSSProperties
	bio: React.CSSProperties
	social: React.CSSProperties
}

// Variants that print only the label's first letter in a small circle can't
// do that with a real node, so their social slot is a compact pill instead.
export const PERSONAL_CARD_SLOT_STYLES: Record<PersonalCardUiType, (accent: string, accent2: string) => PersonalCardSlotStyles> = {
	classicCentered: (a, b) => ({
		name: { fontFamily: SERIF, fontSize: '24px', fontWeight: '700', textAlign: 'center', background: `linear-gradient(90deg, ${a}, ${b})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' },
		role: { fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', padding: '4px 12px', borderRadius: '999px', backgroundColor: `${a}1a`, color: a, alignSelf: 'center' },
		bio: { fontSize: '14px', color: '#6b6b76', maxWidth: '320px', textAlign: 'center' },
		social: { fontSize: '12px', fontWeight: '500', padding: '6px 14px', borderRadius: '999px', backgroundColor: '#ffffff', color: a, boxShadow: `0 4px 12px -6px ${a}59` },
	}),
	horizontalRow: (a, b) => ({
		name: { fontFamily: SERIF, fontSize: '20px', fontWeight: '700', color: '#18181b' },
		role: { fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', color: b },
		bio: { fontSize: '14px', color: '#71717a' },
		social: { fontSize: '12px', fontWeight: '700', padding: '5px 12px', borderRadius: '999px', backgroundColor: `${a}14`, color: b },
	}),
	darkGlass: (a, b) => ({
		name: { fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: '#ffffff', textAlign: 'center' },
		role: { fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: b, textAlign: 'center' },
		bio: { fontSize: '14px', color: '#d4d4d8' },
		social: { fontSize: '12px', fontWeight: '500', color: '#ffffff', padding: '6px 14px', borderRadius: '999px', background: `linear-gradient(135deg, ${a}4d, ${b}4d)`, border: '1px solid rgba(255,255,255,0.15)' },
	}),
	minimalFlat: (a) => ({
		name: { fontFamily: SERIF, fontSize: '28px', fontWeight: '700', lineHeight: '1.2', color: '#18181b' },
		role: { fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.15em', color: a },
		bio: { fontSize: '14px', color: '#52525b' },
		social: { fontSize: '12px', fontWeight: '600', color: '#18181b', borderBottom: '1px solid #18181b' },
	}),
	imageBackdrop: (_a, b) => ({
		name: { fontFamily: SERIF, fontSize: '28px', fontWeight: '700', color: '#ffffff', lineHeight: '1.2' },
		role: { fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: b },
		bio: { fontSize: '14px', color: 'rgba(255,255,255,0.75)', maxWidth: '420px' },
		social: { fontSize: '12px', fontWeight: '700', color: '#ffffff', padding: '5px 12px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.15)' },
	}),
	bordered: (a, b) => ({
		name: { fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: '#18181b', lineHeight: '1.2' },
		role: { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 10px', borderRadius: '4px', alignSelf: 'flex-start', background: `linear-gradient(135deg, ${a}22, ${b}22)`, color: b },
		bio: { fontSize: '14px', color: '#52525b' },
		social: { width: '100%', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', textAlign: 'center', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '2px', padding: '2px 4px' },
	}),
	socialFocus: (a, b) => ({
		name: { fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: '#18181b', textAlign: 'center' },
		role: { fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', color: a, textAlign: 'center' },
		bio: { fontSize: '14px', color: '#71717a', maxWidth: '300px', textAlign: 'center' },
		social: { fontSize: '12px', fontWeight: '700', color: '#ffffff', padding: '6px 12px', borderRadius: '999px', background: `linear-gradient(135deg, ${a}, ${b})`, boxShadow: `0 6px 14px -6px ${a}99` },
	}),
	compactInline: (_a, b) => ({
		name: { fontFamily: SERIF, fontSize: '18px', fontWeight: '700', color: '#ffffff' },
		role: { fontSize: '12px', color: b },
		bio: { fontSize: '12px', color: 'rgba(255,255,255,0.5)' },
		social: { fontSize: '12px', fontWeight: '600', color: b, backgroundColor: 'transparent' },
	}),
	attendeeBadge: (a) => ({
		name: { fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: '#1B1D22', textAlign: 'center', lineHeight: '1.2' },
		role: { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 10px', borderRadius: '4px', backgroundColor: a, color: '#ffffff', alignSelf: 'center' },
		bio: { fontSize: '12px', color: '#52525b', textAlign: 'center' },
		social: { fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', color: '#1B1D22', border: '1px solid #1B1D2233', borderRadius: '4px', padding: '4px 8px', backgroundColor: 'transparent' },
	}),
}

type PersonalCardSeed = Pick<PersonalCardTemplateNode, 'uiType' | 'name' | 'role' | 'bio' | 'socialLinks' | 'accentColor' | 'accentColorSecondary'>

function stylesFor(uiType: PersonalCardUiType, accent: string, accent2: string): PersonalCardSlotStyles {
	return (PERSONAL_CARD_SLOT_STYLES[uiType] ?? PERSONAL_CARD_SLOT_STYLES.classicCentered)(accent, accent2)
}

/** [name, role, bio, social0, social1, ...]. The avatar stays a plain
 * `imageUrl` field — variants paint it as a background or a shaped frame. */
export function buildPersonalCardChildren(node: PersonalCardSeed): CanvasNode[] {
	const s = stylesFor(node.uiType, node.accentColor, node.accentColorSecondary)
	return [
		textNode(node.name ?? '', s.name),
		textNode(node.role ?? '', s.role),
		textNode(node.bio ?? '', s.bio),
		...(node.socialLinks ?? []).map((link) => buildPersonalCardSocialButton(link, node.uiType, node.accentColor, node.accentColorSecondary)),
	]
}

/** One social-link button node, for the panel's "add link" action. */
export function buildPersonalCardSocialButton(link: FooterLink, uiType: PersonalCardUiType, accent: string, accent2: string): CanvasNode {
	const s = stylesFor(uiType, accent, accent2)
	return buttonNode(link.label ?? '', s.social, link.href ?? '')
}

/** Re-skins name/role/bio and every social button for a new uiType/accent. */
export function restylePersonalCardChildren(children: CanvasNode[], uiType: PersonalCardUiType, accent: string, accent2: string): CanvasNode[] {
	const s = stylesFor(uiType, accent, accent2)
	const perSlot = [s.name, s.role, s.bio]
	return children.map((child, i) => {
		const patch = i < perSlot.length ? perSlot[i] : s.social
		return applyTextStyle(child, patch)
	})
}

/** Writes the panel's Name / Role / Bio copy into the matching text node. */
export function setPersonalCardSlotText(children: CanvasNode[], slot: PersonalCardTextSlot, text: string): CanvasNode[] {
	const index = PERSONAL_CARD_TEXT_SLOTS.indexOf(slot)
	if (index < 0) return children
	return children.map((child, i) => (i === index ? withTextContent(child, text) : child))
}

/** Writes a social link's label/href into its button node. */
export function setPersonalCardSocialLink(children: CanvasNode[], index: number, patch: Partial<FooterLink>): CanvasNode[] {
	const at = PERSONAL_CARD_TEXT_SLOTS.length + index
	if (at < PERSONAL_CARD_TEXT_SLOTS.length || at >= children.length) return children
	return children.map((child, i) => {
		if (i !== at) return child
		return {
			...child,
			...(patch.label !== undefined ? { children: patch.label } : {}),
			...(patch.href !== undefined ? { attributes: { ...child.attributes, href: patch.href } } : {}),
		} as CanvasNode
	})
}

/** Drops the social button for a removed link, keeping the text slots. */
export function removePersonalCardSocialLink(children: CanvasNode[], index: number): CanvasNode[] {
	return children.filter((_, i) => i !== PERSONAL_CARD_TEXT_SLOTS.length + index)
}
