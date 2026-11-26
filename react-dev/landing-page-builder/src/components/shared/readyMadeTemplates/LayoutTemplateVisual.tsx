import React, { createContext, useContext, useState } from 'react'
import type { LayoutColumn, LayoutTemplateNode } from '@/types/node.type'
import { lineClampStyle } from '@/components/PropertyPanelUI/Sections/relatedComponents/LineClampControl'
import { textStylesFor } from '@/components/PropertyPanelUI/Sections/relatedComponents/TypographyControl'

/** The layout's already-rendered child nodes: [heading, column0, column1, ...]
 * — each column a block holding its own image/title/description. Passed via
 * context; the 8 variants below draw their chrome around the block and fall
 * back to the flat fields for layouts saved before this existed. */
const LayoutSlotsContext = createContext<React.ReactNode[]>([])

function useLayoutSlot(index: number): React.ReactNode | undefined {
	const slots = useContext(LayoutSlotsContext)
	return slots[index] ?? undefined
}

/** The heading shows when there's flat text or a real heading node. */
function useShowHeading(heading: string): boolean {
	const slot = useLayoutSlot(0)
	return Boolean(heading) || Boolean(slot)
}

/** The heading node, or the variant's own tag and flat text. A filled slot
 * uses <div> since a node can't nest inside <p>/<span>. */
function LayoutHeading({ as: Tag, children, ...rest }: { as: 'span' | 'p' | 'div' | 'h3'; children?: React.ReactNode } & React.HTMLAttributes<HTMLElement>) {
	const filled = useLayoutSlot(0)
	const Element = (filled ? 'div' : Tag) as React.ElementType
	return <Element {...rest}>{filled ?? children}</Element>
}

/** A column's block node, or `fallback` (the variant's hardcoded markup). */
function ColumnSlot({ index, fallback }: { index: number; fallback: React.ReactNode }) {
	const slot = useLayoutSlot(index + 1)
	return <>{slot ?? fallback}</>
}

/**
 * Pure "visual" component for the layoutTemplate content type — data in,
 * JSX out. No drag/drop/popover/canvas wiring here; that lives in the shell
 * component that wraps this one (see Faq/FaqList for the split pattern).
 *
 * Each variant derives its palette from the node's own accentColor /
 * accentColorSecondary fields — see LayoutTemplateNode in
 * src/types/node.type.ts for the shape. accentColor drives solid-color uses
 * (rules, badges, text); accentColorSecondary is only ever paired with
 * accentColor as a gradient end-stop.
 *
 * `slots` is the rendered child tree (a heading node plus one selectable
 * block per column); legacy layouts pass none and render flat fields instead.
 */
export function LayoutTemplateVisual({ node, slots }: { node: LayoutTemplateNode; slots?: React.ReactNode }) {
	return (
		<LayoutSlotsContext.Provider value={React.Children.toArray(slots)}>
			<LayoutTemplateLayout node={node} />
		</LayoutSlotsContext.Provider>
	)
}

function LayoutTemplateLayout({ node }: { node: LayoutTemplateNode }) {
	const columns = node.columns ?? []
	const heading = node.heading

	switch (node.uiType) {
		case 'threeColumnEven':
			return <ThreeColumnEvenVariant heading={heading} columns={columns} node={node} />
		case 'imageLeftText':
			return <ImageLeftTextVariant heading={heading} columns={columns} node={node} />
		case 'stackedCentered':
			return <StackedCenteredVariant heading={heading} columns={columns} node={node} />
		case 'sidebarContent':
			return <SidebarContentVariant heading={heading} columns={columns} node={node} />
		case 'gridFour':
			return <GridFourVariant heading={heading} columns={columns} node={node} />
		case 'alternatingRows':
			return <AlternatingRowsVariant heading={heading} columns={columns} node={node} />
		case 'fullWidthBanner':
			return <FullWidthBannerVariant heading={heading} columns={columns} node={node} />
		case 'twoColumnTextImage':
		default:
			return <TwoColumnTextImageVariant heading={heading} columns={columns} node={node} />
	}
}

type VariantProps = { heading: string, columns: LayoutColumn[] }

function gradient(node: LayoutTemplateNode, angle = 135) {
	return `linear-gradient(${angle}deg, ${node.accentColor}, ${node.accentColorSecondary})`
}

/** 1. twoColumnTextImage — a single side-by-side pairing: text block on the
 * left, one image on the right (drawn from the first column with an image,
 * or a gradient stand-in), the rest of the columns listed below as plain
 * text rows. Wraps to a stack at narrow widths. */
