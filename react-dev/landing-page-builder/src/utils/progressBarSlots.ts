import { CanvasNode, ProgressBarNode, ProgressBarUiType } from "@/types/node.type";
import { textNode, withTextContent } from "@/utils/nodeBuilders";

// Per-uiType label slot styling, mirroring each variant's own label element.
// Every entry sets the same keys so switching variant fully resets.
const LABEL_SLOT: Record<ProgressBarUiType, { align: 'left' | 'center'; extra: React.CSSProperties }> = {
	classicBar: { align: 'left', extra: {} },
	gradientFill: { align: 'left', extra: {} },
	steppedSegments: { align: 'left', extra: {} },
	circular: { align: 'center', extra: {} },
	thinLine: { align: 'left', extra: {} },
	labeledCard: { align: 'left', extra: { textTransform: 'uppercase', letterSpacing: '0.025em', opacity: 0.7 } },
	stackedMulti: { align: 'left', extra: {} },
	roundedGlow: { align: 'left', extra: {} },
}

/** Full style for the label text node under a given uiType. */
export function progressBarSlotStyle(uiType: ProgressBarUiType | undefined, base?: React.CSSProperties): React.CSSProperties {
	const entry = LABEL_SLOT[uiType ?? 'classicBar'] ?? LABEL_SLOT.classicBar
	return { textTransform: 'none', letterSpacing: 'normal', opacity: 1, ...base, ...entry.extra, textAlign: entry.align }
}

/** [label] — the percentage readout is computed and stays chrome. */
export function buildProgressBarChildren(node: Pick<ProgressBarNode, 'uiType' | 'label' | 'labelStyle'>): CanvasNode[] {
	const entry = LABEL_SLOT[node.uiType ?? 'classicBar'] ?? LABEL_SLOT.classicBar
	return [textNode(node.label ?? '', progressBarSlotStyle(node.uiType, node.labelStyle), entry.align)]
}

/** Re-skins the label node for a new uiType. */
export function restyleProgressBarChildren(children: CanvasNode[], uiType: ProgressBarUiType | undefined, base?: React.CSSProperties): CanvasNode[] {
	if (!children.length) return children
	const next = { ...children[0], style: { ...children[0].style, ...progressBarSlotStyle(uiType, base) } } as CanvasNode
	return [next, ...children.slice(1)]
}

/** Writes copy into the label node. */
export function setProgressBarSlotText(children: CanvasNode[], text: string): CanvasNode[] {
	if (!children.length) return children
	return [withTextContent(children[0], text), ...children.slice(1)]
}
