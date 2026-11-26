import { CanvasNode, ContentType } from "@/types/node.type";
import { generateNewNode } from "@/utils/canvas.utils";
import { textNode, headingNode, imageNode, buttonNode, blockNode, type Palette, accentOf } from "@/utils/nodeBuilders";
// Re-exported for existing importers (e.g. RandomLayoutDialog.tsx) that
// used to get `Palette` from this file before it moved to nodeBuilders.ts.
export type { Palette };
import {
	generateFaqTemplate,
	generateTimelineTemplate,
	generatePricingToggleTemplate,
	generateCardsTemplate,
	generateEventWidgetsGroupTemplate,
	generatePersonalCardTemplate,
	generateProgressBarTemplate,
	generateNavBarTemplate,
	generateHeroTemplate,
	generateFooterTemplate,
} from "@/utils/readyMadeTemplates";

/** One generated section's content + an optional style override for the section wrapper it gets placed in (e.g. a dark CTA banner needs a dark section, not the default white one). */
interface SectionSpec {
	children: CanvasNode[]
	style?: React.CSSProperties
}

export type RandomLayoutGroup = "essential" | "advanced" | "compositions"

export interface RandomLayoutCatalogItem {
	key: string
	labelKey: string
	group: RandomLayoutGroup
	/** Fixed position in the generated page rather than shuffled into the middle. */
	role?: "navbar" | "hero" | "footer"
	generate: () => SectionSpec
}

function pick<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)]
}

function shuffle<T>(items: T[]): T[] {
	const result = [...items]
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
			;[result[i], result[j]] = [result[j], result[i]]
	}
	return result
}

function fromTemplate(generate: () => CanvasNode[]): () => SectionSpec {
	return () => ({ children: generate() })
}

// ---------------------------------------------------------------------------
// textNode/headingNode/imageNode/buttonNode/blockNode now live in
// nodeBuilders.ts (shared with readyMadeTemplates.ts, which builds several
// Ready Made Templates from the same primitives) — imported above.
// ---------------------------------------------------------------------------

/** Heading + the widget's own default seed (NEW_NODES[contentType], the same defaults a manual Insert-panel click produces) — the plain "wrap one content type with a heading" shape every Ready Made Template already uses. */
function fromAdvancedWidget(contentType: ContentType, headingText: string): () => SectionSpec {
	return () => ({ children: [headingNode(headingText), generateNewNode(contentType)] })
}

// ---------------------------------------------------------------------------
// "Essential Components" — the existing Ready Made Templates.
// ---------------------------------------------------------------------------

const ESSENTIAL_CATALOG: RandomLayoutCatalogItem[] = [
	{ key: "navBar", labelKey: "navBar", group: "essential", role: "navbar", generate: fromTemplate(generateNavBarTemplate) },
	{ key: "hero", labelKey: "hero", group: "essential", role: "hero", generate: fromTemplate(generateHeroTemplate) },
	{ key: "cards", labelKey: "cards", group: "essential", generate: fromTemplate(generateCardsTemplate) },
	{ key: "timeline", labelKey: "timeline", group: "essential", generate: fromTemplate(generateTimelineTemplate) },
	{ key: "personalCard", labelKey: "personalCard", group: "essential", generate: fromTemplate(generatePersonalCardTemplate) },
	{ key: "eventWidgetsGroup", labelKey: "eventWidgetsGroup", group: "essential", generate: fromTemplate(generateEventWidgetsGroupTemplate) },
	{ key: "pricingToggle", labelKey: "pricingToggle", group: "essential", generate: fromTemplate(generatePricingToggleTemplate) },
	{ key: "faq", labelKey: "faq", group: "essential", generate: fromTemplate(generateFaqTemplate) },
	{ key: "progressBar", labelKey: "progressBar", group: "essential", generate: fromTemplate(generateProgressBarTemplate) },
	{ key: "footer", labelKey: "footer", group: "essential", role: "footer", generate: fromTemplate(generateFooterTemplate) },
	// tableEnterprise deliberately excluded: its own Insert-panel button is
	// commented out (disabled) pending a fix, so it stays out of the pool too.
]

// ---------------------------------------------------------------------------
// "Advanced Widgets" — the same content types offered in the Insert panel's
// Advanced Widgets group, each wrapped with a heading like a Ready Made
// Template. `separators` (a bare divider, not real section content) and
// `html` (raw embed with no safe default) are left out as poor fits for a
// full-width random section; everything else from that group is included.
// ---------------------------------------------------------------------------

