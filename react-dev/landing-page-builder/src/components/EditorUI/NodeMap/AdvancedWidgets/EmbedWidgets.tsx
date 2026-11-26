import React from "react"
import { EarthIcon, MapPinnedIcon, VideoIcon } from "lucide-react"
import { cn } from "@/libs/cn"
import CSSUtils from "@/utils/CSS.utils"
import { isValidUrl } from "@/utils/isValidUrl"
import { GoogleMapNode, HtmlNode, YoutubeNode, VimeoNode } from "@/types/node.type"
import { ContentNodeRenderProps } from "../../Nodes"
import DragWrapper from "../../NodeWrapper/DragContainer"
import MotionWrapper from "../../NodeWrapper/MotionWrapper"
import PopoverWrapper from "../../NodeWrapper/PopoverWrapper"

/**
 * Split counterpart to Nodes.tsx's `GoogleMap` — embeds `node.url` in an
 * iframe when it's a valid URL, otherwise shows a MapPinnedIcon placeholder.
 * 1:1 port of the original, including the `width: calc(...)`/
 * `height: calc(...)` iframe sizing that accounts for the `!p-2` padding.
 */
export function GoogleMap({
	node,
	canvas,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<GoogleMapNode>) {
	const style = {
		// transform: CSS.Translate.toString(transform),
 		...CSSUtils.stripNullStyleValues(node.style),
		width: '100%',
		height: '100%'
	};

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
						"bg-blue-200/60",
					)}
				>
					<div className="flex items-center justify-center size-[40%] mx-auto">
						<MapPinnedIcon size="100%" className="text-gray-400" />
					</div>
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
						style={style}
						aria-label="Draggable"
						data-cypress="draggable-item"
						data-node-path={path}
						tabIndex={-1}
						className={cn(
							"  [&:hover:not(:has(div:hover))]:outline hover:outline !p-2  outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
							isDragging && " invisible",
						)}
					>

						{
							isValidUrl(node.url) ? <iframe src={node?.url || ''} style={{
								width: `calc(${style.width} - 16px)`,
								height: `calc(${style.height} - 16px)`
							}} className={cn(node.attributes?.className, " w-full h-full")} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
								:
								<div className={cn(node.attributes?.className, 'flex  justify-center items-center w-[60px] h-[60px]')} >
									<MapPinnedIcon className="!text-gray-500" size={60} />
								</div>
						}

					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}

/**
 * Split counterpart to Nodes.tsx's `YouTube` — embeds `node.url` in a
 * sandboxed iframe. Handles BOTH the `youtube` and `vimeo` content types:
 * Nodes.tsx's own content-type -> component map (`vimeo: YouTube`) points
 * `vimeo` at this same component — there is no separate `Vimeo`-named
 * export in the original (confirmed via `VimeoNode` usage grep — the only
 * reference is this component's prop type union
 * `ContentNodeRenderProps<YoutubeNode | VimeoNode>`). 1:1 port of the
 * original.
 */
export function YouTube({
	node,
	canvas,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<YoutubeNode | VimeoNode>) {
	const style = {
		// transform: CSS.Translate.toString(transform),
 		...CSSUtils.stripNullStyleValues(node.style),
		width: '100%',
		height: '100%'
	};

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
						"bg-blue-200/60",
					)}
				>
					<div className="flex items-center justify-center size-[40%] mx-auto">
						<VideoIcon size="100%" className="text-gray-400" />
					</div>
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
							...style
						}}
						aria-label="Draggable"
						data-cypress="draggable-item"
						data-node-path={path}
						tabIndex={-1}
						className={cn(
							" container  [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
							isDragging && " invisible",
						)}
					>

						{
							isValidUrl(node.url) ? <iframe sandbox="allow-scripts allow-same-origin allow-presentation" src={node?.url || ''} style={style} className={cn(node.attributes?.className, 'flex !p-0 !m-0  justify-center items-center w-full h-full  bg-black ')} allowFullScreen={true} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" />
								:
								<div style={style} className={cn(node.attributes?.className, 'flex p-2 justify-center items-center w-full h-full')} >
									<VideoIcon className="!text-gray-500" size={60} />
								</div>
						}

					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}

/**
 * Split counterpart to Nodes.tsx's `WebPage` — renders the `html` content
 * type (arbitrary external URL embedded via iframe; confirmed by its
 * `ContentNodeRenderProps<HtmlNode>` typing and Nodes.tsx's own
 * `html: WebPage` content-type map entry). 1:1 port of the original,
 * including the non-standard `X-Frame-Options` boolean iframe attribute
 * (has no effect as an HTML attribute — the header must come from the
 * embedded page's own server response — preserved verbatim rather than
 * "fixed").
 */
export function WebPage({
	node,
	canvas,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<HtmlNode>) {
	const style = {
		// transform: CSS.Translate.toString(transform),
 		...CSSUtils.stripNullStyleValues(node.style),
		width: '100%',
		height: '100%'
	};

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
						"bg-blue-200/60",
					)}
				>
					<div className="flex items-center justify-center size-[40%] mx-auto">
						<EarthIcon size="100%" className="text-gray-400" />
					</div>
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
						style={style}
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

						{
							isValidUrl(node.url) ? <iframe X-Frame-Options src={node?.url || ''} style={{
								width: `calc(${style.width} - 16px)`,
								height: `calc(${style.height} - 16px)`
							}} allowFullScreen={true} className="w-full h-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" />
								:
								<div style={style} className={cn(node.attributes?.className, 'flex  justify-center items-center w-full h-full')} >
									<EarthIcon className="!text-gray-500" size={60} />
								</div>
						}

					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}
