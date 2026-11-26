import React, { createContext, useContext } from 'react'
import type { PersonalCardTemplateNode } from '@/types/node.type'
import { lineClampStyle } from '@/components/PropertyPanelUI/Sections/relatedComponents/LineClampControl'
import { textStylesFor } from '@/components/PropertyPanelUI/Sections/relatedComponents/TypographyControl'
import { isEditorPage } from '@/utils/checkPage'

/**
 * Pure "visual" component for the "personalCardTemplate" content type's Ready
 * Made Templates — data-in, JSX-out, no drag/drop/popover/canvas wiring (that
 * lives in the shell component). Switches on node.uiType to render one of 8
 * genuinely distinct compositions, all driven only by the node's own data
 * fields (name, role, bio, imageUrl, socialLinks, accentColor,
 * accentColorSecondary) — see PersonalCardTemplateNode in
 * src/types/node.type.ts for the shape.
 *
 * accentColor drives every solid-color use (text, badges, dots, borders);
 * accentColorSecondary is only ever paired with accentColor as a gradient
 * end-stop (linear-gradient(135deg, accentColor, accentColorSecondary)) —
 * no other hardcoded palette colors are used for the node's own accent.
 */
export function PersonalCardTemplateVisual({ node, isEditing = isEditorPage, slots }: { node: PersonalCardTemplateNode; isEditing?: boolean; slots?: React.ReactNode }) {
	return (
		<PersonalCardSlotsContext.Provider value={React.Children.toArray(slots)}>
			<PersonalCardLayout node={node} isEditing={isEditing} />
		</PersonalCardSlotsContext.Provider>
	)
}

/** Rendered children: [name, role, bio, social0, ...]. Empty for legacy nodes. */
const PersonalCardSlotsContext = createContext<React.ReactNode[]>([])

const NAME_SLOT = 0
const ROLE_SLOT = 1
const BIO_SLOT = 2
const SOCIAL_SLOT_START = 3

/** A slot node, or `fallback` (the variant's original markup). `wrap` only
 * applies to the node, so legacy markup stays untouched. */
function Slot({ index, fallback, wrap }: { index: number; fallback: React.ReactNode; wrap?: (slot: React.ReactNode) => React.ReactNode }) {
	const slot = useContext(PersonalCardSlotsContext)[index]
	if (!slot) return <>{fallback}</>
	return <>{wrap ? wrap(slot) : slot}</>
}

function PersonalCardLayout({ node, isEditing }: { node: PersonalCardTemplateNode; isEditing?: boolean }) {
	switch (node.uiType) {
		case 'horizontalRow':
			return <StatStripCard node={node} isEditing={isEditing} />
		case 'darkGlass':
			return <DarkGlassCard node={node} isEditing={isEditing} />
		case 'minimalFlat':
			return <EditorialBylineCard node={node} isEditing={isEditing} />
		case 'imageBackdrop':
			return <PosterCard node={node} isEditing={isEditing} />
		case 'bordered':
			return <HoloBadgeCard node={node} isEditing={isEditing} />
		case 'socialFocus':
			return <ContactOrbitCard node={node} isEditing={isEditing} />
		case 'compactInline':
			return <BusinessCardStrip node={node} isEditing={isEditing} />
		case 'attendeeBadge':
			return <AttendeeBadgeCard node={node} isEditing={isEditing} />
		case 'classicCentered':
		default:
			return <SpotlightCard node={node} isEditing={isEditing} />
	}
}

function gradient(node: PersonalCardTemplateNode, angle = 135) {
	return `linear-gradient(${angle}deg, ${node.accentColor}, ${node.accentColorSecondary})`
}

