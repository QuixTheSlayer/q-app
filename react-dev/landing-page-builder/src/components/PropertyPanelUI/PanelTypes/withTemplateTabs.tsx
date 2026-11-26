import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ContentSizeSection from "./ContentSizeSection";
import GridCellPositionSection from "./GridCellPositionSection";
import AnimationSection from "@/components/PropertyPanelUI/Sections/AnimationSection";
import editorConfig from "@/configs/editor.config";
import { useTranslation } from "react-i18next";
import { Ruler, Sparkles } from "lucide-react";
import { PanelSection } from "../kit/PanelSection";
import { StyleSections } from "../kit/StyleSections";

type TemplateTabValue = "content" | "sizeGrid" | "animation";

/**
 * Same shape as withSizeGridTab, plus a third "Animation" tab (the
 * hover/click/auto trigger_effect system already used by Button/Container)
 * — gated behind editorConfig.enable_animation_section like every other
 * Animation tab in the app. Kept as its own HOC rather than extending
 * withSizeGridTab directly so panels that share a component across a
 * template and a non-template content type (e.g. TablePanel, used by both
 * "table" and "tableEnterprise") aren't silently affected — only Ready Made
 * Template panels opt into this wrapper.
 */
function withTemplateTabs<P extends object>(
	PanelBody: React.ComponentType<P>,
	SizeComponent: React.ComponentType = ContentSizeSection,
) {
	function RedesignedPanel(props: P) {
		const { t } = useTranslation("propertyPanel")
		// One scroll: the template's own controls, then Size & Grid and Animation folded away.
		return (
			<>
				<div className="[&>div]:!h-auto [&>div]:!max-h-none [&>div]:!overflow-visible">
					<PanelBody {...props} />
				</div>
				<PanelSection title={t("kit.sizeGrid")} icon={Ruler} defaultOpen={false}>
					<SizeComponent />
					<GridCellPositionSection />
				</PanelSection>
				{editorConfig.enable_animation_section && (
					<PanelSection title={t("animationSection.animation")} icon={Sparkles} defaultOpen={false}><AnimationSection /></PanelSection>
				)}
				<StyleSections />
			</>
		)
	}

	function WrappedPanel(props: P) {
		const { t } = useTranslation("propertyPanel")
		const tabType: TemplateTabValue[] = (["content", "sizeGrid", "animation"] as TemplateTabValue[]).filter(
			(tab) => tab !== "animation" || editorConfig.enable_animation_section
		)
		const [tab, setTab] = useState<TemplateTabValue>(tabType[0]);

		return (
			<Tabs value={tab} onValueChange={(v) => setTab(v as TemplateTabValue)}>
				<TabsList className="border-b w-full overflow-x-auto overflow-y-hidden no-scrollbar flex-nowrap">
					<TabsTrigger className="shrink-0" value="content">Content</TabsTrigger>
					<TabsTrigger className="shrink-0" value="sizeGrid">Size &amp; Grid</TabsTrigger>
					{tabType.includes("animation") && (
						<TabsTrigger className="shrink-0" value="animation">{t('animationSection.animation')}</TabsTrigger>
					)}
				</TabsList>
				<TabsContent className="h-[85vh] max-h-[80vh] overflow-y-auto no-scrollbar" value="content">
					<PanelBody {...props} />
				</TabsContent>
				<TabsContent className="h-[85vh] max-h-[80vh] overflow-y-auto no-scrollbar" value="sizeGrid">
					<SizeComponent />
					<GridCellPositionSection />
				</TabsContent>
				{tabType.includes("animation") && (
					<TabsContent className="h-[85vh] max-h-[80vh] overflow-y-auto no-scrollbar" value="animation">
						<AnimationSection />
					</TabsContent>
				)}
			</Tabs>
		);
	}

	const Chosen = (props: P) => (editorConfig.enable_panel_redesign ? <RedesignedPanel {...props} /> : <WrappedPanel {...props} />);
	Chosen.displayName = `withTemplateTabs(${PanelBody.displayName || PanelBody.name || "Panel"})`;
	return Chosen;
}

export default withTemplateTabs;
