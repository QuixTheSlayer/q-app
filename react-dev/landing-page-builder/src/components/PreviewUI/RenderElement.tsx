import ElementComponents, { ContainerRenderProps, ContentRenderProps } from '@/components/PreviewUI/Elements'
import { NODE_TYPE } from '@/types/node.enum';
import { CanvasNode, ContentNode } from '@/types/node.type';
import React from 'react'
import {  LayoutNodeRenderProps } from '../EditorUI/Nodes';
import { CHILD_TREE_TYPES } from "@/utils/childTreeTypes";


function RenderElement({ node,canvas }: {
  node: CanvasNode,
  canvas:CanvasNode
}) {

  const Component = ElementComponents[node.contentType] as React.FC<LayoutNodeRenderProps| ContainerRenderProps  | (ContentRenderProps<ContentNode>)>

  if (!Component || !canvas ) {
    return <div className='bg-[#0099ff29] border border-dashed border-[#0099ff66]'>Invalid node!</div>;
  }

  // Persisted design-time visibility (Attributes panel's "Visible" toggle).
  // Merged into node.style (every render function in Elements.tsx spreads
  // node.style onto its own root element already) rather than skipping the
  // render outright, so a "show"/"toggle" prototype effect can still reveal
  // this exact DOM node at runtime via the same data-id lookup every other
  // prototype effect uses.
  const renderNode = node.hidden === true
    ? { ...node, style: { ...node.style, display: 'none' } } as CanvasNode
    : node

  if (node.type === NODE_TYPE.Container) {
    return (
      <Component
        node={renderNode}
        canvas={canvas}

      >
        {node.children.map((item, idx) => (
          <RenderElement
            key={item.id}
            node={item}
            canvas={canvas }

          />
        ))}
      </Component>
    );
    // heroTemplate and tab recurse once they have a real child tree; legacy
    // ones fall through to the leaf branch.
  } else if (node.contentType === 'accordion' || node.contentType === 'testimonialSlider' || (CHILD_TREE_TYPES.has(node.contentType) && Array.isArray(node.children)) || (node.contentType === 'tab' && node.childrenAreTabs)) {
    return (
      <Component
        node={renderNode}
        canvas={canvas }

      >
        {((node.children ?? []) as CanvasNode[]).map((item, idx) => (
          <RenderElement
            key={item.id}
            node={item}
             canvas={canvas }

          />
        ))}
      </Component>
    );
  }
  else {
    return <Component canvas={canvas } node={renderNode} />
  }
}

export default RenderElement