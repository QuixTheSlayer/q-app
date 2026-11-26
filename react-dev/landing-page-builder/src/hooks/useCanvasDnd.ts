// import { WidgetType } from './../types/widget.type';
// import { widgetContents } from './../consts/widgetContents';
// import { DndExistElementType } from './useCanvasDnd';
// import {
// 	DragAbortEvent,
// 	DragCancelEvent,
// 	DragEndEvent,
// 	DragMoveEvent,
// 	DragOverEvent,
// 	DragStartEvent,
// } from "@dnd-kit/core";
// import { Parent, useEditor } from "../context/EditorContext";
// import { CanvasNode, ContentType, LayoutNode } from "../types/node.type";
// import { CONTENT_TYPE, NODE_TYPE } from "@/types/node.enum";
// import { useEffect, useMemo, useRef } from "react";
// import {
// 	getNearestEdge,
// 	highlightDropContainer,
// 	showDropIndicator,
// } from "@/utils/dnd.utils";
// import {
// 	ContentAttributes,
// 	generateNewNode,
// 	generateNewWidgetNode,
// } from "@/utils/canvas.utils";
// import { WidgetType } from "@/types/widget.type";
// import { isAllowedToInsert, isLayoutNode } from "@/utils/editor.utils";
// import deepNodeDuplicate from "@/utils/deepNodeDuplicate";
// import { toast } from 'sonner';
// import { arrayMove } from '@dnd-kit/sortable';
// import { editorQuery } from '@/store/query';
// import { useAppDispatch } from '@/store';

// /**
//  * [DOCS] https://docs.dndkit.com/api-documentation
//  */

// export enum DraggedElementType {
// 	Canvas = "canvas-node",
// 	New = "new-node",
// 	Exist = "exist-node"
// }

// export type DndCanvasElementData = {
// 	type: DraggedElementType.Canvas;
// 	node: CanvasNode;
// 	path: string;
// 	parent?: Parent;
// };

// export type DndNewElementData =
// 	| {
// 		type: DraggedElementType.New;
// 		contentType: ContentType;
// 	}
// 	| {
// 		type: DraggedElementType.New;
// 		widgetType: WidgetType;
// 	};

// export type DndExistElementType = {
// 	type: DraggedElementType.Exist;
// 	node: CanvasNode;
// 	contentType: ContentType;
// }

// function useCanvasDnd() {
// 	const canvas = useEditor();

// 	const dispatch = useAppDispatch()

// 	const prevDropContainerElementRef = useRef<HTMLElement | null>(null);
// 	const canvasDropPositionRef = useRef<{
// 		id: string;
// 		path: string;
// 		insertIndex: number | undefined;
// 	} | null>(null);
// 	const initialEditorScrollTopRef = useRef(0);
// 	const initialEditorScrollLeftRef = useRef(0);




// 	const onDragStart = ({ active }: DragStartEvent) => {
// 		canvas.clearFocus();
// 		const { type } = active.data.current as DndCanvasElementData;

// 		if (type === DraggedElementType.Canvas) {
// 			if (!active.data.current) return;
// 		}

// 		const editorWrapper = document.getElementById("editor-wrapper");

// 		if (editorWrapper) {
// 			initialEditorScrollTopRef.current = editorWrapper.scrollTop;
// 			initialEditorScrollLeftRef.current = editorWrapper.scrollLeft;
// 		}
// 	};

// 	const onDragMove = ({
// 		active,
// 		over,
// 		collisions,
// 		delta,
// 		activatorEvent,
// 	}: DragMoveEvent) => {


// 		if (!over) {
// 			document.getElementById("dnd-indicator")?.remove();
// 			return;
// 		}




// 		const activeData = active.data.current as
// 			| DndCanvasElementData
// 			| DndNewElementData
// 			| DndExistElementType


// 		const insertIndexFun = (data: DndCanvasElementData) => Number(data.path.split('.').slice(data.path.split('.').length - 1)[0])
// 		const insertPath = (path: string) => path.split('.').slice(0, path.split('.').length - 1).join('.')


// 		const overData = over?.data.current as DndCanvasElementData;

// 		const activePosition = active.rect.current.translated
// 		const overPosition = over.rect


// 		const activeCenterpoint = Number((activePosition?.left || 0) + (activePosition?.width || 0) / 2)

