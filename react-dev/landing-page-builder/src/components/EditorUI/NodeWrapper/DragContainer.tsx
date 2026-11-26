import { ReactNode } from "react"
import { DraggableAttributes, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core"
import { snapCenterToCursor } from "@dnd-kit/modifiers"
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities"
import { DndCanvasElementData, DraggedElementType } from "@/hooks/useCanvasDnd"
import { cn } from "@/libs/cn"
import { CanvasNode } from "@/types/node.type"
import { EditorContextType, Parent } from "@/context/EditorContext"

export interface DragChildRenderProps {
	attributes: DraggableAttributes
	listeners?: SyntheticListenerMap
	setNodeRef: (el: HTMLElement) => void
	isDragging: boolean
}

interface DragWrapperProps {
	node: CanvasNode
	/** DragOverlay ghost content — deliberately NOT named after node.children, which has a different shape per node kind (string | CanvasNode[] | JSONContent) and isn't meant for direct JSX rendering. Optional since Container spreads LayoutNodeRenderProps (whose own `children` — the real rendered subtree — can legitimately be absent for an empty section/block). */
	children?: ReactNode
	path: string
	parent?: Parent
	canvas?: EditorContextType
	/** Disable dragging for this node (sections/root — see Container's original comment on why). */
	dragDisabled?: boolean
	/** Renders the real node JSX, given live drag state — see DragChildRenderProps. */
	DragChild: (props: DragChildRenderProps) => ReactNode
}

/**
 * Pure drag/drop mechanics for a LayoutNode — owns useDraggable/useDroppable
 * and the DragOverlay ghost, nothing else. Actual node JSX (motion, Popover,
 * grid overlay, section controls, ...) is supplied by the caller via
 * `DragChild`, so this wrapper stays reusable across Container and any
 * future LayoutNode-shaped renderer without dictating their markup.
 *
 * Mirrors Container's original inline useDraggable/useDroppable/DragOverlay
 * logic 1:1 (same disabled condition, same DndCanvasElementData shape, same
 * ghost styling) — see Nodes.tsx's Container for the pre-split reference.
 */
export default function DragWrapper({
	node,
	children,
	path,
	parent,
	dragDisabled,
	canvas,
	DragChild,
}: DragWrapperProps) {
	const {
		attributes,
		listeners,
		setNodeRef: setDragRef,
		isDragging,
	} = useDraggable({
		disabled: dragDisabled || canvas?.textEditorObj?.isFocused,
		id: node.id,
		data: {
			type: DraggedElementType.Canvas,
			node,
			path,
			parent,
		} satisfies DndCanvasElementData,
	})

	const { setNodeRef: setDropRef } = useDroppable({
		id: node.id,
		data: {
			type: DraggedElementType.Canvas,
			node,
			path,
			parent,
		} satisfies DndCanvasElementData,
	})

	const setNodeRef = (el: HTMLElement) => {
		setDragRef(el)
		setDropRef(el)
	}

	return (
		<>
			{DragChild({ attributes, listeners, setNodeRef, isDragging })}

			{isDragging && (
				<DragOverlay modifiers={[snapCenterToCursor]}>
					<div
						id="drag-overlay"
						data-id={node.id}
						style={{
							...node.style,
							backgroundColor: 'transparent',
						}}
						className={cn(
							" outline outline-[2px] h-full opacity-35 cursor-move",
							!node.style.backgroundColor &&
							!node.children?.length &&
							"bg-blue-200/60",
						)}
					>
						{children}
					</div>
				</DragOverlay>
			)}
		</>
	)
}
