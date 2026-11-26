import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { CounterNode } from '@/types/node.type'
import { TextInput } from '@/components/ui/primitives/text-input'
import BackgroundPicker from '@/components/ui/BackgroundPicker'
import { isValidUrl } from '@/utils/isValidUrl'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { Checkbox } from '@/components/ui/primitives/checkbox'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { TypographyControl } from '../Sections/relatedComponents/TypographyControl'
import withSizeGridTab from './withSizeGridTab'
import { useTranslation } from 'react-i18next'
import FoldList from '@/components/ui/FoldList'

function CounterPanel() {
  const { t } = useTranslation('propertyPanel')
  const canvas = useEditor()
  const node = canvas?.focusedNode as CounterNode

  if (node)
    return (
      <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

        <FoldList label={t('counterPanel.content')}>
        <SectionContainer label={t('counterPanel.value')}>
          <PanelRowContainer className=' w-full p-2 ' layoutType='col' multiField label={t('counterPanel.startEnd')}>
            <div className='flex gap-2 w-full'>
              <NumberField
                aria-label={t('counterPanel.startValue')}
                className='w-1/2'
                value={node.startValue ?? 0}
                onChange={(v) => canvas.updateNode((prevNode) => ({
                  ...prevNode as CounterNode,
                  startValue: v,
                }))}
              >
                <NumberFieldInput size='sm' hideStepper />
              </NumberField>
              <NumberField
                aria-label={t('counterPanel.endValue')}
                className='w-1/2'
                value={node.endValue ?? 0}
                onChange={(v) => canvas.updateNode((prevNode) => ({
                  ...prevNode as CounterNode,
                  endValue: v,
                }))}
              >
                <NumberFieldInput size='sm' hideStepper />
              </NumberField>
            </div>
          </PanelRowContainer>

          <PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('counterPanel.decimals')}>
            <NumberField
              aria-label={t('counterPanel.decimals')}
              minValue={0}
              maxValue={4}
              value={node.decimals ?? 0}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as CounterNode,
                decimals: v,
              }))}
            >
              <NumberFieldInput size='sm' hideStepper />
            </NumberField>
          </PanelRowContainer>

          <PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('counterPanel.animationDuration')}>
            <NumberField
              aria-label={t('counterPanel.duration')}
              minValue={0.2}
              step={0.1}
              value={node.duration ?? 2}
              onChange={(v) => canvas.updateNode((prevNode) => ({
                ...prevNode as CounterNode,
                duration: v,
              }))}
            >
              <NumberFieldInput size='sm' hideStepper />
            </NumberField>
          </PanelRowContainer>

          <PanelRowContainer layoutType='row' className=' items-center gap-3 '>
            <Checkbox
              checked={node.useThousandsSeparator ?? true}
              onCheckedChange={(checked) => canvas.updateNode((prevNode) => ({
                ...prevNode as CounterNode,
                useThousandsSeparator: checked === true,
              }))}
            />
            <span className='text-sm text-foreground'>{t('counterPanel.useThousandsSeparator')}</span>
          </PanelRowContainer>

          <PanelRowContainer layoutType='row' className=' items-center gap-3 '>
            <Checkbox
              checked={node.triggerOnView ?? true}
              onCheckedChange={(checked) => canvas.updateNode((prevNode) => ({
                ...prevNode as CounterNode,
                triggerOnView: checked === true,
              }))}
            />
            <span className='text-sm text-foreground'>{t('counterPanel.startCountingOnView')}</span>
          </PanelRowContainer>
        </SectionContainer>

        <SectionContainer label={t('counterPanel.prefixSuffix')}>
          <PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('counterPanel.prefixText')}>
            <TextInput
              size='sm'
              value={node.prefix ?? ''}
              placeholder={t('counterPanel.prefixPlaceholder')}
              onChange={(e) => canvas.updateNode((prevNode) => ({
                ...prevNode as CounterNode,
                prefix: e.target.value,
              }))}
            />
          </PanelRowContainer>
          <PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('counterPanel.suffixText')}>
            <TextInput
              size='sm'
              value={node.suffix ?? ''}
              placeholder={t('counterPanel.suffixPlaceholder')}
              onChange={(e) => canvas.updateNode((prevNode) => ({
                ...prevNode as CounterNode,
                suffix: e.target.value,
              }))}
            />
          </PanelRowContainer>
        </SectionContainer>
        </FoldList>

        <FoldList label={t('counterPanel.typography')}>
          <TypographyControl
            label={t('counterPanel.numberStyle')}
            value={node.numberStyle}
            defaultValue={{ fontSize: '2.5em', fontWeight: '700', color: '#1a1a1a' }}
            onChange={(next) => canvas.updateNode((prevNode) => ({
              ...prevNode as CounterNode,
              numberStyle: next,
            }))}
          />
          <TypographyControl
            label={t('counterPanel.prefixText')}
            value={node.prefixStyle}
            defaultValue={{ fontSize: '2.5em', fontWeight: '700', color: '#1a1a1a' }}
            onChange={(next) => canvas.updateNode((prevNode) => ({
              ...prevNode as CounterNode,
              prefixStyle: next,
            }))}
          />
          <TypographyControl
            label={t('counterPanel.suffixText')}
            value={node.suffixStyle}
            defaultValue={{ fontSize: '2.5em', fontWeight: '700', color: '#1a1a1a' }}
            onChange={(next) => canvas.updateNode((prevNode) => ({
              ...prevNode as CounterNode,
              suffixStyle: next,
            }))}
          />
        </FoldList>

        <SectionContainer hintKey="styleGroup" label={t('counterPanel.style')}>
          <PanelRowContainer layoutType="col" hintKey="backgroundColor" label={t('counterPanel.background')}>
            <BackgroundPicker
              value={node.style?.backgroundColor || ''}
              onChange={(v) => canvas.updateNodeStyle(isValidUrl(v) ? { backgroundImage: `url("${v}")` } : { backgroundColor: v })}
            />
          </PanelRowContainer>
          <BorderController />
        </SectionContainer>

        <Attributes />
      </div>
    )
}

export default withSizeGridTab(CounterPanel)
