import { describe, expect, it } from 'vitest'
import { normalizeDegrees, parseRotate } from '@/utils/rotate.utils'

describe('parseRotate', () => {
	it('reads the stored and computed rotate values as degrees', () => {
		expect(parseRotate('15deg')).toBe(15)
		expect(parseRotate('-45deg')).toBe(-45)
		expect(parseRotate('0.25turn')).toBe(90)
		expect(parseRotate('3.14159rad')).toBe(180)
		expect(parseRotate('100grad')).toBe(90)
		expect(parseRotate(30)).toBe(30)
	})

	it('treats no rotation as 0', () => {
		expect(parseRotate('none')).toBe(0)
		expect(parseRotate(undefined)).toBe(0)
		expect(parseRotate('')).toBe(0)
	})
})

describe('normalizeDegrees', () => {
	it('keeps repeated 90° turns within -180..180', () => {
		expect(normalizeDegrees(270)).toBe(-90)
		expect(normalizeDegrees(-270)).toBe(90)
		expect(normalizeDegrees(180)).toBe(180)
		expect(normalizeDegrees(360)).toBe(0)
		expect(normalizeDegrees(45)).toBe(45)
	})
})
