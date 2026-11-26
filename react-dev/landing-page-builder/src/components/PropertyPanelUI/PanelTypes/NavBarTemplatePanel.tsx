import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { CanvasNode, NavBarTemplateNode, NavLink, NavBarUiType } from '@/types/node.type'
import { buildNavBarLinkButton, navBarSlotIndexes, restyleNavBarChildren, setNavBarSlotText, syncNavBarChildren } from '@/utils/navBarSlots'
import { TextInput } from '@/components/ui/primitives/text-input'
import { Switch } from '@/components/ui/primitives/switch'
import { NumberField, NumberFieldInput } from '@/components/ui/primitives/number-field'
import ColorPicker from '@/components/ui/ColorPicker'
import { BorderController } from '../Sections/relatedComponents/Controllers'
import { PaddingController } from '../Sections/relatedComponents/PaddingController'
import { BorderRadiusController } from '../Sections/relatedComponents/BorderRadiusController'
import { BoxShadowController } from '../Sections/relatedComponents/Controllers'
import { CirclePlusIcon } from 'lucide-react'
import { FiTrash } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { UiTypeSelector, UiTypeOption } from '@/components/PropertyPanelUI/UiTypeSelector'
import { LineClampControl } from '../Sections/relatedComponents/LineClampControl'
import { TypographyMapControl } from '../Sections/relatedComponents/TypographyControl'
import TemplateImageField from '../Sections/relatedComponents/TemplateImageField'
import FoldList from '@/components/ui/FoldList'
import editorConfig from '@/configs/editor.config'

import withTemplateTabs from './withTemplateTabs'

// Every variant derives its own fg/darkFg/accent from node.style?.color (see
// NavBarTemplateVisual.tsx's `fg`/`darkFg`/`accent` consts) — light-background
// variants render brand/links in `fg`, dark ones invert to a light `darkFg`,
// and most CTAs are solid white except a handful of outlined ones that use
// `accent`/`darkFg`/`fg` instead. A single static default can't capture this,
// so this computes the real per-uiType value from the node the same way the
// Visual component does. Keep in sync with NavBarTemplateVisual.tsx.
function getNavBarTypographyDefaults(node: NavBarTemplateNode): {
	brand: React.CSSProperties
	links: React.CSSProperties
	ctaLabel: React.CSSProperties
} {
	const fg = (node.style?.color as string) || '#111827'
	const accent = fg === '#111827' ? '#2563eb' : fg

	switch (node.uiType) {
		case 'centeredLogo':
			return { brand: { fontSize: '20px', fontWeight: '800', color: fg }, links: { fontSize: '14px', fontWeight: '500', color: fg }, ctaLabel: { fontSize: '14px', fontWeight: '600', color: accent } }
		case 'pillLinks':
			return { brand: { fontSize: '16px', fontWeight: '700', color: fg }, links: { fontSize: '14px', fontWeight: '500', color: fg }, ctaLabel: { fontSize: '14px', fontWeight: '600', color: '#ffffff' } }
		case 'transparent':
			return { brand: { fontSize: '14px', fontWeight: '600', color: fg }, links: { fontSize: '12px', fontWeight: '500', color: fg }, ctaLabel: { fontSize: '12px', fontWeight: '600', color: '#ffffff' } }
		case 'darkBar': {
			const darkFg = fg === '#111827' ? '#f8fafc' : fg
			return { brand: { fontSize: '18px', fontWeight: '700', color: darkFg }, links: { fontSize: '14px', fontWeight: '500', color: `${darkFg}cc` }, ctaLabel: { fontSize: '14px', fontWeight: '600', color: '#ffffff' } }
		}
		case 'stacked':
			return { brand: { fontSize: '18px', fontWeight: '700', color: fg }, links: { fontSize: '14px', fontWeight: '500', color: fg }, ctaLabel: { fontSize: '12px', fontWeight: '600', color: '#ffffff' } }
		case 'darkBorderedRow': {
			const darkFg = fg === '#111827' ? '#f4f4f6' : fg
			return { brand: { fontSize: '18px', fontWeight: '700', color: darkFg }, links: { fontSize: '14px', fontWeight: '500', color: darkFg }, ctaLabel: { fontSize: '14px', fontWeight: '600', color: darkFg } }
		}
		case 'pillIslandLight':
			return { brand: { fontSize: '14px', fontWeight: '700', color: '#111827' }, links: { fontSize: '14px', fontWeight: '500', color: '#374151' }, ctaLabel: { fontSize: '14px', fontWeight: '600', color: '#ffffff' } }
		case 'iconWordmark':
			return { brand: { fontSize: '14px', fontWeight: '600', color: fg }, links: { fontSize: '14px', fontWeight: '500', color: fg }, ctaLabel: { fontSize: '14px', fontWeight: '600', color: fg } }
		case 'actionIconBar': {
			const darkFg = fg === '#111827' ? '#e5e7eb' : fg
			return { brand: { fontSize: '16px', fontWeight: '700', color: darkFg }, links: { fontSize: '14px', fontWeight: '500', color: `${darkFg}cc` }, ctaLabel: { fontSize: '14px', fontWeight: '600', color: '#ffffff' } }
		}
		case 'classicRow':
		case 'underlineActive':
		case 'splitCta':
		case 'floatingCard':
		default:
			return { brand: { fontSize: '18px', fontWeight: '700', color: fg }, links: { fontSize: '14px', fontWeight: '500', color: fg }, ctaLabel: { fontSize: '14px', fontWeight: '600', color: '#ffffff' } }
	}
}

