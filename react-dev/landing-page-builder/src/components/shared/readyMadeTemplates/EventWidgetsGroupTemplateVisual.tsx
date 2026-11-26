import React, { createContext, useContext } from 'react'
import type { EventWidgetsGroupTemplateNode } from '@/types/node.type'
import { lineClampStyle } from '@/components/PropertyPanelUI/Sections/relatedComponents/LineClampControl'
import { textStylesFor } from '@/components/PropertyPanelUI/Sections/relatedComponents/TypographyControl'
import { CSSProperties } from 'react'
import { isEditorPage } from '@/utils/checkPage'
import { Text } from '@/components/EditorUI/NodeMap/Contents'
import { EventDeadline } from '@/types/contentFile.type'
import { useGetRenderPageDataQuery } from '@/store/query'
import { getIdFromUrl } from '@/utils/getIdFromUrl'

/**
 * Pure "visual" component for the eventWidgetsGroupTemplate content type —
 * data-in, JSX-out, no drag/drop/popover/canvas wiring (mirrors Nodes.tsx's
 * FaqList/TimelineTrack split: the shell that adds useDraggable/useDroppable/
 * Popover/ActionMenu/DragOverlay around this lives elsewhere).
 *
 * accentColor/accentColorSecondary drive every solid-color and gradient use
 * that represents the template's own brand identity (dots, badges, CTA
 * fills/text, borders); structural neutrals (white/black backgrounds, gray
 * text, dark panel backgrounds used for contrast) stay hardcoded. Every
 * piece of *text* rendered (heading, date/hour/timezone, button labels)
 * always comes from the node's own fields — nothing here is hardcoded
 * placeholder copy.
 */

const eventName = /\/landing-page-builder\/(editor|preview)(\/|$)/.test(window.location.pathname)
	? ''
	: getIdFromUrl();
export function EventWidgetsGroupTemplateVisual({ node, isEditing = !eventName, slots }: { node: EventWidgetsGroupTemplateNode; isEditing?: boolean; slots?: React.ReactNode }) {
	return (
		<EventWidgetsSlotsContext.Provider value={React.Children.toArray(slots)}>
			<EventWidgetsLayout node={node} isEditing={isEditing} />
		</EventWidgetsSlotsContext.Provider>
	)
}

/** Rendered children: [heading, submitEntry, register]. Empty for legacy nodes. */
const EventWidgetsSlotsContext = createContext<React.ReactNode[]>([])

const HEADING_SLOT = 0
const SUBMIT_SLOT = 1
const REGISTER_SLOT = 2

/** A slot node, or `fallback` (the variant's original markup). */
function Slot({ index, fallback }: { index: number; fallback: React.ReactNode }) {
	const slot = useContext(EventWidgetsSlotsContext)[index]
	return <>{slot ?? fallback}</>
}

function EventWidgetsLayout({ node }: { node: EventWidgetsGroupTemplateNode; isEditing?: boolean }) {
	switch (node.uiType) {
		case 'countdownCard':
			return <CountdownCard node={node} isEditing={!eventName} />
		case 'stackedCentered':
			return <StackedCentered node={node} isEditing={!eventName} />
		case 'splitPanel':
			return <SplitPanel node={node} isEditing={!eventName} />
		case 'minimalInline':
			return <MinimalInline node={node} isEditing={!eventName} />
		case 'bannerCta':
			return <BannerCta node={node} isEditing={!eventName} />
		case 'darkGlass':
			return <DarkGlass node={node} isEditing={!eventName} />
		case 'twoColumnCard':
			return <TwoColumnCard node={node} isEditing={!eventName} />
		case 'classicRow':
		default:
			return <ClassicRow node={node} isEditing={!eventName} />
	}
}

type VariantProps = { node: EventWidgetsGroupTemplateNode; isEditing?: boolean }

function getColors(node: EventWidgetsGroupTemplateNode) {
	return {
		accentColor: node.accentColor || '#4f46e5',
		accentColorSecondary: node.accentColorSecondary || '#0ea5e9',
	}
}

