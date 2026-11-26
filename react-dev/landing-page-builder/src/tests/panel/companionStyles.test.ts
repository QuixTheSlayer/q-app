import { describe, expect, it } from 'vitest'
import { companionStyles } from '@/utils/companionStyles'

// Fake computed style of the node being edited.
const reader = (values: Record<string, string>) => (prop: string) => values[prop] ?? ''
const plain = reader({ 'border-top-style': 'none', 'border-top-width': '0px', display: 'block', 'max-width': 'none' })

describe('companionStyles', () => {
	it('gives a border width a solid style', () => {
		expect(companionStyles({ borderWidth: '0.125em' }, plain)).toEqual({ borderStyle: 'solid' })
		expect(companionStyles({ borderLeftWidth: '1em' }, plain)).toEqual({ borderStyle: 'solid' })
	})

	it('gives a border color a style and a width', () => {
		expect(companionStyles({ borderColor: 'red' }, plain)).toEqual({ borderStyle: 'solid', borderWidth: '0.125em' })
	})

	it('leaves borders alone when a style already exists or is in the patch', () => {
		const bordered = reader({ 'border-top-style': 'dashed', display: 'block' })
		expect(companionStyles({ borderWidth: '1em' }, bordered)).toEqual({})
		expect(companionStyles({ borderWidth: '1em', borderStyle: 'dotted' }, plain)).toEqual({})
	})

	it('makes a block flex when direction, alignment or gap is set', () => {
		expect(companionStyles({ flexDirection: 'row' }, plain)).toEqual({ display: 'flex' })
		expect(companionStyles({ gap: '1em' }, plain)).toEqual({ display: 'flex', flexDirection: 'column' })
		expect(companionStyles({ alignItems: 'center', flexDirection: 'row' }, plain)).toEqual({ display: 'flex' })
	})

	it('keeps an existing flex or grid display', () => {
		expect(companionStyles({ gap: '1em' }, reader({ display: 'grid' }))).toEqual({})
		expect(companionStyles({ justifyContent: 'center' }, reader({ display: 'inline-flex' }))).toEqual({})
		expect(companionStyles({ gap: '1em', display: 'block' }, plain)).toEqual({})
	})

	it('lifts a max-width cap when width is set, except on root and sections', () => {
		const capped = reader({ 'max-width': '20em', display: 'block', 'border-top-style': 'none' })
		expect(companionStyles({ width: '30em' }, capped)).toEqual({ maxWidth: 'none' })
		expect(companionStyles({ width: '30em' }, capped, 'section')).toEqual({})
		expect(companionStyles({ width: '30em' }, capped, 'root')).toEqual({})
		expect(companionStyles({ width: '30em', maxWidth: '40em' }, capped)).toEqual({})
	})

	it('ignores cleared values (reset)', () => {
		expect(companionStyles({ borderWidth: undefined, gap: '' }, plain)).toEqual({})
	})
})
