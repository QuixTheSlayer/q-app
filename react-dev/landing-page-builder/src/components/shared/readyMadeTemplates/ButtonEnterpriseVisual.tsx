import React, { createContext, useContext } from 'react'
import type { ButtonEnterpriseNode } from '@/types/node.type'
import * as lucideIcons from 'lucide-react/icons'
import { cn } from '@/libs/cn'
import { lineClampStyle } from '@/components/PropertyPanelUI/Sections/relatedComponents/LineClampControl'
import { textStylesFor } from '@/components/PropertyPanelUI/Sections/relatedComponents/TypographyControl'
import { getIdFromUrl } from '@/utils/getIdFromUrl'
import { isEditorPage } from '@/utils/checkPage'

const eventName = /\/landing-page-builder\/(editor|preview)(\/|$)/.test(window.location.pathname)
	? ''
	: getIdFromUrl();
type IconName = keyof typeof lucideIcons

function Icon({ name, size = 16, className }: { name?: string; size?: number; className?: string }) {
	if (!name) return null
	const Cmp = lucideIcons[name as IconName] as React.FC<lucideIcons.LucideProps> | undefined
	if (!Cmp) return null
	return <Cmp size={size} className={className} />
}

/** Rendered children: [label, subLabel]. Empty for legacy nodes. */
const ButtonEnterpriseSlotsContext = createContext<React.ReactNode[]>([])

function useButtonSlot(index: number): React.ReactNode | undefined {
	return useContext(ButtonEnterpriseSlotsContext)[index] ?? undefined
}

/** Label node, or the variant's own <span> for legacy nodes. */
function BeLabel({ node, className, style }: { node: ButtonEnterpriseNode; className?: string; style?: React.CSSProperties }) {
	const slot = useButtonSlot(0)
	if (slot) return <div className={className}>{slot}</div>
	return <span className={className} style={style}>{node.label}</span>
}

/** Label node, for variants whose label is bare text styled by the <a> itself. */
function BeLabelText({ node }: { node: ButtonEnterpriseNode }) {
	const slot = useButtonSlot(0)
	if (slot) return <div>{slot}</div>
	return <>{node.label}</>
}

/** subLabel node, or the variant's own <span> for legacy nodes. */
function BeSubLabel({ node, className, style }: { node: ButtonEnterpriseNode; className?: string; style?: React.CSSProperties }) {
	const slot = useButtonSlot(1)
	if (slot) return <div className={className}>{slot}</div>
	return <span className={className} style={style}>{node.subLabel}</span>
}

/**
 * Pure "visual" component for the "buttonEnterprise" content type — data-in,
 * JSX-out, no drag/drop/popover/canvas wiring (that lives in the shell
 * component, e.g. ButtonEnterprise in EditorUI/Nodes.tsx / PreviewUI/
 * Elements.tsx). Switches on node.uiType to render one of 8 genuinely
 * distinct compositions — different arrangement/shape language, not just a
 * plain <button> recolored, matching the bar TimelineVisual/CardsTemplateVisual
 * set. All driven only by the node's own fields — see ButtonEnterpriseNode in
 * src/types/node.type.ts for the shape.
 *
 * @param isEditing - When true (editor mode), disables href and click handlers
 */



export function ButtonEnterpriseVisual({ node, slots, isEditing = isEditorPage }: { node: ButtonEnterpriseNode; slots?: React.ReactNode; isEditing?: boolean }) {
	return (
		<ButtonEnterpriseSlotsContext.Provider value={React.Children.toArray(slots)}>
			<ButtonEnterpriseLayout node={node} />
		</ButtonEnterpriseSlotsContext.Provider>
	)
}

