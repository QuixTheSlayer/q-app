import React, { createContext, useContext } from 'react'
import type { ProgressBarNode } from '@/types/node.type'
import { clampProgressValue } from '@/utils/progressBar.utils'
import { lineClampStyle } from '@/components/PropertyPanelUI/Sections/relatedComponents/LineClampControl'

/** Rendered children: [label]. Empty for legacy nodes. */
const ProgressBarSlotsContext = createContext<React.ReactNode[]>([])

/** The label node, or the variant's own <span> for legacy nodes. */
function ProgressLabel({ node, className }: { node: ProgressBarNode; className?: string }) {
	const slot = useContext(ProgressBarSlotsContext)[0]
	if (!node.showLabel) return null
	if (slot) return <div className={className}>{slot}</div>
	return <span className={className} style={{ ...node.labelStyle, ...lineClampStyle(node, 'label') }}>{node.label}</span>
}

/**
 * Pure "visual" component for the "progressBar" content type's Ready Made
 * Templates — data-in, JSX-out, no drag/drop/popover/canvas wiring (that
 * lives in the shell component, e.g. ProgressBar in EditorUI/Nodes.tsx and
 * the standalone render in PreviewUI/Elements.tsx). Switches on node.uiType
 * to render one of 8 genuinely distinct compositions, all driven only by the
 * node's own data fields — see ProgressBarNode in src/types/node.type.ts for
 * the shape.
 *
 * "classicBar" is the original single-style implementation, extracted
 * verbatim from its previous inline home so both call sites keep rendering
 * identically after the swap to this shared component.
 */
interface ProgressBarVisualProps {
	node: ProgressBarNode
	/** Rendered child tree — [label] — for nodes that have one. */
	slots?: React.ReactNode
	/**
	 * Overrides the rendered fill value (0-100). Used by the production
	 * render path to drive the scroll-triggered count-up animation without
	 * every variant needing its own animation logic — defaults to
	 * node.value (clamped) so the editor's static preview needs no prop.
	 */
	displayValue?: number
}

export function ProgressBarVisual({ node, displayValue, slots }: ProgressBarVisualProps) {
	return (
		<ProgressBarSlotsContext.Provider value={React.Children.toArray(slots)}>
			<ProgressBarLayout node={node} displayValue={displayValue} />
		</ProgressBarSlotsContext.Provider>
	)
}

function ProgressBarLayout({ node, displayValue }: ProgressBarVisualProps) {
	const value = displayValue ?? clampProgressValue(node.value)

	switch (node.uiType) {
		case 'gradientFill':
			return <GradientFillProgressBar node={node} value={value} />
		case 'steppedSegments':
			return <SteppedSegmentsProgressBar node={node} value={value} />
		case 'circular':
			return <CircularProgressBar node={node} value={value} />
		case 'thinLine':
			return <ThinLineProgressBar node={node} value={value} />
		case 'labeledCard':
			return <LabeledCardProgressBar node={node} value={value} />
		case 'stackedMulti':
			return <StackedMultiProgressBar node={node} value={value} />
		case 'roundedGlow':
			return <RoundedGlowProgressBar node={node} value={value} />
		case 'classicBar':
		default:
			return <ClassicBarProgressBar node={node} value={value} />
	}
}

/** Shared label/percentage row used by most bar-shaped variants. */
function LabelRow({ node, value }: { node: ProgressBarNode; value: number }) {
	if (!node.showLabel && !node.showPercentage) return null
	return (
		<div className="flex items-center justify-between w-full flex-wrap gap-1">
			<ProgressLabel node={node} />
			{node.showPercentage && <span style={node.percentageStyle}>{Math.round(value)}%</span>}
		</div>
	)
}

/** Variant #1 — classicBar: label/percentage row above a flat filled track. Extracted 1:1 from the original inline implementation. */
function ClassicBarProgressBar({ node, value }: { node: ProgressBarNode; value: number }) {
	return (
		<div className="flex flex-col w-full gap-2">
			<LabelRow node={node} value={value} />
			<div
				className="w-full overflow-hidden"
				style={{ height: node.barHeight, borderRadius: node.barRadius, backgroundColor: node.trackColor }}
			>
				<div
					style={{
						width: `${value}%`,
						height: '100%',
						borderRadius: node.barRadius,
						backgroundColor: node.color,
					}}
				/>
			</div>
		</div>
	)
}

