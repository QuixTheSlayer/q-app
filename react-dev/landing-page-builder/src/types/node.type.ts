import React, {
	HTMLAttributes,
	ImgHTMLAttributes,
	ButtonHTMLAttributes,
	TableHTMLAttributes,
	AnchorHTMLAttributes,
} from "react";
import { CSSProperties } from "styled-components";
import { CSS } from "styled-components/dist/types";
import type { JSONContent } from "@tiptap/react"
import type { ContainerTag } from "@/utils/nodeAttributes"
export type NodeCategory = "container" | "content";

/** A <script> from an imported page other than inline classic code (that is plainJS): a `src`, or typed/module code. */
export interface PageScript {
	src?: string
	code?: string
	type?: string
}

export type TableEnterpriseUiType = TableUiType
export type ButtonEnterpriseUiType = 'iconSplit' | 'pillLift' | 'outlineFill' | 'gradientSweep' | 'pressDepth' | 'ghostUnderline' | 'cornerBadge' | 'splitAction'

export interface ButtonEnterpriseNode extends BaseContentNode<'buttonEnterprise'> {
	/** [label, subLabel]. Absent on nodes saved before this. */
	children?: CanvasNode[]
	uiType: ButtonEnterpriseUiType
	label: string
	/** Optional smaller second line shown under/beside the label by variants that use it (iconSplit, splitAction). */
	subLabel?: string
	/** Lucide icon name (keyof typeof import('lucide-react/icons')), shown by iconSplit/pillLift/splitAction. */
	icon?: string
	/** Small corner badge text, shown only by cornerBadge. */
	badgeText?: string
	href: string
	color: string
	textColor: string
}

export type CardsUiType = 'gridClassic' | 'imageOverlay' | 'iconTop' | 'horizontalRow' | 'minimalBorder' | 'shadowFloat' | 'gradientHeader' | 'numberedList' | 'sessionCards'
export type NavBarUiType = 'classicRow' | 'centeredLogo' | 'pillLinks' | 'transparent' | 'darkBar' | 'underlineActive' | 'splitCta' | 'stacked' | 'floatingCard' | 'darkBorderedRow' | 'pillIslandLight' | 'iconWordmark' | 'actionIconBar'
export type EventWidgetsGroupUiType = 'classicRow' | 'countdownCard' | 'stackedCentered' | 'splitPanel' | 'minimalInline' | 'bannerCta' | 'darkGlass' | 'twoColumnCard'

export interface CardItem {
	title: string
	description: string
	imageUrl?: string
}

export interface CardsTemplateNode extends BaseContentNode<'cardsTemplate'> {
	/** [heading, t0, d0, t1, d1, ...]. Absent on nodes saved before this. */
	children?: CanvasNode[]
	uiType: CardsUiType
	heading: string
	cards: CardItem[]
	/** Base solid accent color — used directly wherever a variant needs one flat color. */
	accentColor: string
	/** Gradient end-stop — paired with accentColor as linear-gradient(135deg, accentColor, accentColorSecondary) wherever a variant needs a gradient fill. */
	accentColorSecondary: string
}

export interface NavLink {
	label: string
	href: string
}

export interface NavBarTemplateNode extends BaseContentNode<'navBarTemplate'> {
	/** [brand, cta]. Absent on nodes saved before this. */
	children?: CanvasNode[]
	uiType: NavBarUiType
	brand: string
	links: NavLink[]
	ctaLabel?: string
	ctaHref?: string
	/** Whether the CTA button renders at all, independent of ctaLabel's text. Defaults to true when unset. */
	showCta?: boolean
	/** Whether the brand renders as its text (default) or as logoImageUrl. */
	brandDisplayMode?: 'text' | 'image'
	logoImageUrl?: string
	/** Logo render size in px. Defaults to 32x32 when unset. */
	logoWidth?: number
	logoHeight?: number
	/** Logo corner radius in px. 0 = square, half of width/height = circle. Defaults to 0 when unset. */
	logoBorderRadius?: number
}

