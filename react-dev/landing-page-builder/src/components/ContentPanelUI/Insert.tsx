import { useEditor } from "@/context/EditorContext";
import { CanvasNode, ContentType, LayoutNode, TableNode } from "@/types/node.type";
import {

	ReactNode,
	useEffect,

	useState,
} from "react";
import {
	RxImage,
	RxSquare,
	RxText,
	RxButton,
	RxSection,
	RxCountdownTimer,
} from "react-icons/rx";
import { GoNumber, GoTable } from "react-icons/go";
import { Button } from "@/components/ui/primitives/button";
import { Checkbox } from "@/components/ui/primitives/checkbox";
import { Dialog, DialogFooter, DialogTitle } from "@/components/ui/primitives/dialog-content";
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
// import ColorPicker from '@/components/ui/ColorPicker';
import { Select, SelectOption } from "@/components/ui/Select";
import { useEditor as useTiptapEditor } from "@tiptap/react";
import { DialogClose } from "@/components/ui/primitives/dialog";
import { Controller, useForm } from "react-hook-form";
import { extensions } from "@/libs/tiptap/config";
import {
	ContentAttributes,
	generateNewNode,
	generateNewWidgetNode,
} from "@/utils/canvas.utils";
import { generateAccordionNode, generateTabNode, generateIconBlockNode, generateSeparatorsNode } from '@/utils/nodeBuilders';
import { toast } from "sonner";
import { DragOverlay, useDraggable } from "@dnd-kit/core";
import { cn } from "@/libs/cn";
import { DraggedElementType, DndNewElementData } from "@/hooks/useCanvasDnd";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { WidgetType } from "@/types/widget.type";
import { LuListCollapse, LuFlipHorizontal } from "react-icons/lu";
import { PiTabs, PiYoutubeLogo } from "react-icons/pi";
import { TbCarouselHorizontal, TbSocial } from "react-icons/tb";
import { TfiLayoutSliderAlt } from "react-icons/tfi";
import { useGetPageDataQuery, editorQuery } from "@/store/query";
import { useAppDispatch } from "@/store";
import { ScrollToTopConfig } from "@/types/contentFile.type";
import { Calendar1, Clock, MapIcon, MessageSquareQuote, PieChart, SeparatorHorizontal, Text, Gauge, GitCommitVertical, CircleHelp, ToggleLeft, Grid2x2, PanelTop, PartyPopper, Sparkles, PanelBottom, UserRound, LayoutPanelTop } from "lucide-react";
import { Star } from "lucide-react";
import { GrVimeo } from "react-icons/gr";
import { IoBrowsers } from "react-icons/io5";
import FoldList from "../ui/FoldList";
import { icons } from "../ui/icons/Icons";
import { RiTimeZoneLine } from "react-icons/ri";
import { getShortcutForContentType, getShortcutForWidgetType, getShortcutForTableDialog } from "./insertShortcuts";
import { INSERT_SHORTCUT_ARMED_EVENT } from "@/hooks/useGlobalInsertShortcuts";
import { InsertShortcutBadge } from "./InsertShortcutBadge";
import { PlanTierBadge } from "./PlanTierBadge";
import editorConfig from "@/configs/editor.config";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import {
	generateFaqTemplate,
	generateTimelineTemplate,
	generatePricingToggleTemplate,
	generateCardsTemplate,
	generateNavBarTemplate,
	generateEventWidgetsGroupTemplate,
	generateHeroTemplate,
	generateFooterTemplate,
	generatePersonalCardTemplate,
	generateLayoutTemplate,
	generateTableEnterpriseTemplate,
	generateProgressBarTemplate,
	generateButtonEnterpriseTemplate,
} from "@/utils/readyMadeTemplates";
import RandomLayoutDialog from "./RandomLayoutDialog";
import ColorPicker from "../ui/ColorPicker";

type TableFormValues = {
	col: number;
	row: number;
	insertIndex: number;
	includeHeader: boolean;
};

