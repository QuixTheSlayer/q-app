// Reads an uploaded .html file for the Import HTML dialog.

// CodeMirror and the converter slow down a lot on very large pastes.
export const MAX_HTML_FILE_BYTES = 5 * 1024 * 1024

export type HtmlFileResult =
	| { ok: true; text: string }
	| { ok: false; reason: 'tooLarge' | 'empty' | 'unreadable' }

export async function readHtmlFile(file: File): Promise<HtmlFileResult> {
	if (file.size > MAX_HTML_FILE_BYTES) return { ok: false, reason: 'tooLarge' }
	try {
		const text = await file.text()
		return text.trim() ? { ok: true, text } : { ok: false, reason: 'empty' }
	} catch {
		return { ok: false, reason: 'unreadable' }
	}
}
