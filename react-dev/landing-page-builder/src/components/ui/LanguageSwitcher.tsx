import { useTranslation } from 'react-i18next'
import { Select, SelectOption } from '@/components/ui/Select'
import { SUPPORTED_LANGUAGES, setEditorLanguage, SupportedLanguageCode } from '@/i18n'

/**
 * Editor-chrome language switcher — only translates the builder's own UI
 * (buttons, panels, menus), not the page content being authored. See
 * src/i18n/locales/en for the migrated namespaces.
 */
function LanguageSwitcher() {
	const { t, i18n } = useTranslation('common')

	return (
		<Select
			aria-label={t('language.label')}
			size="sm"
			placeholder=""
			className="min-w-[38px]"
			items={SUPPORTED_LANGUAGES}
			selectedKey={i18n.language}
			onSelectionChange={(code) => setEditorLanguage(code as SupportedLanguageCode)}
		>
			{(item) => <SelectOption id={item.code}>{item.label}</SelectOption>}
		</Select>
	)
}

export default LanguageSwitcher
