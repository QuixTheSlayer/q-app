import React from "react"
import { useEditor } from "@/context/EditorContext"
import { cn } from "@/libs/cn"
import CSSUtils from "@/utils/CSS.utils"
import { FaqVisual } from "@/components/shared/readyMadeTemplates/FaqVisual"
import { TimelineVisual } from "@/components/shared/readyMadeTemplates/TimelineVisual"
import { PricingToggleVisual } from "@/components/shared/readyMadeTemplates/PricingToggleVisual"
import { ProgressBarVisual } from "@/components/shared/readyMadeTemplates/ProgressBarVisual"
import {
	FaqNode,
	PricingToggleNode,
	ProgressBarNode,
	TimelineNode,
} from "@/types/node.type"
import { ContentNodeRenderProps } from "../../Nodes"
import DragWrapper from "../../NodeWrapper/DragContainer"
import MotionWrapper from "../../NodeWrapper/MotionWrapper"
import PopoverWrapper from "../../NodeWrapper/PopoverWrapper"

/**
 * Split counterpart to Nodes.tsx's `ProgressBar` — thin wrapper around the
 * shared `ProgressBarVisual` (from `@/components/shared/readyMadeTemplates/`)
 * fed the raw node. 1:1 port of the original. Like Counter/Rating/Social,
 * reads `canvas` via `useEditor()` internally rather than destructuring it
 * from props. Original used `zIndexClassName="z-[9999]"`.
 */
export function ProgressBar({
	node,
	path,
	parent,
	// The rendered [label] node RenderNode hands down for bars that have one —
	// passed to the Visual as `slots` so it isn't rendered twice via ...props.
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<ProgressBarNode>) {
	const canvas = useEditor()

	const style = {
		...CSSUtils.stripNullStyleValues(node.style),
	};

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
					className="outline outline-[2px] opacity-80"
				>
					<ProgressBarVisual node={node} slots={children} />
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
							"!p-2 [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0",
							isDragging && "invisible",
						)}
					>
						<ProgressBarVisual node={node} slots={children} />
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}

/**
 * Renders the shared `TimelineVisual` for a `TimelineNode`. Copied verbatim
 * from Nodes.tsx (used by both the live render and the DragOverlay ghost
 * below, and — per Nodes.tsx's own export — may be reused by other
 * consumers), so kept as a standalone named export rather than inlined.
 */
export function TimelineTrack({ node, slots }: { node: TimelineNode; slots?: React.ReactNode }) {
	return <TimelineVisual node={node} slots={slots} />
}

/**
 * Split counterpart to Nodes.tsx's `Timeline` — thin wrapper around
 * `TimelineTrack`/`TimelineVisual`. 1:1 port of the original. Like
 * ProgressBar, reads `canvas` via `useEditor()` internally. Original used
 * `zIndexClassName="z-[9999]"`.
 */
export function Timeline({
	node,
	path,
	parent,
	// The rendered child tree RenderNode hands down for a timeline that has
	// one — passed to the Visual as `slots` rather than left in `...props`,
	// which would otherwise render it twice, outside its slots.
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<TimelineNode>) {
	const canvas = useEditor()

	const style = {
		...CSSUtils.stripNullStyleValues(node.style),
	};

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
					className="outline outline-[2px] opacity-80"
				>
					<TimelineTrack node={node} slots={children} />
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
							"!p-2 [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0",
							isDragging && "invisible",
						)}
					>
						<TimelineTrack node={node} slots={children} />
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}

/**
 * Renders the shared `FaqVisual` for a `FaqNode`. Copied verbatim from
 * Nodes.tsx (Faq depends on it, kept as its own named export same as the
 * original).
 */
export function FaqList({ node, slots }: { node: FaqNode; slots?: React.ReactNode }) {
	return <FaqVisual node={node} slots={slots} />
}

/**
 * Split counterpart to Nodes.tsx's `Faq` — thin wrapper around
 * `FaqList`/`FaqVisual`. 1:1 port of the original. Like ProgressBar/Timeline,
 * reads `canvas` via `useEditor()` internally. Original used
 * `zIndexClassName="z-[9999]"`.
 */
export function Faq({
	node,
	path,
	parent,
	// The rendered child tree RenderNode hands down for a FAQ that has one.
	// Kept out of `...props` so it isn't also spread onto MotionWrapper, which
	// would render the children a second time outside their slots.
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<FaqNode>) {
	const canvas = useEditor()

	const style = {
		...CSSUtils.stripNullStyleValues(node.style),
	};

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
					className="outline outline-[2px] opacity-80"
				>
					<FaqList node={node} slots={children} />
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
							"!p-2 [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0",
							isDragging && "invisible",
						)}
					>
						<FaqList node={node} slots={children} />
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}

/**
 * Renders the shared `PricingToggleVisual` for a `PricingToggleNode`. Copied
 * verbatim from Nodes.tsx (PricingToggle depends on it, kept as its own
 * named export same as the original).
 */
export function PricingToggleDisplay({ node, slots }: { node: PricingToggleNode; slots?: React.ReactNode }) {
	return <PricingToggleVisual node={node} slots={slots} />
}

/**
 * Split counterpart to Nodes.tsx's `PricingToggle` — thin wrapper around
 * `PricingToggleDisplay`/`PricingToggleVisual`. 1:1 port of the original.
 * Like ProgressBar/Timeline/Faq, reads `canvas` via `useEditor()` internally.
 * Original used `zIndexClassName="z-[9999]"`.
 */
export function PricingToggle({
	node,
	path,
	parent,
	// The rendered [planName] node, kept out of ...props for the same reason.
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<PricingToggleNode>) {
	const canvas = useEditor()

	const style = {
		...CSSUtils.stripNullStyleValues(node.style),
	};

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
					className="outline outline-[2px] opacity-80"
				>
					<PricingToggleDisplay node={node} slots={children} />
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
							"!p-2 [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0",
							isDragging && "invisible",
						)}
					>
						<PricingToggleDisplay node={node} slots={children} />
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}
