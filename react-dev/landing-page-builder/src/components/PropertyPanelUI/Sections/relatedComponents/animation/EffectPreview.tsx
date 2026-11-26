import { useState } from 'react'
import { motion } from 'motion/react'
import { RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getPreset, parseEasing, resolveTiming } from '@/consts/animationEffects'
import { PREVIEW_BG, PREVIEW_SIZE, PREVIEW_TEXT, PreviewEffect, presetMotion, styleEffectStates } from './effectMotion'

/**
 * Plays the effect on a sample box with motion, using the effect's own duration, delay and easing, so
 * what you see here is what the page does. Style effects go rest -> trigger state and back; presets
 * run their keyframes. The loop is only for the preview.
 */
export function EffectPreview({ effect }: { effect: PreviewEffect }) {
  const { t } = useTranslation('propertyPanel')
  const [run, setRun] = useState(0)
  const { duration, delay, easing } = resolveTiming(effect)
  const ease = parseEasing(easing)

  const isPreset = effect.animation_type === 'preset'
  const preset = isPreset ? presetMotion(effect.preset) : null
  const states = isPreset ? null : styleEffectStates(effect)
  if (!preset && !states) return null

  const iterations = effect.iterations ?? getPreset(effect.preset)?.defaultIterations ?? 1
  // A preview that finishes and stops can't be judged, so finite runs restart after a pause.
  const transition = preset
    ? { duration: duration / 1000, delay: delay / 1000, ease, times: preset.times, repeat: Infinity, repeatDelay: iterations === 0 ? 0 : 0.7 }
    : { duration: duration / 1000, delay: delay / 1000, ease, repeat: Infinity, repeatType: 'reverse' as const, repeatDelay: 0.5 }

  return (
    <div className=" relative flex h-[110px] w-full items-center justify-center overflow-hidden rounded-md border border-primary/30 bg-muted/40 " >
      <motion.div
        // Any change to the effect restarts the loop from its first frame.
        key={`${run}-${effect.animation_type}-${effect.preset}-${duration}-${delay}-${easing}-${iterations}-${JSON.stringify(effect.style)}`}
        initial={(preset?.initial ?? states!.rest) as never}
        animate={(preset?.animate ?? states!.active) as never}
        transition={transition as never}
        style={{
          width: PREVIEW_SIZE,
          height: PREVIEW_SIZE,
          borderRadius: 8,
          background: PREVIEW_BG,
          color: PREVIEW_TEXT,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Aa
      </motion.div>
      <button
        type="button"
        aria-label={t('animationSection.replay')}
        title={t('animationSection.replay')}
        onClick={() => setRun((n) => n + 1)}
        className=" absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-primary/20 hover:text-foreground "
      >
        <RotateCcw size={13} />
      </button>
    </div>
  )
}
