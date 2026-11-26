import React, { createContext, useContext, useState } from 'react'
import type { FaqNode } from '@/types/node.type'
import { lineClampStyle } from '@/components/PropertyPanelUI/Sections/relatedComponents/LineClampControl'

/**
 * The FAQ's content as already-rendered child nodes: one block per item,
 * [item0, item1, ...], each holding its question and answer. Supplied via
 * context; the variants below draw their own chrome around the block and fall
 * back to the flat `items` fields for FAQs saved before this existed.
 */
const FaqSlotsContext = createContext<React.ReactNode[]>([])

function useFaqSlots(): React.ReactNode[] {
	return useContext(FaqSlotsContext)
}

/**
 * Pure "visual" component for the "faq" content type's Ready Made Templates —
 * data-in, JSX-out, no drag/drop/popover/canvas wiring (that lives in the
 * shell component, e.g. Faq/FaqList in Nodes.tsx). Switches on node.uiType to
 * render one of 9 genuinely distinct compositions. The layout is this
 * component's job; each item comes in as a `slots` block node — selectable,
 * restylable and reorderable — with the node's own `items` as the fallback
 * for FAQs that predate that.
 */
export function FaqVisual({ node, slots }: { node: FaqNode; slots?: React.ReactNode }) {
	return (
		<FaqSlotsContext.Provider value={React.Children.toArray(slots)}>
			<FaqLayout node={node} />
		</FaqSlotsContext.Provider>
	)
}

function FaqLayout({ node }: { node: FaqNode }) {
	switch (node.uiType) {
		case 'plusMinus':
			return <PlusMinusFaq node={node} />
		case 'boxed':
			return <BoxedFaq node={node} />
		case 'numbered':
			return <NumberedFaq node={node} />
		case 'twoColumn':
			return <TwoColumnFaq node={node} />
		case 'minimalDivider':
			return <MinimalDividerFaq node={node} />
		case 'cardGrid':
			return <CardGridFaq node={node} />
		case 'chatBubble':
			return <ChatBubbleFaq node={node} />
		case 'credentialList':
			return <CredentialListFaq node={node} />
		case 'classicAccordion':
		default:
			return <ClassicAccordionFaq node={node} />
	}
}

// Some variants render the question text on a dark/gradient/colored surface, where the
// default dark questionStyle.color would be illegible — fall back to white only while
// the user hasn't customized the question color away from that default; an explicit
// choice always wins.
function questionColorOnDark(node: FaqNode) {
	return (node.questionStyle?.color && node.questionStyle.color !== '#1e40af')
		? node.questionStyle.color
		: '#fff'
}

/** Shared open/close state helper — accordion behavior driven by node.allowMultipleOpen. */
function useFaqToggle(node: FaqNode) {
	const [openIndices, setOpenIndices] = useState<number[]>(
		node.defaultOpenIndex >= 0 && node.defaultOpenIndex < node.items.length ? [node.defaultOpenIndex] : []
	)

	const toggleItem = (index: number) => {
		setOpenIndices((prev) => {
			const isOpen = prev.includes(index)
			if (isOpen) return prev.filter((i) => i !== index)
			return node.allowMultipleOpen ? [...prev, index] : [index]
		})
	}

	return { openIndices, toggleItem }
}

/** The item block renders as one unit, so hide everything after its first
 *  child (the answer) while collapsed, scoped to that block's id. */
function FaqCollapse({ node, index, isOpen }: { node: FaqNode; index: number; isOpen: boolean }) {
	const id = (node.children ?? [])[index]?.id
	if (isOpen || !id) return null
	return <style>{`[data-id="${id}"] > *:nth-child(n+2){display:none !important}`}</style>
}

/** Clicks inside the item's own block select that node; clicks on the
 * surrounding chrome toggle. Scoped to the block id — the faq node itself
 * carries data-node-path, so testing for that would always match. */
function faqChromeClick(node: FaqNode, index: number, toggle: () => void) {
	const id = (node.children ?? [])[index]?.id
	return (e: React.MouseEvent) => {
		if (id && (e.target as HTMLElement).closest(`[data-id="${id}"]`)) return
		toggle()
	}
}

