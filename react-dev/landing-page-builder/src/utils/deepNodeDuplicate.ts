import { NODE_TYPE } from "@/types/node.enum";
import { AnimationGroup, CanvasNode } from "@/types/node.type";
import generateCryptoUID from "@/utils/generateCryptoUID";
import { hasChildNode } from "@/utils/hasChildNode";

/**
 * Recursively duplicates a canvas node tree, generating new IDs for each duplicated node.
 * Preserves the node structure and clones nested children when present.
 * 
 * @param {CanvasNode} node - The source node to duplicate
 * @returns {CanvasNode} A deep copy of the source node with new identifiers
 */

type newAnimationType = {
  id:string,
  [key:string]:unknown
}

export const deepNodeDuplicate = (node: CanvasNode, animation?: newAnimationType[]): { duplicatedNode: CanvasNode, newAnimationList?: newAnimationType[] | [] } => {

  const newId = generateCryptoUID();

  const animationList = new Map(animation?.map((s)=>[s.id,s]))

  const newAnimationList:newAnimationType[] =[]


  const animate = animationList.get(node.id)

  if(animate) newAnimationList.push({...structuredClone(animate),id:newId})


  if (hasChildNode(node)) {

    return {
      duplicatedNode: {
        ...structuredClone(node),
        id: newId,
        children: node.children.map((child) => deepNodeDuplicate(child, animation).duplicatedNode),
        
      },
      newAnimationList
       
    }
  };


  return {
    duplicatedNode: {
      ...structuredClone(node),
      id: newId,
    }, newAnimationList
  };
};

export default deepNodeDuplicate