function gradient(node: EventWidgetsGroupTemplateNode, angle = 135) {
	const { accentColor, accentColorSecondary } = getColors(node)
	return `linear-gradient(${angle}deg, ${accentColor}, ${accentColorSecondary})`
}

const reducedMotionSafe: React.CSSProperties = {
	// prefers-reduced-motion is honored via the `motion-safe:` Tailwind
	// variant on the one pulse animation used below (darkGlass); everything
	// else here is static, so there is nothing further to gate.
}



export const eventDeadlineMap: Record<string, keyof EventDeadline> = {
	"{{event_date}}": "end_date",
	"{{event_hour}}": "end_hour",
	"{{event_timezone}}": "timezone",
	"{{event_timezone_offset}}": "timezone_offset",
};


function ClassicRow({ node, isEditing }: VariantProps) {
	const { accentColor, accentColorSecondary } = getColors(node)

	const { data } = useGetRenderPageDataQuery(eventName || "", { skip: !eventName });

	return (
		<div
			className="flex flex-wrap items-center justify-between gap-4 w-full relative overflow-hidden"
			style={{
				backgroundColor: 'transparent',
				// border: '1px solid #eef0f4',
				borderRadius:node.style?.borderRadius||0,
				padding: '18px 22px',
				boxShadow: '0 4px 20px -8px rgba(15,23,42,0.12)',
			}}
		>
			<div className="absolute left-0 top-0 bottom-0" style={{ width: 4, background: gradient(node, 180) }} />
			<div className="flex flex-col gap-2 min-w-[180px] pl-2">
				<Slot index={HEADING_SLOT} fallback={<span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</span>} />
				<div className="flex items-center gap-1.5 flex-wrap">
					<span style={{ fontSize: 12, fontWeight: 600, color: accentColor, backgroundColor: `${accentColor}14`, borderRadius: 999, padding: '3px 10px', ...lineClampStyle(node, 'endDateText'), ...textStylesFor(node, 'endDateText') }}>
						{eventName ? data?.event_deadline.end_date : node.endDateText}
					</span>
					<span style={{ fontSize: 12, fontWeight: 600, color: accentColorSecondary, backgroundColor: `${accentColorSecondary}14`, borderRadius: 999, padding: '3px 10px' }}>
						<span style={{ ...lineClampStyle(node, 'endHourText'), ...textStylesFor(node, 'endHourText') }}>{eventName ? data?.event_deadline.end_hour : node.endHourText}</span> &middot; <span style={{ ...lineClampStyle(node, 'timeZoneText'), ...textStylesFor(node, 'timeZoneText') }}>{eventName ? data?.event_deadline.timezone : node.timeZoneText}</span>
					</span>
				</div>
			</div>
			<div className="flex items-center gap-2 flex-wrap">
				<Slot
					index={SUBMIT_SLOT}
					fallback={
						<a
							href={isEditing ? undefined : node.submitEntryHref || undefined}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							style={{
								background: gradient(node),
								color: '#ffffff',
								fontSize: 13,
								fontWeight: 600,
								padding: '10px 18px',
								borderRadius: 8,
								textDecoration: 'none',
								boxShadow: `0 6px 16px -6px ${accentColor}80`,
								...lineClampStyle(node, 'submitEntryLabel'),
								...textStylesFor(node, 'submitEntryLabel'),
							}}
							about='_blank'
						>
							{node.submitEntryLabel}
						</a>
					}
				/>
				{node.registerHref && <Slot
					index={REGISTER_SLOT}
					fallback={
						<a
							href={isEditing ? undefined : node.registerHref}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							style={{
								backgroundColor: 'transparent',
								color: '#334155',
								border: '1px solid #dfe3ea',
								fontSize: 13,
								fontWeight: 600,
								padding: '10px 18px',
								borderRadius: 8,
								textDecoration: 'none',
								...lineClampStyle(node, 'registerLabel'),
								...textStylesFor(node, 'registerLabel'),
							}}
							about='_blank'
						>
							{node.registerLabel}
						</a>
					}
				/>}
			</div>
		</div>
	)
}


