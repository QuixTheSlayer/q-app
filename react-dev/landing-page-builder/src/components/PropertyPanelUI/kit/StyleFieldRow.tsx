import { useState } from 'react'
import { Undo2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEditor } from '@/context/EditorContext'
import { usePanelStyle } from '@/hooks/usePanelStyle'
import { ToggleGroup, ToggleGroupItem } from '@/components/inputs/ToggleGroup'
import { Select, SelectOption } from '@/components/ui/Select'
import type { StyleField } from './fieldTypes'

type Slider = Extract<StyleField['control'], { type: 'slider' }>

/** Slider that saves on release, so one drag is one undo step. */
function SliderControl({ control, label, value, onSave }: { control: Slider; label: string; value: string; onSave: (v: string) => void }) {
	const scale = control.scale ?? 1
	const stored = value === '' ? NaN : Number(value)
	const shown = Number.isNaN(stored) ? control.max : Math.round(stored * scale * 100) / 100
	const [draft, setDraft] = useState<number | null>(null)
	const save = () => {
		if (draft === null) return
		onSave(String(draft / scale))
		setDraft(null)
	}

	return (
		<div className="flex items-center gap-2 flex-1 min-w-0">
			<input type="range" aria-label={label} className="flex-1 min-w-0 accent-primary" min={control.min} max={control.max} step={control.step ?? 1}
				value={draft ?? shown} onChange={(e) => setDraft(Number(e.target.value))}
				onPointerUp={save} onKeyUp={save} onBlur={save} />
			<span className="w-12 shrink-0 text-right text-[12.5px] text-muted-foreground tabular-nums">{draft ?? shown}{control.unit}</span>
		</div>
	)
}

/** Label, control and a "changed" dot with reset, for one CSS property. */
export function StyleFieldRow({ field }: { field: StyleField }) {
	const { t } = useTranslation('propertyPanel')
	const canvas = useEditor()
	const panel = usePanelStyle()
	const { prop, control } = field
	const label = t(field.labelKey)
	const value = String(canvas?.focusedNode?.style?.[prop] ?? panel.value(prop) ?? '')
	const save = (next: string) => canvas?.updateNodeStyle({ [prop]: next } as React.CSSProperties)
	const changed = panel.isChanged([prop])
	const options = control.type === 'slider' ? [] : control.options.map((o) => ({ value: o.value, label: t(o.labelKey) }))

	return (
		<div className="flex items-center gap-2 min-h-[34px]">
			<span className="w-[34%] shrink-0 flex items-center gap-1 text-[13px] text-foreground">
				{changed && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label={t('panel.fieldChanged')} />}
				<span className="truncate">{label}</span>
			</span>
			{control.type === 'slider' && <SliderControl control={control} label={label} value={value} onSave={save} />}
			{control.type === 'segmented' && (
				<ToggleGroup type="single" size="sm" className="flex-1" value={value || options[0].value} onValueChange={(v) => v && save(v)}>
					{options.map((o) => <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>{o.label}</ToggleGroupItem>)}
				</ToggleGroup>
			)}
			{control.type === 'select' && (
				<Select aria-label={label} size="sm" placeholder="" className="flex-1" items={options} selectedKey={value || options[0].value} onSelectionChange={(v) => save(String(v))}>
					{(item) => <SelectOption id={item.value}>{item.label}</SelectOption>}
				</Select>
			)}
			<button type="button" onClick={() => panel.reset([prop])} aria-label={t('panel.resetField')} title={t('panel.resetField')}
				className={`shrink-0 rounded p-1 text-muted-foreground hover:text-primary ${changed ? '' : 'invisible'}`}>
				<Undo2 size={13} />
			</button>
		</div>
	)
}
