import { EVENT_DEADLINE } from "@/consts/event-widgets.const";
import { Pie, Bar, Line } from "react-chartjs-2";
import { buildChartConfig } from "@/utils/chart.utils";
import { cn } from "@/libs/cn";
import { extensions } from "@/libs/tiptap/config";
import { useGetRenderPageDataQuery } from "@/store/query";
import { EventDeadline } from "@/types/contentFile.type";
import {
	AccordionNode,
	ButtonNode,
	FormFieldNode,
	ContentNode,
	ImageSliderNode,
	ImageNode,
	VideoNode,
	LayoutNode,
	TableNode,
	TabNode,
	TextNode,
	ImageCarouselNode,
	ImageFlipFlopNode,
	GoogleMapNode,
	YoutubeNode,
	HtmlNode,
	CountDownNode,
	SocialNode,
	CountDownTextNode,
	CanvasNode,
	VerticalTabNode,
	SeparatorsNode,
	NewNodeNode,
	IconBlockNode,
	CustomeCountDownNode,
	ChartNode,
	TestimonialSliderNode,
	ProgressBarNode,
	CounterNode,
	RatingNode,
	TimelineNode,
	FaqNode,
	PricingToggleNode,
	CardsTemplateNode,
	NavBarTemplateNode,
	EventWidgetsGroupTemplateNode,
	PersonalCardTemplateNode,
	HeroTemplateNode,
	FooterTemplateNode,
	LayoutTemplateNode,
	TableEnterpriseNode,
	ButtonEnterpriseNode,
} from "@/types/node.type";
import { FaqVisual } from "@/components/shared/readyMadeTemplates/FaqVisual";
import { TimelineVisual } from "@/components/shared/readyMadeTemplates/TimelineVisual";
import { PricingToggleVisual } from "@/components/shared/readyMadeTemplates/PricingToggleVisual";
import { CardsTemplateVisual } from "@/components/shared/readyMadeTemplates/CardsTemplateVisual";
import { NavBarTemplateVisual } from "@/components/shared/readyMadeTemplates/NavBarTemplateVisual";
import { EventWidgetsGroupTemplateVisual } from "@/components/shared/readyMadeTemplates/EventWidgetsGroupTemplateVisual";
import { ProgressBarVisual } from "@/components/shared/readyMadeTemplates/ProgressBarVisual";
import { buildTableUiTypeStyle } from "@/utils/tableUiTypeStyles";
import { HeroTemplateVisual } from "@/components/shared/readyMadeTemplates/HeroTemplateVisual";
import { FooterTemplateVisual } from "@/components/shared/readyMadeTemplates/FooterTemplateVisual";
import { LayoutTemplateVisual } from "@/components/shared/readyMadeTemplates/LayoutTemplateVisual";
import { PersonalCardTemplateVisual } from "@/components/shared/readyMadeTemplates/PersonalCardTemplateVisual";
import { ButtonEnterpriseVisual } from "@/components/shared/readyMadeTemplates/ButtonEnterpriseVisual";
import CSSUtils from "@/utils/CSS.utils";
import { eventName, eventRouteMap, useResolvedEventHref, useEventRouteResolver } from "@/hooks/useResolvedEventHref";
import {
	generateHTML,
	useEditor as useTiptapEditor,
} from "@tiptap/react";
import React, { CSSProperties, useMemo, useState, useRef, useEffect } from "react";
import { inlineSvgMarkup } from "@/utils/inlineSvg";
import { animate, useInView } from "motion/react";
import { clampProgressValue } from "@/utils/progressBar.utils";
import { formatCounterValue } from "@/utils/counter.utils";
import { formatRatingSummary, getStarFillPercent } from "@/utils/rating.utils";
import { lineClampStyle } from "@/components/PropertyPanelUI/Sections/relatedComponents/LineClampControl";
import { Star } from "lucide-react";
import {
	Accordion as AccordionBase,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RenderElement from "@/components/PreviewUI/RenderElement";
import {
	Slider,
	SliderContent,
	SliderDots,
	SliderItem,
	SliderNext,
	SliderPrevious,
} from "@/components/ui/Slider";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	CarouselDots,
} from "@/components/ui/carousel";
import { TbCarouselHorizontal } from "react-icons/tb";
import { EditorContextType, Parent } from "@/context/EditorContext";
import { EarthIcon, MailIcon, MapPinnedIcon, VideoIcon } from "lucide-react";
import moment from "moment";
import CountDownComponents, { ViewProps } from "../CountDown/CountDown";
import { IoLogoFacebook, IoLogoGithub, IoLogoInstagram, IoLogoLinkedin, IoLogoYoutube } from "react-icons/io5";
import { RiTwitterXLine } from "react-icons/ri";
import { PiTelegramLogo } from "react-icons/pi";
import { CustomCountDownNodeRenderProps } from "../EditorUI/Nodes";
import { CardWrapper } from '@/components/CountDown/CountDown'
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { useCountDown } from "@/utils/calculateCountDown";
import { isValidEmail, isValidUrl } from "@/utils/isValidUrl";
import { NodeIcon } from '@/components/shared/NodeIcon'
import { safeHref } from "@/utils/security/safeUrl";
import { INLINE_SVG_ATTR, keepsPageColor, passthroughAttributes, safeTag, VOID_TAGS } from "@/utils/nodeAttributes";


// eventName/eventRouteMap/useResolvedEventHref moved to
// @/hooks/useResolvedEventHref (see its doc comments) so NavBar/Hero/
// EventWidgetsGroupTemplate CTAs and the plain Button component all share
// one definition instead of each re-deriving eventName themselves.

export interface ContainerRenderProps extends React.HTMLAttributes<HTMLElement> {
	node: LayoutNode;
	canvas?: CanvasNode
}

export interface ContentRenderProps<
	T extends ContentNode,
> extends React.HTMLAttributes<HTMLElement> {
	node: T;
	canvas: CanvasNode
}

function Root({ node, children }: ContainerRenderProps) {
	// Its width is the editor canvas size (see Canvas.tsx), not part of the published page.
	const { width: _canvasWidth, ...style } = node.style ?? {}
	// min-h-full, not h-full: imported root CSS like `#page { overflow: hidden }` would clip a fixed-height root.
	const Tag = safeTag(node.tag, 'div')
	return <Tag {...passthroughAttributes(node.attributes)} {...(node.tag ? { 'data-lp-tag': node.tag } : {})} data-id={node.id} className={cn("w-full min-h-full", node.attributes?.className)} id={node.attributes?.id} style={style}>{children}</Tag>;
}

