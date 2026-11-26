import { EditorContextType, useEditor } from '@/context/EditorContext'
import useKeyCombo from '@/hooks/useKeyCombo'
import { isMacOS } from '@/utils/platform.utils'
import editorConfig from '@/configs/editor.config'
import useGlobalInsertShortcuts from '@/hooks/useGlobalInsertShortcuts'
import { CanvasNode } from '@/types/node.type'

/**
 * Registers common keyboard shortcuts for canvas editing operations.
 * Supports copy, paste, duplicate, delete, select parent, undo, and redo.
 * Uses platform-aware modifier keys (Ctrl on Windows/Linux, Meta on macOS).
 * 
 * @param {EditorContextType} canvas - Canvas editor context exposing copy/paste/undo/redo operations
 */
function useCanvasKeyShortcut(canvas: EditorContextType | undefined) {

  useGlobalInsertShortcuts(canvas)

  useKeyCombo({
    key: 'c',
    ctrl: !isMacOS(),
    meta: isMacOS(),
  }, () => canvas?.copyContent(), !editorConfig.enable_copy_paste)

  useKeyCombo({
    key: 'v',
    ctrl: !isMacOS(),
    meta: isMacOS(),
  }, () => canvas?.pasteContent(), !editorConfig.enable_copy_paste)

  // Paste over: replace the focused node with the copied one.
  useKeyCombo({
    key: 'v',
    ctrl: !isMacOS(),
    meta: isMacOS(),
    shift: true,
  }, (event) => {
    event.preventDefault();
    event.stopPropagation();
    canvas?.replaceWithCopied()
  }, !editorConfig.enable_replace_action)

  useKeyCombo({
    key: 'd',
    ctrl: !isMacOS(),
    meta: isMacOS(),
  }, (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (editorConfig.enable_multi_select && canvas?.selectedNodes.length) {
      canvas.duplicateSelectedNodes()
    } else {
      canvas?.duplicateNode()
    }
  })

  useKeyCombo({
    key: 'backspace',
  }, (event) => {
    event.preventDefault();
    event.stopPropagation();
    if ((canvas?.content?.children as CanvasNode[]).length > 1 && canvas?.content?.children) {
      if (editorConfig.enable_multi_select && canvas?.selectedNodes.length) {
        canvas.deleteSelectedNodes()
      } else {

        canvas?.deleteNode()
      }
    }
  })

  useKeyCombo({
    key: 'delete',
  }, (event) => {
    event.preventDefault();
    event.stopPropagation();
    if ((canvas?.content?.children as CanvasNode[]).length > 1 && canvas?.content?.children) {
      if (editorConfig.enable_multi_select && canvas?.selectedNodes.length) {
        canvas.deleteSelectedNodes()
      } else {
        canvas?.deleteNode()
      }
    }
  })

  useKeyCombo({
    key: 'escape',
  }, (event) => {
    if (!editorConfig.enable_multi_select || !canvas?.selectedNodes.length) return
    event.preventDefault();
    event.stopPropagation();
    canvas.clearSelection()
  })

  useKeyCombo({
    key: 'ArrowUp',
    ctrl: !isMacOS(),
    meta: isMacOS(),
  }, (event) => {
    event.preventDefault();
    event.stopPropagation();
    canvas?.selectParent()
  }, !editorConfig.enable_select_parent_shortcut)

  // Arrow keys (no modifier) reorder the focused node among its siblings —
  // left/right for a row parent, up/down for a column or grid parent, so the
  // key visually points where the node moves. The root container is always a
  // vertical stack of sections regardless of its own flexDirection (sections
  // are full-width, so a "row" of them still renders as a column), so treat
  // it as column-like here rather than trusting its literal style.
  const isRootParent = canvas?.parentNode?.contentType === 'root'
  const isRowParent = !isRootParent && canvas?.parentNode?.style?.display === 'flex' && canvas?.parentNode?.style?.flexDirection !== 'column'
  const isColumnOrGridParent = isRootParent || canvas?.parentNode?.style?.display === 'grid' ||
    (canvas?.parentNode?.style?.display === 'flex' && canvas?.parentNode?.style?.flexDirection === 'column')

  useKeyCombo({ key: 'ArrowLeft' }, (event) => {
    event.preventDefault();
    event.stopPropagation();
    canvas?.reorderFocusedNode('earlier')
  }, !editorConfig.enable_arrow_key_reorder || !isRowParent)

  useKeyCombo({ key: 'ArrowRight' }, (event) => {
    event.preventDefault();
    event.stopPropagation();
    canvas?.reorderFocusedNode('later')
  }, !editorConfig.enable_arrow_key_reorder || !isRowParent)

  useKeyCombo({ key: 'ArrowUp' }, (event) => {
    event.preventDefault();
    event.stopPropagation();
    canvas?.reorderFocusedNode('earlier')
  }, !editorConfig.enable_arrow_key_reorder || !isColumnOrGridParent)

  useKeyCombo({ key: 'ArrowDown' }, (event) => {
    event.preventDefault();
    event.stopPropagation();
    canvas?.reorderFocusedNode('later')
  }, !editorConfig.enable_arrow_key_reorder || !isColumnOrGridParent)

  useKeyCombo({
    key: 'g',
    ctrl: !isMacOS(),
    meta: isMacOS(),
  }, (event) => {
    event.preventDefault();
    event.stopPropagation();
    canvas?.groupSelectedNodes()
  }, !editorConfig.enable_group_action)

  useKeyCombo({
    key: 's',
    ctrl: !isMacOS(),
    meta: isMacOS(),
    shift: true,
  }, (event) => {
    event.preventDefault();
    event.stopPropagation();
    canvas?.splitFocusedBlock()
  }, !editorConfig.enable_split_join_action)

  useKeyCombo({
    key: 'u',
    ctrl: !isMacOS(),
    meta: isMacOS(),
    shift: true,
  }, (event) => {
    event.preventDefault();
    event.stopPropagation();
    canvas?.joinFocusedBlock()
  }, !editorConfig.enable_split_join_action)

  useKeyCombo({
    key: 'z',
    ctrl: !isMacOS(),
    meta: isMacOS(),
  }, (event) => {
    canvas?.undo()
  }, !editorConfig.enable_undo_redo)

  useKeyCombo({
    key: 'z',
    ctrl: !isMacOS(),
    meta: isMacOS(),
    shift: true,
  }, (event) => {
    canvas?.redo()
  }, !editorConfig.enable_undo_redo)

}

export default useCanvasKeyShortcut