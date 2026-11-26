import {NODE_TYPE} from "@/types/node.enum";
import {AccordionNode, CanvasNode, LayoutNode, TabNode, TestimonialSliderNode} from "@/types/node.type";
import { CHILD_TREE_TYPES } from "@/utils/childTreeTypes";
type InsertCapableNodes = LayoutNode | AccordionNode | TabNode | TestimonialSliderNode

/**
 * Type guard to determine if a canvas node is a layout container.
 * 
 * @param {CanvasNode} node - The node to check
 * @returns {node is LayoutNode} True when node is a container layout
 */
export function isLayoutNode(node: CanvasNode): node is LayoutNode {
  return node.type === NODE_TYPE.Container;
}

/**
 * Type guard to determine if a canvas node is a tab node.
 * 
 * @param {CanvasNode} node - The node to check
 * @returns {node is TabNode} True when node content type is 'tab'
 */
export function isTabNode(node: CanvasNode): node is TabNode {
  return node.contentType === 'tab'
}

/**
 * Type guard that checks if a node can accept inserted children.
 * Supports container, accordion, and tab nodes.
 * 
 * @param {CanvasNode} node - The node to evaluate
 * @returns {node is InsertCapableNodes} True when the node supports insertion
 */
export function isAllowedToInsert(node: CanvasNode): node is InsertCapableNodes {
  return node.type === NODE_TYPE.Container || node.contentType === "accordion" || node.contentType === 'tab' || node.contentType === 'testimonialSlider' || hasHeroChildTree(node);
}

/** A heroTemplate or tab whose content has been seeded as a real child tree.
 * Legacy ones have no usable `children`, so guard on the marker. */
export function hasHeroChildTree(node: CanvasNode): boolean {
  if (CHILD_TREE_TYPES.has(node?.contentType)) return Array.isArray((node as { children?: unknown }).children)
  if (node?.contentType === 'tab') return (node as { childrenAreTabs?: boolean }).childrenAreTabs === true
  return false
}

/**
 * Type guard for nodes that have a children array.
 * 
 * @param {CanvasNode} node - The node to inspect
 * @returns {node is LayoutNode | AccordionNode} True when the node contains child nodes
 */
export function hasChildNode(
	node: CanvasNode
): node is LayoutNode | AccordionNode | TestimonialSliderNode {
	return node?.type === NODE_TYPE.Container || node?.contentType === "accordion" || node?.contentType === "testimonialSlider" || hasHeroChildTree(node);
}

/**
 * Type guard that detects advanced widget nodes.
 * Advanced widgets include accordions and tabs.
 * 
 * @param {CanvasNode} node - The node to inspect
 * @returns {node is AccordionNode | TabNode} True for advanced widget nodes
 */
export function isAdvancedWidget(node:CanvasNode): node is (AccordionNode | TabNode) {
  return node.contentType === 'accordion' || node.contentType === 'tab'
}

/**
 * Recursively flattens the canvas tree into a simple {id, label} list, used
 * anywhere a user needs to pick another node on the page (e.g. the scrollTo
 * animation effect's target picker). Read-only traversal — doesn't rely on
 * hasChildNode/isAllowedToInsert since those gate what can be *inserted into*,
 * not every node shape that happens to carry a children array (imageSlider,
 * tab, etc. also do).
 *
 * @param {CanvasNode} root - The tree to flatten, usually canvas.content
 * @returns {{ id: string, label: string }[]} Every node in the tree, root included
 */
export function flattenNodeTree(root: CanvasNode): { id: string; label: string }[] {
	if (!root) return []
	const result: { id: string; label: string }[] = []

	function visit(node: CanvasNode) {
		if (!node) return
		const label = node.name || node.contentType || node.type
		result.push({ id: node.id, label })

		const children = (node as unknown as { children?: unknown }).children
		if (Array.isArray(children)) {
			children.forEach((child) => visit(child as CanvasNode))
		}
	}

	visit(root)
	return result
}