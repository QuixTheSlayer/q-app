import React, { createContext, useContext } from 'react'
import { cn } from '@/libs/cn'
import type { TimelineNode, TimelineStep } from '@/types/node.type'
import { lineClampStyle } from '@/components/PropertyPanelUI/Sections/relatedComponents/LineClampControl'

/** The timeline's already-rendered child nodes: one block per step,
 * [step0, step1, ...], each holding its title and description. Supplied via
 * context; the 16 variants below keep drawing their own chrome (circles,
 * rails, spines) around the block and fall back to the flat `steps` fields
 * for timelines saved before this existed. */
const TimelineSlotsContext = createContext<React.ReactNode[]>([])

function useTimelineSlots(): React.ReactNode[] {
	return useContext(TimelineSlotsContext)
}

/** A step's block node, or `fallback` (the variant's own flat title/description). */
function StepSlot({ index, fallback }: { index: number; fallback: React.ReactNode }) {
	const slot = useContext(TimelineSlotsContext)[index]
	return <>{slot ?? fallback}</>
}

/**
 * Pure, data-in/JSX-out renderer for every TimelineNode.uiType variant.
 * No drag/drop, popover, or canvas wiring lives here — see Nodes.tsx's
 * Timeline (editor shell) / Elements.tsx's Timeline (preview shell) for that,
 * which each call TimelineTrack for the "classicLine" look and this
 * component's siblings for every other uiType.
 *
 * `slots` is the rendered child tree (one selectable block node per step);
 * legacy timelines pass none and render their flat `steps` instead.
 */
export function TimelineVisual({ node, slots }: { node: TimelineNode; slots?: React.ReactNode }) {
	return (
		<TimelineSlotsContext.Provider value={React.Children.toArray(slots)}>
			<TimelineLayout node={node} />
		</TimelineSlotsContext.Provider>
	)
}

function TimelineLayout({ node }: { node: TimelineNode }) {
	switch (node.uiType) {
		case 'zigzag':
			return <ZigzagVariant node={node} />
		case 'cardStack':
			return <CardStackVariant node={node} />
		case 'minimalDots':
			return <MinimalDotsVariant node={node} />
		case 'numberedCircles':
			return <NumberedCirclesVariant node={node} />
		case 'verticalRail':
			return <VerticalRailVariant node={node} />
		case 'roadmap':
			return <RoadmapVariant node={node} />
		case 'compact':
			return <CompactVariant node={node} />
		case 'sCurveSpine':
			return <SCurveSpineVariant node={node} />
		case 'wavyRibbon':
			return <WavyRibbonVariant node={node} />
		case 'ribbonBanner':
			return <RibbonBannerVariant node={node} />
		case 'iconBranchRail':
			return <IconBranchRailVariant node={node} />
		case 'arrowAxis':
			return <ArrowAxisVariant node={node} />
		case 'wavyCircles':
			return <WavyCirclesVariant node={node} />
		case 'loadingBar':
			return <LoadingBarVariant node={node} />
		case 'axisPills':
			return <AxisPillsVariant node={node} />
		case 'classicLine':
		default:
			return <ClassicLineVariant node={node} />
	}
}

function stepColor(node: TimelineNode, index: number) {
	return index < node.activeStepCount ? node.activeColor : node.inactiveColor
}

function lineColorAfter(node: TimelineNode, index: number) {
	return index < node.activeStepCount - 1 ? node.activeColor : node.inactiveColor
}

/** Variant #1 — the original single-design look: numbered circles joined by a straight connecting line, title/description below (horizontal) or beside (vertical) each circle. */
function ClassicLineVariant({ node }: { node: TimelineNode }) {
	const isHorizontal = node.orientation !== 'vertical'
	return (
		<div className={cn('flex w-full', isHorizontal ? 'flex-row flex-wrap items-center justify-center  ' : 'flex-col items-start')}>
			{node.steps.map((step, index) => {
				const isLastStep = index === node.steps.length - 1
				const circleColor = stepColor(node, index)
				const lineColor = lineColorAfter(node, index)
				return (
					<div
						key={index}
						className={cn('flex', isHorizontal ? 'flex-col items-center flex-1 ' : 'flex-row  items-center gap-3')}
						style={isHorizontal ? { minWidth: 120 } : undefined}
					>
						<div className={cn('flex items-center', isHorizontal ? 'w-full relative justify-center  ' : 'flex-col')}>
							<div
								className="flex  items-center justify-center rounded-full text-white font-semibold shrink-0"
								style={{ width: node.circleSize, height: node.circleSize, backgroundColor: circleColor, fontSize: node.circleSize * 0.45 }}
							>
								{index + 1}
							</div>
							{!isLastStep && (
								// <></>
								<div className={cn(" h-[2px]   ", isHorizontal ? ' absolute w-[90%] -z-1 flex-1 h-[2px]' : 'w-[2px]  flex-1 my-1')} style={{
									right: `-50%`,
									backgroundColor: lineColor,
									minHeight: isHorizontal ? undefined : node.circleSize * 0.75,
									minWidth: isHorizontal ? 24 : undefined
								}} >

								</div>

							)}
						</div>
						<div className={cn('flex flex-col', isHorizontal ? 'items-center text-center mt-2' : 'pb-6')}>
							<StepSlot
								index={index}
								fallback={
									<>
										<span
											className={cn(!isHorizontal && 'flex items-center')}
											style={{ minHeight: isHorizontal ? undefined : node.circleSize, ...node.titleStyle, ...lineClampStyle(node, 'title') }}
										>
											{step.title}
										</span>
										<span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }}>{step.description}</span>
									</>
								}
							/>
						</div>
					</div>
				)
			})}
		</div>
	)
}

