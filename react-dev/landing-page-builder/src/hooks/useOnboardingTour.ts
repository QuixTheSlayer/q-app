import { useCallback, useEffect, useState } from 'react'
import useLocalStorage from './useLocalStorage'
import editorConfig from '@/configs/editor.config'
import { TOUR_STEPS } from '@/components/ui/OnboardingTour/tourSteps'

/** Whether this browser has already dismissed/finished the onboarding tour once. */
export const ONBOARDING_TOUR_STORAGE_KEY = 'landing_page_builder_onboarding_tour_seen'

/**
 * Some tour steps spotlight something inside the Insert or Property panel,
 * which are mutually-exclusive local state in Canvas.tsx (not exposed via
 * EditorContext, since it's a UI-only concern, and Canvas.tsx — unlike
 * Editor.page.tsx, which sits above EditorContextProvider — is the one place
 * that actually has a live `canvas` context value). This mirrors the
 * existing INSERT_SHORTCUT_ARMED_EVENT broadcast pattern (see
 * useGlobalInsertShortcuts.ts) instead of plumbing panel state through
 * context: Canvas.tsx listens for this, switches panelType accordingly, and
 * (for the 'property' panel) auto-focuses the first node if nothing is
 * selected yet so there's a real control to spotlight.
 */
export const TOUR_PANEL_REQUEST_EVENT = 'onboarding-tour-panel-request'

/**
 * Drives the onboarding tour's open/step state. Auto-opens once per browser
 * (a short delay after `ready` so the editor's DOM targets exist to spotlight),
 * and exposes `start()` so a "?" help button can re-open it any time.
 */
function useOnboardingTour(ready: boolean) {
  const [hasSeenTour, setHasSeenTour] = useLocalStorage(ONBOARDING_TOUR_STORAGE_KEY, false)
  const [isOpen, setIsOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (!ready || !editorConfig.enable_onboarding_tour || hasSeenTour) return

    // Small delay so the canvas/panel toggles this tour spotlights have
    // actually mounted before the first step tries to measure them.
    const timer = setTimeout(() => {
      setStepIndex(0)
      setIsOpen(true)
    }, 700)
    return () => clearTimeout(timer)
    // Only re-run when `ready` flips true — re-checking `hasSeenTour` here
    // would re-open the tour the instant it closes and marks itself seen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  // Force the current step's required side panel open (see
  // TOUR_PANEL_REQUEST_EVENT's doc comment above) — Canvas.tsx owns the
  // actual panelType state and reacting to canvas.focusedNode, since it's
  // the one place with a real `canvas` context value.
  useEffect(() => {
    if (!isOpen) return
    const step = TOUR_STEPS[stepIndex]
    if (!step?.panel) return
    window.dispatchEvent(new CustomEvent(TOUR_PANEL_REQUEST_EVENT, { detail: step.panel }))
  }, [isOpen, stepIndex])

  const dismiss = useCallback(() => {
    setIsOpen(false)
    setHasSeenTour(true)
  }, [setHasSeenTour])

  const next = useCallback(() => {
    setStepIndex((current) => {
      if (current >= TOUR_STEPS.length - 1) {
        setIsOpen(false)
        setHasSeenTour(true)
        return current
      }
      return current + 1
    })
  }, [setHasSeenTour])

  const back = useCallback(() => {
    setStepIndex((current) => Math.max(0, current - 1))
  }, [])

  const start = useCallback(() => {
    setStepIndex(0)
    setIsOpen(true)
  }, [])

  return {
    isOpen,
    stepIndex,
    steps: TOUR_STEPS,
    next,
    back,
    skip: dismiss,
    start,
  }
}

export default useOnboardingTour
