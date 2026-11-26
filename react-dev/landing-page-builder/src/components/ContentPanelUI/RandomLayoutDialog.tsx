import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Shuffle, Palette as PaletteIcon } from "lucide-react"
import { Dialog, DialogFooter, DialogTitle } from "@/components/ui/primitives/dialog-content"
import { DialogClose } from "@/components/ui/primitives/dialog"
import { Checkbox } from "@/components/ui/primitives/checkbox"
import { Button } from "@/components/ui/primitives/button"
import ColorPicker from "@/components/ui/ColorPicker"
import { useEditor } from "@/context/EditorContext"
import { cn } from "@/libs/cn"
import {
	RANDOM_LAYOUT_CATALOG,
	DEFAULT_SELECTED_KEYS,
	COLOR_THEMES,
	DEFAULT_THEME_KEY,
	CUSTOM_THEME_KEY,
	DEFAULT_CUSTOM_PALETTE,
	Palette,
	RandomLayoutGroup,
	generateRandomLayoutSections,
} from "@/utils/randomLayoutGenerator"
import { PlanTierBadge } from "./PlanTierBadge"

const GROUP_ORDER: RandomLayoutGroup[] = ["essential", "advanced", "compositions"]

/** Every group's items reuse an i18n namespace that already has their label — essential/compositions are both "Ready Made Templates"-shaped entries, advanced widgets reuse the plain Advanced Widgets group's own contentType.* labels. */
const GROUP_I18N_NAMESPACE: Record<RandomLayoutGroup, string> = {
	essential: "readyMadeTemplate",
	advanced: "contentType",
	compositions: "readyMadeTemplate",
}

/**
 * "Generate Random Layout" trigger button + the picker dialog it opens.
 * Lets the user choose which Essential Components / Advanced Widgets /
 * Randomized Compositions are eligible before generating, rather than a
 * blind one-click generation from a fixed pool. Gated by
 * editorConfig.enable_random_layout_generator at the call site (Insert.tsx),
 * not in here.
 */
