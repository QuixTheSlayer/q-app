import RenderElement from '@/components/PreviewUI/RenderElement'
import { useGetPageDataQuery } from '@/store/query'
import Unauthorized from '@/pages/Error/403'
import { unauthorizedStatus } from '@/utils/isUnauthorizedError'
import { exportHTML } from '@/utils/exportHTML'
import { exportReactProject } from '@/utils/reactExport/exportReactProject'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { Button } from '@/components/ui/primitives/button'
import { ArrowUp, ChevronUp, Edit } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import "./Preview.css"
import editorConfig from '@/configs/editor.config'
import { ScrollToTopConfig } from '@/types/contentFile.type'
import EditorContextProvider, { useEditor } from '@/context/EditorContext'
import { useAnimationCss } from '@/hooks/useAnimationCss'
import { useScrollToInteractions } from '@/hooks/useScrollToInteractions'
import { useResponsiveCss } from '@/hooks/useResponsiveCss'
import { useClassCss } from '@/hooks/useClassCss'
import { useBlockFetchAfterLoad } from '@/hooks/useBlockFetchAfterLoad'
import { useClassJs } from '@/hooks/useClassJs'
import { usePageJs } from '@/hooks/usePageJs'
import RenderPreview from './RenderPreview'
import Canvas from '@/components/EditorUI/Canvas'
import { CanvasNode } from '@/types/node.type'
import { isDev } from '@/libs/checkEnv'
import useKeyCombo from '@/hooks/useKeyCombo'
import { isMacOS } from '@/utils/platform.utils'
import { ShortcutBadge } from '@/components/ui/ShortcutBadge'
import { cn } from '@/libs/cn'
import { sanitizeCanvasTree } from '@/utils/security/sanitizeCanvasTree'
import { isImportedPage, scopePageCss } from '@/utils/pageScope'
import { applyCodePolicy, hasRestrictedCode } from '@/utils/security/codePolicy'
import type { LayoutNode } from '@/types/node.type'
import CodeBlockedNotice from '@/components/EditorUI/CodeBlockedNotice'
import { getIdFromUrl } from '@/utils/getIdFromUrl'

const sizeMap = {
  sm: { padding: '0.5rem', iconSize: 16 },
  md: { padding: '0.75rem', iconSize: 20 },
  lg: { padding: '1rem', iconSize: 24 },
} as const

function ScrollToTopButton({ scrollRef }: {
  scrollRef: React.RefObject<HTMLElement>
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!editorConfig.enable_scroll_to_top_button) return
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => setVisible(el.scrollTop > 300)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [scrollRef])

  if (!editorConfig.enable_scroll_to_top_button || !visible) return null

  // const posClass = config.position === 'bottom-left' ? 'left-8' : 'right-8'

  return (
    <button
      onClick={() =>
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
      }
      className={
        "fixed bottom-8 right-[4rem] !z-100 rounded-sm shadow-lg transition-colors bg-primary text-white size-12 flex items-center justify-center"
      }
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}