// --- Tiny static previews (~150x100, no live node data) for each uiType, ---
// --- matching NavBarTemplateVisual's real layout as closely as possible. ---

function ClassicRowPreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex items-center justify-between px-3 border-b border-gray-200">
			<span className="font-bold text-[10px] text-gray-900">Brand</span>
			<div className="flex gap-2">
				<span className="text-[7px] text-gray-700">Home</span>
				<span className="text-[7px] text-gray-700">About</span>
			</div>
			<span className="text-[7px] font-semibold text-white bg-blue-600 rounded px-1.5 py-0.5">Go</span>
		</div>
	)
}

function CenteredLogoPreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex flex-col items-center justify-center gap-1">
			<div className="flex items-center gap-4">
				<span className="text-[7px] text-gray-700">Home</span>
				<span className="font-extrabold text-[11px] text-gray-900">Brand</span>
				<span className="text-[7px] text-gray-700">About</span>
			</div>
			<span className="text-[6px] font-semibold text-blue-600 border border-blue-600 rounded-full px-2 py-0.5">Go</span>
		</div>
	)
}

function PillLinksPreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex flex-col items-center justify-center gap-2 px-2">
			<span className="font-bold text-[9px] text-gray-900">Brand</span>
			<div className="flex flex-wrap gap-1 justify-center max-w-[130px]">
				<span className="text-[6px] text-gray-700 bg-blue-50 rounded-full px-1.5 py-0.5">Home</span>
				<span className="text-[6px] text-gray-700 border border-blue-200 rounded-full px-1.5 py-0.5">About</span>
				<span className="text-[6px] text-gray-700 bg-blue-50 rounded-full px-1.5 py-0.5">Team</span>
				<span className="text-[6px] font-semibold text-white bg-blue-600 rounded-full px-2 py-1">Go</span>
			</div>
		</div>
	)
}

