import RenderNode from "./RenderNode";
import DndContextProvider from "../../context/DndContextProvider";
import useCanvasDnd from "../../hooks/useCanvasDnd";
import { useEditor } from "../../context/EditorContext";
import useCanvasKeyShortcut from "@/hooks/useCanvasKeyShortcut";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ContentPanel from "@/components/ContentPanelUI";
import EditorWrapper from "@/components/EditorUI/EditorWrapper";
import PropertyPanel from "@/components/PropertyPanelUI";
import './Canvas.css'
import { usePreview } from "@/context/PreviewContext";
import RenderElement from "../PreviewUI/RenderElement";
import CSSUtils from "@/utils/CSS.utils";
import FoldWrapper from "../ui/FoldWrapper";
import { CheckCircle, Loader, PlusIcon, Settings2Icon, Info, Grid2x2, Grid2x2X } from "lucide-react";
import { Select, SelectOption } from "../ui/Select";
import { ToolTipPanel } from "../ui/ToolTipPanel";
import { PanelRowContainer, SectionContainer } from "../PropertyPanelUI/ui";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/store";
import { isValidUrl } from "@/utils/isValidUrl";
import { cn } from "@/libs/cn";
import { Button, buttonVariants } from '@/components/ui/primitives/button'
import { Dialog, DialogFooter, DialogTitle } from '@/components/ui/primitives/dialog-content'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { DialogClose } from '@/components/ui/primitives/dialog'

import { useModal } from "@/context/ModalContext";
import { CanvasNode, DeviceScope, LayoutNode } from "@/types/node.type";
import { toast } from "sonner";
import { isDev } from "@/libs/checkEnv";
import { useGenerateThumbnailMutation } from "@/store/query";
import useSavePage from "@/hooks/useSavePage";
import { PageFile } from "@/types/contentFile.type";
import { updatePageDetail } from "@/store/global.slice";
import NumberInput from "../ui/inputs/NumberInput";
import editorConfig from "@/configs/editor.config";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { TOUR_PANEL_REQUEST_EVENT } from "@/hooks/useOnboardingTour";
import { useTranslation } from "react-i18next";
import { ReorderArrowHint } from "./ReorderArrowHint";
import useKeyHeld from "@/hooks/useKeyHeld";
import { MousePointerClick } from "lucide-react";
import { Stage, Layer, Rect, Group } from 'react-konva';
import { Html } from 'react-konva-utils';
import Panel from "./Panel/Panel";

