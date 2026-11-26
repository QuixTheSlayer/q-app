import Canvas from '@/components/EditorUI/Canvas'
import ContentPanel from '@/components/ContentPanelUI'
import EditorWrapper from '@/components/EditorUI/EditorWrapper'
import PropertyPanel from '@/components/PropertyPanelUI'
import EditorContextProvider, { useEditor } from '@/context/EditorContext'
import { editorQuery, useGetPageDataQuery } from '@/store/query'
import ErrorPage from '@/pages/Error/ErrorPage'
import { errorPageStatus } from '@/utils/isUnauthorizedError'
import useSavePage from '@/hooks/useSavePage'
import { Button, buttonVariants } from '@/components/ui/primitives/button'
import { Dialog, DialogFooter, DialogTitle } from '@/components/ui/primitives/dialog-content'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import editorConfig from '@/configs/editor.config'

import { CheckCircle, Edit3, HomeIcon, Info, Loader } from 'lucide-react'
import { useTheme } from 'next-themes'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiSave } from "react-icons/fi";
import { TbProgressCheck, TbProgressAlert, TbProgress, TbProgressX, TbCapture } from "react-icons/tb";
import { RootState, useAppDispatch } from '@/store'
import useUploadToS3 from '@/hooks/useUploadToS3'
import { LuEye } from 'react-icons/lu'
import { toast } from 'sonner'
import { checkEventPlaceholders } from '@/utils/checkEventPlaceholders'
import { findPlanTierUsage } from '@/utils/planTierAudit'
import { useTranslation } from 'react-i18next'
import useEverywhere from '@/hooks/useEverywhere'
import useKeyCombo from '@/hooks/useKeyCombo'
import { isMacOS } from '@/utils/platform.utils'
import axios, { AxiosResponse } from 'axios'
import { usePreview } from '@/context/PreviewContext'
import RenderElement from '@/components/PreviewUI/RenderElement'
import { CanvasNode, LayoutNode } from '@/types/node.type'
import type { AnimationEntry } from '@/utils/scrollToInteraction.utils'
import { ToolTipPanel } from '@/components/ui/ToolTipPanel'
import { DialogClose } from '@/components/ui/primitives/dialog'
import { PanelRowContainer } from '@/components/PropertyPanelUI/ui'
import ImageEditorApp from '@/components/ImageEditor/src/App'
import EditorModal from '@/components/ui/components/Editor.modal'
import { useModal } from '@/context/ModalContext'
import { CheckBadgeIcon } from '@heroicons/react/24/outline'
import Konva from 'konva'
import { useAnimationCss } from '@/hooks/useAnimationCss'
import { useClassCss } from '@/hooks/useClassCss'
import { useClassJs } from '@/hooks/useClassJs'
import { RiXingFill } from 'react-icons/ri'
import { setIsAllow, updatePageDetail } from '@/store/global.slice'
import { useSelector } from 'react-redux'
import { cn } from '@/libs/cn'
import useOnboardingTour from '@/hooks/useOnboardingTour'
import OnboardingTour from '@/components/ui/OnboardingTour/OnboardingTour'
import EditorMoreMenu from '@/components/EditorUI/EditorMoreMenu'
import type { ImportedHtmlTree } from '@/utils/htmlToCanvasNodes'
import { remapNodeId } from '@/utils/remapNodeId'
import { isImportedPage, scopePageCss } from '@/utils/pageScope'
import { editorBreakpoints } from '@/utils/editorBreakpoints'
import { applyCodePolicy, codeForReview } from '@/utils/security/codePolicy'