// True for any link that isn't safe to render (javascript:, data:, ...), not only `javascript:` + `$`.
const isIncludeJs = (url: string) => safeHref(url) !== url

function Section({ node, children }: ContainerRenderProps) {
	const Tag = safeTag(node.tag, 'section')
	const sourceAttrs = { ...passthroughAttributes(node.attributes), ...(node.tag ? { 'data-lp-tag': node.tag } : {}) }


	if (node.attributes?.href)
		return (
			<a
				href={(!isIncludeJs(node.attributes.href)) ? node.attributes.href : ''}
				target={node.attributes.href?.includes("#") ? "_self" : "_blank"}
			>
				<Tag {...sourceAttrs}
					className={node.attributes?.className}

					id={node.attributes?.id}
					data-id={`${node.id}`}
					style={{
						backgroundColor: node.style.backgroundColor,
					}}
				>
					<div
						className="mx-auto"
						style={{
							...node.style,
							backgroundColor: "none",
							maxWidth: node.contentType === 'section' ? (node.style.maxWidth || '1200px') : '100%',
						}}
					>
						{children}
					</div>
				</Tag>
			</a>
		);

	return (
		<Tag {...sourceAttrs}
			data-id={`${node.id}`}

			id={node.attributes?.id}
			style={{
				...node.style,

				backgroundColor: node.style.backgroundColor,

			}}
			className={cn(node.attributes?.className, "mx-auto")}
		>
			{children}
			{/* <div
				className=" mx-auto"
				
			>
				{children}
			</div> */}
		</Tag>
	);
}


export const eventDeadlineMap: Record<string, keyof EventDeadline> = {
	"{{event_date}}": "end_date",
	"{{event_hour}}": "end_hour",
	"{{event_timezone}}": "timezone",
	"{{event_timezone_offset}}": "timezone_offset",
}

function Block({ node, children }: ContainerRenderProps) {
	const Tag = safeTag(node.tag, 'div')
	const sourceAttrs = { ...passthroughAttributes(node.attributes), ...(node.tag ? { 'data-lp-tag': node.tag } : {}) }
	const { data } = useGetRenderPageDataQuery(eventName || "", { skip: !eventName });


	const resolvedUrl = useMemo(() => {
		if (!node.attributes?.href) return "";
		if (!data) return !isIncludeJs(node.attributes.href) ? node.attributes.href :'';

		if (eventRouteMap[node.attributes?.href]) {
			const route = eventRouteMap[node.attributes.href];
			const routeUrl = data?.event_route[route];

			return routeUrl;
		}

		return  !isIncludeJs(node.attributes.href) ? node.attributes.href :'' ;
	}, [node.attributes, data?.event_route]);

	const route = eventRouteMap[node.attributes?.href || ""];
	const routeUrl = data?.event_route[route];

	if (routeUrl === "#") return <></>;

	if (node.attributes?.href && Tag !== 'area')
		return (
			<a
				href={  resolvedUrl}

				target={node.attributes.href?.includes("#") ? "_self" : "_blank"}
			>
				{

					<Tag {...sourceAttrs} data-id={`${node.id}`}








						className={`${node.attributes?.className ?? ""} `} id={node.attributes?.id} style={node.style}>
						{children}
					</Tag>
				}

			</a>
		);

	// A void tag (br, hr, img...) gets no children; an <area> carries its own link.
	const isVoid = VOID_TAGS.has(Tag)
	return (

		<Tag {...sourceAttrs} data-id={`${node.id}`}
			{...(Tag === 'area' && node.attributes?.href && !isIncludeJs(node.attributes.href) ? { href: node.attributes.href } : {})}
			className={`${node.attributes?.className ?? ""} `} id={node.attributes?.id} style={node.style}>
			{isVoid ? null : children}
		</Tag>
	);
}

;

function Text({ node }: ContentRenderProps<TextNode>) {
	const [collapsed, setCollapsed] = useState(true);

	const { data } = useGetRenderPageDataQuery(eventName || "", { skip: !eventName });

	const resolvedChildren = useMemo(() => {
		if (!node.children) return "{}";
		if (!data) return node.children;

		// Every occurrence: a page can show the deadline more than once in one text ("by {{event_date}} ... closes {{event_date}}").
		const fill = (text: string, token: string, value: string) => text.split(token).join(value);
		let parsedChildren = fill(node.children, EVENT_DEADLINE.END_DATE, data.event_deadline.end_date);
		parsedChildren = fill(parsedChildren, EVENT_DEADLINE.END_HOUR, data.event_deadline.end_hour);
		parsedChildren = fill(parsedChildren, EVENT_DEADLINE.TIMEZONE, data.event_deadline.timezone);
		parsedChildren = fill(parsedChildren, EVENT_DEADLINE.TIMEZONE_OFFSET, data.event_deadline.timezone_offset);

		return parsedChildren;

	}, [node.children, data?.event_deadline]);

	const editor = useTiptapEditor(
		{
			extensions: [...extensions],
			content: generateHTML(JSON.parse(resolvedChildren), extensions),
			onCreate: () => { },
		},
		[resolvedChildren],
	);

	const style: CSSProperties = {
		...node.style,
		overflow: collapsed ? "hidden" : undefined,
		display: collapsed ? "-webkit-box" : undefined,
		WebkitBoxOrient: collapsed ? "vertical" : undefined,
		WebkitLineClamp: collapsed ? node.style.WebkitLineClamp : undefined,
	};

	const scale = CSSUtils.getScale(window.innerWidth)

	return (
		<>
			{node.collapsable ? (
				<div>
					<div data-id={`${node.id}`} {...passthroughAttributes(node.attributes)}
						className={node.attributes?.className}
						id={node.attributes?.id}
						style={{
							...style,
							fontSize: style?.fontSize,
							textWrap: "wrap",
							color: style.color ?? (keepsPageColor(node.attributes) ? undefined : '#000000')

						}}
						dangerouslySetInnerHTML={{ __html: sanitizeHtml(editor?.getHTML()) }}
					></div>
					<button
						className="font-normal text-primary hover:text-blue-700"
						style={{
							// fontSize: node.style.fontSize
							fontSize:
								(CSSUtils.pxToEm(
									CSSUtils.extractEmValue(
										editor?.getAttributes("textStyle").fontSize,
									) || 16,
								) * scale) + "em",
						}}
						onClick={() => {
							setCollapsed((prev) => !prev);
						}}
					>
						{collapsed ? "Read More" : "Read Less"}
					</button>
				</div>
			) : (
				<div data-id={`${node.id}`} {...passthroughAttributes(node.attributes)}
					className={node.attributes?.className}
					id={node.attributes?.id}
					style={{
						...node.style,
						fontSize: style.fontSize,
						textWrap: "wrap",
						// Classed (imported) text takes its color from the page CSS.
						color: style.color ?? (keepsPageColor(node.attributes) ? undefined : '#000000')

					}}
					dangerouslySetInnerHTML={{ __html: sanitizeHtml(editor?.getHTML()) }}
				></div>
			)}
		</>
	);
}

