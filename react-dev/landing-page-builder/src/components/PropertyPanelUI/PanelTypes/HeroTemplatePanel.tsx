import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { HeroTemplateNode, HeroUiType } from '@/types/node.type'
import { TextInput } from '@/components/ui/primitives/text-input'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { PaddingController } from '../Sections/relatedComponents/PaddingController'
import { BorderRadiusController } from '../Sections/relatedComponents/BorderRadiusController'
import { BoxShadowController } from '../Sections/relatedComponents/Controllers'
import { useTranslation } from 'react-i18next'
import { UiTypeSelector, UiTypeOption } from '@/components/PropertyPanelUI/UiTypeSelector'
import ColorPicker from '@/components/ui/ColorPicker'
import TemplateImageField from '../Sections/relatedComponents/TemplateImageField'
import { LineClampControl } from '../Sections/relatedComponents/LineClampControl'
import { TypographyMapControl } from '../Sections/relatedComponents/TypographyControl'
import FoldList from '@/components/ui/FoldList'

import { HERO_SLOT_STYLES, recolorHeroCta, restyleHeroChildren, setHeroSlotText } from '@/utils/readyMadeTemplates'
import withTemplateTabs from './withTemplateTabs'
import { heroBackground } from '@/utils/heroDefaults'

// Variants whose composition has no image slot at all (a plain heading+CTA
// card, by design) — the image upload field shows an explanatory message
// instead of a dead drop zone for these. Keep in sync with
// HeroTemplateVisual.tsx's variant compositions.
const HERO_UI_TYPES_WITHOUT_IMAGE = new Set<HeroUiType>(['centeredClassic', 'minimalLeft', 'stackedCta'])

// What the typography controls show before the user edits anything: the slot styles each variant seeds, so the
// panel can't drift from HERO_SLOT_STYLES.
const HERO_TYPOGRAPHY_DEFAULTS = Object.fromEntries(
	Object.entries(HERO_SLOT_STYLES).map(([uiType, slots]) => [uiType, { heading: slots.heading, subheading: slots.subheading }]),
) as Record<HeroUiType, { heading: React.CSSProperties; subheading: React.CSSProperties }>

// ---- Tiny static previews (~150x100), one per uiType, mirroring the real
// HeroTemplateVisual composition at a glance. Hardcoded sample content —
// these never touch live node data. ----

function CenteredClassicPreview() {
	return (
		<div className="w-[150px] h-[100px] flex items-center justify-center" style={{ backgroundColor: '#fbf7f0' }}>
			<div className="flex flex-col items-center justify-center gap-1.5 w-[124px] h-[78px]" style={{ border: '1px solid #7c3aed44', outline: '1px solid #7c3aed22', outlineOffset: 2, backgroundColor: '#fffdf9' }}>
				<div className="flex items-center gap-1"><span className="w-[16px] h-px bg-purple-300" /><span className="w-[4px] h-[4px] rotate-45 bg-purple-600" /><span className="w-[16px] h-px bg-purple-300" /></div>
				<div className="w-[74px] h-[7px] rounded-sm" style={{ backgroundColor: '#2b1b3d' }} />
				<div className="w-[52px] h-[3px] rounded-sm bg-gray-400" />
				<div className="rounded-full px-2.5 py-[3px]" style={{ backgroundColor: '#7c3aed' }}><span className="text-[5px] font-bold text-white uppercase tracking-widest">Go</span></div>
			</div>
		</div>
	)
}

