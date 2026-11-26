import React, { CSSProperties } from "react"
import moment from "moment"
import { useEditor } from "@/context/EditorContext"
import { cn } from "@/libs/cn"
import CSSUtils from "@/utils/CSS.utils"
import { generateNewNode } from "@/utils/canvas.utils"
import { useCountDown } from "@/utils/calculateCountDown"
import CountDownComponents, { CardWrapper, ViewProps } from "@/components/CountDown/CountDown"
import {
	CanvasNode,
	CountDownNode,
	CountDownTextNode,
	LayoutNode,
} from "@/types/node.type"
import {
	ContentNodeRenderProps,
	CustomCountDownNodeRenderProps,
} from "../../Nodes"
import DragWrapper from "../../NodeWrapper/DragContainer"
import MotionWrapper from "../../NodeWrapper/MotionWrapper"
import PopoverWrapper from "../../NodeWrapper/PopoverWrapper"

export function CountDown({
	node,
	canvas,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<CountDownNode>) {
	const style = {
		// transform: CSS.Translate.toString(transform),
 		...CSSUtils.stripNullStyleValues(node.style),
	};

	const content = canvas?.content

	// Hooks run on every render, before any early return, so their order never changes.
	const { startDate, endDate } = (content ?? {}) as Partial<CanvasNode>

	const { date } = useCountDown({ startDate, endDate })

	if (!content) return null;

	const { day, month, year, minute, hour } = content?.endDate || { day: 0, month: 0, year: 0, minute: 0, hour: 0 }


	const start = content?.startDate || { day: 0, month: 0, year: 0, minute: 0, hour: 0 }


	const END_DATE = moment(`${year || '0000'}-${month || '00'}-${day || '00'} ${hour || '00'}:${minute || '00'}:00`, "YYYY-MM-DD HH:mm:ss")

	const START_DATE = moment(`${start.year || '0000'}-${start.month || '00'}-${start.day || '00'} ${start.hour || '00'}:${start.minute || '00'}:00`, "YYYY-MM-DD HH:mm:ss")


	// console.log(date)

	const isStarted = moment().isSameOrAfter(START_DATE)
	const isEnded = moment().isAfter(END_DATE)


	const viewProps: ViewProps = {
		t: {
			d: date.day || 0,
			h: date.hour || 0,
			m: date.minute || 0,
			s: date.second || 0,
			pct: date.pct || 0
		},
		title: node.showTitle !== false ? node.title : undefined,
		date: START_DATE.format("YYYY-MM-DD  HH:mm A"),
		isStarted,
		isEnded,
		description: node.showDescription !== false ? node.description : undefined,
		footer: node.showFooter !== false ? node.footer : undefined

	};

	const Component = CountDownComponents[node.uiType]

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
					<Component {...viewProps} />
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
							'--countdown-title': node.colors.title,
							'--countdown-description': node.colors.description,
							'--countdown-footer': node.colors.footer,
							'--countdown-basic': node.colors.countDown.basic,
							'--countdown-primary': node.colors.countDown.primary,
							'--countdown-secondary': node.colors.countDown.secondary,
						} as CSSProperties}
						aria-label="Draggable"
						data-cypress="draggable-item"
						data-node-path={path}
						tabIndex={-1}
						className={cn(
							" !p-2 flex items-center justify-center [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
							isDragging && " invisible"
						)}
					>

						<Component {...viewProps} />


					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}

export function CountDownText({
	node,
	canvas,
	path,
	parent,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<CountDownTextNode>) {
	const style = {
		// transform: CSS.Translate.toString(transform),
 		...CSSUtils.stripNullStyleValues(node.style),
	};


	const content = canvas?.content

	const { startDate, endDate } = content as CanvasNode


	const { date } = useCountDown({ startDate, endDate })



	// console.log(content)

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
					{/* {date[node.countDownType]} */}


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
							textShadow: style.textShadow ?? ''
						}}
						aria-label="Draggable"
						data-cypress="draggable-item"
						data-node-path={path}
						tabIndex={-1}
						className={cn(
							" !p-2 transition-all  text-center [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
							isDragging && " invisible"
						)}
					>

						{/* {"children"} */}

						{/* {date.day} */}
						{date[node.countDownType] ?? ''}




					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}