function Image({ node }: ContentRenderProps<ImageNode>) {
	// An imported inline <svg> renders as that cleaned <svg> (same as the editor and the sandbox frame).
	const inlineSvg = useMemo(() => ((node.attributes as Record<string, unknown> | undefined)?.[INLINE_SVG_ATTR] ? inlineSvgMarkup(node.children) : null), [node.attributes, node.children])
	if (inlineSvg && !node.attributes?.href)
		return (
			<div className={node.attributes?.className} style={node.style}>
				<span data-id={`${node.id}`} style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: inlineSvg }} />
			</div>
		);




	if (node.attributes?.href)
		return (
			<a className={node.attributes?.className}
				href={(!isIncludeJs(node.attributes.href)) ? node.attributes.href : ''}
				target={node.attributes.href?.includes("#") ? "_self" : "_blank"}
			>
				<div
					style={node.style}
					className="overflow-hidden !flex !items-center !justify-center cursor-default"
				>
					<img {...passthroughAttributes(node.attributes)} data-id={`${node.id}`}
						style={{ ...node.style, rotate: undefined }}

						id={node.attributes?.id}
						src={node.children}
						className="w-full h-full object-cover max-none"
					/>
				</div>
			</a>
		);

	return (
		<div className={node.attributes?.className}
			style={node.style}
		// className="overflow-hidden !flex !items-center !justify-center cursor-default"
		>
			<img {...passthroughAttributes(node.attributes)}

				style={{ ...node.style, rotate: undefined }}

				data-id={`${node.id}`}

				id={node.attributes?.id}
				src={node.children}
				className="w-full h-full object-cover max-none"
			/>
		</div>
	);
}

function Video({ node }: ContentRenderProps<VideoNode>) {
	const src = node.children || node.src
	if (!src) return null
	return (
		<div className={node.attributes?.className} style={node.style}>
			<video {...passthroughAttributes(node.attributes)}
				style={node.style}
				data-id={`${node.id}`}
				id={node.attributes?.id}
				src={src}
				className="w-full h-full object-cover max-none"
				autoPlay={node.autoPlay}
				loop={node.loop}
				muted={node.muted !== false}
				controls={node.controls}
				playsInline
			/>
		</div>
	);
}

/** An imported form control, as the real (working) element with its page classes. */
function FormField({ node }: ContentRenderProps<FormFieldNode>) {
	const { field } = node
	const common = {
		...passthroughAttributes(node.attributes),
		'data-id': node.id,
		className: node.attributes?.className,
		id: node.attributes?.id,
		style: node.style,
		name: field.name,
		required: field.required,
		autoComplete: field.autoComplete,
	}
	if (node.tag === 'textarea') return <textarea {...common} placeholder={field.placeholder} rows={field.rows} defaultValue={field.value} />
	if (node.tag === 'select') {
		const selected = field.options?.find((o) => o.selected)?.value
		return (
			<select {...common} defaultValue={selected}>
				{(field.options ?? []).map((o, i) => <option key={i} value={o.value} disabled={o.disabled}>{o.label}</option>)}
			</select>
		)
	}
	return <input {...common} type={field.type} placeholder={field.placeholder} defaultValue={field.value} defaultChecked={field.checked} />
}

function Button({ node }: ContentRenderProps<ButtonNode>) {
	const { data } = useGetRenderPageDataQuery(eventName || "", { skip: !eventName });

	// console.log(node)

	const resolvedUrl = useMemo(() => {
		if (!node.attributes?.href) return "";
		if (!data) return node.attributes.href;

		if (eventRouteMap[node.attributes?.href]) {
			const route = eventRouteMap[node.attributes.href];
			const routeUrl = data?.event_route[route];

			return routeUrl;
		}

		return node.attributes.href;
	}, [node.attributes, data?.event_route]);

	const route = eventRouteMap[node.attributes?.href || ""];
	const routeUrl = data?.event_route[route];

	if (routeUrl === "#") return <></>;

	if (resolvedUrl)
		return (
			<a data-id={`${node.id}`} {...passthroughAttributes(node.attributes)}
				className={cn(node.attributes?.className, !node.tag && "flex justify-center items-center")}
				id={node.attributes?.id}
				href={resolvedUrl}
				target={resolvedUrl?.includes("#") ? "_self" : "_blank"}

				style={{
					...node.style,
					// An imported link keeps the page's font size (e.g. `.nav a { font-size: 12px }`).
					...(node.tag ? {} : { fontSize: "1em" }),
					cursor: "pointer"
				}}
			>
				{node.tag ? node.children : <span style={{ fontSize: node.style.fontSize }}>{node.children}</span>}
			</a>
		);

	return (
		<button data-id={`${node.id}`} {...passthroughAttributes(node.attributes)}
			className={cn(node.attributes?.className, !node.tag && "flex justify-center items-center")}
			id={node.attributes?.id}
			style={{
				...node.style,
				...(node.tag ? {} : { fontSize: "1em" }),
			}}
		>
			{node.tag ? node.children : <span style={{ fontSize: node.style.fontSize }}>{node.children}</span>}
		</button>
	);
}

function Table({ node }: ContentRenderProps<TableNode | TableEnterpriseNode>) {
	const editor = useTiptapEditor(
		{
			extensions: [...extensions],
			content: generateHTML(node.children, extensions),
			// content: node.children ? generateHTML(JSON.parse(node.children), extensions) : undefined,
			onCreate: () => { },
		},
		[],
	);

	const idClassName = "table-node-" + node.id;

	const dynamicTableStyle = buildTableUiTypeStyle(node, idClassName);


	return (
		<div
			data-id={`${node.id}`}
			id={node.attributes?.id}
			style={node.style}
			className={cn("table-node", idClassName, node.attributes?.className)}
		>
			<style>{dynamicTableStyle}</style>
			<div
				className="dragged-table"
				dangerouslySetInnerHTML={{ __html: sanitizeHtml(editor?.getHTML()) }}
			></div>
		</div>
	);
}

