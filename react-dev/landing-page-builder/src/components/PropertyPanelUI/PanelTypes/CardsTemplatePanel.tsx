import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { CanvasNode, CardsTemplateNode, CardItem, CardsUiType } from '@/types/node.type'
import { buildCardBlock, restyleCardsChildren, setCardsSlotText } from '@/utils/cardsSlots'
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

// Variants whose composition has no image slot at all — the image upload
// field shows an explanatory message instead of a dead drop zone for these.
// Keep in sync with CardsTemplateVisual.tsx's variant compositions.
const CARDS_UI_TYPES_WITHOUT_IMAGE = new Set<CardsUiType>(['minimalBorder', 'gradientHeader', 'numberedList'])

// ---- Tiny static previews (~150x100), one per uiType, mirroring the real
// CardsTemplateVisual composition at a glance. Hardcoded sample content —
// these never touch live node data. ----

function GridClassicPreview() {
	return (
		<div className="flex gap-1.5 w-[150px] h-[100px] p-2 items-center justify-center bg-white">
			{[0, 1, 2].map((i) => (
				<div key={i} className="relative flex-1 h-16 bg-white rounded" style={{ boxShadow: '0 4px 10px -4px rgba(0,0,0,0.25)' }}>
					<span className="absolute flex items-center justify-center font-bold text-white" style={{ top: 0, left: 4, width: 12, height: 8, borderRadius: '0 0 3px 3px', backgroundColor: '#2f6fed', fontSize: 6 }}>{i + 1}</span>
				</div>
			))}
		</div>
	)
}

function ImageOverlayPreview() {
	return (
		<div className="flex gap-1.5 w-[150px] h-[100px] p-2 items-center justify-center bg-white">
			{[0, 1, 2].map((i) => (
				<div
					key={i}
					className="flex-1 h-16 rounded-md relative flex items-end overflow-hidden"
					style={{ background: `linear-gradient(135deg, hsl(${i * 70} 55% 40%), hsl(${i * 70 + 30} 55% 25%))` }}
				>
					<span className="absolute font-bold text-white" style={{ top: 4, left: 4, fontSize: 6, backgroundColor: 'rgba(0,0,0,0.4)', padding: '1px 3px', borderRadius: 4 }}>{i + 1}</span>
					<div className="w-full h-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
				</div>
			))}
		</div>
	)
}

function IconTopPreview() {
	return (
		<div className="flex gap-2 w-[150px] h-[100px] p-2 items-center justify-center bg-white">
			{[0, 1, 2].map((i) => (
				<div key={i} className="flex-1 flex flex-col items-center gap-1 py-2 rounded" style={{ backgroundColor: '#2f6fed08' }}>
					<div className="w-7 h-7 rounded-full flex items-center justify-center bg-white" style={{ boxShadow: 'inset 0 0 0 1.5px #2f6fed, 0 3px 6px -2px #2f6fed80' }}>
						<span className="font-bold" style={{ color: '#2f6fed', fontSize: 9 }}>{String.fromCharCode(65 + i)}</span>
					</div>
					<div className="w-8 h-1.5 bg-neutral-500 rounded" />
					<div className="w-10 h-1 bg-neutral-300 rounded" />
				</div>
			))}
		</div>
	)
}

function HorizontalRowPreview() {
	return (
		<div className="flex flex-col gap-1.5 w-[150px] h-[100px] p-2 justify-center bg-neutral-50">
			{[0, 1, 2].map((i) => (
				<div key={i} className="flex items-center gap-1.5 py-1 pl-1.5 pr-1 bg-white rounded" style={{ boxShadow: '0 2px 6px -3px rgba(0,0,0,0.3)', borderLeft: '2px solid #2f6fed' }}>
					<div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: '#2f6fed14' }}>
						<span className="font-bold" style={{ color: '#2f6fed', fontSize: 9 }}>{i + 1}</span>
					</div>
					<div className="flex flex-col gap-0.5 flex-1">
						<div className="w-14 h-1.5 bg-neutral-500 rounded" />
						<div className="w-20 h-1 bg-neutral-300 rounded" />
					</div>
				</div>
			))}
		</div>
	)
}

