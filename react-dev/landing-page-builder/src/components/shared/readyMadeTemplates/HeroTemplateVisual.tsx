import React, { createContext, useContext } from 'react'
import type { HeroTemplateNode } from '@/types/node.type'
import { lineClampStyle } from '@/components/PropertyPanelUI/Sections/relatedComponents/LineClampControl'
import { textStylesFor } from '@/components/PropertyPanelUI/Sections/relatedComponents/TypographyControl'
import { isEditorPage } from '@/utils/checkPage'
import { heroBackground } from '@/utils/heroDefaults'

/** The Hero's rendered child nodes in HERO_CHILD_SLOTS order. Passed via
 * context so the variant layouts below stay unchanged. */
const HeroSlotsContext = createContext<React.ReactNode[]>([])

function useHeroSlot(index: number): React.ReactNode | undefined {
	const slots = useContext(HeroSlotsContext)
	return slots[index] ?? undefined
}

/** Renders the slot node when there is one, else the variant's own tag and
 * flat field. A filled slot uses <div> since a node can't nest inside <p>. */
function HeroText({ as: Tag, slotIndex, children, ...rest }: { as: 'h1' | 'h2' | 'h3' | 'p' | 'span'; slotIndex: number; children?: React.ReactNode } & React.HTMLAttributes<HTMLElement>) {
	const filled = useHeroSlot(slotIndex)
	const Element = (filled ? 'div' : Tag) as React.ElementType
	return <Element {...rest}>{filled ?? children}</Element>
}

/**
 * Data-in, JSX-out visual for `heroTemplate` — no canvas wiring (that lives in
 * the shell). Switches on uiType for the layout; the content inside comes in
 * as `slots`, falling back to the node's flat fields for older Heros.
 */
export function HeroTemplateVisual({ node, isEditing = isEditorPage, slots }: { node: HeroTemplateNode; isEditing?: boolean; slots?: React.ReactNode }) {
	return (
		<HeroSlotsContext.Provider value={React.Children.toArray(slots)}>
			<HeroTemplateLayout node={node} isEditing={isEditing} />
		</HeroSlotsContext.Provider>
	)
}

function HeroTemplateLayout({ node, isEditing }: { node: HeroTemplateNode; isEditing?: boolean }) {
	switch (node.uiType) {
		case 'splitImage':
			return <SplitImageHero node={node} isEditing={isEditing} />
		case 'gradientBold':
			return <GradientBoldHero node={node} isEditing={isEditing} />
		case 'minimalLeft':
			return <MinimalLeftHero node={node} isEditing={isEditing} />
		case 'darkOverlay':
			return <DarkOverlayHero node={node} isEditing={isEditing} />
		case 'stackedCta':
			return <StackedCtaHero node={node} isEditing={isEditing} />
		case 'sideBySideStats':
			return <SideBySideStatsHero node={node} isEditing={isEditing} />
		case 'glowScreenshot':
			return <GlowScreenshotHero node={node} isEditing={isEditing} />
		case 'darkBlurBackdrop':
			return <DarkBlurBackdropHero node={node} isEditing={isEditing} />
		case 'cinematicBlob':
			return <CinematicBlobHero node={node} isEditing={isEditing} />
		case 'photoBadges':
			return <PhotoBadgesHero node={node} isEditing={isEditing} />
		case 'darkImageOrb':
			return <DarkImageOrbHero node={node} isEditing={isEditing} />
		case 'diagonalPhoto':
			return <DiagonalPhotoHero node={node} isEditing={isEditing} />
		case 'credentialBadge':
			return <CredentialBadgeHero node={node} isEditing={isEditing} />
		case 'centeredClassic':
		default:
			return <CenteredClassicHero node={node} isEditing={isEditing} />
	}
}

function gradient(node: HeroTemplateNode, angle = 135) {
	return `linear-gradient(${angle}deg, ${node.accentColor}, ${node.accentColorSecondary})`
}

const SERIF = "Georgia, 'Times New Roman', serif"

/**
 * Shared CTA anchor — real ctaLabel/ctaHref, styled per-call-site. Renders
 * nothing when there's no ctaHref (e.g. a {{event_...}} placeholder that
 * resolved to nothing, such as registration being closed) — same
 * hide-if-missing behavior as EventWidgetsGroupTemplateVisual's
 * registerHref-gated register button and ButtonEnterpriseVisual.
 */
function CtaLink({ node, className, style, isEditing }: { node: HeroTemplateNode; className?: string; style?: React.CSSProperties; isEditing?: boolean }) {
	// With a child tree the CTA is a real button node — render it here so no
	// variant call site needs to know about slots.
	const ctaSlot = useHeroSlot(2)
	if (ctaSlot) return <>{ctaSlot}</>

	if (!node.ctaHref) return null

	return (
		<a
			href={isEditing ? undefined : node.ctaHref || undefined}
			onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
			className={className}
			style={style}
		>
			{node.ctaLabel}
		</a>
	)
}

