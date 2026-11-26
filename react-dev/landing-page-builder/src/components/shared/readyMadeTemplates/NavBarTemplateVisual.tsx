import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { NavBarTemplateNode, NavLink } from '@/types/node.type'
import { lineClampStyle } from '@/components/PropertyPanelUI/Sections/relatedComponents/LineClampControl'
import { textStylesFor } from '@/components/PropertyPanelUI/Sections/relatedComponents/TypographyControl'
import editorConfig from '@/configs/editor.config'
import { isEditorPage } from '@/utils/checkPage'
import { navBarSlotIndexes } from '@/utils/navBarSlots'

// Hamburger breakpoint: under this *rendered* width the desktop links list
// (class="navbar-desktop-links") hides and the hamburger toggle
// (class="navbar-mobile-toggle") shows -- see useNavCompact() below.
const NAVBAR_MOBILE_BREAKPOINT = 768

/**
 * Measures the navbar's own rendered width (not the browser viewport) and
 * reports whether it's below NAVBAR_MOBILE_BREAKPOINT.
 *
 * A plain `@media (max-width: 768px)` query -- what this used to be --
 * checks the real browser viewport, which is wrong here: this app's own
 * editor simulates Tablet/Mobile by shrinking the *canvas container*
 * (Canvas.tsx sets it to 41.5em / 21.5em) inside a still-full-width desktop
 * browser window. That left every variant stuck in its desktop layout
 * while editing on Tablet/Mobile, where flex-wrap then crushed brand/links/
 * CTA into an overlapping, unreadable mess instead of collapsing to the
 * hamburger -- the concrete bug behind "not responsive". Measuring the
 * element itself with ResizeObserver fixes both that editor simulation and
 * real narrow browsers (where element width and viewport width match
 * anyway), with one source of truth instead of two that can disagree.
 */
function useNavCompact() {
	const ref = useRef<HTMLDivElement | null>(null)
	const [isCompact, setIsCompact] = useState(false)

	useEffect(() => {
		const el = ref.current
		if (!el) return
		const measure = () => setIsCompact(el.getBoundingClientRect().width < NAVBAR_MOBILE_BREAKPOINT)
		measure()
		const observer = new ResizeObserver(measure)
		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	return { ref, isCompact }
}

/**
 * Hamburger button + slide-down panel, reused by every uiType variant so
 * tablet/mobile visitors always have a way to reach every link even once the
 * variant's own desktop links list is hidden by the breakpoint below.
 */
function NavMobileMenu({
	links,
	ctaLabel,
	ctaVisible,
	ctaHref,
	bg,
	fg,
	accent,
	linksClamp,
	ctaClamp,
	isEditing,
}: {
	links: NavLink[]
	ctaLabel?: string
	ctaVisible: boolean
	ctaHref: string
	bg: string
	fg: string
	accent: string
	linksClamp: React.CSSProperties
	ctaClamp: React.CSSProperties
	isEditing?: boolean
}) {
	const [open, setOpen] = useState(false)
	const [focused, setFocused] = useState(false)

	// Close on Escape, same as any dropdown/dialog a real user would expect.
	useEffect(() => {
		if (!open) return
		const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [open])

	return (
		// display toggled by the ancestor [data-nav-compact]'s <style> (see
		// NavBarTemplateVisual's wrapper below), not by a viewport media query.
		<div className="navbar-mobile-toggle" style={{ display: 'none', alignItems: 'center' }}>
			<button
				type="button"
				aria-label={open ? 'Close menu' : 'Open menu'}
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					gap: 4,
					width: 44,
					height: 44,
					padding: 0,
					borderRadius: 8,
					background: open || focused ? `${fg}14` : 'transparent',
					border: 'none',
					outline: focused ? `2px solid ${accent}` : 'none',
					outlineOffset: 2,
					cursor: 'pointer',
					flexShrink: 0,
					transition: 'background-color 0.15s ease',
				}}
			>
				<span style={{ width: 20, height: 2, backgroundColor: fg, borderRadius: 1, transition: 'transform 0.2s ease', transform: open ? 'translateY(6px) rotate(45deg)' : 'none' }} />
				<span style={{ width: 20, height: 2, backgroundColor: fg, borderRadius: 1, transition: 'opacity 0.2s ease', opacity: open ? 0 : 1 }} />
				<span style={{ width: 20, height: 2, backgroundColor: fg, borderRadius: 1, transition: 'transform 0.2s ease', transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
			</button>
			{/* Backdrop: dims the page and closes the menu on outside click, same
			    as any real dropdown -- previously nothing did this, so the panel
			    just floated over live content with no way to dismiss it but the
			    hamburger itself. */}
			<div
				aria-hidden="true"
				onClick={() => setOpen(false)}
				style={{
					position: 'fixed',
					inset: 0,
					zIndex: 39,
					backgroundColor: 'rgba(15,15,20,0.45)',
					opacity: open ? 1 : 0,
					pointerEvents: open ? 'auto' : 'none',
					transition: 'opacity 0.18s ease',
				}}
			/>
			{/* Always mounted (not conditionally rendered) so open/close animates
			    via opacity/transform instead of popping in-and-out instantly.
			    Positioned against the nearest `position: relative` ancestor --
			    the outer <nav> itself, not this toggle -- so it spans the full
			    nav width no matter where the hamburger sits in that variant's
			    layout (previously it anchored to this 48px-wide toggle and used
			    a width:100dvw/right:100%-or-0 hack to fake full width, which
			    only lined up when the toggle happened to sit at the row's right
			    edge -- everywhere else the panel rendered mis-aligned/off-screen). */}
			<div
				role="list"
				aria-hidden={!open}
				style={{
					position: 'absolute',
					insetInlineStart: 0,
					insetInlineEnd: 0,
					top: '100%',
					zIndex: 40,
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
					padding: 12,
					backgroundColor: bg,
					color: fg,
					boxShadow: '0 20px 40px -16px rgba(0,0,0,0.35)',
					borderTop: `1px solid ${fg}1f`,
					maxHeight: 'calc(100dvh - 96px)',
					overflowY: 'auto',
					opacity: open ? 1 : 0,
					transform: open ? 'translateY(0)' : 'translateY(-6px)',
					visibility: open ? 'visible' : 'hidden',
					pointerEvents: open ? 'auto' : 'none',
					transition: 'opacity 0.18s ease, transform 0.18s ease, visibility 0.18s',
				}}
			>
				{links.map((link, i) => (
					<a
						key={i}
						href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } setOpen(false) }}
						style={{ color: fg, ...linksClamp }}
						className="text-sm font-medium no-underline px-2 py-2.5 rounded-md hover:opacity-70"
					>
						{link.label}
					</a>
				))}
				{ctaVisible && ctaLabel && (
					<a
						href={isEditing ? undefined : ctaHref} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } setOpen(false) }}
						style={{ backgroundColor: accent, color: '#fff', ...ctaClamp }}
						className="text-sm font-semibold no-underline px-3 py-2.5 rounded-md text-center mt-1"
					>
						{ctaLabel}
					</a>
				)}
			</div>
		</div>
	)
}

