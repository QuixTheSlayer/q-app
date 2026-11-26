import React from "react"
import { Star } from "lucide-react"
import { EarthIcon, MailIcon } from "lucide-react"
import { IoLogoFacebook, IoLogoGithub, IoLogoInstagram, IoLogoLinkedin, IoLogoYoutube } from "react-icons/io5"
import { RiTwitterXLine } from "react-icons/ri"
import { PiTelegramLogo } from "react-icons/pi"
import { NodeIcon } from '@/components/shared/NodeIcon'
import { useEditor } from "@/context/EditorContext"
import { cn } from "@/libs/cn"
import CSSUtils from "@/utils/CSS.utils"
import { formatCounterValue } from "@/utils/counter.utils"
import { formatRatingSummary, getStarFillPercent } from "@/utils/rating.utils"
import { lineClampStyle } from "@/components/PropertyPanelUI/Sections/relatedComponents/LineClampControl"
import {
	CounterNode,
	IconBlockNode,
	RatingNode,
	SeparatorsNode,
	SocialNode,
} from "@/types/node.type"
import { ContentNodeRenderProps } from "../../Nodes"
import DragWrapper from "../../NodeWrapper/DragContainer"
import MotionWrapper from "../../NodeWrapper/MotionWrapper"
import PopoverWrapper from "../../NodeWrapper/PopoverWrapper"



export function IconBlock({
	node,
	canvas,
	path,
	parent,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<IconBlockNode>) {
	const style = {
		// transform: CSS.Translate.toString(transform),
 		...CSSUtils.stripNullStyleValues(node.style),
	};


	if (!canvas) return null

	// Slots are flat: item i's title is at i*2, description at i*2+1.
	const slots = React.Children.toArray(children)
	const slotAt = (i: number) => slots[i] ?? undefined

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
					<div style={{
						flexDirection: node.arrangement === 'horizontal' ? 'row' : 'column',
						justifyContent: node.arrangement === 'horizontal' ? 'start' : 'start',
						alignItems: node.arrangement === 'horizontal' ? 'start' : 'start'
					}} className=" w-full justify-center flex-wrap gap-[30px] items-center flex  " >
						{
							node.items.map(({ title, description, color, size, icon, strokeWidth }, index) => {

								return (
									<div style={{
										flexDirection: node.iconType === 'iTt' ? 'row' : 'column',
										gap: node.iconType === 'iT' ? 10 : 14
									}} className=" flex justify-center  items-center " >
										<div key={index} style={{
											minWidth: size + 16,
											minHeight: size + 16,
											backgroundColor: color + '30'
										}} className=" flex justify-center  p-2 items-center rounded-full "  >
											<NodeIcon icon={icon} color={color} strokeWidth={strokeWidth} size={size} />
										</div>

										<div className=" flex flex-col gap-[2px] " >
											{
												node.iconType !== 'i' && (slotAt(index * 2) ?? <p className=" text-[15px] font-medium " > {title} </p>)
											}

											{
												node.iconType === 'iTt' && (slotAt(index * 2 + 1) ?? <p className=" text-[12.5px] text-[#5b6259] font-medium "> {description} </p>)
											}
										</div>


									</div>
								)
							})
						}

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
							"  [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
							isDragging && " invisible",
						)}
					>

						<div style={{
							flexDirection: node.arrangement === 'horizontal' ? 'row' : 'column',
							justifyContent: node.arrangement === 'horizontal' ? 'start' : 'center',
							alignItems: node.arrangement === 'horizontal' ? 'start' : 'center'
						}} className=" w-full h-fit  flex-wrap gap-[30px]  flex  " >
							{
								node.items.map(({ title, description, color, size, icon, strokeWidth, textColor }, index) => {

									return (
										<div style={{
											flexDirection: node.iconType === 'iTt' ? 'row' : 'column',
											gap: node.iconType === 'iT' ? 10 : 14
										}} className=" w-auto h-fit flex justify-center  items-center " >

											<div key={index} style={{
												minWidth: size + 16,
												minHeight: size + 16,
												backgroundColor: color + '30'
											}} className=" flex justify-center  p-2 items-center rounded-full "  >
												<NodeIcon icon={icon} color={color} strokeWidth={strokeWidth} size={size} />
											</div>

											{node.iconType !== 'i' && <div className=" flex flex-col gap-[2px] " >
												{
													node.iconType !== 'i' && (slotAt(index * 2) ?? <p style={{
														color: textColor || '#232425'
													}} className="  text-[15px] font-medium " > {title} </p>)
												}

												{
													node.iconType === 'iTt' && (slotAt(index * 2 + 1) ?? <p style={{
														color: textColor || '#232425'
													}} className=" text-[12.5px] text-[#5b6259] font-medium "> {description} </p>)
												}
											</div>}


										</div>
									)
								})
							}

						</div>

					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}


