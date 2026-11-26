import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import LayoutSection from '@/components/PropertyPanelUI/Sections/LayoutSection'
import GridCellPositionSection from './GridCellPositionSection'
import Link from '@/components/PropertyPanelUI/Sections/Link'
import SizeSection from '@/components/PropertyPanelUI/Sections/SizeSection'
import StyleSection from '@/components/PropertyPanelUI/Sections/StyleSection'
import RotateSection from '@/components/PropertyPanelUI/Sections/RotateSection'
import React, { useState } from 'react'
import EffectSection from '../Sections/EffectSection'
import AnimationSection from '../Sections/AnimationSection'
import { TooltipProvider } from '@/components/ui/primitives/tooltip'
import { Dialog } from 'react-aria-components'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import editorConfig from '@/configs/editor.config'
import { useTranslation } from 'react-i18next'
import { Brush, LayoutGrid, Ruler, Sparkles } from 'lucide-react'
import { PanelShell } from '../kit/PanelShell'
import { PanelSection } from '../kit/PanelSection'
import { StyleSections } from '../kit/StyleSections'
type PropertyTabTYpe = "layout" | "sizeGrid" | "size" | "style" | "animation"
const tabData = {
  "layout": () => <LayoutSection />,
  "sizeGrid": () => <><SizeSection /><GridCellPositionSection /></>,
  // The page root isn't inside a grid, so it gets size controls only.
  "size": () => <SizeSection />,
  // RotateSection shows for blocks only (not the root or sections).
  "style": () => <><StyleSection /><RotateSection /></>,
  "animation": () => <AnimationSection />,
  // "attributes": () => <Attributes />,
  // "prototype": () => <LayoutSection />,
}
const tabType: PropertyTabTYpe[] = (["layout", "sizeGrid", "style", "animation"] as PropertyTabTYpe[]).filter((t) =>
  (t !== "animation" || editorConfig.enable_animation_section)
)
// Root: layout (incl. padding/margin), size, style - no animation or grid-cell placement.
const rootTabType: PropertyTabTYpe[] = ["layout", "size", "style"]

function LegacyContainerPanel({ variant }: { variant?: 'root' }) {
  const tabs = variant === 'root' ? rootTabType : tabType
  const { t } = useTranslation('propertyPanel')
  const tabLabels: Record<PropertyTabTYpe, string> = {
    layout: t('containerPanel.tabLayout'),
    sizeGrid: t('containerPanel.tabSizeGrid'),
    size: t('sizeSection.size'),
    style: t('containerPanel.tabStyle'),
    animation: t('containerPanel.tabAnimation'),
  }
  let [tab, setTab] = useState<PropertyTabTYpe>(tabs[0]);

  return (
    <TooltipProvider>
      <Dialog>
        <Tabs
          defaultValue={tabs[0]}
          value={tab}
          onValueChange={(v) =>
            setTab(v as PropertyTabTYpe)
          }
        >
          <TabsList className=' border-b w-[100%] overflow-x-auto overflow-y-hidden no-scrollbar flex-nowrap ' >
            {
              tabs.map((tabValue) => <TabsTrigger className='shrink-0' key={tabValue} value={tabValue}>
                {tabLabels[tabValue]}
              </TabsTrigger>
              )
            }

          </TabsList>

          <TabsContent className=' h-[85vh] max-h-[80vh] overflow-y-auto no-scrollbar  ' key={tab} value={tab} >
            {tabData[tab]()}
          </TabsContent>

        </Tabs>
      </Dialog>

     
    </TooltipProvider>
  )
}

/** Redesigned layout: Design / Actions / More tabs, collapsible sections. */
function RedesignedContainerPanel({ variant }: { variant?: 'root' }) {
  const { t } = useTranslation('propertyPanel')
  const isRoot = variant === 'root'
  const animation = !isRoot && editorConfig.enable_animation_section

  return (
    <TooltipProvider>
      <PanelShell
        design={<>
          <PanelSection title={t('layoutSection.layout')} icon={LayoutGrid}><LayoutSection /></PanelSection>
          <PanelSection title={t('sizeSection.size')} icon={Ruler} defaultOpen={false}>
            <SizeSection />
            {!isRoot && <GridCellPositionSection />}
          </PanelSection>
          <PanelSection title={t('styleSection.style')} icon={Brush} defaultOpen={false}>
            <StyleSection withAttributes={false} />
            {!isRoot && <RotateSection />}
          </PanelSection>
          <StyleSections />
        </>}
        actions={animation && <PanelSection title={t('animationSection.animation')} icon={Sparkles}><AnimationSection /></PanelSection>}
        more={<Attributes />}
      />
    </TooltipProvider>
  )
}

function ContainerPanel(props: { variant?: 'root' }) {
  return editorConfig.enable_panel_redesign ? <RedesignedContainerPanel {...props} /> : <LegacyContainerPanel {...props} />
}

export default ContainerPanel