function Insert() {
	const canvas = useEditor();
	const { t } = useTranslation("insert");

	const handleAddNode = (
		contentType: ContentType,
		attributes?: ContentAttributes,
	) => {
		if (!canvas.focusedNode) {
			toast.warning(t('toast.noFocusedContainer', { contentType }))
			return;
		}
		const newNode = generateNewNode(contentType, attributes)
		canvas?.insertNode(newNode);


	};

	/** Same as handleAddNode but for nodes built by a generator. */
	const handleAddPreparedNode = (newNode: CanvasNode) => {
		if (!canvas.focusedNode) {
			toast.warning(t('toast.noFocusedContainer', { contentType: newNode.contentType }))
			return;
		}
		canvas?.insertNode(newNode);
	};

	/**
	 * Handling Table Insertion
	 */
	const [tableCreateDialogIsOpen, setTableCreateDialogIsOpen] = useState(false);

	const {
		control,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm<TableFormValues>({
		defaultValues: {
			col: NaN,
			row: NaN,
			insertIndex: undefined,
			includeHeader: true,
		},
	});

	const tipTap = useTiptapEditor(
		{
			extensions: [...extensions],
			onCreate: ({ editor }) => { },
		},
		[],
	);

	const handleCreateTable = (data: TableFormValues) => {
		if (!(data.row > 0 && data.col > 0)) {
			toast.warning(t('toast.tableMinRowsColumns'));
			return;
		}

		/**
		 * Generate table data with tipTap
		 */
		tipTap
			?.chain()
			.focus()
			.insertTable({
				rows: data.row,
				cols: data.col,
				withHeaderRow: data.includeHeader,
			})
			.run();

		const newTableNode = generateNewNode("table") as TableNode;
		// console.log("New Table Node", newTableNode)
		newTableNode.children = tipTap?.getJSON()


		console.log("New Table Node W Child", newTableNode)

		canvas?.insertNode(newTableNode, data.insertIndex);

		tipTap?.commands.clearContent();

		setTableCreateDialogIsOpen(false);
		reset();
	};

	/**
	 * Handle table dialog open event triggered from other component
	 */
	useEffect(() => {
		const handleTableDialogEvent = (e: CustomEvent) => {
			const { insertIndex } = e.detail;
			setValue("insertIndex", insertIndex);
			setTableCreateDialogIsOpen(true);
		};
		window.addEventListener("open-table-dialog", handleTableDialogEvent);

		return () => {
			window.removeEventListener("open-table-dialog", handleTableDialogEvent);
		};
	}, [setTableCreateDialogIsOpen]);




	const handleAddSection = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e?.stopPropagation();

		const focusedNode = canvas.focusedNode as LayoutNode

		if (!focusedNode) {
			console.log("Not Focused")

			canvas?.insertSection(generateNewNode("section",{
				style:{
					height:"fit-content",
					minHeight:"18em",
					width:'100%'
				}
			}))
		}
		else {
			// console.log("Has Focused", focusedNode)
			const focusedElement = document.querySelector(`[data-id="${(focusedNode?.id)}"]`)
			const targetPath = focusedElement?.getAttribute("data-node-path")

			// console.log("Has focusedElement", focusedElement)

			if (!targetPath) return;

			const lastIdx = parseInt(targetPath.split('.')[1]);

			// console.log("Has Focused Path",targetPath,lastIdx)

			const newSectionNode = generateNewNode("section");
			canvas?.insertSection(newSectionNode, lastIdx + 1);
			// canvas?.focusNode({ id: focusedNode.id, path: `${targetPath}}` });
		}



	};

	/**
	 * Ready Make Templates insert as a new top-level section, same placement
	 * rule as the plain "Section" button in Containers: right after the
	 * section containing the focused node, or appended at root if nothing
	 * is focused.
	 */
	const READY_MADE_TEMPLATE_SECTION_STYLE: React.CSSProperties = {
		display: "flex",
		flexDirection: "column",
		gap: "1em",
		width: "100%",
		height: "fit-content",
		minHeight: "8em",
		padding: "2em 1.5em",
		backgroundColor: "#ffffff",
		justifyContent: "center",
		alignItems: "center"
	}

	const handleAddReadyMadeTemplate = (generateTemplate: () => CanvasNode[]) => {
		const focusedNode = canvas.focusedNode as LayoutNode
		const section = generateNewNode("section", { children: generateTemplate(), style: READY_MADE_TEMPLATE_SECTION_STYLE })

		if (!focusedNode) {
			canvas?.insertSection(section)
			return
		}

		const focusedElement = document.querySelector(`[data-id="${focusedNode?.id}"]`)
		const targetPath = focusedElement?.getAttribute("data-node-path")
		if (!targetPath) return;

		const lastIdx = parseInt(targetPath.split('.')[1]);
		canvas?.insertSection(section, lastIdx + 1);
	};

	const iconSize = 28

	/**
	 * The actual "/" + letter keydown listener lives in useGlobalInsertShortcuts
	 * (wired up from Canvas.tsx) so the shortcut works regardless of which side
	 * panel is open — this only mirrors its armed/disarmed state for the
	 * shortcut badges here, via a broadcast event. Do NOT also call
	 * useInsertShortcuts here: a second listener would double-fire every
	 * insert.
	 */
	const [insertArmed, setInsertArmed] = useState(false)
	useEffect(() => {
		const handleArmedEvent = (e: CustomEvent<boolean>) => setInsertArmed(e.detail)
		window.addEventListener(INSERT_SHORTCUT_ARMED_EVENT, handleArmedEvent as EventListener)
		return () => window.removeEventListener(INSERT_SHORTCUT_ARMED_EVENT, handleArmedEvent as EventListener)
	}, [])

	return (
		<div className="p-4 pt-2 max-h-[80vh] w-[100%] items-center overflow-x-hidden overflow-y-auto no-scrollbar">
			<div>
				<div className="py-2">
					<div className="font-medium text-[14px] text-foreground">{t('sections.containers')}</div>
					<div className="text-xs text-muted-foreground">{t('sections.containersDescription')}</div>
				</div>
				<div className="grid grid-cols-3 gap-3 ">
					<GridElementButton
						data-tour="insert-section-button"
						shortcutArmed={insertArmed}
						label={t('contentType.section')}
						contentType="section"
						icon={<RxSection size={30} />}
						onClick={handleAddSection}
					/>
					<GridElementButton
						data-tour="insert-block-button"
						shortcutArmed={insertArmed}
						label={t('contentType.block')}
						contentType="block"
						icon={<RxSquare size={30} />}
						onClick={() => handleAddNode("block")}
					// onClick={() => {
					// 	const focusedNode = canvas.focusedNode as LayoutNode

					// 	const focusedElement = document.getElementById(focusedNode?.id ?? "")
					// 	const insertIndex = focusedNode?.children.length
					// 	const targetPath = focusedElement?.getAttribute("data-node-path")

					// 	const newBlock = generateNewNode("block")
					// 	canvas.insertNode(newBlock, insertIndex, (targetPath || ''))

					// 	canvas.focusNode({ id: newBlock.id, path: targetPath + '.' + insertIndex })
					// }}
					/>
				</div>
			</div>
			<div className="mt-3" data-tour="insert-contents-group">
				<div className="py-2">
					<div className="font-medium text-[14px] text-foreground">{t('sections.contents')}</div>
					<div className="text-xs text-muted-foreground">{t('sections.contentsDescription')}</div>
				</div>
				<div className="grid grid-cols-3 gap-3 ">
					<GridElementButton
						shortcutArmed={insertArmed}
						label={t('contentType.text')}
						contentType="text"
						icon={<RxText size={30} />}
						onClick={() => handleAddNode("text")}
					/>
					<GridElementButton
						shortcutArmed={insertArmed}
						label={t('contentType.image')}
						contentType="image"
						icon={<RxImage size={30} />}
						onClick={() => handleAddNode("image")}
					/>
					<GridElementButton
						shortcutArmed={insertArmed}
						label={t('contentType.button')}
						contentType="button"
						icon={<RxButton size={30} />}
						onClick={() => handleAddNode("button")}
					/>
					<Dialog className="  p-3 rounded-md z-[99999999] "
						isOpen={tableCreateDialogIsOpen}
						onOpenChange={(v) => {
							if (canvas.focusedNode?.contentType === 'section') {
								toast.warning(t('toast.cannotInsertTableInto', { contentType: canvas.focusedNode.contentType }))
								return;
							}
							if (!canvas.focusedNode) {
								toast.warning(t('toast.focusBlockToInsertTable'))
								return;

							}

							setTableCreateDialogIsOpen(v)
						}}
						renderTrigger={
							<GridElementButton
								shortcutArmed={insertArmed}
								label={t('contentType.table')}
								contentType="table"
								icon={<GoTable size={30} />}
							/>
						}
					>
						<form className=" " onSubmit={handleSubmit(handleCreateTable)}>
							<DialogTitle>{t('dialog.insertTableTitle')}</DialogTitle>
							<div className="mt-4 mb-5 flex flex-col gap-4">
								<div className="flex gap-4">
									<div className="!min-w-0 w-full">
										<label
											htmlFor="insert-table-col"
											className="text-sm font-medium text-foreground"
										>
											{t('dialog.columns')}
										</label>
										<Controller
											name="col"
											control={control}
											rules={{ required: true, min: 1 }}
											render={({ field }) => (
												<NumberField
													minValue={1}
													isInvalid={!!errors.col}
													id="insert-table-col"
													className="mt-1 text-foreground  !min-w-0 w-full"
													{...field}
												>
													<NumberFieldInput className={'text-foreground'} />
												</NumberField>
											)}
										/>
									</div>
									<div className="!min-w-0 w-full">
										<label
											htmlFor="insert-table-row"
											className="text-sm font-medium text-foreground"
										>
											{t('dialog.rows')}
										</label>
										<Controller
											name="row"
											control={control}
											rules={{ required: true, min: 1 }}
											render={({ field }) => (
												<NumberField
													minValue={1}
													isInvalid={!!errors.row}
													id="insert-table-row"
													className="mt-1 text-foreground !min-w-0 w-full"
													{...field}
												>
													<NumberFieldInput className={'text-foreground'} />
												</NumberField>
											)}
										/>
									</div>
								</div>
								<Controller
									name="includeHeader"
									control={control}
									render={({ field }) => (
										<div className="flex items-center cursor-pointer">
											<Checkbox
												id="insert-table-header-checkbox"
												checked={field.value}
												onCheckedChange={(e) => field.onChange(e)}
											/>
											<label
												htmlFor="insert-table-header-checkbox"
												className="text-sm font-medium text-muted-foreground cursor-pointer"
											>
												{t('dialog.includeHeaderRow')}
											</label>
										</div>
									)}
								/>
							</div>

							<DialogFooter>
								<DialogClose asChild>
									<Button type="button" variant="secondary">
										{t('dialog.cancel')}
									</Button>
								</DialogClose>
								<Button type="submit">{t('dialog.create')}</Button>
							</DialogFooter>
						</form>
					</Dialog>
				</div>
			</div>
			<div className="mt-5">
				<div className="py-2">
					<div className="font-medium text-[14px] text-foreground">{t('sections.eventWidgets')}</div>
					<div className="text-xs text-muted-foreground">{t('sections.eventWidgetsDescription')}</div>
				</div>
				<div className="grid grid-cols-3 gap-2.5">



					<WidgetElementButton
						shortcutArmed={insertArmed}
						label={t('widget.submitEntryButton')}
						icon={<RxButton size={iconSize} />}
						widgetType="submitEntryButton"
					/>
					<WidgetElementButton
						shortcutArmed={insertArmed}
						label={t('widget.registerButton')}
						icon={<RxButton size={iconSize} />}
						widgetType="registerButton"
					/>
					<WidgetElementButton
						shortcutArmed={insertArmed}
						label={t('widget.endDate')}
						icon={<Calendar1 size={iconSize} />}
						widgetType="endDate"
					/>
					<WidgetElementButton
						shortcutArmed={insertArmed}
						label={t('widget.endHour')}
						icon={<Clock size={iconSize} />}
						widgetType="endHour"
					/>
					<WidgetElementButton
						shortcutArmed={insertArmed}
						label={t('widget.timeZone')}
						icon={<RiTimeZoneLine size={iconSize} />}
						widgetType="timeZone"
					/>
				</div>
			</div>


			<div className="mt-5">
				<div className="py-2">
					<div className="font-medium text-[14px] text-foreground">{t('sections.readyMadeTemplates')}</div>
					<div className="text-xs text-muted-foreground">{t('sections.readyMadeTemplatesDescription')}</div>
				</div>

				{editorConfig.enable_random_layout_generator && <RandomLayoutDialog />}

				<FoldList defaultFold={false} label={t('groups.readyMadeTemplates')}>
					<ReadyMadeTemplateButton
						label={t('readyMadeTemplate.faq')}
						icon={<CircleHelp size={iconSize} />}
						onClick={() => handleAddReadyMadeTemplate(generateFaqTemplate)}
						planTier={editorConfig.content_type_plan_tier.faq}
					/>
					<ReadyMadeTemplateButton
						label={t('readyMadeTemplate.timeline')}
						icon={<GitCommitVertical size={iconSize} />}
						onClick={() => handleAddReadyMadeTemplate(generateTimelineTemplate)}
						planTier={editorConfig.content_type_plan_tier.timeline}
					/>
					<ReadyMadeTemplateButton
						label={t('readyMadeTemplate.pricingToggle')}
						icon={<ToggleLeft size={iconSize} />}
						onClick={() => handleAddReadyMadeTemplate(generatePricingToggleTemplate)}
						planTier={editorConfig.content_type_plan_tier.pricingToggle}
					/>
					<ReadyMadeTemplateButton
						label={t('readyMadeTemplate.cards')}
						icon={<Grid2x2 size={iconSize} />}
						onClick={() => handleAddReadyMadeTemplate(generateCardsTemplate)}
						planTier={editorConfig.content_type_plan_tier.cardsTemplate}
					/>
					<ReadyMadeTemplateButton
						label={t('readyMadeTemplate.eventWidgetsGroup')}
						icon={<PartyPopper size={iconSize} />}
						onClick={() => handleAddReadyMadeTemplate(generateEventWidgetsGroupTemplate)}
						planTier={editorConfig.content_type_plan_tier.eventWidgetsGroupTemplate}
					/>
					<ReadyMadeTemplateButton
						label={t('readyMadeTemplate.navBar')}
						icon={<PanelTop size={iconSize} />}
						onClick={() => handleAddReadyMadeTemplate(generateNavBarTemplate)}
						planTier={editorConfig.content_type_plan_tier.navBarTemplate}
					/>
					<ReadyMadeTemplateButton
						label={t('readyMadeTemplate.hero')}
						icon={<Sparkles size={iconSize} />}
						onClick={() => handleAddReadyMadeTemplate(generateHeroTemplate)}
						planTier={editorConfig.content_type_plan_tier.heroTemplate}
					/>
					<ReadyMadeTemplateButton
						label={t('readyMadeTemplate.footer')}
						icon={<PanelBottom size={iconSize} />}
						onClick={() => handleAddReadyMadeTemplate(generateFooterTemplate)}
						planTier={editorConfig.content_type_plan_tier.footerTemplate}
					/>
					<ReadyMadeTemplateButton
						label={t('readyMadeTemplate.personalCard')}
						icon={<UserRound size={iconSize} />}
						onClick={() => handleAddReadyMadeTemplate(generatePersonalCardTemplate)}
						planTier={editorConfig.content_type_plan_tier.personalCardTemplate}
					/>
					{/* <ReadyMadeTemplateButton
						label={t('readyMadeTemplate.table')}
						icon={<GoTable size={iconSize} />}
						onClick={() => handleAddReadyMadeTemplate(generateTableEnterpriseTemplate)}
						planTier={editorConfig.content_type_plan_tier.tableEnterprise}
					/> */}
					<ReadyMadeTemplateButton
						label={t('readyMadeTemplate.progressBar')}
						icon={<Gauge size={iconSize} />}
						onClick={() => handleAddReadyMadeTemplate(generateProgressBarTemplate)}
						planTier={editorConfig.content_type_plan_tier.progressBar}
					/>
					<ReadyMadeTemplateButton
						label={t('readyMadeTemplate.layout')}
						icon={<LayoutPanelTop size={iconSize} />}
						onClick={() => handleAddReadyMadeTemplate(generateLayoutTemplate)}
						planTier={editorConfig.content_type_plan_tier.layoutTemplate}
					/>
					<ReadyMadeTemplateButton
						label={t('readyMadeTemplate.button')}
						icon={<RxButton size={iconSize} />}
						onClick={() => handleAddReadyMadeTemplate(generateButtonEnterpriseTemplate)}
						planTier={editorConfig.content_type_plan_tier.buttonEnterprise}
					/>
				</FoldList>
			</div>

			<div className="mt-5">
				<div className="py-2">
					<div className="font-medium text-[14px] text-foreground">{t('sections.advancedWidgets')}</div>
					<div className="text-xs text-muted-foreground">{t('sections.advancedWidgetsDescription')}</div>
				</div>
				<div className="grid grid-cols-1 ">
					{/* AdvanceNode */}

					{/* <AdvancedContentButton
						shortcutArmed={insertArmed}
    label="NewNode"
    contentType="newNode"
    icon={<TbSocial size={16} />}
    onClick={() => handleAddNode("newNode")}
/> */}

					<FoldList label={t('groups.layout')} >
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.iconBlock')}
							contentType="iconBlock"
							icon={icons.iconBlock()}
							onClick={() => handleAddPreparedNode(generateIconBlockNode())}
						/>
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.separators')}
							contentType="separators"
							icon={<SeparatorHorizontal size={iconSize} />}
							onClick={() => handleAddPreparedNode(generateSeparatorsNode())}
						/>
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.tabs')}
							icon={<PiTabs size={iconSize} />}
							contentType="tab"
							onClick={() => handleAddPreparedNode(generateTabNode())}
						/>
						{/* <AdvancedContentButton
						shortcutArmed={insertArmed}
							label="VerticalTab"
							contentType="verticalTab"
							icon={<PanelLeft size={16} />}
							onClick={() => handleAddNode("verticalTab")}
						/> */}
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.accordion')}
							icon={<LuListCollapse size={iconSize} />}
							contentType="accordion"
							onClick={() => handleAddPreparedNode(generateAccordionNode())}
						/>
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.testimonialSlider')}
							icon={<MessageSquareQuote size={iconSize} />}
							contentType="testimonialSlider"
							onClick={() => handleAddNode("testimonialSlider")}
						/>

					</FoldList>

					<FoldList label={t('groups.countdown')} >
						{/* <AdvancedContentButton
						shortcutArmed={insertArmed}
							label="Countdown text"
							contentType="countDownText"
							icon={<GoNumber size={iconSize} />}
							onClick={() => handleAddNode("countDownText")}
						/>
						<AdvancedContentButton
						shortcutArmed={insertArmed}
							label="Custom Countdown"
							contentType="customCountDownWrapper"
							icon={<RxCountdownTimer size={iconSize} />}
							onClick={() => handleAddNode("customCountDownWrapper")}
						/> */}
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.countdown')}
							icon={<RxCountdownTimer size={iconSize} />}
							contentType="countDown"
							onClick={() => handleAddNode("countDown")}
						/>
					</FoldList>

					<FoldList label={t('groups.counter')} >
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.counter')}
							icon={<GoNumber size={iconSize} />}
							contentType="counter"
							onClick={() => handleAddNode("counter")}
						/>
					</FoldList>

					<FoldList label={t('groups.rating')} >
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.rating')}
							icon={<Star size={iconSize} />}
							contentType="rating"
							onClick={() => handleAddNode("rating")}
						/>
					</FoldList>

					<FoldList label={t('groups.embeds')} >
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.social')}
							contentType="social"
							icon={<TbSocial size={iconSize} />}
							onClick={() => handleAddNode("social")}
						/>

						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.googleMap')}
							icon={<MapIcon size={iconSize} />}
							contentType="googleMap"
							onClick={() => handleAddNode("googleMap")}
						/>
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.youtube')}
							icon={<PiYoutubeLogo size={iconSize} />}
							contentType="youtube"
							onClick={() => handleAddNode("youtube")}
						/>
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.vimeo')}
							icon={<GrVimeo size={iconSize} />}
							contentType="vimeo"
							onClick={() => handleAddNode("vimeo")}
						/>
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.webView')}
							icon={<IoBrowsers size={iconSize} />}
							contentType="html"
							onClick={() => handleAddNode("html")}
						/>
					</FoldList>

					<FoldList label={t('groups.chart')} >
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.chart')}
							icon={<PieChart size={iconSize} />}
							contentType="chart"
							onClick={() => handleAddNode("chart")}
						/>
					</FoldList>

					<FoldList label={t('groups.progressBar')} >
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.progressBar')}
							icon={<Gauge size={iconSize} />}
							contentType="progressBar"
							onClick={() => handleAddNode("progressBar")}
						/>
					</FoldList>

					<FoldList label={t('groups.timeline')} >
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.timeline')}
							icon={<GitCommitVertical size={iconSize} />}
							contentType="timeline"
							onClick={() => handleAddNode("timeline")}
						/>
					</FoldList>

					<FoldList label={t('groups.faq')} >
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.faq')}
							icon={<CircleHelp size={iconSize} />}
							contentType="faq"
							onClick={() => handleAddNode("faq")}
						/>
					</FoldList>

					<FoldList label={t('groups.pricingToggle')} >
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.pricingToggle')}
							icon={<ToggleLeft size={iconSize} />}
							contentType="pricingToggle"
							onClick={() => handleAddNode("pricingToggle")}
						/>
					</FoldList>


					<FoldList label={t('groups.imageWidgets')} >
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.imageSlider')}
							icon={<TfiLayoutSliderAlt size={iconSize} />}
							contentType="imageSlider"
							onClick={() => handleAddNode("imageSlider")}
						/>
						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.imageCarousel')}
							icon={<TbCarouselHorizontal size={iconSize} />}
							contentType="imageCarousel"
							onClick={() => handleAddNode("imageCarousel")}
						/>

						<AdvancedContentButton
							shortcutArmed={insertArmed}
							label={t('contentType.imageFlipFlop')}
							icon={<LuFlipHorizontal size={iconSize} />}
							contentType="imageFlipFlop"
							onClick={() => handleAddNode("imageFlipFlop")}
						/>
					</FoldList>

				</div>
			</div>
			{/* <PageSettingsSection /> */}

		</div>
	);
}