/**
 * `i18nKey` points at the existing `contentType.*` label this same widget
 * already uses in the plain Advanced Widgets Insert-panel group (verified
 * against insert.json, not assumed — a couple of these don't match their
 * ContentType casing 1:1, e.g. "tab" -> "tabs", "countDown" -> "countdown").
 * `blockCarousel` is left out: it has no standalone Insert-panel button in
 * this app (only reachable another way), so it's not a normal "insert this
 * widget on its own" candidate the way the rest of this list is.
 */
const ADVANCED_WIDGET_ENTRIES: { contentType: ContentType; key: string; i18nKey: string; heading: string }[] = [
	{ contentType: "chart", key: "chart", i18nKey: "chart", heading: "Our Numbers" },
	{ contentType: "counter", key: "counter", i18nKey: "counter", heading: "By The Numbers" },
	{ contentType: "rating", key: "rating", i18nKey: "rating", heading: "Customer Rating" },
	{ contentType: "testimonialSlider", key: "testimonialSlider", i18nKey: "testimonialSlider", heading: "What People Say" },
	{ contentType: "accordion", key: "accordion", i18nKey: "accordion", heading: "Frequently Asked Questions" },
	{ contentType: "tab", key: "tab", i18nKey: "tabs", heading: "Explore" },
	{ contentType: "imageSlider", key: "imageSlider", i18nKey: "imageSlider", heading: "Gallery" },
	{ contentType: "imageCarousel", key: "imageCarousel", i18nKey: "imageCarousel", heading: "Highlights" },
	{ contentType: "imageFlipFlop", key: "imageFlipFlop", i18nKey: "imageFlipFlop", heading: "Before & After" },
	{ contentType: "googleMap", key: "googleMap", i18nKey: "googleMap", heading: "Find Us" },
	{ contentType: "youtube", key: "youtube", i18nKey: "youtube", heading: "Watch The Video" },
	{ contentType: "vimeo", key: "vimeo", i18nKey: "vimeo", heading: "Watch The Video" },
	{ contentType: "countDown", key: "countDown", i18nKey: "countdown", heading: "Time Remaining" },
	{ contentType: "social", key: "social", i18nKey: "social", heading: "Follow Us" },
	{ contentType: "iconBlock", key: "iconBlock", i18nKey: "iconBlock", heading: "Highlights" },
	{ contentType: "verticalTab", key: "verticalTab", i18nKey: "verticalTab", heading: "Explore" },
]

const ADVANCED_CATALOG: RandomLayoutCatalogItem[] = ADVANCED_WIDGET_ENTRIES.map(({ contentType, key, i18nKey, heading }) => ({
	key,
	labelKey: i18nKey,
	group: "advanced" as const,
	generate: fromAdvancedWidget(contentType, heading),
}))

// ---------------------------------------------------------------------------
// "Randomized Compositions" — sections built straight from primitive
// text/image/button/block nodes instead of any pre-built template
// component, so the generator isn't limited to shuffling a fixed catalog.
// ---------------------------------------------------------------------------

const NEUTRAL_PALETTES: Palette[] = [
	{ bg: "#ffffff", text: "#0f172a", muted: "#475569" },
	{ bg: "#f8fafc", text: "#0f172a", muted: "#475569" },
]
const MIDNIGHT_PALETTES: Palette[] = [
	{ bg: "#0f172a", text: "#f8fafc", muted: "#cbd5e1" },
	{ bg: "#111827", text: "#f9fafb", muted: "#9ca3af" },
]
const OCEAN_PALETTES: Palette[] = [
	{ bg: "#eef6ff", text: "#0c4a6e", muted: "#0369a1" },
	{ bg: "#0c4a6e", text: "#f0f9ff", muted: "#7dd3fc" },
]
const SUNSET_PALETTES: Palette[] = [
	{ bg: "#fff7ed", text: "#7c2d12", muted: "#c2410c" },
	{ bg: "#7c2d12", text: "#fff7ed", muted: "#fdba74" },
]
const FOREST_PALETTES: Palette[] = [
	{ bg: "#f0fdf4", text: "#14532d", muted: "#15803d" },
	{ bg: "#14532d", text: "#f0fdf4", muted: "#86efac" },
]
const VIOLET_PALETTES: Palette[] = [
	{ bg: "#eef2ff", text: "#1e1b4b", muted: "#4338ca" },
	{ bg: "#1e1b4b", text: "#eef2ff", muted: "#a5b4fc" },
]

/** All palettes across every theme — used as the "Mixed" theme (the original behavior: any section can land on any look) and as the default for standalone/listing purposes. */
const PALETTES: Palette[] = [
	...NEUTRAL_PALETTES,
	...VIOLET_PALETTES,
	...MIDNIGHT_PALETTES,
]

