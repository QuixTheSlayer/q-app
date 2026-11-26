import { EffectTiming, getPreset, PresetFrame } from '@/consts/animationEffects'

export interface PreviewEffect extends EffectTiming {
  animation_type: string
  style?: Record<string, string | number>
  preset?: string
}

// Values handed to motion's initial/animate; typed loosely since motion accepts any animatable CSS value.
type Target = Record<string, string | number | (string | number)[]>

export const PREVIEW_BG = '#6366f1'
export const PREVIEW_TEXT = '#ffffff'
export const PREVIEW_SIZE = 48

const num = (value: string | number | undefined, fallback: number) => {
  const n = Number(value)
  return value === undefined || value === '' || !Number.isFinite(n) ? fallback : n
}

/** The stage is a plain pixel box, so em values (what the size/radius controllers store) become px at 16px/em. */
const toPx = (value: string | number | undefined, fallback: number) => {
  if (typeof value === 'number') return value
  const n = parseFloat(value ?? '')
  if (!Number.isFinite(n)) return fallback
  return /em$/.test(value ?? '') ? n * 16 : n
}

/** Where a style effect starts (the node at rest) and ends (the trigger state). Null for effects with no visual. */
export function styleEffectStates(effect: PreviewEffect): { rest: Target; active: Target } | null {
  const s = effect.style ?? {}
  switch (effect.animation_type) {
    case 'backgroundColor':
      return { rest: { backgroundColor: PREVIEW_BG }, active: { backgroundColor: String(s['background-color'] || PREVIEW_BG) } }
    case 'boxShadow': {
      const rest = '0px 0px 0px 0px rgba(0,0,0,0)'
      return { rest: { boxShadow: rest }, active: { boxShadow: String(s['box-shadow'] || rest) } }
    }
    case 'size':
      return {
        rest: { width: PREVIEW_SIZE, height: PREVIEW_SIZE },
        active: { width: toPx(s.width, PREVIEW_SIZE), height: toPx(s.height, PREVIEW_SIZE) },
      }
    case 'radius':
      return { rest: { borderRadius: 8 }, active: { borderRadius: toPx(s['border-top-left-radius'], 8) } }
    case 'rotate':
      return { rest: { rotate: 0 }, active: { rotate: num(s.rotate, 0) } }
    case 'move':
      return { rest: { x: 0, y: 0 }, active: { x: num(s.left, 0), y: num(s.top, 0) } }
    case 'zoom':
      return { rest: { scale: 1 }, active: { scale: 1 + num(s.zoom, 0) / 10 } }
    case 'opacity':
      return { rest: { opacity: 1 }, active: { opacity: num(s.opacity, 1) } }
    case 'scale':
      return { rest: { scale: 1 }, active: { scale: num(s.scale, 1) } }
    case 'translate':
      return { rest: { x: 0, y: 0 }, active: { x: num(s['translate-x'], 0), y: num(s['translate-y'], 0) } }
    case 'skew':
      return { rest: { skewX: 0, skewY: 0 }, active: { skewX: num(s['skew-x'], 0), skewY: num(s['skew-y'], 0) } }
    case 'blur':
      return { rest: { filter: 'blur(0px)' }, active: { filter: `blur(${num(s.blur, 0)}px)` } }
    case 'textColor':
      return { rest: { color: PREVIEW_TEXT }, active: { color: String(s.color || PREVIEW_TEXT) } }
    default:
      return null
  }
}

/** A preset as motion keyframe arrays (one value per frame) plus the frame times, 0..1. */
export function presetMotion(value: string | undefined): { initial: Target; animate: Target; times: number[] } | null {
  const preset = getPreset(value)
  if (!preset) return null

  const props: { key: string; pick: (f: PresetFrame) => string | number; used: boolean }[] = [
    { key: 'opacity', pick: (f) => f.opacity ?? 1, used: preset.frames.some((f) => f.opacity !== undefined) },
    { key: 'x', pick: (f) => f.x ?? 0, used: preset.frames.some((f) => f.x !== undefined) },
    { key: 'y', pick: (f) => f.y ?? 0, used: preset.frames.some((f) => f.y !== undefined) },
    { key: 'scale', pick: (f) => f.scale ?? 1, used: preset.frames.some((f) => f.scale !== undefined) },
    { key: 'rotate', pick: (f) => f.rotate ?? 0, used: preset.frames.some((f) => f.rotate !== undefined) },
    { key: 'skewX', pick: (f) => f.skewX ?? 0, used: preset.frames.some((f) => f.skewX !== undefined) },
    { key: 'filter', pick: (f) => `blur(${f.blur ?? 0}px)`, used: preset.frames.some((f) => f.blur !== undefined) },
  ]
  const initial: Target = {}
  const animate: Target = {}
  for (const p of props.filter((p) => p.used)) {
    animate[p.key] = preset.frames.map(p.pick)
    initial[p.key] = p.pick(preset.frames[0])
  }
  return { initial, animate, times: preset.frames.map((f) => f.at / 100) }
}