function SplitImagePreview() {
	return (
		<div className="w-[150px] h-[100px] flex items-center gap-2 px-3" style={{ backgroundColor: '#fff8f1' }}>
			<div className="flex flex-col gap-1.5 flex-1">
				<div className="w-[22px] h-[2px]" style={{ backgroundColor: '#7c3aed' }} />
				<div className="w-[58px] h-[7px] rounded-sm" style={{ backgroundColor: '#1c1917' }} />
				<div className="w-[46px] h-[3px] rounded-sm bg-stone-400" />
				<div className="w-[30px] h-[8px]" style={{ backgroundColor: '#7c3aed' }} />
			</div>
			<div className="relative w-[46px] h-[62px]">
				<div className="absolute inset-0" style={{ borderRadius: '999px 999px 0 0', backgroundColor: '#7c3aed33', transform: 'translate(4px, 4px)' }} />
				<div className="absolute inset-0" style={{ borderRadius: '999px 999px 0 0', background: 'linear-gradient(145deg, #c4b5fd, #93c5fd)' }} />
			</div>
		</div>
	)
}

function GradientBoldPreview() {
	return (
		<div className="w-[150px] h-[100px] relative overflow-hidden flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
			<div className="absolute rounded-full" style={{ width: 70, height: 70, top: -26, right: -14, backgroundColor: 'rgba(255,255,255,0.14)' }} />
			<div className="absolute rounded-full" style={{ width: 40, height: 40, top: 18, right: 34, border: '1.5px solid rgba(255,255,255,0.4)' }} />
			<div className="relative flex flex-col gap-1.5 px-3 pt-4">
				<div className="w-[84px] h-[10px] rounded-sm bg-white" />
				<div className="w-[58px] h-[4px] rounded-sm bg-white/70" />
				<div className="rounded-full px-2.5 py-[3px] bg-white w-fit mt-0.5"><span className="text-[5px] font-extrabold" style={{ color: '#7c3aed' }}>Go</span></div>
			</div>
			<div className="relative -mx-2 mb-1.5 py-[3px] text-[4px] font-extrabold text-white uppercase whitespace-nowrap overflow-hidden" style={{ backgroundColor: 'rgba(17,24,39,0.82)', letterSpacing: '0.2em', transform: 'rotate(-2deg)' }}>Go ✦ Go ✦ Go ✦ Go ✦ Go ✦ Go ✦ Go ✦ Go</div>
		</div>
	)
}

function MinimalLeftPreview() {
	return (
		<div className="w-[150px] h-[100px] relative overflow-hidden flex flex-col items-start justify-center gap-1.5 px-4" style={{ backgroundColor: '#f5f4ef' }}>
			<div className="absolute rounded-full" style={{ width: 54, height: 54, top: -18, right: -14, backgroundColor: '#7c3aed' }} />
			<div className="relative flex items-center gap-1.5 w-full"><span className="w-[6px] h-[6px]" style={{ backgroundColor: '#7c3aed' }} /><span className="flex-1 h-[2px] bg-zinc-900" /></div>
			<div className="relative w-[92px] h-[10px] rounded-sm bg-zinc-900" />
			<div className="relative w-[60px] h-[3px] rounded-sm bg-zinc-400" />
			<div className="relative text-[5px] font-bold text-zinc-900 border-b-2 border-zinc-900 uppercase tracking-widest">Go</div>
		</div>
	)
}

function DarkOverlayPreview() {
	return (
		<div className="w-[150px] h-[100px] flex flex-col justify-end relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #4c1d95, #0c0a12 70%)' }}>
			<div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,6,14,0.92) 8%, rgba(8,6,14,0.3) 60%)' }} />
			<div className="absolute inset-x-3 top-3 h-px bg-white/30" />
			<div className="relative flex items-end justify-between gap-2 px-3 pb-2.5">
				<div className="flex flex-col gap-1">
					<div className="w-[34px] h-[2px] bg-white/60" />
					<div className="w-[70px] h-[8px] rounded-sm bg-white" />
				</div>
				<div className="border border-white/80 px-2 py-[3px] shrink-0"><span className="text-[5px] font-bold text-white uppercase tracking-widest">Go</span></div>
			</div>
		</div>
	)
}

