/**
 * Formats a counter's current numeric value the same way in both the editor
 * (static preview) and production (live count-up) render paths, so what you
 * see while editing matches what visitors see once the animation finishes.
 */
export function formatCounterValue(
	value: number,
	decimals: number,
	useThousandsSeparator: boolean
): string {
	const fixed = value.toFixed(Math.max(0, decimals));

	if (!useThousandsSeparator) return fixed;

	const [whole, fraction] = fixed.split(".");
	const wholeWithSeparators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

	return fraction ? `${wholeWithSeparators}.${fraction}` : wholeWithSeparators;
}