function CountdownCard({ node, isEditing }: VariantProps) {
	const { accentColor } = getColors(node)
	const { data } = useGetRenderPageDataQuery(eventName || "", { skip: !eventName });
	return (
		<div
			className="flex flex-col items-center text-center w-full gap-4"
			style={{
				backgroundColor: 'transparent',
				border: `2px solid ${accentColor}`,
				borderRadius:node.style?.borderRadius||0,
				padding: '28px 24px',
				boxShadow: `0 10px 30px -12px ${accentColor}59`,
			}}
		>
			<Slot
				index={HEADING_SLOT}
				fallback={
					<span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: accentColor, textTransform: 'uppercase', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>
						{node.heading}
					</span>
				}
			/>
			<div className="flex items-stretch gap-3">
				<div
					className="flex flex-col items-center justify-center"
					style={{ backgroundColor: accentColor, color: '#ffffff', borderRadius: 12, padding: '14px 18px', minWidth: 110 }}
				>
					<span style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1, ...lineClampStyle(node, 'endDateText'), ...textStylesFor(node, 'endDateText') }}>{eventName ? data?.event_deadline.end_date : node.endDateText}</span>
					<span style={{ fontSize: 11, opacity: 0.85 }}>Closing date</span>
				</div>
				<div
					className="flex flex-col items-center justify-center"
					style={{ backgroundColor: `${accentColor}14`, color: accentColor, border: `1px solid ${accentColor}4d`, borderRadius: 12, padding: '14px 18px', minWidth: 110 }}
				>
					<span style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1, ...lineClampStyle(node, 'endHourText'), ...textStylesFor(node, 'endHourText') }}>{eventName ? data?.event_deadline.end_hour : node.endHourText}</span>
					<span style={{ fontSize: 11, opacity: 0.75, ...lineClampStyle(node, 'timeZoneText'), ...textStylesFor(node, 'timeZoneText') }}>{eventName ? data?.event_deadline.timezone : node.timeZoneText}</span>
				</div>
			</div>
			<div className="flex items-center gap-3 mt-1 flex-wrap justify-center">
				<Slot
					index={SUBMIT_SLOT}
					fallback={
						<a
							href={isEditing ? undefined : node.submitEntryHref}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							style={{ backgroundColor: accentColor, color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 20px', borderRadius: 999, textDecoration: 'none', ...lineClampStyle(node, 'submitEntryLabel'), ...textStylesFor(node, 'submitEntryLabel') }}
						>
							{node.submitEntryLabel}
						</a>
					}
				/>
				{node.registerHref && <Slot
					index={REGISTER_SLOT}
					fallback={
						<a
							href={isEditing ? undefined : node.registerHref}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							style={{ color: accentColor, fontSize: 13, fontWeight: 700, padding: '10px 6px', textDecoration: 'underline', ...lineClampStyle(node, 'registerLabel'), ...textStylesFor(node, 'registerLabel') }}
						>
							{node.registerLabel}
						</a>
					}
				/>}
			</div>
		</div>
	)
}