function TransparentPreview() {
	return (
		<div className="w-[150px] h-[100px] bg-gradient-to-b from-gray-100 to-white flex items-center justify-center px-2">
			<div className="flex flex-wrap items-center justify-center gap-1 px-2 py-1.5 rounded-full border border-gray-300 bg-white/70 max-w-[140px]">
				<span className="font-semibold text-[6px] uppercase tracking-widest text-gray-800">Brand</span>
				<span className="text-[6px] text-gray-400">•</span>
				<span className="text-[6px] uppercase text-gray-700">Home</span>
				<span className="text-[6px] text-gray-400">•</span>
				<span className="text-[6px] uppercase text-gray-700">About</span>
				<span className="text-[6px] text-gray-400">•</span>
				<span className="text-[6px] uppercase font-semibold text-white bg-blue-600 rounded-full px-1">Go</span>
			</div>
		</div>
	)
}

function DarkBarPreview() {
	return (
		<div className="w-[150px] h-[70px] bg-slate-900 flex flex-col">
			<div className="px-2 pt-1.5 pb-1">
				<span className="font-bold text-[9px] text-white">Brand</span>
			</div>
			<div className="flex justify-center gap-[20px] items-center bg-white/10">
				<div className="bg-slate-900 w-[25px] h-[20px] flex items-center justify-center text-[6px] text-slate-300">Home</div>
				<div className="bg-slate-900 w-[25px] h-[20px] flex items-center justify-center text-[6px] text-slate-300">About</div>
				<div className="bg-blue-600 w-[25px] h-[20px] flex items-center justify-center text-[6px] font-semibold text-white">Go</div>
			</div>
		</div>
	)
}

function UnderlineActivePreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex gap-2 px-2 py-2">
			<div className="flex flex-col gap-1 justify-between">
				<span className="font-bold text-[9px] text-gray-900">Brand</span>
				<span className="text-[6px] font-semibold text-white bg-blue-600 rounded px-1.5 py-0.5 self-start">Go</span>
			</div>
			<div className="flex flex-col flex-1 gap-1 pt-0.5">
				<span className="text-[6px] text-blue-600 border-l-2 border-blue-600 pl-1.5">Home</span>
				<span className="text-[6px] text-gray-700 border-l-2 border-gray-200 pl-1.5">About</span>
				<span className="text-[6px] text-gray-700 border-l-2 border-gray-200 pl-1.5">Team</span>
			</div>
		</div>
	)
}

function SplitCtaPreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex items-center justify-center">
			<div className="flex items-center gap-2 px-2 flex-1">
				<span className="font-bold text-[9px] text-gray-900">Brand</span>
				<span className="text-[6px] text-gray-700">Home</span>
				<span className="text-[6px] text-gray-700">About</span>
			</div>
			<div className="bg-blue-600 h-[20px] flex items-center justify-center px-3">
				<span className="text-[7px] font-semibold text-white">Go</span>
			</div>
		</div>
	)
}

function StackedPreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex flex-col">
			<div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-200">
				<span className="font-bold text-[9px] text-gray-900">Brand</span>
				<span className="text-[6px] font-semibold text-white bg-blue-600 rounded px-1.5 py-0.5">Go</span>
			</div>
			<div className="flex items-center justify-center gap-2 flex-1">
				<span className="text-[7px] text-gray-700">Home</span>
				<span className="text-[7px] text-gray-700">About</span>
				<span className="text-[7px] text-gray-700">Pricing</span>
			</div>
		</div>
	)
}

function FloatingCardPreview() {
	return (
		<div className="w-[150px] h-[100px] flex items-center justify-center p-2.5" style={{ backgroundColor: '#f3f4f6' }}>
			<div
				className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white"
				style={{ boxShadow: '0 4px 12px -4px rgba(0,0,0,0.25)', border: '1px solid #f0f0f0' }}
			>
				<span className="font-bold text-[8px] text-gray-900">Brand</span>
				<div className="flex items-center gap-1.5">
					<span className="text-[6.5px] text-gray-600">Home</span>
					<span className="text-[6.5px] text-gray-600">About</span>
				</div>
				<span className="text-[6px] font-semibold text-white bg-blue-600 rounded-full px-2 py-0.5">Go</span>
			</div>
		</div>
	)
}

