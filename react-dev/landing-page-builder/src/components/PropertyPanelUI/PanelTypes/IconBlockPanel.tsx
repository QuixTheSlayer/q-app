import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { IconBlockNode } from '@/types/node.type'
import { setIconBlockSlotText, buildIconBlockChildren, restyleIconBlockChildren } from '@/utils/iconBlockSlots';
import { TextInput } from '@/components/ui/primitives/text-input'
import ColorPicker from '@/components/ui/ColorPicker';
import { BorderController } from '../Sections/relatedComponents/Controllers'
import React, { useState, useMemo } from 'react'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { ChevronDown, CirclePlusIcon } from 'lucide-react'
import { FiTrash } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import BackgroundPicker from '@/components/ui/BackgroundPicker'
import { isValidUrl } from '@/utils/isValidUrl'
import { isIconifyId } from '@/utils/iconify'
import { NodeIcon } from '@/components/shared/NodeIcon'
import { IconifySearch } from '../Sections/relatedComponents/IconifySearch'

import withSizeGridTab from './withSizeGridTab'
function IconBlock() {

  const { t } = useTranslation('propertyPanel')
  const canvas = useEditor()
  const node = canvas?.focusedNode as IconBlockNode

  const activeBgColor = (type: string, key: keyof IconBlockNode) => node[key] === type ? 'rgb(80 205 137 / 0.4)' : ''

  if (node)
    return (
      <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

        <PanelRowContainer className=' px-0 py-2 gap-3 ' layoutType='col' label={t('iconBlockPanel.type')} >
          <div className=' flex gap-1 h-[30px] w-full relative  justify-start items-center ' >
            <div onClick={() => {
              canvas.updateNode((node) => ({
                ...node as IconBlockNode,
                iconType: 'i'
              }))
            }} style={{
              backgroundColor: activeBgColor('i', 'iconType'),
            }} className=' text-center cursor-pointer  flex justify-center items-center text-sm border rounded-l-md w-[33%] h-[30px] text-foreground ' >
              {t('iconBlockPanel.iconOnly')}
            </div>

            <div onClick={() => {
              canvas.updateNode((node) => ({
                ...node as IconBlockNode,
                iconType: 'iT'
              }))
            }} style={{
              backgroundColor: activeBgColor('iT', 'iconType'),

            }} className=' text-center cursor-pointer  flex justify-center items-center text-sm border  w-[33%] h-[30px] text-foreground ' >
              {t('iconBlockPanel.iconAndTitle')}
            </div>

            <div onClick={() => {
              canvas.updateNode((node) => ({
                ...node as IconBlockNode,
                iconType: 'iTt'
              }))
            }} style={{
              backgroundColor: activeBgColor('iTt', 'iconType'),

            }} className=' text-center cursor-pointer  flex justify-center items-center text-sm border rounded-r-md w-[33%] h-[30px] text-foreground ' >
              {t('iconBlockPanel.iconTitleAndText')}
            </div>
          </div>

        </PanelRowContainer>

        <PanelRowContainer className=' px-0 gap-3 py-2 ' layoutType='col' hintKey="direction" label={t('iconBlockPanel.arrangement')} >
          <div className=' flex gap-1 h-[30px] w-full relative  justify-start items-center ' >
            <div onClick={() => {
              canvas.updateNode((node) => ({
                ...node as IconBlockNode,
                arrangement: 'horizontal'
              }))
            }} style={{
              backgroundColor: activeBgColor('horizontal', 'arrangement'),
            }} className=' text-center cursor-pointer  flex justify-center items-center text-sm border rounded-l-md w-[50%] h-[30px] text-foreground ' >
              {t('iconBlockPanel.row')}
            </div>

            <div onClick={() => {
              canvas.updateNode((node) => ({
                ...node as IconBlockNode,
                arrangement: 'vertical'
              }))
            }} style={{
              backgroundColor: activeBgColor('vertical', 'arrangement'),

            }} className=' text-center cursor-pointer text-foreground flex justify-center items-center text-sm border rounded-r-md  w-[50%] h-[30px]  ' >
              {t('iconBlockPanel.stacked')}
            </div>


          </div>

        </PanelRowContainer>

        <PanelRowContainer className=' px-0 gap-3 ' layoutType='col' label={t('iconBlockPanel.iconList')} >
          {
            node.items?.map(({ title, description, icon, size, color, isFold }, index) => {

              return (
                <div
                  style={{
                    height: isFold ? 49 : 'auto'
                  }}
                  className=' border  rounded-lg  transition-transform   overflow-hidden' >
                  <div className=' relative h-[48px] gap-3 px-2 flex justify-between items-center bg-primary/20 rounded-t-md rounded-br-md border-b ' >
                    <div onClick={(e) => {
                      let targetItem = node.items.map((item) => item)

                      targetItem[index] = {
                        ...targetItem[index],
                        isFold: !isFold
                      }

                      canvas.updateNode((node) => ({
                        ...node as IconBlockNode,
                        items: targetItem
                      }))

                    }} className='gap-3 text-foreground/80 cursor-pointer px-2 flex justify-start items-center' >
                      {<div style={{
                        rotate: isFold ? '-90deg' : '0deg',
                        transition: '0.3s all'
                      }} >
                        <ChevronDown size={16} />
                      </div>}
                      <div style={{
                        backgroundColor: color + '30'
                      }} className=' h-[30px] flex justify-center items-center w-[30px] rounded-full  ' >
                        <NodeIcon icon={icon} color={color} size={20} />
                      </div>

                      <p>
                        {title}
                      </p>
                    </div>
                    <div onClick={() => {

                      let nodeItems = node.items?.map((item) => item)

                      const filterItem = nodeItems.filter((item, nodeItemIndex) => nodeItemIndex !== index)

                      canvas.updateNode((prev) => {
                        const ib = prev as IconBlockNode
                        // Drop the item's two slot nodes alongside it.
                        const children = ib.children
                          ? ib.children.filter((_, i) => i !== index * 2 && i !== index * 2 + 1)
                          : undefined
                        return { ...ib, items: filterItem, ...(children ? { children } : {}) }
                      })

                    }
                    } className=" cursor-pointer rounded-r-lg absolute right-0 top-0  min-w-[40px] flex border border-destructive text-destructive-foreground bg-destructive justify-center place-items-center h-full     " >
                      <FiTrash size={20

                      } />
                    </div>
                  </div>

                  <PanelRowContainer className=' px-2 bg-primary/20 ' layoutType='col'  >
                    <div className=' flex justify-between items-center w-full h-[24px] ' >
                      <p className=' text-foreground font-medium ' >{t('iconBlockPanel.icon')}</p>
                    </div>
                    <IconifySearch
                      selected={icon}
                      onSelect={(iconId) => {
                        let targetItem = node.items?.map((item) => item)

                        targetItem[index] = {
                          ...targetItem[index],
                          icon: iconId
                        }

                        canvas.updateNode((node) => ({
                          ...node as IconBlockNode,
                          items: targetItem
                        }))
                      }}
                    />
                  </PanelRowContainer>

                  <PanelRowContainer className=' px-2 ' layoutType='col' label={t('iconBlockPanel.title')} >
                    <TextInput className='col-span-2' size="sm"
                      value={node.items[index].title || ''}
                      onChange={v => {

                        let targetItem = node.items.map((item) => item)

                        targetItem[index] = {
                          ...targetItem[index],
                          title: v.target.value
                        }

                        canvas.updateNode((prev) => {
                          const ib = prev as IconBlockNode
                          // Write through to the slot node when there is one.
                          return {
                            ...ib,
                            items: targetItem,
                            ...(ib.children ? { children: setIconBlockSlotText(ib.children, index, 'title', v.target.value) } : {}),
                          }
                        })
                      }}
                    />
                  </PanelRowContainer>

                  <PanelRowContainer className=' px-2 ' layoutType='col' label={t('iconBlockPanel.description')} >
                    <TextInput className='col-span-2' size="sm"
                      value={node.items[index].description || ''}
                      onChange={v => {

                        let targetItem = node.items.map((item) => item)

                        targetItem[index] = {
                          ...targetItem[index],
                          description: v.target.value
                        }

                        canvas.updateNode((prev) => {
                          const ib = prev as IconBlockNode
                          // Write through to the slot node when there is one.
                          return {
                            ...ib,
                            items: targetItem,
                            ...(ib.children ? { children: setIconBlockSlotText(ib.children, index, 'description', v.target.value) } : {}),
                          }
                        })
                      }}
                    />
                  </PanelRowContainer>

                  <PanelRowContainer className=" w-full px-2 " layoutType="col" label={t('iconBlockPanel.size')} >
                    <NumberField
                      id="font-size"
                      aria-label={t('iconBlockPanel.fontSize')}
                      // className="min-w-[50%]"
                      minValue={0}
                      // isDisabled={CSSUtils.hasNumericValue(node.style.fontSize)}
                      value={(node.items[index].size) || 14}
                      onChange={(v) => {
                        let targetItem = node.items.map((item) => item)

                        targetItem[index] = {
                          ...targetItem[index],
                          size: v
                        }

                        canvas.updateNode((node) => ({
                          ...node as IconBlockNode,
                          items: targetItem
                        }))
                      }}
                    >
                      <NumberFieldInput size="sm" hideStepper />
                    </NumberField>
                  </PanelRowContainer>
                  {!isIconifyId(icon) && (
                  <PanelRowContainer className=" w-full px-2 " layoutType="col" hintKey="strokeWidth" label={t('iconBlockPanel.strokeWidth')} >
                    <NumberField
                      id="font-size"
                      aria-label={t('iconBlockPanel.fontSize')}
                      // className="min-w-[50%]"
                      minValue={0.5}
                      step={0.5}
                      // isDisabled={CSSUtils.hasNumericValue(node.style.fontSize)}
                      value={(node.items[index].strokeWidth) || 2}
                      onChange={(v) => {
                        let targetItem = node.items.map((item) => item)

                        targetItem[index] = {
                          ...targetItem[index],
                          strokeWidth: v
                        }

                        canvas.updateNode((node) => ({
                          ...node as IconBlockNode,
                          items: targetItem
                        }))
                      }}
                    >
                      <NumberFieldInput size="sm" hideStepper />
                    </NumberField>
                  </PanelRowContainer>
                  )}

                  <PanelRowContainer layoutType='col' className=" w-full px-2 " hintKey="colorPair" label={t('iconBlockPanel.color')}>
                    <ColorPicker 
                      value={(node.items[index]?.color) || '#333'}
                      onChange={v => {
                        let targetItem = node.items.map((item) => item)

                        targetItem[index] = {
                          ...targetItem[index],
                          color: v
                        }

                        canvas.updateNode((node) => ({
                          ...node as IconBlockNode,
                          items: targetItem
                        }))
                      }}
                    />
                  </PanelRowContainer>

                </div>
              )
            })
          }

          <div onClick={() => {

            let targetItem = node.items.map((item) => item)

            targetItem.push({
              icon: '',
              title: t('iconBlockPanel.title'),
              'description': t('iconBlockPanel.description'),
              color: '#333333',
              size: targetItem[targetItem.length - 1]?.size || 14,
              isFold: true,
              strokeWidth: 2,
              textColor: targetItem[targetItem.length - 1]?.textColor || '#232323'
            })
            canvas.updateNode((prev) => {
              const ib = prev as IconBlockNode
              const added = buildIconBlockChildren({ items: [targetItem[targetItem.length - 1]] })
              return {
                ...ib,
                items: targetItem,
                ...(ib.children ? { children: [...ib.children, ...added] } : {}),
              }
            })

          }} className=" gap-2 text-base flex text-center w-[100%] my-2  border-t-[1px]  border-border text-muted-foreground  h-[38px] justify-center items-center cursor-pointer " >
            <CirclePlusIcon size={28} />
            {/* <p className=" text-[#d8dde4]  " >New Icon</p> */}
          </div>


        </PanelRowContainer>




        <SectionContainer hintKey="styleGroup" label={t('iconBlockPanel.style')}>

          <PanelRowContainer layoutType="col" hintKey="backgroundColor" label={t('iconBlockPanel.background')}>
            <BackgroundPicker
              value={node.style?.backgroundColor || ''}
              onChange={(v) => canvas.updateNodeStyle(isValidUrl(v) ? { backgroundImage: `url("${v}")` } : { backgroundColor: v })}
            />
          </PanelRowContainer>

          <BorderController />



        </SectionContainer>
        {/* <Link /> */}
        <Attributes />
      </div>
    )
}

export default withSizeGridTab(IconBlock)