function Accordion({ node, children }: ContentRenderProps<AccordionNode>) {
	// With headerIsNode, children[0] is the header node and the rest is body.
	const rendered = React.Children.toArray(children)
	const headerSlot = node.headerIsNode ? rendered[0] : undefined
	const bodySlots = node.headerIsNode ? rendered.slice(1) : rendered

	return (
		<AccordionBase type="single" collapsible className="w-full">
			<AccordionItem value={node.id}>
				<AccordionTrigger style={node.style}>{headerSlot ?? node.header}</AccordionTrigger>
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
	);
}

function TestimonialSlider({ node, children }: ContentRenderProps<TestimonialSliderNode>) {
	const style = { ...node.style };
	const slideChildren = React.Children.toArray(children);

	if (!slideChildren.length) return null;

	return (
		<div data-id={node.id} style={style}>
			<Slider className="w-full h-full" opts={{ loop: true, autoPlay: node.autoPlay }}>
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
		</div>
	);
}

export function ProgressBar({ node, children }: ContentRenderProps<ProgressBarNode>) {
	const ref = useRef<HTMLDivElement>(null)
	const isInView = useInView(ref, { once: true, amount: 0.5 })
	const [displayValue, setDisplayValue] = useState(node.triggerOnView ? 0 : clampProgressValue(node.value))

	useEffect(() => {
		if (node.triggerOnView && !isInView) return

		const controls = animate(0, clampProgressValue(node.value), {
			duration: node.duration,
			ease: "easeOut",
			onUpdate: (value) => setDisplayValue(value),
		})

		return () => controls.stop()
	}, [isInView, node.triggerOnView, node.value, node.duration])

	const style = { ...node.style }

	return (
		<div ref={ref} data-name='node' id={node.attributes?.id ?? ''} data-id={node.id} style={style}>
			{/* `children` is the rendered [label] node for bars that have one;
			    legacy bars pass none and the Visual renders their flat field. */}
			<ProgressBarVisual node={node} displayValue={displayValue} slots={children} />
		</div>
	);
}

function Tab({ node, canvas, children }: ContentRenderProps<TabNode>) {

	const { tabType, color } = node

	// With childrenAreTabs each child is one tab panel and its `name` is the
	// label; otherwise fall back to the legacy tabs[] array.
	const panels = React.Children.toArray(children)
	const labels = node.childrenAreTabs
		? (node.children ?? []).map((c, i) => c?.name || `Tab ${i + 1}`)
		: node.tabs.map((t) => t.name)

	return (
		<Tabs
			className=""
			defaultValue="0"
			style={{
				flexDirection: tabType === 'vertical' ? 'row' : 'column'
			}}

		>
			<div style={{
				borderBottom: tabType === 'horizontal' ? '0.16em solid  #d4d4d486' : '',
				borderRight: tabType === 'vertical' ? '0.16em solid #d4d4d486 ' : ''
			}} className=" border-[#d4d4d486]   ">
				<TabsList style={{
					flexDirection: tabType === 'vertical' ? 'column' : 'row',
					"--active-tab-color": color?.active || `#1a85ff`
				} as React.CSSProperties} className=" flex " >
					{labels.map((label, idx) => (
						<TabsTrigger className={cn(
							"data-[state=active]:bg-[var(--active-tab-color)20]",
							"data-[state=active]:border-[var(--active-tab-color)]",
							"data-[state=active]:text-[var(--active-tab-color)]"
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
							<RenderElement
								key={tabChild?.id ?? idx}
								node={tabChild}
								canvas={canvas}
							/>
						))}
					</TabsContent>
				))}
		</Tabs>
	);
}

function ImageSlider({ node }: ContentRenderProps<ImageSliderNode>) {
	return (
		<div
			style={{
				...node.style,
				maxHeight: "none",
			}}
			className={"overflow-hidden !flex !items-center !justify-center cursor-default " + node.attributes?.className}
		>
			{node.images?.length ? (
				<Slider className="w-full h-full" opts={{ loop: true }}>
					<SliderContent>
						{node.images.map((img, index) => (
							<SliderItem key={index}>
								<img
									src={img.url}
									alt={img.altText || ""}
									className="w-full h-full max-h-[55rem]"
									style={{
										objectFit: node.objectFit || 'contain',
										backgroundColor: node.imageBackground || 'transparent',
										maxHeight: CSSUtils.extractEmValue(node.style.maxHeight),
									}}
								/>
							</SliderItem>
						))}
					</SliderContent>
					<>
						<SliderPrevious />
						<SliderNext />
						<SliderDots />
					</>
				</Slider>
			) : (
				<div className="flex items-center justify-center w-full h-full bg-blue-200/50">
					<TbCarouselHorizontal
						strokeWidth={1.3}
						size="40%"
						className="text-blue-300"
					/>
				</div>
			)}
		</div>
	);
}

function ImageCarousel({ node }: ContentRenderProps<ImageCarouselNode>) {
	return (
		<div
			style={{
				...node.style,
				height: "fit-content",
				maxHeight: "none",
			}}
			className={"overflow-hidden !flex !items-center !justify-center cursor-default " + node.attributes?.className}
		>
			{node.images?.length ? (
				<Carousel
					className="h-fit text-[1em] flex items-center justify-center w-full"
					style={{
						fontSize: "1em",
						height: node.style.height || "auto",
					}}
					opts={{
						loop: true,
						autoPlay: node.autoPlay,
						slidesToScroll: node.slidesPerScroll || 1,
					}}
					autoPlayOptions={{
						delay: node.delay || 3000,
					}}
				>
					<CarouselContent className="h-full w-full">
						{node.images.map((img, index) => (
							<CarouselItem
								key={index}
								className="flex items-center justify-center basis-[25%]"
								style={{
									flexBasis: `${100 / (node.imagesPerView || 4)}%`,
									paddingInline: `${(node.gap ?? 0) / 2}px`,
								}}
							>
								<img
									src={img.url}
									alt={img.altText || ""}
									className="w-full h-full max-none"
									style={{ objectFit: node.objectFit || 'contain' }}
								// style={{
								// 	maxHeight: CSSUtils.extractEmValue(node.style.maxHeight),
								// }}
								/>
							</CarouselItem>
						))}
					</CarouselContent>
					<>
						<CarouselPrevious />
						<CarouselNext />
						{/* <CarouselDots /> */}
					</>
				</Carousel>
			) : (
				<div className="flex items-center justify-center w-full h-full bg-blue-200/50">
					<TbCarouselHorizontal
						strokeWidth={1.3}
						size="40%"
						className="text-blue-300"
					/>
				</div>
			)}
		</div>
	);
}

