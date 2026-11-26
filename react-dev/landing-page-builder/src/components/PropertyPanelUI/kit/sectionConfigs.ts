import { Palette } from 'lucide-react'
import type { SectionConfig } from './fieldTypes'

/**
 * Simple one-property sections, as data. To add a control add a field; to add a section add an entry.
 * Sections with their own logic (size modes, padding sides, gradients) stay components for now.
 */
export const STYLE_SECTIONS: SectionConfig[] = [
	{
		id: 'appearance',
		titleKey: 'kit.appearance.title',
		icon: Palette,
		when: (node) => node.contentType !== 'root',
		fields: [
			{ prop: 'opacity', labelKey: 'kit.appearance.opacity', control: { type: 'slider', min: 0, max: 100, unit: '%', scale: 100 } },
			{
				prop: 'overflow', labelKey: 'kit.appearance.overflow', control: {
					type: 'select', options: [
						{ value: 'visible', labelKey: 'kit.appearance.overflowVisible' },
						{ value: 'hidden', labelKey: 'kit.appearance.overflowHidden' },
						{ value: 'auto', labelKey: 'kit.appearance.overflowAuto' },
					],
				},
			},
		],
		more: [
			{
				prop: 'cursor', labelKey: 'kit.appearance.cursor', control: {
					type: 'select', options: [
						{ value: 'auto', labelKey: 'kit.appearance.cursorAuto' },
						{ value: 'pointer', labelKey: 'kit.appearance.cursorPointer' },
						{ value: 'default', labelKey: 'kit.appearance.cursorDefault' },
					],
				},
			},
		],
	},
]