function MinimalBorderPreview() {
	return (
		<div className="flex gap-1.5 w-[150px] h-[100px] p-2 items-center justify-center bg-white">
			{[0, 1, 2].map((i) => (
				<div key={i} className="flex-1 h-16 border-x border-b border-neutral-200" style={{ borderTop: '3px solid #2f6fed' }}>
					<div className="p-1.5 flex flex-col gap-1">
						<div className="w-4 h-1 rounded" style={{ backgroundColor: '#2f6fed' }} />
						<div className="w-8 h-1 bg-neutral-400 rounded" />
					</div>
				</div>
			))}
		</div>
	)
}

function ShadowFloatPreview() {
	return (
		<div className="flex gap-2.5 w-[150px] h-[100px] p-2 items-start justify-center" style={{ backgroundColor: '#e5e5e5' }}>
			{[0, 1, 2].map((i) => (
				<div
					key={i}
					className="flex-1 h-14 bg-white rounded-lg overflow-hidden"
					style={{ boxShadow: '0 10px 18px -4px rgba(0,0,0,0.45)', marginTop: i % 2 === 1 ? 10 : 0 }}
				>
					<div style={{ height: 3, backgroundColor: '#2f6fed' }} />
				</div>
			))}
		</div>
	)
}

function GradientHeaderPreview() {
	return (
		<div className="flex gap-1.5 w-[150px] h-[100px] p-2 items-center justify-center bg-white">
			{[0, 1, 2].map((i) => (
				<div key={i} className="flex-1 h-16 rounded-md overflow-hidden flex flex-col" style={{ boxShadow: '0 4px 10px -4px rgba(0,0,0,0.25)' }}>
					<div className="h-9 flex flex-col justify-end p-1" style={{ background: `linear-gradient(120deg, #2f6fed, hsl(${i * 50} 70% 45%))` }}>
						<div className="w-6 h-1 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }} />
					</div>
					<div className="flex-1 p-1">
						<div className="w-8 h-1 bg-neutral-300 rounded" />
					</div>
				</div>
			))}
		</div>
	)
}

function NumberedListPreview() {
	return (
		<div className="flex flex-col w-[150px] h-[100px] p-2 justify-center bg-white">
			{[1, 2, 3].map((n, i) => (
				<div key={n} className="flex gap-2">
					<div className="flex flex-col items-center">
						<span className="font-bold" style={{ fontSize: 13, color: '#2f6fed', lineHeight: 1 }}>0{n}</span>
						{i < 2 && <div style={{ width: 1, flex: 1, backgroundColor: '#e0e0e0', marginTop: 2 }} />}
					</div>
					<div className="w-24 h-1.5 bg-neutral-400 rounded mt-0.5" />
				</div>
			))}
		</div>
	)
}

function SessionCardsPreview() {
	return (
		<div className="grid grid-cols-2 gap-1.5 w-[150px] h-[100px] p-2" style={{ backgroundColor: '#DDE7E3' }}>
			{[1, 2].map((n) => (
				<div key={n} className="flex flex-col overflow-hidden rounded" style={{ backgroundColor: '#EAF2EE', border: '1px solid #1B1D2214' }}>
					<span className="font-mono text-[7px] font-bold m-1 px-1 rounded self-start" style={{ backgroundColor: '#2563eb', color: '#fff' }}>0{n}</span>
					<div className="w-10 h-1 rounded mx-1.5 mt-1" style={{ backgroundColor: '#1B1D22' }} />
					<div className="w-8 h-[3px] rounded mx-1.5 mt-1 mb-1.5" style={{ backgroundColor: '#9ca3af' }} />
					<div className="w-full h-1" style={{ backgroundColor: '#2563eb' }} />
				</div>
			))}
		</div>
	)
}

