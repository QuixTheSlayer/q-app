import { CanvasNode, DeviceScope } from "@/types/node.type";

/** Real-world breakpoints the exported/rendered page's @media rules key off. Independent of the editor canvas's own frame widths. */
export const RESPONSIVE_BREAKPOINTS: Record<Exclude<DeviceScope, "desktop">, number> = {
	tablet: 1024,
	mobile: 640,
};

/**
 * Resolves the style a node should render with for a given device scope,
 * layering overrides the same way the generated @media rules cascade in a
 * real browser: desktop is the base, tablet applies on top of it, and
 * mobile applies on top of both (a mobile-width viewport matches both the
 * tablet and mobile media queries, so mobile's rule — declared later — wins).
 */
export function getEffectiveStyle(node: CanvasNode, scope: DeviceScope): React.CSSProperties {
	if (scope === "desktop") return node.style;

	const merged = { ...node.style, ...node.responsiveStyle?.tablet };
	if (scope === "mobile") {
		return { ...merged, ...node.responsiveStyle?.mobile };
	}
	return merged;
}