/** Variant #2 — steps alternate above/below (horizontal) or left/right (vertical) a central spine, connected by diagonal-feeling offsets. */
function ZigzagVariant({ node }: { node: TimelineNode }) {
	const isHorizontal = node.orientation !== 'vertical'

	if (!isHorizontal) {
		return (
			<div className="flex flex-col w-full">
				{node.steps.map((step, index) => {
					const isLastStep = index === node.steps.length - 1
					const circleColor = stepColor(node, index)
					const lineColor = lineColorAfter(node, index)
					const alignRight = index % 2 === 1
					return (
						<div key={index} className={cn('flex w-full', alignRight ? 'flex-row-reverse text-right' : 'flex-row text-left')}>
							<div className="flex flex-col items-center">
								<div
									className="flex items-center justify-center rounded-full text-white font-semibold shrink-0"
									style={{ width: node.circleSize, height: node.circleSize, backgroundColor: circleColor, fontSize: node.circleSize * 0.45 }}
								>
									{index + 1}
								</div>
								{!isLastStep && (
									<div className="w-[2px] flex-1 my-1" style={{ backgroundColor: lineColor, minHeight: node.circleSize }} />
								)}
							</div>
							<div className={cn('flex flex-col px-4 pb-8 max-w-[70%]', alignRight ? 'items-end' : 'items-start')}>
								<StepSlot
									index={index}
									fallback={
										<>
											<span style={{ ...node.titleStyle, ...lineClampStyle(node, 'title') }}>{step.title}</span>
											<span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }}>{step.description}</span>
										</>
									}
								/>
							</div>
						</div>
					)
				})}
			</div>
		)
	}

	return (
		<div className="flex w-full flex-wrap items-stretch">
			{node.steps.map((step, index) => {
				const isLastStep = index === node.steps.length - 1
				const circleColor = stepColor(node, index)
				const lineColor = lineColorAfter(node, index)
				const isUp = index % 2 === 0
				return (
					<div key={index} className="flex flex-1 flex-col items-center" style={{ minWidth: 120 }}>
						<div className={cn('flex flex-col items-center w-full', isUp ? 'justify-end' : 'justify-start order-3')} style={{ height: 64 }}>
							<StepSlot
								index={index}
								fallback={
									<>
										<span style={{ ...node.titleStyle, ...lineClampStyle(node, 'title') }} className="text-center">{step.title}</span>
										<span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }} className="text-center">{step.description}</span>
									</>
								}
							/>
						</div>
						<div className={cn('flex items-center w-full', isUp ? 'order-2' : 'order-2')}>
							{index === 0 ? <div className="flex-1" /> : <div className="flex-1 h-[2px]" style={{ backgroundColor: lineColorAfter(node, index - 1) }} />}
							<div
								className="flex items-center justify-center rounded-full text-white font-semibold shrink-0"
								style={{ width: node.circleSize, height: node.circleSize, backgroundColor: circleColor, fontSize: node.circleSize * 0.45 }}
							>
								{index + 1}
							</div>
							{isLastStep ? <div className="flex-1" /> : <div className="flex-1 h-[2px]" style={{ backgroundColor: lineColor }} />}
						</div>
						<div className={cn('flex flex-col items-center w-full', isUp ? 'order-1' : '')} style={{ height: isUp ? 0 : 64, visibility: isUp ? 'hidden' : 'visible' }} />
					</div>
				)
			})}
		</div>
	)
}

