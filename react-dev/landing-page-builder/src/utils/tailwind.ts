import colors from 'tailwindcss/colors'

/**
 * Tailwind utility classes → builder styles, for the Import HTML pipeline.
 *
 * The AI writes Tailwind classes (no CSS, no JS). applyTailwind(doc) reads every element's class list and:
 *  - writes the plain utilities (the desktop look) into the element's `style=""`, under what the element already has,
 *  - keeps `tablet:` / `mobile:` (and `md:` style mobile-first) styles, and the hover: / active: / view: / animate-
 *    interactions, in a private `data-lp-tw` attribute that the importer turns into node.responsiveStyle and node.animation,
 *  - removes the classes it understood. A class it does not know stays in the class list and is reported.
 * Nothing here runs Tailwind or any code: it is a lookup table.
 */

export const TW_ATTR = 'data-lp-tw'

type Style = Record<string, string>
export type TwEffect = { animation_type: string; style: Record<string, string | number>; /** For toggle/show/hide/scrollTo: the id attribute of the element it acts on, resolved to a node id by the importer. */ targetSourceId?: string; targetNodeId?: string; scrollBehavior?: 'smooth'; preset?: string; duration?: number; delay?: number; easing?: string; iterations?: number }
export type TwTrigger = { trigger: 'hover' | 'active' | 'auto' | 'onView'; effects: TwEffect[] }
export interface TwData { tablet?: Style; mobile?: Style; trigger_effect?: TwTrigger[] }

export interface TailwindReport {
	/** Elements that had at least one Tailwind class we understood. */
	elements: number
	/** Classes turned into styles or interactions. */
	applied: number
	/** Classes that look like Tailwind but have no equivalent in the builder (kept in the class list). */
	unsupported: string[]
}

/* ---------- values ---------- */

const PALETTE: Record<string, Record<string, string>> = {}
for (const name of ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'] as const) {
	PALETTE[name] = (colors as unknown as Record<string, Record<string, string>>)[name]
}

const px = (n: number) => `${+(n * 4).toFixed(3)}px`
const isNum = (v: string) => /^-?\d+(\.\d+)?$/.test(v)

/** A value in `[...]`: underscores are spaces. Anything that could break out of a declaration or load something is refused. */
function arbitrary(v: string): string | null {
	const m = v.match(/^\[(.*)\]$/s)
	if (!m) return null
	const value = m[1].replace(/^(length|color|percentage|url|number|angle):/, '').replace(/_/g, ' ').trim()
	if (!value || value.length > 300 || /[;{}<>\\]|\/\*|javascript:|expression\(|@import|var\(|data:(?!image\/(png|jpe?g|gif|webp))/i.test(value)) return null
	if (/url\(/i.test(value) && !/^url\(\s*["']?https:\/\/[^"')\s]+["']?\s*\)$/i.test(value) && !/^[^]*(?:gradient)/i.test(value)) return null
	return value
}

function hexToRgb(hex: string): [number, number, number] | null {
	const h = hex.replace('#', '')
	const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6)
	if (!/^[0-9a-f]{6}$/i.test(full)) return null
	return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)]
}

