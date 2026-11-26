import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { CanvasNode, FooterTemplateNode, FooterColumn, FooterLink, FooterUiType } from '@/types/node.type'
import { FOOTER_COLUMNS_OFFSET, buildFooterColumnBlock, buildFooterLinkButton, restyleFooterChildren, setFooterSlotText, updateFooterColumnLinks } from '@/utils/footerSlots'
import { TextInput } from '@/components/ui/primitives/text-input'
import { Switch } from '@/components/ui/primitives/switch'
import { CirclePlusIcon } from 'lucide-react'
import { FiTrash } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { UiTypeSelector, UiTypeOption } from '@/components/PropertyPanelUI/UiTypeSelector'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { PaddingController } from '../Sections/relatedComponents/PaddingController'
import { BorderRadiusController } from '../Sections/relatedComponents/BorderRadiusController'
import { BoxShadowController } from '../Sections/relatedComponents/Controllers'
import ColorPicker from '@/components/ui/ColorPicker'
import { LineClampControl } from '../Sections/relatedComponents/LineClampControl'
import { TypographyMapControl } from '../Sections/relatedComponents/TypographyControl'
import FoldList from '@/components/ui/FoldList'

import withTemplateTabs from './withTemplateTabs'

// Each variant hardcodes its own brand/tagline/column/copyright colors
// (light text on a dark footer vs dark text on a light one, etc.) — a
// single static fallback would be wrong for darkMega/ctaBanner. Keep in
// sync with FooterTemplateVisual.tsx.
const FOOTER_TYPOGRAPHY_DEFAULTS: Record<FooterUiType, {
	brand: React.CSSProperties
	tagline: React.CSSProperties
	columnTitle: React.CSSProperties
	linkLabel: React.CSSProperties
	copyrightText: React.CSSProperties
}> = {
	classicColumns: {
		brand: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a' },
		tagline: { fontSize: '13px', fontWeight: '400', color: '#6b6b6b' },
		columnTitle: { fontSize: '13px', fontWeight: '700', color: '#1a1a1a' },
		linkLabel: { fontSize: '13px', fontWeight: '400', color: '#6b6b6b' },
		copyrightText: { fontSize: '12px', fontWeight: '400', color: '#8a8a8a' },
	},
	centeredMinimal: {
		brand: { fontSize: '20px', fontWeight: '700', color: '#1a1a1a' },
		tagline: { fontSize: '13px', fontWeight: '400', color: '#6b6b6b' },
		columnTitle: { fontSize: '13px', fontWeight: '700', color: '#1a1a1a' },
		linkLabel: { fontSize: '13px', fontWeight: '400', color: '#4a4a4a' },
		copyrightText: { fontSize: '12px', fontWeight: '400', color: '#8a8a8a' },
	},
	darkMega: {
		brand: { fontSize: '20px', fontWeight: '800', color: '#ffffff' },
		tagline: { fontSize: '13px', fontWeight: '400', color: '#9aa3b5' },
		columnTitle: { fontSize: '12px', fontWeight: '700', color: '#ffffff' },
		linkLabel: { fontSize: '13px', fontWeight: '400', color: '#9aa3b5' },
		copyrightText: { fontSize: '12px', fontWeight: '400', color: '#6b7488' },
	},
	ctaBanner: {
		brand: { fontSize: '17px', fontWeight: '700', color: '#ffffff' },
		tagline: { fontSize: '13px', fontWeight: '400', color: '#e6ebff' },
		columnTitle: { fontSize: '13px', fontWeight: '700', color: '#1a1a1a' },
		linkLabel: { fontSize: '14px', fontWeight: '400', color: '#ffffff' },
		copyrightText: { fontSize: '12px', fontWeight: '400', color: '#8a8a8a' },
	},
	socialFocus: {
		brand: { fontSize: '19px', fontWeight: '700', color: '#1a1a1a' },
		tagline: { fontSize: '13px', fontWeight: '400', color: '#6b6b6b' },
		columnTitle: { fontSize: '13px', fontWeight: '700', color: '#1a1a1a' },
		linkLabel: { fontSize: '12px', fontWeight: '400', color: '#8a8a8a' },
		copyrightText: { fontSize: '12px', fontWeight: '400', color: '#8a8a8a' },
	},
	twoColumnSplit: {
		brand: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a' },
		tagline: { fontSize: '13px', fontWeight: '400', color: '#6b6b6b' },
		columnTitle: { fontSize: '12px', fontWeight: '700', color: '#1a1a1a' },
		linkLabel: { fontSize: '13px', fontWeight: '400', color: '#6b6b6b' },
		copyrightText: { fontSize: '12px', fontWeight: '400', color: '#8a8a8a' },
	},
	compactBar: {
		brand: { fontSize: '13px', fontWeight: '700', color: '#1a1a1a' },
		tagline: { fontSize: '13px', fontWeight: '400', color: '#6b6b6b' },
		columnTitle: { fontSize: '13px', fontWeight: '700', color: '#1a1a1a' },
		linkLabel: { fontSize: '12px', fontWeight: '400', color: '#6b6b6b' },
		copyrightText: { fontSize: '12px', fontWeight: '400', color: '#8a8a8a' },
	},
	brandSidebar: {
		brand: { fontSize: '17px', fontWeight: '700', color: '#1a1a1a' },
		tagline: { fontSize: '13px', fontWeight: '400', color: '#6b6b6b' },
		columnTitle: { fontSize: '12px', fontWeight: '700', color: '#1a1a1a' },
		linkLabel: { fontSize: '13px', fontWeight: '400', color: '#6b6b6b' },
		copyrightText: { fontSize: '12px', fontWeight: '400', color: '#8a8a8a' },
	},
}

