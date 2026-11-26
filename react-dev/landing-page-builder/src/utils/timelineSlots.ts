import type { CanvasNode, TimelineNode, TimelineStep, TimelineUiType } from "@/types/node.type";
import { blockNode, textNode, withTextContent, applyTextStyle } from "@/utils/nodeBuilders";
const SERIF = "Georgia, 'Times New Roman', serif"


// A timeline's children are one block node per step: [step0, step1, ...].
// Each block holds [titleTextNode, descriptionTextNode].

/** Base look, matching TimelinePanel's titleStyle/descriptionStyle defaults. */
const BASE_TITLE: React.CSSProperties = { fontFamily: SERIF, fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }
const BASE_DESCRIPTION: React.CSSProperties = { fontSize: '13px', lineHeight: '1.6', fontWeight: '400', color: '#6b6b6b' }

/** The step block's own container — a plain text column inside whatever
 * chrome (circles, rails, ribbons) the variant draws around it. */
const STACK: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }
const STACK_CENTER: React.CSSProperties = { ...STACK, alignItems: 'center', textAlign: 'center' }

/** Per-uiType styling for the step block and the title/description inside it,
 * mirroring what each variant used to hardcode around its print sites. */
export const TIMELINE_SLOT_STYLES: Record<TimelineUiType, {
	step: React.CSSProperties
	title: React.CSSProperties
	description: React.CSSProperties
}> = {
	classicLine: { step: STACK, title: BASE_TITLE, description: BASE_DESCRIPTION },
	zigzag: { step: STACK, title: BASE_TITLE, description: BASE_DESCRIPTION },
	// Dark gallery backdrop — light text, same as the variant's hardcoded colors.
	cardStack: {
		step: { ...STACK, gap: '0.25em' },
		title: { ...BASE_TITLE, color: '#ffffff' },
		description: { ...BASE_DESCRIPTION, color: '#c7c7d1' },
	},
	// Small-caps label treatment.
	minimalDots: {
		step: { ...STACK, gap: '0.125em' },
		title: { ...BASE_TITLE, textTransform: 'uppercase', letterSpacing: '0.06em' },
		description: BASE_DESCRIPTION,
	},
	numberedCircles: { step: STACK, title: BASE_TITLE, description: BASE_DESCRIPTION },
	verticalRail: { step: STACK, title: BASE_TITLE, description: BASE_DESCRIPTION },
	roadmap: { step: STACK_CENTER, title: { ...BASE_TITLE, textAlign: 'center' }, description: { ...BASE_DESCRIPTION, textAlign: 'center' } },
	compact: { step: STACK, title: BASE_TITLE, description: BASE_DESCRIPTION },
	// Year-style title, 1.3x the base size like the variant's inline bump.
	sCurveSpine: { step: STACK, title: { ...BASE_TITLE, fontSize: '18px' }, description: BASE_DESCRIPTION },
	wavyRibbon: { step: STACK_CENTER, title: { ...BASE_TITLE, textAlign: 'center' }, description: { ...BASE_DESCRIPTION, textAlign: 'center' } },
	// The title sits inside the colored ribbon: white, bold, slightly larger.
	ribbonBanner: {
		step: STACK,
		title: { ...BASE_TITLE, fontSize: '15px', fontWeight: '700', color: '#ffffff' },
		description: BASE_DESCRIPTION,
	},
	iconBranchRail: { step: STACK, title: BASE_TITLE, description: BASE_DESCRIPTION },
	arrowAxis: { step: STACK_CENTER, title: { ...BASE_TITLE, textAlign: 'center' }, description: { ...BASE_DESCRIPTION, textAlign: 'center' } },
	wavyCircles: { step: STACK_CENTER, title: { ...BASE_TITLE, textAlign: 'center' }, description: { ...BASE_DESCRIPTION, textAlign: 'center' } },
	loadingBar: { step: STACK, title: BASE_TITLE, description: BASE_DESCRIPTION },
	axisPills: { step: STACK_CENTER, title: { ...BASE_TITLE, textAlign: 'center' }, description: { ...BASE_DESCRIPTION, textAlign: 'center' } },
}

function stylesFor(uiType: TimelineUiType) {
	return TIMELINE_SLOT_STYLES[uiType] ?? TIMELINE_SLOT_STYLES.classicLine
}

function alignOf(style: React.CSSProperties): 'left' | 'center' {
	return style.textAlign === 'center' ? 'center' : 'left'
}

/** A child's own child nodes, or [] when it isn't a block (legacy flat tree). */
function kidsOf(node: CanvasNode | undefined): CanvasNode[] {
	const kids = (node as { children?: unknown } | undefined)?.children
	return Array.isArray(kids) ? (kids as CanvasNode[]) : []
}

/** One step as a block node holding [title, description]. */
export function buildTimelineStepBlock(step: TimelineStep, uiType: TimelineUiType): CanvasNode {
	const s = stylesFor(uiType)
	const block = blockNode(
		[textNode(step.title, s.title, alignOf(s.title)), textNode(step.description, s.description, alignOf(s.description))],
		s.step,
	)
	return { ...block, name: step.title || 'Step' } as CanvasNode
}

/** [step0, step1, ...] — each step a real block node. */
export function buildTimelineChildren(node: Pick<TimelineNode, 'uiType' | 'steps'>): CanvasNode[] {
	return (node.steps ?? []).map((step) => buildTimelineStepBlock(step, node.uiType))
}

/** Re-skins each step block and its text for a new uiType, keeping edits. */
export function restyleTimelineChildren(children: CanvasNode[], uiType: TimelineUiType): CanvasNode[] {
	const s = stylesFor(uiType)
	return children.map((child) => {
		const kids = kidsOf(child)
		if (!kids.length) return child
		const nextKids = kids.map((kid, i) => applyTextStyle(kid, i === 0 ? s.title : s.description))
		return { ...child, style: { ...child.style, ...s.step }, children: nextKids } as CanvasNode
	})
}

/** Writes a step's title/description into its block, so the panel's per-step
 * text fields keep working once the timeline has real children. */
export function setTimelineSlotText(children: CanvasNode[], stepIndex: number, field: 'title' | 'description', text: string): CanvasNode[] {
	if (stepIndex < 0 || stepIndex >= children.length) return children
	return children.map((child, i) => {
		if (i !== stepIndex) return child
		const kids = kidsOf(child)
		const wanted = field === 'title' ? kids[0] : kids[1]
		if (!wanted) return child
		return { ...child, children: kids.map((k) => (k?.id === wanted.id ? withTextContent(k, text) : k)) } as CanvasNode
	})
}
