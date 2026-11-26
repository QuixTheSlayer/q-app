import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Braces, Copy } from "lucide-react"
import { Dialog, DialogFooter, DialogTitle } from "@/components/ui/primitives/dialog-content"
import { DialogClose } from "@/components/ui/primitives/dialog"
import { Button } from "@/components/ui/primitives/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CodeMirror from "@uiw/react-codemirror"
import { css as cssLanguage } from "@codemirror/lang-css"
import { javascript } from "@codemirror/lang-javascript"
import { EditorView } from "@codemirror/view"
import { useTheme } from "next-themes"
import { TOOLBAR_TRIGGER_CLASS, codeEditorTheme, outlineButtonStyle } from "@/components/EditorUI/codeDialogTheme"
import CodeBlockedNotice from "@/components/EditorUI/CodeBlockedNotice"

type CodeTab = "css" | "js"

// Created once - CodeMirror reconfigures when the extension array identity changes.
const LANGUAGE: Record<CodeTab, ReturnType<typeof javascript>[]> = {
	css: [cssLanguage()],
	js: [javascript()],
}
const READ_ONLY = [EditorView.editable.of(false)]

/**
 * "Code for review": the CSS and JavaScript that came with the page (from imported HTML), shown read-only so the user
 * can copy it and send it to the support team, who check by hand that it is safe and add it for them.
 * The page does not accept this code: it is not saved and it does not run.
 */
export default function CodeReviewDialog({ css, js, open, onOpenChange, hideTrigger }: {
	css: string
	js: string
	/** Control the dialog from outside (the top bar's menu opens it) instead of from its own button. */
	open?: boolean
	onOpenChange?: (open: boolean) => void
	/** Leaves out the built-in trigger button; use with `open`. */
	hideTrigger?: boolean
}) {
	const { t } = useTranslation("insert")
	const { resolvedTheme } = useTheme()
	const [innerOpen, setInnerOpen] = useState(false)
	const isOpen = open ?? innerOpen
	const setIsOpen = (next: boolean) => (onOpenChange ? onOpenChange(next) : setInnerOpen(next))
	const [tab, setTab] = useState<CodeTab>("css")
	const code: Record<CodeTab, string> = { css, js }
	const hasCode = !!css.trim() || !!js.trim()

	const copy = async (text: string) => {
		try {
			await navigator?.clipboard?.writeText(`${text}`)

			toast.success(t("codeReview.copied"))
		} catch(error) {
			toast.error(t("codeReview.copyFailed"))
		}
	}

	return (
		<Dialog
			className="p-4 rounded-md z-[99999999] w-[min(1100px,94vw)] max-w-none max-h-[90vh] overflow-y-auto"
			isOpen={isOpen}
			onOpenChange={(next) => {
				// Open on the tab that has something in it.
				if (next) setTab(css.trim() || !js.trim() ? "css" : "js")
				setIsOpen(next)
			}}
			renderTrigger={hideTrigger ? undefined :
				<div
					role="button"
					tabIndex={0}
					title={t("codeReview.title")}
					aria-label={t("codeReview.title")}
					className={TOOLBAR_TRIGGER_CLASS}
				>
					<Braces size={16} />
					{t("codeReview.trigger")}
				</div>
			}
		>
			<DialogTitle>{t("codeReview.title")}</DialogTitle>

			<CodeBlockedNotice>{t("codeReview.copyHint")}</CodeBlockedNotice>

			{!hasCode ? (
				<div className="text-xs text-muted-foreground mt-4">{t("codeReview.empty")}</div>
			) : (
				<Tabs value={tab} onValueChange={(value) => setTab(value as CodeTab)} className="mt-4">
					<div className="flex items-center justify-between gap-2">
						<TabsList>
							<TabsTrigger value="css">{t("codeReview.cssTab")}</TabsTrigger>
							<TabsTrigger value="js">{t("codeReview.jsTab")}</TabsTrigger>
						</TabsList>
						<Button type="button" variant="outline" style={outlineButtonStyle} isDisabled={!code[tab].trim()} onClick={() => copy(code[tab])}>
							<Copy size={14} className="mr-1.5" />
							{tab === "css" ? t("codeReview.copyCss") : t("codeReview.copyJs")}
						</Button>
					</div>

					{(["css", "js"] as CodeTab[]).map((key) => (
						<TabsContent key={key} value={key} className="mt-3">
							<CodeMirror
								value={code[key]}
								readOnly
								extensions={[...LANGUAGE[key], ...READ_ONLY, codeEditorTheme]}
								theme={resolvedTheme === "dark" ? "dark" : "light"}
								placeholder={key === "css" ? t("codeReview.noCss") : t("codeReview.noJs")}
								height="50vh"
								basicSetup={{ foldGutter: true, highlightActiveLine: false }}
								className="rounded-md border border-border overflow-hidden text-xs"
							/>
						</TabsContent>
					))}
				</Tabs>
			)}

			<DialogFooter className="mt-5">
				{hasCode && (
					<Button type="button" variant="outline" style={outlineButtonStyle} onClick={() => copy([css.trim() && `/* CSS */\n${css.trim()}`, js.trim() && `// JS\n${js.trim()}`].filter(Boolean).join("\n\n"))}>
						<Copy size={14} className="mr-1.5" />
						{t("codeReview.copyAll")}
					</Button>
				)}
				<DialogClose asChild>
					<Button type="button" variant="outline" style={outlineButtonStyle}>{t("codeReview.close")}</Button>
				</DialogClose>
			</DialogFooter>
		</Dialog>
	)
}