function ButtonEnterpriseLayout({ node }: { node: ButtonEnterpriseNode }) {
	switch (node.uiType) {
		case 'pillLift':
			return <PillLiftButton node={node} isEditing={!eventName} />
		case 'outlineFill':
			return <OutlineFillButton node={node} isEditing={!eventName} />
		case 'gradientSweep':
			return <GradientSweepButton node={node} isEditing={!eventName} />
		case 'pressDepth':
			return <PressDepthButton node={node} isEditing={!eventName} />
		case 'ghostUnderline':
			return <GhostUnderlineButton node={node} isEditing={!eventName} />
		case 'cornerBadge':
			return <CornerBadgeButton node={node} isEditing={!eventName} />
		case 'splitAction':
			return <SplitActionButton node={node} isEditing={!eventName} />
		case 'iconSplit':
		default:
			return <IconSplitButton node={node} isEditing={!eventName} />
	}
}

type Props = { node: ButtonEnterpriseNode; isEditing?: boolean }

/** Variant #1 — iconSplit: icon in its own tinted square, label + subLabel stacked to its right — a "feature button" composition, not a plain pill. */
function IconSplitButton({ node, isEditing }: Props) {
	return (
		<a
			href={isEditing ? undefined : node.href || undefined}
					onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
			className="inline-flex items-center gap-3 rounded-lg px-3 py-2 no-underline"
			style={{ backgroundColor: node.color }}
		>
			{node.icon && (
				<span className="flex items-center justify-center rounded-md shrink-0" style={{ width: 34, height: 34, backgroundColor: 'rgba(255,255,255,0.18)' }}>
					<Icon name={node.icon} size={18} className="text-current" />
				</span>
			)}
			<span className="flex flex-col items-start" style={{ color: node.textColor }}>
				<BeLabel node={node} className="font-semibold leading-tight" style={{ ...lineClampStyle(node, 'label'), ...textStylesFor(node, 'label') }} />
				{node.subLabel && <BeSubLabel node={node} className="text-xs opacity-75 leading-tight" style={{ ...lineClampStyle(node, 'subLabel'), ...textStylesFor(node, 'subLabel') }} />}
			</span>
		</a>
	)
}

/** Variant #2 — pillLift: a fully rounded pill that visually "floats" via a colored drop shadow matching its own fill, icon trailing the label. */
function PillLiftButton({ node, isEditing }: Props) {
	return (
		<a
			href={isEditing ? undefined : node.href || undefined}
								onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}

			className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold no-underline"
			style={{ backgroundColor: node.color, color: node.textColor, boxShadow: `0 10px 24px -8px ${node.color}` }}
		>
			<BeLabel node={node} style={{ ...lineClampStyle(node, 'label'), ...textStylesFor(node, 'label') }} />
			{node.icon && <Icon name={node.icon} size={16} />}
		</a>
	)
}

/** Variant #3 — outlineFill: a two-layer button — a static colored outline frame sits behind an inset label plate, giving a "border + card" look rather than a single flat fill. */
function OutlineFillButton({ node, isEditing }: Props) {
	return (
		<span
			className="inline-flex p-1 rounded-lg"
			style={{ border: `2px solid ${node.color}` }}
		>
			<a
				href={isEditing ? undefined : node.href || undefined}
									onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}

				className="inline-flex items-center gap-2 rounded-md px-4 py-1.5 font-medium no-underline"
				style={{ backgroundColor: node.color, color: node.textColor, ...lineClampStyle(node, 'label'), ...textStylesFor(node, 'label') }}
			>
				<BeLabelText node={node} />
			</a>
		</span>
	)
}

/** Variant #4 — gradientSweep: a wide banner-shaped button with a diagonal two-tone gradient fill and the label anchored to one side, icon on the opposite edge — reads like a mini call-to-action strip, not a compact button. */
function GradientSweepButton({ node, isEditing }: Props) {
	return (
		<a
			href={isEditing ? undefined : node.href || undefined}
								onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}

			className="inline-flex items-center justify-between gap-4 rounded-xl px-5 py-3 min-w-[220px] no-underline"
			style={{ background: `linear-gradient(120deg, ${node.color}, ${node.color}66)`, color: node.textColor }}
		>
			<BeLabel node={node} className="font-semibold" style={{ ...lineClampStyle(node, 'label'), ...textStylesFor(node, 'label') }} />
			{node.icon && (
				<span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 26, height: 26, backgroundColor: 'rgba(255,255,255,0.25)' }}>
					<Icon name={node.icon} size={14} />
				</span>
			)}
		</a>
	)
}

