import type { CanvasNode, LayoutColumn, LayoutTemplateNode, LayoutUiType } from "@/types/node.type";
import { blockNode, imageNode, textNode, withTextContent, applyTextStyle } from "@/utils/nodeBuilders";
const SERIF = "Georgia, 'Times New Roman', serif"


// A layout's children are [heading, column0, column1, ...]. Each column is a
// block node holding [image?, titleTextNode, descriptionTextNode].

/** Per-uiType styling for the heading, each column's own block node and the
 * text/image inside it. */
export const LAYOUT_SLOT_STYLES: Record<LayoutUiType, {
	heading: React.CSSProperties
	column: React.CSSProperties
	title: React.CSSProperties
	description: React.CSSProperties
	image?: React.CSSProperties
}> = {
	twoColumnTextImage: {
		heading: { fontFamily: SERIF, fontSize: '34px', fontWeight: '700', color: '#1a1a1a' },
		column: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5em', flex: '1 1 260px', minWidth: '220px' },
		title: { fontFamily: SERIF, fontSize: '21px', fontWeight: '700', color: '#1a1a1a' },
		description: { fontSize: '15px', lineHeight: '1.6', fontWeight: '400', color: '#5a5a5a' },
	},
	// Centered columns under a centered heading.
	threeColumnEven: {
		heading: { fontFamily: SERIF, fontSize: '34px', fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
		column: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.6em', minWidth: 0, padding: '1.5em', borderRadius: '16px', backgroundColor: '#ffffff', boxShadow: '0 20px 36px -24px rgba(60,40,120,0.45)', border: '1px solid #ece9f5' },
		title: { fontFamily: SERIF, fontSize: '19px', fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
		description: { fontSize: '14px', lineHeight: '1.6', fontWeight: '400', color: '#5a5a5a', textAlign: 'center' },
		image: { width: '100%', height: '6rem', objectFit: 'cover', borderRadius: '8px' },
	},
	imageLeftText: {
		heading: { fontFamily: SERIF, fontSize: '34px', fontWeight: '700', color: '#1a1a1a' },
		column: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25em', flex: '1 1 200px', minWidth: '180px' },
		title: { fontFamily: SERIF, fontSize: '19px', fontWeight: '700', color: '#1a1a1a' },
		description: { fontSize: '14px', lineHeight: '1.6', fontWeight: '400', color: '#5a5a5a' },
	},
	stackedCentered: {
		heading: { fontFamily: SERIF, fontSize: '34px', fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
		column: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.6em', width: '100%', padding: '1.75em', borderRadius: '18px', backgroundColor: '#ffffff', boxShadow: '0 22px 40px -26px rgba(60,40,120,0.45)' },
		title: { fontFamily: SERIF, fontSize: '19px', fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
		description: { fontSize: '14px', lineHeight: '1.6', fontWeight: '400', color: '#5a5a5a', textAlign: 'center' },
		image: { width: '96px', height: '96px', objectFit: 'cover', borderRadius: '50%' },
	},
	// The heading is a small uppercase eyebrow above the sidebar list.
	sidebarContent: {
		heading: { fontSize: '13px', fontWeight: '600', color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '0.5px' },
		column: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75em', minWidth: 0 },
		title: { fontFamily: SERIF, fontSize: '21px', fontWeight: '700', color: '#1a1a1a' },
		description: { fontSize: '15px', lineHeight: '1.6', fontWeight: '400', color: '#5a5a5a' },
	},
	gridFour: {
		heading: { fontFamily: SERIF, fontSize: '34px', fontWeight: '700', color: '#1a1a1a' },
		column: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5em', minWidth: 0 },
		title: { fontFamily: SERIF, fontSize: '17px', fontWeight: '700', color: '#1a1a1a' },
		description: { fontSize: '13px', lineHeight: '1.6', fontWeight: '400', color: '#5a5a5a' },
	},
	alternatingRows: {
		heading: { fontFamily: SERIF, fontSize: '34px', fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
		column: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5em', flex: '1 1 240px', minWidth: '200px' },
		title: { fontFamily: SERIF, fontSize: '20px', fontWeight: '700', color: '#1a1a1a' },
		description: { fontSize: '15px', lineHeight: '1.6', fontWeight: '400', color: '#5a5a5a' },
	},
	// Dark gradient banner — every slot needs light text.
	fullWidthBanner: {
		heading: { fontFamily: SERIF, fontSize: '34px', fontWeight: '700', color: '#ffffff' },
		column: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35em', flex: '1 1 200px', minWidth: '180px', padding: '1.25em', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)' },
		title: { fontFamily: SERIF, fontSize: '18px', fontWeight: '700', color: '#ffffff' },
		description: { fontSize: '14px', lineHeight: '1.6', fontWeight: '400', color: 'rgba(255,255,255,0.8)' },
		image: { width: '2.5rem', height: '2.5rem', objectFit: 'cover', borderRadius: '999px' },
	},
}

/** Variants that paint the column image as a CSS background (or inside their
 * own decorative tile), so it can't be a node — it stays `column.imageUrl`. */
export const LAYOUT_UI_TYPES_WITH_BACKGROUND_IMAGE = new Set<LayoutUiType>([
	'twoColumnTextImage', 'imageLeftText', 'sidebarContent', 'gridFour', 'alternatingRows',
])

function stylesFor(uiType: LayoutUiType) {
	return LAYOUT_SLOT_STYLES[uiType] ?? LAYOUT_SLOT_STYLES.twoColumnTextImage
}

function alignOf(style: React.CSSProperties): 'left' | 'center' {
	return style.textAlign === 'center' ? 'center' : 'left'
}

/** A child's own child nodes, or [] when it isn't a block (legacy flat tree). */
function kidsOf(node: CanvasNode | undefined): CanvasNode[] {
	const kids = (node as { children?: unknown } | undefined)?.children
	return Array.isArray(kids) ? (kids as CanvasNode[]) : []
}

/** One column as a block node holding [image?, title, description]. */
export function buildLayoutColumnBlock(column: LayoutColumn, uiType: LayoutUiType): CanvasNode {
	const s = stylesFor(uiType)
	const kids: CanvasNode[] = []
	if (column.imageUrl && s.image && !LAYOUT_UI_TYPES_WITH_BACKGROUND_IMAGE.has(uiType)) {
		kids.push(imageNode(column.imageUrl, s.image, column.title))
	}
	kids.push(textNode(column.title ?? '', s.title, alignOf(s.title)))
	kids.push(textNode(column.description ?? '', s.description, alignOf(s.description)))
	const block = blockNode(kids, s.column)
	return { ...block, name: column.title || 'Column' } as CanvasNode
}

/** [heading, column0, column1, ...] — each column a real block node. */
export function buildLayoutChildren(node: Pick<LayoutTemplateNode, 'uiType' | 'heading' | 'columns'>): CanvasNode[] {
	const s = stylesFor(node.uiType)
	return [
		textNode(node.heading ?? '', s.heading, alignOf(s.heading)),
		...(node.columns ?? []).map((column) => buildLayoutColumnBlock(column, node.uiType)),
	]
}

/** Re-skins the heading, each column block and its contents for a new uiType. */
const LAYOUT_CHROME_KEYS = ['border', 'borderTop', 'borderLeft', 'borderRadius', 'boxShadow', 'backgroundColor', 'padding', 'paddingLeft', 'alignItems', 'textAlign'] as const

export function restyleLayoutChildren(children: CanvasNode[], uiType: LayoutUiType): CanvasNode[] {
	const s = stylesFor(uiType)
	return children.map((child, index) => {
		if (index === 0) return applyTextStyle(child, s.heading)
		const kids = kidsOf(child)
		if (!kids.length) return child
		const firstTextId = kids.filter((k) => k?.contentType === 'text')[0]?.id
		const nextKids = kids.map((k) => {
			if (k?.contentType === 'image') return s.image ? ({ ...k, style: { ...k.style, ...s.image } } as CanvasNode) : k
			const isTitle = k?.id === firstTextId
			return applyTextStyle(k, isTitle ? s.title : s.description)
		})
		const cleared = Object.fromEntries(LAYOUT_CHROME_KEYS.map((key) => [key, undefined]))
		return { ...child, style: { ...child.style, ...cleared, ...s.column }, children: nextKids } as CanvasNode
	})
}

/** Writes the heading, or a column's title/description, into the child tree. */
export function setLayoutSlotText(
	children: CanvasNode[],
	target: 'heading' | { column: number; field: 'title' | 'description' },
	text: string,
): CanvasNode[] {
	if (target === 'heading') {
		if (!children.length) return children
		return [withTextContent(children[0], text), ...children.slice(1)]
	}
	const at = target.column + 1
	if (at < 1 || at >= children.length) return children
	return children.map((child, i) => {
		if (i !== at) return child
		const kids = kidsOf(child)
		const texts = kids.filter((k) => k?.contentType === 'text')
		const wanted = target.field === 'title' ? texts[0] : texts[1]
		if (!wanted) return child
		return { ...child, children: kids.map((k) => (k?.id === wanted.id ? withTextContent(k, text) : k)) } as CanvasNode
	})
}
