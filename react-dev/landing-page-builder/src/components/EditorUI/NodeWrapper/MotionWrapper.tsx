import { HTMLAttributes, ReactNode, forwardRef } from "react"
import { motion, HTMLMotionProps } from "motion/react"
import { DraggableAttributes } from "@dnd-kit/core"
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities"
import { VOID_TAGS, type ContainerTag } from "@/utils/nodeAttributes"

// Framer Motion's HTMLMotionProps<'div'> redefines these drag/animation
// event handlers with its own (event, info) signature, which collides with
// the native React.HTMLAttributes<HTMLDivElement> signature for the same
// prop names. Every call site here spreads leftover props straight off a
// `React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<T>`
// destructure (native-typed), not off Framer's own prop type, so this
// wrapper accepts either signature for the colliding names instead of
// forcing every one of the ~20 call sites to re-type their own rest-spread.
type DragEventCollisionKeys = 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onAnimationStart' | 'onAnimationEnd'

/**
 * Shared layout-animation wrapper — every draggable/droppable node renders a
 * `motion.div` with the same `layout="position"` transition so canvas
 * reflows (insert/remove/reorder siblings) animate instead of snapping.
 * `isRoot` disables layout animation on the root node (matches Container's
 * original `layout={isRoot ? false : "position"}"` behavior — animating the
 * root's own layout looks like the whole page jumping).
 *
 * Drag attributes/listeners are spread here (not by the caller) since they
 * must land on the same element that carries the motion layout id for
 * dnd-kit's drag transform and Framer's layout animation to compose
 * correctly instead of fighting over the same DOM node's transform.
 *
 * Extends HTMLMotionProps<'div'> (not the bare MotionProps) so standard
 * HTML div attributes (id, aria-*, data-*, tabIndex, onClick, ...) that
 * every call site spreads onto this component type-check correctly — the
 * bare MotionProps type only covers Framer's own animation props. The
 * onDrag-family props are widened to accept native OR Framer signatures
 * (see DragEventCollisionKeys above) since call sites pass the native one.
 */
export interface MotionWrapperProps extends Omit<HTMLMotionProps<'div'>, 'ref' | 'layout' | 'transition' | DragEventCollisionKeys>, Pick<Partial<HTMLAttributes<HTMLDivElement>>, DragEventCollisionKeys> {
	isRoot?: boolean
	/** Element to render - an imported node's source tag (nav, ul, li, span, a, button...). Defaults to div. */
	as?: ContainerTag | 'a' | 'button' | 'input' | 'select' | 'textarea'
	attributes?: DraggableAttributes
	listeners?: SyntheticListenerMap
	setNodeRef: (el: HTMLElement) => void
	children: ReactNode
}

/**
 * `forwardRef` here is required, not cosmetic: PopoverWrapper renders this
 * component as `<PopoverTrigger asChild>{children}</PopoverTrigger>` (Radix
 * Slot), which clones its child and attaches its own ref to measure the
 * trigger's real DOM position for the ActionMenu popover. A plain function
 * component silently drops that ref, so Radix's Popper had nothing to
 * anchor to and rendered the popover at (0, -76) — off in the corner —
 * instead of beside the focused node. The forwarded ref is merged with
 * dnd-kit's own `setNodeRef` callback so both still receive the element.
 */
const MotionWrapper = forwardRef<HTMLDivElement, MotionWrapperProps>(function MotionWrapper({
	isRoot,
	as,
	attributes,
	listeners,
	setNodeRef,
	children,
	...props
}, forwardedRef) {
	const MotionElement = (as ? motion[as] : motion.div) as typeof motion.div
	// PopoverTrigger (asChild) adds type="button" to every node. Only a real <button> (or an <input>'s own type) keeps it: site CSS
	// such as Bootstrap's `[type=button] { appearance: button }` would draw any other node as a button.
	const { type, ...motionProps } = props as typeof props & { type?: string }
	return (
		<MotionElement
			layout={isRoot ? false : "position"}
			transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
			{...attributes}
			{...listeners}
			ref={(el) => {
				setNodeRef(el as HTMLDivElement)
				if (typeof forwardedRef === 'function') forwardedRef(el as HTMLDivElement)
				else if (forwardedRef) forwardedRef.current = el as HTMLDivElement
			}}
			{...(motionProps as HTMLMotionProps<'div'>)}
			{...(as === 'button' ? { type: (type as 'button') ?? 'button' } : {})}
			// An input's own type (text, email, checkbox...) - never Radix's "button".
			{...(as === 'input' && type && type !== 'button' ? { type } : {})}
		>
			{/* A void tag (br, hr, img...) can't hold anything - not even the editor's own controls. */}
			{as && VOID_TAGS.has(as) ? null : children}
		</MotionElement>
	)
})

export default MotionWrapper
