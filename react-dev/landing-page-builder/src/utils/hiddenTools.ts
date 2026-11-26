/**
 * The hidden tool pages. None of them is linked from the editor, and Laravel only serves a few addresses, so in
 * production a tool is opened by adding its query to one of them (for example the editor address plus ?converter).
 * In dev every path reaches the app, so the path form works too.
 */
export type HiddenTool = 'converter' | 'html-json'

export const HIDDEN_TOOLS: { tool: HiddenTool; label: string; path: string; param: string }[] = [
  { tool: 'converter', label: 'Encrypt / decrypt', path: '/landing-page-builder/converter', param: 'converter' },
  { tool: 'html-json', label: 'HTML to JSON', path: '/landing-page-builder/html-to-json', param: 'html-json' },
]

export function hiddenToolFor(location: Pick<Location, 'pathname' | 'search'> = window.location): HiddenTool | null {
  const params = new URLSearchParams(location.search)
  const found = HIDDEN_TOOLS.find((item) => params.has(item.param) || location.pathname.startsWith(item.path))
  return found?.tool ?? null
}

/** The address of a tool from the page we are on: the same address with the tool's query, or its path in dev. */
export function hiddenToolUrl(tool: HiddenTool, location: Pick<Location, 'pathname' | 'search'> = window.location): string {
  const target = HIDDEN_TOOLS.find((item) => item.tool === tool)!
  const onToolPath = HIDDEN_TOOLS.some((item) => location.pathname.startsWith(item.path))
  return onToolPath ? target.path : `${location.pathname}?${target.param}`
}