/* ---------------------------------------------------------------------- *
 * Tiny static previews for each uiType option, shown in the UiTypeSelector
 * grid. Hardcoded sample content only — no live node data — scaled to fit
 * the selector's ~150x100 preview box, matching FooterTemplateVisual's real
 * composition for each variant as closely as possible.
 * ---------------------------------------------------------------------- */

function ClassicColumnsPreview() {
	return (
		<div className="flex gap-2 w-[150px] h-[100px] p-2 bg-white">
			<div className="flex flex-col gap-1 flex-1">
				<div className="w-10 h-1.5 bg-neutral-700 rounded" />
				<div className="w-14 h-1 bg-neutral-300 rounded" />
			</div>
			{[0, 1].map((i) => (
				<div key={i} className="flex flex-col gap-1 flex-1">
					<div className="w-8 h-1 bg-neutral-500 rounded" />
					<div className="w-10 h-1 bg-neutral-300 rounded" />
					<div className="w-9 h-1 bg-neutral-300 rounded" />
				</div>
			))}
		</div>
	)
}

function CenteredMinimalPreview() {
	return (
		<div className="flex flex-col items-center gap-1.5 w-[150px] h-[100px] p-2 bg-white justify-center">
			<div className="w-10 h-1.5 bg-neutral-700 rounded" />
			<div className="w-24 h-1 bg-neutral-300 rounded" />
			<div className="flex gap-2 mt-1">
				<div className="w-6 h-1 bg-neutral-400 rounded" />
				<div className="w-6 h-1 bg-neutral-400 rounded" />
				<div className="w-6 h-1 bg-neutral-400 rounded" />
			</div>
		</div>
	)
}

function DarkMegaPreview() {
	return (
		<div className="flex gap-2 w-[150px] h-[100px] p-2 bg-slate-900 rounded-sm">
			<div className="flex flex-col gap-1 flex-1">
				<div className="w-10 h-1.5 bg-white rounded" />
				<div className="w-12 h-1 bg-slate-400 rounded" />
			</div>
			{[0, 1].map((i) => (
				<div key={i} className="flex flex-col gap-1 flex-1">
					<div className="w-8 h-1 bg-slate-200 rounded" />
					<div className="w-9 h-1 bg-slate-500 rounded" />
					<div className="w-8 h-1 bg-slate-500 rounded" />
				</div>
			))}
		</div>
	)
}

function CtaBannerPreview() {
	return (
		<div className="flex flex-col gap-1.5 w-[150px] h-[100px] p-2 bg-white">
			<div className="rounded-md h-8 flex items-center justify-between px-1.5" style={{ background: 'linear-gradient(120deg, #2f6fed, #7c3aed)' }}>
				<div className="w-10 h-1.5 bg-white/90 rounded" />
				<div className="rounded px-1.5 py-0.5" style={{ backgroundColor: '#0f1420' }}>
					<div className="w-6 h-1 bg-white rounded" />
				</div>
			</div>
			<div className="flex gap-2 mt-0.5">
				<div className="w-8 h-1 bg-neutral-400 rounded" />
				<div className="w-8 h-1 bg-neutral-400 rounded" />
				<div className="w-8 h-1 bg-neutral-400 rounded" />
			</div>
		</div>
	)
}

