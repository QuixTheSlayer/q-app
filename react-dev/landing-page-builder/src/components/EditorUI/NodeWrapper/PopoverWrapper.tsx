import { ReactNode } from "react"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/primitives/popover"
import { ActionMenu } from "@/components/EditorUI/ActionMenu"
import { EditorContextType } from "@/context/EditorContext"

export interface PopoverWrapperProps {
	node: { id: string }
	canvas?: EditorContextType
	/** Hides the ActionMenu popover while the node is mid-drag (matches every original call site's `{!isDragging && <PopoverContent>...}` guard). */
	isDragging?: boolean
	/**
	 * `z-[9999]` (Container's original value) vs `z-[999999]` (every content
	 * node's original value) — the only real variance across call sites.
	 * Defaults to the content-node value since it's used far more often.
	 */
	zIndexClassName?: string
	children: ReactNode
}

/**
 * Shared ActionMenu popover — every node type opens the same
 * Popover/PopoverTrigger/PopoverContent/ActionMenu combo when focused,
 * differing only in trigger content (passed as `children`) and, in one case
 * (Container), the z-index class. Mirrors every original call site's props
 * 1:1: `side="top" align="center" sideOffset={10} alignOffset={2}`, the
 * `!bg-transparent` shadow-none content, and the stopPropagation/
 * preventDefault handlers guarding against the click/focus escaping the
 * popover into the canvas underneath it.
 */
export default function PopoverWrapper({
	node,
	canvas,
	isDragging,
	zIndexClassName = "z-[999999]",
	children,
}: PopoverWrapperProps) {
	return (
		<Popover open={canvas?.focused?.id === node.id}>
			<PopoverTrigger asChild>
				{children}
			</PopoverTrigger>
			{!isDragging && (
				<PopoverContent
					side="top"
					align="center"
					sideOffset={10}
					alignOffset={2}
					className={`shadow-none ${zIndexClassName} !bg-transparent `}
					onClick={(e) => e.stopPropagation()}
					onCloseAutoFocus={(e) => e.preventDefault()}
					onOpenAutoFocus={(e) => e.preventDefault()}
				>
					{ <ActionMenu canvas={canvas} />}
				</PopoverContent>
			)}
		</Popover>
	)
}
