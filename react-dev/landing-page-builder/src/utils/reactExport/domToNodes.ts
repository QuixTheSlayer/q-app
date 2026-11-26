import type { ElementNode, NodeMap } from './types'

// Not rendered by React: the page's code goes to public/scripts instead.
const SKIP_TAGS = new Set(['script', 'noscript', 'template'])

/**
 * Reads the rendered page's markup (what Export HTML writes) into a node map.
 * Dropped on the way: handlers (on*), empty ids, and `data-id`s that no CSS or
 * script points at - they differ on every node and would stop repeated cards
 * from becoming one component.
 */
export function parseRenderedHtml(html: string, keepDataId: (value: string) => boolean): { nodes: NodeMap; rootId: string } {
	const doc = new DOMParser().parseFromString(`<!doctype html><html><body>${html}</body></html>`, 'text/html')
	const nodes: NodeMap = {}
	let counter = 0
	const nextId = () => `n${++counter}`

	const convert = (parentId: string, source: Node): string | null => {
		if (source.nodeType === 3) {
			const id = nextId()
			nodes[id] = { kind: 'text', id, parentId, text: source.textContent ?? '' }
			return id
		}
		if (source.nodeType !== 1) return null
		const el = source as Element
		const tag = el.localName
		if (SKIP_TAGS.has(tag)) return null
		const attrs: Record<string, string> = {}
		for (const { name, value } of Array.from(el.attributes)) {
			if (/^on/i.test(name)) continue
			if (name === 'id' && !value) continue
			if (name === 'data-id' && !keepDataId(value)) continue
			attrs[name] = value
		}
		const id = nextId()
		const node: ElementNode = { kind: 'element', id, parentId, tag, attrs, children: [] }
		nodes[id] = node
		for (const child of Array.from(el.childNodes)) {
			const childId = convert(id, child)
			if (childId) node.children.push(childId)
		}
		return id
	}

	const body: ElementNode = { kind: 'element', id: 'root', parentId: null, tag: 'body', attrs: {}, children: [] }
	nodes.root = body
	for (const child of Array.from(doc.body.childNodes)) {
		const childId = convert('root', child)
		if (childId) body.children.push(childId)
	}
	return { nodes, rootId: 'root' }
}