function SocialFocusPreview() {
	return (
		<div className="flex flex-col items-center gap-1.5 w-[150px] h-[100px] p-2 bg-white justify-center">
			<div className="w-10 h-1.5 bg-neutral-700 rounded" />
			<div className="flex gap-1.5">
				{[0, 1, 2].map((i) => (
					<div key={i} className="w-4 h-4 rounded-full bg-indigo-100 border border-indigo-300" />
				))}
			</div>
			<div className="w-20 h-1 bg-neutral-300 rounded" />
		</div>
	)
}

function TwoColumnSplitPreview() {
	return (
		<div className="flex gap-2 w-[150px] h-[100px] p-2 bg-white">
			<div className="flex flex-col gap-1" style={{ flex: '1 1 0' }}>
				<div className="w-8 h-1.5 bg-neutral-700 rounded" />
				<div className="w-10 h-1 bg-neutral-300 rounded" />
			</div>
			<div className="grid grid-cols-2 gap-1" style={{ flex: '1 1 0' }}>
				{[0, 1, 2, 3].map((i) => (
					<div key={i} className="w-7 h-1 bg-neutral-400 rounded" />
				))}
			</div>
		</div>
	)
}

function CompactBarPreview() {
	return (
		<div className="flex items-center justify-between gap-1.5 w-[150px] h-[100px] p-2 bg-white border border-neutral-200 rounded-md self-center">
			<div className="w-8 h-1.5 bg-neutral-700 rounded" />
			<div className="flex gap-1.5">
				<div className="w-5 h-1 bg-neutral-400 rounded" />
				<div className="w-5 h-1 bg-neutral-400 rounded" />
			</div>
			<div className="w-9 h-1 bg-neutral-300 rounded" />
		</div>
	)
}

function BrandSidebarPreview() {
	return (
		<div className="flex gap-2 w-[150px] h-[100px] p-2 bg-white">
			<div className="flex flex-col gap-1 pl-1.5 border-l-2 border-blue-500">
				<div className="w-8 h-1.5 bg-neutral-700 rounded" />
				<div className="w-9 h-1 bg-neutral-300 rounded" />
			</div>
			<div className="flex flex-wrap gap-1.5 flex-1">
				<div className="w-8 h-1 bg-neutral-500 rounded" />
				<div className="w-8 h-1 bg-neutral-500 rounded" />
				<div className="w-8 h-1 bg-neutral-500 rounded" />
			</div>
		</div>
	)
}