function withAlpha(color: string, alpha: string | undefined): string {
	if (alpha === undefined) return color
	const a = alpha.startsWith('[') ? Number((arbitrary(alpha) ?? '').replace('%', '')) / (alpha.includes('%') ? 100 : 1) : Number(alpha) / 100
	if (!Number.isFinite(a) || a < 0 || a > 1) return color
	if (color === 'transparent') return color
	const rgb = color.startsWith('#') ? hexToRgb(color) : null
	if (rgb) return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${+a.toFixed(3)})`
	const fn = color.match(/^(rgb|hsl)a?\(\s*([^)]*?)\s*(?:[,/]\s*[\d.]+%?)?\)$/i)
	return fn ? `${fn[1]}a(${fn[2].replace(/\s+/g, ' ')} / ${+a.toFixed(3)})` : color
}

/** `blue-500`, `white`, `[#0B0B12]`, with an optional `/50` opacity. null when the value is not a colour. */
function colorOf(value: string): string | null {
	const [name, alpha] = splitAlpha(value)
	let color: string | null = null
	if (name === 'transparent') color = 'transparent'
	else if (name === 'current') color = 'currentColor'
	else if (name === 'inherit') color = 'inherit'
	else if (name === 'white') color = '#ffffff'
	else if (name === 'black') color = '#000000'
	else if (name.startsWith('[')) {
		const v = arbitrary(name)
		if (v && (/^#[0-9a-f]{3,8}$/i.test(v) || /^(rgb|hsl)a?\(/i.test(v) || /^[a-z]+$/i.test(v))) color = v
	} else {
		const m = name.match(/^([a-z]+)-(\d{2,3})$/)
		color = (m && PALETTE[m[1]]?.[m[2]]) || null
	}
	return color ? withAlpha(color, alpha) : null
}

function splitAlpha(value: string): [string, string | undefined] {
	const depth = (s: string) => (s.match(/\[/g) || []).length - (s.match(/\]/g) || []).length
	const i = value.lastIndexOf('/')
	if (i <= 0) return [value, undefined]
	const head = value.slice(0, i)
	return depth(head) === 0 ? [head, value.slice(i + 1)] : [value, undefined]
}

const FRACTION = /^(\d+)\/(\d+)$/

/** Spacing/sizing scale value: 4 → 16px, px → 1px, 1/2 → 50%, [..] → as written. */
function sizeOf(v: string, axis: 'w' | 'h' | null = null): string | null {
	if (v === 'auto') return 'auto'
	if (v === 'px') return '1px'
	if (v === 'full') return '100%'
	if (v === 'screen') return axis === 'h' ? '100vh' : '100vw'
	if (v === 'min') return 'min-content'
	if (v === 'max') return 'max-content'
	if (v === 'fit') return 'fit-content'
	if (v === 'svh' || v === 'dvh' || v === 'lvh') return `100${v}`
	const f = v.match(FRACTION)
	if (f && Number(f[2])) return `${+((Number(f[1]) / Number(f[2])) * 100).toFixed(4)}%`
	if (isNum(v)) return px(Number(v))
	return arbitrary(v)
}

const NEGATE = (v: string) => (v === 'auto' ? v : v.startsWith('-') ? v.slice(1) : `-${v}`)

const FONT_SIZE: Record<string, [string, string]> = {
	xs: ['12px', '16px'], sm: ['14px', '20px'], base: ['16px', '24px'], lg: ['18px', '28px'], xl: ['20px', '28px'],
	'2xl': ['24px', '32px'], '3xl': ['30px', '36px'], '4xl': ['36px', '40px'], '5xl': ['48px', '1'], '6xl': ['60px', '1'],
	'7xl': ['72px', '1'], '8xl': ['96px', '1'], '9xl': ['128px', '1'],
}
const FONT_WEIGHT: Record<string, string> = { thin: '100', extralight: '200', light: '300', normal: '400', medium: '500', semibold: '600', bold: '700', extrabold: '800', black: '900' }
const LEADING: Record<string, string> = { none: '1', tight: '1.25', snug: '1.375', normal: '1.5', relaxed: '1.625', loose: '2' }
const TRACKING: Record<string, string> = { tighter: '-0.05em', tight: '-0.025em', normal: '0em', wide: '0.025em', wider: '0.05em', widest: '0.1em' }
const RADIUS: Record<string, string> = { none: '0px', sm: '2px', '': '4px', md: '6px', lg: '8px', xl: '12px', '2xl': '16px', '3xl': '24px', full: '9999px' }
const MAX_W: Record<string, string> = {
	none: 'none', xs: '320px', sm: '384px', md: '448px', lg: '512px', xl: '576px', '2xl': '672px', '3xl': '768px', '4xl': '896px', '5xl': '1024px', '6xl': '1152px', '7xl': '1280px',
	full: '100%', min: 'min-content', max: 'max-content', fit: 'fit-content', prose: '65ch', 'screen-sm': '640px', 'screen-md': '768px', 'screen-lg': '1024px', 'screen-xl': '1280px', 'screen-2xl': '1536px',
}
const SHADOW: Record<string, string> = {
	sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
	'': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
	md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
	lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
	xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
	'2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
	inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
	none: 'none',
}
const BLUR: Record<string, string> = { none: '0px', sm: '4px', '': '8px', md: '12px', lg: '16px', xl: '24px', '2xl': '40px', '3xl': '64px' }
const ALIGN_ITEMS: Record<string, string> = { start: 'flex-start', end: 'flex-end', center: 'center', baseline: 'baseline', stretch: 'stretch' }
const JUSTIFY: Record<string, string> = { start: 'flex-start', end: 'flex-end', center: 'center', between: 'space-between', around: 'space-around', evenly: 'space-evenly', normal: 'normal', stretch: 'stretch' }
const EASING: Record<string, string> = { linear: 'linear', in: 'ease-in', out: 'ease-out', 'in-out': 'ease-in-out' }
const GRADIENT_DIR: Record<string, string> = { t: 'to top', tr: 'to top right', r: 'to right', br: 'to bottom right', b: 'to bottom', bl: 'to bottom left', l: 'to left', tl: 'to top left' }
const SIDE: Record<string, string> = { t: 'Top', r: 'Right', b: 'Bottom', l: 'Left' }
const CORNER: Record<string, string> = { tl: 'TopLeft', tr: 'TopRight', br: 'BottomRight', bl: 'BottomLeft' }
const CORNER_SIDE: Record<string, string[]> = { t: ['TopLeft', 'TopRight'], r: ['TopRight', 'BottomRight'], b: ['BottomLeft', 'BottomRight'], l: ['TopLeft', 'BottomLeft'] }

/** Tailwind's own animate-* names plus the builder's presets (fade-up, zoom-in, rubber-band...). */
const BUILTIN_ANIMATION: Record<string, { preset: string; iterations: number }> = {
	spin: { preset: 'spin', iterations: 0 }, ping: { preset: 'pulse', iterations: 0 }, pulse: { preset: 'pulse', iterations: 0 }, bounce: { preset: 'bounce', iterations: 0 },
}
const PRESET_NAMES: Record<string, { preset: string; iterations: number }> = Object.fromEntries(
	['fadeIn', 'fadeUp', 'fadeDown', 'fadeLeft', 'fadeRight', 'zoomIn', 'zoomOut', 'rotateIn', 'blurIn', 'skewIn', 'bounceIn', 'heartbeat', 'float', 'shake', 'wobble', 'swing', 'rubberBand']
		.map((p) => [p.toLowerCase(), { preset: p, iterations: ['heartbeat', 'float'].includes(p) ? 0 : 1 }]),
)
const animationOf = (name: string) => BUILTIN_ANIMATION[name] ?? PRESET_NAMES[name.replace(/[-_]/g, '').toLowerCase()] ?? null

/* ---------- one bucket of declarations ---------- */

/** What one screen size or interaction state collects: plain declarations plus the parts that combine (translate, skew, gradient). */
class Bucket {
	decl: Style = {}
	tx?: string
	ty?: string
	skx?: string
	sky?: string
	sx?: string
	sy?: string
	grad?: { dir?: string; from?: string; via?: string; to?: string }
	set(prop: string, value: string) { this.decl[prop] = value }
	get empty() { return !Object.keys(this.decl).length && !this.tx && !this.ty && !this.skx && !this.sky && !this.sx && !this.sy && !this.grad }
	/** The final style object, with the combined parts written out. */
	style(): Style {
		const out: Style = { ...this.decl }
		if (this.tx !== undefined || this.ty !== undefined) out.translate = `${this.tx ?? '0px'} ${this.ty ?? '0px'}`
		if (this.skx !== undefined || this.sky !== undefined) out.transform = `skew(${this.skx ?? '0deg'}, ${this.sky ?? '0deg'})`
		const scale = this.sx !== undefined && this.sy !== undefined && this.sx !== this.sy ? `${this.sx} ${this.sy}` : (this.sx ?? this.sy)
		if (scale !== undefined) out.scale = scale
		if (this.grad?.dir) {
			const stops = [this.grad.from ?? 'transparent', this.grad.via, this.grad.to ?? 'transparent'].filter(Boolean)
			out.backgroundImage = `linear-gradient(${this.grad.dir}, ${stops.join(', ')})`
		}
		return out
	}
}

const BP_ORDER = ['sm', 'md', 'lg', 'xl', '2xl'] as const
const STATES = new Set(['hover', 'active', 'click', 'view'])

interface Parsed { variants: string[]; util: string; negative: boolean }

function splitTop(token: string, sep: string): string[] {
	const parts: string[] = []
	let depth = 0
	let current = ''
	for (const c of token) {
		if (c === '[' || c === '(') depth++
		else if (c === ']' || c === ')') depth--
		if (c === sep && depth === 0) { parts.push(current); current = '' } else current += c
	}
	parts.push(current)
	return parts
}

function parseToken(token: string): Parsed {
	const parts = splitTop(token, ':')
	let util = parts.pop() ?? ''
	util = util.replace(/^!/, '').replace(/!$/, '')
	const negative = util.startsWith('-') && !util.startsWith('-[')
	return { variants: parts, util: negative ? util.slice(1) : util, negative }
}

/** Returns false when the utility is not understood. */
function applyUtility(b: Bucket, util: string, negative: boolean, timing: { duration?: number; delay?: number; easing?: string }): boolean {
	const neg = (v: string | null) => (v === null ? null : negative ? NEGATE(v) : v)
	const set = (prop: string, v: string | null) => { if (v === null) return false; b.set(prop, v); return true }
	const one = (re: RegExp) => util.match(re)

	// --- display, position, overflow, misc keywords
	const KEYWORD: Record<string, [string, string]> = {
		block: ['display', 'block'], 'inline-block': ['display', 'inline-block'], inline: ['display', 'inline'], flex: ['display', 'flex'], 'inline-flex': ['display', 'inline-flex'],
		grid: ['display', 'grid'], 'inline-grid': ['display', 'inline-grid'], hidden: ['display', 'none'], contents: ['display', 'contents'], 'flow-root': ['display', 'flow-root'],
		static: ['position', 'static'], relative: ['position', 'relative'], absolute: ['position', 'absolute'], fixed: ['position', 'fixed'], sticky: ['position', 'sticky'],
		'flex-row': ['flexDirection', 'row'], 'flex-col': ['flexDirection', 'column'], 'flex-row-reverse': ['flexDirection', 'row-reverse'], 'flex-col-reverse': ['flexDirection', 'column-reverse'],
		'flex-wrap': ['flexWrap', 'wrap'], 'flex-nowrap': ['flexWrap', 'nowrap'], 'flex-wrap-reverse': ['flexWrap', 'wrap-reverse'],
		'flex-1': ['flex', '1 1 0%'], 'flex-auto': ['flex', '1 1 auto'], 'flex-initial': ['flex', '0 1 auto'], 'flex-none': ['flex', 'none'],
		grow: ['flexGrow', '1'], 'grow-0': ['flexGrow', '0'], shrink: ['flexShrink', '1'], 'shrink-0': ['flexShrink', '0'],
		italic: ['fontStyle', 'italic'], 'not-italic': ['fontStyle', 'normal'], underline: ['textDecorationLine', 'underline'], 'line-through': ['textDecorationLine', 'line-through'], 'no-underline': ['textDecorationLine', 'none'], overline: ['textDecorationLine', 'overline'],
		uppercase: ['textTransform', 'uppercase'], lowercase: ['textTransform', 'lowercase'], capitalize: ['textTransform', 'capitalize'], 'normal-case': ['textTransform', 'none'],
		'text-left': ['textAlign', 'left'], 'text-center': ['textAlign', 'center'], 'text-right': ['textAlign', 'right'], 'text-justify': ['textAlign', 'justify'], 'text-start': ['textAlign', 'start'], 'text-end': ['textAlign', 'end'],
		'text-ellipsis': ['textOverflow', 'ellipsis'], 'text-clip': ['textOverflow', 'clip'], 'text-wrap': ['textWrap', 'wrap'], 'text-nowrap': ['textWrap', 'nowrap'], 'text-balance': ['textWrap', 'balance'],
		'whitespace-normal': ['whiteSpace', 'normal'], 'whitespace-nowrap': ['whiteSpace', 'nowrap'], 'whitespace-pre': ['whiteSpace', 'pre'], 'whitespace-pre-line': ['whiteSpace', 'pre-line'], 'whitespace-pre-wrap': ['whiteSpace', 'pre-wrap'],
		'break-words': ['overflowWrap', 'break-word'], 'break-all': ['wordBreak', 'break-all'], 'break-normal': ['overflowWrap', 'normal'],
		'font-sans': ['fontFamily', 'ui-sans-serif, system-ui, sans-serif'], 'font-serif': ['fontFamily', 'ui-serif, Georgia, serif'], 'font-mono': ['fontFamily', 'ui-monospace, monospace'],
		'overflow-hidden': ['overflow', 'hidden'], 'overflow-auto': ['overflow', 'auto'], 'overflow-visible': ['overflow', 'visible'], 'overflow-scroll': ['overflow', 'scroll'], 'overflow-clip': ['overflow', 'clip'],
		'overflow-x-hidden': ['overflowX', 'hidden'], 'overflow-x-auto': ['overflowX', 'auto'], 'overflow-x-scroll': ['overflowX', 'scroll'], 'overflow-y-hidden': ['overflowY', 'hidden'], 'overflow-y-auto': ['overflowY', 'auto'], 'overflow-y-scroll': ['overflowY', 'scroll'],
		'bg-cover': ['backgroundSize', 'cover'], 'bg-contain': ['backgroundSize', 'contain'], 'bg-auto': ['backgroundSize', 'auto'],
		'bg-center': ['backgroundPosition', 'center'], 'bg-top': ['backgroundPosition', 'top'], 'bg-bottom': ['backgroundPosition', 'bottom'], 'bg-left': ['backgroundPosition', 'left'], 'bg-right': ['backgroundPosition', 'right'],
		'bg-no-repeat': ['backgroundRepeat', 'no-repeat'], 'bg-repeat': ['backgroundRepeat', 'repeat'], 'bg-repeat-x': ['backgroundRepeat', 'repeat-x'], 'bg-repeat-y': ['backgroundRepeat', 'repeat-y'],
		'bg-fixed': ['backgroundAttachment', 'fixed'], 'bg-local': ['backgroundAttachment', 'local'], 'bg-scroll': ['backgroundAttachment', 'scroll'],
		'bg-clip-text': ['backgroundClip', 'text'], 'bg-clip-border': ['backgroundClip', 'border-box'], 'bg-clip-padding': ['backgroundClip', 'padding-box'],
		'border-solid': ['borderStyle', 'solid'], 'border-dashed': ['borderStyle', 'dashed'], 'border-dotted': ['borderStyle', 'dotted'], 'border-double': ['borderStyle', 'double'], 'border-none': ['borderStyle', 'none'],
		'border-collapse': ['borderCollapse', 'collapse'], 'border-separate': ['borderCollapse', 'separate'],
		'object-cover': ['objectFit', 'cover'], 'object-contain': ['objectFit', 'contain'], 'object-fill': ['objectFit', 'fill'], 'object-none': ['objectFit', 'none'], 'object-scale-down': ['objectFit', 'scale-down'],
		'object-center': ['objectPosition', 'center'], 'object-top': ['objectPosition', 'top'], 'object-bottom': ['objectPosition', 'bottom'], 'object-left': ['objectPosition', 'left'], 'object-right': ['objectPosition', 'right'],
		'pointer-events-none': ['pointerEvents', 'none'], 'pointer-events-auto': ['pointerEvents', 'auto'], 'select-none': ['userSelect', 'none'], 'select-text': ['userSelect', 'text'], 'select-all': ['userSelect', 'all'],
		visible: ['visibility', 'visible'], invisible: ['visibility', 'hidden'], 'list-none': ['listStyleType', 'none'], 'list-disc': ['listStyleType', 'disc'], 'list-decimal': ['listStyleType', 'decimal'],
		'list-inside': ['listStylePosition', 'inside'], 'list-outside': ['listStylePosition', 'outside'],
		'aspect-square': ['aspectRatio', '1 / 1'], 'aspect-video': ['aspectRatio', '16 / 9'], 'aspect-auto': ['aspectRatio', 'auto'],
		'mx-auto': ['marginInline', 'auto'], 'my-auto': ['marginBlock', 'auto'], 'ml-auto': ['marginLeft', 'auto'], 'mr-auto': ['marginRight', 'auto'], 'mt-auto': ['marginTop', 'auto'], 'mb-auto': ['marginBottom', 'auto'], 'm-auto': ['margin', 'auto'],
		'justify-items-center': ['justifyItems', 'center'], 'justify-items-start': ['justifyItems', 'start'], 'justify-items-end': ['justifyItems', 'end'], 'justify-items-stretch': ['justifyItems', 'stretch'],
		'place-items-center': ['placeItems', 'center'], 'place-content-center': ['placeContent', 'center'], 'place-self-center': ['placeSelf', 'center'],
		'self-auto': ['alignSelf', 'auto'], 'self-start': ['alignSelf', 'flex-start'], 'self-end': ['alignSelf', 'flex-end'], 'self-center': ['alignSelf', 'center'], 'self-stretch': ['alignSelf', 'stretch'], 'self-baseline': ['alignSelf', 'baseline'],
		'truncate': ['textOverflow', 'ellipsis'], 'grid-flow-row': ['gridAutoFlow', 'row'], 'grid-flow-col': ['gridAutoFlow', 'column'], 'grid-flow-dense': ['gridAutoFlow', 'dense'],
		'backdrop-blur': ['backdropFilter', 'blur(8px)'], 'sr-only': ['position', 'absolute'],
		'transform-gpu': ['transform', 'translateZ(0)'], 'antialiased': ['WebkitFontSmoothing', 'antialiased'],
		'resize-none': ['resize', 'none'], 'resize': ['resize', 'both'], 'appearance-none': ['appearance', 'none'], 'outline-none': ['outline', 'none'],
	}
	if (util === 'truncate') { b.set('overflow', 'hidden'); b.set('textOverflow', 'ellipsis'); b.set('whiteSpace', 'nowrap'); return true }
	if (util === 'sr-only') return false
	const kw = KEYWORD[util]
	if (kw) {
		const [prop, value] = kw
		if (prop === 'transform') return false
		// -m-auto etc. are not a thing; keep keywords as written
		b.set(prop, value)
		if ((util === 'mx-auto')) { b.set('marginLeft', 'auto'); b.set('marginRight', 'auto'); delete b.decl.marginInline }
		if ((util === 'my-auto')) { b.set('marginTop', 'auto'); b.set('marginBottom', 'auto'); delete b.decl.marginBlock }
		if (util === 'bg-clip-text') b.set('WebkitBackgroundClip', 'text')
		return true
	}
	if (util === 'container') { b.set('width', '100%'); b.set('maxWidth', '1280px'); b.set('marginLeft', 'auto'); b.set('marginRight', 'auto'); return true }

	let m: RegExpMatchArray | null

	// --- layout: alignment, grid, gap
	if ((m = one(/^items-(\w+)$/)) && ALIGN_ITEMS[m[1]]) return set('alignItems', ALIGN_ITEMS[m[1]])
	if ((m = one(/^justify-(\w+)$/)) && JUSTIFY[m[1]]) return set('justifyContent', JUSTIFY[m[1]])
	if ((m = one(/^content-(\w+)$/)) && (JUSTIFY[m[1]] || m[1] === 'center')) return set('alignContent', JUSTIFY[m[1]] ?? m[1])
	if ((m = one(/^grid-cols-(\d+|none|\[.+\])$/))) return set('gridTemplateColumns', m[1] === 'none' ? 'none' : isNum(m[1]) ? `repeat(${m[1]}, minmax(0, 1fr))` : arbitrary(m[1]))
	if ((m = one(/^grid-rows-(\d+|none|\[.+\])$/))) return set('gridTemplateRows', m[1] === 'none' ? 'none' : isNum(m[1]) ? `repeat(${m[1]}, minmax(0, 1fr))` : arbitrary(m[1]))
	if ((m = one(/^col-span-(\d+|full)$/))) return set('gridColumn', m[1] === 'full' ? '1 / -1' : `span ${m[1]} / span ${m[1]}`)
	if ((m = one(/^row-span-(\d+|full)$/))) return set('gridRow', m[1] === 'full' ? '1 / -1' : `span ${m[1]} / span ${m[1]}`)
	if ((m = one(/^col-start-(\d+)$/))) return set('gridColumnStart', m[1])
	if ((m = one(/^col-end-(\d+)$/))) return set('gridColumnEnd', m[1])
	if ((m = one(/^order-(\d+|first|last|none)$/))) return set('order', m[1] === 'first' ? '-9999' : m[1] === 'last' ? '9999' : m[1] === 'none' ? '0' : m[1])
	if ((m = one(/^gap(?:-([xy]))?-(.+)$/))) { const v = sizeOf(m[2]); if (v === null) return false; if (m[1] === 'x') b.set('columnGap', v); else if (m[1] === 'y') b.set('rowGap', v); else b.set('gap', v); return true }
	if ((m = one(/^space-([xy])-(.+)$/))) {
		const v = neg(sizeOf(m[2])); if (v === null) return false
		b.set(m[1] === 'x' ? 'columnGap' : 'rowGap', v)
		if (!b.decl.display) b.set('display', 'flex')
		if (m[1] === 'y' && !b.decl.flexDirection) b.set('flexDirection', 'column')
		return true
	}

	// --- spacing
	if ((m = one(/^(p|m)([xytrbl]?)-(.+)$/))) {
		const v = neg(sizeOf(m[3])); if (v === null) return false
		const base = m[1] === 'p' ? 'padding' : 'margin'
		const sides = m[2] === 'x' ? ['Left', 'Right'] : m[2] === 'y' ? ['Top', 'Bottom'] : m[2] ? [SIDE[m[2]]] : null
		if (!sides) b.set(base, v)
		else for (const s of sides) b.set(`${base}${s}`, v)
		return true
	}
	if ((m = one(/^(top|right|bottom|left|inset|inset-x|inset-y)-(.+)$/))) {
		const v = neg(sizeOf(m[2])); if (v === null) return false
		if (m[1] === 'inset') b.set('inset', v)
		else if (m[1] === 'inset-x') { b.set('left', v); b.set('right', v) }
		else if (m[1] === 'inset-y') { b.set('top', v); b.set('bottom', v) }
		else b.set(m[1], v)
		return true
	}
	if ((m = one(/^z-(\d+|auto|\[.+\])$/))) return set('zIndex', neg(m[1] === 'auto' ? 'auto' : isNum(m[1]) ? m[1] : arbitrary(m[1])))

	// --- sizing
	if ((m = one(/^(w|h|min-w|min-h|max-w|max-h|size)-(.+)$/))) {
		const [kind, raw] = [m[1], m[2]]
		const axis = kind.endsWith('h') ? 'h' : 'w'
		let v: string | null
		if (kind === 'max-w' && MAX_W[raw]) v = MAX_W[raw]
		else if (kind === 'max-h' && raw === 'none') v = 'none'
		else if (kind.startsWith('min-') && raw === '0') v = '0px'
		else v = sizeOf(raw, axis)
		if (v === null) return false
		const prop = { w: 'width', h: 'height', 'min-w': 'minWidth', 'min-h': 'minHeight', 'max-w': 'maxWidth', 'max-h': 'maxHeight' }[kind]
		if (kind === 'size') { b.set('width', v); b.set('height', v) } else b.set(prop as string, v)
		return true
	}

	// --- typography
	if ((m = one(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/))) { const [size, line] = FONT_SIZE[m[1]]; b.set('fontSize', size); b.set('lineHeight', line); return true }
	if ((m = one(/^font-(\[.+\])$/))) return set('fontFamily', arbitrary(m[1]))
	if ((m = one(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/))) return set('fontWeight', FONT_WEIGHT[m[1]])
	if ((m = one(/^leading-(.+)$/))) return set('lineHeight', LEADING[m[1]] ?? (isNum(m[1]) ? px(Number(m[1])) : arbitrary(m[1])))
	if ((m = one(/^tracking-(.+)$/))) return set('letterSpacing', TRACKING[m[1]] ?? arbitrary(m[1]))
	if ((m = one(/^line-clamp-(\d+|none)$/))) {
		if (m[1] === 'none') { b.set('WebkitLineClamp', 'unset'); return true }
		b.set('overflow', 'hidden'); b.set('display', '-webkit-box'); b.set('WebkitBoxOrient', 'vertical'); b.set('WebkitLineClamp', m[1]); return true
	}
	if ((m = one(/^text-\[(?:length:)?(\d+(?:\.\d+)?(?:px|rem|em|%|vw))\]$/))) return set('fontSize', m[1])
	if ((m = one(/^align-(top|middle|bottom|baseline)$/))) return set('verticalAlign', m[1])
	if ((m = one(/^cursor-(\w+)$/))) return set('cursor', m[1].replace('notallowed', 'not-allowed'))
	if ((m = one(/^decoration-(.+)$/)) && colorOf(m[1])) return set('textDecorationColor', colorOf(m[1]))
	if ((m = one(/^underline-offset-(\d+)$/))) return set('textUnderlineOffset', `${m[1]}px`)

	// --- colours
	if ((m = one(/^text-(.+)$/)) && colorOf(m[1])) return set('color', colorOf(m[1]))
	if ((m = one(/^fill-(.+)$/)) && colorOf(m[1])) return set('fill', colorOf(m[1]))
	if ((m = one(/^stroke-(.+)$/)) && colorOf(m[1])) return set('stroke', colorOf(m[1]))
	if ((m = one(/^bg-(.+)$/))) {
		const c = colorOf(m[1])
		if (c) return set('backgroundColor', c)
		const v = arbitrary(m[1])
		if (v && /^(url\(|[a-z-]*gradient\()/i.test(v)) return set('backgroundImage', v)
		const g = m[1].match(/^(?:gradient|linear)-to-(t|tr|r|br|b|bl|l|tl)$/)
		if (g) { b.grad = { ...b.grad, dir: GRADIENT_DIR[g[1]] }; return true }
		return false
	}
	if ((m = one(/^(from|via|to)-(.+)$/)) && colorOf(m[2])) { b.grad = { ...b.grad, [m[1]]: colorOf(m[2]) as string }; return true }
	if ((m = one(/^opacity-(\d+|\[.+\])$/))) { const v = isNum(m[1]) ? String(Number(m[1]) / 100) : arbitrary(m[1]); return set('opacity', v) }

	// --- borders and radius
	if (util === 'border') { b.set('borderWidth', '1px'); if (!b.decl.borderStyle) b.set('borderStyle', 'solid'); return true }
	if ((m = one(/^border-([xytrbl]?)-?(\d+|\[.+\])?$/)) && (m[1] || m[2]) && (m[2] === undefined || isNum(m[2]) || m[2].startsWith('['))) {
		const w = m[2] === undefined ? '1px' : isNum(m[2]) ? `${m[2]}px` : arbitrary(m[2])
		if (w === null) return false
		const sides = m[1] === 'x' ? ['Left', 'Right'] : m[1] === 'y' ? ['Top', 'Bottom'] : m[1] ? [SIDE[m[1]]] : null
		if (!sides) b.set('borderWidth', w); else for (const s of sides) b.set(`border${s}Width`, w)
		if (!b.decl.borderStyle) b.set('borderStyle', 'solid')
		return true
	}
	if ((m = one(/^border-([xytrbl])-(.+)$/)) && colorOf(m[2])) {
		const sides = m[1] === 'x' ? ['Left', 'Right'] : m[1] === 'y' ? ['Top', 'Bottom'] : [SIDE[m[1]]]
		for (const s of sides) b.set(`border${s}Color`, colorOf(m[2]) as string)
		return true
	}
	if ((m = one(/^border-(.+)$/)) && colorOf(m[1])) return set('borderColor', colorOf(m[1]))
	if ((m = one(/^rounded(?:-(tl|tr|br|bl|t|r|b|l))?(?:-(none|sm|md|lg|xl|2xl|3xl|full|\[.+\]))?$/))) {
		const size = m[2] ? (m[2].startsWith('[') ? arbitrary(m[2]) : RADIUS[m[2]]) : RADIUS['']
		if (size === null || size === undefined) return false
		if (!m[1]) b.set('borderRadius', size)
		else for (const corner of CORNER[m[1]] ? [CORNER[m[1]]] : CORNER_SIDE[m[1]]) b.set(`border${corner}Radius`, size)
		return true
	}
	if ((m = one(/^ring(?:-(\d+))?$/))) return set('boxShadow', `0 0 0 ${m[1] ?? '3'}px rgba(59, 130, 246, 0.5)`)
	if ((m = one(/^outline-(\d+)$/))) { b.set('outlineWidth', `${m[1]}px`); b.set('outlineStyle', 'solid'); return true }

	// --- effects
	if ((m = one(/^shadow(?:-(sm|md|lg|xl|2xl|inner|none|\[.+\]))?$/))) {
		const v = m[1]?.startsWith('[') ? arbitrary(m[1]) : SHADOW[m[1] ?? '']
		return set('boxShadow', v ?? null)
	}
	if ((m = one(/^blur(?:-(none|sm|md|lg|xl|2xl|3xl|\[.+\]))?$/))) { const v = m[1]?.startsWith('[') ? arbitrary(m[1]) : BLUR[m[1] ?? '']; return v ? set('filter', `blur(${v})`) : false }
	if ((m = one(/^backdrop-blur-(none|sm|md|lg|xl|2xl|3xl)$/))) { b.set('backdropFilter', `blur(${BLUR[m[1]]})`); b.set('WebkitBackdropFilter', `blur(${BLUR[m[1]]})`); return true }
	if ((m = one(/^(brightness|contrast|saturate)-(\d+)$/))) return set('filter', `${m[1]}(${Number(m[2]) / 100})`)
	if (util === 'grayscale') return set('filter', 'grayscale(1)')

	// --- transforms (the individual CSS properties, so they combine and animate on their own)
	if ((m = one(/^scale(?:-([xy]))?-(\d+|\[.+\])$/))) {
		const v = isNum(m[2]) ? String(Number(m[2]) / 100) : arbitrary(m[2]); if (v === null) return false
		if (m[1] !== 'y') b.sx = v
		if (m[1] !== 'x') b.sy = v
		return true
	}
	if ((m = one(/^rotate-(\d+|\[.+\])$/))) { const v = isNum(m[1]) ? `${m[1]}deg` : arbitrary(m[1]); return set('rotate', neg(v)) }
	if ((m = one(/^translate-([xy])-(.+)$/))) {
		const v = neg(sizeOf(m[2])); if (v === null) return false
		if (m[1] === 'x') b.tx = v; else b.ty = v
		return true
	}
	if ((m = one(/^skew-([xy])-(\d+|\[.+\])$/))) {
		const v = neg(isNum(m[2]) ? `${m[2]}deg` : arbitrary(m[2])); if (v === null) return false
		if (m[1] === 'x') b.skx = v; else b.sky = v
		return true
	}
	if ((m = one(/^origin-(center|top|bottom|left|right|top-left|top-right|bottom-left|bottom-right)$/))) return set('transformOrigin', m[1].replace('-', ' '))

	// --- timing (applies to the element's interactions; not a style of its own)
	if ((m = one(/^duration-(\d+|\[\d+(?:ms)?\])$/))) { timing.duration = Number(m[1].replace(/\D/g, '')); return true }
	if ((m = one(/^delay-(\d+|\[\d+(?:ms)?\])$/))) { timing.delay = Number(m[1].replace(/\D/g, '')); return true }
	if ((m = one(/^ease-(linear|in|out|in-out)$/))) { timing.easing = EASING[m[1]]; return true }
	if ((m = one(/^ease-\[(cubic-bezier\([\d.,\s-]+\))\]$/))) { timing.easing = m[1].replace(/[\s_]/g, ''); return true }
	if (/^(transition(-(all|colors|opacity|shadow|transform|none))?|will-change-\w+|transform|filter|backdrop-filter)$/.test(util)) return true

	return false
}

/* ---------- one element ---------- */

const kebab = (prop: string) => (/^[A-Z]/.test(prop) ? '-' : '') + prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
const cssText = (style: Style) => Object.entries(style).map(([prop, value]) => `${kebab(prop)}: ${value}`).join('; ')

const num = (v: string | undefined, unit: 'px' | 'deg' | null): number | null => {
	if (v === undefined) return null
	const n = parseFloat(v)
	if (!Number.isFinite(n)) return null
	if (unit && !new RegExp(`^-?[\\d.]+${unit}?$`).test(v)) return null
	return n
}

/** A state bucket (hover/active/view) as the builder's style effects. What has no effect type is returned in `lost`. */
function effectsOf(b: Bucket, timing: { duration?: number; delay?: number; easing?: string }, lost: string[]): TwEffect[] {
	const style = b.style()
	const t = { ...(timing.duration !== undefined ? { duration: timing.duration } : {}), ...(timing.delay !== undefined ? { delay: timing.delay } : {}), ...(timing.easing ? { easing: timing.easing } : {}) }
	const effects: TwEffect[] = []
	const used = new Set<string>()
	const add = (animation_type: string, s: Record<string, string | number>, ...keys: string[]) => { effects.push({ animation_type, style: s, ...t }); keys.forEach((k) => used.add(k)) }

	if (style.backgroundColor) add('backgroundColor', { 'background-color': style.backgroundColor }, 'backgroundColor')
	if (style.color) add('textColor', { color: style.color }, 'color')
	if (style.boxShadow) add('boxShadow', { 'box-shadow': style.boxShadow }, 'boxShadow')
	if (style.opacity !== undefined) { const n = num(style.opacity, null); if (n !== null) add('opacity', { opacity: n }, 'opacity') }
	if (style.scale !== undefined) { const n = num(style.scale.split(' ')[0], null); if (n !== null) add('scale', { scale: n }, 'scale') }
	if (style.rotate !== undefined) { const n = num(style.rotate, 'deg'); if (n !== null) add('rotate', { rotate: n }, 'rotate') }
	if (style.translate !== undefined) {
		const [x, y] = style.translate.split(' ')
		const nx = num(x, 'px'); const ny = num(y, 'px')
		if (nx !== null && ny !== null) add('translate', { 'translate-x': nx, 'translate-y': ny }, 'translate')
	}
	if (b.skx !== undefined || b.sky !== undefined) {
		const sx = num(b.skx ?? '0deg', 'deg'); const sy = num(b.sky ?? '0deg', 'deg')
		if (sx !== null && sy !== null) add('skew', { 'skew-x': sx, 'skew-y': sy }, 'transform')
	}
	if (style.filter?.startsWith('blur(')) { const n = num(style.filter.slice(5, -1), 'px'); if (n !== null) add('blur', { blur: n }, 'filter') }
	const radius = style.borderRadius
	if (radius !== undefined) {
		const r = { 'border-top-left-radius': radius, 'border-top-right-radius': radius, 'border-bottom-left-radius': radius, 'border-bottom-right-radius': radius }
		add('radius', r, 'borderRadius')
	}
	for (const prop of Object.keys(style)) if (!used.has(prop)) lost.push(prop)
	return effects
}

function applyElement(el: Element, report: TailwindReport): void {
	const raw = el.getAttribute('class')
	if (!raw) return
	const buckets = new Map<string, Bucket>()
	const bucketOf = (key: string) => { let b = buckets.get(key); if (!b) { b = new Bucket(); buckets.set(key, b) } return b }
	const timings: Record<string, { duration?: number; delay?: number; easing?: string }> = {}
	const animations: { trigger: TwTrigger['trigger']; preset: string; iterations: number }[] = []
	const actions: { trigger: TwTrigger['trigger']; effect: TwEffect }[] = []
	const kept: string[] = []
	let handled = 0

	for (const token of raw.split(/\s+/).filter(Boolean)) {
		const { variants, util, negative } = parseToken(token)
		const bps = variants.filter((v) => /^(sm|md|lg|xl|2xl|max-(sm|md|lg|xl|2xl)|tablet|mobile)$/.test(v))
		const states = variants.filter((v) => STATES.has(v) || v === 'in-view' || v === 'inview')
		const others = variants.filter((v) => !bps.includes(v) && !states.includes(v))
		const state = states[0] === 'in-view' || states[0] === 'inview' ? 'view' : states[0] === 'click' ? 'active' : states[0]
		const bp = bps[0]
		const keep = () => { kept.push(token); if (/^[\w:[\]()#%.,/!-]+$/.test(token) && /(:|^(bg|text|p|m|w|h|flex|grid|gap|rounded|border|shadow|opacity|font|items|justify|space|animate|transition|duration|ease|z|top|left|right|bottom|inset|overflow|object|leading|tracking)-)/.test(token)) report.unsupported.push(token) }

		if (others.length) { keep(); continue }
		// a class with no Tailwind shape at all (hero, card-title...) stays as a class
		// click:toggle-[#menu], show-[#menu], hide-[#menu], scroll-to-[#top]: act on the element with that id.
		const action = util.match(/^(toggle|show|hide|scroll-to)-\[#([\w-]+)\]$/)
		if (action && !negative) {
			const type = action[1] === 'scroll-to' ? 'scrollTo' : action[1]
			actions.push({ trigger: state === 'hover' ? 'hover' : 'active', effect: { animation_type: type, style: {}, targetSourceId: action[2], ...(type === 'scrollTo' ? { scrollBehavior: 'smooth' as const } : {}) } })
			handled++
			report.applied++
			continue
		}
		const animate = util.match(/^animate-(.+)$/)
		const timing = (timings[state ?? 'base'] ??= {})
		if (animate) {
			const found = animate[1] === 'none' ? null : animationOf(animate[1])
			if (animate[1] === 'none') { handled++; continue }
			if (!found) { keep(); continue }
			animations.push({ trigger: state === 'hover' ? 'hover' : state === 'active' ? 'active' : state === 'view' ? 'onView' : 'auto', ...found })
			handled++
			continue
		}
		const key = state ?? (bp === 'max-lg' || bp === 'max-md' ? 'tablet' : bp === 'max-sm' ? 'mobile' : bp ?? 'base')
		if (/^max-(xl|2xl)$/.test(key)) { keep(); continue }
		if (applyUtility(bucketOf(key), util, negative, timing)) { handled++; report.applied++ } else keep()
	}

	if (!handled) return
	report.elements++

	// --- plain styles: desktop, tablet, mobile
	const get = (k: string) => buckets.get(k)?.style() ?? {}
	const mobileFirst = BP_ORDER.some((k) => buckets.get(k) && !buckets.get(k)!.empty)
	const merge = (...parts: Style[]) => Object.assign({}, ...parts) as Style
	let desktop: Style
	let tablet: Style
	let mobile: Style
	if (mobileFirst) {
		desktop = merge(get('base'), get('sm'), get('md'), get('lg'), get('xl'), get('2xl'))
		const revert = (full: Style, level: Style) => merge(Object.fromEntries(Object.keys(full).filter((k) => !(k in level)).map((k) => [k, 'revert'])), level)
		tablet = merge(revert(desktop, merge(get('base'), get('sm'), get('md'))), get('tablet'))
		mobile = merge(revert(desktop, get('base')), get('mobile'))
	} else {
		desktop = get('base')
		tablet = merge(desktop, get('tablet'))
		mobile = merge(tablet, get('mobile'))
	}
	const diff = (from: Style, to: Style) => Object.fromEntries(Object.entries(to).filter(([k, v]) => from[k] !== v)) as Style
	const tabletDiff = diff(desktop, tablet)
	const mobileDiff = diff(tablet, mobile)

	// --- interactions
	const data: TwData = {}
	if (Object.keys(tabletDiff).length) data.tablet = tabletDiff
	if (Object.keys(mobileDiff).length) data.mobile = mobileDiff
	const triggers: TwTrigger[] = []
	const timingFor = (state: string) => ({ ...timings.base, ...timings[state] })
	for (const [state, trigger] of [['auto', 'auto'], ['hover', 'hover'], ['active', 'active'], ['view', 'onView']] as const) {
		const effects: TwEffect[] = []
		const b = buckets.get(state)
		if (b && !b.empty) {
			const lost: string[] = []
			effects.push(...effectsOf(b, timingFor(state), lost))
			for (const prop of lost) report.unsupported.push(`${state}:${prop}`)
		}
		for (const a of animations.filter((x) => x.trigger === trigger)) {
			const t = timingFor(state)
			effects.push({ animation_type: 'preset', preset: a.preset, style: {}, duration: t.duration ?? (a.iterations === 0 ? 1000 : 600), ...(t.delay !== undefined ? { delay: t.delay } : {}), ...(t.easing ? { easing: t.easing } : {}), iterations: a.iterations })
		}
		effects.push(...actions.filter((a) => a.trigger === trigger).map((a) => a.effect))
		if (effects.length) triggers.push({ trigger, effects })
	}
	if (triggers.length) data.trigger_effect = triggers

	// --- write back
	const existing = el.getAttribute('style')
	const own = cssText(desktop)
	if (own) el.setAttribute('style', existing ? `${own}; ${existing}` : own)
	if (data.tablet || data.mobile || data.trigger_effect) el.setAttribute(TW_ATTR, JSON.stringify(data))
	if (kept.length) el.setAttribute('class', kept.join(' ')); else el.removeAttribute('class')
}

/**
 * Translates the Tailwind classes of every element in the document (body and descendants) in place.
 * Returns null when no element had a Tailwind class, so a plain page is untouched.
 */
export function applyTailwind(doc: Document): TailwindReport | null {
	const report: TailwindReport = { elements: 0, applied: 0, unsupported: [] }
	doc.body?.querySelectorAll('[class]').forEach((el) => applyElement(el, report))
	if (doc.body?.hasAttribute('class')) applyElement(doc.body, report)
	report.unsupported = Array.from(new Set(report.unsupported))
	return report.elements || report.unsupported.length ? report : null
}

/** What `applyTailwind` stored on the element: its tablet and mobile styles and its interactions. */
export function readTailwind(el: Element): TwData {
	const raw = el.getAttribute(TW_ATTR)
	if (!raw) return {}
	try {
		const data = JSON.parse(raw) as TwData
		return data && typeof data === 'object' ? data : {}
	} catch {
		return {}
	}
}