function StackedCtaPreview() {
	return (
		<div className="w-[150px] h-[100px] flex items-center justify-center p-2" style={{ background: 'linear-gradient(160deg, #eef0f6, #7c3aed22)' }}>
			<div className="relative w-full h-[64px] flex overflow-hidden rounded-md bg-white" style={{ boxShadow: '0 8px 14px -8px rgba(17,24,39,0.45)' }}>
				<div className="flex-1 flex flex-col justify-center gap-1 px-2.5">
					<div className="w-[20px] h-[2px]" style={{ backgroundColor: '#7c3aed' }} />
					<div className="w-[58px] h-[6px] rounded-sm bg-gray-800" />
					<div className="w-[44px] h-[3px] rounded-sm bg-gray-400" />
				</div>
				<div className="relative w-[38px] flex items-center justify-center" style={{ backgroundColor: '#7c3aed', borderLeft: '1.5px dashed rgba(255,255,255,0.6)' }}>
					<span className="absolute rounded-full" style={{ width: 8, height: 8, top: -4, left: -5, backgroundColor: '#e9ebf5' }} />
					<span className="absolute rounded-full" style={{ width: 8, height: 8, bottom: -4, left: -5, backgroundColor: '#e9ebf5' }} />
					<span className="text-[5px] font-extrabold text-white uppercase">Go</span>
				</div>
			</div>
		</div>
	)
}

function SideBySideStatsPreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex items-center gap-2 px-3">
			<div className="flex flex-col gap-1.5 flex-1">
				<div className="w-[54px] h-[7px] rounded-sm bg-gray-800" />
				<div className="w-[44px] h-[3px] rounded-sm bg-gray-400" />
				<div className="w-[28px] h-[8px] rounded-md mt-0.5" style={{ backgroundColor: '#7c3aed' }} />
			</div>
			<div className="grid gap-1" style={{ width: 62, gridTemplateColumns: '1fr 1fr', gridTemplateRows: '22px 22px 14px' }}>
				<div style={{ gridRow: 'span 2', borderRadius: '999px 999px 4px 4px', background: 'linear-gradient(145deg, #c4b5fd, #93c5fd)' }} />
				<div className="rounded" style={{ background: 'linear-gradient(145deg, #fbcfe8, #c4b5fd)' }} />
				<div className="rounded" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }} />
				<div className="rounded" style={{ gridColumn: 'span 2', background: 'linear-gradient(145deg, #bfdbfe, #ddd6fe)' }} />
			</div>
		</div>
	)
}

function GlowScreenshotPreview() {
	return (
		<div className="w-[150px] h-[100px] flex flex-col items-center relative overflow-hidden" style={{ backgroundColor: '#0b1020' }}>
			<div className="absolute rounded-full" style={{ width: 70, height: 46, top: -16, left: 6, background: 'radial-gradient(closest-side, rgba(124,58,237,0.7), transparent)' }} />
			<div className="absolute rounded-full" style={{ width: 70, height: 46, top: -12, right: 6, background: 'radial-gradient(closest-side, rgba(37,99,235,0.6), transparent)' }} />
			<div className="relative flex flex-col items-center gap-1 pt-3">
				<div className="w-[72px] h-[6px] rounded-sm bg-white" />
				<div className="w-[48px] h-[3px] rounded-sm bg-white/60" />
				<div className="rounded-full px-2.5 py-[3px] mt-0.5" style={{ backgroundColor: '#7c3aed', boxShadow: '0 0 10px 1px rgba(124,58,237,0.7)' }}><span className="text-[5px] font-bold text-white">Go</span></div>
			</div>
			<div className="absolute" style={{ width: 52, height: 30, bottom: 0, borderRadius: '999px 999px 0 0', border: '1px solid rgba(255,255,255,0.25)', background: 'linear-gradient(160deg, #a78bfa, #3b82f6)', boxShadow: '0 0 16px 2px rgba(124,58,237,0.5)' }} />
		</div>
	)
}

