import { describe, expect, it } from 'vitest'
import { sanitizePageJs } from '@/utils/security/sanitizePageJs'

// Sample page code only. It is parsed and compared as text and never run.
const clean = (code: string) => sanitizePageJs(code).code

describe('sanitizePageJs', () => {
	it('keeps ordinary page code as it is', () => {
		const code = 'document.querySelector("a").addEventListener("click", function () { document.body.classList.toggle("on") })\nfor (var i = 0; i < 3; i++) { x(i) }'
		expect(sanitizePageJs(code)).toEqual({ code, removed: [] })
	})

	it('removes network calls, in every spelling', () => {
		for (const code of ['fetch("/a")', 'window.fetch("/a")', 'window["fetch"]("/a")', 'new XMLHttpRequest()', 'new WebSocket("wss://x")', 'navigator.sendBeacon("/a")', 'const f = fetch; f("/a")', 'import("https://x/y.js")']) {
			expect(clean(`keep(); ${code}; keep2()`), code).not.toMatch(/fetch|XMLHttpRequest|WebSocket|sendBeacon|import\(/)
		}
		expect(clean('keep(); fetch("/a").then(r => r.json()); keep2()')).toBe('keep(); ; keep2()')
	})

	it('removes dialogs, eval and new Function', () => {
		for (const code of ['alert(1)', 'window.alert(1)', 'confirm("x")', 'prompt("x")', 'eval("1")', 'new Function("return 1")()', 'document.write("<b>")', 'window.open("https://x")']) {
			expect(clean(`keep(); ${code}`), code).toBe('keep(); ;')
		}
	})

	it('removes loops that never end, but not ones with a way out', () => {
		for (const code of ['while (true) {}', 'for (;;) {}', 'do { x() } while (1)', 'while (!0) { x() }']) {
			expect(clean(`a(); ${code}\nb()`), code).toBe('a(); ;\nb()')
		}
		const exits = 'while (true) { if (done()) break }'
		expect(clean(exits)).toBe(exits)
		expect(clean('for (;;) { return }')).toBe('for (;;) { return }')
	})

	it('removes form posts, but keeps same-site actions', () => {
		expect(clean('form.submit()')).toBe(';')
		expect(clean('form.requestSubmit()')).toBe(';')
		expect(clean('form.action = "https://evil.test/post"')).toBe(';')
		expect(clean('form.action = url')).toBe(';')
		expect(clean('form.setAttribute("action", "//evil.test")')).toBe(';')
		expect(clean('form.action = "/thanks"')).toBe('form.action = "/thanks"')
	})

	it('takes out the whole statement that holds the call, inside functions too', () => {
		const result = sanitizePageJs('function send() { var a = 1; fetch("/x"); return a }\nsend()')
		expect(result.code).toBe('function send() { var a = 1; ; return a }\nsend()')
		expect(result.removed).toEqual(['fetch (line 1)'])
	})

	it('drops code it cannot parse', () => {
		expect(sanitizePageJs('if (').code).toBe('')
		expect(sanitizePageJs('').removed).toEqual([])
	})
})
