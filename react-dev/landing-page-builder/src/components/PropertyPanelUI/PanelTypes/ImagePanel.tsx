import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import Link from '@/components/PropertyPanelUI/Sections/Link'
import SizeSection from '@/components/PropertyPanelUI/Sections/SizeSection'
import StyleSection from '@/components/PropertyPanelUI/Sections/StyleSection'
import RotateSection from '@/components/PropertyPanelUI/Sections/RotateSection'
import EffectSection from '@/components/PropertyPanelUI/Sections/EffectSection'
import LayoutSection from '@/components/PropertyPanelUI/Sections/LayoutSection'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { border_mode, height_mode } from '@/consts/propertyField.consts'
import { useEditor } from '@/context/EditorContext'
import useFileDrop from '@/hooks/useFileDrop'
import useUploadToS3 from '@/hooks/useUploadToS3'
import { cn } from '@/libs/cn'
import { useGetPageDataQuery } from '@/store/query'
import { ContentNode, ImageNode } from '@/types/node.type'
import CSSUtils from '@/utils/CSS.utils'
import { Button, buttonVariants } from '@/components/ui/primitives/button'
import { TextInput } from '@/components/ui/primitives/text-input'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { Select, SelectOption } from '@/components/ui/Select'
import { ProgressBar } from '@/components/ui/primitives/progress-bar'
import React, { useMemo, useState } from 'react'
import { CiCirclePlus } from "react-icons/ci";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/DropDownMenu'
import NumAndTextField from '@/components/ui/button/NumberAndTextField'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { useSelector } from 'react-redux'
import { RootState, useAppDispatch } from '@/store'
import { fetchImg } from '@/utils/convertToCanvas'
import { reset, toggleIsEdit } from '@/store/imageEditor/image.editor.slice'
import { ImageEditorView } from '@/components/ui/image-editor/ImageEditor.view'
import useImageEditorContentView from '@/components/ui/image-editor/ImageContentEditor.View'
import { useModal } from '@/context/ModalContext'
import { useImageEditorKonva } from '@/context/ImageEditorKonvaContext'
import { useTranslation } from 'react-i18next'

