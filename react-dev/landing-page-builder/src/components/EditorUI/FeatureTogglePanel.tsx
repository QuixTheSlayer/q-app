import { useEffect, useState } from 'react'
import editorConfig, { FEATURE_OVERRIDES_STORAGE_KEY } from '@/configs/editor.config'
import useKeyCombo from '@/hooks/useKeyCombo'
import { Switch } from '@/components/ui/primitives/switch'
import { isDev } from '@/libs/checkEnv'

type EditorConfig = typeof editorConfig
type BooleanFlagKey = { [K in keyof EditorConfig]: EditorConfig[K] extends boolean ? K : never }[keyof EditorConfig]

const BOOLEAN_FLAG_KEYS = (Object.keys(editorConfig) as (keyof EditorConfig)[])
	.filter((key) => typeof editorConfig[key] === 'boolean') as BooleanFlagKey[]

function persistOverride(key: string, value: unknown) {
	let overrides: Record<string, unknown> = {}
	try {
		overrides = JSON.parse(localStorage.getItem(FEATURE_OVERRIDES_STORAGE_KEY) ?? '{}')
	} catch {
		overrides = {}
	}
	overrides[key] = value
	localStorage.setItem(FEATURE_OVERRIDES_STORAGE_KEY, JSON.stringify(overrides))
}

function persistContentTypeOverride(contentType: string, enabled: boolean) {
	let overrides: Record<string, unknown> = {}
	try {
		overrides = JSON.parse(localStorage.getItem(FEATURE_OVERRIDES_STORAGE_KEY) ?? '{}')
	} catch {
		overrides = {}
	}
	const existing = (overrides.enabled_content_types as Record<string, boolean>) ?? {}
	overrides.enabled_content_types = { ...existing, [contentType]: enabled }
	localStorage.setItem(FEATURE_OVERRIDES_STORAGE_KEY, JSON.stringify(overrides))
}

/**
 * Hidden dev panel (Ctrl+Shift+F) for flipping editorConfig flags and
 * enabled_content_types entries without hand-editing editor.config.ts.
 * editorConfig is a plain mutated object with no reactive store behind it,
 * so changes are persisted to localStorage and applied by reloading —
 * see the override-merge block in editor.config.ts.
 */
function FeatureTogglePanel() {
	const [open, setOpen] = useState(false)

	useKeyCombo({ key: 'f', ctrl: true, shift: true }, () => setOpen((v) => !v), !isDev)

	useEffect(() => {
		if (!open) return
		const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
		window.addEventListener('keydown', onEsc)
		return () => window.removeEventListener('keydown', onEsc)
	}, [open])

	if (!isDev || !open) return null

	const contentTypeKeys = Object.keys(editorConfig.enabled_content_types) as (keyof typeof editorConfig.enabled_content_types)[]

	return (
		<div
			className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50"
			onClick={() => setOpen(false)}
		>
			<div
				className="bg-background text-foreground rounded-lg shadow-xl w-[480px] max-h-[80vh] overflow-y-auto p-4"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-sm font-semibold">Feature Flags (dev only)</h2>
					<button
						onClick={() => setOpen(false)}
						className="text-muted-foreground hover:text-foreground text-sm cursor-pointer bg-transparent border-none"
					>
						Close
					</button>
				</div>

				<div className="flex flex-col gap-2 mb-4">
					{BOOLEAN_FLAG_KEYS.map((key) => (
						<div key={key} className="flex items-center justify-between gap-3 py-1">
							<span className="text-xs text-foreground">{key}</span>
							<Switch
								checked={editorConfig[key] as boolean}
								onCheckedChange={(checked) => {
									(editorConfig[key] as unknown) = checked
									persistOverride(key, checked)
									setOpen(false)
									window.location.reload()
								}}
							/>
						</div>
					))}
				</div>

				<h3 className="text-xs font-semibold text-muted-foreground mb-2">Content types</h3>
				<div className="flex flex-col gap-2">
					{contentTypeKeys.map((key) => (
						<div key={key} className="flex items-center justify-between gap-3 py-1">
							<span className="text-xs text-foreground">{key}</span>
							<Switch
								checked={editorConfig.enabled_content_types[key] !== false}
								onCheckedChange={(checked) => {
									editorConfig.enabled_content_types[key] = checked
									persistContentTypeOverride(key as string, checked)
									setOpen(false)
									window.location.reload()
								}}
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default FeatureTogglePanel
