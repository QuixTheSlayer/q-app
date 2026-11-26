import React from "react"
import { Pie, Bar, Line } from "react-chartjs-2"
import { cn } from "@/libs/cn"
import CSSUtils from "@/utils/CSS.utils"
import { buildChartConfig } from "@/utils/chart.utils"
import { ChartNode } from "@/types/node.type"
import { ContentNodeRenderProps } from "../../Nodes"
import DragWrapper from "../../NodeWrapper/DragContainer"
import MotionWrapper from "../../NodeWrapper/MotionWrapper"
import PopoverWrapper from "../../NodeWrapper/PopoverWrapper"

/**
 * Split counterpart to Nodes.tsx's `Chart` — renders a react-chartjs-2
 * Pie/Line/Bar component (picked by `node.chartType`) fed by
 * `buildChartConfig(node)`'s `{ data, options }`. 1:1 port of the original,
 * including the live render's `pointer-events-none` wrapper div (present on
 * the live/editor render only, NOT on the DragOverlay ghost — matches the
 * original's own asymmetry, preserved rather than "fixed"). Original used
 * `zIndexClassName="z-[9999]"` (the Container/Timeline/Faq/PricingToggle
 * value) rather than the content-node default of `z-[999999]`.
 */
export function Chart({
	node,
	canvas,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<ChartNode>) {
	const style = { ...CSSUtils.stripNullStyleValues(node.style) };

	const { data, options } = buildChartConfig(node);
	const ChartComponent = node.chartType === 'pie' ? Pie : node.chartType === 'line' ? Line : Bar;

	if (!canvas) return null

	return (
		<DragWrapper
			node={node}
			path={path}
			parent={parent}
			canvas={canvas}
			children={
				<div
					id="drag-overlay"
					data-id={node.id}
					style={node.style}
					className={cn(
						"h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
						!node.style.backgroundColor &&
						"bg-blue-200/60",
					)}
				>
					<ChartComponent data={data} options={options} />
				</div>
			}
			DragChild={({ attributes, listeners, setNodeRef, isDragging }) => (
				<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging} zIndexClassName="z-[9999]">
					<MotionWrapper
						attributes={attributes}
						listeners={listeners}
						setNodeRef={setNodeRef}
						data-name='node'
						{...props}
						id={node.attributes?.id ?? ''}
						data-id={node.id}
						style={style}
						aria-label="Draggable"
						data-cypress="draggable-item"
						data-node-path={path}
						tabIndex={-1}
						className={cn(
							" !p-2 [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0",
							isDragging && " invisible",
						)}
					>
						<div className="w-full h-full pointer-events-none">
							<ChartComponent data={data} options={options} />
						</div>
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}