/** Variant #1 — classicAccordion: bold gradient-headline rows on a dark rail — each question sits inside a deep gradient panel that expands with a glowing accent edge. */
function ClassicAccordionFaq({ node }: { node: FaqNode }) {
	const { openIndices, toggleItem } = useFaqToggle(node)
	const slots = useFaqSlots()

	return (
		<div className="flex flex-col w-full gap-2.5 rounded-2xl p-3" style={{ background: `linear-gradient(160deg, ${node.iconColor}14, transparent 60%)` }}>
			{node.items.map((item, index) => {
				const isOpen = openIndices.includes(index)
				const slot = slots[index]
				// The +/− orb is chrome, so it renders beside the item block too.
				const glyph = (
					<span
						style={{ backgroundColor: node.iconColor, color: '#fff' }}
						className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold leading-none shadow-md transition-transform motion-reduce:transition-none"
					>
						<span style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s ease' }}>+</span>
					</span>
				)
				return (
					<div
						key={index}
						className="w-full rounded-xl overflow-hidden transition-shadow motion-reduce:transition-none"
						style={{
							background: isOpen ? `linear-gradient(135deg, ${node.iconColor}22, ${node.dividerColor}33)` : `${node.dividerColor}1a`,
							boxShadow: isOpen ? `0 8px 24px -10px ${node.iconColor}77, inset 0 0 0 1.5px ${node.iconColor}55` : `inset 0 0 0 1px ${node.dividerColor}66`,
						}}
					>
						{slot ? (
							<div
								className="w-full flex items-center justify-between gap-3 py-3.5 px-4"
								style={{ cursor: 'pointer' }}
								onClick={faqChromeClick(node, index, () => toggleItem(index))}
							>
								<FaqCollapse node={node} index={index} isOpen={isOpen} />
								{slot}
								{glyph}
							</div>
						) : (
							<>
								<button
									type="button"
									onClick={(e) => { e.stopPropagation(); toggleItem(index) }}
									className="w-full flex items-center justify-between gap-3 py-3.5 px-4 text-left cursor-pointer bg-transparent border-none"
								>
									<span style={{ ...node.questionStyle, ...lineClampStyle(node, 'question') }}>{item.question}</span>
									{glyph}
								</button>
								{isOpen && (
									<div className="px-4 pb-4 pt-0.5">
										<span style={{ ...node.answerStyle, ...lineClampStyle(node, 'answer') }}>{item.answer}</span>
									</div>
								)}
							</>
						)}
					</div>
				)
			})}
		</div>
	)
}

/** Variant #2 — plusMinus: chunky glowing orb toggles on a translucent glass rail, orb pulses with a soft ring when open. */
function PlusMinusFaq({ node }: { node: FaqNode }) {
	const { openIndices, toggleItem } = useFaqToggle(node)
	const slots = useFaqSlots()

	return (
		<div
			className="flex flex-col w-full gap-2.5 rounded-2xl p-3 backdrop-blur"
			style={{ background: `${node.dividerColor}22`, boxShadow: `inset 0 1px 0 ${node.iconColor}22` }}
		>
			{node.items.map((item, index) => {
				const isOpen = openIndices.includes(index)
				const slot = slots[index]
				// The glowing orb is chrome — it stays beside the item block.
				const orb = (
					<span
						style={{
							background: `linear-gradient(135deg, ${node.iconColor}, ${node.iconColor}99)`,
							color: '#fff',
							transform: isOpen ? 'rotate(225deg) scale(1.08)' : 'rotate(0deg) scale(1)',
							boxShadow: isOpen ? `0 0 0 4px ${node.iconColor}33` : `0 2px 8px -2px ${node.iconColor}77`,
							transition: 'transform 0.25s ease, box-shadow 0.25s ease',
						}}
						className="motion-reduce:transition-none shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg leading-none font-bold"
					>
						+
					</span>
				)
				return (
					<div
						key={index}
						className="w-full rounded-xl"
						style={{ backgroundColor: isOpen ? (node.cardColor || '#ffffff') : 'transparent', boxShadow: isOpen ? `0 6px 18px -8px ${node.iconColor}66` : 'none' }}
					>
						{slot ? (
							<div
								className="w-full flex items-center gap-3 py-2.5 px-2.5"
								style={{ cursor: 'pointer' }}
								onClick={faqChromeClick(node, index, () => toggleItem(index))}
							>
								<FaqCollapse node={node} index={index} isOpen={isOpen} />
								{orb}
								{slot}
							</div>
						) : (
							<>
								<button
									type="button"
									onClick={(e) => { e.stopPropagation(); toggleItem(index) }}
									className="w-full flex items-center gap-3 py-2.5 px-2.5 text-left cursor-pointer bg-transparent border-none"
								>
									{orb}
									<span style={{ ...node.questionStyle, ...lineClampStyle(node, 'question') }} className="flex-1">{item.question}</span>
								</button>
								{isOpen && (
									<div className="pl-[52px] pr-3 pb-3">
										<span style={{ ...node.answerStyle, ...lineClampStyle(node, 'answer') }}>{item.answer}</span>
									</div>
								)}
							</>
						)}
					</div>
				)
			})}
		</div>
	)
}

