/** Buckets CSS selectors by the id, class or tag their last compound requires, so an element is only
 * tested against the selectors that could match it instead of every rule on the page. */

/** `null`: no usable key (always a candidate). `false`: can never match (left out). */
export type RuleKey = { kind: 'id' | 'class' | 'tag'; name: string } | null | false

export interface IndexedSelector<R> {
	rule: R
	selector: string
	/** Position in source order (rule, then selector), so candidates sort back into cascade order. */
	seq: number
}

export class RuleIndex<R extends { selectors: string[] }> {
	private ids = new Map<string, IndexedSelector<R>[]>()
	private classes = new Map<string, IndexedSelector<R>[]>()
	private tags = new Map<string, IndexedSelector<R>[]>()
	private any: IndexedSelector<R>[] = []

	constructor(rules: R[], keyOf: (selector: string) => RuleKey) {
		let seq = 0
		for (const rule of rules) {
			for (const selector of rule.selectors) {
				const entry = { rule, selector, seq: seq++ }
				const key = keyOf(selector)
				if (key === false) continue
				if (!key) { this.any.push(entry); continue }
				const map = key.kind === 'id' ? this.ids : key.kind === 'class' ? this.classes : this.tags
				const bucket = map.get(key.name)
				if (bucket) bucket.push(entry)
				else map.set(key.name, [entry])
			}
		}
	}

	/** A superset of the selectors that can match `el`, in source order. Callers still run the real match. */
	candidates(el: Element): IndexedSelector<R>[] {
		const out = this.any.slice()
		// Keys are lowercased: a page without a doctype is in quirks mode, where class and id match ignoring case.
		const id = this.ids.get(el.id.toLowerCase())
		if (id) out.push(...id)
		for (const cls of Array.from(el.classList)) {
			const bucket = this.classes.get(cls.toLowerCase())
			if (bucket) out.push(...bucket)
		}
		const tag = this.tags.get(el.tagName.toLowerCase())
		if (tag) out.push(...tag)
		return out.sort((a, b) => a.seq - b.seq)
	}
}

const IDENT_CHAR = /[\w-]|[^\x00-\x7f]/

/** The key for a selector as `el.matches()` reads it: an id, class or tag its last compound must have.
 * Escapes, namespaces and anything unclear give `null`, which stays a candidate for every element. */
export function selectorKey(selector: string): RuleKey {
	const s = selector.trim()
	let id = ''
	let cls = ''
	let tag = ''
	let depth = 0
	let quote = ''
	let atStart = true
	const identEnd = (from: number) => {
		let j = from
		while (j < s.length && IDENT_CHAR.test(s[j])) j++
		return j
	}
	for (let i = 0; i < s.length;) {
		const c = s[i]
		if (c === '\\') return null
		if (quote) {
			if (c === quote) quote = ''
			i++
			continue
		}
		if (c === '"' || c === "'") { quote = c; i++; continue }
		if (c === '(' || c === '[') { depth++; i++; continue }
		if (c === ')' || c === ']') { depth--; i++; continue }
		if (depth > 0) { i++; continue }
		if (c === '|') return null
		if (/[\s>+~]/.test(c)) {
			// A combinator: only the compound after the last one has to match the element.
			id = cls = tag = ''
			atStart = true
			i++
			continue
		}
		if (c === '#' || c === '.') {
			const end = identEnd(i + 1)
			const name = s.slice(i + 1, end)
			if (!name) return null
			if (c === '#') id ||= name
			else cls ||= name
			i = end
			atStart = false
			continue
		}
		if (atStart && /[a-zA-Z]/.test(c)) {
			const end = identEnd(i)
			tag = s.slice(i, end)
			i = end
			atStart = false
			continue
		}
		atStart = false
		i++
	}
	if (depth !== 0 || quote) return null
	if (id) return { kind: 'id', name: id.toLowerCase() }
	if (cls) return { kind: 'class', name: cls.toLowerCase() }
	// A tag with capitals may be an SVG name, which a type selector matches case-sensitively.
	if (tag && tag === tag.toLowerCase()) return { kind: 'tag', name: tag }
	return null
}
