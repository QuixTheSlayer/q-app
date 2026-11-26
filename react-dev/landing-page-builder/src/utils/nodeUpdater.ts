import {hasChildNode} from "@/utils/editor.utils";
import {CanvasNode} from "../types/node.type";
import { editorQuery } from "@/store/query";
import { getIdFromUrl } from "./getIdFromUrl";

/**
 * Recursive algorithm for updating specific node in the node tree, 
 * @param node canvas node tree
 * @param path an arry of indexes to access nested children
 * @param updater  updater function
 * @param idx starting index number to read @param path arry (optional) 
 * @returns 
 */

export default function nodeUpdater (
  node: CanvasNode,
  path: number[],
  updater: (node: CanvasNode) => CanvasNode,
  idx: number = 0,
): CanvasNode {
  let index = idx
  let currentNode = node;
  const childIndex = path[index]
  // if(currentNode.type !== "container" || !currentNode.children.length) return currentNode;
  // if((currentNode.type !== "container" && currentNode.contentType !== 'accordion') || !Array.isArray(currentNode.children)) return currentNode;

  if(!hasChildNode(currentNode)) return currentNode;
  if(!Array.isArray(currentNode.children)) return currentNode;
  
  if(index === path.length - 1) {

    if(isNaN(childIndex)) {
      currentNode = updater(currentNode)
    } else {
      let tempChildren = [...currentNode.children]
      tempChildren[childIndex] = updater(currentNode?.children[childIndex]);
      currentNode = {
        ...currentNode,
        children: tempChildren
      }
    }

  } else {
    index++;
    if(isNaN(childIndex)) {
      currentNode = nodeUpdater(currentNode, path, updater, index)
    } else {
      const tempChildren = [...currentNode.children]
      tempChildren[childIndex] = nodeUpdater(currentNode.children[childIndex], path, updater, index)

      currentNode = {
        ...currentNode,
        children: tempChildren
      }
    }

  }

  

 


  return currentNode;
}