function ImageFlipFlop({ node }: ContentRenderProps<ImageFlipFlopNode>) {
	return (
		<div
			style={node.style}
			className="relative overflow-hidden [perspective:800px] group/flipflop"
		>
			<div
				className="relative w-full h-full transition-transform duration-500 group-hover/flipflop:[transform:rotateY(180deg)]"
				style={{ transformStyle: "preserve-3d" }}
			>
				{/* Front – image */}
				<div
					className="absolute inset-0 w-full h-full"
					style={{ backfaceVisibility: "hidden" }}
				>
					{node.imageUrl && (
						<img
							src={node.imageUrl}
							alt="flip-flop"
							className="w-full h-full object-cover"
						/>
					)}
				</div>

				{/* Back – text */}
				<div
					className="absolute inset-0 w-full h-full flex items-center justify-center px-4"
					style={{
						backfaceVisibility: "hidden",
						backgroundColor: node.flipBackgroundColor || "#1e293b",
						transform: "rotateY(180deg)",
					}}
				>
					<p style={node.flipTextStyle}>{node.flipText}</p>
				</div>
			</div>
		</div>
	);
}

function GoogleMap({ node }: ContentRenderProps<GoogleMapNode>) {


	const style = {
		...node.style, width: '100%',
		height: '100%'
	}



	if (node.attributes?.href)
		return (
			<a className={node.attributes?.className}
				href={node.attributes.href}
				target={node.attributes.href?.includes("#") ? "_self" : "_blank"}
			>
				<div
					style={style}
					className="overflow-hidden !flex !items-center !justify-center cursor-default"
				>
					{
						node?.url ? <iframe src={node?.url || ''} style={{
							width: `calc(${style.width})`,
							height: `calc(${style.height} )`
						}} className={cn(node.attributes?.className, "w-full h-full")} sandbox="allow-scripts allow-same-origin allow-presentation" allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
							:
							<div className={cn(node.attributes?.className, 'flex  justify-center items-center w-[60px] h-[60px]')} >
								<MapPinnedIcon className="!text-gray-500" size={60} />
							</div>
					}
				</div>
			</a>
		);

	return (
		<div className={node.attributes?.className}
			style={style}
		// className="overflow-hidden !flex !items-center !justify-center cursor-default"
		>
			{
				node?.url ? <iframe src={node?.url || ''} style={{
					width: `calc(${style.width})`,
					height: `calc(${style.height})`
				}} className={node.attributes?.className} sandbox="allow-scripts allow-same-origin allow-presentation" allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
					:
					<div className={cn(node.attributes?.className, 'flex  justify-center items-center w-[60px] h-[60px]')} >
						<MapPinnedIcon className="!text-gray-500" size={60} />
					</div>
			}

		</div>
	);
}

function YouTube({ node }: ContentRenderProps<YoutubeNode>) {

	const style = {
		...node.style, width: '100%',
		height: '100%'
	}


	if (node.attributes?.href)
		return (
			<a className={node.attributes?.className}
				href={node.attributes.href}
				target={node.attributes.href?.includes("#") ? "_self" : "_blank"}
			>
				<div
					style={node.style}
					className="overflow-hidden w-full h-full !flex !items-center !justify-center cursor-default"
				>
					{
						node.url ? <iframe src={node?.url || ''} style={{
							width: `calc(${style.width} )`,
							height: `calc(${style.height})`
						}} allowFullScreen={true} sandbox="allow-scripts allow-same-origin allow-presentation" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" />
							:
							<div style={style} className={cn(node.attributes?.className, 'flex  justify-center items-center w-full h-full')} >
								<VideoIcon className="!text-gray-500" size={60} />
							</div>
					}
				</div>
			</a>
		);

	return (
		<div className={node.attributes?.className}
			style={style}
		// className="overflow-hidden !flex !items-center !justify-center cursor-default"
		>
			{
				node.url ? <iframe src={node?.url || ''} style={{
					width: `calc(${style.width})`,
					height: `calc(${style.height})`
				}} allowFullScreen={true} sandbox="allow-scripts allow-same-origin allow-presentation" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" />
					:
					<div style={style} className={cn(node.attributes?.className, 'flex  justify-center items-center w-full h-full')} >
						<VideoIcon className="!text-gray-500" size={60} />
					</div>
			}

		</div>
	);
}


function WebPage({ node }: ContentRenderProps<HtmlNode>) {

	const style = {
		...node.style,
		width: '100%',
		height: '100%'
	}


	if (node.attributes?.href)
		return (
			<a className={node.attributes?.className}
				href={node.attributes.href}
				target={node.attributes.href?.includes("#") ? "_self" : "_blank"}
			>
				<div
					style={style}
					className="overflow-hidden !flex !items-center !justify-center cursor-default"
				>
					{
						node.url ? <iframe X-Frame-Options sandbox="allow-scripts allow-same-origin allow-presentation" src={node?.url || ''} style={{
							width: `calc(${style.width})`,
							height: `calc(${style.height})`
						}} allowFullScreen={true} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" />
							:
							<div style={style} className={cn(node.attributes?.className, 'flex  justify-center items-center w-full h-full')} >
								<EarthIcon className="!text-gray-500" size={60} />
							</div>
					}
				</div>
			</a>
		);

	return (
		<div className={node.attributes?.className}
			style={style}
		// className="overflow-hidden !flex !items-center !justify-center cursor-default"
		>
			{
				node.url ? <iframe X-Frame-Options src={node?.url || ''} style={{
					width: `calc(${style.width})`,
					height: `calc(${style.height})`
				}} allowFullScreen={true} sandbox="allow-scripts allow-same-origin allow-presentation" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" />
					:
					<div style={style} className={cn(node.attributes?.className, 'flex  justify-center items-center w-full h-full')} >
						<EarthIcon className="!text-gray-500" size={60} />
					</div>
			}

		</div>
	);
}


