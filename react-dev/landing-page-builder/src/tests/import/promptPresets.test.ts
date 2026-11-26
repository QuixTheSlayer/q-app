import { describe, expect, it } from 'vitest'
import { IMPORT_HTML_PROMPT_GROUPS, IMPORT_HTML_PROMPT_PRESETS, IMPORT_HTML_PROMPT_RULES, buildImportHtmlPrompt, importHtmlPromptPage } from '@/components/EditorUI/importHtmlPrompt'
import en from '@/i18n/locales/en/insert.json'

const labels = en.importHtmlDialog.aiPrompt

describe('Import HTML prompt presets', () => {
	it('has unique ids, a known group and an English label for each, and a label for each group', () => {
		const ids = IMPORT_HTML_PROMPT_PRESETS.map((p) => p.id)
		expect(new Set(ids).size).toBe(ids.length)
		for (const preset of IMPORT_HTML_PROMPT_PRESETS) {
			expect(IMPORT_HTML_PROMPT_GROUPS).toContain(preset.group)
			expect((labels.presets as Record<string, string>)[preset.id]).toBeTruthy()
		}
		for (const group of IMPORT_HTML_PROMPT_GROUPS) {
			expect((labels.presetGroups as Record<string, string>)[group]).toBeTruthy()
			expect(IMPORT_HTML_PROMPT_PRESETS.some((p) => p.group === group)).toBe(true)
		}
	})

	it('uses the portfolio intro for portfolios and the event intro for events', () => {
		expect(importHtmlPromptPage('portfolioDesigner')).toContain('portfolio website')
		expect(importHtmlPromptPage('portfolioDesigner')).not.toContain('event landing page for the event')
		expect(importHtmlPromptPage('awards')).toContain('event landing page for the event')
	})

	it('gives every portfolio the full section list and the shared output rules', () => {
		for (const preset of IMPORT_HTML_PROMPT_PRESETS.filter((p) => p.group === 'portfolio')) {
			expect(preset.page).toMatch(/- Sections, in order/)
			expect(preset.page).toMatch(/- Visual style:/)
			expect(preset.page).toMatch(/- Fonts:/)
			expect(buildImportHtmlPrompt(preset.id)).toContain(IMPORT_HTML_PROMPT_RULES)
		}
	})

	it('falls back to the first preset for an unknown id', () => {
		expect(importHtmlPromptPage('nope')).toBe(importHtmlPromptPage(IMPORT_HTML_PROMPT_PRESETS[0].id))
	})
})
