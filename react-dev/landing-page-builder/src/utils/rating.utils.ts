import { RatingNode } from "@/types/node.type";

/**
 * Builds the "4.5 out of 5 — based on 3,982 reviews" summary line, so the
 * editor and production render paths (and the property panel's live
 * preview) all produce identical text from the same node fields.
 */
export function formatRatingSummary(node: Pick<RatingNode, "value" | "maxStars" | "reviewCount" | "customSummaryText">): string {
	if (node.customSummaryText) return node.customSummaryText;

	const reviewCountText = node.reviewCount.toLocaleString();
	return `${node.value} out of ${node.maxStars} — based on ${reviewCountText} review${node.reviewCount === 1 ? "" : "s"}`;
}

/**
 * For the star at `index` (0-based), returns how full it should render as a
 * percentage (0-100) given the current rating `value`. Star 0 is full at
 * value >= 1, star 1 at value >= 2, etc.; a value landing between two whole
 * numbers (e.g. 4.5 for star index 4) fills that star proportionally,
 * producing a half-star (or any other fractional) effect without needing a
 * separate half-star icon asset.
 */
export function getStarFillPercent(index: number, value: number): number {
	const remaining = value - index;
	const clamped = Math.max(0, Math.min(1, remaining));
	return Math.round(clamped * 1000) / 10;
}