export default Insert;

function GridElementButton({
	label,
	icon,
	contentType,
	onClick,
	shortcutArmed,
	'data-tour': dataTour,
}: {
	label: string;
	icon: ReactNode;
	contentType: ContentType;
	onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	shortcutArmed?: boolean;
	'data-tour'?: string;
}) {
	const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
		id: label,
		data: {
			type: DraggedElementType.New,
			contentType: contentType,
		} satisfies DndNewElementData,
	});

	const shortcutKey = getShortcutForContentType(contentType) ?? (contentType === 'table' ? getShortcutForTableDialog() : undefined)
	const planTier = editorConfig.content_type_plan_tier[contentType]

	return (
		<>
			<button
				ref={setNodeRef}
				{...listeners}
				{...attributes}
				data-tour={dataTour}
				className="relative rounded-lg group bg-primary/15 flex flex-col items-center justify-center px-2 py-2 w-[110px] h-[120px] gap-2  border-[1px] border-primary/50  text-foreground hover:border-primary/80 hover:bg-primary/20  active:bg-primary/10 hover:text-primary/90"
				onClick={onClick}
			>
				<PlanTierBadge tier={planTier} />
				<InsertShortcutBadge shortcutKey={shortcutKey} armed={shortcutArmed} />
				<div className=" group-hover:bg-primary/20 text-foreground group-hover:text-primary p-2 rounded-lg " >
					{icon && icon}
				</div>

				<div className="text-[12px] font-medium text-foreground group-hover:text-primary ">{label}</div>
			</button>
			{isDragging && (
				<DragOverlay modifiers={[snapCenterToCursor]}>
					<button
						className={cn(
							"rounded-lg flex flex-col items-center justify-center gap-2 pt-1 w-[50px] aspect-square text-slate-500 hover:text-primary/90 bg-neutral-200/50 shadow-md",
						)}
						onClick={onClick}
					>
						{icon}
					</button>
				</DragOverlay>
			)}
		</>
	);
}

