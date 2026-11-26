import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { CanvasNode, PersonalCardTemplateNode, FooterLink, PersonalCardUiType } from '@/types/node.type'
import { buildPersonalCardSocialButton, removePersonalCardSocialLink, restylePersonalCardChildren, setPersonalCardSlotText, setPersonalCardSocialLink } from '@/utils/personalCardSlots'
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

// Each variant hardcodes its own name/role/bio/socialLinks color and size
// (white text on dark cards, dark text on light cards, accentColor vs
// accentColorSecondary, etc.) — a single static fallback would show the
// wrong color for most of them. Keyed by uiType and expressed as functions
// so the accentColor/accentColorSecondary node fields can be read directly.
// Keep these in sync with the styles in PersonalCardTemplateVisual.tsx.
//
// NOTE: classicCentered's real "name" is background-clip gradient text
// (accentColor -> accentColorSecondary), not a flat color — accentColor is
// used here as the closest single-color stand-in for the swatch.
const PERSONAL_CARD_TYPOGRAPHY_DEFAULTS: Record<PersonalCardUiType, {
	name: (node: PersonalCardTemplateNode) => React.CSSProperties
	role: (node: PersonalCardTemplateNode) => React.CSSProperties
	bio: (node: PersonalCardTemplateNode) => React.CSSProperties
	socialLinks: (node: PersonalCardTemplateNode) => React.CSSProperties
}> = {
	classicCentered: {
		name: (node) => ({ fontSize: '20px', fontWeight: '700', color: node.accentColor || '#7c3aed' }),
		role: (node) => ({ fontSize: '12px', fontWeight: '600', color: node.accentColor || '#7c3aed' }),
		bio: () => ({ fontSize: '14px', fontWeight: '400', color: '#6b6b76' }),
		socialLinks: (node) => ({ fontSize: '12px', fontWeight: '500', color: node.accentColor || '#7c3aed' }),
	},
	horizontalRow: {
		name: () => ({ fontSize: '16px', fontWeight: '700', color: '#18181b' }),
		role: (node) => ({ fontSize: '12px', fontWeight: '600', color: node.accentColorSecondary || '#8b5cf6' }),
		bio: () => ({ fontSize: '14px', fontWeight: '400', color: '#71717a' }),
		socialLinks: (node) => ({ fontSize: '12px', fontWeight: '700', color: node.accentColorSecondary || '#8b5cf6' }),
	},
	darkGlass: {
		name: () => ({ fontSize: '18px', fontWeight: '700', color: '#ffffff' }),
		role: (node) => ({ fontSize: '12px', fontWeight: '600', color: node.accentColorSecondary || '#8b5cf6' }),
		bio: () => ({ fontSize: '14px', fontWeight: '400', color: '#d4d4d8' }),
		socialLinks: () => ({ fontSize: '12px', fontWeight: '500', color: '#ffffff' }),
	},
	minimalFlat: {
		name: () => ({ fontSize: '24px', fontWeight: '700', color: '#18181b' }),
		role: (node) => ({ fontSize: '12px', fontWeight: '600', color: node.accentColor || '#7c3aed' }),
		bio: () => ({ fontSize: '14px', fontWeight: '400', color: '#52525b' }),
		socialLinks: () => ({ fontSize: '12px', fontWeight: '600', color: '#18181b' }),
	},
	imageBackdrop: {
		name: () => ({ fontSize: '24px', fontWeight: '700', color: '#ffffff' }),
		role: (node) => ({ fontSize: '12px', fontWeight: '600', color: node.accentColorSecondary || '#8b5cf6' }),
		bio: () => ({ fontSize: '14px', fontWeight: '400', color: 'rgba(255,255,255,0.75)' }),
		socialLinks: () => ({ fontSize: '12px', fontWeight: '700', color: '#ffffff' }),
	},
	bordered: {
		name: () => ({ fontSize: '18px', fontWeight: '900', color: '#18181b' }),
		role: (node) => ({ fontSize: '11px', fontWeight: '700', color: node.accentColorSecondary || '#8b5cf6' }),
		bio: () => ({ fontSize: '14px', fontWeight: '400', color: '#52525b' }),
		socialLinks: () => ({ fontSize: '10px', fontWeight: '600', color: '#ffffff' }),
	},
	socialFocus: {
		name: () => ({ fontSize: '18px', fontWeight: '700', color: '#18181b' }),
		role: (node) => ({ fontSize: '12px', fontWeight: '600', color: node.accentColor || '#7c3aed' }),
		bio: () => ({ fontSize: '14px', fontWeight: '400', color: '#71717a' }),
		socialLinks: () => ({ fontSize: '12px', fontWeight: '700', color: '#ffffff' }),
	},
	compactInline: {
		name: () => ({ fontSize: '14px', fontWeight: '700', color: '#ffffff' }),
		role: (node) => ({ fontSize: '12px', fontWeight: '400', color: node.accentColorSecondary || '#8b5cf6' }),
		bio: () => ({ fontSize: '12px', fontWeight: '400', color: 'rgba(255,255,255,0.5)' }),
		socialLinks: (node) => ({ fontSize: '12px', fontWeight: '600', color: node.accentColorSecondary || '#8b5cf6' }),
	},
	attendeeBadge: {
		name: () => ({ fontSize: '18px', fontWeight: '700', color: '#1B1D22' }),
		role: () => ({ fontSize: '11px', fontWeight: '700', color: '#ffffff' }),
		bio: () => ({ fontSize: '12px', fontWeight: '400', color: '#52525b' }),
		socialLinks: () => ({ fontSize: '10px', fontWeight: '600', color: '#1B1D22' }),
	},
}