export interface EventWidgetsGroupTemplateNode extends BaseContentNode<'eventWidgetsGroupTemplate'> {
	/** [heading, submitEntry, register]. Absent on nodes saved before this. */
	children?: CanvasNode[]
	uiType: EventWidgetsGroupUiType
	heading: string
	endDateText: string
	endHourText: string
	timeZoneText: string
	submitEntryLabel: string
	submitEntryHref: string
	registerLabel: string
	registerHref: string
	/** Base solid accent color — used directly wherever a variant needs one flat color. */
	accentColor: string
	/** Gradient end-stop — paired with accentColor as linear-gradient(135deg, accentColor, accentColorSecondary) wherever a variant needs a gradient fill. */
	accentColorSecondary: string
}

export type HeroUiType = 'centeredClassic' | 'splitImage' | 'gradientBold' | 'minimalLeft' | 'darkOverlay' | 'stackedCta' | 'sideBySideStats' | 'glowScreenshot'
	| 'darkBlurBackdrop' | 'cinematicBlob' | 'photoBadges' | 'darkImageOrb' | 'diagonalPhoto' | 'credentialBadge'
export type FooterUiType = 'classicColumns' | 'centeredMinimal' | 'darkMega' | 'ctaBanner' | 'socialFocus' | 'twoColumnSplit' | 'compactBar' | 'brandSidebar'
export type PersonalCardUiType = 'classicCentered' | 'horizontalRow' | 'darkGlass' | 'minimalFlat' | 'imageBackdrop' | 'bordered' | 'socialFocus' | 'compactInline' | 'attendeeBadge'
export type LayoutUiType = 'twoColumnTextImage' | 'threeColumnEven' | 'imageLeftText' | 'stackedCentered' | 'sidebarContent' | 'gridFour' | 'alternatingRows' | 'fullWidthBanner'
export type TableUiType = 'classicBordered' | 'striped' | 'minimalBorderless' | 'darkHeader' | 'cardRows' | 'compact' | 'roundedSoft' | 'highContrast'
export type ProgressBarUiType = 'classicBar' | 'gradientFill' | 'steppedSegments' | 'circular' | 'thinLine' | 'labeledCard' | 'stackedMulti' | 'roundedGlow'

/** Slot order of a Hero's `children` tree. The variant wrapper stays
 * hardcoded; only the content inside it is real nodes. */
export const HERO_CHILD_SLOTS = ['heading', 'subheading', 'cta'] as const

export interface HeroTemplateNode extends BaseContentNode<'heroTemplate'> {
	uiType: HeroUiType
	/** Editable content tree in HERO_CHILD_SLOTS order. Absent on Heros saved
	 * before this, which render from the flat fields below as they always did. */
	children?: CanvasNode[]
	heading: string
	subheading: string
	ctaLabel: string
	ctaHref: string
	imageUrl?: string
	/** Base solid accent color — used directly wherever a variant needs one flat color. */
	accentColor: string
	/** Gradient end-stop — paired with accentColor as linear-gradient(135deg, accentColor, accentColorSecondary) wherever a variant needs a gradient fill. */
	accentColorSecondary: string
}

export interface FooterLink {
	label: string
	href: string
}

export interface FooterColumn {
	title: string
	links: FooterLink[]
}

export interface FooterTemplateNode extends BaseContentNode<'footerTemplate'> {
	/** [brand, tagline, copyright, colTitle0, colTitle1, ...]. Absent on older nodes. */
	children?: CanvasNode[]
	uiType: FooterUiType
	brand: string
	tagline: string
	columns: FooterColumn[]
	copyrightText: string
	/** Bottom-left organizer credit line, next to copyright. Off by default. */
	showOrganizer?: boolean
	organizerText?: string
	/** Base solid accent color — used directly wherever a variant needs one flat color. */
	accentColor: string
	/** Gradient end-stop — paired with accentColor as linear-gradient(135deg, accentColor, accentColorSecondary) wherever a variant needs a gradient fill. */
	accentColorSecondary: string
}

export interface PersonalCardTemplateNode extends BaseContentNode<'personalCardTemplate'> {
	/** [name, role, bio]. Absent on nodes saved before this. */
	children?: CanvasNode[]
	uiType: PersonalCardUiType
	name: string
	role: string
	bio: string
	imageUrl?: string
	socialLinks: FooterLink[]
	/** Base solid accent color — used directly wherever a variant needs one flat color (text, badges, dots, borders). */
	accentColor: string
	/** Gradient end-stop — paired with accentColor as linear-gradient(135deg, accentColor, accentColorSecondary) wherever a variant needs a gradient fill. */
	accentColorSecondary: string
}

