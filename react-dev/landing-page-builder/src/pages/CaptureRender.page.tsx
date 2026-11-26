import RenderElement from '@/components/PreviewUI/RenderElement'
import { useGetCaptureRenderDataQuery } from '@/store/query'
import { getIdFromUrl } from '@/utils/getIdFromUrl'
import { useEffect, useMemo } from 'react'
import { cn } from '@/libs/cn'
import { CanvasNode, LayoutNode } from '@/types/node.type'
import { useResponsiveCss } from '@/hooks/useResponsiveCss'
import { useClassJs } from '@/hooks/useClassJs'
import { useScrollToInteractions } from '@/hooks/useScrollToInteractions'
import { useAnimationCss } from '@/hooks/useAnimationCss'
import { needsSandbox } from '@/utils/security/sandboxDocument'
import { isImportedPage, scopePageCss } from '@/utils/pageScope'
import { useClassCss } from '@/hooks/useClassCss'
import { applyCodePolicy } from '@/utils/security/codePolicy'

/**
 * Chrome-less render target for server-side thumbnail capture — see
 * documents/thumbnail-capture.md. Nothing about this page is meant for a
 * human: it's only ever navigated to by the headless Playwright browser
 * driving packages/JLandingBuilder/bin/capture-thumbnail.cjs, which waits
 * for the `data-capture-ready` attribute below before screenshotting it.
 *
 * The token in the URL (`/capture-render/{token}`) is a short-lived,
 * randomly generated cache key minted by generateThumbnail() — not a page
 * id, and not tied to a logged-in session (this route is unauthenticated on
 * the backend for exactly that reason).
 */
function CaptureRenderPage() {
  const token = useMemo(() => getIdFromUrl(), [])

  const { data, isSuccess, isError } = useGetCaptureRenderDataQuery(token || '', {
    skip: !token,
  })



  const content = useMemo(() => applyCodePolicy(data?.content), [data?.content])


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

  const responsiveCss = useResponsiveCss(content)

  useEffect(() => {
    if (!responsiveCss) return
    const style = document.createElement('style')
    style.setAttribute('css-responsive', '')
    style.textContent = responsiveCss
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [responsiveCss])

  const classCss = useClassCss(content as CanvasNode)

  useEffect(() => {
    let style = document.querySelector<HTMLStyleElement>('style[css-class]')
    if (!style) {
      style = document.createElement('style')
      style.setAttribute('css-class', '')
      // At the end of <body>, after the builder's and the site's own stylesheets, so the page's
      // rules win ties with theirs (e.g. its `h1 {}` over Tailwind's reset).
      document.body.appendChild(style)
    }
    // An imported page's tag-only rules (`section {}`) stay off the builder's own panels.
    style.textContent = [classCss, isImportedPage(content) ? scopePageCss(content?.plainCss ?? '') : content?.plainCss].filter(Boolean).join('\n')

    return () => {
      style?.remove()
    }
  }, [classCss, content?.plainCss])






  if (isError || !token) {
    return <div>Capture data not found or expired.</div>
  }

  if (!isSuccess || !data?.content) {
    return null
  }

  const node = data.section_count
    ? {
      ...data.content,
      children: (data.content as LayoutNode)?.children?.slice(0, data.section_count) || [],
    }
    : data.content

  return (
    <div
      data-capture-ready="true"
      className={cn('bg-white w-[81.5em]', data.is_boxed === 1 && 'main-container-lp')}
    >
      <RenderElement node={node} canvas={data.content} />
    </div>
  )
}

export default CaptureRenderPage
