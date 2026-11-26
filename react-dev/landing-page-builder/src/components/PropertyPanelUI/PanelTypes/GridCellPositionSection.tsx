import { PanelRowContainer, SectionContainer } from "@/components/PropertyPanelUI/ui";
import { useEditor } from "@/context/EditorContext";
import { NumberField, NumberFieldInput } from "@/components/ui/primitives/number-field";
import { useTranslation } from "react-i18next";

function parseSpan(value?: string): number | null {
	const match = /span\s+(\d+)/.exec(value ?? "");
	return match ? parseInt(match[1], 10) : null;
}

function parseStart(value?: string): number | null {
	if (!value || value.includes("span")) return null;
	const start = parseInt(value, 10);
	return Number.isNaN(start) ? null : start;
}

/**
 * Lets the focused node control its own placement within a CSS grid parent
 * (grid-column/grid-row span + start line) — e.g. `grid-column: span 2 / span 2`
 * or `grid-column-start: 3`. Renders nothing unless the focused node's direct
 * parent is itself a grid container, since these properties are meaningless
 * otherwise.
 */
function GridCellPositionSection() {
	const { t } = useTranslation("propertyPanel");
	const canvas = useEditor();
	const node = canvas?.focusedNode;
	const parentNode = canvas?.focusedParent ? canvas.getNode(canvas.focusedParent.path) : null;
	const parentIsGrid = parentNode?.style?.display === "grid";

	if (!node || !parentIsGrid) return null;

	const columnSpan = parseSpan(node.style?.gridColumn as string)
	const rowSpan = parseSpan(node.style?.gridRow as string)
	const columnStart = parseStart(node.style?.gridColumn as string) ?? (node.style?.gridColumnStart as number)
	const rowStart = parseStart(node.style?.gridRow as string) ?? (node.style?.gridRowStart as number)

	const updateColumn = (span: number | null | undefined, start: number | null | undefined) => {
		canvas.updateNode((prevNode) => {
			const parts: string[] = []
			if (start) parts.push(String(start))
			if (span && span > 1) parts.push(`span ${span}`)
			return {
				...prevNode,
				style: {
					...prevNode.style,
					gridColumn: parts.length ? parts.join(" / ") : undefined,
				},
			}
		})
	}

	const updateRow = (span: number | null | undefined, start: number | null | undefined) => {
		canvas.updateNode((prevNode) => {
			const parts: string[] = []
			if (start) parts.push(String(start))
			if (span && span > 1) parts.push(`span ${span}`)
			return {
				...prevNode,
				style: {
					...prevNode.style,
					gridRow: parts.length ? parts.join(" / ") : undefined,
				},
			}
		})
	}

	return (
		<SectionContainer hintKey="gridCellSpan" label={t("gridCellPositionSection.gridCell")}>
			<div className=" flex gap-2 w-[100%] px-2 ">
				<PanelRowContainer className=" w-full px-0 " layoutType="col" hintKey="gridColumnStart" label={t("gridCellPositionSection.columnStart")}>
					<NumberField
						aria-label={t("gridCellPositionSection.columnStart")}
						minValue={1}
						value={columnStart ?? 0}
						onChange={(v) => updateColumn(columnSpan, v || null)}
					>
						<NumberFieldInput size="sm" hideStepper />
					</NumberField>
				</PanelRowContainer>
				<PanelRowContainer className=" w-full px-0 " layoutType="col" hintKey="gridColumnSpan" label={t("gridCellPositionSection.columnSpan")}>
					<NumberField
						aria-label={t("gridCellPositionSection.columnSpan")}
						minValue={1}
						value={columnSpan ?? 1}
						onChange={(v) => updateColumn(v, columnStart)}
					>
						<NumberFieldInput size="sm" hideStepper />
					</NumberField>
				</PanelRowContainer>
			</div>
			<div className=" flex gap-2 w-[100%] px-2 ">
				<PanelRowContainer className=" w-full px-0 " layoutType="col" hintKey="gridRowStart" label={t("gridCellPositionSection.rowStart")}>
					<NumberField
						aria-label={t("gridCellPositionSection.rowStart")}
						minValue={1}
						value={rowStart ?? 0}
						onChange={(v) => updateRow(rowSpan, v || null)}
					>
						<NumberFieldInput size="sm" hideStepper />
					</NumberField>
				</PanelRowContainer>
				<PanelRowContainer className=" w-full px-0 " layoutType="col" hintKey="gridRowSpan" label={t("gridCellPositionSection.rowSpan")}>
					<NumberField
						aria-label={t("gridCellPositionSection.rowSpan")}
						minValue={1}
						value={rowSpan ?? 1}
						onChange={(v) => updateRow(v, rowStart)}
					>
						<NumberFieldInput size="sm" hideStepper />
					</NumberField>
				</PanelRowContainer>
			</div>
		</SectionContainer>
	);
}

export default GridCellPositionSection;
