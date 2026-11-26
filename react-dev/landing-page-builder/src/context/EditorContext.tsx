import React, { createContext, useState, Dispatch, SetStateAction, PropsWithChildren, useCallback, useContext, useRef, useMemo, CSSProperties, useEffect } from 'react';
import { AnimationGroup, CanvasNode, ContentNode, DeviceScope, LayoutNode } from '../types/node.type';
import { getEffectiveStyle } from '@/utils/responsive.utils';
import nodeUpdater from '@/utils/nodeUpdater';
import { CONTENT_TYPE, LAYOUT, NODE_TYPE } from '@/types/node.enum';
import { Editor } from '@tiptap/react'
import generateCryptoUID from '@/utils/generateCryptoUID';
import deepNodeDuplicate from '@/utils/deepNodeDuplicate';
import { clearClipBoard, createTextNode, writeTextNodeToClipBoard } from '@/utils/canvas.utils';
import { generateNewNode } from '@/utils/canvas.utils';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { hasChildNode } from '@/utils/hasChildNode';
import { isAdvancedWidget, isAllowedToInsert, isLayoutNode, isTabNode } from '@/utils/editor.utils';
import { editorQuery } from '@/store/query';
import { getIdFromUrl } from '@/utils/getIdFromUrl';
import { useAppDispatch } from '@/store';
import { CSS } from 'styled-components/dist/types';
import { AnimationEffectFieldName, TriggerModeType } from '@/types/otherTypes';
import editorConfig from '@/configs/editor.config';
import { companionStyles } from '@/utils/companionStyles';
import { isImportedPage } from '@/utils/pageScope';

export type Parent = {
  id: string
  path: string;
}

export type Focused = {
  id: string,
  path: string,
  ref?: HTMLElement
}

export type CanvasClipBoard = {
  node?: CanvasNode,
  // text?: string,
  // style?: CSSProperties
}
export interface EditorContextType {
  content: CanvasNode
  setContent: Dispatch<React.SetStateAction<CanvasNode>>
  focused: Focused | null
  focusedParent: Focused | null
  focusedNode: CanvasNode | null
  getNode: (path: string, content?: CanvasNode) => CanvasNode | null
  updateContent: (updater: (current: CanvasNode) => CanvasNode) => void
  /** Sets the canvas width of the root (it follows the device view). Not an edit: it neither marks the page changed nor goes into the undo history. */
  setCanvasWidth: (width: string) => void
  updateNode: (updaterFn: (current: CanvasNode) => CanvasNode,
    targetPath?: string) => void
  duplicateNode: () => void
  deleteNode: (targetPath?: string) => void
  absoluteDeleteNode: (targetPath: string) => void
  updateNodeStyle: (style: React.CSSProperties, targetPath?: string) => void,
  insertNode: (newNode: CanvasNode, insertIdx?: number, targetPath?: string) => CanvasNode | undefined
  insertSection: (newSection: CanvasNode, insertIdx?: number) => void
  /** Appends every section in order in a single state update — insertSection called N times in a loop would each read the same stale `content` closure and clobber each other. Pass `{ replace: true }` to clear the page's existing top-level sections first instead of appending after them (still a single undo step). */
  insertSections: (sections: CanvasNode[], options?: { replace?: boolean }) => void
  moveNode: (removalPath: string, insertIndex: number, insertPath: string) => void
  setFocused: Dispatch<SetStateAction<Focused | null>>
  setFocusedParent: Dispatch<SetStateAction<Focused | null>>
  focusNode: ({ id, path }: {
    id: string;
    path: string;
  }) => void
  clearFocus: () => void
  selectParent: () => void,
  undo: () => void
  redo: () => void
  zoomLevel: number,
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>
  textEditorObj: Editor | null
  setTextEditorObj: Dispatch<SetStateAction<Editor | null>>
  copyContent: () => void
  pasteContent: () => void
  /** Replaces the focused node with a fresh copy of the copied (clipBoard) node. */
  replaceWithCopied: () => void
  history: CanvasNode[],
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>
  /** Multi-selected siblings (in addition to the single `focused` node). All entries share the same parent path. */
  selectedNodes: Focused[]
  /** Toggles a node in/out of the multi-selection. Clears the selection first if the node's parent differs from the current selection's. */
  toggleNodeSelection: (target: Focused) => void
  isNodeSelected: (id: string) => boolean
  clearSelection: () => void
  /** Deletes every selected node (plus the focused node if it's part of the selection). No-op if selection is empty. */
  deleteSelectedNodes: () => void
  /** Duplicates every selected node in place, right after each original. No-op if selection is empty. */
  duplicateSelectedNodes: () => void
  /** Applies a style patch to every selected node (plus the focused node) at once. No-op if selection is empty or the feature flag is off. */
  updateSelectedNodesStyle: (style: React.CSSProperties) => void
  parentNode: CanvasNode | null
  updateAnimationStyle: (props: { propertyName: string, propertyValue: string | number, animationIndex: number, triggerIndex: number, effectItemIndex: number }) => void,
  /** Patches a top-level field on an effect object (outside of `style`) — used by non-style effects like scrollTo's targetNodeId/scrollBehavior/highlightTarget. */
  /** Several style values of one effect in a single history step (two updateAnimationStyle calls would overwrite each other). */
  updateAnimationStyles: (props: { styles: Record<string, string | number>, animationIndex: number, triggerIndex: number, effectItemIndex: number }) => void,
  updateAnimationEffectField: (props: { fieldName: AnimationEffectFieldName, fieldValue: string | boolean | number, animationIndex: number, triggerIndex: number, effectItemIndex: number }) => void,
  updateAnimationTrigger: (props: { triggerValue: TriggerModeType, animationIndex: number, triggerIndex: number }) => void,
  updateAnimationType: (props: { animationType: string, animationIndex: number, triggerIndex: number, effectItemIndex: number }) => void,
  addNewAnimationEffect: (props: { animationIndex: number, triggerIndex: number, defaultAnimationType?: string }) => void,
  addNewAnimationTrigger: (props: { animationIndex: number }) => void,
  removeTrigger: (props: { animationIndex: number, triggerIndex: number }) => void
  removeTriggerEffect: (props: { animationIndex: number, triggerIndex: number, effectItemIndex: number }) => void
  removeAnimationById: (id: string) => void
  isParentIsFocused: (nodeId: string) => boolean
  clipBoard: CanvasClipBoard | null
  setClipBoard: React.Dispatch<React.SetStateAction<CanvasClipBoard | null>>
  placeholderPath: React.MutableRefObject<string | null>
  /** Which breakpoint the property panel is currently editing. Desktop writes go straight to `style`; tablet/mobile write to `responsiveStyle`. */
  deviceScope: DeviceScope
  setDeviceScope: Dispatch<SetStateAction<DeviceScope>>
  /** Whether the editor canvas shows its grid-line background. Editor-only visual aid, never persisted or rendered on the published page. */
  showCanvasGridBg: boolean
  setShowCanvasGridBg: Dispatch<SetStateAction<boolean>>
  /** Swaps the focused node with its previous/next sibling. No-op at the start/end of the list or with no focused node. */
  reorderFocusedNode: (direction: 'earlier' | 'later') => void
  /** Wraps the given nodes (or the current selection/focused node if omitted) in a new block, copying their shared parent's style. All targets must be siblings. */
  groupSelectedNodes: (targets?: Focused[]) => void
  /** Splits the focused block/section into two siblings at the same position, each ~50% sized along the block's own layout axis, with the original children duplicated into both halves. */
  splitFocusedBlock: () => void
  /** True when the focused node is a block/section whose next sibling is also a block/section under the same parent — the only case joinFocusedBlock can act on. */
  canJoinFocusedBlock: () => boolean
  /** Merges the focused block/section with its next sibling block/section: children are concatenated and the merged block's size resets to full. */
  joinFocusedBlock: () => void
}

// @ts-ignore
export const EditorContext = createContext<EditorContextType>(undefined);

interface ProviderProps extends PropsWithChildren {
  content: CanvasNode,
  onUpdate?: (node: CanvasNode) => void;
  /** Bump when `content` is replaced from outside the provider (Import HTML, Custom Code)
   * so the provider adopts it - otherwise its own copy stays stale and the next edit
   * writes the old page back. */
  externalVersion?: number
}

