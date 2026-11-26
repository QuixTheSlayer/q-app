import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { NewNodeNode } from '@/types/node.type'
import { TextInput } from '@/components/ui/primitives/text-input'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { useTranslation } from 'react-i18next'

import withSizeGridTab from './withSizeGridTab'
function NewNode() {

  const { t } = useTranslation('propertyPanel')
  const canvas = useEditor()
  const node = canvas?.focusedNode as NewNodeNode


  if (node)
    return (
      <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>







        <SectionContainer hintKey="styleGroup" label={t('newNodePanel.style')}>

          <BorderController />



        </SectionContainer>
        {/* <Link /> */}
        <Attributes />
      </div>
    )
}

export default withSizeGridTab(NewNode)
