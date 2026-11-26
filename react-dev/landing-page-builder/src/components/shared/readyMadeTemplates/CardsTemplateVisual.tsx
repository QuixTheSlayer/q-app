import React, { createContext, useContext } from 'react'
import type { CardItem, CardsTemplateNode } from '@/types/node.type'
import { lineClampStyle } from '@/components/PropertyPanelUI/Sections/relatedComponents/LineClampControl'
import { textStylesFor } from '@/components/PropertyPanelUI/Sections/relatedComponents/TypographyControl'

/** Rendered children: [heading, card0, card1, ...]. Empty for legacy nodes. */
const CardsSlotsContext = createContext<React.ReactNode[]>([])

function useCardsSlot(index: number): React.ReactNode | undefined {
	return useContext(CardsSlotsContext)[index] ?? undefined
}

/** The heading node, or the variant's own <h3> for legacy nodes. */
function CardsHeading({ heading, node, className, style }: { heading: string; node: CardsTemplateNode; className?: string; style?: React.CSSProperties }) {
	const slot = useCardsSlot(0)
	if (slot) return <div className={className}>{slot}</div>
	if (!heading) return null
	return <h3 className={className} style={{ ...style, ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{heading}</h3>
}

/** A card's block node, or `fallback` (the variant's hardcoded markup). */
function CardSlot({ index, fallback }: { index: number; fallback: React.ReactNode }) {
	const slot = useCardsSlot(index + 1)
	return <>{slot ?? fallback}</>
}

/**
 * Pure "visual" component for the cardsTemplate content type — data in,
 * JSX out. No drag/drop/popover/canvas wiring here; that lives in the shell
 * component that wraps this one (see Faq/FaqList for the split pattern).
 *
 * Every variant derives its accent palette from the node's own
 * accentColor/accentColorSecondary fields — see CardsTemplateNode in
 * src/types/node.type.ts for the shape.
 *
 * accentColor drives every solid-color use (text, badges, ticks, numerals);
 * accentColorSecondary is only ever paired with accentColor as a gradient
 * end-stop — no other hardcoded palette colors are used for the node's own
 * accent.
 */
export function CardsTemplateVisual({ node, slots }: { node: CardsTemplateNode; slots?: React.ReactNode }) {
	return (
		<CardsSlotsContext.Provider value={React.Children.toArray(slots)}>
			<CardsTemplateLayout node={node} />
		</CardsSlotsContext.Provider>
	)
}

function CardsTemplateLayout({ node }: { node: CardsTemplateNode }) {
	const cards = node.cards ?? []
	const heading = node.heading

	switch (node.uiType) {
		case 'imageOverlay':
			return <ImageOverlayVariant heading={heading} cards={cards} node={node} />
		case 'iconTop':
			return <IconTopVariant heading={heading} cards={cards} node={node} />
		case 'horizontalRow':
			return <HorizontalRowVariant heading={heading} cards={cards} node={node} />
		case 'minimalBorder':
			return <MinimalBorderVariant heading={heading} cards={cards} node={node} />
		case 'shadowFloat':
			return <ShadowFloatVariant heading={heading} cards={cards} node={node} />
		case 'gradientHeader':
			return <GradientHeaderVariant heading={heading} cards={cards} node={node} />
		case 'numberedList':
			return <NumberedListVariant heading={heading} cards={cards} node={node} />
		case 'sessionCards':
			return <SessionCardsVariant heading={heading} cards={cards} node={node} />
		case 'gridClassic':
		default:
			return <GridClassicVariant heading={heading} cards={cards} node={node} />
	}
}

type VariantProps = { heading: string, cards: CardItem[], node: CardsTemplateNode }

function gradient(node: CardsTemplateNode, angle = 135) {
	return `linear-gradient(${angle}deg, ${node.accentColor}, ${node.accentColorSecondary})`
}

/** 1. gridClassic — an even grid of ranked cards: a small accent-filled
 * ordinal tag anchors each card's top-left corner, soft shadow instead of a
 * flat hairline, generous padding — a results-board feel rather than a
 * generic feature-tile grid. */
function GridClassicVariant({ heading, cards, node }: VariantProps) {
	const accent = node.accentColor
	return (
		<div className="w-full flex flex-col gap-5">
			<CardsHeading heading={heading} node={node} className="text-2xl font-bold text-center tracking-tight" style={{ color: '#151515' }} />
			<div className="grid gap-5" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${cards.length > 1 ? 220 : 280}px, 1fr))` }}>
				{cards.map((card, i) => (
					<CardSlot
						key={i}
						index={i}
						fallback={
								<div key={i} className="relative flex flex-col gap-2.5 pt-8 px-5 pb-5" style={{ borderRadius: 12, backgroundColor: '#ffffff', boxShadow: '0 1px 2px rgba(16,16,16,0.04), 0 8px 24px -12px rgba(16,16,16,0.12)' }}>
									<span
										className="absolute flex items-center justify-center font-bold"
										style={{ top: 0, left: 20, width: 36, height: 24, borderRadius: '0 0 6px 6px', backgroundColor: accent, color: '#ffffff', fontSize: 12 }}
									>
										{String(i + 1).padStart(2, '0')}
									</span>
									{card.imageUrl && (
										<img src={card.imageUrl} alt={card.title} className="w-full h-28 object-cover" style={{ borderRadius: 8 }} />
									)}
									<span className="font-bold" style={{ fontSize: 17, color: '#151515', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{card.title}</span>
									<span style={{ fontSize: 13.5, lineHeight: 1.5, color: '#6b6b6b', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{card.description}</span>
								</div>
						}
					/>
				))}
			</div>
		</div>
	)
}

/** 2. imageOverlay — full-bleed image (or gradient stand-in) with text
 * overlaid at the bottom over a dark scrim, a rank badge floating top-left
 * like a category placard on an awards-night photo wall. */
function ImageOverlayVariant({ heading, cards, node }: VariantProps) {
	return (
		<div className="w-full flex flex-col gap-5">
			<CardsHeading heading={heading} node={node} className="text-2xl font-bold text-center tracking-tight" style={{ color: '#151515' }} />
			<div className="grid gap-5" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${cards.length > 1 ? 220 : 280}px, 1fr))` }}>
				{cards.map((card, i) => (
					<CardSlot
						key={i}
						index={i}
						fallback={
								<div
									key={i}
									className="relative flex flex-col justify-end overflow-hidden"
									style={{
										height: 260,
										borderRadius: 14,
										backgroundImage: card.imageUrl
											? `url("${card.imageUrl}")`
											: gradient(node),
										backgroundSize: 'cover',
										backgroundPosition: 'center',
										boxShadow: '0 12px 28px -14px rgba(0,0,0,0.4)',
									}}
								>
									<span
										className="absolute uppercase font-bold"
										style={{ top: 14, left: 14, fontSize: 10.5, letterSpacing: 0.6, color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.4)', padding: '4px 9px', borderRadius: 999, backdropFilter: 'blur(4px)' }}
									>
										{String(i + 1).padStart(2, '0')}
									</span>
									<div
										className="flex flex-col gap-1 px-5 pt-10 pb-5"
										style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 10%, rgba(0,0,0,0.05) 90%)' }}
									>
										<span className="font-bold" style={{ fontSize: 17, color: '#ffffff', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{card.title}</span>
										<span style={{ fontSize: 13.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{card.description}</span>
									</div>
								</div>
						}
					/>
				))}
			</div>
		</div>
	)
}

/** 3. iconTop — a medal-like double-ring badge sits above stacked, centered
 * text inside a soft card surface — reads as a seal of recognition rather
 * than a plain icon label. */
function IconTopVariant({ heading, cards, node }: VariantProps) {
	const accent = node.accentColor
	return (
		<div className="w-full flex flex-col gap-5">
			<CardsHeading heading={heading} node={node} className="text-2xl font-bold text-center tracking-tight" style={{ color: '#151515' }} />
			<div className="grid gap-5" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${cards.length > 1 ? 200 : 260}px, 1fr))` }}>
				{cards.map((card, i) => (
					<CardSlot
						key={i}
						index={i}
						fallback={
								<div key={i} className="flex flex-col items-center text-center gap-3 px-5 pt-7 pb-6" style={{ borderRadius: 14, backgroundColor: `${accent}08` }}>
									<div
										className="flex items-center justify-center rounded-full"
										style={{ width: 60, height: 60, backgroundColor: '#ffffff', boxShadow: `inset 0 0 0 2px ${accent}, 0 6px 16px -6px ${accent}59` }}
									>
										{card.imageUrl ? (
											<img src={card.imageUrl} alt={card.title} className="w-9 h-9 object-cover rounded-full" />
										) : (
											<span className="font-bold" style={{ color: accent, fontSize: 20 }}>{(card.title || '?').charAt(0).toUpperCase()}</span>
										)}
									</div>
									<span className="font-bold" style={{ fontSize: 16.5, color: '#151515', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{card.title}</span>
									<span style={{ fontSize: 13.5, lineHeight: 1.5, color: '#6b6b6b', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{card.description}</span>
								</div>
						}
					/>
				))}
			</div>
		</div>
	)
}

/** 4. horizontalRow — each card is a full-width row inside its own bordered
 * surface, a bold accent-tinted rank square on the left, an accent rule
 * down the row's own left edge rather than a shared divider line. */
function HorizontalRowVariant({ heading, cards, node }: VariantProps) {
	const accent = node.accentColor
	return (
		<div className="w-full flex flex-col gap-5">
			<CardsHeading heading={heading} node={node} className="text-2xl font-bold tracking-tight" style={{ color: '#151515' }} />
			<div className="flex flex-col gap-3">
				{cards.map((card, i) => (
					<CardSlot
						key={i}
						index={i}
						fallback={
								<div key={i} className="flex items-center gap-4 pl-4 pr-4 py-3.5" style={{ borderRadius: 10, backgroundColor: '#ffffff', boxShadow: '0 1px 2px rgba(16,16,16,0.04), 0 6px 16px -10px rgba(16,16,16,0.15)', borderLeft: `3px solid ${accent}` }}>
									<div
										className="flex-shrink-0 flex items-center justify-center overflow-hidden"
										style={{ width: 52, height: 52, borderRadius: 8, backgroundColor: `${accent}14` }}
									>
										{card.imageUrl ? (
											<img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
										) : (
											<span className="font-bold" style={{ color: accent, fontSize: 19 }}>{i + 1}</span>
										)}
									</div>
									<div className="flex flex-col gap-0.5 min-w-0">
										<span className="font-bold" style={{ fontSize: 15.5, color: '#151515', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{card.title}</span>
										<span style={{ fontSize: 13, lineHeight: 1.45, color: '#6b6b6b', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{card.description}</span>
									</div>
								</div>
						}
					/>
				))}
			</div>
		</div>
	)
}

/** 5. minimalBorder — no fill, no shadow: hairline border boxes with a lot
 * of whitespace, a bold serif-scale numeral doing the identity work instead
 * of decoration. Each card carries its own full border (not a shared grid
 * line), so it stays correct when cards wrap onto a new row. */
function MinimalBorderVariant({ heading, cards, node }: VariantProps) {
	const accent = node.accentColor
	return (
		<div className="w-full flex flex-col gap-5">
			<CardsHeading heading={heading} node={node} className="text-2xl font-light text-center tracking-wide" style={{ color: '#151515' }} />
			<div className="grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${cards.length > 1 ? 200 : 260}px, 1fr))` }}>
				{cards.map((card, i) => (
					<CardSlot
						key={i}
						index={i}
						fallback={
								<div
									key={i}
									className="flex flex-col gap-2 p-6"
									style={{ borderTop: `2px solid ${accent}`, borderRight: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5', borderLeft: '1px solid #e5e5e5' }}
								>
									<span style={{ fontSize: 26, fontWeight: 300, color: accent, lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</span>
									<span className="font-medium mt-1" style={{ fontSize: 16.5, color: '#151515', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{card.title}</span>
									<span style={{ fontSize: 13, lineHeight: 1.5, color: '#7a7a7a', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{card.description}</span>
								</div>
						}
					/>
				))}
			</div>
		</div>
	)
}

/** 6. shadowFloat — cards appear to float above the page: rounded, strong
 * soft shadow, staggered vertical offset on alternating cards, a thin
 * accent bar along the top edge so the float isn't the only identity cue. */
function ShadowFloatVariant({ heading, cards, node }: VariantProps) {
	const accent = node.accentColor
	return (
		<div className="w-full py-4 flex flex-col gap-6">
			<CardsHeading heading={heading} node={node} className="text-2xl font-bold text-center tracking-tight" style={{ color: '#151515' }} />
			<div className="grid gap-6 items-start" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${cards.length > 1 ? 200 : 260}px, 1fr))` }}>
				{cards.map((card, i) => (
					<CardSlot
						key={i}
						index={i}
						fallback={
								<div
									key={i}
									className="flex flex-col overflow-hidden"
									style={{
										borderRadius: 16,
										backgroundColor: '#ffffff',
										boxShadow: '0 24px 44px -16px rgba(0,0,0,0.28)',
										transform: i % 2 === 1 ? 'translateY(18px)' : 'translateY(0px)',
									}}
								>
									<div style={{ height: 4, backgroundColor: accent }} />
									<div className="flex flex-col gap-2 p-5">
										{card.imageUrl && (
											<img src={card.imageUrl} alt={card.title} className="w-full h-24 object-cover" style={{ borderRadius: 10 }} />
										)}
										<span className="font-bold" style={{ fontSize: 16.5, color: '#151515', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{card.title}</span>
										<span style={{ fontSize: 13.5, lineHeight: 1.5, color: '#6b6b6b', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{card.description}</span>
									</div>
								</div>
						}
					/>
				))}
			</div>
		</div>
	)
}

/** 7. gradientHeader — each card has a tall gradient-filled header band
 * (title and rank live inside the band, in light text) with plain body below. */
function GradientHeaderVariant({ heading, cards, node }: VariantProps) {
	return (
		<div className="w-full flex flex-col gap-5">
			<CardsHeading heading={heading} node={node} className="text-2xl font-bold text-center tracking-tight" style={{ color: '#151515' }} />
			<div className="grid gap-5" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${cards.length > 1 ? 200 : 260}px, 1fr))` }}>
				{cards.map((card, i) => (
					<CardSlot
						key={i}
						index={i}
						fallback={
								<div key={i} className="flex flex-col overflow-hidden" style={{ borderRadius: 12, backgroundColor: '#ffffff', boxShadow: '0 1px 2px rgba(16,16,16,0.04), 0 8px 24px -12px rgba(16,16,16,0.12)' }}>
									<div
										className="flex flex-col justify-end gap-1 px-4 pt-5 pb-4"
										style={{ background: gradient(node, 120), minHeight: 76 }}
									>
										<span className="uppercase font-bold" style={{ fontSize: 10.5, letterSpacing: 0.6, color: 'rgba(255,255,255,0.75)' }}>{String(i + 1).padStart(2, '0')}</span>
										<span className="font-bold" style={{ fontSize: 16.5, color: '#ffffff', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{card.title}</span>
									</div>
									<div className="px-4 py-4">
										<span style={{ fontSize: 13.5, lineHeight: 1.5, color: '#6b6b6b', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{card.description}</span>
									</div>
								</div>
						}
					/>
				))}
			</div>
		</div>
	)
}

/** 8. numberedList — a single vertical list with large numerals to the
 * left of each entry, connected by a thin vertical rule — a results-order
 * reading, not a bulleted feature list. */
function NumberedListVariant({ heading, cards, node }: VariantProps) {
	const accent = node.accentColor
	return (
		<div className="w-full flex flex-col gap-6">
			<CardsHeading heading={heading} node={node} className="text-2xl font-bold tracking-tight" style={{ color: '#151515' }} />
			<div className="flex flex-col">
				{cards.map((card, i) => (
					<CardSlot
						key={i}
						index={i}
						fallback={
								<div key={i} className="flex gap-5 relative">
									<div className="flex flex-col items-center flex-shrink-0" style={{ width: 32 }}>
										<span className="font-bold" style={{ fontSize: 26, color: accent, lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</span>
										{i < cards.length - 1 && <div style={{ width: 1, flex: 1, backgroundColor: '#e0e0e0', marginTop: 10 }} />}
									</div>
									<div className="flex flex-col gap-1 pb-7 min-w-0">
										<span className="font-bold" style={{ fontSize: 16, color: '#151515', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{card.title}</span>
										<span style={{ fontSize: 13.5, lineHeight: 1.5, color: '#6b6b6b', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{card.description}</span>
									</div>
								</div>
						}
					/>
				))}
			</div>
		</div>
	)
}

/**
 * 9. sessionCards — each card is styled like a printed conference-program
 * session card: a small corner track-tab (2-digit session number, monospace)
 * in the top-left standing in for a real session/track code, a perforated
 * tear rule separating the copy from a thin flat accent footer bar. Flat
 * color, no shadow wash/gradient -- a program schedule card, not a SaaS
 * feature tile, grounded in printed event programs rather than decoration.
 */
function SessionCardsVariant({ heading, cards, node }: VariantProps) {
	return (
		<div className="w-full flex flex-col gap-5">
			<CardsHeading heading={heading} node={node} className="text-2xl font-bold text-center tracking-tight" style={{ color: '#151515' }} />
			<div className="grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${cards.length > 1 ? 200 : 260}px, 1fr))` }}>
				{cards.map((card, i) => (
					<CardSlot
						key={i}
						index={i}
						fallback={
								<div key={i} className="relative flex flex-col overflow-hidden" style={{ backgroundColor: '#EAF2EE', borderRadius: 10, border: '1px solid #1B1D2214' }}>
									<div className="flex items-start px-4 pt-4">
										<span className="font-mono text-[11px] font-bold px-2 py-1 rounded" style={{ backgroundColor: node.accentColor, color: '#fff' }}>
											{String(i + 1).padStart(2, '0')}
										</span>
									</div>
									{card.imageUrl && (
										<img src={card.imageUrl} alt={card.title} className="w-full h-24 object-cover mt-3" />
									)}
									<div className="flex flex-col gap-1.5 px-4 pt-3 pb-4">
										<span className="font-semibold" style={{ fontSize: 15, color: '#1B1D22', ...lineClampStyle(node, 'title'), ...textStylesFor(node, 'title') }}>{card.title}</span>
										<span style={{ fontSize: 13, color: '#4b5563', ...lineClampStyle(node, 'description'), ...textStylesFor(node, 'description') }}>{card.description}</span>
									</div>
									<div aria-hidden="true" className="w-full flex items-center gap-1.5 px-4" style={{ height: 1 }}>
										{Array.from({ length: 16 }).map((_, d) => (
											<span key={d} className="rounded-full shrink-0" style={{ width: 3, height: 3, backgroundColor: '#1B1D2233' }} />
										))}
									</div>
									<div className="w-full" style={{ height: 5, backgroundColor: node.accentColor }} />
								</div>
						}
					/>
				))}
			</div>
		</div>
	)
}