function DarkBlurBackdropPreview() {
	return (
		<div className="w-[150px] h-[100px] flex flex-col justify-end relative overflow-hidden" style={{ backgroundColor: '#07070a' }}>
			<div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
			<div className="absolute" style={{ top: -6, left: 14, width: 44, height: 80, transform: 'rotate(-14deg)', transformOrigin: 'top center', background: 'linear-gradient(to bottom, rgba(236,72,153,0.6), transparent 85%)', clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)' }} />
			<div className="absolute" style={{ top: -6, left: 78, width: 44, height: 80, transform: 'rotate(16deg)', transformOrigin: 'top center', background: 'linear-gradient(to bottom, rgba(45,212,191,0.5), transparent 85%)', clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)' }} />
			<div className="relative flex items-end justify-between gap-1.5 px-2.5 pb-2.5">
				<div className="flex flex-col gap-1"><div className="w-[62px] h-[8px] rounded-sm bg-white" /><div className="w-[44px] h-[3px] rounded-sm bg-white/50" /></div>
				<div className="bg-white px-2 py-[3px]"><span className="text-[5px] font-extrabold text-black uppercase tracking-widest">Go</span></div>
			</div>
		</div>
	)
}

function CinematicBlobPreview() {
	return (
		<div className="w-[150px] h-[100px] flex flex-col justify-center gap-1.5 px-3 relative overflow-hidden" style={{ backgroundColor: '#06120c' }}>
			<div className="absolute rounded-full" style={{ width: 90, height: 90, bottom: -40, right: -20, background: 'radial-gradient(circle, rgba(163,230,53,0.55), rgba(163,230,53,0) 70%)' }} />
			<div className="absolute rounded-full" style={{ width: 60, height: 60, top: -26, right: 14, border: '1px solid rgba(244,244,230,0.18)' }} />
			<span className="relative flex items-center gap-1"><i className="w-[10px] h-px" style={{ backgroundColor: '#a3e635' }} /><span className="text-[4px] font-bold uppercase text-white/80" style={{ letterSpacing: '0.2em' }}>Label</span></span>
			<span className="relative text-[12px] font-bold leading-none" style={{ color: '#f4f4e6', fontFamily: 'Georgia, serif' }}>Build the <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#a3e635' }}>future</em></span>
			<span className="relative text-[5px] font-bold uppercase text-[#f4f4e6] border-b border-[#f4f4e680] w-fit tracking-widest">Go</span>
		</div>
	)
}

function PhotoBadgesPreview() {
	return (
		<div className="w-[150px] h-[100px] flex items-center gap-2 px-2.5" style={{ backgroundColor: '#fff7ed' }}>
			<div className="flex flex-col gap-1 flex-1">
				<div className="w-[48px] h-[6px] rounded-sm" style={{ backgroundColor: '#3b2314' }} />
				<div className="w-[38px] h-[3px] rounded-sm bg-stone-400" />
				<div className="rounded-full px-2 py-[3px] w-fit mt-0.5" style={{ backgroundColor: '#7c3aed' }}><span className="text-[5px] font-bold text-white">Go</span></div>
			</div>
			<div className="relative flex items-center justify-center" style={{ width: 62, height: 62 }}>
				<div className="absolute inset-0 rounded-full" style={{ border: '1.5px dashed #7c3aed66' }} />
				<div style={{ width: 44, height: 44, background: 'linear-gradient(145deg, #c4b5fd, #93c5fd)', borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%' }} />
				<span className="absolute rounded-full" style={{ width: 13, height: 13, top: 0, right: 6, backgroundColor: '#7c3aed' }} />
				<span className="absolute rounded-full bg-white" style={{ width: 11, height: 11, bottom: 2, left: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
			</div>
		</div>
	)
}

function DarkImageOrbPreview() {
	return (
		<div className="w-[150px] h-[100px] flex flex-col items-center justify-center gap-1 relative overflow-hidden" style={{ background: 'radial-gradient(120% 80% at 50% 100%, #2a1550, #0b0713 60%)' }}>
			<div className="w-[58px] h-[5px] rounded-sm bg-white" />
			<div className="w-[40px] h-[3px] rounded-sm bg-white/50" />
			<div className="relative flex items-center justify-center" style={{ width: 54, height: 54 }}>
				<div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.14)' }} />
				<div className="absolute rounded-full" style={{ inset: 7, border: '1px solid rgba(255,255,255,0.1)' }} />
				<span className="absolute rounded-full" style={{ width: 4, height: 4, top: 6, left: 4, backgroundColor: '#7c3aed', boxShadow: '0 0 5px 1px #7c3aed' }} />
				<div className="rounded-full" style={{ width: 26, height: 26, background: 'linear-gradient(145deg, #a78bfa, #3b82f6)', boxShadow: '0 0 14px 3px rgba(124,58,237,0.6)' }} />
			</div>
		</div>
	)
}

function DiagonalPhotoPreview() {
	return (
		<div className="w-[150px] h-[100px] relative overflow-hidden flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #52525b, #18181b)' }}>
			<div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, rgba(0,0,0,0.8) 35%, rgba(0,0,0,0.15) 75%)' }} />
			<div className="absolute inset-y-0" style={{ width: '20%', right: 0, background: 'linear-gradient(180deg, #7c3aed, #2563eb)', clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 0% 100%)' }} />
			<div className="relative flex flex-col gap-1 px-2.5 pt-4">
				<div className="w-[78px] h-[10px] rounded-sm bg-white" />
				<div className="w-[48px] h-[3px] rounded-sm bg-white/70" />
				<div className="rounded-full bg-white px-2 py-[3px] w-fit mt-0.5"><span className="text-[5px] font-extrabold text-black uppercase">Go</span></div>
			</div>
			<div className="relative -mx-2 mb-1.5 py-[3px] text-[4px] font-extrabold text-white uppercase whitespace-nowrap overflow-hidden" style={{ background: 'linear-gradient(90deg, #7c3aed, #2563eb)', letterSpacing: '0.2em', transform: 'rotate(-3deg)' }}>Go ✦ Go ✦ Go ✦ Go ✦ Go ✦ Go ✦ Go ✦ Go</div>
		</div>
	)
}

function CredentialBadgePreview() {
	return (
		<div className="w-[150px] h-[100px] flex items-center justify-center" style={{ backgroundColor: '#DDE7E3' }}>
			<div className="relative flex flex-col items-center gap-1 py-3 px-4" style={{ width: 100, borderRadius: 10, backgroundColor: '#EAF2EE', border: '1px solid #1B1D221a' }}>
				<div className="absolute rounded-full" style={{ top: 4, width: 8, height: 8, backgroundColor: '#DDE7E3', boxShadow: 'inset 0 0 0 1px #1B1D2233' }} />
				<div className="w-[52px] h-[6px] rounded mt-2" style={{ backgroundColor: '#1B1D22' }} />
				<div className="w-[36px] h-[4px] rounded" style={{ backgroundColor: '#2563eb' }} />
				<div className="w-full h-[10px] mt-1" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #1B1D22 0 2px, transparent 2px 4px, #1B1D22 4px 5px, transparent 5px 8px)', opacity: 0.7 }} />
				<div className="w-full h-[10px] mt-1 rounded-b" style={{ backgroundColor: '#2563eb' }} />
			</div>
		</div>
	)
}

const UI_TYPE_OPTIONS: (t: (key: string) => string) => UiTypeOption[] = (t) => [
	{ value: 'centeredClassic', label: t('heroTemplatePanel.uiType.centeredClassic'), Preview: CenteredClassicPreview },
	{ value: 'splitImage', label: t('heroTemplatePanel.uiType.splitImage'), Preview: SplitImagePreview },
	{ value: 'gradientBold', label: t('heroTemplatePanel.uiType.gradientBold'), Preview: GradientBoldPreview },
	{ value: 'minimalLeft', label: t('heroTemplatePanel.uiType.minimalLeft'), Preview: MinimalLeftPreview },
	{ value: 'darkOverlay', label: t('heroTemplatePanel.uiType.darkOverlay'), Preview: DarkOverlayPreview },
	{ value: 'stackedCta', label: t('heroTemplatePanel.uiType.stackedCta'), Preview: StackedCtaPreview },
	{ value: 'sideBySideStats', label: t('heroTemplatePanel.uiType.sideBySideStats'), Preview: SideBySideStatsPreview },
	{ value: 'glowScreenshot', label: t('heroTemplatePanel.uiType.glowScreenshot'), Preview: GlowScreenshotPreview },
	{ value: 'darkBlurBackdrop', label: t('heroTemplatePanel.uiType.darkBlurBackdrop'), Preview: DarkBlurBackdropPreview },
	{ value: 'cinematicBlob', label: t('heroTemplatePanel.uiType.cinematicBlob'), Preview: CinematicBlobPreview },
	{ value: 'photoBadges', label: t('heroTemplatePanel.uiType.photoBadges'), Preview: PhotoBadgesPreview },
	{ value: 'darkImageOrb', label: t('heroTemplatePanel.uiType.darkImageOrb'), Preview: DarkImageOrbPreview },
	{ value: 'diagonalPhoto', label: t('heroTemplatePanel.uiType.diagonalPhoto'), Preview: DiagonalPhotoPreview },
	{ value: 'credentialBadge', label: t('heroTemplatePanel.uiType.credentialBadge'), Preview: CredentialBadgePreview },
]

function HeroTemplatePanel() {
	const canvas = useEditor()
	const node = canvas?.focusedNode as HeroTemplateNode
	const { t } = useTranslation('propertyPanel')

	if (node)
		return (
			<div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

				<SectionContainer label={t('heroTemplatePanel.uiTypeLabel')}>
					<UiTypeSelector
						options={UI_TYPE_OPTIONS(t)}
						value={node.uiType}
						onChange={(v) => canvas.updateNode((prevNode) => {
							const prev = prevNode as HeroTemplateNode
							const uiType = v as HeroUiType
							// Each variant paints its slots differently (light text on
							// dark variants, etc.), so the child tree has to be re-skinned
							// to match. restyleHeroChildren only touches the style keys
							// the variant owns and leaves the user's text/edits alone.
							// Legacy Heros have no children — nothing to restyle.
							return {
								...prev,
								uiType,
								...(prev.children ? { children: restyleHeroChildren(prev.children, uiType, prev.accentColor) } : {}),
							}
						})}
					/>
				</SectionContainer>

				<FoldList label={t('heroTemplatePanel.content')}>
					<SectionContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('heroTemplatePanel.heading')}>
							<TextInput
								size='sm'
								value={node.heading}
								onChange={(e) => canvas.updateNode((prevNode) => {
									const prev = prevNode as HeroTemplateNode
									// This slot is a real child node now, so the field has to
									// write through to it; the flat value is kept in step as
									// the seed/fallback the legacy render path still uses.
									return {
										...prev,
										heading: e.target.value,
										...(prev.children ? { children: setHeroSlotText(prev.children, 'heading', e.target.value) } : {}),
									}
								})}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('heroTemplatePanel.subheading')}>
							<TextInput
								size='sm'
								value={node.subheading}
								onChange={(e) => canvas.updateNode((prevNode) => {
									const prev = prevNode as HeroTemplateNode
									// This slot is a real child node now, so the field has to
									// write through to it; the flat value is kept in step as
									// the seed/fallback the legacy render path still uses.
									return {
										...prev,
										subheading: e.target.value,
										...(prev.children ? { children: setHeroSlotText(prev.children, 'subheading', e.target.value) } : {}),
									}
								})}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('heroTemplatePanel.imageUrl')}>
							<TemplateImageField
								value={node.imageUrl}
								unsupportedForVariant={HERO_UI_TYPES_WITHOUT_IMAGE.has(node.uiType)}
								onChange={(url) => canvas.updateNode((prevNode) => ({
									...prevNode as HeroTemplateNode,
									imageUrl: url,
								}))}
							/>
							<TextInput
								className=' mt-2 '
								size='sm'
								value={node.imageUrl ?? ''}
								placeholder={t('heroTemplatePanel.imageUrlPlaceholder')}
								onChange={(e) => canvas.updateNode((prevNode) => ({
									...prevNode as HeroTemplateNode,
									imageUrl: e.target.value,
								}))}
							/>
						</PanelRowContainer>
					</SectionContainer>

					<SectionContainer label={t('heroTemplatePanel.cta')}>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('heroTemplatePanel.ctaLabel')}>
							<TextInput
								size='sm'
								value={node.ctaLabel}
								onChange={(e) => canvas.updateNode((prevNode) => {
									const prev = prevNode as HeroTemplateNode
									// This slot is a real child node now, so the field has to
									// write through to it; the flat value is kept in step as
									// the seed/fallback the legacy render path still uses.
									return {
										...prev,
										ctaLabel: e.target.value,
										...(prev.children ? { children: setHeroSlotText(prev.children, 'cta', e.target.value) } : {}),
									}
								})}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('heroTemplatePanel.ctaHref')}>
							<TextInput
								size='sm'
								value={node.ctaHref}
								onChange={(e) => canvas.updateNode((prevNode) => ({
									...prevNode as HeroTemplateNode,
									ctaHref: e.target.value,
								}))}
							/>
						</PanelRowContainer>
					</SectionContainer>
				</FoldList>

				<FoldList label={t('heroTemplatePanel.typography')}>
					<TypographyMapControl
						field="heading"
						label={t('heroTemplatePanel.heading')}
						defaultValue={(HERO_TYPOGRAPHY_DEFAULTS[node.uiType] ?? HERO_TYPOGRAPHY_DEFAULTS.centeredClassic).heading}
					/>
					<TypographyMapControl
						field="subheading"
						label={t('heroTemplatePanel.subheading')}
						defaultValue={(HERO_TYPOGRAPHY_DEFAULTS[node.uiType] ?? HERO_TYPOGRAPHY_DEFAULTS.centeredClassic).subheading}
					/>
					<LineClampControl field="heading" label={t('heroTemplatePanel.heading')} />
					<LineClampControl field="subheading" label={t('heroTemplatePanel.subheading')} />
				</FoldList>

				<FoldList label={t('heroTemplatePanel.colors')}>
					<SectionContainer hintKey="colorPair">
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('heroTemplatePanel.accentColor')}>
							<ColorPicker
								value={node.accentColor || '#2563eb'}
								onChange={(v) => canvas.updateNode((prevNode) => {
									const prev = prevNode as HeroTemplateNode
									// The CTA slot is painted with the accent, so it has to
									// follow this picker the way the old hardcoded button did.
									return {
										...prev,
										accentColor: v,
										...(prev.children ? { children: recolorHeroCta(prev.children, prev.uiType, v) } : {}),
									}
								})}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('heroTemplatePanel.accentColorSecondary')}>
							<ColorPicker
								value={node.accentColorSecondary || '#7c3aed'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as HeroTemplateNode,
									accentColorSecondary: v,
								}))}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('heroTemplatePanel.backgroundColor')}>
							<ColorPicker
								value={heroBackground(node) || '#ffffff'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as HeroTemplateNode,
									style: { ...(prevNode as HeroTemplateNode).style, backgroundColor: v },
								}))}
							/>
						</PanelRowContainer>
					</SectionContainer>
				</FoldList>

				<SectionContainer hintKey="styleGroup" label={t('heroTemplatePanel.style')}>
					<BorderController />
				</SectionContainer>

				<PaddingController />

				<BorderRadiusController />

				<BoxShadowController />

				<Attributes />
			</div>
		)
}

export default withTemplateTabs(HeroTemplatePanel)
