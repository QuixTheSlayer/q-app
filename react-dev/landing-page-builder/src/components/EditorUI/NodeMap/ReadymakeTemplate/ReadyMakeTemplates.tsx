import React from "react"
import { cn } from "@/libs/cn"
import CSSUtils from "@/utils/CSS.utils"
import { useEditor } from "@/context/EditorContext"
import {
	CardsTemplateNode,
	ContentNode,
	NavBarTemplateNode,
	HeroTemplateNode,
	EventWidgetsGroupTemplateNode,
	PersonalCardTemplateNode,
	FooterTemplateNode,
	LayoutTemplateNode,
	ButtonEnterpriseNode,
} from "@/types/node.type"
import { CardsTemplateVisual } from "@/components/shared/readyMadeTemplates/CardsTemplateVisual"
import { NavBarTemplateVisual } from "@/components/shared/readyMadeTemplates/NavBarTemplateVisual"
import { HeroTemplateVisual } from "@/components/shared/readyMadeTemplates/HeroTemplateVisual"
import { EventWidgetsGroupTemplateVisual } from "@/components/shared/readyMadeTemplates/EventWidgetsGroupTemplateVisual"
import { PersonalCardTemplateVisual } from "@/components/shared/readyMadeTemplates/PersonalCardTemplateVisual"
import { FooterTemplateVisual } from "@/components/shared/readyMadeTemplates/FooterTemplateVisual"
import { LayoutTemplateVisual } from "@/components/shared/readyMadeTemplates/LayoutTemplateVisual"
import { ButtonEnterpriseVisual } from "@/components/shared/readyMadeTemplates/ButtonEnterpriseVisual"
import { ContentNodeRenderProps } from "../../Nodes"
import DragWrapper from "../../NodeWrapper/DragContainer"
import MotionWrapper from "../../NodeWrapper/MotionWrapper"
import PopoverWrapper from "../../NodeWrapper/PopoverWrapper"

function readyMadeTemplateShell<T extends { id: string; style?: React.CSSProperties; attributes?: { id?: string } }>(
	Visual: React.ComponentType<{ node: T; slots?: React.ReactNode }>,
) {
	return function ReadyMadeTemplateShell({
		node,
		path,
		parent,
		// `children` here is the already-rendered child tree RenderNode hands
		// down for templates that have one (heroTemplate, layoutTemplate — see
		// CHILD_TREE_TYPES). It's passed to the Visual as `slots`
		// rather than left in `...props`, which gets spread onto MotionWrapper
		// and would otherwise render the children twice, outside their slots.
		children,
		...props
	}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<T & ContentNode>) {
		const canvas = useEditor()

		const style = {
			...CSSUtils.stripNullStyleValues(node.style ?? {}),
		}

		// The cornerBadge button variant deliberately renders its badge poking
		// outside the button's own box (see ButtonEnterpriseVisual.tsx) — the
		// shell's overflow-hidden (added generically for the hover/focus outline
		// below) would otherwise silently clip it. Scoped to this one variant so
		// every other Ready Made Template keeps its existing clip behavior.
		const allowsOverflowingContent =
			(node as { contentType?: string }).contentType === "buttonEnterprise" &&
			(node as { uiType?: string }).uiType === "cornerBadge"

		const isSelected = canvas?.selectedNodes.some((n) => n.id === node.id)

		if (!canvas) return null

		return (
			<DragWrapper
				node={node}
				path={path}
				parent={parent}
				canvas={canvas}
				children={
					<div
						id="drag-overlay"
						data-id={node.id}
						style={node.style}
						className="outline outline-[2px] opacity-80"
						onClick={(e) => e.stopPropagation()}
					>
						<Visual node={node} slots={children} />
					</div>
				}
				DragChild={({ attributes, listeners, setNodeRef, isDragging }) => (
					<PopoverWrapper node={node} canvas={canvas} isDragging={isDragging} zIndexClassName="z-[9999]">
						<MotionWrapper
							attributes={attributes}
							listeners={listeners}
							setNodeRef={setNodeRef}
							data-name='node'
							{...props}
							id={node.attributes?.id ?? ''}
							data-id={node.id}
							style={{
								...style,
								...(isSelected && { outline: "2px solid #a855f7", outlineOffset: "2px" }),
							}}
							aria-label="Draggable"
							data-cypress="draggable-item"
							data-node-path={path}
							tabIndex={-1}
							className={cn(
								"relative [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] cursor-default",
								allowsOverflowingContent ? "overflow-visible" : "overflow-hidden",
								canvas?.focused?.id === node.id && "outline outline-[1.5px]",
								canvas?.isParentIsFocused(node.id) &&
								"outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
								canvas?.focusedParent?.id === node.id &&
								"outline-dashed outline-offset-0",
								isDragging && "invisible",
							)}
						>
							<Visual node={node} slots={children} />
						</MotionWrapper>
					</PopoverWrapper>
				)}
			/>
		)
	}
}

export const CardsTemplate = readyMadeTemplateShell<CardsTemplateNode>(CardsTemplateVisual)
export const NavBarTemplate = readyMadeTemplateShell<NavBarTemplateNode>(NavBarTemplateVisual)
export const HeroTemplate = readyMadeTemplateShell<HeroTemplateNode>(HeroTemplateVisual)
export const EventWidgetsGroupTemplate = readyMadeTemplateShell<EventWidgetsGroupTemplateNode>(EventWidgetsGroupTemplateVisual)
export const PersonalCardTemplate = readyMadeTemplateShell<PersonalCardTemplateNode>(PersonalCardTemplateVisual)
export const FooterTemplate = readyMadeTemplateShell<FooterTemplateNode>(FooterTemplateVisual)
export const LayoutTemplate = readyMadeTemplateShell<LayoutTemplateNode>(LayoutTemplateVisual)
export const ButtonEnterprise = readyMadeTemplateShell<ButtonEnterpriseNode>(ButtonEnterpriseVisual)
