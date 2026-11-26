import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import {LineHeight, TextStyle}  from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import FontFamily from "@tiptap/extension-font-family";
import { FontSize } from "@/libs/tiptap/font-size";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Highlight from '@tiptap/extension-highlight'

Link.extend({
	inclusive: false,
});

export const extensions = [

	Color.configure({ types: [TextStyle.name, ListItem.name] }),
	TextAlign.configure({
		types: ["heading", "paragraph"],
	}),

	Highlight.configure({
		multicolor: true,
	}),
	FontFamily,
	TextStyle,
	FontSize,
	Table.configure({
		resizable: true,
	}),
	LineHeight,
	TableRow,
	TableHeader,
	TableCell, 
	Superscript,
	Subscript,
	// Link.configure({
	// 	openOnClick: false,
	// 	HTMLAttributes: {
	// 		rel: "",
	// 		target: "_blank",
	// 	},
	// 	autolink: true,
	// 	defaultProtocol: "https",
	// 	protocols: ["http", "https"],

	// }),
	StarterKit.configure({
		// Off: it appends an empty <p> on the first click into any doc that ends in a
		// heading/list (e.g. imported text). Tables already carry their own trailing paragraph.
		trailingNode: false,

		bulletList: {
			keepMarks: true,
			keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
		},
		orderedList: {
			keepMarks: true,
			keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
		},


	}),

];
