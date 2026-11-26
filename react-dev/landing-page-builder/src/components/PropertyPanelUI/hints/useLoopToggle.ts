import { useEffect, useState } from 'react'

export function useLoopToggle(intervalMs = 1200) {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setOn((prev) => !prev), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return on
}

/** Cycles through 0..steps-1, for demos with more than two states (e.g. row/column/grid). */
export function useLoopStep(steps: number, intervalMs = 1200) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStep((prev) => (prev + 1) % steps), intervalMs)
    return () => clearInterval(id)
  }, [steps, intervalMs])

  return step
}
