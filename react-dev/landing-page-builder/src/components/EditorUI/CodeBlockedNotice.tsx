import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import editorConfig from "@/configs/editor.config"
import { cn } from "@/libs/cn"
import { WARNING_BOX_CLASS } from "@/components/EditorUI/codeDialogTheme"

// Stands in for the address while the sentence is split around it, so the address can be a link.
const EMAIL_SLOT = "\u0001"

/**
 * The warning shown wherever CSS or JavaScript is involved (pasted HTML that carries code, a page that holds it):
 * it says the code isn't supported and gives the support address as a mail link. `children` adds a second line.
 */
export default function CodeBlockedNotice({ className, children }: { className?: string; children?: ReactNode }) {
	const { t } = useTranslation("insert")
	const email = editorConfig.support_email
	const [before, after = ""] = t("codeBlocked.message", { email: EMAIL_SLOT }).split(EMAIL_SLOT)

	return (
		<div role="alert" className={cn(WARNING_BOX_CLASS, className)}>
			<p>
				{before}
				<a className="underline font-semibold" href={`mailto:${email}?subject=${encodeURIComponent(t("codeBlocked.mailSubject"))}`}>{email}</a>
				{after}
			</p>
			{children && <p className="mt-1">{children}</p>}
		</div>
	)
}