function FooterTemplatePanel() {
	const canvas = useEditor()
	const node = canvas?.focusedNode as FooterTemplateNode
	const { t } = useTranslation('propertyPanel')

	const uiTypeOptions: UiTypeOption[] = [
		{ value: 'classicColumns', label: t('footerTemplatePanel.uiType.classicColumns'), Preview: ClassicColumnsPreview },
		{ value: 'centeredMinimal', label: t('footerTemplatePanel.uiType.centeredMinimal'), Preview: CenteredMinimalPreview },
		{ value: 'darkMega', label: t('footerTemplatePanel.uiType.darkMega'), Preview: DarkMegaPreview },
		{ value: 'ctaBanner', label: t('footerTemplatePanel.uiType.ctaBanner'), Preview: CtaBannerPreview },
		{ value: 'socialFocus', label: t('footerTemplatePanel.uiType.socialFocus'), Preview: SocialFocusPreview },
		{ value: 'twoColumnSplit', label: t('footerTemplatePanel.uiType.twoColumnSplit'), Preview: TwoColumnSplitPreview },
		{ value: 'compactBar', label: t('footerTemplatePanel.uiType.compactBar'), Preview: CompactBarPreview },
		{ value: 'brandSidebar', label: t('footerTemplatePanel.uiType.brandSidebar'), Preview: BrandSidebarPreview },
	]

	// `childrenUpdater` keeps the node tree in step; skipped on legacy nodes.
	function updateColumns(
		updater: (columns: FooterColumn[]) => FooterColumn[],
		childrenUpdater?: (children: CanvasNode[], node: FooterTemplateNode) => CanvasNode[],
	) {
		canvas.updateNode((prevNode) => {
			const footerNode = prevNode as FooterTemplateNode
			return {
				...footerNode,
				columns: updater(footerNode.columns),
				...(footerNode.children && childrenUpdater
					? { children: childrenUpdater(footerNode.children, footerNode) }
					: {}),
			}
		})
	}

	function addColumn() {
		const column = {
			title: t('footerTemplatePanel.newColumnTitle', { number: (node.columns?.length ?? 0) + 1 }),
			links: [{ label: t('footerTemplatePanel.newLink'), href: '' }],
		}
		updateColumns(
			(columns) => [...columns, column],
			(children, n) => [...children, buildFooterColumnBlock(column, n.uiType, children.length - FOOTER_COLUMNS_OFFSET)],
		)
	}

	function removeColumn(index: number) {
		updateColumns(
			(columns) => columns.filter((_, i) => i !== index),
			(children) => children.filter((_, i) => i !== index + FOOTER_COLUMNS_OFFSET),
		)
	}

	function updateLinks(
		columnIndex: number,
		updater: (links: FooterLink[]) => FooterLink[],
		linkNodesUpdater?: (links: CanvasNode[], node: FooterTemplateNode) => CanvasNode[],
	) {
		updateColumns(
			(columns) => {
				const next = [...columns]
				next[columnIndex] = { ...next[columnIndex], links: updater(next[columnIndex].links) }
				return next
			},
			linkNodesUpdater
				? (children, n) => updateFooterColumnLinks(children, columnIndex, (links) => linkNodesUpdater(links, n))
				: undefined,
		)
	}

	function addLink(columnIndex: number) {
		const link = { label: t('footerTemplatePanel.newLink'), href: '' }
		updateLinks(
			columnIndex,
			(links) => [...links, link],
			(links, n) => [...links, buildFooterLinkButton(link, n.uiType)],
		)
	}

	function removeLink(columnIndex: number, linkIndex: number) {
		updateLinks(
			columnIndex,
			(links) => links.filter((_, i) => i !== linkIndex),
			(links) => links.filter((_, i) => i !== linkIndex),
		)
	}

	if (node)
		return (
			<div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

				<SectionContainer label={t('footerTemplatePanel.uiType.label')}>
					<UiTypeSelector
						options={uiTypeOptions}
						value={node.uiType}
						onChange={(v) => canvas.updateNode((prevNode) => {
							const n = prevNode as FooterTemplateNode
							const uiType = v as FooterUiType
							return {
								...n,
								uiType,
								...(n.children ? { children: restyleFooterChildren(n.children, uiType) } : {}),
							}
						})}
					/>
				</SectionContainer>

				<FoldList label={t('footerTemplatePanel.content')}>
				<PanelRowContainer className=' px-0 ' layoutType='col' label={t('footerTemplatePanel.brand')}>
					<TextInput
						size='sm'
						value={node.brand}
						onChange={(e) => canvas.updateNode((prevNode) => {
							const n = prevNode as FooterTemplateNode
							return {
								...n,
								brand: e.target.value,
								...(n.children ? { children: setFooterSlotText(n.children, 'brand', e.target.value) } : {}),
							}
						})}
					/>
				</PanelRowContainer>

				<PanelRowContainer className=' px-0 ' layoutType='col' label={t('footerTemplatePanel.tagline')}>
					<TextInput
						size='sm'
						value={node.tagline}
						onChange={(e) => canvas.updateNode((prevNode) => {
							const n = prevNode as FooterTemplateNode
							return {
								...n,
								tagline: e.target.value,
								...(n.children ? { children: setFooterSlotText(n.children, 'tagline', e.target.value) } : {}),
							}
						})}
					/>
				</PanelRowContainer>

				<PanelRowContainer className=' px-0 gap-3 ' layoutType='col' label={t('footerTemplatePanel.columns')}>
					{node.columns.map((column, columnIndex) => (
						<div key={columnIndex} className='border rounded-lg overflow-hidden'>
							<div className='relative h-[40px] gap-2 px-2 flex justify-between items-center bg-primary/20 rounded-t-md border-b'>
								<span className='text-sm font-medium text-foreground'>{t('footerTemplatePanel.columnNumber', { number: columnIndex + 1 })}</span>
								{node.columns.length > 1 && (
									<div
										onClick={() => removeColumn(columnIndex)}
										className='cursor-pointer rounded-tr absolute right-0 min-w-[40px] h-full flex border border-destructive bg-destructive text-destructive-foreground justify-center items-center'
									>
										<FiTrash size={16} />
									</div>
								)}
							</div>
							<div className='flex flex-col gap-2 p-2'>
								<PanelRowContainer className=' px-0 ' layoutType='col' label={t('footerTemplatePanel.columnTitle')}>
									<TextInput
										size='sm'
										value={column.title}
										onChange={(e) => updateColumns((columns) => {
											const next = [...columns]
											next[columnIndex] = { ...next[columnIndex], title: e.target.value }
											return next
										}, (children) => setFooterSlotText(children, { column: columnIndex, field: 'title' }, e.target.value))}
									/>
								</PanelRowContainer>

								<div className='flex flex-col gap-2 pl-2 border-l-2 border-border'>
									{column.links.map((link, linkIndex) => (
										<div key={linkIndex} className='flex flex-col gap-1.5 relative'>
											<div className='flex items-center justify-between'>
												<span className='text-xs font-medium text-muted-foreground'>{t('footerTemplatePanel.linkNumber', { number: linkIndex + 1 })}</span>
												{column.links.length > 1 && (
													<div
														onClick={() => removeLink(columnIndex, linkIndex)}
														className='cursor-pointer text-destructive'
													>
														<FiTrash size={14} />
													</div>
												)}
											</div>
											<PanelRowContainer className=' px-0 ' layoutType='col' label={t('footerTemplatePanel.label')}>
												<TextInput
													size='sm'
													value={link.label}
													onChange={(e) => updateLinks(columnIndex, (links) => {
														const next = [...links]
														next[linkIndex] = { ...next[linkIndex], label: e.target.value }
														return next
													}, (links) => links.map((l, i) => (i === linkIndex ? { ...l, children: e.target.value } as CanvasNode : l)))}
												/>
											</PanelRowContainer>
											<PanelRowContainer className=' px-0 ' layoutType='col' label={t('footerTemplatePanel.href')}>
												<TextInput
													size='sm'
													value={link.href}
													onChange={(e) => updateLinks(columnIndex, (links) => {
														const next = [...links]
														next[linkIndex] = { ...next[linkIndex], href: e.target.value }
														return next
													}, (links) => links.map((l, i) => (i === linkIndex ? { ...l, attributes: { ...l.attributes, href: e.target.value } } as CanvasNode : l)))}
												/>
											</PanelRowContainer>
										</div>
									))}
									<div
										onClick={() => addLink(columnIndex)}
										className=' gap-1.5 text-sm flex text-center w-[100%] border-t-[1px] border-border text-muted-foreground h-[32px] justify-center items-center cursor-pointer '
									>
										<CirclePlusIcon size={16} />
										<span className='text-xs'>{t('footerTemplatePanel.addLink')}</span>
									</div>
								</div>
							</div>
						</div>
					))}
					<div
						onClick={addColumn}
						className=' gap-2 text-base flex text-center w-[100%] my-1 border-t-[1px] border-border text-muted-foreground h-[38px] justify-center items-center cursor-pointer '
					>
						<CirclePlusIcon size={24} />
						<span className='text-sm'>{t('footerTemplatePanel.addColumn')}</span>
					</div>
				</PanelRowContainer>

				<PanelRowContainer className=' px-0 ' layoutType='col' label={t('footerTemplatePanel.copyrightText')}>
					<TextInput
						size='sm'
						value={node.copyrightText}
						onChange={(e) => canvas.updateNode((prevNode) => {
							const n = prevNode as FooterTemplateNode
							return {
								...n,
								copyrightText: e.target.value,
								...(n.children ? { children: setFooterSlotText(n.children, 'copyright', e.target.value) } : {}),
							}
						})}
					/>
				</PanelRowContainer>

				<PanelRowContainer className=' px-0 ' layoutType='row' label={t('footerTemplatePanel.showOrganizer')}>
					<Switch
						checked={!!node.showOrganizer}
						onCheckedChange={(v) => canvas.updateNode((prevNode) => ({
							...prevNode as FooterTemplateNode,
							showOrganizer: v,
						}))}
					/>
				</PanelRowContainer>

				{node.showOrganizer && (
					<PanelRowContainer className=' px-0 ' layoutType='col' label={t('footerTemplatePanel.organizerText')}>
						<TextInput
							size='sm'
							value={node.organizerText ?? ''}
							onChange={(e) => canvas.updateNode((prevNode) => ({
								...prevNode as FooterTemplateNode,
								organizerText: e.target.value,
							}))}
						/>
					</PanelRowContainer>
				)}
				</FoldList>

				<FoldList label={t('footerTemplatePanel.typography')}>
					<TypographyMapControl
						field="brand"
						label={t('footerTemplatePanel.brand')}
						defaultValue={(FOOTER_TYPOGRAPHY_DEFAULTS[node.uiType] ?? FOOTER_TYPOGRAPHY_DEFAULTS.classicColumns).brand}
					/>
					<TypographyMapControl
						field="tagline"
						label={t('footerTemplatePanel.tagline')}
						defaultValue={(FOOTER_TYPOGRAPHY_DEFAULTS[node.uiType] ?? FOOTER_TYPOGRAPHY_DEFAULTS.classicColumns).tagline}
					/>
					<TypographyMapControl
						field="columns.title"
						label={t('footerTemplatePanel.columnTitle')}
						defaultValue={(FOOTER_TYPOGRAPHY_DEFAULTS[node.uiType] ?? FOOTER_TYPOGRAPHY_DEFAULTS.classicColumns).columnTitle}
					/>
					<TypographyMapControl
						field="columns.links.label"
						label={t('footerTemplatePanel.label')}
						defaultValue={(FOOTER_TYPOGRAPHY_DEFAULTS[node.uiType] ?? FOOTER_TYPOGRAPHY_DEFAULTS.classicColumns).linkLabel}
					/>
					<TypographyMapControl
						field="copyrightText"
						label={t('footerTemplatePanel.copyrightText')}
						defaultValue={(FOOTER_TYPOGRAPHY_DEFAULTS[node.uiType] ?? FOOTER_TYPOGRAPHY_DEFAULTS.classicColumns).copyrightText}
					/>
					<LineClampControl field="brand" label={t('footerTemplatePanel.brand')} />
					<LineClampControl field="tagline" label={t('footerTemplatePanel.tagline')} />
					<LineClampControl field="columns.title" label={t('footerTemplatePanel.columnTitle')} />
					<LineClampControl field="columns.links.label" label={t('footerTemplatePanel.label')} />
					<LineClampControl field="copyrightText" label={t('footerTemplatePanel.copyrightText')} />
				</FoldList>

				<FoldList label={t('footerTemplatePanel.colors')}>
				<SectionContainer hintKey="colorPair">
					<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('footerTemplatePanel.accentColor')}>
						<ColorPicker
							value={node.accentColor || '#2f6fed'}
							onChange={(v) => canvas.updateNode((prevNode) => ({
								...prevNode as FooterTemplateNode,
								accentColor: v,
							}))}
						/>
					</PanelRowContainer>
					<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('footerTemplatePanel.accentColorSecondary')}>
						<ColorPicker
							value={node.accentColorSecondary || '#7c3aed'}
							onChange={(v) => canvas.updateNode((prevNode) => ({
								...prevNode as FooterTemplateNode,
								accentColorSecondary: v,
							}))}
						/>
					</PanelRowContainer>
					<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('footerTemplatePanel.backgroundColor')}>
						<ColorPicker
							value={(node.style?.backgroundColor as string) || '#ffffff'}
							onChange={(v) => canvas.updateNode((prevNode) => ({
								...prevNode as FooterTemplateNode,
								style: { ...(prevNode as FooterTemplateNode).style, backgroundColor: v },
							}))}
						/>
					</PanelRowContainer>
				</SectionContainer>
				</FoldList>

				<SectionContainer hintKey="styleGroup" label={t('footerTemplatePanel.style')}>
					<BorderController />
				</SectionContainer>

				<PaddingController />

				<BorderRadiusController />

				<BoxShadowController />

				<Attributes />
			</div>
		)
}

export default withTemplateTabs(FooterTemplatePanel)
