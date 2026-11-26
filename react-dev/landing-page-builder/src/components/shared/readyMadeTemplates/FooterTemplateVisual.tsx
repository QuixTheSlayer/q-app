import React, { createContext, useContext } from 'react'
import type { FooterTemplateNode, FooterColumn } from '@/types/node.type'
import { FOOTER_COLUMNS_OFFSET } from '@/utils/footerSlots'
import { lineClampStyle } from '@/components/PropertyPanelUI/Sections/relatedComponents/LineClampControl'
import { textStylesFor } from '@/components/PropertyPanelUI/Sections/relatedComponents/TypographyControl'
import { isEditorPage } from '@/utils/checkPage'

/** Rendered children: [brand, tagline, copyright, column0, ...]. Empty for legacy nodes. */
const FooterSlotsContext = createContext<React.ReactNode[]>([])

function useFooterSlots(): React.ReactNode[] {
	return useContext(FooterSlotsContext)
}

/** A slot node, or `fallback` — the variant's original markup. */
function Slot({ index, fallback }: { index: number; fallback: React.ReactNode }) {
	const slot = useFooterSlots()[index] ?? undefined
	return <>{slot ?? fallback}</>
}

/** Column blocks start after brand/tagline/copyright. */
function ColumnSlot({ index, fallback }: { index: number; fallback: React.ReactNode }) {
	return <Slot index={index + FOOTER_COLUMNS_OFFSET} fallback={fallback} />
}

/**
 * Pure "visual" component for the "footerTemplate" content type's Ready Made
 * Templates — data-in, JSX-out, no drag/drop/popover/canvas wiring (that
 * lives in the shell component, following the Faq/FaqList split pattern).
 * Switches on node.uiType to render one of 8 genuinely distinct
 * compositions, all driven only by the node's own data fields (brand,
 * tagline, columns, copyrightText, accentColor, accentColorSecondary) — see
 * FooterTemplateNode in src/types/node.type.ts for the shape.
 *
 * accentColor drives every solid-color accent use (badges, rules, CTA
 * buttons); accentColorSecondary is only ever paired with accentColor as a
 * gradient end-stop (linear-gradient(angle, accentColor,
 * accentColorSecondary)) — no other hardcoded palette colors are used for
 * the node's own accent.
 */
export function FooterTemplateVisual({ node, isEditing = isEditorPage, slots }: { node: FooterTemplateNode; isEditing?: boolean; slots?: React.ReactNode }) {
	return (
		<FooterSlotsContext.Provider value={React.Children.toArray(slots)}>
			<FooterTemplateLayout node={node} isEditing={isEditing} />
		</FooterSlotsContext.Provider>
	)
}

function FooterTemplateLayout({ node, isEditing }: { node: FooterTemplateNode; isEditing?: boolean }) {
	switch (node.uiType) {
		case 'centeredMinimal':
			return <CenteredMinimalFooter node={node} isEditing={isEditing} />
		case 'darkMega':
			return <DarkMegaFooter node={node} isEditing={isEditing} />
		case 'ctaBanner':
			return <CtaBannerFooter node={node} isEditing={isEditing} />
		case 'socialFocus':
			return <SocialFocusFooter node={node} isEditing={isEditing} />
		case 'twoColumnSplit':
			return <TwoColumnSplitFooter node={node} isEditing={isEditing} />
		case 'compactBar':
			return <CompactBarFooter node={node} isEditing={isEditing} />
		case 'brandSidebar':
			return <BrandSidebarFooter node={node} isEditing={isEditing} />
		case 'classicColumns':
		default:
			return <ClassicColumnsFooter node={node} isEditing={isEditing} />
	}
}

function gradient(node: FooterTemplateNode, angle = 135) {
	return `linear-gradient(${angle}deg, ${node.accentColor}, ${node.accentColorSecondary})`
}

/** Wraps the copyright line with the organizer credit at the left, when
 * enabled — else renders the copyright alone, unchanged. */
function FooterBottomBar({ node, children }: { node: FooterTemplateNode; children: React.ReactNode }) {
	if (!node.showOrganizer || !node.organizerText) return <>{children}</>
	return (
		<div className="w-full flex flex-wrap items-center justify-between gap-2">
			<span style={{ fontSize: 12, color: '#8a8a8a' }}>{node.organizerText}</span>
			{children}
		</div>
	)
}

