import { Layout } from "@/types/node.type";
import { ClientRect } from "@dnd-kit/core";
import { Coordinates } from "@dnd-kit/utilities";

/**
 * Determines the nearest side of an element relative to a mouse event.
 * Useful for positioning drag indicators on the closest edge.
 * 
 * @param {HTMLElement} element - Target element to measure against
 * @param {MouseEvent} event - Mouse event with client coordinates
 * @returns {'left'|'right'|'top'|'bottom'} The closest side
 */
export function getNearestSide(
	element: HTMLElement,
	event: MouseEvent
): "left" | "right" | "top" | "bottom" {
	const rect = element.getBoundingClientRect();

	const x = event.clientX - rect.left; // distance from left edge
	const y = event.clientY - rect.top; // distance from top edge

	const distLeft = x;
	const distRight = rect.width - x;
	const distTop = y;
	const distBottom = rect.height - y;

	const min = Math.min(distLeft, distRight, distTop, distBottom);

	switch (min) {
		case distLeft:
			return "left";
		case distRight:
			return "right";
		case distTop:
			return "top";
		default:
			return "bottom";
	}
}

/**
 * Determines whether a point is nearer the left or right edge of a rectangle.
 * 
 * @param {ClientRect} rect - Rectangle to compare against
 * @param {Coordinates} delta - Point coordinates to evaluate
 * @returns {'left'|'right'} The nearest horizontal side
 */
export function getNearestSideX(
	rect: ClientRect,
	delta: Coordinates
): "left" | "right" {
	const x = delta.x - rect.left;
	const distLeft = x;
	const distRight = rect.width - x;

	return distLeft < distRight ? "left" : "right";
}

/**
 * Determines whether a point is nearer the top or bottom edge of a rectangle.
 * 
 * @param {ClientRect} rect - Rectangle to compare against
 * @param {Coordinates} delta - Point coordinates to evaluate
 * @returns {'top'|'bottom'} The nearest vertical side
 */
export function getNearestSideY(
	rect: ClientRect,
	delta: Coordinates
): "top" | "bottom" {
	const y = delta.y - rect.top;
	const distTop = y;
	const distBottom = rect.height - y;

	return distTop < distBottom ? "top" : "bottom";
}

/**
 * Determines the nearest edge region of a rectangle relative to a point.
 * Returns 'center' when the point is not near any padded edge.
 * 
 * @param {ClientRect} rect - Target rectangle
 * @param {Coordinates} delta - Cursor coordinates to evaluate
 * @param {number} [edgePadding=0] - Padding threshold for edge detection
 * @returns {{x: 'left'|'right'|'center', y: 'top'|'bottom'|'center'}} Edge positions
 */
export function getNearestEdge(
	rect: ClientRect,
	delta: Coordinates,
	edgePadding: number = 0
): { x: "left" | "right" | "center"; y: "top" | "bottom" | "center" } {
	const x = delta.x - rect.left;
	const y = delta.y - rect.top;

	let xPos: "left" | "right" | "center" = "center";
	let yPos: "top" | "bottom" | "center" = "center";

	if (x <= edgePadding) xPos = "left";
	else if (x >= rect.width - edgePadding) xPos = "right";

	if (y <= edgePadding) yPos = "top";
	else if (y >= rect.height - edgePadding) yPos = "bottom";

	return { x: xPos, y: yPos };
}

/**
 * Determines the nearest horizontal edge inside a rectangle with optional padding.
 * 
 * @param {ClientRect} rect - Target rectangle
 * @param {Coordinates} delta - Cursor coordinates to evaluate
 * @param {number} [edgePadding=0] - Pixel padding from edges
 * @returns {'left'|'right'|'center'} The nearest horizontal edge
 */
export function getNearestEdgeX(
	rect: ClientRect,
	delta: Coordinates,
	edgePadding: number = 0
): "left" | "right" | "center" {
	const x = delta.x - rect.left;

	if (x <= edgePadding) return "left";
	if (x >= rect.width - edgePadding) return "right";
	return "center";
}

/**
 * Determines the nearest vertical edge inside a rectangle with optional padding.
 * 
 * @param {ClientRect} rect - Target rectangle
 * @param {Coordinates} delta - Cursor coordinates to evaluate
 * @param {number} [edgePadding=0] - Pixel padding from edges
 * @returns {'top'|'bottom'|'center'} The nearest vertical edge
 */