export interface LayoutColumn {
	title: string
	description: string
	imageUrl?: string
}

export interface LayoutTemplateNode extends BaseContentNode<'layoutTemplate'> {
	uiType: LayoutUiType
	/** Heading node first, then each column's title/description interleaved:
	 * [heading, t0, d0, t1, d1, ...]. Absent on older nodes. */
	children?: CanvasNode[]
	heading: string
	columns: LayoutColumn[]
	/** Base solid accent color — used directly wherever a variant needs one flat color. */
	accentColor: string
	/** Gradient end-stop — paired with accentColor as linear-gradient(135deg, accentColor, accentColorSecondary) wherever a variant needs a gradient fill. */
	accentColorSecondary: string
}

export type ContentType =
	| "chart"
	| "iconBlock"
	| "newNode"
	| "separators"
	| "verticalTab"
	| "root"
	| "section"
	| "block"
	| "text"
	| "image"
	| "video"
	| "button"
	| "table"
	| "accordion"
	| "tab"
	| "imageSlider"
	| "imageCarousel"
	| "blockCarousel"
	| "imageFlipFlop"
	| "googleMap"
	| "youtube"
	| "vimeo"
	| 'html'
	| 'countDown'
	| 'customCountDownWrapper'
	| 'countDownText'
	| "social"
	| "testimonialSlider"
	| "progressBar"
	| "counter"
	| "rating"
	| "timeline"
	| "faq"
	| "pricingToggle"
	| "cardsTemplate"
	| "navBarTemplate"
	| "eventWidgetsGroupTemplate"
	| "heroTemplate"
	| "footerTemplate"
	| "personalCardTemplate"
	| "layoutTemplate"
	| "tableEnterprise"
	| "buttonEnterprise"
	| "formField"

export type Layout = "row" | "column" | "grid";

export type NodeAttributesMap = {
	chart: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">,
	iconBlock: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">,
	newNode: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">,
	separators: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">,
	verticalTab: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">,
	text: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	image: Omit<AnchorHTMLAttributes<HTMLImageElement>, "style">;
	video: Omit<AnchorHTMLAttributes<HTMLVideoElement>, "style">;
	button: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "style">;
	table: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	accordion: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	tab: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	imageSlider: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	imageCarousel: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	blockCarousel: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	googleMap: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	youtube: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	vimeo: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	html: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	imageFlipFlop: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	countDown: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	countDownText: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">
	customCountDownWrapper: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	social: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	testimonialSlider: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	progressBar: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	counter: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	rating: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	timeline: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	faq: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	pricingToggle: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	cardsTemplate: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	navBarTemplate: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	eventWidgetsGroupTemplate: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	heroTemplate: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	footerTemplate: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	personalCardTemplate: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	layoutTemplate: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	tableEnterprise: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
	buttonEnterprise: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "style">;
	formField: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;
};

export type DeviceScope = "desktop" | "tablet" | "mobile"

export type AnimationGroup = {
			id: string
			trigger_effect: {
				trigger: "active" | "hover" | "auto" | "onView",
				effects: {
					animation_type: string,
					style: CSS.PropertiesHyphen
					/**
					 * Prototype effects (scrollTo/show/hide/toggle/slideIn/fadeIn) all act
					 * on another node on the page, picked here — same target picker UI,
					 * different runtime behavior per animation_type.
					 */
					targetNodeId?: string
					/** scrollTo only. Defaults to "smooth". */
					scrollBehavior?: "smooth" | "auto"
					/** scrollTo only — briefly outline the target node after scrolling. */
					highlightTarget?: boolean
					/** slideIn only — which edge the target enters from. Defaults to "bottom". */
					slideFrom?: "top" | "bottom" | "left" | "right"
					/** slideIn/fadeIn only — transition duration in ms. Defaults to 400. */
					transitionDurationMs?: number
					/** Style effects and presets: the effect's own timing, see consts/animationEffects.ts. */
					duration?: number
					delay?: number
					easing?: string
					/** preset only. 0 = infinite. */
					iterations?: number
					/** preset only: a value from ANIMATION_PRESETS. */
					preset?: string
				}[]


			}[]
		}
		
