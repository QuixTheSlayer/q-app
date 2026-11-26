import {ToggleGroup, ToggleGroupItem} from '@/components/inputs/ToggleGroup';
import Attributes from '@/components/PropertyPanelUI/Sections/Attributes';
import Link from '@/components/PropertyPanelUI/Sections/Link';
import {PanelRowContainer, SectionContainer} from '@/components/PropertyPanelUI/ui'
import {border_mode, height_mode} from '@/consts/propertyField.consts';
import {useEditor} from '@/context/EditorContext';
import {ButtonNode} from '@/types/node.type';
import CSSUtils from '@/utils/CSS.utils';
import {TextInput} from '@/components/ui/primitives/text-input';
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import ColorPicker from '@/components/ui/ColorPicker';
import {Select, SelectOption} from '@/components/ui/Select';
import  {useMemo, useState} from 'react'
import {LuBold, LuItalic} from 'react-icons/lu';
import {PiTextUnderlineBold} from 'react-icons/pi';
import StyleSection from '../Sections/StyleSection';
import RotateSection from '../Sections/RotateSection';
import AnimationSection from '../Sections/AnimationSection';
import LayoutSection from '../Sections/LayoutSection';
import EffectSection from '../Sections/EffectSection';
import { PaddingController } from '../Sections/relatedComponents/PaddingController';

import { TooltipProvider } from '@/components/ui/primitives/tooltip'
import { Dialog } from 'react-aria-components'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SizeSection from '../Sections/SizeSection';
import GridCellPositionSection from './GridCellPositionSection';
import editorConfig from '@/configs/editor.config';
import { useTranslation } from 'react-i18next';

type PropertyTabTYpe =  "style" | "sizeGrid" | "animation"
const tabType: PropertyTabTYpe[] = (["style", "sizeGrid", "animation"] as PropertyTabTYpe[]).filter((t) =>
  t !== "animation" || editorConfig.enable_animation_section
)

function ButtonPanel () {
  const { t } = useTranslation('propertyPanel')
  const tabLabels: Record<PropertyTabTYpe, string> = {
    style: t('buttonPanel.tabStyle'),
    sizeGrid: t('buttonPanel.tabSizeGrid'),
    animation: t('buttonPanel.tabAnimation'),
  }
  const canvas = useEditor()
  const node = canvas?.focusedNode as ButtonNode
  // const {height, minHeight, maxHeight, width, minWidth, maxWidth} = node?.style || {}
  const nodeElement = useMemo(() => {
    const element = document.querySelector(`[data-id="${node?.id || ''}"]`)
    return element
  }, [node?.id])

  const textStyleValues = useMemo(() => {
    if(!node) return []
    return ['bold', 'italic', 'underline', 'bulletList'].filter(style => {
      if(style === 'bold') return node.style.fontWeight === 'bold';
      if(style === 'italic') return node.style.fontStyle === 'italic';
      if(style === 'underline') return node.style.textDecoration?.toString()?.includes('underline');
      return false;
    })
  }, [node])

  const tabData = {
  "style": () =>   <>
        {/* 1. CONTENT */}
        <SectionContainer label={t('buttonPanel.content')}>
          <PanelRowContainer layoutType='col' label={t('buttonPanel.label')} htmlFor='layout-padding'>
            <TextInput className='col-span-3' size='sm'
              value={node.children}
              onChange={(v) => {
                canvas.updateNode(node => ({
                  ...node as ButtonNode,
                  children: v.target.value
                }))
              }} />
          </PanelRowContainer>
        </SectionContainer>

        {/* 2. TYPOGRAPHY */}
        <SectionContainer hintKey="typographyGroup" label={t('buttonPanel.typography')}>
          <PanelRowContainer layoutType='col' hintKey="fontSize" label={t('buttonPanel.fontSize')}>
            <NumberField id='columns-number'
              aria-label={t('buttonPanel.columnsNumber')}
              minValue={0}
              className={'col-span-2'}
              value={CSSUtils.extractEmValue(node.style.fontSize) || 15}
              onChange={v => canvas.updateNodeStyle({fontSize: CSSUtils.setEmValue(v)})}
            >
              <NumberFieldInput size="sm" />
            </NumberField>
          </PanelRowContainer>

          <PanelRowContainer layoutType='col' hintKey="typographyGroup" label={t('buttonPanel.textStyle')}>
            <ToggleGroup type='multiple' size="sm" className='col-span-2'
              value={textStyleValues}
              onValueChange={v => {}}
            >
              <ToggleGroupItem value='bold' aria-label={t('buttonPanel.bold')} title={t('buttonPanel.bold')} onClick={() => {
                canvas.updateNodeStyle({fontWeight: textStyleValues.includes('bold') ? 'normal' : 'bold'})
              }}>
                <LuBold />
              </ToggleGroupItem>
              <ToggleGroupItem value='italic' aria-label={t('buttonPanel.italic')} title={t('buttonPanel.italic')}
                onClick={() => {
                  canvas.updateNodeStyle({fontStyle: textStyleValues.includes('italic') ? 'normal' : 'italic'})
                }}
              >
                <LuItalic />
              </ToggleGroupItem>
              <ToggleGroupItem value='underline' aria-label={t('buttonPanel.underline')} title={t('buttonPanel.underline')}
                onClick={() => {
                  canvas.updateNodeStyle({textDecoration: textStyleValues.includes('underline') ? 'none' : 'underline'})
                }}
              >
                <PiTextUnderlineBold />
              </ToggleGroupItem>
            </ToggleGroup>
          </PanelRowContainer>

          <PanelRowContainer layoutType='col' hintKey="colorPair" label={t('buttonPanel.color')}>
            <ColorPicker 
              value={node.style.color || '#000000'}
              onChange={v => {
                canvas.updateNodeStyle({color: v})
              }}
            />
          </PanelRowContainer>
        </SectionContainer>

        {/* 3. LAYOUT & ALIGNMENT */}
        <LayoutSection />

        {/* 4. SPACING */}
        <PaddingController />

        {/* 5. STYLING */}
        <StyleSection/>
        <RotateSection />

        {/* 6. EFFECTS */}
        {/* <EffectSection /> */}

        {/* 7. INTERACTION */}
        {/* <Link /> */}

        {/* 8. ATTRIBUTES (Always Last!) */}
        {/* <Attributes /> */}
      </>,
  "sizeGrid": () => <>
      <SizeSection />
      <GridCellPositionSection />
    </>,
  "animation": () => <AnimationSection />,
  // "prototype": () => <LayoutSection />,
}

   const [tab, setTab] = useState<PropertyTabTYpe>("style");

   if(node)
  return (
    <TooltipProvider>
      <Dialog>
        <Tabs
          defaultValue="style"
          value={tab}
          onValueChange={(v) =>
            setTab(v as PropertyTabTYpe)
          }
        >
          <TabsList className='border-b w-[90%] overflow-x-auto overflow-y-hidden no-scrollbar flex-nowrap'>
            {tabType.map((tabValue) => (
              <TabsTrigger className='shrink-0' key={tabValue} value={tabValue}>
                {tabLabels[tabValue]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent className='max-h-[85vh] overflow-y-auto no-scrollbar' key={tab} value={tab}>
            {tabData[tab]()}
          </TabsContent>

        </Tabs>
      </Dialog>
    </TooltipProvider>
  )
}

export default ButtonPanel