/** Variant #3 — self-contained cards on a dark gallery backdrop, each with a gradient header band (number + title) and a floating, slightly rotated fan arrangement for real depth instead of a flat left-bar accent. */
function CardStackVariant({ node }: { node: TimelineNode }) {
	const isHorizontal = node.orientation !== 'vertical'
	const slots = useTimelineSlots()
	return (
		<div
			className={cn('flex w-full p-4 rounded-2xl', isHorizontal ? 'flex-row flex-wrap gap-5 items-start' : 'flex-col gap-4')}
			style={{ backgroundColor: '#101014' }}
		>
			{node.steps.map((step, index) => {
				const color = stepColor(node, index)
				const rotate = isHorizontal ? (index % 3 === 0 ? '-1.5deg' : index % 3 === 1 ? '1.5deg' : '0deg') : '0deg'
				// The whole step block lives in the body, so the gradient band
				// keeps only its numeral when there's a slot.
				const slot = slots[index]
				return (
					<div
						key={index}
						className={cn('flex flex-col rounded-xl overflow-hidden motion-safe:transition-transform', isHorizontal ? 'flex-1 min-w-[160px]' : 'w-full')}
						style={{
							backgroundColor: '#1c1c22',
							boxShadow: `0 16px 32px -14px ${color}77, 0 0 0 1px ${color}33`,
							transform: `rotate(${rotate}) ${isHorizontal && index % 2 === 1 ? 'translateY(10px)' : ''}`,
						}}
					>
						<div
							className="flex items-center gap-2.5 px-3.5 py-2.5"
							style={{ background: `linear-gradient(120deg, ${color}, ${color}99)` }}
						>
							<span
								className="flex items-center justify-center rounded-full font-bold shrink-0"
								style={{ width: node.circleSize * 0.75, height: node.circleSize * 0.75, backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: node.circleSize * 0.34 }}
							>
								{index + 1}
							</span>
							{!slot && <span style={{ ...node.titleStyle, color: '#fff', ...lineClampStyle(node, 'title') }}>{step.title}</span>}
						</div>
						<div className="px-3.5 py-3">
							{slot ?? <span style={{ ...node.descriptionStyle, color: node.descriptionStyle?.color ?? '#c7c7d1', ...lineClampStyle(node, 'description') }}>{step.description}</span>}
						</div>
					</div>
				)
			})}
		</div>
	)
}

/** Variant #4 — a slim dot-and-hairline rail with no numbers/circles, titles set as small caps labels; the leanest, most minimal composition. */
function MinimalDotsVariant({ node }: { node: TimelineNode }) {
	const isHorizontal = node.orientation !== 'vertical'
	const dotSize = Math.max(8, node.circleSize * 0.28)
	return (
		<div className={cn('flex w-full', isHorizontal ? 'flex-row flex-wrap items-start' : 'flex-col items-start')}>
			{node.steps.map((step, index) => {
				const isLastStep = index === node.steps.length - 1
				const color = stepColor(node, index)
				const lineColor = lineColorAfter(node, index)
				return (
					<div
						key={index}
						className={cn('flex', isHorizontal ? 'flex-col items-center flex-1 relative' : 'flex-row items-start gap-3')}
						style={isHorizontal ? { minWidth: 100 } : undefined}
					>
						<div className={cn('flex items-center', isHorizontal ? 'w-full justify-center ' : 'flex-col')}>
							<span className="rounded-full shrink-0" style={{ width: dotSize, height: dotSize, backgroundColor: color }} />
							{!isLastStep && (
								<div
									className={cn(isHorizontal ? 'flex-1 h-px absolute -right-[50%] w-[98%] ' : 'w-px flex-1 my-1')}
									style={{ backgroundColor: lineColor, minHeight: isHorizontal ? undefined : node.circleSize * 0.75, minWidth: isHorizontal ? 20 : undefined }}
								/>
							)}
						</div>
						<div className={cn('flex flex-col gap-0.5', isHorizontal ? 'items-center text-center mt-2' : 'pb-5')}>
							<StepSlot
								index={index}
								fallback={
									<>
										<span
											className={cn(!isHorizontal && 'flex items-center')}
											style={{ minHeight: isHorizontal ? undefined : dotSize, textTransform: 'uppercase', letterSpacing: '0.06em', ...node.titleStyle, ...lineClampStyle(node, 'title') }}
										>
											{step.title}
										</span>
										<span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }}>{step.description}</span>
									</>
								}
							/>
						</div>
					</div>
				)
			})}
		</div>
	)
}

