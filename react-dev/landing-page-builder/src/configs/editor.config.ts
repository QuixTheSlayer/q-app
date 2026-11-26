// import {  true } from "@/libs/checkEnv";
import { isDev } from "@/libs/checkEnv";
import { ContentType } from "@/types/node.type";
import { WidgetType } from "@/types/widget.type";

const editorConfig = {
	root_font_size: 16,
	
	/** Where users are told to write when the page's `isAllow` flag blocks JS / external CSS. */
	support_email: 'joseph@judgify.me',
	/**
	 * Multi-select (Shift/Ctrl/Cmd-click to select multiple sibling nodes,
	 * then delete/duplicate them together).
	 */
	enable_multi_select:  true,
	/** The "Animation" tab in the property panel (trigger-based enter/hover/scroll animations). */
	enable_animation_section: true,
	/**
	 * Per-effect duration/delay/easing with the visual preview, easing curve and timeline editors, plus
	 * the extra effect types (opacity, scale, translate, skew, blur, text color, animation presets).
	 */
	enable_animation_timing: true,
	/** Dashed outline on the editor canvas around every block that has an animation effect. */
	enable_animation_outline: true,
	/**
	 * Encrypt a page's CSS and JavaScript (plainCss, plainJS, pageScripts code) before it is saved and decrypt it when
	 * loaded, so a web application firewall in front of the API does not block the save for looking like an attack.
	 * Loading always decrypts, whatever this is set to, so pages saved while it was on keep working.
	 */
	enable_code_encryption: true,
	/**
	 * Passphrase the key is made from. It ships in the bundle, so this hides code from the firewall, not from people.
	 * Changing it makes pages saved with the old one load without their CSS and JavaScript.
	 * VITE_CONTENT_ENCRYPTION_KEY overrides it per build.
	 */
	content_encryption_passphrase: 'judgify-landing-page-builder-code-v1',
	/**
	 * A hidden page for converting text and page data to and from the encrypted form by hand. It has no link anywhere:
	 * add ?converter to any page address Laravel serves, such as the editor, or open /landing-page-builder/converter in dev.
	 */
	enable_converter_page: true,
	/** The "Attributes" tab in the property panel (raw id/class/href editing). */
	enable_attributes_section: true,
	/**
	 * The Position sub-controller in the Layout tab.
	 */
	enable_position_controller:  true,
	/**
	 * "Generate Random Layout" button in the Insert panel.
	 */
	enable_random_layout_generator: isDev,
	/** Header dark/light theme toggle button + its Ctrl+Shift+D shortcut. */
	enable_theme_toggle:  true,
	/** Canvas zoom controls (+/- buttons and Ctrl +/-/0 shortcuts) in the floating toolbar. */
	enable_zoom_controls: true,
	/** The floating "scroll to top" button shown on Preview/RenderPage. */
	enable_scroll_to_top_button: true,
	/** The "Capture thumbnail" dialog/action in the editor toolbar. */
	enable_thumbnail_capture: true,
	/** Undo/redo history (Ctrl+Z / Ctrl+Shift+Z). */
	enable_undo_redo: true,
	/** Copy/paste a node (Ctrl+C / Ctrl+V). */
	enable_copy_paste: true,
	/** Ctrl+ArrowUp shortcut to select the focused node's parent. */
	enable_select_parent_shortcut:  true,
	/**
	 * Insert-panel keyboard shortcuts — press "/" to arm, then a letter/number
	 * to insert that content type or widget without clicking.
	 */
	enable_insert_shortcuts:  true,
	/**
	 * Per-device (desktop/tablet/mobile) responsive style overrides — the
	 * device-scope switcher in the property panel, responsiveStyle on nodes,
	 * and the generated @media rules for Preview/RenderPage/export. Flip to
	 * false to make every style control desktop-only again.
	 */
	enable_responsive_editing:  true,
	/** Ctrl+S manual save shortcut (the Save button itself always works). */
	enable_save_shortcut: true,
	/** Saves the page automatically once there have been no changes for `auto_save_delay_ms`. */
	enable_auto_save: isDev,
	auto_save_delay_ms: 3000,
	/** Ctrl+P shortcut to switch between the Editor and Preview pages. */
	enable_preview_switch_shortcut: true,
	/**
	 * Holding Alt on the editor canvas fires a node's scrollTo/hover triggers
	 * instead of selecting it
	 */
	enable_prototype_interactions: true,
	/**
	 * Which advanced/embed content types can be inserted from the Insert
	 * panel. Missing/unset entries default to enabled.
	 */
	enabled_content_types: {
		chart: true,
		iconBlock: true,
		separators: true,
		verticalTab: true,
		accordion: true,
		tab: true,
		imageSlider: true,
		imageCarousel: true,
		blockCarousel: true,
		imageFlipFlop: true,
		googleMap: true,
		youtube: true,
		vimeo: true,
		html: true,
		countDown: true,
		social: true,
		testimonialSlider: true,
		progressBar: true,
		counter: true,
		rating: true,
		timeline: true,
		faq: true,
		pricingToggle: true,
	} as Partial<Record<ContentType, boolean>>,
	/** Same as enabled_content_types, but for the Event Widgets group (submit entry, register, end date/hour, time zone). */
	enabled_widget_types: {} as Partial<Record<WidgetType, boolean>>,
	/**
	 * Which plan a content type requires, shown as a small "PRO"/"ENTERPRISE"
	 * badge on its Insert-panel button. Missing/unset entries are untagged
	 * (available on every plan).
	 */
	content_type_plan_tier: {
		// PRO
		accordion:"Pro",
		social:'Pro',
		rating:'Pro',
		googleMap:'Pro',
		youtube:'Pro',
		vimeo:'Pro',
		html:'Pro',
		counter:'Pro',
		tab:'Pro',
		separators:'Pro',

		// ENTERPRISE
		chart:'Ent',
		iconBlock:'Ent',
		timeline:'Ent',
		countDown:'Ent',
		imageSlider:'Ent',
		imageCarousel:'Ent',
		imageFlipFlop:"Ent",
		testimonialSlider:'Ent',
		faq:'Ent',
		pricingToggle:'Ent',
		cardsTemplate:'Ent',
		navBarTemplate:'Ent',
		eventWidgetsGroupTemplate:'Ent',
		heroTemplate:'Ent',
		footerTemplate:'Ent',
		personalCardTemplate:'Ent',
		layoutTemplate:'Ent',
		progressBar:'Ent',
		tableEnterprise:'Ent',
		buttonEnterprise:'Ent'



	} as Partial<Record<ContentType, 'Pro' | 'Ent'>>, 
	/** Same as content_type_plan_tier, but for Event Widgets. */
	widget_type_plan_tier: {} as Partial<Record<WidgetType, 'Pro' | 'Ent'>>,
	/**
	 * PLACEHOLDER
	 */
	current_user_plan_PLACEHOLDER: 'Pro' as 'Pro' | 'Ent',
	/**
	 * Warns (not blocks) on Save when the page contains a node whose content
	 * type is tagged above the current plan (content_type_plan_tier /
	 * widget_type_plan_tier vs. current_user_plan_PLACEHOLDER). See
	 * src/utils/planTierAudit.ts.
	 *
	 * Off by default — user testing found the save-time toast read as an
	 * error ("something went wrong") rather than the informational note it
	 * was meant to be, since it only ever appeared at the exact moment
	 * something else (the save) was happening. enable_plan_tier_banner below
	 * replaces it with a persistent, unmistakably-informational banner
	 * instead of a transient toast tied to an action.
	 */
	enable_plan_tier_save_warning: false,
	/**
	 * Persistent informational banner under the editor's navbar
	 */
	enable_plan_tier_banner: true,
	/**
	 * Arrow keys reorder the focused node among its siblings
	 */
	enable_arrow_key_reorder:  true,
	/**
	 * "Group" action — wraps the focused node or the current multi-selection
	 * in a new block 
	 */
	enable_group_action:  true,
	/** The "?" hint icon next to property panel controls (hover popover with a demo + description). */
	enable_property_hints:  true,
	/**
	 * Lets the property panel edit style properties for every node in the
	 * current multi-selection
	 */
	enable_multi_select_property_editing:  true,
	/**
	 * Inserting from the Insert panel while multiple nodes are selected
	 */
	enable_multi_select_insert:  true,
	/**
	
	* Shows faint dashed placeholder cells inside a grid-layout container
	*/
	enable_grid_placeholders: true,

	
	/**
	 * "Split"/"Join" block actions in the node action menu
	 */
	enable_split_join_action: true,
	/**
	 * Editor-chrome language switcher
	 */
	enable_language_switcher: true,
	/** Show/hide toggle for the NavBar Ready Made Template's Call To Action button, independent of its label text. */
	enable_navbar_cta_toggle: true,
	/** Lets the NavBar Ready Made Template's brand render as an uploaded logo image (with size/corner-radius controls) instead of plain text. */
	enable_navbar_logo_image: true,
	/**
	 * Preview screen size selector in the Page Setting panel
	 */
	enable_preview_screen_size_controller: true,
	/**
	 * First-time-user onboarding tour
	 */
	enable_onboarding_tour: true,
	/**
	 * Toolbar "Import HTML" dialog (HTML → JSON tree, CSS/JS kept as plainCss/plainJS)
	 */
	enable_import_html: true,
	/**
	 * "Replace" node action - swaps the focused node for a copy of the node
	 * last copied with Copy / Ctrl+C. Shortcut: Ctrl/Cmd+Shift+V
	 */
	enable_replace_action: true,
	/**
	 * Toolbar "Custom Code" dialog - edit/upload the page's own CSS and JS (plainCss/plainJS)
	 */
	enable_custom_code: true,
	/**
	 * Property panel for the page root (layout, size, padding/margin, background)
	 */
	enable_root_property_panel: true,
	/**
	 * Property panel fields show what the element really looks like (computed style,
	 * incl. imported page CSS) when the node has no value of its own
	 */
	enable_panel_computed_values: true,
	/**
	 * "Changed" dot + reset-to-original button on property panel rows that declare their props
	 */
	enable_panel_field_reset: true,
	/**
	 * Setting a style that does nothing alone also sets what it needs (border width -> solid style,
	 * gap -> flex, width -> no max-width cap)
	 */
	enable_companion_styles: true,
	/**
	 * Getting-started tips in the property panel when nothing is selected
	 */
	enable_panel_empty_tips: true,
	/**
	 * Rotate control (angle slider, 90° turns) in the block, image and button property panels
	 */
	enable_rotate_control: true,
	/**
	 * Redesigned property panel: slim header, Design / Actions / More tabs, "More options" folds
	 */
	enable_panel_redesign: true,
	/**
	 * Import HTML keeps <input>/<select>/<textarea> as form field nodes instead of dropping them
	 */
	enable_form_field_import: true,
	/**
	 * Import HTML takes the code out of ```html fences, so a whole AI chat reply can be pasted
	 */
	enable_import_code_fences: true,
	/**
	 * Import HTML keeps every safe source attribute (open, datetime, colspan, srcset...), not just data-/aria-
	 */
	enable_import_all_attributes: true,
	/**
	 * Import HTML puts text in the rich-text editor only when it keeps every tag and attribute inside;
	 * otherwise the inline pieces stay separate nodes
	 */
	enable_import_lossless_text: true,
	/**
	 * Import HTML keeps elements with no node type of their own (br, canvas, audio, progress, dialog...)
	 * as blocks with their real tag
	 */
	enable_import_raw_elements: true,
	/**
	 * Import HTML keeps https <script src> and module scripts; they run with the page JS in the sandbox frame
	 */
	enable_import_page_scripts: true,
	/**
	 * Import HTML keeps the <html> attributes (lang, class="dark", data-theme) for the published page
	 */
	enable_import_html_attributes: true,
	/**
	 * Import HTML dialog shows a copyable AI prompt that generates import-friendly HTML
	 */
	enable_import_ai_prompt: true,
	/**
	 * Import HTML dialog can load an .html file from disk into the editor
	 */
	enable_import_html_upload: true,
	/**
	 * Preview's "Export React" button: the page as a React + TypeScript (Vite) project in a .zip
	 */
	enable_export_react: isDev,
	/**
	 * Editor tablet/mobile views apply an imported page's own width @media rules (as container queries on its root)
	 */
	enable_editor_page_breakpoints: true,
	/**
	 * Preview/published sandbox turns an imported form back into a real <form>, so the page's submit handler runs
	 */
	enable_sandbox_forms: true,
	/**
	 * Editor shows imported <details> open, so their hidden content can be edited
	 */
	enable_editor_open_details: true,
	/**
	 * Import HTML makes every ul/ol/li a block with its real tag (each item its own node), never one rich-text list
	 */
	enable_import_lists_as_blocks: true,
	/**
	 * Import HTML removes alert(), console.*() and network calls (fetch, axios, $.ajax, XMLHttpRequest...) from the pasted JS
	 */
	enable_import_strip_js_side_effects: true,
};

/**
 * Dev-only localStorage overrides
 */
export const FEATURE_OVERRIDES_STORAGE_KEY = 'landing_page_builder_feature_overrides'

type EditorConfig = typeof editorConfig
type EditorConfigOverrides = { [K in keyof EditorConfig]?: EditorConfig[K] }

try {
	const raw = localStorage.getItem(FEATURE_OVERRIDES_STORAGE_KEY)
	if (raw) {
		const overrides = JSON.parse(raw) as EditorConfigOverrides
		if (overrides && typeof overrides === 'object') {
			for (const key of Object.keys(overrides) as (keyof EditorConfig)[]) {
				const value = overrides[key]
				if (value === undefined) continue
				if (
					key === 'enabled_content_types' || key === 'enabled_widget_types' ||
					key === 'content_type_plan_tier' || key === 'widget_type_plan_tier'
				) {
					Object.assign(editorConfig[key], value)
				} else if (key in editorConfig) {
					(editorConfig[key] as unknown) = value
				}
			}
		}
	}
} catch {
	// malformed override payload — ignore and fall back to defaults
}

export default editorConfig