/** Rendered children: [brand?, cta?, link0, ...] — see navBarSlotIndexes. */
interface NavSlots { nodes: React.ReactNode[]; idx: { brand: number; cta: number; links: number } }

const NavBarSlotsContext = createContext<NavSlots>({ nodes: [], idx: { brand: -1, cta: -1, links: 0 } })

function useNavSlot(index: number): React.ReactNode | undefined {
	return useContext(NavBarSlotsContext).nodes[index] ?? undefined
}

/** The CTA node, or the variant's own hardcoded CTA markup. */
function CtaSlot({ fallback }: { fallback: React.ReactNode }) {
	const slot = useNavSlot(useContext(NavBarSlotsContext).idx.cta)
	return <>{slot ?? fallback}</>
}

/** One link's node, or the variant's own <a>. */
function LinkSlot({ index, fallback }: { index: number; fallback: React.ReactNode }) {
	const slot = useNavSlot(useContext(NavBarSlotsContext).idx.links + index)
	return <>{slot ?? fallback}</>
}

/**
 * Renders the brand as either its text (default) or node.logoImageUrl,
 * depending on node.brandDisplayMode. Falls back to text when image mode is
 * selected but no logoImageUrl has been uploaded yet, so the nav never goes
 * empty. `className`/`style` are the same ones each variant already passes
 * to its brand <span>, applied to the <img> too (minus text-specific
 * properties like tracking/uppercase, which have no effect on an image).
 */
function BrandMark({
	node,
	brand,
	className,
	style,
}: {
	node: NavBarTemplateNode
	brand: string
	className: string
	style: React.CSSProperties
}) {
	const brandSlot = useNavSlot(useContext(NavBarSlotsContext).idx.brand)
	if (brandSlot) return <>{brandSlot}</>
	if (editorConfig.enable_navbar_logo_image && node.brandDisplayMode === 'image' && node.logoImageUrl) {
		return (
			<img
				src={node.logoImageUrl}
				alt={brand}
				style={{
					width: node.logoWidth ?? 32,
					height: node.logoHeight ?? 32,
					borderRadius: node.logoBorderRadius ?? 0,
					objectFit: 'cover',
					flexShrink: 0,
				}}
			/>
		)
	}
	return <span className={className} style={style}>{brand}</span>
}

