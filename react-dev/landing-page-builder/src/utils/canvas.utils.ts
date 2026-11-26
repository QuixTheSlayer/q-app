import {
	CanvasNode,
	NodeAttributesMap,
	ContentNode,
	ContentType,
	Layout,
	LayoutNode,
	TextNode,
	CustomeCountDownNode,
	VerticalTabNode,
} from "@/types/node.type";
import { NEW_NODES } from "@/consts/defaultNodeStyle";
import generateCryptoUID from "@/utils/generateCryptoUID";
import React from "react";
import {widgetContents} from "@/consts/widgetContents";
import {WidgetType} from "@/types/widget.type";
import { useEditor } from "@/context/EditorContext";

export const writeTextNodeToClipBoard = <T extends TextNode>(node: T) => {
	if (!node.children) return;
	const richTextData = JSON.parse(node.children );

	navigator.clipboard.writeText(
		richTextData.content[0].content[0].text as string
	);
};

export const clearClipBoard = () => {
	navigator.clipboard.writeText("");
};

export const createTextNode = (text: string): ContentNode => {
	const newTextNode: ContentNode = {
		id: generateCryptoUID(),
		type: "content",
		contentType: "text",
		style: {
			fontSize: "1.25em",
			height: "fit-content",
		},
		children:
			'{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","marks":[{"type":"textStyle","attrs":{"color":"","fontFamily":"","fontSize":"1em"}}],"text":"' +
			text +
			'"}]}]}',
	};
	return newTextNode;
};

export type ContentAttributes = {
	style?: React.CSSProperties;
	attributes?: NodeAttributesMap[ContentNode["contentType"]];
	children?: string | CanvasNode[];
};

export function generateNewNode(
	contentType: ContentType,
	attributes?: ContentAttributes
): LayoutNode | ContentNode {
	const id = generateCryptoUID();
	const newNode = NEW_NODES[contentType];
	const typedNode = newNode as LayoutNode | ContentNode;

 
	return {
		...typedNode,
		id,
		style: {
			...typedNode?.style,
			...attributes?.style,
		},
		attributes: {
			...typedNode?.attributes,
			...attributes?.attributes,
		},
		children:
			 
			((attributes?.children )  ? ((attributes?.children )):(typedNode?.children )) 
	};
}

export function generateNewWidgetNode( 
	widgetType: WidgetType,
): LayoutNode | ContentNode {
	const widgetContent = widgetContents[widgetType];


  const newNode = generateNewNode(widgetContent.contentType, {
    children: widgetContent.children,
    attributes: widgetContent.attributes
  });

  					


  return newNode;
}


/**
 * Creates a debounced function that delays invoking the callback
 * until after 'wait' milliseconds have elapsed since the last time it was called.
 * * @param {Function} func - The function you want to execute.
 * @param {number} wait - The delay in milliseconds.
 * @returns {Function} - The debounced wrapper function.
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>): void {
    // 1. Clear any existing pending timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // 2. Schedule the execution after the wait duration
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}


type EventMap = HTMLElementEventMap;

/**
 * Attaches a type-safe event listener to a parent element that delegates 
 * execution to child elements matching a specific CSS selector.
 *
 * @param parent - The parent root container element to listen on.
 * @param eventType - The type of event (e.g., 'click', 'change').
 * @param selector - The CSS selector string to match target child elements.
 * @param callback - The function to run when a matching child triggers the event.
 */
export function delegate<K extends keyof EventMap, T extends HTMLElement>(
  parent: HTMLElement|null,
  eventType: K,
  selector: string,
  callback: (event: EventMap[K], target: T) => void
): () => void {
  
	if(parent){
  const listener = (event: EventMap[K]) => {
    // 1. Find the closest ancestor matching the selector starting from the actual target clicked
    const targetElement = (event.target as HTMLElement).closest<T>(selector);

    // 2. Verify a match was found and that it exists within our parent delegation root
    if (targetElement && parent?.contains(targetElement)) {
      callback(event, targetElement);
    }
  };

  // 3. Attach listener to the parent container
  parent.addEventListener(eventType, listener);

  // 4. Return an unbind cleanup function to prevent memory leaks
  return () => {
    parent.removeEventListener(eventType, listener);
  };}

  else {
	return ()=>{}
  }
}