/** Variant #3 — boxed: stacked 3D-tilted cards with a thick colored top edge and deep drop shadow, like a deck of index cards. */
function BoxedFaq({ node }: { node: FaqNode }) {
	const { openIndices, toggleItem } = useFaqToggle(node)
	const slots = useFaqSlots()

	return (
		<div className="flex flex-col w-full gap-4">
			{node.items.map((item, index) => {
				const isOpen = openIndices.includes(index)
				const slot = slots[index]
				// The ▲/▼ chip is chrome — it stays beside the item block.
				const chip = (
					<span
						style={{ color: '#fff', backgroundColor: node.iconColor }}
						className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black shadow"
					>
						{isOpen ? '▲' : '▼'}
					</span>
				)
				return (
					<div
						key={index}
						className="w-full rounded-xl overflow-hidden transition-transform motion-reduce:transition-none"
						style={{
							borderTop: `5px solid ${node.iconColor}`,
							backgroundColor: node.cardColor || '#ffffff',
							boxShadow: isOpen
								? `0 16px 32px -12px ${node.iconColor}55, 0 2px 8px -2px ${node.iconColor}33`
								: `0 6px 16px -8px ${node.dividerColor}cc`,
							transform: isOpen ? 'translateY(-2px)' : 'none',
						}}
					>
						{slot ? (
							<div
								className="w-full flex items-center justify-between gap-3 py-3 px-4"
								style={{ cursor: 'pointer' }}
								onClick={faqChromeClick(node, index, () => toggleItem(index))}
							>
								<FaqCollapse node={node} index={index} isOpen={isOpen} />
								{slot}
								{chip}
							</div>
						) : (
							<>
								<button
									type="button"
									onClick={(e) => { e.stopPropagation(); toggleItem(index) }}
									style={{ backgroundColor: isOpen ? `${node.iconColor}12` : 'transparent' }}
									className="w-full flex items-center justify-between gap-3 py-3 px-4 text-left cursor-pointer border-none"
								>
									<span style={{ ...node.questionStyle, ...lineClampStyle(node, 'question') }}>{item.question}</span>
									{chip}
								</button>
								{isOpen && (
									<div style={{ borderTop: `1px dashed ${node.dividerColor}` }} className="px-4 py-3">
										<span style={{ ...node.answerStyle, ...lineClampStyle(node, 'answer') }}>{item.answer}</span>
									</div>
								)}
							</>
						)}
					</div>
				)
			})}
		</div>
	)
}

/** Variant #4 — numbered: oversized outlined numerals with a gradient fill and a bold connecting rail, like a stat-sheet countdown. */
function NumberedFaq({ node }: { node: FaqNode }) {
	const { openIndices, toggleItem } = useFaqToggle(node)
	const slots = useFaqSlots()

	return (
		<div className="flex flex-col w-full">
			{node.items.map((item, index) => {
				const isOpen = openIndices.includes(index)
				const isLast = index === node.items.length - 1
				const slot = slots[index]
				// The +/− ring is chrome — it stays beside the item block.
				const ring = (
					<span
						style={{ color: node.iconColor, borderColor: node.iconColor }}
						className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold"
					>
						{isOpen ? '−' : '+'}
					</span>
				)
				return (
					<div key={index} className="w-full flex gap-4 py-1">
						<div className="flex flex-col items-center shrink-0">
							<span
								style={{
									background: `linear-gradient(160deg, ${node.iconColor}, ${node.iconColor}77)`,
									color: '#fff',
									boxShadow: `0 6px 16px -6px ${node.iconColor}99`,
								}}
								className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black"
							>
								{String(index + 1).padStart(2, '0')}
							</span>
							{!isLast && <div className="w-[3px] flex-1 my-1.5 rounded-full" style={{ background: `linear-gradient(${node.iconColor}, ${node.dividerColor})`, minHeight: 24 }} />}
						</div>
						<div className="flex-1 min-w-0 pb-4">
							{slot ? (
								<div
									className="w-full flex items-center justify-between gap-2 py-2"
									style={{ cursor: 'pointer' }}
									onClick={faqChromeClick(node, index, () => toggleItem(index))}
								>
									<FaqCollapse node={node} index={index} isOpen={isOpen} />
									{slot}
									{ring}
								</div>
							) : (
								<>
									<button
										type="button"
										onClick={(e) => { e.stopPropagation(); toggleItem(index) }}
										className="w-full flex items-center justify-between gap-2 text-left cursor-pointer bg-transparent border-none py-2"
									>
										<span style={{ ...node.questionStyle, ...lineClampStyle(node, 'question') }}>{item.question}</span>
										{ring}
									</button>
									{isOpen && (
										<div
											className="mt-1 pl-3 py-2.5"
											style={{ borderLeft: `3px solid ${node.iconColor}55`, backgroundColor: `${node.iconColor}0a` }}
										>
											<span style={{ ...node.answerStyle, ...lineClampStyle(node, 'answer') }}>{item.answer}</span>
										</div>
									)}
								</>
							)}
						</div>
					</div>
				)
			})}
		</div>
	)
}