// 		const activecenterBlockPoint = Number((activePosition?.top || 0) + (activePosition?.height || 0) / 2)


// 		const isNearRightEdge = activeCenterpoint < overPosition.right - ((overPosition.width) * 0.1)

// 		const isNearLeftEdge = activeCenterpoint < overPosition.left + ((overPosition.width) * 0.1)

// 		const isNearTopEdge = activecenterBlockPoint > overPosition.top + ((overPosition.height) * 0.1)

// 		const isNearBottomEdge = activeCenterpoint > overPosition.bottom - ((overPosition.height) * 0.1)

// 		const isCenter = activeCenterpoint > overPosition.left + ((overPosition.width) * 0.1) && activeCenterpoint < overPosition.right - ((overPosition.width) * 0.1)



// 		if (
// 			activeData.type === DraggedElementType.Canvas &&
// 			activeData.node.id === overData.node.id
// 		) {
// 			return;
// 		}

// 		const contentType =
// 			activeData.type === DraggedElementType.Canvas
// 				? activeData.node.contentType
// 				: activeData.type === DraggedElementType.Exist ? activeData?.contentType : activeData?.contentType;

// 		/**
// 		 * Calculate current cursor position relative to the editor wrapper
// 		 */
// 		const editorWrapper = document.getElementById("editor-wrapper");

// 		if (!editorWrapper) return;
// 		const activeNode = activeData as DndCanvasElementData



// 		function memo<T>(func: any) {

// 			let prevInput: T[] = []
// 			let prevOutput: T | null = null;

// 			return function (this: T, ...args: T[]) {
// 				const isSameInput = (prevInput as T[])?.length > 0 ?

// 					args.map((val, idx) => JSON.stringify(val) === JSON.stringify(prevInput[idx]))
// 					: [false]

// 				if (!isSameInput.includes(false) && prevInput.length === args.length) {
// 					return prevOutput
// 				}

// 				prevInput = args

// 				const result = func.apply(this, prevInput)
// 				prevOutput = result

// 				return result;

// 			}
// 		}




// 		let parentNode = memo((overData: Parent) => canvas?.getNode(overData.path)
// 		)(overData.parent)

// 		if (!parentNode) return;

// 		let moved = memo((overDataNode: CanvasNode) => arrayMove(parentNode.children, insertIndexFun(activeNode), insertIndexFun(overData)))(overData.node)



// 		parentNode = {
// 			...parentNode,
// 			children: moved
// 		}

// 		const pathArr = (overData as DndCanvasElementData).parent?.path.split('.') || []
// 		const childCount = pathArr?.length
// 		let cloneContent = canvas.content as LayoutNode

// 		function updateByPath(data: LayoutNode, path: string, updateFn: (node: LayoutNode) => LayoutNode) {

// 			const indices = path.split('.').map(Number); // "0.3.2.4" -> [0, 3, 2, 4]


// 			function recurse(nodes: LayoutNode[], depth: number) {

// 				const i = indices[depth];

// 				return nodes.map((node, idx) => {
// 					if (idx !== i) return node; // untouched siblings, same reference

// 					if (depth === indices.length - 1) {
// 						// We've arrived at the target node
// 						return updateFn(node as LayoutNode);
// 					}

// 					// Keep descending into children
// 					return {
// 						...node,
// 						children: recurse(node.children as LayoutNode[], depth + 1)
// 					};
// 				});
// 			}

// 			return recurse(data.children as LayoutNode[], 1);
// 		}

// 		// function updateTargetNode(node: LayoutNode, idx: number) {
// 		// 	let currIdx = idx

// 		// 	if (currIdx < childCount && node?.children) {

// 		// 		updateTargetNode(node?.children[Number(pathArr[currIdx])] as LayoutNode, idx + 1)


// 		// 	}
// 		// 	node = parentNode

// 		// 	return node
// 		// }

// 		// const content = updateTargetNode(cloneContent, 1)
// 		const content = updateByPath(cloneContent, (overData as DndCanvasElementData).parent?.path || '', () => parentNode)



// 		console.log(pathArr, content)


// 		memo((content: CanvasNode) => dispatch(editorQuery.util.updateQueryData('getPageData', '', (draft) => {
// 			Object.assign(draft.content, {
// 				...draft.content,
// 				children: content
// 			})
// 		})))(content)


