/** Clamps a progress value to the valid 0-100 range, used identically by both render paths. */
export function clampProgressValue(value: number): number {
	return Math.max(0, Math.min(100, value));
}
