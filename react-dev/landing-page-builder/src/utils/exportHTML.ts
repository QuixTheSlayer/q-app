import { RefObject } from "react";
import type { CanvasNode, PageScript } from "@/types/node.type";
import { pageScriptTag } from "@/utils/security/sandboxDocument";
import { JQUERY_INTEGRITY, JQUERY_SRC, usesJquery } from "@/utils/jquery.utils";
import { ID_FALLBACK_SCRIPT } from "@/utils/pageIds";

export interface ExportHtmlAssets {
  /** Animation keyframes/effects CSS (useAnimationCss). */
  animationCss?: string
  /** Per-breakpoint node overrides (useResponsiveCss). */
  responsiveCss?: string
  /** Class rules from root.css (useClassCss). */
  classCss?: string
  /** Imported page CSS, kept as written (root.plainCss). */
  plainCss?: string
  /** Generated class interactions script (useClassJs). */
  classJs?: string
  /** Imported page JS, kept as written (root.plainJS). */
  plainJS?: string
  /** The page's node tree - embedded so Import HTML can restore it exactly. */
  content?: CanvasNode
}

/** id of the <script type="application/json"> holding the exported page's node tree. */
export const PAGE_DATA_SCRIPT_ID = "judgify-page-data"

/** Reads the node tree embedded by exportHTML, or null for any other HTML. */
export function readEmbeddedPageData(doc: Document): CanvasNode | null {
  const text = doc.getElementById(PAGE_DATA_SCRIPT_ID)?.textContent
  if (!text) return null
  try {
    const data = JSON.parse(text)
    return data && typeof data === "object" && data.type === "container" && Array.isArray(data.children) ? data : null
  } catch {
    return null
  }
}

const JQUERY_SCRIPT = `<script src="${JQUERY_SRC}" integrity="${JQUERY_INTEGRITY}" crossorigin="anonymous"></script>`

// A literal "</style>" or "</script>" inside the code would end the tag early.
const safeStyle = (css: string) => css.replace(/<\/style/gi, "<\\/style")
const safeScript = (js: string) => js.replace(/<\/script/gi, "<\\/script")

export const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")


/** The `<html>` attributes of an export: lang, plus the imported page's own (handlers and style left out). */
export function htmlTagAttributes(htmlAttributes?: Record<string, string>): string {
  return Object.entries({ lang: "en", ...htmlAttributes })
    .filter(([name]) => /^[a-z][a-z0-9-]*$/i.test(name) && !/^(on.*|style|xmlns.*)$/i.test(name))
    .map(([name, value]) => ` ${name}="${escapeHtml(value)}"`).join("")
}

/** The standalone HTML document for a rendered page (see exportHTML). */
export function buildExportHtml(bodyHtml: string, title: string, assets: ExportHtmlAssets = {}): string {
  const { animationCss, responsiveCss, classCss, plainCss, classJs, plainJS, content } = assets

  // "<" escaped so nothing inside the JSON can close the <script> early.
  const pageData = content
    ? `<script type="application/json" id="${PAGE_DATA_SCRIPT_ID}">${JSON.stringify(content).replace(/</g, "\\u003c")}</script>`
    : ""

  // plainCss gets its own <style> so its @import rules stay first in that sheet.
  const styles = [animationCss, responsiveCss, classCss, plainCss]
    .filter((css): css is string => !!css?.trim())
    .map((css) => `<style>\n${safeStyle(css)}\n</style>`)
    .join("\n")

  // An imported page's own libraries/modules (before the code using them) and <html> attributes.
  const root = content as { pageScripts?: PageScript[]; htmlAttributes?: Record<string, string> } | undefined
  const pageScripts = root?.pageScripts ?? []
  const ownJquery = pageScripts.some((script) => /jquery/i.test(script.src ?? ""))
  const htmlAttrs = htmlTagAttributes(root?.htmlAttributes)

  const scripts = [
    plainJS && usesJquery(plainJS) && !ownJquery ? JQUERY_SCRIPT : "",
    ...pageScripts.map(pageScriptTag),
    classJs?.trim() ? `<script>\n${safeScript(classJs)}\n</script>` : "",
    // Imported ids carry an `lp-` prefix; scripts that build an id at runtime still find it.
    plainJS?.trim() ? `<script>\n${ID_FALLBACK_SCRIPT}\n${safeScript(plainJS)}\n</script>` : "",
  ].filter(Boolean).join("\n")

  return `<!DOCTYPE html>
<html${htmlAttrs}>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<script src="https://cdn.tailwindcss.com"></script>
${styles}
</head>
<body>
${bodyHtml}
${pageData}
${scripts}
</body>
</html>
`
}

/**
 * Exports the rendered preview as a standalone HTML file: the preview's DOM
 * plus every stylesheet and script the live page injects, so imported pages
 * keep their own CSS/JS. Scripts go at the end of <body>, so the page's own
 * DOMContentLoaded/load handlers fire normally. `assets.content` is embedded
 * as JSON so re-importing the file restores the exact node tree.
 *
 * @example
 * exportHTML(previewRef, 'landing-page-export', { animationCss, classCss, plainCss: root.plainCss })
 */
export const exportHTML = (contentRef: RefObject<HTMLDivElement>, filename: string = 'judgify-landingpage', assets: ExportHtmlAssets = {}) => {
  if (!contentRef.current) return
  const fullHtml = buildExportHtml(contentRef.current.innerHTML, filename, assets)

  const blob = new Blob([fullHtml], { type: "text/html" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = filename + ".html"
  a.click()

  URL.revokeObjectURL(url)
}
