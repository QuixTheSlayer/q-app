import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Check, ChevronDown, Copy, Lock, Pencil, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/primitives/button"
import { cn } from "@/libs/cn"
import { outlineButtonStyle } from "@/components/EditorUI/codeDialogTheme"
import { IMPORT_HTML_PROMPT_GROUPS, IMPORT_HTML_PROMPT_PRESETS, IMPORT_HTML_PROMPT_RULES, buildImportHtmlPrompt, importHtmlPromptPage, type ImportHtmlPresetId } from "@/components/EditorUI/importHtmlPrompt"

const CAN_CHANGE = ["purpose", "sections", "style", "fonts", "content"] as const
const KEEP = ["skeleton", "format", "structure", "css", "js"] as const

/** Collapsible "Generate with AI" helper: a copyable prompt plus what users may edit in it. */
export default function ImportHtmlAiPrompt() {
	const { t } = useTranslation("insert")
	const [open, setOpen] = useState(false)
	const [copied, setCopied] = useState(false)
	const [preset, setPreset] = useState<ImportHtmlPresetId>("blank")

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(buildImportHtmlPrompt(preset))
			setCopied(true)
			toast.success(t("importHtmlDialog.aiPrompt.copied"))
			setTimeout(() => setCopied(false), 2000)
		} catch {
			toast.error(t("importHtmlDialog.aiPrompt.copyFailed"))
		}
	}

	return (
		<div className="mb-4 rounded-md border border-border">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-left hover:bg-primary/5 rounded-md"
			>
				<Sparkles size={14} className="text-primary shrink-0" />
				<span className="flex-1">{t("importHtmlDialog.aiPrompt.title")}</span>
				<ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
			</button>

			{open && (
				<div className="px-3 pb-3 text-xs">
					<p className="text-muted-foreground mb-3">{t("importHtmlDialog.aiPrompt.description")}</p>

					<div className="grid grid-cols-2 gap-2 mb-3">
						<div className="rounded-md border border-green-500/30 bg-green-500/5 p-2">
							<div className="flex items-center gap-1.5 font-semibold mb-1 text-green-600 dark:text-green-400">
								<Pencil size={12} />{t("importHtmlDialog.aiPrompt.canChangeTitle")}
							</div>
							<div role="list" className="space-y-0.5 text-muted-foreground">
								{CAN_CHANGE.map((key) => (
									<div role="listitem" key={key}>• {t(`importHtmlDialog.aiPrompt.canChange.${key}`)}</div>
								))}
							</div>
						</div>
						<div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2">
							<div className="flex items-center gap-1.5 font-semibold mb-1 text-amber-600 dark:text-amber-400">
								<Lock size={12} />{t("importHtmlDialog.aiPrompt.keepTitle")}
							</div>
							<div role="list" className="space-y-0.5 text-muted-foreground">
								{KEEP.map((key) => (
									<div role="listitem" key={key}>• {t(`importHtmlDialog.aiPrompt.keep.${key}`)}</div>
								))}
							</div>
						</div>
					</div>

					<div className="font-semibold mb-1.5">{t("importHtmlDialog.aiPrompt.presetLabel")}</div>
					<div className="space-y-2 mb-2">
						{IMPORT_HTML_PROMPT_GROUPS.map((group) => (
							<div key={group}>
								<div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">{t(`importHtmlDialog.aiPrompt.presetGroups.${group}`)}</div>
								<div role="radiogroup" aria-label={t(`importHtmlDialog.aiPrompt.presetGroups.${group}`)} className="flex flex-wrap gap-1.5">
									{IMPORT_HTML_PROMPT_PRESETS.filter((p) => p.group === group).map(({ id }) => (
										<button
											key={id}
											type="button"
											role="radio"
											aria-checked={preset === id}
											onClick={() => setPreset(id)}
											className={cn(
												"px-2.5 py-1 rounded-full border text-[11px] transition-colors",
												preset === id ? "border-primary bg-primary/15 text-primary font-semibold" : "border-border text-muted-foreground hover:border-primary/50",
											)}
										>
											{t(`importHtmlDialog.aiPrompt.presets.${id}`)}
										</button>
									))}
								</div>
							</div>
						))}
					</div>

					<div className="max-h-[180px] overflow-y-auto rounded-md border border-border bg-background p-2 font-mono text-[11px] whitespace-pre-wrap">
						<div className="text-green-600 dark:text-green-400">{importHtmlPromptPage(preset)}</div>
						<div className="text-muted-foreground mt-2">{IMPORT_HTML_PROMPT_RULES}</div>
					</div>

					<div className="flex items-center justify-between gap-2 mt-2">
						<span className="text-muted-foreground">{t("importHtmlDialog.aiPrompt.howTo")}</span>
						<Button type="button" variant="outline" size="sm" style={outlineButtonStyle} onClick={copy} className="shrink-0">
							{copied ? <Check size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
							{copied ? t("importHtmlDialog.aiPrompt.copiedShort") : t("importHtmlDialog.aiPrompt.copy")}
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}