interface SizeMode {
  heightMode: "Full" | "Fixed" | "Fit" | "Percentage";
  widthMode: "Full" | "Fixed" | "Fit" | "Percentage";
}
import withSizeGridTab from './withSizeGridTab'
function ImagePanel() {
  const { t } = useTranslation('propertyPanel')

  const canvas = useEditor()
  const node = canvas?.focusedNode as ImageNode



  const { isEdit, imageUrl, imageFile } = useSelector((state: RootState) => state.imageEditor)

  const dispatch = useAppDispatch()

  const { updateModalProp, setModalType } = useModal()
  const { setImage, image } = useImageEditorKonva()




  const { img, loadUrl, localImg, handleFileChange, selectedFile, handleUpload, setImg } = useImageEditorContentView()



  const { dragHandlers, isDragging } = useFileDrop(handleFileChange)

  const [cornerBoxIsOpen, setCornerBoxIsOpen] = useState(false)


  const cornerHasMixedValues = false


  const EditorView = useMemo(() => isEdit && img && <ImageEditorView isBg={false} image={img} />, [img, isEdit])


  const [sizeMode, setSizeMode] = useState<SizeMode>({
    heightMode: node.style.height === "full" ? "Full" : (node.style.height as string)?.includes("em") ? "Fixed" : node.style.height === "fit-content" ? "Fit" : "Percentage",
    widthMode: node.style.width === "full" ? "Full" : (node.style.width as string)?.includes("em") ? "Fixed" : node.style.width === "fit-content" ? "Fit" : "Percentage"
  })

  if (node)
    return (
      <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>
        <SectionContainer label={t('imagePanel.file')}>
          {/* {EditorView} */}
          {<div {...dragHandlers}>
            {(node?.children?.length > 4 || selectedFile) ?
              <div className={cn("group relative flex-1 rounded-[0.65rem] h-[9rem] flex flex-col gap-1.5 items-center justify-center border  border-border bg-muted hover:border-primary/80  cursor-pointer overflow-hidden", isDragging ? 'border-dashed !border-primary/80 border-2 !bg-primary/20' : '')}>
                <img src={node.children as string || selectedFile?.object_url} className='size-full object-cover' />
                {selectedFile?.status === 'loading' &&
                  (
                    <div className='bg-slate-800/40 absolute flex flex-col w-full h-full items-center justify-center gap-2'>
                      <div className='text-white'>{t('imagePanel.uploading')}</div>
                      <ProgressBar value={Math.round(selectedFile.progress)} className="w-[7.5rem] h-[0.25rem]" />
                    </div>
                  )}
                {selectedFile?.status === 'error' &&
                  (
                    <div className='bg-slate-800/50 absolute flex flex-col w-full h-full items-center justify-center gap-2'>
                      <div className='text-destructive font-medium'>{t('imagePanel.errorUploadingPhoto')}</div>
                      <Button size={"sm"} variant="secondary"
                        onClick={() => handleUpload(selectedFile.cachedFile)}
                      >{t('imagePanel.retry')}</Button>
                    </div>
                  )}

                {(node.children.length > 4 || selectedFile?.status === "success") && (
                  
                  <div className='bg-slate-800/20 hidden backdrop-blur-sm absolute gap-2 bottom-0 px-2 py-2  rounded-t-md group-hover:flex w-full h-full items-center justify-center'>
                 

                  <div onClick={async () => {

                    canvas.updateNode((node)=>({
                      ...node as ImageNode,
                      children:'',
                      src:''
                    }))

                  }} className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), ' bg-slate-800/20 border-destructive text-destructive  backdrop-blur-sm items-center cursor-pointer')}>
                    {t('imagePanel.remove')}
                  </div>

                  <label onClick={() => {
                    updateModalProp({
                      isOpen: true,
                      title: t('imagePanel.imageEditor'),
                      hint: ""
                    })
                    setModalType("image")


                  }} className={cn(buttonVariants({ size: 'sm', variant: 'primary' }), ' bg-primary items-center cursor-pointer')}>{t('imagePanel.changeImage')}</label>
                </div>
                )}
              </div>
              :
              <>
                <label
                  onClick={() => {
                    updateModalProp({
                      isOpen: true,
                      title: t('imagePanel.imageEditor'),
                      hint: "",

                    })

                    setModalType('image')
                  }}
                  className={cn("group flex-1 rounded-[0.65rem] h-[9rem] flex flex-col gap-1.5 items-center justify-center border border-dashed border-border bg-muted hover:border-primary/80 hover:border-2 cursor-pointer", isDragging ? ' !border-primary/80 border-2 !bg-primary/20' : '')}>
                  <CiCirclePlus size={35} className='text-muted-foreground group-hover:text-primary' />
                  <p className="text-muted-foreground text-[0.8rem] font-semibold mt-1">{t('imagePanel.uploadAnImage')}</p>
                  <p className="text-[0.75rem] text-muted-foreground ">{t('imagePanel.maxFileSize')}</p>
                </label>
              </>}
            {/* <input id='image-uploader' type="file" className="hidden" onChange={e => e.target.files && handleFileChange(e.target.files).then((data) => {
              const { url, image } = data

              setImg(image)
              canvas.updateNode((node) => {
                let tempNode = node;

                return {
                  ...tempNode,
                  children: url,
                  src: url
                } as ContentNode

              })
            })} /> */}

          </div>}

          {/* <div className='my-3'>
          <TextInput placeholder='Image URL' className='w-full' />
        </div> */}
        </SectionContainer>

        <SectionContainer label={t('imagePanel.sourceUrl')}>
          <PanelRowContainer layoutType='col'>
            <TextInput className='col-span-3' placeholder={t('imagePanel.urlPlaceholder')} size="sm"
              value={node?.src || ''}
              onChange={v => {
                canvas.updateNode(node => {
                  return {
                    ...node,
                    src: v.target.value
                  }
                })
              }}
            />
          </PanelRowContainer>
          {/* <PanelRowContainer label='Target'>
              <Select
                id='size-height-format'
                aria-label='Height format'
                size='sm'
                placement='bottom end'
                placeholder=''
                className='col-span-2'
                items={[{value: '_self', label: 'Current tab'}, {value: '_blank', label: 'New tab'}]}
                selectedKey={canvas.focusedNode.attributes?.target || '_blank'}
                onSelectionChange={v => {
                  canvas.updateNode(node => {
                    return {
                      ...node,
                      attributes: {
                        ...node.attributes,
                        target: v
                      }
                    }
                  })
                }}
                >
                {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
              </Select>
            </PanelRowContainer> */}
        </SectionContainer>





        {/* 2. LAYOUT & ALIGNMENT */}
        <LayoutSection />

        {/* 3. SIZE & RESPONSIVE */}
        <SizeSection />

        {/* 4. STYLING */}
        <StyleSection />
        <RotateSection />

        {/* 5. BORDERS & EFFECTS */}
        {/* <SectionContainer hintKey="styleGroup" label={t('imagePanel.borders')}>
          <BorderController />
        </SectionContainer>
        <EffectSection /> */}

        {/* 6. INTERACTION */}
        {/* <Link /> */}

        {/* 7. ATTRIBUTES (Always Last!) */}
        {/* <Attributes /> */}
      </div>
    )
}

export default withSizeGridTab(ImagePanel)
