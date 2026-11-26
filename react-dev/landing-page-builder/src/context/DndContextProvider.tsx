import {closestCenter, closestCorners, DndContext, DragCancelEvent, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, KeyboardSensor, MeasuringStrategy, PointerSensor, pointerWithin, rectIntersection, useSensor, useSensors} from '@dnd-kit/core';
import React, {PropsWithChildren} from 'react'
import {MouseSensor, TouchSensor} from '../libs/dnd-kit';
import {createSnapModifier, restrictToParentElement} from '@dnd-kit/modifiers';

/**
 * [DOCS] https://docs.dndkit.com/api-documentation/context-provider
 */
export interface DndProviderProps extends PropsWithChildren {
  dragEventHandlers: {
    onDragStart?(e: DragStartEvent): void,
    onDragOver?(e: DragOverEvent): void,
    onDragEnd?(e: DragEndEvent): void,
    onDragCancel?(e: DragCancelEvent): void
  }
}

/**
 * Wrapper component for the DnD Kit context used in the landing page builder.
 * Configures input sensors, collision detection, measuring strategy, and auto-scroll.
 * 
 * @param {DndProviderProps} props - Drag event handlers and children to render within the context
 */
function DndContextProvider ({children, dragEventHandlers, ...props}: DndProviderProps) {

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,

        // tolerance: 0,
      },
    }),

   

    // useSensor(TouchSensor, {
    //   activationConstraint: {
    //     delay: 200,
    //     tolerance: 10,
    //     distance: 10,
    //   },
    // }),         


    // useSensor(KeyboardSensor, {
    //   keyboardCodes: {
    //     start: ['Space'],
    //     cancel: ['Escape'],
    //     end: ['Space']
    //   }
    // })
  );

  const measuringConfig = {
    droppable: {
      strategy: MeasuringStrategy.Always,
    }
  };

  const snapToGridModifier = createSnapModifier(30);

  return (
    <DndContext
      // modifiers={[snapToGridModifier]}
      // collisionDetection={rectIntersection}
      collisionDetection={pointerWithin}
      
      sensors={sensors}
      measuring={measuringConfig}
      
      autoScroll={{
        enabled: true,
        
        threshold: {
          x: 0.05,
          y: 0.1,
        }
      }}
      {...dragEventHandlers}
    >
      {children}
    </DndContext>
  )
}

export default DndContextProvider