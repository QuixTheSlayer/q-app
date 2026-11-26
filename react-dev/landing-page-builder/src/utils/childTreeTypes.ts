import { ContentType } from "@/types/node.type";

/**
 * Content types whose inner content is a real child node tree rather than
 * hardcoded markup. Nodes of these types recurse only when `children` is an
 * array — ones saved before the migration have none and render their flat
 * fields as before. `accordion`/`tab`/`testimonialSlider` are handled
 * separately since their children predate this.
 */
export const CHILD_TREE_TYPES = new Set<ContentType | undefined>([
	"heroTemplate",
	"faq",
	"timeline",
	"iconBlock",
	"separators",
	"layoutTemplate",
	"cardsTemplate",
	"footerTemplate",
	"personalCardTemplate",
	"navBarTemplate",
	"eventWidgetsGroupTemplate",
	"pricingToggle",
	"progressBar",
	"buttonEnterprise",
])