/** Variant #1 — classicColumns: brand+tagline on the left, link columns laid out in a responsive auto-fit grid, copyright rule at the bottom. */
function ClassicColumnsFooter({ node, isEditing }: { node: FooterTemplateNode; isEditing?: boolean }) {
	return (
		<div className="flex flex-col w-full gap-6">
			<div aria-hidden="true" className="w-full" style={{ height: 3, background: gradient(node, 90) }} />
			<div
				className="w-full grid gap-6"
				style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}
			>
				<div className="flex flex-col gap-2 min-w-0">
					<Slot index={0} fallback={<span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', ...lineClampStyle(node, 'brand'), ...textStylesFor(node, 'brand') }}>{node.brand}</span>} />
					<Slot index={1} fallback={<span style={{ fontSize: 13, color: '#6b6b6b', ...lineClampStyle(node, 'tagline'), ...textStylesFor(node, 'tagline') }}>{node.tagline}</span>} />
				</div>
				{node.columns.map((column, index) => (
					<ColumnSlot key={index} index={index} fallback={
						<FooterColumnBlock key={index} column={column} node={node} isEditing={isEditing} titleStyle={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 0.4 }} linkStyle={{ fontSize: 13, color: '#6b6b6b' }} />
					} />
				))}
			</div>
			<div className="w-full h-px" style={{ backgroundColor: '#e5e0d8' }} />
			<FooterBottomBar node={node}>
				<Slot index={2} fallback={<span style={{ fontSize: 12, color: '#8a8a8a', ...lineClampStyle(node, 'copyrightText'), ...textStylesFor(node, 'copyrightText') }}>{node.copyrightText}</span>} />
			</FooterBottomBar>
		</div>
	)
}

/** Variant #2 — centeredMinimal: everything centered in a single narrow stack — brand, tagline, an inline flattened list of all links, then copyright. */
function CenteredMinimalFooter({ node, isEditing }: { node: FooterTemplateNode; isEditing?: boolean }) {
	const allLinks = node.columns.flatMap((c) => c.links)
	// In slot mode the links live inside their column blocks, so the flattened
	// strip renders those blocks instead.
	const hasSlots = useFooterSlots().length > 0
	return (
		<div className="flex flex-col items-center text-center w-full gap-3">
			<Slot index={0} fallback={<span style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', ...lineClampStyle(node, 'brand'), ...textStylesFor(node, 'brand') }}>{node.brand}</span>} />
			<Slot index={1} fallback={<span style={{ fontSize: 13, color: '#6b6b6b', maxWidth: 420, ...lineClampStyle(node, 'tagline'), ...textStylesFor(node, 'tagline') }}>{node.tagline}</span>} />
			<div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-1">
				{hasSlots ? node.columns.map((_, ci) => <ColumnSlot key={ci} index={ci} fallback={null} />) : allLinks.map((link, index) => (
					<a key={index} href={isEditing ? undefined : (link.href || undefined)} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ fontSize: 13, color: '#4a4a4a', textDecoration: 'none', ...lineClampStyle(node, 'columns.links.label'), ...textStylesFor(node, 'columns.links.label') }}>
						{link.label}
					</a>
				))}
			</div>
			<div className="w-16 h-px my-1" style={{ backgroundColor: '#d9d4c9' }} />
			<FooterBottomBar node={node}>
				<Slot index={2} fallback={<span style={{ fontSize: 12, color: '#8a8a8a', ...lineClampStyle(node, 'copyrightText'), ...textStylesFor(node, 'copyrightText') }}>{node.copyrightText}</span>} />
			</FooterBottomBar>
		</div>
	)
}