export interface ColorTheme {
	key: string
	labelKey: string
	/** Representative color for the swatch in the picker UI. */
	swatch: string
	palettes: Palette[]
}

export const COLOR_THEMES: ColorTheme[] = [
	{ key: "mixed", labelKey: "mixed", swatch: "linear-gradient(135deg, #eef2ff 50%, #0f172a 50%)", palettes: [...NEUTRAL_PALETTES, ...VIOLET_PALETTES, ...MIDNIGHT_PALETTES] },
	{ key: "neutral", labelKey: "neutral", swatch: "#475569", palettes: NEUTRAL_PALETTES },
	{ key: "midnight", labelKey: "midnight", swatch: "#0f172a", palettes: MIDNIGHT_PALETTES },
	{ key: "ocean", labelKey: "ocean", swatch: "#0369a1", palettes: OCEAN_PALETTES },
	{ key: "sunset", labelKey: "sunset", swatch: "#c2410c", palettes: SUNSET_PALETTES },
	{ key: "forest", labelKey: "forest", swatch: "#15803d", palettes: FOREST_PALETTES },
	{ key: "violet", labelKey: "violet", swatch: "#4338ca", palettes: VIOLET_PALETTES },
]

export const DEFAULT_THEME_KEY = "mixed"

/** Sentinel themeKey meaning "use the caller-supplied customPalette instead of a COLOR_THEMES entry" — the picker dialog's own Background/Foreground/Primary/Secondary color fields. */
export const CUSTOM_THEME_KEY = "custom"

export const DEFAULT_CUSTOM_PALETTE: Palette = { bg: "#ffffff", text: "#0f172a", muted: "#475569", primary: "#2563eb" }

const HEADLINES = [
	"Build Something Amazing",
	"Your Next Big Idea Starts Here",
	"Designed for the Modern Web",
	"Effortless. Powerful. Yours.",
	"Turn Vision Into Reality",
	"Crafted With Care",
]

const SUBHEADS = [
	"A flexible foundation for whatever you're building next.",
	"Everything you need, nothing you don't.",
	"Fast, flexible, and built to scale with you.",
	"Simple tools for complex ideas.",
]

const SECTION_HEADINGS = ["Why Choose Us", "What We Offer", "Built For You", "Everything You Need"]

const FEATURE_TITLES = ["Fast Performance", "Built to Scale", "Secure by Default", "Easy to Customize", "Reliable Support", "Seamless Integration"]
const FEATURE_DESCRIPTIONS = [
	"Optimized from the ground up so everything feels instant.",
	"Grows with your team, from first launch to full scale.",
	"Best practices baked in, so you can focus on building.",
	"Every detail is yours to shape, no rigid constraints.",
	"Real people, ready to help whenever you need it.",
	"Connects with the tools you already use, out of the box.",
]

const QUOTES = [
	{ text: "This completely changed how our team works together.", author: "Jordan Lee, Product Lead" },
	{ text: "Simple, fast, and exactly what we needed.", author: "Casey Morgan, Founder" },
	{ text: "The kind of tool you wonder how you lived without.", author: "Riley Chen, Designer" },
]

const BUTTON_LABELS = ["Get Started", "Learn More", "Explore Now", "Join Us", "See How It Works", "Start Free Trial"]

/** Real, verified-working Unsplash photo URLs (reused from prior sample pages in this repo — some Unsplash IDs 404, so stick to known-good ones rather than inventing new ones). */
const IMAGE_BANK = [
	"https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
	"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
	"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
	"https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
	"https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
	"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
	"https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80",
	"https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
	"https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80",
]

/** Headline + subhead + CTA, centered, on a randomly picked palette. */
function generatePrimitiveHero(palettes: Palette[]): SectionSpec {
	const p = pick(palettes)
	return {
		style: { backgroundColor: p.bg },
		children: [
			textNode(pick(HEADLINES), { fontSize: "2.25em", fontWeight: "bold", color: p.text }, "center"),
			textNode(pick(SUBHEADS), { fontSize: "1.05em", color: p.muted, maxWidth: "36em", margin: "0 auto" }, "center"),
			buttonNode(pick(BUTTON_LABELS), { backgroundColor: accentOf(p), color: p.bg, marginTop: "0.5em" }),
		],
	}
}