export type BaseCanvasNode =
	{
		id: string;
		style: React.CSSProperties;
		/** Per-breakpoint style overrides layered on top of `style` (the desktop/base style). */
		responsiveStyle?: {
			tablet?: React.CSSProperties;
			mobile?: React.CSSProperties;
		};
		name?: string
		/**
		 * Persisted design-time visibility — unlike the runtime-only hide/show/
		 * toggle prototype effects (which flip the DOM element's inline style at
		 * interaction time and never touch node data), this is saved with the
		 * page and decides whether the node starts hidden on load. Only affects
		 * the production render paths (Elements.tsx/Preview/RenderPage); the
		 * editor canvas keeps rendering hidden nodes (dimmed) so they stay
		 * selectable and editable.
		 */
		hidden?: boolean
		animation?: AnimationGroup[],
		'endDate'?: {
			"day": number
			"month": number
			"year": number
			"hour": number
			"minute": number
		} | Record<string, number>,
		'startDate'?: {
			"day": number
			"month": number
			"year": number
			"hour": number
			"minute": number
		} | Record<string, number>,
		title?: string
		description?: string,
		footer?: string,
		plainCss?: string,
		plainJS?: string
		/**
		 * Editor state only, never saved: the code that came in from imported HTML (plainCss, plainJS, pageScripts). The editor
		 * shows it (Code for review) so it can be copied for support; the save payload leaves it out (see stripImportedCode).
		 */
		importedCode?: { plainCss?: string; plainJS?: string; pageScripts?: boolean; externalStyles?: string[]; externalScripts?: string[] }
		/** Imported <script src> (https) and module/typed scripts, in page order - run before plainJS in the sandbox. */
		pageScripts?: PageScript[]
		/** Imported <html> attributes (lang, class, data-theme...), put on the sandbox frame's <html>. */
		htmlAttributes?: Record<string, string>
		lineClamp?: Record<string, number>,
		textStyles?: Record<string, React.CSSProperties>,

	};

/** One shared class's style, editable via the property panel's normal
 * controllers whenever the focused node's primary class matches this key -
 * see EditorContext's applyStyleToNode/syncClassStyle. `style`/`responsiveStyle`
 * mirror BaseCanvasNode's own shape so the same merge logic applies to both. */
export interface CssClassRule {
	style: React.CSSProperties
	responsiveStyle?: {
		tablet?: React.CSSProperties
		mobile?: React.CSSProperties
	}
}

/** One shared class's click/hover-driven behavior - same trigger/effect
 * shape as BaseCanvasNode['animation'] (see AnimationSection.tsx), just
 * keyed by className instead of by a single node's id, so every node
 * sharing that class shares the same behavior. */
export interface JsClassRule {
	trigger_effect: {
		trigger: "active" | "hover" | "auto" | "onView"
		effects: {
			animation_type: string
			targetNodeId?: string
			scrollBehavior?: "smooth" | "auto"
			highlightTarget?: boolean
			slideFrom?: "top" | "bottom" | "left" | "right"
			transitionDurationMs?: number
		}[]
	}[]
}

export interface LayoutNode extends BaseCanvasNode {
	type: "container";
	contentType: "root" | "section" | "block";
	layout: Layout;
	children: CanvasNode[];
	/** HTML element this container renders as - the source tag of imported nodes (nav, ul, li,
	 * span...). Defaults to div (section for sections). Allowed tags: CONTAINER_TAGS. */
	tag?: ContainerTag;
	attributes?: Omit<AnchorHTMLAttributes<HTMLDivElement | HTMLImageElement>, "style"> | Omit<AnchorHTMLAttributes<HTMLImageElement>, "src">;
	/** Root-only in practice: every class name pasted-in HTML carries, with
	 * its own editable style - the property panel's controllers write here
	 * (not into a single node's `style`) whenever the focused node has a
	 * matching class, so every node sharing that class updates together. */
	css?: Record<string, CssClassRule>
	/** Root-only in practice: every class name's click/hover behavior, kept
	 * in sync with an actual rendered <script> tag - see useClassJs.ts. */
	js?: Record<string, JsClassRule>,



}

