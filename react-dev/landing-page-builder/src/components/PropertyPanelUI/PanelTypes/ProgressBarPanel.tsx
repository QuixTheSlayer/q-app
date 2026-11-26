import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { ProgressBarNode } from '@/types/node.type'
import { restyleProgressBarChildren, setProgressBarSlotText } from '@/utils/progressBarSlots'
import { TextInput } from '@/components/ui/primitives/text-input'
import ColorPicker from '@/components/ui/ColorPicker'
import { LineClampControl } from '../Sections/relatedComponents/LineClampControl'
import { TypographyControl } from '../Sections/relatedComponents/TypographyControl'
import BackgroundPicker from '@/components/ui/BackgroundPicker'
import { isValidUrl } from '@/utils/isValidUrl'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { Checkbox } from '@/components/ui/primitives/checkbox'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { cn } from '@/libs/cn'
import { useTranslation } from 'react-i18next'
import { UiTypeSelector } from '@/components/PropertyPanelUI/UiTypeSelector'
import FoldList from '@/components/ui/FoldList'

const PRESET_COLORS = ['#0f766e', '#c8850f', '#dd4b26', '#1a1a1a']

import withTemplateTabs from './withTemplateTabs'

/* ---------------------------------------------------------------------- *
 * Tiny static previews for each uiType option, shown in the UiTypeSelector
 * grid. Hardcoded sample content only — no live node data — scaled to fit
 * the selector's ~150x100 preview box.
 * ---------------------------------------------------------------------- */

const previewLabel = { fontSize: 12, fontWeight: 600, color: '#1a1a1a' } as const
const previewPercent = { fontSize: 12, color: '#1a1a1a' } as const
const previewColor = '#0f766e'
const previewTrack = '#e5e0d8'

function ClassicBarPreview() {
  return (
    <div className="flex flex-col w-[150px] gap-1.5 text-left">
      <div className="flex items-center justify-between">
        <span style={previewLabel}>Progress</span>
        <span style={previewPercent}>72%</span>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: previewTrack }}>
        <div className="h-full rounded-full" style={{ width: '72%', backgroundColor: previewColor }} />
      </div>
    </div>
  )
}

function GradientFillPreview() {
  const markerSize = 16
  return (
    <div className="flex flex-col w-[150px] gap-1 text-left">
      <span style={previewLabel}>Progress</span>
      <div className="relative w-full pt-4" style={{ paddingLeft: markerSize / 2, paddingRight: markerSize / 2 }}>
        <div
          className="absolute flex items-center justify-center text-white font-semibold shrink-0"
          style={{
            left: `calc(72% * (100% - ${markerSize}px) / 100%)`,
            top: 0,
            minWidth: markerSize * 1.6,
            height: markerSize,
            padding: '0 4px',
            borderRadius: 5,
            backgroundColor: previewColor,
            transform: 'translateX(-50%)',
            fontSize: 9,
          }}
        >
          72%
        </div>
        <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: previewTrack }}>
          <div className="h-full rounded-full" style={{ width: '72%', background: `linear-gradient(90deg, ${previewTrack}, ${previewColor})` }} />
          {[25, 50, 75].map((tick) => (
            <div key={tick} className="absolute top-0 bottom-0 w-px" style={{ left: `${tick}%`, backgroundColor: 'rgba(255,255,255,0.5)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SteppedSegmentsPreview() {
  const filled = 7
  return (
    <div className="flex flex-col w-[150px] gap-1.5 text-left">
      <div className="flex items-center justify-between">
        <span style={previewLabel}>Progress</span>
        <span style={previewPercent}>72%</span>
      </div>
      <div className="w-full flex gap-1 h-2.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex-1 rounded-sm" style={{ backgroundColor: i < filled ? previewColor : previewTrack }} />
        ))}
      </div>
    </div>
  )
}

function CircularPreview() {
  const size = 60
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - 0.72)
  return (
    <div className="flex flex-col items-center w-[150px] gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={previewTrack} strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={previewColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={previewPercent}>72%</span>
        </div>
      </div>
    </div>
  )
}

function ThinLinePreview() {
  const dotSize = 12
  return (
    <div className="flex items-center w-[150px] gap-2 text-left">
      <span style={previewLabel}>Progress</span>
      <div className="relative flex-1 flex items-center" style={{ height: dotSize }}>
        <div className="w-full absolute left-0 right-0 h-[3px] rounded-full" style={{ backgroundColor: previewTrack }} />
        <div
          className="absolute rounded-full"
          style={{ left: `calc(72% - ${dotSize / 2}px)`, width: dotSize, height: dotSize, backgroundColor: previewColor, border: `2px solid ${previewTrack}` }}
        />
      </div>
      <span style={previewPercent}>72%</span>
    </div>
  )
}

