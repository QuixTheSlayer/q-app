import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ContentSizeSection from "./ContentSizeSection";
import GridCellPositionSection from "./GridCellPositionSection";
import { Ruler } from "lucide-react";
import { useTranslation } from "react-i18next";
import editorConfig from "@/configs/editor.config";
import { PanelSection } from "../kit/PanelSection";
import { StyleSections } from "../kit/StyleSections";

type SizeGridTabValue = "content" | "sizeGrid";

/**
 * Wraps a flat-list PropertyPanel body as its own tab and adds a second
 * "Size & Grid" tab (a size section + GridCellPositionSection) — keeps the
 * size/grid-cell controls out of the long scrolling list every panel used to
 * end with, without hand-restructuring each panel's own JSX.
 *
 * Pass `SizeComponent` when the panel already renders its own size section
 * (e.g. SizeSection instead of ContentSizeSection) so it isn't duplicated —
 * defaults to ContentSizeSection, the size control most panels share.
 */
function withSizeGridTab<P extends object>(
	PanelBody: React.ComponentType<P>,
	SizeComponent: React.ComponentType = ContentSizeSection,
) {
	function RedesignedPanel(props: P) {
		const { t } = useTranslation("propertyPanel");
		// One scroll: the panel's own controls, then Size & Grid folded away, then Appearance.
		return (
			<>
				{/* Panel bodies size themselves to the viewport; here the whole panel scrolls instead. */}
				<div className="[&>div]:!h-auto [&>div]:!max-h-none [&>div]:!overflow-visible">
					<PanelBody {...props} />
				</div>
				<PanelSection title={t("kit.sizeGrid")} icon={Ruler} defaultOpen={false}>
					<SizeComponent />
					<GridCellPositionSection />
				</PanelSection>
				<StyleSections />
			</>
		);
	}

	function WrappedPanel(props: P) {
		const [tab, setTab] = useState<SizeGridTabValue>("content");

		return (
			<Tabs value={tab} onValueChange={(v) => setTab(v as SizeGridTabValue)}>
				<TabsList className="border-b w-full">
					<TabsTrigger value="content">Content</TabsTrigger>
					<TabsTrigger value="sizeGrid">Size &amp; Grid</TabsTrigger>
				</TabsList>
				<TabsContent className="h-[85vh] max-h-[80vh] overflow-y-auto no-scrollbar" value="content">
					<PanelBody {...props} />
				</TabsContent>
				<TabsContent className="h-[85vh] max-h-[80vh] overflow-y-auto no-scrollbar" value="sizeGrid">
					<SizeComponent />
					<GridCellPositionSection />
				</TabsContent>
			</Tabs>
		);
	}

	const Chosen = (props: P) => (editorConfig.enable_panel_redesign ? <RedesignedPanel {...props} /> : <WrappedPanel {...props} />);
	Chosen.displayName = `withSizeGridTab(${PanelBody.displayName || PanelBody.name || "Panel"})`;
	return Chosen;
}

export default withSizeGridTab;