function WidgetElementButton({
	label,
	icon,
	widgetType,
	shortcutArmed,
}: {
	label: string;
	icon?: ReactNode;
	widgetType: WidgetType;
	shortcutArmed?: boolean;
}) {
	const canvas = useEditor();

	const dragProps = useDraggable({
		id: label,
		data: {
			type: DraggedElementType.New,
			widgetType: widgetType,
		} satisfies DndNewElementData,
	});

	if (editorConfig.enabled_widget_types[widgetType] === false) return null;

	return (
		<ListButton
			label={label}
			icon={icon}
			dragProps={dragProps}
			shortcutKey={getShortcutForWidgetType(widgetType)}
			shortcutArmed={shortcutArmed}
			planTier={editorConfig.widget_type_plan_tier[widgetType]}
			onClick={() => {
				canvas?.insertNode(generateNewWidgetNode(widgetType));
			}}
		/>
	);
}

function AdvancedContentButton({
	label,
	icon,
	contentType,
	onClick,
	shortcutArmed,
}: {
	label: string;
	icon?: ReactNode;
	contentType: ContentType;
	shortcutArmed?: boolean;
	onClick?: () => void;
}) {
	const canvas = useEditor();

	const dragProps = useDraggable({
		id: label,
		data: {
			type: DraggedElementType.New,
			contentType: contentType,
		} satisfies DndNewElementData,
	});

	if (editorConfig.enabled_content_types[contentType] === false) return null;

	return (
		<ListButton
			label={label}
			icon={icon}
			dragProps={dragProps}
			shortcutKey={getShortcutForContentType(contentType)}
			shortcutArmed={shortcutArmed}
			planTier={editorConfig.content_type_plan_tier[contentType]}
			onClick={onClick}
		/>
	);
}

