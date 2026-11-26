/**
 * Shared data for the Animation section's timing/easing/preset features. useAnimationCss turns it into
 * real CSS; the property panel's motion/SVG editors read the same values, so the preview matches the page.
 */

export interface EffectTiming {
  /** ms */
  duration?: number
  /** ms */
  delay?: number
  /** A CSS timing keyword or `cubic-bezier(a,b,c,d)`. */
  easing?: string
  /** Presets only. 0 = infinite. */
  iterations?: number
}

export const DEFAULT_DURATION = 300
export const DEFAULT_DELAY = 0
export const DEFAULT_EASING = 'ease'

export type CubicBezier = [number, number, number, number]

export const EASING_PRESETS: { value: string; label: string; points: CubicBezier }[] = [
  { value: 'linear', label: 'Linear', points: [0, 0, 1, 1] },
  { value: 'ease', label: 'Ease', points: [0.25, 0.1, 0.25, 1] },
  { value: 'ease-in', label: 'Ease in', points: [0.42, 0, 1, 1] },
  { value: 'ease-out', label: 'Ease out', points: [0, 0, 0.58, 1] },
  { value: 'ease-in-out', label: 'Ease in-out', points: [0.42, 0, 0.58, 1] },
  { value: 'cubic-bezier(0.16,1,0.3,1)', label: 'Expo out', points: [0.16, 1, 0.3, 1] },
  { value: 'cubic-bezier(0.34,1.56,0.64,1)', label: 'Back out', points: [0.34, 1.56, 0.64, 1] },
  { value: 'cubic-bezier(0.68,-0.55,0.27,1.55)', label: 'Back in-out', points: [0.68, -0.55, 0.27, 1.55] },
]

const round = (n: number) => Math.round(n * 100) / 100

export function parseEasing(easing: string | undefined): CubicBezier {
  const preset = EASING_PRESETS.find((p) => p.value === (easing || DEFAULT_EASING))
  if (preset) return preset.points
  const nums = easing?.match(/cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/)?.slice(1).map(Number)
  if (nums && nums.length === 4 && nums.every(Number.isFinite)) return nums as CubicBezier
  return EASING_PRESETS[1].points
}

export function formatEasing(points: CubicBezier): string {
  const [x1, y1, x2, y2] = points.map(round)
  const value = `cubic-bezier(${x1},${y1},${x2},${y2})`
  return EASING_PRESETS.find((p) => p.value === value || p.points.every((v, i) => v === [x1, y1, x2, y2][i]))?.value ?? value
}

export const resolveTiming = (effect: EffectTiming) => ({
  duration: Math.max(0, effect.duration ?? DEFAULT_DURATION),
  delay: Math.max(0, effect.delay ?? DEFAULT_DELAY),
  easing: effect.easing || DEFAULT_EASING,
})

/** One keyframe of a preset; omitted values stay neutral. Shared by the CSS @keyframes and the motion preview. */
export interface PresetFrame {
  at: number
  opacity?: number
  x?: number
  y?: number
  scale?: number
  rotate?: number
  skewX?: number
  blur?: number
}

export interface AnimationPreset {
  value: string
  label: string
  group: 'entrance' | 'attention'
  /** Attention presets read best repeating; the editor starts them at this many iterations. */
  defaultIterations?: number
  frames: PresetFrame[]
}

const enter = (from: Omit<PresetFrame, 'at'>): PresetFrame[] => [{ at: 0, ...from }, { at: 100 }]

