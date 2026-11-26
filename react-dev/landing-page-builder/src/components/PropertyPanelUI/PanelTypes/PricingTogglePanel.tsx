import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { PricingToggleNode } from '@/types/node.type'
import { restylePricingToggleChildren, setPricingToggleSlotText } from '@/utils/pricingToggleSlots'
import { TextInput } from '@/components/ui/primitives/text-input'
import ColorPicker from '@/components/ui/ColorPicker'
import { LineClampControl } from '../Sections/relatedComponents/LineClampControl'
import { TypographyControl } from '../Sections/relatedComponents/TypographyControl'
import FoldList from '@/components/ui/FoldList'
import BackgroundPicker from '@/components/ui/BackgroundPicker'
import { isValidUrl } from '@/utils/isValidUrl'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { useTranslation } from 'react-i18next'
import { UiTypeSelector } from '@/components/PropertyPanelUI/UiTypeSelector'

import withTemplateTabs from './withTemplateTabs'

/**
 * Tiny, static (no live node data, no interactivity) preview components for
 * each pricingToggle uiType — rendered inside UiTypeSelector's ~150x100 box.
 * Sample content is hardcoded here only, matching the real variant's visual
 * character from PricingToggleVisual.tsx as closely as possible.
 */
const sampleToggle = (
  <span className="relative w-10 h-5 rounded-full shrink-0 inline-block" style={{ backgroundColor: '#0f766e' }}>
    <span className="absolute top-[2px] right-[2px] w-4 h-4 rounded-full bg-white shadow" />
  </span>
)

function ClassicCardPreview() {
  return (
    <div className="flex flex-col w-[150px] rounded-lg overflow-hidden" style={{ border: '1px solid #d9d9d9' }}>
      <div className="flex flex-col items-center py-2.5 px-2 gap-0.5">
        <div className="text-[10px] text-[#2563eb]">Pro plan</div>
        <div className="text-[19px] font-semibold text-[#1a1a1a]">$29<span className="text-[10px] text-[#7a7a7a]">/mo</span></div>
        <span className="text-[8px] font-medium rounded-full px-1.5 py-0.5 mt-0.5" style={{ color: '#0f766e', backgroundColor: '#0f766e1a' }}>Save 20%</span>
      </div>
      <div className="flex w-full" style={{ borderTop: '1px solid #d9d9d9' }}>
        <div className="flex-1 py-1 text-center text-[9px] font-bold" style={{ backgroundColor: '#0f766e1a', color: '#0f766e' }}>Monthly</div>
        <div className="w-px self-stretch" style={{ backgroundColor: '#d9d9d9' }} />
        <div className="flex-1 py-1 text-center text-[9px] text-[#4a4a4a]">Yearly</div>
      </div>
    </div>
  )
}

