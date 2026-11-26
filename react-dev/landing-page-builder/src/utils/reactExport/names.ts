import { isElement, type ElementNode, type NodeMap } from './types'

/** Classes that say nothing about what a part is. */
const GENERIC_CLASSES = new Set(['section', 'container', 'wrapper', 'wrap', 'inner', 'content', 'row', 'col', 'block', 'grid'])
const RESERVED = new Set(['App', 'React', 'Fragment', 'Component', 'Suspense', 'Main'])
const MAX_NAME = 28

/** "pricing-plans" -> "PricingPlans"; never starts with a digit. */
export function pascalCase(text: string): string {
	const name = text.split(/[^a-zA-Z0-9]+/).filter(Boolean).map((word) => word[0]!.toUpperCase() + word.slice(1)).join('')
	return /^[0-9]/.test(name) ? `Part${name}` : name
}

/** "PricingPlans" -> "pricingPlans" */
export const lowerFirst = (name: string) => name.charAt(0).toLowerCase() + name.slice(1)

const unprefixed = (name: string) => name.replace(/^lp-/, '')

/** Text of an element's subtree (for naming a part after its heading). */
function textOf(nodes: NodeMap, node: ElementNode): string {
	return node.children.map((id) => {
		const child = nodes[id]
		if (!child) return ''
		return child.kind === 'text' ? child.text : textOf(nodes, child)
	}).join(' ')
}

const LANDMARKS: Record<string, string> = { nav: 'Navbar', header: 'Header', footer: 'Footer' }
const HEADINGS = new Set(['h1', 'h2', 'h3', 'h4'])

/** The first landmark or heading inside a part (breadth first, a few levels down). */
function firstTelling(nodes: NodeMap, node: ElementNode): ElementNode | null {
	let level = [node]
	for (let depth = 0; depth < 6 && level.length; depth++) {
		const next: ElementNode[] = []
		for (const current of level) {
			for (const id of current.children) {
				const child = nodes[id]
				if (!isElement(child)) continue
				if (child.tag in LANDMARKS || HEADINGS.has(child.tag)) return child
				next.push(child)
			}
		}
		level = next
	}
	return null
}

/**
 * Names for parts and items. Builder classes are mostly Tailwind utilities
 * ("flex", "mt-4"), so a class only names a part when it is the page's own:
 * an imported page's `lp-` class, or a class with its own rule in the page.
 */
export function createNaming(userClasses: ReadonlySet<string> = new Set()) {
	const classUsable = (name: string) => {
		const plain = unprefixed(name)
		return Boolean(plain) && !GENERIC_CLASSES.has(plain) && (name.startsWith('lp-') || userClasses.has(name))
	}

	/** A name from the element's id or first own class, or null when it has neither. */
	function meaningfulName(node: ElementNode): string | null {
		const id = node.attrs.id
		if (id && !/^radix-|^[0-9a-f]{8}-/i.test(id)) {
			const fromId = pascalCase(unprefixed(id))
			if (fromId) return fromId.slice(0, MAX_NAME)
		}
		const first = (node.attrs.class ?? '').split(/\s+/).find(classUsable)
		const fromClass = first ? pascalCase(unprefixed(first)) : ''
		return fromClass ? fromClass.slice(0, MAX_NAME) : null
	}

	/** The most telling name for a part: id, own class, a landmark or heading inside it, else its tag. */
	function describeName(nodes: NodeMap, node: ElementNode): string {
		const own = meaningfulName(node)
		if (own) return own
		const inside = firstTelling(nodes, node)
		if (inside) {
			if (inside.tag in LANDMARKS) return LANDMARKS[inside.tag]!
			const words = textOf(nodes, inside).match(/[A-Za-z0-9]+/g)?.slice(0, 3).join(' ') ?? ''
			const fromHeading = pascalCase(words)
			if (fromHeading) return fromHeading.slice(0, MAX_NAME)
		}
		return node.tag in LANDMARKS ? LANDMARKS[node.tag]! : node.tag === 'div' ? 'Block' : pascalCase(node.tag)
	}

	return { meaningfulName, describeName }
}

export type Naming = ReturnType<typeof createNaming>

/**
 * Hands out unique component names, avoiding React's own names. If the
 * wanted name is taken, the alternative is tried (e.g. "Card" -> "PricingCard"),
 * then numbers (Hero2…).
 */
export function createNameRegistry() {
	const used = new Set<string>()
	const clean = (wanted: string) => (RESERVED.has(wanted) ? `${wanted}Section` : wanted || 'Part')
	return (wanted: string, alternative?: string): string => {
		const first = clean(wanted)
		const base = used.has(first) && alternative ? clean(alternative) : first
		let name = base
		for (let n = 2; used.has(name); n++) name = `${base}${n}`
		used.add(name)
		return name
	}
}

/** Words a prop can't be called (JavaScript keywords). */
const KEYWORDS = new Set(['break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'delete', 'do', 'else', 'export',
	'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super',
	'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'let', 'static', 'enum', 'await'])

/** Unique prop names inside one component (title, title2…). */
export function createPropNames() {
	const used = new Set<string>(['key', 'children'])
	return (wanted: string): string => {
		const safe = /^[a-zA-Z_$][\w$]*$/.test(wanted) ? wanted : 'value'
		const base = KEYWORDS.has(safe) ? `${safe}Value` : safe
		let name = base
		for (let n = 2; used.has(name); n++) name = `${base}${n}`
		used.add(name)
		return name
	}
}
