import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { CirclePlusIcon } from "lucide-react"
import { CiTrash } from "react-icons/ci"
import { PanelRowContainer, SectionContainer } from "@/components/PropertyPanelUI/ui"
import { Select, SelectOption } from "@/components/ui/Select"
import { Checkbox } from "@/components/ui/primitives/checkbox"
import { NumberField, NumberFieldInput } from "@/components/ui/primitives/number-field"
import { useEditor } from "@/context/EditorContext"
import { trigger_mode } from "@/consts/propertyField.consts"
import { TriggerModeType } from "@/types/otherTypes"
import { flattenNodeTree } from "@/utils/editor.utils"
import { LayoutNode, JsClassRule } from "@/types/node.type"

const PROTOTYPE_ACTIONS = [
	{ value: "scrollTo", label: "Scroll To" },
	{ value: "show", label: "Show" },
	{ value: "hide", label: "Hide" },
	{ value: "toggle", label: "Toggle" },
	{ value: "slideIn", label: "Slide In" },
	{ value: "fadeIn", label: "Fade In" },
]
const SLIDE_FROM_OPTIONS = [
	{ value: "bottom", label: "Bottom" },
	{ value: "top", label: "Top" },
	{ value: "left", label: "Left" },
	{ value: "right", label: "Right" },
]

/**
 * The class-based counterpart to AnimationSection.tsx: when the focused
 * node has a class, this edits `content.js[className]` - the SAME
 * trigger/multi-effect visual builder shape, just shared across every node
 * with that class instead of one node's own `content.animation` entry, and
 * literally rendered into the page's `<script>` tag (see useClassJs.ts)
 * rather than only run through an internal event listener.
 *
 * Scoped to the six DOM-driven "prototype" actions (scrollTo/show/hide/
 * toggle/slideIn/fadeIn) - the ones useClassJs.ts's generated script
 * actually implements. Pure-CSS style effects (color/rotate/size/...) stay
 * a per-node-only concept (AnimationSection), since they're driven by real
 * CSS classes there, not by this class-selector-scoped script.
 */