function LabeledCardPreview() {
  return (
    <div className="grid w-[150px] gap-2 text-left rounded-lg border p-2" style={{ borderColor: previewTrack, gridTemplateColumns: '1fr 1fr' }}>
      <div className="flex flex-col justify-center gap-0.5 min-w-0">
        <span style={{ ...previewLabel, fontSize: 9, opacity: 0.7 }} className="uppercase tracking-wide truncate">Progress</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: previewColor }}>72%</span>
      </div>
      <div className="flex flex-col justify-end gap-1 min-w-0">
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: previewTrack }}>
          <div className="h-full rounded-full" style={{ width: '72%', backgroundColor: previewColor }} />
        </div>
        <span className="text-[9px] opacity-50">72 / 100</span>
      </div>
    </div>
  )
}

function StackedMultiPreview() {
  const shades = [previewColor, `${previewColor}cc`, `${previewColor}99`]
  const thirds = [100 / 3, 100 / 3, 72 - (200 / 3)]
  return (
    <div className="flex flex-col w-[150px] gap-1.5 text-left">
      <div className="flex items-center justify-between">
        <span style={previewLabel}>Progress</span>
        <span style={previewPercent}>72%</span>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden flex" style={{ backgroundColor: previewTrack }}>
        {thirds.map((v, i) => (
          <div key={i} style={{ width: `${v}%`, height: '100%', backgroundColor: shades[i] }} />
        ))}
      </div>
    </div>
  )
}

function RoundedGlowPreview() {
  const tubeWidth = 14
  const tubeHeight = 60
  const bulbSize = tubeWidth * 2.1
  return (
    <div className="flex items-end w-[150px] gap-3 text-left">
      <div className="relative shrink-0" style={{ width: bulbSize, height: tubeHeight + bulbSize / 2 }}>
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 overflow-hidden rounded-full flex flex-col justify-end"
          style={{ width: tubeWidth, height: tubeHeight, backgroundColor: previewTrack }}
        >
          <div style={{ width: '100%', height: '72%', backgroundColor: previewColor, boxShadow: `0 0 8px 1px ${previewColor}99` }} />
        </div>
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 rounded-full"
          style={{ width: bulbSize, height: bulbSize, backgroundColor: previewColor, boxShadow: `0 0 10px 2px ${previewColor}99` }}
        />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span style={{ fontSize: 18, fontWeight: 700, color: previewColor }}>72%</span>
        <span style={previewLabel} className="truncate">Progress</span>
      </div>
    </div>
  )
}

const uiTypeOptions: { value: NonNullable<ProgressBarNode['uiType']>; label: string; Preview: React.ComponentType }[] = [
  { value: 'classicBar', label: 'classicBar', Preview: ClassicBarPreview },
  { value: 'gradientFill', label: 'gradientFill', Preview: GradientFillPreview },
  { value: 'steppedSegments', label: 'steppedSegments', Preview: SteppedSegmentsPreview },
  { value: 'circular', label: 'circular', Preview: CircularPreview },
  { value: 'thinLine', label: 'thinLine', Preview: ThinLinePreview },
  { value: 'labeledCard', label: 'labeledCard', Preview: LabeledCardPreview },
  { value: 'stackedMulti', label: 'stackedMulti', Preview: StackedMultiPreview },
  { value: 'roundedGlow', label: 'roundedGlow', Preview: RoundedGlowPreview },
]
function RangeField({ label, value, min, max, step, onChange, suffix }: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  suffix?: string
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
        <span className='text-sm text-foreground w-12 text-right'>{value}{suffix}</span>
      </div>
    </PanelRowContainer>
  )
}