// 		// memo((parentNode: CanvasNode) => canvas.updateNode(() => {
// 		// 	return parentNode
// 		// }))(parentNode)



// 		/**
// 		 * Calculating coordinates of the dragged element in relative to vieowport/window
// 		 */
// 		const currentX =
// 			// overPosition.left + ((overPosition.width) * 0.1)
// 			activeData.type === DraggedElementType.Canvas
// 				? activatorEvent.clientX +
// 				delta.x -
// 				(editorWrapper?.scrollLeft - initialEditorScrollLeftRef.current)
// 				: Math.round(
// 					activatorEvent.clientX + delta.x - editorWrapper?.scrollLeft
// 				);
// 		const currentY =
// 			// overPosition.top + ((overPosition.height) * 0.1)
// 			activeData.type === DraggedElementType.Canvas
// 				? activatorEvent.clientY +
// 				delta.y -
// 				(editorWrapper?.scrollTop - initialEditorScrollTopRef.current)
// 				: Math.round(
// 					activatorEvent.clientY + delta.y - editorWrapper?.scrollTop
// 				);


// 		const overDomElement = over && document.getElementById(overData.node.id);
// 		if (!overDomElement) return;



// 		// remove prev container drop highlight
// 		prevDropContainerElementRef.current?.classList.remove(
// 			"outline",
// 			"outline-[1.5px]",
// 			"outline-highlight"
// 		);


// 		function handleContainerHighlight(container: HTMLElement) {
// 			highlightDropContainer(container);
// 			prevDropContainerElementRef.current = container;

// 			// let prevContainer: HTMLElement | null = null

// 			// const newEl = document.createElement("div")

// 			// const previewElement = document.getElementById("dnd-clone-preview")

// 			// if (!previewElement && activeData.type === DraggedElementType.Exist ) {
// 			// 	Object.assign(newEl.style, {
// 			// 		...activeData.node.style,
// 			// 		backgroundColor: "rgba(0,0,0,0.3)",
// 			// 	})

// 			// 	newEl.draggable = false;

// 			// 	newEl.setAttribute("id", "dnd-clone-preview")


// 			// 	prevContainer = prevDropContainerElementRef.current

// 			// 	prevDropContainerElementRef.current.appendChild(newEl);
// 			// }

// 		}

// 		/**
// 		 * Show drop indicator based on the type of node being dragged and the node being hovered
// 		 */
// 		if (contentType === CONTENT_TYPE.Section) {
// 			const overElement = document.getElementById(overData.node.id);
// 			const containerElement = overElement?.closest("#root") as HTMLElement;
// 			handleContainerHighlight(containerElement);

// 			if (!containerElement) return;

// 			const { dropIndex } = showDropIndicator(
// 				containerElement,
// 				{
// 					x: currentX,
// 					y: currentY,
// 				},
// 				"row"
// 			);

// 			canvasDropPositionRef.current = {
// 				id: "root",
// 				path: "root",
// 				insertIndex: insertIndexFun(overData),
// 			};
// 		} else if (isLayoutNode(overData.node)) {
// 			const { x: edgeX, y: edgeY } = getNearestEdge(
// 				over.rect,
// 				{
// 					x: currentX,
// 					y: currentY,
// 				},
// 				10
// 			);

// 			const nearestEdge = parentNode?.style.flexDirection === "row" ? edgeY : edgeX;

// 			if (nearestEdge === "center") {
// 				const containerElement = document.getElementById(overData.node.id);

// 				if (!containerElement) return;
// 				handleContainerHighlight(containerElement);

// 				const { dropIndex } = showDropIndicator(
// 					containerElement,
// 					{
// 						x: currentX,
// 						y: currentY,
// 					},
// 					(overData.node?.style.flexDirection === "row" ? "row" : "column")
// 				);

// 				canvasDropPositionRef.current = {
// 					id: overData?.node?.id,
// 					path: insertPath(overData.path),
// 					insertIndex: insertIndexFun(overData),
// 				};
// 			} else {
// 				if (!overData.node) return;
// 				const containerElement = document.getElementById(
// 					overData.node.id || ""
// 				);

// 				if (!containerElement) return;
// 				handleContainerHighlight(containerElement);

// 				const { dropIndex } = showDropIndicator(
// 					containerElement,
// 					{
// 						x: currentX,
// 						y: currentY,
// 					},
// 					parentNode?.layout || "column"
// 				);