export function CustomCountDownWrapper({
	children,
	node,
	canvas,
	path,
	parent,
	onClick,
	...props

}: CustomCountDownNodeRenderProps) {

	const isFocused = canvas?.focused?.id === node.id;
	const isParent = canvas?.focusedParent?.id === node.id;

	const style = {
		// transform: CSS.Translate.toString(transform),
 		...CSSUtils.stripNullStyleValues(node.style)
	};

	const handleAddSection: React.MouseEventHandler<HTMLButtonElement> = (e) => {
		e.stopPropagation();
		const lastIdx = parseInt(path.slice(-1));
		const newSectionNode = generateNewNode("section");
		canvas?.insertSection(newSectionNode, lastIdx + 1);
		canvas?.focusNode({ id: newSectionNode.id, path: path + "." + lastIdx + 1 });

	};


	const handleMouseDown = (e: MouseEvent, changeType: "width" | "height") => {
		e.preventDefault();
		const startY = e.clientY;
		const startHeight = CSSUtils.extractEmValue(node.style.height);

		const startX = e.clientX;
		const startWidth = CSSUtils.extractEmValue(node.style.width);

		const onMouseMove = (moveEvent: MouseEvent) => {
			// Calculate new height: original height + distance moved


			const newHeight = startHeight + (moveEvent.clientY - startY);
			const newWidth = startWidth + (moveEvent.clientX - startX);

			// if(changeType==="height"){
			// newHeight > 50 &&   canvas?.updateNodeStyle({
			//     height:CSSUtils.setEmValue(rect.height)
			// })
			// }
			// else {
			//     newWidth > 50 &&   canvas?.updateNodeStyle({
			//         width:CSSUtils.setEmValue(newWidth)
			//     })
			// }
			// setHeight(newHeight > 50 ? newHeight : 50); // Set a minimum height
		};

		const onMouseUp = () => {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	};


	const isSelected = canvas?.selectedNodes.find(n => n.id === node.id)
	// useMemo(() => canvas?.selectedNodes.find(n => n.id === node.id), [canvas?.focused, canvas?.selectedNodes])


	const selctedStyle = () => {
		if (isSelected) {
			return {
				outline: "2px solid #a855f7",
				outlineOffset: "2px"
			};
		}

	}


	const isParentIsFocused = React.useMemo(() => {

		if (canvas?.focusedNode && ["block", 'section'].includes(canvas?.focusedNode.contentType)) {
			return (canvas?.focusedNode as LayoutNode)?.children?.find((childNode) => childNode.id === node.id)
		}
		return false
	}, [canvas?.focusedNode])

	// 	interface TimeLeft {
	//   d: number;
	//   h: number;
	//   m: number;
	//   s: number;
	//   pct: number;
	// }

	// const dateFunc = moment()

	const { startDate, endDate } = canvas?.content as CanvasNode


	const { day, month, year, minute, hour } = canvas?.content?.endDate || { day: 0, month: 0, year: 0, minute: 0, hour: 0 }


	const start = canvas?.content?.startDate || { day: 0, month: 0, year: 0, minute: 0, hour: 0 }


	const END_DATE = moment(`${year || '0000'}-${month || '00'}-${day || '00'} ${hour || '00'}:${minute || '00'}:00`, "YYYY-MM-DD HH:mm:ss")

	const START_DATE = moment(`${start.year || '0000'}-${start.month || '00'}-${start.day || '00'} ${start.hour || '00'}:${start.minute || '00'}:00`, "YYYY-MM-DD HH:mm:ss")



	const { date } = useCountDown({ startDate, endDate })

	// console.log(date)

	const isStarted = moment().isSameOrAfter(START_DATE)
	const isEnded = moment().isSameOrAfter(END_DATE)

	const { t, title, date: startDateStr, description, footer } = {
		t: {
			d: date.day || 0,
			h: date.hour || 0,
			m: date.minute || 0,
			s: date.second || 0,
			pct: date.pct || 0
		},
		title: node.showTitle !== false ? node.title : undefined,
		date: START_DATE.format("YYYY-MM-DD  HH:mm A"),
		description: node.showDescription !== false ? node.description : undefined,
		footer: node.showFooter !== false ? node.footer : undefined

	};

	if (!canvas) return null

	return (
		<DragWrapper
			node={node}
			path={path}
			parent={parent}
			canvas={canvas}
			children={
				<CardWrapper style={style} value={{ t, title, date: startDate, description: description || '', isStarted, footer }} >
					{React.Children.map(children, (child) => {
						if (!React.isValidElement(child)) return child;

						return React.cloneElement(child as React.ReactElement<{ date: Record<"day" | "month" | "year" | "hour" | "second" | "minute" | 'pct', number> }>, {
							date,

						});
					})}
				</CardWrapper>
			}
			DragChild={({ attributes, listeners, setNodeRef, isDragging }) => (
				<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging}>
					<MotionWrapper
						isRoot={false}
						attributes={attributes}
						listeners={listeners}
						setNodeRef={setNodeRef}
						data-name='node'
						tabIndex={-1}
						onClick={(e: React.MouseEvent) => {
							e.stopPropagation();
							e.preventDefault();
							onClick && onClick(e as unknown as React.MouseEvent<HTMLElement>);
						}}
						data-node-path={path}
						id={`${node?.attributes?.id ?? node.id}`}
						data-id={`${node.id}`}
						style={{
							...style,
							// zoom:path ==="root"? "70%":""
							...selctedStyle()

						}}

						className={cn(
							" node group  [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight hover:z-[12] cursor-default",

							isFocused && "outline outline-[1.5px] z-[11]",

							isParent || isParentIsFocused &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",

							!node.style.backgroundColor &&
							!node.children?.length &&
							"bg-blue-200/50",
							isDragging && " invisible",
							// node.contentType === CONTENT_TYPE.Section && 'overflow-hidden'
						)}
					>
						<CardWrapper style={style} value={{ t, title, date: startDateStr, description: description || '', isStarted, footer, isEnded }} >
							{children}
						</CardWrapper>
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}
