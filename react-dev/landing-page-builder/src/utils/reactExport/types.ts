// A light copy of the rendered page that the JSX writer reads.

export type ElementNode = { kind: 'element'; id: string; parentId: string | null; tag: string; attrs: Record<string, string>; children: string[] }
export type TextNode = { kind: 'text'; id: string; parentId: string | null; text: string }
export type ExportNode = ElementNode | TextNode
export type NodeMap = Record<string, ExportNode>

export const isElement = (node: ExportNode | undefined): node is ElementNode => node?.kind === 'element'

export const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])

// Spaces, tabs and line breaks only. A non-breaking space is real content, so trim() and \s are not used.
export const isBlankText = (text: string) => /^[ \t\r\n\f]*$/.test(text)
export const collapseSpaces = (text: string) => text.replace(/[ \t\r\n\f]+/g, ' ')

/** Elements with a text child that is not just spacing. */
export const hasRealText = (nodes: NodeMap, node: ElementNode) =>
	node.children.some((id) => nodes[id]?.kind === 'text' && !isBlankText((nodes[id] as TextNode).text))
