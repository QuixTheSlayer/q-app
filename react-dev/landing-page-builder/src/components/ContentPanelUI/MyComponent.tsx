import { componentType, useDeleteComponentMutation, useLazyGetComponentDataByIdQuery, useGetComponentsDataQuery } from "@/store/query.ts";
import { useEditor } from "@/context/EditorContext.tsx";
import { CanvasNode, LayoutNode } from "@/types/node.type.ts";
import React, { useEffect, useRef, useState } from "react";
import RenderElement from "@/components/PreviewUI/RenderElement.tsx";
import { Menu, MenuItem, Popover } from "react-aria-components";
import { PiTrash } from "react-icons/pi";
import { Loader2, LayoutTemplate } from "lucide-react";
import deepNodeDuplicate from "@/utils/deepNodeDuplicate.ts";
import { sanitizeCanvasTree } from "@/utils/security/sanitizeCanvasTree";
import RenderNode from "@/components/EditorUI/RenderNode.tsx";
import { DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";
import useCanvasDnd, { DndCanvasElementData, DraggedElementType } from "@/hooks/useCanvasDnd";
import { cn } from "@/libs/cn";
import { closeModal, openModal, toggleLoading } from "@/store/global.slice";
import { useAppDispatch } from "@/store";
import { useTranslation } from "react-i18next";
import { isDev } from "@/libs/checkEnv";

type SubTemplate = { title: string, thumbnail_url: string, id: string, plan_type?: string }

type MyComponents = {
    node: LayoutNode,
    previewUrl: string
    id: string
}

/** Falls back to a placeholder icon instead of a browser's broken-image
 * glyph when a saved template's thumbnail_url 404s or the S3 object is gone. */
function TemplateThumbnail({ src, alt, onClick }: { src: string, alt: string, onClick: () => void }) {
    const [broken, setBroken] = useState(false)

    if (broken) {
        return (
            <div
                onClick={onClick}
                className=" max-w-[150px] min-w-[100px] w-[150px] h-[60px] rounded flex items-center justify-center bg-primary/20 text-primary/70 "
            >
                <LayoutTemplate size={22} />
            </div>
        )
    }

    return (
        <img
            onClick={onClick}
            onError={() => setBroken(true)}
            alt={alt}
            className=" max-w-[150px] min-w-[100px] h-auto min-h-[60px] rounded "
            src={src}
        />
    )
}

export default function MyComponent() {

    const { t } = useTranslation("insert")
    const canvas = useEditor()


    const { data, isLoading: isLoadingList, isFetching } = useGetComponentsDataQuery("")

    const [nodeId, setNodeId] = useState<string>('')

    const [getComponent, { isLoading }] = useLazyGetComponentDataByIdQuery()

    const [deleteComponent, { isSuccess }] = useDeleteComponentMutation()


    const [modalState, setModalState] = useState<{
        title: string,
        description: string,
        onSubmit?: () => void,
        onCancel?: () => void
    }>({
        title: '',
        description: '',
    })


    function deleteTemplate(component: { title: string, thumbnail_url: string, id: string }) {

        setModalState({
            title: t('templates.deleteConfirmTitle'),
            description: t('templates.deleteConfirmDescription'),
            onSubmit: () => {
                dispatch(toggleLoading(true))

                deleteComponent(component.id)
            },
            onCancel: () => {
                dispatch(closeModal())
            }
        })
    }

    const dispatch = useAppDispatch()

    const rawTemplates = (isDev ? data : data?.data) as SubTemplate[] | undefined

    /**
     * Dev's json-server seed data for this resource predates the real
     * create-template flow and only ever carries an `id` — no title/
     * thumbnail_url, since those are only ever set by ActionMenu.tsx's
     * createTemplate(). Filtering on `plan_type` (unrelated metadata, not a
     * completeness signal) used to silently drop these *and* any other
     * incomplete record with no feedback: templates?.length > 0 was still
     * true, so the real "no templates" empty state never rendered either —
     * the panel just showed an empty bordered box with nothing in it.
     * Filter on what's actually required to render a usable card instead.
     */
    const templates = rawTemplates?.filter((c) => c?.thumbnail_url) ?? []

    useEffect(() => {
        if (isSuccess === true) {
            dispatch(toggleLoading(false))
            dispatch(closeModal())
        }
    }, [isSuccess])

    useEffect(() => {

        if (modalState.onSubmit) {
            dispatch(openModal(modalState))
        }

    }, [modalState])

    // console.log(content)

    const isInitialLoading = isLoadingList || (isFetching && !data)

    return (<div className="flex max-h-[76vh] no-scrollbar border border-primary/40 p-2 overflow-y-scroll flex-wrap max-w-full min- w-full  gap-4">
        {isInitialLoading ? (
            <div className="flex w-full items-center justify-center gap-2 p-4 text-muted-foreground text-sm">
                <Loader2 size={16} className="animate-spin" />
                {t('templates.loading')}
            </div>
        ) : templates.length > 0 ? templates.map((component) => {
            return (
                <div className="border bg-primary/40 cursor-pointer relative flex flex-col gap-3 justify-start items-start rounded border-primary/100 " key={component.id} >
                    <div className=" flex w-full justify-between relative items-center " >
                        <p className=" tracking-wide p-2 text-foreground/80 truncate max-w-[140px]" title={component.title || t('templates.untitled')} >
                            {component.title || t('templates.untitled')}
                        </p>

                        <button
                            type="button"
                            aria-label={t('templates.delete')}
                            title={t('templates.delete')}
                            onClick={() => {
                                deleteTemplate(component)
                            }} className={" cursor-pointer flex  absolute rounded-tr top-0 right-0 items-center  justify-between px-2 py-1 border-l border-b border-primary/100 bg-accent "} >
                            <PiTrash size={19} />
                        </button>

                    </div>
                    {
                        <span className={" w-[100%] h-[1px] bg-primary/100 rounded   "} >

                        </span>
                    }
                    <TemplateThumbnail
                        src={component.thumbnail_url}
                        alt={component.title || t('templates.untitled')}
                        onClick={() => {
                            if (isLoading) return;
                            getComponent(component.id).then(({ data }) => {
                                const { content } = data.data
                                if (!content) return;
                                // A saved component can come from another user, so it gets the same clean-up as a loaded page.
                                canvas.insertNode(deepNodeDuplicate(sanitizeCanvasTree(JSON.parse(content))))
                            })
                        }}
                    />


                </div>
            )
        })
            :

            <div className={" w-full bg-primary/30 p-4 border border-primary/30 rounded text-primary tracking-wide text-center "} > {t('templates.empty')} </div>
        }
    </div>)
}


export function MyComponentItem({ component, index }: {
    component: {
        node: componentType,
        file: string,
        id: string
    },
    index: number
}) {


    const { node, file, id } = component


    const canvas = useEditor()
    let [isOpen, setOpen] = useState(false);
    let triggerRef = useRef(null);


    const [deleteComponent] = useDeleteComponentMutation()


    const {
        attributes,
        listeners,
        setNodeRef: setDragRef,
        transform,
        isDragging,
    } = useDraggable({
        disabled: canvas?.textEditorObj?.isFocused,
        id: node.id,
        data: {
            type: DraggedElementType.Exist,
            node: node,
            contentType: node.contentType
        }

    });




    return (<>

        <div
            key={id}


            {...attributes}
            {...listeners}
            ref={setDragRef}
            className={"flex relative    flex-wrap gap-2  "} >

            <div
                ref={triggerRef}
                onClick={() => canvas.insertNode(deepNodeDuplicate(sanitizeCanvasTree(node)))}
                onContextMenu={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setOpen(prev => !prev)
                }}
                style={{
                    padding: '8px'
                }} className={" w-[150px] cursor-pointer h-auto     "}   >
                {/* <div 
                     className={" cursor-pointer   z-10 w-auto h-full top-0 left-0 "} >
                    <RenderNode path="root" canvas={canvas} node={node} />
                </div> */}
                <img

                    onClick={() => canvas.insertNode(deepNodeDuplicate(sanitizeCanvasTree(node)))}
                    onContextMenu={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        setOpen(prev => !prev)
                    }}
                    src={file}
                    className=" w-[150px] h-auto p-[2px] object-cover  "
                />

            </div>

        </div>
        {/* <Popover
            triggerRef={triggerRef}
            placement="top start"
            className="flex flex-col bg-[#fff] border rounded gap-2 p-2"
            isOpen={isOpen}
            onOpenChange={setOpen}
        >

            <Menu>
                <MenuItem  >
                    <div onClick={() => {
                        deleteComponent(id)
                    }} className={" cursor-pointer flex  items-center justify-between px-2 py-1 border bg-accent "} >
                        <PiTrash size={19} />
                    </div>

                </MenuItem>
            </Menu>


        </Popover> */}

        {isDragging && (
            <DragOverlay modifiers={[]}>
                {
                    <div

                        id="drag-overlay"
                        data-id={node.id}

                        className={cn(
                            " outline outline-[2px] w-auto h-auto cursor-move",
                            !node.style.backgroundColor &&
                            !node?.children?.length &&
                            "bg-primary/20",
                        )}
                    >
                        <img className=" w-[200px] " src={file} />
                        {/* <RenderNode path="container" canvas={canvas} node={node} /> */}
                    </div>
                }
            </DragOverlay>
        )}





    </>
    )
}
