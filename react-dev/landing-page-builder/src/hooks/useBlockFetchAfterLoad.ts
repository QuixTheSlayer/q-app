import { useEffect } from 'react'

/**
 * Once the page data has loaded, every fetch on this page (the page's own JS included) answers 429 and goes nowhere.
 * It is installed after the data request, so loading the page itself still works. Call it before usePageJs: effects
 * run in the order they are declared, so the block is in place before the page's JS runs.
 */
export function useBlockFetchAfterLoad(loaded: boolean) {
  useEffect(() => {
    if (!loaded) return
    window.fetch = async (): Promise<Response> => new Response(null, { status: 429, statusText: 'Too many request' })
  }, [loaded])
}
