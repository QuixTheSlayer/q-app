import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { RatingNode } from '@/types/node.type'
import { TextInput } from '@/components/ui/primitives/text-input'
import ColorPicker from '@/components/ui/ColorPicker'
import { LineClampControl } from '../Sections/relatedComponents/LineClampControl'
import { TypographyControl } from '../Sections/relatedComponents/TypographyControl'
import BackgroundPicker from '@/components/ui/BackgroundPicker'
import { isValidUrl } from '@/utils/isValidUrl'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { Checkbox } from '@/components/ui/primitives/checkbox'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { formatRatingSummary } from '@/utils/rating.utils'
import { useTranslation } from 'react-i18next'
import FoldList from '@/components/ui/FoldList'

import withSizeGridTab from './withSizeGridTab'
function RangeField({ label, value, min, max, step, onChange }: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <PanelRowContainer className=' w-full px-0 ' layoutType='col' label={label}>
      <div className='flex items-center gap-3 w-full'>
        <input
          type='range'
          className='flex-1 accent-primary'
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className='text-sm text-foreground w-12 text-right'>{value}</span>
      </div>
    </PanelRowContainer>
  )
}

function RatingPanel() {
  const { t } = useTranslation('propertyPanel')
  const canvas = useEditor()
  const node = canvas?.focusedNode as RatingNode

  if (node)
    return (
      <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

        <SectionContainer label={t('ratingPanel.rating')}>
          <RangeField
            label={t('ratingPanel.valueOfMaxStars', { maxStars: node.maxStars })}
            value={node.value}
            min={0}
            max={node.maxStars}
            step={0.1}
            onChange={(v) => canvas.updateNode((prevNode) => ({
              ...prevNode as RatingNode,
              value: v,
            }))}
          />

          <PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('ratingPanel.maxStars')}>
            <NumberField
              aria-label={t('ratingPanel.maxStars')}
              minValue={1}
              maxValue={10}
              value={node.maxStars ?? 5}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as RatingNode,
                maxStars: v,
                value: Math.min((prevNode as RatingNode).value, v),
              }))}
            >
              <NumberFieldInput size='sm' hideStepper />
            </NumberField>
          </PanelRowContainer>

          <RangeField
            label={t('ratingPanel.reviewCount')}
            value={node.reviewCount}
            min={0}
            max={100000}
            step={1}
            onChange={(v) => canvas.updateNode((prevNode) => ({
              ...prevNode as RatingNode,
              reviewCount: v,
            }))}
          />
        </SectionContainer>

        <SectionContainer hintKey="colorPair" label={t('ratingPanel.stars')}>
          <PanelRowContainer className=' w-full px-0 ' layoutType='col' hintKey="colorPair" label={t('ratingPanel.filledColor')}>
            <ColorPicker
              value={node.filledColor || '#c8850f'}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as RatingNode,
                filledColor: v,
              }))}
            />
          </PanelRowContainer>
          <PanelRowContainer className=' w-full px-0 ' layoutType='col' hintKey="colorPair" label={t('ratingPanel.emptyColor')}>
            <ColorPicker
              value={node.emptyColor || '#d9d9d9'}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as RatingNode,
                emptyColor: v,
              }))}
            />
          </PanelRowContainer>
          <PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('ratingPanel.starSizePx')}>
            <NumberField
              aria-label={t('ratingPanel.starSize')}
              minValue={8}
              maxValue={128}
              value={node.starSize ?? 24}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as RatingNode,
                starSize: v,
              }))}
            >
              <NumberFieldInput size='sm' hideStepper />
            </NumberField>
          </PanelRowContainer>
          <PanelRowContainer className=' w-full px-0 ' layoutType='col' hintKey="gap" label={t('ratingPanel.starGapPx')}>
            <NumberField
              aria-label={t('ratingPanel.starGap')}
              minValue={0}
              maxValue={64}
              value={node.starGap ?? 4}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as RatingNode,
                starGap: v,
              }))}
            >
              <NumberFieldInput size='sm' hideStepper />
            </NumberField>
          </PanelRowContainer>
        </SectionContainer>

        <SectionContainer label={t('ratingPanel.summaryText')}>
          <PanelRowContainer layoutType='row' className=' items-center gap-3 '>
            <Checkbox
              checked={node.showSummary ?? true}
              onCheckedChange={(checked) => canvas.updateNode((prevNode) => ({
                ...prevNode as RatingNode,
                showSummary: checked === true,
              }))}
            />
            <span className='text-sm text-foreground'>{t('ratingPanel.showSummaryLineBelowStars')}</span>
          </PanelRowContainer>
          {node.showSummary && (
            <>
              <div className='text-xs text-muted-foreground px-0'>
                {t('ratingPanel.preview', { summary: formatRatingSummary(node) })}
              </div>
              <PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('ratingPanel.customTextOverridesAutoGenerated')}>
                <TextInput
                  size='sm'
                  value={node.customSummaryText ?? ''}
                  placeholder={t('ratingPanel.leaveBlankToAutoGenerate')}
                  onChange={(e) => canvas.updateNode((prevNode) => ({
                    ...prevNode as RatingNode,
                    customSummaryText: e.target.value || undefined,
                  }))}
                />
              </PanelRowContainer>
              <LineClampControl field="customSummaryText" label={t('ratingPanel.customTextOverridesAutoGenerated')} />
            </>
          )}
        </SectionContainer>

        {node.showSummary && (
          <FoldList label={t('ratingPanel.typography')}>
            <TypographyControl
              label={t('ratingPanel.summaryColor')}
              value={node.summaryStyle}
              defaultValue={{ fontSize: '14px', fontWeight: '400', color: '#4a4a4a' }}
              onChange={(next) => canvas.updateNode((prevNode) => ({
                ...prevNode as RatingNode,
                summaryStyle: next,
              }))}
            />
          </FoldList>
        )}


        <SectionContainer hintKey="styleGroup" label={t('ratingPanel.style')}>
          <PanelRowContainer layoutType="col" hintKey="backgroundColor" label={t('ratingPanel.background')}>
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

export default withSizeGridTab(RatingPanel)