/** Variant #5 — twoColumn: sidebar nav on a solid gradient panel, active question pops as a raised white pill; answer panel is a bold card with a glowing edge. */
function TwoColumnFaq({ node }: { node: FaqNode }) {
	const initial = node.defaultOpenIndex >= 0 && node.defaultOpenIndex < node.items.length ? node.defaultOpenIndex : 0
	const [activeIndex, setActiveIndex] = useState(initial)
	const active = node.items[activeIndex] ?? node.items[0]
	const slots = useFaqSlots()
	// The pane shows one item at a time, so it renders whichever item block is
	// active (falling back to the first, same as `active` above).
	const activeSlot = slots[node.items[activeIndex] ? activeIndex : 0]

	return (
		<div className="flex flex-wrap w-full gap-4 rounded-2xl overflow-hidden" style={{ boxShadow: `0 10px 30px -14px ${node.iconColor}55` }}>
			<div
				className="flex flex-col gap-1.5 p-3"
				style={{ flex: '1 1 220px', minWidth: 180, background: `linear-gradient(160deg, ${node.iconColor}, ${node.iconColor}bb)` }}
			>
				{node.items.map((item, index) => {
					const isActive = index === activeIndex
					return (
						<button
							key={index}
							type="button"
							onClick={(e) => { e.stopPropagation(); setActiveIndex(index) }}
							style={{
								backgroundColor: isActive ? '#ffffff' : 'transparent',
								boxShadow: isActive ? '0 4px 12px -4px rgba(0,0,0,0.35)' : 'none',
							}}
							className="text-left rounded-lg px-3 py-2.5 cursor-pointer border-none"
						>
							{/* The nav row stays flat text — the item block is a real node
							    and belongs in the pane, not inside this clickable button. */}
							<span style={{ ...node.questionStyle, color: isActive ? node.iconColor : questionColorOnDark(node), ...lineClampStyle(node, 'question') }}>
								{item.question}
							</span>
						</button>
					)
				})}
			</div>
			<div
				style={{ minWidth: 220, flex: '2 1 260px', backgroundColor: node.cardColor || '#fff' }}
				className="p-5 flex items-start"
			>
				{activeSlot ?? (active && <span style={{ ...node.answerStyle, ...lineClampStyle(node, 'answer') }}>{active.answer}</span>)}
			</div>
		</div>
	)
}

/** Variant #6 — minimalDivider: giant translucent ghost numerals behind each question, thick gradient rule beneath — minimal chrome but a bold typographic backdrop. */
function MinimalDividerFaq({ node }: { node: FaqNode }) {
	const slots = useFaqSlots()
	return (
		<div className="flex flex-col w-full">
			{node.items.map((item, index) => (
				<div key={index} className="relative w-full py-4 overflow-hidden">
					<span
						className="absolute -top-3 -left-1 select-none pointer-events-none"
						style={{ fontSize: 64, fontWeight: 900, color: `${node.iconColor}14`, lineHeight: 1 }}
					>
						{String(index + 1).padStart(2, '0')}
					</span>
					<div className="relative pl-9">
						{slots[index] ?? (
							<>
								<div style={{ ...node.questionStyle, ...lineClampStyle(node, 'question') }} className="mb-1.5">{item.question}</div>
								<div style={{ ...node.answerStyle, ...lineClampStyle(node, 'answer') }}>{item.answer}</div>
							</>
						)}
					</div>
					{index < node.items.length - 1 && (
						<div
							className="w-full h-[3px] mt-4 rounded-full"
							style={{ background: `linear-gradient(90deg, ${node.iconColor}, ${node.dividerColor}, transparent)` }}
						/>
					)}
				</div>
			))}
		</div>
	)
}

