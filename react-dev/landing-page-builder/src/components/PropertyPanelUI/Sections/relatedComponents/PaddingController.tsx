import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import type { PropertyHintKey } from '@/components/PropertyPanelUI/hints/registry'
import { useEditor } from '@/context/EditorContext'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import CSSUtils from '@/utils/CSS.utils'
import { useTranslation } from 'react-i18next'

interface PaddingControllerProps {
	label?: string
	hintKey?: PropertyHintKey
}

/**
 * Same read/write model as the Container's padding block (LayoutSection.tsx):
 * em-based values via CSSUtils, and each side written to its own longhand
 * property (paddingLeft/Right/Top/Bottom) rather than a combined shorthand
 * string, so it stays consistent with anything else in the app that reads
 * those longhand properties directly.
 */
export function PaddingController({ label, hintKey }: PaddingControllerProps) {
	const canvas = useEditor()
	const { t } = useTranslation('propertyPanel')
	const node = canvas?.focusedNode

	if (!node) return null

	return (
		<SectionContainer direction='col' hintKey={hintKey} label={label || t('layoutSection.padding')}>
			<PanelRowContainer className='px-2 py-2 justify-start w-[100%]' layoutType='col' multiField hintKey='padding' label={t('layoutSection.overall')}>
				<NumberField
					aria-label={t('layoutSection.paddingXLAria')}
					minValue={0}
					value={CSSUtils.extractEmValue(node.style.padding)}
					onChange={(v) => {
						canvas.updateNodeStyle({
							padding: CSSUtils.setEmValue(v),
							paddingLeft: CSSUtils.setEmValue(v),
							paddingRight: CSSUtils.setEmValue(v),
							paddingTop: CSSUtils.setEmValue(v),
							paddingBottom: CSSUtils.setEmValue(v),
						})
					}}
				>
					<NumberFieldInput size='sm' />
				</NumberField>
			</PanelRowContainer>

			<PanelRowContainer className='px-2 py-0 justify-start items-center gap-3' layoutType='col' label=' ' multiField>
				<PanelRowContainer className='w-full px-0 py-0 justify-start items-start gap-3' layoutType='row' label=''>
					<PanelRowContainer className='px-0 py-0 justify-start w-[45%]' layoutType='col' hintKey='paddingLeft' label={t('layoutSection.left')}>
						<NumberField
							aria-label={t('layoutSection.paddingXLAria')}
							minValue={0}
							value={CSSUtils.extractEmValue(node.style.paddingLeft)}
							onChange={(v) => canvas.updateNodeStyle({ paddingLeft: CSSUtils.setEmValue(v) })}
						>
							<NumberFieldInput size='sm' />
						</NumberField>
					</PanelRowContainer>
					<PanelRowContainer className='px-0 py-0 justify-start w-[45%]' layoutType='col' hintKey='paddingRight' label={t('layoutSection.right')}>
						<NumberField
							aria-label={t('layoutSection.paddingXRAria')}
							minValue={0}
							value={CSSUtils.extractEmValue(node.style.paddingRight)}
							onChange={(v) => canvas.updateNodeStyle({ paddingRight: CSSUtils.setEmValue(v) })}
						>
							<NumberFieldInput size='sm' />
						</NumberField>
					</PanelRowContainer>
				</PanelRowContainer>

				<PanelRowContainer className='w-full px-0 pb-1 justify-start items-start gap-3' layoutType='row' label=''>
					<PanelRowContainer className='px-0 py-1 justify-start w-[45%]' layoutType='col' hintKey='paddingTop' label={t('layoutSection.top')}>
						<NumberField
							aria-label={t('layoutSection.paddingYTAria')}
							minValue={0}
							value={CSSUtils.extractEmValue(node.style.paddingTop)}
							onChange={(v) => canvas.updateNodeStyle({ paddingTop: CSSUtils.setEmValue(v) })}
						>
							<NumberFieldInput size='sm' />
						</NumberField>
					</PanelRowContainer>
					<PanelRowContainer className='px-0 py-1 justify-start w-[45%]' layoutType='col' hintKey='paddingBottom' label={t('layoutSection.bottom')}>
						<NumberField
							aria-label={t('layoutSection.paddingYBAria')}
							minValue={0}
							value={CSSUtils.extractEmValue(node.style.paddingBottom)}
							onChange={(v) => canvas.updateNodeStyle({ paddingBottom: CSSUtils.setEmValue(v) })}
						>
							<NumberFieldInput size='sm' />
						</NumberField>
					</PanelRowContainer>
				</PanelRowContainer>
			</PanelRowContainer>
		</SectionContainer>
	)
}
