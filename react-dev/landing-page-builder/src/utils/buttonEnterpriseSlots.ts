import { ButtonEnterpriseNode, ButtonEnterpriseUiType, CanvasNode } from "@/types/node.type";
import { textNode, withTextContent } from "@/utils/nodeBuilders";

// Per-uiType label/subLabel slot styling, mirroring the Tailwind classes each
// variant puts on its own label elements.
const BUTTON_SLOT_STYLES: Record<ButtonEnterpriseUiType, { label: React.CSSProperties; subLabel: React.CSSProperties }> = {
	iconSplit: { label: { fontWeight: '600', lineHeight: 1.25 }, subLabel: { fontSize: '12px', opacity: 0.75, lineHeight: 1.25 } },
	pillLift: { label: { fontWeight: '600' }, subLabel: { fontSize: '12px', opacity: 0.75 } },
	outlineFill: { label: { fontWeight: '500' }, subLabel: { fontSize: '12px', opacity: 0.75 } },
	gradientSweep: { label: { fontWeight: '600' }, subLabel: { fontSize: '12px', opacity: 0.75 } },
	pressDepth: { label: { fontWeight: '700' }, subLabel: { fontSize: '12px', opacity: 0.75 } },
	ghostUnderline: { label: { fontWeight: '500' }, subLabel: { fontSize: '12px', opacity: 0.75 } },
	cornerBadge: { label: { fontWeight: '600' }, subLabel: { fontSize: '12px', opacity: 0.75 } },
	splitAction: { label: { fontWeight: '600', lineHeight: 1.25 }, subLabel: { fontSize: '11px', opacity: 0.75, lineHeight: 1.25 } },
}

/** ghostUnderline has no fill, so it prints its label in the accent color. */
function labelColor(node: Pick<ButtonEnterpriseNode, 'uiType' | 'color' | 'textColor'>): string {
	return node.uiType === 'ghostUnderline' ? node.color : node.textColor
}

/** Styles for both text slots under a given uiType. */
export function buttonEnterpriseSlotStyles(node: Pick<ButtonEnterpriseNode, 'uiType' | 'color' | 'textColor'>) {
	const s = BUTTON_SLOT_STYLES[node.uiType] ?? BUTTON_SLOT_STYLES.iconSplit
	return {
		label: { ...s.label, color: labelColor(node) },
		subLabel: { ...s.subLabel, color: labelColor(node) },
	}
}

/** [label, subLabel] — badgeText and icon stay flat decoration fields. */
export function buildButtonEnterpriseChildren(node: Pick<ButtonEnterpriseNode, 'uiType' | 'color' | 'textColor' | 'label' | 'subLabel'>): CanvasNode[] {
	const s = buttonEnterpriseSlotStyles(node)
	return [textNode(node.label ?? '', s.label), textNode(node.subLabel ?? '', s.subLabel)]
}

/** Re-skins the label/subLabel nodes for a new uiType or color. */
export function restyleButtonEnterpriseChildren(children: CanvasNode[], node: Pick<ButtonEnterpriseNode, 'uiType' | 'color' | 'textColor'>): CanvasNode[] {
	const s = buttonEnterpriseSlotStyles(node)
	return children.map((child, i) => ({ ...child, style: { ...child.style, ...(i === 0 ? s.label : s.subLabel) } }) as CanvasNode)
}

/** Writes copy into the label or subLabel node. */
export function setButtonEnterpriseSlotText(children: CanvasNode[], field: 'label' | 'subLabel', text: string): CanvasNode[] {
	const at = field === 'label' ? 0 : 1
	if (at >= children.length) return children
	return children.map((child, i) => (i === at ? withTextContent(child, text) : child))
}