/** Variant #7 — cardGrid: neon-edged glass tiles on a dark grid, active tile glows and lifts. */
function CardGridFaq({ node }: { node: FaqNode }) {
	const { openIndices, toggleItem } = useFaqToggle(node)
	const slots = useFaqSlots()

	return (
		<div
			className="grid gap-3.5 w-full p-4 rounded-2xl"
			style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'start', backgroundColor: '#12131a' }}
		>
			{node.items.map((item, index) => {
				const isOpen = openIndices.includes(index)
				const slot = slots[index]
				// The +/− badge is chrome — it stays pinned to the tile corner.
				const badge = (
					<span
						style={{ color: node.iconColor, backgroundColor: `${node.iconColor}22` }}
						className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold leading-none"
					>
						{isOpen ? '−' : '+'}
					</span>
				)
				if (slot) return (
					<div
						key={index}
						style={{ background: '#ffffff08', boxShadow: `0 0 0 1px ${node.dividerColor}33`, cursor: 'pointer' }}
						className="rounded-2xl p-4 flex items-start justify-between gap-2"
						onClick={faqChromeClick(node, index, () => toggleItem(index))}
					>
						<FaqCollapse node={node} index={index} isOpen={isOpen} />
						{slot}
						{badge}
					</div>
				)
				return (
					<button
						key={index}
						type="button"
						onClick={(e) => { e.stopPropagation(); toggleItem(index) }}
						style={{
							background: isOpen ? `linear-gradient(160deg, ${node.iconColor}66, ${node.iconColor}1f)` : '#ffffff08',
							boxShadow: isOpen ? `0 0 0 2px ${node.iconColor}, 0 14px 32px -8px ${node.iconColor}aa` : `0 0 0 1px ${node.dividerColor}33`,
							transform: isOpen ? 'translateY(-3px)' : 'none',
						}}
						className="text-left rounded-2xl p-4 flex flex-col gap-2.5 cursor-pointer border-none transition-transform motion-reduce:transition-none"
					>
						<div className="flex items-start justify-between gap-2">
							<span style={{ ...node.questionStyle, color: questionColorOnDark(node), ...lineClampStyle(node, 'question') }}>{item.question}</span>
							{badge}
						</div>
						{isOpen && <span style={{ ...node.answerStyle, color: node.answerStyle?.color ?? '#c9c9d4', ...lineClampStyle(node, 'answer') }}>{item.answer}</span>}
					</button>
				)
			})}
		</div>
	)
}

/** Variant #8 — chatBubble: chunky gradient speech bubbles on a soft phone-screen backdrop, with avatar dots and drop shadows for real depth. */
function ChatBubbleFaq({ node }: { node: FaqNode }) {
	const { openIndices, toggleItem } = useFaqToggle(node)
	const slots = useFaqSlots()

	return (
		<div className="flex flex-col w-full gap-4 p-4 rounded-2xl" style={{ backgroundColor: `${node.dividerColor}26` }}>
			{node.items.map((item, index) => {
				const isOpen = openIndices.includes(index)
				const slot = slots[index]
				// The Q avatar is chrome — it stays beside the item block.
				const avatar = (
					<span
						style={{ background: `linear-gradient(135deg, ${node.iconColor}, ${node.iconColor}aa)` }}
						className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
					>
						Q
					</span>
				)
				if (slot) return (
					<div
						key={index}
						className="flex items-end gap-2 self-start max-w-[88%]"
						style={{ cursor: 'pointer' }}
						onClick={faqChromeClick(node, index, () => toggleItem(index))}
					>
						<FaqCollapse node={node} index={index} isOpen={isOpen} />
						{avatar}
						<div
							style={{ backgroundColor: node.cardColor || '#ffffff', boxShadow: `0 6px 16px -8px ${node.dividerColor}` }}
							className="rounded-2xl rounded-bl-sm px-4 py-2.5"
						>
							{slot}
						</div>
					</div>
				)
				return (
					<div key={index} className="flex flex-col gap-2">
						<div className="flex items-end gap-2 self-start max-w-[88%]">
							{avatar}
							<button
								type="button"
								onClick={(e) => { e.stopPropagation(); toggleItem(index) }}
								style={{ background: `linear-gradient(135deg, ${node.iconColor}, ${node.iconColor}cc)`, boxShadow: `0 8px 18px -8px ${node.iconColor}99` }}
								className="rounded-2xl rounded-bl-sm px-4 py-2.5 text-left cursor-pointer border-none flex items-center gap-2"
							>
								<span style={{ ...node.questionStyle, color: questionColorOnDark(node), ...lineClampStyle(node, 'question') }}>{item.question}</span>
								<span style={{ color: '#fff', fontSize: 14, flexShrink: 0, opacity: 0.9 }}>{isOpen ? '−' : '+'}</span>
							</button>
						</div>
						{isOpen && (
							<div className="flex items-end gap-2 self-end max-w-[88%] flex-row-reverse">
								<span
									style={{ backgroundColor: node.cardColor || '#ffffff', boxShadow: `0 0 0 1.5px ${node.dividerColor}` }}
									className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow"
								>
									A
								</span>
								<div
									style={{ backgroundColor: node.cardColor || '#ffffff', boxShadow: `0 6px 16px -8px ${node.dividerColor}` }}
									className="rounded-2xl rounded-br-sm px-4 py-2.5"
								>
									<span style={{ ...node.answerStyle, ...lineClampStyle(node, 'answer') }}>{item.answer}</span>
								</div>
							</div>
						)}
					</div>
				)
			})}
		</div>
	)
}

