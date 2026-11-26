import { EVENT_DEADLINE, EVENT_ROUTES } from "@/consts/event-widgets.const";
import {CanvasNode, ContentNode, ContentType, NodeAttributesMap} from "@/types/node.type";
import {WidgetType} from "@/types/widget.type";

export const widgetContents: Record<
	WidgetType,
	{
		contentType: Exclude<ContentType, "root" | "section" | "block">;
		style?: React.CSSProperties;
		attributes?: NodeAttributesMap[ContentNode["contentType"]];
		children?: string;
	}
> = {
	submitEntryButton: {
		contentType: "button",
		children: "Submit an Entry",
		attributes: {
			href: EVENT_ROUTES.SUBMIT_ENTRY,
		},
	},
	registerButton: {
		contentType: "button",
		children: "Register",
		attributes: {
			href: EVENT_ROUTES.REGISTER,
		},
	},
	endDate: {
		contentType: "text",
		children: `{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":\"\",\"fontFamily\":\"Arial, sans-serif\",\"fontSize\":\"1em\"}}],\"text\":\"${EVENT_DEADLINE.END_DATE}\"}]}]}`,
	},
	endHour: {
		contentType: "text",
		children: `{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":\"\",\"fontFamily\":\"Arial, sans-serif\",\"fontSize\":\"1em\"}}],\"text\":\"${EVENT_DEADLINE.END_HOUR}\"}]}]}`,
	},
	timeZone: {
		contentType: "text",
		children: `{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":null},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":\"\",\"fontFamily\":\"Arial, sans-serif\",\"fontSize\":\"1em\"}}],\"text\":\"${EVENT_DEADLINE.TIMEZONE}\"}]}]}`,
	},
} as const;
