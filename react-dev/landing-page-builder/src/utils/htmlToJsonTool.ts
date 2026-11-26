import type { CanvasNode } from '@/types/node.type'
import { htmlToJsonTree } from '@/utils/htmlToCanvasNodes'
import { protectPageCode } from '@/utils/security/codeCrypto'
import { ConvertError } from '@/utils/security/convertCode'

/**
 * `page` is what the editor saves as page_content: the converted root with the page CSS and JavaScript on it.
 * `full` is everything the importer returned, with its notes.
 */
export type HtmlJsonShape = 'page' | 'full'

export interface HtmlJsonStats {
  /** Sections directly under the root. */
  sections: number
  /** Every node in the tree. */
  nodes: number
  cssBytes: number
  jsBytes: number
  /** Tags that had no node equivalent and were dropped. */
  skipped: string[]
  /** Linked files that could not be included. */
  external: string[]
}

export interface HtmlJsonResult {
  output: string
  stats: HtmlJsonStats
}

const countNodes = (node: unknown): number => {
  if (!node || typeof node !== 'object') return 0
  const children = (node as { children?: unknown }).children
  return 1 + (Array.isArray(children) ? children.reduce<number>((sum, child) => sum + countNodes(child), 0) : 0)
}

/**
 * Converts pasted HTML the way Import HTML does (same importer), and returns the JSON. The optional encryption gives
 * the form that is sent when a page is saved, with the CSS, JavaScript and SVG encrypted.
 */
export async function convertHtmlToJson(html: string, options: { shape?: HtmlJsonShape; encrypt?: boolean; pretty?: boolean } = {}): Promise<HtmlJsonResult> {
  if (!html.trim()) throw new ConvertError('Paste some HTML to convert.')

  let imported: ReturnType<typeof htmlToJsonTree>
  try {
    imported = htmlToJsonTree(html)
  } catch {
    throw new ConvertError('The converter could not read that HTML.')
  }
  if (imported.root.children.length === 0) throw new ConvertError('Nothing could be converted: the HTML has no visible content.')

  const page = { ...imported.root, plainCss: imported.css, plainJS: imported.js } as CanvasNode & { plainCss: string; plainJS: string }
  const shaped = options.shape === 'full' ? { root: page, css: imported.css, js: imported.js, skipped: imported.skipped, external: imported.external } : page
  const result = options.encrypt ? await protectPageCode(shaped) : shaped

  return {
    output: JSON.stringify(result, null, options.pretty === false ? undefined : 2),
    stats: {
      sections: imported.root.children.length,
      nodes: countNodes(imported.root),
      cssBytes: new TextEncoder().encode(imported.css).length,
      jsBytes: new TextEncoder().encode(imported.js).length,
      skipped: imported.skipped,
      external: imported.external,
    },
  }
}