function Preview() {

  


  const localPageData: string | null = localStorage.getItem('pageData') || null

  const { isLoading, isSuccess, data, error } = useGetPageDataQuery('')
  const mainRef = useRef<HTMLDivElement>(null)

  const elementRef = useRef<HTMLDivElement>(null)
  const [exportingReact, setExportingReact] = useState(false)

  const isTemplatePreview = data?.is_free == 1

  useKeyCombo({ key: 'p', ctrl: !isMacOS(), meta: isMacOS() }, (event) => {
    if (isTemplatePreview || !data) return
    event.preventDefault()
    window.location.href = `/landing-page-builder/editor/${data.id}`
  }, !editorConfig.enable_preview_switch_shortcut)

  // The page's JS, imported scripts and external CSS are left out here and in the exports.
  const content = useMemo(() => applyCodePolicy(data?.content), [data?.content])



  const style = document.createElement('style');
  style.setAttribute("css-animation", '')

  const StyleNode = document.head.getElementsByTagName('style')


  const responsiveCss = useResponsiveCss(content)
  const classJs = useClassJs(content as CanvasNode)
  useScrollToInteractions(content as any, mainRef as React.RefObject<HTMLElement>)

   const css = useAnimationCss(content as CanvasNode)
 
   useEffect(() => {
     let style = document.head.querySelector<HTMLStyleElement>('style[css-animation]')
     if (!style) {
       style = document.createElement('style')
       style.setAttribute('css-animation', '')
       document.head.appendChild(style)
     }
     style.textContent = css?.split("\n").join(" ") ?? ''
 
     return () => {
       style?.remove()
     }
   }, [css])

   // The per-screen (tablet, mobile) styles as real media rules, like the public page.
   useEffect(() => {
     if (!responsiveCss) return
     const responsiveStyle = document.createElement('style')
     responsiveStyle.setAttribute('css-responsive', '')
     responsiveStyle.textContent = responsiveCss
     document.head.appendChild(responsiveStyle)
     return () => { document.head.removeChild(responsiveStyle) }
   }, [responsiveCss])

    const classCss = useClassCss(content as CanvasNode)
  
    useEffect(() => {
      let style = document.querySelector<HTMLStyleElement>('style[css-class]')
      if (!style) {
        style = document.createElement('style')
        style.setAttribute('css-class', '')
        // At the end of <body>, after the builder's and the site's own stylesheets, so the page's
        // rules win ties with theirs (e.g. its `h1 {}` over Tailwind's reset).
        document.head.appendChild(style)
      }
      // An imported page's tag-only rules (`section {}`) stay off the builder's own panels.
      style.textContent = [classCss, isImportedPage(content) ? scopePageCss(content?.plainCss ?? '') : content?.plainCss].filter(Boolean).join('\n')
  
      return () => {
        style?.remove()
      }
    }, [classCss, content?.plainCss])

  // Page JS never runs on Judgify's origin: pages that have it are shown in a sandbox.
  // const sandboxed = needsSandbox(content)
  // const sandboxDoc = useSandboxSnapshot(
  //   elementRef,
  //   sandboxed,
  //   (element) => buildSandboxDocument(element, { title: data?.title ?? '', js: content?.plainJS ?? '', classJs, pageScripts: content?.pageScripts, htmlAttributes: content?.htmlAttributes }),
  //   content,
  // )

      // console.log( "hasJs", classJs,content)

  useEffect(() => {
    document.querySelector('script[data-class-js]')?.remove()

    // Sandboxed pages run their class JS inside the sandbox instead.
    if (!classJs) return
    const script = document.createElement('script')
    script.setAttribute('data-class-js', '')
    script.textContent = classJs
    document.head.appendChild(script)
    return () => { document.querySelector('script[data-class-js]')?.remove() }
  }, [classJs])

  // Fetch is blocked once the page has loaded, before the page's own JS runs.
  useBlockFetchAfterLoad(isSuccess)

  const dataForRender = (): CanvasNode => {
    if (localPageData) {
      if (isDev) {
        return sanitizeCanvasTree(JSON.parse(JSON.parse(localPageData).page_content) as CanvasNode)
      }
      return sanitizeCanvasTree((JSON.parse(localPageData).content) as CanvasNode)
    }
    return content as CanvasNode
  }
  // console.log("PreviewPage",data)

  // What both exports write besides the rendered page itself.
  const exportAssets = () => ({
    animationCss: css,
    responsiveCss,
    classCss,
    plainCss: content?.plainCss,
    classJs,
    plainJS: content?.plainJS,
    content: dataForRender(),
  })

  const handleExportReact = async () => {
    if (exportingReact || !data) return
    setExportingReact(true)
    try {
      await exportReactProject(elementRef, data.title, exportAssets(), { boxed: data.is_boxed === 1 })
      toast.success('React project downloaded')
    } catch (error) {
      console.error(error)
      toast.error('Could not export the React project')
    } finally {
      setExportingReact(false)
    }
  }

  const refusedStatus = unauthorizedStatus(error)
  if (refusedStatus) return <Unauthorized status={refusedStatus} />

  if (data)
    return (
      <div

        style={{
          fontSize: editorConfig.root_font_size + 'px',
          height: '100vh',
          overflowY: 'scroll',
          width: "100%",
        }}
        className='rendered-main flex flex-col gap-2 !bg-background judgify-editor relative'>
        {editorConfig.enable_export_react && <Toaster position="top-center" richColors theme="light" />}
        <div className=' w-full  justify-between items-center p-2 top-5 left-5 z-[999] !bg-[#424040] flex gap-2'>
          <p className=' text-white text-4xl font-semibold ' >
            Preview Page
          </p>
          <div className=' flex w-auto gap-2 ' >
            {!isTemplatePreview &&

              <div
                role='button'
                tabIndex={0}
                title={editorConfig.enable_preview_switch_shortcut ? 'Switch to Editor (Ctrl+P)' : 'Switch to Editor'}
                aria-label='Switch to editor page'
                className=' min-w-fit px-3 py-2 flex gap-2 justify-center items-center cursor-pointer font-semibold border border-primary/100 text-primary/100 rounded  '
                onClick={() => window.location.href = `/landing-page-builder/editor/${data.id}`}
              >
                <Edit size={16} />
                Edit
                {editorConfig.enable_preview_switch_shortcut && <ShortcutBadge keys={['ctrl', 'p']} className='border-primary/40 bg-primary/10 text-primary/80' />}
              </div>}

            {editorConfig.enable_export_react && (
              <div
                role='button'
                tabIndex={0}
                aria-label='Export page as a React project'
                aria-busy={exportingReact}
                className={cn(' min-w-fit px-4 py-2 gap-3 flex justify-center items-center cursor-pointer font-semibold text-white/80 border rounded border-primary/100', exportingReact && 'opacity-60 pointer-events-none')}
                onClick={handleExportReact}
              >
                {exportingReact ? 'Exporting…' : 'Export React'}
              </div>
            )}

            <div
              role='button'
              tabIndex={0}
              aria-label='Export page as HTML'
              className=' min-w-fit px-4 py-2 gap-3 flex justify-center items-center cursor-pointer font-semibold cus-gradient text-white/80 border rounded border-primary/100'
              onClick={() => exportHTML(elementRef, data.title, exportAssets())}
            >
              Export
            </div>
          </div>

        </div>
        {hasRestrictedCode(data.content as LayoutNode) && <CodeBlockedNotice className='mx-2' />}
        <div ref={mainRef as React.RefObject<HTMLDivElement>} className=' !bg-white  w-full border-t no-scrollbar  max-h-[95vh] h-[95vh] overflow-y-auto  flex flex-col justify-start items-center gap-[40px] ' >

          {/* Kept rendered: Export reads it. */}
          {isSuccess && <div className='w-full h-full' >
            <div className={cn('w-full h-full main-container', data.is_boxed === 1 && 'main-container-lp')} ref={elementRef} >
              <RenderElement node={dataForRender()} canvas={data.content} />
            </div>
          </div>
          }

        </div>

        <ScrollToTopButton scrollRef={mainRef as React.RefObject<HTMLElement>} />
      </div>
    )
}

export default Preview