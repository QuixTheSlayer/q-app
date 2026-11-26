import {PlusIcon} from "@heroicons/react/24/outline";
import {EditorContextType, Parent} from "../../context/EditorContext";
import {cn} from "../../libs/cn";
import {CanvasNode, ContentNode, ImageNode, LayoutNode, TableNode} from "../../types/node.type";
import {defaultAnimateLayoutChanges, horizontalListSortingStrategy, rectSortingStrategy, rectSwappingStrategy, SortableContext, useSortable, verticalListSortingStrategy} from "@dnd-kit/sortable";
import React, {useCallback, useLayoutEffect, useMemo} from "react";
import {CSS} from "@dnd-kit/utilities";
import {DragOverlay, useDraggable, useDroppable} from "@dnd-kit/core";
import {restrictToParentElement} from "@dnd-kit/modifiers";
import {CONTENT_TYPE, LAYOUT} from "@/types/node.enum";
import {EditorContent, generateHTML, useEditor as useTiptapEditor} from '@tiptap/react'
import {extensions} from "@/libs/tiptap/config";
import useFileDrop from "@/hooks/useFileDrop";
import {CiImageOn} from "react-icons/ci";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/primitives/popover";
import {ActionMenu} from "@/components/EditorUI/ActionMenu";
import {generateNewNode} from "@/utils/canvas.utils";
import {useGetPageDataQuery} from "@/store/query";
import useUploadToS3 from "@/hooks/useUploadToS3";
import {DndCanvasElementData, DraggedElementType} from "@/hooks/useCanvasDnd";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

export interface LayoutNodeRenderProps extends React.HTMLAttributes<HTMLElement> {
  node: LayoutNode
  canvas?: EditorContextType
  path: string
  parent?: Parent
};

export interface ContentNodeRenderProps extends React.HTMLAttributes<HTMLElement> {
  node: ContentNode
  canvas?: EditorContextType
  path: string
  parent?: Parent
};

export interface TableNodeRenderProps extends React.HTMLAttributes<HTMLElement> {
  node: TableNode
  canvas?: EditorContextType
  path: string
  parent?: Parent
};

//@ts-ignore
const defaultAnimate = (args) => {
  const {isSorting, wasDragging} = args;

  if(isSorting || wasDragging) {
    return defaultAnimateLayoutChanges(args);
  }
  return true;

}

const sortingStrategyMap = {
  row: verticalListSortingStrategy,
  column: horizontalListSortingStrategy,
  grid: rectSortingStrategy
}

export function Container ({node, children, canvas, path, parent, onClick}: LayoutNodeRenderProps) {
  const isFocused = canvas?.focused?.id === node.id;
  const isParent = canvas?.focusedParent?.id === node.id;

  const {isDragging, attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition} = useSortable({
    disabled: canvas?.textEditorObj?.isFocused,
    id: node.id,
    data: {type: DraggedElementType.Canvas, node, path, parent} satisfies DndCanvasElementData,
    animateLayoutChanges: defaultAnimate,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...node.style,
  };

  const handleAddSection: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    const lastIdx = parseInt(path.slice(-1))
    const newSectionNode = generateNewNode('section');
    canvas?.insertSection(newSectionNode, lastIdx + 1);


  };

  const childrenIds = useMemo(() => node.children.map(child => child.id), [node])

  // const setRef = useCallback((node: HTMLElement | null) => {
  //   if(isFocused) canvas.setFocused(prev => {
  //     if(prev) return {...prev, ref: node}
  //   })
  //   setNodeRef(node)
  // }, [isFocused])


  // const onClickHandler = (event: React.MouseEvent<HTMLDivElement>) => {
  //   event.stopPropagation()
  //   canvas?.setFocused({path, node, ref: })
  //   if(parent) canvas?.setFocusedParent(parent)
  // }

  if(canvas)
    return (
      <>
        <Popover open={canvas?.focused?.id === node.id}>
          <PopoverTrigger asChild>
            <div
              {...attributes}
              {...listeners}
              id={node?.attributes?.id ?? node.id}
              ref={setNodeRef}
              style={style}
              tabIndex={-1}
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                onClick && onClick(e)
              }}
              data-node-path={path}
              className={cn(" [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight hover:z-[12] cursor-default",
                isFocused && 'outline outline-[1.5px] z-[11]',
                isParent && 'outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]', 
                node.contentType !== 'root' && 'group',
                (!node.style.backgroundColor && !node.children?.length) && 'bg-blue-200/50',
                isDragging && 'invisible',node.style
                // node.contentType === CONTENT_TYPE.Section && 'overflow-hidden'
              )}
            >
              <SortableContext items={childrenIds} strategy={sortingStrategyMap[node.layout]}>
                {children}
              </SortableContext>
              {node.contentType === CONTENT_TYPE.Section && <button className={cn("absolute flex items-center gap-1 -bottom-[13px] left-1/2 -translate-x-1/2 m-auto z-[100] bg-primary px-[7px] pr-[10px] py-[5px] text-[11px] font-medium text-white rounded-[20px] shadow-m ", (isFocused || isParent) ? 'group-hover:visible invisible' : 'invisible')}
                onClick={handleAddSection}
              >
                <PlusIcon className="size-[15px]" />
                Add Section
              </button>}
              {/* {isParent && <Grid size={30} />} */}
            </div>
          </PopoverTrigger>
          {!isDragging && <PopoverContent side="top" align="center" sideOffset={10} alignOffset={2} className="shadow-none"
            onClick={e => e.stopPropagation()}
            onCloseAutoFocus={e => e.preventDefault()}
            onOpenAutoFocus={e => e.preventDefault()}
          >
            <ActionMenu canvas={canvas} />
          </PopoverContent>}
        </Popover>

        {isDragging && <DragOverlay modifiers={[]}>
          {<div style={node.style} className={cn(
            " outline outline-[2px] h-full cursor-move",
            (!node.style.backgroundColor && !node.children?.length) && 'bg-blue-200/60',
          )}>
            {children}
          </div>}
        </DragOverlay>}
      </>
    )
}

