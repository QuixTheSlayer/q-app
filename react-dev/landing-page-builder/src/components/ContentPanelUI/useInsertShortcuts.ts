import { useEffect, useRef, useState } from 'react'
import { INSERT_ARM_KEY, INSERT_SHORTCUTS } from './insertShortcuts'

const ARM_TIMEOUT_MS = 1500

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
}

/**
 * Press "/" to arm insert-mode, then a mapped letter/number to insert that
 * element. Resolving the actual insert (contentType/widgetType/action) is
 * left to the caller via onTrigger, since Insert.tsx owns the insert logic.
 */
export function useInsertShortcuts(onTrigger: (target: (typeof INSERT_SHORTCUTS)[string]) => void, disabled = false) {
  const [armed, setArmed] = useState(false)
  const armedRef = useRef(armed)
  armedRef.current = armed

  const onTriggerRef = useRef(onTrigger)
  onTriggerRef.current = onTrigger

  useEffect(() => {
    if (disabled) return

    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const disarm = () => {
      setArmed(false)
      clearTimeout(timeoutId)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return

      if (!armedRef.current) {
        if (event.key === INSERT_ARM_KEY) {
          event.preventDefault()
          setArmed(true)
          timeoutId = setTimeout(disarm, ARM_TIMEOUT_MS)
        }
        return
      }

      if (event.key === 'Escape') {
        disarm()
        return
      }

      const target = INSERT_SHORTCUTS[event.key.toLowerCase()]
      disarm()

      if (target) {
        event.preventDefault()
        onTriggerRef.current(target)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      clearTimeout(timeoutId)
    }
  }, [disabled])

  return armed
}
