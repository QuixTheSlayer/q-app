import RenderElement from '@/components/PreviewUI/RenderElement'
import editorConfig from '@/configs/editor.config'
import {useGetRenderPageDataQuery} from '@/store/query'
import ErrorPage from '@/pages/Error/ErrorPage'
import { errorPageStatus } from '@/utils/isUnauthorizedError'
import {getIdFromUrl} from '@/utils/getIdFromUrl'
import {useMemo, useEffect, useRef, useState} from 'react'
import {ScrollToTopConfig} from '@/types/contentFile.type'
import {ArrowUp, ChevronUp} from 'lucide-react'
import { isDev } from '@/libs/checkEnv'
import { useResponsiveCss } from '@/hooks/useResponsiveCss'
import { useAnimationCss } from '@/hooks/useAnimationCss'
import { useClassCss } from '@/hooks/useClassCss'
import { useBlockFetchAfterLoad } from '@/hooks/useBlockFetchAfterLoad'
import { useClassJs } from '@/hooks/useClassJs'
import { usePageJs } from '@/hooks/usePageJs'
import { useScrollToInteractions } from '@/hooks/useScrollToInteractions'
import { CanvasNode } from '@/types/node.type'
import { cn } from '@/libs/cn'
import { isImportedPage, scopePageCss } from '@/utils/pageScope'
import { applyCodePolicy } from '@/utils/security/codePolicy'

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

function RenderPage () {
  const eventName = useMemo(() => getIdFromUrl(), [])
  const mainRef = useRef<HTMLElement>(null) 

  const { isLoading, isSuccess, data, error } =  useGetRenderPageDataQuery(eventName ||'')

    const css = useAnimationCss(data?.landingpage_data.content as CanvasNode)

  const responsiveCss = useResponsiveCss(data?.landingpage_data?.content)
  const classCss = useClassCss(data?.landingpage_data?.content as CanvasNode)
  const classJs = useClassJs(data?.landingpage_data?.content as CanvasNode)
  useScrollToInteractions(data?.landingpage_data.content as CanvasNode, mainRef as React.RefObject<HTMLElement>)

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

  useEffect(() => {
    if (!responsiveCss) return
    const style = document.createElement('style')
    style.setAttribute('css-responsive', '')
    style.textContent = responsiveCss
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [responsiveCss])

  // The page's JS, imported scripts and external CSS are left out (the stored page is untouched).
  const pageContent = useMemo(() => applyCodePolicy(data?.landingpage_data?.content), [data?.landingpage_data?.content])
  // An imported page's tag-only rules (`section {}`) stay off the site's own markup.
  const plainCss = isImportedPage(pageContent) ? scopePageCss(pageContent?.plainCss ?? '') : pageContent?.plainCss
  const plainJS = pageContent?.plainJS

  useEffect(() => {
    const cssText = [classCss, plainCss].filter(Boolean).join('\n')
    if (!cssText) return
    const style = document.createElement('style')
    style.setAttribute('css-class', '')
    style.textContent = cssText
    // At the end of <body>, after the builder's and the site's own stylesheets, so the page's
    // rules win ties with theirs (e.g. its `h1 {}` over Tailwind's reset).
    document.body.appendChild(style)
    return () => { style.remove() }
  }, [classCss, plainCss])

  useEffect(() => {
    document.body.querySelector('script[data-class-js]')?.remove()
    // Sandboxed pages run their class JS inside the sandbox instead.
    if (!classJs) return
    const script = document.createElement('script')
    script.setAttribute('data-class-js', '')
    script.textContent = classJs
    document.body.appendChild(script)
    return () => { document.body.querySelector('script[data-class-js]')?.remove() }
  }, [classJs])

  // Fetch is blocked once the page has loaded, before the page's own JS runs.
  useBlockFetchAfterLoad(!!data?.landingpage_data)

  // The server refused or failed the page: not public, not found, rate limited or a server error.
  const failedStatus = errorPageStatus(error)
  if (failedStatus) return <ErrorPage status={failedStatus} publicPage dashboardUrl={null} />

  if(data?.landingpage_data){

    return (
      <>
    

      <div className=' ' >
      <main
        ref={mainRef}
        style={{
          fontSize: editorConfig.root_font_size + 'px',
          height: '100vh',
          overflowY: 'scroll'
        }}
        className={cn(
          'judgify-editor bg-white relative main-container',
          data.landingpage_data.is_boxed === 1 && 'main-container-lp'
        )}>
        <RenderElement node={data.landingpage_data.content} canvas={data.landingpage_data.content} />
        { <ScrollToTopButton scrollRef={mainRef} />}
      </main>
      </div>
      </>
    )}
}

// const RenderPage = ()=> !isDev ? RenderPageProd() : <></>

export default RenderPage