import Editor from '@/pages/Editor.page.tsx'
import Home from '@/pages/Home.page.tsx'
import Preview from '@/pages/Preview.page.tsx'
import RenderPage from '@/pages/RenderPage.page'
import CaptureRender from '@/pages/CaptureRender.page'
import Converter from '@/pages/Converter.page'
import HtmlToJson from '@/pages/HtmlToJson.page'
import { hiddenToolFor } from '@/utils/hiddenTools'
import editorConfig from '@/configs/editor.config'
import { useEffect, useMemo, useRef, useState } from 'react'
import PreviewContextProvider from '@/context/PreviewContext'
import ModalContextProvider from './context/ModalContext'
import ImageEditorContextProvider from './context/ImageEditorContext'
import ImageEditorKonvaProvider from './context/ImageEditorKonvaContext'
import ImageEditorApp from './components/ImageEditor/src/App'
import EditorModal from './components/ui/components/Editor.modal'
import './imageEd.css'
import EditorContextProvider from './context/EditorContext'
import { useAppDispatch } from './store'
import ConfirmModal from './components/ui/modal/ConfirmModal'
import { installFetchDuplicateDetector, installFetchMonitor } from './utils/BurstFetchBlocker'
import { toast } from 'sonner'
import FeatureTogglePanel from './components/EditorUI/FeatureTogglePanel'
import TestPage from './pages/TestPaage'

const pageMap: Record<string, React.ComponentType> = {
  '/landing-page-builder/editor': Editor,
  '/landing-page-builder/preview': Preview,
  '/landing-page-builder/capture-render': CaptureRender,
  '/':TestPage
}


// The hidden tool pages (see hiddenTools.ts for how they are reached).
const HIDDEN_TOOL_PAGES = { converter: Converter, 'html-json': HtmlToJson }

/** Deletes the Cache Storage entries and service workers, refreshes the cached page, then reloads. The address stays the same. */
async function clearAndHardReload() {
  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    }
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.unregister()))
    }
  } catch (err) {
    console.error('Cache clear failed:', err)
  }
  try {
    // Re-downloads the page and replaces the browser's cached copy, so the reload below gets the new one.
    await fetch(window.location.href, { cache: 'reload' })
    // The page's own scripts and stylesheets too, so files with a fixed name are not served from the cache.
    const files = Array.from(document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>('script[src], link[rel="stylesheet"][href]'))
      .map((el) => (el instanceof HTMLScriptElement ? el.src : el.href))
      .filter((src) => src.startsWith(window.location.origin))
    await Promise.all(files.map((src) => fetch(src, { cache: 'reload' }).catch(() => undefined)))
  } catch {
    // Offline or blocked: the plain reload still runs.
  }
  window.location.reload()
}

function App() {

  // Ctrl/Cmd+R in the editor clears caches and reloads. Leaving with unsaved changes still gets the browser's prompt.
  useEffect(() => {
    if (!window.location.pathname.startsWith('/landing-page-builder/editor')) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey || e.key.toLowerCase() !== 'r') return
      // Ctrl+Shift+R is text align right and the browser's own hard reload; typing fields keep their keys.
      const target = e.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      e.preventDefault()
      clearAndHardReload()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
  const CurrentPageComponent = useMemo(() => {
    const tool = editorConfig.enable_converter_page ? hiddenToolFor() : null
    if (tool) return HIDDEN_TOOL_PAGES[tool]

    const pathname = window.location.pathname
    const matchedRoute = Object.keys(pageMap).find(route =>
      pathname.startsWith(route)
    ) as string

    return pageMap[matchedRoute] || RenderPage
  }, [])




  installFetchDuplicateDetector({
    windowMs: 3000,
    onDuplicate: ({ url, method, count, abortReq }) => {

      if(count < 10) return;
      // toast.warning("Detected duplicated same request, please try again later!")

      abortReq()

     return Promise.resolve()
    
    },
  })

  installFetchMonitor({
    burstThreshold: 20,
    burstWindowMs: 5000,
    onBurst: () => {

      // toast.warning("Too many request, please try again later!")

      window.fetch = window.fetch = async (
        _input: RequestInfo | URL,
        _init?: RequestInit
      ): Promise<Response> => {
        return new Response(null, { status: 429, statusText: 'Too many request' })
      }

    }
  })


  return (
    <main className="w-full h-auto  bg-[#333333] text-foreground">
      <ConfirmModal />
      <FeatureTogglePanel />
      <PreviewContextProvider>

        <ModalContextProvider>
          <ImageEditorContextProvider>
            <ImageEditorKonvaProvider>



              <CurrentPageComponent />


            </ImageEditorKonvaProvider>

          </ImageEditorContextProvider>

        </ModalContextProvider>

      </PreviewContextProvider>

      <div className="toast" id="toast">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
        <span id="toast-msg">Image uploaded successfully</span>
      </div>

    </main>
  )
}


export default App


if (import.meta.env.PROD) {
  console.log = () => { }
  console.error = ()=> {}
  console.warn =()=> {}
  console.table =()=> {}
  window.alert = ()=>{}

  // stub fetch in production to a no-op that matches the Fetch API signature

}
