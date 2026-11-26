import { useTranslation } from 'react-i18next'
import { SectionContainer } from '@/components/PropertyPanelUI/ui'
import { animation_type } from '@/consts/propertyField.consts'
import { getPreset, resolveTiming } from '@/consts/animationEffects'
import { useEditor } from '@/context/EditorContext'
import { AnimationTimeline } from './AnimationTimeline'
import { EffectIndexes } from './useAnimationEffect'

// Prototype effects act on another node and have no duration/delay of their own here.
const PROTOTYPE_TYPES = new Set(['scrollTo', 'show', 'hide', 'toggle', 'slideIn', 'fadeIn', 'none'])

/** All of one trigger's timed effects on a single draggable timeline. */
export function TriggerTimeline({ animationIndex = 0, triggerIndex = 0 }: Pick<EffectIndexes, 'animationIndex' | 'triggerIndex'>) {
  const { t } = useTranslation('propertyPanel')
  const canvas = useEditor()
  const effects = canvas.content?.animation?.[animationIndex]?.trigger_effect?.[triggerIndex]?.effects ?? []

  const timed = effects
    .map((effect, index) => ({ effect, index }))
    .filter(({ effect }) => !PROTOTYPE_TYPES.has(effect.animation_type))
    .map(({ effect, index }) => ({
      index,
      label: effect.animation_type === 'preset'
        ? getPreset(effect.preset)?.label ?? 'Preset'
        : animation_type.find((item) => item.value === effect.animation_type)?.label ?? effect.animation_type,
      ...resolveTiming(effect),
    }))

  if (timed.length === 0) return null

  return (
    <SectionContainer hintKey="animationTiming" label={t('animationSection.timeline')} >
      <div className=" w-full px-2 " >
        <AnimationTimeline
          effects={timed}
          onCommit={(index, field, value) =>
            canvas.updateAnimationEffectField({ fieldName: field, fieldValue: value, animationIndex, triggerIndex, effectItemIndex: index })
          }
        />
        <p className=" pt-1 text-[11px] text-muted-foreground " >{t('animationSection.timelineHelp')}</p>
      </div>
    </SectionContainer>
  )
}
