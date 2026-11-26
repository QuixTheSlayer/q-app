import { CanvasNode, FooterColumn, FooterLink, FooterTemplateNode, FooterUiType } from "@/types/node.type";
import { textNode, buttonNode, blockNode, withTextContent, withFontFamily } from "@/utils/nodeBuilders";

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = 'Arial, sans-serif'

/** Per-uiType styling. `column` is the block's own container style — the
 * column chrome, restylable now that each column is a real node. */
export const FOOTER_SLOT_STYLES: Record<FooterUiType, {
	brand: React.CSSProperties
	tagline: React.CSSProperties
	copyright: React.CSSProperties
	column: React.CSSProperties
	columnTitle: React.CSSProperties
	link: React.CSSProperties
}> = {
	classicColumns: {
		brand: { fontFamily: SERIF, fontSize: '24px', fontWeight: '700', color: '#1a1a1a' },
		tagline: { fontSize: '14px', lineHeight: '1.6', color: '#6b6b6b' },
		copyright: { fontSize: '12px', color: '#8a8a8a' },
		column: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.6em', padding: '0em', minWidth: 0, minHeight: 0, height: 'auto' },
		columnTitle: { fontSize: '12px', fontWeight: '700', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.16em' },
		link: { fontSize: '13px', color: '#6b6b6b' },
	},
	centeredMinimal: {
		brand: { fontFamily: SERIF, fontSize: '26px', fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
		tagline: { fontSize: '13px', color: '#6b6b6b', textAlign: 'center' },
		copyright: { fontSize: '12px', color: '#8a8a8a', textAlign: 'center' },
		column: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1em', padding: '0em', minHeight: 0, height: 'auto' },
		columnTitle: { fontSize: '13px', fontWeight: '700', color: '#1a1a1a' },
		link: { fontSize: '13px', color: '#4a4a4a' },
	},
	darkMega: {
		brand: { fontFamily: SERIF, fontSize: '26px', fontWeight: '700', color: '#ffffff' },
		tagline: { fontSize: '13px', color: '#9aa3b5' },
		copyright: { fontSize: '12px', color: '#6b7488' },
		column: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5em', padding: '0em', minWidth: 0, minHeight: 0, height: 'auto' },
		columnTitle: { fontSize: '12px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.18em' },
		link: { fontSize: '13px', color: '#9aa3b5' },
	},
	ctaBanner: {
		brand: { fontSize: '17px', fontWeight: '700', color: '#ffffff' },
		tagline: { fontSize: '13px', color: '#e6ebff' },
		copyright: { fontSize: '12px', color: '#8a8a8a' },
		column: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5em', padding: '0em', minWidth: 0, minHeight: 0, height: 'auto' },
		columnTitle: { fontSize: '12px', fontWeight: '700', color: '#1a1a1a' },
		link: { fontSize: '13px', color: '#6b6b6b' },
	},
	socialFocus: {
		brand: { fontFamily: SERIF, fontSize: '24px', fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
		tagline: { fontSize: '13px', color: '#6b6b6b', textAlign: 'center' },
		copyright: { fontSize: '12px', color: '#8a8a8a', textAlign: 'center' },
		column: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.75em', padding: '0em', minHeight: 0, height: 'auto' },
		columnTitle: { fontSize: '12px', fontWeight: '700', color: '#1a1a1a' },
		link: { fontSize: '12px', color: '#8a8a8a' },
	},
	twoColumnSplit: {
		brand: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a' },
		tagline: { fontSize: '13px', color: '#6b6b6b' },
		copyright: { fontSize: '12px', color: '#8a8a8a' },
		column: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5em', padding: '0em', minWidth: 0, minHeight: 0, height: 'auto' },
		columnTitle: { fontSize: '12px', fontWeight: '700', color: '#1a1a1a' },
		link: { fontSize: '13px', color: '#6b6b6b' },
	},
	compactBar: {
		brand: { fontSize: '13px', fontWeight: '700', color: '#1a1a1a' },
		tagline: { fontSize: '13px', color: '#6b6b6b' },
		copyright: { fontSize: '12px', color: '#8a8a8a' },
		column: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: '0.75em', padding: '0em', minHeight: 0, height: 'auto' },
		columnTitle: { fontSize: '12px', fontWeight: '700', color: '#1a1a1a' },
		link: { fontSize: '12px', color: '#6b6b6b' },
	},
	brandSidebar: {
		brand: { fontFamily: SERIF, fontSize: '22px', fontWeight: '700', color: '#1a1a1a' },
		tagline: { fontSize: '13px', color: '#6b6b6b' },
		copyright: { fontSize: '12px', color: '#8a8a8a' },
		column: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.375em', padding: '0em', flex: '1 1 130px', minWidth: '120px', minHeight: 0, height: 'auto' },
		columnTitle: { fontSize: '12px', fontWeight: '700', color: '#1a1a1a' },
		link: { fontSize: '13px', color: '#6b6b6b' },
	},
}

/** Link buttons are styled flat so they read as the plain anchors the
 * variants used to render. */
function linkStyle(uiType: FooterUiType): React.CSSProperties {
	const s = FOOTER_SLOT_STYLES[uiType] ?? FOOTER_SLOT_STYLES.classicColumns
	return { ...s.link, backgroundColor: 'transparent', borderRadius: '0', height: 'auto', paddingLeft: '0', paddingRight: '0', fontWeight: '400', justifyContent: 'flex-start' }
}

/** One link node, for the panel's "add link" action. */
export function buildFooterLinkButton(link: FooterLink, uiType: FooterUiType): CanvasNode {
	return buttonNode(link.label ?? '', linkStyle(uiType), link.href ?? '')
}

/** A column block: [title, link0, link1, ...]. */
export function buildFooterColumnBlock(column: FooterColumn, uiType: FooterUiType, index: number): CanvasNode {
	const s = FOOTER_SLOT_STYLES[uiType] ?? FOOTER_SLOT_STYLES.classicColumns
	const kids: CanvasNode[] = [
		textNode(column.title ?? '', s.columnTitle),
		...(column.links ?? []).map((link) => buildFooterLinkButton(link, uiType)),
	]
	return { ...blockNode(kids, s.column), name: column.title || `Column ${index + 1}` } as CanvasNode
}

/** [brand, tagline, copyright, column0, column1, ...]. */
export function buildFooterChildren(node: Pick<FooterTemplateNode, 'uiType' | 'brand' | 'tagline' | 'copyrightText' | 'columns'>): CanvasNode[] {
	const s = FOOTER_SLOT_STYLES[node.uiType] ?? FOOTER_SLOT_STYLES.classicColumns
	return [
		textNode(node.brand ?? '', s.brand),
		textNode(node.tagline ?? '', s.tagline),
		textNode(node.copyrightText ?? '', s.copyright),
		...(node.columns ?? []).map((column, i) => buildFooterColumnBlock(column, node.uiType, i)),
	]
}

/** First three slots are brand/tagline/copyright; columns follow. */
export const FOOTER_COLUMNS_OFFSET = 3

const FOOTER_VARIANT_KEYS = ['textAlign', 'lineHeight'] as const

/** Re-skins the text slots, each column block and its title/links. */
export function restyleFooterChildren(children: CanvasNode[], uiType: FooterUiType): CanvasNode[] {
	const s = FOOTER_SLOT_STYLES[uiType] ?? FOOTER_SLOT_STYLES.classicColumns
	const top = [s.brand, s.tagline, s.copyright]
	return children.map((child, i) => {
		if (i < FOOTER_COLUMNS_OFFSET) {
			// Keys only some layouts set are cleared first, so they don't leak into the next layout.
			const cleared = Object.fromEntries(FOOTER_VARIANT_KEYS.map((key) => [key, undefined]))
			const next = { ...child, style: { ...child.style, ...cleared, ...top[i] } } as CanvasNode
			return i === 0 ? withFontFamily(next, typeof top[0].fontFamily === 'string' ? top[0].fontFamily : SANS) : next
		}
		const kids = ((child as { children?: CanvasNode[] }).children ?? [])
		const nextKids = kids.map((k) => (
			k?.contentType === 'button'
				? { ...k, style: { ...k.style, ...linkStyle(uiType) } } as CanvasNode
				: { ...k, style: { ...k.style, ...s.columnTitle } } as CanvasNode
		))
		return { ...child, style: { ...child.style, ...s.column }, children: nextKids } as CanvasNode
	})
}

type FooterTextTarget = 'brand' | 'tagline' | 'copyright' | { column: number; field: 'title' }

/** Writes panel edits through to the matching slot node. */
export function setFooterSlotText(children: CanvasNode[], target: FooterTextTarget, text: string): CanvasNode[] {
	if (typeof target === 'string') {
		const at = ['brand', 'tagline', 'copyright'].indexOf(target)
		if (at < 0 || at >= children.length) return children
		return children.map((child, i) => (i === at ? withTextContent(child, text) : child))
	}
	const at = target.column + FOOTER_COLUMNS_OFFSET
	if (at < FOOTER_COLUMNS_OFFSET || at >= children.length) return children
	return children.map((child, i) => {
		if (i !== at) return child
		const kids = (child as { children?: CanvasNode[] }).children ?? []
		return { ...child, children: kids.map((k, ki) => (ki === 0 ? withTextContent(k, text) : k)) } as CanvasNode
	})
}

/** Adds/removes a link node inside one column block, keeping it in sync with
 * the flat `columns` array. */
export function updateFooterColumnLinks(children: CanvasNode[], columnIndex: number, updater: (links: CanvasNode[]) => CanvasNode[]): CanvasNode[] {
	const at = columnIndex + FOOTER_COLUMNS_OFFSET
	if (at < FOOTER_COLUMNS_OFFSET || at >= children.length) return children
	return children.map((child, i) => {
		if (i !== at) return child
		const kids = (child as { children?: CanvasNode[] }).children ?? []
		return { ...child, children: [kids[0], ...updater(kids.slice(1))] } as CanvasNode
	})
}