function Editor() {
  const { t } = useTranslation('common')
  const { isLoading, isSuccess, data, error } = useGetPageDataQuery('')
  const { savePage, savingProcess } = useSavePage()
  const [title, setTitle] = useState<string>(data?.title ?? t('navbar.untitled'))

  useEffect(() => {
    if (data?.title) {
      setTitle(data?.title)
    }
  }, [data])

  const dispatch = useAppDispatch()

  // The user's `isAllow` flag is kept in the store for anything that reads it; the page's code no longer depends on it.
  const isAllow = data?.isAllow !== false
  useEffect(() => {
    dispatch(setIsAllow(isAllow))
  }, [isAllow, data?.id])


  const localPageData: string | null = localStorage.getItem('pageData') || null

  const canvas = useEditor()

  const [synced, setSynced] = React.useState<'synced' | 'unsynced' | 'syncing' | 'error' | 'Saved to local'>('synced')

  const { thumbnail } = useSelector((state: RootState) => state.globalState)

  // const [thumbnail, setThumbnail] = useState(data?.thumbnail || "")

  const [plan_type, setPlanType] = useState<'Pro' | 'Ent'>('Pro');

  const [is_boxed, setIsBoxed] = useState<1 | 0>(data?.is_boxed || 0);

  useEffect(() => {
    if (data?.is_boxed !== undefined) {
      setIsBoxed(data.is_boxed)
    }
  }, [data])


  const { isOpen } = useModal()

  useEffect(() => {

    if (data?.thumbnail) {
      dispatch(updatePageDetail({
        title: data.title,
        thumbnail: data?.thumbnail
      }))

    }
  }, [data])


  const dataForRender = (): CanvasNode => {

    return data?.content as CanvasNode
  }

  // Toolbar sits outside EditorContextProvider, so Import HTML can't use
  // useEditor() - write straight to the same RTK Query cache the
  // provider's own onUpdate writes to (see EditorContextProvider below).
  // A full HTML document represents a whole page, so import REPLACES the
  // page's content rather than appending to it.
  // Bumped whenever the toolbar replaces page content, so EditorContextProvider picks it up.
  const [externalContentVersion, setExternalContentVersion] = useState(0)

  const handleImportHtmlReplace = ({ root, css, js, externalStyles, externalScripts }: ImportedHtmlTree) => {
    if (!data?.content) return
    setSynced('unsynced')
    setExternalContentVersion((v) => v + 1)
    dispatch(editorQuery.util.updateQueryData('getPageData', '', (draft) => {
      const current = draft.content as LayoutNode
      // Keeps the root's id; old class rules/interactions from a previous import go with the old page.
      // The root keeps this page's id; anything in the tree pointing at the old root id follows it.
      const restored = remapNodeId(root, root.id, current.id) as LayoutNode
      draft.content = {
        ...current,
        ...restored,
        // Only a re-imported export has these; converted HTML leaves them unset, clearing the old page's.
        css: restored.css,
        js: restored.js,
        animation: restored.animation,
        plainCss: css || undefined,
        plainJS: js || undefined,
        // The new page's scripts and <html> attributes, never the old page's.
        pageScripts: restored.pageScripts,
        htmlAttributes: restored.htmlAttributes,
        // The code shows in the editor, but saving leaves it out (stripImportedCode): it is not accepted, support can add it.
        importedCode: css.trim() || js.trim() || restored.pageScripts?.length || externalStyles?.length || externalScripts?.length
          ? { plainCss: css || undefined, plainJS: js || undefined, pageScripts: !!restored.pageScripts?.length, externalStyles, externalScripts }
          : undefined,
      } as LayoutNode
    }))
  }


  const savePageData = async (localData?: string, auto = false) => {
    if (!data) return;

    const { hasSubmitEntryUrl, hasRegisterUrl } = checkEventPlaceholders(data)


    let nextPlanType: 'Pro' | 'Ent' = 'Pro'

    if (data.content) {
      const usages = findPlanTierUsage(data.content as CanvasNode)
      const tiers = new Set(usages.map((usage) => usage.tier))
      nextPlanType = tiers.has('Ent') ? 'Ent' : tiers.has('Pro') ? 'Pro' : 'Pro'
      setPlanType(nextPlanType)

      if (editorConfig.enable_plan_tier_save_warning && !auto) {
        const currentPlan = editorConfig.current_user_plan_PLACEHOLDER
        const exceedingUsages = usages.filter((usage) => currentPlan === 'Pro' || (usage.tier === 'Ent'))

        if (exceedingUsages.length > 0) {
          const exceedingTiers = [...new Set(exceedingUsages.map((usage) => usage.tier))]
          toast.warning(
            t('planTierSaveWarning', {
              count: exceedingUsages.length,
              tiers: nextPlanType.match('Ent') ? 'ENTERPRISE' : "PRO",
            })
          )
        }
      }
    }

    // Imported HTML code is never saved: remind the user on each manual save, with the same warning as at import.
    if (!auto && (data.content as LayoutNode | undefined)?.importedCode) {
      toast.warning(t('codeBlocked.message', { ns: 'insert', email: editorConfig.support_email }), { duration: 15000 })
    }

    try {

      setSynced('syncing')


      await savePage({
        data,
        title,
        thumbnail,
        extra: { plan_type: nextPlanType, is_boxed },
      }).then(() => localStorage.removeItem('pageData'))


      setSynced('synced')

    } catch {

      // localStorage.setItem('pageData', JSON.stringify(dataForUpdate))
      setSynced('error')
      toast.error(t('navbar.networkError'))
      return;
    }
  }

  // Auto save: every edit changes `data`/`title`/`is_boxed`, which restarts the timer, so the save
  // only fires after the page has been idle for auto_save_delay_ms. Failed saves ('error') aren't retried.
  const savePageDataRef = useRef(savePageData)
  savePageDataRef.current = savePageData

  // The preview size (boxed or full width) is saved with the page, so changing it saves the page right away.
  // The page data in the cache gets the new value too: it is re-applied to `is_boxed` whenever `data` changes,
  // so without this the choice would revert on the next edit.
  const savePreviewSizeRequested = useRef(false)
  const handlePreviewSizeChange = (value: 1 | 0) => {
    if (value === is_boxed) return
    dispatch(editorQuery.util.updateQueryData('getPageData', '', (draft) => { draft.is_boxed = value }))
    setIsBoxed(value)
    setSynced('unsynced')
    savePreviewSizeRequested.current = true
  }
  // Runs after the new value is rendered, so the save sends it.
  useEffect(() => {
    if (!savePreviewSizeRequested.current) return
    savePreviewSizeRequested.current = false
    savePageDataRef.current(undefined, true)
  }, [is_boxed])

  useEffect(() => {
    if (!editorConfig.enable_auto_save || synced !== 'unsynced') return
    const timer = setTimeout(() => { savePageDataRef.current(undefined, true) }, editorConfig.auto_save_delay_ms)
    return () => clearTimeout(timer)
  }, [synced, data, title, is_boxed])



  const updateFileName = (name: string) => {
    setTitle(name)
    if (synced === 'synced') {
      setSynced('unsynced')
    }

  }



  const content = data?.content

  // Persistent "this page uses Enterprise content" banner (under the
  // navbar) rather than the old save-time toast — see
  // editorConfig.enable_plan_tier_banner's doc comment for why.
  const enterpriseUsageCount = useMemo(() => {
    if (!editorConfig.enable_plan_tier_banner || !content) return 0
    return findPlanTierUsage(content as CanvasNode).filter((usage) => usage.tier === 'Ent').length
  }, [content])

  const css = useAnimationCss(content as CanvasNode, { editor: true })

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
    // An imported page's tag-only rules (`section {}`) stay off the builder's own panels, and its
    // breakpoints follow the canvas width in the tablet/mobile views (editorBreakpoints).
    const allowedContent = applyCodePolicy(content)
    const pageCss = isImportedPage(allowedContent) ? scopePageCss(allowedContent?.plainCss ?? '') : allowedContent?.plainCss
    const canvasCss = isImportedPage(allowedContent) && editorConfig.enable_editor_page_breakpoints ? editorBreakpoints(pageCss ?? '') : pageCss
      style.textContent = [classCss, canvasCss].filter(Boolean).join('\n')

    return () => {
      style?.remove()
    }
  }, [classCss, content?.plainCss])

  const classJs = useClassJs(content as CanvasNode)

  useEffect(() => {
    // A <script> tag only runs on insertion, not on textContent mutation -
    // remove and re-append a fresh one each time the rules actually change.
    document.body.querySelector('script[data-class-js]')?.remove()
    if (!classJs) return
    const script = document.createElement('script')
    script.setAttribute('data-class-js', '')
    script.textContent = classJs
    document.body.appendChild(script)

    return () => {
      document.body.querySelector('script[data-class-js]')?.remove()
    }
  }, [classJs])

  const { captureRef } = usePreview()

  const previewRef = useRef<HTMLDivElement>(null)

  const [view, setView] = useState<"desktop" | 'tablet' | 'mobile'>('desktop')

  const { resolvedTheme, setTheme } = useTheme()

  const tour = useOnboardingTour(isSuccess)

  useKeyCombo({
    key: 'd',
    ctrl: !isMacOS(),
    meta: isMacOS(),
    shift: true,
  }, (event) => {
    event.preventDefault()
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, !editorConfig.enable_theme_toggle)

  useKeyCombo({ key: 's', ctrl: !isMacOS(), meta: isMacOS() }, (event) => {
    event.preventDefault()
    savePageData()
  }, !editorConfig.enable_save_shortcut)

  // Preview shows the saved page, so unsaved changes are never silently skipped: remind the user to save first.
  const openPreview = () => {
    if (synced === 'syncing') return
    if (synced !== 'synced') {
      toast.warning(t('navbar.saveBeforePreview'), {
        id: 'save-before-preview',
        action: { label: t('navbar.save'), onClick: () => savePageData() },
      })
      return
    }
    window.location.href = `/landing-page-builder/preview/${data?.id}`
  }

  // Leaving by the address bar, a link or closing the tab with unsaved changes: the browser asks first.
  // (It shows its own text; a page cannot change it.)
  useEffect(() => {
    if (synced === 'synced') return
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving)
  }, [synced])

  useKeyCombo({ key: 'p', ctrl: !isMacOS(), meta: isMacOS() }, (event) => {
    event.preventDefault()
    openPreview()
  }, !editorConfig.enable_preview_switch_shortcut)

  // Calm status text beside the page title (not a badge): what the page's save state is right now.
  const saveStatus = {
    synced: { title: 'allChangesSaved', label: 'allChangesSaved', color: 'text-emerald-400', icon: <TbProgressCheck size={15} /> },
    unsynced: { title: 'unsavedChangesTitle', label: 'unsavedChanges', color: 'text-amber-400', icon: <TbProgressAlert size={15} /> },
    syncing: { title: 'savingChanges', label: 'savingChanges', color: 'text-white/60', icon: <TbProgress size={15} className='animate-spin' /> },
    error: { title: 'failedToSaveChanges', label: 'errorSyncing', color: 'text-rose-400', icon: <TbProgressX size={15} /> },
    'Saved to local': { title: 'savedToLocalStorageOnly', label: 'savedToLocal', color: 'text-amber-300', icon: <TbProgressX size={15} /> },
  }[synced as string]

  // The server refused or failed this page (not the owner, session ended, not found, rate limited, server error).
  const failedStatus = errorPageStatus(error)
  if (failedStatus) return <ErrorPage status={failedStatus} />

  // console.log("Is Box", is_boxed)
  // linear-gradient(to right, #374151 0%, #374151 100%,#374151 0%)
  if (data)
    return (

      <div className="  relative  justify-center flex overflow-x-auto overflow-y-hidden w-full h-full    " >

        <nav className='w-full h-[7%] fixed top-0 z-[99] border-b border-white/10 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 bg-[#333333]'>
          <div className='flex items-center gap-3 min-w-0'>
            <a href='/landing-page-builder/dashboard' aria-label={t('navbar.backToDashboard')} title={t('navbar.backToDashboard')} className='w-9 aspect-square hover:bg-white/10 rounded-md flex items-center justify-center text-white/80 hover:text-white transition-colors'>
              <HomeIcon size={20} /> 
            </a>
            <img src={"/images/logo(Original).png"} alt="" className='w-[72px] shrink-0' />
            <div className='h-6 w-px bg-white/15' />
            <div data-tour="page-name-input" className='group cus-gradient relative min-w-0'>
              <input type='text' aria-label={t('navbar.pageTitle')} title={t('navbar.pageTitle')} value={title} className='w-[clamp(150px,22vw,300px)] max-w-full bg-transparent text-white text-[15px] font-medium truncate rounded-md border border-transparent group-hover:border-white/20 focus:border-highlight focus:outline-0 pl-2 pr-7 py-1' onChange={(e) => {
                updateFileName(e.target.value)
              }} />
              <Edit3 className='absolute right-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none' size={14} />
            </div>
           
          </div>

          <div data-tour="view-switcher" role='group' aria-label={t('navbar.view')} className='flex items-center gap-1 rounded-lg bg-black/25 p-1 text-[13px]'>
            {(['desktop', 'tablet', 'mobile'] as const).map((v) => (
              <button key={v} type='button' aria-pressed={view === v} aria-label={t(`navbar.preview${v[0].toUpperCase()}${v.slice(1)}View`)} title={t(`navbar.preview${v[0].toUpperCase()}${v.slice(1)}View`)} onClick={() => setView(v)}
                className={cn('px-3 py-1 rounded-md transition-colors', view === v ? 'cus-gradient text-white' : 'text-white/60 hover:text-white')}>
                {t(`navbar.${v}`)}
              </button>
            ))}
          </div>

          {/* One filled button (Save, only while there is something to save), one plain one (Preview), and the rest in the menu. */}
          <div className='flex items-center justify-end gap-2'>

           {saveStatus && (
              <div role='status' title={t(`navbar.${saveStatus.title}`)} className={cn('hidden mx-4 lg:flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-medium', saveStatus.color)}>
                {saveStatus.icon}
                {t(`navbar.${saveStatus.label}`)}
              </div>
            )}
          
            <button
              type='button'
              data-tour="save-button"
              title={editorConfig.enable_save_shortcut ? t('navbar.saveShortcut', { keys: 'Ctrl+S' }) : t('navbar.save')}
              aria-label={t('navbar.savePage')}
              className={cn(
                'h-9 px-3 flex gap-2 items-center font-medium text-white rounded-md border transition-colors',
                synced === 'synced' ? 'border-white/20 text-white/60 hover:bg-white/10 cursor-default ' : ' cursor-pointer  cus-gradient border-primary'
              )}
              onClick={() => {
                if (synced === 'synced') return;
                savePageData()
              }}>
              <FiSave size={16} />
              <span className='max-xl:sr-only'>{t('navbar.save')}</span>
            </button>

              <button
              type='button'
              data-tour="preview-button"
              title={editorConfig.enable_preview_switch_shortcut ? t('navbar.switchToPreviewShortcut', { keys: 'Ctrl+P' }) : t('navbar.switchToPreview')}
              aria-label={t('navbar.switchToPreviewPage')}
              className={cn(synced === 'synced' ? "cus-gradient border-primary cursor-pointer ": 'cursor-pointer', '  h-9 px-3 gap-2 flex items-center font-medium text-white border border-white/25 rounded-md hover:bg-white/10 transition-colors')}
              onClick={openPreview}>
              <LuEye size={16} />
              <span className='max-xl:sr-only'>{t('navbar.preview')}</span>
            </button>


            <EditorMoreMenu
              css={codeForReview(data?.content).css}
              js={codeForReview(data?.content).js}
              hasExistingContent={(data?.content?.children?.length ?? 0) > 0}
              onImportReplace={handleImportHtmlReplace}
              isDark={resolvedTheme === 'dark'}
              onToggleTheme={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              onStartTour={() => tour.start()}
            />
          </div>
        </nav >



        {isSuccess &&
          <div style={{ top: '7%' }} className='   z-[99] fixed    w-full  h-full  ' >
            <EditorContextProvider content={dataForRender()} externalVersion={externalContentVersion} onUpdate={content => {
              setSynced('unsynced')

              dispatch(editorQuery.util.updateQueryData('getPageData', '', (draft) => {
                Object.assign(draft.content, content)
              }))
            }}>
              {
                isOpen && <div style={{
                  display: 'flex',
                  justifyContent: "center",
                  alignItems: 'center',



                }} className=' imageEditor z-[999999] w-auto h-auto  fixed gap-2   ' >
                  <EditorModal />

                </div>}

              {!isOpen && <Canvas enterpriseUsageCount={enterpriseUsageCount} view={view} data={data} is_boxed={is_boxed} setIsBoxed={handlePreviewSizeChange} refObj={{ canvasRef: canvas?.canvasRef as React.MutableRefObject<null> }} />}


            </EditorContextProvider>
          </div>



        }

        {editorConfig.enable_onboarding_tour && (
          <OnboardingTour
            isOpen={tour.isOpen}
            stepIndex={tour.stepIndex}
            steps={tour.steps}
            next={tour.next}
            back={tour.back}
            skip={tour.skip}
          />
        )}

        <div ref={previewRef} className=' w-[100vw] h-auto ' ></div>
        {/* {data?.content && <div className='    w-full h-auto bg-white   ' ref={captureRef} >
          {<RenderElement node={{
            ...(data.content),
            children: (data.content as LayoutNode)?.children?.slice(0, sectionCount) || []
          }} />}

        </div>} */}



        {/* <!-- Toast --> */}

      </div>



    )
}

export default Editor