// interface BaseContentNode extends BaseCanvasNode {
// 	type: "content";
// 	contentType: "text" | "image" | "button" | "table";
// 	children?: string;
// 	attributes?: NodeAttributesMap[ContentNode["contentType"]];
// }

export interface BaseContentNode<T extends keyof NodeAttributesMap>
	extends BaseCanvasNode {
	type: "content";
	name?: string
	contentType: T;
	children?: string | CanvasNode[] | JSONContent;
	attributes?: NodeAttributesMap[T];

}

export interface TextNode extends BaseContentNode<"text"> {
	collapsable?: boolean;
	children: string;

	// collapsableLineCount?: number
}
export interface ImageNode extends BaseContentNode<"image"> {
	children: string;
	src: string

}
/** A self-hosted/direct video file (native <video>), distinct from the
 * existing youtube/vimeo embed types. */
export interface VideoNode extends BaseContentNode<"video"> {
	children: string;
	src: string
	autoPlay?: boolean
	loop?: boolean
	muted?: boolean
	controls?: boolean
}
export interface FormFieldOption {
	value: string
	label: string
	selected?: boolean
	disabled?: boolean
}

/** A form control imported from pasted HTML (<input>, <select>, <textarea>), kept as that element. */
export interface FormFieldNode extends BaseContentNode<"formField"> {
	tag: 'input' | 'select' | 'textarea'
	field: {
		/** <input type>, e.g. text, email, checkbox. */
		type?: string
		name?: string
		placeholder?: string
		value?: string
		checked?: boolean
		required?: boolean
		/** <textarea rows>. */
		rows?: number
		autoComplete?: string
		/** <select> choices (optgroups flattened). */
		options?: FormFieldOption[]
	}
}

export interface ButtonNode extends BaseContentNode<"button"> {
	children: string;
	/** Imported only: the source element, so the editor renders it as one (`.nav a` CSS matches). */
	tag?: 'a' | 'button';
}
export interface TableNode extends BaseContentNode<"table"> {
	uiType?: TableUiType
	tableHeadStyle: {
		backgroundColor?: string;
		borderColor?: string;
		padding?: string;
	};
	tableBodyStyle: {
		backgroundColor?: string;
		borderColor?: string;
		padding?: string;
	};
	children: JSONContent
}
export interface TableEnterpriseNode extends BaseContentNode<"tableEnterprise"> {
	uiType?: TableEnterpriseUiType
	tableHeadStyle: {
		backgroundColor?: string;
		borderColor?: string;
		padding?: string;
	};
	tableBodyStyle: {
		backgroundColor?: string;
		borderColor?: string;
		padding?: string;
	};
	children: JSONContent
}
export interface AccordionNode extends BaseContentNode<"accordion"> {
	header: string;
	content: string;
	contentStyle: React.CSSProperties;
	/** With `headerIsNode`, children[0] is the header and the body is the rest;
	 * otherwise every child is body. */
	children: CanvasNode[];
	/** Marks children[0] as the header. Needed because the body already lived
	 * in `children`, so shape alone can't tell a migrated node from a legacy one. */
	headerIsNode?: boolean;
}

/**
 * Each slide is a normal container node (contentType "block") living in
 * TestimonialSliderNode.children — not a separate array field. Insert/focus/
 * drag-and-drop into slide content works for free this way, since the core
 * tree-walking (nodeUpdater, hasChildNode, getNode) only ever knows how to
 * address a node's `children` array, not an arbitrarily-named one.
 */
export interface TestimonialSliderNode extends BaseContentNode<"testimonialSlider"> {
	children: CanvasNode[];
	autoPlay?: boolean;
	showArrows?: boolean;
	showDots?: boolean;
}

export interface Tab {
	name: string,
	children: CanvasNode[]
}

export interface TabNode extends BaseContentNode<"tab"> {
	activeTab: number,
	tabs: Tab[];
	tabType: 'vertical' | 'horizontal',
	color: {
		active: string
		default: string
	}
	/** With `childrenAreTabs`, each child is one tab panel and its `name` is the
	 * label. Content lives here because the tree walkers only address `children`. */
	children?: CanvasNode[];
	/** Marks `children` as the tab panels. Absent on tabs saved before this. */
	childrenAreTabs?: boolean;
}

