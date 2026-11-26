import { describe, it, expect } from 'vitest'
import { stripJsSideEffects } from '@/utils/stripJsSideEffects'
import { htmlToJsonTree } from '@/utils/htmlToCanvasNodes'

describe('stripJsSideEffects', () => {
	it('drops alert and console statements', () => {
		const out = stripJsSideEffects("const a = 1;\nalert('hi');\nconsole.log('x', a);\nconst b = 2;")
		expect(out).not.toMatch(/alert|console/)
		expect(out).toContain('const a = 1;')
		expect(out).toContain('const b = 2;')
	})

	it('drops a fetch chain with nested brackets and strings', () => {
		const out = stripJsSideEffects("fetch('/api?x=)', { method: 'POST' })\n\t.then(r => r.json())\n\t.catch(e => console.error(e));\nrun();")
		expect(out).not.toMatch(/fetch|then|console/)
		expect(out).toContain('run();')
	})

	it('replaces calls inside expressions with void 0', () => {
		expect(stripJsSideEffects('if (ok) alert(1); else go();')).toBe('if (ok) void 0; else go();')
		expect(stripJsSideEffects('const r = await fetch(u);')).toBe('const r = await void 0;')
		expect(stripJsSideEffects('btn.onclick = () => console.log(1);')).toBe('btn.onclick = () => void 0;')
	})

	it('handles window.*, axios, $.ajax and sendBeacon', () => {
		const out = stripJsSideEffects("window.alert(1);\naxios.post('/a', d).then(x);\n$.ajax({ url: '/b' });\nnavigator.sendBeacon('/c');\nkeep();")
		expect(out).not.toMatch(/alert|axios|ajax|sendBeacon/)
		expect(out).toContain('keep();')
	})

	it('stubs XMLHttpRequest, WebSocket and EventSource', () => {
		const out = stripJsSideEffects("const x = new XMLHttpRequest();\nx.open('GET', '/a');\nx.send();")
		expect(out).not.toContain('XMLHttpRequest')
		expect(() => new Function(out)()).not.toThrow()
		expect(stripJsSideEffects("new WebSocket('wss://a')")).not.toContain('WebSocket')
	})

	it('leaves strings, comments, regexes and look-alike names alone', () => {
		const code = "const s = 'alert(1)';\n// fetch(x)\nconst r = /fetch\(/;\nmyfetch(1); obj.fetch(2); alerts(3);"
		expect(stripJsSideEffects(code)).toBe(code)
	})

	it('keeps the result valid JS', () => {
		const out = stripJsSideEffects("function f(){ console.log(`a ${b(')')} c`); return fetch(u).then(r=>r.ok) }\nf();")
		expect(() => new Function(out)).not.toThrow()
	})
})

describe('import HTML applies it', () => {
	it('strips pasted page JS', () => {
		const { js } = htmlToJsonTree("<div id='a'>x</div><script>alert('hi'); console.log(1); fetch('/api'); document.title = 't';</script>")
		expect(js).not.toMatch(/alert|console|fetch/)
		expect(js).toContain('document.title')
	})
})