/** Variant #3 — darkMega: dark inverted background, brand block plus a wide auto-fit grid of columns, heavier visual weight. */
function DarkMegaFooter({ node, isEditing }: { node: FooterTemplateNode; isEditing?: boolean }) {
	return (
		<div className="flex flex-col w-full gap-6 p-6 rounded-lg" style={{ backgroundColor: '#0f1420' }}>
			<div
				className="w-full grid gap-6"
				style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
			>
				<div className="flex flex-col gap-2 min-w-0">
					<Slot index={0} fallback={<span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', ...lineClampStyle(node, 'brand'), ...textStylesFor(node, 'brand') }}>{node.brand}</span>} />
					<Slot index={1} fallback={<span style={{ fontSize: 13, color: '#9aa3b5', ...lineClampStyle(node, 'tagline'), ...textStylesFor(node, 'tagline') }}>{node.tagline}</span>} />
				</div>
				{node.columns.map((column, index) => (
					<ColumnSlot key={index} index={index} fallback={
						<div key={index} className="flex flex-col gap-2 min-w-0">
							<span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.6, ...lineClampStyle(node, 'columns.title'), ...textStylesFor(node, 'columns.title') }}>{column.title}</span>
							<div className="flex flex-col gap-1.5">
								{column.links.map((link, i) => (
									<a key={i} href={isEditing ? undefined : (link.href || undefined)} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ fontSize: 13, color: '#9aa3b5', textDecoration: 'none', ...lineClampStyle(node, 'columns.links.label'), ...textStylesFor(node, 'columns.links.label') }}>
										{link.label}
									</a>
								))}
							</div>
						</div>
					} />
				))}
			</div>
			<div className="w-full h-px" style={{ backgroundColor: '#242c3d' }} />
			<FooterBottomBar node={node}>
				<Slot index={2} fallback={<span style={{ fontSize: 12, color: '#6b7488', ...lineClampStyle(node, 'copyrightText'), ...textStylesFor(node, 'copyrightText') }}>{node.copyrightText}</span>} />
			</FooterBottomBar>
		</div>
	)
}

/** Variant #4 — ctaBanner: a prominent gradient banner up top pitching brand+tagline next to a real clickable action (the first column's first link, if any — no fake signup form since this app has no subscribe feature), link columns below in a lighter auto-fit row, copyright last. */
function CtaBannerFooter({ node, isEditing }: { node: FooterTemplateNode; isEditing?: boolean }) {
	const ctaLink = node.columns[0]?.links[0]
	return (
		<div className="flex flex-col w-full gap-6">
			<div
				className="w-full flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl"
				style={{ background: gradient(node, 120) }}
			>
				<div className="flex flex-col gap-1 min-w-0">
					<Slot index={0} fallback={<span style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', ...lineClampStyle(node, 'brand'), ...textStylesFor(node, 'brand') }}>{node.brand}</span>} />
					<Slot index={1} fallback={<span style={{ fontSize: 13, color: '#e6ebff', ...lineClampStyle(node, 'tagline'), ...textStylesFor(node, 'tagline') }}>{node.tagline}</span>} />
				</div>
				{ctaLink && (
					<a
						href={isEditing ? undefined : (ctaLink.href || undefined)} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
						className="rounded-md px-4 py-2.5 text-sm font-semibold shrink-0 no-underline"
						style={{ backgroundColor: '#0f1420', color: '#ffffff', ...lineClampStyle(node, 'columns.links.label'), ...textStylesFor(node, 'columns.links.label') }}
					>
						{ctaLink.label}
					</a>
				)}
			</div>
			<div
				className="w-full grid gap-5"
				style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}
			>
				{node.columns.map((column, index) => (
					<ColumnSlot key={index} index={index} fallback={
						<FooterColumnBlock key={index} column={column} node={node} isEditing={isEditing} titleStyle={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }} linkStyle={{ fontSize: 13, color: '#6b6b6b' }} />
					} />
				))}
			</div>
			<FooterBottomBar node={node}>
				<Slot index={2} fallback={<span style={{ fontSize: 12, color: '#8a8a8a', ...lineClampStyle(node, 'copyrightText'), ...textStylesFor(node, 'copyrightText') }}>{node.copyrightText}</span>} />
			</FooterBottomBar>
		</div>
	)
}