export default function RandomLayoutDialog() {
	const { t } = useTranslation("insert")
	const canvas = useEditor()
	const [isOpen, setIsOpen] = useState(false)
	const [selected, setSelected] = useState<Set<string>>(() => new Set(DEFAULT_SELECTED_KEYS))
	const [themeKey, setThemeKey] = useState(DEFAULT_THEME_KEY)
	const [customPalette, setCustomPalette] = useState<Palette>(DEFAULT_CUSTOM_PALETTE)
	const [confirmingReplace, setConfirmingReplace] = useState(false)

	const hasExistingContent = (canvas?.content?.children?.length ?? 0) > 0

	const toggle = (key: string) => {
		setConfirmingReplace(false)
		setSelected((prev) => {
			const next = new Set(prev)
			if (next.has(key)) next.delete(key)
			else next.add(key)
			return next
		})
	}

	// Generation replaces the page's current content rather than appending to
	// it. That's destructive (though still a single Ctrl+Z undo step), so a
	// page that already has content needs one extra confirming click instead
	// of firing immediately.
	const runGenerate = () => {
		const palette = themeKey === CUSTOM_THEME_KEY ? customPalette : undefined
		canvas?.insertSections(generateRandomLayoutSections([...selected], themeKey, palette), { replace: true })
		toast.success(t("readyMadeTemplate.randomLayoutGenerated"))
		setConfirmingReplace(false)
		setIsOpen(false)
	}

	const handleGenerate = () => {
		if (selected.size === 0) {
			toast.warning(t("randomLayoutDialog.selectAtLeastOne"))
			return
		}
		if (hasExistingContent && !confirmingReplace) {
			setConfirmingReplace(true)
			return
		}
		runGenerate()
	}

	return (
		<Dialog
			className="p-4 rounded-md z-[99999999] w-[420px] max-h-[80vh] overflow-y-auto"
			isOpen={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open)
				if (!open) setConfirmingReplace(false)
			}}
			renderTrigger={
				<button className="relative w-full mb-3 rounded-lg flex items-center justify-center gap-2 px-3 py-3 bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 text-[13px] font-medium">
					<PlanTierBadge tier="Ent" />
					<Shuffle size={16} />
					{t("readyMadeTemplate.generateRandomLayout")}
				</button>
			}
		>
			<DialogTitle>{t("randomLayoutDialog.title")}</DialogTitle>
			<div className="text-xs text-muted-foreground mt-1 mb-4">{t("randomLayoutDialog.description")}</div>

			{hasExistingContent && (
				<div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2 mb-4">
					{t("randomLayoutDialog.replaceWarning")}
				</div>
			)}

			<div className="mb-4">
				<div className="text-[12px] font-semibold text-foreground mb-2">{t("randomLayoutDialog.colorTheme")}</div>
				<div className="flex flex-wrap gap-2">
					{COLOR_THEMES.map((theme) => (
						<button
							key={theme.key}
							type="button"
							title={t(`randomLayoutDialog.theme.${theme.labelKey}`)}
							aria-label={t(`randomLayoutDialog.theme.${theme.labelKey}`)}
							onClick={() => {
								setThemeKey(theme.key)
								setConfirmingReplace(false)
							}}
							className={cn(
								"size-7 rounded-full border-2 transition-transform",
								themeKey === theme.key ? "border-primary scale-110" : "border-border hover:scale-105",
							)}
							style={{ background: theme.swatch }}
						/>
					))}
					<button
						type="button"
						title={t("randomLayoutDialog.theme.custom")}
						aria-label={t("randomLayoutDialog.theme.custom")}
						onClick={() => {
							setThemeKey(CUSTOM_THEME_KEY)
							setConfirmingReplace(false)
						}}
						className={cn(
							"size-7 rounded-full border-2 flex items-center justify-center bg-muted text-muted-foreground transition-transform",
							themeKey === CUSTOM_THEME_KEY ? "border-primary scale-110" : "border-border hover:scale-105",
						)}
					>
						<PaletteIcon size={13} />
					</button>
				</div>
				<div className="text-[11px] text-muted-foreground mt-1.5">
					{themeKey === CUSTOM_THEME_KEY
						? t("randomLayoutDialog.theme.custom")
						: t(`randomLayoutDialog.theme.${COLOR_THEMES.find((t) => t.key === themeKey)?.labelKey}`)}
				</div>

				{themeKey === CUSTOM_THEME_KEY && (
					<div className="grid grid-cols-2 gap-3 mt-3 p-3 rounded-md bg-muted/40">
						{([
							["background", "bg"],
							["foreground", "text"],
							["primary", "primary"],
							["secondary", "muted"],
						] as const).map(([labelKey, field]) => (
							<div key={field} className="flex flex-col gap-1">
								<span className="text-[11px] text-muted-foreground">{t(`randomLayoutDialog.color.${labelKey}`)}</span>
								<ColorPicker
									value={customPalette[field] ?? DEFAULT_CUSTOM_PALETTE[field]}
									onChange={(v) => {
										setCustomPalette((prev) => ({ ...prev, [field]: v }))
										setConfirmingReplace(false)
									}}
								/>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="flex flex-col gap-4">
				{GROUP_ORDER.map((group) => {
					const items = RANDOM_LAYOUT_CATALOG.filter((item) => item.group === group)
					const ns = GROUP_I18N_NAMESPACE[group]
					return (
						<div key={group}>
							<div className="text-[12px] font-semibold text-foreground mb-2">{t(`randomLayoutDialog.${group}`)}</div>
							<div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
								{items.map((item) => (
									<label key={item.key} className="flex items-center gap-2 cursor-pointer">
										<Checkbox
											checked={selected.has(item.key)}
											onCheckedChange={() => toggle(item.key)}
										/>
										<span className="text-[12px] text-foreground">{t(`${ns}.${item.labelKey}`)}</span>
									</label>
								))}
							</div>
						</div>
					)
				})}
			</div>

			<DialogFooter className="mt-5">
				<DialogClose asChild>
					<Button type="button" variant="secondary" onClick={() => setConfirmingReplace(false)}>{t("dialog.cancel")}</Button>
				</DialogClose>
				<Button
					type="button"
					variant={confirmingReplace ? "destructive" : "primary"}
					onClick={handleGenerate}
				>
					<Shuffle size={14} className="mr-1.5" />
					{confirmingReplace ? t("randomLayoutDialog.confirmReplace") : t("randomLayoutDialog.generate")}
				</Button>
			</DialogFooter>
		</Dialog>
	)
}
