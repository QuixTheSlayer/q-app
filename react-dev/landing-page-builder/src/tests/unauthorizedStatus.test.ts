import { describe, expect, it } from 'vitest'
import { errorPageStatus } from '@/utils/isUnauthorizedError'

describe('errorPageStatus', () => {
	it('keeps 401, 404 and 429', () => {
		for (const status of [401, 404, 429] as const) expect(errorPageStatus({ status })).toBe(status)
	})

	it('counts 403 and 400 as 403', () => {
		expect(errorPageStatus({ status: 403 })).toBe(403)
		expect(errorPageStatus({ status: 400 })).toBe(403)
	})

	it('counts any 5xx as 500', () => {
		for (const status of [500, 502, 503, 504]) expect(errorPageStatus({ status })).toBe(500)
	})

	it('ignores everything else', () => {
		for (const error of [undefined, null, {}, { status: 418 }, { status: 200 }, { status: 'FETCH_ERROR' }, 'x']) expect(errorPageStatus(error)).toBeNull()
	})
})