// ---- Tiny static previews (~150x100), one per uiType, mirroring the real
// PersonalCardTemplateVisual composition at a glance. Hardcoded sample
// content — these never touch live node data. ----

function ClassicCenteredPreview() {
	return (
		<div className="relative flex flex-col items-center text-center gap-1 w-[150px] h-[100px] p-2 justify-center overflow-hidden" style={{ backgroundColor: '#faf9ff' }}>
			<div className="absolute rounded-full" style={{ width: 60, height: 60, top: -20, background: 'radial-gradient(circle, rgba(124,58,237,0.3), rgba(124,58,237,0) 70%)' }} />
			<div className="relative w-8 h-8 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: '2px solid #fff' }} />
			<div className="relative w-16 h-1.5 rounded" style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }} />
			<div className="relative w-10 h-1 rounded-full" style={{ backgroundColor: '#ede9fe' }} />
			<div className="relative flex gap-1 mt-0.5">
				<div className="w-8 h-2.5 rounded-full bg-white" style={{ boxShadow: '0 2px 6px -2px rgba(79,70,229,0.5)' }} />
				<div className="w-8 h-2.5 rounded-full bg-white" style={{ boxShadow: '0 2px 6px -2px rgba(79,70,229,0.5)' }} />
			</div>
		</div>
	)
}

function HorizontalRowPreview() {
	return (
		<div className="flex items-center gap-2 w-[150px] h-[100px] p-2" style={{ backgroundColor: '#ffffff', boxShadow: '0 3px 10px -6px rgba(15,23,42,0.3)' }}>
			<div className="w-9 h-9 rounded-lg shrink-0" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }} />
			<div className="flex flex-col gap-1 flex-1">
				<div className="w-16 h-1.5 bg-neutral-800 rounded" />
				<div className="w-20 h-1 bg-neutral-300 rounded" />
			</div>
			<div className="flex gap-1">
				<div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f4f2ff' }} />
				<div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f4f2ff' }} />
			</div>
		</div>
	)
}

function DarkGlassPreview() {
	return (
		<div className="relative flex flex-col items-center justify-center gap-1 w-[150px] h-[100px] p-2 overflow-hidden" style={{ background: 'radial-gradient(120% 100% at 50% 0%, #251a45 0%, #0b0714 60%)' }}>
			<div className="absolute rounded-full" style={{ width: 55, height: 55, top: -15, background: 'radial-gradient(circle, rgba(139,92,246,0.5), rgba(139,92,246,0) 70%)' }} />
			<div className="relative rounded-full p-[2px]" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
				<div className="w-6 h-6 rounded-full bg-white/30" />
			</div>
			<div className="relative w-14 h-1.5 bg-white rounded" />
			<div className="relative rounded-md px-2 py-1 w-16 h-3" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(255,255,255,0.08)' }} />
		</div>
	)
}

