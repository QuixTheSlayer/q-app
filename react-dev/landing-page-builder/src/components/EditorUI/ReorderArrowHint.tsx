import { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/libs/cn'
import { EditorContextType } from '@/context/EditorContext'
import { hasChildNode } from '@/utils/hasChildNode'
import editorConfig from '@/configs/editor.config'

interface Props {
  canvas?: EditorContextType
}

const arrowBaseClass = "pointer-events-none fixed z-[9999998] flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white shadow-m animate-pulse"

/**
 * Shows a small arrow badge on each side of the focused node that the
 * Left/Right/Up/Down reorder shortcuts (useCanvasKeyShortcut.ts) can move it
 * toward, so the key to press is visually obvious instead of memorized.
 *
 * Mounted once (in Canvas.tsx, next to the canvas RenderNode root) rather
 * than inside each of the ~30 node-render functions in Nodes.tsx — those
 * don't reliably establish a CSS positioning context (many nodes have their
 * own intentional position: absolute/fixed/sticky), so an inline absolute
 * overlay anchored to the node itself would be fragile. Instead this reads
 * the focused node's live DOM rect (matched via the data-id every node
 * wrapper already carries) and renders fixed-position arrows in a portal,
 * fully decoupled from the node's own layout/positioning.
 */
export function ReorderArrowHint({ canvas }: Props) {
  const focusedId = canvas?.focused?.id
  const [rect, setRect] = useState<DOMRect | null>(null)

  useLayoutEffect(() => {
    if (!focusedId) {
      setRect(null)
      return
    }

    const el = document.querySelector(`[data-id="${focusedId}"]`)
    if (!el) {
      setRect(null)
      return
    }

    // Nodes reposition via a framer-motion `layout="position"` animation
    // (reorder, insert/delete of a sibling, drag) which moves the element
    // frame-by-frame via transforms — no scroll/resize event fires for
    // that, so a rAF poll is the only reliable way to track it live.
    let frameId: number
    const updateRect = () => {
      setRect((prev) => {
        const next = el.getBoundingClientRect()
        if (prev && prev.top === next.top && prev.left === next.left && prev.width === next.width && prev.height === next.height) {
          return prev
        }
        return next
      })
      frameId = requestAnimationFrame(updateRect)
    }
    updateRect()

    return () => cancelAnimationFrame(frameId)
  }, [focusedId])

  if (!editorConfig.enable_arrow_key_reorder) return null
  if (!canvas?.focused || !rect) return null

  const parentNode = canvas.parentNode
  if (!parentNode) return null

  const pathSegments = canvas.focused.path.split('.').map(Number)
  const currentIndex = pathSegments[pathSegments.length - 1]
  const siblingCount = hasChildNode(parentNode) ? parentNode.children.length : 0

  const canMoveEarlier = currentIndex > 0
  const canMoveLater = currentIndex < siblingCount - 1
  if (!canMoveEarlier && !canMoveLater) return null

  const isRootParent = parentNode.contentType === 'root'
  const isRowParent = !isRootParent && parentNode.style?.display === 'flex' && parentNode.style?.flexDirection !== 'column'
  const isColumnOrGridParent = isRootParent || parentNode.style?.display === 'grid' ||
    (parentNode.style?.display === 'flex' && parentNode.style?.flexDirection === 'column')

  if (!isRowParent && !isColumnOrGridParent) return null

  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  return createPortal(
    <>
      {isRowParent && canMoveEarlier && (
        <div className={arrowBaseClass} style={{ top: centerY - 10, left: rect.left - 10 }}>
          <ArrowLeft size={12} />
        </div>
      )}
      {isRowParent && canMoveLater && (
        <div className={arrowBaseClass} style={{ top: centerY - 10, left: rect.right - 10 }}>
          <ArrowRight size={12} />
        </div>
      )}
      {isColumnOrGridParent && canMoveEarlier && (
        <div className={arrowBaseClass} style={{ top: rect.top - 10, left: centerX - 10 }}>
          <ArrowUp size={12} />
        </div>
      )}
      {isColumnOrGridParent && canMoveLater && (
        <div className={arrowBaseClass} style={{ top: rect.bottom - 10, left: centerX - 10 }}>
          <ArrowDown size={12} />
        </div>
      )}
    </>,
    document.body,
  )
}
