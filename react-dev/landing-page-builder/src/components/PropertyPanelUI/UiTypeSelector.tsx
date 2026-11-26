import { cn } from '@/libs/cn'
import { Check } from 'lucide-react'

export interface UiTypeOption {
	value: string
	label: string
	Preview: React.ComponentType
}

export function UiTypeSelector({ options, value, onChange }: {
	options: UiTypeOption[]
	value: string
	onChange: (value: string) => void
}) {
	return (
		<div className="grid grid-cols-2 gap-2.5 w-full">
			{options.map((option) => {
				const selected = value === option.value
				return (
					<button
						key={option.value}
						type="button"
						onClick={() => onChange(option.value)}
						className={cn(
							'group relative flex flex-col gap-2 rounded-xl border p-2 text-left transition-all duration-150',
							selected
								? 'border-primary ring-2 ring-primary/30 shadow-sm'
								: 'border-border/70 hover:border-primary/40 hover:shadow-sm',
						)}
					>
						{selected && (
							<span className="absolute top-1.5 right-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
								<Check size={10} strokeWidth={3} />
							</span>
						)}
						<div
							className="rounded-lg overflow-hidden w-full h-[72px] flex items-center justify-center pointer-events-none transition-transform duration-150 group-hover:scale-[1.02]"
							style={{ backgroundColor: '#ffffff', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }}
						>
							<div className="scale-[0.55] origin-center">
								<option.Preview />
							</div>
						</div>
						<span className={cn('text-[11.5px] font-medium truncate px-0.5', selected ? 'text-primary' : 'text-foreground')}>{option.label}</span>
					</button>
				)
			})}
		</div>
	)
}