// 				canvasDropPositionRef.current = {
// 					id: overData.node.id,
// 					path: insertPath(overData.path),
// 					insertIndex: insertIndexFun(overData),
// 				};
// 			}
// 		} else if (overData.node.type === NODE_TYPE.Content) {
// 			if (!overData.node) return;
// 			const containerElement = document.getElementById(
// 				overData.node?.id || ""
// 			);
// 			if (!containerElement) return;
// 			handleContainerHighlight(containerElement);

// 			const { dropIndex } = showDropIndicator(
// 				containerElement,
// 				{
// 					x: currentX,
// 					y: currentY,
// 				},
// 				parentNode?.style.flexDirection || "column"
// 			);

// 			canvasDropPositionRef.current = {
// 				id: overData.node.id,
// 				path: insertPath(overData.path),
// 				insertIndex: insertIndexFun(overData),
// 			};
// 		}
// 	};

// 	const onDragEnd = ({ active, over, delta }: DragEndEvent) => {
// 		if (!over) return;


// 		const activeData = active.data.current as
// 			| DndCanvasElementData
// 			| DndNewElementData
// 			| DndExistElementType

// 		document.getElementById("dnd-indicator")?.remove();
// 		prevDropContainerElementRef.current?.classList.remove(
// 			"outline",
// 			"outline-[1.5px]",
// 			"outline-highlight"
// 		);

// 		const insertIndexFun = (data: DndCanvasElementData) => Number(data.path.split('.').slice(data.path.split('.').length - 1)[0])
// 		const insertPath = (path: string) => path.split('.').slice(0, path.split('.').length - 1).join('.')


// 		const overData = over?.data.current as DndCanvasElementData;

// 		const activePosition = active.rect.current.translated
// 		const overPosition = over.rect


// 		const activeCenterpoint = Number((activePosition?.left || 0) + (activePosition?.width || 0) / 2)

// 		const activecenterBlockPoint = Number((activePosition?.top || 0) + (activePosition?.height || 0) / 2)


// 		const isNearRightEdge = activeCenterpoint > overPosition.right - ((overPosition.width) * 0.1)

// 		const isNearLeftEdge = activeCenterpoint < overPosition.left + ((overPosition.width) * 0.1)

// 		const isNearTopEdge = activecenterBlockPoint > overPosition.top + ((overPosition.height) * 0.1)

// 		const isNearBottomEdge = activeCenterpoint > overPosition.bottom - ((overPosition.height) * 0.1)

// 		const isCenter = activeCenterpoint > overPosition.left + ((overPosition.width) * 0.1) && activeCenterpoint < overPosition.right - ((overPosition.width) * 0.1)




// 		let activePath: string = ''

// 		if (!canvasDropPositionRef.current) return;

// 		const { id, insertIndex, path } = canvasDropPositionRef.current;

// 		if (overData.node.type === 'content') {
// 			toast.warning(`You can only insert element into container element!`)
// 			return;
// 		}
// 		//  if ((activeData as DndCanvasElementData).node.contentType === 'section') {
// 		// 	console.log(overData)


// 		// 	const targetPath = overData.path.split('.').slice(0,2).join('.')
// 		// 	console.log(insertPath(targetPath))
// 		// 	return;
// 		// 	if (isNearLeftEdge || isNearTopEdge) {
// 		// 			// canvas.moveNode(overData.path, overIdxStr+1, overPathStr);
// 		// 			canvas.moveNode((activeData as DndCanvasElementData).path, insertIndexFun(overData) , insertPath(targetPath))
// 		// 		}
// 		// 		else if (isNearRightEdge || isNearBottomEdge){
// 		// 			// canvas.moveNode(overData.path,overIdxStr-1  , overPathStr)
// 		// 			canvas.moveNode((activeData as DndCanvasElementData).path, insertIndexFun(overData) +2, insertPath(targetPath))
// 		// 		}

// 		// }

// 		if (activeData.type === DraggedElementType.Canvas) {
// 			const activeNodeIndex = Number(activeData.path.split(".").pop());
// 			if (insertIndex === undefined) return;
// 			// if ((activeData as DndCanvasElementData).parent?.path === overData.parent?.path && (isNearRightEdge || isNearLeftEdge || isNearTopEdge || isNearBottomEdge)) {


