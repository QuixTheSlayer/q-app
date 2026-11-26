import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

export interface TimelineEffect {
  /** Index in the trigger's effects[]; handed back to onCommit. */
  index: number
  label: string
  duration: number
  delay: number
}

interface AnimationTimelineProps {
  effects: TimelineEffect[]
  onCommit: (index: number, field: 'delay' | 'duration', value: number) => void
}

const VIEW_W = 300
const PAD_X = 4
const PLOT_W = VIEW_W - PAD_X * 2
const ROW_H = 24
const BAR_H = 16
const AXIS_H = 16
const HANDLE_W = 7
const SNAP_MS = 50
const MIN_DURATION = 50

const snap = (ms: number) => Math.round(ms / SNAP_MS) * SNAP_MS

type Drag = {
  index: number
  mode: 'move' | 'resize'
  startClientX: number
  startDelay: number
  startDuration: number
  /** Scale fixed for the whole drag so the bars don't rescale under the pointer. */
  scaleMs: number
  delay: number
  duration: number
}

/**
 * Every effect of a trigger as a bar on one time axis: drag a bar to change its delay, drag its right
 * edge to change its duration. The playhead sweeps the whole sequence in motion. Writes happen on release.
 */
export function AnimationTimeline({ effects, onCommit }: AnimationTimelineProps) {
  const { t } = useTranslation('propertyPanel')
  const svgRef = useRef<SVGSVGElement>(null)
  const [drag, setDrag] = useState<Drag | null>(null)

  const timeOf = (e: TimelineEffect) => (drag?.index === e.index ? { delay: drag.delay, duration: drag.duration } : { delay: e.delay, duration: e.duration })
  const endMs = Math.max(...effects.map((e) => timeOf(e).delay + timeOf(e).duration), 500)
  // Axis length: the sequence plus headroom, in whole 250ms steps, held steady while dragging.
  const scaleMs = drag?.scaleMs ?? Math.ceil((endMs * 1.3) / 250) * 250
  const x = (ms: number) => PAD_X + (ms / scaleMs) * PLOT_W

  const height = AXIS_H + effects.length * ROW_H + 4
  const tickStep = scaleMs > 4000 ? 1000 : scaleMs > 2000 ? 500 : 250
  const ticks = Array.from({ length: Math.floor(scaleMs / tickStep) + 1 }, (_, i) => i * tickStep)

  const start = (e: React.PointerEvent, effect: TimelineEffect, mode: Drag['mode']) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    e.stopPropagation()
    setDrag({
      index: effect.index,
      mode,
      startClientX: e.clientX,
      startDelay: effect.delay,
      startDuration: effect.duration,
      scaleMs,
      delay: effect.delay,
      duration: effect.duration,
    })
  }

  const move = (e: React.PointerEvent) => {
    if (!drag || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const msPerPx = drag.scaleMs / ((PLOT_W / VIEW_W) * rect.width)
    const deltaMs = (e.clientX - drag.startClientX) * msPerPx
    if (drag.mode === 'move') setDrag({ ...drag, delay: Math.max(0, snap(drag.startDelay + deltaMs)) })
    else setDrag({ ...drag, duration: Math.max(MIN_DURATION, snap(drag.startDuration + deltaMs)) })
  }

  const finish = () => {
    if (drag) {
      if (drag.mode === 'move' && drag.delay !== drag.startDelay) onCommit(drag.index, 'delay', drag.delay)
      if (drag.mode === 'resize' && drag.duration !== drag.startDuration) onCommit(drag.index, 'duration', drag.duration)
    }
    setDrag(null)
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${height}`}
      className=" w-full touch-none select-none rounded-md border border-primary/30 bg-muted/40 "
      role="img"
      aria-label={t('animationSection.timeline')}
      onPointerMove={move}
      onPointerUp={finish}
      onPointerCancel={finish}
    >
      {ticks.map((ms) => (
        <g key={ms}>
          <line x1={x(ms)} y1={AXIS_H - 3} x2={x(ms)} y2={height} className=" stroke-muted-foreground/25 " />
          <text x={x(ms) + 2} y={10} className=" fill-muted-foreground " fontSize={8}>{ms >= 1000 ? `${ms / 1000}s` : `${ms}ms`}</text>
        </g>
      ))}

      {effects.map((effect, row) => {
        const { delay, duration } = timeOf(effect)
        const hue = (effect.index * 67 + 235) % 360
        const top = AXIS_H + row * ROW_H + (ROW_H - BAR_H) / 2
        const barX = x(delay)
        const barW = Math.max(HANDLE_W + 2, x(delay + duration) - barX)
        return (
          <g key={effect.index}>
            {/* the wait before the effect starts */}
            {delay > 0 && <line x1={x(0)} y1={top + BAR_H / 2} x2={barX} y2={top + BAR_H / 2} stroke={`hsl(${hue} 70% 55%)`} strokeDasharray="2 2" opacity={0.7} />}
            <rect
              x={barX}
              y={top}
              width={barW}
              height={BAR_H}
              rx={4}
              fill={`hsl(${hue} 70% 55% / 0.85)`}
              className=" cursor-grab active:cursor-grabbing "
              onPointerDown={(e) => start(e, effect, 'move')}
            />
            <text x={barX + 5} y={top + 11} fontSize={9} fill="white" pointerEvents="none" style={{ textShadow: '0 0 2px rgba(0,0,0,.5)' }}>
              {`${effect.label}${delay > 0 ? ` +${delay}` : ''} · ${duration}ms`}
            </text>
            <rect
              x={barX + barW - HANDLE_W}
              y={top}
              width={HANDLE_W}
              height={BAR_H}
              rx={3}
              fill="white"
              opacity={0.55}
              className=" cursor-ew-resize "
              onPointerDown={(e) => start(e, effect, 'resize')}
            />
          </g>
        )
      })}

      <motion.rect
        key={`${scaleMs}-${endMs}`}
        x={x(0)}
        y={AXIS_H - 3}
        width={1.5}
        height={height - AXIS_H + 3}
        className=" fill-primary "
        initial={{ x: 0 }}
        animate={{ x: x(endMs) - x(0) }}
        transition={{ duration: endMs / 1000, ease: 'linear', repeat: Infinity, repeatDelay: 0.6 }}
        pointerEvents="none"
      />
    </svg>
  )
}