/* ---------------------------------------------------------------------- */
/* 3. stackedCentered — elegant centered poster: soft radial backdrop,    */
/* an eyebrow label, gradient CTA, ghost secondary action                */
/* ---------------------------------------------------------------------- */
function StackedCentered({ node, isEditing }: VariantProps) {
	const { data } = useGetRenderPageDataQuery(eventName || "", { skip: !eventName });
	return (
		<div
			className="flex flex-col items-center text-center gap-4 w-full relative overflow-hidden"
			style={{
				padding: '32px 20px',
				borderRadius:node.style?.borderRadius||0,
				background: `radial-gradient(120% 100% at 50% 0%, ${node.accentColor}14 0%, #ffffff 60%)`,
				border: '1px solid #f1f0f5',
			}}
		>
			<span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: node.accentColor }}>
				Event Details
			</span>
			<Slot index={HEADING_SLOT} fallback={<span style={{ fontSize: 26, fontWeight: 800, color: '#18181b', letterSpacing: '-0.02em', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</span>} />
			<div className="flex items-center gap-2 flex-wrap justify-center" style={{ fontSize: 14, color: '#52525b' }}>
				<span style={{ fontWeight: 600, ...lineClampStyle(node, 'endDateText'), ...textStylesFor(node, 'endDateText') }}>{eventName ? data?.event_deadline.end_date : node.endDateText}</span>
				<span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#a1a1aa', display: 'inline-block' }} />
				<span style={{ ...lineClampStyle(node, 'endHourText'), ...textStylesFor(node, 'endHourText') }}>{eventName ? data?.event_deadline.end_hour : node.endHourText}</span>
				<span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#a1a1aa', display: 'inline-block' }} />
				<span style={{ ...lineClampStyle(node, 'timeZoneText'), ...textStylesFor(node, 'timeZoneText') }}>{eventName ? data?.event_deadline.timezone : node.timeZoneText}</span>
			</div>
			<div className="flex flex-col items-center gap-2.5 mt-2 w-full max-w-[300px]">
				<Slot
					index={SUBMIT_SLOT}
					fallback={
						<a
							href={isEditing ? undefined : node.submitEntryHref}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							className="w-full text-center"
							style={{
								background: gradient(node),
								color: '#fff',
								fontSize: 14,
								fontWeight: 700,
								padding: '13px 0',
								borderRadius: 999,
								textDecoration: 'none',
								boxShadow: `0 10px 24px -10px ${node.accentColor}8c`,
								...lineClampStyle(node, 'submitEntryLabel'),
								...textStylesFor(node, 'submitEntryLabel'),
							}}
						>
							{node.submitEntryLabel}
						</a>
					}
				/>
				{node.registerHref && <Slot
					index={REGISTER_SLOT}
					fallback={
						<a
							href={isEditing ? undefined : node.registerHref}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							className="w-full text-center"
							style={{ color: node.accentColorSecondary, fontSize: 13, fontWeight: 700, padding: '8px 0', textDecoration: 'none', ...lineClampStyle(node, 'registerLabel'), ...textStylesFor(node, 'registerLabel') }}
						>
							{node.registerLabel} &rarr;
						</a>
					}
				/>}
			</div>
		</div>
	)
}