// 			// 	canvas.moveNode((activeData as DndCanvasElementData).path, insertIndexFun(overData), insertPath(overData.path))

// 			// }

// 			if (
// 				activeData.path === path &&
// 				(insertIndex == activeNodeIndex || insertIndex == activeNodeIndex + 1)
// 			)
// 				return;


// 			// 	if ((activeData as DndCanvasElementData).node.contentType === 'section') {
// 			// 	console.log(overData)

// 			// 	const targetPath = overData.path.split('.').slice(0,2).join('.')
// 			// 	console.log(targetPath)
// 			// 	if (isNearLeftEdge || isNearTopEdge) {
// 			// 			// canvas.moveNode(overData.path, overIdxStr+1, overPathStr);
// 			// 			canvas.moveNode((activeData as DndCanvasElementData).path, insertIndexFun(overData) , (targetPath))
// 			// 		}
// 			// 		else if (isNearRightEdge || isNearBottomEdge){
// 			// 			// canvas.moveNode(overData.path,overIdxStr-1  , overPathStr)
// 			// 			canvas.moveNode((activeData as DndCanvasElementData).path, insertIndexFun(overData) +2, (targetPath))
// 			// 		}

// 			// }

// 			if (isCenter) {
// 				canvas.moveNode(activeData.path, 0, overData?.path);

// 			} else {



// 				if (isNearLeftEdge || isNearTopEdge) {
// 					// canvas.moveNode(overData.path, overIdxStr+1, overPathStr);
// 					canvas.moveNode(activeData.path, insertIndexFun(overData), insertPath(overData.path))
// 				}
// 				else if (isNearRightEdge || isNearBottomEdge) {
// 					// canvas.moveNode(overData.path,overIdxStr-1  , overPathStr)
// 					canvas.moveNode(activeData.path, insertIndexFun(overData) + 2, insertPath(overData.path))
// 				}


// 			}


// 		}

// 		if (
// 			activeData.type === DraggedElementType.New &&
// 			"contentType" in activeData
// 		) {
// 			if (activeData.contentType === "table") {

// 				if ((over?.data.current as DndCanvasElementData).node.contentType === "section") {
// 					toast.warning(`Cannot insert ${activeData.contentType} into tab element`)
// 					return;
// 				}
// 				canvas.focusNode({ id, path });
// 				window.dispatchEvent(
// 					new CustomEvent("open-table-dialog", {
// 						detail: {
// 							insertIndex,
// 						},
// 					})
// 				);
// 			} else {
// 				const newNode = generateNewNode(activeData.contentType);
// 				canvas.insertNode(newNode, insertIndex, path);
// 				if (activeData.contentType === 'section' || activeData.contentType === 'block') {
// 					console.log("newBlockAdded", path, insertIndex)
// 					canvas.focusNode({ id: newNode.id, path: path + "." + insertIndex });
// 				} else {
// 					canvas.focusNode({ id, path });
// 				}
// 			}
// 		}

// 		if (
// 			activeData.type === DraggedElementType.New &&
// 			"widgetType" in activeData
// 		) {
// 			const newNode = generateNewWidgetNode(activeData.widgetType);
// 			canvas.insertNode(newNode, insertIndex, path);
// 			canvas.focusNode({ id, path });
// 		}
// 		if (
// 			activeData.type === DraggedElementType.Exist &&
// 			"node" in activeData
// 		) {

// 			const existNode = deepNodeDuplicate(activeData.node)
// 			canvas.insertNode(existNode, insertIndex, path);
// 			if (activeData.contentType === 'section') {
// 				canvas.focusNode({ id: existNode.id, path: path + "." + insertIndex });
// 			} else {
// 				canvas.focusNode({ id: existNode.id, path: path + "." + insertIndex });
// 			}

// 		}
// 	};

// 	const onDragCancel = ({ active }: DragCancelEvent) => {
// 		const activeData = active.data.current as
// 			| DndCanvasElementData
// 			| DndNewElementData;

// 		if (activeData.type === DraggedElementType.New) {
// 			document.getElementById("dnd-indicator")?.remove();
// 			prevDropContainerElementRef.current?.classList.remove(
// 				"outline",
// 				"outline-[1.5px]",
// 				"outline-highlight"
// 			);
// 		}
// 	};

// 	const onDragAbort = ({ }: DragAbortEvent) => { };

