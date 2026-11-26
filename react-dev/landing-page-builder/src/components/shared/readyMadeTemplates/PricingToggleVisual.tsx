import React, { createContext, useContext, useState } from 'react'
import type { PricingToggleNode } from '@/types/node.type'
import { lineClampStyle } from '@/components/PropertyPanelUI/Sections/relatedComponents/LineClampControl'

/** Rendered children: [planName]. Empty for legacy nodes. */
const PricingToggleSlotsContext = createContext<React.ReactNode[]>([])

/** The plan-name node, or the variant's own element for legacy nodes. */
function PlanName({ node, as: Tag = 'div', className, style }: { node: PricingToggleNode; as?: 'div' | 'span'; className?: string; style?: React.CSSProperties }) {
	const slot = useContext(PricingToggleSlotsContext)[0]
	if (slot) return <div className={className}>{slot}</div>
	return <Tag className={className} style={{ ...style, ...lineClampStyle(node, 'planName') }}>{node.planName}</Tag>
}

/**
 * Pure "visual" renderer for the pricingToggle content type — data-in, JSX-out,
 * no drag/drop/popover/canvas wiring (that lives in the shell components in
 * Nodes.tsx / Elements.tsx, same split as Faq/FaqList).
 *
 * Switches on node.uiType to render one of 8 distinct compositions, all built
 * only from the node's own fields (colors, sizes, labels, prices) — no
 * hardcoded copy and no new required schema fields.
 */
export function PricingToggleVisual({ node, slots }: { node: PricingToggleNode; slots?: React.ReactNode }) {
	return (
		<PricingToggleSlotsContext.Provider value={React.Children.toArray(slots)}>
			<PricingToggleLayout node={node} />
		</PricingToggleSlotsContext.Provider>
	)
}

