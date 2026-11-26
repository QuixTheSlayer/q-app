import { useEffect } from 'react'
import { sanitizePageJs } from '@/utils/security/sanitizePageJs'

/** Runs the page's own JS (plainJS) as a script in the document, minus unsafe statements, and removes it when the page changes. */
export function usePageJs(js?: string | null, enabled = true) {
  useEffect(() => {
    console.log(enabled)
    document.querySelector('script[data-page-js]')?.remove()
    if (!enabled || !js?.trim()) return
    const { code, removed } = sanitizePageJs(js)
    if (removed.length) console.warn('Page JS: removed', removed)
    if (!code.trim()) return
    const script = document.createElement('script')
    script.setAttribute('data-page-js', '')
    script.textContent = code
    document.body.appendChild(script)
    return () => { script.remove() }
  }, [js, enabled])
}



