import { BoldBlocks } from "@/components/CountDown/CountDown";
import generateCryptoUID from "@/utils/generateCryptoUID";
import { CanvasNode, ContentType, Layout } from "@/types/node.type";
import { EVENT_ROUTES } from "@/consts/event-widgets.const";
// import sdf from  '@/assets/test-img.png'
export const gridTemplateColumns: Record<Layout, string> = {
	// row: '1fr',
	column: "1fr",
	row: "repeat(auto-fit, minmax(0, 1fr))",
	grid: "repeat(2, 1fr)",
};

export const gridTemplateRows: Record<Layout, string> = {
	column: "repeat(auto-fit, minmax(0, 1fr))",
	row: "1fr",
	grid: "repeat(2, 1fr)",
};

export const gridAutoFlow: Record<Layout, string> = {
	column: "row",
	row: "column",
	grid: "row",
};

function makeTableCell(type: "tableHeader" | "tableCell", text?: string) {
	return {
		type,
		attrs: { colspan: 1, rowspan: 1, colwidth: null, align: null },
		content: [{
			type: "paragraph",
			attrs: { textAlign: null },
			...(text ? { content: [{ type: "text", text }] } : {}),
		}],
	};
}

/** A sample judging-results table so a freshly-inserted Table shows real
 * content instead of empty cells. */
function makeSampleTableDoc(headers: string[], rows: string[][]) {
	return {
		type: "doc",
		content: [
			{
				type: "table",
				content: [
					{ type: "tableRow", content: headers.map((h) => makeTableCell("tableHeader", h)) },
					...rows.map((row) => ({ type: "tableRow", content: row.map((cell) => makeTableCell("tableCell", cell)) })),
				],
			},
			{ type: "paragraph", attrs: { textAlign: null } },
		],
	};
}

const SAMPLE_TABLE_DOC = makeSampleTableDoc(
	["Category", "Nominee", "Result"],
	[
		["Best Newcomer", "Alex Rivera", "Winner"],
		["Best Design", "Jordan Lee", "Finalist"],
		["People's Choice", "Sam Okafor", "Finalist"],
	],
);

function makeTestimonialSlide(name: string, role: string, quote: string) {
	return {
		id: generateCryptoUID(),
		type: "container",
		contentType: "block",
		layout: "column",
		style: {
			position: "relative",
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "center",
			gap: "0.5em",
			padding: "1em",
			borderRadius: "0.5em",
			backgroundColor: "#f8f8f8",
			width: "100%",
			height: "100%",
			minHeight: "8em",
			textAlign: "center",
		},
		children: [
			{
				id: generateCryptoUID(),
				type: "content",
				contentType: "image",
				style: {
					display: "grid",
					width: "3em",
					height: "3em",
					borderRadius: "50%",
					objectFit: "cover",
				},
				children: "",
				attributes: {
					src: "@/assets/test-img.png",
					alt: name,
				},
			},
			{
				id: generateCryptoUID(),
				type: "content",
				contentType: "text",
				style: {
					fontSize: "1.05em",
					fontStyle: "italic",
				},
				children:
					`{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":"center"},"content":[{"type":"text","marks":[{"type":"textStyle","attrs":{"color":"","fontFamily":"Arial, sans-serif","fontSize":"1em"}}],"text":"${quote}"}]}]}`,
				collapsable: false,
			},
			{
				id: generateCryptoUID(),
				type: "content",
				contentType: "text",
				style: {
					fontSize: "1em",
					fontWeight: "bold",
				},
				children:
					`{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":"center"},"content":[{"type":"text","marks":[{"type":"textStyle","attrs":{"color":"","fontFamily":"Arial, sans-serif","fontSize":"1em"}}],"text":"${name}"}]}]}`,
				collapsable: false,
			},
			{
				id: generateCryptoUID(),
				type: "content",
				contentType: "text",
				style: {
					fontSize: "0.85em",
					color: "#888888",
				},
				children:
					`{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":"center"},"content":[{"type":"text","marks":[{"type":"textStyle","attrs":{"color":"","fontFamily":"Arial, sans-serif","fontSize":"1em"}}],"text":"${role}"}]}]}`,
				collapsable: false,
			},
		],
	};
}