/* ---------------------------------------------------------------------- */
/* 4. splitPanel — two-tone left/right split, info left, actions right    */
/* ---------------------------------------------------------------------- */
function SplitPanel({ node, isEditing }: VariantProps) {
	const { data } = useGetRenderPageDataQuery(eventName || "", { skip: !eventName });
	return (
		<div className="flex w-full flex-wrap overflow-hidden" style={{
			borderRadius: node.style?.borderRadius || 0,
			border: '1px solid #e5e7eb'
		}}>
			<div className="flex-1 flex flex-col justify-center gap-2 min-w-[200px]" style={{ backgroundColor: '#11182780', color: '#fff', padding: '22px 24px' }}>
				<Slot index={HEADING_SLOT} fallback={<span style={{ fontSize: 18, fontWeight: 700, ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</span>} />
				<span style={{ fontSize: 13, color: '#d1d5db', ...lineClampStyle(node, 'endDateText'), ...textStylesFor(node, 'endDateText') }}>{eventName ? data?.event_deadline.end_date : node.endDateText}</span>
				<span style={{ fontSize: 13, color: '#d1d5db' }}>
					<span style={{ ...lineClampStyle(node, 'endHourText'), ...textStylesFor(node, 'endHourText') }}>{eventName ? data?.event_deadline.end_hour : node.endHourText}</span> &bull; <span style={{ ...lineClampStyle(node, 'timeZoneText'), ...textStylesFor(node, 'timeZoneText') }}>{eventName ? data?.event_deadline.timezone : node.timeZoneText}</span>
				</span>
			</div>
			<div className="flex-1 flex flex-col items-start justify-center gap-2 min-w-[200px]" style={{ backgroundColor: 'transparent', padding: '22px 24px' }}>
				<Slot
					index={SUBMIT_SLOT}
					fallback={
						<a
							href={isEditing ? undefined : node.submitEntryHref}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							style={{ backgroundColor: '#111827', color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 6, textDecoration: 'none', ...lineClampStyle(node, 'submitEntryLabel'), ...textStylesFor(node, 'submitEntryLabel') }}
						>
							{node.submitEntryLabel}
						</a>
					}
				/>
				{node.registerHref && <Slot
					index={REGISTER_SLOT}
					fallback={
						<a
							href={isEditing ? undefined : node.registerHref}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							style={{ color: '#111827', fontSize: 13, fontWeight: 600, textDecoration: 'underline', padding: '4px 2px', ...lineClampStyle(node, 'registerLabel'), ...textStylesFor(node, 'registerLabel') }}
						>
							{node.registerLabel}
						</a>
					}
				/>}
			</div>
		</div>
	)
}

/* ---------------------------------------------------------------------- */
/* 5. minimalInline — refined single line: understated but crisp, a      */
/* colored dot marker and underline-on-hover links instead of bare text  */
/* ---------------------------------------------------------------------- */
function MinimalInline({ node, isEditing }: VariantProps) {
	const { data } = useGetRenderPageDataQuery(eventName || "", { skip: !eventName });
	return (
		<div
			className="flex flex-wrap h-full items-center gap-x-3 gap-y-1.5 w-full"
			style={{
				borderRadius: node.style?.borderRadius || 0,
				padding: '16px 12px', fontSize: 14, borderTop: '1px solid #f1f1f480', borderBottom: '1px solid #f1f1f480'
			}}
		>
			<span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: node.accentColor, display: 'inline-block', flexShrink: 0 }} />
			<Slot index={HEADING_SLOT} fallback={<span style={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</span>} />
			<span style={{ color: '#94a3b8' }}>
				<span style={{ ...lineClampStyle(node, 'endDateText'), ...textStylesFor(node, 'endDateText') }}>{eventName ? data?.event_deadline.end_date : node.endDateText}</span> &middot; <span style={{ ...lineClampStyle(node, 'endHourText'), ...textStylesFor(node, 'endHourText') }}>{eventName ? data?.event_deadline.end_hour : node.endHourText}</span> (<span style={{ ...lineClampStyle(node, 'timeZoneText'), ...textStylesFor(node, 'timeZoneText') }}>{eventName ? data?.event_deadline.timezone : node.timeZoneText}</span>)
			</span>
			<span className="flex-1" />
			<Slot
				index={SUBMIT_SLOT}
				fallback={
					<a href={isEditing ? undefined : node.submitEntryHref}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
		 style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'none', borderBottom: `2px solid ${node.accentColor}`, paddingBottom: 1, ...lineClampStyle(node, 'submitEntryLabel'), ...textStylesFor(node, 'submitEntryLabel') }}>
						{node.submitEntryLabel}
					</a>
				}
			/>
			{node.registerHref && <Slot
				index={REGISTER_SLOT}
				fallback={
					<a href={isEditing ? undefined : node.registerHref}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
		 style={{ color: '#64748b', fontWeight: 600, textDecoration: 'none', ...lineClampStyle(node, 'registerLabel'), ...textStylesFor(node, 'registerLabel') }}>
						{node.registerLabel}
					</a>
				}
			/>}
		</div>
	)
}

/* ---------------------------------------------------------------------- */
/* 6. bannerCta — full-width bold gradient banner                         */
/* ---------------------------------------------------------------------- */
function BannerCta({ node, isEditing }: VariantProps) {
	const { data } = useGetRenderPageDataQuery(eventName || "", { skip: !eventName });


	return (
		<div
			className="flex flex-wrap items-center justify-between gap-4 w-full"
			style={{

				background: gradient(node, 90),

				color: '#ffffff',
				borderRadius: node.style?.borderRadius || 0,
				padding: node.style?.padding || 0,


			}}
		>
			<div className="flex flex-col gap-1">
				<Slot index={HEADING_SLOT} fallback={<span style={{ fontSize: 20, fontWeight: 800, ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</span>} />
				<span style={{ fontSize: 13, opacity: 0.92 }}>
					Ends <span style={{ ...lineClampStyle(node, 'endDateText'), ...textStylesFor(node, 'endDateText') }}>{eventName ? data?.event_deadline.end_date : node.endDateText}</span> &middot; <span style={{ ...lineClampStyle(node, 'endHourText'), ...textStylesFor(node, 'endHourText') }}>{eventName ? data?.event_deadline.end_hour : node.endHourText}</span> <span style={{ ...lineClampStyle(node, 'timeZoneText'), ...textStylesFor(node, 'timeZoneText') }}>{eventName ? data?.event_deadline.timezone : node.timeZoneText}</span>
				</span>
			</div>
			<div className="flex items-center gap-2 flex-wrap">
				<Slot
					index={SUBMIT_SLOT}
					fallback={
						<a
							href={isEditing ? undefined : node.submitEntryHref || undefined}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							style={{ backgroundColor: '#ffffff', color: node.accentColorSecondary, fontSize: 14, fontWeight: 800, padding: '11px 22px', borderRadius: 999, textDecoration: 'none', ...lineClampStyle(node, 'submitEntryLabel'), ...textStylesFor(node, 'submitEntryLabel') }}
						>
							{node.submitEntryLabel}
						</a>
					}
				/>
				{node.registerHref && <Slot
					index={REGISTER_SLOT}
					fallback={
						<a
							href={isEditing ? undefined : node.registerHref || undefined}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 700, padding: '11px 22px', borderRadius: 999, textDecoration: 'none', ...lineClampStyle(node, 'registerLabel'), ...textStylesFor(node, 'registerLabel') }}
						>
							{node.registerLabel}
						</a>
					}
				/>}
			</div>
		</div>
	)
}