/**
 * Ready Make Templates insert a pre-built multi-node section tree (see
 * readyMadeTemplates.ts), not a single ContentType — so unlike
 * AdvancedContentButton/WidgetElementButton this is click-only. It
 * deliberately doesn't support drag-to-canvas or the "/" shortcut system,
 * since both of those insert by contentType alone (generateNewNode(contentType)),
 * which would drop a blank node instead of running the template generator.
 */
function ReadyMadeTemplateButton({
	label,
	icon,
	onClick,
	planTier,
}: {
	label: string;
	icon?: ReactNode;
	onClick: () => void;
	planTier?: 'Pro' | 'Ent';
}) {
	return (
		<button
			className="relative rounded-lg group bg-primary/15 flex flex-col items-center justify-center px-2 py-2 w-[110px] h-[120px] gap-2  border-[1px] border-primary/50  text-foreground hover:border-primary/80 hover:bg-primary/20  active:bg-primary/10 hover:text-primary/90"
			onClick={onClick}
		>
			<PlanTierBadge tier={planTier} />
			<div className=" group-hover:bg-primary/20 text-foreground group-hover:text-primary p-2 rounded-lg " >
				{icon && icon}
			</div>
			<div className="text-[12px] font-medium text-foreground group-hover:text-primary ">{label}</div>
		</button>
	);
}