function DarkBorderedRowPreview() {
	return (
		<div className="w-[150px] h-[100px] flex items-center justify-between px-2.5" style={{ backgroundColor: '#1c1c24' }}>
			<div className="flex items-center gap-1">
				<span style={{ width: 4, height: 4, backgroundColor: '#2563eb', transform: 'rotate(45deg)', display: 'inline-block' }} />
				<span className="text-[8px] font-bold text-white">Brand</span>
			</div>
			<div className="flex items-center gap-1">
				<span className="text-[6px] text-white px-1.5 py-0.5 rounded" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>Home</span>
				<span className="text-[6px] text-white px-1.5 py-0.5 rounded" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>About</span>
			</div>
			<span className="text-[6px] font-semibold text-white rounded-full px-2 py-0.5" style={{ border: '1px solid #fff' }}>Go</span>
		</div>
	)
}

function PillIslandLightPreview() {
	return (
		<div className="w-[150px] h-[100px] flex items-center justify-center p-2" style={{ backgroundColor: '#18181b' }}>
			<div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-white" style={{ boxShadow: '0 4px 10px -3px rgba(0,0,0,0.4)' }}>
				<span className="text-[7px] font-bold text-gray-900">Brand</span>
				<span className="text-[6px] text-gray-400">&bull;</span>
				<span className="text-[6px] text-gray-600">Home</span>
				<span className="text-[6px] text-gray-400">&bull;</span>
				<span className="text-[6px] font-semibold text-white bg-gray-900 rounded-full px-1.5 py-0.5">Go</span>
			</div>
		</div>
	)
}

function IconWordmarkPreview() {
	return (
		<div className="w-[150px] h-[100px] bg-white flex items-center justify-between px-2.5">
			<div className="flex items-center gap-1">
				<span className="flex items-center justify-center rounded text-white font-bold" style={{ width: 12, height: 12, backgroundColor: '#111827', fontSize: 6 }}>B</span>
				<span className="text-[7px] font-semibold text-gray-900">Brand</span>
			</div>
			<div className="flex items-center gap-1.5">
				<span className="text-[5.5px] uppercase tracking-wide text-gray-600">Home</span>
				<span className="text-[5.5px] uppercase tracking-wide text-gray-600">About</span>
			</div>
			<span className="text-[6px] font-semibold text-gray-900 rounded-full px-1.5 py-0.5" style={{ border: '1px solid #d1d5db' }}>Go</span>
		</div>
	)
}

function ActionIconBarPreview() {
	return (
		<div className="w-[150px] h-[100px] flex items-center justify-between px-2.5" style={{ backgroundColor: '#0b0f19' }}>
			<span className="text-[7px] font-bold text-white">Brand</span>
			<div className="flex items-center gap-1.5">
				<span className="text-[6px]" style={{ color: 'rgba(229,231,235,0.8)' }}>Home</span>
				<span className="text-[6px]" style={{ color: 'rgba(229,231,235,0.8)' }}>About</span>
			</div>
			<div className="flex items-center gap-1 rounded px-1.5 py-1" style={{ background: 'linear-gradient(120deg, #2563eb, #2563ebcc)' }}>
				<span className="rounded-full bg-white" style={{ width: 3, height: 3 }} />
				<span className="text-[6px] font-semibold text-white">Go</span>
			</div>
		</div>
	)
}

