import { useEffect, useRef, useState } from "react"
import { SANDBOX_PERMISSIONS } from "@/utils/security/sandboxDocument"
import { SANDBOX_MESSAGE } from "@/utils/security/sandboxGuard"

// The page sends a beat every second; this long without one (while the tab is visible) counts as stuck.
const STALL_MS = 6000

/** Shows a sandbox document. No allow-same-origin: its scripts get an opaque origin. Stops the page if its script hangs or trips the guard. */
export function SandboxFrame({ doc, title, className, style }: {
	doc: string
	title: string
	className?: string
	style?: React.CSSProperties
}) {
	const frame = useRef<HTMLIFrameElement>(null)
	const [stopped, setStopped] = useState<'stalled' | 'tripped' | null>(null)

	useEffect(() => {
		setStopped(null)
		let lastBeat = Date.now()
		const onMessage = (e: MessageEvent) => {
			if (e.source !== frame.current?.contentWindow || e.data?.source !== SANDBOX_MESSAGE) return
			if (e.data.type === 'beat') lastBeat = Date.now()
			else if (e.data.type === 'tripped') setStopped('tripped')
		}
		const onVisible = () => { lastBeat = Date.now() }
		const watch = window.setInterval(() => {
			if (document.visibilityState === 'visible' && Date.now() - lastBeat > STALL_MS) setStopped('stalled')
		}, 1000)
		window.addEventListener('message', onMessage)
		document.addEventListener('visibilitychange', onVisible)
		return () => {
			window.clearInterval(watch)
			window.removeEventListener('message', onMessage)
			document.removeEventListener('visibilitychange', onVisible)
		}
	}, [doc])

	if (stopped) {
		return (
			<div role="alert" className={className} style={{ display: "grid", placeItems: "center", padding: 24, textAlign: "center", ...style }}>
				{stopped === 'stalled' ? "This page's script stopped responding, so it was stopped." : "This page's script was stopped because it ran too many timers or built too much content."}
			</div>
		)
	}

	return (
		<iframe
			ref={frame}
			title={title}
			srcDoc={doc}
			sandbox={SANDBOX_PERMISSIONS}
			referrerPolicy="no-referrer"
			className={className}
			style={{ border: 0, display: "block", ...style }}
		/>
	)
}
