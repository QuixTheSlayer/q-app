import { NODE_TYPE } from "@/types/node.enum";
import { AccordionNode, CanvasNode, LayoutNode, TestimonialSliderNode } from "@/types/node.type";
import { CHILD_TREE_TYPES } from "@/utils/childTreeTypes";

export function hasChildNode(
	node: CanvasNode
): node is LayoutNode | AccordionNode | TestimonialSliderNode {
	if(!node?.type) return false;
	// Kept in sync with hasHeroChildTree in editor.utils.ts.
	const heroWithChildren = CHILD_TREE_TYPES.has(node.contentType) && Array.isArray((node as { children?: unknown }).children)
	const tabWithChildren = node.contentType === "tab" && (node as { childrenAreTabs?: boolean }).childrenAreTabs === true
	return (node?.type) === NODE_TYPE.Container || node.contentType === "accordion" || node.contentType === "testimonialSlider" || heroWithChildren || tabWithChildren;
}
