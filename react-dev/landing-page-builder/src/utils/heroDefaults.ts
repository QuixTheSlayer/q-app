import type { HeroTemplateNode, HeroUiType } from '@/types/node.type'

/** The flat background each Hero variant paints by default. The Background colour control overrides it. */
export const HERO_DEFAULT_BG: Partial<Record<HeroUiType, string>> = {
	centeredClassic: '#fbf7f0',
	splitImage: '#fff8f1',
	minimalLeft: '#f5f4ef',
	sideBySideStats: '#ffffff',
	glowScreenshot: '#0b1020',
	darkBlurBackdrop: '#07070a',
	cinematicBlob: '#06120c',
	photoBadges: '#fff7ed',
	credentialBadge: '#dde7e3',
}

/** The colour the Hero paints behind its content: the user's choice, else the variant's own. */
export const heroBackground = (node: Pick<HeroTemplateNode, 'style' | 'uiType'>): string | undefined =>
	(node.style?.backgroundColor as string | undefined) || HERO_DEFAULT_BG[node.uiType]
