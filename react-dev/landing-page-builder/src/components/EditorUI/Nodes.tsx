
import { EditorContextType, Parent } from "../../context/EditorContext";

import {
	ContentNode,
	CustomeCountDownNode,
	LayoutNode,
	

} from "@/types/node.type";

import { Chart } from "./NodeMap/AdvancedWidgets/ChartWidget";
import { Counter, IconBlock, Rating, Separators, Social } from "./NodeMap/AdvancedWidgets/MiscWidgets";
import { Button, FormField, Image, Video, NewNode, Table, Text } from "./NodeMap/Contents";
import { Container } from "./NodeMap/Container";
import { Accordion, Tab, TestimonialSlider } from "./NodeMap/AdvancedWidgets/StructuralWidgets";
import { ImageCarousel, ImageFlipFlop, ImageSlider } from "./NodeMap/AdvancedWidgets/ImageWidgets";
import { BlockCarousel } from "./NodeMap/StructuralContents";
import { GoogleMap, WebPage, YouTube } from "./NodeMap/AdvancedWidgets/EmbedWidgets";
import { CountDown, CountDownText, CustomCountDownWrapper } from "./NodeMap/AdvancedWidgets/CountDownWidgets";
import { Faq, PricingToggle, ProgressBar, Timeline } from "./NodeMap/AdvancedWidgets/DataDisplayWidgets";
import { ButtonEnterprise, CardsTemplate, EventWidgetsGroupTemplate, FooterTemplate, HeroTemplate, LayoutTemplate, NavBarTemplate, PersonalCardTemplate } from "./NodeMap/ReadymakeTemplate/ReadyMakeTemplates";


export interface LayoutNodeRenderProps extends React.HTMLAttributes<HTMLElement> {
	node: LayoutNode;
	canvas?: EditorContextType;
	path: string;
	parent?: Parent;
}

export interface CustomCountDownNodeRenderProps extends React.HTMLAttributes<HTMLElement> {
	node: CustomeCountDownNode;
	canvas?: EditorContextType;
	path: string;
	parent?: Parent;
}
export interface ContentNodeRenderProps<
	T extends ContentNode,
> extends React.HTMLAttributes<HTMLElement> {
	node: T;
	canvas?: EditorContextType;
	path: string;
	parent?: Parent;
}

export default {
  chart:Chart,
	iconBlock: IconBlock,
	newNode: NewNode,
	separators: Separators,
	root: Container,
	section: Container,
	block: Container,
	text: Text,
	image: Image,
	video: Video,
	button: Button,
	table: Table,
	accordion: Accordion,
	tab: Tab,
	imageSlider: ImageSlider,
	imageCarousel: ImageCarousel,
	blockCarousel: BlockCarousel,
	imageFlipFlop: ImageFlipFlop,
	googleMap: GoogleMap,
	youtube: YouTube,
	vimeo: YouTube,
	html: WebPage,
	countDown: CountDown,
	countDownText: CountDownText,
	customCountDownWrapper: CustomCountDownWrapper,
	social: Social,
	testimonialSlider: TestimonialSlider,
	progressBar: ProgressBar,
	counter: Counter,
	rating: Rating,
	timeline: Timeline,
	faq: Faq,
	pricingToggle: PricingToggle,
	cardsTemplate: CardsTemplate,
	navBarTemplate: NavBarTemplate,
	heroTemplate: HeroTemplate,
	eventWidgetsGroupTemplate: EventWidgetsGroupTemplate,
	personalCardTemplate: PersonalCardTemplate,
	footerTemplate: FooterTemplate,
	layoutTemplate: LayoutTemplate,
	tableEnterprise: Table,
	buttonEnterprise: ButtonEnterprise,
	formField: FormField,
};

// const defaultAnimate = (args:any) => {
// 	const { isSorting, wasDragging } = args;

// 	if (isSorting || wasDragging) {
// 		return defaultAnimateLayoutChanges(args);
// 	}
// 	return true;
// };

// const sortingStrategyMap = {
// 	row: verticalListSortingStrategy,
// 	column: horizontalListSortingStrategy,
// 	grid: rectSortingStrategy,
// };

// function PlaceHolder() {
// 	const canvas = useEditor()

// 	const { focusedNode } = canvas

// 	const placeHolderNode = generateNewNode('block', {
// 		style: canvas?.focusedNode?.style,
// 		children: canvas?.focusedNode?.children as CanvasNode[]
// 	})


// 	if (focusedNode)
// 		return <RenderNode node={placeHolderNode} path={canvas.placeholderPath.current || ''} />
// }




// function GridCellInsertMenu({
// 	canvas,
// 	containerPath,
// 	gridColumn,
// 	gridRow,
// }: {
// 	canvas: EditorContextType
// 	containerPath: string
// 	gridColumn: string
// 	gridRow: string
// }) {
// 	const [open, setOpen] = useState(false)

// 	const handleInsert = (contentType: ContentType) => {
// 		const newNode = generateNewNode(contentType, { style: { gridColumn, gridRow } })
// 		canvas.insertNode(newNode, undefined, containerPath)
// 		setOpen(false)
// 	}

// 	return (
// 		<Popover open={open} onOpenChange={setOpen}>
// 			<PopoverTrigger asChild>
// 				<button
// 					type="button"
// 					onClick={(e) => { e.stopPropagation(); setOpen(true) }}
// 					className="pointer-events-auto w-full h-full flex items-center justify-center bg-transparent border-none cursor-pointer text-highlight/60 hover:text-highlight hover:bg-highlight/10"
// 				>
// 					<PlusIcon className="size-[14px]" />
// 				</button>
// 			</PopoverTrigger>
// 			<PopoverContent
// 				side="top"
// 				align="center"
// 				sideOffset={6}
// 				className="w-auto p-1 flex gap-1 z-[99999]"
// 				onClick={(e) => e.stopPropagation()}
// 			>
// 				{GRID_CELL_QUICK_INSERT_TYPES.map(({ contentType, label, icon }) => (
// 					<button
// 						key={contentType}
// 						type="button"
// 						title={label}
// 						onClick={(e) => { e.stopPropagation(); handleInsert(contentType) }}
// 						className="flex items-center justify-center w-8 h-8 rounded-md bg-transparent border-none cursor-pointer text-foreground hover:bg-accent"
// 					>
// 						{icon}
// 					</button>
// 				))}
// 			</PopoverContent>
// 		</Popover>
// 	)
// }

// export function Container({
// 	node,
// 	children,
// 	canvas,
// 	path,
// 	parent,
// 	onClick,
// }: LayoutNodeRenderProps) {
// 	const isFocused = canvas?.focused?.id === node.id;
// 	const isParent = canvas?.focusedParent?.id === node.id;

// 	// Sections are reordered via arrow keys only (see reorderFocusedNode) —
// 	// they always span the full page width and stack top-to-bottom, so
// 	// free-form drag-and-drop reordering doesn't apply the way it does for
// 	// blocks/content. Disabling the drag here still allows dropping other
// 	// nodes onto/into a section (setDropRef stays active). Root is the single
// 	// page container and was never meant to be draggable at all — there's
// 	// nothing to reorder it against — but it shares this same Container
// 	// renderer, so it needs the same explicit opt-out.
// 	const isSection = node.contentType === 'section';
// 	const isRoot = node.contentType === 'root';

// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: isSection || isRoot || canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);


// 	};



// 	function getElemantByElId(elId: string): HTMLElement | null {
// 		return document.getElementById(elId)


// 	}





// 	const style = {
//  		...CSSUtils.stripNullStyleValues(node.style)
// 	};

// 	const handleAddSection: React.MouseEventHandler<HTMLButtonElement> = (e) => {
// 		e.stopPropagation();
// 		const lastIdx = parseInt(path.slice(-1));
// 		const newSectionNode = generateNewNode("section");
// 		canvas?.insertSection(newSectionNode, lastIdx + 1);
// 		canvas?.focusNode({ id: newSectionNode.id, path: path + "." + lastIdx + 1 });

// 	};



// 	const isSelected = canvas?.selectedNodes.find(n => n.id === node.id)


// 	const selctedStyle = () => {
// 		if (isSelected) {
// 			return {
// 				outline: "2px solid #a855f7",
// 				outlineOffset: "2px"
// 			};
// 		}

// 	}


// 	const isParentIsFocused = useMemo(() => {

// 		if (canvas?.focusedNode && ["block", 'section'].includes(canvas?.focusedNode.contentType)) {
// 			return (canvas?.focusedNode as LayoutNode)?.children?.find((childNode) => childNode.id === node.id)
// 		}
// 		return false
// 	}, [canvas?.focusedNode])

// 	const isGridLayout = node.style?.display === 'grid'
// 	const gridOverlay = useMemo(() => {
// 		if (!editorConfig.enable_grid_placeholders || !isGridLayout || !isFocused) return null
// 		const columns = CSSUtils.getGridCount(node.style?.gridTemplateColumns as string)
// 		const rows = CSSUtils.getGridCount(node.style?.gridTemplateRows as string)
// 		if (!columns || !rows) return null
// 		const filledCells = node.children?.length ?? 0
// 		return { columns, rows, filledCells }
// 	}, [isGridLayout, isFocused, node.style?.gridTemplateColumns, node.style?.gridTemplateRows, node.children?.length])

// 	if (canvas)

// 		return (
// 			<>

// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						{
// 							 <motion.div
// 								layout={isRoot ? false : "position"}
// 								transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}

// 								data-name='node'
// 								{...attributes}
// 								{...listeners}
// 								tabIndex={-1}
// 								onClick={(e) => {
// 									e.stopPropagation();
// 									e.preventDefault();
// 									if (!onClick) return;
// 									onClick(e);
// 								}}
// 								data-node-path={path}
// 								id={`${node?.attributes?.id ?? ""}`}
// 								data-id={`${node.id}`}
// 								ref={(el) => setNodeRef(el as HTMLDivElement)}
// 								style={{
// 									...style,
// 									// height:node.style.height,
// 									// zoom:path ==="root"? "70%":""
// 									...selctedStyle(),
// 									opacity: isDragging ? 0.3 : 1,
// 									...(gridOverlay && (!style.position || style.position === 'static') ? { position: 'relative' } : {}),

// 								}}

// 								className={cn(
// 									" node light  no-scrollbar  [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight hover:z-[12] cursor-default",

// 									isFocused && "outline outline-[1.5px] z-[11]",

// 									isParent || isParentIsFocused &&
// 									"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 									node.contentType !== "root" && "group",
// 									!node.style.backgroundColor &&
// 									!node.children?.length &&
// 									"bg-blue-200/50",
// 									isDragging && "  ",
// 									// node.contentType === CONTENT_TYPE.Section && 'overflow-hidden'
// 								)}
// 							>
// 								{children}

// 								{gridOverlay && (
// 									<div
// 										className="pointer-events-none grid absolute z-[1]"
// 										style={{
// 											top: 0,
// 											left: 0,
// 											right: 0,
// 											bottom: 0,
// 											gridTemplateColumns: node.style?.gridTemplateColumns,
// 											gridTemplateRows: node.style?.gridTemplateRows,
// 											gap: node.style?.gap,
// 										}}
// 									>
// 										{Array.from({ length: gridOverlay.columns * gridOverlay.rows }).map((_, i) => {
// 											const row = Math.floor(i / gridOverlay.columns) + 1;
// 											const col = (i % gridOverlay.columns) + 1;
// 											const isFilled = i < gridOverlay.filledCells;
// 											return (
// 												<div
// 													key={`grid-cell-${i}`}
// 													className={cn(
// 														"relative border border-dashed border-highlight/40 flex items-center justify-center group/gridcell",
// 														!isFilled && "bg-highlight/5 pointer-events-auto",
// 													)}
// 												>
// 													{!isFilled && canvas && (
// 														<>
// 															<span className="text-[10px] font-medium text-highlight/60 select-none group-hover/gridcell:opacity-0">
// 																{row}:{col}
// 															</span>
// 															<div className="absolute inset-0 opacity-0 group-hover/gridcell:opacity-100">
// 																<GridCellInsertMenu
// 																	canvas={canvas}
// 																	containerPath={path}
// 																	gridColumn={`${col} / ${col + 1}`}
// 																	gridRow={`${row} / ${row + 1}`}
// 																/>
// 															</div>
// 														</>
// 													)}
// 												</div>
// 											);
// 										})}
// 									</div>
// 								)}