const EditorContextProvider: React.FC<ProviderProps> = ({ content: initialContent, onUpdate, externalVersion = 0, children }) => {

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const placeholderPath = useRef<string | null>(null)
  const [content, setContent] = useState(initialContent);
  const [focused, setFocused] = useState<Focused | null>(null);
  const [focusedParent, setFocusedParent] = useState<Focused | null>(null);
  const [history, setHistory] = useState<CanvasNode[]>([]);
  const [future, setFuture] = useState<CanvasNode[]>([]);
  const [textEditorObj, setTextEditorObj] = useState<Editor | null>(null)
  const [clipBoard, setClipBoard] = useState<CanvasClipBoard | null>(null)

  const [zoomLevel, setZoomLevel] = useState(0.7)

  // Adopt content replaced outside the provider; the replaced page stays undoable.
  const adoptedVersion = useRef(externalVersion)
  useEffect(() => {
    if (externalVersion === adoptedVersion.current) return
    adoptedVersion.current = externalVersion
    setHistory((prev) => [...prev, content])
    setFuture([])
    setContent(initialContent)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalVersion])
  const [deviceScope, setDeviceScope] = useState<DeviceScope>('desktop')
  const [showCanvasGridBg, setShowCanvasGridBg] = useState(true)
  // Forces desktop-only reads/writes everywhere in this file when the
  // feature is disabled, regardless of whatever deviceScope state holds.
  const effectiveDeviceScope: DeviceScope = editorConfig.enable_responsive_editing ? deviceScope : 'desktop'

  const triggerUpdate = useCallback(
    (newState: CanvasNode) => {
      setContent(newState);
      if (onUpdate) {
        onUpdate(newState);
      }
    },
    [onUpdate]
  );


  const getNode = useCallback((path: string, rootContent: CanvasNode = content) => {

    if (!path || !rootContent) {
      return rootContent;
    }

    const pathSegments = path.split('.').map(Number);
    const result = pathSegments.reduce(
      (result, key) => {
        if (isNaN(key)) return result
        if (hasChildNode(result)) {
          return result?.children[key as keyof {}]
        } else if (result?.contentType === 'tab') {
          return result.tabs[result.activeTab].children[key as keyof {}]
        } else {
          return result
        }
        // if(isNaN(key) || result?.type === 'content') return result;
        // else {
        //   return result.children[key as keyof {}]
        // }
      },
      rootContent,
    );

    return result
  }, [content])

  const focusNode = ({ id, path }: {
    id: string,
    path: string
  }) => {
    setFocused({ id, path });
    const parentPath = path.substring(0, path.lastIndexOf("."));
    const parentNode = getNode(parentPath)
    if (parentNode)
      setFocusedParent({
        path: parentPath,
        id: parentNode.id,
      });
  }

  const clearFocus = () => {
    setFocused(null)
    setFocusedParent(null)
  }

  const focusedNode = useMemo(() => {
    if (!focused) return null;
    const node = getNode(focused?.path)
    if (!node) return node
    // Property panels read/write node.style directly; resolving it to the
    // active device scope here makes every existing control responsive-aware
    // without each one needing to know about responsiveStyle.
    return { ...node, style: getEffectiveStyle(node, effectiveDeviceScope) }
  }, [focused, getNode, content, effectiveDeviceScope])

  const updateContent = (updater: (current: CanvasNode) => CanvasNode) => {
    const newState = updater(content);
    triggerUpdate(newState);
    setHistory((prevHistory) => [...prevHistory, content]);
    setFuture([]);
  }

  // The root's width is the editor canvas size, not part of the page (the published page leaves it out), so setting it
  // when a page loads is not an edit: only the canvas state changes, with no onUpdate and no history entry.
  const setCanvasWidth = (width: string) => {
    setContent((current) => ({ ...current, style: { ...current.style, width } }) as CanvasNode)
  }

  /**
   * Merges a style patch into a target style object, deleting keys whose
   * patch value is null/undefined. Shared by the desktop (`node.style`) and
   * responsive (`node.responsiveStyle[scope]`) write paths below.
   */
  const mergeStylePatch = (base: React.CSSProperties | undefined, patch: React.CSSProperties) => {
    const merged = { ...(base ?? {}) };
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        delete (merged as any)[key];
      } else {
        (merged as any)[key] = value;
      }
    });
    return merged;
  };

  const applyStyleToNode = (node: CanvasNode, style: React.CSSProperties): CanvasNode => {
    if (effectiveDeviceScope === 'desktop') {
      return { ...node, style: mergeStylePatch(node.style, style) };
    }
    return {
      ...node,
      responsiveStyle: {
        ...node.responsiveStyle,
        [effectiveDeviceScope]: mergeStylePatch(node.responsiveStyle?.[effectiveDeviceScope], style),
      },
    };
  };

  /** A node's first class - the one a pasted HTML element's shared style
   * lives under in `content.css`. Multiple classes on one element all
   * still render (attributes.className is never touched), but only the
   * first is treated as "the" editable shared class - same simplified,
   * documented approach htmlToCanvasNodes.ts already takes for multi-class
   * elements. */
  const primaryClassName = (node: CanvasNode): string | undefined => {
    const className = (node as { attributes?: { className?: string } }).attributes?.className
    return className?.trim().split(/\s+/)[0] || undefined
  }

  /**
   * The other half of the class-based style system: a style edit on a node
   * with a class writes into `content.css[className]` (the shared,
   * editable source of the class's own declared rules) AND fans the same
   * patch out to every other node sharing that class, so they all update
   * together like a real CSS class would - without needing every render
   * path to resolve styles through `content.css` at read time. Nodes in
   * `excludeNodeIds` (already updated directly by the caller) are skipped.
   */
  const syncClassStyle = (
    root: CanvasNode,
    className: string,
    patch: React.CSSProperties,
    scope: DeviceScope,
    excludeNodeIds: Set<string>,
  ): CanvasNode => {
    if (Object.keys(patch).length === 0) return root
    // An imported page's classes are its own CSS classes (.btn, .card): its stylesheet already styles them
    // all, so an edit stays on the node that was edited instead of recoloring every .btn on the page.
    if (isImportedPage(root as LayoutNode)) return root

    const rootLayout = root as LayoutNode & { css?: Record<string, { style: React.CSSProperties; responsiveStyle?: { tablet?: React.CSSProperties; mobile?: React.CSSProperties } }> }
    const existingRule = rootLayout.css?.[className]
    const newRule = scope === 'desktop'
      ? { style: mergeStylePatch(existingRule?.style, patch), responsiveStyle: existingRule?.responsiveStyle }
      : {
        style: existingRule?.style ?? {},
        responsiveStyle: { ...existingRule?.responsiveStyle, [scope]: mergeStylePatch(existingRule?.responsiveStyle?.[scope], patch) },
      }

    const patchNode = (node: CanvasNode): CanvasNode => {
      let updated = node
      if (!excludeNodeIds.has(node.id) && primaryClassName(node) === className) {
        updated = applyStyleToNodeAtScope(node, patch, scope)
      }
      // Tab nodes hold their real content in tabs[].children, not the
      // top-level .children some also carry (stale/legacy) - matches
      // useResponsiveCss.ts's walk(), which stops at tabs the same way.
      if (isTabNode(updated)) {
        return {
          ...updated,
          tabs: updated.tabs.map((tab) => ({ ...tab, children: tab.children.map(patchNode) })),
        } as CanvasNode
      }
      const children = (updated as { children?: unknown }).children
      if (Array.isArray(children)) {
        updated = { ...updated, children: (children as CanvasNode[]).map(patchNode) } as CanvasNode
      }
      return updated
    }

    const patchedTree = patchNode(root)
    return { ...patchedTree, css: { ...rootLayout.css, [className]: newRule } } as CanvasNode
  }

  /** Same merge as `applyStyleToNode`, but for an explicit scope rather
   * than always `effectiveDeviceScope` - needed by `syncClassStyle` to
   * patch other nodes at the same scope the original edit happened at. */
  const applyStyleToNodeAtScope = (node: CanvasNode, style: React.CSSProperties, scope: DeviceScope): CanvasNode => {
    if (scope === 'desktop') {
      return { ...node, style: mergeStylePatch(node.style, style) }
    }
    return {
      ...node,
      responsiveStyle: {
        ...node.responsiveStyle,
        [scope]: mergeStylePatch(node.responsiveStyle?.[scope], style),
      },
    }
  }

  /**
   * Runs a panel's updater against the device-resolved view of a node (same
   * shape as focusedNode) so callbacks like `(node) => ({...node, style: {...node.style, x}}))`
   * see/produce the effective style, then reconciles: non-style field changes
   * apply directly, but any style change is routed through applyStyleToNode
   * so it lands in the correct desktop/tablet/mobile bucket instead of always
   * overwriting the desktop-only `style` field.
   */
  const runNodeUpdater = (
    realNode: CanvasNode,
    updaterFn: (current: CanvasNode) => CanvasNode,
    onStylePatch?: (className: string, patch: React.CSSProperties) => void,
  ): CanvasNode => {
    const resolvedView = { ...realNode, style: getEffectiveStyle(realNode, effectiveDeviceScope) }
    const result = updaterFn(resolvedView)
    const { style: nextStyle, ...restResult } = result as CanvasNode & { style?: React.CSSProperties }
    const withFields = { ...realNode, ...restResult }
    if (!nextStyle) return withFields
    const updated = applyStyleToNode(withFields, nextStyle)
    const className = primaryClassName(updated)
    if (className) onStylePatch?.(className, nextStyle)
    return updated
  }

  /**
   * When no explicit `targetPath` is given, a panel control normally edits
   * only the focused node. If a multi-selection is active and every selected
   * node (plus the focused one) shares the focused node's content type, the
   * property panel shows that type's dedicated panel instead of the generic
   * MultiSelectPanel (see PropertyPanelUI/index.tsx) — so here we fan the
   * same edit out to every node in that selection instead of just the one.
   */
  const getFanOutPaths = (targetPath?: string): string[] => {
    if (targetPath) return [targetPath]
    if (!focused) return []
    if (!editorConfig.enable_multi_select_property_editing || selectedNodes.length === 0) return [focused.path]

    const targets = selectedNodes.some((n) => n.id === focused.id)
      ? selectedNodes
      : [...selectedNodes, focused]

    const focusedContentType = getNode(focused.path)?.contentType
    const sameType = targets.filter((n) => getNode(n.path)?.contentType === focusedContentType)

    return sameType.length > 0 ? sameType.map((n) => n.path) : [focused.path]
  }

  const applyNodeUpdateAtPath = (
    workingContent: CanvasNode,
    path: string,
    updaterFn: (current: CanvasNode) => CanvasNode,
    onStylePatch?: (className: string, patch: React.CSSProperties) => void,
  ): CanvasNode => {
    const pathSegments = path.split('.').map(Number)
    const targetIndex = pathSegments.pop()
    const parentPath = pathSegments.join('.')

    const parentNode = getNode(parentPath, workingContent)

    if (isTabNode(parentNode)) {
      const parentSegments = parentPath.split('.').map(Number);

      return nodeUpdater(workingContent, parentSegments, (node) => {
        if (!isTabNode(node)) return node;
        if (targetIndex === undefined) return node

        const activeTabChildren = [...node.tabs[node.activeTab].children]

        activeTabChildren[targetIndex] = runNodeUpdater(activeTabChildren[targetIndex], updaterFn, onStylePatch)
        const newTabs = [...node.tabs];
        newTabs[node.activeTab] = {
          ...newTabs[node.activeTab],
          children: activeTabChildren,
        };

        return {
          ...node,
          tabs: newTabs
        }
      })
    }

    return nodeUpdater(workingContent, path.split('.').map(Number), (node) => runNodeUpdater(node, updaterFn, onStylePatch))
  }

  const updateNode = (updaterFn: (current: CanvasNode) => CanvasNode, targetPath?: string) => {
    if (!focused) return;

    const paths = getFanOutPaths(targetPath)
    if (paths.length === 0) return;

    let updatedState = content
    const editedNodeIds = new Set<string>()
    const classPatches: { className: string; patch: React.CSSProperties }[] = []
    paths.forEach((path) => {
      updatedState = applyNodeUpdateAtPath(updatedState, path, updaterFn, (className, patch) => {
        classPatches.push({ className, patch })
      })
      const editedNode = getNode(path, updatedState)
      if (editedNode) editedNodeIds.add(editedNode.id)
    })
    classPatches.forEach(({ className, patch }) => {
      updatedState = syncClassStyle(updatedState, className, patch, effectiveDeviceScope, editedNodeIds)
    })

    triggerUpdate(updatedState)
    setHistory((prevHistory) => [...prevHistory, content]);
    setFuture([]);
  }

  const applyStyleUpdateAtPath = (
    workingContent: CanvasNode,
    path: string,
    style: React.CSSProperties,
  ): CanvasNode => {
    const pathSegments = path.split('.').map(Number);

    const targetIndex = pathSegments.pop();
    const parentPath = pathSegments.join('.');

    const parentNode = getNode(parentPath, workingContent);

    if (isTabNode(parentNode)) {
      const parentSegments = parentPath.split('.').map(Number);

      return nodeUpdater(workingContent, parentSegments, (node) => {
        if (!isTabNode(node)) return node;
        if (targetIndex === undefined) return node;

        const activeTab = node.tabs[node.activeTab];
        const updatedChildren = [...activeTab.children];

        const targetNode = updatedChildren[targetIndex];
        if (!targetNode) return node;

        updatedChildren[targetIndex] = applyStyleToNode(targetNode, style)

        const newTabs = [...node.tabs];
        newTabs[node.activeTab] = {
          ...activeTab,
          children: updatedChildren,
        };

        return {
          ...node,
          tabs: newTabs,
        };
      });
    }

    // Normal node (non-tab)
    return nodeUpdater(workingContent, path.split('.').map(Number), (node) => applyStyleToNode(node, style));
  }

  const updateNodeStyle = (
    patch: React.CSSProperties,
    targetPath?: string
  ) => {
    if (!focused) return;

    const paths = getFanOutPaths(targetPath)
    if (paths.length === 0) return;

    // Styles that do nothing alone get what they need (see companionStyles.ts), read
    // from the focused node's element on the canvas. The patch's own keys always win.
    const element = editorConfig.enable_companion_styles
      ? document.querySelector<HTMLElement>(`[data-id="${window.CSS.escape(focused.id)}"]`)
      : null
    const computed = element ? getComputedStyle(element) : null
    const style: React.CSSProperties = computed
      ? { ...companionStyles(patch as Record<string, unknown>, (prop) => computed.getPropertyValue(prop), getNode(focused.path)?.contentType), ...patch }
      : patch

    let updatedState = content
    const editedNodeIds = new Set<string>()
    const classNames = new Set<string>()
    paths.forEach((path) => {
      updatedState = applyStyleUpdateAtPath(updatedState, path, style)
      const editedNode = getNode(path, updatedState)
      if (editedNode) {
        editedNodeIds.add(editedNode.id)
        const className = primaryClassName(editedNode)
        if (className) classNames.add(className)
      }
    })
    classNames.forEach((className) => {
      updatedState = syncClassStyle(updatedState, className, style, effectiveDeviceScope, editedNodeIds)
    })

    triggerUpdate(updatedState);
    setHistory((prev) => [...prev, content]);
    setFuture([]);
  };

  /**
   * Inserts newNode as a child of the node at `path` within `workingContent`,
   * returning the updated tree. Pulled out of insertNode so multi-target
   * inserts (one selected node at a time) can share the exact same
   * validation + grid-recount logic as the single-target path, instead of
   * duplicating it. Returns null (with an optional toast/warning) if this
   * particular target rejects the insert — callers decide whether that
   * should abort the whole operation (single target) or just skip this one
   * target and continue with the rest (multi-select).
   */
  const insertNodeIntoPath = (workingContent: CanvasNode, path: string, newNode: CanvasNode, targetInsertIdx?: number): CanvasNode | null => {
    // A section can never live inside another section or a block — it's a
    // top-level-only content type. If the drop target is a section or
    // deeper (path length >= 2), redirect the insert to root, right after
    // the top-level section that contains the target, instead of nesting.
    if (newNode.contentType === CONTENT_TYPE.Section) {
      const pathSegments = path.split('.').map(Number)
      if (pathSegments.length >= 2) {
        const topLevelIndex = pathSegments[1]
        return insertNodeIntoPath(workingContent, 'root', newNode, topLevelIndex + 1)
      }
    }

    const targetNode = getNode(path, workingContent);
    if (!targetNode || !isAllowedToInsert(targetNode)) {
      console.warn('Editor: Cannot insert node into node of type ' + targetNode?.contentType)
      return null;
    }

    if (isLayoutNode(newNode) && isTabNode(targetNode)) {
      toast.warning(`Cannot insert ${newNode.contentType} into tab element`)
      return null;
    }

    if (isAdvancedWidget(newNode) && isAdvancedWidget(targetNode)) {
      toast.warning(`Cannot insert ${newNode.contentType} into ${targetNode.contentType}`)
      return null;
    }

    const pathSegments = path.split('.').map(Number);
    let insertIndex = targetInsertIdx ?? (hasChildNode(targetNode) ? (targetNode as any).children?.length : undefined);

    if (isTabNode(targetNode)) {
      insertIndex = targetInsertIdx ?? (targetNode.tabs[targetNode.activeTab].children.length)
    }

    if (insertIndex === undefined) return null;

    if (pathSegments.length <= 2 && newNode.type === NODE_TYPE.Content) {
      toast.warning(<div>
        {pathSegments.length === 2 && <div>Cannot insert content directly into section</div>}
        {pathSegments.length === 1 && <div>Cannot insert content directly into the root</div>}
      </div>)
      return null;
    }

    if (pathSegments.length === 1 && newNode.contentType === CONTENT_TYPE.Block) {
      toast.warning(<div>
        <div>Cannot insert block directly into the root.</div>
      </div>)
      return null;
    }

    return nodeUpdater(workingContent, pathSegments,
      (node: CanvasNode) => {
        let tempNode = node;

        // if(tempNode.type !== NODE_TYPE.Container) return tempNode;
        let tempChildren: CanvasNode[] = []

        if (isTabNode(tempNode)) {
          tempChildren = [...tempNode.tabs[tempNode.activeTab].children]
        } else {
          tempChildren = [...(tempNode as any).children]
        }
        ////console.log(tempChildren)

        tempChildren.splice(insertIndex, 0, newNode)

        // Deliberately NOT recomputing gridTemplateColumns/gridTemplateRows
        // here. This used to overwrite whichever axis the container's
        // gridAutoFlow didn't lock, as `repeat(Math.ceil(childCount /
        // otherAxisCount), 1fr)`, on every single insert — silently
        // changing a column/row count the user may have set explicitly via
        // the Layout panel (and, since it's a flat overwrite rather than a
        // grow-only clamp, it could just as easily shrink that count as
        // grow it). CSS grid already places overflow children into
        // auto-sized implicit rows/columns on its own without this, so
        // removing it doesn't leave extra children with nowhere to go.
        const tempStyle = { ...tempNode.style }

        if (isTabNode(tempNode)) {
          const newTabs = [...tempNode.tabs];
          newTabs[tempNode.activeTab] = {
            ...newTabs[tempNode.activeTab],
            children: tempChildren
          };

          tempNode = {
            ...tempNode,
            style: tempStyle,
            tabs: newTabs
          }

        } else {
          tempNode = {
            ...tempNode,
            style: tempStyle,
            children: tempChildren
          }
        }

        return tempNode
      })
  }

  const insertNode = (newNode: CanvasNode, targetInsertIdx?: number, targetPath?: string) => {
    const multiTargets = editorConfig.enable_multi_select_insert && !targetPath && selectedNodes.length > 1
      ? selectedNodes
      : null

    if (multiTargets) {
      let workingContent = content
      let insertedAny = false

      multiTargets.forEach((target) => {
        const updated = insertNodeIntoPath(workingContent, target.path, deepNodeDuplicate(newNode), targetInsertIdx)
        if (updated) {
          workingContent = updated
          insertedAny = true
        }
      })

      if (!insertedAny) return

      triggerUpdate(workingContent)
      setHistory((prevHistory) => [...prevHistory, content]);
      setFuture([]);
      return
    }

    const path = targetPath ?? (focused ? focused.path : undefined);
    if (!path) return;

    const updatedState = insertNodeIntoPath(content, path, newNode, targetInsertIdx)
    if (!updatedState) return;

    triggerUpdate(updatedState)
    setHistory((prevHistory) => [...prevHistory, content]);
    setFuture([]);

    // if(newNode.contentType === 'section') {
    //   setFocused({
    //     id: newNode.id,
    //     path: `${focused.path}.${insertIndex}`,
    //   })
    //   setFocusedParent(focused)
    // }



    return updatedState;
  }

  const insertSection = (newSection: CanvasNode, insertIdx?: number) => {
    if (!content) {
      console.warn('No content found!')
      return
    };

    const insertIndex = insertIdx ?? (content.children?.length || 0);

    const updatedState = nodeUpdater(content, [NaN],
      (node: CanvasNode) => {
        let tempNode = node;

        if (tempNode.type !== NODE_TYPE.Container) return tempNode;

        let tempChildren = [...tempNode.children]

        tempChildren.splice(insertIndex, 0, newSection)

        tempNode = {
          ...tempNode,
          children: tempChildren
        }

        return tempNode
      })

    triggerUpdate(updatedState)
    setHistory((prevHistory) => [...prevHistory, content]);
    setFuture([]);



    setFocused({
      id: newSection.id,
      path: `root.${insertIndex}`,
    })

    setFocusedParent({
      id: 'root',
      path: 'root'
    })
  }

  const insertSections = (sections: CanvasNode[], options?: { replace?: boolean }) => {
    if (!content) {
      console.warn('No content found!')
      return
    }
    if (sections.length === 0) return

    let workingContent = content

    if (options?.replace) {
      workingContent = nodeUpdater(workingContent, [NaN], (node: CanvasNode) => {
        if (node.type !== NODE_TYPE.Container) return node
        return { ...node, children: [] }
      })
    }

    sections.forEach((newSection) => {
      const insertIndex = workingContent.children?.length || 0
      workingContent = nodeUpdater(workingContent, [NaN], (node: CanvasNode) => {
        if (node.type !== NODE_TYPE.Container) return node
        const tempChildren = [...node.children]
        tempChildren.splice(insertIndex, 0, newSection)
        return { ...node, children: tempChildren }
      })
    })

    triggerUpdate(workingContent)
    setHistory((prevHistory) => [...prevHistory, content])
    setFuture([])

    const lastSection = sections[sections.length - 1]
    const lastIndex = (workingContent.children?.length || 1) - 1
    setFocused({
      id: lastSection.id,
      path: `root.${lastIndex}`,
    })
    setFocusedParent({
      id: 'root',
      path: 'root',
    })
  }

  const duplicateNode = () => {
    if (!focused || !focusedNode || !focusedParent) return;

    if (focused.path === undefined) return;

    const pathSegments = focused.path.split('.').map(Number);
    const parentPathSegments = focusedParent.path.split('.').map(Number);
    const focusedIndex = pathSegments[pathSegments.length - 1];


    const { duplicatedNode, newAnimationList } = deepNodeDuplicate(focusedNode, content?.animation);

    const newAnimation = content?.animation?.map((animate) => animate) || []

    const updatedState = nodeUpdater(content, parentPathSegments, (node) => {
      if (!hasChildNode(node)) return { ...node };

      const tempChildren = [...node.children];
      tempChildren.splice(focusedIndex + 1, 0, duplicatedNode);


      return {
        ...node,
        children: tempChildren,

      };
    });


    triggerUpdate({
      ...updatedState,
      animation: newAnimation.concat(newAnimationList as AnimationGroup[] )
    });
    setHistory((prev) => [...prev, content]);
    setFuture([]);



  };

  const copyContent = () => {
    setClipBoard({
      node: focusedNode as CanvasNode
    })

    if (focusedNode?.contentType === 'text') {
      writeTextNodeToClipBoard(focusedNode)
    } else {
      clearClipBoard()
    }
  }

  const replaceWithCopied = () => {
    const source = clipBoard?.node
    const targetPath = focused?.path
    if (!editorConfig.enable_replace_action || !source || !targetPath) return
    const target = getNode(targetPath)
    if (!target || target.contentType === 'root' || target.id === source.id) return

    // Page sections only swap with sections, so root.children stays all sections.
    const isSectionSlot = targetPath.split('.').length === 2
    if (isSectionSlot !== (source.contentType === 'section')) {
      toast.warning(i18n.t('menu.replaceSectionMismatch', { ns: 'actionMenu' }))
      return
    }

    const segments = targetPath.split('.')
    const index = Number(segments.pop())
    const parentSegments = segments.join('.').split('.').map(Number)
    const { duplicatedNode: copy, animationList } = deepNodeDuplicate(source)

    const updatedState = nodeUpdater(content, parentSegments, (node) => {
      if (!hasChildNode(node)) return node
      const children = [...node.children]
      children.splice(index, 1, copy)
      return { ...node, children }
    })

    triggerUpdate({
      ...updatedState,
      animation: updatedState?.animation?.filter((anime) => anime.id !== target.id),
    })
    setHistory((prev) => [...prev, content])
    setFuture([])
    setFocused({ id: copy.id, path: targetPath })
    toast.success(i18n.t('menu.replaceDone', { ns: 'actionMenu' }))
  }

  const pasteContent = async () => {
    console.log(clipBoard)
    const clipboardText = await navigator.clipboard.readText()

    if (clipboardText) {
      setClipBoard(null)
      insertNode(createTextNode(clipboardText))
    } else {
      if (!clipBoard?.node) return;
      insertNode(deepNodeDuplicate(clipBoard?.node).duplicatedNode)
    }
  }

  const absoluteDeleteNode = (targetPath: string) => {
    const parentPath = targetPath?.substring(0, targetPath?.lastIndexOf("."))
    const path = targetPath


    const parentPathSegments = parentPath.split('.').map(Number);
    const targetPathSegments = path.split('.').map(Number);
    const updatedState = nodeUpdater(content, parentPathSegments,
      (node: CanvasNode) => {
        if (!Array.isArray((node as LayoutNode).children)) return node;

        const indexToDelete = targetPathSegments.at(-1)!;

        const tempChildren = [...(node as LayoutNode).children];
        tempChildren.splice(indexToDelete, 1);

        return {
          ...node,
          children: tempChildren,
        } as CanvasNode;
      })

    triggerUpdate({
      ...updatedState,
      animation: updatedState?.animation?.filter((anime) => anime.id !== focused?.id)

    })
    setHistory((prevHistory) => [...prevHistory, content]);
    setFuture([]);
  }

  const deleteNode = (targetPath?: string) => {

    if (!focused || !focusedParent) return;


    const parentPath = targetPath ? targetPath?.substring(0, targetPath?.lastIndexOf(".")) : focusedParent?.path
    const path = targetPath ?? focused.path


    const parentPathSegments = parentPath.split('.').map(Number);
    const targetPathSegments = path.split('.').map(Number);
    const updatedState = nodeUpdater(content, parentPathSegments,
      (node: CanvasNode) => {
        if (!Array.isArray((node as LayoutNode).children)) return node;

        const indexToDelete = targetPathSegments.at(-1)!;

        const tempChildren = [...(node as LayoutNode).children];
        tempChildren.splice(indexToDelete, 1);

        return {
          ...node,
          children: tempChildren,
        } as CanvasNode;
      })

    triggerUpdate({
      ...updatedState,
      animation: updatedState?.animation?.filter((anime) => anime.id !== focused?.id)

    })
    setHistory((prevHistory) => [...prevHistory, content]);
    setFuture([]);


    if (focusedParent.id === 'root') {
      clearFocus()
    } else {
      setFocused(focusedParent)

      const newParentPath = focusedParent.path.substring(0, focusedParent.path.lastIndexOf("."));
      const newParentNode = getNode(newParentPath)
      setFocusedParent({
        id: newParentNode.id,
        path: newParentPath
      })
    }



  }

  const moveNode = (
    removalPath: string,
    insertIndex: number,
    insertPath: string,
  ) => {


    const removalNode = getNode(removalPath)
    const removalParentPath = removalPath?.substring(0, removalPath?.lastIndexOf("."))
    const parentNode = getNode(removalParentPath)

    const cloneNode = deepNodeDuplicate(removalNode).duplicatedNode


    const removalParentPathSegments = removalParentPath?.split('.')?.map(Number);
    const removalPathSegments = removalPath?.split('.')?.map(Number);



    /**
     * Adding node to target index
     */


    const issameParent = removalPath?.length === insertPath?.length

    const overNodeParentPath = (insertPath.split('.').slice(0, insertPath.split('.').length - 1)).join('.')
    const activeNodeParentPath = removalPath?.split('.').slice(0, insertPath?.split('.').length - 1).join('.')
    // console.log((insertPath.split('.').slice(0,insertPath.split('.').length-1)).join('.'),removalPath.split('.').slice(0,insertPath.split('.').length-1).join('.'))
    const overNodeIdx = Number(insertPath.split('.')[insertPath.split('.').length - 1])

    const parentChildCount = parentNode?.children?.length - 1 || 0
    const activeNodeIdx = Number(removalPath?.split('.')[removalPath?.split('.').length - 1])

    let insertPathSegments = insertPath.split('.').map(Number);

    // if (issameParent && overNodeParentPath === activeNodeParentPath && overNodeIdx !== 0 && parentChildCount !== activeNodeIdx ) {
    //   insertPathSegments[insertPathSegments.length - (insertPath.length-(removalPath.length-1))] = insertPathSegments[insertPathSegments.length - (insertPath.length-(removalPath.length-1))] - 1
    //   // insertPathSegments[1] = insertPathSegments[1] - 1
    // }



    if (insertIndex === undefined) return;

    if (insertPathSegments.length <= 2 && removalNode.type === NODE_TYPE.Content) {
      toast.warning(<div>
        {insertPathSegments.length === 2 && <div>Cannot insert content directly into section</div>}
        {insertPathSegments.length === 1 && <div>Cannot insert content directly into the root</div>}
      </div>)
      return;
    }

    if (insertPathSegments.length === 1 && removalNode.contentType === CONTENT_TYPE.Block) {
      toast.warning(<div>
        <div>Cannot insert block directly into the root.</div>
      </div>)
      return;
    }

    // console.log("_", insertPathSegments, insertIndex)


    const nodeMovedContent = nodeUpdater(content, insertPathSegments,
      (node: CanvasNode) => {
        let tempNode = node;

        if ((tempNode?.type) !== NODE_TYPE.Container) return tempNode;

        let tempChildren = [...tempNode.children]

        tempChildren?.splice(insertIndex, 0, cloneNode)

        const tempStyle = { ...tempNode.style }

        tempNode = {
          ...tempNode,
          style: tempStyle,
          children: tempChildren
        }

        return tempNode
      })




    /**
     * Removing node from original index after added.
     *
     * This must stay id-based (not index-splice at removalParentPathSegments)
     * because the insert above can land in the same parent array and shift
     * the removal index — matching by id is immune to that shift. What
     * changed here vs. the old `filterTree` call: that walked and rebuilt
     * EVERY node in the entire tree looking for the id. Since the removal
     * node's parent is already known (removalParentPathSegments), we scope
     * the id-filter to just that one node's direct children via nodeUpdater,
     * so unrelated branches elsewhere in the tree keep their same object
     * reference instead of being needlessly cloned.
     */
    const nodeRemovedContent = nodeUpdater(nodeMovedContent, removalParentPathSegments,
      (node: CanvasNode) => {
        if (!Array.isArray((node as LayoutNode).children)) return node;

        return {
          ...node,
          children: (node as LayoutNode).children.filter((child) => child.id !== removalNode.id),
        } as CanvasNode
      })

    triggerUpdate(nodeRemovedContent)
    setHistory((prevHistory) => [...prevHistory, content]);
    setFuture([]);
  }

  const swapNode = (
    targetAPath: string,
    targetBPath: string
  ) => {
    //remove targetA

    if (targetAPath.length !== targetBPath.length) return;

    const activeNode = getNode(targetAPath)

    const overNode = getNode(targetBPath)

    const nodeList = [activeNode, overNode]


  }

  const selectParent = () => {
    if (!focused || !focusedNode || !focusedParent || focusedNode.contentType === 'section') return;

    setFocused(focusedParent)

    const newParentPath = focusedParent.path.substring(0, focusedParent.path.lastIndexOf("."));

    const newParentNode = getNode(newParentPath)
    setFocusedParent({
      id: newParentNode.id,
      path: newParentPath
    })
  }

  const parentNode = useMemo(() => {
    if (!focused) return null;
    const parentPath = focused.path.substring(0, focused.path.lastIndexOf("."))
    return getNode(parentPath)
  }, [focused, getNode, focusedNode])

  const undo = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;

      const newHistory = [...prevHistory];
      const previousState = newHistory.pop()!;
      setFuture((prevFuture) => [content, ...prevFuture]);
      triggerUpdate(previousState);
      return newHistory;
    });

    // setFocused(null)
    // setFocusedParent(null)
  }, [content, triggerUpdate]);

  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;

      const newFuture = [...prevFuture];
      const nextState = newFuture.shift()!;
      setHistory((prevHistory) => [...prevHistory, content]);
      triggerUpdate(nextState);
      return newFuture;
    });
  }, [content, triggerUpdate]);

  const [selectedNodes, setSelectedNodes] = useState<Focused[]>([])

  function parentPathOf(path: string) {
    return path.substring(0, path.lastIndexOf('.'))
  }

  /**
   * Toggles a node in/out of the multi-selection. Selection is restricted to
   * siblings (same parent path) — clicking a node under a different parent
   * starts a fresh selection instead of mixing nodes from different parents.
   */
  function toggleNodeSelection(target: Focused) {
    setSelectedNodes((prev) => {
      const existingParentPath = prev[0] ? parentPathOf(prev[0].path) : null
      const targetParentPath = parentPathOf(target.path)

      const sameGroup = existingParentPath === null || existingParentPath === targetParentPath
      const base = sameGroup ? prev : []

      const isAlreadySelected = base.some((n) => n.id === target.id)
      return isAlreadySelected
        ? base.filter((n) => n.id !== target.id)
        : [...base, target]
    })
  }

  function isNodeSelected(id: string) {
    return selectedNodes.some((n) => n.id === id)
  }

  function clearSelection() {
    setSelectedNodes([])
  }

  function deleteSelectedNodes() {
    if (selectedNodes.length === 0) return

    const parentPath = parentPathOf(selectedNodes[0].path)
    const parentPathSegments = parentPath.split('.').map(Number)
    const deletedIds = new Set(selectedNodes.map((n) => n.id))

    // Delete from the highest sibling index down so earlier deletions don't
    // shift the index of siblings still queued for removal.
    const indicesToDelete = selectedNodes
      .map((n) => Number(n.path.split('.').pop()))
      .sort((a, b) => b - a)

    let workingContent = content
    indicesToDelete.forEach((index) => {
      workingContent = nodeUpdater(workingContent, parentPathSegments, (node) => {
        if (!hasChildNode(node)) return node
        const tempChildren = [...node.children]
        tempChildren.splice(index, 1)
        return { ...node, children: tempChildren }
      })
    })

    triggerUpdate({
      ...workingContent,
      animation: workingContent?.animation?.filter((anime) => !deletedIds.has(anime.id))
    })
    setHistory((prev) => [...prev, content])
    setFuture([])

    if (focused && deletedIds.has(focused.id)) clearFocus()
    clearSelection()
  }

  function duplicateSelectedNodes() {
    if (selectedNodes.length === 0) return

    const parentPath = parentPathOf(selectedNodes[0].path)

    // Duplicate from the highest sibling index down so inserting a
    // duplicate right after a node doesn't shift the indices of
    // still-to-be-duplicated siblings that come after it.
    const sorted = [...selectedNodes].sort((a, b) => {
      const aIndex = Number(a.path.split('.').pop())
      const bIndex = Number(b.path.split('.').pop())
      return bIndex - aIndex
    })

    const parentPathSegments = parentPath.split('.').map(Number)
    let workingContent = content

    sorted.forEach((n) => {
      const targetIndex = Number(n.path.split('.').pop())
      const originalNode = getNode(n.path, workingContent)
      if (!originalNode) return

      const duplicatedNode = deepNodeDuplicate(originalNode).duplicatedNode

      workingContent = nodeUpdater(workingContent, parentPathSegments, (node) => {
        if (!hasChildNode(node)) return node
        const tempChildren = [...node.children]
        tempChildren.splice(targetIndex + 1, 0, duplicatedNode)
        return { ...node, children: tempChildren }
      })
    })

    triggerUpdate(workingContent)
    setHistory((prev) => [...prev, content])
    setFuture([])
    clearSelection()
  }

  /**
   * Applies a style patch to every node in the current multi-selection (plus
   * the focused node, if it isn't already part of the selection) in a single
   * atomic update — so a panel edit while several nodes are selected fans out
   * to all of them instead of only the last-focused one.
   */
  function updateSelectedNodesStyle(style: React.CSSProperties) {
    if (!editorConfig.enable_multi_select_property_editing) return

    const targets = focused && !selectedNodes.some((n) => n.id === focused.id)
      ? [...selectedNodes, focused]
      : selectedNodes
    if (targets.length === 0) return

    let workingContent = content
    const editedNodeIds = new Set<string>()
    const classNames = new Set<string>()
    targets.forEach((target) => {
      const pathSegments = target.path.split('.').map(Number)
      workingContent = nodeUpdater(workingContent, pathSegments, (node) => applyStyleToNode(node, style))
      const editedNode = getNode(target.path, workingContent)
      if (editedNode) {
        editedNodeIds.add(editedNode.id)
        const className = primaryClassName(editedNode)
        if (className) classNames.add(className)
      }
    })
    classNames.forEach((className) => {
      workingContent = syncClassStyle(workingContent, className, style, effectiveDeviceScope, editedNodeIds)
    })

    triggerUpdate(workingContent)
    setHistory((prev) => [...prev, content])
    setFuture([])
  }

  /**
   * Swaps the focused node with its previous ('earlier') or next ('later')
   * sibling in their shared parent's children array. The caller (keyboard
   * handler) is responsible for mapping arrow keys to a direction based on
   * the parent's layout (row -> left/right, column/grid -> up/down).
   */
  function reorderFocusedNode(direction: 'earlier' | 'later') {
    if (!editorConfig.enable_arrow_key_reorder) return
    if (!focused || !focusedParent) return

    const pathSegments = focused.path.split('.').map(Number)
    const currentIndex = pathSegments[pathSegments.length - 1]
    const targetIndex = direction === 'earlier' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0) return

    const parentNode = getNode(focusedParent.path)
    if (!parentNode || !hasChildNode(parentNode) || targetIndex >= parentNode.children.length) return

    const parentPathSegments = focusedParent.path.split('.').map(Number)

    const updatedState = nodeUpdater(content, parentPathSegments, (node) => {
      if (!hasChildNode(node)) return node
      if (targetIndex >= node.children.length) return node

      const tempChildren = [...node.children]
        ;[tempChildren[currentIndex], tempChildren[targetIndex]] = [tempChildren[targetIndex], tempChildren[currentIndex]]

      return { ...node, children: tempChildren }
    })

    triggerUpdate(updatedState)
    setHistory((prev) => [...prev, content])
    setFuture([])

    const newSegments = [...pathSegments]
    newSegments[newSegments.length - 1] = targetIndex
    setFocused({ id: focused.id, path: newSegments.join('.') })
  }

  /**
   * Wraps the given sibling nodes (defaulting to the current multi-selection,
   * or the focused node alone) in a new block that copies their shared
   * parent's style. The new block replaces the targets at the position of
   * the earliest one; the targets become its children, in their original
   * relative order.
   */
  function groupSelectedNodes(targets?: Focused[]) {
    if (!editorConfig.enable_group_action) return

    const group = targets && targets.length > 0
      ? targets
      : selectedNodes.length > 0
        ? selectedNodes
        : focused
          ? [focused]
          : []

    if (group.length === 0) return

    const parentPath = group[0].path.substring(0, group[0].path.lastIndexOf('.'))
    const allSameParent = group.every((n) => n.path.substring(0, n.path.lastIndexOf('.')) === parentPath)
    if (!allSameParent) return

    // The new wrapper this function creates is always a Block (below), and
    // a Section can never be nested inside a Block — the same rule
    // insertNodeIntoPath enforces for every other insertion path (it
    // always redirects a Section insert to root, see its own handling of
    // CONTENT_TYPE.Section). groupSelectedNodes splices directly into the
    // tree instead of going through insertNodeIntoPath, so without this
    // check, selecting two or more top-level Sections and grouping them
    // would nest those Sections inside the new Block — an invalid tree
    // shape nothing else in the app ever produces.
    if (group.some((n) => getNode(n.path)?.contentType === CONTENT_TYPE.Section)) {
      toast.warning(<div>
        <div>Cannot group sections — a section can't be nested inside another element.</div>
      </div>)
      return
    }

    const parentPathSegments = parentPath.split('.').map(Number)
    const parentNodeForStyle = getNode(parentPath)

    const sortedByIndex = [...group].sort((a, b) => {
      const aIndex = Number(a.path.split('.').pop())
      const bIndex = Number(b.path.split('.').pop())
      return aIndex - bIndex
    })
    const indices = sortedByIndex.map((n) => Number(n.path.split('.').pop()))
    const insertAt = indices[0]

    const newBlock = generateNewNode('block', {
      style: { ...(parentNodeForStyle?.style ?? {}) },
    }) as LayoutNode

    const updatedState = nodeUpdater(content, parentPathSegments, (node) => {
      if (!hasChildNode(node)) return node

      const grouped = indices.map((i) => node.children[i])
      const remaining = node.children.filter((_, i) => !indices.includes(i))

      const wrappedBlock: LayoutNode = { ...newBlock, children: grouped }

      const tempChildren = [...remaining]
      // insertAt was computed against the pre-removal array; since it's the
      // lowest of the removed indices, the count of removed items before it
      // is always zero, so the position is still valid after filtering.
      tempChildren.splice(insertAt, 0, wrappedBlock)

      return { ...node, children: tempChildren }
    })

    triggerUpdate(updatedState)
    setHistory((prev) => [...prev, content])
    setFuture([])
    clearSelection()
    focusNode({ id: newBlock.id, path: `${parentPath}.${insertAt}` })
  }

  /** Parses a `span N` token out of a grid-column/grid-row shorthand value. */
  function parseGridSpan(value: unknown): number | null {
    if (typeof value !== 'string') return null
    const match = /span\s+(\d+)/.exec(value)
    return match ? parseInt(match[1], 10) : null
  }

  /** Rebuilds a grid-column/grid-row shorthand from a start line and a span, matching GridCellPositionSection's own format. */
  function formatGridPlacement(start: number | null | undefined, span: number | null | undefined): string | undefined {
    const parts: string[] = []
    if (start) parts.push(String(start))
    if (span && span > 1) parts.push(`span ${span}`)
    return parts.length ? parts.join(' / ') : undefined
  }

  /**
   * Splits the focused block/section into two siblings at the same position.
   * When the PARENT is a grid container, width/height are left untouched
   * (a grid cell fills whatever size its grid area gives it — that's not
   * what determines how much of the grid it occupies) and instead the
   * block's own grid-column/grid-row span is halved, so together the two
   * new blocks occupy the same overall grid area the original one did.
   * Otherwise splits along the block's own flex axis (column layout -> 50%
   * height, everything else -> 50% width). The original children are
   * divided between the two halves (first half's worth to block A, the rest
   * to block B), each deep-duplicated so both halves get fresh ids
   * throughout.
   */
  function splitFocusedBlock() {
    if (!editorConfig.enable_split_join_action) return
    if (!focused || !focusedNode || !hasChildNode(focusedNode)) return

    const parentPath = focused.path.substring(0, focused.path.lastIndexOf('.'))
    const focusedIndex = Number(focused.path.split('.').pop())
    const parentPathSegments = parentPath.split('.').map(Number)
    const parentNode = getNode(parentPath)
    const parentIsGrid = parentNode?.style?.display === 'grid'

    let halfStyleA: React.CSSProperties
    let halfStyleB: React.CSSProperties

    if (parentIsGrid) {
      const columnSpan = parseGridSpan(focusedNode.style?.gridColumn) ?? 1
      const rowSpan = parseGridSpan(focusedNode.style?.gridRow) ?? 1
      // Halve whichever axis the block actually spans; an unspanned
      // (1x1) cell halves along columns by default.
      const splitColumns = columnSpan > 1 || rowSpan <= 1

      const spanA = splitColumns ? Math.max(1, Math.floor(columnSpan / 2)) : columnSpan
      const spanB = splitColumns ? Math.max(1, Math.ceil(columnSpan / 2)) : columnSpan
      const rowSpanA = splitColumns ? rowSpan : Math.max(1, Math.floor(rowSpan / 2))
      const rowSpanB = splitColumns ? rowSpan : Math.max(1, Math.ceil(rowSpan / 2))

      halfStyleA = {
        gridColumn: formatGridPlacement(undefined, spanA),
        gridRow: formatGridPlacement(undefined, rowSpanA),
      }
      halfStyleB = {
        gridColumn: formatGridPlacement(undefined, spanB),
        gridRow: formatGridPlacement(undefined, rowSpanB),
      }
    } else {
      const isColumnSplit = focusedNode.style?.display === 'flex' && focusedNode.style?.flexDirection === 'column'
      halfStyleA = isColumnSplit ? { height: '50%' } : { width: '50%' }
      halfStyleB = halfStyleA
    }

    const splitPoint = Math.ceil(focusedNode.children.length / 2)
    const childrenA = focusedNode.children.slice(0, splitPoint).map((child) => deepNodeDuplicate(child).duplicatedNode)
    const childrenB = focusedNode.children.slice(splitPoint).map((child) => deepNodeDuplicate(child).duplicatedNode)

    const blockA: LayoutNode = {
      ...(deepNodeDuplicate(focusedNode).duplicatedNode as LayoutNode),
      style: { ...focusedNode.style, ...halfStyleA },
      children: childrenA,
    }
    const blockB: LayoutNode = {
      ...(deepNodeDuplicate(focusedNode).duplicatedNode as LayoutNode),
      style: { ...focusedNode.style, ...halfStyleB },
      children: childrenB,
    }

    const updatedState = nodeUpdater(content, parentPathSegments, (node) => {
      if (!hasChildNode(node)) return node

      const tempChildren = [...node.children]
      tempChildren.splice(focusedIndex, 1, blockA, blockB)

      return { ...node, children: tempChildren }
    })

    triggerUpdate(updatedState)
    setHistory((prev) => [...prev, content])
    setFuture([])
    focusNode({ id: blockA.id, path: `${parentPath}.${focusedIndex}` })
  }

  /**
   * True when the focused node is a block/section with a next sibling that's
   * also a block/section under the same parent — the only case joinFocusedBlock
   * can act on.
   */
  function canJoinFocusedBlock(): boolean {
    if (!editorConfig.enable_split_join_action) return false
    if (!focused || !focusedNode) return false
    if (!['block', 'section'].includes(focusedNode.contentType)) return false

    const parentPath = focused.path.substring(0, focused.path.lastIndexOf('.'))
    const focusedIndex = Number(focused.path.split('.').pop())
    const parentNode = getNode(parentPath)
    if (!parentNode || !hasChildNode(parentNode)) return false

    const nextSibling = parentNode.children[focusedIndex + 1]
    return !!nextSibling && ['block', 'section'].includes(nextSibling.contentType)
  }

  /**
   * Adds two CSS length values together when they share a unit (%, px, or
   * em), e.g. '30%' + '40%' -> '70%'. Percentage sums are capped at 100%,
   * since a block can never usefully occupy more than the whole of its
   * parent along one axis. Falls back to `fallback` when either side is
   * missing/unparseable or the units don't match, since there's no single
   * correct way to combine mismatched units.
   */
  function addMatchingCssLength(a: unknown, b: unknown, fallback: string): string {
    const parse = (value: unknown) => {
      if (typeof value !== 'string') return null
      const match = /^([\d.]+)(%|px|em)$/.exec(value.trim())
      return match ? { value: parseFloat(match[1]), unit: match[2] } : null
    }

    const parsedA = parse(a)
    const parsedB = parse(b)
    if (!parsedA || !parsedB || parsedA.unit !== parsedB.unit) return fallback

    const sum = parsedA.value + parsedB.value
    const clamped = parsedA.unit === '%' ? Math.min(sum, 100) : sum

    return `${clamped}${parsedA.unit}`
  }

  /**
   * Merges the focused block/section with its next sibling block/section:
   * children are concatenated (focused node's children first). When the
   * PARENT is a grid container, the merged block's grid-column/grid-row span
   * is the sum of both blocks' spans along whichever axis either of them
   * actually spans (e.g. span 1 + span 1 -> span 2); otherwise the merged
   * size is the sum of both blocks' width/height along the join axis (e.g.
   * 50% + 50% -> 100%, 30% + 40% -> 70%) — falling back to 100% when sizes
   * can't be combined (missing, or mismatched units).
   */
  function joinFocusedBlock() {
    if (!canJoinFocusedBlock()) return
    if (!focused || !focusedNode || !hasChildNode(focusedNode)) return

    const parentPath = focused.path.substring(0, focused.path.lastIndexOf('.'))
    const focusedIndex = Number(focused.path.split('.').pop())
    const parentPathSegments = parentPath.split('.').map(Number)
    const parentNode = getNode(parentPath)
    const parentIsGrid = parentNode?.style?.display === 'grid'

    const updatedState = nodeUpdater(content, parentPathSegments, (node) => {
      if (!hasChildNode(node)) return node

      const nextSibling = node.children[focusedIndex + 1]
      if (!nextSibling || !hasChildNode(nextSibling)) return node

      let joinedStyle: React.CSSProperties

      if (parentIsGrid) {
        const columnSpanA = parseGridSpan(focusedNode.style?.gridColumn) ?? 1
        const columnSpanB = parseGridSpan(nextSibling.style?.gridColumn) ?? 1
        const rowSpanA = parseGridSpan(focusedNode.style?.gridRow) ?? 1
        const rowSpanB = parseGridSpan(nextSibling.style?.gridRow) ?? 1
        // Grow whichever axis either sibling actually spans; if neither
        // spans anything, default to growing columns.
        const joinColumns = columnSpanA > 1 || columnSpanB > 1 || (rowSpanA <= 1 && rowSpanB <= 1)

        joinedStyle = joinColumns
          ? { gridColumn: formatGridPlacement(undefined, columnSpanA + columnSpanB), gridRow: focusedNode.style?.gridRow }
          : { gridColumn: focusedNode.style?.gridColumn, gridRow: formatGridPlacement(undefined, rowSpanA + rowSpanB) }
      } else {
        const isColumnJoin = focusedNode.style?.display === 'flex' && focusedNode.style?.flexDirection === 'column'
        const sizeProp = isColumnJoin ? 'height' : 'width'
        joinedStyle = {
          [sizeProp]: addMatchingCssLength(focusedNode.style?.[sizeProp], nextSibling.style?.[sizeProp], '100%'),
        }
      }

      const mergedBlock: LayoutNode = {
        ...(focusedNode as LayoutNode),
        style: { ...focusedNode.style, ...joinedStyle },
        children: [...focusedNode.children, ...nextSibling.children],
      }

      const tempChildren = [...node.children]
      tempChildren.splice(focusedIndex, 2, mergedBlock)

      return { ...node, children: tempChildren }
    })

    triggerUpdate(updatedState)
    setHistory((prev) => [...prev, content])
    setFuture([])
    focusNode({ id: focusedNode.id, path: `${parentPath}.${focusedIndex}` })
  }

  function updateAnimationStyle(props: { propertyName: string, propertyValue: string | number, animationIndex: number, triggerIndex: number, effectItemIndex: number }) {
    const { propertyName, propertyValue, animationIndex, triggerIndex, effectItemIndex } = props

    let newAnimation = (content)?.animation.map((animate) => animate) || []
    let newTrigger = newAnimation[animationIndex || 0].trigger_effect.map((effect) => effect) || []
    let newEffect = newTrigger[triggerIndex || 0]?.effects.map((effect) => effect) || []


    newEffect[effectItemIndex || 0] = {
      ...newEffect[effectItemIndex || 0],
      style: {
        ...newEffect[effectItemIndex || 0].style,
        [`${propertyName}`]: propertyValue
      }
    }
    newTrigger[triggerIndex || 0] = {
      ...newTrigger[triggerIndex || 0],
      effects: newEffect
    }

    newAnimation[animationIndex || 0] = {
      ...newAnimation[animationIndex || 0],
      trigger_effect: newTrigger
    }


    updateContent((newContent) => ({
      ...newContent,
      animation: newAnimation
    }))
  }
  function updateAnimationStyles(props: { styles: Record<string, string | number>, animationIndex: number, triggerIndex: number, effectItemIndex: number }) {
    const { styles, animationIndex, triggerIndex, effectItemIndex } = props

    const newAnimation = [...(content?.animation ?? [])]
    const newTrigger = [...newAnimation[animationIndex || 0].trigger_effect]
    const newEffect = [...(newTrigger[triggerIndex || 0]?.effects ?? [])]

    newEffect[effectItemIndex || 0] = {
      ...newEffect[effectItemIndex || 0],
      style: { ...newEffect[effectItemIndex || 0].style, ...styles }
    }
    newTrigger[triggerIndex || 0] = { ...newTrigger[triggerIndex || 0], effects: newEffect }
    newAnimation[animationIndex || 0] = { ...newAnimation[animationIndex || 0], trigger_effect: newTrigger }

    updateContent((newContent) => ({
      ...newContent,
      animation: newAnimation
    }))
  }
  function updateAnimationEffectField(props: { fieldName: AnimationEffectFieldName, fieldValue: string | boolean | number, animationIndex: number, triggerIndex: number, effectItemIndex: number }) {
    const { fieldName, fieldValue, animationIndex, triggerIndex, effectItemIndex } = props

    let newAnimation = (content)?.animation.map((animate) => animate) || []
    let newTrigger = newAnimation[animationIndex || 0].trigger_effect.map((effect) => effect) || []
    let newEffect = newTrigger[triggerIndex || 0]?.effects.map((effect) => effect) || []

    newEffect[effectItemIndex || 0] = {
      ...newEffect[effectItemIndex || 0],
      [fieldName]: fieldValue
    }
    newTrigger[triggerIndex || 0] = {
      ...newTrigger[triggerIndex || 0],
      effects: newEffect
    }

    newAnimation[animationIndex || 0] = {
      ...newAnimation[animationIndex || 0],
      trigger_effect: newTrigger
    }

    updateContent((newContent) => ({
      ...newContent,
      animation: newAnimation
    }))
  }
  function updateAnimationTrigger(props: { triggerValue: TriggerModeType, animationIndex: number, triggerIndex: number }) {

    const { triggerValue, animationIndex, triggerIndex } = props
    let newAnimation = content?.animation?.map((animate) => animate) || []
    let newTriggerEffect = newAnimation[animationIndex]?.trigger_effect?.map((effect) => effect) || []

    newTriggerEffect[triggerIndex || 0] = {
      ...newTriggerEffect[triggerIndex || 0],
      trigger: triggerValue as TriggerModeType,
    }


    newAnimation[animationIndex || 0] = {
      ...newAnimation[animationIndex || 0],
      trigger_effect: newTriggerEffect
    }

    updateContent((content) => ({
      ...content,
      animation: newAnimation
    }))
  }
  function updateAnimationType(props: { animationType: string, animationIndex: number, triggerIndex: number, effectItemIndex: number }) {

    const { animationType, animationIndex, triggerIndex, effectItemIndex } = props
    let newAnimation = content?.animation?.map((animate) => animate) || []
    let newTriggerEffect = newAnimation[animationIndex].trigger_effect.map((effect) => effect) || []
    let newTriggerEffectItem = newTriggerEffect[triggerIndex].effects.map((effect) => effect) || []

    newTriggerEffectItem[effectItemIndex || 0] = {
      ...newTriggerEffectItem[effectItemIndex || 0],
      animation_type: animationType as string
    }

    newTriggerEffect[triggerIndex || 0] = {
      ...newTriggerEffect[triggerIndex || 0],
      effects: newTriggerEffectItem
    }

    newAnimation[animationIndex || 0] = {
      ...newAnimation[animationIndex || 0],
      trigger_effect: newTriggerEffect
    }



    updateContent((content) => ({
      ...content,
      animation: newAnimation
    }))
  }

  function addNewAnimationEffect(props: { animationIndex: number, triggerIndex: number, defaultAnimationType?: string, animation?: AnimationGroup[] }) {
    const { animationIndex, triggerIndex, defaultAnimationType, animation } = props

    const newAnimation = content?.animation?.map((animate) => animate) || []

    // console.log(content,focusedNode?.id)


    const foundIndex = newAnimation?.findIndex((animation) => animation?.id === focusedNode?.id)

    const newTriggerEffect = newAnimation[animationIndex]?.trigger_effect?.map((effect) => effect) || []
    const newTriggerEffectItem = newTriggerEffect[triggerIndex]?.effects?.map((effect) => effect) || []





    if (animation) {
      newAnimation.concat(animation)
    }
    else {
      newTriggerEffectItem.push({
        animation_type: defaultAnimationType ?? "none",
        style: {
          "box-sizing": "border-box"
        }
      })

      newTriggerEffect[triggerIndex || 0] = {
        ...newTriggerEffect[triggerIndex || 0],
        effects: newTriggerEffectItem
      }

      newAnimation[foundIndex || 0] = {
        ...newAnimation[foundIndex || 0],
        trigger_effect: newTriggerEffect
      }


    }

    updateContent((content) => ({
      ...content,
      animation: newAnimation
    }))



  }

  function addNewAnimationTrigger(props: { animationIndex: number }) {
    const { animationIndex } = props

    const animationExist = content?.animation
    let newContent = content
    let newAnimation = content.animation?.map((animate) => animate) || []
    const foundIndex = newAnimation.findIndex((animation) => animation.id === focusedNode?.id)
    let newTriggerEffect = newAnimation[animationIndex]?.trigger_effect?.map((effect) => effect) || []

    // console.log(animationExist)

    if (animationExist) {
      if (foundIndex > -1) {

        newTriggerEffect.push({
          trigger: "auto",
          effects: [
            {
              animation_type: "none",
              style: {
                "box-sizing": "border-box"
              }
            }
          ]

        })

        newAnimation[foundIndex || 0] = {
          ...newAnimation[foundIndex || 0],
          trigger_effect: newTriggerEffect
        }
      }
      else {
        {
          newAnimation?.push({
            id: focusedNode?.id || '',
            trigger_effect: [{
              trigger: "auto",

              effects: [
                {
                  animation_type: "none",
                  style: {
                    "box-sizing": "border-box"
                  }
                }
              ]
            }]
          })
        }
      }
      updateContent((content) => ({
        ...content,
        animation: newAnimation
      }))
    }
    else {
      console.log("new content")

      newContent = {
        ...newContent,
        animation: [{
          id: focusedNode?.id || '',
          trigger_effect: [{
            trigger: "auto",

            effects: [
              {
                animation_type: "none",
                style: {
                  "box-sizing": "border-box"
                }
              }
            ]
          }]
        }]
      }

      updateContent((content) => ({
        ...newContent
      }))
    }


  }

  // console.log(content)

  function removeTrigger(props: { animationIndex: number, triggerIndex: number }) {
    const { animationIndex, triggerIndex } = props

    let newAnimation = content.animation.map((anime) => anime) || []
    let newTriggerEffect = newAnimation[animationIndex || 0]?.trigger_effect?.filter((trigger, index) => index !== triggerIndex)

    newAnimation[animationIndex || 0] = {
      ...newAnimation[animationIndex || 0],
      trigger_effect: newTriggerEffect?.length > 0 ? newTriggerEffect : []
    }

    updateContent((content) => ({
      ...content,
      animation: newAnimation
    }))


  }

  function removeTriggerEffect(props: { animationIndex: number, triggerIndex: number, effectItemIndex: number }) {
    const { animationIndex, triggerIndex, effectItemIndex } = props

    let newAnimation = content.animation.map((anime) => anime) || []
    let newTriggerEffect = newAnimation[animationIndex].trigger_effect.map((trigger) => trigger) || []
    let newEffect = newTriggerEffect[triggerIndex].effects.filter((effect, index) => index !== effectItemIndex)

    newTriggerEffect[triggerIndex || 0] = {
      ...newTriggerEffect[triggerIndex || 0],
      effects: newEffect
    }
    newAnimation[animationIndex || 0] = {
      ...newAnimation[animationIndex || 0],
      trigger_effect: newTriggerEffect
    }

    updateContent((content) => ({
      ...content,
      animation: newAnimation
    }))


  }

  function removeAnimationById(id: string) {
    let newAnimation = content.animation.filter((anime) => anime.id !== id)

    updateContent((content) => ({
      ...content,
      animation: newAnimation

    }))

    // console.log(content.animation, newAnimation)

    // deleteNode()
  }

  const isParentIsFocused = useCallback((nodeId: string) => {

    if (focusedNode && ["block", 'section'].includes(focusedNode.contentType)) {
      return (focusedNode as LayoutNode)?.children?.find((childNode) => childNode.id === nodeId)
    }
    return false
  }, [focusedNode])

  // console.log(content.animation)

  // useEffect(() => {
  //   const handler = (e:MouseEvent) => {
  //     if (e.ctrlKey && e.button === 0) {
  //       SelectNode(focusedNode)
  //     }
  //   };

  //   window.addEventListener(
  //     "mousedown",
  //     handler
  //   );

  //   return () => {
  //     window.removeEventListener(
  //       "mousedown",
  //       handler
  //     );
  //   };
  // }, [])

  // console.log('EditorContext re-rendered', selectedNodes)

  return (
    <EditorContext.Provider
      value={{
        isParentIsFocused,
        absoluteDeleteNode,
        removeAnimationById,
        updateAnimationStyle,
        updateAnimationStyles,
        updateAnimationEffectField,
        updateAnimationTrigger,
        updateAnimationType,
        addNewAnimationEffect,
        addNewAnimationTrigger,
        removeTrigger,
        removeTriggerEffect,
        content,
        setContent,
        focusedParent,
        setFocusedParent,
        updateContent,
        setCanvasWidth,
        updateNode,
        updateNodeStyle,
        insertNode,
        duplicateNode,
        deleteNode,
        insertSection,
        insertSections,
        moveNode,
        getNode,
        selectParent,
        undo,
        redo,
        zoomLevel,
        setZoomLevel,
        deviceScope,
        setDeviceScope,
        showCanvasGridBg,
        setShowCanvasGridBg,
        reorderFocusedNode,
        groupSelectedNodes,
        splitFocusedBlock,
        canJoinFocusedBlock,
        joinFocusedBlock,
        focusedNode,
        focused,
        setFocused,
        focusNode,
        clearFocus,
        textEditorObj,
        setTextEditorObj,
        copyContent,
        pasteContent,
        replaceWithCopied,
        history,
        canvasRef,
        selectedNodes,
        toggleNodeSelection,
        isNodeSelected,
        clearSelection,
        deleteSelectedNodes,
        duplicateSelectedNodes,
        updateSelectedNodesStyle,
        parentNode,
        clipBoard, setClipBoard,
        placeholderPath
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export default EditorContextProvider;

export const useEditor = () => (useContext(EditorContext));