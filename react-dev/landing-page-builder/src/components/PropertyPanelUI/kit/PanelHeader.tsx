import { Box, Image, LayoutTemplate, Link2, MousePointerClick, Rows3, Table, Type, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEditor } from '@/context/EditorContext'
import { camelToSentenceCase } from '@/utils/string.utils'
import DeviceScopeControl from '@/components/PropertyPanelUI/Sections/DeviceScopeControl'
import NodeVisibilityToggle from '@/components/PropertyPanelUI/Sections/NodeVisibilityToggle'

const ICONS: Record<string, LucideIcon> = {
	root: LayoutTemplate, section: Rows3, block: Box, text: Type, image: Image, button: MousePointerClick, table: Table, link: Link2,
}

/** Element icon + name, with the visibility and screen-size controls. */
export function PanelHeader() {
	const { t } = useTranslation('propertyPanel')
	const canvas = useEditor()
	const node = canvas?.focusedNode
	if (!node) return null

	const Icon = ICONS[node.contentType] ?? Box
	const scope = canvas.deviceScope
	// Tablet edits also reach phones: mobile is layered on top of tablet.
	const notice = scope === 'tablet' ? t('kit.scopeTablet') : scope === 'mobile' ? t('kit.scopeMobile') : ''

	return (
		<>
			<div className="flex items-center gap-2.5 py-3">
				<span className="grid place-items-center size-8 shrink-0 rounded-lg bg-primary/10 text-primary"><Icon size={16} /></span>
				<p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground">
					{camelToSentenceCase(node.name ?? node.contentType)}
				</p>
				<div className="flex items-center gap-1.5 shrink-0">
					<NodeVisibilityToggle />
					<DeviceScopeControl />
				</div>
			</div>
			{notice && <p role="status" className="mb-2 rounded-md bg-primary/10 px-3 py-2 text-[12.5px] text-foreground">{notice}</p>}
		</>
	)
}
