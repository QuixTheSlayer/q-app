import { useEditor } from '@/context/EditorContext'
import { AnimationEffectFieldName } from '@/types/otherTypes'

export interface EffectIndexes {
  animationIndex?: number
  triggerIndex?: number
  effectItemIndex?: number
}

/** The effect at the given indexes plus setters for its style values and its own fields (timing, preset...). */
export function useAnimationEffect({ animationIndex = 0, triggerIndex = 0, effectItemIndex = 0 }: EffectIndexes) {
  const canvas = useEditor()
  const effect = canvas.content?.animation?.[animationIndex]?.trigger_effect?.[triggerIndex]?.effects?.[effectItemIndex]
  const style = (effect?.style ?? {}) as Record<string, string | number>

  const setStyle = (propertyName: string, propertyValue: string | number) =>
    canvas.updateAnimationStyle({ propertyName, propertyValue, animationIndex, triggerIndex, effectItemIndex })

  const setStyles = (styles: Record<string, string | number>) =>
    canvas.updateAnimationStyles({ styles, animationIndex, triggerIndex, effectItemIndex })

  const setField = (fieldName: AnimationEffectFieldName, fieldValue: string | boolean | number) =>
    canvas.updateAnimationEffectField({ fieldName, fieldValue, animationIndex, triggerIndex, effectItemIndex })

  return { effect, style, setStyle, setStyles, setField }
}
