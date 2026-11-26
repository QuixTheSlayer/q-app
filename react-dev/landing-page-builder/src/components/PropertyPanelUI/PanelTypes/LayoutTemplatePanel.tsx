import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { CanvasNode, LayoutTemplateNode, LayoutColumn, LayoutUiType } from '@/types/node.type'
import { buildLayoutColumnBlock, restyleLayoutChildren, setLayoutSlotText } from '@/utils/layoutSlots'
import { TextInput } from '@/components/ui/primitives/text-input'
import { CirclePlusIcon } from 'lucide-react'
import { FiTrash } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { UiTypeSelector, UiTypeOption } from '@/components/PropertyPanelUI/UiTypeSelector'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { PaddingController } from '../Sections/relatedComponents/PaddingController'
import { BorderRadiusController } from '../Sections/relatedComponents/BorderRadiusController'
import { BoxShadowController } from '../Sections/relatedComponents/Controllers'
import ColorPicker from '@/components/ui/ColorPicker'
import TemplateImageField from '../Sections/relatedComponents/TemplateImageField'
import { LineClampControl } from '../Sections/relatedComponents/LineClampControl'
import { TypographyMapControl } from '../Sections/relatedComponents/TypographyControl'
import FoldList from '@/components/ui/FoldList'

import withTemplateTabs from './withTemplateTabs'

// Each variant hardcodes its own heading/title/description color and size
// (white text on the fullWidthBanner's dark gradient surface, a small
// uppercase gray eyebrow label for sidebarContent's heading, dark text
// elsewhere) — a single static fallback would show the wrong
// color/size for those variants. Keep these in sync with the
// textStylesFor(node, ...) call sites in LayoutTemplateVisual.tsx.
const LAYOUT_TYPOGRAPHY_DEFAULTS: Record<LayoutUiType, {
	heading: React.CSSProperties
	title: React.CSSProperties
	description: React.CSSProperties
}> = {
	twoColumnTextImage: {
		heading: { fontSize: '24px', fontWeight: '600', color: '#1a1a1a' },
		title: { fontSize: '18px', fontWeight: '600', color: '#1a1a1a' },
		description: { fontSize: '14px', fontWeight: '400', color: '#5a5a5a' },
	},
	threeColumnEven: {
		heading: { fontSize: '24px', fontWeight: '600', color: '#1a1a1a' },
		title: { fontSize: '16px', fontWeight: '600', color: '#1a1a1a' },
		description: { fontSize: '13px', fontWeight: '400', color: '#5a5a5a' },
	},
	imageLeftText: {
		heading: { fontSize: '24px', fontWeight: '600', color: '#1a1a1a' },
		title: { fontSize: '16px', fontWeight: '600', color: '#1a1a1a' },
		description: { fontSize: '13px', fontWeight: '400', color: '#5a5a5a' },
	},
	stackedCentered: {
		heading: { fontSize: '24px', fontWeight: '600', color: '#1a1a1a' },
		title: { fontSize: '16px', fontWeight: '600', color: '#1a1a1a' },
		description: { fontSize: '13px', fontWeight: '400', color: '#5a5a5a' },
	},
	sidebarContent: {
		heading: { fontSize: '13px', fontWeight: '600', color: '#8a8a8a' },
		title: { fontSize: '18px', fontWeight: '600', color: '#1a1a1a' },
		description: { fontSize: '14px', fontWeight: '400', color: '#5a5a5a' },
	},
	gridFour: {
		heading: { fontSize: '24px', fontWeight: '600', color: '#1a1a1a' },
		title: { fontSize: '14px', fontWeight: '600', color: '#1a1a1a' },
		description: { fontSize: '12px', fontWeight: '400', color: '#5a5a5a' },
	},
	alternatingRows: {
		heading: { fontSize: '24px', fontWeight: '600', color: '#1a1a1a' },
		title: { fontSize: '17px', fontWeight: '600', color: '#1a1a1a' },
		description: { fontSize: '14px', fontWeight: '400', color: '#5a5a5a' },
	},
	fullWidthBanner: {
		heading: { fontSize: '24px', fontWeight: '600', color: '#ffffff' },
		title: { fontSize: '15px', fontWeight: '600', color: '#ffffff' },
		description: { fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.8)' },
	},
}

// ---- Tiny static previews (~150x100), one per uiType, mirroring the real
// LayoutTemplateVisual composition at a glance. Hardcoded sample content —
// these never touch live node data. ----

const previewAccent = '#2f6fed'

