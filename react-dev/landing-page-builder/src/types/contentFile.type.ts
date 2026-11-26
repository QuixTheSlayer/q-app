import { CanvasNode } from "@/types/node.type";

export interface ScrollToTopConfig {
	enabled: boolean;
	backgroundColor?: string;
	iconColor?: string;
	size?: "sm" | "md" | "lg";
	position?: "bottom-right" | "bottom-left";
}

export interface PageFile {
	id: number | string;
	title: string;
	description?: string;
	content: CanvasNode;
	created_at: Date;
	updated_at?: Date;
	page_thumbnail?: string;
	thumbnail?: string;
	user_id: number | string;
	is_free: 1 | 0;
	scrollToTop?: ScrollToTopConfig;
	/** Preview width mode: 1 = boxed (capped at 1200px, centered via `main-container-lp`), 0/unset = max screen (full width). */
	is_boxed?: 1 | 0;
	/** false = the page may not run or edit its own JS / external CSS (see utils/security/codePolicy.ts). */
	isAllow?: boolean;
	/** true only when the backend explicitly allowed page JS; a missing flag is false (fails closed, see parseJsAllowed). */
	jsAllowed?: boolean;
}

export interface PageQueryData {
	id: number | string;
	title: string;
	description: string;
	page_thumbnail?: string;
	thumbnail?: string;
	/** The page tree as a JSON string (what the API sends), or already decoded (some mock rows and backends). */
	page_content: string | Record<string, unknown>;
	scroll_to_top?: ScrollToTopConfig;
	is_free: 1 | 0;
	is_boxed?: 1 | 0;
	user_id: number;
	created: Date;
	modified: 1 | 0;
	/** Raw backend value (boolean, or 0/1); read through parseIsAllow(). */
	is_allow?: boolean | 0 | 1 | '0' | '1';
}

export interface EventDeadline {
	end_date: string;
	end_hour: string;
	timezone: string;
	timezone_offset: string;
}

export interface EventRoute {
	submit_an_entry_url: string;
	register_url: string;
	view_entries: string;
}

export interface RenderPageQueryData {
	landingpage_data: PageQueryData;
	event_deadline: EventDeadline;
  event_route: EventRoute
}