export function Text ({node, canvas, path, parent, onClick, ...props}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps) {

  const editor = useTiptapEditor({
    // autofocus: 'end',
    extensions: [...extensions],
    content: generateHTML(JSON.parse((node as any )?.children ?? "{}"), extensions),
    // content: node.children,
    onCreate: () => {},
    onUpdate: ({editor}) => {
      canvas?.updateNode((node) => {
        let tempNode: ContentNode = {
          ...node,
          children: JSON.stringify(editor.getJSON())
        } as ContentNode

        return tempNode
      }, path)
    },
  }, [])

  const {isDragging, attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition} = useSortable({
    disabled: editor?.isFocused,
    id: node.id,
    data: {type: DraggedElementType.Canvas, node, path, parent} satisfies DndCanvasElementData,
    animateLayoutChanges: defaultAnimate,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...node.style,
  };

  const handleOnClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if(typeof onClick === 'function') onClick(e)

    canvas?.setTextEditorObj(editor)
  }


  if(canvas)
    return (
      <>
        <Popover open={canvas?.focused?.id === node.id}>
          <PopoverTrigger asChild>
            <div
              {...props}
              {...attributes}
              {...listeners}
              id={node.id}
              ref={setNodeRef}
              style={style}
              aria-label="Draggable"
              data-cypress="draggable-item"
              tabIndex={-1}
              data-node-path={path}
              onClick={handleOnClick}
              // className={cn("relative [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight hover:z-[12]",
              //   isFocused && 'outline outline-[1.5px] z-[11]',
              //   isParent && 'outline-dashed outline-offset-[0px] z-[11]',
              //   (!node.style.backgroundColor && !node.children?.length) && 'bg-blue-200/50',
              //   // isDragging && '!bg-blue-400/20 !text-blue-400/20'
              //   isDragging && ' invisible',
              // )}
              className={cn("hover:outline outline-[1px] outline-highlight -outline-offset-[0.5px] cursor-text",
                canvas?.focused?.id === node.id && 'outline outline-[1.5px]',
                canvas?.focusedParent?.id === node.id && 'outline-dashed outline-offset-0',
                isDragging && ' invisible',
              )}
            >
              <EditorContent editor={editor} className="[&>div]:border-none [&>div]:outline-none " autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck={false} />
            </div>
          </PopoverTrigger>
          {!isDragging && <PopoverContent side="top" align="center" sideOffset={10} alignOffset={2} className="shadow-none"
            onClick={e => e.stopPropagation()}
            onCloseAutoFocus={e => e.preventDefault()}
            onOpenAutoFocus={e => e.preventDefault()}
          >
            <ActionMenu canvas={canvas} />
          </PopoverContent>}
        </Popover>
        {isDragging && <DragOverlay>
          <div style={node.style} className=" outline outline-[2px] outline-highlight" dangerouslySetInnerHTML={{__html: sanitizeHtml(editor?.getHTML())  as string|TrustedHTML }}>
          </div>
        </DragOverlay>}
      </>
    )
}