export interface ImageSliderNode extends BaseContentNode<"imageSlider"> {
	images: ImageSliderItem[];
	objectFit?: 'cover' | 'contain';
	imageBackground?: string;
}

export interface ImageSliderItem {
	url: string;
	altText?: string;
}

export interface ImageCarouselNode extends BaseContentNode<"imageCarousel"> {
	images: ImageCarouselItem[];
	autoPlay?: boolean;
	imagesPerView?: number;
	slidesPerScroll?: number;
	delay?: number;
	gap?: number;
	objectFit?: 'cover' | 'contain';
}

export interface ImageCarouselItem {
	url: string;
	altText?: string;
}

export interface BlockCarouselNode extends BaseContentNode<"blockCarousel"> {
	blockes: LayoutNode[];
	autoPlay?: boolean;
	blockesPerView?: number;
	slidesPerScroll?: number;
	delay?: number;
	gap?: number;
}

export interface ImageFlipFlopNode extends BaseContentNode<"imageFlipFlop"> {
	imageUrl: string;
	flipText: string;
	flipBackgroundColor?: string;
	flipTextStyle?: React.CSSProperties;
}

export interface GoogleMapNode extends BaseContentNode<"googleMap"> {
	url: string
}

export interface YoutubeNode extends BaseContentNode<"youtube"> {
	url: string
	className?: string

}

export interface VimeoNode extends BaseContentNode<"vimeo"> {
	url: string
	className?: string

}

export interface HtmlNode extends BaseContentNode<"html"> {
	url: string

}

export interface CountDownNode extends BaseContentNode<"countDown"> {
	'uiType': "boldBlocks" | "ringArc" | "minimalPill" | "bannerBar" | "flipCards" | "slideCards" | "progressBar"
	| "mechanicalFlipClock" | "neumorphism" | "brutalist" | "editorial" | "gradientGlow" | "splitFlap"
	title: string
	description: string,
	footer: string,
	/** Whether the title renders at all, independent of its text. Defaults to true when unset. */
	showTitle?: boolean
	/** Whether the description renders at all, independent of its text. Defaults to true when unset. */
	showDescription?: boolean
	/** Whether the footer renders at all, independent of its text. Defaults to true when unset. */
	showFooter?: boolean
	colors: {
		title: string,
		description: string
		footer: string
		countDown: {
			primary: string
			secondary: string
			basic: string
		}
	}

}

export interface CustomeCountDownNode extends BaseCanvasNode {
	'endDate': {
		"day": number
		"month": number
		"year": number
		"hour": number
		"minute": number
	} | Record<string, number>,
	'startDate': {
		"day": number
		"month": number
		"year": number
		"hour": number
		"minute": number
	} | Record<string, number>,
	title: string
	description: string,
	footer: string,
	/** Whether the title renders at all, independent of its text. Defaults to true when unset. */
	showTitle?: boolean
	/** Whether the description renders at all, independent of its text. Defaults to true when unset. */
	showDescription?: boolean
	/** Whether the footer renders at all, independent of its text. Defaults to true when unset. */
	showFooter?: boolean
	children: CanvasNode[];
	contentType: "customCountDownWrapper"
	type: "container",
	attributes?: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">;


}

export interface CountDownTextNode extends BaseContentNode<"countDownText"> {

	children: string
	countDownType: "day" | "month" | "year" | "hour" | "second" | 'minute'
	date?: Record<"day" | "month" | "year" | "hour" | "second" | "minute", number>


}

export interface SocialNode extends BaseContentNode<'social'> {
	socialType: string,
	link: string
	size: number
}

export interface ProgressBarNode extends BaseContentNode<'progressBar'> {
	/** Label text node. Absent on nodes saved before this. */
	children?: CanvasNode[]
	uiType?: ProgressBarUiType
	/** Text shown above the bar, e.g. "Project completion". */
	label: string
	/** Current progress, 0-100. */
	value: number
	/** Fill color — the property panel offers a preset swatch palette plus a full picker. */
	color: string
	trackColor: string
	/** Bar height in px. */
	barHeight: number
	barRadius: number
	showLabel: boolean
	showPercentage: boolean
	/** How long the fill animates to its value, in seconds. */
	duration: number
	/** Start the fill animation once the bar scrolls into view (production) vs immediately on mount. */
	triggerOnView: boolean
	labelStyle: React.CSSProperties
	percentageStyle: React.CSSProperties
}

