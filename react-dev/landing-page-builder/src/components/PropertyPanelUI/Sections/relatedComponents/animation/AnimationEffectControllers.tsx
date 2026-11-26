import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { PropertyHintKey } from '@/components/PropertyPanelUI/hints/registry'
import ColorPicker from '@/components/ui/ColorPicker'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { cn } from '@/libs/cn'
import { ANIMATION_PRESETS, getPreset } from '@/consts/animationEffects'
import { EffectIndexes, useAnimationEffect } from './useAnimationEffect'

interface SliderRowProps {
  label: string
  hintKey?: PropertyHintKey
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

/** A slider plus exact number field. The slider writes on release, so one drag is one undo step. */
function SliderRow({ label, hintKey, value, min, max, step, onChange }: SliderRowProps) {
  const [draft, setDraft] = useState<number | null>(null)
  const commit = () => {
    if (draft !== null) onChange(draft)
    setDraft(null)
  }
  return (
    <PanelRowContainer layoutType="col" label={label} hintKey={hintKey} >
      <div className=" flex w-full items-center gap-2 " >
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={draft ?? value}
          onChange={(e) => setDraft(Number(e.target.value))}
          onPointerUp={commit}
          onKeyUp={commit}
          onBlur={commit}
          className=" h-1.5 min-w-0 flex-1 cursor-pointer accent-primary "
        />
        <NumberField
          aria-label={label}
          className=" w-[76px] "
          step={step}
          value={draft ?? value}
          onChange={(v) => Number.isFinite(v) && onChange(v)}
        >
          <NumberFieldInput size="sm" hideStepper />
        </NumberField>
      </div>
    </PanelRowContainer>
  )
}

export function OpacityEffectController(props: EffectIndexes) {
  const { t } = useTranslation('propertyPanel')
  const { style, setStyle } = useAnimationEffect(props)
  return (
    <SectionContainer hintKey="opacity" label={t('animationSection.opacity')} >
      <SliderRow label={t('animationSection.opacity')} value={Number(style.opacity ?? 1)} min={0} max={1} step={0.05} onChange={(v) => setStyle('opacity', v)} />
    </SectionContainer>
  )
}

export function ScaleEffectController(props: EffectIndexes) {
  const { t } = useTranslation('propertyPanel')
  const { style, setStyle } = useAnimationEffect(props)
  return (
    <SectionContainer hintKey="scaleZoom" label={t('animationSection.scale')} >
      <SliderRow label={t('animationSection.scale')} value={Number(style.scale ?? 1)} min={0} max={3} step={0.05} onChange={(v) => setStyle('scale', v)} />
    </SectionContainer>
  )
}

export function SkewEffectController(props: EffectIndexes) {
  const { t } = useTranslation('propertyPanel')
  const { style, setStyle } = useAnimationEffect(props)
  return (
    <SectionContainer hintKey="skew" label={t('animationSection.skew')} >
      <SliderRow label={t('animationSection.skewX')} value={Number(style['skew-x'] ?? 0)} min={-45} max={45} step={1} onChange={(v) => setStyle('skew-x', v)} />
      <SliderRow label={t('animationSection.skewY')} value={Number(style['skew-y'] ?? 0)} min={-45} max={45} step={1} onChange={(v) => setStyle('skew-y', v)} />
    </SectionContainer>
  )
}

export function BlurEffectController(props: EffectIndexes) {
  const { t } = useTranslation('propertyPanel')
  const { style, setStyle } = useAnimationEffect(props)
  return (
    <SectionContainer hintKey="blur" label={t('animationSection.blur')} >
      <SliderRow label={t('animationSection.blurPx')} value={Number(style.blur ?? 0)} min={0} max={30} step={1} onChange={(v) => setStyle('blur', v)} />
    </SectionContainer>
  )
}

export function TextColorEffectController(props: EffectIndexes) {
  const { t } = useTranslation('propertyPanel')
  const { style, setStyle } = useAnimationEffect(props)
  return (
    <SectionContainer hintKey="textColor" label={t('animationSection.textColor')} >
      <PanelRowContainer layoutType="row" label={t('animationSection.color')} >
        <ColorPicker value={String(style.color || '#000000')} onChange={(v) => setStyle('color', v)} />
      </PanelRowContainer>
    </SectionContainer>
  )
}

const PAD_W = 200
const PAD_H = 120
/** The pad spans -RANGE..+RANGE px in both directions. */
const PAD_RANGE = 100

/** Translate: drag the dot on the pad to set the X/Y offset, or type exact values below. */
export function TranslateEffectController(props: EffectIndexes) {
  const { t } = useTranslation('propertyPanel')
  const { style, setStyle, setStyles } = useAnimationEffect(props)
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null)