/** A photo as a CSS background, or a soft gradient when the Hero has no image yet. */
function photoStyle(node: HeroTemplateNode, position = 'center'): React.CSSProperties {
	return node.imageUrl
		? { backgroundImage: `url("${node.imageUrl}")`, backgroundSize: 'cover', backgroundPosition: position }
		: { background: `linear-gradient(145deg, ${node.accentColor}55, ${node.accentColorSecondary}88)` }
}

/** A rule with a diamond in the middle: the gala invitation's divider. Inert. */
function DiamondRule({ color }: { color: string }) {
	return (
		<div aria-hidden="true" className="flex items-center justify-center gap-3 w-full" style={{ maxWidth: 260 }}>
			<span className="flex-1 h-px" style={{ backgroundColor: `${color}66` }} />
			<span style={{ width: 8, height: 8, transform: 'rotate(45deg)', backgroundColor: color }} />
			<span className="flex-1 h-px" style={{ backgroundColor: `${color}66` }} />
		</div>
	)
}

/** A looping-style strip of the CTA label, like a festival wristband or a ticker. Inert. */
function Ticker({ text, color, background, rotate = 0 }: { text: string; color: string; background: string; rotate?: number }) {
	const line = Array.from({ length: 10 }, () => `${text} ✦`).join('  ')
	return (
		<div aria-hidden="true" className="w-full overflow-hidden whitespace-nowrap py-2 text-xs font-extrabold uppercase" style={{ color, background, letterSpacing: '0.28em', transform: rotate ? `rotate(${rotate}deg)` : undefined }}>
			{line}
		</div>
	)
}

