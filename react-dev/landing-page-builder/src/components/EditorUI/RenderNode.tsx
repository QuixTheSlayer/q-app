import React, {MouseEventHandler, useEffect, useMemo} from 'react'
import {CanvasNode, ContentNode} from '../../types/node.type'
import CanvasNodeComponents, {ContentNodeRenderProps, CustomCountDownNodeRenderProps, LayoutNodeRenderProps} from './Nodes'
import {EditorContextType, Parent} from '../../context/EditorContext'
import {NODE_TYPE} from '@/types/node.enum'
import { useAppDispatch } from '@/store'
import { editorQuery } from '@/store/query'
import { useHotkeys } from '@mantine/hooks';
import { delegate } from '@/utils/canvas.utils'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { getEffectiveStyle } from '@/utils/responsive.utils'
import editorConfig from '@/configs/editor.config'
import useKeyHeld from '@/hooks/useKeyHeld'
import { findPrototypeEffects, runPrototypeEffect } from '@/utils/scrollToInteraction.utils'
import { CHILD_TREE_TYPES } from "@/utils/childTreeTypes";

const nodeErrorFallback = (
  <div className='bg-destructive/10 border border-dashed border-destructive/50 text-destructive text-[13px] p-2'>
    Failed to render this element.
  </div>
)

interface Props {
  node: CanvasNode
  path: string
  parent?: Parent
  canvas?: EditorContextType
}

function RenderNode ({node, path, parent, canvas}: Props) {

  const isInteractionModifierHeld = useKeyHeld('Alt', !editorConfig.enable_prototype_interactions)

  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()

    if (editorConfig.enable_prototype_interactions && isInteractionModifierHeld) {
      const rootEl = (e.currentTarget as HTMLElement).closest('[data-canvas-root]') ?? document
      findPrototypeEffects(canvas?.content?.animation, node.id, 'active').forEach((effect) => runPrototypeEffect(rootEl, effect))
      return
    }

    if (editorConfig.enable_multi_select && (e.shiftKey || e.ctrlKey || e.metaKey)) {
      canvas?.toggleNodeSelection({ id: node.id, path })
      return
    }

    canvas?.clearSelection()
    canvas?.focusNode({ id: node.id,  path })
  }


  const Component = CanvasNodeComponents[node?.contentType] as React.FC<LayoutNodeRenderProps | CustomCountDownNodeRenderProps | ContentNodeRenderProps<ContentNode>>

  // Live-preview the active device's responsive overrides while editing —
  // every node passes through here once, so this is the single place that
  // needs to know about responsiveStyle instead of each of the ~20 node
  // render branches in Nodes.tsx.
  const responsiveResolvedNode = editorConfig.enable_responsive_editing && canvas?.deviceScope && canvas.deviceScope !== 'desktop'
    ? { ...node, style: getEffectiveStyle(node, canvas.deviceScope) } as CanvasNode
    : node

  // node.hidden is a production-only visibility flag (Attributes header's
  // eye toggle) — the editor keeps rendering hidden nodes at reduced opacity
  // instead of display:none, so they stay selectable/editable/draggable
  // here even though they won't render on the published page.
  const resolvedNode =   node.hidden === true
    ? { ...responsiveResolvedNode, style: { ...responsiveResolvedNode.style, opacity: 0.35 } } as CanvasNode
    :  { ...responsiveResolvedNode, style: { ...responsiveResolvedNode.style, opacity: 1 } } as CanvasNode


  if(!Component) {
    return <div className='bg-[#0099ff29] border border-dashed border-[#0099ff66]'>Invalid node!</div>;
  }

  if(node.type === NODE_TYPE.Container) {
    return (
      <ErrorBoundary resetKey={node.id} fallback={nodeErrorFallback}>
        <Component
            node={resolvedNode}
            canvas={canvas}
            path={path}
            parent={parent}
            onClick={handleClick}
          
            
        >
            {node.children.map((item, idx) => (
                <RenderNode
                    key={item?.id}
                    node={item}
                    path={`${path}.${idx}`}
                    parent={{
                        id: node?.id,
                        path,
                    }}
                    canvas={canvas}
                />
            ))}
        </Component>
      </ErrorBoundary>
    );
  }
  // heroTemplate and tab recurse only once they have a real child tree;
  // legacy ones fall through to the leaf branch and render their flat fields.
  else if(node?.contentType === 'accordion' || node?.contentType === 'testimonialSlider' || (CHILD_TREE_TYPES.has(node?.contentType) && Array.isArray(node.children)) || (node?.contentType === 'tab' && node.childrenAreTabs)) {
    return (
      <ErrorBoundary resetKey={node.id} fallback={nodeErrorFallback}>
        <Component
          node={resolvedNode}
          canvas={canvas}
          path={path}
          parent={parent}
          onClick={handleClick}
        >
          {((node.children ?? []) as CanvasNode[]).map((item, idx) => (
            <RenderNode
              key={item?.id}
              node={item}
              path={`${path}.${idx}`}

              parent={{
                id: node?.id,
                path,
              }}
              canvas={canvas}
            />
          ))}
        </Component>
      </ErrorBoundary>
    );
  }

  else  {
    return (
      <ErrorBoundary resetKey={node.id} fallback={nodeErrorFallback}>
        <Component
          node={resolvedNode}
          canvas={canvas}
          path={path}
          parent={parent}
          onClick={handleClick}
        />
       </ErrorBoundary>
    );
  }

}


export default RenderNode
