import { CanvasNode, IconBlockNode } from "@/types/node.type";
import { textNode, withTextContent } from "@/utils/nodeBuilders";

/** Title/description styling, matching what IconBlock hardcodes today. */
export const ICON_BLOCK_SLOT_STYLES = {
	title: { fontSize: "15px", fontWeight: "500" } as React.CSSProperties,
	description: { fontSize: "12.5px", fontWeight: "500", color: "#5b6259" } as React.CSSProperties,
}

/** Flat and interleaved: [t0, d0, t1, d1, ...] — item i's title is at i*2. */
export function buildIconBlockChildren(node: Pick<IconBlockNode, "items">): CanvasNode[] {
	return node.items.flatMap((item) => [
		textNode(item.title ?? "", { ...ICON_BLOCK_SLOT_STYLES.title, color: item.textColor || undefined }),
		textNode(item.description ?? "", ICON_BLOCK_SLOT_STYLES.description),
	])
}

/** Re-applies slot styling, keeping each item's own textColor. */
export function restyleIconBlockChildren(children: CanvasNode[], items: IconBlockNode["items"]): CanvasNode[] {
	return children.map((child, i) => {
		const base = i % 2 === 0 ? ICON_BLOCK_SLOT_STYLES.title : ICON_BLOCK_SLOT_STYLES.description
		const textColor = items[Math.floor(i / 2)]?.textColor
		const patch = i % 2 === 0 && textColor ? { ...base, color: textColor } : base
		return { ...child, style: { ...child.style, ...patch } } as CanvasNode
	})
}

export function setIconBlockSlotText(children: CanvasNode[], itemIndex: number, field: "title" | "description", text: string): CanvasNode[] {
	const target = itemIndex * 2 + (field === "description" ? 1 : 0)
	if (target < 0 || target >= children.length) return children
	return children.map((child, i) => (i === target ? withTextContent(child, text) : child))
}
