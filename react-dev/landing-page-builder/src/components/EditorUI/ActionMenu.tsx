import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/ToolTip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/DropDownMenu"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover'
import { Dialog, DialogFooter, DialogTitle } from '@/components/ui/primitives/dialog-content'
import { DialogClose } from '@/components/ui/primitives/dialog'
import { htmlToCanvasNode } from '@/utils/htmlToCanvasNodes'
import nodeUpdater from '@/utils/nodeUpdater'
import { hasChildNode } from '@/utils/hasChildNode'
import { Code2, Download, FileCode, Replace } from 'lucide-react'
import { IoDuplicateOutline, IoCopyOutline, IoAddCircleOutline } from 'react-icons/io5'
import { IoIosCreate, IoIosMore, IoMdCreate } from "react-icons/io"
import { PiTrash } from "react-icons/pi";
import { AiOutlineExpand } from "react-icons/ai";
import { EditorContextType } from '@/context/EditorContext'
import { GoPaste } from "react-icons/go";
import { getCtrlShortcutKey } from '@/utils/platform.utils'
import { Edit3, Link, Trash, Group, ArrowLeftRight, ArrowUpDown, SplitSquareHorizontal, Grid2x2, Grid2x2X } from 'lucide-react'
import editorConfig from '@/configs/editor.config'
import PlainTextInput from '@/components/ui/inputs/PlainTextInput'
import { Button } from '@/components/ui/primitives/button'
import { TextInput } from '@/components/ui/primitives/text-input'
import { useEffect, useMemo, useState } from 'react'
import { useSaveComponentDataMutation, useGenerateThumbnailMutation } from "@/store/query.ts";
import { protectPageCode } from "@/utils/security/codeCrypto";
import { CanvasNode, LayoutNode } from "@/types/node.type.ts";
import { RootState, useAppDispatch } from "@/store";
import { useSelector } from 'react-redux'
import { useAnimationCss } from '@/hooks/useAnimationCss'
import { useResponsiveCss } from '@/hooks/useResponsiveCss'
import { useClassCss } from '@/hooks/useClassCss'
import { applyCodePolicy } from '@/utils/security/codePolicy'
import { buildNodeExportHtml } from '@/utils/nodeExportHtml'
import generateCryptoUID from "@/utils/generateCryptoUID.ts";
import { cn } from '@/libs/cn'
import { debounce } from '@/utils/canvas.utils'
import { Toaster } from '../ui/sonner'
import { toast } from 'sonner'
import { closeModal, openModal, toggleLoading } from '@/store/global.slice'
import { useTranslation } from 'react-i18next'
import { findPlanTierUsage } from '@/utils/planTierAudit'
interface Props {
  canvas: EditorContextType
}

