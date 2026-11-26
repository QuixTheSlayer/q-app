import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { CanvasNode } from '@/types/node.type'

export type FieldOption = { value: string; labelKey: string }

export type FieldControl =
	/** `scale` turns the stored number into the shown one (opacity 0-1 shows as 0-100). */
	| { type: 'slider'; min: number; max: number; step?: number; unit?: string; scale?: number }
	| { type: 'segmented'; options: FieldOption[] }
	| { type: 'select'; options: FieldOption[] }

/** One control bound to one CSS property. */
export type StyleField = {
	prop: keyof CSSProperties & string
	labelKey: string
	control: FieldControl
}

export type SectionConfig = {
	id: string
	titleKey: string
	icon: LucideIcon
	when: (node: CanvasNode) => boolean
	/** Always visible: keep it to the 2-4 things people change most. */
	fields: StyleField[]
	/** Behind "More options". */
	more?: StyleField[]
}
