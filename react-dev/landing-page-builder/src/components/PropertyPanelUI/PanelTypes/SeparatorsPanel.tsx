import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { SeparatorsNode } from '@/types/node.type'
import { setSeparatorLabel } from '@/utils/separatorSlots';
import { Switch } from '@/components/ui/primitives/switch'
import { TextInput } from '@/components/ui/primitives/text-input'
import ColorPicker from '@/components/ui/ColorPicker';
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { Select, SelectOption } from '@/components/ui/Select'
import CSSUtils from '@/utils/CSS.utils'
import { fonts } from '@/consts/propertyField.consts'
import { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

import withSizeGridTab from './withSizeGridTab'
function Separators() {

  const { t } = useTranslation('propertyPanel')
  const canvas = useEditor()
  const node = canvas?.focusedNode as SeparatorsNode


  const seperatorType = [
    {
      label: t('separatorsPanel.content'),
      value: 'content'
    },
    {
      label: t('separatorsPanel.dotted'),
      value: 'dotted'
    }, {
      label: t('separatorsPanel.dashed'),
      value: 'dashed'
    }, {
      label: t('separatorsPanel.zigzag'),
      value: 'zigzag'
    }
  ]

  const direction = [{
    value: 'vertical',
    label: t('separatorsPanel.vertical')
  },
  {
    value: 'horizontal',
    label: t('separatorsPanel.horizontal')
  }
  ]

  const labelWeight = [
    {
      value: 'normal',
      label: t('separatorsPanel.normal')
    },
    // {
    //   value: 'thin',
    //   label: 'Thin'
    // },
    // {
    //   value: 'medium',
    //   label: 'Medium'
    // },
    // {
    //   value: 'semibold',
    //   label: 'Semibold'
    // },
    {
      value: 'bold',
      label: t('separatorsPanel.bold')
    },

  ]
  if (node)
    return (
      <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>


        <SectionContainer label={t('separatorsPanel.type')}>
          <Select

            id="size-height-format"
            aria-label={t('separatorsPanel.heightFormat')}
            size="sm"
            placement="top start"
            placeholder=""
            className="col-span-1"
            items={seperatorType}
            selectedKey={node.separatorType}
            onSelectionChange={(v) => {

              canvas.updateNode((prevNode) => ({
                ...prevNode,
                separatorType: v as 'content' | 'dotted' | 'dashed' | 'zigzag'
              }))

            }}
          >
            {(item) => (
              <SelectOption id={item.value}>{item.label}</SelectOption>
            )}
          </Select>

        </SectionContainer>

        <SectionContainer hintKey="direction" label={t('separatorsPanel.direction')}>
          <Select

            id="size-height-format"
            aria-label={t('separatorsPanel.heightFormat')}
            size="sm"
            placement="top start"
            placeholder=""
            className="col-span-1"
            items={direction}
            selectedKey={node.separatorLayout}
            onSelectionChange={(v) => {

              const value = v as 'vertical' | 'horizontal'

              canvas.updateNode((prevNode) => ({
                ...prevNode,
                separatorLayout: value,
                style: {
                  ...prevNode.style,
                  width: value === 'vertical' ? 'fit-content' : '100%',
                  height: value === 'vertical' ? '100%' : 'fit-content'
                }
              }))

            }}
          >
            {(item) => (
              <SelectOption id={item.value}>{item.label}</SelectOption>
            )}
          </Select>

        </SectionContainer>

        {node.separatorType === 'zigzag' && <PanelRowContainer layoutType='col' className=" w-full px-0 " hintKey="flip" label={t('separatorsPanel.flip')}>
          <Switch
            checked={node.flip}
            onCheckedChange={(v) => {
              canvas.updateNode(() => ({
                ...node,
                flip: v
              }))
            }}
          />

        </PanelRowContainer>}

        {node.separatorLayout === 'horizontal' && node.separatorType !== 'zigzag' && <SectionContainer label={t('separatorsPanel.label')} >

          <PanelRowContainer className=" w-[100%] px-0 " layoutType='col' label={t('separatorsPanel.labelText')}>
            <TextInput style={{
              position: "initial"
            }} className='col-span-2' size="sm"
              value={node.label?.toString()}
              onChange={v => {

                canvas.updateNode((prev) => {
                  const sep = prev as SeparatorsNode
                  const text = v.target.value as string
                  // Write through to the label node when there is one.
                  return {
                    ...sep,
                    label: text,
                    ...(sep.children?.length ? { children: setSeparatorLabel(sep.children, text) } : {}),
                  }
                })


              }}
            />
          </PanelRowContainer>

          <PanelRowContainer className=' px-0 py-0 ' layoutType='col' hintKey="fontWeight" label={t('separatorsPanel.labelFont')}>
            <Select
              id='panel-font'
              aria-label={t('separatorsPanel.textFont')}
              size='sm'
              placeholder=''
              className='col-span-2'
              items={fonts}
              selectedKey={fonts.map(font => font.value).find(font => (node.labelFont) === font) ?? 'Arial, sans-serif'}
              onSelectionChange={v => {
                canvas.updateNode((node) => ({
                  ...node,
                  labelFont: v as CSSProperties['fontFamily']
                }))
              }}
            >
              {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
            </Select>
          </PanelRowContainer>

          <PanelRowContainer layoutType='col' className=" w-full px-0 " hintKey="textColor" label={t('separatorsPanel.labelColor')}>
            <ColorPicker 
              value={node.labelColor || '#333333'}
              onChange={v => {
                canvas.updateNode((node) => ({
                  ...node,
                  labelColor: v
                }))
              }}
            />
          </PanelRowContainer>

          <PanelRowContainer className=" w-full px-0 " layoutType="col" hintKey="fontSize" label={t('separatorsPanel.labelSize')} >
            <NumberField
              id="font-size"
              aria-label={t('separatorsPanel.fontSize')}
              // className="min-w-[50%]"
              minValue={0}
              // isDisabled={CSSUtils.hasNumericValue(node.style.fontSize)}
              value={(node.labelSize) || 16}
              onChange={(v) => {
                canvas.updateNode((node) => ({
                  ...node,
                  labelSize: v as number
                }))
              }}
            >
              <NumberFieldInput size="sm" hideStepper />
            </NumberField>
          </PanelRowContainer>
          <PanelRowContainer className=" w-full px-0 " layoutType="col" hintKey="fontWeight" label={t('separatorsPanel.labelWeight')}>
            <Select

              id="size-height-format"
              aria-label={t('separatorsPanel.heightFormat')}
              size="sm"
              placement="top start"
              placeholder=""
              className="col-span-1"
              items={labelWeight}
              selectedKey={node.labelWeight || 'normal'}
              onSelectionChange={(v) => {

                const value = v as 'normal' | 'thin' | 'medium' | 'semibold' | 'bold'

                canvas.updateNode((prevNode) => ({
                  ...prevNode,
                  labelWeight: value
                }))

              }}
            >
              {(item) => (
                <SelectOption id={item.value}>{item.label}</SelectOption>
              )}
            </Select>

          </PanelRowContainer>
        </SectionContainer>}

        <SectionContainer label={t('separatorsPanel.line')} >
          <PanelRowContainer className=" w-full px-0 " layoutType='col' hintKey="borderColor" label={t('separatorsPanel.lineColor')}>
            <ColorPicker 
              value={node.color || ''}
              onChange={v => {
                canvas.updateNode((node) => ({
                  ...node as SeparatorsNode,
                  color: v
                }))
              }}
            />
          </PanelRowContainer>

          {node.separatorType === 'dashed' || node.separatorType === 'zigzag' && <PanelRowContainer className=" w-full px-0 " layoutType="col" hintKey="strokeWidth" label={t('separatorsPanel.lineWidth')} >
            <NumberField
              id="font-size"
              aria-label={t('separatorsPanel.fontSize')}
              // className="min-w-[50%]"
              minValue={0}
              // isDisabled={CSSUtils.hasNumericValue(node.style.fontSize)}
              value={(node.size) || 5}
              onChange={(v) => {
                canvas.updateNode((node) => ({
                  ...node,
                  size: v as number
                }))
              }}
            >
              <NumberFieldInput size="sm" hideStepper />
            </NumberField>
          </PanelRowContainer>}
        </SectionContainer>





        {/* <Link /> */}
        <Attributes />
      </div>
    )
}

export default withSizeGridTab(Separators)