export function Image ({node, canvas, path, parent, ...props}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps) {
  const {isDragging, attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition} = useSortable({
    id: node.id,
    data: {type: DraggedElementType.Canvas, node, path, parent} satisfies DndCanvasElementData,
    animateLayoutChanges: defaultAnimate,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...node.style,
  };

  /**
   * File handling
   */
  const {data} = useGetPageDataQuery('')

  const {handleUpload, selectedFile} = useUploadToS3({
    subFolder: `${data?.user_id}/${data?.id}`
  })

  const handleFileChange = async (files: FileList) => {
    if(files.length > 1) {
      // toast.error('Multiple files detected. PLease select only one file.')
      return;
    }

    const file = files[0]

    const response = await handleUpload(file)

    canvas?.updateNode((node) => {
      let tempNode = node;

      return {
        ...tempNode,
        children: response?.access_url
      } as ContentNode

    }, path)
  }

  const {dragHandlers, isDragging: fileIsDragging} = useFileDrop(handleFileChange)



  if(canvas && node)
    return (
      <>
        <Popover open={canvas?.focused?.id === node.id}>
          <PopoverTrigger asChild>
            <div
              {...props}
              ref={setNodeRef}
              {...attributes}
              {...listeners}
              {...dragHandlers}
              id={node.id}
              style={style}
              aria-label="Draggable"
              data-cypress="draggable-item"
              data-node-path={path}
              tabIndex={-1}
              className={cn("[&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
                canvas?.focused?.id === node.id && 'outline outline-[1.5px]',
                canvas?.focusedParent?.id === node.id && 'outline-dashed outline-offset-0',
                isDragging && ' invisible',
                (node as any ).children ? '' : 'bg-blue-200/50 flex items-center justify-center',
                fileIsDragging && '!outline-dashed outline-2 !bg-blue-100/60'
              )}
            >
              {((node as any ).children || selectedFile?.object_url || (node as unknown as ImageNode )?.attributes?.src) ? <img src={(node as any ).children || selectedFile?.object_url || (node as unknown as ImageNode )?.attributes?.src } className="w-full h-full object-cover max-none" key={node.id + '_image'} />
                :
                <div className="flex items-center justify-center size-[40%] mx-auto max-w-[6rem] max-h-[6rem]">
                  <CiImageOn size="100%" className="text-blue-300" />
                </div>
              }
            </div>
          </PopoverTrigger>
          {!isDragging && <PopoverContent side="top" align="center" sideOffset={10} alignOffset={2} className="shadow-none"
            onClick={e => e.stopPropagation()}
            onCloseAutoFocus={e => e.preventDefault()}
            onOpenAutoFocus={e => e.preventDefault()}
          >
            <ActionMenu canvas={canvas} />
          </PopoverContent>}
        </Popover>
        {isDragging && <DragOverlay modifiers={[]}>
          <div style={node.style} className={cn(
            "h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
            (!node.style.backgroundColor && !(node as any ).children?.length) && 'bg-blue-200/60',
          )}>
            {(node as any ).children ? <img key={node.id + '_drag-overlay'} src={(node as any ).children} className="w-full h-full object-cover" />
              :
              <div className="flex items-center justify-center size-[40%] mx-auto">
                <CiImageOn size="100%" className="text-gray-400" />
              </div>
            }
          </div>
        </DragOverlay>}
      </>
    )
}


export function Button ({node, canvas, path, parent, ...props}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps) {
  const {isDragging, attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition} = useSortable({
    id: node.id,
    data: {node, path, parent, canvas},
    animateLayoutChanges: defaultAnimate,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    // transition,
    ...node.style,
  };

  if(canvas)
    return (
      <>
        <Popover open={canvas?.focused?.id === node.id}>
          <PopoverTrigger asChild>
            <div
              {...props}
              ref={setNodeRef}
              {...attributes}
              {...listeners}
              id={node.id}
              style={{
                ...style,
                fontSize: '1em'
              }}
              aria-label="Draggable"
              data-cypress="draggable-item"
              data-node-path={path}
              className={cn("[&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] cursor-default",
                canvas?.focused?.id === node.id && 'outline outline-[1.5px]',
                canvas?.focusedParent?.id === node.id && 'outline-dashed outline-offset-0',
                // isDragging && '!bg-blue-100 !text-blue-100 outline-0'
                isDragging && ' invisible'
              )}
            >
              <span style={{fontSize: style.fontSize}}>{(node as any ).children}</span>
            </div>
          </PopoverTrigger >
          {!isDragging && <PopoverContent side="top" align="center" sideOffset={10} alignOffset={2} className="shadow-none"
            onClick={e => e.stopPropagation()}
            onCloseAutoFocus={e => e.preventDefault()}
            onOpenAutoFocus={e => e.preventDefault()}
          >
            <ActionMenu canvas={canvas} />
          </PopoverContent>}
        </Popover >
        {isDragging && <DragOverlay>
          {<div style={node.style} className="!w-full outline outline-[1px] outline-highlight">
            {(node as any ).children}
          </div>}
        </DragOverlay>}
      </>
    )
}

export function Table ({node, canvas, path, onClick, parent, ...props}: React.HTMLAttributes<HTMLDivElement> & TableNodeRenderProps) {

  const tipTap = useTiptapEditor({
    // autofocus: 'end',
    extensions: [...extensions],
    content: (node as any ).children ? generateHTML(JSON.parse((node as any ).children), extensions) : undefined,
    // onCreate: ({editor}) => {
    //   if(node.children) return;
    //   editor?.chain().focus().insertTable({rows: 3, cols: 3, withHeaderRow: true}).run()
    // },
    onUpdate: ({editor}) => {
      canvas?.updateNode((node) => {
        let tempNode: ContentNode = {
          ...node,
          children: JSON.stringify(editor.getJSON())
        } as ContentNode

        return tempNode
      }, path)
    },
  }, [])

  // //console.log(tipTap?.getJSON())

  const {isDragging, attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition} = useSortable({
    disabled: tipTap?.isFocused,
    id: node.id,
    data: {type: DraggedElementType.Canvas, node, path, parent} satisfies DndCanvasElementData,
    animateLayoutChanges: defaultAnimate,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // ...node.style,
  };

  const handleOnClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if(typeof onClick === 'function') onClick(e)

    canvas?.setTextEditorObj(tipTap)
  }

  useLayoutEffect(() => {

  }, [])

  const idClassName = "table-node-" + node.id;

  const dynamicTableStyle = `
    .${idClassName} table th {
      background-color: ${node.tableHeadStyle?.backgroundColor};
      padding: ${node.tableHeadStyle?.padding};
      border-color: ${node.tableHeadStyle?.borderColor || '#888888'};
    }

    .${idClassName} table td {
      background-color: ${node.tableBodyStyle?.backgroundColor};
      padding: ${node.tableBodyStyle?.padding};
      border-color: ${node.tableBodyStyle?.borderColor || '#888888'};
    }
  `;

  if(canvas)
    return (
      <>
        <Popover open={canvas?.focused?.id === node.id}>
          <PopoverTrigger asChild>
            <div
              {...props}
              {...attributes}
              {...listeners}
              id={node.id}
              ref={setNodeRef}
              style={style}
              aria-label="Draggable"
              data-cypress="draggable-item"
              data-node-path={path}
              tabIndex={-1}
              onClick={handleOnClick}
              className={cn("table-node hover:outline outline-[1px] outline-highlight -outline-offset-[0.5px] !h-fit cursor-default",
                canvas.focused?.id === node.id && 'outline outline-[1.5px]',
                canvas.focusedParent?.id === node.id && 'outline-dashed outline-offset-0',
                isDragging && ' invisible',
                idClassName
              )} >
              <style>{dynamicTableStyle}</style>
              <EditorContent editor={tipTap} className="[&>div]:border-none [&>div]:outline-none " autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck={false} />
            </div>
          </PopoverTrigger >
          {!isDragging && <PopoverContent side="top" align="center" sideOffset={10} alignOffset={2} className="shadow-none"
            onClick={e => e.stopPropagation()}
            onCloseAutoFocus={e => e.preventDefault()}
            onOpenAutoFocus={e => e.preventDefault()}
          >
            <ActionMenu canvas={canvas} />
          </PopoverContent>}
        </Popover >
        {isDragging && <DragOverlay>
          <div style={node.style} className={cn("dragged-table h-full w-full outline outline-[2px] outline-highlight", idClassName)} dangerouslySetInnerHTML={{__html: sanitizeHtml(tipTap?.getHTML())  as string|TrustedHTML }}>
          </div>
          {/* <EditorContent editor={tipTap} className="[&>div]:border-none [&>div]:outline-none " autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck={false} /> */}
        </DragOverlay>}
      </>
    )
}


export default {
  root: Container,
  section: Container,
  block: Container,
  text: Text,
  image: Image,
  button: Button,
  table: Table,
}