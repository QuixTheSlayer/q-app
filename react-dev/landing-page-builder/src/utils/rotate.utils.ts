/** "15deg" / "0.5turn" / "15" -> degrees; anything else (none, empty) -> 0. */
export function parseRotate(value: string | number | undefined): number {
	if (typeof value === 'number') return value
	// A plain angle: number plus an optional deg/turn/rad/grad unit.
	const match = String(value ?? '').trim().match(/^(-?\d*\.?\d+)(deg|turn|rad|grad)?$/i)
	if (!match) return 0
	const n = Number(match[1])
	const unit = (match[2] || 'deg').toLowerCase()
	const degrees = unit === 'turn' ? n * 360 : unit === 'rad' ? (n * 180) / Math.PI : unit === 'grad' ? n * 0.9 : n
	return Math.round(degrees * 10) / 10
}

/** Keeps an angle within -180..180, so repeated 90° turns don't grow without end. */
export const normalizeDegrees = (degrees: number) => {
	const wrapped = ((((degrees + 180) % 360) + 360) % 360) - 180
	return wrapped === -180 && degrees > 0 ? 180 : wrapped
}
