import { useEffect, useState, type CSSProperties } from 'react'
import { useEditor } from '@/context/EditorContext'
import editorConfig from '@/configs/editor.config'
import { lengthsToEm } from '@/utils/unitConversion'

type StyleKey = keyof CSSProperties & string
type Computed = Record<string, string>

const toKebab = (prop: string) => prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

/** The focused node's element on the canvas. */
export const nodeElement = (id?: string | null) =>
	id ? document.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`) : null

// Content objects get a number, so the shared lookup below can tell "same page state" cheaply.
const contentIds = new WeakMap<object, number>()
let nextContentId = 0
const contentKey = (content: object | null | undefined) => {
	if (!content) return 0
	if (!contentIds.has(content)) contentIds.set(content, ++nextContentId)
	return contentIds.get(content)
}

// Every field row calls this hook; they share one lookup per node and edit instead of one each.
let shared: { key: string; decl: CSSStyleDeclaration } | null = null

/**
 * What the focused node really looks like on the canvas (after all CSS, incl.
 * imported page CSS), refreshed after every edit, zoom and device change.
 * Values are read one property at a time when a field asks for them (copying all ~400
 * computed properties for every row made focus changes slow). Lengths come back as em at
 * 100% zoom - the unit the panel fields read - so a field can show a real number instead
 * of a blank. From frontend-editor's useComputedStyle.
 */
function useComputedNodeStyle(): Computed | null {
	const canvas = useEditor()
	const id = canvas?.focused?.id
	const zoom = canvas?.zoomLevel || 1
	const [decl, setDecl] = useState<{ id: string; decl: CSSStyleDeclaration } | null>(null)
	const key = `${id}|${zoom}|${canvas?.deviceScope}|${contentKey(canvas?.content)}`

	useEffect(() => {
		if (!id || !editorConfig.enable_panel_computed_values) return
		// One frame later, so the canvas has re-laid out after the change.
		const frame = requestAnimationFrame(() => {
			if (shared?.key !== key) {
				const element = nodeElement(id)
				if (!element) return
				shared = { key, decl: getComputedStyle(element) }
			}
			setDecl({ id, decl: shared.decl })
		})
		return () => cancelAnimationFrame(frame)
	}, [id, key])

	if (!decl || decl.id !== id) return null
	// Undo the canvas zoom: 16px of root font at 100% is 16 * zoom px on screen.
	const rootPx = editorConfig.root_font_size
	const cache: Computed = {}
	return new Proxy(cache, {
		get: (_, prop) => {
			if (typeof prop !== 'string') return undefined
			if (!(prop in cache)) cache[prop] = lengthsToEm(decl.decl.getPropertyValue(prop), rootPx * zoom, rootPx)
			return cache[prop]
		},
	})
}

/**
 * Shared read/reset for property-panel fields:
 * - `value(prop)`: the node's own value, or what the canvas really shows when it has none
 * - `isChanged(props)`: whether the node sets any of these for the device being edited
 * - `reset(props)`: removes them, so the element goes back to its original look
 */
export function usePanelStyle() {
	const canvas = useEditor()
	const computed = useComputedNodeStyle()
	const node = canvas?.focusedNode
	const raw = canvas?.focused?.path ? canvas.getNode(canvas.focused.path) : null
	const scope = canvas?.deviceScope ?? 'desktop'
	const own = (scope === 'desktop' ? raw?.style : raw?.responsiveStyle?.[scope]) ?? {}

	const value = (prop: StyleKey): string | undefined => {
		const stored = node?.style?.[prop] as string | undefined
		if (stored !== undefined && stored !== '') return stored
		const real = computed?.[toKebab(prop)]
		// "0px"-like computed values carry no information worth showing over a blank.
		return real && !/^0(em|px)?$/.test(real) ? real : undefined
	}

	const isChanged = (props: StyleKey[]) =>
		props.some((prop) => (own as Record<string, unknown>)[prop] !== undefined && (own as Record<string, unknown>)[prop] !== '')

	const reset = (props: StyleKey[]) =>
		canvas?.updateNodeStyle(Object.fromEntries(props.map((prop) => [prop, undefined])) as CSSProperties)

	return { value, isChanged, reset }
}
