// Moves everything that points at one node id to another id (a restored export keeps this page's root id).

// A generated id: hyphenated, with a digit, e.g. a UUID. Safe to find inside any text.
const GENERATED_ID = /^(?=.*\d)[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+$/

// Fields whose value is a type name that can equal an id word (contentType "root").
const TYPE_FIELDS = new Set(['contentType', 'type', 'layout', 'tag'])

export function remapNodeId<T>(tree: T, from: string, to: string): T {
	if (!from || from === to) return JSON.parse(JSON.stringify(tree))
	// A generated id appears inside css/animation text too, so replace it everywhere.
	if (GENERATED_ID.test(from)) return JSON.parse(JSON.stringify(tree).split(from).join(to))
	// A plain word like "root" is only an id where a whole value equals it, never inside other text or types.
	return JSON.parse(JSON.stringify(tree), (key, value) => (value === from && !TYPE_FIELDS.has(key) ? to : value))
}