function TwoColumnTextImagePreview() {
	return (
		<div className="flex gap-2 w-[150px] h-[100px] p-2 items-center bg-white">
			<div className="flex flex-col gap-1 flex-1">
				<div className="w-14 h-1.5 bg-neutral-500 rounded" />
				<div className="w-16 h-1 bg-neutral-300 rounded" />
				<div className="w-12 h-1 bg-neutral-300 rounded" />
			</div>
			<div className="flex-1 h-14 rounded-md" style={{ background: `linear-gradient(135deg, ${previewAccent}, #1a2b52)` }} />
		</div>
	)
}

function ThreeColumnEvenPreview() {
	return (
		<div className="flex gap-2 w-[150px] h-[100px] p-2 items-center justify-center bg-white">
			{[0, 1, 2].map((i) => (
				<div key={i} className="flex-1 flex flex-col items-center gap-1">
					<div style={{ width: 10, height: 2, backgroundColor: previewAccent }} />
					<div className="w-8 h-1.5 bg-neutral-400 rounded" />
					<div className="w-10 h-1 bg-neutral-300 rounded" />
				</div>
			))}
		</div>
	)
}

function ImageLeftTextPreview() {
	return (
		<div className="flex flex-col gap-1.5 w-[150px] h-[100px] p-2 justify-center bg-white">
			{[0, 1].map((i) => (
				<div key={i} className="flex items-center gap-1.5">
					<div className="w-6 h-6 rounded bg-blue-100 flex-shrink-0" />
					<div className="flex flex-col gap-0.5 flex-1">
						<div className="w-16 h-1.5 bg-neutral-400 rounded" />
						<div className="w-20 h-1 bg-neutral-300 rounded" />
					</div>
				</div>
			))}
		</div>
	)
}

function StackedCenteredPreview() {
	return (
		<div className="flex flex-col items-center gap-1.5 w-[150px] h-[100px] p-2 justify-center bg-white">
			<div className="w-6 h-6 rounded-full bg-blue-100" />
			<div className="w-16 h-1.5 bg-neutral-400 rounded" />
			<div className="w-20 h-1 bg-neutral-300 rounded" />
			<div className="w-6 h-6 rounded-full bg-blue-100 mt-1" />
			<div className="w-14 h-1.5 bg-neutral-400 rounded" />
		</div>
	)
}

function SidebarContentPreview() {
	return (
		<div className="flex w-[150px] h-[100px] p-2 gap-2 bg-white">
			<div className="flex flex-col gap-1 pr-1.5" style={{ borderRight: '1px solid #e5e5e5' }}>
				<div className="w-8 h-1 rounded" style={{ backgroundColor: previewAccent }} />
				<div className="w-8 h-1 bg-neutral-300 rounded" />
				<div className="w-8 h-1 bg-neutral-300 rounded" />
			</div>
			<div className="flex flex-col gap-1 flex-1 justify-center">
				<div className="w-full h-8 rounded" style={{ backgroundColor: `${previewAccent}22` }} />
				<div className="w-16 h-1.5 bg-neutral-400 rounded" />
			</div>
		</div>
	)
}

function GridFourPreview() {
	return (
		<div className="grid grid-cols-2 gap-1.5 w-[150px] h-[100px] p-2 bg-white">
			{[0, 1, 2, 3].map((i) => (
				<div key={i} className="rounded border p-1 flex flex-col gap-0.5" style={{ borderColor: '#e5e5e5' }}>
					<div className="w-full h-4 rounded-sm" style={{ backgroundColor: `hsl(${i * 70} 55% 55%)` }} />
					<div className="w-6 h-1 bg-neutral-400 rounded" />
				</div>
			))}
		</div>
	)
}

function AlternatingRowsPreview() {
	return (
		<div className="flex flex-col gap-2 w-[150px] h-[100px] p-2 justify-center bg-white">
			<div className="flex items-center gap-1.5">
				<div className="w-8 h-6 rounded" style={{ backgroundColor: previewAccent }} />
				<div className="w-14 h-1.5 bg-neutral-400 rounded" />
			</div>
			<div className="flex items-center gap-1.5 flex-row-reverse">
				<div className="w-8 h-6 rounded" style={{ backgroundColor: previewAccent }} />
				<div className="w-14 h-1.5 bg-neutral-400 rounded" />
			</div>
		</div>
	)
}

function FullWidthBannerPreview() {
	return (
		<div className="w-[150px] h-[100px] p-2 flex flex-col gap-1.5 justify-center rounded" style={{ background: `linear-gradient(135deg, #16213e, ${previewAccent})` }}>
			<div className="w-16 h-1.5 bg-white rounded" />
			<div className="flex gap-1.5">
				<div className="flex-1 h-6 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
				<div className="flex-1 h-6 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
			</div>
		</div>
	)
}