function TwoColumnTextImageVariant({ heading, columns, node }: VariantProps & { node: LayoutTemplateNode }) {
	// const lead = columns
	const rest = columns.slice(1)
	const showHeading = useShowHeading(heading)
	return (
		<div className="w-full flex flex-col gap-6">
			{showHeading && <LayoutHeading as="h3" className="text-2xl font-semibold" style={{ color: '#1a1a1a', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{heading}</LayoutHeading>}
			{columns && ( columns.map((lead, index)=>{
				return (
					<div key={index} className="flex flex-wrap gap-6 items-center">
					<ColumnSlot
						index={index}
						fallback={
							<div className="flex flex-col gap-2" style={{ flex: '1 1 260px', minWidth: 220 }}>
								<span className="font-semibold" style={{ fontSize: 18, color: '#1a1a1a', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{lead.title}</span>
								<span style={{ fontSize: 14, color: '#5a5a5a', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{lead.description}</span>
							</div>
						}
					/>
					<div
						className="overflow-hidden"
						style={{
							flex: '1 1 260px', minWidth: 220, height: 200, borderRadius: 12,
							backgroundImage: lead.imageUrl ? `url("${lead.imageUrl}")` : gradient(node),
							backgroundSize: 'cover', backgroundPosition: 'center',
						}}
					/>
				</div>
				)
			})

			)}
			{/* {rest.length > 0 && (
				<div className="flex flex-col gap-3">
					{rest.map((col, i) => (
						<div key={i} className="flex flex-col gap-1" style={{ borderTop: '1px solid #ececec', paddingTop: 12 }}>
							<span className="font-semibold" style={{ fontSize: 15, color: '#1a1a1a' }}>{col.title}</span>
							<span style={{ fontSize: 13, color: '#5a5a5a' }}>{col.description}</span>
						</div>
					))}
				</div>
			)} */}
		</div>
	)
}

/** 2. threeColumnEven — an evenly-spaced multi-column grid, each column
 * identical width, centered text, thin top rule as the only ornament. */
function ThreeColumnEvenVariant({ heading, columns, node }: VariantProps & { node: LayoutTemplateNode }) {
	const showHeading = useShowHeading(heading)
	return (
		<div className="w-full flex flex-col gap-6">
			{showHeading && <LayoutHeading as="h3" className="text-2xl font-semibold text-center" style={{ color: '#1a1a1a', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{heading}</LayoutHeading>}
			<div className="grid gap-6" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${columns.length > 1 ? 180 : 260}px, 1fr))` }}>
				{columns.map((col, i) => (
					<div key={i} className="flex flex-col items-center text-center gap-2 px-2">
						{/* The accent rule is ornament, so it stays above the block. */}
						<div style={{ width: 32, height: 3, backgroundColor: node.accentColor, borderRadius: 2 }} />
						<ColumnSlot
							index={i}
							fallback={
								<>
									{col.imageUrl && <img src={col.imageUrl} alt={col.title} className="w-full h-24 object-cover" style={{ borderRadius: 8 }} />}
									<span className="font-semibold" style={{ fontSize: 16, color: '#1a1a1a', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{col.title}</span>
									<span style={{ fontSize: 13, color: '#5a5a5a', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{col.description}</span>
								</>
							}
						/>
					</div>
				))}
			</div>
		</div>
	)
}

/** 3. imageLeftText — every column renders as a full-width row with a fixed
 * square image tile pinned to the left and text filling the remaining
 * width, all rows left-aligned (mirror composition of horizontalRow). */
function ImageLeftTextVariant({ heading, columns, node }: VariantProps & { node: LayoutTemplateNode }) {
	const showHeading = useShowHeading(heading)
	return (
		<div className="w-full flex flex-col gap-5">
			{showHeading && <LayoutHeading as="h3" className="text-2xl font-semibold" style={{ color: '#1a1a1a', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{heading}</LayoutHeading>}
			<div className="flex flex-col gap-4">
				{columns.map((col, i) => (
					<div key={i} className="flex flex-wrap items-center gap-4">
						<div
							className="flex-shrink-0 overflow-hidden flex items-center justify-center"
							style={{ width: 88, height: 88, borderRadius: 10, backgroundColor: `${node.accentColor}14` }}
						>
							{col.imageUrl ? (
								<img src={col.imageUrl} alt={col.title} className="w-full h-full object-cover" />
							) : (
								<span className="font-bold" style={{ color: node.accentColor, fontSize: 24 }}>{i + 1}</span>
							)}
						</div>
						<ColumnSlot
							index={i}
							fallback={
								<div className="flex flex-col gap-1" style={{ flex: '1 1 200px', minWidth: 180 }}>
									<span className="font-semibold" style={{ fontSize: 16, color: '#1a1a1a', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{col.title}</span>
									<span style={{ fontSize: 13, color: '#5a5a5a', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{col.description}</span>
								</div>
							}
						/>
					</div>
				))}
			</div>
		</div>
	)
}

/** 4. stackedCentered — one narrow centered column: heading, then each
 * layout column stacked vertically, everything center-aligned, no grid. */
function StackedCenteredVariant({ heading, columns, node }: VariantProps & { node: LayoutTemplateNode }) {
	const showHeading = useShowHeading(heading)
	return (
		<div className="w-full flex flex-col items-center gap-5" style={{ maxWidth: 520, marginInline: 'auto' }}>
			{showHeading && <LayoutHeading as="h3" className="text-2xl font-semibold text-center" style={{ color: '#1a1a1a', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{heading}</LayoutHeading>}
			{columns.map((col, i) => (
				<div key={i} className="flex flex-col items-center text-center gap-2 w-full">
					<ColumnSlot
						index={i}
						fallback={
							<>
								{col.imageUrl && (
									<img src={col.imageUrl} alt={col.title} className="object-cover" style={{ width: 96, height: 96, borderRadius: '50%' }} />
								)}
								<span className="font-semibold" style={{ fontSize: 16, color: '#1a1a1a', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{col.title}</span>
								<span style={{ fontSize: 13, color: '#5a5a5a', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{col.description}</span>
							</>
						}
					/>
					{/* The hairline separator is ornament between blocks. */}
					{i < columns.length - 1 && <div className="w-8 h-px" style={{ backgroundColor: '#e0e0e0', marginTop: 4 }} />}
				</div>
			))}
		</div>
	)
}

/** 5. sidebarContent — narrow vertical nav-like sidebar listing every
 * column's title, with the selected column's full description shown as a
 * larger content pane beside it — genuinely two-pane, not a grid. Clicking a
 * sidebar row switches which column's content the pane shows. */
function SidebarContentVariant({ heading, columns, node }: VariantProps & { node: LayoutTemplateNode }) {
	const accent = node.accentColor
	const [activeIndex, setActiveIndex] = useState(0)
	const main = columns[activeIndex] ?? columns[0]
	const showHeading = useShowHeading(heading)
	return (
		<div className="w-full flex flex-wrap gap-6">
			<div
				className="flex flex-col gap-1"
				style={{ flex: '1 1 160px', minWidth: 160, maxWidth: 220, borderRight: '1px solid #ececec', paddingRight: 16 }}
			>
				{showHeading && <LayoutHeading as="span" className="font-semibold" style={{ fontSize: 13, color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: 0.5, ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{heading}</LayoutHeading>}
				{columns.map((col, i) => (
					<button
						key={i}
						type="button"
						onClick={(e) => { e.stopPropagation(); setActiveIndex(i) }}
						className="py-1.5 px-2 rounded text-left border-none bg-transparent cursor-pointer w-full"
						style={{ backgroundColor: i === activeIndex ? `${accent}14` : 'transparent', borderLeft: i === activeIndex ? `3px solid ${accent}` : '3px solid transparent' }}
					>
						{/* The nav row stays flat text — the title slot is a real node and
						    belongs in the pane, not inside this clickable button. */}
						<span style={{ fontSize: 13, fontWeight: i === activeIndex ? 600 : 500, color: i === activeIndex ? accent : '#5a5a5a', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{col.title}</span>
					</button>
				))}
			</div>
			<div className="flex flex-col gap-3" style={{ flex: '2 1 260px', minWidth: 240 }}>
				{main?.imageUrl && (
					<div className="overflow-hidden" style={{ height: 160, borderRadius: 10, backgroundImage: `url("${main.imageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
				)}
				{main && (
					<ColumnSlot
						index={activeIndex}
						fallback={
							<>
								<span className="font-semibold" style={{ fontSize: 18, color: '#1a1a1a', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{main.title}</span>
								<span style={{ fontSize: 14, color: '#5a5a5a', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{main.description}</span>
							</>
						}
					/>
				)}
			</div>
		</div>
	)
}

/** 6. gridFour — dense uniform card grid (auto-fit, small tiles), bordered
 * squares each holding an image thumbnail and short text — a denser, more
 * grid-like composition than threeColumnEven's airy centered columns. */
function GridFourVariant({ heading, columns, node }: VariantProps & { node: LayoutTemplateNode }) {
	const showHeading = useShowHeading(heading)
	return (
		<div className="w-full flex flex-col gap-4">
			{showHeading && <LayoutHeading as="h3" className="text-2xl font-semibold" style={{ color: '#1a1a1a', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{heading}</LayoutHeading>}
			<div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${columns.length > 1 ? 140 : 220}px, 1fr))` }}>
				{columns.map((col, i) => (
					<div key={i} className="flex flex-col gap-2 p-3" style={{ border: '1px solid #e2e2e2', borderRadius: 8, backgroundColor: '#ffffff' }}>
						<div
							className="overflow-hidden"
							style={{
								height: 90, borderRadius: 6,
								backgroundImage: col.imageUrl ? `url("${col.imageUrl}")` : `linear-gradient(135deg, hsl(${(i * 67) % 360} 55% 45%), hsl(${(i * 67 + 40) % 360} 55% 30%))`,
								backgroundSize: 'cover', backgroundPosition: 'center',
							}}
						/>
						<ColumnSlot
							index={i}
							fallback={
								<>
									<span className="font-semibold" style={{ fontSize: 14, color: '#1a1a1a', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{col.title}</span>
									<span style={{ fontSize: 12, color: '#5a5a5a', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{col.description}</span>
								</>
							}
						/>
					</div>
				))}
			</div>
		</div>
	)
}

/** 7. alternatingRows — each column is a full-width row whose image and
 * text swap sides on every other row (zigzag), unlike imageLeftText's
 * fixed left placement. */
function AlternatingRowsVariant({ heading, columns, node }: VariantProps & { node: LayoutTemplateNode }) {
	const showHeading = useShowHeading(heading)
	return (
		<div className="w-full flex flex-col gap-8">
			{showHeading && <LayoutHeading as="h3" className="text-2xl font-semibold text-center" style={{ color: '#1a1a1a', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{heading}</LayoutHeading>}
			{columns.map((col, i) => {
				const reversed = i % 2 === 1
				return (
					<div key={i} className="flex flex-wrap gap-6 items-center h-full " style={{ flexDirection: reversed ? 'row-reverse' : 'row' }}>
						<div
							className="overflow-hidden h-full "
							style={{
								flex: '1 1 240px', minWidth: 200, minHeight: 170, borderRadius: 12,
								backgroundImage: col.imageUrl ? `url("${col.imageUrl}")` : (i % 2 === 0 ? gradient(node) : gradient(node, 315)),
								backgroundSize: 'cover', backgroundPosition: 'center',
							}}
						/>
						<ColumnSlot
							index={i}
							fallback={
								<div className="flex flex-col gap-2" style={{ flex: '1 1 240px', minWidth: 200 }}>
									<span className="font-semibold" style={{ fontSize: 17, color: '#1a1a1a', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{col.title}</span>
									<span style={{ fontSize: 14, color: '#5a5a5a', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{col.description}</span>
								</div>
							}
						/>
					</div>
				)
			})}
		</div>
	)
}

/** 8. fullWidthBanner — a single edge-to-edge dark banner surface carrying
 * the heading, with the columns rendered as light chips/stats laid out
 * inline across the bottom of the banner rather than as cards. */
function FullWidthBannerVariant({ heading, columns, node }: VariantProps & { node: LayoutTemplateNode }) {
	const showHeading = useShowHeading(heading)
	return (
		<div
			className="w-full flex flex-col gap-6 p-8"
			style={{ borderRadius: 14, background: gradient(node) }}
		>
			{showHeading && <LayoutHeading as="h3" className="text-2xl font-semibold" style={{ color: '#ffffff', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{heading}</LayoutHeading>}
			<div className="flex flex-wrap gap-4">
				{columns.map((col, i) => (
					<ColumnSlot
						key={i}
						index={i}
						fallback={
							<div
								className="flex flex-col gap-1 p-4"
								style={{ flex: '1 1 200px', minWidth: 180, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(2px)' }}
							>
								{col.imageUrl && (
									<img src={col.imageUrl} alt={col.title} className="w-10 h-10 object-cover rounded-full mb-1" />
								)}
								<span className="font-semibold" style={{ fontSize: 15, color: '#ffffff', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{col.title}</span>
								<span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{col.description}</span>
							</div>
						}
					/>
				))}
			</div>
		</div>
	)
}
