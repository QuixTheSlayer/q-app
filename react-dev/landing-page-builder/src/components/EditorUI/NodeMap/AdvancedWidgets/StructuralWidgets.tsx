import React from "react"
import { cn } from "@/libs/cn"
import CSSUtils from "@/utils/CSS.utils"
import {
	Accordion as AccordionBase,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RenderNode from "@/components/EditorUI/RenderNode"
import {
	Slider,
	SliderContent,
	SliderDots,
	SliderItem,
	SliderNext,
	SliderPrevious,
} from "@/components/ui/Slider"
import { PiChatCircleTextDuotone } from "react-icons/pi"
import {
	AccordionNode,
	TabNode,
	TestimonialSliderNode,
} from "@/types/node.type"
import { ContentNodeRenderProps } from "../../Nodes"
import DragWrapper from "../../NodeWrapper/DragContainer"
import MotionWrapper from "../../NodeWrapper/MotionWrapper"
import PopoverWrapper from "../../NodeWrapper/PopoverWrapper"


export function Accordion({
	node,
	canvas,
	path,
	parent,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement> &
	ContentNodeRenderProps<AccordionNode>) {
	const style = {
		// transform: CSS.Translate.toString(transform),
		// ...node.style,
	};

	if (!canvas) return null

	// With headerIsNode, children[0] is the header node and the rest is body.
	const rendered = React.Children.toArray(children)
	const headerSlot = node.headerIsNode ? rendered[0] : undefined
	const bodySlots = node.headerIsNode ? rendered.slice(1) : rendered

	return (
		<DragWrapper
			node={node}
			path={path}
			parent={parent}
			canvas={canvas}
			children={
				<AccordionBase
					type="single"
					id="drag-overlay"
					data-id={node.id}
					className="!w-full outline outline-[1px] outline-highlight"
				>
					<AccordionItem value={node.id}>
						<AccordionTrigger style={node.style}>
							{headerSlot ?? node.header}
						</AccordionTrigger>
						<AccordionContent
							style={{
								...node.contentStyle,
								padding: node.style.padding,
							}}
						>
							{bodySlots}
						</AccordionContent>
					</AccordionItem>
				</AccordionBase>
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
							fontSize: "1em",
						}}
						aria-label="Draggable"
						data-cypress="draggable-item"
						data-node-path={path}
						className={cn(
							"[&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0",
							// isDragging && '!bg-blue-100 !text-blue-100 outline-0'
							isDragging && " invisible",
						)}
					>
						<AccordionBase defaultValue="open" type="single" collapsible className="w-full">
							<AccordionItem value={node.id}>
								<AccordionTrigger style={node.style}>
									{headerSlot ?? node.header}
								</AccordionTrigger>
								<AccordionContent className="pl-[2.75em]">
									<div
										style={{
											...node.contentStyle,

											// padding: node.style.padding,
										}}
									>
										{bodySlots}
									</div>
								</AccordionContent>
							</AccordionItem>
						</AccordionBase>
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}


export function Tab({
	node,
	canvas,
	path,
	parent,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<TabNode>) {
	const style = {
		// transform: CSS.Translate.toString(transform),
		// ...node.style,
	};

	const { tabType, color } = node

	if (!canvas) return null

	// With childrenAreTabs each child is one tab panel and its `name` is the
	// label; otherwise fall back to the legacy tabs[] array.
	const panels = React.Children.toArray(children)
	const labels = node.childrenAreTabs
		? (node.children ?? []).map((c, i) => c?.name || `Tab ${i + 1}`)
		: node.tabs.map((t) => t.name)

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
					style={{
						fontSize: "1em",
						width: '100%',
						height: "fit-content",
					}}
					className="outline outline-[2px] outline-highlight opacity-80"
				>
					<Tabs
						className=""
						defaultValue="0"
						style={{
							flexDirection: tabType === 'vertical' ? 'row' : 'column'
						}}
						value={node.activeTab.toString()}
					>
						<div style={{
							borderBottom: tabType === 'horizontal' ? '0.16em solid  #d4d4d486' : '',
							borderRight: tabType === 'vertical' ? '0.16em solid #d4d4d486 ' : ''
						}} className=" border-[#d4d4d486]   ">
							<TabsList style={{
								flexDirection: tabType === 'vertical' ? 'column' : 'row',
								"--active-color": color?.active || `#1a85ff`,
								"--primary":color?.active || `#1a85ff`,
							} as React.CSSProperties} className=" flex " >
								{labels.map((label, idx) => (
									<TabsTrigger
										className={cn(
											"data-[state=active]:bg-[color-mix(in_srgb,var(--active-color)_10%,transparent)]",
											"data-[state=active]:!border-[var(--active-color)]",
											"data-[state=active]:text-[var(--active-color)]"
										)} key={idx} value={idx.toString()}>
										{label}
									</TabsTrigger>
								))}
							</TabsList>
						</div>
						{node.childrenAreTabs
							? panels.map((panel, idx) => (
								<TabsContent key={idx} value={idx.toString()}>
									{panel}
								</TabsContent>
							))
							: node.tabs.map((tab, tabIdx) => (
								<TabsContent key={tabIdx} value={tabIdx.toString()}>
									{tab.children.map((tabChild, idx) => (
										<RenderNode
											key={tabChild?.id ?? idx}
											node={tabChild}
											path={`${path}.${tabIdx}.${idx}`}
											parent={{ id: node.id, path }}
											canvas={canvas}
										/>
									))}
								</TabsContent>
							))}
					</Tabs>
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
							fontSize: "1em",
							width: '100%',
							height: "fit-content"
						}}
						aria-label="Draggable"
						data-cypress="draggable-item"
						data-node-path={path}
						className={cn(
							"[&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] cursor-default",
							canvas?.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0",
							// isDragging && '!bg-blue-100 !text-blue-100 outline-0'
							isDragging && " invisible",
						)}
					>
						<Tabs
							className=""
							defaultValue="0"
							style={{
								flexDirection: tabType === 'vertical' ? 'row' : 'column'
							}}
							value={node.activeTab.toString()}
							onValueChange={(v) =>
								canvas.updateNode((node) => {
									return {
										...node,
										activeTab: Number(v),
									};
								})
							}
						>
							<div style={{
								borderBottom: tabType === 'horizontal' ? '0.16em solid  #d4d4d486' : '',
								borderRight: tabType === 'vertical' ? '0.16em solid #d4d4d486 ' : ''
							}} className=" border-[#d4d4d486]   ">
								<TabsList style={{
									flexDirection: tabType === 'vertical' ? 'column' : 'row',
									"--active-color": color?.active || `#1a85ff`
								} as React.CSSProperties} className=" flex " >
									{labels.map((label, idx) => (
										<TabsTrigger
											className={cn(
												"data-[state=active]:bg-[color-mix(in_srgb,var(--active-color)_10%,transparent)]",
												"data-[state=active]:border-[var(--active-color)]",
												"data-[state=active]:text-[var(--active-color)]"
											)} key={idx} value={idx.toString()}>
											{label}
										</TabsTrigger>
									))}
								</TabsList>
							</div>
							{node.childrenAreTabs
								? panels.map((panel, idx) => (
									<TabsContent key={idx} value={idx.toString()}>
										{panel}
									</TabsContent>
								))
								: node.tabs.map((tab, tabIdx) => (
									<TabsContent key={tabIdx} value={tabIdx.toString()}>
										{tab.children.map((tabChild, idx) => (
											<RenderNode
												key={tabChild?.id ?? idx}
												node={tabChild}
												path={`${path}.${tabIdx}.${idx}`}
												parent={{ id: node.id, path }}
												canvas={canvas}
											/>
										))}
									</TabsContent>
								))}
						</Tabs>
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}


export function TestimonialSlider({
	node,
	canvas,
	path,
	parent,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement> &
	ContentNodeRenderProps<TestimonialSliderNode>) {
	const style = {
		...CSSUtils.stripNullStyleValues(node.style),
	};

	const slideChildren = React.Children.toArray(children);

	if (!canvas) return null;

	return (
		<DragWrapper
			node={node}
			path={path}
			parent={parent}
			canvas={canvas}
			children={
				<div
					style={node.style}
					className="h-full w-full outline outline-[2px] opacity-80 overflow-hidden flex items-center justify-center bg-blue-200/60"
				>
					<PiChatCircleTextDuotone size="35%" className="text-blue-300" />
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
						style={{
							...style,
						}}
						data-node-path={path}
						className={cn(
							"relative overflow-hidden [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] cursor-default w-full",
							canvas.focused?.id === node.id && "outline outline-[1.5px]",
							canvas?.isParentIsFocused(node.id) &&
							"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
							canvas?.focusedParent?.id === node.id &&
							"outline-dashed outline-offset-0",
							isDragging && "invisible",
						)}
					>
						{slideChildren.length ? (
							<Slider
								className="w-full h-full"
								opts={{ loop: true, autoPlay: node.autoPlay }}
							>
								<SliderContent className="h-full">
									{slideChildren.map((slide, index) => (
										<SliderItem key={index} className="h-full">
											{slide}
										</SliderItem>
									))}
								</SliderContent>
								{node.showArrows !== false && (
									<>
										<SliderPrevious />
										<SliderNext />
									</>
								)}
								{node.showDots !== false && <SliderDots />}
							</Slider>
						) : (
							<div className="flex items-center justify-center w-full h-full bg-blue-200/50 min-h-[10em]">
								<PiChatCircleTextDuotone
									size="35%"
									className="text-blue-300"
								/>
							</div>
						)}
					</MotionWrapper>
				</PopoverWrapper>
			)}
		/>
	);
}
