import { useTranslation } from 'react-i18next'
import { cn } from '@/libs/cn'

export type PanelTab = 'design' | 'actions' | 'more'

type Props = {
	tab: PanelTab
	onChange: (tab: PanelTab) => void
	/** Tabs this element has: Actions is left out when it can't do anything. */
	tabs?: PanelTab[]
	/** A dot on Actions tells people something is already set there. */
	actionsUsed?: boolean
}

/** Design (how it looks), Actions (what it does), More (rarely needed). */
export function PanelTabs({ tab, onChange, tabs = ['design', 'actions', 'more'], actionsUsed }: Props) {
	const { t } = useTranslation('propertyPanel')

	return (
		<div role="tablist" aria-label={t('kit.tabs.label')} className="flex border-b border-border">
			{tabs.map((id) => (
				<button key={id} type="button" role="tab" aria-selected={tab === id} title={t(`kit.tabs.${id}Hint`)}
					onClick={() => onChange(id)}
					className={cn(
						'flex-1 py-2.5 text-[13px] font-medium border-b-2 inline-flex items-center justify-center gap-1.5 transition-colors',
						tab === id ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/40'
					)}>
					{t(`kit.tabs.${id}`)}
					{id === 'actions' && actionsUsed && <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />}
				</button>
			))}
		</div>
	)
}
