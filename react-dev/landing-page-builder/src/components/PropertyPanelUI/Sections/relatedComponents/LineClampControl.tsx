import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { CanvasNode } from '@/types/node.type'
import { Checkbox } from '@/components/ui/primitives/checkbox'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { useTranslation } from 'react-i18next'

/**
 * Shared line-count (line-clamp) control for a single text field on a Ready
 * Made Template node. Unlike TextPanel's Collapsable control (which writes
 * node.style.WebkitLineClamp directly, since a plain TextNode's whole
 * content IS one field), template nodes render several independent text
 * fields with hardcoded inline styles per uiType variant — so the clamp
 * value is stored per-field in node.lineClamp[field] (see BaseCanvasNode),
 * and it's up to each template's Visual component to read its own keys and
 * apply WebkitLineClamp/overflow/display/WebkitBoxOrient when set.
 *
 * `field` is the lineClamp map key (e.g. "heading", "items.answer") — use a
 * stable, human-traceable name per field, dotted for nested/array fields
 * shared across all items (a single clamp value applies to every item in
 * that array, matching how e.g. titleStyle/descriptionStyle already apply
 * uniformly across Timeline's steps).
 */
export function LineClampControl({ field, label }: { field: string; label?: string }) {
	const canvas = useEditor()
	const { t } = useTranslation('propertyPanel')

	const node = canvas?.focusedNode
	const clampValue = node?.lineClamp?.[field]
	const enabled = typeof clampValue === 'number'

	function updateClamp(next: number | undefined) {
		canvas.updateNode((prevNode) => {
			const lineClamp = { ...(prevNode as CanvasNode).lineClamp }
			if (next === undefined) {
				delete lineClamp[field]
			} else {
				lineClamp[field] = next
			}
			return {
				...prevNode,
				lineClamp,
			}
		})
	}

	return (
		<SectionContainer hintKey="lineClamp" label={label ?? t('lineClampControl.label')}>
			<div className='py-[6px]'>
				<Checkbox
					className='!size-5 !rounded-[0.3rem]'
					checked={enabled}
					onCheckedChange={(checked) => updateClamp(checked === true ? 2 : undefined)}
				>
					{t('lineClampControl.enable')}
				</Checkbox>
			</div>
			<PanelRowContainer layoutType='col' hintKey="lineClamp" label={t('lineClampControl.lineCount')}>
				<NumberField
					aria-label={t('lineClampControl.lineCount')}
					minValue={1}
					className='col-span-2'
					isDisabled={!enabled}
					value={enabled ? Number(clampValue) : 0}
					onChange={(v) => updateClamp(v)}
				>
					<NumberFieldInput size="sm" hideStepper />
				</NumberField>
			</PanelRowContainer>
		</SectionContainer>
	)
}

/**
 * Reads node.lineClamp[field] into the inline style overrides a template
 * Visual component should spread onto that field's rendered element.
 * Returns an empty object when unset — spread this after any existing
 * per-variant style so the clamp values win.
 */
export function lineClampStyle(node: CanvasNode | undefined, field: string): React.CSSProperties {
	const value = node?.lineClamp?.[field]
	if (typeof value !== 'number') return {}
	return {
		overflow: 'hidden',
		display: '-webkit-box',
		WebkitBoxOrient: 'vertical',
		WebkitLineClamp: value,
	}
}
