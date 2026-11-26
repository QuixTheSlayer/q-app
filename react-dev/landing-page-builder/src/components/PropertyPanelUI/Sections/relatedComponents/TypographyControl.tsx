import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { CanvasNode } from '@/types/node.type'
import { fonts } from '@/consts/propertyField.consts'
import { Select, SelectOption } from '@/components/ui/Select'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import { ToggleGroup, ToggleGroupItem } from '@/components/inputs/ToggleGroup'
import ColorPicker from '@/components/ui/ColorPicker'
import { LuBold } from 'react-icons/lu'
import { RiAlignCenter, RiAlignJustify, RiAlignLeft, RiAlignRight } from 'react-icons/ri'
import { useTranslation } from 'react-i18next'
import CSSUtils from '@/utils/CSS.utils'

const FONT_WEIGHTS: { value: string; label: string }[] = [
	{ value: '400', label: 'Regular' },
	{ value: '500', label: 'Medium' },
	{ value: '600', label: 'Semibold' },
	{ value: '700', label: 'Bold' },
	{ value: '800', label: 'Extrabold' },
]

const TEXT_ALIGNS: { value: NonNullable<React.CSSProperties['textAlign']>; icon: React.ReactNode }[] = [
	{ value: 'left', icon: <RiAlignLeft /> },
	{ value: 'center', icon: <RiAlignCenter /> },
	{ value: 'right', icon: <RiAlignRight /> },
	{ value: 'justify', icon: <RiAlignJustify /> },
]

/**
 * `fontSize` arrives here in two different shapes: an actual saved override
 * is always an "Xem" string (per CSSUtils.setEmValue, the app-wide storage
 * convention), but `defaultValue` — the field's hardcoded real appearance
 * when no override exists yet — is often written as a plain "Xpx" string by
 * callers, since that's what the underlying Tailwind/inline style literally
 * is. Both need to resolve to the same px number for display.
 */
function fontSizeToPx(source?: string | number): number | undefined {
	if (source === undefined) return undefined
	if (typeof source === 'number') return source
	if (source.endsWith('em')) return CSSUtils.extractEmValue(source) || undefined
	const parsed = parseFloat(source)
	return Number.isNaN(parsed) ? undefined : parsed
}

/**
 * Shared typography control for a single template text field — font family,
 * size, weight, align, color. Unlike the rich-text Typography section
 * (which drives Tiptap's own editor commands via canvas.textEditorObj and
 * only applies to plain TextNode content), template fields are plain
 * strings rendered with per-variant hardcoded styles, so this control reads/
 * writes a plain React.CSSProperties value directly through `value`/
 * `onChange` — agnostic to where that style object actually lives on the
 * node (a real `*Style` field like Timeline.titleStyle, or a
 * `textStyles[field]` map entry for templates with no dedicated field —
 * see the two exported helpers below for the map-based wiring).
 */
