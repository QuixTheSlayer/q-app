import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { TestimonialSliderNode } from '@/types/node.type'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { Checkbox } from '@/components/ui/primitives/checkbox'
import { generateNewNode } from '@/utils/canvas.utils'
import { CirclePlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import BackgroundPicker from '@/components/ui/BackgroundPicker'
import { isValidUrl } from '@/utils/isValidUrl'

import withSizeGridTab from './withSizeGridTab'
function TestimonialSlider() {

  const { t } = useTranslation('propertyPanel')
  const canvas = useEditor()
  const node = canvas?.focusedNode as TestimonialSliderNode

  function addSlide() {
    if (!canvas?.focused) return
    const slide = generateNewNode('block', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: "0.5em",
        paddingLeft: "0.5em",
        paddingRight: "0.5em",
        paddingTop: "0.5em",
        paddingBottom: "0.5em",
        height: "100%",
        minHeight: "4em",
        width: "100%",
        textAlign:"center",
        backgroundColor:"#f8f8f8"
      },
    })
    canvas.insertNode(slide, node.children?.length, canvas.focused.path)
  }

  if (node)
    return (
      <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

        <SectionContainer label={t('testimonialSliderPanel.slides')}>
          <PanelRowContainer layoutType='col'>
            <div className='text-xs text-muted-foreground pb-1'>
              {(node.children?.length ?? 0) === 1
                ? t('testimonialSliderPanel.slideCountSingular', { count: node.children?.length ?? 0 })
                : t('testimonialSliderPanel.slideCountPlural', { count: node.children?.length ?? 0 })}
            </div>
            <div
              onClick={addSlide}
              className=' gap-2 text-base flex text-center w-[100%] my-1 border-t-[1px] border-border text-muted-foreground h-[38px] justify-center items-center cursor-pointer '
            >
              <CirclePlusIcon size={24} />
              <span className='text-sm'>{t('testimonialSliderPanel.addSlide')}</span>
            </div>
          </PanelRowContainer>
        </SectionContainer>

        <SectionContainer label={t('testimonialSliderPanel.controls')}>
          <PanelRowContainer layoutType='row' className=' items-center gap-3 '>
            <Checkbox
              checked={node.autoPlay ?? false}
              onCheckedChange={(checked) => canvas.updateNode((prevNode) => ({
                ...prevNode as TestimonialSliderNode,
                autoPlay: checked === true,
              }))}
            />
            <span className='text-sm text-foreground'>{t('testimonialSliderPanel.autoplaySlides')}</span>
          </PanelRowContainer>
          <PanelRowContainer layoutType='row' className=' items-center gap-3 '>
            <Checkbox
              checked={node.showArrows ?? true}
              onCheckedChange={(checked) => canvas.updateNode((prevNode) => ({
                ...prevNode as TestimonialSliderNode,
                showArrows: checked === true,
              }))}
            />
            <span className='text-sm text-foreground'>{t('testimonialSliderPanel.showPrevNextArrows')}</span>
          </PanelRowContainer>
          <PanelRowContainer layoutType='row' className=' items-center gap-3 '>
            <Checkbox
              checked={node.showDots ?? true}
              onCheckedChange={(checked) => canvas.updateNode((prevNode) => ({
                ...prevNode as TestimonialSliderNode,
                showDots: checked === true,
              }))}
            />
            <span className='text-sm text-foreground'>{t('testimonialSliderPanel.showDotIndicators')}</span>
          </PanelRowContainer>
        </SectionContainer>


        <SectionContainer hintKey="styleGroup" label={t('testimonialSliderPanel.style')}>
          <PanelRowContainer layoutType="col" hintKey="backgroundColor" label={t('testimonialSliderPanel.background')}>
            <BackgroundPicker
              value={node.style?.backgroundColor || ''}
              onChange={(v) => canvas.updateNodeStyle(isValidUrl(v) ? { backgroundImage: `url("${v}")` } : { backgroundColor: v })}
            />
          </PanelRowContainer>
          <BorderController />
        </SectionContainer>

        <Attributes />
      </div>
    )
}

export default withSizeGridTab(TestimonialSlider)
