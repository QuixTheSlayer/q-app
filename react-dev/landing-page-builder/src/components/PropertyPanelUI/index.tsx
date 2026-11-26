import AccordionPanel from "@/components/PropertyPanelUI/PanelTypes/AccordionPanel";
import ButtonPanel from "@/components/PropertyPanelUI/PanelTypes/ButtonPanel";
import ContainerPanel from "@/components/PropertyPanelUI/PanelTypes/ContainerPanel";
import ImageSliderPanel from "@/components/PropertyPanelUI/PanelTypes/ImageSliderPanel";
import ImagePanel from "@/components/PropertyPanelUI/PanelTypes/ImagePanel";
import VideoPanel from "@/components/PropertyPanelUI/PanelTypes/VideoPanel";
import TablePanel from "@/components/PropertyPanelUI/PanelTypes/TablePanel";
import TabPanel from "@/components/PropertyPanelUI/PanelTypes/TabPanel";
import TextPanel from "@/components/PropertyPanelUI/PanelTypes/TextPanel";
import { useEditor } from "@/context/EditorContext";
import { ContentType } from "@/types/node.type";
import { camelToSentenceCase } from "@/utils/string.utils";

import { ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ImageCarouselPanel from "@/components/PropertyPanelUI/PanelTypes/ImageCarouselPanel";
import ImageFlipFlopPanel from "@/components/PropertyPanelUI/PanelTypes/ImageFlipFlopPanel";
import BlockCarouselPanel from "./PanelTypes/BlockCarouselPanel";
import GoogleMap from "./PanelTypes/GoogleMapPanel";
import CountDownPanel from "./PanelTypes/CountDownPanel";
import CountDownTextPanel from "./PanelTypes/CountDownTextPanel";
import SocialPanel from "./PanelTypes/SocialPanel";

import VerticalTabPanel from "@/components/PropertyPanelUI/PanelTypes/VerticalTabPanel";
import SeparatorsPanel from "@/components/PropertyPanelUI/PanelTypes/SeparatorsPanel";
import NewNodePanel from "@/components/PropertyPanelUI/PanelTypes/NewNodePanel";
import IconBlockPanel from "@/components/PropertyPanelUI/PanelTypes/IconBlockPanel";
import DeviceScopeControl from "@/components/PropertyPanelUI/Sections/DeviceScopeControl";
import NodeVisibilityToggle from "@/components/PropertyPanelUI/Sections/NodeVisibilityToggle";
import MultiSelectPanel from "@/components/PropertyPanelUI/PanelTypes/MultiSelectPanel";
import { cn } from "@/libs/cn";
import editorConfig from "@/configs/editor.config";
import ChartPanel from "@/components/PropertyPanelUI/PanelTypes/ChartPanel";
import TestimonialSliderPanel from "@/components/PropertyPanelUI/PanelTypes/TestimonialSliderPanel";
import ProgressBarPanel from "@/components/PropertyPanelUI/PanelTypes/ProgressBarPanel";
import CounterPanel from "@/components/PropertyPanelUI/PanelTypes/CounterPanel";
import RatingPanel from "@/components/PropertyPanelUI/PanelTypes/RatingPanel";
import TimelinePanel from "@/components/PropertyPanelUI/PanelTypes/TimelinePanel";
import FaqPanel from "@/components/PropertyPanelUI/PanelTypes/FaqPanel";
import PricingTogglePanel from "@/components/PropertyPanelUI/PanelTypes/PricingTogglePanel";
import CardsTemplatePanel from "@/components/PropertyPanelUI/PanelTypes/CardsTemplatePanel";
import NavBarTemplatePanel from "@/components/PropertyPanelUI/PanelTypes/NavBarTemplatePanel";
import HeroTemplatePanel from "@/components/PropertyPanelUI/PanelTypes/HeroTemplatePanel";
import EventWidgetsGroupTemplatePanel from "@/components/PropertyPanelUI/PanelTypes/EventWidgetsGroupTemplatePanel";
import PersonalCardTemplatePanel from "@/components/PropertyPanelUI/PanelTypes/PersonalCardTemplatePanel";
import FooterTemplatePanel from "@/components/PropertyPanelUI/PanelTypes/FooterTemplatePanel";
import LayoutTemplatePanel from "@/components/PropertyPanelUI/PanelTypes/LayoutTemplatePanel";
import ButtonEnterprisePanel from "@/components/PropertyPanelUI/PanelTypes/ButtonEnterprisePanel";
import ClassJsSection from "@/components/PropertyPanelUI/Sections/ClassJsSection";
import { PanelHeader } from "@/components/PropertyPanelUI/kit/PanelHeader";
import FormFieldPanel from "@/components/PropertyPanelUI/PanelTypes/FormFieldPanel";
const PanelTypes: Record<ContentType | string, ReactNode> = {
chart: <ChartPanel/>,
iconBlock: <IconBlockPanel/>,
newNode: <NewNodePanel/>,
separators: <SeparatorsPanel/>,
verticalTab: <VerticalTabPanel/>,
	root: editorConfig.enable_root_property_panel ? <ContainerPanel variant="root" /> : <div>No properties available</div>,
	section: <ContainerPanel />,
	block: <ContainerPanel />,
	text: <TextPanel />,
	image: <ImagePanel />,
	video: <VideoPanel />,
	button: <ButtonPanel />,
	table: <TablePanel />,
	accordion: <AccordionPanel />,
	tab: <TabPanel />,
	imageSlider: <ImageSliderPanel />,
	imageCarousel: <ImageCarouselPanel />,
	blockCarousel: <BlockCarouselPanel />,
	imageFlipFlop: <ImageFlipFlopPanel />,
	googleMap:<GoogleMap />,
	youtube:<GoogleMap />,
	vimeo:<GoogleMap />,
	html:<GoogleMap />,
	countDown:<CountDownPanel/>,
	customCountDownWrapper:<CountDownPanel/>,
		countDownText:<CountDownTextPanel/>,
		social:<SocialPanel/>,
		testimonialSlider:<TestimonialSliderPanel/>,
		progressBar:<ProgressBarPanel/>,
		counter:<CounterPanel/>,
		rating:<RatingPanel/>,
		timeline:<TimelinePanel/>,
		faq:<FaqPanel/>,
		pricingToggle:<PricingTogglePanel/>,
		cardsTemplate:<CardsTemplatePanel/>,
		navBarTemplate:<NavBarTemplatePanel/>,
		heroTemplate:<HeroTemplatePanel/>,
		eventWidgetsGroupTemplate:<EventWidgetsGroupTemplatePanel/>,
		personalCardTemplate:<PersonalCardTemplatePanel/>,
		footerTemplate:<FooterTemplatePanel/>,
		layoutTemplate:<LayoutTemplatePanel/>,
		tableEnterprise:<TablePanel/>,
		buttonEnterprise:<ButtonEnterprisePanel/>,
		formField:<FormFieldPanel/>


};

// Getting-started tips shown when nothing is selected (keys under panel.tips).
const EMPTY_TIPS = ['select', 'changed', 'copyPaste', 'reorder'] as const

function PropertyPanel() {
	const { t } = useTranslation('propertyPanel');
	const canvas = useEditor();

	const isMultiSelecting = editorConfig.enable_multi_select_property_editing && (canvas?.selectedNodes.length ?? 0) > 0

	// The class-based JS controller (ClassJsSection) only makes sense for a
	// single focused node with a class - same "first class wins" rule
	// EditorContext's syncClassStyle uses for the CSS side.
	const focusedNodeClassName = (canvas?.focusedNode as { attributes?: { className?: string } } | null)
		?.attributes?.className?.trim().split(/\s+/)[0] || undefined

	// When every node in the current multi-selection shares the same content
	// type, show that type's own panel (edits fan out to the whole selection
	// via EditorContext's updateNode/updateNodeStyle) instead of the generic
	// cross-type MultiSelectPanel.
	const sameTypeSelection = useMemo(() => {
		if (!isMultiSelecting || !canvas) return undefined
		const targets = canvas.focused && !canvas.selectedNodes.some((n) => n.id === canvas.focused?.id)
			? [...canvas.selectedNodes, canvas.focused]
			: canvas.selectedNodes
		if (targets.length === 0) return undefined
		const nodes = targets.map((n) => canvas.getNode(n.path)).filter(Boolean)
		if (nodes.length === 0) return undefined
		const firstType = nodes[0]?.contentType
		return nodes.every((n) => n?.contentType === firstType) ? firstType : undefined
	}, [isMultiSelecting, canvas, canvas?.selectedNodes, canvas?.focused])

		return (
			<div  className="w-full h-full  border-l transition-transform  ">
				{
					isMultiSelecting && sameTypeSelection && PanelTypes[sameTypeSelection] ? <div className={cn("w-full h-full overflow-y-auto no-scrollbar", editorConfig.enable_panel_redesign && "max-h-[88vh]")} >
						<div className="p-4 pb-3 text-foreground font-semibold text-[15px] capitalize flex items-center justify-between gap-2">
							<span className="truncate">{camelToSentenceCase(sameTypeSelection)} {t('panel.propertiesSuffix')}</span>
							<DeviceScopeControl />
						</div>
						<div className="py-3 pt-1 px-[16px]">
							{PanelTypes[sameTypeSelection]}
						</div>
					</div> :
					isMultiSelecting ? <div className={cn("w-full h-full overflow-y-auto no-scrollbar", editorConfig.enable_panel_redesign && "max-h-[88vh]")} >
						<div className="p-4 pb-3 text-foreground font-semibold text-[15px] capitalize flex items-center justify-between gap-2">
							<span className="truncate">{t('panel.multipleElements')}</span>
							<DeviceScopeControl />
						</div>
						<div className="py-3 pt-1 px-[16px]">
							<MultiSelectPanel />
						</div>
					</div> :
					canvas?.focusedNode ? <div data-tour="property-panel-controls" className={cn("w-full h-full overflow-y-auto no-scrollbar", editorConfig.enable_panel_redesign && "max-h-[88vh]")} >
						{editorConfig.enable_panel_redesign ? (
							<div className="px-[16px]"><PanelHeader /></div>
						) : (
							<div className="p-4 pb-3 text-foreground font-semibold text-[15px] capitalize flex items-center justify-between gap-2">
								<span className="truncate">{camelToSentenceCase(canvas.focusedNode?.name?? canvas.focusedNode?.contentType)} {t('panel.propertiesSuffix')}</span>
								<div className="flex items-center gap-1.5 shrink-0">
									<NodeVisibilityToggle />
									<DeviceScopeControl />
								</div>
							</div>
						)}
						<div className={editorConfig.enable_panel_redesign ? "pb-6 px-[16px]" : "py-3 pt-1 px-[16px]"}>
							{PanelTypes[canvas.focusedNode?.contentType]}
							{/* {focusedNodeClassName && <ClassJsSection className={focusedNodeClassName} />} */}
						</div>
					</div> :
						<div className="h-full w-[400px] flex flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground px-6">
							<span>{t('panel.noElementSelected')}</span>
							<span className="text-xs">{t('panel.noElementSelectedHint')}</span>
							{editorConfig.enable_panel_empty_tips && (
								<div className="mt-4 w-full max-w-[300px] flex flex-col gap-2 text-left text-xs">
									{EMPTY_TIPS.map((key) => (
										<p key={key} className="rounded-md border border-border bg-muted/40 px-3 py-2">{t(`panel.tips.${key}`)}</p>
									))}
								</div>
							)}
						</div>
				}

			</div>
		);

}
export default PropertyPanel;

{
	/* <Tabs defaultValue='style' variant="block" className='w-full'>
  <div className='p-2'>
	<TabsList className='w-full'>
	  <TabsTrigger value='style' className='flex-1'>Style</TabsTrigger>
	  <TabsTrigger value='insert' className='flex-1'>Insert</TabsTrigger>
	</TabsList>
  </div>
  <div className='py-3 px-[15px]'>
	<TabsContent value='style'>
	  <SectionContainer hintKey="direction" label='Layout'>
		<Control label='Direction' />
	  </SectionContainer>
	</TabsContent>
	<TabsContent value='insert'></TabsContent>
  </div>
</Tabs> */
}

// <Tabs defaultValue='style' variant="block" className='w-full'>
//   <div className='p-2'>
//     <TabsList className='w-full'>
//       <TabsTrigger value='style' className='flex-1'>Style</TabsTrigger>
//       <TabsTrigger value='attributes' className='flex-1'>Attributes</TabsTrigger>
//     </TabsList>
//   </div>
//   <div className='w-full h-[calc(100vh-100px)] overflow-y-scroll'>
//     <TabsContent value='style'>
//       <div className='p-4 pb-3 font-semibold text-[15px] capitalize'>
//         {canvas.focusedNode.contentType} Properties
//       </div>
//       <div className='py-3 pt-1 px-[16px] overflow-auto no-scrollbar'>
//         {PanelTypes[canvas.focusedNode?.contentType]}
//       </div>
//     </TabsContent>
//   </div>
//   <TabsContent value='attributes'>

//   </TabsContent>
// </Tabs>
