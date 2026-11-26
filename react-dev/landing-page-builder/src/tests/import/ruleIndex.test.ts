import { describe, it, expect } from 'vitest'
import { RuleIndex, selectorKey } from '@/utils/ruleIndex'

describe('selectorKey', () => {
	it('keys on the last compound, preferring id over class over tag', () => {
		expect(selectorKey('.a .b.c')).toEqual({ kind: 'class', name: 'b' })
		expect(selectorKey('div > #x.y')).toEqual({ kind: 'id', name: 'x' })
		expect(selectorKey('ul li')).toEqual({ kind: 'tag', name: 'li' })
		expect(selectorKey('.nav a:not(.skip)')).toEqual({ kind: 'tag', name: 'a' })
	})

	it('ignores what sits inside brackets and parentheses', () => {
		expect(selectorKey('a[href="x .y"]')).toEqual({ kind: 'tag', name: 'a' })
		expect(selectorKey('li:nth-child(2n + 1)')).toEqual({ kind: 'tag', name: 'li' })
		expect(selectorKey(':is(.a, .b).c')).toEqual({ kind: 'class', name: 'c' })
	})

	it('falls back to every element when the key is unclear', () => {
		expect(selectorKey('*')).toBeNull()
		expect(selectorKey('[data-x]')).toBeNull()
		expect(selectorKey('.sm\\:flex')).toBeNull()
		expect(selectorKey('svg|a')).toBeNull()
		expect(selectorKey('linearGradient')).toBeNull()
		expect(selectorKey('.a >')).toBeNull()
	})
})

describe('RuleIndex', () => {
	const SELECTORS = [
		'.card', '.card .title', '#hero', 'section.hero > h2', 'h2', 'a[href^="http"]', '*', '[data-x]',
		'.Card', 'div:not(.card)', '.a + .b', '.a ~ .b', 'ul li:first-child', '.x:is(.y, .z)', 'p::before', 'body',
	]
	const rules = SELECTORS.map((selector) => ({ selectors: [selector] }))
	const index = new RuleIndex(rules, selectorKey)

	const page = document.implementation.createHTMLDocument('t')
	page.body.innerHTML = `
		<section class="hero" id="hero"><h2 class="title">T</h2><a href="https://e.com" class="card">go</a></section>
		<div class="card a"><p>x</p><div class="b" data-x="1">y</div></div>
		<ul><li class="x y">one</li><li>two</li></ul>`

	it('always includes every selector that matches, in source order', () => {
		for (const el of Array.from(page.body.querySelectorAll('*'))) {
			const candidates = index.candidates(el)
			const seqs = candidates.map((c) => c.seq)
			expect(seqs).toEqual([...seqs].sort((a, b) => a - b))
			for (const selector of SELECTORS) {
				if (!el.matches(selector)) continue
				expect(candidates.some((c) => c.selector === selector), `${selector} on <${el.tagName.toLowerCase()}>`).toBe(true)
			}
		}
	})

	it('skips selectors that cannot apply', () => {
		const li = page.body.querySelector('li')!
		expect(index.candidates(li).map((c) => c.selector)).not.toContain('#hero')
	})
})