/** Variant #5 — oversized numbered circles as the dominant visual element, text stacked tightly beneath/beside a subdued connecting line. */
function NumberedCirclesVariant({ node }: { node: TimelineNode }) {
	const isHorizontal = node.orientation !== 'vertical'
	const bigCircle = node.circleSize * 1.6
	return (
		<div className={cn('flex w-full', isHorizontal ? 'flex-row  flex-wrap items-center justify-center' : 'flex-col items-start')}>
			{node.steps.map((step, index) => {
				const isLastStep = index === node.steps.length - 1
				const color = stepColor(node, index)
				const lineColor = lineColorAfter(node, index)
				return (
					<div
						key={index}
						className={cn('flex', isHorizontal ? 'flex-col items-center flex-1 justify-center  ' : 'flex-row items-start gap-4')}
						style={isHorizontal ? { minWidth: bigCircle + 20 } : undefined}
					>

						
						<div className={cn('flex items-center group', isHorizontal ? 'w-full justify-center relative  ' : 'flex-col')}>


							<div
								className="flex items-center justify-center overflow-hidden   rounded-full font-bold shrink-0"
								style={{
									width: bigCircle,
									maxWidth: bigCircle,
									height: bigCircle,
									fontSize: bigCircle * 0.42,
									color,
									border: `3px solid ${color}`,
									backgroundColor: node.style.backgroundColor || '#fff',
								}}
							>
								{index + 1}
							</div>


							{!isLastStep && (
								// <></>
								<div className={cn(" h-[2px]   ", isHorizontal ? ' absolute w-[80%] -z-1 flex-1 h-[2px]' : 'w-[2px]  flex-1 my-1')} style={{
									right: `-50%`,
									backgroundColor: lineColor,
									minHeight: isHorizontal ? undefined : node.circleSize * 0.75,
									minWidth: isHorizontal ? 24 : undefined
								}} >

								</div>

							)}

						</div>
						<div className={cn('flex flex-col', isHorizontal ? 'items-center text-center mt-3' : 'pb-7')}>
							<StepSlot
								index={index}
								fallback={
									<>
										<span
											className={cn(!isHorizontal && 'flex items-center')}
											style={{ minHeight: isHorizontal ? undefined : bigCircle, ...node.titleStyle, ...lineClampStyle(node, 'title') }}
										>
											{step.title}
										</span>
										<span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }}>{step.description}</span>
									</>
								}
							/>
						</div>
					</div>
				)
			})}
		</div>
	)
}

/** Variant #6 — always a left-hand vertical rail regardless of node.orientation, with generous card-like rows; reads like a changelog/activity feed. */
function VerticalRailVariant({ node }: { node: TimelineNode }) {
	return (
		<div className="flex flex-col w-full">
			{node.steps.map((step, index) => {
				const isLastStep = index === node.steps.length - 1
				const color = stepColor(node, index)
				const lineColor = lineColorAfter(node, index)
				return (
					<div key={index} className="flex flex-row items-stretch gap-4">
						<div className="flex flex-col items-center">
							<div
								className="flex items-center justify-center rounded-full text-white font-semibold shrink-0"
								style={{ width: node.circleSize, height: node.circleSize, backgroundColor: color, fontSize: node.circleSize * 0.45 }}
							>
								{index + 1}
							</div>
							{!isLastStep && <div className="w-[3px] flex-1 my-1 rounded-full" style={{ backgroundColor: lineColor, minHeight: node.circleSize * 1.4 }} />}
						</div>
						<div className="flex flex-col pb-8 pt-1 flex-1 rounded-md pl-3" style={{ borderLeft: `2px solid ${color}22` }}>
							<StepSlot
								index={index}
								fallback={
									<>
										<span style={{ ...node.titleStyle, ...lineClampStyle(node, 'title') }}>{step.title}</span>
										<span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }}>{step.description}</span>
									</>
								}
							/>
						</div>
					</div>
				)
			})}
		</div>
	)
}

