import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { UiTypeSelector } from '@/components/PropertyPanelUI/UiTypeSelector'
import { useEditor } from '@/context/EditorContext'
import { EventWidgetsGroupTemplateNode } from '@/types/node.type'
import { restyleEventWidgetsChildren, setEventWidgetsSlotText, EventWidgetsSlot } from '@/utils/eventWidgetsSlots'
import { TextInput } from '@/components/ui/primitives/text-input'
import { useTranslation } from 'react-i18next'
import ColorPicker from '@/components/ui/ColorPicker'
import { LineClampControl } from '../Sections/relatedComponents/LineClampControl'
import { TypographyMapControl } from '../Sections/relatedComponents/TypographyControl'
import { PaddingController } from '../Sections/relatedComponents/PaddingController'
import { BorderRadiusController } from '../Sections/relatedComponents/BorderRadiusController'
import { BoxShadowController } from '../Sections/relatedComponents/Controllers'
import FoldList from '@/components/ui/FoldList'

import withTemplateTabs from './withTemplateTabs'

// Every variant hardcodes its own colors/sizes for these 6 fields (light
// card vs dark banner/glass surfaces), and several use the node's own
// accentColor/accentColorSecondary rather than a fixed hex — computed as a
// function of the node so those resolve correctly. Keep in sync with
// EventWidgetsGroupTemplateVisual.tsx.
function getEventWidgetsTypographyDefaults(node: EventWidgetsGroupTemplateNode): {
	heading: React.CSSProperties
	endDateText: React.CSSProperties
	endHourText: React.CSSProperties
	timeZoneText: React.CSSProperties
	submitEntryLabel: React.CSSProperties
	registerLabel: React.CSSProperties
} {
	switch (node.uiType) {
		case 'countdownCard':
			return {
				heading: { fontSize: '12px', fontWeight: '700', color: node.accentColor },
				endDateText: { fontSize: '20px', fontWeight: '800', color: '#ffffff' },
				endHourText: { fontSize: '20px', fontWeight: '800', color: node.accentColor },
				timeZoneText: { fontSize: '11px', fontWeight: '400', color: node.accentColor },
				submitEntryLabel: { fontSize: '13px', fontWeight: '700', color: '#ffffff' },
				registerLabel: { fontSize: '13px', fontWeight: '700', color: node.accentColor },
			}
		case 'stackedCentered':
			return {
				heading: { fontSize: '26px', fontWeight: '800', color: '#18181b' },
				endDateText: { fontSize: '14px', fontWeight: '600', color: '#52525b' },
				endHourText: { fontSize: '14px', fontWeight: '400', color: '#52525b' },
				timeZoneText: { fontSize: '14px', fontWeight: '400', color: '#52525b' },
				submitEntryLabel: { fontSize: '14px', fontWeight: '700', color: '#ffffff' },
				registerLabel: { fontSize: '13px', fontWeight: '700', color: node.accentColorSecondary },
			}
		case 'splitPanel':
			return {
				heading: { fontSize: '18px', fontWeight: '700', color: '#ffffff' },
				endDateText: { fontSize: '13px', fontWeight: '400', color: '#d1d5db' },
				endHourText: { fontSize: '13px', fontWeight: '400', color: '#d1d5db' },
				timeZoneText: { fontSize: '13px', fontWeight: '400', color: '#d1d5db' },
				submitEntryLabel: { fontSize: '13px', fontWeight: '600', color: '#ffffff' },
				registerLabel: { fontSize: '13px', fontWeight: '600', color: '#111827' },
			}
		case 'minimalInline':
			return {
				heading: { fontSize: '14px', fontWeight: '700', color: '#0f172a' },
				endDateText: { fontSize: '14px', fontWeight: '400', color: '#94a3b8' },
				endHourText: { fontSize: '14px', fontWeight: '400', color: '#94a3b8' },
				timeZoneText: { fontSize: '14px', fontWeight: '400', color: '#94a3b8' },
				submitEntryLabel: { fontSize: '14px', fontWeight: '700', color: '#0f172a' },
				registerLabel: { fontSize: '14px', fontWeight: '600', color: '#64748b' },
			}
		case 'bannerCta':
			return {
				heading: { fontSize: '20px', fontWeight: '800', color: '#ffffff' },
				endDateText: { fontSize: '13px', fontWeight: '400', color: '#ffffff' },
				endHourText: { fontSize: '13px', fontWeight: '400', color: '#ffffff' },
				timeZoneText: { fontSize: '13px', fontWeight: '400', color: '#ffffff' },
				submitEntryLabel: { fontSize: '14px', fontWeight: '800', color: node.accentColorSecondary },
				registerLabel: { fontSize: '14px', fontWeight: '700', color: '#ffffff' },
			}
		case 'darkGlass':
			return {
				heading: { fontSize: '18px', fontWeight: '700', color: '#f8fafc' },
				endDateText: { fontSize: '13px', fontWeight: '400', color: '#94a3b8' },
				endHourText: { fontSize: '13px', fontWeight: '400', color: '#94a3b8' },
				timeZoneText: { fontSize: '13px', fontWeight: '400', color: '#94a3b8' },
				submitEntryLabel: { fontSize: '13px', fontWeight: '800', color: '#0f172a' },
				registerLabel: { fontSize: '13px', fontWeight: '700', color: '#e2e8f0' },
			}
		case 'twoColumnCard':
			return {
				heading: { fontSize: '18px', fontWeight: '700', color: '#18181b' },
				endDateText: { fontSize: '13px', fontWeight: '400', color: '#52525b' },
				endHourText: { fontSize: '13px', fontWeight: '400', color: '#52525b' },
				timeZoneText: { fontSize: '13px', fontWeight: '400', color: '#52525b' },
				submitEntryLabel: { fontSize: '13px', fontWeight: '700', color: '#ffffff' },
				registerLabel: { fontSize: '13px', fontWeight: '700', color: node.accentColorSecondary },
			}
		case 'classicRow':
		default:
			return {
				heading: { fontSize: '17px', fontWeight: '700', color: '#0f172a' },
				endDateText: { fontSize: '12px', fontWeight: '600', color: node.accentColor },
				endHourText: { fontSize: '12px', fontWeight: '600', color: node.accentColorSecondary },
				timeZoneText: { fontSize: '12px', fontWeight: '600', color: node.accentColorSecondary },
				submitEntryLabel: { fontSize: '13px', fontWeight: '600', color: '#ffffff' },
				registerLabel: { fontSize: '13px', fontWeight: '600', color: '#334155' },
			}
	}
}