const Canvas = ({ refObj, data, view, is_boxed, setIsBoxed, enterpriseUsageCount }: {
  data?: PageFile,
  refObj: {
    canvasRef: React.MutableRefObject<null>
  },
  view: string
  is_boxed?: 1 | 0
  setIsBoxed?: (is_boxed: 1 | 0) => void
  enterpriseUsageCount: number
}) => {
  const { t } = useTranslation('common')
  const { t: tInsert } = useTranslation('insert')
  const [position, setPosition] = React.useState({
    x: 350,
    y: 50,
  });
  const canvas = useEditor()
  const isInteractionModifierHeld = useKeyHeld('Alt', !editorConfig.enable_prototype_interactions)
  const { dragEventHandlers } = useCanvasDnd()

  const { previewRef, captureRef } = usePreview()

  const { updateModalProp, setModalType } = useModal()



  const [thumbnailCreateDialogIsOpen, setThumbnailCreateDialogIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false)

  // All hooks must run unconditionally on every render (Rules of Hooks) —
  // `canvas` can be undefined before the editor context is ready, so the
  // null check below happens *after* every hook call, not before.
  const dispatch = useAppDispatch()

  const { thumbnail, title } = useSelector((state: RootState) => state.globalState)

  useCanvasKeyShortcut(canvas)

  const nodeElement = useMemo(() => {
    const element = document.querySelector(`[data-id="${canvas?.focusedNode?.id}"]`);
    return element;
  }, [canvas?.focusedNode?.id]);

  const [panelType, setPanelType] = useState<'content' | 'property'>('content')
  const [pageSettingsFold, setPageSettingsFold] = useState(true)
  const { showCanvasGridBg, setShowCanvasGridBg } = canvas
  // The "Change" thumbnail trigger below is only ever revealed on hover
  // (bg-background/60 hidden group-hover:flex) — the onboarding tour has no
  // way to hover it, so it forces this true instead to spotlight it.
  const [forceShowThumbnailTrigger, setForceShowThumbnailTrigger] = useState(false)

  const { savePage, savingProcess } = useSavePage()
  const [generateThumbnail, generateThumbnailStatus] = useGenerateThumbnailMutation()

  const [sectionCount, setSectionCount] = useState(2)

  // Onboarding tour steps force this panel open (and, for the Property
  // panel, auto-focus the first node so it has real controls to show) via a
  // window event rather than props/context — see TOUR_PANEL_REQUEST_EVENT's
  // doc comment in useOnboardingTour.ts for why.
  useEffect(() => {
    const handlePanelRequest = (e: Event) => {
      const detail = (e as CustomEvent<'content' | 'property' | 'pageSettings' | 'pageSettingsChange'>).detail

      // Deliberately never force the real thumbnail-creation Dialog open
      // from here: opening it triggers React Aria's ariaHideOutside, which
      // marks every DOM node outside the dialog's own portal (including
      // this tour's own overlay) aria-hidden + pointer-events:none — the
      // tour becomes fully unclickable. Steps that need to explain what's
      // inside that dialog do so without a live target instead.
      if (detail === 'pageSettings' || detail === 'pageSettingsChange') {
        setPageSettingsFold(false)
        setForceShowThumbnailTrigger(detail === 'pageSettingsChange')
        return
      }

      if (detail !== 'content' && detail !== 'property') return
      setPanelType(detail)
      if (detail === 'property' && canvas && !canvas.focusedNode) {
        const firstChild = (canvas.content as LayoutNode)?.children?.[0]
        if (firstChild) {
          canvas.focusNode({ id: firstChild.id, path: 'root.0' })
        }
      }
    }
    window.addEventListener(TOUR_PANEL_REQUEST_EVENT, handlePanelRequest)
    return () => window.removeEventListener(TOUR_PANEL_REQUEST_EVENT, handlePanelRequest)
  }, [canvas])

  const canvasWidthSet = useRef(false)
  useEffect(() => {
    const width = view.match('desktop') ? '81.5em' : view.match('tablet') ? '41.5em' : view.match('mobile') ? '21.5em' : '81.5em'
    // Only write when the width really changes: an unchanged write on first render marked a freshly loaded page as unsaved.
    if (canvas && (canvas.content as LayoutNode)?.style?.width !== width) {
      // The first time (the page just loaded) this only sizes the canvas: a page saved in tablet or mobile view carries that
      // width, and putting it back to the desktop one is not an edit. Switching the view afterwards is.
      if (!canvasWidthSet.current) canvas.setCanvasWidth(width)
      else {
        canvas.updateContent((content) => ({
          ...content,
          // Merge, don't replace: the root's own background/padding/margin would be wiped otherwise.
          style: {
            ...content.style,
            width
          }
        }))
      }
    }
    if (canvas) canvasWidthSet.current = true
    // The device toggle also drives which responsive bucket the property panel edits.
    canvas?.setDeviceScope(view as DeviceScope)
  }, [view])

  useEffect(() => {
    if (canvas?.focusedNode) {
      setPanelType('property')
    } else {
      setPanelType('content')
    }

  }, [canvas?.focusedNode])

  if (!canvas) return null;

  {


    const localPageData: string | null = localStorage.getItem('pageData') || null


    async function handleCaptureThumbnail(e) {

      setUploading(true)
      e.preventDefault()

      if (!data?.id) {
        setUploading(false)
        return
      }

      const captureToast = toast.loading('Capturing thumbnail…')

      try {
        // Server-side capture (see documents/thumbnail-capture.md): the page
        // is already saved, so the backend fetches its own content, renders
        // it headlessly via Playwright, and screenshots it — no client-side
        // html2canvas/getDisplayMedia involved, and no need to read
        // renderElRef here at all.
        const result = await generateThumbnail({
          page_id: data.id,
          subfolder: 'page-thumbnails',
          section_count: sectionCount,
        }).unwrap()

        if (result.access_url) {

          dispatch(updatePageDetail({
            title: title,
            thumbnail: result.access_url
          }))

          savePage({
            data,
            title,
            thumbnail: result.access_url,
          })

        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to capture thumbnail.')
      } finally {
        toast.dismiss(captureToast)
        setUploading(false)
      }

    };

    const dataForRender = (): CanvasNode => {
      if (localPageData) {
        if (isDev) {
          return JSON.parse(JSON.parse(localPageData).page_content) as CanvasNode
        }
        return (JSON.parse(localPageData).content) as CanvasNode
      }
      return data?.content as CanvasNode
    }

    // console.log(localPageData &&JSON.parse(localPageData))


    const openFeature = true



    return (
      <div className='flex    w-full h-[95%]' id="">


        <DndContextProvider dragEventHandlers={dragEventHandlers}>

          {!openFeature && <Panel />}

          {/* Page Setting Panel */}
          {openFeature && editorConfig.enable_thumbnail_capture && <FoldWrapper dataTour="page-setting-panel-toggle" isFold={pageSettingsFold} onFoldChange={setPageSettingsFold} direction="right" defaultSize={350} changeTo={0} >
            <div className=" w-full px-3 h-full " >
              <SectionContainer label={tInsert('sections.pageSettings')} >
                <PanelRowContainer layoutType="col" label={tInsert('pageSettingsPanel.thumbnails')} >
                  <div className=" flex flex-col w-full justify-start items-center " >
                    <div className=" group  relative w-full h-[200px] border justify-center items-center rounded-md p-2 " >

                      <div className={cn('bg-background/60 left-0   z-[9999]  backdrop-blur-sm absolute gap-2 bottom-0 px-2 py-2  rounded-md  w-full h-full items-center justify-center', forceShowThumbnailTrigger ? 'flex' : 'hidden group-hover:flex')}>
                        <Dialog

                          isOpen={thumbnailCreateDialogIsOpen}
                          onOpenChange={(v) => setThumbnailCreateDialogIsOpen(v)}

                          renderTrigger={<label data-tour="thumbnail-change-trigger" onClick={() => {
                            canvas.clearFocus()
                          }} className={cn(buttonVariants({ size: 'sm', variant: 'primary' }), '  bg-primary items-center cursor-pointer')}>{tInsert('pageSettingsPanel.changeImage')}</label>}

                        >

                          <form className='thumbnail-modal-wrapper'  >
                            <DialogTitle >
                              {tInsert('pageSettingsPanel.createThumbnailImage')}
                            </DialogTitle>
                            <div className=' w-full max-h-[80vh] overflow-y-auto no-scrollbar flex flex-col  gap-4 ' >

                              <PanelRowContainer className=' px-2 py-2 ' layoutType='col' multiField label={tInsert('pageSettingsPanel.sectionCount')} >
                                <NumberField id='layout-gap'
                                  aria-label='Gap'
                                  className='w-[100%]'
                                  minValue={0}
                                  onCompositionEnd={v => console.log(v)}
                                  value={sectionCount}
                                  onChange={v => {
                                    setSectionCount(v)
                                  }}
                                  formatOptions={{

                                  }}
                                >
                                  <NumberFieldInput size="sm" />
                                </NumberField>
                              </PanelRowContainer>

                              <PanelRowContainer className=' w-full px-2 py-2 ' multiField layoutType='col' label={tInsert('pageSettingsPanel.preview')} >
                                <div data-testid="capturable-node" className='  bg-muted  transition-transform w-full  h-auto    '  >
                                  {canvas?.content && <div style={{
                                    zoom: '40%'
                                  }} className='   w-full  h-auto bg-white   ' ref={captureRef}   >
                                    {<RenderElement node={{
                                      ...(canvas.content),
                                      children: (canvas.content as LayoutNode)?.children?.slice(0, sectionCount) || []
                                    }}
                                      canvas={canvas.content}
                                    />}

                                  </div>}



                                </div>
                              </PanelRowContainer>

                              <PanelRowContainer className=' px-2 py-2 ' layoutType='col' multiField label={tInsert('pageSettingsPanel.currentThumbnail')} >
                                <div className='  w-full h-auto p-2 flex flex-col justify-center items-center  ' >


                                  {
                                    <div className=' relative w-full h-auto  flex justify-center items-center  ' >
                                      {
                                        uploading && <div className=' z-[100] absolute top-0 left-0 flex justify-center items-center w-full h-full bg-background/50 backdrop-blur-sm transition-transform  '>
                                          <Loader className='  transition-transform animate-spin ' size={30} />
                                        </div>
                                      }

                                      {
                                        generateThumbnailStatus.isSuccess && <div className=' absolute text-[var(--bs-text-success)] gap-2 px-2 z-[100] bottom-0 left-0 flex justify-center items-center w-full h-[40px] backdrop-blur-sm bg-popover/90 transition-transform  '>
                                          {tInsert('pageSettingsPanel.thumbnailUpdated')} <CheckCircle size={14} />
                                        </div>
                                      }
                                      {thumbnail && <img className=' border p-2 min-w-[200px] min-h-[100px] object-cover rounded ' src={thumbnail} alt="page's thumbnail" />}
                                    </div>
                                  }
                                </div>
                              </PanelRowContainer>



                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), ' border-primary text-primary bg-transparent items-center cursor-pointer')} type="button" variant="outline">
                                  {tInsert('pageSettingsPanel.close')}
                                </Button>
                              </DialogClose>
                              <Button className={cn(buttonVariants({ size: 'sm', variant: 'primary' }), ' bg-primary text-white  items-center cursor-pointer')} onClick={(e) => {
                                setUploading(true)
                                handleCaptureThumbnail(e)
                              }} type="submit">{tInsert('pageSettingsPanel.create')}</Button>
                            </DialogFooter>
                          </form>


                        </Dialog>
                      </div>
                      {isValidUrl(data?.thumbnail ?? thumbnail) && <img src={thumbnail} className=" object-cover w-full h-full " alt="" />}


                    </div>
                  </div>
                </PanelRowContainer>


              </SectionContainer>

              {editorConfig.enable_preview_screen_size_controller && <PageScreenSizeSettingSection is_boxed={is_boxed} setIsBoxed={setIsBoxed} />}

              <CanvasGridBgSettingSection showCanvasGridBg={showCanvasGridBg} setShowCanvasGridBg={setShowCanvasGridBg} />

              {editorConfig.enable_language_switcher && <PageLanguageSettingSection />}



              {/* <NumberInput className="" style={{

              }} value={0} onChange={(v)=>{
                console.log(v)
              }} /> */}
            </div>



            {/* <ContentPanel /> */}
          </FoldWrapper>}



          <EditorWrapper>
            {editorConfig.enable_prototype_interactions && isInteractionModifierHeld && (
              <div className="fixed top-0  -translate-x-1/2 z-[999]  items-center gap-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 shadow-lg pointer-events-none">
                <MousePointerClick size={14} />
                Testing interactions — click a node to fire its triggers
              </div>
            )}
            <div
              data-canvas-root
              className={cn(
                showCanvasGridBg && [
                  "[background-size:2em_2em]",
                  "[background-image:linear-gradient(to_right,#677E6140_1px,transparent_1px),linear-gradient(to_bottom,#677E6140_1px,transparent_1px)]",
                  "dark:[background-image:linear-gradient(to_right,#677E6180_1px,transparent_1px),linear-gradient(to_bottom,#677E6180_1px,transparent_1px)]",
                ],

                'judgify-editor editor-canvas-frame relative flex justify-start items-start    h-[93dvh] max-h-[95dvh] overflow-hidden  no-scrollbar  w-screen  min-w-[100dvw] bg-[#E0D9D9]/85  dark:bg-[#333333]/85 shadow-sm',
                editorConfig.enable_prototype_interactions && isInteractionModifierHeld && 'outline outline-2 outline-primary outline-offset-2 cursor-pointer'
              )} ref={refObj.canvasRef}>

              {enterpriseUsageCount > 0 &&
                <div role='note'
                  style={{ top: -80 }}
                  className=' tracking-wide sticky left-0 -mt-[80px] mb-[80px] z-[111] mx-auto min-w-full w-auto h-[34px] flex  justify-center items-center gap-2 px-4 py-1 backdrop-blur-md cus-banner-gradient border-b border-x border-primary/30 text-[#232323] dark:text-white text-[14px]'
                >
                  <div className=" flex justify-center items-center gap-2 min-w-full " >
                    <Info size={15} className='shrink-0  text-[#232323] dark:text-white' />
                    {t('planTierBanner', { count: enterpriseUsageCount })}
                  </div>




                </div>
              }

              {canvas.canvasRef && <div className=" absolute px-[40px] py-[30px] no-scrollbar  left-0 w-full max-w-full  h-full max-h-full overflow-auto flex flex-col justify-start items-center " >



                {(dataForRender() as LayoutNode)?.children?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 h-[400px] text-center text-muted-foreground">
                    <p className="text-sm">{t('canvas.emptyPageMessage')}</p>
                    <Button size="sm" onClick={() => setPanelType('content')}>
                      {t('canvas.openInsertPanel')}
                    </Button>
                  </div>
                ) : (
                  <>

                    <Stage className=" !cursor-drag " draggable width={1750} height={6000}  >
                      <Layer
                        className=" !cursor-drag "
                        draggable
                        x={position.x}
                        y={position.y}
                      >

                        <Html
                          groupProps={{ x: 0, y: 0 }} divProps={{ style: { opacity: 1, padding: 12, backgroundColor: "#23232380", width: 'fit-content', height: 'fit-content' } }}
                        >

                          <RenderNode node={dataForRender()} path="root" canvas={canvas} />
                        </Html>





                      </Layer>
                    </Stage>

                  </>


                )}
              </div>}
            </div>
          </EditorWrapper>
          <ReorderArrowHint canvas={canvas} />

          {openFeature && <FoldWrapper direction="left" defaultSize={440} changeTo={0} >
            <div className=" relative flex w-full h-full " >
              <div className=" flex flex-col absolute z-[9999] gap-2 h-auto left-[-30px] top-[65px] w-[30px] rounded-l  min-h-[40px] " >
                <div data-tour="insert-panel-toggle" role='button' tabIndex={0} aria-label={t('canvas.openInsertPanel')} title={t('canvas.openInsertPanel')} onClick={() => {
                  setPanelType('content')
                }}
                  className={cn(" cursor-pointer backdrop-blur-md rounded-l w-full flex justify-center items-center h-[80px] border border-border/50 ", panelType === 'content' ? 'bg-primary text-primary-foreground' : 'bg-background text-forground hover:bg-primary/40 hover:text-primary')} >
                  <PlusIcon size={16} />
                </div>
                <div data-tour="property-panel-toggle" role='button' tabIndex={0} aria-label={t('canvas.openPropertyPanel')} title={t('canvas.openPropertyPanel')} onClick={() => {
                  setPanelType('property')
                }}
                  className={cn(" cursor-pointer backdrop-blur-md rounded-l px-2 w-full flex justify-center items-center h-auto min-h-[80px] border border-border/50 ", panelType === 'property' ? 'bg-primary text-primary-foreground' : 'bg-background text-forground hover:bg-primary/40 hover:text-primary')} >
                  <Settings2Icon size={16} />
                </div>
              </div>


              {
                panelType === 'content' && <ContentPanel />
              }
              {
                panelType === 'property' && <PropertyPanel key={canvas?.focusedNode?.id} />
              }
            </div>

          </FoldWrapper>}



          {/* No longer used for capture (that's server-side now — see
              documents/thumbnail-capture.md and ActionMenu.tsx's
              handleCapture) but canvas.focusedNode still needs to stay
              mounted off-screen for other reasons, so this is left as a
              plain always-hidden container rather than removed outright. */}
          <div className='absolute top-[-999999px] w-auto h-auto p-2'>
            {canvas.focusedNode && <div style={{
              zoom: '0%'
            }} className='   w-auto   h-auto  p-2 ' ref={previewRef} >
              {<RenderElement node={{
                ...canvas.focusedNode,
                style: {
                  ...canvas.focusedNode.style,
                  position: "relative"

                }
              }}
                canvas={canvas.content}

              />}

            </div>}
          </div>
        </DndContextProvider>
      </div>

    );
  }
};