function ListButton({
	label,
	icon,
	onClick,
	dragProps,
	shortcutKey,
	shortcutArmed,
	planTier,
}: {
	label: string;
	icon?: ReactNode;
	dragProps: ReturnType<typeof useDraggable>;
	onClick?: () => void;
	shortcutKey?: string;
	shortcutArmed?: boolean;
	planTier?: 'Pro' | 'Ent';
}) {
	const { setNodeRef, listeners, attributes, isDragging } = dragProps;

	return (
		<>
			<button
				ref={setNodeRef}
				{...listeners}
				{...attributes}
				className="relative rounded-lg group bg-primary/15 flex flex-col items-center justify-center px-2 py-2 w-[110px] h-[120px] gap-2  border-[1px] border-primary/50  text-foreground hover:border-primary/80 hover:bg-primary/20  active:bg-primary/10 hover:text-primary/90"
				onClick={onClick}
			>
				<PlanTierBadge tier={planTier} />
				<InsertShortcutBadge shortcutKey={shortcutKey} armed={shortcutArmed} />
				<div className=" group-hover:bg-primary/20 text-foreground group-hover:text-primary p-2 rounded-lg " >
					{icon && icon}
				</div>

				<div className="text-[12px] font-medium text-foreground group-hover:text-primary ">{label}</div>
			</button>
			{isDragging && (
				<DragOverlay modifiers={[snapCenterToCursor]}>
					<button className="rounded-lg flex items-center px-2 w-full gap-2 h-10 border-[1px]   bg-primary/20 border-primary/60 ">
						{icon && icon}
						<div className="text-[12px] font-medium text-slate-800">
							{label}
						</div>
					</button>
				</DragOverlay>
			)}
		</>
	);
}