/** Variant #5 — socialFocus: brand + tagline centered above a row of circular social placeholder badges (derived from column titles), columns condensed into a single wrapping strip. */
function SocialFocusFooter({ node, isEditing }: { node: FooterTemplateNode; isEditing?: boolean }) {
	const allLinks = node.columns.flatMap((c) => c.links)
	// In slot mode the links live inside their column blocks, so the flattened
	// strip renders those blocks instead.
	const hasSlots = useFooterSlots().length > 0
	return (
		<div className="flex flex-col items-center text-center w-full gap-4">
			<Slot index={0} fallback={<span style={{ fontSize: 19, fontWeight: 700, color: '#1a1a1a', ...lineClampStyle(node, 'brand'), ...textStylesFor(node, 'brand') }}>{node.brand}</span>} />
			<Slot index={1} fallback={<span style={{ fontSize: 13, color: '#6b6b6b', maxWidth: 420, ...lineClampStyle(node, 'tagline'), ...textStylesFor(node, 'tagline') }}>{node.tagline}</span>} />
			<div className="flex flex-wrap items-center justify-center gap-3">
				{node.columns.map((column, index) => (
					<span
						key={index}
						title={column.title}
						className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
						style={{ backgroundColor: `${node.accentColor}1a`, color: node.accentColor, fontSize: 13, fontWeight: 700 }}
					>
						{column.title.charAt(0).toUpperCase() || '?'}
					</span>
				))}
			</div>
			<div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
				{hasSlots ? node.columns.map((_, ci) => <ColumnSlot key={ci} index={ci} fallback={null} />) : allLinks.map((link, index) => (
					<a key={index} href={isEditing ? undefined : (link.href || undefined)} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ fontSize: 12, color: '#8a8a8a', textDecoration: 'none', ...lineClampStyle(node, 'columns.links.label'), ...textStylesFor(node, 'columns.links.label') }}>
						{link.label}
					</a>
				))}
			</div>
			<FooterBottomBar node={node}>
				<Slot index={2} fallback={<span style={{ fontSize: 12, color: '#8a8a8a', ...lineClampStyle(node, 'copyrightText'), ...textStylesFor(node, 'copyrightText') }}>{node.copyrightText}</span>} />
			</FooterBottomBar>
		</div>
	)
}

/** Variant #6 — twoColumnSplit: brand block fixed on the left, all footer columns packed into a two-per-row inner grid on the right — a distinct two-zone layout (not just N equal columns). */
function TwoColumnSplitFooter({ node, isEditing }: { node: FooterTemplateNode; isEditing?: boolean }) {
	return (
		<div className="flex flex-col w-full gap-6">
			<div className="flex flex-wrap w-full gap-8">
				<div className="flex flex-col gap-2" style={{ flex: '1 1 220px', minWidth: 200 }}>
					<Slot index={0} fallback={<span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', ...lineClampStyle(node, 'brand'), ...textStylesFor(node, 'brand') }}>{node.brand}</span>} />
					<Slot index={1} fallback={<span style={{ fontSize: 13, color: '#6b6b6b', ...lineClampStyle(node, 'tagline'), ...textStylesFor(node, 'tagline') }}>{node.tagline}</span>} />
				</div>
				<div
					className="grid gap-x-6 gap-y-4"
					style={{ flex: '2 1 320px', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}
				>
					{node.columns.map((column, index) => (
						<ColumnSlot key={index} index={index} fallback={
							<FooterColumnBlock key={index} column={column} node={node} isEditing={isEditing} titleStyle={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }} linkStyle={{ fontSize: 13, color: '#6b6b6b' }} />
						} />
					))}
				</div>
			</div>
			<div className="w-full h-px" style={{ backgroundColor: '#e5e0d8' }} />
			<FooterBottomBar node={node}>
				<Slot index={2} fallback={<span style={{ fontSize: 12, color: '#8a8a8a', ...lineClampStyle(node, 'copyrightText'), ...textStylesFor(node, 'copyrightText') }}>{node.copyrightText}</span>} />
			</FooterBottomBar>
		</div>
	)
}

/** Variant #7 — compactBar: everything squeezed into one dense single-row bar — brand, flattened links, copyright — wrapping onto new lines at narrow widths instead of stacking as blocks. */
function CompactBarFooter({ node, isEditing }: { node: FooterTemplateNode; isEditing?: boolean }) {
	const allLinks = node.columns.flatMap((c) => c.links)
	// In slot mode the links live inside their column blocks, so the flattened
	// strip renders those blocks instead.
	const hasSlots = useFooterSlots().length > 0
	return (
		<div
			className="w-full flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 rounded-md border"
			style={{ borderColor: '#e5e0d8' }}
		>
			<Slot index={0} fallback={<span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', flexShrink: 0, ...lineClampStyle(node, 'brand'), ...textStylesFor(node, 'brand') }}>{node.brand}</span>} />
			<div className="flex flex-wrap items-center gap-x-4 gap-y-1" style={{ flex: '1 1 200px' }}>
				{hasSlots ? node.columns.map((_, ci) => <ColumnSlot key={ci} index={ci} fallback={null} />) : allLinks.map((link, index) => (
					<a key={index} href={isEditing ? undefined : (link.href || undefined)} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ fontSize: 12, color: '#6b6b6b', textDecoration: 'none', ...lineClampStyle(node, 'columns.links.label'), ...textStylesFor(node, 'columns.links.label') }}>
						{link.label}
					</a>
				))}
			</div>
			<FooterBottomBar node={node}>
				<Slot index={2} fallback={<span style={{ fontSize: 12, color: '#8a8a8a', flexShrink: 0, ...lineClampStyle(node, 'copyrightText'), ...textStylesFor(node, 'copyrightText') }}>{node.copyrightText}</span>} />
			</FooterBottomBar>
		</div>
	)
}

