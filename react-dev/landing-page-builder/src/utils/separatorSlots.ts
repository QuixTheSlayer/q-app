import { CanvasNode, SeparatorsNode } from "@/types/node.type";
import { textNode, withTextContent } from "@/utils/nodeBuilders";

/** A separator has one slot: its label at children[0]. */
export function buildSeparatorChildren(node: Pick<SeparatorsNode, "label" | "labelSize" | "labelColor" | "labelWeight" | "labelFont">): CanvasNode[] {
	return [textNode(node.label ?? "", {
		fontSize: node.labelSize ? `${node.labelSize}px` : undefined,
		color: node.labelColor || undefined,
		fontWeight: node.labelWeight || undefined,
		fontFamily: node.labelFont,
	})]
}

export function setSeparatorLabel(children: CanvasNode[], text: string): CanvasNode[] {
	if (!children.length) return children
	return [withTextContent(children[0], text), ...children.slice(1)]
}
