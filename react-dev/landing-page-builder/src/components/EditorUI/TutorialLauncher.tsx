import { useState } from 'react'
import { EventPageTutorialType } from '@/utils/tutorials/eventPageTutorial'
import { Button } from '@/components/ui/primitives/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/primitives/dialog-content'
import { TutorialPanel } from './TutorialPanel'
import { cn } from '@/libs/cn'
import { Sparkles, X } from 'lucide-react'

interface TutorialLauncherProps {
	onTutorialSelect?: (type: EventPageTutorialType) => void
}

interface TutorialOption {
	id: EventPageTutorialType
	title: string
	description: string
	icon: string
	color: string
	steps: number
}

const TUTORIAL_OPTIONS: TutorialOption[] = [
	{
		id: 'conference',
		title: 'Conference Event',
		description: 'Build a professional conference website with speakers, schedule, and venue info.',
		icon: '🎭',
		color: 'from-blue-500 to-cyan-500',
		steps: 6,
	},
	{
		id: 'product-launch',
		title: 'Product Launch',
		description: 'Create buzz for your product launch with features, pricing, and testimonials.',
		icon: '🚀',
		color: 'from-purple-500 to-pink-500',
		steps: 7,
	},
	{
		id: 'wedding',
		title: 'Wedding Website',
		description: 'Share your special day with family and friends with a beautiful wedding site.',
		icon: '💍',
		color: 'from-rose-500 to-red-500',
		steps: 7,
	},
	{
		id: 'fundraiser',
		title: 'Fundraiser Page',
		description: 'Inspire donors with a compelling fundraising page that drives contributions.',
		icon: '💚',
		color: 'from-green-500 to-emerald-500',
		steps: 7,
	},
]

export function TutorialLauncher({ onTutorialSelect }: TutorialLauncherProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [selectedTutorial, setSelectedTutorial] = useState<EventPageTutorialType | null>(null)
	const [showTutorialPanel, setShowTutorialPanel] = useState(false)

	const handleSelectTutorial = (tutorialId: EventPageTutorialType) => {
		setSelectedTutorial(tutorialId)
		setShowTutorialPanel(true)
		onTutorialSelect?.(tutorialId)
	}

	const handleCloseTutorial = () => {
		setShowTutorialPanel(false)
		setSelectedTutorial(null)
	}

	if (showTutorialPanel && selectedTutorial) {
		return <TutorialPanel tutorialType={selectedTutorial} onClose={handleCloseTutorial} />
	}

	return (
		<>
			{/* Launch Button */}
			<Button
				onClick={() => setIsOpen(true)}
				variant='outline'
				size='sm'
				className='w-full justify-start text-left font-normal'
			>
				<Sparkles size={16} className='mr-2 shrink-0' />
				<div className='flex-1 min-w-0'>
					<div className='text-xs font-semibold'>🎓 Start Tutorial</div>
					<div className='text-xs text-muted-foreground'>Get guided through building a page</div>
				</div>
			</Button>

			{/* Selection Dialog */}
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className='max-w-2xl'>
					<div className='flex items-start justify-between'>
						<div>
							<DialogTitle className='text-xl'>Choose a Tutorial</DialogTitle>
							<DialogDescription className='mt-1'>
								Select a page type and we'll guide you through building it step-by-step.
							</DialogDescription>
						</div>
						<button
							onClick={() => setIsOpen(false)}
							className='p-1 hover:bg-muted rounded-md transition-colors'
						>
							<X size={20} className='text-muted-foreground' />
						</button>
					</div>

					{/* Tutorial Options Grid */}
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6'>
						{TUTORIAL_OPTIONS.map((option) => (
							<button
								key={option.id}
								onClick={() => {
									handleSelectTutorial(option.id)
									setIsOpen(false)
								}}
								className={cn(
									'group relative overflow-hidden rounded-lg p-4 text-left transition-all',
									'border border-border hover:border-primary',
									'hover:shadow-md hover:shadow-primary/20'
								)}
							>
								{/* Background Gradient */}
								<div
									className={cn(
										'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity',
										`bg-gradient-to-r ${option.color}`
									)}
								/>

								{/* Content */}
								<div className='relative z-10'>
									<div className='flex items-start justify-between mb-2'>
										<span className='text-3xl'>{option.icon}</span>
										<span className='text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded'>
											{option.steps} steps
										</span>
									</div>
									<h3 className='font-semibold text-foreground mb-1'>{option.title}</h3>
									<p className='text-sm text-muted-foreground'>{option.description}</p>
									<div className='mt-3 inline-flex items-center text-xs font-medium text-primary group-hover:translate-x-1 transition-transform'>
										Start Tutorial →
									</div>
								</div>
							</button>
						))}
					</div>

					{/* Footer Info */}
					<div className='mt-6 p-4 bg-muted/50 rounded-lg border border-border'>
						<p className='text-sm text-muted-foreground'>
							💡 <strong>Tip:</strong> You can skip steps anytime and customize everything to match your needs.
						</p>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