export default function ClassJsSection({ className }: { className: string }) {
	const { t } = useTranslation("propertyPanel")
	const canvas = useEditor()

	const rule = (canvas.content as LayoutNode)?.js?.[className]

	const targets = useMemo(() => flattenNodeTree(canvas.content), [canvas.content])

	const updateRule = (updater: (current: JsClassRule) => JsClassRule) => {
		canvas.updateContent((current) => {
			const layout = current as LayoutNode
			const existing: JsClassRule = layout.js?.[className] ?? { trigger_effect: [] }
			return {
				...current,
				js: { ...layout.js, [className]: updater(existing) },
			} as typeof current
		})
	}

	const addTrigger = () => {
		updateRule((r) => ({ trigger_effect: [...r.trigger_effect, { trigger: "active", effects: [] }] }))
	}
	const removeTrigger = (triggerIndex: number) => {
		updateRule((r) => ({ trigger_effect: r.trigger_effect.filter((_, i) => i !== triggerIndex) }))
	}
	const updateTrigger = (triggerIndex: number, trigger: JsClassRule["trigger_effect"][number]["trigger"]) => {
		updateRule((r) => ({
			trigger_effect: r.trigger_effect.map((te, i) => (i === triggerIndex ? { ...te, trigger } : te)),
		}))
	}
	const addEffect = (triggerIndex: number) => {
		updateRule((r) => ({
			trigger_effect: r.trigger_effect.map((te, i) =>
				i === triggerIndex ? { ...te, effects: [...te.effects, { animation_type: "scrollTo" }] } : te
			),
		}))
	}
	const removeEffect = (triggerIndex: number, effectIndex: number) => {
		updateRule((r) => ({
			trigger_effect: r.trigger_effect.map((te, i) =>
				i === triggerIndex ? { ...te, effects: te.effects.filter((_, j) => j !== effectIndex) } : te
			),
		}))
	}
	const updateEffect = (triggerIndex: number, effectIndex: number, patch: Partial<JsClassRule["trigger_effect"][number]["effects"][number]>) => {
		updateRule((r) => ({
			trigger_effect: r.trigger_effect.map((te, i) =>
				i === triggerIndex
					? { ...te, effects: te.effects.map((eff, j) => (j === effectIndex ? { ...eff, ...patch } : eff)) }
					: te
			),
		}))
	}

	return (
		<SectionContainer label={t("classJsSection.title", { className })}>
			<div className="text-xs text-muted-foreground px-1 -mt-1 mb-1">{t("classJsSection.description")}</div>
			<div className="px-4">
				<div className="flex flex-col min-w-full w-auto gap-6">
					{(rule?.trigger_effect ?? []).map((triggerEffect, triggerIndex) => (
						<div key={triggerIndex} className="px-3 bg-primary/10 flex flex-col border-primary/50 border py-3 rounded w-[100%] gap-6 justify-end items-center">
							<div className="flex flex-col gap-2 w-full h-auto">
								<div className="flex gap-2 justify-between items-center">
									<p className="text-sm text-center text-muted-foreground">{t("animationSection.trigger")}</p>
									<div onClick={() => removeTrigger(triggerIndex)} className="cursor-pointer min-w-[22px] flex text-destructive-foreground bg-destructive justify-center place-items-center h-[22px] border border-destructive rounded">
										<CiTrash size={14} />
									</div>
								</div>
								<Select
									id="classJsTrigger"
									aria-label="classJsTrigger"
									size="sm"
									placeholder=""
									className="col-span-2"
									items={trigger_mode}
									selectedKey={triggerEffect.trigger || "active"}
									onSelectionChange={(v) => updateTrigger(triggerIndex, v as TriggerModeType as JsClassRule["trigger_effect"][number]["trigger"])}
								>
									{(item) => <SelectOption id={item.value}>{item.label}</SelectOption>}
								</Select>
							</div>

							{triggerEffect.effects.map((effect, effectIndex) => (
								<div key={effectIndex} className="pl-8 border-b border-b-primary/30 py-2 flex flex-col gap-2 w-full h-auto">
									<div className="flex gap-2 justify-between items-center">
										<p className="text-sm text-center text-muted-foreground">{t("animationSection.triggerEffect")}</p>
										<div onClick={() => removeEffect(triggerIndex, effectIndex)} className="cursor-pointer min-w-[22px] flex text-destructive-foreground bg-destructive justify-center place-items-center h-[22px] border border-destructive rounded">
											<CiTrash size={14} />
										</div>
									</div>

									<Select
										id="classJsAction"
										aria-label="classJsAction"
										size="sm"
										placement="bottom end"
										placeholder=""
										className="col-span-2"
										items={PROTOTYPE_ACTIONS}
										selectedKey={effect.animation_type || "scrollTo"}
										onSelectionChange={(v) => updateEffect(triggerIndex, effectIndex, { animation_type: v as string })}
									>
										{(item) => <SelectOption id={item.value}>{item.label}</SelectOption>}
									</Select>

									<PanelRowContainer layoutType="col" label={t("controllers.target")}>
										<Select
											id="classJsTarget"
											aria-label="classJsTarget"
											size="sm"
											placeholder={t("controllers.selectNode")}
											className="col-span-2"
											items={targets}
											selectedKey={effect.targetNodeId || null}
											onSelectionChange={(v) => updateEffect(triggerIndex, effectIndex, { targetNodeId: v as string })}
										>
											{(item) => <SelectOption id={item.id}>{item.label}</SelectOption>}
										</Select>
									</PanelRowContainer>

									{effect.animation_type === "scrollTo" && (
										<PanelRowContainer layoutType="row" label={t("controllers.highlightTarget")}>
											<Checkbox
												checked={effect.highlightTarget ?? false}
												onCheckedChange={(checked) => updateEffect(triggerIndex, effectIndex, { highlightTarget: checked === true })}
											/>
										</PanelRowContainer>
									)}

									{(effect.animation_type === "slideIn" || effect.animation_type === "fadeIn") && (
										<PanelRowContainer layoutType="row" label={t("controllers.durationMs")}>
											<NumberField
												id="classJsDuration"
												aria-label="classJsDuration"
												className="col-span-1"
												minValue={0}
												step={50}
												value={effect.transitionDurationMs ?? 400}
												onChange={(v) => updateEffect(triggerIndex, effectIndex, { transitionDurationMs: Number(v) })}
											>
												<NumberFieldInput size="sm" hideStepper />
											</NumberField>
										</PanelRowContainer>
									)}

									{effect.animation_type === "slideIn" && (
										<PanelRowContainer layoutType="col" label={t("controllers.slideFrom")}>
											<Select
												id="classJsSlideFrom"
												aria-label="classJsSlideFrom"
												size="sm"
												placeholder=""
												className="col-span-2"
												items={SLIDE_FROM_OPTIONS}
												selectedKey={effect.slideFrom || "bottom"}
												onSelectionChange={(v) => updateEffect(triggerIndex, effectIndex, { slideFrom: v as JsClassRule["trigger_effect"][number]["effects"][number]["slideFrom"] })}
											>
												{(item) => <SelectOption id={item.value}>{item.label}</SelectOption>}
											</Select>
										</PanelRowContainer>
									)}
								</div>
							))}

							<div onClick={() => addEffect(triggerIndex)} className="gap-2 text-base flex text-center w-[95%] border-[2px] border-primary text-primary rounded-md h-[38px] justify-center items-center cursor-pointer self-center">
								<CirclePlusIcon size={24} /> <p className="text-primary">{t("animationSection.newEffect")}</p>
							</div>
						</div>
					))}

					<div onClick={addTrigger} className="gap-2 text-base flex text-center w-[90%] border-[2px] border-primary text-primary rounded-md h-[38px] justify-center items-center cursor-pointer">
						<CirclePlusIcon size={24} /> <p className="text-primary">{t("animationSection.newTrigger")}</p>
					</div>
				</div>
			</div>
		</SectionContainer>
	)
}
