import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Code2, Upload } from "lucide-react"
import { Dialog, DialogFooter, DialogTitle } from "@/components/ui/primitives/dialog-content"
import { DialogClose } from "@/components/ui/primitives/dialog"
import { Button } from "@/components/ui/primitives/button"
import CodeMirror from "@uiw/react-codemirror"
import { html as htmlLanguage } from "@codemirror/lang-html"
import { useTheme } from "next-themes"
import { htmlToJsonTree, type ImportedHtmlTree } from "@/utils/htmlToCanvasNodes"
import { MAX_HTML_FILE_BYTES, readHtmlFile } from "@/utils/readHtmlFile"
import { TOOLBAR_TRIGGER_CLASS, codeEditorTheme, outlineButtonStyle, primaryButtonStyle } from "@/components/EditorUI/codeDialogTheme"
import ImportHtmlAiPrompt from "@/components/EditorUI/ImportHtmlAiPrompt"
import editorConfig from "@/configs/editor.config"
import { htmlHasCode, importHasCode } from "@/utils/security/codePolicy"
import CodeBlockedNotice from "@/components/EditorUI/CodeBlockedNotice"

// Created once - CodeMirror reconfigures when the extension array identity changes.
// HTML mode also highlights the CSS/JS inside <style> and <script>.
const HTML_EXTENSIONS = [htmlLanguage(), codeEditorTheme]

/**
 * "Import HTML" toolbar trigger + the paste-HTML dialog it opens. Converts
 * pasted HTML (a full document or a bare fragment) into a root CanvasNode
 * tree plus its raw CSS and JS (see htmlToJsonTree), and REPLACES
 * the current page's content with it.
 *
 * Takes `onReplace` rather than reading useEditor() itself — this renders
 * in the top toolbar, which sits outside EditorContextProvider (the
 * provider only wraps the canvas below it), so useEditor() would silently
 * return undefined here. The caller (Editor.page.tsx) already owns the RTK
 * Query cache update this needs.
 */ 