/** A row/grid of 3-4 "icon-less cards" (title + description), built from raw blocks/text — a primitive alternative to cardsTemplate, not the same component reused with different copy. */
function generatePrimitiveFeatureGrid(palettes: Palette[]): SectionSpec {
	const p = pick(palettes)
	const cardCount = 3 + Math.floor(Math.random() * 2) // 3-4
	const titles = shuffle(FEATURE_TITLES).slice(0, cardCount)
	const descriptions = shuffle(FEATURE_DESCRIPTIONS).slice(0, cardCount)

	const cards = titles.map((title, i) =>
		blockNode(
			[
				textNode(title, { fontSize: "1.1em", fontWeight: "bold", color: p.text }, "left"),
				textNode(descriptions[i], { fontSize: "0.95em", color: p.muted }, "left"),
			],
			{
				display: "flex",
				flexDirection: "column",
				gap: "0.5em",
				padding: "1.5em",
				borderRadius: "0.75em",
				border: `1px solid ${p.muted}33`,
				backgroundColor: p.bg,
				width: "100%",
				height: "fit-content",
			},
		),
	)

	return {
		style: { backgroundColor: p.bg === "#ffffff" ? "#f8fafc" : p.bg },
		children: [
			textNode(pick(SECTION_HEADINGS), { fontSize: "1.75em", fontWeight: "bold", color: p.text }, "center"),
			blockNode(cards, {
				display: "grid",
				gridTemplateColumns: `repeat(${cardCount}, 1fr)`,
				gap: "1.25em",
				width: "100%",
			}),
		],
	}
}

/** A grid of 3-6 photos — no caption/text, a pure visual gallery band. */
function generatePrimitiveImageGallery(_palettes: Palette[]): SectionSpec {
	const count = 3 + Math.floor(Math.random() * 4) // 3-6
	const columns = count <= 3 ? count : count === 4 ? 4 : 3
	const images = shuffle(IMAGE_BANK).slice(0, count).map((url) =>
		imageNode(url, { height: "12em", width: "100%" }),
	)

	return {
		children: [
			blockNode(images, {
				display: "grid",
				gridTemplateColumns: `repeat(${columns}, 1fr)`,
				gap: "0.75em",
				width: "100%",
			}),
		],
	}
}

/** A single centered heading + button on a bold-colored band — a lightweight CTA, distinct from the full hero. */
function generatePrimitiveCtaBanner(palettes: Palette[]): SectionSpec {
	// Prefer a bold (non-white/near-white) band so this reads as a distinct
	// banner rather than another plain section — fall back to the full set
	// if the active theme has no bold option (e.g. an all-light theme).
	const boldPalettes = palettes.filter((c) => c.bg !== "#ffffff" && c.bg !== "#f8fafc")
	const p = pick(boldPalettes.length > 0 ? boldPalettes : palettes)
	return {
		style: { backgroundColor: p.bg },
		children: [
			textNode(pick(HEADLINES), { fontSize: "1.75em", fontWeight: "bold", color: p.text }, "center"),
			buttonNode(pick(BUTTON_LABELS), { backgroundColor: accentOf(p), color: p.bg }),
		],
	}
}

/** Two-column split: text (heading/paragraph/button) on one side, an image on the other — side randomized each time. */
function generatePrimitiveTextImageSplit(palettes: Palette[]): SectionSpec {
	const p = pick(palettes)
	const imageFirst = Math.random() < 0.5

	const textColumn = blockNode(
		[
			textNode(pick(HEADLINES), { fontSize: "1.75em", fontWeight: "bold", color: p.text }, "left"),
			textNode(pick(SUBHEADS), { fontSize: "1em", color: p.muted }, "left"),
			buttonNode(pick(BUTTON_LABELS), { backgroundColor: accentOf(p), color: p.bg, marginTop: "0.25em" }),
		],
		{ display: "flex", flexDirection: "column", gap: "0.75em", justifyContent: "center", width: "100%" },
	)
	const imageColumn = imageNode(pick(IMAGE_BANK), { height: "18em", width: "100%" })

	return {
		style: { backgroundColor: p.bg },
		children: [
			blockNode(imageFirst ? [imageColumn, textColumn] : [textColumn, imageColumn], {
				display: "grid",
				gridTemplateColumns: "1fr 1fr",
				gap: "2em",
				width: "100%",
				alignItems: "center",
			}),
		],
	}
}

/** A large centered quote/testimonial line with an attribution, built from plain text nodes rather than testimonialSlider. */
function generatePrimitiveQuote(palettes: Palette[]): SectionSpec {
	const p = pick(palettes)
	const quote = pick(QUOTES)
	return {
		style: { backgroundColor: p.bg },
		children: [
			textNode(`"${quote.text}"`, { fontSize: "1.5em", fontStyle: "italic", color: p.text, maxWidth: "40em", margin: "0 auto" }, "center"),
			textNode(`— ${quote.author}`, { fontSize: "0.95em", color: p.muted }, "center"),
		],
	}
}

