import type { CSSProperties } from "react"
import { EditorView, Prec } from "@uiw/react-codemirror"

// Theme colors for the Import HTML / Custom Code dialogs and their toolbar buttons.
// The Button primitive writes its `color` (default blue) as an inline style, so the
// theme has to be inline too - Tailwind classes like bg-primary lose to it.

/** Toolbar trigger - same look as the navbar Save button. */
export const TOOLBAR_TRIGGER_CLASS = "min-w-fit px-3 py-2 flex gap-2 justify-center items-center cursor-pointer font-semibold border border-primary text-primary rounded hover:bg-primary/10 outline-none focus-visible:ring-2 focus-visible:ring-primary"

export const primaryButtonStyle: CSSProperties = {
	backgroundColor: "rgb(var(--primary))",
	color: "rgb(var(--primary-foreground))",
}

export const outlineButtonStyle: CSSProperties = {
	backgroundColor: "transparent",
	borderWidth: 1,
	borderStyle: "solid",
	borderColor: "rgb(var(--primary) / 0.6)",
	color: "rgb(var(--primary))",
}

/** Editor surfaces from the app's theme tokens; syntax colors stay CodeMirror's own. */
export const codeEditorTheme = Prec.highest(EditorView.theme({
	"&": { backgroundColor: "rgb(var(--background))", color: "rgb(var(--foreground))" },
	".cm-gutters": { backgroundColor: "rgb(var(--muted))", color: "rgb(var(--muted-foreground))", borderRight: "1px solid rgb(var(--border))" },
	".cm-activeLine": { backgroundColor: "rgb(var(--primary) / 0.08)" },
	".cm-activeLineGutter": { backgroundColor: "rgb(var(--primary) / 0.15)", color: "rgb(var(--foreground))" },
	".cm-cursor, .cm-dropCursor": { borderLeftColor: "rgb(var(--primary))" },
	"&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "rgb(var(--primary) / 0.25) !important" },
	".cm-placeholder": { color: "rgb(var(--muted-foreground))" },
}))

/** A warning box that reads clearly in light and dark mode (amber, not red: red text is hard to read on the dark panels). */
export const WARNING_BOX_CLASS = "text-xs rounded-md border px-3 py-2 text-amber-900 bg-amber-100 border-amber-400 dark:text-amber-100 dark:bg-amber-400/15 dark:border-amber-300/50"