export default Canvas;


function PageScreenSizeSettingSection({ is_boxed, setIsBoxed }: { is_boxed?: 1 | 0, setIsBoxed?: (is_boxed: 1 | 0) => void }) {
  const { t } = useTranslation('insert')
  const selectedKey = is_boxed === 1 ? 'auto' : 'max-screen'

  const screenSizeOptions = [
    { id: 'auto', label: t('pageSettingsPanel.screenSizeAuto') },
    { id: 'max-screen', label: t('pageSettingsPanel.screenSizeMaxScreen') },
  ] as const

  return (
    <div className="mt-5">
      <div className="border rounded-lg p-3 flex items-center gap-2">
        <span className="text-[12px] text-muted-foreground min-w-[80px]">
          {t('pageSettingsPanel.previewSize')}
        </span>
        <div className="flex-1">
          <Select
            aria-label={t('pageSettingsPanel.previewScreenSizeAria')}
            size="sm"
            items={screenSizeOptions}
            selectedKey={selectedKey}
            onSelectionChange={(key) => setIsBoxed?.(key === 'auto' ? 1 : 0)}
          >
            {(item) => <SelectOption id={item.id}>{item.label}</SelectOption>}
          </Select>
        </div>
        <ToolTipPanel label={t('pageSettingsPanel.previewSizeTooltip')}>
          <Info size={14} className="text-muted-foreground cursor-help shrink-0" />
        </ToolTipPanel>
      </div>
    </div>
  );
}

