import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { getPreset, resolveTiming } from '@/consts/animationEffects'
import { EasingCurveEditor } from './EasingCurveEditor'
import { EffectPreview } from './EffectPreview'
import { PreviewEffect } from './effectMotion'
import { EffectIndexes, useAnimationEffect } from './useAnimationEffect'

/** One effect's live preview plus its duration, delay and easing (and repeat count for presets). */
export function EffectTimingEditor(props: EffectIndexes) {
  const { t } = useTranslation('propertyPanel')
  const { effect, setField } = useAnimationEffect(props)
  const [showEasing, setShowEasing] = useState(false)
  if (!effect) return null

  const { duration, delay, easing } = resolveTiming(effect)
  const isPreset = effect.animation_type === 'preset'
  const iterations = effect.iterations ?? getPreset(effect.preset)?.defaultIterations ?? 1

  const numberRow = (id: string, label: string, value: number, onChange: (v: number) => void, step = 50) => (
    <PanelRowContainer layoutType="row" label={label} >
      <NumberField
        id={id}
        aria-label={label}
        className={'col-span-1'}
        minValue={0}
        step={step}
        value={value}
        onChange={(v) => Number.isFinite(v) && onChange(v)}
      >
        <NumberFieldInput size="sm" hideStepper />
      </NumberField>
    </PanelRowContainer>
  )

  return (
    <SectionContainer hintKey="animationTiming" label={t('animationSection.timing')} >
      <div className=" flex w-full flex-col gap-2 px-2 " >
        <EffectPreview effect={effect as PreviewEffect} />
      </div>
      {numberRow('animationDuration', t('animationSection.durationMs'), duration, (v) => setField('duration', v))}
      {numberRow('animationDelay', t('animationSection.delayMs'), delay, (v) => setField('delay', v))}
      {isPreset && numberRow('animationIterations', t('animationSection.repeat'), iterations, (v) => setField('iterations', Math.round(v)), 1)}
      {isPreset && iterations === 0 && <p className=" px-2 text-xs text-muted-foreground " >{t('animationSection.repeatForever')}</p>}

      <PanelRowContainer layoutType="col" label={t('animationSection.easing')} hintKey="animationEasing" >
        <button
          type="button"
          onClick={() => setShowEasing((v) => !v)}
          aria-expanded={showEasing}
          className=" flex w-full items-center justify-between rounded-md border border-primary/40 px-2 py-1 text-[12px] text-foreground/80 hover:bg-primary/10 "
        >
          <span className=" truncate font-mono " >{easing}</span>
          {showEasing ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {showEasing && <EasingCurveEditor value={easing} duration={duration} onChange={(v) => setField('easing', v)} />}
      </PanelRowContainer>
    </SectionContainer>
  )
}