export interface CounterNode extends BaseContentNode<'counter'> {
	/** Value the counter animates from — usually 0. */
	startValue: number
	/** Value the counter animates up (or down) to. */
	endValue: number
	/** How many decimal places to show, e.g. 1 for "4.5". */
	decimals: number
	/** How long the count animation takes, in seconds. */
	duration: number
	/** Text shown before the number, e.g. "$". */
	prefix: string
	/** Text shown after the number, e.g. "+" or "%". */
	suffix: string
	/** Group digits with a thousands separator, e.g. 10,000. */
	useThousandsSeparator: boolean
	/** Start the animation once the counter scrolls into view (production) vs immediately on mount. */
	triggerOnView: boolean
	numberStyle: React.CSSProperties
	prefixStyle: React.CSSProperties
	suffixStyle: React.CSSProperties
}

export interface RatingNode extends BaseContentNode<'rating'> {
	/** Current rating value, supports fractional values for half/partial stars, e.g. 4.5. */
	value: number
	/** Total number of stars shown. */
	maxStars: number
	/** Star size in px. */
	starSize: number
	/** Gap between stars in px. */
	starGap: number
	filledColor: string
	emptyColor: string
	/** Optional line under the stars, e.g. "4.5 out of 5 — based on 3,982 reviews". */
	showSummary: boolean
	/** How many reviews the rating is based on — plugged into the auto-generated summary text. */
	reviewCount: number
	/** Overrides the auto-generated "{value} out of {maxStars} — based on {reviewCount} reviews" text when set. */
	customSummaryText?: string
	summaryStyle: React.CSSProperties
}

export interface TimelineStep {
	title: string
	description: string
}

export type TimelineUiType = 'classicLine' | 'zigzag' | 'cardStack' | 'minimalDots' | 'numberedCircles' | 'verticalRail' | 'roadmap' | 'compact'
	| 'sCurveSpine' | 'wavyRibbon' | 'ribbonBanner' | 'iconBranchRail' | 'arrowAxis' | 'wavyCircles' | 'loadingBar' | 'axisPills'

export interface TimelineNode extends BaseContentNode<'timeline'> {
	uiType: TimelineUiType
	orientation: 'horizontal' | 'vertical'
	steps: TimelineStep[]
	/** Title/description text nodes, interleaved: [t0, d0, t1, d1, ...]. Absent
	 * on timelines saved before this, which render from `steps` as they did. */
	children?: CanvasNode[]
	/** Fill color of the numbered step circles and the connecting line between completed steps. */
	activeColor: string
	/** Color of the numbered step circles and connecting line for steps not yet reached — kept distinct from activeColor so a "current progress" look is possible, not just a uniform timeline. */
	inactiveColor: string
	/** How many steps (starting from the first) count as "active"/"completed" — the rest use inactiveColor. Set to steps.length to make every step active. */
	activeStepCount: number
	circleSize: number
	titleStyle: React.CSSProperties
	descriptionStyle: React.CSSProperties
}

export interface FaqItem {
	question: string
	answer: string
}

export type FaqUiType = 'classicAccordion' | 'plusMinus' | 'boxed' | 'numbered' | 'twoColumn' | 'minimalDivider' | 'cardGrid' | 'chatBubble' | 'credentialList'

export interface FaqNode extends BaseContentNode<'faq'> {
	uiType: FaqUiType
	items: FaqItem[]
	/** Question/answer text nodes, interleaved: [q0, a0, q1, a1, ...]. Absent
	 * on FAQs saved before this, which render from `items` as they always did. */
	children?: CanvasNode[]
	/** If false (accordion behavior), opening one question closes any other open one. If true, multiple questions can stay open at once. */
	allowMultipleOpen: boolean
	/** Index of the item open by default when the page loads/is being edited — -1 means all start closed. */
	defaultOpenIndex: number
	questionStyle: React.CSSProperties
	answerStyle: React.CSSProperties
	dividerColor: string
	iconColor: string
	/** Background of the answer/content card surface some uiType variants render (Boxed, Two Column, Chat Bubble, Plus/Minus) — independent of the section's own `style.backgroundColor`. */
	cardColor: string
}