/** Variant #5 — pressDepth: a chunky 3D "keycap" button — a solid bottom ledge visible beneath the top face via layered box-shadows, giving real depth instead of a flat rectangle. */
function PressDepthButton({ node, isEditing }: Props) {
	return (
		<a
			href={isEditing ? undefined : node.href || undefined}
								onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}

			className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-bold no-underline"
			style={{
				backgroundColor: node.color,
				color: node.textColor,
				boxShadow: `0 5px 0 0 ${node.color}, 0 5px 0 0 rgba(0,0,0,0.35)`,
				borderBottom: `4px solid rgba(0,0,0,0.25)`,
				...lineClampStyle(node, 'label'),
				...textStylesFor(node, 'label'),
			}}
		>
			<BeLabelText node={node} />
		</a>
	)
}

/** Variant #6 — ghostUnderline: no fill/border at all — just label text with an icon-in-circle prefix and an animated-looking underline bar beneath, the leanest/most editorial composition of the set. */
function GhostUnderlineButton({ node, isEditing }: Props) {
	return (
		<a
			href={isEditing ? undefined : node.href || undefined}
								onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}

			className="inline-flex flex-col items-start gap-1 no-underline"
		>
			<span className="inline-flex items-center gap-2">
				{node.icon && (
					<span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 22, height: 22, border: `1.5px solid ${node.color}` }}>
						<Icon name={node.icon} size={12} className="shrink-0" />
					</span>
				)}
				<BeLabel node={node} className="font-medium" style={{ color: node.color, ...lineClampStyle(node, 'label'), ...textStylesFor(node, 'label') }} />
			</span>
			<span className="h-[2px] w-full rounded-full" style={{ backgroundColor: node.color }} />
		</a>
	)
}

/** Variant #7 — cornerBadge: a rectangular button with a diagonal-cut badge chip riding its top-right corner — the only variant with a floating secondary label element. */
function CornerBadgeButton({ node, isEditing }: Props) {
	return (
		<span className="relative inline-flex">
			<a
				href={isEditing ? undefined : node.href || undefined}
									onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}

				className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-semibold no-underline"
				style={{ backgroundColor: node.color, color: node.textColor, ...lineClampStyle(node, 'label'), ...textStylesFor(node, 'label') }}
			>
				<BeLabelText node={node} />
			</a>
			{node.badgeText && (
				<span
					className="absolute -top-2.5 -right-2.5 px-1.5 py-0.5 text-[10px] font-bold rounded"
					style={{ backgroundColor: node.textColor, color: node.color, ...lineClampStyle(node, 'badgeText'), ...textStylesFor(node, 'badgeText') }}
				>
					{node.badgeText}
				</span>
			)}
		</span>
	)
}

/** Variant #8 — splitAction: two visually separate segments joined edge-to-edge — a label segment and a narrower icon-only action segment with its own darker fill, like a dropdown-split button. */
function SplitActionButton({ node, isEditing }: Props) {
	return (
		<span className="inline-flex rounded-lg overflow-hidden">
			<a
				href={isEditing ? undefined : node.href || undefined}
									onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}

				className="inline-flex flex-col items-start justify-center gap-0 px-4 py-2 no-underline"
				style={{ backgroundColor: node.color, color: node.textColor }}
			>
				<BeLabel node={node} className="font-semibold leading-tight" style={{ ...lineClampStyle(node, 'label'), ...textStylesFor(node, 'label') }} />
				{node.subLabel && <BeSubLabel node={node} className="text-[11px] opacity-75 leading-tight" style={{ ...lineClampStyle(node, 'subLabel'), ...textStylesFor(node, 'subLabel') }} />}
			</a>
			{node.icon && (
				<span
					className="inline-flex items-center justify-center px-3"
					style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: node.textColor }}
				>
					<Icon name={node.icon} size={16} />
				</span>
			)}
		</span>
	)
}