/** Variant #7 — a thick "road" bar per step with chevron-notched segments and the step number as a milestone marker on top; a literal roadmap look. */
function RoadmapVariant({ node }: { node: TimelineNode }) {
	const isHorizontal = node.orientation !== 'vertical'
	return (
		<div className={cn('flex w-full', isHorizontal ? 'flex-row flex-wrap items-stretch' : 'flex-col items-stretch')}>
			{node.steps.map((step, index) => {
				const color = stepColor(node, index)
				return (
					<div
						key={index}
						className={cn('flex flex-col items-center', isHorizontal ? 'flex-1' : 'w-full mb-4')}
						style={isHorizontal ? { minWidth: node.circleSize + 60 } : undefined}
					>
						<div
							className="flex items-center justify-center text-white font-bold shrink-0 mb-2"
							style={{
								width: node.circleSize,
								height: node.circleSize,
								fontSize: node.circleSize * 0.42,
								backgroundColor: color,
								clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
							}}
						>
							{index + 1}
						</div>
						<div
							className={cn('flex items-center', isHorizontal ? 'w-full h-3' : 'w-3 self-stretch')}
							style={{
								backgroundColor: color,
								clipPath: isHorizontal
									? 'polygon(0% 0%, 96% 0%, 100% 50%, 96% 100%, 0% 100%, 4% 50%)'
									: 'polygon(0% 0%, 50% 4%, 100% 0%, 100% 96%, 50% 100%, 0% 96%)',
							}}
						/>
						<div className="flex flex-col items-center text-center mt-2 px-2">
							<StepSlot
								index={index}
								fallback={
									<>
										<span style={{ ...node.titleStyle, ...lineClampStyle(node, 'title') }}>{step.title}</span>
										<span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }}>{step.description}</span>
									</>
								}
							/>
						</div>
					</div>
				)
			})}
		</div>
	)
}

/** Variant #8 — dense "activity log" rows: a numbered gradient chip anchors each row, connected by a slim colored rail, with title and description separated onto their own line for a crisp, modern feed look instead of a bare dot+text line. */
function CompactVariant({ node }: { node: TimelineNode }) {
	const chipSize = Math.max(22, node.circleSize * 0.65)
	return (
		<div className="flex flex-col w-full">
			{node.steps.map((step, index) => {
				const isLastStep = index === node.steps.length - 1
				const color = stepColor(node, index)
				const lineColor = lineColorAfter(node, index)
				return (
					<div key={index} className="flex flex-row items-stretch gap-3 w-full">
						<div className="flex flex-col items-center shrink-0">
							<span
								className="flex items-center justify-center rounded-md font-bold text-white shrink-0"
								style={{ width: chipSize, height: chipSize, background: `linear-gradient(135deg, ${color}, ${color}bb)`, fontSize: chipSize * 0.4 }}
							>
								{index + 1}
							</span>
							{!isLastStep && <div className="w-[2px] flex-1 my-1 rounded-full" style={{ backgroundColor: lineColor, minHeight: 10 }} />}
						</div>
						<div className="flex flex-col pb-3 min-w-0">
							<StepSlot
								index={index}
								fallback={
									<>
										<span style={{ ...node.titleStyle, ...lineClampStyle(node, 'title') }} className="truncate">{step.title}</span>
										<span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }} className="truncate opacity-80">{step.description}</span>
									</>
								}
							/>
						</div>
					</div>
				)
			})}
		</div>
	)
}

/** Variant #9 — a winding vertical S-curve spine with circular icon-style badges alternating left/right of it, each paired with a year-style title and description block. Inspired by classic vertical "excavation timeline" infographics. */
function SCurveSpineVariant({ node }: { node: TimelineNode }) {
	const rowHeight = Math.max(120, node.circleSize * 3.2)
	const spineWidth = 64
	return (
		<div className="relative flex flex-col w-full" style={{ minWidth: 260 }}>
			<svg
				className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"
				width={spineWidth}
				height={rowHeight * node.steps.length}
				viewBox={`0 0 ${spineWidth} ${rowHeight * node.steps.length}`}
				preserveAspectRatio="none"
			>
				<path
					d={node.steps.map((_, i) => {
						const y0 = i * rowHeight
						const y1 = y0 + rowHeight
						const cx = i % 2 === 0 ? spineWidth : 0
						return i === 0
							? `M ${spineWidth / 2} ${y0} C ${cx} ${y0 + rowHeight * 0.3}, ${cx} ${y1 - rowHeight * 0.3}, ${spineWidth / 2} ${y1}`
							: `C ${cx} ${y0 + rowHeight * 0.3}, ${cx} ${y1 - rowHeight * 0.3}, ${spineWidth / 2} ${y1}`
					}).join(' ')}
					fill="none"
					stroke={node.inactiveColor}
					strokeWidth={3}
				/>
			</svg>
			{node.steps.map((step, index) => {
				const color = stepColor(node, index)
				const alignRight = index % 2 === 1
				return (
					<div key={index} className="relative flex items-center w-full" style={{ height: rowHeight }}>
						<div
							className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full text-white font-semibold z-10 shrink-0"
							style={{ width: node.circleSize, height: node.circleSize, backgroundColor: color, fontSize: node.circleSize * 0.4 }}
						>
							{index + 1}
						</div>
						<div className={cn('flex flex-col w-[calc(50%-40px)]', alignRight ? 'ml-auto items-start text-left pl-8' : 'mr-auto items-end text-right pr-8')}>
							<StepSlot
								index={index}
								fallback={
									<>
										<span style={{ ...node.titleStyle, fontSize: (parseInt(String(node.titleStyle?.fontSize ?? 16)) || 16) * 1.3, ...lineClampStyle(node, 'title') }}>{step.title}</span>
										<span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }}>{step.description}</span>
									</>
								}
							/>
						</div>
					</div>
				)
			})}
		</div>
	)
}

