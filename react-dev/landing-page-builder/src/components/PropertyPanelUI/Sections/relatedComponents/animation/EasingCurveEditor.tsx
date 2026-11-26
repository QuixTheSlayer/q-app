import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/libs/cn'
import { CubicBezier, EASING_PRESETS, formatEasing, parseEasing } from '@/consts/animationEffects'

// SVG space: x runs 0..1 across the plot, y -0.6..1.6 so overshooting curves (back/bounce) stay visible.
const VIEW_W = 200
const VIEW_H = 170
const PLOT_LEFT = 20
const PLOT_W = 160
const PLOT_TOP = 12
const PLOT_H = 140
const Y_MIN = -0.6
const Y_MAX = 1.6

const px = (x: number) => PLOT_LEFT + x * PLOT_W
const py = (y: number) => PLOT_TOP + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * PLOT_H

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

interface EasingCurveEditorProps {
  value: string | undefined
  /** ms, how long the dot below takes to cross. */
  duration: number
  onChange: (easing: string) => void
}

/** Drag the two handles to shape the cubic-bezier; the dot underneath moves with the curve you've made. */
export function EasingCurveEditor({ value, duration, onChange }: EasingCurveEditorProps) {
  const { t } = useTranslation('propertyPanel')
  const svgRef = useRef<SVGSVGElement>(null)
  // The curve being dragged; committed once on release so one drag is one undo step.
  const [draft, setDraft] = useState<CubicBezier | null>(null)
  const [dragging, setDragging] = useState<0 | 1 | null>(null)

  const points = draft ?? parseEasing(value)
  const [x1, y1, x2, y2] = points

  const toCurve = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect()
    const sx = ((clientX - rect.left) / rect.width) * VIEW_W
    const sy = ((clientY - rect.top) / rect.height) * VIEW_H
    return {
      x: clamp((sx - PLOT_LEFT) / PLOT_W, 0, 1),
      y: clamp(Y_MAX - ((sy - PLOT_TOP) / PLOT_H) * (Y_MAX - Y_MIN), Y_MIN, Y_MAX),
    }
  }

  const onMove = (e: React.PointerEvent) => {
    if (dragging === null) return
    const { x, y } = toCurve(e.clientX, e.clientY)
    setDraft(dragging === 0 ? [x, y, x2, y2] : [x1, y1, x, y])
  }

  const finish = () => {
    if (draft) onChange(formatEasing(draft))
    setDraft(null)
    setDragging(null)
  }

  const handle = (index: 0 | 1, hx: number, hy: number) => (
    <circle
      cx={px(hx)}
      cy={py(hy)}
      r={dragging === index ? 7 : 6}
      className=" cursor-grab fill-primary stroke-background active:cursor-grabbing "
      strokeWidth={2}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        setDragging(index)
      }}
    />
  )

  return (
    <div className=" flex w-full flex-col gap-2 " >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className=" w-full touch-none select-none rounded-md border border-primary/30 bg-muted/40 "
        role="img"
        aria-label={t('animationSection.easingCurve')}
        onPointerMove={onMove}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        {/* start/end levels and the straight (linear) reference */}
        <line x1={px(0)} y1={py(0)} x2={px(1)} y2={py(0)} className=" stroke-muted-foreground/40 " strokeDasharray="3 3" />
        <line x1={px(0)} y1={py(1)} x2={px(1)} y2={py(1)} className=" stroke-muted-foreground/40 " strokeDasharray="3 3" />
        <line x1={px(0)} y1={py(0)} x2={px(1)} y2={py(1)} className=" stroke-muted-foreground/30 " />

        <line x1={px(0)} y1={py(0)} x2={px(x1)} y2={py(y1)} className=" stroke-primary/60 " />
        <line x1={px(1)} y1={py(1)} x2={px(x2)} y2={py(y2)} className=" stroke-primary/60 " />
        <path
          d={`M ${px(0)} ${py(0)} C ${px(x1)} ${py(y1)}, ${px(x2)} ${py(y2)}, ${px(1)} ${py(1)}`}
          className=" fill-none stroke-primary "
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {handle(0, x1, y1)}
        {handle(1, x2, y2)}
      </svg>

      {/* the curve in motion: the dot crosses the track using exactly this easing */}
      <div className=" relative h-3 w-full rounded-full bg-muted/60 " >
        <motion.div
          key={points.join(',') + duration}
          className=" absolute top-0 h-3 w-3 rounded-full bg-primary "
          initial={{ left: '0%' }}
          animate={{ left: 'calc(100% - 0.75rem)' }}
          transition={{ duration: Math.max(duration, 100) / 1000, ease: points, repeat: Infinity, repeatDelay: 0.5, repeatType: 'loop' }}
        />
      </div>

      <p className=" text-center font-mono text-[11px] text-muted-foreground " >{formatEasing(points)}</p>

      <div className=" flex flex-wrap gap-1 " >
        {EASING_PRESETS.map((preset) => {
          const active = preset.value === formatEasing(points)
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value)}
              className={cn(
                ' rounded border px-2 py-0.5 text-[11px] ',
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-primary/40 text-foreground/80 hover:bg-primary/15'
              )}
            >
              {preset.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