function MinimalFlatPreview() {
	return (
		<div className="flex gap-2 w-[150px] h-[100px] p-2.5 bg-white items-start">
			<div className="flex flex-col gap-1 flex-1">
				<div className="w-6 h-[2px] bg-neutral-900" />
				<div className="w-20 h-2 bg-neutral-900 rounded" />
				<div className="w-12 h-1 rounded-full" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }} />
				<div className="w-24 h-1 bg-neutral-300 rounded mt-0.5" />
			</div>
			<div className="w-9 h-9 rounded-lg shrink-0" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }} />
		</div>
	)
}

function ImageBackdropPreview() {
	return (
		<div className="relative flex flex-col justify-end w-[150px] h-[100px] overflow-hidden" style={{ backgroundColor: '#1e1b3a' }}>
			<div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.1) 70%)' }} />
			<div className="absolute flex gap-1 top-1.5 right-1.5">
				<div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
				<div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
			</div>
			<div className="relative flex flex-col gap-1 p-2">
				<div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#c4b5fd' }} />
				<div className="w-16 h-2 bg-white rounded" />
			</div>
		</div>
	)
}

function BorderedPreview() {
	return (
		<div className="flex w-[150px] h-[100px] overflow-hidden" style={{ boxShadow: '0 3px 10px -6px rgba(24,24,27,0.4)' }}>
			<div className="relative flex flex-col items-center gap-1 py-2" style={{ background: 'linear-gradient(160deg, #4f46e5, #7c3aed 50%, #db2777)', flex: '0 0 40px' }}>
				<div className="w-5 h-5 rounded-full border border-white" />
				<div className="w-6 h-1.5 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} />
				<div className="w-6 h-1.5 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} />
			</div>
			<div className="flex flex-col justify-center gap-1 p-2 min-w-0 flex-1 bg-white">
				<div className="w-16 h-1.5 bg-neutral-900 rounded" />
				<div className="px-1 py-0.5 text-[6px] w-fit rounded" style={{ background: 'linear-gradient(135deg, #ede9fe, #fce7f3)', color: '#6d28d9' }}>ROLE</div>
				<div className="w-full h-1 bg-neutral-300 rounded mt-0.5" />
			</div>
		</div>
	)
}