/** Variant #10 — a horizontal wavy ribbon connecting circular step markers that alternate above/below the wave crest, labels stacked beneath each marker. Inspired by sine-wave "connected circle" infographics. */
function WavyRibbonVariant({ node }: { node: TimelineNode }) {
	const stepWidth = 160
	const width = Math.max(stepWidth * node.steps.length, 320)
	const amplitude = 28
	const midY = 60
	return (
		<div className="w-full overflow-x-auto no-scrollbar">
			<div className="relative" style={{ width, minWidth: '100%', height: midY * 2 + 90 }}>
				<svg className="absolute top-0 left-0 pointer-events-none" width={width} height={midY * 2} viewBox={`0 0 ${width} ${midY * 2}`} preserveAspectRatio="none">
					<path
						d={`M 0 ${midY} ${node.steps.map((_, i) => {
							const x = ((i + 1) - 0.5) * (width / node.steps.length)
							const y = i % 2 === 0 ? midY - amplitude : midY + amplitude
							return `Q ${x - stepWidth / 4} ${y}, ${x} ${midY}`
						}).join(' ')}`}
						fill="none"
						stroke={node.inactiveColor}
						strokeWidth={3}
					/>
				</svg>
				{node.steps.map((step, index) => {
					const color = stepColor(node, index)
					const x = (index + 0.5) * (width / node.steps.length)
					const isUp = index % 2 === 0
					return (
						<div key={index} className="absolute flex flex-col items-center text-center" style={{ left: x, top: isUp ? midY - amplitude - node.circleSize / 2 : midY + amplitude - node.circleSize / 2, transform: 'translateX(-50%)', width: stepWidth - 16 }}>
							<div
								className="flex items-center justify-center rounded-full text-white font-semibold shrink-0"
								style={{ width: node.circleSize, height: node.circleSize, backgroundColor: color, fontSize: node.circleSize * 0.42 }}
							>
								{index + 1}
							</div>
							<div className={cn('flex flex-col items-center mt-1.5', isUp ? '' : '')}>
								<StepSlot
									index={index}
									fallback={
										<>
											<span style={{ ...node.titleStyle, ...lineClampStyle(node, 'title') }}>{step.title}</span>
											<span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }}>{step.description}</span>
										</>
									}
								/>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

/** Variant #11 — each step rendered as a ribbon/banner-shaped label (cut flag ends) stacked vertically along a dotted spine. Inspired by "ribbon banner" vertical infographics. */
function RibbonBannerVariant({ node }: { node: TimelineNode }) {
	const slots = useTimelineSlots()
	return (
		<div className="flex flex-col w-full gap-3">
			{node.steps.map((step, index) => {
				const color = stepColor(node, index)
				// The ribbon flag is chrome: it carries the numeral when the step's
				// own title lives in the block below it.
				const slot = slots[index]
				const ribbonStyle: React.CSSProperties = {
					backgroundColor: color,
					fontSize: (parseInt(String(node.titleStyle?.fontSize ?? 16)) || 16) * 1.1,
					clipPath: 'polygon(0% 0%, 92% 0%, 100% 50%, 92% 100%, 0% 100%)',
					minWidth: slot ? 72 : 140,
					...lineClampStyle(node, 'title'),
				}
				return (
					<div key={index} className="flex flex-col items-stretch w-full">
						<div className="flex items-center justify-center text-white font-bold px-6 py-2 self-start" style={ribbonStyle}>
							{slot ? index + 1 : step.title}
						</div>
						<div className="flex flex-row items-start gap-3 pl-4 pt-1.5">
							<span className="rounded-full shrink-0 mt-1" style={{ width: 8, height: 8, backgroundColor: color }} />
							{slot ?? <span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }}>{step.description}</span>}
						</div>
					</div>
				)
			})}
		</div>
	)
}

/** Variant #12 — a central vertical spine with short side-branch connectors leading to labeled nodes and icon circles, alternating left/right. Inspired by "connector with icon nodes" vertical infographics. */
function IconBranchRailVariant({ node }: { node: TimelineNode }) {
	return (
		<div className="relative flex flex-col w-full" style={{ minWidth: 280 }}>
			<div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px]" style={{ backgroundColor: node.inactiveColor }} />
			{node.steps.map((step, index) => {
				const color = stepColor(node, index)
				const alignRight = index % 2 === 1
				return (
					<div key={index} className="relative flex items-center w-full py-4">
						<div className={cn('flex items-center w-1/2', alignRight ? 'order-2 flex-row pl-6' : 'order-1 flex-row-reverse pr-6 ml-auto')}>
							<div className={cn('h-[2px] flex-1', alignRight ? '' : '')} style={{ backgroundColor: color }} />
							<div
								className="flex items-center justify-center rounded-full text-white font-semibold shrink-0 mx-2"
								style={{ width: node.circleSize, height: node.circleSize, backgroundColor: color, fontSize: node.circleSize * 0.4 }}
							>
								{index + 1}
							</div>
						</div>
						<div className={cn('flex flex-col w-1/2', alignRight ? 'order-1 items-end text-right pr-4' : 'order-2 items-start text-left pl-4 ml-auto')}>
							<StepSlot
								index={index}
								fallback={
									<>
										<span style={{ ...node.titleStyle, ...lineClampStyle(node, 'title') }}>{step.title}</span>
										<span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }}>{step.description}</span>
									</>
								}
							/>
						</div>
					</div>
				)
			})}
		</div>
	)
}