export function ActionMenu({ canvas }: Props) {

  const { t } = useTranslation('actionMenu')
  const shortCutKey = getCtrlShortcutKey();

  const node = canvas.focusedNode

  const isAllow = useSelector((state: RootState) => state.globalState.isAllow)
  const animationCss = useAnimationCss(canvas.content as unknown as Parameters<typeof useAnimationCss>[0])
  const responsiveCss = useResponsiveCss(canvas.content)
  const classCss = useClassCss(canvas.content)

  const [saveComponent, { isLoading, isSuccess }] = useSaveComponentDataMutation()

  const [blockName, setBlockName] = useState<string>((node?.name ?? node?.contentType) || '')

  const [capturing, setCapturing] = useState(false)

  const [importHtmlOpen, setImportHtmlOpen] = useState(false)
  const [importHtmlValue, setImportHtmlValue] = useState('')

  let nodeId: string = blockName



  const [generateThumbnail] = useGenerateThumbnailMutation()

  const changeName = useMemo(() => debounce((e: React.ChangeEvent<HTMLInputElement>) => {

    canvas.updateNode((node) => ({
      ...node,
      name: e.target.value
    }))
  }, 200), [blockName])


  useEffect(() => {
    if (isSuccess === true) {
      dispatch(toggleLoading(false))
      dispatch(closeModal())
    }
  }, [isSuccess])


  const dispatch = useAppDispatch()


  const cantDel = canvas?.focusedNode?.contentType === 'section' && canvas.content.children?.length < 2

  const handleCapture = async (): Promise<string> => {

    // Server-side capture (see documents/thumbnail-capture.md): the focused
    // node is sent as raw JSON to the backend, which renders it headlessly
    // via Playwright and screenshots it - no DOM ref, no client-side
    // html2canvas/getDisplayMedia involved.
    setCapturing(true)
    const captureToast = toast.loading(t('createTemplateModal.capturing', { defaultValue: 'Capturing your component…' }))

    try {
      if (!canvas.focusedNode) {
        throw new Error("Render not ready!")
      }

      const result = await generateThumbnail({
        // Same as saving a page: the firewall rejects raw SVG and CSS, and the capture page decrypts it again.
        node: await protectPageCode(canvas.focusedNode as CanvasNode),
        subfolder: nodeId,
      }).unwrap()

      return result.access_url
    } finally {
      setCapturing(false)
      setCapturing(false)
      toast.dismiss(captureToast)
    }

  };

  const handleImportHtmlIntoNode = () => {
    if (!importHtmlValue.trim() || !canvas.focusedNode || !canvas.focused) return
    // Only container-shaped nodes (block/section/...) actually have a
    // `children: CanvasNode[]` field - text/button/image/video nodes store
    // their content as a plain string, and setting an array there would
    // crash React trying to render raw node objects as children.
    if (!hasChildNode(canvas.focusedNode)) {
      toast.error(t('menu.importHtmlFailed'))
      return
    }
    try {
      const { nodes, animations, css, js } = htmlToCanvasNode(importHtmlValue)
      if (nodes.length === 0) {
        toast.warning(t('menu.importHtmlNothingConverted'))
        return
      }
      const targetPath = canvas.focused.path
      // A single atomic update - canvas.updateNode() + canvas.updateContent()
      // as two separate calls would each read the same pre-update `content`
      // closure, so the second call's result (missing whatever the first
      // one changed) would clobber it once both land.
      canvas.updateContent((current) => {
        const withChildren = targetPath === 'root' || !targetPath
          ? ({ ...current, children: nodes } as CanvasNode)
          : nodeUpdater(current, targetPath.split('.').map(Number), (node) => ({ ...node, children: nodes }) as CanvasNode)
        const layout = withChildren as LayoutNode
        return {
          ...withChildren,
          animation: [...(withChildren.animation ?? []), ...animations] as unknown as typeof withChildren.animation,
          css: { ...layout.css, ...css },
          js: { ...layout.js, ...js },
        } as CanvasNode
      })
      toast.success(t('menu.importHtmlSuccess'))
      setImportHtmlValue('')
      setImportHtmlOpen(false)
    } catch {
      toast.error(t('menu.importHtmlFailed'))
    }
  }

  const handleExportHtml = () => {
    if (!canvas.focusedNode) return
    const el = document.querySelector(`[data-id="${canvas.focusedNode.id}"]`)
    if (!el) {
      toast.error(t('menu.exportHtmlFailed'))
      return
    }
    const html = buildNodeExportHtml(el, [animationCss, responsiveCss, classCss, applyCodePolicy(canvas.content)?.plainCss])
    navigator.clipboard.writeText(html).then(() => {
      toast.success(t('menu.exportHtmlSuccess'))
    }).catch(() => {
      toast.error(t('menu.exportHtmlFailed'))
    })
  }

  const handleExportImage = async () => {
    try {
      const url = await handleCapture()
      const link = document.createElement('a')
      link.href = url
      link.download = `${nodeId || 'element'}.png`
      link.target = '_blank'
      link.rel = 'noopener'
      link.click()
    } catch {
      toast.error(t('menu.exportImageFailed'))
    }
  }


  const [modalState, setModalState] = useState<{
    title: string,
    description: string,
    onSubmit?: () => void,
    onCancel?: () => void
  }>({
    title: '',
    description: '',
  })

  const [plan_type, setPlanType] = useState<'Pro' | 'Ent'>('Pro');

  let nextPlanType: 'Pro' | 'Ent' = 'Pro'

  function createTemplate() {
    nodeId = generateCryptoUID()

    setModalState({
      title: t('createTemplateModal.title'),
      description: t('createTemplateModal.description'),
      onSubmit: async () => {
        dispatch(toggleLoading(true))


        if (!canvas?.focusedNode) return;

        const usages = findPlanTierUsage(canvas?.focusedNode as CanvasNode)
        const tiers = new Set(usages.map((usage) => usage.tier))
        console.log(tiers)
        nextPlanType = tiers.has('Ent') ? 'Ent' : tiers.has('Pro') ? 'Pro' : 'Pro'
        setPlanType(nextPlanType)

        try {
          const access_url = await handleCapture()

          await saveComponent({
            content: JSON.stringify({
              ...canvas.focusedNode as LayoutNode,
              id: nodeId
            }),
            thumbnail_url: access_url,
            title: (canvas.focusedNode?.name || canvas.focusedNode?.contentType) || '',
            plan_type: nextPlanType
          }).unwrap()

          // if (editorConfig.enable_plan_tier_save_warning) {
          //   const currentPlan = editorConfig.current_user_plan_PLACEHOLDER
          //   const exceedingUsages = usages.filter((usage) => currentPlan === 'Pro' || ( usage.tier === 'Ent'))

          //   if (exceedingUsages.length > 0) {
          //     const exceedingTiers = [...new Set(exceedingUsages.map((usage) => usage.tier))]
          //     toast.warning(
          //       t('planTierSaveWarning', {
          //         count: exceedingUsages.length,
          //         tiers: nextPlanType.match('Ent')?'ENTERPRISE':"PRO",
          //       })
          //     )
          //   }
          // }

          toast.success(t('toast.subTemplateCreated', { name: (canvas.focusedNode?.name || canvas.focusedNode?.contentType) || '' }))

          // No manual cache patch needed here - saveComponentData already
          // has invalidatesTags: ["editorQuery"] and getComponentsData
          // provides that same tag, so RTK Query already refetches the list
          // on its own. The manual patch this replaced assumed `draft` was
          // a plain array, but the real backend response is wrapped
          // ({msg, status_code, data: [...]} via respondWithSuccessForJs),
          // so draft was that envelope object, not an array - draft.push
          // threw "draft.push is not a function" once a save actually
          // reached this far (previously masked by earlier capture failures).
        } catch (error) {
          dispatch(toggleLoading(false))
          toast.error(error instanceof Error ? error.message : 'Failed to create template.')
        } finally {
          setCapturing(false)
        }
      },
      onCancel: () => {
        dispatch(closeModal())
      }
    })
  }

  useEffect(() => {
    if (modalState.onSubmit) {
      dispatch(openModal({
        title: modalState.title,
        description: modalState.description,
        onSubmit: modalState.onSubmit,
        onCancel: modalState.onCancel
      }))
    }
  }, [modalState])

  if (canvas?.focusedNode && canvas.focusedNode?.contentType !== 'root')
    return (
      <div className='builder-panel bg-transparent flex relative  flex-row items-center gap-2'>

        <div className="bg-popover  rounded-full shadow-lg border border-solid border-border p-0.5 flex items-center gap-0.5">
          <div className='rounded-full h-8 px-3 py-1 inline-flex items-center justify-center bg-primary/20 capitalize text-[0.85rem] font-medium mr-1'>
            <PlainTextInput value={blockName} className={cn('cursor-default h-full !bg-transparent border-[1px] text-foreground border-none border-primary/20 hover:!border-none w-[100%] hover:outline-none focus:outline-0 focus:!border-highlight p-[2px] px-[6px] text-[14px] rounded-[0.3rem] font-medium truncate'
            )}

              // onClick={handleClick}
              onChange={(e) => {
                setBlockName(e.currentTarget.value)
                changeName(e)

              }}
            />

            <Edit3 className='  right-2 ' size={14} />
            {/* { canvas.focusedNode?.name ??camelToSentenceCase( canvas.focusedNode.contentType)} */}
          </div>
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button onClick={e => {
                  e.stopPropagation()
                  canvas.duplicateNode()
                }} className='rounded-full size-8 inline-flex items-center justify-center hover:bg-accent'>
                  <IoDuplicateOutline size={17} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('tooltip.duplicate')}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                {
                  capturing ? <button disabled className='rounded-full size-8 inline-flex items-center justify-center hover:bg-accent'>
                    <IoAddCircleOutline size={17} />
                  </button>
                    :
                    <button onClick={async (e) => {
                      e.stopPropagation()
                      // canvas.()



                      createTemplate()


                    }} className='rounded-full size-8 inline-flex items-center justify-center hover:bg-accent'>
                      <IoAddCircleOutline size={17} />
                    </button>

                }

              </TooltipTrigger>
              <TooltipContent>
                <p>{t('tooltip.createTemplate')}</p>
              </TooltipContent>
            </Tooltip>

            {!cantDel && <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button onClick={async (e) => {
                  e.stopPropagation()
                  if (cantDel) return;
                  canvas.deleteNode()

                }}
                  className='rounded-full size-8 inline-flex items-center justify-center hover:bg-accent'
                >
                  <PiTrash size={19} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('tooltip.delete')}</p>
              </TooltipContent>
            </Tooltip>}

            {canvas.focusedNode.contentType !== 'section' && <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button onClick={e => {
                  e.stopPropagation()
                  if (!canvas.focused) return;
                  canvas.selectParent()
                }} className='rounded-full size-8 inline-flex items-center justify-center hover:bg-accent'>
                  <AiOutlineExpand size={17} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('tooltip.selectParent')}</p>
              </TooltipContent>
            </Tooltip>}

            {(canvas.focusedNode.contentType === 'text' && !canvas.textEditorObj?.state.selection.empty) &&
              (<Popover>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <PopoverTrigger onClick={e => e.stopPropagation()} className={'rounded-full size-8 inline-flex items-center justify-center hover:bg-accent data-[state=open]:bg-accent'}>
                      <Link size={16} />
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('tooltip.link')}</p>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="border rounded-[0.6rem] p-3 shadow-sm font-medium bg-popover">
                  <SetLinkPopover canvas={canvas} />
                </PopoverContent>
              </Popover>)
            }

            <DropdownMenu>
              <Tooltip delayDuration={100}>
                <TooltipTrigger>
                  <DropdownMenuTrigger onClick={e => e.stopPropagation()} className={'rounded-full size-8 inline-flex items-center justify-center hover:bg-accent data-[state=open]:bg-accent'}>
                    <IoIosMore size={18} />
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('tooltip.moreActions')}</p>
                </TooltipContent>
              </Tooltip>

              <DropdownMenuContent className="w-56 z-[999999] ">
                <DropdownMenuLabel>{t('menu.actionsLabel')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={e => canvas.copyContent()}>
                    <div className='flex items-center gap-2'>
                      <IoCopyOutline size={17} />
                      {t('menu.copy')}
                    </div>
                    <DropdownMenuShortcut>{shortCutKey}C</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={e => canvas.pasteContent()}>
                    <div className='flex items-center gap-2'>
                      <GoPaste size={17} />
                      {t('menu.paste')}
                    </div>
                    <DropdownMenuShortcut>{shortCutKey}V</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={e => canvas.duplicateNode()}>
                    <div className='flex items-center gap-2'>
                      <IoDuplicateOutline size={17} />
                      {t('menu.duplicate')}
                    </div>
                    <DropdownMenuShortcut>{shortCutKey}D</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  {editorConfig.enable_replace_action && node?.contentType !== 'root' && (
                    <DropdownMenuItem
                      disabled={!canvas.clipBoard?.node || canvas.clipBoard.node.id === node?.id}
                      onClick={() => canvas.replaceWithCopied()}
                    >
                      <div className='flex items-center gap-2'>
                        <Replace size={17} />
                        {t('menu.replace')}
                      </div>
                      <DropdownMenuShortcut>{shortCutKey} + ⇧ + V</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  )}
                  {/* {canvas.focusedNode && hasChildNode(canvas.focusedNode) && (
                    <DropdownMenuItem onClick={e => { e.preventDefault(); setImportHtmlOpen(true) }}>
                      <div className='flex items-center gap-2'>
                        <Code2 size={17} />
                        {t('menu.importHtml')}
                      </div>
                    </DropdownMenuItem>
                  )} */}
                  <DropdownMenuItem onClick={handleExportHtml}>
                    <div className='flex items-center gap-2'>
                      <FileCode size={17} />
                      {t('menu.exportHtml')}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportImage}>
                    <div className='flex items-center gap-2'>
                      <Download size={17} />
                      {t('menu.exportImage')}
                    </div>
                  </DropdownMenuItem>
                  {canvas.focusedParent?.path !== 'root' && <DropdownMenuItem onClick={e => canvas.deleteNode()}>
                    <div className='flex items-center gap-1.5 -m-[0.1rem]'>
                      <PiTrash size={20} />
                      {t('menu.delete')}
                    </div>
                    <DropdownMenuShortcut>DEL</DropdownMenuShortcut>
                  </DropdownMenuItem>}
                  {editorConfig.enable_group_action && <DropdownMenuItem onClick={e => canvas.groupSelectedNodes()}>
                    <div className='flex items-center gap-2'>
                      <Group size={17} />
                      {t('menu.group')}
                    </div>
                    <DropdownMenuShortcut>{shortCutKey}G</DropdownMenuShortcut>
                  </DropdownMenuItem>}
                  {editorConfig.enable_split_join_action && ['block', 'section'].includes(node?.contentType ?? '') && (
                    <DropdownMenuItem onClick={e => canvas.splitFocusedBlock()}>
                      <div className='flex items-center gap-2'>
                        <SplitSquareHorizontal size={17} />
                        {t('menu.split')}
                      </div>
                      <DropdownMenuShortcut>{shortCutKey} + ⇧ + S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  )}
                  {editorConfig.enable_split_join_action && canvas.canJoinFocusedBlock() && (
                    <DropdownMenuItem onClick={e => canvas.joinFocusedBlock()}>
                      <div className='flex items-center gap-2'>
                        <SplitSquareHorizontal size={17} className='rotate-180' />
                        {t('menu.joinWithNext')}
                      </div>
                      <DropdownMenuShortcut>{shortCutKey} + ⇧ + U</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  )}
                  {editorConfig.enable_arrow_key_reorder && (() => {
                    // Matches useCanvasKeyShortcut's exact row/column-or-grid
                    // determination — root is always a vertical stack of
                    // sections regardless of its own flexDirection, so it's
                    // treated as column-like here too, not literally by style.
                    const isRootParent = canvas.parentNode?.contentType === 'root'
                    const isRowParent = !isRootParent && canvas.parentNode?.style?.display === 'flex' && canvas.parentNode?.style?.flexDirection !== 'column'
                    return (
                      <div className='flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground'>
                        {isRowParent ? <ArrowLeftRight size={17} /> : <ArrowUpDown size={17} />}
                        {isRowParent ? t('menu.moveRow') : t('menu.moveColumn')}
                      </div>
                    )
                  })()}
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem onClick={e => canvas.setShowCanvasGridBg(!canvas.showCanvasGridBg)}>
                    <div className='flex items-center gap-2'>
                      {canvas.showCanvasGridBg ? <Grid2x2X size={17} /> : <Grid2x2 size={17} />}
                      {canvas.showCanvasGridBg ? t('menu.hideGrid') : t('menu.showGrid')}
                    </div>
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={e => canvas.selectParent()}>
                    <div className='flex items-center gap-2'>
                      <AiOutlineExpand size={17} />
                      {t('menu.selectParent')}
                    </div>
                    <DropdownMenuShortcut>{shortCutKey}↑</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>

        </div>

        <Dialog
          className="p-4 rounded-md z-[99999999] w-[560px] max-h-[80vh] overflow-y-auto"
          isOpen={importHtmlOpen}
          onOpenChange={setImportHtmlOpen}
        >
          <DialogTitle>{t('menu.importHtml')}</DialogTitle>
          <div className="text-xs text-muted-foreground mt-1 mb-4">
            {t('menu.importHtmlDescription')}
          </div>
          <textarea
            value={importHtmlValue}
            onChange={(e) => setImportHtmlValue(e.target.value)}
            placeholder='<div class="card">...</div>'
            className="w-full h-[240px] rounded-md border border-border bg-background p-3 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            spellCheck={false}
          />
          <DialogFooter className="mt-5">
            <DialogClose asChild>
              <Button type="button" variant="secondary">{t('dialog.cancel')}</Button>
            </DialogClose>
            <Button type="button" variant="primary" onClick={handleImportHtmlIntoNode}>
              {t('menu.importHtml')}
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    )
}


