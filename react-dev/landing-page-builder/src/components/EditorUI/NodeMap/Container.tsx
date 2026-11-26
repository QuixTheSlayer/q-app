import { EditorContextType } from "@/context/EditorContext"
import { passthroughAttributes, safeTag } from "@/utils/nodeAttributes"
import { isImportedPage } from "@/utils/pageScope"
import { ContentType, LayoutNode } from "@/types/node.type"
import { generateNewNode } from "@/utils/canvas.utils"
import { useMemo, useState } from "react"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/primitives/popover"
import { PlusIcon } from "@heroicons/react/24/outline"
import { RxButton, RxImage, RxSquare, RxText } from "react-icons/rx"
import { LayoutNodeRenderProps } from "../Nodes"
import CSSUtils from "@/utils/CSS.utils"
import editorConfig from "@/configs/editor.config"
import { CONTENT_TYPE } from "@/types/node.enum"
import { cn } from "@/libs/cn"
import DragWrapper from "../NodeWrapper/DragContainer"
import MotionWrapper from "../NodeWrapper/MotionWrapper"
import PopoverWrapper from "../NodeWrapper/PopoverWrapper"

const GRID_CELL_QUICK_INSERT_TYPES: { contentType: ContentType; label: string; icon: React.ReactNode }[] = [
	{ contentType: 'block', label: 'Block', icon: <RxSquare size={14} /> },
	{ contentType: 'text', label: 'Text', icon: <RxText size={14} /> },
	{ contentType: 'image', label: 'Image', icon: <RxImage size={14} /> },
	{ contentType: 'button', label: 'Button', icon: <RxButton size={14} /> },
]

/**
 * Popover shown when clicking an empty grid placeholder cell — inserting any
 * of these sets explicit gridColumn/gridRow so the new node lands exactly in
 * the clicked cell instead of relying on grid auto-placement.
 */
function GridCellInsertMenu({
	canvas,
	containerPath,
	gridColumn,
	gridRow,
}: {
	canvas: EditorContextType
	containerPath: string
	gridColumn: string
	gridRow: string
}) {
	const [open, setOpen] = useState(false)

	const handleInsert = (contentType: ContentType) => {
		const newNode = generateNewNode(contentType, { style: { gridColumn, gridRow } })
		canvas.insertNode(newNode, undefined, containerPath)
		setOpen(false)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					onClick={(e) => { e.stopPropagation(); setOpen(true) }}
					className="pointer-events-auto w-full h-full flex items-center justify-center bg-transparent border-none cursor-pointer text-highlight/60 hover:text-highlight hover:bg-highlight/10"
				>
					<PlusIcon className="size-[14px]" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				side="top"
				align="center"
				sideOffset={6}
				className="w-auto p-1 flex gap-1 z-[99999]"
				onClick={(e) => e.stopPropagation()}
			>
				{GRID_CELL_QUICK_INSERT_TYPES.map(({ contentType, label, icon }) => (
					<button
						key={contentType}
						type="button"
						title={label}
						onClick={(e) => { e.stopPropagation(); handleInsert(contentType) }}
						className="flex items-center justify-center w-8 h-8 rounded-md bg-transparent border-none cursor-pointer text-foreground hover:bg-accent"
					>
						{icon}
					</button>
				))}
			</PopoverContent>
		</Popover>
	)
}

/**
 * Split counterpart to Nodes.tsx's `Container` — renders LayoutNode content
 * types (root/section/block). Behavior is a 1:1 port of the original:
 * same drag-disabled condition, same grid-overlay/section-button/Popover
 * logic, same DragOverlay ghost. The only structural change is composing
 * DragWrapper (drag/drop mechanics) + MotionWrapper (layout animation)
 * instead of inlining useDraggable/useDroppable/motion.div directly.
 *
 * Not yet wired into CanvasNodeComponents (still Nodes.tsx's own Container)
 * — this file exists so the split can be verified independently before the
 * switch-over happens in a later pass.
 */
