import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import StyleSection from '@/components/PropertyPanelUI/Sections/StyleSection'
import LayoutSection from '@/components/PropertyPanelUI/Sections/LayoutSection'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { VideoNode } from '@/types/node.type'
import { TextInput } from '@/components/ui/primitives/text-input'
import { Switch } from '@/components/ui/primitives/switch'
import { useTranslation } from 'react-i18next'

/** Self-hosted/direct video file (native <video>) property panel - URL plus
 * playback toggles. Distinct from the youtube/vimeo embed content types,
 * which have no file of their own to point at. */
function VideoPanel() {
	const canvas = useEditor()
	const node = canvas?.focusedNode as VideoNode
	const { t } = useTranslation('propertyPanel')

	if (!node) return null

	const src = node.children || node.src || ''

	function updateSrc(url: string) {
		canvas.updateNode((prevNode) => ({
			...prevNode as VideoNode,
			src: url,
			children: url,
		}))
	}

	function updatePlayback(patch: Partial<Pick<VideoNode, 'autoPlay' | 'loop' | 'muted' | 'controls'>>) {
		canvas.updateNode((prevNode) => ({
			...prevNode as VideoNode,
			...patch,
		}))
	}

	return (
		<div className='w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar'>
			<SectionContainer label={t('videoPanel.sourceUrl')}>
				<PanelRowContainer layoutType='col'>
					<TextInput
						className='col-span-3'
						placeholder={t('videoPanel.urlPlaceholder')}
						size='sm'
						value={src}
						onChange={(e) => updateSrc(e.target.value)}
					/>
				</PanelRowContainer>
			</SectionContainer>

			<SectionContainer label={t('videoPanel.playback')}>
				<PanelRowContainer layoutType='row' label={t('videoPanel.autoPlay')}>
					<Switch checked={!!node.autoPlay} onCheckedChange={(v) => updatePlayback({ autoPlay: v })} />
				</PanelRowContainer>
				<PanelRowContainer layoutType='row' label={t('videoPanel.loop')}>
					<Switch checked={!!node.loop} onCheckedChange={(v) => updatePlayback({ loop: v })} />
				</PanelRowContainer>
				<PanelRowContainer layoutType='row' label={t('videoPanel.muted')}>
					<Switch checked={node.muted !== false} onCheckedChange={(v) => updatePlayback({ muted: v })} />
				</PanelRowContainer>
				<PanelRowContainer layoutType='row' label={t('videoPanel.controls')}>
					<Switch checked={!!node.controls} onCheckedChange={(v) => updatePlayback({ controls: v })} />
				</PanelRowContainer>
			</SectionContainer>

			<LayoutSection />
			<StyleSection />
			<Attributes />
		</div>
	)
}

export default VideoPanel