/** Variant #1 — centeredClassic, a gala invitation: cream paper inside a thin double frame with corner brackets, a diamond rule, a serif headline and an italic line, then a pill CTA. */
function CenteredClassicHero({ node, isEditing }: { node: HeroTemplateNode; isEditing?: boolean }) {
	const ink = node.accentColor
	const corner = (pos: React.CSSProperties) => <span aria-hidden="true" className="absolute" style={{ width: 22, height: 22, ...pos }} />
	return (
		<div className="w-full min-h-[50dvh] flex items-center justify-center px-5 py-12" style={{ backgroundColor: heroBackground(node) }}>
			<div className="relative w-full flex flex-col items-center text-center gap-5 px-8 py-14" style={{ maxWidth: 780, border: `1px solid ${ink}44`, outline: `1px solid ${ink}22`, outlineOffset: 8, backgroundColor: '#fffdf9' }}>
				{corner({ top: 10, left: 10, borderTop: `2px solid ${ink}`, borderLeft: `2px solid ${ink}` })}
				{corner({ top: 10, right: 10, borderTop: `2px solid ${ink}`, borderRight: `2px solid ${ink}` })}
				{corner({ bottom: 10, left: 10, borderBottom: `2px solid ${ink}`, borderLeft: `2px solid ${ink}` })}
				{corner({ bottom: 10, right: 10, borderBottom: `2px solid ${ink}`, borderRight: `2px solid ${ink}` })}
				<DiamondRule color={ink} />
				<HeroText as="h1" slotIndex={0} className="text-4xl font-bold leading-tight max-w-[640px]" style={{ fontFamily: SERIF, color: '#2b1b3d', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</HeroText>
				<HeroText as="p" slotIndex={1} className="text-lg italic max-w-[540px]" style={{ fontFamily: SERIF, color: '#6b5b73', ...lineClampStyle(node, 'subheading'), ...textStylesFor(node, 'subheading') }}>{node.subheading}</HeroText>
				<DiamondRule color={ink} />
				<CtaLink
					node={node}
					isEditing={isEditing}
					className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-bold uppercase tracking-widest cursor-pointer no-underline"
					style={{ backgroundColor: ink, color: '#ffffff' }}
				/>
			</div>
		</div>
	)
}

/** Variant #2 — splitImage, an editorial split: left-aligned serif copy beside a tall arch-topped photo that sits on an offset colour block, with a thin accent rule between headline and body. */
function SplitImageHero({ node, isEditing }: { node: HeroTemplateNode; isEditing?: boolean }) {
	return (
		<div className="w-full min-h-[50dvh] flex flex-wrap items-center gap-10 px-8 py-12" style={{ backgroundColor: heroBackground(node) }}>
			<div className="flex flex-col gap-4 items-start text-left" style={{ flex: '1 1 320px', minWidth: 260 }}>
				<div aria-hidden="true" className="flex items-center gap-3">
					<span style={{ width: 36, height: 2, backgroundColor: node.accentColor }} />
					<span style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: node.accentColor }} />
				</div>
				<HeroText as="h1" slotIndex={0} className="text-4xl font-bold leading-tight" style={{ fontFamily: SERIF, color: '#1c1917', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</HeroText>
				<HeroText as="p" slotIndex={1} className="text-base" style={{ color: '#57534e', ...lineClampStyle(node, 'subheading'), ...textStylesFor(node, 'subheading') }}>{node.subheading}</HeroText>
				<CtaLink
					node={node}
					isEditing={isEditing}
					className="inline-flex items-center justify-center px-7 py-3 text-sm font-bold uppercase tracking-widest cursor-pointer no-underline"
					style={{ backgroundColor: node.accentColor, color: '#ffffff' }}
				/>
			</div>
			<div className="relative flex items-center justify-center" style={{ flex: '1 1 300px', minWidth: 240 }}>
				<div aria-hidden="true" className="absolute" style={{ width: '70%', maxWidth: 300, aspectRatio: '3 / 4', borderRadius: '999px 999px 0 0', backgroundColor: `${node.accentColor}33`, transform: 'translate(22px, 18px)' }} />
				<div className="relative w-[70%]" style={{ maxWidth: 300, aspectRatio: '3 / 4', borderRadius: '999px 999px 0 0', boxShadow: '0 30px 50px -28px rgba(28,25,23,0.55)', ...photoStyle(node) }} />
			</div>
		</div>
	)
}

/** Variant #3 — gradientBold, a festival burst: the whole hero is the accent gradient with overlapping translucent circles, huge sans type on the left, and a rotated ticker strip of the CTA label across the base. */
function GradientBoldHero({ node, isEditing }: { node: HeroTemplateNode; isEditing?: boolean }) {
	return (
		<div className="w-full min-h-[50dvh] relative overflow-hidden flex flex-col justify-between" style={{ background: gradient(node, 135) }}>
			<div aria-hidden="true" className="absolute rounded-full" style={{ width: 380, height: 380, top: -120, right: -60, backgroundColor: 'rgba(255,255,255,0.12)' }} />
			<div aria-hidden="true" className="absolute rounded-full" style={{ width: 220, height: 220, top: 60, right: 140, border: '2px solid rgba(255,255,255,0.35)' }} />
			<div aria-hidden="true" className="absolute rounded-full" style={{ width: 120, height: 120, bottom: 80, left: -30, backgroundColor: 'rgba(255,255,255,0.16)' }} />
			<div className="relative flex flex-col items-start gap-4 px-8 pt-14 pb-10 max-w-[720px]">
				<HeroText as="h1" slotIndex={0} className="text-5xl font-black leading-none" style={{ color: '#ffffff', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</HeroText>
				<HeroText as="p" slotIndex={1} className="text-lg max-w-[520px]" style={{ color: 'rgba(255,255,255,0.88)', ...lineClampStyle(node, 'subheading'), ...textStylesFor(node, 'subheading') }}>{node.subheading}</HeroText>
				<CtaLink
					node={node}
					isEditing={isEditing}
					className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-extrabold cursor-pointer no-underline mt-2"
					style={{ backgroundColor: '#ffffff', color: node.accentColor }}
				/>
			</div>
			<div className="relative -mx-4 mb-3"><Ticker text={node.ctaLabel} color="#ffffff" background="rgba(17,24,39,0.82)" rotate={-2} /></div>
		</div>
	)
}

/** Variant #4 — minimalLeft, a Swiss poster: warm off-white, an oversized grotesque headline, a heavy rule with an accent square above it, and an underlined CTA. No image. */
function MinimalLeftHero({ node, isEditing }: { node: HeroTemplateNode; isEditing?: boolean }) {
	return (
		<div className="w-full min-h-[50dvh] relative overflow-hidden flex flex-col justify-center px-8 py-14" style={{ backgroundColor: heroBackground(node) }}>
			<div aria-hidden="true" className="absolute rounded-full" style={{ width: 260, height: 260, top: -80, right: -60, backgroundColor: node.accentColor }} />
			<div className="relative flex flex-col items-start gap-5 max-w-[720px]">
				<div aria-hidden="true" className="flex items-center gap-3 w-full">
					<span style={{ width: 16, height: 16, backgroundColor: node.accentColor }} />
					<span className="flex-1" style={{ height: 3, backgroundColor: '#0f0f10' }} />
				</div>
				<HeroText as="h1" slotIndex={0} className="text-5xl font-extrabold leading-none" style={{ color: '#0f0f10', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</HeroText>
				<HeroText as="p" slotIndex={1} className="text-base max-w-[480px]" style={{ color: '#52525b', ...lineClampStyle(node, 'subheading'), ...textStylesFor(node, 'subheading') }}>{node.subheading}</HeroText>
				<CtaLink
					node={node}
					isEditing={isEditing}
					className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest cursor-pointer no-underline"
					style={{ color: '#0f0f10', borderBottom: '2px solid #0f0f10', paddingBottom: 2 }}
				/>
			</div>
		</div>
	)
}

/** Variant #5 — darkOverlay, a cinematic billboard: a full-bleed photo with a deep scrim and top vignette, a hairline and the subheading as a spaced eyebrow, a large serif headline at the base, and an outlined CTA docked at the far edge. */
function DarkOverlayHero({ node, isEditing }: { node: HeroTemplateNode; isEditing?: boolean }) {
	return (
		<div className="w-full min-h-[60dvh] relative overflow-hidden flex flex-col justify-end" style={{ backgroundColor: '#0c0a12', ...photoStyle(node) }}>
			<div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,6,14,0.92) 8%, rgba(8,6,14,0.35) 55%, rgba(8,6,14,0.55) 100%)' }} />
			<div aria-hidden="true" className="absolute inset-x-8 top-8 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
			<div className="relative flex flex-wrap items-end justify-between gap-6 px-8 pb-10 pt-24">
				<div className="flex flex-col gap-3 max-w-[640px]" style={{ flex: '1 1 320px' }}>
					<HeroText as="span" slotIndex={1} className="text-xs font-bold uppercase" style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '0.22em', ...lineClampStyle(node, 'subheading'), ...textStylesFor(node, 'subheading') }}>{node.subheading}</HeroText>
					<HeroText as="h1" slotIndex={0} className="text-5xl font-bold leading-tight" style={{ fontFamily: SERIF, color: '#ffffff', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</HeroText>
				</div>
				<CtaLink
					node={node}
					isEditing={isEditing}
					className="inline-flex items-center justify-center px-8 py-3 text-sm font-bold uppercase tracking-widest cursor-pointer no-underline shrink-0"
					style={{ border: '1px solid rgba(255,255,255,0.8)', color: '#ffffff', backgroundColor: 'transparent' }}
				/>
			</div>
		</div>
	)
}

/** Variant #6 — stackedCta, a boarding-pass ticket: white ticket with a serif headline on the left, a dashed perforation with two punched notches, and the CTA as an accent-coloured stub on the right; the stub drops below on narrow widths. */
function StackedCtaHero({ node, isEditing }: { node: HeroTemplateNode; isEditing?: boolean }) {
	const stage = '#eef0f6'
	return (
		<div className="w-full min-h-[50dvh] flex items-center justify-center px-6 py-12" style={{ background: `linear-gradient(160deg, ${stage}, ${node.accentColor}22)` }}>
			<div className="relative w-full flex flex-wrap overflow-hidden" style={{ maxWidth: 780, borderRadius: 18, backgroundColor: '#ffffff', boxShadow: '0 28px 50px -26px rgba(17,24,39,0.45)' }}>
				<div className="flex flex-col justify-center gap-3 px-8 py-10" style={{ flex: '1 1 380px' }}>
					<div aria-hidden="true" className="flex items-center gap-2 text-[10px] font-bold uppercase" style={{ color: node.accentColor, letterSpacing: '0.3em' }}>
						<span style={{ width: 22, height: 2, backgroundColor: node.accentColor }} />
						Admit one
					</div>
					<HeroText as="h1" slotIndex={0} className="text-3xl font-bold leading-tight" style={{ fontFamily: SERIF, color: '#1f2937', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</HeroText>
					<HeroText as="p" slotIndex={1} className="text-sm" style={{ color: '#6b7280', ...lineClampStyle(node, 'subheading'), ...textStylesFor(node, 'subheading') }}>{node.subheading}</HeroText>
				</div>
				<div className="relative flex items-center justify-center" style={{ flex: '0 1 220px', minWidth: 180, minHeight: 90, borderLeft: `2px dashed ${node.accentColor}55`, backgroundColor: node.accentColor }}>
					<span aria-hidden="true" className="absolute rounded-full" style={{ width: 22, height: 22, top: -11, left: -12, backgroundColor: stage }} />
					<span aria-hidden="true" className="absolute rounded-full" style={{ width: 22, height: 22, bottom: -11, left: -12, backgroundColor: stage }} />
					<CtaLink
						node={node}
						isEditing={isEditing}
						className="w-full flex items-center justify-center px-6 py-6 text-sm font-extrabold uppercase tracking-widest cursor-pointer no-underline"
						style={{ backgroundColor: node.accentColor, color: '#ffffff' }}
					/>
				</div>
			</div>
		</div>
	)
}

/** Variant #7 — sideBySideStats, a photo mosaic: copy on the left and, on the right, three tiles cut from the one photo (a tall arch, a wide crop and a solid accent tile with a ring) so a single image reads like a gallery. */
function SideBySideStatsHero({ node, isEditing }: { node: HeroTemplateNode; isEditing?: boolean }) {
	return (
		<div className="w-full min-h-[50dvh] flex flex-wrap items-center gap-10 px-8 py-12" style={{ backgroundColor: heroBackground(node) }}>
			<div className="flex flex-col gap-4 items-start text-left" style={{ flex: '1 1 320px', minWidth: 260 }}>
				<HeroText as="h1" slotIndex={0} className="text-4xl font-bold leading-tight" style={{ fontFamily: SERIF, color: '#111827', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</HeroText>
				<HeroText as="p" slotIndex={1} className="text-base" style={{ color: '#4b5563', ...lineClampStyle(node, 'subheading'), ...textStylesFor(node, 'subheading') }}>{node.subheading}</HeroText>
				<CtaLink
					node={node}
					isEditing={isEditing}
					className="inline-flex items-center justify-center rounded-xl px-7 py-3 text-sm font-bold cursor-pointer no-underline"
					style={{ backgroundColor: node.accentColor, color: '#ffffff' }}
				/>
			</div>
			<div aria-hidden="true" className="grid gap-3" style={{ flex: '1 1 300px', minWidth: 240, gridTemplateColumns: '1fr 1fr', gridTemplateRows: '120px 120px 90px' }}>
				<div style={{ gridRow: 'span 2', borderRadius: '999px 999px 16px 16px', ...photoStyle(node, 'left center') }} />
				<div style={{ borderRadius: 16, ...photoStyle(node, 'right top') }} />
				<div className="relative overflow-hidden" style={{ borderRadius: 16, background: gradient(node, 135) }}>
					<span className="absolute rounded-full" style={{ width: 90, height: 90, right: -20, bottom: -30, border: '2px solid rgba(255,255,255,0.5)' }} />
					<span className="absolute rounded-full" style={{ width: 30, height: 30, left: 14, top: 14, backgroundColor: 'rgba(255,255,255,0.35)' }} />
				</div>
				<div style={{ gridColumn: 'span 2', borderRadius: 16, ...photoStyle(node, 'center bottom') }} />
			</div>
		</div>
	)
}

/** Variant #8 — glowScreenshot, an aurora stage: deep navy with soft northern-light blobs, centred headline and a glowing pill CTA, and the photo rising from the base inside a lit arch. */
function GlowScreenshotHero({ node, isEditing }: { node: HeroTemplateNode; isEditing?: boolean }) {
	return (
		<div className="w-full min-h-[50dvh] relative overflow-hidden flex flex-col items-center px-6 pt-14 pb-0" style={{ backgroundColor: heroBackground(node) }}>
			<div aria-hidden="true" className="absolute rounded-full" style={{ width: 460, height: 300, top: -120, left: '8%', background: `radial-gradient(closest-side, ${node.accentColor}88, transparent)`, filter: 'blur(40px)' }} />
			<div aria-hidden="true" className="absolute rounded-full" style={{ width: 440, height: 280, top: -90, right: '6%', background: `radial-gradient(closest-side, ${node.accentColorSecondary}77, transparent)`, filter: 'blur(40px)' }} />
			<div aria-hidden="true" className="absolute rounded-full" style={{ width: 340, height: 220, top: 20, left: '36%', background: 'radial-gradient(closest-side, rgba(45,212,191,0.4), transparent)', filter: 'blur(40px)' }} />
			<div className="relative flex flex-col items-center text-center gap-4" style={{ maxWidth: 680 }}>
				<HeroText as="h1" slotIndex={0} className="text-5xl font-extrabold leading-tight" style={{ color: '#ffffff', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</HeroText>
				<HeroText as="p" slotIndex={1} className="text-base" style={{ color: 'rgba(255,255,255,0.72)', ...lineClampStyle(node, 'subheading'), ...textStylesFor(node, 'subheading') }}>{node.subheading}</HeroText>
				<CtaLink
					node={node}
					isEditing={isEditing}
					className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-bold cursor-pointer no-underline mt-1"
					style={{ backgroundColor: node.accentColor, color: '#ffffff', boxShadow: `0 0 32px -4px ${node.accentColor}` }}
				/>
			</div>
			<div className="relative mt-10 w-full flex justify-center" style={{ maxWidth: 360 }}>
				<div aria-hidden="true" className="absolute inset-x-6 top-4 bottom-0" style={{ borderRadius: '999px 999px 0 0', boxShadow: `0 0 70px 6px ${node.accentColor}66` }} />
				<div className="relative w-full" style={{ aspectRatio: '4 / 3.4', borderRadius: '999px 999px 0 0', border: '1px solid rgba(255,255,255,0.18)', ...photoStyle(node, 'center top') }} />
			</div>
		</div>
	)
}

/** Variant #9 — darkBlurBackdrop, a neon night: near-black with a faint grid, two soft spotlight beams crossing from the top, huge uppercase type at the base-left and a hard white CTA at the right. */
function DarkBlurBackdropHero({ node, isEditing }: { node: HeroTemplateNode; isEditing?: boolean }) {
	const beam = (left: string, rotate: number, color: string) => (
		<div aria-hidden="true" className="absolute pointer-events-none" style={{ top: -40, left, width: 220, height: 560, transform: `rotate(${rotate}deg)`, transformOrigin: 'top center', background: `linear-gradient(to bottom, ${color}, transparent 85%)`, clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)', filter: 'blur(6px)' }} />
	)
	return (
		<div className="w-full min-h-[48dvh] relative overflow-hidden flex flex-col justify-end" style={{ backgroundColor: heroBackground(node) }}>
			<div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '44px 44px', maskImage: 'linear-gradient(to bottom, black, transparent 80%)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 80%)' }} />
			{beam('14%', -14, 'rgba(236,72,153,0.55)')}
			{beam('52%', 16, 'rgba(45,212,191,0.45)')}
			{beam('70%', 4, `${node.accentColor}77`)}
			<div className="relative flex flex-wrap items-end justify-between gap-6 px-8 pb-10 pt-28">
				<div className="flex flex-col gap-3 max-w-[640px]" style={{ flex: '1 1 320px' }}>
					<HeroText as="h1" slotIndex={0} className="text-5xl font-black uppercase leading-none" style={{ color: '#ffffff', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</HeroText>
					<HeroText as="p" slotIndex={1} className="text-sm max-w-[460px]" style={{ color: 'rgba(255,255,255,0.7)', ...lineClampStyle(node, 'subheading'), ...textStylesFor(node, 'subheading') }}>{node.subheading}</HeroText>
				</div>
				<CtaLink
					node={node}
					isEditing={isEditing}
					className="inline-flex items-center justify-center px-8 py-3 text-sm font-extrabold uppercase tracking-widest cursor-pointer no-underline shrink-0"
					style={{ backgroundColor: '#ffffff', color: '#0a0a0d' }}
				/>
			</div>
		</div>
	)
}

/** Variant #10 — cinematicBlob, evergreen editorial: deep green, a lime glow, two thin rings in the corner, the subheading as a spaced eyebrow and a large serif headline whose last word is a lighter italic. */
function CinematicBlobHero({ node, isEditing }: { node: HeroTemplateNode; isEditing?: boolean }) {
	// This variant's signature move is splitting the *flat* heading string so
	// its last word can be italicised. A slot is a rendered node, not a
	// string, so there's nothing to split — the slot renders whole and the
	// user styles any part of it themselves in the text editor instead.
	const words = node.heading.trim().split(' ')
	const lastWord = words.length > 1 ? words.pop() : undefined
	const leadingHeading = words.join(' ')

	return (
		<div className="w-full min-h-[50dvh] relative overflow-hidden flex flex-col justify-center px-8 py-16" style={{ backgroundColor: heroBackground(node) }}>
			<div aria-hidden="true" className="absolute rounded-full pointer-events-none" style={{ width: 460, height: 460, bottom: -180, right: '-8%', background: 'radial-gradient(circle, rgba(163,230,53,0.5), rgba(163,230,53,0) 70%)', filter: 'blur(10px)' }} />
			<div aria-hidden="true" className="absolute rounded-full pointer-events-none" style={{ width: 300, height: 300, top: -110, right: 60, border: '1px solid rgba(244,244,230,0.14)' }} />
			<div aria-hidden="true" className="absolute rounded-full pointer-events-none" style={{ width: 200, height: 200, top: -60, right: 110, border: '1px solid rgba(244,244,230,0.1)' }} />
			<div className="relative flex flex-col items-start gap-5 max-w-[640px]">
				<div className="flex items-center gap-3">
					<span aria-hidden="true" style={{ width: 28, height: 1, backgroundColor: 'rgba(163,230,53,0.8)' }} />
					<HeroText as="span" slotIndex={1}
						className="text-xs font-bold uppercase"
						style={{ color: 'rgba(255,255,255,0.85)', letterSpacing: '0.2em', ...lineClampStyle(node, 'subheading'), ...textStylesFor(node, 'subheading') }}>{node.subheading}</HeroText>
				</div>
				<HeroText as="h1" slotIndex={0} className="text-5xl font-bold leading-tight" style={{ fontFamily: SERIF, color: '#f4f4e6', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>
					{/* The last-word italic flourish is this variant's signature, but it
					    can only apply to the flat string — a filled slot renders its own
					    node, which HeroText returns in place of this fallback. */}
					{leadingHeading}
					{lastWord && <> <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(163,230,53,0.9)' }}>{lastWord}</em></>}
				</HeroText>
				<CtaLink
					node={node}
					isEditing={isEditing}
					className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest cursor-pointer no-underline"
					style={{ color: '#f4f4e6', borderBottom: '1px solid rgba(244,244,230,0.5)', paddingBottom: 2 }}
				/>
			</div>
		</div>
	)
}

/** Variant #11 — photoBadges, warm community: cream background, a soft blob portrait inside a dashed orbit with a star and a sparkle sticker and a few confetti dots, and friendly serif copy beside it. */
function PhotoBadgesHero({ node, isEditing }: { node: HeroTemplateNode; isEditing?: boolean }) {
	const sticker = (pos: React.CSSProperties, bg: string, children: React.ReactNode) => (
		<span aria-hidden="true" className="absolute rounded-full flex items-center justify-center" style={{ width: 46, height: 46, backgroundColor: bg, boxShadow: '0 10px 18px -8px rgba(59,35,20,0.45)', ...pos }}>{children}</span>
	)
	return (
		<div className="w-full min-h-[50dvh] flex flex-wrap items-center gap-10 px-8 py-12" style={{ backgroundColor: heroBackground(node) }}>
			<div className="flex flex-col gap-4 items-start text-left" style={{ flex: '1 1 300px', minWidth: 260 }}>
				<HeroText as="h1" slotIndex={0} className="text-4xl font-bold leading-tight" style={{ fontFamily: SERIF, color: '#3b2314', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</HeroText>
				<HeroText as="p" slotIndex={1} className="text-base" style={{ color: '#78604f', ...lineClampStyle(node, 'subheading'), ...textStylesFor(node, 'subheading') }}>{node.subheading}</HeroText>
				<CtaLink
					node={node}
					isEditing={isEditing}
					className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-bold cursor-pointer no-underline"
					style={{ backgroundColor: node.accentColor, color: '#ffffff' }}
				/>
			</div>
			<div className="relative flex items-center justify-center" style={{ flex: '1 1 280px', minWidth: 230 }}>
				<div aria-hidden="true" className="absolute rounded-full" style={{ width: '88%', maxWidth: 380, aspectRatio: '1 / 1', border: `2px dashed ${node.accentColor}66` }} />
				<div
					className="relative w-[72%] overflow-hidden"
					style={{ aspectRatio: '1 / 1', maxWidth: 320, borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%', boxShadow: '0 24px 40px -22px rgba(59,35,20,0.55)', ...photoStyle(node) }}
				/>
				{sticker({ top: 6, right: '12%' }, node.accentColor, <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.1 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" /></svg>)}
				{sticker({ bottom: 14, left: '8%' }, '#ffffff', <svg width="22" height="22" viewBox="0 0 24 24" fill={node.accentColor}><path d="M12 2c.6 4.8 2.2 6.4 7 7-4.8.6-6.4 2.2-7 7-.6-4.8-2.2-6.4-7-7 4.8-.6 6.4-2.2 7-7z" /></svg>)}
				<span aria-hidden="true" className="absolute rounded-full" style={{ width: 12, height: 12, top: '30%', left: '2%', backgroundColor: node.accentColorSecondary }} />
				<span aria-hidden="true" className="absolute rounded-full" style={{ width: 8, height: 8, bottom: '22%', right: '4%', backgroundColor: node.accentColor }} />
			</div>
		</div>
	)
}

/** Variant #12 — darkImageOrb, eclipse: a night-purple stage, centred serif copy, and the photo as a glowing orb ringed by three faint orbits that each carry a small planet. */
function DarkImageOrbHero({ node, isEditing }: { node: HeroTemplateNode; isEditing?: boolean }) {
	const orbit = (size: number, planet: React.CSSProperties) => (
		<div aria-hidden="true" className="absolute rounded-full" style={{ width: size, height: size, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '1px solid rgba(255,255,255,0.1)' }}>
			<span className="absolute rounded-full" style={{ width: 10, height: 10, backgroundColor: node.accentColor, boxShadow: `0 0 12px 2px ${node.accentColor}`, ...planet }} />
		</div>
	)
	return (
		<div className="w-full min-h-[50dvh] relative overflow-hidden flex flex-col items-center justify-center text-center px-6 py-14 gap-8" style={{ background: 'radial-gradient(120% 80% at 50% 100%, #2a1550 0%, #0b0713 60%)' }}>
			<div className="relative flex flex-col items-center gap-4" style={{ maxWidth: 600 }}>
				<HeroText as="h1" slotIndex={0} className="text-4xl font-bold leading-tight" style={{ fontFamily: SERIF, color: '#ffffff', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</HeroText>
				<HeroText as="p" slotIndex={1} className="text-base" style={{ color: 'rgba(255,255,255,0.68)', ...lineClampStyle(node, 'subheading'), ...textStylesFor(node, 'subheading') }}>{node.subheading}</HeroText>
				<CtaLink
					node={node}
					isEditing={isEditing}
					className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-bold cursor-pointer no-underline"
					style={{ backgroundColor: node.accentColor, color: '#ffffff', boxShadow: `0 0 28px -4px ${node.accentColor}` }}
				/>
			</div>
			<div className="relative flex items-center justify-center" style={{ width: 'min(100%, 380px)', aspectRatio: '1 / 1' }}>
				{orbit(380, { top: '14%', left: '8%' })}
				{orbit(310, { bottom: '10%', right: '16%' })}
				{orbit(250, { top: '6%', right: '30%' })}
				<div
					className="rounded-full"
					style={{ width: '52%', aspectRatio: '1 / 1', boxShadow: `0 0 0 1px rgba(255,255,255,0.1), 0 0 70px 12px ${node.accentColor}66`, ...photoStyle(node) }}
				/>
			</div>
		</div>
	)
}

/** Variant #13 — diagonalPhoto, a festival poster: full-bleed photo under a left-to-right scrim, a diagonal colour band on the right, giant uppercase type, and a tilted tape strip of the CTA label along the bottom. */
function DiagonalPhotoHero({ node, isEditing }: { node: HeroTemplateNode; isEditing?: boolean }) {
	return (
		<div className="w-full min-h-[56dvh] relative overflow-hidden flex flex-col justify-between" style={{ backgroundColor: '#18181b', ...photoStyle(node) }}>
			<div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(100deg, rgba(0,0,0,0.82) 35%, rgba(0,0,0,0.15) 75%)' }} />
			<div aria-hidden="true" className="absolute inset-y-0" style={{ width: '20%', right: 0, background: gradient(node, 180), clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 0% 100%)' }} />
			<div className="relative flex flex-col items-start gap-4 px-8 pt-14 pb-8" style={{ maxWidth: 640 }}>
				<HeroText as="h1" slotIndex={0} className="text-5xl font-black uppercase leading-none" style={{ color: '#ffffff', ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</HeroText>
				<HeroText as="p" slotIndex={1} className="text-sm max-w-[460px]" style={{ color: 'rgba(255,255,255,0.85)', ...lineClampStyle(node, 'subheading'), ...textStylesFor(node, 'subheading') }}>{node.subheading}</HeroText>
				<CtaLink
					node={node}
					isEditing={isEditing}
					className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-extrabold uppercase tracking-wider cursor-pointer no-underline"
					style={{ backgroundColor: '#ffffff', color: '#18181b' }}
				/>
			</div>
			<div className="relative -mx-4 mb-4"><Ticker text={node.ctaLabel} color="#ffffff" background={gradient(node, 90)} rotate={-3} /></div>
		</div>
	)
}

/**
 * Variant #14 — credentialBadge: an event/conference attendee-badge
 * composition -- a die-cut vertical card with a lanyard hole punched through
 * its top edge, heading/subheading printed like a bearer's name plate, a
 * monospace barcode strip standing in for a real check-in code, and the CTA
 * rendered as a perforated tear-off ticket tab along the bottom rather than
 * an inline button. Flat ink-on-security-paper color, no gradients/glow/
 * glass -- a deliberate departure from this file's otherwise
 * gradient/glow-heavy variants, grounded in the one thing every conference/
 * competition shares regardless of subject: its credentialing apparatus.
 */
function CredentialBadgeHero({ node, isEditing }: { node: HeroTemplateNode; isEditing?: boolean }) {
	const paper = '#EAF2EE'
	const ink = '#1B1D22'
	return (
		<div className="w-full min-h-[50dvh] flex items-center justify-center px-6 py-12" style={{ backgroundColor: heroBackground(node) }}>
			<div
				className="relative w-full flex flex-col items-stretch overflow-hidden"
				style={{ maxWidth: 380, borderRadius: 20, backgroundColor: paper, border: `1px solid ${ink}1a`, boxShadow: '0 16px 40px -20px rgba(20,30,25,0.35)' }}
			>
				<div
					aria-hidden="true"
					className="absolute left-1/2 -translate-x-1/2 rounded-full"
					style={{ top: 14, width: 16, height: 16, backgroundColor: '#DDE7E3', boxShadow: `inset 0 0 0 1px ${ink}33` }}
				/>
				<div className="flex flex-col items-center gap-3 px-7 pt-9 pb-6 text-center">
					{node.imageUrl && (
						<img src={node.imageUrl} alt={node.heading} className="rounded-md object-cover" style={{ width: 56, height: 56, border: `2px solid ${ink}` }} />
					)}
					<HeroText as="h1" slotIndex={0} className="text-2xl font-bold leading-tight" style={{ fontFamily: SERIF, color: ink, ...lineClampStyle(node, 'heading'), ...textStylesFor(node, 'heading') }}>{node.heading}</HeroText>
					<HeroText as="span" slotIndex={1} className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: node.accentColor, ...lineClampStyle(node, 'subheading'), ...textStylesFor(node, 'subheading') }}>{node.subheading}</HeroText>
					<div
						aria-hidden="true"
						className="w-full"
						style={{ height: 26, marginTop: 6, opacity: 0.75, backgroundImage: `repeating-linear-gradient(90deg, ${ink} 0 2px, transparent 2px 5px, ${ink} 5px 6px, transparent 6px 11px)` }}
					/>
				</div>
				<div aria-hidden="true" className="w-full flex items-center justify-between px-3" style={{ height: 1 }}>
					{Array.from({ length: 14 }).map((_, i) => (
						<span key={i} className="rounded-full shrink-0" style={{ width: 4, height: 4, backgroundColor: '#DDE7E3', border: `1px solid ${ink}22` }} />
					))}
				</div>
				<CtaLink
					node={node}
					isEditing={isEditing}
					className="w-full flex items-center justify-center py-4 text-sm font-bold uppercase tracking-wide cursor-pointer no-underline"
					style={{ backgroundColor: node.accentColor, color: '#ffffff' }}
				/>
			</div>
		</div>
	)
}