/* ---------------------------------------------------------------------- */
/* 7. darkGlass — dark translucent glassmorphism card                     */
/* ---------------------------------------------------------------------- */
function DarkGlass({ node, isEditing }: VariantProps) {

	const { data } = useGetRenderPageDataQuery(eventName || "", { skip: !eventName });
	return (
		<div
			className="flex flex-col gap-4 w-full motion-safe:animate-[eventGlassPulse_3s_ease-in-out_infinite]"
			style={{
				backgroundColor: 'rgba(15,23,42,0.75)',
				backdropFilter: 'blur(6px)',
				border: '1px solid rgba(148,163,184,0.35)',
				borderRadius: node.style?.borderRadius || 0,
				padding: '22px 24px',
				color: '#e2e8f0',
				['--event-glass-glow' as string]: `${node.accentColor}2e`,
				...reducedMotionSafe,
			}}
		>
			<style>{`
				@keyframes eventGlassPulse {
					0%, 100% { box-shadow: 0 0 0 rgba(0,0,0,0); }
					50% { box-shadow: 0 0 24px var(--event-glass-glow); }
				}
			`}</style>
			<Slot index={HEADING_SLOT} fallback={<span style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</span>} />
			<div className="flex items-center gap-3 flex-wrap" style={{ fontSize: 13, color: '#94a3b8' }}>
				<span
					style={{ border: '1px solid rgba(148,163,184,0.4)', borderRadius: 999, padding: '4px 12px', ...lineClampStyle(node, 'endDateText'), ...textStylesFor(node, 'endDateText') }}
				>
					{eventName ? data?.event_deadline.end_date : node.endDateText}
				</span>
				<span
					style={{ border: '1px solid rgba(148,163,184,0.4)', borderRadius: 999, padding: '4px 12px', ...lineClampStyle(node, 'endHourText'), ...textStylesFor(node, 'endHourText') }}
				>
					{eventName ? data?.event_deadline.end_hour : node.endHourText}
				</span>
				<span
					style={{ border: '1px solid rgba(148,163,184,0.4)', borderRadius: 999, padding: '4px 12px', ...lineClampStyle(node, 'timeZoneText'), ...textStylesFor(node, 'timeZoneText') }}
				>
					{eventName ? data?.event_deadline.timezone : node.timeZoneText}
				</span>
			</div>
			<div className="flex items-center gap-3 flex-wrap mt-1">
				<Slot
					index={SUBMIT_SLOT}
					fallback={
						<a
							href={isEditing ? undefined : node.submitEntryHref || undefined}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							style={{ backgroundColor: node.accentColor, color: '#0f172a', fontSize: 13, fontWeight: 800, padding: '10px 18px', borderRadius: 8, textDecoration: 'none', ...lineClampStyle(node, 'submitEntryLabel'), ...textStylesFor(node, 'submitEntryLabel') }}
						>
							{node.submitEntryLabel}
						</a>
					}
				/>
				{node.registerHref && <Slot
					index={REGISTER_SLOT}
					fallback={
						<a
							href={isEditing ? undefined : node.registerHref || undefined}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							style={{ backgroundColor: 'transparent', color: '#e2e8f0', border: '1px solid rgba(226,232,240,0.5)', fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 8, textDecoration: 'none', ...lineClampStyle(node, 'registerLabel'), ...textStylesFor(node, 'registerLabel') }}
						>
							{node.registerLabel}
						</a>
					}
				/>}
			</div>
		</div>
	)
}