function PricingToggleLayout({ node }: { node: PricingToggleNode }) {
	const [isYearly, setIsYearly] = useState(node.defaultYearly)
	const price = isYearly ? node.yearlyPrice : node.monthlyPrice
	const period = isYearly ? '/year' : '/month'

	const toggle = (
		<button
			type="button"
			onClick={(e) => { e.stopPropagation(); setIsYearly((v) => !v) }}
			style={{ backgroundColor: isYearly ? node.activeColor : node.inactiveColor }}
			className="relative w-10 h-5 rounded-full transition-colors shrink-0 border-none cursor-pointer motion-reduce:transition-none"
		>
			<span
				style={{ transform: isYearly ? 'translateX(20px)' : 'translateX(2px)' }}
				className="absolute top-[2px] left-0 w-4 h-4 rounded-full bg-white transition-transform shadow motion-reduce:transition-none"
			/>
		</button>
	)

	// Yearly savings, used by variants that surface the "why switch to yearly" motivation.
	const monthlyCostPerYear = node.monthlyPrice * 12
	const savingsAmount = Math.max(0, monthlyCostPerYear - node.yearlyPrice)
	const savingsPercent = monthlyCostPerYear > 0 ? Math.round((savingsAmount / monthlyCostPerYear) * 100) : 0

	// gradientHero/darkGlass sit on a dark/gradient surface, so the default dark price/
	// plan-name colors would be illegible there — fall back to white only while the user
	// hasn't customized the color away from its default; an explicit choice always wins.
	const priceColorOnDark = (node.priceStyle?.color && node.priceStyle.color !== '#1a1a1a')
		? node.priceStyle.color
		: '#fff'
	const planNameColorOnDark = (node.planNameStyle?.color && node.planNameStyle.color !== '#2563eb')
		? node.planNameStyle.color
		: '#fff'

	switch (node.uiType) {
		/* 1. classicCard — savings-ledger card: big price up top, a two-row receipt-style breakdown
		     (monthly rate / yearly rate) with the active row highlighted, toggle as a segmented control. */
		case 'classicCard': {
			return (
				<div className="flex flex-col w-full h-full rounded-2xl overflow-hidden" style={{ border: `1px solid ${node.inactiveColor}`, boxShadow: `0 24px 44px -28px ${node.activeColor}99` }}>
				<div aria-hidden="true" style={{ height: 5, background: `linear-gradient(90deg, ${node.activeColor}, ${node.activeColor}55)` }} />
					<div className="flex flex-col items-center py-8 px-4 gap-1.5">
						<PlanName node={node} style={node.planNameStyle} />
						<div style={node.priceStyle}>
							{node.currencySymbol}{price}
							<span style={node.periodStyle}>{period}</span>
						</div>
						{isYearly && savingsAmount > 0 && (
							<span
								className="text-xs font-medium rounded-full px-2 py-0.5 mt-1"
								style={{ color: node.activeColor, backgroundColor: `${node.activeColor}1a` }}
							>
								Save {savingsPercent}%
							</span>
						)}
					</div>
					<div className="flex w-full" style={{ borderTop: `1px solid ${node.inactiveColor}` }}>
						<button
							type="button"
							onClick={(e) => { e.stopPropagation(); setIsYearly(false) }}
							className="flex-1 py-2 text-center border-none cursor-pointer"
							style={{
								...node.labelStyle,
								backgroundColor: !isYearly ? `${node.activeColor}1a` : 'transparent',
								color: !isYearly ? node.activeColor : node.labelStyle?.color,
								fontWeight: !isYearly ? 700 : node.labelStyle?.fontWeight,
								...lineClampStyle(node, 'monthlyLabel'),
							}}
						>
							{node.monthlyLabel}
						</button>
						<div className="w-px self-stretch" style={{ backgroundColor: node.inactiveColor }} />
						<button
							type="button"
							onClick={(e) => { e.stopPropagation(); setIsYearly(true) }}
							className="flex-1 py-2 text-center border-none cursor-pointer"
							style={{
								...node.labelStyle,
								backgroundColor: isYearly ? `${node.activeColor}1a` : 'transparent',
								color: isYearly ? node.activeColor : node.labelStyle?.color,
								fontWeight: isYearly ? 700 : node.labelStyle?.fontWeight,
								...lineClampStyle(node, 'yearlyLabel'),
							}}
						>
							{node.yearlyLabel}
						</button>
					</div>
				</div>
			)
		}

		/* 2. gradientHero — full-bleed gradient billboard with the price rendered as a two-stop
		     horizontal scale (monthly anchor left, yearly anchor right) and the toggle acting as the
		     scale's slider knob, positioned left/right to show which rate is currently selected. */
		case 'gradientHero': {
			return (
				<div
					className="relative overflow-hidden flex flex-col w-full h-full rounded-2xl py-9 px-6 gap-6"
					style={{ background: `linear-gradient(135deg, ${node.activeColor}, ${node.inactiveColor})`, boxShadow: `0 28px 50px -28px ${node.activeColor}` }}
				>
					<span aria-hidden="true" className="absolute rounded-full pointer-events-none" style={{ width: 240, height: 240, top: -100, right: -70, backgroundColor: 'rgba(255,255,255,0.14)' }} />
					<span aria-hidden="true" className="absolute rounded-full pointer-events-none" style={{ width: 120, height: 120, bottom: -40, left: -30, border: '2px solid rgba(255,255,255,0.3)' }} />
					<div className="relative flex flex-col items-center gap-1">
						<PlanName node={node} style={{ ...node.planNameStyle, color: planNameColorOnDark, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.9 }} />
						<div style={{ ...node.priceStyle, color: priceColorOnDark }}>
							{node.currencySymbol}{price}
							<span style={{ ...node.periodStyle, color: 'rgba(255,255,255,0.85)' }}>{period}</span>
						</div>
					</div>
					<div className="relative flex flex-col gap-2 w-full">
						<div className="relative w-full h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
							<div
								className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow transition-all motion-reduce:transition-none"
								style={{ left: isYearly ? 'calc(100% - 16px)' : 0 }}
							/>
						</div>
						<div className="flex items-center justify-between w-full flex-wrap gap-2">
							<span style={{ ...node.labelStyle, color: '#fff', ...lineClampStyle(node, 'monthlyLabel') }}>{node.monthlyLabel}</span>
							{toggle}
							<span style={{ ...node.labelStyle, color: '#fff', ...lineClampStyle(node, 'yearlyLabel') }}>{node.yearlyLabel}</span>
						</div>
					</div>
				</div>
			)
		}

		/* 3. minimalFlat — underline tab switcher: monthly/yearly act as two plain-text tabs sharing
		     a hairline, active tab gets an underline bar; price sits large beneath, no card chrome at all. */
		case 'minimalFlat': {
			return (
				<div className="flex flex-col items-start w-full h-full gap-3">
					<PlanName node={node} style={node.planNameStyle} />
					<div className="flex w-full items-stretch" style={{ borderBottom: `1px solid ${node.inactiveColor}` }}>
						<button
							type="button"
							onClick={(e) => { e.stopPropagation(); setIsYearly(false) }}
							className="flex flex-col items-center gap-1.5 pb-1.5 px-1 mr-5 border-none bg-transparent cursor-pointer"
						>
							<span style={{ ...node.labelStyle, color: !isYearly ? node.activeColor : node.labelStyle?.color, fontWeight: !isYearly ? 700 : node.labelStyle?.fontWeight, ...lineClampStyle(node, 'monthlyLabel') }}>
								{node.monthlyLabel}
							</span>
							<span className="h-[2px] w-full rounded-full" style={{ backgroundColor: !isYearly ? node.activeColor : 'transparent' }} />
						</button>
						<button
							type="button"
							onClick={(e) => { e.stopPropagation(); setIsYearly(true) }}
							className="flex flex-col items-center gap-1.5 pb-1.5 px-1 border-none bg-transparent cursor-pointer"
						>
							<span style={{ ...node.labelStyle, color: isYearly ? node.activeColor : node.labelStyle?.color, fontWeight: isYearly ? 700 : node.labelStyle?.fontWeight, ...lineClampStyle(node, 'yearlyLabel') }}>
								{node.yearlyLabel}
							</span>
							<span className="h-[2px] w-full rounded-full" style={{ backgroundColor: isYearly ? node.activeColor : 'transparent' }} />
						</button>
					</div>
					<div className="flex items-baseline gap-1">
						<span style={node.priceStyle}>{node.currencySymbol}{price}</span>
						<span style={node.periodStyle}>{period}</span>
					</div>
				</div>
			)
		}

		/* 4. darkGlass — dark comparison grid: monthly-rate and yearly-rate sit as two side-by-side
		     stat tiles (CSS grid, auto-fit so they stack on narrow widths), the selected tile glows and
		     the toggle lives centered underneath both, acting as the shared control between them. */
		case 'darkGlass': {
			const tileStyle = (active: boolean): React.CSSProperties => ({
				backgroundColor: active ? 'rgba(255,255,255,0.06)' : 'transparent',
				border: `1px solid ${active ? `${node.activeColor}88` : 'rgba(255,255,255,0.12)'}`,
				boxShadow: active ? `0 0 30px -12px ${node.activeColor}88` : 'none',
			})
			return (
				<div
					className="relative overflow-hidden flex flex-col w-full h-full rounded-2xl py-7 px-5 gap-5 backdrop-blur"
					style={{ backgroundColor: 'rgba(15,15,20,0.92)', border: `1px solid ${node.activeColor}44`, boxShadow: `0 30px 60px -30px ${node.activeColor}` }}
				>
					<span aria-hidden="true" className="absolute pointer-events-none" style={{ width: 260, height: 140, top: -70, left: '50%', transform: 'translateX(-50%)', background: `radial-gradient(closest-side, ${node.activeColor}99, transparent)`, filter: 'blur(18px)' }} />
					<PlanName node={node} className="relative text-center" style={{ ...node.planNameStyle, color: planNameColorOnDark === '#fff' ? '#e5e7eb' : planNameColorOnDark }} />
					<div className="grid gap-3 w-full" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
						<button
							type="button"
							onClick={(e) => { e.stopPropagation(); setIsYearly(false) }}
							className="flex flex-col items-center rounded-lg py-3 px-2 gap-1 cursor-pointer"
							style={tileStyle(!isYearly)}
						>
							<span style={{ ...node.labelStyle, color: '#9ca3af', ...lineClampStyle(node, 'monthlyLabel') }}>{node.monthlyLabel}</span>
							<span style={{ ...node.priceStyle, color: priceColorOnDark, fontSize: '20px' }}>{node.currencySymbol}{node.monthlyPrice}</span>
						</button>
						<button
							type="button"
							onClick={(e) => { e.stopPropagation(); setIsYearly(true) }}
							className="flex flex-col items-center rounded-lg py-3 px-2 gap-1 cursor-pointer"
							style={tileStyle(isYearly)}
						>
							<span style={{ ...node.labelStyle, color: '#9ca3af', ...lineClampStyle(node, 'yearlyLabel') }}>{node.yearlyLabel}</span>
							<span style={{ ...node.priceStyle, color: priceColorOnDark, fontSize: '20px' }}>{node.currencySymbol}{node.yearlyPrice}</span>
						</button>
					</div>
					<div className="flex justify-center">{toggle}</div>
				</div>
			)
		}

		/* 5. bordered — radial badge layout: price sits inside a large ring/dial badge in the center,
		     plan name arches above it as a small caps label, toggle forms a horizontal bar beneath —
		     a completely different silhouette from the rectangular card/row variants. */
		case 'bordered': {
			const ringSize = 112
			return (
				<div className="flex flex-col items-center w-full h-full gap-3 py-2">
					<PlanName node={node} as="span" style={{ ...node.planNameStyle, letterSpacing: '0.08em', textTransform: 'uppercase' }} />
					<div
						className="flex flex-col items-center justify-center rounded-full shrink-0"
						style={{ width: ringSize, height: ringSize, border: `3px solid ${node.activeColor}`, boxShadow: `0 0 0 6px ${node.activeColor}1a, 0 0 0 7px ${node.activeColor}55, 0 18px 30px -16px ${node.activeColor}` }}
					>
						<span style={{ ...node.priceStyle, fontSize: '22px', lineHeight: 1.1 }}>
							{node.currencySymbol}{price}
						</span>
						<span style={node.periodStyle}>{period}</span>
					</div>
					<div
						className="flex items-center gap-2 rounded-full px-3 py-1.5"
						style={{ border: `1px solid ${node.inactiveColor}` }}
					>
						<span style={{ ...node.labelStyle, ...lineClampStyle(node, 'monthlyLabel') }}>{node.monthlyLabel}</span>
						{toggle}
						<span style={{ ...node.labelStyle, ...lineClampStyle(node, 'yearlyLabel') }}>{node.yearlyLabel}</span>
					</div>
				</div>
			)
		}

		/* 6. split — two-column layout: plan info on the left, price+toggle stacked on the right, divider between */
		case 'split': {
			return (
				<div className="flex flex-wrap w-full h-full items-stretch gap-4 py-3 pl-4 pr-2" style={{ borderLeft: `5px solid ${node.activeColor}` }}>
					<div className="flex flex-col justify-center gap-1" style={{ flex: '1 1 160px' }}>
						<PlanName node={node} style={node.planNameStyle} />
						<div className="flex items-center gap-2 flex-wrap">
							<span style={{ ...node.labelStyle, ...lineClampStyle(node, 'monthlyLabel') }}>{node.monthlyLabel}</span>
							{toggle}
							<span style={{ ...node.labelStyle, ...lineClampStyle(node, 'yearlyLabel') }}>{node.yearlyLabel}</span>
						</div>
					</div>
					<div className="w-px self-stretch" style={{ backgroundColor: node.inactiveColor }} />
					<div className="flex flex-col justify-center items-end" style={{ flex: '1 1 120px' }}>
						<div style={node.priceStyle}>
							{node.currencySymbol}{price}
						</div>
						<span style={node.periodStyle}>{period}</span>
					</div>
				</div>
			)
		}

		/* 7. ribbon — diagonal corner ribbon banner (period label) draped over a card with centered price */
		case 'ribbon': {
			return (
				<div className="relative w-full h-full overflow-hidden rounded-xl" style={{ border: `1px solid ${node.inactiveColor}`, boxShadow: `0 22px 40px -28px ${node.activeColor}99` }}>
					<div
						className="absolute top-[35px] -right-[55px] rotate-45 py-0.5 text-center"
						style={{
							// Fixed width, not content/font-size driven — the rotated band's
							// position depends on its own width, so letting label text or
							// fontSize change that width shifts it off the corner and/or past
							// the card's overflow-hidden clip (the reported "not showing
							// properly"). whiteSpace/textOverflow keep long labels contained
							// instead of blowing the band back out to content width.
							width: '200px',
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							backgroundColor: node.activeColor,
							color: '#fff',
							fontSize: node.labelStyle?.fontSize ?? '12px',
							fontWeight: 600,
							...lineClampStyle(node, isYearly ? 'yearlyLabel' : 'monthlyLabel'),
						}}
					>
						{isYearly ? node.yearlyLabel : node.monthlyLabel}
					</div>
					<div className="flex h-full
					
					flex-col items-center py-6 px-4 gap-2">
						<PlanName node={node} style={node.planNameStyle} />
						<div style={node.priceStyle}>
							{node.currencySymbol}{price}
							<span style={node.periodStyle}>{period}</span>
						</div>
						<div className="mt-1">{toggle}</div>
					</div>
				</div>
			)
		}

		/* 8. compactRow — ticket-stub layout: a "plan" stub (name + toggle) and a "price" stub are
		     joined by a perforated/dashed tear line with notches, like a receipt or event ticket,
		     laid out horizontally and wrapping to stacked stubs at narrow widths. */
		case 'compactRow': {
			return (
				<div className="flex flex-wrap items-stretch w-full h-full rounded-md overflow-hidden" style={{ border: `1px solid ${node.inactiveColor}` }}>
					<div className="flex flex-col justify-center gap-1.5 px-3 py-2.5" style={{ flex: '1 1 140px' }}>
						<PlanName node={node} as="span" style={node.planNameStyle} />
						<div className="flex items-center gap-1.5 flex-wrap">
							<span style={{ ...node.labelStyle, ...lineClampStyle(node, 'monthlyLabel') }}>{node.monthlyLabel}</span>
							{toggle}
							<span style={{ ...node.labelStyle, ...lineClampStyle(node, 'yearlyLabel') }}>{node.yearlyLabel}</span>
						</div>
					</div>
					<div className="relative flex items-center justify-center w-0" style={{ borderLeft: `2px dashed ${node.inactiveColor}` }}>
						<span className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full" style={{ backgroundColor: node.inactiveColor, opacity: 0.35 }} />
						<span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full" style={{ backgroundColor: node.inactiveColor, opacity: 0.35 }} />
					</div>
					<div
						className="flex items-center justify-center px-4 py-2.5"
						style={{ flex: '0 1 110px', backgroundColor: `${node.activeColor}0d` }}
					>
						<span style={node.priceStyle}>
							{node.currencySymbol}{price}
							<span style={node.periodStyle}>{period}</span>
						</span>
					</div>
				</div>
			)
		}

		/* 9. wristband — a continuous perforated wristband strap: a wide pill
		     shape with a row of small punch-holes along its top edge (real
		     event-wristband adjustment holes), plan name + price printed on the
		     band, and the shared toggle switch acting as the strap's snap-clasp
		     at the trailing end. Flat color, no gradient/glass -- a deliberately
		     different silhouette from compactRow's two-stub ticket layout,
		     grounded in event-wristband ephemera instead. */
		case 'wristband': {
			return (
				<div
					className="relative w-full h-full flex items-center rounded-full px-6 py-4 gap-4"
					style={{ backgroundColor: `${node.activeColor}14`, border: `1px solid ${node.activeColor}` }}
				>
					<div aria-hidden="true" className="absolute flex items-center justify-between" style={{ top: 6, left: 32, right: 32 }}>
						{Array.from({ length: 10 }).map((_, i) => (
							<span key={i} className="rounded-full shrink-0" style={{ width: 3, height: 3, backgroundColor: node.activeColor, opacity: 0.4 }} />
						))}
					</div>
					<div className="flex flex-col gap-0.5 flex-1 min-w-0">
						<PlanName node={node} as="span" style={node.planNameStyle} />
						<span style={node.priceStyle}>
							{node.currencySymbol}{price}
							<span style={node.periodStyle}>{period}</span>
						</span>
					</div>
					<div className="flex items-center gap-2 shrink-0 rounded-full px-3 py-1.5" style={{ backgroundColor: node.activeColor }}>
						<span style={{ ...node.labelStyle, color: '#fff', ...lineClampStyle(node, isYearly ? 'yearlyLabel' : 'monthlyLabel') }}>
							{isYearly ? node.yearlyLabel : node.monthlyLabel}
						</span>
						{toggle}
					</div>
				</div>
			)
		}

		default:
			return null
	}
}