// 	return {
// 		dragEventHandlers: {
// 			onDragStart,
// 			onDragEnd,
// 			onDragCancel,
// 			onDragAbort,
// 			onDragMove,
// 		},
// 	};
// }

// export default useCanvasDnd;



import {
	DragAbortEvent,
	DragCancelEvent,
	DragEndEvent,
	DragMoveEvent,
	DragOverEvent,
	DragStartEvent,
} from "@dnd-kit/core";
import { Parent, useEditor } from "../context/EditorContext";
import { CanvasNode, ContentType, LayoutNode } from "../types/node.type";
import { CONTENT_TYPE, NODE_TYPE } from "@/types/node.enum";
import { useRef } from "react";
import {
	getNearestEdge,
	highlightDropContainer,
	showDropIndicator,
} from "@/utils/dnd.utils";
import {
	ContentAttributes,
	generateNewNode,
	generateNewWidgetNode,
} from "@/utils/canvas.utils";
import { WidgetType } from "@/types/widget.type";
import { isAllowedToInsert, isLayoutNode } from "@/utils/editor.utils";

/**
 * [DOCS] https://docs.dndkit.com/api-documentation
 */

export enum DraggedElementType {
	Canvas = "canvas-node",
	New = "new-node",
}

export type DndCanvasElementData = {
	type: DraggedElementType.Canvas;
	node: CanvasNode;
	path: string;
	parent?: Parent;
};

export type DndNewElementData =
	| {
		type: DraggedElementType.New;
		contentType: ContentType;
	}
	| {
		type: DraggedElementType.New;
		widgetType: WidgetType;
	};

