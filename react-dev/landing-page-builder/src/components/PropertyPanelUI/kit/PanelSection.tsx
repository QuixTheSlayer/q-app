import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { KitSectionTitle } from '@/components/PropertyPanelUI/ui'
import { cn } from '@/libs/cn'

type Props = {
	title: string
	icon: LucideIcon
	children: ReactNode
	/** Extra controls behind "More options". */
	more?: ReactNode
	defaultOpen?: boolean
	className?:string
}

/** A collapsible group in the property panel, with an optional "More options" fold. */
export function PanelSection({className, title, icon: Icon, children, more, defaultOpen = true }: Props) {
	const { t } = useTranslation('propertyPanel')
	const [open, setOpen] = useState(defaultOpen)
	const [showMore, setShowMore] = useState(false)
	const Chevron = open ? ChevronDown : ChevronRight

	return (
		<section className={cn("border-b border-border",className)}>
			<button type="button" aria-expanded={open} onClick={() => setOpen(!open)}
				className="w-full flex items-center gap-2 px-1 py-3 text-[13.5px] font-semibold text-foreground text-left hover:text-primary">
				<Icon size={16} className="text-muted-foreground" />
				<span>{title}</span>
				<Chevron size={16} className="ml-auto text-muted-foreground" />
			</button>
			{open && (
				<KitSectionTitle.Provider value={title.trim()}>
					<div className="flex flex-col gap-2 pb-3">
						{children}
						{more && showMore && more}
						{more && (
							<button type="button" onClick={() => setShowMore(!showMore)}
								className="self-start text-[13px] font-semibold text-primary hover:underline">
								{showMore ? t('kit.fewerOptions') : t('kit.moreOptions')}
							</button>
						)}
					</div>
				</KitSectionTitle.Provider>
			)}
		</section>
	)
}