const UI_TYPE_OPTIONS: (t: (key: string) => string) => UiTypeOption[] = (t) => [
	{ value: 'classicRow', label: t('navBarTemplatePanel.uiType.classicRow'), Preview: ClassicRowPreview },
	{ value: 'centeredLogo', label: t('navBarTemplatePanel.uiType.centeredLogo'), Preview: CenteredLogoPreview },
	{ value: 'pillLinks', label: t('navBarTemplatePanel.uiType.pillLinks'), Preview: PillLinksPreview },
	{ value: 'transparent', label: t('navBarTemplatePanel.uiType.transparent'), Preview: TransparentPreview },
	{ value: 'darkBar', label: t('navBarTemplatePanel.uiType.darkBar'), Preview: DarkBarPreview },
	{ value: 'underlineActive', label: t('navBarTemplatePanel.uiType.underlineActive'), Preview: UnderlineActivePreview },
	{ value: 'splitCta', label: t('navBarTemplatePanel.uiType.splitCta'), Preview: SplitCtaPreview },
	{ value: 'stacked', label: t('navBarTemplatePanel.uiType.stacked'), Preview: StackedPreview },
	{ value: 'floatingCard', label: t('navBarTemplatePanel.uiType.floatingCard'), Preview: FloatingCardPreview },
	{ value: 'darkBorderedRow', label: t('navBarTemplatePanel.uiType.darkBorderedRow'), Preview: DarkBorderedRowPreview },
	{ value: 'pillIslandLight', label: t('navBarTemplatePanel.uiType.pillIslandLight'), Preview: PillIslandLightPreview },
	{ value: 'iconWordmark', label: t('navBarTemplatePanel.uiType.iconWordmark'), Preview: IconWordmarkPreview },
	{ value: 'actionIconBar', label: t('navBarTemplatePanel.uiType.actionIconBar'), Preview: ActionIconBarPreview },
]