export const ANIMATION_PRESETS: AnimationPreset[] = [
  { value: 'fadeIn', label: 'Fade in', group: 'entrance', frames: enter({ opacity: 0 }) },
  { value: 'fadeUp', label: 'Fade up', group: 'entrance', frames: enter({ opacity: 0, y: 40 }) },
  { value: 'fadeDown', label: 'Fade down', group: 'entrance', frames: enter({ opacity: 0, y: -40 }) },
  { value: 'fadeLeft', label: 'Fade from left', group: 'entrance', frames: enter({ opacity: 0, x: -40 }) },
  { value: 'fadeRight', label: 'Fade from right', group: 'entrance', frames: enter({ opacity: 0, x: 40 }) },
  { value: 'zoomIn', label: 'Zoom in', group: 'entrance', frames: enter({ opacity: 0, scale: 0.6 }) },
  { value: 'zoomOut', label: 'Zoom out', group: 'entrance', frames: enter({ opacity: 0, scale: 1.4 }) },
  { value: 'rotateIn', label: 'Rotate in', group: 'entrance', frames: enter({ opacity: 0, rotate: -120, scale: 0.7 }) },
  { value: 'blurIn', label: 'Blur in', group: 'entrance', frames: enter({ opacity: 0, blur: 12 }) },
  { value: 'skewIn', label: 'Skew in', group: 'entrance', frames: enter({ opacity: 0, skewX: 25, x: -30 }) },
  {
    value: 'bounceIn', label: 'Bounce in', group: 'entrance',
    frames: [{ at: 0, opacity: 0, scale: 0.3 }, { at: 50, opacity: 1, scale: 1.08 }, { at: 70, scale: 0.94 }, { at: 100, scale: 1 }],
  },
  {
    value: 'pulse', label: 'Pulse', group: 'attention', defaultIterations: 0,
    frames: [{ at: 0, scale: 1 }, { at: 50, scale: 1.08 }, { at: 100, scale: 1 }],
  },
  {
    value: 'heartbeat', label: 'Heartbeat', group: 'attention', defaultIterations: 0,
    frames: [{ at: 0, scale: 1 }, { at: 14, scale: 1.15 }, { at: 28, scale: 1 }, { at: 42, scale: 1.15 }, { at: 70, scale: 1 }],
  },
  {
    value: 'bounce', label: 'Bounce', group: 'attention', defaultIterations: 0,
    frames: [{ at: 0, y: 0 }, { at: 30, y: -24 }, { at: 50, y: 0 }, { at: 65, y: -10 }, { at: 80, y: 0 }],
  },
  {
    value: 'float', label: 'Float', group: 'attention', defaultIterations: 0,
    frames: [{ at: 0, y: 0 }, { at: 50, y: -14 }, { at: 100, y: 0 }],
  },
  {
    value: 'shake', label: 'Shake', group: 'attention', defaultIterations: 1,
    frames: [{ at: 0, x: 0 }, { at: 15, x: -10 }, { at: 30, x: 9 }, { at: 45, x: -7 }, { at: 60, x: 5 }, { at: 75, x: -3 }, { at: 100, x: 0 }],
  },
  {
    value: 'wobble', label: 'Wobble', group: 'attention', defaultIterations: 1,
    frames: [{ at: 0, x: 0, rotate: 0 }, { at: 20, x: -24, rotate: -5 }, { at: 40, x: 18, rotate: 3 }, { at: 60, x: -12, rotate: -3 }, { at: 80, x: 6, rotate: 1 }, { at: 100, x: 0, rotate: 0 }],
  },
  {
    value: 'swing', label: 'Swing', group: 'attention', defaultIterations: 1,
    frames: [{ at: 0, rotate: 0 }, { at: 20, rotate: 15 }, { at: 40, rotate: -10 }, { at: 60, rotate: 5 }, { at: 80, rotate: -5 }, { at: 100, rotate: 0 }],
  },
  {
    value: 'rubberBand', label: 'Rubber band', group: 'attention', defaultIterations: 1,
    frames: [{ at: 0, scale: 1 }, { at: 30, scale: 1.25 }, { at: 40, scale: 0.75 }, { at: 50, scale: 1.15 }, { at: 65, scale: 0.95 }, { at: 75, scale: 1.05 }, { at: 100, scale: 1 }],
  },
  {
    value: 'spin', label: 'Spin', group: 'attention', defaultIterations: 1,
    frames: [{ at: 0, rotate: 0 }, { at: 100, rotate: 360 }],
  },
]

export const getPreset = (value: string | undefined) => ANIMATION_PRESETS.find((p) => p.value === value)

/** Style effects added on top of the original set; they only appear while enable_animation_timing is on. */
export const ENHANCED_EFFECT_TYPES = new Set(['opacity', 'scale', 'translate', 'skew', 'blur', 'textColor', 'preset'])

/** The CSS properties each style effect transitions, so each effect's own duration/delay/easing applies to just them. */
export const EFFECT_TRANSITION_PROPS: Record<string, string[]> = {
  backgroundColor: ['background-color'],
  boxShadow: ['box-shadow'],
  textShadow: ['text-shadow'],
  size: ['width', 'height', 'min-height'],
  radius: ['border-radius'],
  rotate: ['rotate'],
  move: ['left', 'top'],
  opacity: ['opacity'],
  scale: ['scale'],
  translate: ['translate'],
  skew: ['transform'],
  blur: ['filter'],
  textColor: ['color'],
}

export const presetKeyframesName = (value: string) => `lpb-${value}`

/** Builds the `@keyframes` block for a preset. Only properties the preset actually animates are written. */
export function presetKeyframesCss(preset: AnimationPreset): string {
  const used = (key: keyof PresetFrame) => preset.frames.some((f) => f[key] !== undefined)
  const hasTransform = (['x', 'y', 'scale', 'rotate', 'skewX'] as const).some(used)

  const frames = preset.frames.map((f) => {
    const decls: string[] = []
    if (used('opacity')) decls.push(`opacity:${f.opacity ?? 1}`)
    if (hasTransform) {
      decls.push(`transform:translate(${f.x ?? 0}px,${f.y ?? 0}px) scale(${f.scale ?? 1}) rotate(${f.rotate ?? 0}deg) skewX(${f.skewX ?? 0}deg)`)
    }
    if (used('blur')) decls.push(`filter:blur(${f.blur ?? 0}px)`)
    return `${f.at}%{${decls.join(';')}}`
  })
  return `@keyframes ${presetKeyframesName(preset.value)}{${frames.join('')}}`
}
