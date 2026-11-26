import { useState, type ReactNode } from 'react'
import { PanelTabs, type PanelTab } from './PanelTabs'

type Props = {
	design: ReactNode
	/** Leave out when the element can't do anything. */
	actions?: ReactNode
	more?: ReactNode
	actionsUsed?: boolean
}

/** Design / Actions / More tabs around the panel's sections; the shared header sits above, in PropertyPanel. */
export function PanelShell({ design, actions, more, actionsUsed }: Props) {
	const [chosen, setChosen] = useState<PanelTab>('design')
	const tabs: PanelTab[] = ['design', ...(actions ? ['actions' as const] : []), ...(more ? ['more' as const] : [])]
	const tab = tabs.includes(chosen) ? chosen : 'design'

	return (
		<div className="flex flex-col">
			{tabs.length > 1 && <PanelTabs tab={tab} onChange={setChosen} tabs={tabs} actionsUsed={actionsUsed} />}
			<div className="pt-1">
				{/* Design stays mounted: remounting its many controls made switching back slow. */}
				<div hidden={tab !== 'design'}>{design}</div>
				{tab === 'actions' && actions}
				{tab === 'more' && more}
			</div>
		</div>
	)
}