/** Shared circular avatar — image if provided, initials fallback (accentColor gradient) otherwise. */
function Avatar({ node, size, ring }: { node: PersonalCardTemplateNode; size: number; ring?: string }) {
	const initials = node.name
		.split(' ')
		.map((part) => part[0])
		.filter(Boolean)
		.slice(0, 2)
		.join('')
		.toUpperCase()

	if (node.imageUrl) {
		return (
			<img
				src={node.imageUrl}
				alt={node.name}
				style={{ width: size, height: size, border: ring ? `3px solid ${ring}` : undefined }}
				className="rounded-full object-cover shrink-0"
			/>
		)
	}

	return (
		<div
			style={{
				width: size,
				height: size,
				fontSize: size * 0.36,
				border: ring ? `3px solid ${ring}` : undefined,
				background: gradient(node),
			}}
			className="rounded-full shrink-0 flex items-center justify-center text-white font-semibold"
		>
			{initials || '?'}
		</div>
	)
}

/** Shared square avatar tile (used by StatStripCard/EditorialBylineCard instead of the circular Avatar). */
function SquareAvatar({ node, size }: { node: PersonalCardTemplateNode; size: number }) {
	const initials = node.name
		.split(' ')
		.map((part) => part[0])
		.filter(Boolean)
		.slice(0, 2)
		.join('')
		.toUpperCase()

	return (
		<div
			className="shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
			style={{
				width: size,
				height: size,
				backgroundImage: node.imageUrl ? `url("${node.imageUrl}")` : gradient(node),
				backgroundSize: 'cover',
				backgroundPosition: 'center',
			}}
		>
			{!node.imageUrl && <span className="text-white font-bold" style={{ fontSize: size * 0.32 }}>{initials || '?'}</span>}
		</div>
	)
}