export function Separators({
	node,
	canvas,
	path,
	parent,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<SeparatorsNode>) {
	// The label is the one slot, at children[0].
	const labelSlot = React.Children.toArray(children)[0]
	const style = {
		// transform: CSS.Translate.toString(transform),
 		...CSSUtils.stripNullStyleValues(node.style),
	};


	const { separatorType, separatorLayout, color, label, size, labelColor, labelSize, labelWeight, labelFont, flip } = node



	const lineUi = {
		'content': {
			paint: `0 100%`,
			transparent: `0px 0px`
		},
		'dashed': {
			paint: `0 ${size}px`,
			transparent: `${size}px ${size + (size * (2 / 3))}px`
		},
		'dotted': {
			paint: `0 ${1}px`,
			transparent: `${1}px ${5}px`
		},
		'zigzag': {
			paint: ` 0 ${size}px `,
			transparent: ` ${size}px ${size * 2}px `
		}
	}

	const fontWeight = {
		'normal': 400,
		'thin': 250,
		'medium': 500,
		'semibold': 600,
		'bold': 700
	}

	const ui = {
		'horizontal': (type: 'content' | 'dotted' | 'dashed' | 'zigzag') => <div style={{
			width: '100%',
			height: 'fit-content',

		}} className=" flex justify-center   items-center  !text-[var(--bs-text-grey-700)]  " >

			{<div style={{
				background: `repeating-linear-gradient(to right, ${color} ${lineUi[type].paint},  transparent ${lineUi[type].transparent} ) top / 100% 1px no-repeat`
			}} className={` w-1/2 h-[1.5px]  `} ></div>}

			{label.length > 0 ? <div style={{
				fontSize: labelSize,
				color: labelColor,
				fontWeight: fontWeight[labelWeight],
				fontFamily: labelFont

			}} className={cn(`  px-2 `)}> {labelSlot ?? label} </div> : ``}

			{<div style={{
				background: `repeating-linear-gradient(to right, ${color} ${lineUi[type].paint},  transparent ${lineUi[type].transparent} ) top / 100% 1px no-repeat`
			}} className={cn(` w-1/2 h-[1.5px]  `)} ></div>}


		</div>,
		'vertical': (type: 'content' | 'dotted' | 'dashed' | 'zigzag') => <div style={{
			width: '2px',
			height: '100%',

			background: `repeating-linear-gradient(to bottom, ${color} ${lineUi[type].paint},  transparent ${lineUi[type].transparent} ) top / 1px 100% no-repeat`

		}} className="  text-[var(--bs-text-grey-700)] gap-2  " > </div>
	}

	const zigzagUI = {
		'horizontal': (type: 'content' | 'dotted' | 'dashed' | 'zigzag') => <div style={{
			'--saw-color': color,
			'--saw-size': `${size}px`,

			background: `linear-gradient(-135deg, var(--saw-color) var(--saw-size), transparent -1px) -1px var(--saw-size),
       					 linear-gradient(135deg, var(--saw-color) var(--saw-size), transparent -1px) -1px var(--saw-size)`,

			backgroundPosition: "center",
			backgroundRepeat: "repeat-x",
			backgroundSize: `${size * 2}px ${size * 2}px`,
			width: '100%',
			height: size * 2,
			transform: `scaleY(${flip ? -1 : 1})`


		}} className=" flex justify-center   items-center  !text-[var(--bs-text-grey-700)]  " >

		</div>,

		'vertical': (type: 'content' | 'dotted' | 'dashed' | 'zigzag') => <div style={{
			'--saw-color': color,
			'--saw-size': `${size}px`,
			background: `linear-gradient(45deg, var(--saw-color) var(--saw-size), transparent 0) 0 var(--saw-size),
        linear-gradient(135deg,var(--saw-color) var(--saw-size), transparent 0) 0 var(--saw-size)`,
			backgroundPosition: " left top",
			backgroundRepeat: "repeat-y",
			backgroundSize: `${size * 2}px ${size * 2}px`,
			width: size * 2,
			height: '100%',
			transform: `scaleX(${flip ? -1 : 1})`


		}} className="  text-[var(--bs-text-grey-700)] gap-2  " > </div>
	}


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
					{ui[separatorLayout](separatorType)}
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
							width: `${style.width}`,
							height: `${style.height}`,


						}}
						aria-label="Draggable"
						data-cypress="draggable-item"
						data-node-path={path}
						tabIndex={-1}
						className={cn(
							"    [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px]  !flex !items-center !justify-center cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0", " flex items-center justify-center",
							isDragging && " invisible",
						)}
					>

						{separatorType === 'zigzag' ? zigzagUI[separatorLayout](separatorType) : ui[separatorLayout](separatorType)}

					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}