function useCanvasDnd() {
	const canvas = useEditor();

	const prevDropContainerElementRef = useRef<HTMLElement | null>(null);
	const canvasDropPositionRef = useRef<{
		id: string;
		path: string;
		insertIndex: number | undefined;
	} | null>(null);
	const initialEditorScrollTopRef = useRef(0);
	const initialEditorScrollLeftRef = useRef(0);
	// dnd-kit fires onDragMove on every pointermove tick (far more often than
	// the browser can paint). Coalescing to the latest event and running the
	// actual handler at most once per animation frame avoids doing the
	// indicator/highlight DOM work (which forces layout reads) more than
	// once per rendered frame.
	const pendingDragMoveEventRef = useRef<DragMoveEvent | null>(null);
	const dragMoveRafIdRef = useRef<number | null>(null);

	const onDragStart = ({ active }: DragStartEvent) => {
		canvas.clearFocus();
		const { type } = active.data.current as DndCanvasElementData;

		if (type === DraggedElementType.Canvas) {
			if (!active.data.current) return;
			// canvas?.focusNode({ id: node.id, path });
		}

		const editorWrapper = document.getElementById("editor-wrapper");

		if (editorWrapper) {
			initialEditorScrollTopRef.current = editorWrapper.scrollTop;
			initialEditorScrollLeftRef.current = editorWrapper.scrollLeft;
		}
	};

	const processDragMove = ({
		active,
		over,
		collisions,
		delta,
		activatorEvent,
	}: DragMoveEvent) => {

		if (!over) {
			document.getElementById("dnd-indicator")?.remove();
			return;
		}
		const activeData = active.data.current as
			| DndCanvasElementData
			| DndNewElementData;

		const overData = over?.data.current as DndCanvasElementData;

		if (
			activeData.type === DraggedElementType.Canvas &&
			activeData.node.id === overData.node.id
		) {
			return;
		}

		/**
		 * Always clear the previous tick's placeholder before recomputing.
		 * Only the near-edge branch below recreates it — this keeps the
		 * placeholder from getting stuck when the drag moves into a branch
		 * that doesn't render one (center drop, section root, content leaf),
		 * and stops it from only redrawing every other move event.
		 */
		document.querySelector('#dropPlaceHolder')?.remove();

		const contentType =
			activeData.type === DraggedElementType.Canvas
				? activeData.node.contentType
				: activeData.contentType;

		/**
		 * Calculate current cursor position relative to the editor wrapper
		 */
		const editorWrapper = document.getElementById("editor-wrapper")

		if (!editorWrapper) return;

		/**
		 * Calculating coordinates of the dragged element in relative to vieowport/window
		 */
		const currentX =
			activeData.type === DraggedElementType.Canvas
				? activatorEvent.clientX +
				delta.x -
				(editorWrapper?.scrollLeft - initialEditorScrollLeftRef.current)
				: Math.round(
					activatorEvent.clientX + delta.x - editorWrapper?.scrollLeft
				);
		const currentY =
			activeData.type === DraggedElementType.Canvas
				? activatorEvent.clientY +
				delta.y -
				(editorWrapper?.scrollTop - initialEditorScrollTopRef.current)
				: Math.round(
					activatorEvent.clientY + delta.y - editorWrapper?.scrollTop
				);

		const overDomElement = over && document.querySelector(`[data-id="${overData.node.id}"]`) as HTMLElement
		if (!overDomElement) return;

		const parentNode = canvas?.getNode(
			overData.parent?.path || "0"
		) as LayoutNode;

		const parentStyle = parentNode.style

		const layoutType: 'row' | 'column' = parentStyle.display === 'block' ? 'column' : parentStyle.flexDirection === 'row' ? 'column' : 'row'

		// remove prev container drop highlight
		prevDropContainerElementRef.current?.classList.remove(
			"outline",
			"outline-[1.5px]",
			"outline-highlight"
		);

		function handleContainerHighlight(container: HTMLElement) {
			highlightDropContainer(container);

			// console.log(container)
			prevDropContainerElementRef.current = container;
		}

		/**
		 * Show drop indicator based on the type of node being dragged and the node being hovered
		 */
		if (contentType === CONTENT_TYPE.Section) {
			const containerElement = overDomElement?.closest("#root") as HTMLElement;

			handleContainerHighlight(containerElement);

			if (!containerElement) return;
			const { dropIndex } = showDropIndicator(
				containerElement,
				{
					x: currentX,
					y: currentY,
				},
				"row"
			);

			canvasDropPositionRef.current = {
				id: "root",
				path: "root",
				insertIndex: dropIndex,
			};
		} else if (isLayoutNode(overData.node)) {
			const { x: edgeX, y: edgeY } = getNearestEdge(
				over.rect,
				{
					x: currentX,
					y: currentY,
				},
				10
			);

			const nearestEdge = layoutType === "row" ? edgeY : edgeX;

			if (nearestEdge === "center") {
				const containerElement = overDomElement;

				if (!containerElement) return;
				handleContainerHighlight(containerElement);

				const { dropIndex } = showDropIndicator(
					containerElement,
					{
						x: currentX,
						y: currentY,
					},
					layoutType || "column"
				);

				canvasDropPositionRef.current = {
					id: overData.node.id,
					path: overData.path,
					insertIndex: dropIndex,
				};
			} else {
				if (!overData.parent) return;
				const containerElement = document.querySelector(`[data-id="${overData.parent.id||""}"]`) as HTMLElement



				if (!containerElement) return;
				handleContainerHighlight(containerElement);



				const { dropIndex, dropPosition } = showDropIndicator(
					containerElement,
					{
						x: currentX,
						y: currentY,
					},
					layoutType || "column"
				);

				// Only Canvas-type drags (reordering an existing node) carry a `path`/`node`;
				// "New"/widget drags from the insert panel don't, so guard both reads.
				const activeIndex = activeData.type === DraggedElementType.Canvas
					? Number(activeData.path.split('.').at(-1))
					: -1;
				const activeNodeStyle = activeData.type === DraggedElementType.Canvas
					? activeData.node.style
					: undefined;

				const dropPlaceHolder = document.createElement('div')
				dropPlaceHolder.id = 'dropPlaceHolder'

				dropPlaceHolder.style.width = String(activeNodeStyle?.width ?? '100%')
				dropPlaceHolder.style.height = String(activeNodeStyle?.height ?? '20px')

				dropPlaceHolder.style.backgroundColor = '#ff00f580'

				function insertAtIndex(parent: HTMLElement, newElement: HTMLElement, index: number) {
					const referenceNode = parent.childNodes[index] || null; // null = append at end

					parent.insertBefore(newElement, referenceNode);
				}

				// The placeholder was already cleared at the top of onDragMove — always
				// (re)insert it fresh at the current position instead of toggling it off.
				insertAtIndex(containerElement, dropPlaceHolder, (activeIndex !== -1 && activeIndex < (dropIndex || 0) ? (dropIndex || 0) + 1 : dropIndex) || 0)

				canvasDropPositionRef.current = {
					id: overData.parent.id,
					path: overData.parent.path,
					insertIndex: dropIndex,
				};
			}
		} else if (overData.node.type === NODE_TYPE.Content) {
			if (!overData.parent) return;
			const containerElement = document.querySelector(`[data-id="${overData.parent.id||''}"]`) as HTMLElement;
			if (!containerElement) return;
			handleContainerHighlight(containerElement);

			const { dropIndex } = showDropIndicator(
				containerElement,
				{
					x: currentX,
					y: currentY,
				},
				layoutType || "column"
			);

			canvasDropPositionRef.current = {
				id: overData.parent.id,
				path: overData.parent.path,
				insertIndex: dropIndex,
			};
		}
	};

	const cancelPendingDragMove = () => {
		if (dragMoveRafIdRef.current !== null) {
			cancelAnimationFrame(dragMoveRafIdRef.current);
			dragMoveRafIdRef.current = null;
		}
		pendingDragMoveEventRef.current = null;
	};

	const onDragMove = (event: DragMoveEvent) => {
		pendingDragMoveEventRef.current = event;
		if (dragMoveRafIdRef.current !== null) return;

		dragMoveRafIdRef.current = requestAnimationFrame(() => {
			dragMoveRafIdRef.current = null;
			const latestEvent = pendingDragMoveEventRef.current;
			pendingDragMoveEventRef.current = null;
			if (latestEvent) processDragMove(latestEvent);
		});
	};

	const onDragEnd = ({ active, over, delta, activatorEvent }: DragEndEvent) => {
		cancelPendingDragMove();
		if (!over) return;
		const el = document.querySelector('#dropPlaceHolder');
		el?.remove()

		const activeData = active.data.current as
			| DndCanvasElementData
			| DndNewElementData;

		document.getElementById("dnd-indicator")?.remove();
		prevDropContainerElementRef.current?.classList.remove(
			"outline",
			"outline-[1.5px]",
			"outline-highlight"
		);



		if (!canvasDropPositionRef.current) return;

		const { id, insertIndex, path } = canvasDropPositionRef.current;

		if (activeData.type === DraggedElementType.Canvas) {
			const activeNodeIndex = Number(activeData.path.split(".").pop());
			if (insertIndex === undefined) return;
			if (
				activeData.path === path &&
				(insertIndex == activeNodeIndex || insertIndex == activeNodeIndex + 1)
			)
				return;
			canvas.moveNode(activeData.path, (insertIndex), path);
			canvas.focusNode({ id, path });
		}

		if (
			activeData.type === DraggedElementType.New &&
			"contentType" in activeData
		) {
			if (activeData.contentType === "table") {
				canvas.focusNode({ id, path });
				window.dispatchEvent(
					new CustomEvent("open-table-dialog", {
						detail: {
							insertIndex,
						},
					})
				);
			} else {
				const newNode = generateNewNode(activeData.contentType);
				canvas.insertNode(newNode, insertIndex, path);
				if (activeData.contentType === 'section') {
					canvas.focusNode({ id: newNode.id, path: path + "." + insertIndex });
				} else {
					canvas.focusNode({ id, path });
				}
			}
		}

		if (
			activeData.type === DraggedElementType.New &&
			"widgetType" in activeData
		) {
			const newNode = generateNewWidgetNode(activeData.widgetType);
			canvas.insertNode(newNode, insertIndex, path);
			canvas.focusNode({ id, path });
		}
	};

	const onDragCancel = () => {
		cancelPendingDragMove();
		// Cleanup must run regardless of drag type — a cancelled reorder drag
		// (Canvas type) left the indicator/placeholder/highlight stuck before.
		document.getElementById("dnd-indicator")?.remove();
		document.querySelector('#dropPlaceHolder')?.remove();
		prevDropContainerElementRef.current?.classList.remove(
			"outline",
			"outline-[1.5px]",
			"outline-highlight"
		);
	};

	const onDragAbort = () => {
		cancelPendingDragMove();
	};

	const el = document.querySelector('#dropPlaceHolder');
	el?.remove()
	return {
		dragEventHandlers: {
			onDragStart,
			onDragEnd,
			onDragCancel,
			onDragAbort,
			onDragMove,
		},
	};
}

export default useCanvasDnd;