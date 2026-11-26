import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { CanvasNode } from '@/types/node.type'
import { TextInput } from '@/components/ui/primitives/text-input'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import editorConfig from '@/configs/editor.config'
import React, { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

function Attributes() {
  const canvas = useEditor()
  const { t } = useTranslation('propertyPanel')

  if (!editorConfig.enable_attributes_section) return null



  return (
    <SectionContainer label={t('attributes.attributes')}>
       
        <SectionContainer label={t('attributes.link')}>
            <PanelRowContainer layoutType='col'>
              <TextInput className='col-span-3' placeholder={t('attributes.url')} size="sm"
                value={canvas.focusedNode.attributes?.href || ''}
                onChange={v => {
                  canvas.updateNode(node => {
                    return {
                      ...node,
                      attributes: {
                        ...node.attributes,
                        href: v.target.value
                      }
                    }
                  })
                }}
              />
            </PanelRowContainer>
          
          </SectionContainer>

      <PanelRowContainer className=" w-[90%] " layoutType='col' label={t('attributes.class')}>
        <TextInput style={{
          position: "initial"
        }} className='col-span-2' size="sm"
          value={canvas.focusedNode?.attributes?.className || ''}
          onChange={v => {

            // const clasList: string[] = v.target.value.split(" ")

            // const positionExist = clasList?.find((value) => positions.includes(value as positionType)) as positionType


          
              canvas.updateNode((node: any) => {
                return {
                  ...node,
                  attributes: {
                    ...node.attributes,
                    className: v.target.value
                  }
                }
              })
            

          }}
        />
      </PanelRowContainer>
      <PanelRowContainer className=" w-[90%] " layoutType='col' label={t('attributes.id')}>
        <TextInput className='col-span-2' size="sm"
          value={canvas.focusedNode?.attributes?.id || ''}
          onChange={v => {
            canvas.updateNode((node: any) => {
              return {
                ...node,
                attributes: {
                  ...node.attributes,
                  id: v.target.value
                }
              }
            })
          }}
        />
      </PanelRowContainer>
     
    </SectionContainer>
  )
}

export default Attributes