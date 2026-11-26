import { readFileSync } from 'fs'

// Real rich text documents from the builder's sample pages (db.json), as TipTap JSON objects.
export function loadCorpus(): Record<string, unknown>[] {
	const db = JSON.parse(readFileSync('db.json', 'utf8'))
	const docs: Record<string, unknown>[] = []
	const visit = (value: unknown) => {
		if (!value || typeof value !== 'object') return
		const obj = value as Record<string, unknown>
		const children = obj.children
		if (typeof children === 'string' && children.startsWith('{"type":"doc"')) {
			try { docs.push(JSON.parse(children)) } catch { /* not a document */ }
		} else if (children && typeof children === 'object' && !Array.isArray(children) && (children as { type?: string }).type === 'doc') {
			docs.push(children as Record<string, unknown>)
		}
		for (const v of Object.values(obj)) visit(v)
	}
	for (const page of db.get_landingpage_data ?? []) {
		const content = typeof page.page_content === 'string' ? JSON.parse(page.page_content) : page.page_content
		visit(content)
	}
	// The sample pages repeat the same texts; each distinct document is tested once.
	const unique = new Map(docs.map((d) => [JSON.stringify(d), d]))
	return [...unique.values()]
}
