import React, {useCallback, useContext} from 'react'
import {NumberField, NumberFieldInput, Select, SelectOption} from 'judgify-react-ui/metronic'
import {LAYOUT, NODE_TYPE} from '@/types/node.enum'
import {EditorContext, useEditor} from '@/context/EditorContext'
import {content_align, item_align} from '@/consts/propertyField.consts'
import {PanelRowContainer, SectionContainer} from '@/components/PropertyPanelUI/ui'


function BlockPanel ({}: {
  // label: string
}) {
  const canvas = useContext(EditorContext)
  const node = canvas?.focusedNode

  if(node?.type === NODE_TYPE.Container)
    return (
      <SectionContainer label='Layout'>
        <PanelRowContainer label='Type' htmlFor='layout-type'>
          <Select
            id='layout-type'
            aria-labelledby='layout-type'
            size='sm'
            placeholder=''
            selectedKey={node.layout}
            className='col-span-2'
            items={Object.values(LAYOUT).map(value => ({value}))}
            onSelectionChange={value => {
              canvas?.updateNode(node => {
                let tempNode = node

                tempNode = {
                  ...tempNode,
                  style: {
                    ...tempNode.style,
                    gridTemplateColumns: value === LAYOUT.Column ? 'repeat(auto-fit, minmax(0, 1fr))' : '1fr',
                    // gridTemplateColumns: value === LAYOUT.Column ? 'auto' : '1fr',
                    // gridAutoFlow: value === LAYOUT.Column ? 'column' : 'row',
                    // gridTemplateRows: value === LAYOUT.Row ? 'auto' : '1fr'
                  },
                  layout: value === LAYOUT.Column ? 'column' : 'row'
                }
                return tempNode
              })
            }}

          >
            {({value}) => (<SelectOption id={value}>{value}</SelectOption>)}
          </Select>
        </PanelRowContainer>
        <PanelRowContainer hintKey="alignX" label='Align-X' htmlFor='layout-align-x'>
          <Select
            id='layout-align-x'
            aria-labelledby='layout-align-x'
            size='sm'
            placeholder=''
            className='col-span-2'
            items={node.layout === LAYOUT.Column ? item_align : content_align}
            selectedKey={(node.layout === LAYOUT.Column ? node.style.alignItems : node.style.justifyItems) || 'stretch'}
            onSelectionChange={v => {
              canvas?.updateNodeStyle({
                alignItems: v,
                justifyItems: v
              })
            }}
          >
            {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
          </Select>
        </PanelRowContainer>
        {/* <PanelRowContainer hintKey="alignY" label='Align-Y' htmlFor='layout-align-y'>
          <Select
            id='layout-align-y'
            aria-labelledby='layout-align-y'
            size='sm'
            placeholder=''
            defaultSelectedKey='row'
            className='col-span-2'
            items={node.layout === LAYOUT.Column ? content_align : item_align}
            selectedKey={(node.layout === LAYOUT.Row ? node.style.justifyItems : node.style.justifyContent) || 'stretch' || 'stretch'}
            onSelectionChange={v => {
              canvas?.updateNodeStyle({
                justifyContent: v,
                justifyItems: v
              })
            }}
          >
            {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
          </Select>
        </PanelRowContainer> */}
        <PanelRowContainer hintKey="gap" label='Gap' htmlFor='layout-gap'>
          <NumberField id='layout-gap' className='col-span-2'
            aria-labelledby='layout-gap'
            onChange={e => console.log(e)}
          >
            <NumberFieldInput size="sm" />
          </NumberField>
        </PanelRowContainer>
      </SectionContainer>
    )

  return <></>
}
export default BlockPanel