/** Variant #2 — gradientFill: a milestone ruler — quarter-tick marks sit above the gradient track, and a small flag-shaped marker floats directly over the current fill edge showing the live percentage. */
function GradientFillProgressBar({ node, value }: { node: ProgressBarNode; value: number }) {
	const ticks = [25, 50, 75]
	const markerSize = Math.max(node.barHeight * 1.1, 18)

	return (
		<div className="flex flex-col w-full gap-1">
			<ProgressLabel node={node} />
			<div className="relative w-full pt-6" style={{ paddingLeft: markerSize / 2, paddingRight: markerSize / 2 }}>
				{node.showPercentage && (
					<div
						className="absolute flex items-center justify-center text-white font-semibold shrink-0"
						style={{
							left: `calc(${value}% * (100% - ${markerSize}px) / 100%)`,
							top: 0,
							width: 'auto',
							minWidth: markerSize * 1.6,
							height: markerSize,
							padding: '0 6px',
							borderRadius: 6,
							backgroundColor: node.color,
							transform: 'translateX(-50%)',
						}}
					>
						<span style={{ ...node.percentageStyle, color: node.percentageStyle?.color ?? '#fff' }}>{Math.round(value)}%</span>
						<div
							className="absolute left-1/2 -translate-x-1/2"
							style={{
								bottom: -5,
								width: 0,
								height: 0,
								borderLeft: '5px solid transparent',
								borderRight: '5px solid transparent',
								borderTop: `5px solid ${node.color}`,
							}}
						/>
					</div>
				)}
				<div
					className="relative w-full overflow-hidden"
					style={{ height: node.barHeight, borderRadius: node.barRadius, backgroundColor: node.trackColor }}
				>
					<div
						style={{
							width: `${value}%`,
							height: '100%',
							borderRadius: node.barRadius,
							background: `linear-gradient(90deg, ${node.trackColor}, ${node.color})`,
						}}
					/>
					{ticks.map((tick) => (
						<div
							key={tick}
							className="absolute top-0 bottom-0 w-px"
							style={{ left: `${tick}%`, backgroundColor: 'rgba(255,255,255,0.5)' }}
						/>
					))}
				</div>
				<div className="flex w-full justify-between mt-1">
					{[0, 25, 50, 75, 100].map((tick) => (
						<span key={tick} className="text-[10px] opacity-50 shrink-0" style={node.labelStyle}>{tick}</span>
					))}
				</div>
			</div>
		</div>
	)
}

/** Variant #3 — steppedSegments: track is divided into discrete segments, each lighting up as value crosses its threshold. */
function SteppedSegmentsProgressBar({ node, value }: { node: ProgressBarNode; value: number }) {
	const segmentCount = 10
	const filledSegments = Math.round((value / 100) * segmentCount)

	return (
		<div className="flex flex-col w-full gap-2">
			<LabelRow node={node} value={value} />
			<div className="w-full flex gap-1 flex-wrap" style={{ height: node.barHeight }}>
				{Array.from({ length: segmentCount }).map((_, i) => (
					<div
						key={i}
						className="flex-1 overflow-hidden"
						style={{
							minWidth: 6,
							height: '100%',
							borderRadius: Math.min(node.barRadius, 4),
							backgroundColor: i < filledSegments ? node.color : node.trackColor,
						}}
					/>
				))}
			</div>
		</div>
	)
}

/** Variant #4 — circular: SVG radial progress ring with label/percentage centered inside. */
function CircularProgressBar({ node, value }: { node: ProgressBarNode; value: number }) {
	const size = Math.max(node.barHeight * 6, 96)
	const strokeWidth = Math.max(node.barHeight, 4)
	const radius = (size - strokeWidth) / 2
	const circumference = 2 * Math.PI * radius
	const offset = circumference * (1 - value / 100)

	return (
		<div className="flex flex-col items-center gap-2 w-full flex-wrap">
			<div className="relative shrink-0" style={{ width: size, height: size }}>
				<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill="none"
						stroke={node.trackColor}
						strokeWidth={strokeWidth}
					/>
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill="none"
						stroke={node.color}
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={offset}
					/>
				</svg>
				{node.showPercentage && (
					<div className="absolute inset-0 flex items-center justify-center">
						<span style={node.percentageStyle}>{Math.round(value)}%</span>
					</div>
				)}
			</div>
			<ProgressLabel node={node} />
		</div>
	)
}

/** Variant #5 — thinLine: a single-row dot-tracker — a hairline rail carries a small solid dot riding at the current value's position (not a filled track), with label and percentage bookending it. Reads like a slider/scrubber rather than a filled bar. */
function ThinLineProgressBar({ node, value }: { node: ProgressBarNode; value: number }) {
	const thinHeight = Math.min(node.barHeight, 3)
	const dotSize = Math.max(node.barHeight * 1.4, 10)

	return (
		<div className="flex items-center w-full gap-3 flex-wrap">
			<ProgressLabel node={node} className="shrink-0" />
			<div className="relative flex-1 flex items-center" style={{ minWidth: 60, height: dotSize }}>
				<div
					className="w-full absolute left-0 right-0"
					style={{ height: thinHeight, borderRadius: 999, backgroundColor: node.trackColor }}
				/>
				<div
					className="absolute rounded-full"
					style={{
						left: `calc(${value}% - ${dotSize / 2}px)`,
						width: dotSize,
						height: dotSize,
						backgroundColor: node.color,
						border: `2px solid ${node.trackColor}`,
					}}
				/>
			</div>
			{node.showPercentage && <span style={node.percentageStyle} className="shrink-0">{Math.round(value)}%</span>}
		</div>
	)
}

