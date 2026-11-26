import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEditor } from "@/context/EditorContext";
import CSSUtils from "@/utils/CSS.utils";
import { cn } from "@/libs/cn";

const MAX_FRAME_WIDTH = 220
const MAX_FRAME_HEIGHT = 130
const FALLBACK_WIDTH = 1304
const FALLBACK_HEIGHT = 700

function toPx(value: unknown, fallback: number) {
  const em = CSSUtils.extractEmValue(value as string | number)
  return Number.isFinite(em) ? em : fallback
}

export type HorizontalAnchor = 'left' | 'center' | 'right'
export type VerticalAnchor = 'top' | 'center' | 'bottom'

const H_ANCHORS: HorizontalAnchor[] = ['left', 'center', 'right']
const V_ANCHORS: VerticalAnchor[] = ['top', 'center', 'bottom']

/**
 * Miniature preview of where a fixed/absolute/sticky element will land.
 *
 * `left`/`top`/etc. resolve against the nearest positioned ancestor — for
 * `absolute`/`sticky` that's the node's real DOM parent on canvas, NOT the
 * full page/device width. Scaling against the device frame (as an earlier
 * version did) made the preview lie for any node whose parent is narrower
 * than the page — e.g. `left: 50%` inside a 300px card would draw as 50%
 * of a ~1300px page, landing nowhere near where the node actually renders.
 * So this measures the real rendered box of `[data-id]="parent"` (or the
 * `.judgify-editor` device frame itself for `fixed`, which truly is
 * relative to the viewport) via getBoundingClientRect and scales the
 * preview frame to that box's real aspect ratio.
 *
 * Also doubles as a 9-point anchor picker (Figma/Webflow-style) for
 * absolute/fixed — clicking a dot on the frame's edges/corners/center sets
 * the corresponding left/right/top/bottom (+ transform for a centered axis)
 * in one click, instead of hand-typing offsets from scratch.
 */
export default function PositionPreview({
  position,
  activeH,
  activeV,
  onPick,
}: {
  position: string
  activeH?: HorizontalAnchor
  activeV?: VerticalAnchor
  onPick?: (h: HorizontalAnchor, v: VerticalAnchor) => void
}) {
  const { t } = useTranslation('propertyPanel')
  const canvas = useEditor()
  const node = canvas?.focusedNode
  const focusedId = canvas?.focused?.id
  const parentId = canvas?.focusedParent?.id

  const [referenceSize, setReferenceSize] = useState<{ width: number; height: number }>()

  useEffect(() => {
    const measure = () => {
      const selector = position === 'fixed'
        ? '.judgify-editor'
        : parentId
          ? `[data-canvas-root] [data-id="${parentId}"]`
          : '[data-canvas-root]'
      const el = document.querySelector<HTMLElement>(selector)
      const rect = el?.getBoundingClientRect()
      if (rect && rect.width > 0 && rect.height > 0) {
        setReferenceSize({ width: rect.width, height: rect.height })
      }
    }
    measure()
    // Layout can still be settling (fonts, images, responsive width toggle) —
    // re-measure shortly after mount/prop-change instead of trusting the very
    // first paint.
    const id = window.setTimeout(measure, 150)
    return () => window.clearTimeout(id)
  }, [position, parentId, focusedId])

  const refWidth = referenceSize?.width ?? FALLBACK_WIDTH
  const refHeight = referenceSize?.height ?? FALLBACK_HEIGHT

  // Fit the real parent/viewport's aspect ratio inside the max preview box
  // instead of stretching it to a fixed 220x130 — a tall narrow parent and a
  // short wide one should look like a tall narrow box and a short wide box.
  const fitScale = Math.min(MAX_FRAME_WIDTH / refWidth, MAX_FRAME_HEIGHT / refHeight)
  const frameWidth = Math.max(60, refWidth * fitScale)
  const frameHeight = Math.max(40, refHeight * fitScale)
  const scale = fitScale

  const left = node?.style?.left
  const right = node?.style?.right
  const top = node?.style?.top
  const bottom = node?.style?.bottom

  const boxWidth = Math.max(20, Math.min(frameWidth * 0.6, toPx(node?.style?.width, frameWidth * 0.3) * scale))
  const boxHeight = Math.max(14, Math.min(frameHeight * 0.6, toPx(node?.style?.height, frameHeight * 0.25) * scale))

  const style: React.CSSProperties = { position: "absolute", width: boxWidth, height: boxHeight }

  if (activeH === 'center') style.left = frameWidth / 2 - boxWidth / 2
  else if (left !== undefined && left !== "unset") style.left = Math.min(toPx(left, 0) * scale, frameWidth - boxWidth)
  else if (right !== undefined && right !== "unset") style.right = Math.min(toPx(right, 0) * scale, frameWidth - boxWidth)
  else style.left = 4

  if (position === "sticky") {
    style.top = 4
  } else if (activeV === 'center') {
    style.top = frameHeight / 2 - boxHeight / 2
  } else if (top !== undefined && top !== "unset") {
    style.top = Math.min(toPx(top, 0) * scale, frameHeight - boxHeight)
  } else if (bottom !== undefined && bottom !== "unset") {
    style.bottom = Math.min(toPx(bottom, 0) * scale, frameHeight - boxHeight)
  } else {
    style.top = 4
  }

  const frameLabel = position === "fixed" ? t('positionPreview.deviceViewport') : position === "sticky" ? t('positionPreview.scrollsWithinParent') : t('positionPreview.parentContainer')

  const canPick = onPick && position !== 'sticky'

  const ANCHOR_LABEL: Record<HorizontalAnchor | VerticalAnchor, string> = {
    left: t('positionSection.alignLeft'),
    right: t('positionSection.alignRight'),
    top: t('positionSection.alignTop'),
    bottom: t('positionSection.alignBottom'),
    center: t('positionSection.alignCenter'),
  }

  return (
    <div className="w-full flex flex-col gap-1.5 py-1">
      <div
        style={{ width: frameWidth, height: frameHeight }}
        className="relative mx-auto rounded-md border border-dashed border-border bg-muted/40 overflow-hidden"
      >
        {position === "sticky" && (
          <div className="absolute inset-x-0 top-0 h-[3px] bg-primary/50" />
        )}
        <div
          style={style}
          className="rounded-sm border border-primary bg-primary/30 flex items-center justify-center pointer-events-none"
        >
          <span className="text-[9px] font-medium text-primary truncate px-0.5">{position}</span>
        </div>

        {canPick && V_ANCHORS.map((v) => H_ANCHORS.map((h) => {
          const isActive = activeH === h && activeV === v
          return (
            <button
              key={`${h}-${v}`}
              type="button"
              aria-label={`${ANCHOR_LABEL[h]} / ${ANCHOR_LABEL[v]}`}
              title={`${ANCHOR_LABEL[h]} · ${ANCHOR_LABEL[v]}`}
              onClick={() => onPick(h, v)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 size-2.5 rounded-full border cursor-pointer transition-colors",
                isActive
                  ? "bg-primary border-primary scale-125"
                  : "bg-background border-border hover:border-primary hover:bg-primary/30",
              )}
              style={{
                left: h === 'left' ? 4 : h === 'center' ? '50%' : frameWidth - 4,
                top: v === 'top' ? 4 : v === 'center' ? '50%' : frameHeight - 4,
              }}
            />
          )
        }))}
      </div>
      <div className="text-[10.5px] text-muted-foreground text-center">{frameLabel}</div>
    </div>
  )
}
