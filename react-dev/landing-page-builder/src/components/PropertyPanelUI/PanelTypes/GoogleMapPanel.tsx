import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { GoogleMapNode } from '@/types/node.type'
import { TextInput } from '@/components/ui/primitives/text-input'
import ContentSizeSection from './ContentSizeSection'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { isValidUrl } from '@/utils/isValidUrl'
import BackgroundPicker from '@/components/ui/BackgroundPicker'
import withSizeGridTab from './withSizeGridTab'
import { useTranslation } from 'react-i18next'

function GoogleMap() {

  const { t } = useTranslation('propertyPanel')
  const canvas = useEditor()
  const node = canvas?.focusedNode as GoogleMapNode


  if (node)
    return (
      <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>


        <SectionContainer label={t('googleMapPanel.embedUrlOrEmbedCode')}>
          <PanelRowContainer layoutType='col'>
            <TextInput className='col-span-3' placeholder={t('googleMapPanel.url')} size="sm"
              value={node?.url || ''}
              onChange={v => {
                const originalStr = v.target.value as string
                const popOutLink = originalStr.includes('iframe') ? originalStr.split('src=')[1].split('"')[1] : originalStr

                canvas.updateNode((node) => {
                  return {
                    ...node as GoogleMapNode,
                    url: popOutLink
                  }
                })
              }}
            />
          </PanelRowContainer>

        </SectionContainer>


        <SectionContainer hintKey="styleGroup" label={t('googleMapPanel.style')}>

          <PanelRowContainer layoutType="col" hintKey="backgroundColor" label={t('googleMapPanel.background')}>
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

export default withSizeGridTab(GoogleMap)