export const NEW_NODES: Record<ContentType, CanvasNode> = {
	chart: {
		id: "chart",
		type: "content",
		contentType: "chart",
		name: "Chart",
		style: {
			display: "flex",
			width: "100%",
			height: "20em",
			minWidth: "8em",
			minHeight: "8em",
		},
		chartType: "bar",
		labels: ["Jan", "Feb", "Mar", "Apr"],
		datasets: [
			{
				label: "Series 1",
				data: [12, 19, 8, 15],
				backgroundColor: ["#50cd89", "#009ef7", "#f1416c", "#ffc700"],
			},
		],
		showLegend: true,
		legendPosition: "top",
	},
	iconBlock: {
		id: "iconBlock",
		type: "content",
		contentType: "iconBlock",
		style: {
			display: "flex",
			width: "100%",
			height: "fit-content",
			minWidth: "2em",
			minHeight: "3em",
		},
		iconType: 'i',
		arrangement: 'horizontal',
		items: [{
			icon: "AArrowDown",
			title: 'Title',
			description: "Description",
			size: 24,
			color: '#333333',
			isFold: true,
			strokeWidth: 2,
			textColor: "#232323"
		}]
	},
	newNode: {
		id: "newNode",
		type: "content",
		contentType: "newNode",
		style: {
			display: "flex",
			width: "100%",
			height: "100%",
			minWidth: "2em",
			minHeight: "2em",
		},
	},
	separators: {
		id: "separators",
		type: "content",
		contentType: "separators",
		style: {
			display: "flex",
			width: "100%",
			height: "100%",
		},
		separatorType: 'content',
		color: '#333333',
		separatorLayout: 'horizontal',
		space: 5,
		size: 5,

		label: "Separator",
		labelColor: "#333333",
		labelWeight: 'normal',
		labelSize: 16,
		labelFont: 'Arial, sans-serif',
		flip: false
	},
	verticalTab: {
		id: "verticalTab",
		type: "content",
		contentType: "verticalTab",
		style: {
			display: "flex",
			width: "100%",
			height: "100%",
			minWidth: "2em",
			minHeight: "2em",
		},
		tabList: [
			{
				value: 'tab-1',

			},
			{
				value: 'tab-2',

			},
			{
				value: 'tab-3',


			}
		],
		children: [
			{
				parentIdx: '0',
				id: "verticalTab1-text",
				type: "content",
				contentType: "text",
				style: {},
				children:
					'{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","marks":[{"type":"textStyle","attrs":{"color":"","fontFamily":"Arial, sans-serif","fontSize":"1em"}}],"text":"Tab 1 content"}]}]}',
				collapsable: false,
			},
			{
				parentIdx: '1',
				id: "verticalTab2-text",
				type: "content",
				contentType: "text",
				style: {},
				children:
					'{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","marks":[{"type":"textStyle","attrs":{"color":"","fontFamily":"Arial, sans-serif","fontSize":"1em"}}],"text":"Tab 2 content"}]}]}',
				collapsable: false,
			},
			{
				parentIdx: '2',
				id: "verticalTab3-text",
				type: "content",
				contentType: "text",
				style: {},
				children:
					'{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","marks":[{"type":"textStyle","attrs":{"color":"","fontFamily":"Arial, sans-serif","fontSize":"1em"}}],"text":"Tab 3 content"}]}]}',
				collapsable: false,
			},
		],
		activeVerticalTab: "0",
		collapsible: true
	},
	root: {
		animation: [],
		id: "root",
		type: "container",
		contentType: "root",
		layout: "column",
		style: {
			fontFamily: "Arial sans-serif",
			display: "flex",
			justifyContent: "flex-start",
			alignItems: "stretch",
			flexDirection: "row",
			flexWrap: "nowrap",
		},
		children: [],
		endDate: {
			day: 28,
			month: 7,
			year: 2026,
			hour: 0,
			minute: 0

		},
		startDate: {
			day: 1,
			month: 7,
			year: 2026,
			hour: 0,
			minute: 0

		},
	},

	section: {
		id: "section",
		type: "container",
		contentType: "section",
		layout: "grid",
		style: {
			position: "relative",
			display: "flex",
			flexDirection: "row",

			
			gap: "0.5em",
			minHeight: "28em",
			paddingLeft: "0.5em",
			paddingRight: "0.5em",
			paddingTop: "0.5em",
			paddingBottom: "0.5em",
			height: "30em",
			width: "100%",
			backgroundColor: "#ffffff",
			justifyContent: "center",
			alignItems: "center"

		},
		children: [],
	},
	block: {
		id: "block",
		type: "container",
		contentType: "block",
		layout: "grid",
		style: {
			position: "relative",
			display: "flex",
			flexDirection: "row",
			
			gap: "0.5em",
			paddingLeft: "0.5em",
			paddingRight: "0.5em",
			paddingTop: "0.5em",
			paddingBottom: "0.5em",
			height: "100%",
			minHeight: "4em",
			width: "100%",
			maxWidth: "75em",
			justifyContent: "center",
			alignItems: "center"

		},
		children: [],
	},
	text: {
		id: "text",
		type: "content",
		contentType: "text",
		style: {
			// fontSize: "1.25em",
			// height: 'fit-content',
			// position: 'absolute',
			// transform: 'translate(0px,0px)'
		},
		children:
			'{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","marks":[{"type":"textStyle","attrs":{"color":"","fontFamily":"Arial, sans-serif","fontSize":"1em"}}],"text":"Text"}]}]}',
		collapsable: false,
	},
	countDownText: {
		id: "countDownText",
		type: "content",
		contentType: "countDownText",
		children:
			'CountDown_Text',
		countDownType: 'second',
		style: {
			// fontSize: "1.25em",
			// height: 'fit-content',
			// position: 'absolute',
			// transform: 'translate(0px,0px)'
		},
		date: {
			"day": 0,
			"month": 0,
			"year": 0,
			'hour': 0,
			'minute': 0,
			'second': 0
		}
	},
	button: {
		id: "button",
		type: "content",
		contentType: "button",
		style: {
			width: "fit-content",
			height: "3em",
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			fontSize: "1em",
			fontWeight: "semibold",
			color: "#F0F0F0",
			backgroundColor: "#2f2f2f",
			borderRadius: "0.42em",
			paddingRight: "1em",
			paddingLeft: "1em",
			borderColor:"#ffffff"
		},
		attributes: {
			href: "",
			target: "_blank",
		},
		children: "Button",
	},
	image: {
		id: "image",
		type: "content",
		contentType: "image",
		style: {
			display: "grid",
			height: "100%",
			width: "100%",
			minWidth: "2em",
			minHeight: "2em",
		},
		children: "",
		attributes: {
			src: "@/assets/test-img.png",
			alt: "image",
		},
	},
	video: {
		id: "video",
		type: "content",
		contentType: "video",
		style: {
			display: "grid",
			height: "100%",
			width: "100%",
			minWidth: "2em",
			minHeight: "2em",
		},
		children: "",
		src: "",
		autoPlay: false,
		loop: false,
		muted: true,
		controls: true,
		attributes: {},
	},
	table: {
		id: "table",
		type: "content",
		contentType: "table",
		uiType: "classicBordered",
		tableHeadStyle: {
			backgroundColor: "#bbbbbb",
			borderColor: "#888888",
		},
		tableBodyStyle: {
			borderColor: "#888888",
		},
		style: {},
		children: SAMPLE_TABLE_DOC,
	},
	tableEnterprise: {
		id: "tableEnterprise",
		type: "content",
		contentType: "tableEnterprise",
		name: "Table (Enterprise)",
		uiType: "classicBordered",
		tableHeadStyle: {
			backgroundColor: "#bbbbbb",
			borderColor: "#888888",
		},
		tableBodyStyle: {
			borderColor: "#888888",
		},
		style: {},
		children: SAMPLE_TABLE_DOC,
	},
	// Only made by Import HTML (not in the Insert panel); a plain text input by default.
	formField: {
		id: "formField",
		type: "content",
		contentType: "formField",
		name: "Form field",
		tag: "input",
		field: { type: "text", placeholder: "" },
		style: {},
	},
	buttonEnterprise: {
		id: "buttonEnterprise",
		type: "content",
		contentType: "buttonEnterprise",
		name: "Button (Enterprise)",
		style: {
			width: "fit-content",
			height: "fit-content",
		},
		uiType: "iconSplit",
		label: "Submit Your Entry",
		subLabel: "Entries close soon",
		icon: "ArrowRight",
		badgeText: "New",
		href: "",
		color: "#2f2f2f",
		textColor: "#F0F0F0",
	},
	accordion: {
		id: "accordion",
		type: "content",
		contentType: "accordion",
		style: {
			width: "100%",
			padding: "0.75em",
			borderRadius: "0.25em",
			// fontSize: "1em",
			// backgroundColor: "#EAEAEA",
			// fontWeight: "bold"
		},
		contentStyle: {
			// fontSize: "1em",
		},
		header: "Accordion Header",
		content: "Content",
		children: [{
			id: "text",
			type: "content",
			contentType: "text",
			style: {
				// fontSize: "1.25em",
				// height: 'fit-content',
				// position: 'absolute',
				// transform: 'translate(0px,0px)'
			},
			children:
				'{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","marks":[{"type":"textStyle","attrs":{"color":"","fontFamily":"Arial, sans-serif","fontSize":"1em"}}],"text":"Text"}]}]}',
			collapsable: false,
		}],
	},
	tab: {
		id: "tab",
		type: "content",
		contentType: "tab",
		style: {
			width: "100%",
			// borderRadius: "0.25em",
			// padding: "0.75em",
			// fontSize: "1em",
			// backgroundColor: "#EAEAEA",
			// fontWeight: "bold"
		},
		activeTab: 0,
		tabs: [
			{
				name: "Tab 1",
				children: [
					{
						id: "tab1-text",
						type: "content",
						contentType: "text",
						style: {},
						children:
							'{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","marks":[{"type":"textStyle","attrs":{"color":"","fontFamily":"Arial, sans-serif","fontSize":"1em"}}],"text":"Tab 1 content"}]}]}',
						collapsable: false,
					},
				],
			},
			{
				name: "Tab 2",
				children: [
					{
						id: "tab2-text",
						type: "content",
						contentType: "text",
						style: {},
						children:
							'{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","marks":[{"type":"textStyle","attrs":{"color":"","fontFamily":"Arial, sans-serif","fontSize":"1em"}}],"text":"Tab 2 content"}]}]}',
						collapsable: false,
					},
				],
			},
		],
		tabType: 'horizontal',
		color: {
			active: '#1a85ff',
			default: ''
		}
	},
	imageSlider: {
		id: "image-slider",
		type: "content",
		contentType: "imageSlider",
		imageBackground: '#000000',
		objectFit: 'contain',
		style: {
			display: "grid",
			height: "100%",
			width: "100%",
			minWidth: "2em",
			minHeight: "2em",
		},
		images: []
	},
	imageCarousel: {
		id: "image-carousel",
		type: "content",
		contentType: "imageCarousel",
		autoPlay: false,
		imagesPerView: 4,
		slidesPerScroll: 1,
		delay: 2000,
		objectFit: 'cover',
		style: {
			display: "grid",
			// height: "100%",
			width: "100%",
			minWidth: "2em",
			// minHeight: "2em",
		},
		images: []
	},
	blockCarousel: {
		id: "block-carousel",
		type: "content",
		contentType: "blockCarousel",
		autoPlay: false,
		blockesPerView: 4,
		slidesPerScroll: 1,
		delay: 2000,
		style: {
			display: "grid",
			// height: "100%",
			width: "100%",
			minWidth: "2em",
			// minHeight: "2em",
		},
		blockes: []
	},
	testimonialSlider: {
		id: "testimonial-slider",
		type: "content",
		contentType: "testimonialSlider",
		name: "Testimonial Slider",
		autoPlay: false,
		showArrows: true,
		showDots: true,
		style: {
			display: "grid",
			height: "100%",
			width: "100%",
			minWidth: "2em",
			minHeight: "2em",
		},
		children: [
			makeTestimonialSlide("Jane Cooper", "Product Manager", "This product completely changed how our team works. Could not be happier with the results."),
			makeTestimonialSlide("Wade Warren", "CEO, Acme Inc.", "Outstanding support and an even better product. Highly recommend to anyone on the fence."),
			makeTestimonialSlide("Esther Howard", "Marketing Lead", "Simple, powerful, and exactly what we needed to scale our workflow."),
		] as unknown as CanvasNode[],
	},
	progressBar: {
		id: "progress-bar",
		type: "content",
		contentType: "progressBar",
		name: "Progress Bar",
		style: {
			display: "flex",
			flexDirection: "column",
			gap: "8px",
			width: "100%",
			minWidth: "8em",
			height: "fit-content",
			minHeight: "1em",
		},
		uiType: "classicBar",
		label: "Project completion",
		value: 92,
		color: "#0f766e",
		trackColor: "#e5e0d8",
		barHeight: 10,
		barRadius: 999,
		showLabel: true,
		showPercentage: true,
		duration: 1.2,
		triggerOnView: true,
		labelStyle: {
			fontSize: "14px",
			color: "#1a1a1a",
		},
		percentageStyle: {
			fontSize: "14px",
			color: "#1a1a1a",
		},
	},
	imageFlipFlop: {
		id: "image-flip-flop",
		type: "content",
		contentType: "imageFlipFlop",
		style: {
			width: "100%",
			height: "16em",
			minWidth: "2em",
			minHeight: "4em",
		},
		imageUrl: "",
		flipText: "Flip text",
		flipBackgroundColor: "#1e293b",
		flipTextStyle: {
			color: "#ffffff",
			fontSize: "1.25em",
			fontWeight: "500",
			textAlign: "center",
		},
	},
	googleMap: {
		id: "googleMap",
		type: "content",
		contentType: "googleMap",
		style: {
			display: "flex",
			height: "25em",
			width: "100%",
			minWidth: "100%",
			minHeight: "100%",
		},
		url: '',

		attributes: {
			src: "@/assets/test-img.png",
			alt: "image",
			children: "",
		},
	},
	youtube: {
		id: "youtube",
		type: "content",
		contentType: "youtube",
		style: {
			display: "flex",
			height: "100%",
			width: "100%",
			minWidth: "100%",
			minHeight: "100%",
		},
		url: '',

		attributes: {
			src: "@/assets/test-img.png",
			alt: "image",
			children: "",
		},
	},
	vimeo: {
		id: "vimeo",
		type: "content",
		contentType: "vimeo",
		style: {
			display: "flex",
			height: "100%",
			width: "100%",
			minWidth: "100%",
			minHeight: "100%",
		},
		url: '',

		attributes: {
			src: "@/assets/test-img.png",
			alt: "image",
			children: "",
		},
	},
	html: {
		id: "html",
		type: "content",
		contentType: "html",
		namd: "WebView",
		style: {
			display: "flex",
			height: "100%",
			width: "100%",
			minWidth: "100%",
			minHeight: "100%",
		},
		url: '',

		attributes: {
			src: "@/assets/test-img.png",
			alt: "image",
			children: "",
		},
	},
	countDown: {
		id: "countDown",
		type: "content",
		contentType: "countDown",
		name: "Count Down",
		style: {
			display: "flex",
			height: "100%",
			width: "100%",
			minWidth: "2em",
			minHeight: "2em",
		},
		colors: {
			title: '#1E2129',
			description: "#1E2129",
			footer: "#1E2129",
			countDown: {
				primary: "#50cd89",
				secondary: "#adadb8e5",
				basic: "#1E2129"
			}
		},
		title: "Event starts soon",
		description: "Join us for the big moment",
		footer: "Don't miss it",
		showTitle: true,
		showDescription: true,
		showFooter: true,

		uiType: 'boldBlocks',
		children: [],
		attributes: {
			src: "@/assets/test-img.png",
			alt: "image",
		},
	},
	customCountDownWrapper: {
		id: "customCountDownWrapper",
		type: "container",
		contentType: "customCountDownWrapper",
		name: "Custom CountDown Wrapper",
		style: {
			display: "flex",
			height: "100%",
			width: "100%",
			minWidth: "2em",
			minHeight: "2em",
		},
		endDate: {
			day: 28,
			month: 7,
			year: 2026,
			hour: 0,
			minute: 0

		},
		startDate: {
			day: 1,
			month: 7,
			year: 2026,
			hour: 0,
			minute: 0

		},
		title: "Event starts soon",
		description: "Join us for the big moment",
		footer: "Don't miss it",
		showTitle: true,
		showDescription: true,
		showFooter: true,

		children: [],
		attributes: {
			src: "@/assets/test-img.png",
			alt: "image",
		},
	},
	social: {
		id: "social",
		type: "content",
		contentType: "social",
		style: {
			display: "flex",
			height: "100%",
			width: "100%",
			minWidth: "2em",
			minHeight: "2em",
		},
		link: '',
		socialType: 'facebook',
		size: 16,
		attributes: {
			src: "@/assets/test-img.png",
			alt: "image",
			children: "",
		},
	},
	counter: {
		id: "counter",
		type: "content",
		contentType: "counter",
		name: "Counter",
		style: {
			display: "flex",
			flexDirection: "row",
			alignItems: "baseline",
			justifyContent: "center",
			width: "fit-content",
			height: "fit-content",
			minWidth: "2em",
			minHeight: "1em",
		},
		startValue: 0,
		endValue: 10000,
		decimals: 0,
		duration: 2,
		prefix: "",
		suffix: "+",
		useThousandsSeparator: true,
		triggerOnView: true,
		numberStyle: {
			fontSize: "2.5em",
			fontWeight: "bold",
			color: "#1a1a1a",
		},
		prefixStyle: {
			fontSize: "2.5em",
			fontWeight: "bold",
			color: "#1a1a1a",
		},
		suffixStyle: {
			fontSize: "2.5em",
			fontWeight: "bold",
			color: "#1a1a1a",
		},
	},
	rating: {
		id: "rating",
		type: "content",
		contentType: "rating",
		name: "Rating",
		style: {
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			gap: "8px",
			width: "fit-content",
			height: "fit-content",
			minWidth: "2em",
			minHeight: "1em",
		},
		value: 4.5,
		maxStars: 5,
		starSize: 24,
		starGap: 4,
		filledColor: "#c8850f",
		emptyColor: "#d9d9d9",
		showSummary: true,
		reviewCount: 3982,
		summaryStyle: {
			fontSize: "14px",
			color: "#4a4a4a",
		},
	},
	timeline: {
		id: "timeline",
		type: "content",
		contentType: "timeline",
		name: "Timeline",
		style: {
			display: "flex",
			width: "100%",
			height: "fit-content",
			minWidth: "8em",
			minHeight: "2em",
		},
		uiType: "classicLine",
		orientation: "vertical",
		activeColor: "#0f766e",
		inactiveColor: "#d9d9d9",
		activeStepCount: 3,
		circleSize: 32,
		steps: [
			{ title: "Submissions Open", description: "Enter your work before the deadline" },
			{ title: "Judging", description: "Our panel reviews every entry" },
			{ title: "Finalists Announced", description: "Shortlisted entries are revealed" },
			{ title: "Awards Night", description: "Winners are celebrated live" },
		],
		titleStyle: {
			fontSize: "14px",
			fontWeight: "600",
			color: "#1a1a1a",
		},
		descriptionStyle: {
			fontSize: "12px",
			color: "#6b6b6b",
		},
	},
	faq: {
		id: "faq",
		type: "content",
		contentType: "faq",
		name: "FAQ",
		style: {
			display: "flex",
			flexDirection: "column",
			width: "100%",
			height: "fit-content",
			minWidth: "8em",
			minHeight: "2em",
		},
		uiType: "classicAccordion",
		items: [
			{ question: "How do I submit my entry?", answer: "Register for an account and use the Submit Entry button to upload your work before the deadline." },
			{ question: "When will winners be announced?", answer: "Winners are revealed live on awards night — finalists are notified beforehand." },
			{ question: "Is there a registration fee?", answer: "Pricing varies by category — see the ticket options above for details." },
		],
		allowMultipleOpen: false,
		defaultOpenIndex: 0,
		questionStyle: {
			fontSize: "15px",
			fontWeight: "500",
			color: "#1e40af",
		},
		answerStyle: {
			fontSize: "14px",
			color: "#4a4a4a",
		},
		dividerColor: "#e5e0d8",
		iconColor: "#4a4a4a",
		cardColor: "#ffffff",
	},
	pricingToggle: {
		id: "pricingToggle",
		type: "content",
		contentType: "pricingToggle",
		name: "Pricing Toggle",
		style: {
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			gap: "8px",
			width: "100%",
			height: "fit-content",
			minWidth: "8em",
			minHeight: "2em",
			textAlign: "center",
		},
		uiType: "classicCard",
		planName: "Standard Entry",
		monthlyPrice: 49,
		yearlyPrice: 149,
		currencySymbol: "$",
		defaultYearly: false,
		monthlyLabel: "Individual",
		yearlyLabel: "Team",
		activeColor: "#0f766e",
		inactiveColor: "#d9d9d9",
		priceStyle: {
			fontSize: "40px",
			fontWeight: "600",
			color: "#1a1a1a",
			fontFamily: "serif",
		},
		periodStyle: {
			fontSize: "16px",
			color: "#7a7a7a",
		},
		planNameStyle: {
			fontSize: "14px",
			color: "#2563eb",
		},
		labelStyle: {
			fontSize: "14px",
			color: "#4a4a4a",
		},
	},
	cardsTemplate: {
		id: "cardsTemplate",
		type: "content",
		contentType: "cardsTemplate",
		name: "Cards",
		style: {
			display: "flex",
			flexDirection: "column",
			width: "100%",
			height: "fit-content",
			minWidth: "8em",
			minHeight: "2em",
		},
		uiType: "gridClassic",
		heading: "Award Categories",
		cards: [
			{ title: "Best Newcomer", description: "Recognizing outstanding first-time entries." },
			{ title: "Best Design", description: "Celebrating exceptional creative execution." },
			{ title: "People's Choice", description: "Voted on by the audience." },
		],
		accentColor: "#2f6fed",
		accentColorSecondary: "#7c3aed",
	},
	navBarTemplate: {
		id: "navBarTemplate",
		type: "content",
		contentType: "navBarTemplate",
		name: "NavBar",
		style: {
			display: "flex",
			width: "100%",
			height: "fit-content",
			minWidth: "8em",
			minHeight: "2em",
		},
		uiType: "classicRow",
		brand: "Brand",
		links: [
			{ label: "Home", href: "" },
			{ label: "Categories", href: "" },
			{ label: "Schedule", href: "" },
			{ label: "Contact", href: "" },
		],
		ctaLabel: "Register Now",
		ctaHref: "",
	},
	eventWidgetsGroupTemplate: {
		id: "eventWidgetsGroupTemplate",
		type: "content",
		contentType: "eventWidgetsGroupTemplate",
		name: "Event Widgets Group",
		style: {
			display: "flex",
			flexDirection: "column",
			width: "100%",
			height: "fit-content",
			minWidth: "8em",
			minHeight: "2em",
			padding: "1em"
		},
		uiType: "classicRow",
		heading: "Event Details",
		endDateText: "December 31, 2026",
		endHourText: "11:59 PM",
		timeZoneText: "UTC",
		submitEntryLabel: "Submit an Entry",
		submitEntryHref: EVENT_ROUTES.SUBMIT_ENTRY,
		registerLabel: "Register",
		registerHref: EVENT_ROUTES.REGISTER,
		accentColor: "#4f46e5",
		accentColorSecondary: "#0ea5e9",
	},
	heroTemplate: {
		id: "heroTemplate",
		type: "content",
		contentType: "heroTemplate",
		name: "Hero",
		style: {
			display: "flex",
			flexDirection: "column",
			width: "100%",
			height: "fit-content",
			minWidth: "8em",
			minHeight: "2em",
			padding: "1em"

		},
		uiType: "centeredClassic",
		heading: "Celebrating Excellence in the Industry",
		subheading: "Join us for a night honoring outstanding achievement and innovation.",
		ctaLabel: "Register Now",
		ctaHref: "",
		accentColor: "#7c3aed",
		accentColorSecondary: "#2563eb",
	},
	footerTemplate: {
		id: "footerTemplate",
		type: "content",
		contentType: "footerTemplate",
		name: "Footer",
		style: {
			display: "flex",
			flexDirection: "column",
			width: "100%",
			height: "fit-content",
			minWidth: "8em",
			minHeight: "2em",
			padding: "1em"

		},
		uiType: "classicColumns",
		brand: "Brand",
		tagline: "A short tagline about your event or organization.",
		columns: [
			{ title: "Event", links: [{ label: "Schedule", href: "" }, { label: "Categories", href: "" }] },
			{ title: "Organization", links: [{ label: "About", href: "" }, { label: "Team", href: "" }] },
			{ title: "Support", links: [{ label: "Help Center", href: "" }, { label: "Contact", href: "" }] },
		],
		copyrightText: "© 2026 Brand. All rights reserved.",
		showOrganizer: false,
		organizerText: "Organized by Your Organization",
		accentColor: "#2f6fed",
		accentColorSecondary: "#7c3aed",
	},
	personalCardTemplate: {
		id: "personalCardTemplate",
		type: "content",
		contentType: "personalCardTemplate",
		style: {
			display: "flex",
			flexDirection: "column",
			width: "100%",
			height: "fit-content",
			minWidth: "8em",
			minHeight: "2em",
			padding: "1em"

		},
		uiType: "classicCentered",
		name: "Jane Doe",
		role: "Judge",
		bio: "Bringing years of industry expertise to this year's judging panel.",
		socialLinks: [
			{ label: "LinkedIn", href: "" },
			{ label: "Twitter", href: "" },
		],
		accentColor: "#6366f1",
		accentColorSecondary: "#8b5cf6",
	},
	layoutTemplate: {
		id: "layoutTemplate",
		type: "content",
		contentType: "layoutTemplate",
		name: "Layout",
		style: {
			display: "flex",
			flexDirection: "column",
			width: "100%",
			height: "fit-content",
			minWidth: "8em",
			minHeight: "2em",
			padding: "1em"

		},
		uiType: "twoColumnTextImage",
		heading: "About Us",
		columns: [
			{ title: "Our Story", description: "A short paragraph describing this column's content." },
			{ title: "Our Mission", description: "A short paragraph describing this column's content." },
		],
		accentColor: "#2f6fed",
		accentColorSecondary: "#7c3aed",
	},
};