/* -------------------------------------------------------------------- */
/* Tiny static previews — one per uiType, matching the real variant's    */
/* visual character (see EventWidgetsGroupTemplateVisual.tsx) so users   */
/* can tell them apart at a glance in the UiTypeSelector grid.            */
/* -------------------------------------------------------------------- */

function ClassicRowPreview() {
	return (
		<div className="flex items-center justify-between gap-2 w-[150px] h-[100px] px-2.5 relative overflow-hidden" style={{ backgroundColor: '#fff', border: '1px solid #eef0f4', borderRadius: 10, boxShadow: '0 3px 10px -4px rgba(15,23,42,0.18)' }}>
			<div className="absolute left-0 top-0 bottom-0" style={{ width: 3, background: 'linear-gradient(180deg, #4f46e5, #0ea5e9)' }} />
			<div className="flex flex-col gap-1 pl-1.5">
				<span style={{ fontSize: 9, fontWeight: 700, color: '#0f172a' }}>Event Details</span>
				<span style={{ fontSize: 6.5, fontWeight: 600, color: '#4338ca', backgroundColor: '#eef2ff', borderRadius: 999, padding: '1.5px 6px', width: 'fit-content' }}>Dec 31</span>
			</div>
			<span style={{ fontSize: 7, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #4f46e5, #4338ca)', borderRadius: 5, padding: '4px 8px' }}>Submit</span>
		</div>
	)
}

function CountdownCardPreview() {
	return (
		<div className="flex flex-col items-center justify-center gap-1.5 w-[150px] h-[100px]" style={{ backgroundColor: '#fff', border: '2px solid #1d4ed8', borderRadius: 10 }}>
			<span style={{ fontSize: 7, fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.08em' }}>EVENT</span>
			<div className="flex gap-1.5">
				<div style={{ backgroundColor: '#1d4ed8', color: '#fff', borderRadius: 5, padding: '4px 8px', fontSize: 8, fontWeight: 800 }}>31</div>
				<div style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 5, padding: '4px 8px', fontSize: 8, fontWeight: 800 }}>11PM</div>
			</div>
			<span style={{ fontSize: 7, fontWeight: 700, color: '#fff', backgroundColor: '#1d4ed8', borderRadius: 999, padding: '3px 10px' }}>Submit</span>
		</div>
	)
}

function StackedCenteredPreview() {
	return (
		<div className="flex flex-col items-center justify-center gap-1 w-[150px] h-[100px]" style={{ background: 'radial-gradient(120% 100% at 50% 0%, #f5f3ff 0%, #ffffff 60%)', border: '1px solid #f1f0f5', borderRadius: 10 }}>
			<span style={{ fontSize: 6, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7c3aed' }}>Event</span>
			<span style={{ fontSize: 9, fontWeight: 800, color: '#18181b' }}>Details</span>
			<span style={{ fontSize: 6.5, color: '#52525b' }}>Dec 31 &middot; 11PM</span>
			<span style={{ fontSize: 7, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', borderRadius: 999, padding: '3px 12px', marginTop: 3 }}>Submit</span>
		</div>
	)
}

function SplitPanelPreview() {
	return (
		<div className="flex w-[150px] h-[100px] overflow-hidden" style={{ borderRadius: 6, border: '1px solid #e5e7eb' }}>
			<div className="flex-1 flex flex-col justify-center gap-1 px-2" style={{ backgroundColor: '#111827' }}>
				<span style={{ fontSize: 7, fontWeight: 700, color: '#fff' }}>Event</span>
				<span style={{ fontSize: 6, color: '#d1d5db' }}>Dec 31</span>
			</div>
			<div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
				<span style={{ fontSize: 7, fontWeight: 700, color: '#fff', backgroundColor: '#111827', borderRadius: 4, padding: '3px 8px' }}>Submit</span>
			</div>
		</div>
	)
}

function MinimalInlinePreview() {
	return (
		<div className="flex flex-col justify-center gap-1 w-[150px] h-[100px] px-2" style={{ borderTop: '1px solid #f1f1f4', borderBottom: '1px solid #f1f1f4' }}>
			<div className="flex items-center gap-1.5">
				<span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
				<span style={{ fontSize: 8, fontWeight: 700, color: '#0f172a' }}>Event Details</span>
			</div>
			<span style={{ fontSize: 6.5, color: '#94a3b8' }}>Dec 31 &middot; 11PM (UTC)</span>
			<span style={{ fontSize: 7, color: '#0f172a', fontWeight: 700, borderBottom: '2px solid #10b981', width: 'fit-content' }}>Submit</span>
		</div>
	)
}

function BannerCtaPreview() {
	return (
		<div className="flex items-center justify-between gap-2 w-[150px] h-[100px] px-2" style={{ background: 'linear-gradient(90deg, #f97316 0%, #db2777 100%)', borderRadius: 8 }}>
			<span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>Event Details</span>
			<span style={{ fontSize: 7, fontWeight: 800, color: '#db2777', backgroundColor: '#fff', borderRadius: 999, padding: '3px 8px' }}>Submit</span>
		</div>
	)
}

function DarkGlassPreview() {
	return (
		<div className="flex flex-col justify-center gap-1.5 w-[150px] h-[100px] px-2.5" style={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(148,163,184,0.35)', borderRadius: 8 }}>
			<span style={{ fontSize: 8.5, fontWeight: 700, color: '#f8fafc' }}>Event Details</span>
			<span style={{ fontSize: 6.5, color: '#94a3b8', border: '1px solid rgba(148,163,184,0.4)', borderRadius: 999, padding: '2px 8px', width: 'fit-content' }}>Dec 31</span>
			<span style={{ fontSize: 7, fontWeight: 800, color: '#0f172a', backgroundColor: '#38bdf8', borderRadius: 5, padding: '3px 8px', width: 'fit-content' }}>Submit</span>
		</div>
	)
}

function TwoColumnCardPreview() {
	return (
		<div className="flex w-[150px] h-[100px] overflow-hidden" style={{ backgroundColor: '#fff', border: '1px solid #ececef', borderRadius: 10, boxShadow: '0 4px 14px -8px rgba(24,24,27,0.3)' }}>
			<div className="flex flex-col justify-center gap-1 px-2" style={{ flex: 1 }}>
				<span style={{ fontSize: 8, fontWeight: 700, color: '#18181b' }}>Event Details</span>
				<span style={{ fontSize: 6, color: '#52525b' }}>&bull; Dec 31</span>
				<span style={{ fontSize: 6, color: '#52525b' }}>&bull; 11PM</span>
			</div>
			<div className="flex items-center justify-center px-2" style={{ backgroundColor: '#faf9ff', borderLeft: '1.5px dashed #ddd6fe' }}>
				<span style={{ fontSize: 7, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', borderRadius: 5, padding: '4px 7px' }}>Submit</span>
			</div>
		</div>
	)
}

function EventWidgetsGroupTemplatePanel() {
	const canvas = useEditor()
	const node = canvas?.focusedNode as EventWidgetsGroupTemplateNode
	const { t } = useTranslation('propertyPanel')

	const uiTypeOptions = [
		{ value: 'classicRow', label: t('eventWidgetsGroupTemplatePanel.uiType.classicRow'), Preview: ClassicRowPreview },
		{ value: 'countdownCard', label: t('eventWidgetsGroupTemplatePanel.uiType.countdownCard'), Preview: CountdownCardPreview },
		{ value: 'stackedCentered', label: t('eventWidgetsGroupTemplatePanel.uiType.stackedCentered'), Preview: StackedCenteredPreview },
		{ value: 'splitPanel', label: t('eventWidgetsGroupTemplatePanel.uiType.splitPanel'), Preview: SplitPanelPreview },
		{ value: 'minimalInline', label: t('eventWidgetsGroupTemplatePanel.uiType.minimalInline'), Preview: MinimalInlinePreview },
		{ value: 'bannerCta', label: t('eventWidgetsGroupTemplatePanel.uiType.bannerCta'), Preview: BannerCtaPreview },
		{ value: 'darkGlass', label: t('eventWidgetsGroupTemplatePanel.uiType.darkGlass'), Preview: DarkGlassPreview },
		{ value: 'twoColumnCard', label: t('eventWidgetsGroupTemplatePanel.uiType.twoColumnCard'), Preview: TwoColumnCardPreview },
	]

	// Writes a field through to its slot node, keeping the flat field.
	function updateSlotText(field: 'heading' | 'submitEntryLabel' | 'registerLabel', slot: EventWidgetsSlot, value: string) {
		canvas.updateNode((prevNode) => {
			const n = prevNode as EventWidgetsGroupTemplateNode
			return {
				...n,
				[field]: value,
				...(n.children ? { children: setEventWidgetsSlotText(n.children, slot, value) } : {}),
			}
		})
	}

	if (node)
		return (
			<div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

				<SectionContainer label={t('eventWidgetsGroupTemplatePanel.layout')}>
					<UiTypeSelector
						options={uiTypeOptions}
						value={node.uiType}
						onChange={(v) => canvas.updateNode((prevNode) => {
							const n = prevNode as EventWidgetsGroupTemplateNode
							const uiType = v as EventWidgetsGroupTemplateNode['uiType']
							return {
								...n,
								uiType,
								...(n.children ? { children: restyleEventWidgetsChildren(n.children, uiType, n.accentColor, n.accentColorSecondary) } : {}),
							}
						})}
					/>
				</SectionContainer>

				<FoldList label={t('eventWidgetsGroupTemplatePanel.details')}>
					<SectionContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('eventWidgetsGroupTemplatePanel.heading')}>
							<TextInput
								size='sm'
								value={node.heading}
								onChange={(e) => updateSlotText('heading', 'heading', e.target.value)}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('eventWidgetsGroupTemplatePanel.endDateText')}>
							<TextInput
							isDisabled
								size='sm'
								value={node.endDateText}
								// onChange={(e) => canvas.updateNode((prevNode) => ({
								// 	...prevNode as EventWidgetsGroupTemplateNode,
								// 	endDateText: e.target.value,
								// }))}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('eventWidgetsGroupTemplatePanel.endHourText')}>
							<TextInput
							isDisabled
								size='sm'
								value={node.endHourText}
								// onChange={(e) => canvas.updateNode((prevNode) => ({
								// 	...prevNode as EventWidgetsGroupTemplateNode,
								// 	endHourText: e.target.value,
								// }))}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('eventWidgetsGroupTemplatePanel.timeZoneText')}>
							<TextInput
							isDisabled
								size='sm'
								value={node.timeZoneText}
								// onChange={(e) => canvas.updateNode((prevNode) => ({
								// 	...prevNode as EventWidgetsGroupTemplateNode,
								// 	timeZoneText: e.target.value,
								// }))}
							/>
						</PanelRowContainer>
					</SectionContainer>

					<SectionContainer label={t('eventWidgetsGroupTemplatePanel.submitEntryAction')}>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('eventWidgetsGroupTemplatePanel.submitEntryLabel')}>
							<TextInput
								size='sm'
								value={node.submitEntryLabel}
								onChange={(e) => updateSlotText('submitEntryLabel', 'submitEntry', e.target.value)}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('eventWidgetsGroupTemplatePanel.submitEntryHref')}>
							<TextInput
							isDisabled
								size='sm'
								value={node.submitEntryHref}
								// onChange={(e) => canvas.updateNode((prevNode) => ({
								// 	...prevNode as EventWidgetsGroupTemplateNode,
								// 	submitEntryHref: e.target.value,
								// }))}
							/>
						</PanelRowContainer>
					</SectionContainer>

					<SectionContainer label={t('eventWidgetsGroupTemplatePanel.registerAction')}>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('eventWidgetsGroupTemplatePanel.registerLabel')}>
							<TextInput
								size='sm'
								value={node.registerLabel}
								onChange={(e) => updateSlotText('registerLabel', 'register', e.target.value)}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('eventWidgetsGroupTemplatePanel.registerHref')}>
							<TextInput
							isDisabled
								size='sm'
								value={node.registerHref}
								// onChange={(e) => canvas.updateNode((prevNode) => ({
								// 	...prevNode as EventWidgetsGroupTemplateNode,
								// 	registerHref: e.target.value,
								// }))}
							/>
						</PanelRowContainer>
					</SectionContainer>
				</FoldList>

				<FoldList label={t('eventWidgetsGroupTemplatePanel.typography')}>
					<TypographyMapControl
						field="heading"
						label={t('eventWidgetsGroupTemplatePanel.heading')}
						defaultValue={getEventWidgetsTypographyDefaults(node).heading}
					/>
					<TypographyMapControl
						field="endDateText"
						label={t('eventWidgetsGroupTemplatePanel.endDateText')}
						defaultValue={getEventWidgetsTypographyDefaults(node).endDateText}
					/>
					<TypographyMapControl
						field="endHourText"
						label={t('eventWidgetsGroupTemplatePanel.endHourText')}
						defaultValue={getEventWidgetsTypographyDefaults(node).endHourText}
					/>
					<TypographyMapControl
						field="timeZoneText"
						label={t('eventWidgetsGroupTemplatePanel.timeZoneText')}
						defaultValue={getEventWidgetsTypographyDefaults(node).timeZoneText}
					/>
					<TypographyMapControl
						field="submitEntryLabel"
						label={t('eventWidgetsGroupTemplatePanel.submitEntryLabel')}
						defaultValue={getEventWidgetsTypographyDefaults(node).submitEntryLabel}
					/>
					<TypographyMapControl
						field="registerLabel"
						label={t('eventWidgetsGroupTemplatePanel.registerLabel')}
						defaultValue={getEventWidgetsTypographyDefaults(node).registerLabel}
					/>
					<LineClampControl field="heading" label={t('eventWidgetsGroupTemplatePanel.heading')} />
					<LineClampControl field="endDateText" label={t('eventWidgetsGroupTemplatePanel.endDateText')} />
					<LineClampControl field="endHourText" label={t('eventWidgetsGroupTemplatePanel.endHourText')} />
					<LineClampControl field="timeZoneText" label={t('eventWidgetsGroupTemplatePanel.timeZoneText')} />
					<LineClampControl field="submitEntryLabel" label={t('eventWidgetsGroupTemplatePanel.submitEntryLabel')} />
					<LineClampControl field="registerLabel" label={t('eventWidgetsGroupTemplatePanel.registerLabel')} />
				</FoldList>

				<FoldList label={t('eventWidgetsGroupTemplatePanel.colors')}>
					<SectionContainer hintKey="colorPair">
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('eventWidgetsGroupTemplatePanel.accentColor')}>
							<ColorPicker
								value={node.accentColor || '#4f46e5'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as EventWidgetsGroupTemplateNode,
									accentColor: v,
								}))}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('eventWidgetsGroupTemplatePanel.accentColorSecondary')}>
							<ColorPicker
								value={node.accentColorSecondary || '#0ea5e9'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as EventWidgetsGroupTemplateNode,
									accentColorSecondary: v,
								}))}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('eventWidgetsGroupTemplatePanel.backgroundColor')}>
							<ColorPicker
								value={(node.style?.backgroundColor as string) || '#ffffff'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as EventWidgetsGroupTemplateNode,
									style: { ...(prevNode as EventWidgetsGroupTemplateNode).style, backgroundColor: v },
								}))}
							/>
						</PanelRowContainer>
					</SectionContainer>
				</FoldList>

				<PaddingController />

				<BorderRadiusController />

				<BoxShadowController />

				<Attributes />
			</div>
		)
}

export default withTemplateTabs(EventWidgetsGroupTemplatePanel)