// 								{node.contentType === CONTENT_TYPE.Section && (
// 									<button
// 										className={cn(
// 											"absolute  z-[9999999] flex items-center gap-1 -bottom-[13px] left-1/2 -translate-x-1/2 m-auto  bg-primary px-[7px] pr-[10px] py-[5px] text-[11px] font-medium text-white rounded-[20px] shadow-m ",
// 											isFocused || isParent
// 												? "group-hover:visible invisible"
// 												: "invisible",
// 										)}
// 										onClick={handleAddSection}
// 									>
// 										<PlusIcon className="size-[15px]" />
// 										Add Section
// 									</button>
// 								)}



// 								{
// 									node.contentType === CONTENT_TYPE.Section && <div onClick={(e) => {
// 										if (!onClick) return;
// 										onClick(e);
// 									}} className=" absolute flex gap-1 text-white tracking-wide text-lg justify-center items-center cursor-pointer top-0 right-[-2%] h-[28px] w-[2%] rounded-r-md bg-primary " >
// 										{/* <div className=" w-[1px] h-[70%] bg-slate-300 " ></div>
// 										<div className=" w-[1px] h-[80%] bg-slate-300/80 " ></div>
// 										<div className=" w-[1px] h-[70%] bg-slate-300/40 " ></div> */}
// 									</div>
// 								}



// 							</motion.div>
// 						}



// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none  z-[9999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>



// 				{isDragging && (
// 					<DragOverlay modifiers={[snapCenterToCursor]}>
// 						{
// 							<div
// 								id="drag-overlay"
// 								data-id={node.id}
// 								style={{
// 									...node.style,
// 									backgroundColor: 'transparent'
// 									// zoom:path ==="root"? "160%":""

// 								}}
// 								className={cn(
// 									" outline outline-[2px] h-full opacity-35 cursor-move",
// 									!node.style.backgroundColor &&
// 									!node.children?.length &&
// 									"bg-blue-200/60",
// 								)}
// 							>
// 								{children}
// 							</div>
// 						}
// 					</DragOverlay>
// 				)}
// 			</>

// 		);
// }

// export function Text({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	onClick,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<TextNode>) {

// 	const editorCanvas = useEditor()

// 	const editor = useTiptapEditor(
// 		{
// 			// autofocus: 'end',
// 			extensions: [...extensions],
// 			content: generateHTML(JSON.parse(node.children ?? "{}"), extensions),
// 			// content: node.children,
// 			onCreate: () => { },
// 			onUpdate: ({ editor }) => {
// 				editorCanvas?.updateNode((node) => {
// 					let tempNode: ContentNode = {
// 						...node,
// 						children: JSON.stringify(editor.getJSON()),
// 					} as ContentNode;

// 					return tempNode;
// 				}, path);
// 			},
// 		},
// 		[],
// 	);

// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: editorCanvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});
// 	const [collapsed, setCollapsed] = useState(true);

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const dragStyle = {
// 		// transform: CSS.Translate.toString(transform),
//  		// ...node.style,
// 	};

// 	const handleOnClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
// 		e.stopPropagation();
// 		if (typeof onClick === "function") onClick(e);

// 		editorCanvas?.setTextEditorObj(editor);
// 	};

// 	const style: CSSProperties = {
// 		...node.style,
// 		overflow: collapsed ? "hidden" : undefined,
// 		display: collapsed ? "-webkit-box" : undefined,
// 		WebkitBoxOrient: collapsed ? "vertical" : undefined,
// 		WebkitLineClamp: collapsed ? node.style.WebkitLineClamp : undefined,
// 	};

// 	if (editorCanvas)
// 		return (
// 			<>
// 				<Popover open={editorCanvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'


// 							{...props}
// 							{...attributes}
// 							{...listeners}
// 							id={node.attributes?.id??''}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							style={dragStyle}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-id={node.id}

// 							tabIndex={-1}
// 							data-node-path={path}
// 							onClick={handleOnClick}
							
// 							className={cn(
// 								"hover:outline ed-text outline-[1px] outline-highlight -outline-offset-[0.5px] prose cursor-text h-fit",
// 								editorCanvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								editorCanvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								editorCanvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0",
// 								isDragging && " invisible",
// 							)}
// 						>
// 							<EditorContent
// 								editor={editor}
// 								className="[&>div]:border-none prose [&>div]:outline-none"
// 								autoCapitalize="off"
// 								autoComplete="off"
// 								autoCorrect="off"
// 								spellCheck={false}
// 								style={{
// 									...style,
// 									color: style.color ?? '#000000'
// 								}}
// 							/>
// 							{node.collapsable && (
// 								<button
// 									className=" font-normal text-primary hover:text-blue-700"
// 									style={{
// 										fontSize:
// 											CSSUtils.pxToEm(
// 												CSSUtils.extractEmValue(
// 													editor?.getAttributes("textStyle").fontSize,
// 												) || 16,
// 											) + "em",
// 									}}
// 									onClick={() => {
// 										setCollapsed((prev) => !prev);
// 									}}
// 								>
// 									{collapsed ? "Read More" : "Read Less"}
// 								</button>
// 							)}
// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={editorCanvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[snapCenterToCursor]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className=" outline outline-[2px] outline-highlight"
// 							dangerouslySetInnerHTML={{ __html: sanitizeHtml(editor?.getHTML()) as TrustedHTML | string }}
// 						></div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// export function Image({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<ImageNode>) {
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		// transform: CSS.Translate.toString(transform),
//  		...CSSUtils.stripNullStyleValues(node.style),
// 	};

// 	/**
// 	 * File handling
// 	 */
// 	const { data } = useGetPageDataQuery("");

// 	const { handleUpload, selectedFile } = useUploadToS3({
// 		subFolder: `${data?.user_id}/${data?.id}`,
// 	});

// 	const handleFileChange = async (files: FileList) => {
// 		if (files.length > 1) {
// 			// toast.error('Multiple files detected. PLease select only one file.')
// 			return;
// 		}

// 		const file = files[0];

// 		const response = await handleUpload(file);

// 		canvas?.updateNode((node) => {
// 			let tempNode = node;

// 			return {
// 				...tempNode,
// 				children: response?.access_url,
// 			} as ContentNode;
// 		}, path);
// 	};

// 	const { dragHandlers, isDragging: fileIsDragging } =
// 		useFileDrop(handleFileChange);




// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}
// 							{...dragHandlers}id={node.attributes?.id??''}
// 							style={style}
// 							data-id={node.id}

// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								"[&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0",
// 								node.children
// 									? ""
// 									: "bg-blue-200/50 flex items-center justify-center",
// 								fileIsDragging && "!outline-dashed outline-2 !bg-blue-100/60",
// 								isDragging && " invisible",
// 							)}
// 						>
// 							{((node as any).children || selectedFile?.object_url || (node as unknown as ImageNode)?.src?.length > 1) ? <img style={node.style} src={(node as any).children || selectedFile?.object_url || (node as unknown as ImageNode)?.src} className=" object-cover max-none" key={node.id + '_image'} />
// 								:
// 								<div className="flex items-center justify-center size-[40%] mx-auto max-w-[6rem] max-h-[6rem]">
// 									<CiImageOn size="100%" className="text-blue-300" />
// 								</div>
// 							}
// 							{/* {node.children || selectedFile?.object_url ? (
// 								<img
// 									src={node.children || selectedFile?.object_url}
// 									className="w-full h-full object-cover max-none"
// 									key={node.id + "_image"}
// 								/>
// 							) : (
// 								<div className="flex items-center justify-center size-[40%] mx-auto max-w-[6rem] max-h-[6rem]">
// 									<CiImageOn size="100%" className="text-blue-300" />
// 								</div>
// 							)} */}
// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[snapCenterToCursor]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className={cn(
// 								"h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
// 								!node.style.backgroundColor &&
// 								!node.children?.length &&
// 								"bg-blue-200/60",
// 							)}
// 						>
// 							{node.children ? (
// 								<img
// 									key={node.id + "_drag-overlay"}
// 									src={node.children}
// 									className="w-full h-full object-cover"
// 								/>
// 							) : (
// 								<div className="flex items-center justify-center size-[40%] mx-auto">
// 									<CiImageOn size="100%" className="text-gray-400" />
// 								</div>
// 							)}
// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// export function Button({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<ButtonNode>) {
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		// transform: CSS.Translate.toString(transform),
//  		...CSSUtils.stripNullStyleValues(node.style),
// 	};

// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}id={node.attributes?.id??''}
// 							data-id={node.id}

// 							style={{
// 								...style,
// 								fontSize: "1em",
// 							}}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							className={cn(
// 								"[&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0",
// 								// isDragging && '!bg-blue-100 !text-blue-100 outline-0'
// 								isDragging && " invisible",
// 							)}
// 						>
// 							<span style={{ fontSize: style.fontSize }}>{node.children}</span>
// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay>
// 						{
// 							<div
// 								id="drag-overlay"
// 								data-id={node.id}
// 								style={node.style}
// 								className="!w-full outline outline-[1px] outline-highlight"
// 							>
// 								{node.children}
// 							</div>
// 						}
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// export function Table({
// 	node,
// 	canvas,
// 	path,
// 	onClick,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<TableNode | TableEnterpriseNode>) {
// 	const tipTap = useTiptapEditor(
// 		{
// 			// autofocus: 'end',
// 			extensions: [...extensions],
// 			content: generateHTML(((node)?.children), extensions),
// 			// onCreate: ({editor}) => {
// 			//   if(node.children) return;
// 			//   editor?.chain().focus().insertTable({rows: 3, cols: 3, withHeaderRow: true}).run()
// 			// },
// 			onUpdate: ({ editor }) => {
// 				canvas?.updateNode((node) => {
// 					let tempNode: ContentNode = {
// 						...node,
// 						children: editor.getJSON(),
// 					} as ContentNode;

// 					return tempNode;
// 				}, path);
// 			},
// 		},
// 		[],
// 	);

// 	// //console.log(tipTap?.getJSON())

// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		// transform: CSS.Translate.toString(transform),
//  	};

// 	const handleOnClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
// 		if (typeof onClick === "function") onClick(e);

// 		canvas?.setTextEditorObj(tipTap);
// 	};

// 	useLayoutEffect(() => { }, []);

// 	const idClassName = "table-node-" + node.id;

// 	const dynamicTableStyle = buildTableUiTypeStyle(node, idClassName);

// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							{...attributes}
// 							{...listeners}id={node.attributes?.id??''}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							style={style}
// 							data-id={node.id}

// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							onClick={handleOnClick}
// 							className={cn(
// 								"table-node hover:outline outline-[1px] outline-highlight -outline-offset-[0.5px] !h-fit cursor-default",
// 								canvas.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0",
// 								isDragging && " invisible",
// 								idClassName,
// 							)}
// 						>
// 							<style>{dynamicTableStyle}</style>
// 							<EditorContent
// 								editor={tipTap}
// 								className="[&>div]:border-none [&>div]:outline-none "
// 								autoCapitalize="off"
// 								autoComplete="off"
// 								autoCorrect="off"
// 								spellCheck={false}
// 							/>
// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className={cn(
// 								"dragged-table h-full w-full outline outline-[2px] outline-highlight",
// 								idClassName,
// 							)}
// 							dangerouslySetInnerHTML={{ __html: sanitizeHtml(tipTap?.getHTML()) as string | TrustedHTML }}
// 						></div>
// 						{/* <EditorContent editor={tipTap} className="[&>div]:border-none [&>div]:outline-none " autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck={false} /> */}
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// export function Accordion({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	children,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> &
// 	ContentNodeRenderProps<AccordionNode>) {
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		// transform: CSS.Translate.toString(transform),
//  		// ...node.style,
// 	};

// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}id={node.attributes?.id??''}
// 							data-id={node.id}

// 							style={{
// 								...style,
// 								fontSize: "1em",
// 							}}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							className={cn(
// 								"[&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0",
// 								// isDragging && '!bg-blue-100 !text-blue-100 outline-0'
// 								isDragging && " invisible",
// 							)}
// 						>
// 							<AccordionBase defaultValue="open" type="single" collapsible className="w-full">
// 								<AccordionItem value={node.id}>
// 									<AccordionTrigger style={node.style}>
// 										{node.header}
// 									</AccordionTrigger>
// 									<AccordionContent className="pl-[2.75em]">
// 										<div
// 											style={{
// 												...node.contentStyle,

// 												// padding: node.style.padding,
// 											}}
// 										>
// 											{children}
// 										</div>
// 									</AccordionContent>
// 								</AccordionItem>
// 							</AccordionBase>
// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay>
// 						{
// 							<AccordionBase
// 								type="single"
// 								id="drag-overlay"
// 								data-id={node.id}
// 								className="!w-full outline outline-[1px] outline-highlight"
// 							>
// 								<AccordionItem value={node.id}>
// 									<AccordionTrigger style={node.style}>
// 										{node.header}
// 									</AccordionTrigger>
// 									<AccordionContent
// 										style={{
// 											...node.contentStyle,
// 											padding: node.style.padding,
// 										}}
// 									>
// 										{children}
// 									</AccordionContent>
// 								</AccordionItem>
// 							</AccordionBase>
// 						}
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// export function Tab({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	children,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<TabNode>) {
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		// transform: CSS.Translate.toString(transform),
//  		// ...node.style,
// 	};

// 	const { tabType, color } = node
// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}id={node.attributes?.id??''}
// 							data-id={node.id}

// 							style={{
// 								...style,
// 								fontSize: "1em",
// 								width: '100%',
// 								height: "fit-content"
// 							}}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							className={cn(
// 								"[&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0",
// 								// isDragging && '!bg-blue-100 !text-blue-100 outline-0'
// 								isDragging && " invisible",
// 							)}
// 						>
// 							<Tabs
// 								className=""
// 								defaultValue="0"
// 								style={{
// 									flexDirection: tabType === 'vertical' ? 'row' : 'column'
// 								}}
// 								value={node.activeTab.toString()}
// 								onValueChange={(v) =>
// 									canvas.updateNode((node) => {
// 										return {
// 											...node,
// 											activeTab: Number(v),
// 										};
// 									})
// 								}
// 							>
// 								<div style={{
// 									borderBottom: tabType === 'horizontal' ? '0.16em solid  #d4d4d486' : '',
// 									borderRight: tabType === 'vertical' ? '0.16em solid #d4d4d486 ' : ''
// 								}} className=" border-[#d4d4d486]   ">
// 									<TabsList style={{
// 										flexDirection: tabType === 'vertical' ? 'column' : 'row',
// 										"--active-color": color?.active || `#1a85ff`
// 									} as React.CSSProperties} className=" flex " >
// 										{node.tabs.map((tab, idx) => (
// 											<TabsTrigger
// 												className={cn(
// 													"data-[state=active]:bg-[color-mix(in_srgb,var(--active-color)_10%,transparent)]",
// 													"data-[state=active]:border-[var(--active-color)]",
// 													"data-[state=active]:text-[var(--active-color)]"
// 												)} key={tab.name} value={idx.toString()}>
// 												{tab.name}
// 											</TabsTrigger>
// 										))}
// 									</TabsList>
// 								</div>
// 								{node.tabs.map((tab, idx) => (
// 									<TabsContent key={tab.name} value={idx.toString()}>
// 										{tab.children.map((tabChild, idx) => (
// 											<RenderNode
// 												node={tabChild}
// 												path={path + "." + idx}
// 												parent={{ id: node.id, path }}
// 												canvas={canvas}
// 											/>
// 										))}
// 									</TabsContent>
// 								))}
// 							</Tabs>
// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[snapCenterToCursor]}>
// 						{
// 							<div
// 								id="drag-overlay"
// 								data-id={node.id}
// 								style={{
// 									fontSize: "1em",
// 									width: '100%',
// 									height: "fit-content",
// 								}}
// 								className="outline outline-[2px] outline-highlight opacity-80"
// 							>
// 								<Tabs
// 									className=""
// 									defaultValue="0"
// 									style={{
// 										flexDirection: tabType === 'vertical' ? 'row' : 'column'
// 									}}
// 									value={node.activeTab.toString()}
// 								>
// 									<div style={{
// 										borderBottom: tabType === 'horizontal' ? '0.16em solid  #d4d4d486' : '',
// 										borderRight: tabType === 'vertical' ? '0.16em solid #d4d4d486 ' : ''
// 									}} className=" border-[#d4d4d486]   ">
// 										<TabsList style={{
// 											flexDirection: tabType === 'vertical' ? 'column' : 'row',
// 											"--active-color": color?.active || `#1a85ff`
// 										} as React.CSSProperties} className=" flex " >
// 											{node.tabs.map((tab, idx) => (
// 												<TabsTrigger
// 													className={cn(
// 														"data-[state=active]:bg-[color-mix(in_srgb,var(--active-color)_10%,transparent)]",
// 														"data-[state=active]:border-[var(--active-color)]",
// 														"data-[state=active]:text-[var(--active-color)]"
// 													)} key={tab.name} value={idx.toString()}>
// 													{tab.name}
// 												</TabsTrigger>
// 											))}
// 										</TabsList>
// 									</div>
// 									{node.tabs.map((tab, idx) => (
// 										<TabsContent key={tab.name} value={idx.toString()}>
// 											{tab.children.map((tabChild, idx) => (
// 												<RenderNode
// 													node={tabChild}
// 													path={path + "." + idx}
// 													parent={{ id: node.id, path }}
// 													canvas={canvas}
// 												/>
// 											))}
// 										</TabsContent>
// 									))}
// 								</Tabs>
// 							</div>
// 						}
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// export function ImageSlider({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> &
// 	ContentNodeRenderProps<ImageSliderNode>) {
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
//  		...CSSUtils.stripNullStyleValues(node.style),
// 	};

// 	/**
// 	 * Upload
// 	 */
// 	const { data } = useGetPageDataQuery("");

// 	const { handleUpload, selectedFile } = useUploadToS3({
// 		subFolder: `${data?.user_id}/${data?.id}`,
// 	});

// 	const handleFileChange = async (files: FileList) => {
// 		if (!files.length) return;

// 		const uploads = await Promise.all(
// 			[...files].map((file) => handleUpload(file)),
// 		);

// 		const newImages: ImageSliderItem[] = uploads
// 			.filter(Boolean)
// 			.map((res) => ({ url: res!.access_url }));

// 		canvas?.updateNode((n) => {
// 			return {
// 				...n,
// 				images: [...(n as ImageSliderNode).images, ...newImages],
// 			} as ContentNode;
// 		}, path);
// 	};

// 	const { dragHandlers, isDragging: fileIsDragging } =
// 		useFileDrop(handleFileChange);

// 	if (!canvas) return null;

// 	return (
// 		<>
// 			<Popover open={canvas.focused?.id === node.id}>
// 				<PopoverTrigger asChild>
// 					<motion.div
// 						layout="position"
// 						transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 						data-name='node'
// 						{...props}
// 						ref={(el) => setNodeRef(el as HTMLDivElement)}
// 						{...attributes}
// 						{...listeners}
// 						{...dragHandlers}
// 						id={node.id}
// 						data-id={node.id}

// 						style={{
// 							...style,
// 							fontSize: "1em",
// 							height: "fit-content",
// 							maxHeight: "none",
// 						}}
// 						data-node-path={path}
// 						className={cn(
// 							"relative overflow-hidden outline outline-[1px] outline-highlight -outline-offset-[0.5px] w-full",
// 							canvas.focused?.id === node.id && "outline-[1.5px]",
// 							canvas?.isParentIsFocused(node.id) &&
// 							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 							fileIsDragging && "!outline-dashed outline-2 !bg-blue-100/60",
// 							isDragging && "invisible",
// 						)}
// 					>
// 						{/* <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory"> */}
// 						{node.images?.length || selectedFile?.object_url ? (
// 							<Slider
// 								className="w-full h-full"
// 								opts={{ loop: true, autoPlay: false }}
// 							>
// 								<SliderContent>
// 									{node.images.map((img, index) => (
// 										<SliderItem key={index}>
// 											<img
// 												src={img.url}
// 												alt={img.altText || ""}
// 												className="w-full h-full max-h-[30em] m"
// 												style={{
// 													objectFit: node.objectFit || "contain",
// 													backgroundColor:
// 														node.imageBackground || "transparent",
// 													height: CSSUtils.extractEmValue(style.height),
// 													maxHeight: CSSUtils.extractEmValue(style.maxHeight),
// 													// maxHeight:
// 													// 	CSSUtils.extractEmValue(style.maxHeight) *
// 													// 		(editorConfig.root_font_size * canvas.zoomLevel) +
// 													// 	"px",
// 												}}
// 											/>
// 										</SliderItem>
// 									))}
// 								</SliderContent>
// 								<>
// 									<SliderPrevious />
// 									<SliderNext />
// 									<SliderDots />
// 								</>
// 							</Slider>
// 						) : (
// 							<div className="flex items-center justify-center w-full h-full bg-blue-200/50">
// 								<TbCarouselHorizontal
// 									strokeWidth={1.3}
// 									size="40%"
// 									className="text-blue-300"
// 								/>
// 							</div>
// 						)}
// 						{/* </div> */}
// 					</motion.div>
// 				</PopoverTrigger>

// 				{!isDragging && (
// 					<PopoverContent
// 						side="top"
// 						align="center"
// 						sideOffset={10}
// 						className="shadow-none  z-[999999]"
// 						onClick={(e) => e.stopPropagation()}
// 						onCloseAutoFocus={(e) => e.preventDefault()}
// 						onOpenAutoFocus={(e) => e.preventDefault()}
// 					>
// 						<ActionMenu canvas={canvas} />
// 					</PopoverContent>
// 				)}
// 			</Popover>

// 			{isDragging && (
// 				<DragOverlay>
// 					<div
// 						style={node.style}
// 						className="h-full w-full outline outline-[2px] opacity-80 overflow-hidden"
// 					>
// 						{node.images[0] && (
// 							<img
// 								src={node.images[0].url}
// 								className="w-full h-full object-cover"
// 							/>
// 						)}
// 					</div>
// 				</DragOverlay>
// 			)}
// 		</>
// 	);
// }

// export function ImageCarousel({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> &
// 	ContentNodeRenderProps<ImageCarouselNode>) {
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
//  		...CSSUtils.stripNullStyleValues(node.style),
// 	};

// 	/**
// 	 * Upload
// 	 */
// 	const { data } = useGetPageDataQuery("");

// 	const { handleUpload, selectedFile } = useUploadToS3({
// 		subFolder: `${data?.user_id}/${data?.id}`,
// 	});

// 	const handleFileChange = async (files: FileList) => {
// 		if (!files.length) return;

// 		const uploads = await Promise.all(
// 			[...files].map((file) => handleUpload(file)),
// 		);

// 		const newImages: ImageCarouselItem[] = uploads
// 			.filter(Boolean)
// 			.map((res) => ({ url: res!.access_url }));

// 		canvas?.updateNode((n) => {
// 			return {
// 				...n,
// 				images: [...(n as ImageCarouselNode).images, ...newImages],
// 			} as ContentNode;
// 		}, path);
// 	};

// 	const { dragHandlers, isDragging: fileIsDragging } =
// 		useFileDrop(handleFileChange);

// 	if (!canvas) return null;

// 	//console.log(style);

// 	return (
// 		<>
// 			<Popover open={canvas.focused?.id === node.id}>
// 				<PopoverTrigger asChild>
// 					<motion.div
// 						layout="position"
// 						transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 						data-name='node'
// 						{...props}
// 						ref={(el) => setNodeRef(el as HTMLDivElement)}
// 						{...attributes}
// 						{...listeners}
// 						{...dragHandlers}
// 						id={node.id}
// 						data-id={node.id}

// 						style={{
// 							...style,
// 							fontSize: "1em",
// 							height: "fit-content",
// 							// maxHeight: "none",
// 						}}
// 						data-node-path={path}
// 						className={cn(
// 							"relative overflow-hidden outline outline-[1px] outline-highlight -outline-offset-[0.5px]",
// 							canvas.focused?.id === node.id && "outline-[1.5px]",
// 							canvas?.isParentIsFocused(node.id) &&
// 							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 							fileIsDragging && "!outline-dashed outline-2 !bg-blue-100/60",
// 							isDragging && "invisible",
// 						)}
// 					>
// 						{/* <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory"> */}
// 						{node.images?.length || selectedFile?.object_url ? (
// 							<Carousel
// 								className="h-fit text-[1em] flex items-center justify-center"
// 								style={{
// 									fontSize: "1em",
// 									height: style.height || "auto",
// 								}}
// 								opts={{
// 									loop: true,
// 									autoPlay: node.autoPlay,
// 									slidesToScroll: node.slidesPerScroll || 1,
// 								}}
// 								autoPlayOptions={{
// 									delay: node.delay || 3000,
// 								}}
// 							>
// 								<CarouselContent className="h-full w-full -ml-[0em]">
// 									{node.images.map((img, index) => (
// 										<CarouselItem
// 											key={index}
// 											className="flex items-center justify-center basis-[25%]"
// 											style={{
// 												flexBasis: `${100 / (node.imagesPerView || 4)}%`,
// 												paddingInline: `${(node.gap ?? 0) / 2}px`,
// 											}}
// 										>
// 											<img
// 												src={img.url}
// 												alt={img.altText || ""}
// 												className="w-full h-full max-none"
// 												style={{ objectFit: node.objectFit || "contain" }}
// 											/>
// 										</CarouselItem>
// 									))}
// 								</CarouselContent>
// 								<>
// 									<CarouselPrevious />
// 									<CarouselNext />
// 									{/* <CarouselDots /> */}
// 								</>
// 							</Carousel>
// 						) : (
// 							<div className="flex items-center justify-center w-full h-full bg-blue-200/50">
// 								<TbCarouselHorizontal
// 									strokeWidth={1.3}
// 									size="40%"
// 									className="text-blue-300"
// 								/>
// 							</div>
// 						)}
// 						{/* </div> */}
// 					</motion.div>
// 				</PopoverTrigger>

// 				{!isDragging && (
// 					<PopoverContent
// 						side="top"
// 						align="center"
// 						sideOffset={10}
// 						alignOffset={2}
// 						className="shadow-none z-[999999] "
// 						onClick={(e) => e.stopPropagation()}
// 						onCloseAutoFocus={(e) => e.preventDefault()}
// 						onOpenAutoFocus={(e) => e.preventDefault()}
// 					>
// 						<ActionMenu canvas={canvas} />
// 					</PopoverContent>
// 				)}
// 			</Popover>

// 			{isDragging && (
// 				<DragOverlay>
// 					<div
// 						style={node.style}
// 						className="h-full w-full outline outline-[2px] opacity-80 overflow-hidden"
// 					>
// 						{node.images[0] && (
// 							<img
// 								src={node.images[0].url}
// 								className="w-full h-full object-cover"
// 							/>
// 						)}
// 					</div>
// 				</DragOverlay>
// 			)}
// 		</>
// 	);
// }
// export function BlockCarousel({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> &
// 	ContentNodeRenderProps<BlockCarouselNode>) {
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
//  		...CSSUtils.stripNullStyleValues(node.style),
// 	};

// 	/**
// 	 * Upload
// 	 */
// 	const { data } = useGetPageDataQuery("");

// 	const { handleUpload, selectedFile } = useUploadToS3({
// 		subFolder: `${data?.user_id}/${data?.id}`,
// 	});

// 	const handleFileChange = async (files: FileList) => {
// 		if (!files.length) return;

// 		const uploads = await Promise.all(
// 			[...files].map((file) => handleUpload(file)),
// 		);

// 		const newImages: ImageCarouselItem[] = uploads
// 			.filter(Boolean)
// 			.map((res) => ({ url: res!.access_url }));

// 		canvas?.updateNode((n) => {
// 			return {
// 				...n,
// 				images: [...(n as ImageCarouselNode).images, ...newImages],
// 			} as ContentNode;
// 		}, path);
// 	};

// 	const { dragHandlers, isDragging: fileIsDragging } =
// 		useFileDrop(handleFileChange);

// 	if (!canvas) return null;

// 	//console.log(style);

// 	return (
// 		<>
// 			<Popover open={canvas.focused?.id === node.id}>
// 				<PopoverTrigger asChild>
// 					<motion.div
// 						layout="position"
// 						transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 						data-name='node'
// 						{...props}
// 						ref={(el) => setNodeRef(el as HTMLDivElement)}
// 						{...attributes}
// 						{...listeners}
// 						{...dragHandlers}
// 						id={node.id}
// 						data-id={node.id}

// 						style={{
// 							...style,
// 							fontSize: "1em",
// 							height: "fit-content",
// 							// maxHeight: "none",
// 						}}
// 						data-node-path={path}
// 						className={cn(
// 							"relative overflow-hidden outline outline-[1px] outline-highlight -outline-offset-[0.5px]",
// 							canvas.focused?.id === node.id && "outline-[1.5px]",
// 							fileIsDragging && "!outline-dashed outline-2 !bg-blue-100/60",
// 							isDragging && "invisible",
// 						)}
// 					>
// 						{/* <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory"> */}
// 						{node.blockes?.length ? (
// 							<Carousel
// 								className="h-fit text-[1em] flex items-center justify-center"
// 								style={{
// 									fontSize: "1em",
// 									height: style.height || "auto",
// 								}}
// 								opts={{
// 									loop: true,
// 									autoPlay: node.autoPlay,
// 									slidesToScroll: node.slidesPerScroll || 1,
// 								}}
// 								autoPlayOptions={{
// 									delay: node.delay || 3000,
// 								}}
// 							>
// 								<CarouselContent className="h-full w-full -ml-[0em]">
// 									{node.blockes.map((BlockNode, index) => (
// 										<CarouselItem
// 											key={index}
// 											className="flex items-center justify-center basis-[25%]"
// 											style={{
// 												flexBasis: `${100 / (node.blockesPerView || 4)}%`,
// 												paddingInline: `${(node.gap ?? 0) / 2}px`,
// 											}}
// 										>
// 											<RenderNode path="container" node={BlockNode} />
// 										</CarouselItem>
// 									))}
// 								</CarouselContent>
// 								<>
// 									<CarouselPrevious />
// 									<CarouselNext />
// 									{/* <CarouselDots /> */}
// 								</>
// 							</Carousel>
// 						) : (
// 							<div className="flex items-center justify-center w-full h-full bg-blue-200/50">
// 								<TbCarouselHorizontal
// 									strokeWidth={1.3}
// 									size="40%"
// 									className="text-blue-300"
// 								/>
// 							</div>
// 						)}
// 						{/* </div> */}
// 					</motion.div>
// 				</PopoverTrigger>

// 				{!isDragging && (
// 					<PopoverContent
// 						side="top"
// 						align="center"
// 						sideOffset={10}
// 						className="shadow-none"
// 						onClick={(e) => e.stopPropagation()}
// 						onCloseAutoFocus={(e) => e.preventDefault()}
// 						onOpenAutoFocus={(e) => e.preventDefault()}
// 					>
// 						<ActionMenu canvas={canvas} />
// 					</PopoverContent>
// 				)}
// 			</Popover>

// 			{isDragging && (
// 				<DragOverlay>
// 					<div
// 						style={node.style}
// 						className="h-full w-full outline outline-[2px] opacity-80 overflow-hidden"
// 					>
// 						{node.images[0] && (
// 							<img
// 								src={node.images[0].url}
// 								className="w-full h-full object-cover"
// 							/>
// 						)}
// 					</div>
// 				</DragOverlay>
// 			)}
// 		</>
// 	);
// }

// export function TestimonialSlider({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	children,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> &
// 	ContentNodeRenderProps<TestimonialSliderNode>) {
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		...CSSUtils.stripNullStyleValues(node.style),
// 	};

// 	const slideChildren = React.Children.toArray(children);

// 	if (!canvas) return null;

// 	return (
// 		<>
// 			<Popover open={canvas.focused?.id === node.id}>
// 				<PopoverTrigger asChild>
// 					<motion.div
// 						layout="position"
// 						transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 						data-name='node'
// 						{...props}
// 						ref={(el) => setNodeRef(el as HTMLDivElement)}
// 						{...attributes}
// 						{...listeners}
// 						id={node.attributes?.id ?? ''}
// 						data-id={node.id}
// 						style={{
// 							...style,
// 						}}
// 						data-node-path={path}
// 						className={cn(
// 							"relative overflow-hidden [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] cursor-default w-full",
// 							canvas.focused?.id === node.id && "outline outline-[1.5px]",
// 							canvas?.isParentIsFocused(node.id) &&
// 							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 							canvas?.focusedParent?.id === node.id &&
// 							"outline-dashed outline-offset-0",
// 							isDragging && "invisible",
// 						)}
// 					>
// 						{slideChildren.length ? (
// 							<Slider
// 								className="w-full h-full"
// 								opts={{ loop: true, autoPlay: node.autoPlay }}
// 							>
// 								<SliderContent className="h-full">
// 									{slideChildren.map((slide, index) => (
// 										<SliderItem key={index} className="h-full">
// 											{slide}
// 										</SliderItem>
// 									))}
// 								</SliderContent>
// 								{node.showArrows !== false && (
// 									<>
// 										<SliderPrevious />
// 										<SliderNext />
// 									</>
// 								)}
// 								{node.showDots !== false && <SliderDots />}
// 							</Slider>
// 						) : (
// 							<div className="flex items-center justify-center w-full h-full bg-blue-200/50 min-h-[10em]">
// 								<PiChatCircleTextDuotone
// 									size="35%"
// 									className="text-blue-300"
// 								/>
// 							</div>
// 						)}
// 					</motion.div>
// 				</PopoverTrigger>

// 				{!isDragging && (
// 					<PopoverContent
// 						side="top"
// 						align="center"
// 						sideOffset={10}
// 						className="shadow-none z-[9999] !bg-transparent"
// 						onClick={(e) => e.stopPropagation()}
// 						onCloseAutoFocus={(e) => e.preventDefault()}
// 						onOpenAutoFocus={(e) => e.preventDefault()}
// 					>
// 						<ActionMenu canvas={canvas} />
// 					</PopoverContent>
// 				)}
// 			</Popover>

// 			{isDragging && (
// 				<DragOverlay modifiers={[snapCenterToCursor]}>
// 					<div
// 						style={node.style}
// 						className="h-full w-full outline outline-[2px] opacity-80 overflow-hidden flex items-center justify-center bg-blue-200/60"
// 					>
// 						<PiChatCircleTextDuotone size="35%" className="text-blue-300" />
// 					</div>
// 				</DragOverlay>
// 			)}
// 		</>
// 	);
// }

// export function ProgressBar({
// 	node,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<ProgressBarNode>) {
// 	const canvas = useEditor()
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		...CSSUtils.stripNullStyleValues(node.style),
// 	};

// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}
// 							id={node.attributes?.id ?? ''}
// 							data-id={node.id}
// 							style={style}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								"!p-2 [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0",
// 								isDragging && "invisible",
// 							)}
// 						>
// 							<ProgressBarVisual node={node} />
// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[9999] !bg-transparent"
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className="outline outline-[2px] opacity-80"
// 						>
// 							<ProgressBarVisual node={node} />
// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// export function ImageFlipFlop({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> &
// 	ContentNodeRenderProps<ImageFlipFlopNode>) {
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const { data } = useGetPageDataQuery("");

// 	const { handleUpload, selectedFile } = useUploadToS3({
// 		subFolder: `${data?.user_id}/${data?.id}`,
// 	});

// 	const handleFileChange = async (files: FileList) => {
// 		if (!files.length) return;
// 		const file = files[0];
// 		const response = await handleUpload(file);
// 		canvas?.updateNode((n) => {
// 			return { ...n, imageUrl: response?.access_url ?? "" } as ContentNode;
// 		}, path);
// 	};

// 	const { dragHandlers, isDragging: fileIsDragging } =
// 		useFileDrop(handleFileChange);

// 	if (!canvas) return null;

// 	const style = {
//  		...CSSUtils.stripNullStyleValues(node.style),
// 	};

// 	return (
// 		<>
// 			<Popover open={canvas.focused?.id === node.id}>
// 				<PopoverTrigger asChild>
// 					<motion.div
// 						layout="position"
// 						transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 						data-name='node'
// 						{...props}
// 						ref={(el) => setNodeRef(el as HTMLDivElement)}
// 						{...attributes}
// 						{...listeners}
// 						{...dragHandlers}
// 						id={node.id}
// 						data-id={node.id}

// 						style={style}
// 						data-node-path={path}
// 						className={cn(
// 							"relative overflow-hidden outline outline-[1px] outline-highlight -outline-offset-[0.5px] group/flipflop",
// 							"[perspective:800px]",
// 							canvas.focused?.id === node.id && "outline-[1.5px]",
// 							canvas?.isParentIsFocused(node.id) &&
// 							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 							fileIsDragging && "!outline-dashed outline-2 !bg-blue-100/60",
// 							isDragging && "invisible",
// 						)}
// 					>
// 						{/* Flip container */}
// 						<div
// 							className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] group-hover/flipflop:[transform:rotateY(180deg)]"
// 							style={{ transformStyle: "preserve-3d" }}
// 						>
// 							{/* Front face – image */}
// 							<div
// 								className="absolute inset-0 w-full h-full [backface-visibility:hidden]"
// 								style={{ backfaceVisibility: "hidden" }}
// 							>
// 								{node.imageUrl ? (
// 									<img
// 										src={node.imageUrl}
// 										alt="flip-flop"
// 										className="w-full h-full object-cover"
// 									/>
// 								) : (
// 									<label
// 										htmlFor={`flipflop-uploader-${node.id}`}
// 										className="flex flex-col items-center justify-center w-full h-full bg-blue-200/50 cursor-pointer gap-2"
// 									>
// 										<CiImageOn size={40} className="text-blue-400" />
// 										<span className="text-[0.8em] text-blue-500 font-medium">
// 											Upload Image
// 										</span>
// 									</label>
// 								)}
// 							</div>

// 							{/* Back face – text */}
// 							<div
// 								className="absolute inset-0 w-full h-full flex items-center justify-center px-4 [backface-visibility:hidden] [transform:rotateY(180deg)]"
// 								style={{
// 									backfaceVisibility: "hidden",
// 									backgroundColor: node.flipBackgroundColor || "#1e293b",
// 									transform: "rotateY(180deg)",
// 								}}
// 							>
// 								<p style={node.flipTextStyle}>{node.flipText}</p>
// 							</div>
// 						</div>

// 						<FileUploadInput
// 							id={`flipflop-uploader-${node.id}`}
// 							onFilesSelected={handleFileChange}
// 						/>
// 					</motion.div>
// 				</PopoverTrigger>

// 				{!isDragging && (
// 					<PopoverContent
// 						side="top"
// 						align="center"
// 						sideOffset={10}
// 						className="shadow-none  z-[999999]"
// 						onClick={(e) => e.stopPropagation()}
// 						onCloseAutoFocus={(e) => e.preventDefault()}
// 						onOpenAutoFocus={(e) => e.preventDefault()}
// 					>
// 						<ActionMenu canvas={canvas} />
// 					</PopoverContent>
// 				)}
// 			</Popover>

// 			{isDragging && (
// 				<DragOverlay>
// 					<div
// 						style={node.style}
// 						className="h-full w-full outline outline-[2px] opacity-80 overflow-hidden"
// 					>
// 						{node.imageUrl && (
// 							<img
// 								src={node.imageUrl}
// 								className="w-full h-full object-cover"
// 							/>
// 						)}
// 					</div>
// 				</DragOverlay>
// 			)}
// 		</>
// 	);
// }

// export function GoogleMap({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<GoogleMapNode>) {
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		// transform: CSS.Translate.toString(transform),
//  		...CSSUtils.stripNullStyleValues(node.style),
// 		width: '100%',
// 		height: '100%'
// 	};







// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}id={node.attributes?.id??''}
// 							data-id={node.id}
// 							style={style}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								"  [&:hover:not(:has(div:hover))]:outline hover:outline !p-2  outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
// 								isDragging && " invisible",
// 							)}
// 						>

// 							{
// 								isValidUrl(node.url) ? <iframe src={node?.url || ''} style={{
// 									width: `calc(${style.width} - 16px)`,
// 									height: `calc(${style.height} - 16px)`
// 								}} className={cn(node.attributes?.className, " w-full h-full")} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
// 									:
// 									<div className={cn(node.attributes?.className, 'flex  justify-center items-center w-[60px] h-[60px]')} >
// 										<MapPinnedIcon className="!text-gray-500" size={60} />
// 									</div>
// 							}

// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[snapCenterToCursor]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className={cn(
// 								"h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
// 								!node.style.backgroundColor &&
// 								"bg-blue-200/60",
// 							)}
// 						>
// 							<div className="flex items-center justify-center size-[40%] mx-auto">
// 								<MapPinnedIcon size="100%" className="text-gray-400" />
// 							</div>
// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }
// export function YouTube({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<YoutubeNode | VimeoNode>) {
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		// transform: CSS.Translate.toString(transform),
//  		...CSSUtils.stripNullStyleValues(node.style),
// 		width: '100%',
// 		height: '100%'
// 	};






// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}id={node.attributes?.id??''}
// 							data-id={node.id}
// 							style={{
// 								...style
// 							}}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								" container  [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
// 								isDragging && " invisible",
// 							)}
// 						>

// 							{
// 								isValidUrl(node.url) ? <iframe sandbox="allow-scripts allow-same-origin allow-presentation" src={node?.url || ''} style={style} className={cn(node.attributes?.className, 'flex !p-0 !m-0  justify-center items-center w-full h-full  bg-black ')} allowFullScreen={true} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" />
// 									:
// 									<div style={style} className={cn(node.attributes?.className, 'flex p-2 justify-center items-center w-full h-full')} >
// 										<VideoIcon className="!text-gray-500" size={60} />
// 									</div>
// 							}

// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[snapCenterToCursor]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className={cn(
// 								"h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
// 								!node.style.backgroundColor &&
// 								"bg-blue-200/60",
// 							)}
// 						>
// 							<div className="flex items-center justify-center size-[40%] mx-auto">
// 								<VideoIcon size="100%" className="text-gray-400" />
// 							</div>
// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// export function WebPage({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<HtmlNode>) {


// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		// transform: CSS.Translate.toString(transform),
//  		...CSSUtils.stripNullStyleValues(node.style),
// 		width: '100%',
// 		height: '100%'
// 	};







// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}id={node.attributes?.id??''}
// 							data-id={node.id}
// 							style={style}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								" !p-2   [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
// 								isDragging && " invisible",
// 							)}
// 						>

// 							{
// 								isValidUrl(node.url) ? <iframe X-Frame-Options src={node?.url || ''} style={{
// 									width: `calc(${style.width} - 16px)`,
// 									height: `calc(${style.height} - 16px)`
// 								}} allowFullScreen={true} className="w-full h-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" />
// 									:
// 									<div style={style} className={cn(node.attributes?.className, 'flex  justify-center items-center w-full h-full')} >
// 										<EarthIcon className="!text-gray-500" size={60} />
// 									</div>
// 							}

// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[snapCenterToCursor]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className={cn(
// 								"h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
// 								!node.style.backgroundColor &&
// 								"bg-blue-200/60",
// 							)}
// 						>
// 							<div className="flex items-center justify-center size-[40%] mx-auto">
// 								<EarthIcon size="100%" className="text-gray-400" />
// 							</div>
// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// export function CountDown({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<CountDownNode>) {


// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		// transform: CSS.Translate.toString(transform),
//  		...CSSUtils.stripNullStyleValues(node.style),
// 	};



// 	const content = canvas?.content

// 	if (!content) return;

// 	const { startDate, endDate } = content

// 	const { day, month, year, minute, hour } = content?.endDate || { day: 0, month: 0, year: 0, minute: 0, hour: 0 }


// 	const start = content?.startDate || { day: 0, month: 0, year: 0, minute: 0, hour: 0 }


// 	const END_DATE = moment(`${year || '0000'}-${month || '00'}-${day || '00'} ${hour || '00'}:${minute || '00'}:00`, "YYYY-MM-DD HH:mm:ss")

// 	const START_DATE = moment(`${start.year || '0000'}-${start.month || '00'}-${start.day || '00'} ${start.hour || '00'}:${start.minute || '00'}:00`, "YYYY-MM-DD HH:mm:ss")



// 	const { date } = useCountDown({ startDate, endDate })


// 	// console.log(date)

// 	const isStarted = moment().isSameOrAfter(START_DATE)
// 	const isEnded = moment().isAfter(END_DATE)


// 	const viewProps: ViewProps = {
// 		t: {
// 			d: date.day || 0,
// 			h: date.hour || 0,
// 			m: date.minute || 0,
// 			s: date.second || 0,
// 			pct: date.pct || 0
// 		},
// 		title: node.title,
// 		date: START_DATE.format("YYYY-MM-DD  HH:mm A"),
// 		isStarted,
// 		isEnded,
// 		description: node.description,
// 		footer: node.footer

// 	};

// 	const Component = CountDownComponents[node.uiType]


// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}id={node.attributes?.id??''}
// 							data-id={node.id}
// 							style={{
// 								...style,
// 								'--countdown-title': node.colors.title,
// 								'--countdown-description': node.colors.description,
// 								'--countdown-footer': node.colors.footer,
// 								'--countdown-basic': node.colors.countDown.basic,
// 								'--countdown-primary': node.colors.countDown.primary,
// 								'--countdown-secondary': node.colors.countDown.secondary,





// 							} as CSSProperties}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								" !p-2 flex items-center justify-center [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
// 								isDragging && " invisible"
// 							)}
// 						>

// 							<Component {...viewProps} />


// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[snapCenterToCursor]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className={cn(
// 								"h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
// 								!node.style.backgroundColor &&
// 								"bg-blue-200/60",
// 							)}
// 						>
// 							<Component {...viewProps} />


// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// export function CountDownText({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	children,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<CountDownTextNode>) {

// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		// transform: CSS.Translate.toString(transform),
//  		...CSSUtils.stripNullStyleValues(node.style),
// 	};


// 	const content = canvas?.content

// 	const { startDate, endDate } = content as CanvasNode


// 	const { date } = useCountDown({ startDate, endDate })



// 	// console.log(content)

// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}id={node.attributes?.id??''}
// 							data-id={node.id}
// 							style={{
// 								...style,
// 								textShadow: style.textShadow ?? ''
// 							}}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								" !p-2 transition-all  text-center [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
// 								isDragging && " invisible"
// 							)}
// 						>

// 							{/* {"children"} */}

// 							{/* {date.day} */}
// 							{date[node.countDownType] ?? ''}




// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[snapCenterToCursor]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className={cn(
// 								"h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
// 								!node.style.backgroundColor &&
// 								"bg-blue-200/60",
// 							)}
// 						>
// 							{/* {date[node.countDownType]} */}


// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// export function CustomCountDownWrapper({
// 	children,
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	onClick,
// 	...props

// }: CustomCountDownNodeRenderProps) {



// 	const isFocused = canvas?.focused?.id === node.id;
// 	const isParent = canvas?.focusedParent?.id === node.id;

// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);


// 	};



// 	const style = {
// 		// transform: CSS.Translate.toString(transform),
//  		...CSSUtils.stripNullStyleValues(node.style)
// 	};

// 	const handleAddSection: React.MouseEventHandler<HTMLButtonElement> = (e) => {
// 		e.stopPropagation();
// 		const lastIdx = parseInt(path.slice(-1));
// 		const newSectionNode = generateNewNode("section");
// 		canvas?.insertSection(newSectionNode, lastIdx + 1);
// 		canvas?.focusNode({ id: newSectionNode.id, path: path + "." + lastIdx + 1 });

// 	};


// 	const handleMouseDown = (e: MouseEvent, changeType: "width" | "height") => {
// 		e.preventDefault();
// 		const startY = e.clientY;
// 		const startHeight = CSSUtils.extractEmValue(node.style.height);

// 		const startX = e.clientX;
// 		const startWidth = CSSUtils.extractEmValue(node.style.width);

// 		const onMouseMove = (moveEvent: MouseEvent) => {
// 			// Calculate new height: original height + distance moved


// 			const newHeight = startHeight + (moveEvent.clientY - startY);
// 			const newWidth = startWidth + (moveEvent.clientX - startX);

// 			// if(changeType==="height"){
// 			// newHeight > 50 &&   canvas?.updateNodeStyle({
// 			//     height:CSSUtils.setEmValue(rect.height)
// 			// })
// 			// }
// 			// else {
// 			//     newWidth > 50 &&   canvas?.updateNodeStyle({
// 			//         width:CSSUtils.setEmValue(newWidth)
// 			//     })
// 			// }
// 			// setHeight(newHeight > 50 ? newHeight : 50); // Set a minimum height
// 		};

// 		const onMouseUp = () => {
// 			document.removeEventListener('mousemove', onMouseMove);
// 			document.removeEventListener('mouseup', onMouseUp);
// 		};

// 		document.addEventListener('mousemove', onMouseMove);
// 		document.addEventListener('mouseup', onMouseUp);
// 	};


// 	const isSelected = canvas?.selectedNodes.find(n => n.id === node.id)
// 	// useMemo(() => canvas?.selectedNodes.find(n => n.id === node.id), [canvas?.focused, canvas?.selectedNodes])


// 	const selctedStyle = () => {
// 		if (isSelected) {
// 			return {
// 				outline: "2px solid #a855f7",
// 				outlineOffset: "2px"
// 			};
// 		}

// 	}


// 	const isParentIsFocused = useMemo(() => {

// 		if (canvas?.focusedNode && ["block", 'section'].includes(canvas?.focusedNode.contentType)) {
// 			return (canvas?.focusedNode as LayoutNode)?.children?.find((childNode) => childNode.id === node.id)
// 		}
// 		return false
// 	}, [canvas?.focusedNode])

// 	// 	interface TimeLeft {
// 	//   d: number;
// 	//   h: number;
// 	//   m: number;
// 	//   s: number;
// 	//   pct: number;
// 	// }

// 	// const dateFunc = moment()

// 	const { startDate, endDate } = canvas?.content as CanvasNode


// 	const { day, month, year, minute, hour } = canvas?.content?.endDate || { day: 0, month: 0, year: 0, minute: 0, hour: 0 }


// 	const start = canvas?.content?.startDate || { day: 0, month: 0, year: 0, minute: 0, hour: 0 }


// 	const END_DATE = moment(`${year || '0000'}-${month || '00'}-${day || '00'} ${hour || '00'}:${minute || '00'}:00`, "YYYY-MM-DD HH:mm:ss")

// 	const START_DATE = moment(`${start.year || '0000'}-${start.month || '00'}-${start.day || '00'} ${start.hour || '00'}:${start.minute || '00'}:00`, "YYYY-MM-DD HH:mm:ss")



// 	const { date } = useCountDown({ startDate, endDate })

// 	// console.log(date)

// 	const isStarted = moment().isSameOrAfter(START_DATE)
// 	const isEnded = moment().isSameOrAfter(END_DATE)

// 	const { t, title, date: startDateStr, description, footer } = {
// 		t: {
// 			d: date.day || 0,
// 			h: date.hour || 0,
// 			m: date.minute || 0,
// 			s: date.second || 0,
// 			pct: date.pct || 0
// 		},
// 		title: node.title,
// 		date: START_DATE.format("YYYY-MM-DD  HH:mm A"),
// 		description: node.description,
// 		footer: node.footer

// 	};



// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}

// 							data-name='node'
// 							{...attributes}
// 							{...listeners}
// 							tabIndex={-1}
// 							onClick={(e) => {
// 								e.stopPropagation();
// 								e.preventDefault();
// 								onClick && onClick(e);
// 							}}
// 							data-node-path={path}
// 							id={`${node?.attributes?.id ?? node.id}`}
// 							data-id={`${node.id}`}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							style={{
// 								...style,
// 								// zoom:path ==="root"? "70%":""
// 								...selctedStyle()

// 							}}

// 							className={cn(
// 								" node group  [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight hover:z-[12] cursor-default",

// 								isFocused && "outline outline-[1.5px] z-[11]",

// 								isParent || isParentIsFocused &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",

// 								!node.style.backgroundColor &&
// 								!node.children?.length &&
// 								"bg-blue-200/50",
// 								isDragging && " invisible",
// 								// node.contentType === CONTENT_TYPE.Section && 'overflow-hidden'
// 							)}
// 						>
// 							<CardWrapper style={style} value={{ t, title, date: startDateStr, description: description || '', isStarted, footer, isEnded }} >
// 								{children}
// 							</CardWrapper>
// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[snapCenterToCursor]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className={cn(
// 								"h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
// 								!node.style.backgroundColor &&
// 								"bg-blue-200/60",
// 							)}
// 						>

// 							<CardWrapper style={style} value={{ t, title, date: startDate, description: description || '', isStarted, footer }} >
// 								{React.Children.map(children, (child) => {
// 									if (!React.isValidElement(child)) return child;

// 									return React.cloneElement(child as React.ReactElement<{ date: Record<"day" | "month" | "year" | "hour" | "second" | "minute" | 'pct', number> }>, {
// 										date,

// 									});
// 								})}
// 							</CardWrapper>

// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// export function Social({
// 	node,
// 	// canvas,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<SocialNode>) {
// 	const canvas = useEditor()
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		// transform: CSS.Translate.toString(transform),
//  		...CSSUtils.stripNullStyleValues(node.style),
// 	};




// 	const socialIcons: Record<string, JSX.Element> = {
// 		"facebook": <IoLogoFacebook size={node.size} />,
// 		"instagram": <IoLogoInstagram size={node.size} />,
// 		"x": <RiTwitterXLine size={node.size} />,
// 		"telegram": <PiTelegramLogo size={node.size} />,
// 		"linkedin": <IoLogoLinkedin size={node.size} />,
// 		"mail": <MailIcon size={node.size} />,
// 		"github": <IoLogoGithub size={node.size} />,
// 		"youtube": <IoLogoYoutube size={node.size} />,
// 		"web": <EarthIcon size={node.size} />,


// 	}



// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}id={node.attributes?.id??''}
// 							data-id={node.id}
// 							style={style}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								" !p-2 !text-black  [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
// 								isDragging && " invisible",
// 							)}
// 						>

// 							{socialIcons[node.socialType]}

// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[snapCenterToCursor]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className={cn(
// 								"h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
// 								!node.style.backgroundColor &&
// 								"bg-blue-200/60",
// 							)}
// 						>
// 							{socialIcons[node.socialType]}
// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// export function Counter({
// 	node,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<CounterNode>) {
// 	const canvas = useEditor()
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		...CSSUtils.stripNullStyleValues(node.style),
// 	};

// 	// The editor shows the final value statically — the count-up animation
// 	// (triggered on scroll into view) is a production-only concern, since
// 	// there's no meaningful "scroll into view" moment while editing.
// 	const formattedValue = formatCounterValue(node.endValue, node.decimals, node.useThousandsSeparator)

// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}
// 							id={node.attributes?.id ?? ''}
// 							data-id={node.id}
// 							style={style}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								"!p-2 [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0",
// 								isDragging && "invisible",
// 							)}
// 						>
// 							{node.prefix && <span style={node.prefixStyle}>{node.prefix}</span>}
// 							<span style={node.numberStyle}>{formattedValue}</span>
// 							{node.suffix && <span style={node.suffixStyle}>{node.suffix}</span>}
// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[9999] !bg-transparent"
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className="outline outline-[2px] opacity-80"
// 						>
// 							{node.prefix && <span style={node.prefixStyle}>{node.prefix}</span>}
// 							<span style={node.numberStyle}>{formattedValue}</span>
// 							{node.suffix && <span style={node.suffixStyle}>{node.suffix}</span>}
// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// /**
//  * Renders `maxStars` stars, each filled to the percentage returned by
//  * getStarFillPercent — an empty star with a clipped, absolutely-positioned
//  * filled star on top gives an exact partial fill (half, third, whatever)
//  * without needing separate half-star icon assets. Shared by the editor and
//  * production render paths so both stay pixel-identical.
//  */
// export function StarRating({ node }: { node: RatingNode }) {
// 	return (
// 		<div className="flex" style={{ gap: node.starGap }}>
// 			{Array.from({ length: node.maxStars }).map((_, index) => {
// 				const fillPercent = getStarFillPercent(index, node.value)
// 				return (
// 					<div key={index} className="relative shrink-0" style={{ width: node.starSize, height: node.starSize }}>
// 						<Star
// 							size={node.starSize}
// 							fill={node.emptyColor}
// 							color={node.emptyColor}
// 							className="absolute inset-0"
// 						/>
// 						<div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
// 							<Star
// 								size={node.starSize}
// 								fill={node.filledColor}
// 								color={node.filledColor}
// 							/>
// 						</div>
// 					</div>
// 				)
// 			})}
// 		</div>
// 	)
// }

// export function Rating({
// 	node,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<RatingNode>) {
// 	const canvas = useEditor()
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		...CSSUtils.stripNullStyleValues(node.style),
// 	};

// 	const summaryText = formatRatingSummary(node)

// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}
// 							id={node.attributes?.id ?? ''}
// 							data-id={node.id}
// 							style={style}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								"!p-2 [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0",
// 								isDragging && "invisible",
// 							)}
// 						>
// 							<StarRating node={node} />
// 							{node.showSummary && <span style={{ ...node.summaryStyle, ...lineClampStyle(node, 'customSummaryText') }}>{summaryText}</span>}
// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[9999] !bg-transparent"
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className="outline outline-[2px] opacity-80"
// 						>
// 							<StarRating node={node} />
// 							{node.showSummary && <span style={{ ...node.summaryStyle, ...lineClampStyle(node, 'customSummaryText') }}>{summaryText}</span>}
// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// /**
//  * Renders the numbered circles + connecting line + title/description for
//  * each step. Shared shape by the editor and production render paths so both
//  * stay pixel-identical (mirrors StarRating's split-per-module-graph pattern,
//  * since Nodes.tsx and Elements.tsx can't import from each other).
//  */
// export function TimelineTrack({ node }: { node: TimelineNode }) {
// 	return <TimelineVisual node={node} />
// }

// export function Timeline({
// 	node,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<TimelineNode>) {
// 	const canvas = useEditor()
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		...CSSUtils.stripNullStyleValues(node.style),
// 	};

// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}
// 							id={node.attributes?.id ?? ''}
// 							data-id={node.id}
// 							style={style}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								"!p-2 [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0",
// 								isDragging && "invisible",
// 							)}
// 						>
// 							<TimelineTrack node={node} />
// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[9999] !bg-transparent"
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className="outline outline-[2px] opacity-80"
// 						>
// 							<TimelineTrack node={node} />
// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// export function FaqList({ node }: { node: FaqNode }) {
// 	return <FaqVisual node={node} />
// }

// export function Faq({
// 	node,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<FaqNode>) {
// 	const canvas = useEditor()
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		...CSSUtils.stripNullStyleValues(node.style),
// 	};

// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}
// 							id={node.attributes?.id ?? ''}
// 							data-id={node.id}
// 							style={style}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								"!p-2 [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0",
// 								isDragging && "invisible",
// 							)}
// 						>
// 							<FaqList node={node} />
// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[9999] !bg-transparent"
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className="outline outline-[2px] opacity-80"
// 						>
// 							<FaqList node={node} />
// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// export function PricingToggleDisplay({ node }: { node: PricingToggleNode }) {
// 	return <PricingToggleVisual node={node} />
// }

// export function PricingToggle({
// 	node,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<PricingToggleNode>) {
// 	const canvas = useEditor()
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		...CSSUtils.stripNullStyleValues(node.style),
// 	};

// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}
// 							id={node.attributes?.id ?? ''}
// 							data-id={node.id}
// 							style={style}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								"!p-2 [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0",
// 								isDragging && "invisible",
// 							)}
// 						>
// 							<PricingToggleDisplay node={node} />
// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[9999] !bg-transparent"
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className="outline outline-[2px] opacity-80"
// 						>
// 							<PricingToggleDisplay node={node} />
// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }

// function readyMadeTemplateShell<T extends { id: string; style?: React.CSSProperties; attributes?: { id?: string } }>(
// 	Visual: React.ComponentType<{ node: T }>,
// ) {
// 	return function ReadyMadeTemplateShell({
// 		node,
// 		path,
// 		parent,
// 		...props
// 	}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<T & ContentNode>) {
// 		const canvas = useEditor()
// 		const {
// 			attributes,
// 			listeners,
// 			setNodeRef: setDragRef,
// 			transform,
// 			isDragging,
// 		} = useDraggable({
// 			disabled: canvas?.textEditorObj?.isFocused,
// 			id: node.id,
// 			data: {
// 				type: DraggedElementType.Canvas,
// 				node,
// 				path,
// 				parent,
// 			} satisfies DndCanvasElementData,
// 		});

// 		const { setNodeRef: setDropRef } = useDroppable({
// 			id: node.id,
// 			data: {
// 				type: DraggedElementType.Canvas,
// 				node,
// 				path,
// 				parent,
// 			} satisfies DndCanvasElementData,
// 		});

// 		const setNodeRef = (el: HTMLElement) => {
// 			setDragRef(el);
// 			setDropRef(el);
// 		};

// 		const style = {
// 			...CSSUtils.stripNullStyleValues(node.style ?? {}),
// 		};

// 		if (canvas)
// 			return (
// 				<>
// 					<Popover open={canvas?.focused?.id === node.id}>
// 						<PopoverTrigger asChild>
// 							<motion.div
// 								layout="position"
// 								transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 								data-name='node'
// 								{...props}
// 								ref={(el) => setNodeRef(el as HTMLDivElement)}
// 								{...attributes}
// 								{...listeners}
// 								id={node.attributes?.id ?? ''}
// 								data-id={node.id}
// 								style={style}
// 								aria-label="Draggable"
// 								data-cypress="draggable-item"
// 								data-node-path={path}
// 								tabIndex={-1}
// 								className={cn(
// 									" relative !p-2 [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden cursor-default",
// 									canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 									canvas?.isParentIsFocused(node.id) &&
// 									"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 									canvas?.focusedParent?.id === node.id &&
// 									"outline-dashed outline-offset-0",
// 									isDragging && "invisible",
// 								)}
// 							>
								
// 								<Visual node={node} />

									
// 							</motion.div>
// 						</PopoverTrigger>
// 						{!isDragging && (
// 							<PopoverContent
// 								side="top"
// 								align="center"
// 								sideOffset={10}
// 								alignOffset={2}
// 								className="shadow-none z-[9999] !bg-transparent"
// 								onClick={(e) => e.stopPropagation()}
// 								onCloseAutoFocus={(e) => e.preventDefault()}
// 								onOpenAutoFocus={(e) => e.preventDefault()}
// 							>
// 								<ActionMenu canvas={canvas} />
// 							</PopoverContent>
// 						)}
// 					</Popover>
// 					{isDragging && (
// 						<DragOverlay modifiers={[]}>
// 							<div
// 								id="drag-overlay"
// 								data-id={node.id}
// 								style={node.style}
// 								className="outline outline-[2px] opacity-80"
// 							>
// 								<Visual node={node} />
// 							</div>
// 						</DragOverlay>
// 					)}
// 				</>
// 			);
// 	}
// }

// export const CardsTemplate = readyMadeTemplateShell<CardsTemplateNode>(CardsTemplateVisual)
// export const NavBarTemplate = readyMadeTemplateShell<NavBarTemplateNode>(NavBarTemplateVisual)
// export const HeroTemplate = readyMadeTemplateShell<HeroTemplateNode>(HeroTemplateVisual)
// export const EventWidgetsGroupTemplate = readyMadeTemplateShell<EventWidgetsGroupTemplateNode>(EventWidgetsGroupTemplateVisual)
// export const PersonalCardTemplate = readyMadeTemplateShell<PersonalCardTemplateNode>(PersonalCardTemplateVisual)
// export const FooterTemplate = readyMadeTemplateShell<FooterTemplateNode>(FooterTemplateVisual)
// export const LayoutTemplate = readyMadeTemplateShell<LayoutTemplateNode>(LayoutTemplateVisual)
// export const ButtonEnterprise = readyMadeTemplateShell<ButtonEnterpriseNode>(ButtonEnterpriseVisual)

// export function Separators({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<SeparatorsNode>) {
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		// transform: CSS.Translate.toString(transform),
//  		...CSSUtils.stripNullStyleValues(node.style),
// 	};


// 	const { separatorType, separatorLayout, color, label, size, labelColor, labelSize, labelWeight, labelFont, flip } = node



// 	const lineUi = {
// 		'content': {
// 			paint: `0 100%`,
// 			transparent: `0px 0px`
// 		},
// 		'dashed': {
// 			paint: `0 ${size}px`,
// 			transparent: `${size}px ${size + (size * (2 / 3))}px`
// 		},
// 		'dotted': {
// 			paint: `0 ${1}px`,
// 			transparent: `${1}px ${5}px`
// 		},
// 		'zigzag': {
// 			paint: ` 0 ${size}px `,
// 			transparent: ` ${size}px ${size * 2}px `
// 		}
// 	}

// 	const fontWeight = {
// 		'normal': 400,
// 		'thin': 250,
// 		'medium': 500,
// 		'semibold': 600,
// 		'bold': 700
// 	}

// 	const ui = {
// 		'horizontal': (type: 'content' | 'dotted' | 'dashed' | 'zigzag') => <div style={{
// 			width: '100%',
// 			height: 'fit-content',

// 		}} className=" flex justify-center   items-center  !text-[var(--bs-text-grey-700)]  " >

// 			{<div style={{
// 				background: `repeating-linear-gradient(to right, ${color} ${lineUi[type].paint},  transparent ${lineUi[type].transparent} ) top / 100% 1px no-repeat`
// 			}} className={` w-1/2 h-[1.5px]  `} ></div>}

// 			{label.length > 0 ? <div style={{
// 				fontSize: labelSize,
// 				color: labelColor,
// 				fontWeight: fontWeight[labelWeight],
// 				fontFamily: labelFont

// 			}} className={cn(`  px-2 `)}> {label} </div> : ``}

// 			{<div style={{
// 				background: `repeating-linear-gradient(to right, ${color} ${lineUi[type].paint},  transparent ${lineUi[type].transparent} ) top / 100% 1px no-repeat`
// 			}} className={cn(` w-1/2 h-[1.5px]  `)} ></div>}


// 		</div>,
// 		'vertical': (type: 'content' | 'dotted' | 'dashed' | 'zigzag') => <div style={{
// 			width: '2px',
// 			height: '100%',

// 			background: `repeating-linear-gradient(to bottom, ${color} ${lineUi[type].paint},  transparent ${lineUi[type].transparent} ) top / 1px 100% no-repeat`

// 		}} className="  text-[var(--bs-text-grey-700)] gap-2  " > </div>
// 	}

// 	const zigzagUI = {
// 		'horizontal': (type: 'content' | 'dotted' | 'dashed' | 'zigzag') => <div style={{
// 			'--saw-color': color,
// 			'--saw-size': `${size}px`,

// 			background: `linear-gradient(-135deg, var(--saw-color) var(--saw-size), transparent -1px) -1px var(--saw-size),
//        					 linear-gradient(135deg, var(--saw-color) var(--saw-size), transparent -1px) -1px var(--saw-size)`,

// 			backgroundPosition: "center",
// 			backgroundRepeat: "repeat-x",
// 			backgroundSize: `${size * 2}px ${size * 2}px`,
// 			width: '100%',
// 			height: size * 2,
// 			transform: `scaleY(${flip ? -1 : 1})`


// 		}} className=" flex justify-center   items-center  !text-[var(--bs-text-grey-700)]  " >

// 		</div>,

// 		'vertical': (type: 'content' | 'dotted' | 'dashed' | 'zigzag') => <div style={{
// 			'--saw-color': color,
// 			'--saw-size': `${size}px`,
// 			background: `linear-gradient(45deg, var(--saw-color) var(--saw-size), transparent 0) 0 var(--saw-size),
//         linear-gradient(135deg,var(--saw-color) var(--saw-size), transparent 0) 0 var(--saw-size)`,
// 			backgroundPosition: " left top",
// 			backgroundRepeat: "repeat-y",
// 			backgroundSize: `${size * 2}px ${size * 2}px`,
// 			width: size * 2,
// 			height: '100%',
// 			transform: `scaleX(${flip ? -1 : 1})`


// 		}} className="  text-[var(--bs-text-grey-700)] gap-2  " > </div>
// 	}


// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}id={node.attributes?.id??''}
// 							data-id={node.id}
// 							style={{
// 								...style,
// 								width: `${style.width}`,
// 								height: `${style.height}`,


// 							}}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								"    [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px]  !flex !items-center !justify-center cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0", " flex items-center justify-center",
// 								isDragging && " invisible",
// 							)}
// 						>

// 							{separatorType === 'zigzag' ? zigzagUI[separatorLayout](separatorType) : ui[separatorLayout](separatorType)}

// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[snapCenterToCursor]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className={cn(
// 								"h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
// 								!node.style.backgroundColor &&
// 								"bg-blue-200/60",
// 							)}
// 						>
// 							{ui[separatorLayout](separatorType)}
// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }
// export function NewNode({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<NewNodeNode>) {
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		// transform: CSS.Translate.toString(transform),
//  		...CSSUtils.stripNullStyleValues(node.style),
// 	};



// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}id={node.attributes?.id??''}
// 							data-id={node.id}
// 							style={style}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								" !p-2   [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
// 								isDragging && " invisible",
// 							)}
// 						>

// 							NewNode

// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[snapCenterToCursor]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className={cn(
// 								"h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
// 								!node.style.backgroundColor &&
// 								"bg-blue-200/60",
// 							)}
// 						>
// 							NewNode
// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }
// export function IconBlock({
// 	node,
// 	canvas,
// 	path,
// 	parent,
// 	...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<IconBlockNode>) {
// 	const {
// 		attributes,
// 		listeners,
// 		setNodeRef: setDragRef,
// 		transform,
// 		isDragging,
// 	} = useDraggable({
// 		disabled: canvas?.textEditorObj?.isFocused,
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const { setNodeRef: setDropRef } = useDroppable({
// 		id: node.id,
// 		data: {
// 			type: DraggedElementType.Canvas,
// 			node,
// 			path,
// 			parent,
// 		} satisfies DndCanvasElementData,
// 	});

// 	const setNodeRef = (el: HTMLElement) => {
// 		setDragRef(el);
// 		setDropRef(el);
// 	};

// 	const style = {
// 		// transform: CSS.Translate.toString(transform),
//  		...CSSUtils.stripNullStyleValues(node.style),
// 	};


// 	if (canvas)
// 		return (
// 			<>
// 				<Popover open={canvas?.focused?.id === node.id}>
// 					<PopoverTrigger asChild>
// 						<motion.div
// 							layout="position"
// 							transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
// 							data-name='node'
// 							{...props}
// 							ref={(el) => setNodeRef(el as HTMLDivElement)}
// 							{...attributes}
// 							{...listeners}id={node.attributes?.id??''}
// 							data-id={node.id}
// 							style={style}
// 							aria-label="Draggable"
// 							data-cypress="draggable-item"
// 							data-node-path={path}
// 							tabIndex={-1}
// 							className={cn(
// 								"  [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
// 								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
// 								canvas?.isParentIsFocused(node.id) &&
// 								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
// 								canvas?.focusedParent?.id === node.id &&
// 								"outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
// 								isDragging && " invisible",
// 							)}
// 						>

// 							<div style={{
// 								flexDirection: node.arrangement === 'horizontal' ? 'row' : 'column',
// 								justifyContent: node.arrangement === 'horizontal' ? 'start' : 'center',
// 								alignItems: node.arrangement === 'horizontal' ? 'start' : 'center'
// 							}} className=" w-full h-fit  flex-wrap gap-[30px]  flex  " >
// 								{
// 									node.items.map(({ title, description, color, size, icon, strokeWidth,textColor }, index) => {

// 										const IconCom = lucideiconName[(icon || 'AArrowDown') as iconNameType] as React.FC<lucideiconName.LucideProps>
// 										return (
// 											<div style={{
// 												flexDirection: node.iconType === 'iTt' ? 'row' : 'column',
// 												gap: node.iconType === 'iT' ? 10 : 14
// 											}} className=" w-auto h-fit flex justify-center  items-center " >
												
// 												<div key={index} style={{
// 													minWidth: size + 16,
// 													minHeight: size + 16,
// 													backgroundColor: color + '30'
// 												}} className=" flex justify-center  p-2 items-center rounded-full "  >
// 													<IconCom color={color} name={icon || 'AArrowDown'} strokeWidth={strokeWidth} size={size} />
// 												</div>

// 												{node.iconType !== 'i' && <div className=" flex flex-col gap-[2px] " >
// 													{
// 														node.iconType !== 'i' && <p style={{
// 															color:textColor ||'#232425'
// 														}} className="  text-[15px] font-medium " > {title} </p>
// 													}

// 													{
// 														node.iconType === 'iTt' && <p style={{
// 															color:textColor ||'#232425'
// 														}} className=" text-[12.5px] text-[#5b6259] font-medium "> {description} </p>
// 													}
// 												</div>}


// 											</div>
// 										)
// 									})
// 								}

// 							</div>

// 						</motion.div>
// 					</PopoverTrigger>
// 					{!isDragging && (
// 						<PopoverContent
// 							side="top"
// 							align="center"
// 							sideOffset={10}
// 							alignOffset={2}
// 							className="shadow-none z-[999999] !bg-transparent "
// 							onClick={(e) => e.stopPropagation()}
// 							onCloseAutoFocus={(e) => e.preventDefault()}
// 							onOpenAutoFocus={(e) => e.preventDefault()}
// 						>
// 							<ActionMenu canvas={canvas} />
// 						</PopoverContent>
// 					)}
// 				</Popover>
// 				{isDragging && (
// 					<DragOverlay modifiers={[snapCenterToCursor]}>
// 						<div
// 							id="drag-overlay"
// 							data-id={node.id}
// 							style={node.style}
// 							className={cn(
// 								"h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
// 								!node.style.backgroundColor &&
// 								"bg-blue-200/60",
// 							)}
// 						>
// 							<div style={{
// 								flexDirection: node.arrangement === 'horizontal' ? 'row' : 'column',
// 								justifyContent: node.arrangement === 'horizontal' ? 'start' : 'start',
// 								alignItems: node.arrangement === 'horizontal' ? 'start' : 'start'
// 							}} className=" w-full justify-center flex-wrap gap-[30px] items-center flex  " >
// 								{
// 									node.items.map(({ title, description, color, size, icon, strokeWidth }, index) => {

// 										const IconCom = lucideiconName[(icon || 'AArrowDown') as iconNameType] as React.FC<lucideiconName.LucideProps>
// 										return (
// 											<div style={{
// 												flexDirection: node.iconType === 'iTt' ? 'row' : 'column',
// 												gap: node.iconType === 'iT' ? 10 : 14
// 											}} className=" flex justify-center  items-center " >
// 												<div key={index} style={{
// 													minWidth: size + 16,
// 													minHeight: size + 16,
// 													backgroundColor: color + '30'
// 												}} className=" flex justify-center  p-2 items-center rounded-full "  >
// 													<IconCom color={color} name={icon || 'AArrowDown'} strokeWidth={strokeWidth} size={size} />
// 												</div>

// 												<div className=" flex flex-col gap-[2px] " >
// 													{
// 														node.iconType !== 'i' && <p className=" text-[15px] font-medium " > {title} </p>
// 													}

// 													{
// 														node.iconType === 'iTt' && <p className=" text-[12.5px] text-[#5b6259] font-medium "> {description} </p>
// 													}
// 												</div>


// 											</div>
// 										)
// 									})
// 								}

// 							</div>
// 						</div>
// 					</DragOverlay>
// 				)}
// 			</>
// 		);
// }
// export function Chart({
//     node,
//     canvas,
//     path,
//     parent,
//     ...props
// }: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<ChartNode>) {
//     const {
//         attributes,
//         listeners,
//         setNodeRef: setDragRef,
//         transform,
//         isDragging,
//     } = useDraggable({
//         disabled: canvas?.textEditorObj?.isFocused,
//         id: node.id,
//         data: {
//             type: DraggedElementType.Canvas,
//             node,
//             path,
//             parent,
//         } satisfies DndCanvasElementData,
//     });

//     const { setNodeRef: setDropRef } = useDroppable({
//         id: node.id,
//         data: {
//             type: DraggedElementType.Canvas,
//             node,
//             path,
//             parent,
//         } satisfies DndCanvasElementData,
//     });

//     const setNodeRef = (el: HTMLElement) => {
//         setDragRef(el);
//         setDropRef(el);
//     };

//     const style = { ...CSSUtils.stripNullStyleValues(node.style) };

//     const { data, options } = buildChartConfig(node);
//     const ChartComponent = node.chartType === 'pie' ? Pie : node.chartType === 'line' ? Line : Bar;

//     if (canvas)
//         return (
//             <>
//                 <Popover open={canvas?.focused?.id === node.id}>
//                     <PopoverTrigger asChild>
//                         <motion.div
//                             layout="position"
//                             transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
//                             data-name='node'
//                             {...props}
//                             ref={(el) => setNodeRef(el as HTMLDivElement)}
//                             {...attributes}
//                             {...listeners}
//                             id={node.attributes?.id ?? ''}
//                             data-id={node.id}
//                             style={style}
//                             aria-label="Draggable"
//                             data-cypress="draggable-item"
//                             data-node-path={path}
//                             tabIndex={-1}
//                             className={cn(
//                                 " !p-2 [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
//                                 canvas?.focused?.id === node.id && "outline outline-[1.5px]",
//                                 canvas?.isParentIsFocused(node.id) &&
//                                 "outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
//                                 canvas?.focusedParent?.id === node.id &&
//                                 "outline-dashed outline-offset-0",
//                                 isDragging && " invisible",
//                             )}
//                         >
//                             <div className="w-full h-full pointer-events-none">
//                                 <ChartComponent data={data} options={options} />
//                             </div>
//                         </motion.div>
//                     </PopoverTrigger>
//                     {!isDragging && (
//                         <PopoverContent
//                             side="top"
//                             align="center"
//                             sideOffset={10}
//                             alignOffset={2}
//                             className="shadow-none z-[9999] !bg-transparent"
//                             onClick={(e) => e.stopPropagation()}
//                             onCloseAutoFocus={(e) => e.preventDefault()}
//                             onOpenAutoFocus={(e) => e.preventDefault()}
//                         >
//                             <ActionMenu canvas={canvas} />
//                         </PopoverContent>
//                     )}
//                 </Popover>
//                 {isDragging && (
//                     <DragOverlay modifiers={[]}>
//                         <div
//                             id="drag-overlay"
//                             data-id={node.id}
//                             style={node.style}
//                             className={cn(
//                                 "h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
//                                 !node.style.backgroundColor &&
//                                 "bg-blue-200/60",
//                             )}
//                         >
//                            <ChartComponent data={data} options={options} />
//                         </div>
//                     </DragOverlay>
//                 )}
//             </>
//         );
// }
