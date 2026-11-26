import { useEffect } from 'react'
import { EditorContextType } from '@/context/EditorContext'
import editorConfig from '@/configs/editor.config'
import { generateNewNode, generateNewWidgetNode } from '@/utils/canvas.utils'
import { LayoutNode } from '@/types/node.type'
import { useInsertShortcuts } from '@/components/ContentPanelUI/useInsertShortcuts'
import { toast } from 'sonner'

export const INSERT_SHORTCUT_ARMED_EVENT = 'insert-shortcut-armed'

/**
 * Wires up the "/" + letter insert shortcuts (see insertShortcuts.ts) at the
 * canvas level so they work no matter which side panel is open, instead of
 * only while the Insert panel itself is mounted (useInsertShortcuts' keydown
 * listener used to live inside Insert.tsx, so switching to the Property
 * panel silently killed the shortcut). Mirrors Insert.tsx's own trigger
 * logic for content types/widgets/table so behavior stays identical; the
 * table case dispatches the same "open-table-dialog" event the drag-and-drop
 * path already uses, so Insert.tsx's dialog still opens on demand without
 * needing to be mounted for the shortcut to register.
 *
 * This is the only place that calls useInsertShortcuts (the actual keydown
 * listener) — Insert.tsx no longer calls it itself, since two independent
 * listeners would each fire onTrigger and double-insert. Insert.tsx instead
 * listens for INSERT_SHORTCUT_ARMED_EVENT to drive its shortcut badges.
 */
function useGlobalInsertShortcuts(canvas: EditorContextType | undefined) {
  const armed = useInsertShortcuts((target) => {
    if (!canvas) return

    if (target.kind === 'contentType' && target.value === 'section') {
      const focusedNode = canvas.focusedNode as LayoutNode
      if (!focusedNode) {
        canvas.insertSection(generateNewNode('section'))
        return
      }
      const focusedElement = document.querySelector(`[data-id="${focusedNode.id}"]`)
      const targetPath = focusedElement?.getAttribute('data-node-path')
      if (!targetPath) return
      const lastIdx = parseInt(targetPath.split('.')[1])
      const newSectionNode = generateNewNode('section')
      canvas.insertSection(newSectionNode, lastIdx + 1)
      canvas.focusNode({ id: focusedNode.id, path: targetPath })
    } else if (target.kind === 'contentType') {
      if (!canvas.focusedNode) {
        toast.warning(`There is no focused container component to insert ${target.value}.`)
        return
      }
      canvas.insertNode(generateNewNode(target.value))
    } else if (target.kind === 'widgetType') {
      canvas.insertNode(generateNewWidgetNode(target.value))
    } else if (target.value === 'openTableDialog') {
      if (canvas.focusedNode?.contentType === 'section') {
        toast.warning(`Cannot insert tabel into ${canvas.focusedNode.contentType}`)
        return
      }
      if (!canvas.focusedNode) {
        toast.warning('You have to focus block component to insert table.')
        return
      }
      window.dispatchEvent(new CustomEvent('open-table-dialog', { detail: { insertIndex: undefined } }))
    }
  }, !editorConfig.enable_insert_shortcuts)

  useEffect(() => {
    window.dispatchEvent(new CustomEvent<boolean>(INSERT_SHORTCUT_ARMED_EVENT, { detail: armed }))
  }, [armed])
}

export default useGlobalInsertShortcuts