function CardsTemplatePanel() {
	const canvas = useEditor()
	const node = canvas?.focusedNode as CardsTemplateNode
	const { t } = useTranslation('propertyPanel')

	const uiTypeOptions: UiTypeOption[] = [
		{ value: 'gridClassic', label: t('cardsTemplatePanel.uiType.gridClassic'), Preview: GridClassicPreview },
		{ value: 'imageOverlay', label: t('cardsTemplatePanel.uiType.imageOverlay'), Preview: ImageOverlayPreview },
		{ value: 'iconTop', label: t('cardsTemplatePanel.uiType.iconTop'), Preview: IconTopPreview },
		{ value: 'horizontalRow', label: t('cardsTemplatePanel.uiType.horizontalRow'), Preview: HorizontalRowPreview },
		{ value: 'minimalBorder', label: t('cardsTemplatePanel.uiType.minimalBorder'), Preview: MinimalBorderPreview },
		{ value: 'shadowFloat', label: t('cardsTemplatePanel.uiType.shadowFloat'), Preview: ShadowFloatPreview },
		{ value: 'gradientHeader', label: t('cardsTemplatePanel.uiType.gradientHeader'), Preview: GradientHeaderPreview },
		{ value: 'numberedList', label: t('cardsTemplatePanel.uiType.numberedList'), Preview: NumberedListPreview },
		{ value: 'sessionCards', label: t('cardsTemplatePanel.uiType.sessionCards'), Preview: SessionCardsPreview },
	]

	// `childrenUpdater` keeps the node tree in step; skipped on legacy nodes.
	function updateCards(
		updater: (cards: CardItem[]) => CardItem[],
		childrenUpdater?: (children: CanvasNode[], node: CardsTemplateNode) => CanvasNode[],
	) {
		canvas.updateNode((prevNode) => {
			const cardsNode = prevNode as CardsTemplateNode
			return {
				...cardsNode,
				cards: updater(cardsNode.cards),
				...(cardsNode.children && childrenUpdater
					? { children: childrenUpdater(cardsNode.children, cardsNode) }
					: {}),
			}
		})
	}

	function addCard() {
		const card = {
			title: t('cardsTemplatePanel.newCardTitle', { number: (node.cards?.length ?? 0) + 1 }),
			description: t('cardsTemplatePanel.defaultDescription'),
		}
		updateCards(
			(cards) => [...cards, card],
			(children, n) => [...children, buildCardBlock(card, n.uiType, n.accentColor, children.length - 1)],
		)
	}

	function removeCard(index: number) {
		updateCards(
			(cards) => cards.filter((_, i) => i !== index),
			(children) => children.filter((_, i) => i !== index + 1),
		)
	}

	if (node)
		return (
			<div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

				<SectionContainer label={t('cardsTemplatePanel.uiType.label')}>
					<UiTypeSelector
						options={uiTypeOptions}
						value={node.uiType}
						onChange={(v) => canvas.updateNode((prevNode) => {
							const n = prevNode as CardsTemplateNode
							const uiType = v as CardsUiType
							return {
								...n,
								uiType,
								...(n.children ? { children: restyleCardsChildren(n.children, uiType, n.accentColor) } : {}),
							}
						})}
					/>
				</SectionContainer>

				<FoldList label={t('cardsTemplatePanel.content')}>
					<PanelRowContainer className=' px-0 ' layoutType='col' label={t('cardsTemplatePanel.heading')}>
						<TextInput
							size='sm'
							value={node.heading}
							onChange={(e) => canvas.updateNode((prevNode) => {
								const n = prevNode as CardsTemplateNode
								return {
									...n,
									heading: e.target.value,
									...(n.children ? { children: setCardsSlotText(n.children, 'heading', e.target.value) } : {}),
								}
							})}
						/>
					</PanelRowContainer>

					<PanelRowContainer className=' px-0 gap-3 ' layoutType='col' label={t('cardsTemplatePanel.cardsLabel')}>
						{node.cards.map((card, index) => (
							<div key={index} className='border rounded-lg overflow-hidden'>
								<div className='relative h-[40px] gap-2 px-2 flex justify-between items-center bg-primary/20 rounded-t-md border-b'>
									<span className='text-sm font-medium text-foreground'>{t('cardsTemplatePanel.cardNumber', { number: index + 1 })}</span>
									{node.cards.length > 1 && (
										<div
											onClick={() => removeCard(index)}
											className='cursor-pointer rounded-tr absolute right-0 min-w-[40px] h-full flex border border-destructive bg-destructive text-destructive-foreground justify-center items-center'
										>
											<FiTrash size={16} />
										</div>
									)}
								</div>
								<div className='flex flex-col gap-2 p-2'>
									<PanelRowContainer className=' px-0 ' layoutType='col' label={t('cardsTemplatePanel.title')}>
										<TextInput
											size='sm'
											value={card.title}
											onChange={(e) => updateCards((cards) => {
												const next = [...cards]
												next[index] = { ...next[index], title: e.target.value }
												return next
											}, (children) => setCardsSlotText(children, { card: index, field: 'title' }, e.target.value))}
										/>
									</PanelRowContainer>
									<PanelRowContainer className=' px-0 ' layoutType='col' label={t('cardsTemplatePanel.description')}>
										<TextInput
											size='sm'
											value={card.description}
											onChange={(e) => updateCards((cards) => {
												const next = [...cards]
												next[index] = { ...next[index], description: e.target.value }
												return next
											}, (children) => setCardsSlotText(children, { card: index, field: 'description' }, e.target.value))}
										/>
									</PanelRowContainer>
									<PanelRowContainer className=' px-0 ' layoutType='col' label={t('cardsTemplatePanel.imageUrl')}>
										<TemplateImageField
											value={card.imageUrl}
											unsupportedForVariant={CARDS_UI_TYPES_WITHOUT_IMAGE.has(node.uiType)}
											onChange={(url) => updateCards((cards) => {
												const next = [...cards]
												next[index] = { ...next[index], imageUrl: url }
												return next
											})}
										/>
										<TextInput
											className=' mt-2 '
											size='sm'
											value={card.imageUrl ?? ''}
											placeholder={t('cardsTemplatePanel.imageUrlPlaceholder')}
											onChange={(e) => updateCards((cards) => {
												const next = [...cards]
												next[index] = { ...next[index], imageUrl: e.target.value }
												return next
											})}
										/>
									</PanelRowContainer>
								</div>
							</div>
						))}
						<div
							onClick={addCard}
							className=' gap-2 text-base flex text-center w-[100%] my-1 border-t-[1px] border-border text-muted-foreground h-[38px] justify-center items-center cursor-pointer '
						>
							<CirclePlusIcon size={24} />
							<span className='text-sm'>{t('cardsTemplatePanel.addCard')}</span>
						</div>
					</PanelRowContainer>
				</FoldList>

				<FoldList label={t('cardsTemplatePanel.typography')}>
					<TypographyMapControl
						field="heading"
						label={t('cardsTemplatePanel.heading')}
						defaultValue={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a' }}
					/>
					<TypographyMapControl
						field="title"
						label={t('cardsTemplatePanel.title')}
						defaultValue={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}
					/>
					<TypographyMapControl
						field="description"
						label={t('cardsTemplatePanel.description')}
						defaultValue={{ fontSize: '13px', fontWeight: '400', color: '#5a5a5a' }}
					/>
					<LineClampControl field="heading" label={t('cardsTemplatePanel.heading')} />
					<LineClampControl field="title" label={t('cardsTemplatePanel.title')} />
					<LineClampControl field="description" label={t('cardsTemplatePanel.description')} />
				</FoldList>

				<FoldList label={t('cardsTemplatePanel.colors')}>
					<SectionContainer hintKey="colorPair">
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('cardsTemplatePanel.accentColor')}>
							<ColorPicker
								value={node.accentColor || '#2f6fed'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as CardsTemplateNode,
									accentColor: v,
								}))}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('cardsTemplatePanel.accentColorSecondary')}>
							<ColorPicker
								value={node.accentColorSecondary || '#7c3aed'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as CardsTemplateNode,
									accentColorSecondary: v,
								}))}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('cardsTemplatePanel.backgroundColor')}>
							<ColorPicker
								value={(node.style?.backgroundColor as string) || '#ffffff'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as CardsTemplateNode,
									style: { ...(prevNode as CardsTemplateNode).style, backgroundColor: v },
								}))}
							/>
						</PanelRowContainer>
					</SectionContainer>
				</FoldList>

				<SectionContainer hintKey="styleGroup" label={t('cardsTemplatePanel.style')}>
					<BorderController />
				</SectionContainer>

				<PaddingController />

				<BorderRadiusController />

				<BoxShadowController />

				<Attributes />
			</div>
		)
}

export default withTemplateTabs(CardsTemplatePanel)
