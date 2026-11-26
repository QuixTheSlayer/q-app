import { useTranslation } from 'react-i18next'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { TextInput } from '@/components/ui/primitives/text-input'
import SizeSection from '@/components/PropertyPanelUI/Sections/SizeSection'
import StyleSection from '@/components/PropertyPanelUI/Sections/StyleSection'
import { useEditor } from '@/context/EditorContext'
import type { FormFieldNode } from '@/types/node.type'

/** Property panel for an imported form control (input / select / textarea). */
function FormFieldPanel() {
	const canvas = useEditor()
	const { t } = useTranslation('propertyPanel')
	const node = canvas?.focusedNode as FormFieldNode | undefined
	if (!node) return null

	const setField = (patch: Partial<FormFieldNode['field']>) =>
		canvas.updateNode((prev) => ({ ...(prev as FormFieldNode), field: { ...(prev as FormFieldNode).field, ...patch } }))
	const isToggle = node.tag === 'input' && (node.field.type === 'checkbox' || node.field.type === 'radio')

	return (
		<div className='w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar'>
			<SectionContainer label={t('formFieldPanel.field')}>
				{!isToggle && node.tag !== 'select' && (
					<PanelRowContainer layoutType='col' label={t('formFieldPanel.placeholder')}>
						<TextInput size='sm' className='col-span-3' aria-label={t('formFieldPanel.placeholder')}
							value={node.field.placeholder ?? ''} onChange={(e) => setField({ placeholder: e.target.value })} />
					</PanelRowContainer>
				)}
				<PanelRowContainer layoutType='col' label={t('formFieldPanel.name')}>
					<TextInput size='sm' className='col-span-3' aria-label={t('formFieldPanel.name')}
						value={node.field.name ?? ''} onChange={(e) => setField({ name: e.target.value })} />
				</PanelRowContainer>
				{node.tag === 'select' && (
					<PanelRowContainer layoutType='col' label={t('formFieldPanel.options')}>
						<TextInput size='sm' className='col-span-3' aria-label={t('formFieldPanel.options')}
							value={(node.field.options ?? []).map((o) => o.label).join(', ')}
							// One choice per comma; each keeps its label as its value.
							onChange={(e) => setField({ options: e.target.value.split(',').map((label) => label.trim()).filter(Boolean).map((label) => ({ value: label, label })) })} />
					</PanelRowContainer>
				)}
			</SectionContainer>
			<SizeSection />
			<StyleSection />
		</div>
	)
}

export default FormFieldPanel