/**
 * Pure "visual" component for the navBarTemplate content type -- data-in,
 * JSX-out, no drag/drop/popover/canvas wiring (mirrors the Faq/FaqList split
 * in EditorUI/Nodes.tsx). The shell component that adds useDraggable/
 * useDroppable/Popover/ActionMenu/DragOverlay around this lives elsewhere.
 *
 * Colors come from the node's own style fields (style.backgroundColor /
 * style.color) since NavBarTemplateNode has no dedicated color fields in its
 * schema -- only brand/links/ctaLabel/ctaHref/uiType. Every variant below
 * reads its content from those real fields; no lorem/placeholder text is
 * hardcoded here (defaults live in defaultNodeStyle.ts).
 *
 * Responsiveness: every variant's outer <nav> gets `position: relative` (so
 * the mobile dropdown, `position: absolute`/`top: 100%`, anchors correctly
 * beneath it), the variant's own links list (a `role="list"` <div>, not a
 * <ul> -- see below) gets `navbar-desktop-links` appended to its className
 * so it hides under NAVBAR_MOBILE_BREAKPOINT, and a <NavMobileMenu> is
 * rendered as the row's last child. The whole thing is wrapped in a
 * `[data-nav-compact]` div (see useNavCompact()) whose own rendered width --
 * not the browser viewport -- decides whether those classes actually hide/
 * show, which is what makes the collapse work inside this app's own editor
 * preview and not just on a real phone.
 *
 * Links markup: rendered as <div role="list">/<div role="listitem"> instead
 * of <ul>/<li>, since the app's global rich-text styling
 * (ul > li { list-style-type: disc !important; } in src/index.css) applies
 * to every bare <ul> with no scoping class and can't be cleanly overridden
 * from a Tailwind utility. role="list"/role="listitem" keep the same
 * semantics for assistive tech without triggering that global list styling.
 *
 * Line-clamp: node.lineClamp keys "brand" / "links" (applies uniformly to
 * every link label) / "ctaLabel" are read once into brandClamp/linksClamp/
 * ctaClamp and spread onto each field's rendered element in every variant.
 */
export function NavBarTemplateVisual({ node, isEditing = isEditorPage, slots }: { node: NavBarTemplateNode; isEditing?: boolean; slots?: React.ReactNode }) {
	return (
		<NavBarSlotsContext.Provider value={{ nodes: React.Children.toArray(slots), idx: navBarSlotIndexes(node) }}>
			<NavBarTemplateLayout node={node} isEditing={isEditing} />
		</NavBarSlotsContext.Provider>
	)
}