/** Variant #8 — brandSidebar: brand+tagline rendered as a vertical sidebar strip with a colored left rule, columns stacked to its right as a flex row that wraps. Distinct silhouette from the top-brand variants above. */
function BrandSidebarFooter({ node, isEditing }: { node: FooterTemplateNode; isEditing?: boolean }) {
	return (
		<div className="flex flex-col w-full gap-5">
			<div className="flex flex-wrap w-full gap-6">
				<div
					className="flex flex-col gap-2 pl-4 border-l-4"
					style={{ borderColor: node.accentColor, flex: '0 1 200px', minWidth: 160 }}
				>
					<Slot index={0} fallback={<span style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', ...lineClampStyle(node, 'brand'), ...textStylesFor(node, 'brand') }}>{node.brand}</span>} />
					<Slot index={1} fallback={<span style={{ fontSize: 13, color: '#6b6b6b', ...lineClampStyle(node, 'tagline'), ...textStylesFor(node, 'tagline') }}>{node.tagline}</span>} />
				</div>
				<div className="flex flex-wrap gap-6" style={{ flex: '1 1 300px' }}>
					{node.columns.map((column, index) => (
						<ColumnSlot key={index} index={index} fallback={
							<div key={index} className="flex flex-col gap-1.5" style={{ flex: '1 1 130px', minWidth: 120 }}>
								<span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', ...lineClampStyle(node, 'columns.title'), ...textStylesFor(node, 'columns.title') }}>{column.title}</span>
								{column.links.map((link, i) => (
									<a key={i} href={isEditing ? undefined : (link.href || undefined)} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ fontSize: 13, color: '#6b6b6b', textDecoration: 'none', ...lineClampStyle(node, 'columns.links.label'), ...textStylesFor(node, 'columns.links.label') }}>
										{link.label}
									</a>
								))}
							</div>
						} />
					))}
				</div>
			</div>
			<div className="w-full h-px" style={{ backgroundColor: '#e5e0d8' }} />
			<FooterBottomBar node={node}>
				<Slot index={2} fallback={<span style={{ fontSize: 12, color: '#8a8a8a', ...lineClampStyle(node, 'copyrightText'), ...textStylesFor(node, 'copyrightText') }}>{node.copyrightText}</span>} />
			</FooterBottomBar>
		</div>
	)
}

/** Shared column renderer used by the variants whose columns look alike (title + stacked link list). */
function FooterColumnBlock({
	column,
	titleStyle,
	linkStyle,
	node,
	isEditing,
}: {
	column: FooterColumn
	titleStyle: React.CSSProperties
	linkStyle: React.CSSProperties
	node: FooterTemplateNode
	isEditing?: boolean
}) {
	return (
		<div className="flex flex-col gap-2 min-w-0">
			<span style={{ ...titleStyle, ...lineClampStyle(node, 'columns.title'), ...textStylesFor(node, 'columns.title') }}>{column.title}</span>
			<div className="flex flex-col gap-1.5">
				{column.links.map((link, i) => (
				link.href &&	<a key={i} href={isEditing ? undefined : (link.href || undefined)} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ ...linkStyle, ...lineClampStyle(node, 'columns.links.label'), ...textStylesFor(node, 'columns.links.label') }}>
						{link.label}
					</a>
				))}
			</div>
		</div>
	)
}