function CountDown({ node, canvas }: ContentRenderProps<CountDownNode>) {




	const content = canvas

	const style = node

	const { startDate, endDate } = content

	const { date } = useCountDown({ startDate, endDate })


	const { day, month, year, minute, hour } = content?.endDate || { day: 0, month: 0, year: 0, minute: 0, hour: 0 }


	const start = content?.startDate || { day: 0, month: 0, year: 0, minute: 0, hour: 0 }


	const END_DATE = moment(`${year || '0000'}-${month || '00'}-${day || '00'} ${hour || '00'}:${minute || '00'}:00`, "YYYY-MM-DD HH:mm:ss")

	const START_DATE = moment(`${start.year || '0000'}-${start.month || '00'}-${start.day || '00'} ${start.hour || '00'}:${start.minute || '00'}:00`, "YYYY-MM-DD HH:mm:ss")


	const isStarted = moment().isSameOrAfter(START_DATE)
	const isEnded = moment().isSameOrAfter(END_DATE)


	const viewProps: ViewProps = {
		t: {
			d: date.day,
			h: date.hour,
			m: date.minute,
			s: date.second,
			pct: date.pct
		},
		title: node.title,
		date: START_DATE.format("YYYY-MM-DD  HH:mm A"),
		isStarted,
		description: node.description,
		footer: node.footer,
		isEnded

	};

	const Component = CountDownComponents[node.uiType]

	return (
		<div className={node?.attributes?.className}
			style={{
				...node.style,
				'--countdown-title': node.colors?.title,
				'--countdown-description': node.colors?.description,
				'--countdown-footer': node.colors?.footer,
				'--countdown-basic': node.colors?.countDown.basic,
				'--countdown-primary': node.colors?.countDown.primary,
				'--countdown-secondary': node.colors?.countDown.secondary,





			} as CSSProperties}
		// className="overflow-hidden !flex !items-center !justify-center cursor-default"
		>
			<Component {...viewProps} />

		</div>
	);
}


export function CountDownText({
	node,
	canvas


}: ContentRenderProps<CountDownTextNode>) {

	// Hooks run on every render, before any early return, so their order never changes.
	const { startDate, endDate } = (canvas ?? {}) as unknown as CanvasNode

	const { date } = useCountDown({ startDate, endDate })

	if (!canvas) return null

	if (node)
		return (

			<div
				data-name='node'

				id={node.id}
				data-id={node.id}
				style={node.style}
				aria-label="Draggable"
				data-cypress="draggable-item"
				tabIndex={-1}
				className={node.attributes?.className}
			>

				{/* {"children"} */}

				{/* {date.day} */}
				{date[node.countDownType] ?? ''}




			</div>

		);
}

interface CustomCountDownElRenderProps extends React.HTMLAttributes<HTMLElement> {
	node: CustomeCountDownNode;
	canvas?: CanvasNode;
	path: string;
	parent?: Parent;
}

export function CustomCountDownWrapper({ node, children, canvas }: CustomCountDownElRenderProps) {

	// Hooks run on every render, before any early return, so their order never changes.
	const { startDate, endDate } = (canvas ?? {}) as Partial<CanvasNode>

	const { date } = useCountDown({ startDate, endDate })

	if (!canvas) return null



	// const { date } = useCountDown({ startDate, endDate })


	const { day, month, year, minute, hour } = endDate || { day: 0, month: 0, year: 0, minute: 0, hour: 0 }


	const start = startDate || { day: 0, month: 0, year: 0, minute: 0, hour: 0 }


	const END_DATE = moment(`${year || '0000'}-${month || '00'}-${day || '00'} ${hour || '00'}:${minute || '00'}:00`, "YYYY-MM-DD HH:mm:ss")

	const START_DATE = moment(`${start.year || '0000'}-${start.month || '00'}-${start.day || '00'} ${start.hour || '00'}:${start.minute || '00'}:00`, "YYYY-MM-DD HH:mm:ss")

	// console.log(date)

	const isStarted = moment().isSameOrAfter(START_DATE)
	const isEnded = moment().isSameOrAfter(END_DATE)



	const { t, title, date: startDateStr, description, footer } = {
		t: {
			d: date.day,
			h: date.hour,
			m: date.minute,
			s: date.second,
			pct: date.pct
		},
		title: node.title,
		date: START_DATE.format("YYYY-MM-DD  HH:mm A"),
		description: node.description,
		footer: node.footer

	};



	if (node)
		return (

			<div

				data-name='node'

				id={`${node?.attributes?.id ?? node.id}`}
				data-id={`${node.id}`}

				style={node.style}

				className={node.attributes?.className}
			>
				<CardWrapper style={node.style} value={{ t, title, date: startDateStr, description: description || '', isStarted, footer, isEnded }} >
					{children}
				</CardWrapper>
			</div>






		);
}

