import React, { CSSProperties, useLayoutEffect, useMemo, useState } from "react"
import { INLINE_SVG_ATTR, keepsPageColor, passthroughAttributes } from "@/utils/nodeAttributes"
import { inlineSvgMarkup } from "@/utils/inlineSvg"
import {
	EditorContent,
	generateHTML,
	useEditor as useTiptapEditor,
} from "@tiptap/react"
import { CiImageOn } from "react-icons/ci"
import { VideoIcon } from "lucide-react"
import { useEditor } from "@/context/EditorContext"
import { cn } from "@/libs/cn"
import { extensions } from "@/libs/tiptap/config"
import { sanitizeHtml } from "@/utils/sanitizeHtml"
import CSSUtils from "@/utils/CSS.utils"
import { buildTableUiTypeStyle } from "@/utils/tableUiTypeStyles"
import useFileDrop from "@/hooks/useFileDrop"
import useUploadToS3 from "@/hooks/useUploadToS3"
import { useGetPageDataQuery } from "@/store/query"
import {
	ButtonNode,
	FormFieldNode,
	ContentNode,
	ImageNode,
	VideoNode,
	NewNodeNode,
	TableEnterpriseNode,
	TableNode,
	TextNode,
} from "@/types/node.type"
import { ContentNodeRenderProps } from "../Nodes"
import DragWrapper from "../NodeWrapper/DragContainer"
import MotionWrapper from "../NodeWrapper/MotionWrapper"
import PopoverWrapper from "../NodeWrapper/PopoverWrapper"


export function Text({
	node,
	canvas,
	path,
	parent,
	onClick,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<TextNode>) {

	const editorCanvas = useEditor()

	const editor = useTiptapEditor(
		{
			// autofocus: 'end',
			extensions: [...extensions],
			content: generateHTML(JSON.parse(node.children ?? "{}"), extensions),
			// content: node.children,
			onCreate: () => { },
			onUpdate: ({ editor }) => {  
				editorCanvas?.updateNode((node) => {
					const tempNode: ContentNode = {
						...node,
						children: JSON.stringify(editor.getJSON()),
					} as ContentNode;

					return tempNode;
				}, path);
			},
		},
		[],
	);

	const [collapsed, setCollapsed] = useState(true);

	const isSelected = editorCanvas?.selectedNodes.some((n) => n.id === node.id)

	const dragStyle = {
		// transform: CSS.Translate.toString(transform),
 		// ...node.style,
		...(isSelected && { outline: "2px solid #a855f7", outlineOffset: "2px" }),
	};

	// Line clamp only for collapsable text (as Preview does); otherwise the -webkit-box +
	// overflow:hidden wrapper would stop the text's margins collapsing like the published page.
	const clamped = !!node.collapsable && collapsed
	const style: CSSProperties = {
		...node.style,
		overflow: clamped ? "hidden" : undefined,
		display: clamped ? "-webkit-box" : undefined,
		WebkitBoxOrient: clamped ? "vertical" : undefined,
		WebkitLineClamp: clamped ? node.style.WebkitLineClamp : undefined,
	};
	const textStyle: CSSProperties = {
		...style,
		textWrap: "wrap",
		color: style.color ?? (keepsPageColor(node.attributes) ? undefined : '#000000'),
	};

	if (!editorCanvas) return null

	return (
		<DragWrapper
			node={node}
			path={path}
			parent={parent}
			canvas={editorCanvas}
			children={
				<div
					id="drag-overlay"
					data-id={node.id}
					style={node.style}
					className=" outline outline-[2px] outline-highlight"
					dangerouslySetInnerHTML={{ __html: sanitizeHtml(editor?.getHTML()) as TrustedHTML | string }}
				></div>
			}
			DragChild={({ attributes, listeners, setNodeRef, isDragging }) => {
				const handleOnClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
					e.stopPropagation();
					if (typeof onClick === "function") onClick(e);

					editorCanvas?.setTextEditorObj(editor);
				};

				return (
					<PopoverWrapper node={node} canvas={editorCanvas} isDragging={isDragging}>
						<MotionWrapper {...passthroughAttributes(node.attributes, 'editor')}
							attributes={attributes}
							listeners={listeners}
							setNodeRef={setNodeRef}
							data-name='node'
							{...props}
							id={node.attributes?.id ?? ''}
							// Same element as Preview's text <div>: the node's own style lives here
							// (collapsable text keeps it on the inner content, like Preview's inner div).
							style={node.collapsable ? dragStyle : { ...textStyle, ...dragStyle }}
							aria-label="Draggable"
							data-cypress="draggable-item"
							data-id={node.id}
							tabIndex={-1}
							data-node-path={path}
							onClick={handleOnClick}
							className={cn(
								"hover:outline ed-text outline-[1px] outline-highlight -outline-offset-[0.5px] prose cursor-text",
								editorCanvas?.focused?.id === node.id && "outline outline-[1.5px]",
								editorCanvas?.isParentIsFocused(node.id) &&
								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
								editorCanvas?.focusedParent?.id === node.id &&
								"outline-dashed outline-offset-0",
								isDragging && " invisible",
								node.attributes?.className,
							)}
						>
							<EditorContent
								editor={editor}
								className="[&>div]:border-none prose [&>div]:outline-none"
								autoCapitalize="off"
								autoComplete="off"
								autoCorrect="off"
								spellCheck={false}
								style={node.collapsable ? textStyle : undefined}
							/>
							{node.collapsable && (
								<button
									className=" font-normal text-primary hover:text-blue-700"
									style={{
										fontSize:
											CSSUtils.pxToEm(
												CSSUtils.extractEmValue(
													editor?.getAttributes("textStyle").fontSize,
												) || 16,
											) + "em",
									}}
									onClick={() => {
										setCollapsed((prev) => !prev);
									}}
								>
									{collapsed ? "Read More" : "Read Less"}
								</button>
							)}
						</MotionWrapper>
					</PopoverWrapper>
				)
			}}
		/>
	);
}


