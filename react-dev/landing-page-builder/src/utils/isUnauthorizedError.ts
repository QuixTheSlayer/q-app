export type ErrorPageStatus = 401 | 403 | 404 | 429 | 500

/**
 * The status to show on the error page when an RTK Query error is an HTTP refusal or failure.
 * 401 (not signed in) stays 401; 403 (not allowed) and 400 (the backend answers a page it will not give out
 * with a bad request) count as 403; 404 and 429 stay as they are; any 5xx counts as 500.
 * Anything else (no status, network errors, other 4xx) returns null.
 */
export function errorPageStatus(error: unknown): ErrorPageStatus | null {
	const status = (error as { status?: unknown } | null | undefined)?.status
	if (typeof status !== 'number') return null
	if (status === 401 || status === 404 || status === 429) return status
	if (status === 403 || status === 400) return 403
	return status >= 500 && status <= 599 ? 500 : null
}

/** Older name, kept for the 401/403 callers. */
export const unauthorizedStatus = errorPageStatus
