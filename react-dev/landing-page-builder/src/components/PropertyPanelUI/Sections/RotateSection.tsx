import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw, RotateCw } from 'lucide-react'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { useEditor } from '@/context/EditorContext'
import { usePanelStyle } from '@/hooks/usePanelStyle'
import editorConfig from '@/configs/editor.config'
import { normalizeDegrees, parseRotate } from '@/utils/rotate.utils'

/** Node types that get the rotate control. */
const ROTATABLE = new Set(['block', 'image', 'button'])

/**
 * Static rotation of a block, image or button. Written as the CSS `rotate` property (not
 * `transform`), so it adds to the editor's own drag/layout transforms instead of fighting them.
 */
function RotateSection() {
	const { t } = useTranslation('propertyPanel')
	const canvas = useEditor()
	const panelStyle = usePanelStyle()
	const current = parseRotate(panelStyle.value('rotate'))
	// Slider position while dragging; saved on release so one drag is one undo step.
	const [draft, setDraft] = useState<number | null>(null)

	if (!editorConfig.enable_rotate_control || !canvas?.focusedNode || !ROTATABLE.has(canvas.focusedNode.contentType)) return null

	const save = (degrees: number) => {
		setDraft(null)
		const next = normalizeDegrees(degrees)
		// 0° removes the style instead of storing a no-op rotate.
		canvas.updateNodeStyle({ rotate: next === 0 ? undefined : `${next}deg` })
	}
	const shown = draft ?? current

	return (
		<SectionContainer hintKey="rotate" label={t('controllers.rotate')}>
			<PanelRowContainer layoutType="col" hintKey="rotate" label={t('controllers.angle')} htmlFor="rotate-angle" props={['rotate']}>
				<div className="flex items-center gap-2 w-full">
					<input
						type="range"
						aria-label={t('controllers.rotate')}
						className="flex-1 min-w-0 accent-primary"
						min={-180}
						max={180}
						step={1}
						value={shown}
						onChange={(e) => setDraft(Number(e.target.value))}
						onPointerUp={() => draft !== null && save(draft)}
						onKeyUp={() => draft !== null && save(draft)}
						onBlur={() => draft !== null && save(draft)}
					/>
					<NumberField id="rotate-angle" aria-label={t('controllers.angle')} className="w-[72px] shrink-0" step={1}
						value={shown} onChange={(v) => !Number.isNaN(v) && save(v)}>
						<NumberFieldInput size="sm" hideStepper />
					</NumberField>
					<button type="button" onClick={() => save(current - 90)} title={t('controllers.rotateLeft90')} aria-label={t('controllers.rotateLeft90')}
						className="size-8 shrink-0 grid place-items-center rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary">
						<RotateCcw size={14} />
					</button>
					<button type="button" onClick={() => save(current + 90)} title={t('controllers.rotateRight90')} aria-label={t('controllers.rotateRight90')}
						className="size-8 shrink-0 grid place-items-center rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary">
						<RotateCw size={14} />
					</button>
				</div>
			</PanelRowContainer>
		</SectionContainer>
	)
}

export default RotateSection