export function TypographyControl({
	value,
	onChange,
	label,
	defaultValue,
}: {
	value: React.CSSProperties | undefined
	onChange: (next: React.CSSProperties) => void
	label?: string
	/**
	 * The field's REAL current appearance when no override has been set yet —
	 * i.e. whatever the uiType variant actually hardcodes for this field
	 * right now (e.g. Hero's heading renders at `text-3xl font-bold` /
	 * `#111827` via Tailwind, not this control's own generic fallback).
	 * Every field of every field of every template MUST pass its own
	 * accurate value here (check the Visual component's real className/style
	 * for that field) so what the panel displays always matches what's
	 * actually on screen — never leave this unset and rely on the generic
	 * 16px/400/left/#000000 fallback below, which is a last-resort only for
	 * fields no caller has audited yet.
	 */
	defaultValue?: React.CSSProperties
}) {
	const { t } = useTranslation('propertyPanel')

	function patch(partial: React.CSSProperties) {
		onChange({ ...value, ...partial })
	}

	const fontFamily = value?.fontFamily ?? defaultValue?.fontFamily ?? fonts[0].value
	const fontSizePx = fontSizeToPx(value?.fontSize) ?? fontSizeToPx(defaultValue?.fontSize) ?? 16
	const fontWeight = String(value?.fontWeight ?? defaultValue?.fontWeight ?? '400')
	const textAlign = (value?.textAlign ?? defaultValue?.textAlign ?? 'left') as string
	const color = (value?.color ?? defaultValue?.color ?? '#000000') as string

	return (
		<SectionContainer hintKey="typographyGroup" label={label ?? t('typographyControl.label')}>
			<PanelRowContainer layoutType='col' hintKey="typographyGroup" label={t('typographyControl.font')}>
				<Select
					aria-label={t('typographyControl.font')}
					size='sm'
					placeholder=''
					className='col-span-2'
					items={fonts}
					selectedKey={fonts.map(f => f.value).find(f => f === fontFamily) ?? fonts[0].value as string}
					onSelectionChange={(v) => patch({ fontFamily: v as string })}
				>
					{(item) => (<SelectOption id={item.value as string}>{item.label}</SelectOption>)}
				</Select>
			</PanelRowContainer>

			<PanelRowContainer layoutType='col' hintKey="fontSize" label={t('typographyControl.fontSize')}>
				<NumberField
					aria-label={t('typographyControl.fontSize')}
					minValue={8}
					maxValue={200}
					className='col-span-2'
					value={fontSizePx}
					onChange={(v) => patch({ fontSize: CSSUtils.setEmValue(v) })}
				>
					<NumberFieldInput size="sm" hideStepper />
				</NumberField>
			</PanelRowContainer>

			<PanelRowContainer layoutType='col' hintKey="fontWeight" label={t('typographyControl.fontWeight')}>
				<Select
					aria-label={t('typographyControl.fontWeight')}
					size='sm'
					placeholder=''
					className='col-span-2'
					items={FONT_WEIGHTS}
					selectedKey={fontWeight}
					onSelectionChange={(v) => patch({ fontWeight: v as string })}
				>
					{(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
				</Select>
			</PanelRowContainer>

			<PanelRowContainer layoutType='col' hintKey="textAlign" label={t('typographyControl.align')}>
				<ToggleGroup type='single' size="sm" className='col-span-2' value={textAlign}>
					{TEXT_ALIGNS.map(({ value: alignValue, icon }) => (
						<ToggleGroupItem
							key={alignValue}
							value={alignValue}
							aria-label={alignValue}
							title={alignValue}
							onClick={() => patch({ textAlign: alignValue })}
						>
							{icon}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</PanelRowContainer>

			<PanelRowContainer className=' w-full px-0 ' layoutType='col' hintKey="colorPair" label={t('typographyControl.color')}>
				<ColorPicker
					value={color}
					onChange={(v) => patch({ color: v })}
				/>
			</PanelRowContainer>
		</SectionContainer>
	)
}

/**
 * Map-based variant of TypographyControl for templates with no dedicated
 * `*Style` node field for a given text field — reads/writes
 * `node.textStyles[field]` (see BaseCanvasNode.textStyles). Use the plain
 * `TypographyControl` directly instead when the template already has a real
 * `*Style` field (Timeline/Faq/PricingToggle/ProgressBar/Counter/Rating).
 */
export function TypographyMapControl({ field, label, defaultValue }: { field: string; label?: string; defaultValue?: React.CSSProperties }) {
	const canvas = useEditor()
	const node = canvas?.focusedNode

	return (
		<TypographyControl
			value={node?.textStyles?.[field]}
			label={label}
			defaultValue={defaultValue}
			onChange={(next) => {
				canvas.updateNode((prevNode) => {
					const textStyles = { ...(prevNode as CanvasNode).textStyles, [field]: next }
					return {
						...prevNode,
						textStyles,
					}
				})
			}}
		/>
	)
}

/**
 * Reads node.textStyles[field] for a template Visual component to spread
 * onto that field's rendered element — the render-side counterpart to
 * TypographyMapControl. Returns an empty object when unset. Spread this
 * alongside (before, so real per-variant styling still overrides accent
 * colors etc. that TypographyControl doesn't touch) the existing per-variant
 * style object, e.g. `style={{ ...variantStyle, ...textStylesFor(node,
 * 'heading') }}`.
 */
export function textStylesFor(node: CanvasNode | undefined, field: string): React.CSSProperties {
	return node?.textStyles?.[field] ?? {}
}