function LayoutTemplatePanel() {
	const canvas = useEditor()
	const node = canvas?.focusedNode as LayoutTemplateNode
	const { t } = useTranslation('propertyPanel')

	const uiTypeOptions: UiTypeOption[] = [
		{ value: 'twoColumnTextImage', label: t('layoutTemplatePanel.uiType.twoColumnTextImage'), Preview: TwoColumnTextImagePreview },
		{ value: 'threeColumnEven', label: t('layoutTemplatePanel.uiType.threeColumnEven'), Preview: ThreeColumnEvenPreview },
		{ value: 'imageLeftText', label: t('layoutTemplatePanel.uiType.imageLeftText'), Preview: ImageLeftTextPreview },
		{ value: 'stackedCentered', label: t('layoutTemplatePanel.uiType.stackedCentered'), Preview: StackedCenteredPreview },
		{ value: 'sidebarContent', label: t('layoutTemplatePanel.uiType.sidebarContent'), Preview: SidebarContentPreview },
		{ value: 'gridFour', label: t('layoutTemplatePanel.uiType.gridFour'), Preview: GridFourPreview },
		{ value: 'alternatingRows', label: t('layoutTemplatePanel.uiType.alternatingRows'), Preview: AlternatingRowsPreview },
		{ value: 'fullWidthBanner', label: t('layoutTemplatePanel.uiType.fullWidthBanner'), Preview: FullWidthBannerPreview },
	]

	/** `columns` stays the seed and the legacy fallback; `childrenUpdater` keeps
	 * the real child tree (if any) in step with it. */
	function updateColumns(
		updater: (columns: LayoutColumn[]) => LayoutColumn[],
		childrenUpdater?: (children: CanvasNode[], node: LayoutTemplateNode) => CanvasNode[],
	) {
		canvas.updateNode((prevNode) => {
			const layoutNode = prevNode as LayoutTemplateNode
			return {
				...layoutNode,
				columns: updater(layoutNode.columns),
				...(layoutNode.children && childrenUpdater
					? { children: childrenUpdater(layoutNode.children, layoutNode) }
					: {}),
			}
		})
	}

	function addColumn() {
		const column = {
			title: t('layoutTemplatePanel.newColumnTitle', { number: node.columns.length + 1 }),
			description: t('layoutTemplatePanel.defaultDescription'),
		}
		updateColumns(
			(columns) => [...columns, column],
			// One block node per column, appended after the heading.
			(children, layoutNode) => [...children, buildLayoutColumnBlock(column, layoutNode.uiType)],
		)
	}

	function removeColumn(index: number) {
		updateColumns(
			(columns) => columns.filter((_, i) => i !== index),
			(children) => children.filter((_, i) => i !== index + 1),
		)
	}

	if (node)
		return (
			<div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

				<SectionContainer label={t('layoutTemplatePanel.uiType.label')}>
					<UiTypeSelector
						options={uiTypeOptions}
						value={node.uiType}
						onChange={(v) => canvas.updateNode((prevNode) => {
							const prev = prevNode as LayoutTemplateNode
							const uiType = v as LayoutUiType
							// Variants paint their text differently (light on the banner's
							// dark gradient, etc.), so re-skin the child tree to match.
							return {
								...prev,
								uiType,
								...(prev.children ? { children: restyleLayoutChildren(prev.children, uiType) } : {}),
							}
						})}
					/>
				</SectionContainer>

				<FoldList label={t('layoutTemplatePanel.content')}>
					<PanelRowContainer className=' px-0 ' layoutType='col' label={t('layoutTemplatePanel.heading')}>
						<TextInput
							size='sm'
							value={node.heading}
							onChange={(e) => canvas.updateNode((prevNode) => {
								const prev = prevNode as LayoutTemplateNode
								// The heading is a real text node now, so write through to it.
								return {
									...prev,
									heading: e.target.value,
									...(prev.children ? { children: setLayoutSlotText(prev.children, 'heading', e.target.value) } : {}),
								}
							})}
						/>
					</PanelRowContainer>

					<PanelRowContainer className=' px-0 gap-2.5 ' layoutType='col' label={t('layoutTemplatePanel.columnsLabel')}>
						{node.columns.map((column, index) => (
							<div key={index} className='rounded-xl border border-border/60 overflow-hidden bg-card transition-shadow hover:shadow-sm'>
								<div className='h-9 px-3 flex justify-between items-center bg-muted/50 border-b border-border/60'>
									<span className='text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>{t('layoutTemplatePanel.columnNumber', { number: index + 1 })}</span>
									{node.columns.length > 1 && (
										<button
											type='button'
											onClick={() => removeColumn(index)}
											className='rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
										>
											<FiTrash size={13} />
										</button>
									)}
								</div>
								<div className='flex flex-col gap-2.5 p-3'>
									<PanelRowContainer className=' px-0 ' layoutType='col' label={t('layoutTemplatePanel.title')}>
										<TextInput
											size='sm'
											value={column.title}
											onChange={(e) => updateColumns(
												(columns) => {
													const next = [...columns]
													next[index] = { ...next[index], title: e.target.value }
													return next
												},
												// The slot is a real text node now, so write through to it.
												(children) => setLayoutSlotText(children, { column: index, field: 'title' }, e.target.value),
											)}
										/>
									</PanelRowContainer>
									<PanelRowContainer className=' px-0 ' layoutType='col' label={t('layoutTemplatePanel.description')}>
										<TextInput
											size='sm'
											value={column.description}
											onChange={(e) => updateColumns(
												(columns) => {
													const next = [...columns]
													next[index] = { ...next[index], description: e.target.value }
													return next
												},
												// The slot is a real text node now, so write through to it.
												(children) => setLayoutSlotText(children, { column: index, field: 'description' }, e.target.value),
											)}
										/>
									</PanelRowContainer>
									<PanelRowContainer className=' px-0 ' layoutType='col' label={t('layoutTemplatePanel.imageUrl')}>
										<TemplateImageField
											value={column.imageUrl}
											onChange={(url) => updateColumns((columns) => {
												const next = [...columns]
												next[index] = { ...next[index], imageUrl: url }
												return next
											})}
										/>
										<TextInput
											className=' mt-2 '
											size='sm'
											value={column.imageUrl ?? ''}
											placeholder={t('layoutTemplatePanel.imageUrlPlaceholder')}
											onChange={(e) => updateColumns((columns) => {
												const next = [...columns]
												next[index] = { ...next[index], imageUrl: e.target.value }
												return next
											})}
										/>
									</PanelRowContainer>
								</div>
							</div>
						))}
						<button
							type='button'
							onClick={addColumn}
							className='gap-1.5 flex w-full h-9 justify-center items-center cursor-pointer rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary'
						>
							<CirclePlusIcon size={16} />
							<span className='text-sm font-medium'>{t('layoutTemplatePanel.addColumn')}</span>
						</button>
					</PanelRowContainer>
				</FoldList>

				<FoldList label={t('layoutTemplatePanel.typography')}>
					<TypographyMapControl
						field="heading"
						label={t('layoutTemplatePanel.heading')}
						defaultValue={(LAYOUT_TYPOGRAPHY_DEFAULTS[node.uiType] ?? LAYOUT_TYPOGRAPHY_DEFAULTS.twoColumnTextImage).heading}
					/>
					<TypographyMapControl
						field="title"
						label={t('layoutTemplatePanel.title')}
						defaultValue={(LAYOUT_TYPOGRAPHY_DEFAULTS[node.uiType] ?? LAYOUT_TYPOGRAPHY_DEFAULTS.twoColumnTextImage).title}
					/>
					<TypographyMapControl
						field="description"
						label={t('layoutTemplatePanel.description')}
						defaultValue={(LAYOUT_TYPOGRAPHY_DEFAULTS[node.uiType] ?? LAYOUT_TYPOGRAPHY_DEFAULTS.twoColumnTextImage).description}
					/>
					<LineClampControl field="heading" label={t('layoutTemplatePanel.heading')} />
					<LineClampControl field="title" label={t('layoutTemplatePanel.title')} />
					<LineClampControl field="description" label={t('layoutTemplatePanel.description')} />
				</FoldList>

				<FoldList label={t('layoutTemplatePanel.colors')}>
					<SectionContainer hintKey="colorPair">
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('layoutTemplatePanel.accentColor')}>
							<ColorPicker
								value={node.accentColor || '#2f6fed'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as LayoutTemplateNode,
									accentColor: v,
								}))}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('layoutTemplatePanel.accentColorSecondary')}>
							<ColorPicker
								value={node.accentColorSecondary || '#7c3aed'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as LayoutTemplateNode,
									accentColorSecondary: v,
								}))}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('layoutTemplatePanel.backgroundColor')}>
							<ColorPicker
								value={(node.style?.backgroundColor as string) || '#ffffff'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as LayoutTemplateNode,
									style: { ...(prevNode as LayoutTemplateNode).style, backgroundColor: v },
								}))}
							/>
						</PanelRowContainer>
					</SectionContainer>
				</FoldList>

				<SectionContainer hintKey="styleGroup" label={t('layoutTemplatePanel.style')}>
					<BorderController />
				</SectionContainer>

				<PaddingController />

				<BorderRadiusController />

				<BoxShadowController />

				<Attributes />
			</div>
		)
}

export default withTemplateTabs(LayoutTemplatePanel)