function CanvasGridBgSettingSection({ showCanvasGridBg, setShowCanvasGridBg }: { showCanvasGridBg: boolean, setShowCanvasGridBg: (show: boolean) => void }) {
  const { t } = useTranslation('insert')

  return (
    <div className="mt-5">
      <div className="border rounded-lg p-3 flex items-center gap-2">
        <span className="text-[12px] text-muted-foreground min-w-[80px] flex-1">
          {t('pageSettingsPanel.canvasGridBg')}
        </span>
        <button
          type="button"
          aria-label={t('pageSettingsPanel.canvasGridBg')}
          aria-pressed={showCanvasGridBg}
          title={t('pageSettingsPanel.canvasGridBgTooltip')}
          onClick={() => setShowCanvasGridBg(!showCanvasGridBg)}
          className={cn(
            "relative w-[28px] aspect-square border p-1 rounded-md flex items-center justify-center transition-colors",
            showCanvasGridBg ? "bg-primary/20 text-primary border-primary/40" : "text-muted-foreground hover:bg-primary/20 hover:text-primary"
          )}
        >
          {showCanvasGridBg ? <Grid2x2 size={16} /> : <Grid2x2X size={16} />}
        </button>
        <ToolTipPanel label={t('pageSettingsPanel.canvasGridBgTooltip')}>
          <Info size={14} className="text-muted-foreground cursor-help shrink-0" />
        </ToolTipPanel>
      </div>
    </div>
  );
}

function PageLanguageSettingSection() {
  const { t } = useTranslation("insert");

  return (
    <div className="mt-5">
      <div className="border rounded-lg p-3 flex items-center gap-2">
        <span className="text-[12px] text-muted-foreground min-w-[80px]">
          {t('sections.language')}
        </span>
        <div className="flex-1">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}