export function Container(containerProps: LayoutNodeRenderProps) {
	const {
		node,
		children,
		canvas,
		path,
		parent,
		onClick,
	} = containerProps

	const isFocused = canvas?.focused?.id === node.id
	const isParent = canvas?.focusedParent?.id === node.id

	// Sections are reordered via arrow keys only (see reorderFocusedNode) —
	// they always span the full page width and stack top-to-bottom, so
	// free-form drag-and-drop reordering doesn't apply the way it does for
	// blocks/content. Disabling the drag here still allows dropping other
	// nodes onto/into a section (setDropRef stays active). Root is the single
	// page container and was never meant to be draggable at all — there's
	// nothing to reorder it against — but it shares this same Container
	// renderer, so it needs the same explicit opt-out.
	const isSection = node.contentType === 'section'
	const isRoot = node.contentType === 'root'

	const style = {
		...CSSUtils.stripNullStyleValues(node.style)
	}

	const handleAddSection: React.MouseEventHandler<HTMLButtonElement> = (e) => {
		e.stopPropagation()
		const lastIdx = parseInt(path.slice(-1))
		const newSectionNode = generateNewNode("section")
		canvas?.insertSection(newSectionNode, lastIdx + 1)
		canvas?.focusNode({ id: newSectionNode.id, path: path + "." + lastIdx + 1 })
	}

	const isSelected = canvas?.selectedNodes.find(n => n.id === node.id)

	const selctedStyle = () => {
		if (isSelected) {
			return {
				outline: "2px solid #a855f7",
				outlineOffset: "2px"
			}
		}
	}

	const isParentIsFocused = useMemo(() => {
		if (canvas?.focusedNode && ["block", 'section'].includes(canvas?.focusedNode.contentType)) {
			return (canvas?.focusedNode as LayoutNode)?.children?.find((childNode) => childNode.id === node.id)
		}
		return false
	}, [canvas?.focusedNode])

	const isGridLayout = node.style?.display === 'grid'
	const gridOverlay = useMemo(() => {
		if (!editorConfig?.enable_grid_placeholders || !isGridLayout || !isFocused) return null
		const columns = CSSUtils.getGridCount(node.style?.gridTemplateColumns as string)
		const rows = CSSUtils.getGridCount(node.style?.gridTemplateRows as string)
		if (!columns || !rows) return null
		const filledCells = node.children?.length ?? 0
		return { columns, rows, filledCells }
	}, [isGridLayout, isFocused, node.style?.gridTemplateColumns, node.style?.gridTemplateRows, node.children?.length])

	if (!canvas) return null

	return (
		<DragWrapper
			{...containerProps}
			dragDisabled={isSection || isRoot}
			DragChild={({ attributes, listeners, setNodeRef, isDragging }) => (
				<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging} zIndexClassName="z-[9999]">
						<MotionWrapper
							{...passthroughAttributes(node.attributes, 'editor')}
							// Marks imported tags so the rich-text list rules in index.css leave them alone.
							{...(node.tag ? { 'data-lp-tag': node.tag } : {})}
							// A closed <details> hides its content; the editor shows it, like `hidden` content.
							{...(editorConfig.enable_editor_open_details && node.tag === 'details' ? { open: true } : {})}
							isRoot={isRoot}
							// Same element as Preview: a section without a source tag is a <section>.
							as={safeTag(node.tag, isSection ? 'section' : undefined)}
							attributes={attributes}
							listeners={listeners}
							setNodeRef={setNodeRef}
							data-name='node'
							tabIndex={-1}
							onClick={(e: React.MouseEvent) => {
								e.stopPropagation()
								e.preventDefault()
								if (!onClick) return
								onClick(e as unknown as React.MouseEvent<HTMLElement>)
							}}
							data-node-path={path}
							id={`${node?.attributes?.id ?? ""}`}
							data-id={`${node.id}`}
							style={{
								...style,
								...selctedStyle(),
								opacity: isDragging ? 0.3 : 1,
								...(gridOverlay && (!style.position || style.position === 'static') ? { position: 'relative' } : {}),
							}}
							className={cn(
								" node light no-scrollbar  [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight hover:z-[12] cursor-default",
								// Sections/root anchor the editor's own controls (Add Section, side tab). Blocks stay
								// static like Preview, so a page's absolutely placed elements find the same parent.
								(isSection || isRoot) && "relative",
								isFocused && "outline outline-[1.5px] z-[11]",
								node.contentType === 'root' && "shadow-md",
								isParent || isParentIsFocused &&
								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
								node.contentType !== "root" && "group",
								// Tint marks an empty block; not on classed or imported blocks, whose look comes from the page CSS.
								!node.style.backgroundColor &&
								!node.children?.length &&
								!node.attributes?.className &&
								!isImportedPage(canvas.content) &&
								"bg-blue-200/50",
								node.attributes?.className
							)}
						>
							{children}

							{gridOverlay && (
								<div
									className="pointer-events-none grid absolute z-[1]"
									style={{
										top: 0,
										left: 0,
										right: 0,
										bottom: 0,
										gridTemplateColumns: node.style?.gridTemplateColumns,
										gridTemplateRows: node.style?.gridTemplateRows,
										gap: node.style?.gap,
									}}
								>
									{Array.from({ length: gridOverlay.columns * gridOverlay.rows }).map((_, i) => {
										const row = Math.floor(i / gridOverlay.columns) + 1
										const col = (i % gridOverlay.columns) + 1
										const isFilled = i < gridOverlay.filledCells
										return (
											<div
												key={`grid-cell-${i}`}
												className={cn(
													"relative border border-dashed border-highlight/40 flex items-center justify-center group/gridcell",
													!isFilled && "bg-highlight/5 pointer-events-auto",
												)}
											>
												{!isFilled && canvas && (
													<>
														<span className="text-[10px] font-medium text-highlight/60 select-none group-hover/gridcell:opacity-0">
															{row}:{col}
														</span>
														<div className="absolute inset-0 opacity-0 group-hover/gridcell:opacity-100">
															<GridCellInsertMenu
																canvas={canvas}
																containerPath={path}
																gridColumn={`${col} / ${col + 1}`}
																gridRow={`${row} / ${row + 1}`}
															/>
														</div>
													</>
												)}
											</div>
										)
									})}
								</div>
							)}

							{node.contentType === CONTENT_TYPE.Section && (
								<button
									className={cn(
										"absolute  z-[9999999] flex items-center gap-1 -bottom-[13px] left-1/2 -translate-x-1/2 m-auto  bg-primary px-[7px] pr-[10px] py-[5px] text-[11px] font-medium text-white rounded-[20px] shadow-m ",
										isFocused || isParent
											? "group-hover:visible invisible"
											: "invisible",
									)}
									onClick={handleAddSection}
								>
									<PlusIcon className="size-[15px]" />
									Add Section
								</button>
							)}

							{node.contentType === CONTENT_TYPE.Section && (
								<div
									onClick={(e) => {
										if (!onClick) return
										onClick(e)
									}}
									className=" absolute flex gap-1 text-white tracking-wide text-lg justify-center items-center cursor-pointer top-0 right-[-2%] h-[28px] w-[2%] rounded-r-md bg-primary "
								/>
							)}
						</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	)
}