export function getNearestEdgeY(
	rect: ClientRect,
	delta: Coordinates,
	edgePadding: number = 0
): "top" | "bottom" | "center" {
	const y = delta.y - rect.top;

	if (y <= edgePadding) return "top";
	if (y >= rect.height - edgePadding) return "bottom";
	return "center";
}

/**
 * Positions an absolute indicator beside the nearest child in a container
 * based on the given mouse position.
 */

/**
 * Applies visual highlight styles to the current drop container.
 * Used during drag-over operations to indicate valid insertion targets.
 * 
 * @param {HTMLElement} container - The HTML element representing the drop container
 */
export function highlightDropContainer(container: HTMLElement) {
  container.classList.add("outline", "outline-[1.5px]", "outline-highlight")
} 

/**
 * Displays a draggable insertion indicator inside a container.
 * Calculates the nearest child and positions a visual indicator for drop placement.
 * 
 * @param {HTMLElement} container - The container element that receives the drop
 * @param {{x:number,y:number}} delta - Mouse coordinates relative to the page
 * @param {Layout} layout - The layout orientation of the container ('row', 'column', 'grid')
 * @returns {{dropIndex: number | undefined}} The calculated index where a new node should be inserted
 */
export function showDropIndicator(
	container: HTMLElement,
	delta: { x: number; y: number },
	layout: string,
): {
	dropIndex: number | undefined;
	dropPosition: "before" | "after"
} {
	const { x, y } = delta;
	document.getElementById("dnd-indicator")?.remove();

	const indicator = document.createElement("div");
	indicator.setAttribute("id", "dnd-indicator");
	indicator.style.position = "absolute";
	indicator.style.background = "#ff00f5";
	indicator.style.zIndex = "9999999999";

	const children = (Array.from(container.children) as HTMLElement[]).filter(
		(child) => child.dataset.nodePath
	);

	const computed = window.getComputedStyle(container);
	const paddingTop = parseFloat(computed.paddingTop || "0");
	const paddingBottom = parseFloat(computed.paddingBottom || "0");
	const paddingLeft = parseFloat(computed.paddingLeft || "0");
	const paddingRight = parseFloat(computed.paddingRight || "0");

	const containerRect = container.getBoundingClientRect();
  
	function addEndDots() {
		const makeDot = () => {
			const dot = document.createElement("div");
			Object.assign(dot.style, {
				position: "absolute",
				width: "6px",
				height: "6px",
				borderRadius: "50%",
				background: "#ff00f5",
				zIndex: Infinity,
			});
			return dot;
		};

		const startDot = makeDot();
		const endDot = makeDot();
		indicator.appendChild(startDot);
		indicator.appendChild(endDot);

		if (layout === "row") {
			Object.assign(startDot.style, {
				top: "50%",
				left: "0",
				transform: "translate(-50%, -50%)",
			});
			Object.assign(endDot.style, {
				top: "50%",
				right: "0",
				transform: "translate(50%, -50%)",
			});
		} else if (layout === "column") {
			Object.assign(startDot.style, {
				left: "50%",
				top: "0",
				transform: "translate(-50%, -50%)",
			});
			Object.assign(endDot.style, {
				left: "50%",
				bottom: "0",
				transform: "translate(-50%, 50%)",
			});
		} else if (layout === "grid") {
			// For grid layout, show top-left and bottom-right dots
			Object.assign(startDot.style, {
				top: "0",
				left: "50%",
				transform: "translate(-50%, -50%)",
			});
			Object.assign(endDot.style, {
				bottom: "0",
				right: "50%",
				transform: "translate(50%, 50%)",
			});
		}
	}

	// Case: no children
	if (!children.length) {
		if (layout === "row") {
			Object.assign(indicator.style,{
						left: `${0}px`,
						width: `100%`,
						height: "100%",
						top: `${0}px`,
						background: "rgba(255, 0, 245, 0.2)",
				  });
		} else {
			Object.assign(indicator.style, {
						left: `${0}px`,
						width: `100%`,
						height: "100%",
						top: `${0}px`,
						background: "rgba(255, 0, 245, 0.2)",
				  });
		}
		addEndDots();
		container.appendChild(indicator);
		return { dropIndex: 0,dropPosition:'after' };
	}

	// Find nearest child
	let nearestChild: HTMLElement | null = null;
	let nearestChildIndex = -1;
	let nearestDistance = Infinity;

  for (let index = 0; index < children.length; index++) {
		const child = children[index];
		const rect = child.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const distance = Math.hypot(centerX - x, centerY - y);

		if (distance < nearestDistance) {
			nearestDistance = distance;
			nearestChild = child;
			nearestChildIndex = index;
		}
	}

	if (!nearestChild) return { dropIndex: 0,dropPosition:'after' };

	const rect = nearestChild.getBoundingClientRect();
	let dropPosition: "before" | "after" ='after'
	let pos = 0;
  
	if (layout === "row" || layout === "column") {

		const isRow = layout === "row";
		const isBefore = isRow
			? y < rect.top + rect.height / 2
			: x < rect.left + rect.width / 2;
		dropPosition = isBefore ? "before" : "after";

		let adjacent = isBefore
			? nearestChild.previousElementSibling
			: nearestChild.nextElementSibling;
      
    //   if(adjacent?.querySelector("#drag-overlay")) adjacent = adjacent.previousElementSibling;
    
    // const dragOverlayElement = document.getElementById("drag-overlay")
    // if(dragOverlayElement instanceof HTMLElement) {
    //   if(dragOverlayElement.dataset.id === adjacent?.id) return {
    //     dropIndex: undefined
    //   }
    // }
      
    if (adjacent instanceof HTMLElement && adjacent.dataset.nodePath) {
			const adjacentRect = adjacent.getBoundingClientRect();
			const selfEdge = isRow
				? isBefore
					? rect.top
					: rect.bottom
				: isBefore
				? rect.left
				: rect.right;
			const adjacentEdge = isRow
				? isBefore
					? adjacentRect.bottom
					: adjacentRect.top
				: isBefore
				? adjacentRect.right
				: adjacentRect.left;
			pos =
				(selfEdge + adjacentEdge) / 2 -
				(isRow ? containerRect.top : containerRect.left) -
				1;
		} else {
			pos = isRow
				? rect.top - containerRect.top + (isBefore ? 0 : rect.height)
				: rect.left - containerRect.left + (isBefore ? 0 : rect.width);
		}

		Object.assign(
			indicator.style,
			{
						left: `${0}px`,
						width: `100%`,
						height: "100%",
						top: `${0}px`,
						background: "rgba(255, 0, 245, 0.15)",
				  }
		);

		addEndDots();
		container.appendChild(indicator);

		return {
			dropIndex: nearestChildIndex + (dropPosition === "before" ? 0 : 1),
		};
	}

	// Grid Layout Handling
  if (layout === "grid") {
		const gridTemplateColumns =
			window.getComputedStyle(container).gridTemplateColumns;
		const colCount = gridTemplateColumns.split(" ").length;

		const nearestRect = rect;
		const nearestIndex = nearestChildIndex;
		const totalChildren = children.length;

		// Compute the row/col of the nearest block
		const row = Math.floor(nearestIndex / colCount);
		const col = nearestIndex % colCount;

		let edge: "left" | "right";
    
		const distLeft = Math.abs(x - nearestRect.left);
		const distRight = Math.abs(x - nearestRect.right);
		edge = distLeft < distRight ? "left" : "right";

		// Find adjacent neighbor if exists
		let neighborRect = null;
		if (edge === "left" && col > 0) {
			neighborRect = children[nearestIndex - 1]?.getBoundingClientRect();
		} else if (
			edge === "right" &&
			col < colCount - 1 &&
			nearestIndex + 1 < totalChildren
		) {
			neighborRect = children[nearestIndex + 1]?.getBoundingClientRect();
		}

		let indicatorX;
		if (neighborRect) {
			// Midpoint between nearest and neighbor
			if (edge === "left") {
				indicatorX = (nearestRect.left + neighborRect.right) / 2;
			} else {
				indicatorX = (nearestRect.right + neighborRect.left) / 2;
			}
		} else {
			// Fall back to nearest block edge
			indicatorX = edge === "left" ? nearestRect.left : nearestRect.right;
		}

		// Apply indicator position
		Object.assign(indicator.style, {
						left: `${0}px`,
						width: `100%`,
						height: "100%",
						top: `${0}px`,
						background: "rgba(255, 0, 245, 0.2)",
				  });

		addEndDots();
		container.appendChild(indicator);
    const dropIndex = nearestIndex + (edge === "left" ? 0 : 1);

		return { dropIndex };
	}

	return { dropIndex: 0,dropPosition };
}
