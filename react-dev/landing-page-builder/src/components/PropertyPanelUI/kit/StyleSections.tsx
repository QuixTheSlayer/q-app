import { useTranslation } from 'react-i18next'
import { useEditor } from '@/context/EditorContext'
import { PanelSection } from './PanelSection'
import { StyleFieldRow } from './StyleFieldRow'
import { STYLE_SECTIONS } from './sectionConfigs'

/** Renders every config-driven section that applies to the focused element. */
export function StyleSections() {
	const { t } = useTranslation('propertyPanel')
	const node = useEditor()?.focusedNode
	if (!node) return null

	return (
		<>
			{STYLE_SECTIONS.filter((section) => section.when(node)).map((section) => (
				<PanelSection key={section.id} title={t(section.titleKey)} icon={section.icon} defaultOpen={false}
					more={section.more && <>{section.more.map((field) => <StyleFieldRow key={field.prop} field={field} />)}</>}>
					{section.fields.map((field) => <StyleFieldRow key={field.prop} field={field} />)}
				</PanelSection>
			))}
		</>
	)
}
