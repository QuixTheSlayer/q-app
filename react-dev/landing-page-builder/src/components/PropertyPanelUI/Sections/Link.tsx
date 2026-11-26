import {PanelRowContainer, SectionContainer} from '@/components/PropertyPanelUI/ui'
import {useEditor} from '@/context/EditorContext'
import {TextInput} from '@/components/ui/primitives/text-input'
import {Select, SelectOption} from '@/components/ui/Select'
import React from 'react'
import {useTranslation} from 'react-i18next'

function Link() {
  const canvas = useEditor()
  const {t} = useTranslation('propertyPanel')

  if(canvas.focusedNode)
  return (
    <SectionContainer label={t('link.label')}>
      <PanelRowContainer layoutType='col'>
        <TextInput className='col-span-3' placeholder={t('link.urlPlaceholder')} size="sm"
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

  )
}

export default Link