/**
 * Iconify (https://iconify.design) support for the Icon Block. An item's `icon` is either a lucide icon
 * name (`Star`, how every icon was stored before) or an Iconify id (`mdi:home`, `prefix:name`). Both
 * render through NodeIcon; the Iconify ones are plain <img> tags pointing at the Iconify SVG API, so
 * nothing from the API can run script and exported pages need no runtime.
 */

export const ICONIFY_API = 'https://api.iconify.design'

// `prefix:name`, lowercase letters, digits and dashes, exactly what Iconify uses. Checked before an id
// is put in a URL, so a crafted `icon` value in saved or imported data cannot change the request.
const ICONIFY_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/

export const isIconifyId = (icon: string | undefined | null): icon is string => !!icon && ICONIFY_ID.test(icon)

const FALLBACK_COLOR = '#333333'

const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')

/** Iconify only takes plain hex or named colors, but the color picker also produces `rgba(...)` and 8-digit hex. */
export function toIconifyColor(color: string | undefined): string {
  const value = (color ?? '').trim()
  if (/^#[0-9a-f]{6}$/i.test(value)) return value
  if (/^#[0-9a-f]{8}$/i.test(value)) return value.slice(0, 7)
  const short = value.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i)
  if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`
  const rgb = value.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i)
  if (rgb) return `#${toHex(Number(rgb[1]))}${toHex(Number(rgb[2]))}${toHex(Number(rgb[3]))}`
  return FALLBACK_COLOR
}

/** The SVG for an Iconify id, colored and sized by the API. Empty for anything that is not a valid id. */
export function iconifySvgUrl(id: string, { color, size }: { color?: string; size?: number } = {}): string {
  if (!isIconifyId(id)) return ''
  const [prefix, name] = id.split(':')
  const params = new URLSearchParams()
  if (color) params.set('color', toIconifyColor(color))
  if (size) params.set('height', String(Math.round(size)))
  const query = params.toString()
  return `${ICONIFY_API}/${prefix}/${name}.svg${query ? `?${query}` : ''}`
}

export interface IconifySearchResult {
  /** Valid `prefix:name` ids only. */
  icons: string[]
  /** True when the result filled `limit`, which means the server has more matches (it only reports the count it returned). */
  hasMore: boolean
}

// The API accepts limits from 32 to 999 (default 64).
export const ICONIFY_SEARCH_FIRST_LIMIT = 64
export const ICONIFY_SEARCH_MAX_LIMIT = 999

/** Thrown on HTTP 429 (Cloudflare error 1015): the caller should stop and tell the user to wait. */
export class IconifyRateLimitError extends Error {
  constructor() {
    super('Iconify rate limit reached')
    this.name = 'IconifyRateLimitError'
  }
}

// Search is limited to a handful of popular sets. That keeps results relevant, and since previews are
// fetched once per set (see fetchIconifyIcons), it caps how many requests one page of results costs.
export const ICONIFY_SETS: { prefix: string; label: string }[] = [
  { prefix: 'mdi', label: 'Material Design' },
  { prefix: 'lucide', label: 'Lucide' },
  { prefix: 'tabler', label: 'Tabler' },
  { prefix: 'ph', label: 'Phosphor' },
  { prefix: 'heroicons', label: 'Heroicons' },
  { prefix: 'ri', label: 'Remix' },
  { prefix: 'bi', label: 'Bootstrap' },
  { prefix: 'carbon', label: 'Carbon' },
  { prefix: 'solar', label: 'Solar' },
]
export const ICONIFY_SEARCH_PREFIXES = ICONIFY_SETS.map((set) => set.prefix)

async function iconifyFetch(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal })
  if (response.status === 429) throw new IconifyRateLimitError()
  if (!response.ok) throw new Error(`Iconify request failed (${response.status})`)
  return response.json() as Promise<Record<string, unknown>>
}

export async function searchIconify(
  query: string,
  { limit = ICONIFY_SEARCH_FIRST_LIMIT, signal }: { limit?: number; signal?: AbortSignal } = {}
): Promise<IconifySearchResult> {
  // The server cannot resume from `start`, so it re-checks every icon anyway: ask for a small first page,
  // and only when the visitor wants more ask once for everything (limit 999).
  const bounded = Math.min(ICONIFY_SEARCH_MAX_LIMIT, Math.max(32, limit))
  const params = new URLSearchParams({ query, limit: String(bounded), prefixes: ICONIFY_SEARCH_PREFIXES.join(',') })
  const data = await iconifyFetch(`${ICONIFY_API}/search?${params}`, signal)
  const icons = Array.isArray(data.icons) ? data.icons.filter((icon): icon is string => typeof icon === 'string' && isIconifyId(icon)) : []
  return { icons, hasMore: Array.isArray(data.icons) && data.icons.length >= bounded }
}

// Icon names per set, fetched once per session: browsing a set is one list request, then one request per page of previews.
const collectionCache = new Map<string, string[]>()

/** Every icon id in a set (`/collection?prefix=mdi`), categorized and uncategorized together. */
export async function fetchIconifyCollection(prefix: string, signal?: AbortSignal): Promise<string[]> {
  const cached = collectionCache.get(prefix)
  if (cached) return cached
  const data = await iconifyFetch(`${ICONIFY_API}/collection?${new URLSearchParams({ prefix })}`, signal)
  const names = new Set<string>(Array.isArray(data.uncategorized) ? (data.uncategorized as string[]) : [])
  for (const list of Object.values((data.categories ?? {}) as Record<string, string[]>)) list.forEach((name) => names.add(name))
  const ids = [...names].map((name) => `${prefix}:${name}`).filter(isIconifyId).sort()
  collectionCache.set(prefix, ids)
  return ids
}

export interface IconifyIconData {
  /** SVG markup inside the <svg>, drawn with `currentColor`. */
  body: string
  width: number
  height: number
}

// Icons already fetched this session, so scrolling back or searching again costs nothing.
const iconCache = new Map<string, IconifyIconData>()

export const getCachedIconifyIcon = (id: string) => iconCache.get(id)

/**
 * The SVG data for many icons in one request per icon set (`/<prefix>.json?icons=a,b,c`), instead of one
 * request per icon. A page of 32 results is a handful of requests, not 32.
 */
export async function fetchIconifyIcons(ids: string[], signal?: AbortSignal): Promise<void> {
  const byPrefix = new Map<string, string[]>()
  for (const id of ids) {
    if (!isIconifyId(id) || iconCache.has(id)) continue
    const [prefix, name] = id.split(':')
    byPrefix.set(prefix, [...(byPrefix.get(prefix) ?? []), name])
  }
  await Promise.all(
    [...byPrefix].map(async ([prefix, names]) => {
      const data = await iconifyFetch(`${ICONIFY_API}/${prefix}.json?icons=${names.join(',')}`, signal)
      const icons = (data.icons ?? {}) as Record<string, { body?: string; width?: number; height?: number }>
      const defaultWidth = typeof data.width === 'number' ? data.width : 16
      const defaultHeight = typeof data.height === 'number' ? data.height : 16
      for (const [name, icon] of Object.entries(icons)) {
        if (typeof icon.body !== 'string') continue
        iconCache.set(`${prefix}:${name}`, { body: icon.body, width: icon.width ?? defaultWidth, height: icon.height ?? defaultHeight })
      }
    })
  )
}

/**
 * An icon as an image data URL. It is used as an <img>, where an SVG cannot run script, so the markup
 * from the API needs no sanitizing.
 */
export function iconifyDataUrl(icon: IconifyIconData, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon.width} ${icon.height}" color="${toIconifyColor(color)}">${icon.body}</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
