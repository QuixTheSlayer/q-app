import { AccordionNode, CanvasNode, IconBlockNode, SeparatorsNode } from "@/types/node.type";
import { buildIconBlockChildren } from "@/utils/iconBlockSlots";
import { buildSeparatorChildren } from "@/utils/separatorSlots";
import { generateNewNode } from "@/utils/canvas.utils";

/**
 * Builders for composing node trees out of the app's generic content types
 * (text/image/button/block/accordion). Nodes built here are real focusable
 * CanvasNodes, so clicking one opens its normal property panel.
 */

export function textNode(text: string, style: React.CSSProperties = {}, align: "left" | "center" | "right" = "left"): CanvasNode {
	// JSON.stringify so quotes/newlines don't break the embedded tiptap JSON.
	const escapedText = JSON.stringify(text)
	// The text mark's font wins over the node style, so a style fontFamily has to go into the mark too.
	const family = JSON.stringify(typeof style.fontFamily === "string" ? style.fontFamily : "Arial, sans-serif")
	return generateNewNode("text", {
		style: { textAlign: align, ...style },
		children: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":"${align}"},"content":[{"type":"text","marks":[{"type":"textStyle","attrs":{"color":"","fontFamily":${family},"fontSize":"1em"}}],"text":${escapedText}}]}]}`,
	})
}

/** Merges a style patch into a text node and, when the patch names a font family, writes it into the text marks too. */
export function applyTextStyle(node: CanvasNode, patch: React.CSSProperties): CanvasNode {
	const next = { ...node, style: { ...node.style, ...patch } } as CanvasNode
	return typeof patch.fontFamily === "string" ? withFontFamily(next, patch.fontFamily) : next
}

/** Sets the font family on every text mark of a text node (keeps copy and other marks). */
export function withFontFamily(node: CanvasNode, family: string): CanvasNode {
	const raw = (node as { children?: unknown }).children
	if (typeof raw !== "string") return node
	try {
		const doc = JSON.parse(raw)
		const visit = (n: { marks?: { type: string; attrs?: Record<string, unknown> }[]; content?: unknown[] }) => {
			n.marks?.forEach((mark) => { if (mark.type === "textStyle") mark.attrs = { ...mark.attrs, fontFamily: family } })
			;(n.content as typeof n[] | undefined)?.forEach(visit)
		}
		visit(doc)
		return { ...node, children: JSON.stringify(doc) } as CanvasNode
	} catch {
		return node
	}
}

/** Replaces a text node's copy, keeping its id, style and tiptap marks.
 * Returns the node untouched if its children aren't parseable tiptap JSON. */
export function withTextContent(node: CanvasNode, text: string): CanvasNode {
	const raw = (node as { children?: unknown }).children
	if (typeof raw !== "string") return node
	try {
		const doc = JSON.parse(raw)
		const paragraph = doc?.content?.[0]
		const run = paragraph?.content?.[0]
		if (!run || run.type !== "text") return node
		run.text = text
		paragraph.content = [run]
		return { ...node, children: JSON.stringify(doc) } as CanvasNode
	} catch {
		return node
	}
}

export function headingNode(text: string, style: React.CSSProperties = {}): CanvasNode {
	return textNode(text, { fontSize: "1.75em", fontWeight: "bold", ...style }, "center")
}

/** No `url` keeps NEW_NODES.image's local placeholder, so templates never
 * depend on the network for their default look. */
export function imageNode(url: string | undefined, style: React.CSSProperties = {}, alt = "image"): CanvasNode {
	const overrides: Parameters<typeof generateNewNode>[1] = {
		style: { objectFit: "cover", borderRadius: "0.5em", ...style },
	}
	if (url) {
		// generateNewNode's attribute union spans all node kinds, so it can't
		// narrow to image-only `src`/`alt` here.
		overrides.attributes = { src: url, alt } as typeof overrides.attributes
		overrides.children = url
	}
	return generateNewNode("image", overrides)
}

export function buttonNode(label: string, style: React.CSSProperties = {}, href = ""): CanvasNode {
	return generateNewNode("button", { style, children: label, attributes: { href } })
}

export function blockNode(children: CanvasNode[], style: React.CSSProperties = {}): CanvasNode {
	return generateNewNode("block", { children, style })
}

/**
 * Accordion with the header as a real node at children[0], body after it.
 * Uses textNode() so children get fresh ids — NEW_NODES hardcodes id "text".
 */
export function generateAccordionNode(header = "Accordion Header", body = "Text"): CanvasNode {
	return {
		...generateNewNode("accordion", {
			children: [
				textNode(header, { fontWeight: "600" }),
				textNode(body),
			],
		}),
		header,
		headerIsNode: true,
	} as CanvasNode
}