function ProgressBarPanel() {
  const canvas = useEditor()
  const node = canvas?.focusedNode as ProgressBarNode
  const { t } = useTranslation('propertyPanel')

  const uiTypeSelectorOptions = uiTypeOptions.map((option) => ({
    ...option,
    label: t(`progressBarPanel.uiType.${option.value}`),
  }))

  if (node)
    return (
      <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

        <SectionContainer label={t('progressBarPanel.uiType.label')}>
          <UiTypeSelector
            options={uiTypeSelectorOptions}
            value={node.uiType ?? 'classicBar'}
            onChange={(v) => canvas.updateNode((prevNode) => {
              const n = prevNode as ProgressBarNode
              const uiType = v as ProgressBarNode['uiType']
              return {
                ...n,
                uiType,
                ...(n.children ? { children: restyleProgressBarChildren(n.children, uiType, n.labelStyle) } : {}),
              }
            })}
          />
        </SectionContainer>

        <SectionContainer label={t('progressBarPanel.progress')}>
          <PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('progressBarPanel.label')}>
            <TextInput
              size='sm'
              value={node.label ?? ''}
              placeholder={t('progressBarPanel.labelPlaceholder')}
              onChange={(e) => canvas.updateNode((prevNode) => {
                const n = prevNode as ProgressBarNode
                return {
                  ...n,
                  label: e.target.value,
                  ...(n.children ? { children: setProgressBarSlotText(n.children, e.target.value) } : {}),
                }
              })}
            />
          </PanelRowContainer>

          <LineClampControl field="label" label={t('progressBarPanel.label')} />

          <RangeField
            label={t('progressBarPanel.value')}
            value={node.value ?? 0}
            min={0}
            max={100}
            step={1}
            suffix='%'
            onChange={(v) => canvas.updateNode((prevNode) => ({
              ...prevNode as ProgressBarNode,
              value: v,
            }))}
          />

          <PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('progressBarPanel.color')}>
            <div className='flex items-center gap-2'>
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type='button'
                  aria-label={t('progressBarPanel.useColor', { color: preset })}
                  onClick={() => canvas.updateNode((prevNode) => ({
                    ...prevNode as ProgressBarNode,
                    color: preset,
                  }))}
                  className={cn(
                    'size-6 rounded-full border-2 cursor-pointer',
                    node.color === preset ? 'border-foreground' : 'border-transparent',
                  )}
                  style={{ backgroundColor: preset }}
                />
              ))}
              <ColorPicker
                value={node.color || '#0f766e'}
                onChange={(v) => canvas.updateNode((prevNode) => ({
                  ...prevNode as ProgressBarNode,
                  color: v,
                }))}
              />
            </div>
          </PanelRowContainer>

          <PanelRowContainer className=' w-full px-0 ' layoutType='col' hintKey="backgroundColor" label={t('progressBarPanel.trackColor')}>
            <ColorPicker
              value={node.trackColor || '#e5e0d8'}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as ProgressBarNode,
                trackColor: v,
              }))}
            />
          </PanelRowContainer>

          <PanelRowContainer className=' w-full px-0 ' layoutType='col' hintKey="height" label={t('progressBarPanel.barHeight')}>
            <NumberField
              aria-label={t('progressBarPanel.barHeightAria')}
              minValue={2}
              maxValue={64}
              value={node.barHeight ?? 10}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as ProgressBarNode,
                barHeight: v,
              }))}
            >
              <NumberFieldInput size='sm' hideStepper />
            </NumberField>
          </PanelRowContainer>

          <PanelRowContainer className=' w-full px-0 ' layoutType='col' hintKey="borderRadius" label={t('progressBarPanel.barRadius')}>
            <NumberField
              aria-label={t('progressBarPanel.barRadiusAria')}
              minValue={0}
              maxValue={999}
              value={node.barRadius ?? 999}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as ProgressBarNode,
                barRadius: v,
              }))}
            >
              <NumberFieldInput size='sm' hideStepper />
            </NumberField>
          </PanelRowContainer>

          <PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('progressBarPanel.animationDuration')}>
            <NumberField
              aria-label={t('progressBarPanel.durationAria')}
              minValue={0.2}
              step={0.1}
              value={node.duration ?? 1.2}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as ProgressBarNode,
                duration: v,
              }))}
            >
              <NumberFieldInput size='sm' hideStepper />
            </NumberField>
          </PanelRowContainer>

          <PanelRowContainer layoutType='row' className=' items-center gap-3 '>
            <Checkbox
              checked={node.triggerOnView ?? true}
              onCheckedChange={(checked) => canvas.updateNode((prevNode) => ({
                ...prevNode as ProgressBarNode,
                triggerOnView: checked === true,
              }))}
            />
            <span className='text-sm text-foreground'>{t('progressBarPanel.animateFillWhenScrolledIntoView')}</span>
          </PanelRowContainer>
        </SectionContainer>

        <SectionContainer label={t('progressBarPanel.labels')}>
          <PanelRowContainer layoutType='row' className=' items-center gap-3 '>
            <Checkbox
              checked={node.showLabel ?? true}
              onCheckedChange={(checked) => canvas.updateNode((prevNode) => ({
                ...prevNode as ProgressBarNode,
                showLabel: checked === true,
              }))}
            />
            <span className='text-sm text-foreground'>{t('progressBarPanel.showLabel')}</span>
          </PanelRowContainer>
          <PanelRowContainer layoutType='row' className=' items-center gap-3 '>
            <Checkbox
              checked={node.showPercentage ?? true}
              onCheckedChange={(checked) => canvas.updateNode((prevNode) => ({
                ...prevNode as ProgressBarNode,
                showPercentage: checked === true,
              }))}
            />
            <span className='text-sm text-foreground'>{t('progressBarPanel.showPercentage')}</span>
          </PanelRowContainer>
        </SectionContainer>

        <FoldList label={t('progressBarPanel.typography')}>
          <TypographyControl
            label={t('progressBarPanel.label')}
            value={node.labelStyle}
            defaultValue={{ fontSize: '14px', fontWeight: '400', color: '#1a1a1a' }}
            onChange={(next) => canvas.updateNode((prevNode) => ({
              ...prevNode as ProgressBarNode,
              labelStyle: next,
            }))}
          />
          <TypographyControl
            label={t('progressBarPanel.percentageLabel')}
            value={node.percentageStyle}
            defaultValue={{ fontSize: '14px', fontWeight: '400', color: '#1a1a1a' }}
            onChange={(next) => canvas.updateNode((prevNode) => ({
              ...prevNode as ProgressBarNode,
              percentageStyle: next,
            }))}
          />
        </FoldList>


        <SectionContainer hintKey="styleGroup" label={t('progressBarPanel.style')}>
          <PanelRowContainer layoutType="col" hintKey="backgroundColor" label={t('progressBarPanel.background')}>
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

export default withTemplateTabs(ProgressBarPanel)