// function WidgetElementButton ({label, icon, widgetType}: {
//   label: string,
//   icon?: ReactNode
//   widgetType: WidgetType,
// }) {

//   const canvas = useEditor()

//   const {setNodeRef, listeners, attributes, isDragging} = useDraggable({
//     id: label,
//     data: {
//       type: DraggedElementType.New,
//       widgetType: widgetType,
//     } satisfies DndNewElementData
//   })

//   return (
//     <>
//       <button
//         ref={setNodeRef}
//         {...listeners}
//         {...attributes}
//         className='rounded-lg flex items-center px-2 w-full gap-2 h-10 border-[1px] border-slate-200 bg-card text-slate-500 hover:border-primary/60 hover:bg-primary/5  active:bg-primary/10 hover:text-primary/90'
//         onClick={() => {
//           canvas?.insertNode(generateNewWidgetNode(widgetType));
//         }}
//       >
//         {icon && icon}
//         <div className='text-[12px] font-medium text-slate-600'>
//           {label}
//         </div>
//       </button>
//       {isDragging &&
//         <DragOverlay modifiers={[snapCenterToCursor]}>
//           <button
//             className='rounded-lg flex items-center px-2 w-full gap-2 h-10 border-[1px]   bg-primary/20 border-primary/60 '
//           >
//             {icon && icon}
//             <div className='text-[12px] font-medium text-slate-800'>
//               {label}
//             </div>
//           </button>
//         </DragOverlay>
//       }
//     </>
//   )
// }

