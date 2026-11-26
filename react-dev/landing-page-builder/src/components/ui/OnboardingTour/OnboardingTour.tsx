import { CSSProperties, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { cn } from '@/libs/cn'
import { Button } from '@/components/ui/primitives/button'
import { TourStep } from './tourSteps'
import { TOUR_VISUALS } from './tourVisuals'

const CARD_WIDTH = 320
const CARD_HEIGHT_ESTIMATE = 210
const GAP = 16
const VIEWPORT_MARGIN = 16
const SPOTLIGHT_PADDING = 8

export interface OnboardingTourProps {
  isOpen: boolean
  stepIndex: number
  steps: TourStep[]
  next: () => void
  back: () => void
  skip: () => void
}

/** Tracks the live viewport rect of the current step's target, re-measuring on resize/scroll and while the layout settles (panel folds, animations). */
function useTargetRect(selector: string | undefined, isOpen: boolean) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useLayoutEffect(() => {
    if (!isOpen || !selector) {
      setRect(null)
      return
    }

    const measure = () => {
      const el = document.querySelector(selector)
      setRect(el ? el.getBoundingClientRect() : null)
    }

    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    // Belt-and-suspenders for layout shifts this tour has no other way to
    // observe (panel fold/unfold transitions, canvas zoom changes).
    const interval = window.setInterval(measure, 300)

    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
      window.clearInterval(interval)
    }
  }, [selector, isOpen])

  return rect
}

function getCardStyle(rect: DOMRect | null, placement: TourStep['placement'], placementGap = 0): CSSProperties {
  if (!rect) {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }

  const gap = GAP + placementGap
  let top: number
  let left: number

  switch (placement) {
    case 'right':
      top = rect.top
      left = rect.right + gap
      break
    case 'left':
      top = rect.top
      left = rect.left - CARD_WIDTH - gap
      break
    case 'top':
      top = rect.top - CARD_HEIGHT_ESTIMATE - gap
      left = rect.left
      break
    case 'bottom':
    default:
      top = rect.bottom + gap
      left = rect.left
      break
  }

  const maxTop = window.innerHeight - CARD_HEIGHT_ESTIMATE - VIEWPORT_MARGIN
  const maxLeft = window.innerWidth - CARD_WIDTH - VIEWPORT_MARGIN
  top = Math.min(Math.max(top, VIEWPORT_MARGIN), Math.max(maxTop, VIEWPORT_MARGIN))
  left = Math.min(Math.max(left, VIEWPORT_MARGIN), Math.max(maxLeft, VIEWPORT_MARGIN))

  return { top, left }
}

function OnboardingTour({ isOpen, stepIndex, steps, next, back, skip }: OnboardingTourProps) {
  const { t } = useTranslation('tour')
  const step = steps[stepIndex]
  const rect = useTargetRect(step?.target, isOpen)

  if (!isOpen || !step) return null

  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1
  const spotlightRect = rect
    ? {
        top: rect.top - SPOTLIGHT_PADDING,
        left: rect.left - SPOTLIGHT_PADDING,
        width: rect.width + SPOTLIGHT_PADDING * 2,
        height: rect.height + SPOTLIGHT_PADDING * 2,
      }
    : null

  return (
    <div
      className="fixed inset-0 z-[999999999]"
      role="dialog"
      aria-modal="true"
      aria-label={t('ariaLabel')}
    >
      {/* Dimmed backdrop with a spotlight cutout around the target, via the box-shadow trick (a solid box whose shadow fills the rest of the viewport). */}
      <div
        className="absolute rounded-lg transition-all duration-300 ease-out"
        style={
          spotlightRect
            ? { ...spotlightRect, boxShadow: '0 0 0 9999px rgba(15, 15, 20, 0.72)' }
            : { top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 15, 20, 0.72)' }
        }
      />

      {spotlightRect && (
        <div
          className="absolute rounded-lg ring-2 ring-primary pointer-events-none transition-all duration-300 ease-out"
          style={spotlightRect}
        />
      )}

      <div
        className="absolute flex flex-col gap-3 rounded-xl border border-border bg-popover p-5 text-popover-foreground shadow-2xl"
        style={{ width: CARD_WIDTH, maxWidth: 'calc(100vw - 32px)', ...getCardStyle(rect, step.placement, step.placementGap) }}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-foreground leading-snug">{t(step.titleKey)}</h3>
          <button
            type="button"
            aria-label={t('close')}
            title={t('close')}
            onClick={skip}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-[13px] leading-relaxed text-muted-foreground">{t(step.descriptionKey)}</p>

        {step.visual && (() => {
          const Visual = TOUR_VISUALS[step.visual]
          return <Visual />
        })()}

        <div className="mt-1 text-[11px] text-muted-foreground">
          {t('stepCounter', { current: stepIndex + 1, total: steps.length })}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {steps.map((s, i) => (
              <span
                key={s.id}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === stepIndex ? 'w-4 bg-primary' : 'w-1.5 bg-border'
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {!isFirst && (
              <Button className=' text-black ' size="sm" variant="secondary" onClick={back}>
                {t('back')}
              </Button>
            )}
            <Button size="sm" variant="primary" onClick={next}>
              {isLast ? t('finish') : t('next')}
            </Button>
          </div>
        </div>

        {!isLast && (
          <button
            type="button"
            onClick={skip}
            className="self-center text-[12px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            {t('skip')}
          </button>
        )}
      </div>
    </div>
  )
}

export default OnboardingTour