export function Counter({
	node,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<CounterNode>) {
	const canvas = useEditor()

	const style = {
		...CSSUtils.stripNullStyleValues(node.style),
	};

	// The editor shows the final value statically — the count-up animation
	// (triggered on scroll into view) is a production-only concern, since
	// there's no meaningful "scroll into view" moment while editing.
	const formattedValue = formatCounterValue(node.endValue, node.decimals, node.useThousandsSeparator)

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
					className="outline outline-[2px] opacity-80"
				>
					{node.prefix && <span style={node.prefixStyle}>{node.prefix}</span>}
					<span style={node.numberStyle}>{formattedValue}</span>
					{node.suffix && <span style={node.suffixStyle}>{node.suffix}</span>}
				</div>
			}
			DragChild={({ attributes, listeners, setNodeRef, isDragging }) => (
				<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging} zIndexClassName="z-[9999]">
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
							"!p-2 [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0",
							isDragging && "invisible",
						)}
					>
						{node.prefix && <span style={node.prefixStyle}>{node.prefix}</span>}
						<span style={node.numberStyle}>{formattedValue}</span>
						{node.suffix && <span style={node.suffixStyle}>{node.suffix}</span>}
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}


export function StarRating({ node }: { node: RatingNode }) {
	return (
		<div className="flex" style={{ gap: node.starGap }}>
			{Array.from({ length: node.maxStars }).map((_, index) => {
				const fillPercent = getStarFillPercent(index, node.value)
				return (
					<div key={index} className="relative shrink-0" style={{ width: node.starSize, height: node.starSize }}>
						<Star
							size={node.starSize}
							fill={node.emptyColor}
							color={node.emptyColor}
							className="absolute inset-0"
						/>
						<div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
							<Star
								size={node.starSize}
								fill={node.filledColor}
								color={node.filledColor}
							/>
						</div>
					</div>
				)
			})}
		</div>
	)
}


export function Rating({
	node,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<RatingNode>) {
	const canvas = useEditor()

	const style = {
		...CSSUtils.stripNullStyleValues(node.style),
	};

	const summaryText = formatRatingSummary(node)

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
					className="outline outline-[2px] opacity-80"
				>
					<StarRating node={node} />
					{node.showSummary && <span style={{ ...node.summaryStyle, ...lineClampStyle(node, 'customSummaryText') }}>{summaryText}</span>}
				</div>
			}
			DragChild={({ attributes, listeners, setNodeRef, isDragging }) => (
				<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging} zIndexClassName="z-[9999]">
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
							"!p-2 [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0",
							isDragging && "invisible",
						)}
					>
						<StarRating node={node} />
						{node.showSummary && <span style={{ ...node.summaryStyle, ...lineClampStyle(node, 'customSummaryText') }}>{summaryText}</span>}
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}


export function Social({
	node,
	// canvas,
	path,
	parent,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<SocialNode>) {
	const canvas = useEditor()

	const style = {
		// transform: CSS.Translate.toString(transform),
 		...CSSUtils.stripNullStyleValues(node.style),
	};




	const socialIcons: Record<string, JSX.Element> = {
		"facebook": <IoLogoFacebook size={node.size} />,
		"instagram": <IoLogoInstagram size={node.size} />,
		"x": <RiTwitterXLine size={node.size} />,
		"telegram": <PiTelegramLogo size={node.size} />,
		"linkedin": <IoLogoLinkedin size={node.size} />,
		"mail": <MailIcon size={node.size} />,
		"github": <IoLogoGithub size={node.size} />,
		"youtube": <IoLogoYoutube size={node.size} />,
		"web": <EarthIcon size={node.size} />,


	}



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
					{socialIcons[node.socialType]}
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
							" !p-2 !text-black  [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
							isDragging && " invisible",
						)}
					>

						{socialIcons[node.socialType]}

					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}
