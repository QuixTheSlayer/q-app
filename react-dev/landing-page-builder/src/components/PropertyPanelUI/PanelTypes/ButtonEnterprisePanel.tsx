import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { ButtonEnterpriseNode, ButtonEnterpriseUiType } from '@/types/node.type'
import { restyleButtonEnterpriseChildren, setButtonEnterpriseSlotText } from '@/utils/buttonEnterpriseSlots'
import { TextInput } from '@/components/ui/primitives/text-input'
import ColorPicker from '@/components/ui/ColorPicker'
import { LineClampControl } from '../Sections/relatedComponents/LineClampControl'
import { TypographyMapControl } from '../Sections/relatedComponents/TypographyControl'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { useTranslation } from 'react-i18next'
import { UiTypeSelector, UiTypeOption } from '@/components/PropertyPanelUI/UiTypeSelector'
import FoldList from '@/components/ui/FoldList'

import withTemplateTabs from './withTemplateTabs'

// label's color and weight vary by variant — every variant renders it in
// node.textColor except ghostUnderline, whose fill-less composition uses
// node.color for legibility instead; font-weight also differs per variant's
// Tailwind class. Keep in sync with ButtonEnterpriseVisual.tsx.
const BUTTON_ENTERPRISE_LABEL_WEIGHT: Record<ButtonEnterpriseNode['uiType'], string> = {
	iconSplit: '600',
	pillLift: '600',
	outlineFill: '500',
	gradientSweep: '600',
	pressDepth: '700',
	ghostUnderline: '500',
	cornerBadge: '600',
	splitAction: '600',
}

// ---- Tiny static previews (~150x100), one per uiType, mirroring the real
// ButtonEnterpriseVisual composition at a glance. Hardcoded sample content —
// these never touch live node data. ----

function IconSplitPreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex items-center justify-center">
			<div className="inline-flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: '#2f2f2f' }}>
				<div className="w-[22px] h-[22px] rounded-md" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }} />
				<div className="flex flex-col gap-0.5">
					<div className="w-[50px] h-[6px] rounded bg-white" />
					<div className="w-[65px] h-[4px] rounded bg-white/50" />
				</div>
			</div>
		</div>
	)
}

function PillLiftPreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex items-center justify-center">
			<div className="inline-flex items-center gap-2 rounded-full px-5 py-2.5" style={{ backgroundColor: '#2f2f2f', boxShadow: '0 8px 16px -6px #2f2f2f' }}>
				<div className="w-[45px] h-[6px] rounded bg-white" />
				<div className="w-[10px] h-[10px] rounded-full bg-white/60" />
			</div>
		</div>
	)
}

function OutlineFillPreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex items-center justify-center">
			<div className="p-1 rounded-lg" style={{ border: '2px solid #2f2f2f' }}>
				<div className="rounded-md px-3 py-1" style={{ backgroundColor: '#2f2f2f' }}>
					<div className="w-[45px] h-[6px] rounded bg-white" />
				</div>
			</div>
		</div>
	)
}

function GradientSweepPreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex items-center justify-center px-2">
			<div className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 w-full" style={{ background: 'linear-gradient(120deg, #2f2f2f, #2f2f2f66)' }}>
				<div className="w-[55px] h-[6px] rounded bg-white" />
				<div className="w-[18px] h-[18px] rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} />
			</div>
		</div>
	)
}

function PressDepthPreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex items-center justify-center">
			<div
				className="rounded-lg px-4 py-2"
				style={{ backgroundColor: '#2f2f2f', boxShadow: '0 4px 0 0 #2f2f2f, 0 4px 0 0 rgba(0,0,0,0.35)', borderBottom: '3px solid rgba(0,0,0,0.25)' }}
			>
				<div className="w-[45px] h-[6px] rounded bg-white" />
			</div>
		</div>
	)
}

function GhostUnderlinePreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex items-center justify-center">
			<div className="flex flex-col items-start gap-1">
				<div className="flex items-center gap-1.5">
					<div className="w-[16px] h-[16px] rounded-full" style={{ border: '1.5px solid #2f2f2f' }} />
					<div className="w-[45px] h-[6px] rounded" style={{ backgroundColor: '#2f2f2f' }} />
				</div>
				<div className="h-[2px] w-full rounded-full" style={{ backgroundColor: '#2f2f2f' }} />
			</div>
		</div>
	)
}

function CornerBadgePreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex items-center justify-center">
			<div className="relative">
				<div className="rounded-md px-4 py-2" style={{ backgroundColor: '#2f2f2f' }}>
					<div className="w-[45px] h-[6px] rounded bg-white" />
				</div>
				<div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: '#F0F0F0' }}>
					<span className="text-[6px] font-bold" style={{ color: '#2f2f2f' }}>New</span>
				</div>
			</div>
		</div>
	)
}

function SplitActionPreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex items-center justify-center">
			<div className="inline-flex rounded-lg overflow-hidden">
				<div className="flex flex-col gap-0.5 px-3 py-2" style={{ backgroundColor: '#2f2f2f' }}>
					<div className="w-[45px] h-[6px] rounded bg-white" />
					<div className="w-[55px] h-[4px] rounded bg-white/50" />
				</div>
				<div className="flex items-center justify-center px-2.5" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
					<div className="w-[10px] h-[10px] rounded-full bg-white/70" />
				</div>
			</div>
		</div>
	)
}

const UI_TYPE_OPTIONS: (t: (key: string) => string) => UiTypeOption[] = (t) => [
	{ value: 'iconSplit', label: t('buttonEnterprisePanel.uiType.iconSplit'), Preview: IconSplitPreview },
	{ value: 'pillLift', label: t('buttonEnterprisePanel.uiType.pillLift'), Preview: PillLiftPreview },
	{ value: 'outlineFill', label: t('buttonEnterprisePanel.uiType.outlineFill'), Preview: OutlineFillPreview },
	{ value: 'gradientSweep', label: t('buttonEnterprisePanel.uiType.gradientSweep'), Preview: GradientSweepPreview },
	{ value: 'pressDepth', label: t('buttonEnterprisePanel.uiType.pressDepth'), Preview: PressDepthPreview },
	{ value: 'ghostUnderline', label: t('buttonEnterprisePanel.uiType.ghostUnderline'), Preview: GhostUnderlinePreview },
	{ value: 'cornerBadge', label: t('buttonEnterprisePanel.uiType.cornerBadge'), Preview: CornerBadgePreview },
	{ value: 'splitAction', label: t('buttonEnterprisePanel.uiType.splitAction'), Preview: SplitActionPreview },
]