function SocialFocusPreview() {
	return (
		<div className="relative flex flex-col items-center gap-1 w-[150px] h-[100px] p-2 justify-center bg-white">
			<div className="relative flex items-center justify-center" style={{ width: 70, height: 50 }}>
				<div className="absolute rounded-full" style={{ width: 12, height: 12, top: 0, left: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
				<div className="absolute rounded-full" style={{ width: 12, height: 12, top: 0, right: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
				<div className="absolute rounded-full" style={{ width: 12, height: 12, bottom: 0, left: 0, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
				<div className="absolute rounded-full" style={{ width: 12, height: 12, bottom: 0, right: 0, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
				<div className="w-7 h-7 rounded-full bg-white" style={{ border: '2px solid #ede9fe' }} />
			</div>
			<div className="w-14 h-1.5 bg-neutral-800 rounded" />
			<div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#ede9fe' }} />
		</div>
	)
}

function CompactInlinePreview() {
	return (
		<div className="flex items-center gap-1.5 w-[150px] h-[100px] p-2 justify-center">
			<div className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 w-full" style={{ backgroundColor: '#18181b' }}>
				<div className="w-4 h-4 rounded-full shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
				<div className="w-px h-3 shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
				<div className="w-9 h-1.5 bg-white rounded shrink-0" />
				<div className="w-6 h-1 rounded shrink-0" style={{ backgroundColor: '#a78bfa' }} />
				<div className="ml-auto w-5 h-1 rounded" style={{ backgroundColor: '#c4b5fd' }} />
			</div>
		</div>
	)
}

function AttendeeBadgePreview() {
	return (
		<div className="flex items-center justify-center w-[150px] h-[100px]" style={{ backgroundColor: '#DDE7E3' }}>
			<div className="relative flex flex-col items-center gap-1 py-3 px-3" style={{ width: 78, borderRadius: 10, backgroundColor: '#EAF2EE', border: '1px solid #1B1D221a' }}>
				<div className="absolute rounded-full" style={{ top: 3, width: 6, height: 6, backgroundColor: '#DDE7E3', boxShadow: 'inset 0 0 0 1px #1B1D2233' }} />
				<div className="w-6 h-6 rounded shrink-0 mt-1.5" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
				<div className="w-10 h-[5px] rounded" style={{ backgroundColor: '#1B1D22' }} />
				<div className="w-7 h-[6px] rounded" style={{ backgroundColor: '#2563eb' }} />
				<div className="w-full h-[6px] mt-1" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #1B1D22 0 1px, transparent 1px 2px)', opacity: 0.7 }} />
			</div>
		</div>
	)
}

function PersonalCardTemplatePanel() {
	const canvas = useEditor()
	const node = canvas?.focusedNode as PersonalCardTemplateNode
	const { t } = useTranslation('propertyPanel')

	const uiTypeOptions: UiTypeOption[] = [
		{ value: 'classicCentered', label: t('personalCardTemplatePanel.uiType.classicCentered'), Preview: ClassicCenteredPreview },
		{ value: 'horizontalRow', label: t('personalCardTemplatePanel.uiType.horizontalRow'), Preview: HorizontalRowPreview },
		{ value: 'darkGlass', label: t('personalCardTemplatePanel.uiType.darkGlass'), Preview: DarkGlassPreview },
		{ value: 'minimalFlat', label: t('personalCardTemplatePanel.uiType.minimalFlat'), Preview: MinimalFlatPreview },
		{ value: 'imageBackdrop', label: t('personalCardTemplatePanel.uiType.imageBackdrop'), Preview: ImageBackdropPreview },
		{ value: 'bordered', label: t('personalCardTemplatePanel.uiType.bordered'), Preview: BorderedPreview },
		{ value: 'socialFocus', label: t('personalCardTemplatePanel.uiType.socialFocus'), Preview: SocialFocusPreview },
		{ value: 'compactInline', label: t('personalCardTemplatePanel.uiType.compactInline'), Preview: CompactInlinePreview },
		{ value: 'attendeeBadge', label: t('personalCardTemplatePanel.uiType.attendeeBadge'), Preview: AttendeeBadgePreview },
	]

	// `childrenUpdater` keeps the node tree in step; skipped on legacy nodes.
	function updateSocialLinks(
		updater: (links: FooterLink[]) => FooterLink[],
		childrenUpdater?: (children: CanvasNode[], node: PersonalCardTemplateNode) => CanvasNode[],
	) {
		canvas.updateNode((prevNode) => {
			const cardNode = prevNode as PersonalCardTemplateNode
			return {
				...cardNode,
				socialLinks: updater(cardNode.socialLinks),
				...(cardNode.children && childrenUpdater
					? { children: childrenUpdater(cardNode.children, cardNode) }
					: {}),
			}
		})
	}

	// Writes a profile field through to its slot node, keeping the flat field.
	function updateProfileText(field: 'name' | 'role' | 'bio', value: string) {
		canvas.updateNode((prevNode) => {
			const n = prevNode as PersonalCardTemplateNode
			return {
				...n,
				[field]: value,
				...(n.children ? { children: setPersonalCardSlotText(n.children, field, value) } : {}),
			}
		})
	}

	function addSocialLink() {
		const link = { label: t('personalCardTemplatePanel.newLinkLabel', { number: (node.socialLinks?.length ?? 0) + 1 }), href: '' }
		updateSocialLinks(
			(links) => [...links, link],
			(children, n) => [...children, buildPersonalCardSocialButton(link, n.uiType, n.accentColor, n.accentColorSecondary)],
		)
	}

	function removeSocialLink(index: number) {
		updateSocialLinks(
			(links) => links.filter((_, i) => i !== index),
			(children) => removePersonalCardSocialLink(children, index),
		)
	}

	if (node)
		return (
			<div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>

				<SectionContainer label={t('personalCardTemplatePanel.uiType.label')}>
					<UiTypeSelector
						options={uiTypeOptions}
						value={node.uiType}
						onChange={(v) => canvas.updateNode((prevNode) => {
							const n = prevNode as PersonalCardTemplateNode
							const uiType = v as PersonalCardUiType
							return {
								...n,
								uiType,
								...(n.children ? { children: restylePersonalCardChildren(n.children, uiType, n.accentColor, n.accentColorSecondary) } : {}),
							}
						})}
					/>
				</SectionContainer>

				<FoldList label={t('personalCardTemplatePanel.profile')}>
					<SectionContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('personalCardTemplatePanel.name')}>
							<TextInput
								size='sm'
								value={node.name}
								onChange={(e) => updateProfileText('name', e.target.value)}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('personalCardTemplatePanel.role')}>
							<TextInput
								size='sm'
								value={node.role}
								onChange={(e) => updateProfileText('role', e.target.value)}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('personalCardTemplatePanel.bio')}>
							<TextInput
								size='sm'
								value={node.bio}
								onChange={(e) => updateProfileText('bio', e.target.value)}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' px-0 ' layoutType='col' label={t('personalCardTemplatePanel.imageUrl')}>
							<TemplateImageField
								value={node.imageUrl}
								onChange={(url) => canvas.updateNode((prevNode) => ({
									...prevNode as PersonalCardTemplateNode,
									imageUrl: url,
								}))}
							/>
							<TextInput
								className=' mt-2 '
								size='sm'
								value={node.imageUrl ?? ''}
								placeholder={t('personalCardTemplatePanel.imageUrlPlaceholder')}
								onChange={(e) => canvas.updateNode((prevNode) => ({
									...prevNode as PersonalCardTemplateNode,
									imageUrl: e.target.value,
								}))}
							/>
						</PanelRowContainer>
					</SectionContainer>

					<PanelRowContainer className=' px-0 gap-3 ' layoutType='col' label={t('personalCardTemplatePanel.socialLinks')}>
						{node.socialLinks.map((link, index) => (
							<div key={index} className='border rounded-lg overflow-hidden'>
								<div className='relative h-[40px] gap-2 px-2 flex justify-between items-center bg-primary/20 rounded-t-md border-b'>
									<span className='text-sm font-medium text-foreground'>{t('personalCardTemplatePanel.linkNumber', { number: index + 1 })}</span>
									{node.socialLinks.length > 1 && (
										<div
											onClick={() => removeSocialLink(index)}
											className='cursor-pointer rounded-tr absolute right-0 min-w-[40px] h-full flex border border-destructive bg-destructive text-destructive-foreground justify-center items-center'
										>
											<FiTrash size={16} />
										</div>
									)}
								</div>
								<div className='flex flex-col gap-2 p-2'>
									<PanelRowContainer className=' px-0 ' layoutType='col' label={t('personalCardTemplatePanel.linkLabel')}>
										<TextInput
											size='sm'
											value={link.label}
											onChange={(e) => updateSocialLinks((links) => {
												const next = [...links]
												next[index] = { ...next[index], label: e.target.value }
												return next
											}, (children) => setPersonalCardSocialLink(children, index, { label: e.target.value }))}
										/>
									</PanelRowContainer>
									<PanelRowContainer className=' px-0 ' layoutType='col' label={t('personalCardTemplatePanel.linkHref')}>
										<TextInput
											size='sm'
											value={link.href}
											placeholder={t('personalCardTemplatePanel.linkHrefPlaceholder')}
											onChange={(e) => updateSocialLinks((links) => {
												const next = [...links]
												next[index] = { ...next[index], href: e.target.value }
												return next
											}, (children) => setPersonalCardSocialLink(children, index, { href: e.target.value }))}
										/>
									</PanelRowContainer>
								</div>
							</div>
						))}
						<div
							onClick={addSocialLink}
							className=' gap-2 text-base flex text-center w-[100%] my-1 border-t-[1px] border-border text-muted-foreground h-[38px] justify-center items-center cursor-pointer '
						>
							<CirclePlusIcon size={24} />
							<span className='text-sm'>{t('personalCardTemplatePanel.addLink')}</span>
						</div>
					</PanelRowContainer>
				</FoldList>

				<FoldList label={t('personalCardTemplatePanel.typography')}>
					{/* name's default (classicCentered/SpotlightCard) renders as gradient text (background-clip), not a solid color — accentColor is the closest sensible stand-in for the color swatch here. */}
					<TypographyMapControl
						field="name"
						label={t('personalCardTemplatePanel.name')}
						defaultValue={(PERSONAL_CARD_TYPOGRAPHY_DEFAULTS[node.uiType] ?? PERSONAL_CARD_TYPOGRAPHY_DEFAULTS.classicCentered).name(node)}
					/>
					<TypographyMapControl
						field="role"
						label={t('personalCardTemplatePanel.role')}
						defaultValue={(PERSONAL_CARD_TYPOGRAPHY_DEFAULTS[node.uiType] ?? PERSONAL_CARD_TYPOGRAPHY_DEFAULTS.classicCentered).role(node)}
					/>
					<TypographyMapControl
						field="bio"
						label={t('personalCardTemplatePanel.bio')}
						defaultValue={(PERSONAL_CARD_TYPOGRAPHY_DEFAULTS[node.uiType] ?? PERSONAL_CARD_TYPOGRAPHY_DEFAULTS.classicCentered).bio(node)}
					/>
					<TypographyMapControl
						field="socialLinks"
						label={t('personalCardTemplatePanel.socialLinks')}
						defaultValue={(PERSONAL_CARD_TYPOGRAPHY_DEFAULTS[node.uiType] ?? PERSONAL_CARD_TYPOGRAPHY_DEFAULTS.classicCentered).socialLinks(node)}
					/>
					<LineClampControl field="name" label={t('personalCardTemplatePanel.name')} />
					<LineClampControl field="role" label={t('personalCardTemplatePanel.role')} />
					<LineClampControl field="bio" label={t('personalCardTemplatePanel.bio')} />
					<LineClampControl field="socialLinks" label={t('personalCardTemplatePanel.socialLinks')} />
				</FoldList>

				<FoldList label={t('personalCardTemplatePanel.colors')}>
					<SectionContainer hintKey="colorPair">
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('personalCardTemplatePanel.accentColor')}>
							<ColorPicker
								value={node.accentColor || '#6366f1'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as PersonalCardTemplateNode,
									accentColor: v,
								}))}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('personalCardTemplatePanel.accentColorSecondary')}>
							<ColorPicker
								value={node.accentColorSecondary || '#8b5cf6'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as PersonalCardTemplateNode,
									accentColorSecondary: v,
								}))}
							/>
						</PanelRowContainer>
						<PanelRowContainer className=' w-full px-0 ' layoutType='col' label={t('personalCardTemplatePanel.backgroundColor')}>
							<ColorPicker
								value={(node.style?.backgroundColor as string) || '#ffffff'}
								onChange={(v) => canvas.updateNode((prevNode) => ({
									...prevNode as PersonalCardTemplateNode,
									style: { ...(prevNode as PersonalCardTemplateNode).style, backgroundColor: v },
								}))}
							/>
						</PanelRowContainer>
					</SectionContainer>
				</FoldList>

				<SectionContainer hintKey="styleGroup" label={t('personalCardTemplatePanel.style')}>
					<BorderController />
				</SectionContainer>

				<PaddingController />

				<BorderRadiusController />

				<BoxShadowController />

				<Attributes />
			</div>
		)
}

export default withTemplateTabs(PersonalCardTemplatePanel)