export function Image({
	node,
	canvas,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<ImageNode>) {
	const style = {
		// transform: CSS.Translate.toString(transform),
 		...CSSUtils.stripNullStyleValues(node.style),
	};

	/**
	 * File handling
	 */
	const { data } = useGetPageDataQuery("");

	const { handleUpload, selectedFile } = useUploadToS3({
		subFolder: `${data?.user_id}/${data?.id}`,
	});
	const hasPicture = !!((node as any).children || selectedFile?.object_url || (node as unknown as ImageNode)?.src?.length > 1)
	// An imported inline <svg> shows as that (DOMPurify-cleaned) <svg>, as in Preview, so page rules like
	// `.brand svg { width }` size it. Scripts and event handlers never come along.
	const inlineSvg = useMemo(() => ((node.attributes as Record<string, unknown> | undefined)?.[INLINE_SVG_ATTR] ? inlineSvgMarkup(node.children as string) : null), [node.attributes, node.children])

	const handleFileChange = async (files: FileList) => {
		if (files.length > 1) {
			// toast.error('Multiple files detected. PLease select only one file.')
			return;
		}

		const file = files[0];

		const response = await handleUpload(file);

		canvas?.updateNode((node) => {
			let tempNode = node;

			return {
				...tempNode,
				children: response?.access_url,
			} as ContentNode;
		}, path);
	};

	const { dragHandlers, isDragging: fileIsDragging } =
		useFileDrop(handleFileChange);

	const isSelected = canvas?.selectedNodes.some((n) => n.id === node.id)

	if (!canvas) return null

	return (
		<DragWrapper
			node={node}
			path={path}
			parent={parent}
			canvas={canvas}
			children={
				<div
					id="drag-overlay"
					data-id={node.id}
					style={node.style}
					className={cn(
						"h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
						!node.style.backgroundColor &&
						!node.children?.length &&
						"bg-blue-200/60",
					)}
				>
					{node.children ? (
						<img
							key={node.id + "_drag-overlay"}
							src={node.children}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="flex items-center justify-center size-[40%] mx-auto">
							<CiImageOn size="100%" className="text-gray-400" />
						</div>
					)}
				</div>
			}
			DragChild={({ attributes, listeners, setNodeRef, isDragging }) => (
				<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging}>
					<MotionWrapper {...passthroughAttributes(node.attributes, 'editor')}
						attributes={attributes}
						listeners={listeners}
						setNodeRef={setNodeRef}
						data-name='node'
						{...props}
						{...dragHandlers}
						id={node.attributes?.id ?? ''}
						style={{
							...style,
							...(isSelected && { outline: "2px solid #a855f7", outlineOffset: "2px" }),
						}}
						data-id={node.id}
						aria-label="Draggable"
						data-cypress="draggable-item"
						data-node-path={path}
						tabIndex={-1}
						className={cn(
							"[&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] cursor-default",
							// Centering only for the empty placeholder; a real picture sits like Preview's (plain block).
							!hasPicture && "overflow-hidden !flex !items-center !justify-center",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0",
							node.children
								? ""
								: "bg-blue-200/50 flex items-center justify-center",
							fileIsDragging && "!outline-dashed outline-2 !bg-blue-100/60",
							isDragging && " invisible",
							node.attributes?.className,
						)}
					>
						{inlineSvg ? <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: inlineSvg }} />
							: hasPicture ? <img style={{ ...node.style, rotate: undefined }} src={(node as any).children || selectedFile?.object_url || (node as unknown as ImageNode)?.src} className="w-full h-full object-cover max-none" key={node.id + '_image'} />
							:
							<div className="flex items-center justify-center size-[40%] mx-auto max-w-[6rem] max-h-[6rem]">
								<CiImageOn size="100%" className="text-blue-300" />
							</div>
						}
						{/* {node.children || selectedFile?.object_url ? (
							<img
								src={node.children || selectedFile?.object_url}
								className="w-full h-full object-cover max-none"
								key={node.id + "_image"}
							/>
						) : (
							<div className="flex items-center justify-center size-[40%] mx-auto max-w-[6rem] max-h-[6rem]">
								<CiImageOn size="100%" className="text-blue-300" />
							</div>
						)} */}
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}

/** Self-hosted/direct video file (native <video>) - distinct from the
 * youtube/vimeo iframe-embed content types. Src lives on `children`
 * (matching Image's convention) with `src` as a fallback, same dual-field
 * pattern Image already uses. */
export function Video({
	node,
	canvas,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<VideoNode>) {
	const style = {
		...CSSUtils.stripNullStyleValues(node.style),
	};

	const src = node.children || node.src || ''
	const isSelected = canvas?.selectedNodes.some((n) => n.id === node.id)

	if (!canvas) return null

	return (
		<DragWrapper
			node={node}
			path={path}
			parent={parent}
			canvas={canvas}
			children={
				<div
					id="drag-overlay"
					data-id={node.id}
					style={node.style}
					className={cn(
						"h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
						!src && "bg-blue-200/60",
					)}
				>
					{src ? (
						<video key={node.id + "_drag-overlay"} src={src} className="w-full h-full object-cover" muted />
					) : (
						<div className="flex items-center justify-center size-[40%] mx-auto">
							<VideoIcon size="100%" className="text-gray-400" />
						</div>
					)}
				</div>
			}
			DragChild={({ attributes, listeners, setNodeRef, isDragging }) => (
				<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging}>
					<MotionWrapper {...passthroughAttributes(node.attributes, 'editor')}
						attributes={attributes}
						listeners={listeners}
						setNodeRef={setNodeRef}
						data-name='node'
						{...props}
						id={node.attributes?.id ?? ''}
						style={{
							...style,
							...(isSelected && { outline: "2px solid #a855f7", outlineOffset: "2px" }),
						}}
						data-id={node.id}
						aria-label="Draggable"
						data-cypress="draggable-item"
						data-node-path={path}
						tabIndex={-1}
						className={cn(
							"[&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0",
							!src && "bg-blue-200/50 flex items-center justify-center",
							isDragging && " invisible",
							node.attributes?.className,
						)}
					>
						{src ? (
							<video
								key={node.id + "_video"}
								src={src}
								style={{ width: '100%', height: '100%', objectFit: 'cover' }}
								autoPlay={node.autoPlay}
								loop={node.loop}
								muted={node.muted !== false}
								controls={node.controls}
								playsInline
							/>
						) : (
							<div className="flex items-center justify-center size-[40%] mx-auto max-w-[6rem] max-h-[6rem]">
								<VideoIcon size="100%" className="text-blue-300" />
							</div>
						)}
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}


export function Button({
	node,
	canvas,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<ButtonNode>) {
	const style = {
		// transform: CSS.Translate.toString(transform),
 		...CSSUtils.stripNullStyleValues(node.style),
	};

	const isSelected = canvas?.selectedNodes.some((n) => n.id === node.id)

	if (!canvas) return null

	return (
		<DragWrapper
			node={node}
			path={path}
			parent={parent}
			canvas={canvas}
			children={
				<div
					id="drag-overlay"
					data-id={node.id}
					style={node.style}
					className="!w-full outline outline-[1px] outline-highlight"
				>
					{node.children}
				</div>
			}
			DragChild={({ attributes, listeners, setNodeRef, isDragging }) => (
				<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging}>
					<MotionWrapper {...passthroughAttributes(node.attributes, 'editor')}
						// An imported link renders as <a> (no href, so a click can't leave the editor), a button as <button>.
						as={node.tag === 'a' || node.tag === 'button' ? node.tag : undefined}
						{...(node.tag === 'button' ? { type: 'button' } : {})}
						attributes={attributes}
						listeners={listeners}
						setNodeRef={setNodeRef}
						data-name='node'
						{...props}
						id={node.attributes?.id ?? ''}
						data-id={node.id}
						style={{
							...style,
							// An imported link/button keeps the page's font size, as in Preview.
							...(node.tag ? {} : { fontSize: "1em" }),
							...(isSelected && { outline: "2px solid #a855f7", outlineOffset: "2px" }),
						}}
						aria-label="Draggable"
						data-cypress="draggable-item"
						data-node-path={path}
						className={cn(
							"[&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] cursor-default",
							// An imported link/button displays like its source tag (an inline <a> in a list item); builder buttons are centred.
							!node.tag && "flex justify-center items-center",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0",
							// isDragging && '!bg-blue-100 !text-blue-100 outline-0'
							isDragging && " invisible",
							node?.attributes?.className
						)}
					>
						{/* An imported label is plain text, as in its source: a wrapping <span> would catch `.btn span {}` rules. */}
						{node.tag ? node.children : <span className=" !p-0 " style={{ fontSize: style.fontSize }}>{node.children}</span>}
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}


/** An imported form control, drawn as the real element (so page rules like `.field input {}` match)
 * but inert in the editor: text can't be typed, a select won't open, a checkbox won't toggle. */
export function FormField({
	node,
	canvas,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<FormFieldNode>) {
	const style = { ...CSSUtils.stripNullStyleValues(node.style) }
	const isSelected = canvas?.selectedNodes.some((n) => n.id === node.id)
	const { field } = node
	const isToggle = node.tag === 'input' && (field.type === 'checkbox' || field.type === 'radio')
	if (!canvas) return null

	const controlProps = node.tag === 'select'
		? { value: field.options?.find((o) => o.selected)?.value ?? field.options?.[0]?.value ?? '', onChange: () => {} }
		: node.tag === 'textarea'
			? { placeholder: field.placeholder, rows: field.rows, value: field.value ?? '', readOnly: true }
			: isToggle
				? { type: field.type, checked: !!field.checked, onChange: () => {} }
				: { type: field.type, placeholder: field.placeholder, value: field.value ?? '', readOnly: true }

	return (
		<DragWrapper
			node={node}
			path={path}
			parent={parent}
			canvas={canvas}
			children={<div id="drag-overlay" data-id={node.id} style={node.style} className="outline outline-[1px] outline-highlight">{field.placeholder || field.name || node.tag}</div>}
			DragChild={({ attributes, listeners, setNodeRef, isDragging }) => (
				<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging}>
					<MotionWrapper {...passthroughAttributes(node.attributes, 'editor')}
						as={node.tag}
						attributes={attributes}
						listeners={listeners}
						setNodeRef={setNodeRef}
						data-name='node'
						{...props}
						// Control attributes (name, value, type...) aren't on MotionWrapper's div-typed props.
						{...({ ...controlProps, name: field.name } as object)}
						tabIndex={-1}
						// A select would open and a checkbox toggle on click; selecting the node is all a click does here.
						onMouseDown={(e: React.MouseEvent) => { if (node.tag === 'select') e.preventDefault() }}
						onClick={(e: React.MouseEvent<HTMLDivElement>) => { if (isToggle) e.preventDefault(); props.onClick?.(e) }}
						id={node.attributes?.id ?? ''}
						data-id={node.id}
						style={{ ...style, ...(isSelected && { outline: "2px solid #a855f7", outlineOffset: "2px" }) }}
						aria-label="Draggable"
						data-cypress="draggable-item"
						data-node-path={path}
						className={cn(
							"[&:hover]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							isDragging && " invisible",
							node.attributes?.className,
						)}
					>
						{node.tag === 'select'
							? (field.options ?? []).map((o, i) => <option key={i} value={o.value} disabled={o.disabled}>{o.label}</option>)
							: undefined}
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	)
}

export function Table({
	node,
	canvas,
	path,
	onClick,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<TableNode | TableEnterpriseNode>) {
	const tipTap = useTiptapEditor(
		{
			// autofocus: 'end',
			extensions: [...extensions],
			content: generateHTML(((node)?.children), extensions),
			// onCreate: ({editor}) => {
			//   if(node.children) return;
			//   editor?.chain().focus().insertTable({rows: 3, cols: 3, withHeaderRow: true}).run()
			// },
			onUpdate: ({ editor }) => {
				canvas?.updateNode((node) => {
					let tempNode: ContentNode = {
						...node,
						children: editor.getJSON(),
					} as ContentNode;

					return tempNode;
				}, path);
			},
		},
		[],
	);

	// //console.log(tipTap?.getJSON())

	const style = {
		// transform: CSS.Translate.toString(transform),
		...CSSUtils.stripNullStyleValues(node.style),
 	};

	useLayoutEffect(() => { }, []);

	const idClassName = "table-node-" + node.id;

	const dynamicTableStyle = buildTableUiTypeStyle(node, idClassName);

	const isSelected = canvas?.selectedNodes.some((n) => n.id === node.id)

	if (!canvas) return null

	return (
		<DragWrapper
			node={node}
			path={path}
			parent={parent}
			canvas={canvas}
			children={
				<>
					<div
						id="drag-overlay"
						data-id={node.id}
						style={node.style}
						className={cn(
							"dragged-table h-full w-full outline outline-[2px] outline-highlight",
							idClassName,
						)}
						dangerouslySetInnerHTML={{ __html: sanitizeHtml(tipTap?.getHTML()) as string | TrustedHTML }}
					></div>
					{/* <EditorContent editor={tipTap} className="[&>div]:border-none [&>div]:outline-none " autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck={false} /> */}
				</>
			}
			DragChild={({ attributes, listeners, setNodeRef, isDragging }) => {
				const handleOnClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
					if (typeof onClick === "function") onClick(e);

					canvas?.setTextEditorObj(tipTap);
				};

				return (
					<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging}>
						<MotionWrapper
							attributes={attributes}
							listeners={listeners}
							setNodeRef={setNodeRef}
							data-name='node'
							{...props}
							id={node.attributes?.id ?? ''}
							style={{
								...style,
								...(isSelected && { outline: "2px solid #a855f7", outlineOffset: "2px" }),
							}}
							data-id={node.id}
							aria-label="Draggable"
							data-cypress="draggable-item"
							data-node-path={path}
							tabIndex={-1}
							onClick={handleOnClick}
							className={cn(
								"table-node hover:outline outline-[1px] outline-highlight -outline-offset-[0.5px] cursor-default",
								canvas.focused?.id === node.id && "outline outline-[1.5px]",
								canvas?.isParentIsFocused(node.id) &&
								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
								canvas.focusedParent?.id === node.id &&
								"outline-dashed outline-offset-0",
								isDragging && " invisible",
								node.attributes?.className,
								idClassName,
							)}
						>
							<style>{dynamicTableStyle}</style>
							<EditorContent
								editor={tipTap}
								className="[&>div]:border-none [&>div]:outline-none  !h-full "
								autoCapitalize="off"
								autoComplete="off"
								autoCorrect="off"
								spellCheck={false}
							/>
						</MotionWrapper>
					</PopoverWrapper>
				)
			}}
		/>
	);
}


export function NewNode({
	node,
	canvas,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<NewNodeNode>) {
	const style = {
		// transform: CSS.Translate.toString(transform),
 		...CSSUtils.stripNullStyleValues(node.style),
	};

	const isSelected = canvas?.selectedNodes.some((n) => n.id === node.id)


	if (!canvas) return null

	return (
		<DragWrapper
			node={node}
			path={path}
			parent={parent}
			canvas={canvas}
			children={
				<div
					id="drag-overlay"
					data-id={node.id}
					style={node.style}
					className={cn(
						"h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
						!node.style.backgroundColor &&
						!node.children?.length &&
						"bg-blue-200/60",
					)}
				>
					NewNode
				</div>
			}
			DragChild={({ attributes, listeners, setNodeRef, isDragging }) => (
				<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging}>
					<MotionWrapper
						attributes={attributes}
						listeners={listeners}
						setNodeRef={setNodeRef}
						data-name='node'
						{...props}
						id={node.attributes?.id ?? ''}
						data-id={node.id}
						style={{
							...style,
							...(isSelected && { outline: "2px solid #a855f7", outlineOffset: "2px" }),
						}}
						aria-label="Draggable"
						data-cypress="draggable-item"
						data-node-path={path}
						tabIndex={-1}
						className={cn(
							" !p-2   [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
							isDragging && " invisible",
						)}
					>

						NewNode

					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}