function ButtonEnterprisePanel() {
	const canvas = useEditor()
	const node = canvas?.focusedNode as ButtonEnterpriseNode
	const { t } = useTranslation('propertyPanel')

	if (node)
		return (
			<div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

				<SectionContainer label={t('buttonEnterprisePanel.uiTypeLabel')}>
					<UiTypeSelector
						options={UI_TYPE_OPTIONS(t)}
						value={node.uiType}
						onChange={(v) => canvas.updateNode((prevNode) => {
							const n = prevNode as ButtonEnterpriseNode
							const next = { ...n, uiType: v as ButtonEnterpriseUiType }
							return n.children ? { ...next, children: restyleButtonEnterpriseChildren(n.children, next) } : next
						})}
					/>
				</SectionContainer>

				<FoldList label={t('buttonEnterprisePanel.content')}>
					<SectionContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('buttonEnterprisePanel.label')}>
							<TextInput
								size='sm'
								value={node.label}
								onChange={(e) => canvas.updateNode((prevNode) => {
									const n = prevNode as ButtonEnterpriseNode
									return {
										...n,
										label: e.target.value,
										...(n.children ? { children: setButtonEnterpriseSlotText(n.children, 'label', e.target.value) } : {}),
									}
								})}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('buttonEnterprisePanel.subLabel')}>
							<TextInput
								size='sm'
								value={node.subLabel ?? ''}
								placeholder={t('buttonEnterprisePanel.subLabelPlaceholder')}
								onChange={(e) => canvas.updateNode((prevNode) => {
									const n = prevNode as ButtonEnterpriseNode
									return {
										...n,
										subLabel: e.target.value,
										...(n.children ? { children: setButtonEnterpriseSlotText(n.children, 'subLabel', e.target.value) } : {}),
									}
								})}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('buttonEnterprisePanel.icon')}>
							<TextInput
								size='sm'
								value={node.icon ?? ''}
								placeholder={t('buttonEnterprisePanel.iconPlaceholder')}
								onChange={(e) => canvas.updateNode((prevNode) => ({
									...prevNode as ButtonEnterpriseNode,
									icon: e.target.value,
								}))}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('buttonEnterprisePanel.badgeText')}>
							<TextInput
								size='sm'
								value={node.badgeText ?? ''}
								placeholder={t('buttonEnterprisePanel.badgeTextPlaceholder')}
								onChange={(e) => canvas.updateNode((prevNode) => ({
									...prevNode as ButtonEnterpriseNode,
									badgeText: e.target.value,
								}))}
							/>
						</PanelRowContainer>

						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('buttonEnterprisePanel.href')}>
							<TextInput
								size='sm'
								value={node.href}
								onChange={(e) => canvas.updateNode((prevNode) => ({
									...prevNode as ButtonEnterpriseNode,
									href: e.target.value,
								}))}
							/>
						</PanelRowContainer>
					</SectionContainer>
				</FoldList>

				<FoldList label={t('buttonEnterprisePanel.typography')}>
					<TypographyMapControl
						field="label"
						label={t('buttonEnterprisePanel.label')}
						defaultValue={{ fontSize: '16px', fontWeight: BUTTON_ENTERPRISE_LABEL_WEIGHT[node.uiType] ?? '600', color: (node.uiType === 'ghostUnderline' ? node.color : node.textColor) || '#F0F0F0' }}
					/>
					<TypographyMapControl
						field="subLabel"
						label={t('buttonEnterprisePanel.subLabel')}
						defaultValue={{ fontSize: '12px', fontWeight: '400', color: node.textColor || '#F0F0F0' }}
					/>
					<TypographyMapControl
						field="badgeText"
						label={t('buttonEnterprisePanel.badgeText')}
						defaultValue={{ fontSize: '10px', fontWeight: '700', color: node.color || '#2f2f2f' }}
					/>
					<LineClampControl field="label" label={t('buttonEnterprisePanel.label')} />
					<LineClampControl field="subLabel" label={t('buttonEnterprisePanel.subLabel')} />
					<LineClampControl field="badgeText" label={t('buttonEnterprisePanel.badgeText')} />
				</FoldList>

				<FoldList label={t('buttonEnterprisePanel.colors')}>
					<SectionContainer hintKey="colorPair">
						<PanelRowContainer layoutType='col' label={t('buttonEnterprisePanel.color')}>
							<ColorPicker
								value={node.color}
								onChange={(v) => canvas.updateNode((prevNode) => {
									const n = prevNode as ButtonEnterpriseNode
									const next = { ...n, color: v }
									return n.children ? { ...next, children: restyleButtonEnterpriseChildren(n.children, next) } : next
								})}
							/>
						</PanelRowContainer>
						<PanelRowContainer layoutType='col' label={t('buttonEnterprisePanel.textColor')}>
							<ColorPicker
								value={node.textColor}
								onChange={(v) => canvas.updateNode((prevNode) => {
									const n = prevNode as ButtonEnterpriseNode
									const next = { ...n, textColor: v }
									return n.children ? { ...next, children: restyleButtonEnterpriseChildren(n.children, next) } : next
								})}
							/>
						</PanelRowContainer>
					</SectionContainer>
				</FoldList>

				<SectionContainer hintKey="styleGroup" label={t('buttonEnterprisePanel.style')}>
					<BorderController />
				</SectionContainer>

				<SectionContainer label={t('attributes.attributes')}>

					<SectionContainer label={t('attributes.link')}>
						<PanelRowContainer layoutType='col'>
							<TextInput className='col-span-3' placeholder={t('attributes.url')} size="sm"
								value={(canvas.focusedNode as ButtonEnterpriseNode )?.href || ''}
								onChange={v => {
									canvas.updateNode(node => {
										return {
											...node,
											href: v.target.value
										}
									})
								}}
							/>
						</PanelRowContainer>

					</SectionContainer>

					<PanelRowContainer className=" w-[90%] " layoutType='col' label={t('attributes.class')}>
						<TextInput style={{
							position: "initial"
						}} className='col-span-2' size="sm"
							value={canvas.focusedNode?.attributes?.className || ''}
							onChange={v => {

								// const clasList: string[] = v.target.value.split(" ")

								// const positionExist = clasList?.find((value) => positions.includes(value as positionType)) as positionType



								canvas.updateNode((node: any) => {
									return {
										...node,
										attributes: {
											...node.attributes,
											className: v.target.value
										}
									}
								})


							}}
						/>
					</PanelRowContainer>
					<PanelRowContainer className=" w-[90%] " layoutType='col' label={t('attributes.id')}>
						<TextInput className='col-span-2' size="sm"
							value={canvas.focusedNode?.attributes?.id || ''}
							onChange={v => {
								canvas.updateNode((node: any) => {
									return {
										...node,
										attributes: {
											...node.attributes,
											id: v.target.value
										}
									}
								})
							}}
						/>
					</PanelRowContainer>

				</SectionContainer>
			</div>
		)
}

export default withTemplateTabs(ButtonEnterprisePanel)