/**
 * Variant #9 — credentialList: each question renders as a flat "info-desk
 * handout" row -- a monospace ticket-number chip (Q01, Q02...) standing in
 * for a real queue/ticket number, with a short column of perforation dots
 * between rows instead of a solid rail. Flat paper color, no gradients/
 * glow/glass -- a deliberate departure from this file's otherwise glass/
 * gradient-heavy variants, grounded in printed event handouts rather than
 * a tech-product accordion.
 */
function CredentialListFaq({ node }: { node: FaqNode }) {
	const { openIndices, toggleItem } = useFaqToggle(node)
	const slots = useFaqSlots()

	return (
		<div className="flex flex-col w-full overflow-hidden" style={{ backgroundColor: node.cardColor || '#EAF2EE', borderRadius: 12, border: `1px solid ${node.dividerColor}` }}>
			{node.items.map((item, index) => {
				const isOpen = openIndices.includes(index)
				const isLast = index === node.items.length - 1
				const slot = slots[index]
				// Ticket chip and +/− stay as chrome on either side of the block.
				const ticket = (
					<span
						className="font-mono shrink-0 text-xs font-bold px-2 py-1 rounded"
						style={{ backgroundColor: node.iconColor, color: '#fff' }}
					>
						Q{String(index + 1).padStart(2, '0')}
					</span>
				)
				const toggleGlyph = <span className="font-mono shrink-0 text-xs font-bold" style={{ color: node.iconColor }}>{isOpen ? '−' : '+'}</span>
				return (
					<div key={index}>
						{slot ? (
							<div
								className="w-full flex items-center gap-3 py-3.5 px-4"
								style={{ cursor: 'pointer' }}
								onClick={faqChromeClick(node, index, () => toggleItem(index))}
							>
								<FaqCollapse node={node} index={index} isOpen={isOpen} />
								{ticket}
								{slot}
								{toggleGlyph}
							</div>
						) : (
							<>
								<button
									type="button"
									onClick={(e) => { e.stopPropagation(); toggleItem(index) }}
									className="w-full flex items-center gap-3 py-3.5 px-4 text-left cursor-pointer bg-transparent border-none"
								>
									{ticket}
									<span className="flex-1" style={{ ...node.questionStyle, ...lineClampStyle(node, 'question') }}>{item.question}</span>
									{toggleGlyph}
								</button>
								{isOpen && (
									<div className="pb-4" style={{ paddingLeft: 60, paddingRight: 16 }}>
										<span style={{ ...node.answerStyle, ...lineClampStyle(node, 'answer') }}>{item.answer}</span>
									</div>
								)}
							</>
						)}
						{!isLast && (
							<div className="w-full flex items-center gap-2 px-4" style={{ height: 1 }}>
								{Array.from({ length: 24 }).map((_, i) => (
									<span key={i} className="rounded-full shrink-0" style={{ width: 3, height: 3, backgroundColor: node.dividerColor }} />
								))}
							</div>
						)}
					</div>
				)
			})}
		</div>
	)
}
