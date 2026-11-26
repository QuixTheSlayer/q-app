import { RefObject, useEffect, useState } from "react"

// The page is "rendered" once its DOM stops changing for this long (text nodes fill in after mount).
const QUIET_MS = 400
const MAX_WAIT_MS = 4000

/**
 * While `enabled`, watches the rendered page under `ref` and returns a sandbox
 * document built from it once it settles (see buildSandboxDocument). `key`
 * changes (e.g. new page data) take a fresh snapshot.
 */
export function useSandboxSnapshot(
	ref: RefObject<HTMLElement>,
	enabled: boolean,
	build: (element: HTMLElement) => string,
	key: unknown,
): string | null {
	const [doc, setDoc] = useState<string | null>(null)

	useEffect(() => {
		setDoc(null)
		const element = ref.current
		if (!enabled || !element) return

		let done = false
		let quiet: ReturnType<typeof setTimeout>
		const finish = () => {
			if (done) return
			done = true
			observer.disconnect()
			setDoc(build(element))
		}
		const observer = new MutationObserver(() => {
			clearTimeout(quiet)
			quiet = setTimeout(finish, QUIET_MS)
		})
		observer.observe(element, { subtree: true, childList: true, characterData: true, attributes: true })
		quiet = setTimeout(finish, QUIET_MS)
		const maxWait = setTimeout(finish, MAX_WAIT_MS)

		return () => {
			done = true
			observer.disconnect()
			clearTimeout(quiet)
			clearTimeout(maxWait)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [enabled, key])

	return doc
}