function NavBarTemplatePanel() {
	const canvas = useEditor()
	const node = canvas?.focusedNode as NavBarTemplateNode
	const { t } = useTranslation('propertyPanel')

	// `childrenUpdater` keeps the node tree in step; skipped on legacy nodes.
	function updateLinks(
		updater: (links: NavLink[]) => NavLink[],
		childrenUpdater?: (children: CanvasNode[], node: NavBarTemplateNode) => CanvasNode[],
	) {
		canvas.updateNode((prevNode) => {
			const navBarNode = prevNode as NavBarTemplateNode
			const links = updater(navBarNode.links)
			return {
				...navBarNode,
				links,
				...(navBarNode.children && childrenUpdater
					? { children: childrenUpdater(navBarNode.children, navBarNode) }
					: {}),
			}
		})
	}

	// Every CTA/brand edit re-syncs the tree, since those slots are nodes only
	// while they actually render.
	function updateNavBar(patch: Partial<NavBarTemplateNode>, slotText?: { target: 'brand' | 'ctaLabel' | 'ctaHref'; text: string }) {
		canvas.updateNode((prevNode) => {
			const n = prevNode as NavBarTemplateNode
			const next = { ...n, ...patch } as NavBarTemplateNode
			if (!n.children) return next
			const written = slotText ? setNavBarSlotText(n.children, n, slotText.target, slotText.text) : n.children
			return { ...next, children: syncNavBarChildren(written, n, next) }
		})
	}

	function addLink() {
		const link = { label: t('navBarTemplatePanel.newLink', { number: (node.links?.length ?? 0) + 1 }), href: '' }
		updateLinks(
			(links) => [...links, link],
			(children, n) => [...children, buildNavBarLinkButton(n, link)],
		)
	}

	function removeLink(index: number) {
		updateLinks(
			(links) => links.filter((_, i) => i !== index),
			(children, n) => children.filter((_, i) => i !== navBarSlotIndexes(n).links + index),
		)
	}

	if (node)
		return (
			<div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

				<SectionContainer label={t('navBarTemplatePanel.uiTypeLabel')}>
					<UiTypeSelector
						options={UI_TYPE_OPTIONS(t)}
						value={node.uiType}
						onChange={(v) => canvas.updateNode((prevNode) => {
							const n = prevNode as NavBarTemplateNode
							const next = { ...n, uiType: v as NavBarUiType }
							return n.children ? { ...next, children: restyleNavBarChildren(n.children, next) } : next
						})}
					/>
				</SectionContainer>

				{editorConfig.enable_navbar_logo_image && (
					<PanelRowContainer className=' px-0 ' layoutType='row' hintKey="brandDisplayMode" label={t('navBarTemplatePanel.useLogoImage')}>
						<Switch
							checked={node.brandDisplayMode === 'image'}
							onCheckedChange={(v) => updateNavBar({ brandDisplayMode: v ? 'image' : 'text' })}
						/>
					</PanelRowContainer>
				)}

				{editorConfig.enable_navbar_logo_image && node.brandDisplayMode === 'image' ? (
					<>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('navBarTemplatePanel.logoImage')}>
							<TemplateImageField
								value={node.logoImageUrl}
								onChange={(url) => canvas.updateNode((prevNode) => ({
									...prevNode as NavBarTemplateNode,
									logoImageUrl: url,
								}))}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 gap-2 ' layoutType='row' hintKey="width" label={t('navBarTemplatePanel.logoWidth')}>
							<NumberField
								aria-label={t('navBarTemplatePanel.logoWidth')}
								minValue={1}
								value={node.logoWidth ?? 32}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as NavBarTemplateNode,
									logoWidth: v,
								}))}
							>
								<NumberFieldInput size='sm' hideStepper />
							</NumberField>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 gap-2 ' layoutType='row' hintKey="height" label={t('navBarTemplatePanel.logoHeight')}>
							<NumberField
								aria-label={t('navBarTemplatePanel.logoHeight')}
								minValue={1}
								value={node.logoHeight ?? 32}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as NavBarTemplateNode,
									logoHeight: v,
								}))}
							>
								<NumberFieldInput size='sm' hideStepper />
							</NumberField>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 gap-2 ' layoutType='row' hintKey="borderRadius" label={t('navBarTemplatePanel.logoBorderRadius')}>
							<NumberField
								aria-label={t('navBarTemplatePanel.logoBorderRadius')}
								minValue={0}
								value={node.logoBorderRadius ?? 0}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as NavBarTemplateNode,
									logoBorderRadius: v,
								}))}
							>
								<NumberFieldInput size='sm' hideStepper />
							</NumberField>
						</PanelRowContainer>
					</>
				) : (
					<PanelRowContainer className=' px-0 ' layoutType='col' label={t('navBarTemplatePanel.brand')}>
						<TextInput
							size='sm'
							value={node.brand}
							onChange={(e) => updateNavBar({ brand: e.target.value }, { target: 'brand', text: e.target.value })}
						/>
					</PanelRowContainer>
				)}

				<PanelRowContainer className=' px-0 gap-3 ' layoutType='col' label={t('navBarTemplatePanel.links')}>
					{node.links.map((link, index) => (
						<div key={index} className='border rounded-lg overflow-hidden'>
							<div className='relative h-[40px] gap-2 px-2 flex justify-between items-center bg-primary/20 rounded-t-md border-b'>
								<span className='text-sm font-medium text-foreground'>{t('navBarTemplatePanel.linkNumber', { number: index + 1 })}</span>
								{node.links.length > 1 && (
									<div
										onClick={() => removeLink(index)}
										className='cursor-pointer rounded-tr absolute right-0 min-w-[40px] h-full flex border border-destructive bg-destructive text-destructive-foreground justify-center items-center'
									>
										<FiTrash size={16} />
									</div>
								)}
							</div>
							<div className='flex flex-col gap-2 p-2'>
								<PanelRowContainer className=' px-0 ' layoutType='col' label={t('navBarTemplatePanel.label')}>
									<TextInput
										size='sm'
										value={link.label}
										onChange={(e) => updateLinks((links) => {
											const next = [...links]
											next[index] = { ...next[index], label: e.target.value }
											return next
										}, (children, n) => setNavBarSlotText(children, n, { link: index, field: 'label' }, e.target.value))}
									/>
								</PanelRowContainer>
								<PanelRowContainer className=' px-0 ' layoutType='col' label={t('navBarTemplatePanel.href')}>
									<TextInput
										size='sm'
										value={link.href}
										onChange={(e) => updateLinks((links) => {
											const next = [...links]
											next[index] = { ...next[index], href: e.target.value }
											return next
										}, (children, n) => setNavBarSlotText(children, n, { link: index, field: 'href' }, e.target.value))}
									/>
								</PanelRowContainer>
							</div>
						</div>
					))}
					<div
						onClick={addLink}
						className=' gap-2 text-base flex text-center w-[100%] my-1 border-t-[1px] border-border text-muted-foreground h-[38px] justify-center items-center cursor-pointer '
					>
						<CirclePlusIcon size={24} />
						<span className='text-sm'>{t('navBarTemplatePanel.addLink')}</span>
					</div>
				</PanelRowContainer>

				<SectionContainer label={t('navBarTemplatePanel.cta')}>
					{editorConfig.enable_navbar_cta_toggle && (
						<PanelRowContainer className=' px-0 ' layoutType='row' hintKey="showCta" label={t('navBarTemplatePanel.showCta')}>
							<Switch
								checked={node.showCta !== false}
								onCheckedChange={(v) => updateNavBar({ showCta: v })}
							/>
						</PanelRowContainer>
					)}
					<PanelRowContainer className=' px-0 ' layoutType='col' label={t('navBarTemplatePanel.ctaLabel')}>
						<TextInput
							size='sm'
							value={node.ctaLabel ?? ''}
							onChange={(e) => updateNavBar({ ctaLabel: e.target.value }, { target: 'ctaLabel', text: e.target.value })}
						/>
					</PanelRowContainer>
					<PanelRowContainer className=' px-0 ' layoutType='col' label={t('navBarTemplatePanel.ctaHref')}>
						<TextInput
							size='sm'
							value={node.ctaHref ?? ''}
							onChange={(e) => updateNavBar({ ctaHref: e.target.value }, { target: 'ctaHref', text: e.target.value })}
						/>
					</PanelRowContainer>
				</SectionContainer>

				<FoldList label={t('navBarTemplatePanel.typography')}>
					<TypographyMapControl
						field="brand"
						label={t('navBarTemplatePanel.brand')}
						defaultValue={getNavBarTypographyDefaults(node).brand}
					/>
					<TypographyMapControl
						field="links"
						label={t('navBarTemplatePanel.links')}
						defaultValue={getNavBarTypographyDefaults(node).links}
					/>
					<TypographyMapControl
						field="ctaLabel"
						label={t('navBarTemplatePanel.ctaLabel')}
						defaultValue={getNavBarTypographyDefaults(node).ctaLabel}
					/>
					<LineClampControl field="brand" label={t('navBarTemplatePanel.brand')} />
					<LineClampControl field="links" label={t('navBarTemplatePanel.links')} />
					<LineClampControl field="ctaLabel" label={t('navBarTemplatePanel.ctaLabel')} />
				</FoldList>

				<FoldList label={t('navBarTemplatePanel.appearance')}>
					<SectionContainer hintKey="colorPair">
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' hintKey="backgroundColor" label={t('navBarTemplatePanel.backgroundColor')}>
							<ColorPicker
								value={(node.style?.backgroundColor as string) || '#ffffff'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as NavBarTemplateNode,
									style: { ...(prevNode as NavBarTemplateNode).style, backgroundColor: v },
								}))}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' hintKey="backgroundColor" label={t('navBarTemplatePanel.cta')}>
							<ColorPicker
								value={(node.style?.color as string) || '#111827'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as NavBarTemplateNode,
									style: { ...(prevNode as NavBarTemplateNode).style, color: v },
								}))}
							/>
						</PanelRowContainer>
					</SectionContainer>
				</FoldList>

				<SectionContainer hintKey="styleGroup" label={t('navBarTemplatePanel.style')}>
					<BorderController />
				</SectionContainer>

				<PaddingController />

				<BorderRadiusController />

				<BoxShadowController />

				<Attributes />
			</div>
		)
}

export default withTemplateTabs(NavBarTemplatePanel)