export type PricingToggleUiType = 'classicCard' | 'gradientHero' | 'minimalFlat' | 'darkGlass' | 'bordered' | 'split' | 'ribbon' | 'compactRow' | 'wristband'

export interface PricingToggleNode extends BaseContentNode<'pricingToggle'> {
	/** Plan-name text node. Absent on nodes saved before this. */
	children?: CanvasNode[]
	uiType: PricingToggleUiType
	planName: string
	monthlyPrice: number
	yearlyPrice: number
	currencySymbol: string
	/** Whether the yearly plan is shown by default when the page loads/is being edited. */
	defaultYearly: boolean
	monthlyLabel: string
	yearlyLabel: string
	activeColor: string
	inactiveColor: string
	priceStyle: React.CSSProperties
	periodStyle: React.CSSProperties
	planNameStyle: React.CSSProperties
	labelStyle: React.CSSProperties
}

export interface VerticalTabChildNode extends BaseContentNode<'text'> {
	parentIdx: string
}

export interface VerticalTabNode extends BaseContentNode<'verticalTab'> {
	tabList: {
		value: string,
		icon?: JSX.Element,
	}[],
	activeVerticalTab: string,
	collapsible?: boolean,
	hasBorder?: boolean,
	children: VerticalTabChildNode[]



}

export interface SeparatorsNode extends BaseContentNode<"separators"> {
	/** Single text node for the label. Absent on separators saved before this,
	 * which render the flat `label` string as they did. */
	children?: CanvasNode[]
	separatorType: 'content' | 'dotted' | 'dashed' | 'zigzag'
	color: string,
	space: number,
	separatorLayout: 'vertical' | 'horizontal',
	label: string,
	size: number,
	labelSize: number
	labelColor: string,
	labelWeight: 'normal' | 'thin' | 'medium' | 'semibold' | 'bold',
	labelFont: CSSProperties['fontFamily']
	flip: boolean
}

export interface NewNodeNode extends BaseContentNode<"newNode"> {

}

export interface IconBlockNode extends BaseContentNode<"iconBlock"> {
	/** Title/description text nodes, interleaved: [t0, d0, t1, d1, ...]. Absent
	 * on icon blocks saved before this, which render from `items` as they did. */
	children?: CanvasNode[]
	arrangement: "horizontal" | "vertical"
	iconType: 'i' | 'iT' | 'iTt'
	items: {
		icon: string
		title?: string
		description?: string
		size: number
		color: string,
		isFold: boolean,
		strokeWidth: number,
		textColor: string
	}[]
}

export interface ChartDataset {
	label: string
	data: number[]
	backgroundColor: string[]
	borderColor?: string[]
	borderWidth?: number
}

export interface ChartNode extends BaseContentNode<"chart"> {
	chartType: "pie" | "bar" | "line"
	labels: string[]
	datasets: ChartDataset[]
	showLegend: boolean
	legendPosition: "top" | "bottom" | "left" | "right"
}

export type ContentNode =
	| ChartNode
	| IconBlockNode
	| NewNodeNode
	| SeparatorsNode
	| VerticalTabNode
	| TextNode
	| ImageNode
	| VideoNode
	| ButtonNode
	| TableNode
	| AccordionNode
	| TabNode
	| ImageSliderNode
	| ImageCarouselNode
	| BlockCarouselNode
	| ImageFlipFlopNode
	| YoutubeNode
	| GoogleMapNode
	| VimeoNode
	| HtmlNode
	| CountDownNode
	| CountDownTextNode
	| SocialNode
	| TestimonialSliderNode
	| ProgressBarNode
	| CounterNode
	| RatingNode
	| TimelineNode
	| FaqNode
	| PricingToggleNode
	| CardsTemplateNode
	| NavBarTemplateNode
	| EventWidgetsGroupTemplateNode
	| HeroTemplateNode
	| FooterTemplateNode
	| PersonalCardTemplateNode
	| LayoutTemplateNode
	| TableEnterpriseNode
	| ButtonEnterpriseNode
	| FormFieldNode


export type CanvasNode = LayoutNode | ContentNode