function NavBarTemplateLayout({ node, isEditing }: { node: NavBarTemplateNode; isEditing?: boolean }) {
	const links: NavLink[] = node.links ?? []
	const brand = node.brand || 'Brand'
	const ctaLabel = node.ctaLabel
	const ctaHref = node.ctaHref || '#'
	// Unset (undefined) defaults to visible so existing pages built before this
	// flag existed keep showing their CTA exactly as before. The extra
	// !!node.ctaHref check hides the CTA when a {{event_...}} placeholder
	// resolved to nothing (e.g. registration closed) — same as
	// EventWidgetsGroupTemplateVisual's registerHref-gated register button
	// and ButtonEnterpriseVisual's own render-nothing-without-a-href
	// behavior. Harmless in the editor: useResolvedEventHref only resolves
	// on the real published page, so node.ctaHref there is always either a
	// real custom href or the still-unresolved (truthy) placeholder token.
	const ctaVisible = (!editorConfig.enable_navbar_cta_toggle || node.showCta !== false) && !!node.ctaHref

	const bg = (node.style?.backgroundColor as string) || '#ffffff'
	const fg = (node.style?.color as string) || '#111827'
	// Simple accent derived from fg/bg pairing -- used for underlines/pills/CTA
	// backgrounds so every variant still respects the node's own colors
	// instead of inventing unrelated hardcoded palette colors.
	const accent = fg === '#111827' ? '#2563eb' : fg

	const reduceMotionStyle: React.CSSProperties = { transition: 'color 0.15s ease, background-color 0.15s ease, transform 0.15s ease' }

	const brandClamp = { ...lineClampStyle(node, 'brand'), ...textStylesFor(node, 'brand') }
	const linksClamp = { ...lineClampStyle(node, 'links'), ...textStylesFor(node, 'links') }
	const ctaClamp = { ...lineClampStyle(node, 'ctaLabel'), ...textStylesFor(node, 'ctaLabel') }

	const mobileMenu = (menuBg: string, menuFg: string) => (
		<NavMobileMenu links={links} ctaLabel={ctaLabel} ctaVisible={ctaVisible} ctaHref={ctaHref} bg={menuBg} fg={menuFg} accent={accent} linksClamp={linksClamp} ctaClamp={ctaClamp} isEditing={isEditing} />
	)

	// See useNavCompact()'s comment: this measures the navbar's own rendered
	// width instead of trusting a viewport media query, so the hamburger
	// actually engages inside the editor's own Tablet/Mobile preview (a
	// narrowed container in an otherwise full-width browser window), not
	// just on a real narrow device.
	const { ref: navRef, isCompact } = useNavCompact()

	function renderVariant() {
		switch (node.uiType) {
		case 'classicRow':
			return (
				<nav
					className="w-full flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b"
					style={{ backgroundColor: bg, color: fg, borderColor: `${fg}1f`, borderTop: `3px solid ${accent}`, position: 'relative' }}
				>
					<BrandMark node={node} brand={brand} className="font-bold text-lg tracking-tight" style={{ color: fg, ...brandClamp }} />
					<div role="list" className={`navbar-desktop-links flex items-center gap-6 flex-1 flex-wrap ${ctaVisible && ctaLabel ? 'justify-center' : 'justify-end'}`}>
						{links.map((link, i) => (
							<div role="listitem" key={i}>
								<LinkSlot key={i} index={i} fallback={
									<a href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ ...reduceMotionStyle, color: fg, ...linksClamp }} className="text-sm font-medium hover:opacity-70 no-underline">
										{link.label}
									</a>
								} />
							</div>
						))}
					</div>
					<CtaSlot fallback={ctaVisible && ctaLabel && (
						<a
							href={isEditing ? undefined : ctaHref} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							style={{ ...reduceMotionStyle, backgroundColor: accent, color: '#fff', ...ctaClamp }}
							className="navbar-desktop-links text-sm font-semibold px-4 py-2 rounded-md no-underline hover:opacity-90 shrink-0"
						>
							{ctaLabel}
						</a>
					)} />
					{mobileMenu(bg, fg)}
				</nav>
			)

		case 'centeredLogo': {
			const half = Math.ceil(links.length / 2)
			const leftLinks = links.slice(0, half)
			const rightLinks = links.slice(half)
			return (
				<nav className="w-full flex flex-col items-center gap-2 px-6 py-5" style={{ backgroundColor: bg, color: fg, borderBottom: `3px double ${accent}66`, position: 'relative' }}>
					<div className="w-full flex flex-wrap items-center justify-center gap-8">
						<div role="list" className="navbar-desktop-links flex items-center gap-6 flex-1 flex-wrap justify-end" style={{ minWidth: 120 }}>
							{leftLinks.map((link, i) => (
								<div role="listitem" key={i}>
									<LinkSlot key={i} index={i} fallback={
										<a href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ ...reduceMotionStyle, color: fg, ...linksClamp }} className="text-sm font-medium hover:opacity-70 no-underline">
											{link.label}
										</a>
									} />
								</div>
							))}
						</div>
						<BrandMark node={node} brand={brand} className="font-extrabold text-xl tracking-wide shrink-0" style={{ color: fg, ...brandClamp }} />
						<div role="list" className="navbar-desktop-links flex items-center gap-6 flex-1 flex-wrap justify-start" style={{ minWidth: 120 }}>
							{rightLinks.map((link, i) => (
								<div role="listitem" key={i}>
									<LinkSlot key={i} index={half + i} fallback={
										<a href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ ...reduceMotionStyle, color: fg, ...linksClamp }} className="text-sm font-medium hover:opacity-70 no-underline">
											{link.label}
										</a>
									} />
								</div>
							))}
						</div>
					</div>
					<CtaSlot fallback={ctaVisible && ctaLabel && (
						<a
							href={isEditing ? undefined : ctaHref} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							style={{ ...reduceMotionStyle, borderColor: accent, color: accent, ...ctaClamp }}
							className="navbar-desktop-links text-xs font-semibold px-3 py-1 rounded-full border no-underline hover:opacity-80"
						>
							{ctaLabel}
						</a>
					)} />
					{mobileMenu(bg, fg)}
				</nav>
			)
		}

		// Bubble cluster: brand sits above a centered, wrapping cloud of
		// differently-weighted pill badges (odd-index links rendered as
		// outlined "ghost" bubbles, even-index as filled bubbles) with the
		// CTA as one oversized bubble anchored inside the same cloud -- a
		// free-flowing wrap block instead of a 3-zone left/center/right row.
		case 'pillLinks':
			return (
				<nav className="w-full flex flex-col items-center gap-3 px-6 py-6 text-center" style={{ backgroundColor: bg, color: fg, position: 'relative' }}>
					<BrandMark node={node} brand={brand} className="font-bold text-base tracking-tight" style={{ color: fg, ...brandClamp }} />
					<div className="navbar-desktop-links w-full flex flex-wrap items-center justify-center gap-2.5">
						{links.map((link, i) => {
							const filled = i % 2 === 0
							return (
								<LinkSlot key={i} index={i} fallback={
									<a
										key={i}
										href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
										style={{
											...reduceMotionStyle,
											backgroundColor: filled ? `${accent}1a` : 'transparent',
											borderColor: `${accent}55`,
											color: fg,
											...linksClamp,
										}}
										className="text-sm font-medium no-underline px-4 py-2 rounded-full border hover:opacity-70 inline-block"
									>
										{link.label}
									</a>
								} />
							)
						})}
						<CtaSlot fallback={ctaVisible && ctaLabel && (
							<a
								href={isEditing ? undefined : ctaHref} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
								style={{ ...reduceMotionStyle, backgroundColor: accent, color: '#fff', ...ctaClamp }}
								className="text-sm font-semibold px-6 py-2.5 rounded-full no-underline hover:opacity-90 shrink-0 shadow-sm"
							>
								{ctaLabel}
							</a>
						)} />
					</div>
					{mobileMenu(bg, fg)}
				</nav>
			)

		// Floating capsule island: the entire bar (brand + links + CTA) lives
		// inside one centered, rounded, semi-transparent capsule with dot
		// separators between items -- a single floating pill island on an
		// open canvas, not a full-width bordered strip split into zones.
		case 'transparent':
			return (
				<nav className="w-full flex items-center justify-center px-6 py-6" style={{ backgroundColor: `${bg}00`, color: fg, position: 'relative' }}>
					<div
						className="navbar-desktop-links flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-6 py-3 rounded-full border backdrop-blur-sm max-w-full"
						style={{ backgroundColor: `${bg}b3`, borderColor: `${fg}22` }}
					>
						<BrandMark node={node} brand={brand} className="font-semibold text-sm uppercase tracking-[0.15em] shrink-0" style={{ color: fg, ...brandClamp }} />
						{links.length > 0 && <span aria-hidden="true" style={{ color: `${fg}55` }}>•</span>}
						{links.map((link, i) => (
							<span key={i} className="flex items-center gap-x-5">
								<LinkSlot key={i} index={i} fallback={
									<a href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ ...reduceMotionStyle, color: fg, ...linksClamp }} className="text-xs font-medium uppercase tracking-[0.1em] hover:opacity-60 no-underline">
										{link.label}
									</a>
								} />
								{i < links.length - 1 && <span aria-hidden="true" style={{ color: `${fg}55` }}>•</span>}
							</span>
						))}
						<CtaSlot fallback={ctaVisible && ctaLabel && (
							<>
								<span aria-hidden="true" style={{ color: `${fg}55` }}>•</span>
								<a
									href={isEditing ? undefined : ctaHref} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
									style={{ ...reduceMotionStyle, backgroundColor: accent, color: '#fff', ...ctaClamp }}
									className="text-xs font-semibold uppercase tracking-[0.1em] px-3 py-1 rounded-full no-underline hover:opacity-90 shrink-0"
								>
									{ctaLabel}
								</a>
							</>
						)} />
					</div>
					<div className="navbar-mobile-toggle-anchor" style={{ position: 'absolute', insetInlineEnd: 24, top: '50%', transform: 'translateY(-50%)' }}>
						{mobileMenu(bg, fg)}
					</div>
				</nav>
			)

		// Tile grid nav: a slim brand header strip on top, then links and the
		// CTA laid out together as an even CSS-grid of bordered tiles below
		// it -- a two-tier block composition instead of one inline row.
		case 'darkBar': {
			const darkBg = bg === '#ffffff' ? '#0f172a' : bg
			const darkFg = fg === '#111827' ? '#f8fafc' : fg
			return (
				<nav className="w-full flex flex-col" style={{ backgroundColor: darkBg, color: darkFg, position: 'relative' }}>
					<div aria-hidden="true" style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}00)` }} />
					<div className="w-full flex items-center justify-between px-6 pt-4 pb-3">
						<BrandMark node={node} brand={brand} className="font-bold text-lg tracking-tight" style={{ color: darkFg, ...brandClamp }} />
						{mobileMenu(darkBg, darkFg)}
					</div>
					<div
						className="navbar-desktop-links w-full grid gap-px px-6 pb-6"
						style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', backgroundColor: `${darkFg}14` }}
					>
						{links.map((link, i) => (
							<LinkSlot key={i} index={i} fallback={
								<a
									key={i}
									href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
									style={{ ...reduceMotionStyle, backgroundColor: darkBg, color: `${darkFg}cc`, ...linksClamp }}
									className="text-sm font-medium text-center px-3 py-3 no-underline hover:opacity-80"
								>
									{link.label}
								</a>
							} />
						))}
						<CtaSlot fallback={ctaVisible && ctaLabel && (
							<a
								href={isEditing ? undefined : ctaHref} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
								style={{ ...reduceMotionStyle, backgroundColor: accent, color: '#fff', ...ctaClamp }}
								className="text-sm font-semibold text-center px-3 py-3 no-underline hover:opacity-90"
							>
								{ctaLabel}
							</a>
						)} />
					</div>
				</nav>
			)
		}

		// Vertical side rail: brand heads a narrow left-hand column with the
		// links stacked underneath it (each carrying a left active bar) and
		// the CTA pinned to the bottom of that same column -- a sidebar-style
		// block, not a horizontal bar at all.
		case 'underlineActive':
			return (
				<nav className="w-full flex flex-wrap items-start gap-6 px-6 py-6" style={{ backgroundColor: bg, color: fg, position: 'relative' }}>
					<div className="flex flex-col gap-3" style={{ minWidth: 160 }}>
						<div className="flex items-center justify-between gap-4">
							<BrandMark node={node} brand={brand} className="font-bold text-lg" style={{ color: fg, ...brandClamp }} />
							{mobileMenu(bg, fg)}
						</div>
						<CtaSlot fallback={ctaVisible && ctaLabel && (
							<a
								href={isEditing ? undefined : ctaHref} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
								style={{ ...reduceMotionStyle, backgroundColor: accent, color: '#fff', ...ctaClamp }}
								className="navbar-desktop-links text-sm font-semibold px-4 py-2 rounded-md no-underline hover:opacity-90 self-start"
							>
								{ctaLabel}
							</a>
						)} />
					</div>
					<div role="list" className="navbar-desktop-links flex flex-col gap-0 flex-1" style={{ minWidth: 160 }}>
						{links.map((link, i) => (
							<div role="listitem" key={i} className="flex items-center" style={{ borderLeft: `3px solid ${i === 0 ? accent : `${fg}1f`}` }}>
								<LinkSlot key={i} index={i} fallback={
									<a
										href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
										style={{ ...reduceMotionStyle, color: i === 0 ? accent : fg, ...linksClamp }}
										className="text-sm font-medium no-underline px-3 py-2 inline-block hover:opacity-80 w-full"
									>
										{link.label}
									</a>
								} />
							</div>
						))}
					</div>
				</nav>
			)

		case 'splitCta':
			return (
				<nav className="w-full flex flex-wrap items-stretch" style={{ backgroundColor: bg, color: fg, position: 'relative' }}>
					<div className="flex items-center gap-6 px-6 py-4 flex-1 flex-wrap" style={{ minWidth: 200 }}>
						<BrandMark node={node} brand={brand} className="font-bold text-lg" style={{ color: fg, ...brandClamp }} />
						<div role="list" className="navbar-desktop-links flex items-center gap-5 flex-wrap">
							{links.map((link, i) => (
								<div role="listitem" key={i}>
									<LinkSlot key={i} index={i} fallback={
										<a href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ ...reduceMotionStyle, color: fg, ...linksClamp }} className="text-sm font-medium hover:opacity-70 no-underline">
											{link.label}
										</a>
									} />
								</div>
							))}
						</div>
						{mobileMenu(bg, fg)}
					</div>
					<CtaSlot fallback={ctaVisible && ctaLabel && (
						<div
							style={{ backgroundColor: accent, borderColor: `${fg}1f` }}
							className="flex items-center justify-center px-8 border-l shrink-0"
						>
							<a href={isEditing ? undefined : ctaHref} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ ...reduceMotionStyle, color: '#fff', ...ctaClamp }} className="text-sm font-semibold no-underline hover:opacity-90">
								{ctaLabel}
							</a>
						</div>
					)} />
				</nav>
			)

		// Floating card: the whole bar is a rounded, shadowed card inset from
		// the page edges (padding around it reveals the page background),
		// brand left / links centered / CTA pill right -- the common modern
		// "raised bar floating over the hero" composition, distinct from
		// transparent's single blurred pill-with-dot-separators island.
		case 'floatingCard':
			return (
				<div className="w-full px-5 py-5" style={{ backgroundColor: 'transparent' }}>
					<nav
						className="w-full flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 rounded-2xl"
						style={{ backgroundColor: bg, color: fg, boxShadow: `0 14px 34px -14px ${fg}44`, border: `1px solid ${fg}12`, borderTop: `3px solid ${accent}`, position: 'relative' }}
					>
						<BrandMark node={node} brand={brand} className="font-bold text-lg tracking-tight shrink-0" style={{ color: fg, ...brandClamp }} />
						<div role="list" className="navbar-desktop-links flex items-center gap-6 flex-1 flex-wrap justify-center">
							{links.map((link, i) => (
								<div role="listitem" key={i}>
									<LinkSlot key={i} index={i} fallback={
										<a href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ ...reduceMotionStyle, color: fg, ...linksClamp }} className="text-sm font-medium hover:opacity-70 no-underline">
											{link.label}
										</a>
									} />
								</div>
							))}
						</div>
						<CtaSlot fallback={ctaVisible && ctaLabel && (
							<a
								href={isEditing ? undefined : ctaHref} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
								style={{ ...reduceMotionStyle, backgroundColor: accent, color: '#fff', ...ctaClamp }}
								className="navbar-desktop-links text-sm font-semibold px-5 py-2 rounded-full no-underline hover:opacity-90 shrink-0"
							>
								{ctaLabel}
							</a>
						)} />
						{mobileMenu(bg, fg)}
					</nav>
				</div>
			)

		case 'stacked':
			return (
				<nav className="w-full flex flex-col" style={{ backgroundColor: bg, color: fg, position: 'relative' }}>
					<div className="w-full flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: `${fg}1f` }}>
						<BrandMark node={node} brand={brand} className="font-bold text-lg" style={{ color: fg, ...brandClamp }} />
						<div className="flex items-center gap-3">
							<CtaSlot fallback={ctaVisible && ctaLabel && (
								<a
									href={isEditing ? undefined : ctaHref} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
									style={{ ...reduceMotionStyle, backgroundColor: accent, color: '#fff', ...ctaClamp }}
									className="text-xs font-semibold px-3 py-1.5 rounded-md no-underline hover:opacity-90"
								>
									{ctaLabel}
								</a>
							)} />
							{mobileMenu(bg, fg)}
						</div>
					</div>
					<div role="list" className="navbar-desktop-links w-full flex items-center gap-6 px-6 py-2.5 flex-wrap justify-center" style={{ borderBottom: `2px solid ${accent}55` }}>
						{links.map((link, i) => (
							<div role="listitem" key={i}>
								<LinkSlot key={i} index={i} fallback={
									<a href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ ...reduceMotionStyle, color: fg, ...linksClamp }} className="text-sm font-medium hover:opacity-70 no-underline">
										{link.label}
									</a>
								} />
							</div>
						))}
					</div>
				</nav>
			)

		// Dark bordered row: dark background, links rendered as individually
		// thin-bordered chips (not a plain inline list), a small rotated
		// diamond accent glyph beside the brand, CTA as an outlined pill --
		// the "agency" look, distinct from darkBar's tile-grid block.
		case 'darkBorderedRow': {
			const darkBg = bg === '#ffffff' ? '#1c1c24' : bg
			const darkFg = fg === '#111827' ? '#f4f4f6' : fg
			return (
				<nav className="w-full flex flex-wrap items-center justify-between gap-4 px-6 py-4" style={{ backgroundColor: darkBg, color: darkFg, position: 'relative' }}>
					<div className="flex items-center gap-2 shrink-0">
						<span className="inline-block" style={{ width: 8, height: 8, backgroundColor: accent, transform: 'rotate(45deg)' }} />
						<BrandMark node={node} brand={brand} className="font-bold text-lg" style={{ color: darkFg, ...brandClamp }} />
					</div>
					<div role="list" className="navbar-desktop-links flex items-center gap-3 flex-1 flex-wrap justify-center">
						{links.map((link, i) => (
							<div role="listitem" key={i}>
								<LinkSlot key={i} index={i} fallback={
									<a
										href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
										style={{ ...reduceMotionStyle, color: darkFg, borderColor: `${darkFg}22`, ...linksClamp }}
										className="text-sm font-medium no-underline px-3 py-1.5 rounded-md border hover:opacity-80 inline-block"
									>
										{link.label}
									</a>
								} />
							</div>
						))}
					</div>
					<CtaSlot fallback={ctaVisible && ctaLabel && (
						<a
							href={isEditing ? undefined : ctaHref} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							style={{ ...reduceMotionStyle, borderColor: darkFg, color: darkFg, ...ctaClamp }}
							className="navbar-desktop-links text-sm font-semibold px-5 py-2 rounded-full border no-underline hover:opacity-80 shrink-0"
						>
							{ctaLabel}
						</a>
					)} />
					{mobileMenu(darkBg, darkFg)}
				</nav>
			)
		}

		// Pill island (light): a solid white rounded-pill nav island meant to
		// float on a dark page background, links separated by bullet dots
		// inline (no borders/backgrounds on the links themselves), single
		// filled CTA button anchored at the end -- distinct from
		// floatingCard's bordered/shadowed rectangular card and from
		// transparent's translucent/blurred capsule.
		case 'pillIslandLight':
			return (
				<div className="w-full px-5 py-6 flex justify-center" style={{ backgroundColor: 'transparent' }}>
					<div
						className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 rounded-full max-w-full"
						style={{ backgroundColor: '#ffffff', boxShadow: '0 8px 24px -10px rgba(0,0,0,0.35)', position: 'relative' }}
					>
						<BrandMark node={node} brand={brand} className="font-bold text-sm px-2 shrink-0" style={{ color: '#111827', ...brandClamp }} />
						<span className="navbar-desktop-links contents">
							{links.map((link, i) => (
								<span key={i} className="flex items-center gap-x-4">
									<LinkSlot key={i} index={i} fallback={
										<a href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ ...reduceMotionStyle, color: '#374151', ...linksClamp }} className="text-sm font-medium no-underline hover:opacity-70">
											{link.label}
										</a>
									} />
									{i < links.length - 1 && <span aria-hidden="true" style={{ color: '#d1d5db' }}>&bull;</span>}
								</span>
							))}
						</span>
						<CtaSlot fallback={ctaVisible && ctaLabel && (
							<a
								href={isEditing ? undefined : ctaHref} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
								style={{ ...reduceMotionStyle, backgroundColor: '#111827', color: '#fff', ...ctaClamp }}
								className="navbar-desktop-links text-sm font-semibold px-4 py-1.5 rounded-full no-underline hover:opacity-90 shrink-0"
							>
								{ctaLabel}
							</a>
						)} />
						{mobileMenu('#ffffff', '#111827')}
					</div>
				</div>
			)

		// Icon wordmark: an ultra-lightweight row -- small square wordmark
		// badge instead of plain text, generously letter-spaced uppercase
		// links, a single thin outlined pill CTA, no borders/backgrounds
		// anywhere else -- the airy "design studio" look.
		case 'iconWordmark':
			return (
				<nav className="w-full flex flex-wrap items-center justify-between gap-4 px-6 py-5" style={{ backgroundColor: bg, color: fg, position: 'relative' }}>
					<div className="flex items-center gap-2.5 shrink-0">
						{!(editorConfig.enable_navbar_logo_image && node.brandDisplayMode === 'image' && node.logoImageUrl) && (
							<span
								className="flex items-center justify-center rounded font-bold text-xs shrink-0"
								style={{ width: 26, height: 26, backgroundColor: fg, color: bg }}
							>
								{brand.charAt(0).toUpperCase()}
							</span>
						)}
						<BrandMark node={node} brand={brand} className="font-semibold text-sm tracking-wide" style={{ color: fg, ...brandClamp }} />
					</div>
					<div role="list" className="navbar-desktop-links flex items-center gap-7 flex-1 flex-wrap justify-center">
						{links.map((link, i) => (
							<div role="listitem" key={i}>
								<LinkSlot key={i} index={i} fallback={
									<a
										href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
										style={{ ...reduceMotionStyle, color: fg, ...linksClamp }}
										className="text-xs font-medium uppercase tracking-[0.12em] hover:opacity-60 no-underline"
									>
										{link.label}
									</a>
								} />
							</div>
						))}
					</div>
					<CtaSlot fallback={ctaVisible && ctaLabel && (
						<a
							href={isEditing ? undefined : ctaHref} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							style={{ ...reduceMotionStyle, borderColor: `${fg}55`, color: fg, ...ctaClamp }}
							className="navbar-desktop-links text-xs font-semibold uppercase tracking-[0.08em] px-4 py-2 rounded-full border no-underline hover:opacity-70 shrink-0"
						>
							{ctaLabel}
						</a>
					)} />
					{mobileMenu(bg, fg)}
				</nav>
			)

		// Action icon bar: dark bar, links kept tight/compact on the left,
		// the CTA rendered as the dominant element -- a bold gradient button
		// with a small leading glyph dot -- anchoring the right edge, unlike
		// darkBorderedRow's outlined CTA or darkBar's grid-tile CTA.
		case 'actionIconBar': {
			const darkBg = bg === '#ffffff' ? '#0b0f19' : bg
			const darkFg = fg === '#111827' ? '#e5e7eb' : fg
			return (
				<nav className="w-full flex flex-wrap items-center justify-between gap-4 px-6 py-3.5" style={{ backgroundColor: darkBg, color: darkFg, position: 'relative' }}>
					<BrandMark node={node} brand={brand} className="font-bold text-base shrink-0" style={{ color: darkFg, ...brandClamp }} />
					<div role="list" className="navbar-desktop-links flex items-center gap-4 flex-1 flex-wrap justify-center">
						{links.map((link, i) => (
							<div role="listitem" key={i}>
								<LinkSlot key={i} index={i} fallback={
									<a href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ ...reduceMotionStyle, color: `${darkFg}cc`, ...linksClamp }} className="text-sm font-medium hover:opacity-80 no-underline">
										{link.label}
									</a>
								} />
							</div>
						))}
					</div>
					<CtaSlot fallback={ctaVisible && ctaLabel && (
						<a
							href={isEditing ? undefined : ctaHref} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }}
							style={{ ...reduceMotionStyle, background: `linear-gradient(120deg, ${accent}, ${accent}cc)`, color: '#fff', ...ctaClamp }}
							className="navbar-desktop-links inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg no-underline hover:opacity-90 shrink-0"
						>
							<span className="rounded-full shrink-0" style={{ width: 6, height: 6, backgroundColor: '#fff' }} />
							{ctaLabel}
						</a>
					)} />
					{mobileMenu(darkBg, darkFg)}
				</nav>
			)
		}

		default:
			return (
				<nav className="w-full flex flex-wrap items-center justify-between gap-4 px-6 py-4" style={{ backgroundColor: bg, color: fg, position: 'relative' }}>
					<BrandMark node={node} brand={brand} className="font-bold text-lg" style={{ color: fg, ...brandClamp }} />
					<div role="list" className="navbar-desktop-links flex items-center gap-6 flex-wrap">
						{links.map((link, i) => (
							<div role="listitem" key={i}>
								<LinkSlot key={i} index={i} fallback={
									<a href={isEditing ? undefined : (link.href || '#')} onClick={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation() } }} style={{ color: fg, ...linksClamp }} className="text-sm font-medium no-underline">
										{link.label}
									</a>
								} />
							</div>
						))}
					</div>
					{mobileMenu(bg, fg)}
				</nav>
			)
		}
	}

	return (
		<div ref={navRef} data-nav-compact={isCompact} className="w-full">
			{/* Scoped to this instance via the ancestor [data-nav-compact] attribute
			    selector (see useNavCompact()) -- not a viewport media query -- so
			    multiple NavBar instances on one page (e.g. header + footer) each
			    collapse independently based on their own measured width. */}
			<style>{`
				[data-nav-compact="true"] .navbar-desktop-links { display: none !important; }
				[data-nav-compact="true"] .navbar-mobile-toggle { display: flex !important; }
			`}</style>
			{renderVariant()}
		</div>
	)
}
