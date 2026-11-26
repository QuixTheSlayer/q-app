import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import type { PropertyHintKey } from '@/components/PropertyPanelUI/hints/registry'
import { useEditor } from '@/context/EditorContext'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import CSSUtils from '@/utils/CSS.utils'
import { useTranslation } from 'react-i18next'
import { usePanelStyle } from '@/hooks/usePanelStyle';

interface BorderRadiusControllerProps {
	label?: string
	hintKey?: PropertyHintKey
}

/**
 * Same read/write model as the Container's corner-radius block (BorderController
 * in Controllers.tsx): em-based values via CSSUtils, each corner written to its
 * own longhand property (borderTopLeftRadius etc.) rather than a combined
 * shorthand string, so it stays consistent with anything else in the app that
 * reads those longhand properties directly.
 */
export function BorderRadiusController({ label, hintKey }: BorderRadiusControllerProps) {
    const { value: panelValue } = usePanelStyle()
	const canvas = useEditor()
	const { t } = useTranslation('propertyPanel')
	const node = canvas?.focusedNode

	if (!node) return null

	return (
		<SectionContainer direction='col' hintKey={hintKey} label={label || t('borderRadiusController.borderRadius')}>
			<PanelRowContainer className='px-2 py-2 justify-start w-[100%]' layoutType='col' multiField hintKey='borderRadius' label={t('layoutSection.overall')}>
				<NumberField
					aria-label={t('borderRadiusController.borderRadius')}
					minValue={0}
					value={CSSUtils.extractEmValue(panelValue('borderRadius'))}
					onChange={(v) => {
						canvas.updateNodeStyle({
							borderRadius: CSSUtils.setEmValue(v),
							borderTopLeftRadius: CSSUtils.setEmValue(v),
							borderTopRightRadius: CSSUtils.setEmValue(v),
							borderBottomLeftRadius: CSSUtils.setEmValue(v),
							borderBottomRightRadius: CSSUtils.setEmValue(v),
						})
					}}
				>
					<NumberFieldInput size='sm' />
				</NumberField>
			</PanelRowContainer>

			<div className='flex w-full justify-start gap-3 items-start px-2 py-2'>
				<div className='flex flex-col justify-start items-start w-[45%] gap-3'>
					<PanelRowContainer className='px-0 py-0 justify-start w-full' layoutType='col' hintKey='borderRadiusTopLeft' label={t('borderRadiusController.topLeft')}>
						<NumberField
							aria-label={t('borderRadiusController.topLeft')}
							minValue={0}
							value={CSSUtils.extractEmValue(panelValue('borderTopLeftRadius'))}
							onChange={(v) => canvas.updateNodeStyle({ borderTopLeftRadius: CSSUtils.setEmValue(v) })}
						>
							<NumberFieldInput size='sm' />
						</NumberField>
					</PanelRowContainer>
					<PanelRowContainer className='px-0 py-0 justify-start w-full' layoutType='col' hintKey='borderRadiusBottomLeft' label={t('borderRadiusController.bottomLeft')}>
						<NumberField
							aria-label={t('borderRadiusController.bottomLeft')}
							minValue={0}
							value={CSSUtils.extractEmValue(panelValue('borderBottomLeftRadius'))}
							onChange={(v) => canvas.updateNodeStyle({ borderBottomLeftRadius: CSSUtils.setEmValue(v) })}
						>
							<NumberFieldInput size='sm' />
						</NumberField>
					</PanelRowContainer>
				</div>

				<div className='flex flex-col justify-start items-start w-[45%] gap-3'>
					<PanelRowContainer className='px-0 py-0 justify-start w-full' layoutType='col' hintKey='borderRadiusTopRight' label={t('borderRadiusController.topRight')}>
						<NumberField
							aria-label={t('borderRadiusController.topRight')}
							minValue={0}
							value={CSSUtils.extractEmValue(panelValue('borderTopRightRadius'))}
							onChange={(v) => canvas.updateNodeStyle({ borderTopRightRadius: CSSUtils.setEmValue(v) })}
						>
							<NumberFieldInput size='sm' />
						</NumberField>
					</PanelRowContainer>
					<PanelRowContainer className='px-0 py-0 justify-start w-full' layoutType='col' hintKey='borderRadiusBottomRight' label={t('borderRadiusController.bottomRight')}>
						<NumberField
							aria-label={t('borderRadiusController.bottomRight')}
							minValue={0}
							value={CSSUtils.extractEmValue(panelValue('borderBottomRightRadius'))}
							onChange={(v) => canvas.updateNodeStyle({ borderBottomRightRadius: CSSUtils.setEmValue(v) })}
						>
							<NumberFieldInput size='sm' />
						</NumberField>
					</PanelRowContainer>
				</div>
			</div>
		</SectionContainer>
	)
}