function GradientHeroPreview() {
  return (
    <div
      className="flex flex-col w-[150px] rounded-xl py-3 px-2.5 gap-2.5"
      style={{ background: 'linear-gradient(135deg, #0f766e, #d9d9d9)' }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <div className="text-[8px] uppercase tracking-wide text-white/90">Pro plan</div>
        <div className="text-[18px] font-semibold text-white">$29<span className="text-[9px] text-white/80">/mo</span></div>
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <div className="relative w-full h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow" style={{ left: 0 }} />
        </div>
        <div className="flex items-center justify-between w-full">
          <span className="text-[8px] text-white">Monthly</span>
          {sampleToggle}
          <span className="text-[8px] text-white">Yearly</span>
        </div>
      </div>
    </div>
  )
}

function MinimalFlatPreview() {
  return (
    <div className="flex flex-col items-start w-[150px] gap-2">
      <div className="text-[11px] text-[#2563eb]">Pro plan</div>
      <div className="flex w-full items-stretch" style={{ borderBottom: '1px solid #d9d9d9' }}>
        <div className="flex flex-col items-center gap-1 pb-1 mr-3">
          <span className="text-[9px] font-bold" style={{ color: '#0f766e' }}>Monthly</span>
          <span className="h-[2px] w-full rounded-full" style={{ backgroundColor: '#0f766e' }} />
        </div>
        <div className="flex flex-col items-center gap-1 pb-1">
          <span className="text-[9px] text-[#4a4a4a]">Yearly</span>
          <span className="h-[2px] w-full rounded-full" style={{ backgroundColor: 'transparent' }} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[20px] font-semibold text-[#1a1a1a]">$29</span>
        <span className="text-[10px] text-[#7a7a7a]">/mo</span>
      </div>
    </div>
  )
}

function DarkGlassPreview() {
  return (
    <div
      className="flex flex-col items-center w-[150px] rounded-lg py-2.5 px-2.5 gap-2"
      style={{ backgroundColor: 'rgba(15,15,20,0.9)' }}
    >
      <div className="text-[10px] text-[#e5e7eb]">Pro plan</div>
      <div className="grid gap-1.5 w-full grid-cols-2">
        <div className="flex flex-col items-center rounded-md py-1.5 gap-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid #0f766e88', boxShadow: '0 0 14px -6px #0f766e88' }}>
          <span className="text-[7px] text-[#9ca3af]">Monthly</span>
          <span className="text-[12px] font-semibold text-white">$29</span>
        </div>
        <div className="flex flex-col items-center rounded-md py-1.5 gap-0.5" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
          <span className="text-[7px] text-[#9ca3af]">Yearly</span>
          <span className="text-[12px] font-semibold text-white">$290</span>
        </div>
      </div>
      {sampleToggle}
    </div>
  )
}

function BorderedPreview() {
  return (
    <div className="flex flex-col items-center w-[150px] gap-2 py-1">
      <span className="text-[9px] uppercase tracking-wide text-[#2563eb]">Pro plan</span>
      <div className="flex flex-col items-center justify-center rounded-full shrink-0" style={{ width: 62, height: 62, border: '3px solid #0f766e' }}>
        <span className="text-[13px] font-semibold text-[#1a1a1a] leading-tight">$29</span>
        <span className="text-[8px] text-[#7a7a7a]">/mo</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-full px-2 py-1" style={{ border: '1px solid #d9d9d9' }}>
        <span className="text-[8px] text-[#4a4a4a]">Monthly</span>
        {sampleToggle}
        <span className="text-[8px] text-[#4a4a4a]">Yearly</span>
      </div>
    </div>
  )
}

function SplitPreview() {
  return (
    <div className="flex w-[150px] items-stretch gap-2">
      <div className="flex flex-col justify-center gap-1 flex-1">
        <div className="text-[10px] text-[#2563eb]">Pro plan</div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-[#4a4a4a]">Mo</span>
          {sampleToggle}
          <span className="text-[9px] text-[#4a4a4a]">Yr</span>
        </div>
      </div>
      <div className="w-px self-stretch" style={{ backgroundColor: '#d9d9d9' }} />
      <div className="flex flex-col justify-center items-end flex-1">
        <div className="text-[18px] font-semibold text-[#1a1a1a]">$29</div>
        <span className="text-[9px] text-[#7a7a7a]">/mo</span>
      </div>
    </div>
  )
}

function RibbonPreview() {
  return (
    <div className="relative w-[150px] overflow-hidden rounded-md" style={{ border: '1px solid #d9d9d9' }}>
      <div
        className="absolute top-1.5 -right-6 rotate-45 px-6 text-[8px] font-semibold text-white"
        style={{ backgroundColor: '#0f766e' }}
      >
        Yearly
      </div>
      <div className="flex flex-col items-center py-3 px-2 gap-1">
        <div className="text-[10px] text-[#2563eb]">Pro plan</div>
        <div className="text-[18px] font-semibold text-[#1a1a1a]">$29<span className="text-[10px] text-[#7a7a7a]">/mo</span></div>
        {sampleToggle}
      </div>
    </div>
  )
}

function CompactRowPreview() {
  return (
    <div className="flex items-stretch w-[150px] rounded-md overflow-hidden" style={{ border: '1px solid #d9d9d9' }}>
      <div className="flex flex-col justify-center gap-1 px-2 py-2 flex-1">
        <span className="text-[9px] text-[#2563eb]">Pro plan</span>
        <span className="scale-75 origin-left">{sampleToggle}</span>
      </div>
      <div className="w-0" style={{ borderLeft: '2px dashed #d9d9d9' }} />
      <div className="flex items-center justify-center px-2.5" style={{ backgroundColor: '#0f766e0d' }}>
        <span className="text-[12px] font-semibold text-[#1a1a1a]">$29<span className="text-[8px] text-[#7a7a7a]">/mo</span></span>
      </div>
    </div>
  )
}

function WristbandPreview() {
  return (
    <div className="flex items-center w-[150px] justify-center p-2" style={{ backgroundColor: '#f3f8f6' }}>
      <div className="relative flex items-center w-full rounded-full px-2.5 py-2 gap-2" style={{ backgroundColor: '#0f766e14', border: '1px solid #0f766e' }}>
        <div className="absolute flex items-center justify-between" style={{ top: 3, left: 14, right: 14 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="rounded-full shrink-0" style={{ width: 2, height: 2, backgroundColor: '#0f766e', opacity: 0.5 }} />
          ))}
        </div>
        <div className="flex flex-col gap-0.5 flex-1">
          <span className="text-[8px] text-[#0f766e]">Pro plan</span>
          <span className="text-[11px] font-semibold text-[#1a1a1a]">$29<span className="text-[7px] text-[#7a7a7a]">/mo</span></span>
        </div>
        <span className="rounded-full shrink-0 px-1.5 py-0.5 text-[7px] font-semibold text-white" style={{ backgroundColor: '#0f766e' }}>Mo</span>
      </div>
    </div>
  )
}

function PricingTogglePanel() {
  const canvas = useEditor()
  const node = canvas?.focusedNode as PricingToggleNode
  const { t } = useTranslation('propertyPanel')

  const uiTypeOptions = [
    { value: 'classicCard', label: t('pricingTogglePanel.uiType.classicCard'), Preview: ClassicCardPreview },
    { value: 'gradientHero', label: t('pricingTogglePanel.uiType.gradientHero'), Preview: GradientHeroPreview },
    { value: 'minimalFlat', label: t('pricingTogglePanel.uiType.minimalFlat'), Preview: MinimalFlatPreview },
    { value: 'darkGlass', label: t('pricingTogglePanel.uiType.darkGlass'), Preview: DarkGlassPreview },
    { value: 'bordered', label: t('pricingTogglePanel.uiType.bordered'), Preview: BorderedPreview },
    { value: 'split', label: t('pricingTogglePanel.uiType.split'), Preview: SplitPreview },
    { value: 'ribbon', label: t('pricingTogglePanel.uiType.ribbon'), Preview: RibbonPreview },
    { value: 'compactRow', label: t('pricingTogglePanel.uiType.compactRow'), Preview: CompactRowPreview },
    { value: 'wristband', label: t('pricingTogglePanel.uiType.wristband'), Preview: WristbandPreview },
  ]

  if (node)
    return (
      <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

        <SectionContainer label={t('pricingTogglePanel.uiType.label')}>
          <UiTypeSelector
            options={uiTypeOptions}
            value={node.uiType}
            onChange={(v) => canvas.updateNode((prevNode) => {
              const n = prevNode as PricingToggleNode
              const uiType = v as NonNullable<PricingToggleNode['uiType']>
              return {
                ...n,
                uiType,
                ...(n.children ? { children: restylePricingToggleChildren(n.children, uiType, n.planNameStyle) } : {}),
              }
            })}
          />
        </SectionContainer>

        <FoldList label={t('pricingTogglePanel.content')}>

        <PanelRowContainer className=' px-0 ' layoutType='col' label={t('pricingTogglePanel.planName')}>
          <TextInput
            size='sm'
            value={node.planName}
            onChange={(e) => canvas.updateNode((prevNode) => {
              const n = prevNode as PricingToggleNode
              return {
                ...n,
                planName: e.target.value,
                ...(n.children ? { children: setPricingToggleSlotText(n.children, e.target.value) } : {}),
              }
            })}
          />
        </PanelRowContainer>

        <PanelRowContainer className=' px-0 ' layoutType='col' label={t('pricingTogglePanel.currencySymbol')}>
          <TextInput
            size='sm'
            value={node.currencySymbol}
            onChange={(e) => canvas.updateNode((prevNode) => ({
              ...prevNode as PricingToggleNode,
              currencySymbol: e.target.value,
            }))}
          />
        </PanelRowContainer>

        <PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('pricingTogglePanel.monthlyPrice')}>
          <NumberField
            aria-label={t('pricingTogglePanel.monthlyPrice')}
            minValue={0}
            value={node.monthlyPrice}
            onChange={(v) => canvas.updateNode((prevNode) => ({
              ...prevNode as PricingToggleNode,
              monthlyPrice: v,
            }))}
          >
            <NumberFieldInput size='sm' hideStepper />
          </NumberField>
        </PanelRowContainer>

        <PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('pricingTogglePanel.yearlyPrice')}>
          <NumberField
            aria-label={t('pricingTogglePanel.yearlyPrice')}
            minValue={0}
            value={node.yearlyPrice}
            onChange={(v) => canvas.updateNode((prevNode) => ({
              ...prevNode as PricingToggleNode,
              yearlyPrice: v,
            }))}
          >
            <NumberFieldInput size='sm' hideStepper />
          </NumberField>
        </PanelRowContainer>

        <PanelRowContainer className=' px-0 py-2 ' layoutType='col' label={t('pricingTogglePanel.defaultSelection')}>
          <div className='flex gap-1 h-[38px] w-full relative justify-start items-center'>
            <div
              onClick={() => canvas.updateNode((prevNode) => ({ ...prevNode as PricingToggleNode, defaultYearly: false }))}
              style={{ backgroundColor: !node.defaultYearly ? 'rgb(80 205 137 / 0.4)' : '' }}
              className='text-center cursor-pointer flex justify-center items-center text-sm border rounded-l-md w-1/2 h-full text-foreground'
            >
              {t('pricingTogglePanel.monthly')}
            </div>
            <div
              onClick={() => canvas.updateNode((prevNode) => ({ ...prevNode as PricingToggleNode, defaultYearly: true }))}
              style={{ backgroundColor: node.defaultYearly ? 'rgb(80 205 137 / 0.4)' : '' }}
              className='text-center cursor-pointer flex justify-center items-center text-sm border rounded-r-md w-1/2 h-full text-foreground'
            >
              {t('pricingTogglePanel.yearly')}
            </div>
          </div>
        </PanelRowContainer>

        <PanelRowContainer className=' px-0 ' layoutType='col' label={t('pricingTogglePanel.monthlyLabel')}>
          <TextInput
            size='sm'
            value={node.monthlyLabel}
            onChange={(e) => canvas.updateNode((prevNode) => ({
              ...prevNode as PricingToggleNode,
              monthlyLabel: e.target.value,
            }))}
          />
        </PanelRowContainer>

        <PanelRowContainer className=' px-0 ' layoutType='col' label={t('pricingTogglePanel.yearlyLabel')}>
          <TextInput
            size='sm'
            value={node.yearlyLabel}
            onChange={(e) => canvas.updateNode((prevNode) => ({
              ...prevNode as PricingToggleNode,
              yearlyLabel: e.target.value,
            }))}
          />
        </PanelRowContainer>

        </FoldList>

        <FoldList label={t('pricingTogglePanel.typography')}>
          <TypographyControl
            label={t('pricingTogglePanel.planName')}
            value={node.planNameStyle}
            defaultValue={{ fontSize: '14px', fontWeight: '400', color: '#2563eb' }}
            onChange={(next) => canvas.updateNode((prevNode) => ({
              ...prevNode as PricingToggleNode,
              planNameStyle: next,
            }))}
          />
          <TypographyControl
            label={t('pricingTogglePanel.priceLabel')}
            value={node.priceStyle}
            defaultValue={{ fontSize: '40px', fontWeight: '600', color: '#1a1a1a', fontFamily: 'serif' }}
            onChange={(next) => canvas.updateNode((prevNode) => ({
              ...prevNode as PricingToggleNode,
              priceStyle: next,
            }))}
          />
          <TypographyControl
            label={t('pricingTogglePanel.periodLabel')}
            value={node.periodStyle}
            defaultValue={{ fontSize: '16px', fontWeight: '400', color: '#7a7a7a' }}
            onChange={(next) => canvas.updateNode((prevNode) => ({
              ...prevNode as PricingToggleNode,
              periodStyle: next,
            }))}
          />
          <TypographyControl
            label={t('pricingTogglePanel.toggleLabelStyle')}
            value={node.labelStyle}
            defaultValue={{ fontSize: '14px', fontWeight: '400', color: '#4a4a4a' }}
            onChange={(next) => canvas.updateNode((prevNode) => ({
              ...prevNode as PricingToggleNode,
              labelStyle: next,
            }))}
          />
          <LineClampControl field="planName" label={t('pricingTogglePanel.planName')} />
          <LineClampControl field="monthlyLabel" label={t('pricingTogglePanel.monthlyLabel')} />
          <LineClampControl field="yearlyLabel" label={t('pricingTogglePanel.yearlyLabel')} />
        </FoldList>

        <FoldList label={t('pricingTogglePanel.colors')}>
          <SectionContainer hintKey="colorPair" label={t('pricingTogglePanel.appearance')}>
            <PanelRowContainer className=' w-full px-0 ' layoutType='col' hintKey="colorPair" label={t('pricingTogglePanel.switchActiveColor')}>
              <ColorPicker
                value={node.activeColor || '#0f766e'}
                onChange={(v) => canvas.updateNode((prevNode) => ({
                  ...prevNode as PricingToggleNode,
                  activeColor: v,
                }))}
              />
            </PanelRowContainer>
            <PanelRowContainer className=' w-full px-0 ' layoutType='col' hintKey="colorPair" label={t('pricingTogglePanel.switchInactiveColor')}>
              <ColorPicker
                value={node.inactiveColor || '#d9d9d9'}
                onChange={(v) => canvas.updateNode((prevNode) => ({
                  ...prevNode as PricingToggleNode,
                  inactiveColor: v,
                }))}
              />
            </PanelRowContainer>
          </SectionContainer>
        </FoldList>


        <SectionContainer hintKey="styleGroup" label={t('pricingTogglePanel.style')}>
          <PanelRowContainer layoutType="col" hintKey="backgroundColor" label={t('pricingTogglePanel.background')}>
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

export default withTemplateTabs(PricingTogglePanel)
