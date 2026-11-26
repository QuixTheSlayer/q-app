import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import ColorPicker from '@/components/ui/ColorPicker'
import NumAndTextField from '@/components/ui/button/NumberAndTextField'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { BoxShadowController } from './relatedComponents/Controllers';
import { useTranslation } from 'react-i18next'


function EffectSection() {

    const { t } = useTranslation('propertyPanel')

    return (
        <SectionContainer hintKey="shadowConfig" label={t('effectSection.label')}>


            <BoxShadowController />
        </SectionContainer>
    )
}

export default EffectSection