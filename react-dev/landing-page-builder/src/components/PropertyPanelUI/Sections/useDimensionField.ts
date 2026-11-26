import { CSSProperties, useMemo, useState } from "react";
import { useEditor } from "@/context/EditorContext";
import CSSUtils from "@/utils/CSS.utils";

export type DimensionMode = "full" | "fixed" | "fit" | "percentage";

function modeOf(value?: string): DimensionMode {
	if (value === "full") return "full";
	if (value === "fit-content") return "fit";
	if (typeof value === "string" && value.includes("em")) return "fixed";
	return "percentage";
}

interface UseDimensionFieldOptions {
	/** Style object to read width/height/min/max from. Defaults to the focused node's style. */
	style?: CSSProperties;
	/** Node whose rendered size is used as the "current size" when switching modes. Defaults to the focused node. */
	nodeId?: string;
	/** Writes a single style property. Defaults to canvas.updateNodeStyle. */
	setStyle?: (patch: Record<string, unknown>) => void;
	/** Keep minHeight in sync with a typed Height value (legacy SizeSection behavior). Defaults to true; pass false to disable for animation-effect usage. */
	syncMinHeightOnValueChange?: boolean;
}

/**
 * Shared state + handlers for a Height or Width row: mode select (Fill/Fixed/Fit/%),
 * the main value field, and the paired min/max fields. Keeps the height and width
 * blocks in SizeSection/ContentSizeSection/SizeController identical in behavior
 * without duplicating the mode-derivation and unit-conversion logic per axis.
 */
export function useDimensionField(dimension: "width" | "height", options: UseDimensionFieldOptions = {}) {
	const canvas = useEditor();
	const node = canvas?.focusedNode;
	const style = options.style ?? node?.style ?? {};
	// Falls back to the node's own current style when the passed-in style (e.g. an
	// animation effect that hasn't been touched yet) has no value for this dimension.
	const nodeStyle = node?.style ?? {};
	const nodeId = options.nodeId ?? node?.id;
	const setStyle = options.setStyle ?? ((patch: Record<string, unknown>) => canvas?.updateNodeStyle(patch));

	const value = (style[dimension] ?? nodeStyle[dimension]) as string | undefined;
	const minKey = dimension === "width" ? "minWidth" : "minHeight";
	const maxKey = dimension === "width" ? "maxWidth" : "maxHeight";
	const minValue = (style[minKey] ?? nodeStyle[minKey]) as string | undefined;
	const maxValue = (style[maxKey] ?? nodeStyle[maxKey]) as string | undefined;

	const [mode, setMode] = useState<DimensionMode>(() => modeOf(value));

	const containerEl = document.querySelector(`[data-id="${canvas.parentNode?.id || ""}"]`)
		|| document.getElementById(canvas.parentNode?.id || "");
	const containerSize = dimension === "width" ? containerEl?.clientWidth : containerEl?.clientHeight;

	const nodeEl = useMemo(
		() => document.querySelector(`[data-id="${nodeId || ""}"]`),
		[nodeId],
	);

	const numericValue = mode === "percentage"
		? Number((value as string)?.includes("%") ? (value as string).split("%")[0] : value)
		: CSSUtils.extractEmValue(value);

	const onValueChange = (v: number) => {
		const patch: Record<string, unknown> = {
			[dimension]: mode === "fixed" ? CSSUtils.setEmValue(v) : `${v}%`,
		};
		// Height also keeps minHeight in sync with the typed value (legacy behavior), unless opted out.
		if (dimension === "height" && options.syncMinHeightOnValueChange !== false) {
			patch.minHeight = mode === "fixed" ? CSSUtils.setEmValue(v) : `${v}%`;
		}
		setStyle(patch);
	};

	const onModeChange = (next: string) => {
		const nextMode = next as DimensionMode;
		setMode(nextMode);

		const nodeSize = dimension === "width" ? nodeEl?.clientWidth : nodeEl?.clientHeight;
		const currentStyleValue = dimension === "width" ? (nodeEl as HTMLElement)?.style.width : (nodeEl as HTMLElement)?.style.height;
		const percentageValue = currentStyleValue?.includes("%")
			? currentStyleValue
			: `${((nodeSize || 0) / (containerSize || 1)) * 100}%`;

		setStyle({
			[dimension]:
				nextMode === "fixed"
					? CSSUtils.setEmValue((nodeSize || 0) / canvas.zoomLevel)
					: nextMode === "fit"
						? "fit-content"
						: nextMode === "full"
							? "100%"
							: percentageValue,
		});
	};

	const onMinChange = (v: number) => setStyle({ [dimension === "width" ? "minWidth" : "minHeight"]: CSSUtils.setEmValue(v) });
	const onMaxChange = (v: number) => setStyle({ [dimension === "width" ? "maxWidth" : "maxHeight"]: CSSUtils.setEmValue(v) });
	const onUnsetMin = () => setStyle({ [minKey]: undefined });
	const onUnsetMax = () => setStyle({ [maxKey]: undefined });

	return {
		mode,
		numericValue,
		isValueDisabled: mode === "full" || mode === "fit",
		onValueChange,
		onModeChange,
		minValue: CSSUtils.extractEmValue(minValue),
		maxValue: CSSUtils.extractEmValue(maxValue),
		isMinMaxDisabled: CSSUtils.hasNumericValue(value),
		hasMinValue: minValue !== undefined && minValue !== null && minValue !== "",
		hasMaxValue: maxValue !== undefined && maxValue !== null && maxValue !== "",
		onMinChange,
		onMaxChange,
		onUnsetMin,
		onUnsetMax,
	};
}