export function accordionItemNode(question: string, answer: string): CanvasNode {
	return generateAccordionNode(question, answer)
}

/** Icon block whose item titles/descriptions are real text nodes. */
export function generateIconBlockNode(): CanvasNode {
	const base = generateNewNode("iconBlock") as IconBlockNode
	return { ...base, children: buildIconBlockChildren(base) } as CanvasNode
}

/** Separator whose label is a real text node at children[0]. */
export function generateSeparatorsNode(): CanvasNode {
	const base = generateNewNode("separators") as SeparatorsNode
	return { ...base, children: buildSeparatorChildren(base) } as CanvasNode
}

/** Tab node whose panels are real block children — see TabNode.childrenAreTabs. */
export function generateTabNode(labels = ["Tab 1", "Tab 2"]): CanvasNode {
	return {
		...generateNewNode("tab", {
			children: labels.map((label) => ({
				...blockNode([textNode(`${label} content`)], { width: "100%", padding: "1em" }),
				name: label,
			})),
		}),
		tabs: [],
		childrenAreTabs: true,
	} as CanvasNode
}

// Color themes, shared by randomLayoutGenerator.ts and readyMadeTemplates.ts.

/** Matched bg/fg colors — never pick them independently. `primary` is the
 * button accent, falling back to `text`. */
export interface Palette { bg: string; text: string; muted: string; primary?: string }

/** Button background, falling back to `text` for palettes with no accent. */
export function accentOf(p: Palette): string {
	return p.primary ?? p.text
}

/** Default look on insert — a clean neutral, not a random theme. */
export const DEFAULT_TEMPLATE_PALETTE: Palette = { bg: "#ffffff", text: "#111827", muted: "#6b7280", primary: "#2563eb" }

export interface ColorTheme {
	key: string
	/** i18n key under insert.json's `randomLayoutDialog.theme.*`. */
	labelKey: string
	/** Representative color for the swatch in a picker UI. */
	swatch: string
	palette: Palette
}

/** One palette per theme, since a picker needs a deterministic choice per
 * click. `mixed`/`custom` are omitted — they only make sense when randomizing. */
export const READY_MADE_TEMPLATE_THEMES: ColorTheme[] = [
	{ key: "neutral", labelKey: "neutral", swatch: "#475569", palette: { bg: "#ffffff", text: "#0f172a", muted: "#475569" } },
	{ key: "midnight", labelKey: "midnight", swatch: "#0f172a", palette: { bg: "#0f172a", text: "#f8fafc", muted: "#cbd5e1" } },
	{ key: "ocean", labelKey: "ocean", swatch: "#0369a1", palette: { bg: "#eef6ff", text: "#0c4a6e", muted: "#0369a1" } },
	{ key: "sunset", labelKey: "sunset", swatch: "#c2410c", palette: { bg: "#fff7ed", text: "#7c2d12", muted: "#c2410c" } },
	{ key: "forest", labelKey: "forest", swatch: "#15803d", palette: { bg: "#f0fdf4", text: "#14532d", muted: "#15803d" } },
	{ key: "violet", labelKey: "violet", swatch: "#4338ca", palette: { bg: "#eef2ff", text: "#1e1b4b", muted: "#4338ca" } },
]

/**
 * Recolors an already-placed Ready Made Template tree in place, without
 * rebuilding its structure — so switching the "Color Theme" picker never
 * discards any manual edits already made to individual nodes (text content,
 * sizes, extra cards someone added, etc.), only their color-relevant style
 * keys. Heuristic, matching how every generator below already assigns
 * colors structurally: within each sibling group (the top-level template,
 * or each block/card's own children), the first `text` node is the
 * heading/title (gets `palette.text`), every other `text` node is body
 * copy (gets `palette.muted`); every `button` gets a solid `accentOf(
 * palette)` fill; `accordion` nodes recurse into their own children the
 * same way. `image`/other node types are left untouched.
 */
export function repaintTemplateTree(nodes: CanvasNode[], palette: Palette): CanvasNode[] {
	let textIndex = 0
	return nodes.map((node) => {
		if (node.type === "content") {
			if (node.contentType === "text") {
				textIndex++
				return { ...node, style: { ...node.style, color: textIndex === 1 ? palette.text : palette.muted } }
			}
			if (node.contentType === "button") {
				return { ...node, style: { ...node.style, backgroundColor: accentOf(palette), color: palette.bg } }
			}
			if (node.contentType === "accordion") {
				const accordion = node as AccordionNode
				return { ...accordion, children: repaintTemplateTree(accordion.children, palette) }
			}
			return node
		}
		if (node.type === "container") {
			return { ...node, children: repaintTemplateTree(node.children, palette) }
		}
		return node
	})
}