/* ---------------------------------------------------------------------- */
/* 8. twoColumnCard — elevated ticket-style card: perforated divider      */
/* between an info column and a dedicated action column                  */
/* ---------------------------------------------------------------------- */
function TwoColumnCard({ node, isEditing }: VariantProps) {
	const { data } = useGetRenderPageDataQuery(eventName || "", { skip: !eventName });
	return (
		<div
			className="flex flex-wrap items-stretch w-full overflow-hidden"
			style={{
				backgroundColor: 'transparent',
				border: '1px solid #ececef80',
				borderRadius: node.style?.borderRadius || 0,
				boxShadow: '0 8px 28px -14px rgba(24,24,27,0.25)',
			}}
		>
			<div className="flex flex-col gap-3 justify-center" style={{ flex: '1 1 220px', padding: '22px 24px', backgroundColor: '#23242580', }}>
				<Slot index={HEADING_SLOT} fallback={<span style={{ fontSize: 18, fontWeight: 700, color: '#18181b', letterSpacing: '-0.01em', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</span>} />
				<div className="flex flex-col gap-1.5" style={{ fontSize: 13, color: '#52525b' }}>
					<span className="flex items-center gap-1.5">
						<span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: node.accentColor, display: 'inline-block' }} />
						<span style={{ ...lineClampStyle(node, 'endDateText'), ...textStylesFor(node, 'endDateText') }}>{eventName ? data?.event_deadline.end_date : node.endDateText}</span>
					</span>
					<span className="flex items-center gap-1.5">
						<span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: node.accentColor, display: 'inline-block' }} />
						<span style={{ ...lineClampStyle(node, 'endHourText'), ...textStylesFor(node, 'endHourText') }}>{eventName ? data?.event_deadline.end_hour : node.endHourText}</span> (<span style={{ ...lineClampStyle(node, 'timeZoneText'), ...textStylesFor(node, 'timeZoneText') }}>{eventName ? data?.event_deadline.timezone : node.timeZoneText}</span>)
					</span>
				</div>
			</div>
			<div
				className="flex flex-col items-stretch justify-center gap-2 relative"
				style={{ flex: '0 1 200px', minWidth: 180, padding: '20px 22px', backgroundColor: '#23242540', borderLeft: `1.5px dashed ${node.accentColor}4d` }}
			>
				<Slot
					index={SUBMIT_SLOT}
					fallback={
						<a
							href={isEditing ? undefined : node.submitEntryHref || undefined}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							className="text-center"
							style={{
								background: gradient(node),
								color: '#fff',
								fontSize: 13,
								fontWeight: 700,
								padding: '10px 16px',
								borderRadius: 8,
								textDecoration: 'none',
								boxShadow: `0 8px 18px -8px ${node.accentColor}80`,
								...lineClampStyle(node, 'submitEntryLabel'),
								...textStylesFor(node, 'submitEntryLabel'),
							}}
						>
							{node.submitEntryLabel}
						</a>
					}
				/>
				{node.registerHref && <Slot
					index={REGISTER_SLOT}
					fallback={
						<a
							href={isEditing ? undefined : node.registerHref || undefined}
							onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							className="text-center"
							style={{ backgroundColor: 'transparent', color: node.accentColorSecondary, border: `1px solid ${node.accentColor}4d`, fontSize: 13, fontWeight: 700, padding: '10px 16px', borderRadius: 8, textDecoration: 'none', ...lineClampStyle(node, 'registerLabel'), ...textStylesFor(node, 'registerLabel') }}
						>
							{node.registerLabel}
						</a>
					}
				/>}
			</div>
		</div>
	)
}