export function Social({ node, canvas }: ContentRenderProps<SocialNode>) {


	const style = {
		// transform: CSS.Translate.toString(transform),

		...node.style,

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



	if (node)
		return (

			<div
				data-name='node'


				id={node.id}
				data-id={node.id}
				style={{
					...style,
					width: 'fit-content',
					height: 'fit-content'
				}}
			>

				<a className=" w-[99.9%] h-[99.9%] flex " target={"_blank"} href={`${node.socialType === 'mail' ? 'mailto:' + (isValidEmail(node.link) ? node.link : '#') : (isValidUrl(node.link) ? node.link : '#')}`}>{socialIcons[node.socialType]}</a>

			</div>



		);
}



export function Counter({ node }: ContentRenderProps<CounterNode>) {
	const ref = useRef<HTMLDivElement>(null)
	const isInView = useInView(ref, { once: true, amount: 0.5 })
	const [displayValue, setDisplayValue] = useState(node.triggerOnView ? node.startValue : node.endValue)

	useEffect(() => {
		if (node.triggerOnView && !isInView) return

		const controls = animate(node.startValue, node.endValue, {
			duration: node.duration,
			ease: "easeOut",
			onUpdate: (value) => setDisplayValue(value),
		})

		return () => controls.stop()
	}, [isInView, node.triggerOnView, node.startValue, node.endValue, node.duration])

	const style = { ...node.style }
	const formattedValue = formatCounterValue(displayValue, node.decimals, node.useThousandsSeparator)

	return (
		<div ref={ref} data-name='node' id={node.attributes?.id ?? ''} data-id={node.id} style={style}>
			{node.prefix && <span style={node.prefixStyle}>{node.prefix}</span>}
			<span style={node.numberStyle}>{formattedValue}</span>
			{node.suffix && <span style={node.suffixStyle}>{node.suffix}</span>}
		</div>
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

export function Rating({ node }: ContentRenderProps<RatingNode>) {
	const style = { ...node.style }
	const summaryText = formatRatingSummary(node)

	return (
		<div data-name='node' id={node.attributes?.id ?? ''} data-id={node.id} style={style}>
			<StarRating node={node} />
			{node.showSummary && <span style={{ ...node.summaryStyle, ...lineClampStyle(node, 'customSummaryText') }}>{summaryText}</span>}
		</div>
	);
}

export function TimelineTrack({ node, slots }: { node: TimelineNode; slots?: React.ReactNode }) {
	return <TimelineVisual node={node} slots={slots} />
}

export function Timeline({ node, children }: ContentRenderProps<TimelineNode> & { children?: React.ReactNode }) {
	const style = { ...node.style }

	return (
		<div data-name='node' id={node.attributes?.id ?? ''} data-id={node.id} style={style}>
			{/* `children` is the rendered child tree RenderElement recurses into
			    for a timeline that has one; legacy ones pass none and the Visual
			    renders their flat steps instead. */}
			<TimelineTrack node={node} slots={children} />
		</div>
	);
}

export function FaqList({ node, slots }: { node: FaqNode; slots?: React.ReactNode }) {
	return <FaqVisual node={node} slots={slots} />
}

export function Faq({ node, children }: ContentRenderProps<FaqNode> & { children?: React.ReactNode }) {
	const style = { ...node.style }

	return (
		<div data-name='node' id={node.attributes?.id ?? ''} data-id={node.id} style={style}>
			{/* `children` is the rendered child tree RenderElement recurses into
			    for a FAQ that has one; legacy FAQs pass none and the Visual
			    renders their flat items instead. */}
			<FaqList node={node} slots={children} />
		</div>
	);
}

export function PricingToggleDisplay({ node, slots }: { node: PricingToggleNode; slots?: React.ReactNode }) {
	return <PricingToggleVisual node={node} slots={slots} />
}

export function PricingToggle({ node, children }: ContentRenderProps<PricingToggleNode>) {
	const style = { ...node.style }

	return (
		<div data-name='node' id={node.attributes?.id ?? ''} data-id={node.id} style={style}>
			{/* `children` is the rendered [planName] node when the toggle has one. */}
			<PricingToggleDisplay node={node} slots={children} />
		</div>
	);
}

export function CardsTemplate({ node, children }: ContentRenderProps<CardsTemplateNode>) {
	const style = { ...node.style }

	return (
		<div data-name='node' id={node.attributes?.id ?? ''} data-id={node.id} style={style}>
			<CardsTemplateVisual node={node} slots={children} />
		</div>
	);
}

export function NavBarTemplate({ node, children }: ContentRenderProps<NavBarTemplateNode> & { children?: React.ReactNode }) {
	const style = { ...node.style }

	// Same {{event_...}} placeholder resolution EventWidgetsGroupTemplate's
	// submitEntryHref/registerHref get below — ctaHref renders as a plain
	// <a href> in NavBarTemplateVisual with no page-context of its own.
	const ctaHref = useResolvedEventHref(node.ctaHref)

	return (
		<div data-name='node' id={node.attributes?.id ?? ''} data-id={node.id} style={style}>
			{/* `children` is the rendered child tree for a NavBar that has one;
			    legacy ones pass none and the Visual renders its flat fields. */}
			<NavBarTemplateVisual node={{ ...node, ctaHref }} slots={children} />
		</div>
	);
}

export function EventWidgetsGroupTemplate({ node, children }: ContentRenderProps<EventWidgetsGroupTemplateNode>) {
	const style = { ...node.style }

	const submitEntryHref = useResolvedEventHref(node.submitEntryHref) || ""
	const registerHref = useResolvedEventHref(node.registerHref) || ""

	const resolvedNode = { ...node, submitEntryHref, registerHref }

	return (
		<div data-name='node' id={node.attributes?.id ?? ''} data-id={node.id} style={{ ...style, padding: 0 }}>
			<EventWidgetsGroupTemplateVisual node={resolvedNode} slots={children} />
		</div>
	);
}

export function PersonalCardTemplate({ node, children }: ContentRenderProps<PersonalCardTemplateNode>) {
	const style = { ...node.style }

	return (
		<div data-name='node' id={node.attributes?.id ?? ''} data-id={node.id} style={style}>
			<PersonalCardTemplateVisual node={node} slots={children} />
		</div>
	);
}

export function HeroTemplate({ node, children }: ContentRenderProps<HeroTemplateNode> & { children?: React.ReactNode }) {
	const style = { ...node.style }

	// Same {{event_...}} placeholder resolution as NavBarTemplate's ctaHref
	// and EventWidgetsGroupTemplate's submitEntryHref/registerHref.
	const ctaHref = useResolvedEventHref(node.ctaHref)

	return (
		<div data-name='node' id={node.attributes?.id ?? ''} data-id={node.id} style={style}>
			{/* `children` is the rendered child tree RenderElement recurses into
			    for a Hero that has one; legacy Heros pass none and the Visual
			    renders their flat fields instead. */}
			<HeroTemplateVisual node={{ ...node, ctaHref: ctaHref || '' }} slots={children} />
		</div>
	);
}

export function FooterTemplate({ node, children }: ContentRenderProps<FooterTemplateNode> & { children?: React.ReactNode }) {
	const style = { ...node.style }

	// Same {{event_...}} placeholder resolution as NavBarTemplate's ctaHref
	// and EventWidgetsGroupTemplate's submitEntryHref/registerHref — footer
	// links are a list rather than one fixed field, so each link's href is
	// resolved individually via the shared resolver function.
	const resolveHref = useEventRouteResolver()
	const resolvedNode = {
		...node,
		columns: node.columns.map((column) => ({
			...column,
			links: column.links.map((link) => ({ ...link, href: resolveHref(link.href) || '' })),
		})),
	}

	return (
		<div data-name='node' id={node.attributes?.id ?? ''} data-id={node.id} style={style}>
			{/* `children` is the rendered child tree for a Footer that has one;
			    legacy ones pass none and the Visual renders its flat fields. */}
			<FooterTemplateVisual node={resolvedNode} slots={children} />
		</div>
	);
}

export function ButtonEnterprise({ node, children }: ContentRenderProps<ButtonEnterpriseNode>) {
	const style = { ...node.style }
	const buttonHref = useResolvedEventHref(node.href)

	
		return (
			<div data-name='node' id={node.attributes?.id ?? ''} data-id={node.id} style={style}>
				{/* `children` is the rendered [label, subLabel] tree when present. */}
				<ButtonEnterpriseVisual node={{
					...node,
					href: buttonHref ||'#'
				}} slots={children} />
			</div>
		);
}

export function LayoutTemplate({ node, children }: ContentRenderProps<LayoutTemplateNode> & { children?: React.ReactNode }) {
	const style = { ...node.style }

	return (
		<div data-name='node' id={node.attributes?.id ?? ''} data-id={node.id} style={style}>
			{/* `children` is the rendered child tree for a layout that has one;
			    legacy layouts pass none and the Visual renders their flat fields. */}
			<LayoutTemplateVisual node={node} slots={children} />
		</div>
	);
}

export function VerticalTab({ node, canvas }: ContentRenderProps<VerticalTabNode>) {


	const style = {
		// transform: CSS.Translate.toString(transform),

		...node.style,
	};

	// console.log("0", node)


	const { tabList, activeTab, collapsible, hasBorder } = node


	if (tabList[activeTab]?.child)
		return (
			<Tabs orientation="horizontal" defaultValue="0">
				<div className="border-b-[0.16em] border-neutral-100">
					<TabsList  >
						{node.tabList.map((tab, idx) => (
							<TabsTrigger key={tab.value} value={idx.toString()}>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
				</div>
				{node.tabList.map((tab, idx) => (
					<TabsContent key={tab.value} value={idx.toString()}>
						{tab?.child.length > 0 && tab?.child?.map((tabChild) => (
							<RenderElement node={tabChild} />
						))}
					</TabsContent>
				))}
			</Tabs>

			// <div
			// 	data-name='node'


			// 	id={node.id}
			// 	data-id={node.id}
			// 	style={style}
			// >

			// 	<div className=" flex justify-start items-start w-full h-full gap-2 " >
			// 									{/* TabList  */}
			// 									<div className={cn('w-auto min-w-[100px] flex flex-col gap-4  ', hasBorder && `border-l border-${node.style.borderColor} border-[${node.style.borderWidth}] `)} >
			// 										{
			// 											tabList.map(({ value, label, icon }) => {
			// 												return (
			// 													<div onClick={() => {
			// 														(canvas as unknown as EditorContextType).updateNode((node) => ({
			// 															...node,
			// 															activeTab: value as string || ''
			// 														}))
			// 													}} key={value} className={cn('w-auto min-w-full min-h-[48px]  px-2 py-1 cursor-pointer text-[1.25rem] flex justify-start items-center    hover:bg-secondary font-[var(--bs-nav-link-font-weight)]  text-[var(--bs-nav-link-color)]    ', activeTab === value && ' bg-[var(--bs-success-light)] text-[var(--bs-success)] border-l-2 border-[var(--bs-success)] ')} >
			// 														{icon ?? ''}	{label}
			// 													</div>
			// 												)
			// 											})
			// 										}
			// 									</div>

			// 									{/* Content  */}

			// 									<div className=" w-full h-full justify-start items-start p-3 " >
			// 										{
			// 											tabList[activeTab]?.child?.map((child,idx)=>{
			// 												return(
			// 														<RenderElement node={child} 

			// 													canvas={canvas} />
			// 												)
			// 											})
			// 										}

			// 									</div>
			// 								</div>


			// </div>

		);
}
export function Separators({ node, canvas, children }: ContentRenderProps<SeparatorsNode>) {
	// The label is the one slot, at children[0].
	const labelSlot = React.Children.toArray(children)[0]


	const style = {
		// transform: CSS.Translate.toString(transform),

		...node.style,
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


	if (node)
		return (

			<div
				data-name='node'


				id={node.id}
				data-id={node.id}
				style={style}
			>

				{separatorType === 'zigzag' ? zigzagUI[separatorLayout](separatorType) : ui[separatorLayout](separatorType)}

			</div>

		);
}
export function NewNode({ node, canvas }: ContentRenderProps<NewNodeNode>) {


	const style = {
		// transform: CSS.Translate.toString(transform),

		...node.style,
	};

	if (node)
		return (

			<div
				data-name='node'


				id={node.id}
				data-id={node.id}
				style={style}
			>

				NewNode

			</div>

		);
}
export function IconBlock({ node, canvas, children }: ContentRenderProps<IconBlockNode>) {
	// Slots are flat: item i's title is at i*2, description at i*2+1.
	const slots = React.Children.toArray(children)
	const slotAt = (i: number) => slots[i] ?? undefined


	const style = {
		// transform: CSS.Translate.toString(transform),

		...node.style,
	};

	if (node)
		return (

			<div
				data-name='node'


				id={node.id}
				data-id={node.id}
				style={style}
			>

				<div style={{
					flexDirection: node.arrangement === 'horizontal' ? 'row' : 'column',
					justifyContent: node.arrangement === 'horizontal' ? 'start' : 'start',
					alignItems: node.arrangement === 'horizontal' ? 'center' : 'start'
				}} className=" w-full h-fit  flex-wrap gap-[30px] items-center flex  " >
					{
						node.items.map(({ title, description, color, size, icon, strokeWidth }, index) => {

							return (
								<div style={{
									flexDirection: node.iconType === 'iTt' ? 'row' : 'column',
									gap: node.iconType === 'iT' ? 10 : 14
								}} className=" flex h-fit w-auto justify-center  items-center " >
									<div key={index} style={{
										width: size + 12,
										height: size + 12,
										backgroundColor: color + '40'
									}} className=" flex justify-center  items-center rounded-full "  >
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

		);
}
export function Chart({ node, canvas }: ContentRenderProps<ChartNode>) {
	const style = { ...node.style };
	const { data, options } = buildChartConfig(node);
	const ChartComponent = node.chartType === 'pie' ? Pie : node.chartType === 'line' ? Line : Bar;

	if (node)
		return (
			<div
				data-name='node'
				id={node.attributes?.id ?? ''}
				data-id={node.id}
				style={style}
			>
				<ChartComponent data={data} options={options} />
			</div>
		);
}
export default {
	chart: Chart,
	iconBlock: IconBlock,
	newNode: NewNode,
	separators: Separators,
	verticalTab: VerticalTab,
	root: Root,
	section: Section,
	block: Block,
	text: Text,
	image: Image,
	video: Video,
	button: Button,
	table: Table,
	accordion: Accordion,
	tab: Tab,
	imageSlider: ImageSlider,
	imageCarousel: ImageCarousel,
	imageFlipFlop: ImageFlipFlop,
	googleMap: GoogleMap,
	youtube: YouTube,
	vimeo: YouTube,
	html: WebPage,
	countDown: CountDown,
	social: Social,
	customCountDownWrapper: CustomCountDownWrapper,
	countDownText: CountDownText,
	testimonialSlider: TestimonialSlider,
	progressBar: ProgressBar,
	counter: Counter,
	rating: Rating,
	timeline: Timeline,
	faq: Faq,
	pricingToggle: PricingToggle,
	cardsTemplate: CardsTemplate,
	navBarTemplate: NavBarTemplate,
	eventWidgetsGroupTemplate: EventWidgetsGroupTemplate,
	personalCardTemplate: PersonalCardTemplate,
	heroTemplate: HeroTemplate,
	footerTemplate: FooterTemplate,
	layoutTemplate: LayoutTemplate,
	tableEnterprise: Table,
	buttonEnterprise: ButtonEnterprise,
	formField: FormField,
};