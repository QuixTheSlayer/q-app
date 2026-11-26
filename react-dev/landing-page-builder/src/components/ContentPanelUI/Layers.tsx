import React, { useEffect, useMemo, useState } from 'react'
import { CanvasNode, ContentType, TabNode } from '../../types/node.type'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { cn } from '../../libs/cn'
import { useEditor } from '../../context/EditorContext'
import { isAllowedToInsert } from '@/utils/editor.utils'
import { debounce } from '@/utils/canvas.utils'
import editorConfig from '@/configs/editor.config'
import {
  Home, PanelTop, Square, Type, Image as ImageIcon, BarChart3, Shapes, Plus, Minus,
  PanelLeft, MousePointerClick, Table2, ChevronsDownUp, PanelsTopLeft, GalleryHorizontal,
  Images, SquareStack, RefreshCw, MapPin, Youtube, Video, Code2, Timer, Hourglass, Clock,
  Share2, MessageSquareQuote, GaugeCircle, Hash, Star, GitBranch, HelpCircle, Tag,
  LayoutGrid, Menu, CalendarClock, LayoutTemplate, PanelBottom, IdCard, LayoutPanelTop,
  TableProperties, SquareMousePointer, Edit3, type LucideIcon,
  TextCursorInput,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

/** One icon per contentType so the tree is scannable at a glance instead of
 * every row looking identical. Keyed as a full Record so TS enforces that a
 * newly added ContentType gets an icon here too. */
const CONTENT_TYPE_ICON: Record<ContentType, LucideIcon> = {
  root: Home,
  section: PanelTop,
  block: Square,
  text: Type,
  image: ImageIcon,
  video: Video,
  button: MousePointerClick,
  table: Table2,
  chart: BarChart3,
  iconBlock: Shapes,
  newNode: Plus,
  separators: Minus,
  verticalTab: PanelLeft,
  accordion: ChevronsDownUp,
  tab: PanelsTopLeft,
  imageSlider: GalleryHorizontal,
  imageCarousel: Images,
  blockCarousel: SquareStack,
  imageFlipFlop: RefreshCw,
  googleMap: MapPin,
  youtube: Youtube,
  vimeo: Video,
  html: Code2,
  countDown: Timer,
  customCountDownWrapper: Hourglass,
  countDownText: Clock,
  social: Share2,
  testimonialSlider: MessageSquareQuote,
  progressBar: GaugeCircle,
  counter: Hash,
  rating: Star,
  timeline: GitBranch,
  faq: HelpCircle,
  pricingToggle: Tag,
  cardsTemplate: LayoutGrid,
  navBarTemplate: Menu,
  eventWidgetsGroupTemplate: CalendarClock,
  heroTemplate: LayoutTemplate,
  footerTemplate: PanelBottom,
  personalCardTemplate: IdCard,
  layoutTemplate: LayoutPanelTop,
  tableEnterprise: TableProperties,
  buttonEnterprise: SquareMousePointer,
  formField: TextCursorInput,
}

/**
 * The tree-walking utils (isAllowedToInsert/getNode) also treat accordion,
 * tab, and testimonialSlider nodes as having real, addressable children even
 * though their `type` is "content", not "container" — the Layers tree used
 * to only expand NODE_TYPE.Container nodes, so those nodes' children were
 * never reachable/visible here even though they're fully editable on canvas.
 * A `tab` node only ever exposes its *currently active* tab's children via
 * path resolution (see EditorContext's getNode), so that's all we show —
 * showing every tab's children would render rows whose path segment
 * silently resolves into whichever tab happens to be active later.
 */
function getTreeChildren(node: CanvasNode): CanvasNode[] {
  if (!isAllowedToInsert(node)) return []
  if (node.contentType === 'tab') {
    return (node as TabNode).tabs?.[(node as TabNode).activeTab]?.children ?? []
  }
  return node.children
}

function Layers() {
  const { t } = useTranslation('insert')
  const canvas = useEditor()

  const data = canvas.content

  /**
   * Plain event-delegation on the click event already in hand — this used
   * to call the delegate() util here, which attaches a *new* native
   * listener on every click instead of handling the current one. Since a
   * listener added mid-dispatch can't retroactively observe the event
   * that triggered it, that made the very first click on the tree (per
   * mount) silently do nothing, only taking effect from the next click
   * onward.
   */
  const onParentClick = (e: React.MouseEvent<HTMLUListElement, MouseEvent>) => {
    const target = (e.target as HTMLElement).closest<HTMLInputElement>('[data-name="layer-item-open"]')
    if (!target || !e.currentTarget.contains(target)) return

    e.stopPropagation()
    const id = target.id
    const path = target.getAttribute('data-path') || 'root'

    if (editorConfig.enable_multi_select && (e.shiftKey || e.ctrlKey || e.metaKey)) {
      canvas?.toggleNodeSelection({ id, path })
      return
    }

    canvas?.clearSelection()
    canvas?.focusNode({ id, path })
  }


  if (canvas && data?.children?.length === 0) {
    return (
      <div className='px-3 py-6 text-center text-sm text-muted-foreground'>
        {t('layers.emptyState')}
      </div>
    )
  }

  return (
    <ul onClick={onParentClick} className=' w-auto max-h-[78vh] overflow-auto no-scrollbar'>
      {canvas && <RenderNodeItem node={data} path='root' depth={0} />}
    </ul>
  )
}

function RenderNodeItem({ node, path, depth }: {
  node: CanvasNode
  path: string
  depth: number
}) {
  const { t } = useTranslation('insert')
  const canvas = useEditor()

  const [blockName, setBlockName] = useState<string>((node?.name ?? node?.contentType) || '')

  const children = getTreeChildren(node)
  const canExpand = children.length > 0

  const [limit, setLimit] = useState<number>(canExpand ? children.length : 0)

  const changeName = useMemo(() => debounce((e: React.ChangeEvent<HTMLInputElement>) => {

    canvas.updateNode((node) => ({
      ...node,
      name: e.target.value
    }))
  }, 200), [blockName])

  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    setLimit(isOpen ? children.length : 0)
    // children.length intentionally omitted — this only needs to react to
    // the fold toggle, not to re-run (and reset any in-progress collapse)
    // every time a sibling is inserted/removed elsewhere in the tree.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const isFocused = canvas?.focused?.id === node.id
  const isSelected = !isFocused && canvas?.isNodeSelected(node.id)

  const Icon = CONTENT_TYPE_ICON[node.contentType]

  return (
    <div role='treeitem' aria-expanded={canExpand ? isOpen : undefined} aria-selected={isFocused || isSelected}>

      <div
        style={{ paddingLeft: 4 + depth * 14 }}
        className={cn(
          'flex items-center gap-1 pr-1 py-0.5 rounded',
          isFocused ? 'bg-input text-foreground' : isSelected ? 'bg-input/50 outline outline-1 -outline-offset-1 outline-primary/50 text-foreground' : 'text-foreground'
        )}
      >
        {canExpand ? (
          <button
            type='button'
            aria-label={isOpen ? t('layers.collapseLayer') : t('layers.expandLayer')}
            title={isOpen ? t('layers.collapseLayer') : t('layers.expandLayer')}
            className='layer-item-btn shrink-0'
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(prev => !prev)
            }}
          >
            <ChevronRightIcon className={cn('size-4  transition-transform', isFocused ? 'text-foreground ' : ' text-muted-foreground ',
              isOpen ? 'rotate-90' : '')} />
          </button>
        ) : (
          <span className='size-4 shrink-0' aria-hidden='true' />
        )}

        <Icon
          size={14}
          className={cn('shrink-0', isFocused ? 'text-foreground' : 'text-muted-foreground')}
          aria-hidden='true'
        />

        <input style={{
          backgroundColor:'transparent !important'
        }} data-name="layer-item-open" id={node.id} data-path={path} type="text" value={blockName} className='w-[225px] cursor-default border-[1px] text-foreground border-solid border-transparent hover:outline-none focus:outline-0 focus:!border-none p-[2px] px-[6px] text-[14px] rounded-[0.3rem] font-medium truncate'
          // onClick={handleClick}
          onChange={(e) => {
            setBlockName(e.currentTarget.value)
            changeName(e)
          }}
        />

        {isFocused && <Edit3 className=' shrink-0 opacity-70' size={14} />}

      </div>
      {canExpand && isOpen && (
        <div className='ml-[15px] border-l border-border/40'>
          {children.slice(0, limit).map((child, idx) => <RenderNodeItem
            node={child}
            key={child.id}
            path={path + "." + idx}
            depth={depth + 1}
          />)}
        </div>
      )}
    </div>
  )
}

export default Layers