  const x = draft?.x ?? Number(style['translate-x'] ?? 0)
  const y = draft?.y ?? Number(style['translate-y'] ?? 0)
  const clamp = (n: number) => Math.min(PAD_RANGE, Math.max(-PAD_RANGE, n))
  const cx = PAD_W / 2 + (clamp(x) / PAD_RANGE) * (PAD_W / 2 - 10)
  const cy = PAD_H / 2 + (clamp(y) / PAD_RANGE) * (PAD_H / 2 - 10)

  const fromPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const sx = ((e.clientX - rect.left) / rect.width) * PAD_W
    const sy = ((e.clientY - rect.top) / rect.height) * PAD_H
    return {
      x: Math.round(clamp(((sx - PAD_W / 2) / (PAD_W / 2 - 10)) * PAD_RANGE)),
      y: Math.round(clamp(((sy - PAD_H / 2) / (PAD_H / 2 - 10)) * PAD_RANGE)),
    }
  }

  const commit = () => {
    if (draft) setStyles({ 'translate-x': draft.x, 'translate-y': draft.y })
    setDraft(null)
  }

  return (
    <SectionContainer hintKey="positionOffset" label={t('animationSection.translate')} >
      <div className=" w-full px-2 " >
        <svg
          viewBox={`0 0 ${PAD_W} ${PAD_H}`}
          className=" w-full touch-none select-none rounded-md border border-primary/30 bg-muted/40 "
          role="img"
          aria-label={t('animationSection.translate')}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setDraft(fromPointer(e))
          }}
          onPointerMove={(e) => draft && setDraft(fromPointer(e))}
          onPointerUp={commit}
          onPointerCancel={commit}
        >
          <line x1={PAD_W / 2} y1={0} x2={PAD_W / 2} y2={PAD_H} className=" stroke-muted-foreground/30 " strokeDasharray="3 3" />
          <line x1={0} y1={PAD_H / 2} x2={PAD_W} y2={PAD_H / 2} className=" stroke-muted-foreground/30 " strokeDasharray="3 3" />
          <rect x={PAD_W / 2 - 8} y={PAD_H / 2 - 8} width={16} height={16} rx={3} className=" fill-none stroke-muted-foreground/60 " strokeDasharray="2 2" />
          <line x1={PAD_W / 2} y1={PAD_H / 2} x2={cx} y2={cy} className=" stroke-primary/60 " strokeWidth={2} />
          <rect x={cx - 8} y={cy - 8} width={16} height={16} rx={3} className=" cursor-grab fill-primary " />
        </svg>
      </div>
      <PanelRowContainer className="  " layoutType="row" hintKey="positionOffsetX" label={t('controllers.moveX')} >
        <NumberField aria-label="translateX" className={'col-span-1'} value={x} onChange={(v) => Number.isFinite(v) && setStyle('translate-x', v)}>
          <NumberFieldInput size="sm" hideStepper />
        </NumberField>
      </PanelRowContainer>
      <PanelRowContainer className="  " layoutType="row" hintKey="positionOffsetY" label={t('controllers.moveY')} >
        <NumberField aria-label="translateY" className={'col-span-1'} value={y} onChange={(v) => Number.isFinite(v) && setStyle('translate-y', v)}>
          <NumberFieldInput size="sm" hideStepper />
        </NumberField>
      </PanelRowContainer>
    </SectionContainer>
  )
}

export function PresetEffectController(props: EffectIndexes) {
  const { t } = useTranslation('propertyPanel')
  const { effect, setField } = useAnimationEffect(props)
  const selected = getPreset(effect?.preset)?.value

  const group = (value: 'entrance' | 'attention') => (
    <div className=" flex flex-col gap-1 " >
      <p className=" text-[11px] font-semibold uppercase tracking-wide text-muted-foreground " >{t(`animationSection.preset_${value}`)}</p>
      <div className=" grid grid-cols-2 gap-1 " >
        {ANIMATION_PRESETS.filter((p) => p.group === value).map((preset) => (
          <button
            key={preset.value}
            type="button"
            aria-pressed={selected === preset.value}
            onClick={() => setField('preset', preset.value)}
            className={cn(
              ' truncate rounded border px-2 py-1 text-left text-[12px] ',
              selected === preset.value ? 'border-primary bg-primary text-primary-foreground' : 'border-primary/40 text-foreground/80 hover:bg-primary/15'
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <SectionContainer hintKey="animationPreset" label={t('animationSection.preset')} >
      <div className=" flex w-full flex-col gap-3 px-2 " >
        {group('entrance')}
        {group('attention')}
      </div>
    </SectionContainer>
  )
}