const scrollToTopSizeOptions = [
	{ value: "sm", label: "Small" },
	{ value: "md", label: "Medium" },
	{ value: "lg", label: "Large" },
];

const scrollToTopPositionOptions = [
	{ value: "bottom-right", label: "Bottom Right" },
	{ value: "bottom-left", label: "Bottom Left" },
];

function PageLanguageSettingSection() {
	const { t } = useTranslation("insert");

	return (
		<div className="mt-5">
			<div className="py-2 font-medium text-[11px]">{t('sections.pageSettings')}</div>
			<div className="border rounded-lg p-3 flex items-center gap-2">
				<span className="text-[12px] text-muted-foreground min-w-[80px]">
					{t('sections.language')}
				</span>
				<div className="flex-1">
					<LanguageSwitcher />
				</div>
			</div>
		</div>
	);
}

function PageSettingsSection() {
	const { data } = useGetPageDataQuery("");
	const dispatch = useAppDispatch();

	const config = data?.scrollToTop;

	const update = (partial: Partial<ScrollToTopConfig>) => {
		dispatch(
			editorQuery.util.updateQueryData("getPageData", "", (draft) => {
				draft.scrollToTop = {
					enabled: false,
					...draft.scrollToTop,
					...partial,
				};
			}),
		);
	};

	if (!data) return null;

	return (
		<div className="mt-5">
			<div className="py-2 font-medium text-[11px]">Additional Settings</div>
			<div className="border rounded-lg p-3 flex flex-col gap-3">
				<Checkbox
					className="!size-4 !rounded-[0.25rem]"
					checked={!!config?.enabled}
					onCheckedChange={(checked) => update({ enabled: checked === true })}
				>
					Scroll to Top Button
				</Checkbox>

				{config?.enabled && (
					<div className="flex flex-col gap-2.5 pl-1 pt-1 border-t">
						<div className="flex items-center gap-2">
							<span className="text-[12px] text-muted-foreground min-w-[80px]">
								Background
							</span>
							<ColorPicker
								value={config.backgroundColor ?? "#1e293b"}
								// size="sm"
								onChange={(v) => update({ backgroundColor: v })}
							/>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-[12px] text-muted-foreground min-w-[80px]">
								Icon Color
							</span>
							<ColorPicker
								value={config.iconColor ?? "#ffffff"}
								// size="sm"
								onChange={(v) => update({ iconColor: v })}
							/>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-[12px] text-muted-foreground min-w-[80px]">
								Size
							</span>
							<Select
								items={scrollToTopSizeOptions}
								selectedKey={config.size ?? "md"}
								onSelectionChange={(v) =>
									update({ size: v as ScrollToTopConfig["size"] })
								}
								size="sm"
								aria-label="Button size"
								className="flex-1"
								placement="bottom start"
								placeholder=""
							>
								{(item) => (
									<SelectOption id={item.value}>{item.label}</SelectOption>
								)}
							</Select>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-[12px] text-muted-foreground min-w-[80px]">
								Position
							</span>
							<Select
								items={scrollToTopPositionOptions}
								selectedKey={config.position ?? "bottom-right"}
								onSelectionChange={(v) =>
									update({ position: v as ScrollToTopConfig["position"] })
								}
								size="sm"
								aria-label="Button position"
								className="flex-1"
								placement="bottom start"
								placeholder=""
							>
								{(item) => (
									<SelectOption id={item.value}>{item.label}</SelectOption>
								)}
							</Select>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