/** Variant #13 — a single horizontal axis with small arrow-pointer connectors leading up/down to alternating label blocks above and below the line. Inspired by "horizontal timeline with arrow callouts" infographics. */
function ArrowAxisVariant({ node }: { node: TimelineNode }) {
	const dotSize = Math.max(10, node.circleSize * 0.35)
	return (
		<div className="flex w-full flex-wrap items-end" style={{ minHeight: 180 }}>
			{node.steps.map((step, index) => {
				const color = stepColor(node, index)
				const isUp = index % 2 === 0
				return (
					<div key={index} className="flex flex-col items-center flex-1 relative" style={{ minWidth: 110 }}>
						<div className={cn('flex flex-col items-center text-center px-1', isUp ? 'order-1 mb-1' : 'order-3 mt-1')} style={{ visibility: 'visible' }}>
							<StepSlot
								index={index}
								fallback={
									<>
										<span style={{ ...node.titleStyle, ...lineClampStyle(node, 'title') }}>{step.title}</span>
										<span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }}>{step.description}</span>
									</>
								}
							/>
						</div>
						<div className={cn('w-[2px]', isUp ? 'order-2' : 'order-2')} style={{ height: 22, backgroundColor: color }} />
						<div className="order-2 flex items-center w-full" style={{ position: 'relative', top: isUp ? undefined : undefined }}>
							<div className="flex-1 h-[2px]" style={{ backgroundColor: node.inactiveColor }} />
							<span className="rounded-full shrink-0" style={{ width: dotSize, height: dotSize, backgroundColor: color }} />
							<div className="flex-1 h-[2px]" style={{ backgroundColor: node.inactiveColor }} />
						</div>
					</div>
				)
			})}
		</div>
	)
}

