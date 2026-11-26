import { ContentType } from '@/types/node.type'
import { WidgetType } from '@/types/widget.type'

export const INSERT_ARM_KEY = '/'

type InsertTarget =
  | { kind: 'contentType'; value: ContentType }
  | { kind: 'widgetType'; value: WidgetType }
  | { kind: 'action'; value: 'openTableDialog' }

export const INSERT_SHORTCUTS: Record<string, InsertTarget> = {
  s: { kind: 'contentType', value: 'section' },
  b: { kind: 'contentType', value: 'block' },
  t: { kind: 'contentType', value: 'text' },
  i: { kind: 'contentType', value: 'image' },
  n: { kind: 'contentType', value: 'button' },
  a: { kind: 'action', value: 'openTableDialog' },

  c: { kind: 'contentType', value: 'iconBlock' },
  p: { kind: 'contentType', value: 'separators' },
  h: { kind: 'contentType', value: 'tab' },
  o: { kind: 'contentType', value: 'accordion' },
  d: { kind: 'contentType', value: 'countDown' },

  l: { kind: 'contentType', value: 'social' },
  g: { kind: 'contentType', value: 'googleMap' },
  y: { kind: 'contentType', value: 'youtube' },
  v: { kind: 'contentType', value: 'vimeo' },
  w: { kind: 'contentType', value: 'html' },

  r: { kind: 'contentType', value: 'imageSlider' },
  k: { kind: 'contentType', value: 'imageCarousel' },
  f: { kind: 'contentType', value: 'imageFlipFlop' },
  m: { kind: 'contentType', value: 'chart' },
  q: { kind: 'contentType', value: 'testimonialSlider' },
  u: { kind: 'contentType', value: 'progressBar' },
  j: { kind: 'contentType', value: 'counter' },
  x: { kind: 'contentType', value: 'rating' },
  z: { kind: 'contentType', value: 'timeline' },
  e: { kind: 'contentType', value: 'faq' },
  '0': { kind: 'contentType', value: 'pricingToggle' },

  '1': { kind: 'widgetType', value: 'submitEntryButton' },
  '2': { kind: 'widgetType', value: 'registerButton' },
  '3': { kind: 'widgetType', value: 'endDate' },
  '4': { kind: 'widgetType', value: 'endHour' },
  '5': { kind: 'widgetType', value: 'timeZone' },
}

const CONTENT_TYPE_TO_KEY = new Map<ContentType, string>()
const WIDGET_TYPE_TO_KEY = new Map<WidgetType, string>()
let tableDialogKey: string | undefined

for (const [key, target] of Object.entries(INSERT_SHORTCUTS)) {
  if (target.kind === 'contentType') CONTENT_TYPE_TO_KEY.set(target.value, key)
  else if (target.kind === 'widgetType') WIDGET_TYPE_TO_KEY.set(target.value, key)
  else if (target.value === 'openTableDialog') tableDialogKey = key
}

export function getShortcutForContentType(contentType: ContentType): string | undefined {
  return CONTENT_TYPE_TO_KEY.get(contentType)
}

export function getShortcutForWidgetType(widgetType: WidgetType): string | undefined {
  return WIDGET_TYPE_TO_KEY.get(widgetType)
}

export function getShortcutForTableDialog(): string | undefined {
  return tableDialogKey
}
