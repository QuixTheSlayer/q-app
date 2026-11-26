import { parse, type Node } from 'acorn'

export interface SanitizedJs {
	code: string
	/** One short line per statement that was taken out. */
	removed: string[]
}

// Globals that talk to the network, open dialogs or build code from text.
const BLOCKED_GLOBALS = new Set(['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'eval', 'Function', 'importScripts', 'alert', 'confirm', 'prompt'])
// Methods that are blocked on any object.
const BLOCKED_METHODS = new Set(['submit', 'requestSubmit', 'sendBeacon'])
const WINDOW_LIKE = new Set(['window', 'self', 'globalThis', 'top', 'parent'])
const WINDOW_METHODS = new Set(['open', 'postMessage'])

type AnyNode = Node & Record<string, any>

const isStatement = (node: AnyNode) => /(Statement|Declaration)$/.test(node.type) && node.type !== 'BlockStatement'

const nameOf = (node: AnyNode | null | undefined): string | null =>
	!node ? null : node.type === 'Identifier' ? node.name : node.type === 'Literal' && typeof node.value === 'string' ? node.value : null

/** The property a member expression reads, for `a.b` and `a['b']`. */
const propertyOf = (node: AnyNode): string | null => (node.computed ? (node.property.type === 'Literal' ? nameOf(node.property) : null) : nameOf(node.property))

/** True for a test that is always truthy, such as `true`, `1` or `!0`, or that is missing. */
function alwaysTrue(node: AnyNode | null): boolean {
	if (!node) return true
	if (node.type === 'Literal') return !!node.value
	if (node.type === 'UnaryExpression' && node.operator === '!') return alwaysFalse(node.argument)
	return false
}
function alwaysFalse(node: AnyNode): boolean {
	if (node.type === 'Literal') return !node.value
	if (node.type === 'UnaryExpression' && node.operator === '!') return alwaysTrue(node.argument)
	return false
}

function children(node: AnyNode): AnyNode[] {
	const out: AnyNode[] = []
	for (const key of Object.keys(node)) {
		if (key === 'type' || key === 'start' || key === 'end') continue
		const value = node[key]
		if (Array.isArray(value)) value.forEach((item) => item && typeof item.type === 'string' && out.push(item))
		else if (value && typeof value.type === 'string') out.push(value)
	}
	return out
}

/** Looks in a loop body for a way out (break, return or throw), without going into nested functions. */
function hasExit(node: AnyNode | null | undefined): boolean {
	if (!node || typeof node.type !== 'string') return false
	if (node.type === 'BreakStatement' || node.type === 'ReturnStatement' || node.type === 'ThrowStatement') return true
	if (/Function/.test(node.type)) return false
	return children(node).some(hasExit)
}

/** A string that stays on this site: a path, a query or a fragment, never a scheme or `//host`. */
function isRelativeLiteral(node: AnyNode | undefined): boolean {
	if (!node || node.type !== 'Literal' || typeof node.value !== 'string') return false
	return !/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(node.value.trim())
}

/** Returns why a node is not allowed, or null when it is fine. */
function problem(node: AnyNode): string | null {
	switch (node.type) {
		case 'Identifier':
			return BLOCKED_GLOBALS.has(node.name) ? node.name : null
		case 'ImportExpression':
			return 'dynamic import'
		case 'MemberExpression': {
			const prop = propertyOf(node)
			if (!prop) return null
			if (BLOCKED_METHODS.has(prop)) return `.${prop}()`
			const object = nameOf(node.object)
			if (object && WINDOW_LIKE.has(object) && (BLOCKED_GLOBALS.has(prop) || WINDOW_METHODS.has(prop))) return `${object}.${prop}`
			if (object === 'document' && (prop === 'write' || prop === 'writeln')) return `document.${prop}`
			return null
		}
		case 'AssignmentExpression': {
			// form.action = 'https://elsewhere' sends a form to another site.
			const left = node.left as AnyNode
			return left.type === 'MemberExpression' && propertyOf(left) === 'action' && !isRelativeLiteral(node.right) ? 'form action' : null
		}
		case 'CallExpression': {
			// el.setAttribute('action', url)
			const callee = node.callee as AnyNode
			const isAction = callee.type === 'MemberExpression' && propertyOf(callee) === 'setAttribute' && nameOf(node.arguments[0])?.toLowerCase() === 'action'
			return isAction && !isRelativeLiteral(node.arguments[1]) ? 'form action' : null
		}
		case 'WhileStatement':
		case 'DoWhileStatement':
		case 'ForStatement':
			return alwaysTrue(node.test) && !hasExit(node.body) ? 'infinite loop' : null
		default:
			return null
	}
}

/**
 * Takes out the statements of page JS that could send data away, block the page or pop dialogs: network calls,
 * alert/confirm/prompt, eval and new Function, form posts, document.write and loops that never end.
 * Each is replaced with `;` so the rest of the script still runs. JS that cannot be parsed is dropped completely.
 * It reads the code as text, so it is a safety net and not a sandbox.
 */
export function sanitizePageJs(source: string | null | undefined): SanitizedJs {
	if (!source?.trim()) return { code: '', removed: [] }

	let ast: AnyNode
	try {
		ast = parse(source, { ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true }) as AnyNode
	} catch {
		return { code: '', removed: ['script has a syntax error'] }
	}

	const ranges: { start: number; end: number; why: string }[] = []
	const visit = (node: AnyNode, statement: AnyNode | null) => {
		const current = isStatement(node) ? node : statement
		const why = problem(node)
		if (why) {
			if (current) ranges.push({ start: current.start, end: current.end, why })
			return
		}
		children(node).forEach((child) => visit(child, current))
	}
	visit(ast, null)

	// Keep the outermost ranges only, then cut from the end so earlier offsets stay valid.
	ranges.sort((a, b) => a.start - b.start || b.end - a.end)
	const kept: typeof ranges = []
	for (const range of ranges) if (!kept.length || range.start >= kept[kept.length - 1].end) kept.push(range)

	let code = source
	for (const { start, end } of [...kept].reverse()) code = code.slice(0, start) + ';' + code.slice(end)
	return { code, removed: kept.map(({ start, why }) => `${why} (line ${source.slice(0, start).split('\n').length})`) }
}