/** Variant #14 — large outlined ring markers riding a gentle sine-wave path, each ring holding the step's number/label pair above/below. Inspired by "wavy connected circles" infographics. */
function WavyCirclesVariant({ node }: { node: TimelineNode }) {
	const stepWidth = 170
	const width = Math.max(stepWidth * node.steps.length, 320)
	const amplitude = 34
	const midY = 70
	const ringSize = node.circleSize * 1.5
	return (
		<div className="w-full overflow-x-auto no-scrollbar">
			<div className="relative" style={{ width, minWidth: '100%', height: midY * 2 + 60 }}>
				<svg className="absolute top-0 left-0 pointer-events-none" width={width} height={midY * 2} viewBox={`0 0 ${width} ${midY * 2}`} preserveAspectRatio="none">
					<path
						d={`M 0 ${midY} ${node.steps.map((_, i) => {
							const x = ((i + 1) - 0.5) * (width / node.steps.length)
							const y = i % 2 === 0 ? midY - amplitude : midY + amplitude
							return `Q ${x - stepWidth / 4} ${y}, ${x} ${midY}`
						}).join(' ')}`}
						fill="none"
						stroke={node.inactiveColor}
						strokeWidth={2}
					/>
				</svg>
				{node.steps.map((step, index) => {
					const color = stepColor(node, index)
					const x = (index + 0.5) * (width / node.steps.length)
					const isUp = index % 2 === 0
					return (
						<div key={index} className="absolute flex flex-col items-center text-center" style={{ left: x, top: midY - ringSize / 2, transform: 'translateX(-50%)', width: stepWidth - 10 }}>
							<div
								className={cn('flex flex-col items-center text-center absolute', isUp ? '' : '')}
								style={{ top: isUp ? -44 : ringSize + 8, width: stepWidth - 10 }}
							>
								<StepSlot
									index={index}
									fallback={
										<>
											<span style={{ ...node.titleStyle, ...lineClampStyle(node, 'title') }}>{step.title}</span>
											<span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }}>{step.description}</span>
										</>
									}
								/>
							</div>
							<div
								className="flex items-center justify-center rounded-full font-bold shrink-0 bg-white"
								style={{ width: ringSize, height: ringSize, border: `4px solid ${color}`, color, fontSize: ringSize * 0.32 }}
							>
								{index + 1}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

/** Variant #15 — a thin dotted axis with step markers on top, and a bold gradient "loading" progress bar beneath showing overall completion (activeStepCount / steps.length). Inspired by "loading bar timeline" infographics. */
function LoadingBarVariant({ node }: { node: TimelineNode }) {
	const percent = node.steps.length > 0 ? Math.round((node.activeStepCount / node.steps.length) * 100) : 0
	return (
		<div className="flex flex-col w-full gap-6">
			<div className="flex w-full flex-wrap items-start" style={{ minHeight: 90 }}>
				{node.steps.map((step, index) => {
					const color = stepColor(node, index)
					return (
						<div key={index} className="flex flex-col items-start flex-1" style={{ minWidth: 90 }}>
							<StepSlot
								index={index}
								fallback={
									<>
										<span style={{ ...node.titleStyle, ...lineClampStyle(node, 'title') }}>{step.title}</span>
										<span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }}>{step.description}</span>
									</>
								}
							/>
							<div className="flex items-center w-full mt-2">
								<span className="rounded-full shrink-0" style={{ width: 12, height: 12, border: `2px solid ${color}`, backgroundColor: 'white' }} />
								{index < node.steps.length - 1 && <div className="flex-1 h-px" style={{ borderTop: `2px dotted ${node.inactiveColor}` }} />}
							</div>
						</div>
					)
				})}
			</div>
			<div className="flex items-stretch w-full rounded-md overflow-hidden" style={{ height: Math.max(36, node.circleSize) }}>
				<div
					className="flex items-center justify-center text-white font-bold uppercase tracking-wide text-sm"
					style={{ width: `${Math.max(percent, 8)}%`, background: `linear-gradient(90deg, ${node.activeColor}, ${node.inactiveColor})` }}
				>
					{percent}%
				</div>
				<div className="flex-1" style={{ backgroundColor: `${node.inactiveColor}22` }} />
			</div>
		</div>
	)
}

/** Variant #16 — a single top axis line with small diamond/pill markers, each connected by a short vertical stem to a label block alternating above/below. Inspired by "horizontal pill timeline" infographics. */
function AxisPillsVariant({ node }: { node: TimelineNode }) {
	return (
		<div className="flex flex-col w-full">
			<div className="flex w-full items-center relative" style={{ height: 4 }}>
				<div className="absolute left-0 right-0 h-[2px]" style={{ backgroundColor: node.inactiveColor }} />
			</div>
			<div className="flex w-full flex-wrap">
				{node.steps.map((step, index) => {
					const color = stepColor(node, index)
					const isUp = index % 2 === 0
					return (
						<div key={index} className="flex flex-col items-center flex-1 relative" style={{ minWidth: 100 }}>
							<div className="absolute" style={{ top: -4 }}>
								<span className="block rounded-full shrink-0" style={{ width: 12, height: 12, backgroundColor: color, transform: 'rotate(45deg)' }} />
							</div>
							<div className={cn('flex flex-col items-center text-center px-1', isUp ? 'mt-4' : 'mt-4')}>
								<div className="w-[2px] mx-auto mb-1" style={{ height: 18, backgroundColor: color }} />
								<StepSlot
									index={index}
									fallback={
										<>
											<span style={{ ...node.titleStyle, ...lineClampStyle(node, 'title') }}>{step.title}</span>
											<span style={{ ...node.descriptionStyle, ...lineClampStyle(node, 'description') }}>{step.description}</span>
										</>
									}
								/>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

// Kept referenced so TS doesn't complain about the exported type if unused elsewhere.
export type { TimelineStep }
