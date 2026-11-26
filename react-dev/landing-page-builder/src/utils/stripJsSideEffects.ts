/**
 * Removes alert(), console.*() and network calls (fetch, axios, $.ajax, sendBeacon,
 * XMLHttpRequest / WebSocket / EventSource) from pasted page JS. A call in the middle of an
 * expression becomes `void 0`; one on its own line is dropped, with its `.then()/.catch()` chain.
 */

const IDENT = /[\w$]/
const CALL = /(?:(?:window|globalThis|self)\s*\.\s*)?(?:alert|fetch|axios(?:\s*\.\s*[A-Za-z]+)?|console\s*\.\s*[A-Za-z]+|navigator\s*\.\s*sendBeacon|(?:\$|jQuery)\s*\.\s*(?:ajax|get|post|getJSON|getScript))\s*\(/y
const CONSTRUCTOR = /new\s+(?:XMLHttpRequest|WebSocket|EventSource)\s*\(/y
const CHAIN = /\s*\.\s*[A-Za-z_$][\w$]*/y
const NETWORK_STUB = '({ open() {}, send() {}, close() {}, abort() {}, setRequestHeader() {}, addEventListener() {}, removeEventListener() {} })'
const REGEX_AFTER = '(,=:[!&|?{};+-*%<>~^'

function skipQuoted(src: string, i: number): number {
	const quote = src[i]
	for (let j = i + 1; j < src.length; j++) {
		if (src[j] === '\\') j++
		else if (src[j] === quote) return j + 1
	}
	return src.length
}

function skipTemplate(src: string, i: number): number {
	for (let j = i + 1; j < src.length; j++) {
		if (src[j] === '\\') j++
		else if (src[j] === '`') return j + 1
		else if (src[j] === '$' && src[j + 1] === '{') {
			const end = matchClose(src, j + 1)
			if (end < 0) return src.length
			j = end - 1
		}
	}
	return src.length
}

function skipRegex(src: string, i: number): number {
	let inClass = false
	for (let j = i + 1; j < src.length; j++) {
		const ch = src[j]
		if (ch === '\\') j++
		else if (ch === '\n') return i + 1
		else if (ch === '[') inClass = true
		else if (ch === ']') inClass = false
		else if (ch === '/' && !inClass) return j + 1
	}
	return i + 1
}

/** End of a string, template, comment or regex literal starting at i, or -1 if i starts none. */
function skipLiteral(src: string, i: number, last: string): number {
	const ch = src[i]
	if (ch === '"' || ch === "'") return skipQuoted(src, i)
	if (ch === '`') return skipTemplate(src, i)
	if (ch !== '/') return -1
	if (src[i + 1] === '/') {
		const end = src.indexOf('\n', i)
		return end < 0 ? src.length : end
	}
	if (src[i + 1] === '*') {
		const end = src.indexOf('*/', i + 2)
		return end < 0 ? src.length : end + 2
	}
	return !last || REGEX_AFTER.includes(last) ? skipRegex(src, i) : -1
}

/** Index after the bracket that closes the one at `open`, or -1 when it never closes. */
function matchClose(src: string, open: number): number {
	let depth = 0
	let last = ''
	for (let i = open; i < src.length; i++) {
		const skipped = skipLiteral(src, i, last)
		if (skipped > i) {
			i = skipped - 1
			last = 'x'
			continue
		}
		const ch = src[i]
		if ('([{'.includes(ch)) depth++
		else if (')]}'.includes(ch) && --depth === 0) return i + 1
		if (!/\s/.test(ch)) last = ch
	}
	return -1
}

/** End of a removed call plus the `.then(...)`, `.catch(...)`, `.json()` chain hanging off it. */
function skipChain(src: string, from: number): number {
	let end = from
	for (;;) {
		CHAIN.lastIndex = end
		const link = CHAIN.exec(src)
		if (!link) return end
		end += link[0].length
		const open = src.slice(end).search(/\S/)
		if (open >= 0 && src[end + open] === '(') {
			const close = matchClose(src, end + open)
			if (close < 0) return end
			end = close
		}
	}
}

export function stripJsSideEffects(js: string): string {
	let out = ''
	let last = ''
	let i = 0
	while (i < js.length) {
		const skipped = skipLiteral(js, i, last)
		if (skipped > i) {
			out += js.slice(i, skipped)
			last = 'x'
			i = skipped
			continue
		}
		const ch = js[i]
		if (/[A-Za-z_$]/.test(ch) && !IDENT.test(js[i - 1] ?? '') && js[i - 1] !== '.') {
			CONSTRUCTOR.lastIndex = i
			if (CONSTRUCTOR.test(js)) {
				const close = matchClose(js, CONSTRUCTOR.lastIndex - 1)
				if (close > 0) {
					out += NETWORK_STUB
					last = ')'
					i = close
					continue
				}
			}
			CALL.lastIndex = i
			if (CALL.test(js)) {
				const close = matchClose(js, CALL.lastIndex - 1)
				if (close > 0) {
					const end = skipChain(js, close)
					const before = out.trimEnd().slice(-1)
					const rest = js.slice(end).match(/^[ \t]*(;)?[ \t]*(?=\r?\n|\}|$)/)
					if ((!before || ';{}'.includes(before)) && rest) {
						last = before
						i = end + rest[0].length
					} else {
						out += 'void 0'
						last = '0'
						i = end
					}
					continue
				}
			}
		}
		out += ch
		if (!/\s/.test(ch)) last = ch
		i++
	}
	return out
}