/** Variant #6 — labeledCard: a dashboard stat tile — a big numeral leads on the left, label stacked beside it, with a slim footer track pinned along the bottom edge of the card. Grid-based so the numeral column and text column reflow independently at narrow widths. */
function LabeledCardProgressBar({ node, value }: { node: ProgressBarNode; value: number }) {
	return (
		<div
			className="grid w-full gap-3 rounded-lg border p-3"
			style={{ borderColor: node.trackColor, gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' }}
		>
			<div className="flex flex-col justify-center gap-0.5 min-w-0">
				<ProgressLabel node={node} className="uppercase tracking-wide opacity-70 truncate" />
				{node.showPercentage && (
					<span
						style={{ ...node.percentageStyle, fontSize: (parseInt(String(node.percentageStyle?.fontSize ?? 16)) || 16) * 2, color: node.percentageStyle?.color ?? node.color, fontWeight: 700 }}
					>
						{Math.round(value)}%
					</span>
				)}
			</div>
			<div className="flex flex-col justify-end gap-1 min-w-0">
				<div
					className="w-full overflow-hidden"
					style={{ height: Math.max(node.barHeight * 0.6, 4), borderRadius: node.barRadius, backgroundColor: node.trackColor }}
				>
					<div
						style={{
							width: `${value}%`,
							height: '100%',
							borderRadius: node.barRadius,
							backgroundColor: node.color,
						}}
					/>
				</div>
				<span className="text-[11px] opacity-50 shrink-0">{Math.round(value)} / 100</span>
			</div>
		</div>
	)
}

/** Variant #7 — stackedMulti: the fill portion is visually split into thirds of a slightly varying shade, suggesting multi-part composition of a single value. */
function StackedMultiProgressBar({ node, value }: { node: ProgressBarNode; value: number }) {
	const shades = [node.color, `${node.color}cc`, `${node.color}99`]
	const thirds = [
		Math.min(value, 100 / 3),
		Math.min(Math.max(value - 100 / 3, 0), 100 / 3),
		Math.min(Math.max(value - (200 / 3), 0), 100 / 3),
	]

	return (
		<div className="flex flex-col w-full gap-2">
			<LabelRow node={node} value={value} />
			<div
				className="w-full overflow-hidden flex"
				style={{ height: node.barHeight, borderRadius: node.barRadius, backgroundColor: node.trackColor }}
			>
				{thirds.map((segmentValue, i) => (
					<div
						key={i}
						style={{
							width: `${segmentValue}%`,
							height: '100%',
							backgroundColor: shades[i],
						}}
					/>
				))}
			</div>
		</div>
	)
}

/** Variant #8 — roundedGlow: a vertical thermometer/gauge — a tall glowing column fills bottom-up inside a pill-capped tube, with a glowing bulb anchored at its base and the label/percentage stacked beside it. Wraps to a horizontal row when the container is too narrow to hold the column comfortably. */
function RoundedGlowProgressBar({ node, value }: { node: ProgressBarNode; value: number }) {
	const tubeWidth = Math.max(node.barHeight, 14)
	const tubeHeight = Math.max(tubeWidth * 5, 90)
	const bulbSize = tubeWidth * 2.1

	return (
		<div className="flex items-end w-full gap-4 flex-wrap">
			<div className="relative shrink-0" style={{ width: bulbSize, height: tubeHeight + bulbSize / 2 }}>
				<div
					className="absolute left-1/2 -translate-x-1/2 top-0 overflow-hidden rounded-full flex flex-col justify-end"
					style={{ width: tubeWidth, height: tubeHeight, backgroundColor: node.trackColor }}
				>
					<div
						style={{
							width: '100%',
							height: `${value}%`,
							backgroundColor: node.color,
							boxShadow: `0 0 12px 2px ${node.color}99`,
						}}
					/>
				</div>
				<div
					className="absolute left-1/2 -translate-x-1/2 bottom-0 rounded-full"
					style={{
						width: bulbSize,
						height: bulbSize,
						backgroundColor: node.color,
						boxShadow: `0 0 16px 3px ${node.color}99`,
					}}
				/>
			</div>
			<div className="flex flex-col gap-1 min-w-0">
				{node.showPercentage && (
					<span style={{ ...node.percentageStyle, fontSize: (parseInt(String(node.percentageStyle?.fontSize ?? 16)) || 16) * 1.6, fontWeight: 700, color: node.percentageStyle?.color ?? node.color }}>
						{Math.round(value)}%
					</span>
				)}
				<ProgressLabel node={node} className="truncate" />
			</div>
		</div>
	)
}
