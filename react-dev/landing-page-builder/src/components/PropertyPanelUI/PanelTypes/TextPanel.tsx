import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import Typography from '@/components/PropertyPanelUI/Sections/Typography'
import LayoutSection from '@/components/PropertyPanelUI/Sections/LayoutSection'
import SizeSection from '@/components/PropertyPanelUI/Sections/SizeSection'
import StyleSection from '@/components/PropertyPanelUI/Sections/StyleSection'
import EffectSection from '@/components/PropertyPanelUI/Sections/EffectSection'
import {PanelRowContainer, SectionContainer} from '@/components/PropertyPanelUI/ui'
import {useEditor} from '@/context/EditorContext'
import {CanvasNode, TextNode} from '@/types/node.type'
import CSSUtils from '@/utils/CSS.utils'
import {Checkbox} from '@/components/ui/primitives/checkbox'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import withSizeGridTab from './withSizeGridTab'
import React from 'react'
import { useTranslation } from 'react-i18next'
import FoldList from '@/components/ui/FoldList'
import editorConfig from '@/configs/editor.config'
import { Brush, LayoutGrid, TextCursorInput, Type } from 'lucide-react'
import { PanelSection } from '../kit/PanelSection'

/** Collapsible section in the redesigned panel; a plain wrapper otherwise. */
function Sec({ title, icon, defaultOpen, children }: { title: string; icon: typeof Type; defaultOpen?: boolean; children: React.ReactNode }) {
  return editorConfig.enable_panel_redesign ? <PanelSection title={title} icon={icon} defaultOpen={defaultOpen}>{children}</PanelSection> : <>{children}</>
}

function TextPanel () {
  const canvas = useEditor()
  const { t } = useTranslation('propertyPanel')

  if(canvas)
    return (
      <div className='w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar'>

        {/* 1. TYPOGRAPHY SECTION */}
        <Sec title={t('typography.typography')} icon={Type}><Typography /></Sec>

        {/* 2. LAYOUT & ALIGNMENT */}
        <Sec title={t('layoutSection.layout')} icon={LayoutGrid} defaultOpen={false}><LayoutSection /></Sec>

        {/* 3. TEXT OPTIONS (Collapsible, Line Clamp) */}
        <Sec title={t('textPanel.collapsable')} icon={TextCursorInput} defaultOpen={false}>
        <SectionContainer hintKey="collapse" label={t('textPanel.collapsable')}>
          <div className='py-[6px]'>
            <Checkbox className='!size-5 !rounded-[0.3rem]'
              checked={(canvas.focusedNode as TextNode)?.collapsable}
              onCheckedChange={checked => {
                if(checked === true) {
                  canvas.updateNode((node) => {
                    if(node.contentType !== "text") return node;
                    const tempNode: TextNode = {
                      ...node,
                      collapsable: true,
                      style: {
                        ...node.style,
                        WebkitLineClamp: 2,
                      }
                    }
                    return tempNode
                  })
                } else {
                  canvas.updateNode((node) => {
                    if(node.contentType !== "text") return node;
                    const tempNode: TextNode = {
                      ...node,
                      collapsable: false,
                      style: {
                        ...node.style,
                        overflow: undefined,
                        display: undefined,
                        WebkitBoxOrient: undefined,
                        WebkitLineClamp: undefined,
                      }
                    }
                    return tempNode
                  })
                }
              }}
            >{t('textPanel.enable')}</Checkbox>
          </div>
          <PanelRowContainer layoutType='col' hintKey="lineClamp" label={t('textPanel.lineCount')}>
            <NumberField id='size-height'
              aria-label={t('textPanel.height')}
              minValue={0}
              className={'col-span-2'}
              isDisabled={!canvas.focusedNode?.style.WebkitLineClamp}
              value={Number(canvas.focusedNode?.style.WebkitLineClamp)}
              onChange={v => {
                canvas?.updateNodeStyle({
                  WebkitLineClamp: v
                })
              }}
            >
              <NumberFieldInput size="sm" hideStepper />
            </NumberField>
          </PanelRowContainer>
        </SectionContainer>
        </Sec>

        {/* 4. STYLING */}
        <Sec title={t('styleSection.style')} icon={Brush} defaultOpen={false}><StyleSection /></Sec>

        {/* 5. SIZE & RESPONSIVE */}
        {!editorConfig.enable_panel_redesign && <SizeSection />}

        {/* 6. EFFECTS */}
        {/* <EffectSection /> */}

        {/* 7. ATTRIBUTES (Always Last!) */}
        {/* <Attributes /> */}
      </div>
    )
}

export default withSizeGridTab(TextPanel, editorConfig.enable_panel_redesign ? SizeSection : undefined)