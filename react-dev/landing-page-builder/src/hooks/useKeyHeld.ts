import { useEffect, useState } from "react";

/**
 * Tracks whether a single modifier key is currently held down, for gestures
 * like "hold Alt + click to test a prototype interaction instead of
 * selecting the node." Unlike useKeyPress/useKeyCombo (one-shot keydown
 * matchers), this reflects held/released state across keydown+keyup, and
 * also releases on window blur so the flag can't get stuck true if the key
 * is released while focus is elsewhere (e.g. alt-tabbing away).
 *
 * @param {"Alt" | "Control" | "Meta" | "Shift"} key - The modifier to track
 * @param {boolean} [disabled=false] - When true, always reports false
 * @returns {boolean} Whether the key is currently held
 */
export default function useKeyHeld(key: "Alt" | "Control" | "Meta" | "Shift", disabled = false): boolean {
  const [held, setHeld] = useState(false)

  useEffect(() => {
    if (disabled) {
      setHeld(false)
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) setHeld(true)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === key) setHeld(false)
    }
    const onBlur = () => setHeld(false)

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("blur", onBlur)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("blur", onBlur)
    }
  }, [key, disabled])

  return held
}