/** Variant #1 — classicCentered → Spotlight: a soft radial glow behind a ring-bordered avatar, gradient-text name, pill role badge, and glass social chips — a "featured speaker" card. */
function SpotlightCard({ node, isEditing }: { node: PersonalCardTemplateNode; isEditing?: boolean }) {
	return (
		<div
			className="relative flex flex-col items-center text-center gap-3 w-full p-7 max-w-full overflow-hidden rounded-2xl"
			style={{ backgroundColor: '#faf9ff' }}
		>
			<div
				className="absolute rounded-full pointer-events-none"
				style={{ width: 220, height: 220, top: -80, background: `radial-gradient(circle, ${node.accentColor}38, ${node.accentColor}00 70%)` }}
			/>
			<div className="relative flex flex-col items-center gap-3">
				<Avatar node={node} size={92} ring="#ffffff" />
				<Slot
					index={NAME_SLOT}
					fallback={
						<div
							className="text-xl font-bold"
							style={{ background: gradient(node, 90), WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', ...lineClampStyle(node, 'name'), ...textStylesFor(node, 'name') }}
						>
							{node.name}
						</div>
					}
				/>
				<Slot
					index={ROLE_SLOT}
					fallback={
						<span className="text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full" style={{ backgroundColor: `${node.accentColor}1a`, color: node.accentColor, ...lineClampStyle(node, 'role'), ...textStylesFor(node, 'role') }}>
							{node.role}
						</span>
					}
				/>
				<Slot index={BIO_SLOT} fallback={<p className="text-sm max-w-[320px]" style={{ color: '#6b6b76', ...lineClampStyle(node, 'bio'), ...textStylesFor(node, 'bio') }}>{node.bio}</p>} />
				{node.socialLinks.length > 0 && (
					<div className="flex flex-wrap items-center justify-center gap-2 mt-1">
						{node.socialLinks.map((link, index) => (
							<Slot
								key={index}
								index={SOCIAL_SLOT_START + index}
								fallback={
									<a
										href={isEditing ? undefined : (link.href || '#')}
										onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
										className="rounded-full px-3.5 py-1.5 text-xs font-medium no-underline"
										style={{ backgroundColor: '#ffffff', color: node.accentColor, boxShadow: `0 4px 12px -6px ${node.accentColor}59`, ...lineClampStyle(node, 'socialLinks'), ...textStylesFor(node, 'socialLinks') }}
									>
										{link.label}
									</a>
								}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

/** Variant #2 — horizontalRow → Stat Strip: a square gradient avatar tile, name/role/bio packed in a dense row, social links rendered as small trailing icon-circles on the far edge — reads like a compact team-roster row. */
function StatStripCard({ node, isEditing }: { node: PersonalCardTemplateNode; isEditing?: boolean }) {
	return (
		<div
			className="flex flex-wrap items-center gap-4 w-full p-4 max-w-full rounded-xl"
			style={{ backgroundColor: '#ffffff', border: '1px solid #eef0f4', boxShadow: '0 6px 20px -12px rgba(15,23,42,0.18)' }}
		>
			<SquareAvatar node={node} size={64} />
			<div className="flex flex-col gap-0.5 min-w-0" style={{ flex: '1 1 200px' }}>
				<div className="flex flex-wrap items-baseline gap-2">
					<Slot index={NAME_SLOT} fallback={<span className="text-base font-bold" style={{ color: '#18181b', ...lineClampStyle(node, 'name'), ...textStylesFor(node, 'name') }}>{node.name}</span>} />
					<Slot index={ROLE_SLOT} fallback={<span className="text-xs font-semibold uppercase tracking-wide" style={{ color: node.accentColorSecondary, ...lineClampStyle(node, 'role'), ...textStylesFor(node, 'role') }}>{node.role}</span>} />
				</div>
				<Slot index={BIO_SLOT} fallback={<p className="text-sm truncate" style={{ color: '#71717a', ...lineClampStyle(node, 'bio'), ...textStylesFor(node, 'bio') }}>{node.bio}</p>} />
			</div>
			{node.socialLinks.length > 0 && (
				<div className="flex items-center gap-1.5 shrink-0">
					{node.socialLinks.map((link, index) => (
						<Slot
							key={index}
							index={SOCIAL_SLOT_START + index}
							fallback={
								<a
									href={isEditing ? undefined : (link.href || '#')}
									onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
									className="flex items-center justify-center rounded-full text-xs font-bold no-underline"
									style={{ width: 30, height: 30, backgroundColor: `${node.accentColor}14`, color: node.accentColorSecondary }}
								>
									{link.label.charAt(0).toUpperCase()}
								</a>
							}
						/>
					))}
				</div>
			)}
		</div>
	)
}

/** Variant #3 — darkGlass: deep-space gradient background, a glowing ring around the avatar, and a frosted glass bio panel — more dramatic depth than a flat dark card. */
function DarkGlassCard({ node, isEditing }: { node: PersonalCardTemplateNode; isEditing?: boolean }) {
	return (
		<div
			className="relative flex flex-col items-center text-center gap-3 w-full p-7 rounded-2xl max-w-full overflow-hidden"
			style={{ background: `radial-gradient(120% 100% at 50% 0%, ${node.accentColorSecondary}30 0%, #0b0714 60%)` }}
		>
			<div
				className="absolute rounded-full pointer-events-none"
				style={{ width: 200, height: 200, top: -60, background: `radial-gradient(circle, ${node.accentColorSecondary}66, ${node.accentColorSecondary}00 70%)` }}
			/>
			<div className="relative flex flex-col items-center gap-1">
				<div className="rounded-full p-[3px]" style={{ background: gradient(node) }}>
					<div className="rounded-full p-[3px]" style={{ backgroundColor: '#0b0714' }}>
						<Avatar node={node} size={80} />
					</div>
				</div>
			</div>
			<div className="relative flex flex-col items-center gap-1.5">
				<Slot index={NAME_SLOT} fallback={<div className="text-lg font-bold text-white" style={{ ...lineClampStyle(node, 'name'), ...textStylesFor(node, 'name') }}>{node.name}</div>} />
				<Slot index={ROLE_SLOT} fallback={<div className="text-xs font-semibold tracking-widest uppercase" style={{ color: node.accentColorSecondary, ...lineClampStyle(node, 'role'), ...textStylesFor(node, 'role') }}>{node.role}</div>} />
			</div>
			<div
				className="relative rounded-xl px-5 py-4 w-full max-w-[320px]"
				style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
			>
				<Slot index={BIO_SLOT} fallback={<p className="text-sm" style={{ color: '#d4d4d8', ...lineClampStyle(node, 'bio'), ...textStylesFor(node, 'bio') }}>{node.bio}</p>} />
			</div>
			{node.socialLinks.length > 0 && (
				<div className="relative flex flex-wrap items-center justify-center gap-2">
					{node.socialLinks.map((link, index) => (
						<Slot
							key={index}
							index={SOCIAL_SLOT_START + index}
							fallback={
								<a
									href={isEditing ? undefined : (link.href || '#')}
									onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
									className="rounded-full px-3.5 py-1.5 text-xs font-medium no-underline text-white"
									style={{ background: `linear-gradient(135deg, ${node.accentColor}4d, ${node.accentColorSecondary}4d)`, border: '1px solid rgba(255,255,255,0.15)', ...lineClampStyle(node, 'socialLinks'), ...textStylesFor(node, 'socialLinks') }}
								>
									{link.label}
								</a>
							}
						/>
					))}
				</div>
			)}
		</div>
	)
}

/** Variant #4 — minimalFlat → Editorial Byline: a large serif-feeling name with a thin colored rule and a small square thumbnail, no circular avatar chrome — reads like a magazine contributor byline, not a profile card. */
function EditorialBylineCard({ node, isEditing }: { node: PersonalCardTemplateNode; isEditing?: boolean }) {
	return (
		<div className="flex flex-wrap gap-5 w-full p-5 max-w-full items-start">
			<div className="flex flex-col gap-2" style={{ flex: '1 1 260px', minWidth: 220 }}>
				<div className="w-10 h-[3px]" style={{ backgroundColor: '#18181b' }} />
				<Slot index={NAME_SLOT} fallback={<div className="text-2xl font-bold leading-tight" style={{ color: '#18181b', fontFamily: 'Georgia, serif', ...lineClampStyle(node, 'name'), ...textStylesFor(node, 'name') }}>{node.name}</div>} />
				<Slot index={ROLE_SLOT} fallback={<span className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: node.accentColor, ...lineClampStyle(node, 'role'), ...textStylesFor(node, 'role') }}>{node.role}</span>} />
				<Slot index={BIO_SLOT} fallback={<p className="text-sm mt-1" style={{ color: '#52525b', ...lineClampStyle(node, 'bio'), ...textStylesFor(node, 'bio') }}>{node.bio}</p>} />
				{node.socialLinks.length > 0 && (
					<div className="flex flex-wrap gap-4 mt-1">
						{node.socialLinks.map((link, index) => (
							<Slot
								key={index}
								index={SOCIAL_SLOT_START + index}
								fallback={
									<a
										href={isEditing ? undefined : (link.href || '#')}
										onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
										className="text-xs font-semibold no-underline"
										style={{ color: '#18181b', borderBottom: '1px solid #18181b', ...lineClampStyle(node, 'socialLinks'), ...textStylesFor(node, 'socialLinks') }}
									>
										{link.label}
									</a>
								}
							/>
						))}
					</div>
				)}
			</div>
			<SquareAvatar node={node} size={88} />
		</div>
	)
}

/** Variant #5 — imageBackdrop → Poster: a full-height photo card with a bottom gradient scrim carrying name/role/bio in one block, and social links floating as a small icon row over the top-right of the image — a movie-poster-like composition. */
function PosterCard({ node, isEditing }: { node: PersonalCardTemplateNode; isEditing?: boolean }) {
	return (
		<div
			className="relative flex flex-col justify-end w-full max-w-full rounded-2xl overflow-hidden"
			style={{
				minHeight: 280,
				backgroundImage: node.imageUrl ? `url("${node.imageUrl}")` : undefined,
				backgroundColor: node.imageUrl ? undefined : node.accentColorSecondary,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
			}}
		>
			<div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.1) 60%)' }} />
			{node.socialLinks.length > 0 && (
				<div className="relative flex flex-wrap items-center gap-2 self-end px-4 pt-4">
					{node.socialLinks.map((link, index) => (
						<Slot
							key={index}
							index={SOCIAL_SLOT_START + index}
							fallback={
								<a
									href={isEditing ? undefined : (link.href || '#')}
									onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
									className="flex items-center justify-center rounded-full text-xs font-bold no-underline text-white"
									style={{ width: 30, height: 30, backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
								>
									{link.label.charAt(0).toUpperCase()}
								</a>
							}
						/>
					))}
				</div>
			)}
			<div className="relative flex flex-col gap-1.5 px-6 py-6">
				<Slot index={ROLE_SLOT} fallback={<span className="text-xs font-semibold uppercase tracking-widest" style={{ color: node.accentColorSecondary, ...lineClampStyle(node, 'role'), ...textStylesFor(node, 'role') }}>{node.role}</span>} />
				<Slot index={NAME_SLOT} fallback={<div className="text-2xl font-bold text-white leading-tight" style={{ ...lineClampStyle(node, 'name'), ...textStylesFor(node, 'name') }}>{node.name}</div>} />
				<Slot index={BIO_SLOT} fallback={<p className="text-sm max-w-[420px]" style={{ color: 'rgba(255,255,255,0.75)', ...lineClampStyle(node, 'bio'), ...textStylesFor(node, 'bio') }}>{node.bio}</p>} />
			</div>
		</div>
	)
}

/** Variant #6 — bordered → Holo Badge: an ID-badge composition with a holographic gradient stripe and embossed double border, photo stub with stamp-style social links, credentials block beside it — pushed further than a plain black-and-white badge. */
function HoloBadgeCard({ node, isEditing }: { node: PersonalCardTemplateNode; isEditing?: boolean }) {
	return (
		<div
			className="flex flex-wrap w-full max-w-full rounded-xl overflow-hidden"
			style={{ border: '1px solid #e4e4e7', boxShadow: '0 10px 28px -14px rgba(24,24,27,0.3)' }}
		>
			<div
				className="relative flex flex-col items-center gap-2 px-3 py-4"
				style={{ flex: '0 0 108px', background: `linear-gradient(160deg, ${node.accentColor}, ${node.accentColorSecondary})` }}
			>
				<Avatar node={node} size={56} ring="#ffffff" />
				<div className="flex flex-col items-center gap-1 mt-1 w-full">
					{node.socialLinks.slice(0, 4).map((link, index) => (
						<Slot
							key={index}
							index={SOCIAL_SLOT_START + index}
							fallback={
								<a
									href={isEditing ? undefined : (link.href || '#')}
									onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
									className="w-full truncate text-center rounded-sm px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white no-underline"
									style={{ backgroundColor: 'rgba(255,255,255,0.15)', ...lineClampStyle(node, 'socialLinks'), ...textStylesFor(node, 'socialLinks') }}
								>
									{link.label}
								</a>
							}
						/>
					))}
				</div>
			</div>
			<div className="flex flex-col justify-center gap-1.5 p-4 min-w-0" style={{ flex: '1 1 200px', backgroundColor: '#ffffff' }}>
				<span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#a1a1aa' }}>Verified Profile</span>
				<Slot index={NAME_SLOT} fallback={<div className="text-lg font-black leading-tight" style={{ color: '#18181b', ...lineClampStyle(node, 'name'), ...textStylesFor(node, 'name') }}>{node.name}</div>} />
				<Slot
					index={ROLE_SLOT}
					fallback={
						<div
							className="inline-flex self-start px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded"
							style={{ background: `linear-gradient(135deg, ${node.accentColor}22, ${node.accentColorSecondary}22)`, color: node.accentColorSecondary, ...lineClampStyle(node, 'role'), ...textStylesFor(node, 'role') }}
						>
							{node.role}
						</div>
					}
				/>
				<Slot index={BIO_SLOT} fallback={<p className="text-sm mt-1" style={{ color: '#52525b', ...lineClampStyle(node, 'bio'), ...textStylesFor(node, 'bio') }}>{node.bio}</p>} />
			</div>
		</div>
	)
}

/** Variant #7 — socialFocus → Contact Orbit: a centered avatar with social links arranged as small circles around it in a wrapping arc-like cluster rather than a grid of square tiles — a "connect with me" hub. */
function ContactOrbitCard({ node, isEditing }: { node: PersonalCardTemplateNode; isEditing?: boolean }) {
	return (
		<div className="flex flex-col items-center text-center gap-3 w-full p-6 max-w-full">
			<div className="relative flex items-center justify-center" style={{ width: 140, height: 100 }}>
				{node.socialLinks.slice(0, 6).map((link, index) => {
					const angle = (index / Math.max(node.socialLinks.length, 1)) * Math.PI - Math.PI / 2
					const radius = 62
					const x = Math.cos(angle) * radius
					const y = Math.sin(angle) * radius * 0.55
					return (
						<Slot
							key={index}
							index={SOCIAL_SLOT_START + index}
							// The orbit position is variant chrome, so the slot node is
							// placed by a wrapper rather than carrying it in its style.
							wrap={(slot) => (
								<div className="absolute flex items-center justify-center" style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)' }}>
									{slot}
								</div>
							)}
							fallback={
								<a
									href={isEditing ? undefined : (link.href || '#')}
									onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
									className="absolute flex items-center justify-center rounded-full text-xs font-bold no-underline text-white"
									style={{
										width: 32,
										height: 32,
										left: `calc(50% + ${x}px - 16px)`,
										top: `calc(50% + ${y}px - 16px)`,
										background: gradient(node),
										boxShadow: `0 6px 14px -6px ${node.accentColor}99`,
									}}
								>
									{link.label.charAt(0).toUpperCase()}
								</a>
							}
						/>
					)
				})}
				<Avatar node={node} size={68} ring="#ffffff" />
			</div>
			<Slot index={NAME_SLOT} fallback={<div className="text-lg font-bold" style={{ color: '#18181b', ...lineClampStyle(node, 'name'), ...textStylesFor(node, 'name') }}>{node.name}</div>} />
			<Slot index={ROLE_SLOT} fallback={<span className="text-xs font-semibold uppercase tracking-wide" style={{ color: node.accentColor, ...lineClampStyle(node, 'role'), ...textStylesFor(node, 'role') }}>{node.role}</span>} />
			<Slot index={BIO_SLOT} fallback={<p className="text-sm max-w-[300px]" style={{ color: '#71717a', ...lineClampStyle(node, 'bio'), ...textStylesFor(node, 'bio') }}>{node.bio}</p>} />
		</div>
	)
}

/** Variant #8 — compactInline → Business Card Strip: a dark rounded pill bar with avatar, a vertical divider, and name/role/socials packed tight with dot separators — reads like a digital business card, not a plain bordered row. */
function BusinessCardStrip({ node, isEditing }: { node: PersonalCardTemplateNode; isEditing?: boolean }) {
	return (
		<div
			className="flex flex-wrap items-center gap-3 w-full px-4 py-3 max-w-full rounded-full"
			style={{ backgroundColor: '#18181b' }}
		>
			<Avatar node={node} size={36} ring="rgba(255,255,255,0.2)" />
			<div className="w-px h-6 shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
			<Slot index={NAME_SLOT} fallback={<span className="text-sm font-bold text-white shrink-0" style={{ ...lineClampStyle(node, 'name'), ...textStylesFor(node, 'name') }}>{node.name}</span>} />
			<Slot index={ROLE_SLOT} fallback={<span className="text-xs shrink-0" style={{ color: node.accentColorSecondary, ...lineClampStyle(node, 'role'), ...textStylesFor(node, 'role') }}>{node.role}</span>} />
			{node.bio && (
				<Slot
					index={BIO_SLOT}
					fallback={
						<span className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)', flex: '1 1 120px', minWidth: 0, ...lineClampStyle(node, 'bio'), ...textStylesFor(node, 'bio') }}>
							{node.bio}
						</span>
					}
				/>
			)}
			{node.socialLinks.length > 0 && (
				<div className="flex flex-wrap items-center gap-2 ml-auto">
					{node.socialLinks.map((link, index) => (
						<Slot
							key={index}
							index={SOCIAL_SLOT_START + index}
							fallback={
								<a
									href={isEditing ? undefined : (link.href || '#')}
									onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
									className="text-xs font-semibold no-underline"
									style={{ color: node.accentColorSecondary, ...lineClampStyle(node, 'socialLinks'), ...textStylesFor(node, 'socialLinks') }}
								>
									{link.label}
								</a>
							}
						/>
					))}
				</div>
			)}
		</div>
	)
}

/**
 * Variant #9 — attendeeBadge: a literal event ID badge -- a die-cut vertical
 * card with a lanyard hole punched through its top edge, a square photo
 * inset, name/role printed like a real conference badge (role rendered as a
 * solid flat color bar, the way badges print SPEAKER/STAFF/ATTENDEE), a
 * monospace check-in code standing in for a barcode, and social links as
 * small flat stamped tabs along the bottom edge. Flat ink-on-security-paper
 * color, no gradient/glass -- distinct from HoloBadgeCard's gradient
 * sidebar-plus-credentials-panel construction, grounded in the literal
 * object every attendee/speaker/staffer wears at a real event.
 */
function AttendeeBadgeCard({ node, isEditing }: { node: PersonalCardTemplateNode; isEditing?: boolean }) {
	const paper = '#EAF2EE'
	const ink = '#1B1D22'
	const checkInCode = node.name.replace(/\s+/g, '').toUpperCase().slice(0, 8) || 'GUEST'

	return (
		<div className="w-full flex items-center justify-center p-4" style={{ backgroundColor: '#DDE7E3' }}>
			<div
				className="relative w-full flex flex-col items-center overflow-hidden"
				style={{ maxWidth: 260, borderRadius: 18, backgroundColor: paper, border: `1px solid ${ink}1a`, boxShadow: '0 14px 32px -18px rgba(20,30,25,0.4)' }}
			>
				<div
					aria-hidden="true"
					className="absolute left-1/2 -translate-x-1/2 rounded-full"
					style={{ top: 10, width: 14, height: 14, backgroundColor: '#DDE7E3', boxShadow: `inset 0 0 0 1px ${ink}33` }}
				/>
				<div className="flex flex-col items-center gap-2 px-6 pt-8 pb-4 w-full">
					<SquareAvatar node={node} size={64} />
					<Slot index={NAME_SLOT} fallback={<div className="text-lg font-bold leading-tight text-center" style={{ color: ink, ...lineClampStyle(node, 'name'), ...textStylesFor(node, 'name') }}>{node.name}</div>} />
					<Slot
						index={ROLE_SLOT}
						fallback={
							<span
								className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded"
								style={{ backgroundColor: node.accentColor, color: '#fff', ...lineClampStyle(node, 'role'), ...textStylesFor(node, 'role') }}
							>
								{node.role}
							</span>
						}
					/>
					<Slot index={BIO_SLOT} fallback={<p className="text-xs text-center mt-1" style={{ color: '#52525b', ...lineClampStyle(node, 'bio'), ...textStylesFor(node, 'bio') }}>{node.bio}</p>} />
				</div>
				<div aria-hidden="true" className="w-full flex items-center justify-between px-4" style={{ height: 1 }}>
					{Array.from({ length: 12 }).map((_, i) => (
						<span key={i} className="rounded-full shrink-0" style={{ width: 3, height: 3, backgroundColor: '#DDE7E3', border: `1px solid ${ink}22` }} />
					))}
				</div>
				<div className="w-full flex items-center justify-between gap-2 px-5 py-3">
					<span className="font-mono text-[10px] font-bold" style={{ color: ink }}>{checkInCode}</span>
					<span aria-hidden="true" className="shrink-0" style={{ width: 22, height: 22, backgroundImage: `repeating-linear-gradient(90deg, ${ink} 0 2px, transparent 2px 4px)` }} />
				</div>
				{node.socialLinks.length > 0 && (
					<div className="w-full flex flex-wrap items-center justify-center gap-1.5 px-4 pb-4">
						{node.socialLinks.slice(0, 4).map((link, index) => (
							<Slot
								key={index}
								index={SOCIAL_SLOT_START + index}
								fallback={
									<a
										href={isEditing ? undefined : (link.href || '#')}
										onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
										className="text-[10px] font-semibold uppercase tracking-wide no-underline px-2 py-1 rounded"
										style={{ color: ink, border: `1px solid ${ink}33`, ...lineClampStyle(node, 'socialLinks'), ...textStylesFor(node, 'socialLinks') }}
									>
										{link.label}
									</a>
								}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