/** Keyed by the same `key` used in COMPOSITIONS_CATALOG — generateRandomLayoutSections calls these directly with the chosen theme's palettes instead of each catalog item's zero-arg `generate` (which only exists so this group has the same shape as essential/advanced for the picker dialog's listing, and defaults to the "mixed" theme when used on its own). */
const PRIMITIVE_GENERATORS: Record<string, (palettes: Palette[]) => SectionSpec> = {
	primitiveHero: generatePrimitiveHero,
	primitiveFeatureGrid: generatePrimitiveFeatureGrid,
	primitiveImageGallery: generatePrimitiveImageGallery,
	primitiveCtaBanner: generatePrimitiveCtaBanner,
	primitiveTextImageSplit: generatePrimitiveTextImageSplit,
	primitiveQuote: generatePrimitiveQuote,
}

const COMPOSITIONS_CATALOG: RandomLayoutCatalogItem[] = Object.keys(PRIMITIVE_GENERATORS).map((key) => ({
	key,
	labelKey: key,
	group: "compositions" as const,
	generate: () => PRIMITIVE_GENERATORS[key](PALETTES),
}))

export const RANDOM_LAYOUT_CATALOG: RandomLayoutCatalogItem[] = [
	...ESSENTIAL_CATALOG,
	...ADVANCED_CATALOG,
	...COMPOSITIONS_CATALOG,
]

/** Checked by default when the picker dialog first opens: every Essential Component and Randomized Composition, no Advanced Widgets (those are more niche/optional embellishments the user opts into). */
export const DEFAULT_SELECTED_KEYS: string[] = [
	...ESSENTIAL_CATALOG.map((item) => item.key),
	...COMPOSITIONS_CATALOG.map((item) => item.key),
]

/**
 * Same section wrapper style the Insert panel's "Ready Made Templates"
 * buttons already use (handleAddReadyMadeTemplate in Insert.tsx) as the
 * base — reusing it means a generated Ready Made Template section looks
 * exactly like what a user gets clicking that same button by hand. A
 * generator's own `style` (e.g. a dark CTA band) is layered on top. Kept
 * in sync manually since Insert.tsx's copy is a local const, not exported.
 */
const SECTION_STYLE: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "1em",
	width: "100%",
	height: "fit-content",
	minHeight: "8em",
	padding: "2em 1.5em",
	backgroundColor: "#ffffff",
	justifyContent: "center",
	alignItems: "center",
}

function wrapInSection(spec: SectionSpec): CanvasNode {
	return generateNewNode("section", {
		children: spec.children,
		style: { ...SECTION_STYLE, ...spec.style },
	})
}

/**
 * Builds a full random page from the given set of catalog keys (the picker
 * dialog's checked items): navbar/hero (if selected) go first, footer (if
 * selected) goes last, everything else is shuffled in between — each
 * wrapped in its own top-level section, ready to hand to
 * canvas.insertSections(). Purely additive: this only builds the node
 * array, it never touches existing page content itself. Unknown keys (or
 * an unknown theme key) are ignored/fall back rather than throwing, so a
 * stale selection never breaks generation.
 *
 * `themeKey` only affects the "Randomized Compositions" group — Essential
 * Components/Advanced Widgets keep their own existing default styling
 * (they're pre-built components, not generated from a palette). Pass
 * `themeKey={CUSTOM_THEME_KEY}` with a `customPalette` to use one exact
 * user-picked background/foreground/primary/secondary combo everywhere
 * instead of a preset theme's palette pool.
 */
export function generateRandomLayoutSections(selectedKeys: string[], themeKey: string = DEFAULT_THEME_KEY, customPalette?: Palette): CanvasNode[] {
	const selected = new Set(selectedKeys)
	const items = RANDOM_LAYOUT_CATALOG.filter((item) => selected.has(item.key))
	const activePalettes = themeKey === CUSTOM_THEME_KEY && customPalette
		? [customPalette]
		: (COLOR_THEMES.find((t) => t.key === themeKey) ?? COLOR_THEMES.find((t) => t.key === DEFAULT_THEME_KEY)!).palettes

	const navbar = items.filter((item) => item.role === "navbar")
	const hero = items.filter((item) => item.role === "hero")
	const footer = items.filter((item) => item.role === "footer")
	const middle = shuffle(items.filter((item) => !item.role))

	const ordered = [...navbar, ...hero, ...middle, ...footer]

	return ordered.map((item) => {
		const primitiveGenerate = PRIMITIVE_GENERATORS[item.key]
		const spec = primitiveGenerate ? primitiveGenerate(activePalettes) : item.generate()
		return wrapInSection(spec)
	})
}