export default function ImportHtmlDialog({ hasExistingContent, onReplace, open, onOpenChange, hideTrigger }: {
	hasExistingContent: boolean
	/** Control the dialog from outside (the top bar's menu opens it) instead of from its own button. */
	open?: boolean
	onOpenChange?: (open: boolean) => void
	/** Leaves out the built-in trigger button; use with `open`. */
	hideTrigger?: boolean
	onReplace: (result: ImportedHtmlTree) => void
}) {
	const { t } = useTranslation("insert")
	const { resolvedTheme } = useTheme()
	const [innerOpen, setInnerOpen] = useState(false)
	const isOpen = open ?? innerOpen
	const setIsOpen = (next: boolean) => (onOpenChange ? onOpenChange(next) : setInnerOpen(next))
	const [html, setHtml] = useState("")
	const [confirmingReplace, setConfirmingReplace] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const runImport = (result: ImportedHtmlTree) => {
		// The code comes into the editor, but it is never saved: the editor marks it, and the user is told why.
		onReplace(result)
		toast.success(t("importHtmlDialog.imported", { count: result.root.children.length }))
		const unsupported = result.tailwind?.unsupported ?? []
		if (unsupported.length) {
			toast.warning(t("importHtmlDialog.tailwindUnsupported", { count: unsupported.length, classes: unsupported.slice(0, 10).join(", ") }), { duration: 15000 })
		}
		if (importHasCode(result)) {
			toast.warning(t("codeBlocked.message", { email: editorConfig.support_email }), { duration: 20000 })
		}
		if (result.skipped.length) {
			toast.warning(t("importHtmlDialog.skipped", { tags: result.skipped.map((tag) => `<${tag}>`).join(", ") }))
		}
		setHtml("")
		setConfirmingReplace(false)
		setIsOpen(false)
	}

	// The file only fills the editor; the user reviews it and clicks Import.
	const handleFile = async (file: File | undefined) => {
		if (!file) return
		const result = await readHtmlFile(file)
		if (fileInputRef.current) fileInputRef.current.value = ""
		if (!result.ok) {
			const message = result.reason === "tooLarge"
				? t("importHtmlDialog.fileTooLarge", { mb: MAX_HTML_FILE_BYTES / 1024 / 1024 })
				: result.reason === "empty" ? t("importHtmlDialog.fileEmpty") : t("importHtmlDialog.uploadFailed")
			toast.warning(message)
			return
		}
		setHtml(result.text)
		setConfirmingReplace(false)
		toast.success(t("importHtmlDialog.fileLoaded", { name: file.name }))
	}

	const handleImport = () => {
		if (!html.trim()) {
			toast.warning(t("importHtmlDialog.pasteFirst"))
			return
		}
		try {
			const result = htmlToJsonTree(html)
			
			if (result.root.children.length === 0) {
				toast.warning(t("importHtmlDialog.nothingConverted"))
				return
			}
			if (hasExistingContent && !confirmingReplace) {
				setConfirmingReplace(true)
				return
			}
			runImport(result)
		} catch (e) {
			console.error(e)
			toast.error(t("importHtmlDialog.failed"))
		}
	}

	return (
		<Dialog
			className="p-4 rounded-md z-[99999999] w-[min(1100px,94vw)] max-w-none max-h-[90vh] overflow-y-auto"
			isOpen={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open)
				if (!open) setConfirmingReplace(false)
			}}
			renderTrigger={hideTrigger ? undefined :
				<div
					role="button"
					tabIndex={0}
					title={t("importHtmlDialog.title")}
					aria-label={t("importHtmlDialog.title")}
					className={TOOLBAR_TRIGGER_CLASS}
				>
					<Code2 size={16} />
					{t("importHtmlDialog.trigger")}
				</div>
			}
		>
			<DialogTitle>{t("importHtmlDialog.title")}</DialogTitle>
			<div className="text-xs text-muted-foreground mt-1 mb-4">{t("importHtmlDialog.description")}</div>

			{editorConfig.enable_import_ai_prompt && <ImportHtmlAiPrompt />}

			{hasExistingContent && (
				<div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2 mb-4">
					{t("importHtmlDialog.replaceWarning")}
				</div>
			)}

			{editorConfig.enable_import_html_upload && (
				<div className="flex items-center justify-between gap-2 mb-2">
					<span className="text-xs text-muted-foreground">{t("importHtmlDialog.uploadHint")}</span>
					<Button type="button" variant="outline" size="sm" style={outlineButtonStyle} onClick={() => fileInputRef.current?.click()}>
						<Upload size={14} className="mr-1.5" />
						{t("importHtmlDialog.uploadHtml")}
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept=".html,.htm,.xhtml,text/html"
						className="hidden"
						onChange={(e) => handleFile(e.target.files?.[0])}
					/>
				</div>
			)}

			<CodeMirror
				value={html}
				onChange={(value) => { setHtml(value); setConfirmingReplace(false) }}
				extensions={HTML_EXTENSIONS}
				theme={resolvedTheme === "dark" ? "dark" : "light"}
				placeholder={t("importHtmlDialog.placeholder")}
				height="50vh"
				basicSetup={{ foldGutter: true, highlightActiveLine: true }}
				className="rounded-md border border-border overflow-hidden text-xs"
			/>

			{htmlHasCode(html) && <CodeBlockedNotice className="mt-3" />}

			<DialogFooter className="mt-5">
				<DialogClose asChild>
					<Button type="button" variant="outline" style={outlineButtonStyle} onClick={() => setConfirmingReplace(false)}>{t("dialog.cancel")}</Button>
				</DialogClose>
				<Button type="button" variant={confirmingReplace ? "destructive" : "primary"} style={confirmingReplace ? undefined : primaryButtonStyle} onClick={handleImport}>
					<Code2 size={14} className="mr-1.5" />
					{confirmingReplace ? t("importHtmlDialog.confirmReplace") : t("importHtmlDialog.import")}
				</Button>
			</DialogFooter>
		</Dialog>
	)
}
