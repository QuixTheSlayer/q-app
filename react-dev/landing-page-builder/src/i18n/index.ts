import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import my from './locales/my'
import hi from './locales/hi'
import zhTW from './locales/zh-TW'
import zhCN from './locales/zh-CN'
import de from './locales/de'
import ms from './locales/ms'
import bn from './locales/bn'
import ru from './locales/ru'
import fr from './locales/fr'
import it from './locales/it'
import es from './locales/es'
import ko from './locales/ko'
import pt from './locales/pt'

export const SUPPORTED_LANGUAGES = [
	{ code: 'en', label: 'English' },
	{ code: 'my', label: 'မြန်မာ' },
	{ code: 'hi', label: 'हिन्दी' },
	{ code: 'zh-TW', label: '繁體中文' },
	{ code: 'zh-CN', label: '简体中文' },
	{ code: 'de', label: 'Deutsch' },
	{ code: 'ms', label: 'Bahasa Melayu' },
	{ code: 'bn', label: 'বাংলা' },
	{ code: 'ru', label: 'Русский' },
	{ code: 'fr', label: 'Français' },
	{ code: 'it', label: 'Italiano' },
	{ code: 'es', label: 'Español' },
	{ code: 'ko', label: '한국어' },
	{ code: 'pt', label: 'Português' },
] as const

export type SupportedLanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']

export const EDITOR_LANGUAGE_STORAGE_KEY = 'landing_page_builder_language'

function getStoredLanguage(): SupportedLanguageCode {
	try {
		const stored = localStorage.getItem(EDITOR_LANGUAGE_STORAGE_KEY)
		if (stored && SUPPORTED_LANGUAGES.some((lang) => lang.code === stored)) {
			return stored as SupportedLanguageCode
		}
	} catch {
		// localStorage unavailable — fall back to default
	}
	return 'en'
}

i18n.use(initReactI18next).init({
	resources: {
		en,
		my,
		hi,
		'zh-TW': zhTW,
		'zh-CN': zhCN,
		de,
		ms,
		bn,
		ru,
		fr,
		it,
		es,
		ko,
		pt,
	},
	lng: getStoredLanguage(),
	fallbackLng: 'en',
	// Namespaces map to feature areas (Insert panel, Action menu, ...) so
	// each area's dictionary stays small and independently extendable —
	// see src/i18n/locales/en/index.ts for the full namespace list.
	defaultNS: 'common',
	interpolation: {
		escapeValue: false, // React already escapes output
	},
})

export function setEditorLanguage(code: SupportedLanguageCode) {
	i18n.changeLanguage(code)
	try {
		localStorage.setItem(EDITOR_LANGUAGE_STORAGE_KEY, code)
	} catch {
		// localStorage unavailable — language still changes for this session
	}
}

export default i18n