const SetLinkPopover = ({ canvas }: {
  canvas: EditorContextType
}) => {
  const [url, setUrl] = useState(canvas.textEditorObj?.getAttributes('link').href);

  const handleSetLink = () => {
    if (canvas.focusedNode?.contentType !== 'text') return;

    if (!url) {
      handleUnSetLink()
      return
    }

    if (url) {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url);

      let href = '';
      let target = '_blank';

      // console.log(url)
      if (url.startsWith('#')) {
        // Internal link (anchor)
        href = url;
        target = '';
      } else if (isEmail) {
        // Email link
        href = `mailto:${url}`;
      } else {
        // External or absolute URL
        try {
          const parsedUrl = url.includes(':')
            ? new URL(url)
            : new URL(`https://${url}`);
          href = parsedUrl.href;
        } catch {
          // Fallback in case URL parsing fails
          href = url;
        }
      }

      canvas.textEditorObj
        ?.chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href, target })
        .setUnderline()
        .run();

      // let parsedUrl;
      // let mailAddress;
      // if(isEmail) {
      //   mailAddress = `mailto:${url}`;
      // } else {
      //   parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`)
      // }
      // canvas.textEditorObj?.chain().focus().extendMarkRange('link').setLink({href: isEmail ? mailAddress : parsedUrl?.href, target: '_blank', }).setUnderline().run()
    }
  }

  const handleUnSetLink = () => {
    canvas.textEditorObj?.chain().focus().extendMarkRange('link').unsetLink().unsetUnderline().run()
  }

  return (
    <form className="flex flex-col items-stretch gap-2" onSubmit={e => {
      e.preventDefault()
      handleSetLink()
    }}>
      <label className='text-sm'>Enter a link</label>
      <TextInput className='max-w-none w-[16rem]'
        value={url}
        onChange={e => {
          e.stopPropagation()
          setUrl(e.target.value)
        }}
      />
      <div className="flex gap-2 justify-between mt-1">
        <button type='button' aria-label='Remove link' title='Remove link' className='size-[2.25rem] rounded-lg flex items-center justify-center hover:bg-accent text-muted-foreground' onClick={handleUnSetLink}>
          <Trash size={19} />
        </button>
        <Button type='submit' size="sm">Set Link</Button>
      </div>
    </form>
  )
}
