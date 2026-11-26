import { useEffect, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TextInput } from '@/components/ui/primitives/text-input'
import { Select, SelectOption } from '@/components/ui/Select'
import { PropertyHint } from '@/components/PropertyPanelUI/hints/PropertyHint'
import { cn } from '@/libs/cn'
import {
  fetchIconifyCollection,
  fetchIconifyIcons,
  getCachedIconifyIcon,
  iconifyDataUrl,
  IconifyRateLimitError,
  ICONIFY_SETS,
  ICONIFY_SEARCH_MAX_LIMIT,
  searchIconify,
} from '@/utils/iconify'

const PAGE_SIZE = 48
const DEBOUNCE_MS = 500
const MIN_QUERY_LENGTH = 2
const DEFAULT_SET = ICONIFY_SETS[0].prefix
// A mid grey reads on both the light and the dark panel.
const PREVIEW_COLOR = '#8a8f98'

type PickerError = 'failed' | 'rateLimited' | null

interface IconifySearchProps {
  /** The item's current icon, highlighted when it is in the list. */
  selected?: string
  onSelect: (icon: string) => void
}

/**
 * The Icon Block's icon picker, backed by the Iconify API (200k+ icons). With the search box empty it
 * lists one icon set at a time (pick the set above the grid); typing searches across the popular sets.
 * Picking an icon hands back its `prefix:name` id.
 *
 * Request cost is kept low on purpose: the API rate-limits by IP (Cloudflare error 1015). Previews come
 * from one request per icon set per page (see fetchIconifyIcons), never one request per icon.
 */
export function IconifySearch({ selected, onSelect }: IconifySearchProps) {
  const { t } = useTranslation('propertyPanel')
  const [query, setQuery] = useState('')
  const [prefix, setPrefix] = useState(DEFAULT_SET)

  // Every id this picker could show (a whole set, or search matches so far) and how many are on screen.
  const [ids, setIds] = useState<string[]>([])
  const [shown, setShown] = useState(PAGE_SIZE)
  // Search only: the first request came back full, so there are more matches than `ids` holds.
  const [serverHasMore, setServerHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<PickerError>(null)

  const term = query.trim()
  const searching = term.length >= MIN_QUERY_LENGTH
  const browsing = !term

  const fail = (e: unknown) => {
    if ((e as Error)?.name === 'AbortError') return
    setError(e instanceof IconifyRateLimitError ? 'rateLimited' : 'failed')
    setLoading(false)
  }

  // Browse: load the set's icon names once, then previews for the first page.
  useEffect(() => {
    if (!browsing) return
    const controller = new AbortController()
    setIds([])
    setShown(PAGE_SIZE)
    setError(null)
    setLoading(true)
    fetchIconifyCollection(prefix, controller.signal)
      .then(async (all) => {
        await fetchIconifyIcons(all.slice(0, PAGE_SIZE), controller.signal)
        setIds(all)
        setLoading(false)
      })
      .catch(fail)
    return () => controller.abort()
  }, [browsing, prefix])

  // Search: debounced first page; each new term cancels the one still in flight.
  useEffect(() => {
    if (browsing) return
    setIds([])
    setServerHasMore(false)
    setError(null)
    if (!searching) {
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    const timer = setTimeout(() => {
      searchIconify(term, { signal: controller.signal })
        .then(async (result) => {
          await fetchIconifyIcons(result.icons.slice(0, PAGE_SIZE), controller.signal)
          setIds(result.icons)
          setShown(PAGE_SIZE)
          setServerHasMore(result.hasMore)
          setLoading(false)
        })
        .catch(fail)
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [browsing, searching, term])

  // Shows the next page. When a search has run out of fetched results but the server has more, this asks
  // once for everything (limit 999) instead of paging the server, which cannot resume a search.
  const loadMore = async () => {
    setLoading(true)
    try {
      let all = ids
      if (!browsing && shown >= ids.length && serverHasMore) {
        all = (await searchIconify(term, { limit: ICONIFY_SEARCH_MAX_LIMIT })).icons
        setIds(all)
        setServerHasMore(false)
      }
      const next = shown + PAGE_SIZE
      await fetchIconifyIcons(all.slice(shown, next))
      setShown(next)
      setLoading(false)
    } catch (e) {
      fail(e)
    }
  }

  const visible = ids.slice(0, shown)
  const canLoadMore = !loading && !error && ids.length > 0 && (shown < ids.length || (!browsing && serverHasMore))

  return (
    <div className=" flex w-full flex-col gap-2 " >
      <div className=" flex w-full items-center gap-1 " >
        <div className=" relative w-full " >
          <Search size={14} className=" pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground " />
          <TextInput
            size="sm"
            className=" pl-7 "
            type="search"
            aria-label={t('iconBlockPanel.searchIcons')}
            placeholder={t('iconBlockPanel.searchIcons')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <PropertyHint hintKey="iconSearch" />
      </div>

      {browsing && (
        <Select
          id="iconifySet"
          aria-label={t('iconBlockPanel.iconSet')}
          size="sm"
          placeholder=""
          items={ICONIFY_SETS.map((set) => ({ value: set.prefix, label: set.label }))}
          selectedKey={prefix}
          onSelectionChange={(v) => setPrefix(v as string)}
        >
          {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
        </Select>
      )}

      {!browsing && !searching && <p className=" text-xs text-muted-foreground " >{t('iconBlockPanel.keepTyping')}</p>}

      {(browsing || searching) && (
        <div className=" flex w-full flex-col gap-2 " >
          {error && <p role="alert" className=" text-xs text-destructive " >{t(error === 'rateLimited' ? 'iconBlockPanel.searchRateLimited' : 'iconBlockPanel.searchFailed')}</p>}
          {!error && !loading && searching && ids.length === 0 && <p className=" text-xs text-muted-foreground " >{t('iconBlockPanel.noIconsFound', { query: term })}</p>}

          <div className=" flex h-[350px] w-full flex-wrap content-start gap-2 overflow-y-auto " >
            {visible.map((icon) => {
              const data = getCachedIconifyIcon(icon)
              return (
                <button
                  key={icon}
                  type="button"
                  title={icon}
                  aria-label={icon}
                  aria-pressed={selected === icon}
                  disabled={!data}
                  onClick={() => onSelect(icon)}
                  className={cn(
                    ' flex h-[40px] w-[40px] items-center justify-center rounded border p-1 hover:bg-primary/15 ',
                    selected === icon && 'border-primary bg-primary/20'
                  )}
                >
                  {data && <img src={iconifyDataUrl(data, PREVIEW_COLOR)} alt="" width={28} height={28} draggable={false} />}
                </button>
              )
            })}
            {loading && <Loader2 size={18} className=" m-2 animate-spin text-muted-foreground " />}
          </div>

          <div className=" flex items-center justify-between gap-2 text-[11px] text-muted-foreground " >
            <span>{visible.length > 0 ? t('iconBlockPanel.iconsShown', { shown: visible.length, total: ids.length }) : ''}</span>
            <a href="https://iconify.design" target="_blank" rel="noreferrer" className=" underline " >{t('iconBlockPanel.iconsByIconify')}</a>
          </div>
          {canLoadMore && (
            <button type="button" onClick={loadMore} className=" rounded border border-primary/40 py-1 text-xs text-foreground/80 hover:bg-primary/10 " >
              {t('iconBlockPanel.loadMoreIcons')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
