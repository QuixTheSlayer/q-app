import { useState, useCallback } from 'react'
import { TutorialStep, EventPageTutorialType, getTutorialSteps, getTutorialTitle } from '@/utils/tutorials/eventPageTutorial'
import { Button } from '@/components/ui/primitives/button'
import { cn } from '@/libs/cn'
import { ChevronLeft, ChevronRight, X, Lightbulb, CheckCircle2, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TutorialPanelProps {
	tutorialType: EventPageTutorialType
	onClose: () => void
	onStepAction?: (step: TutorialStep) => void
}

export function TutorialPanel({ tutorialType, onClose, onStepAction }: TutorialPanelProps) {
	const { t } = useTranslation('common')
	const [currentStepIndex, setCurrentStepIndex] = useState(0)
	const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())

	const steps = getTutorialSteps(tutorialType)
	const currentStep = steps[currentStepIndex]
	const totalSteps = steps.length
	const progress = ((currentStepIndex + 1) / totalSteps) * 100

	const toggleExpandStep = (stepId: string) => {
		const newExpanded = new Set(expandedSteps)
		if (newExpanded.has(stepId)) {
			newExpanded.delete(stepId)
		} else {
			newExpanded.add(stepId)
		}
		setExpandedSteps(newExpanded)
	}

	const handleStepAction = useCallback(() => {
		if (currentStep.action) {
			currentStep.action()
		}
		onStepAction?.(currentStep)
	}, [currentStep, onStepAction])

	const goToNextStep = useCallback(() => {
		if (currentStepIndex < totalSteps - 1) {
			setCurrentStepIndex(currentStepIndex + 1)
		}
	}, [currentStepIndex, totalSteps])

	const goToPreviousStep = useCallback(() => {
		if (currentStepIndex > 0) {
			setCurrentStepIndex(currentStepIndex - 1)
		}
	}, [currentStepIndex])

	return (
		<div className='w-full max-w-md h-full flex flex-col bg-background border-l border-border overflow-hidden'>
			{/* Header */}
			<div className='flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5'>
				<div className='flex-1'>
					<h2 className='text-sm font-semibold text-foreground'>🎓 {getTutorialTitle(tutorialType)}</h2>
					<p className='text-xs text-muted-foreground mt-1'>
						Step {currentStepIndex + 1} of {totalSteps}
					</p>
				</div>
				<button
					onClick={onClose}
					className='p-1.5 hover:bg-destructive/10 rounded-md transition-colors'
					aria-label='Close tutorial'
				>
					<X size={18} className='text-muted-foreground' />
				</button>
			</div>

			{/* Progress Bar */}
			<div className='h-1 bg-muted'>
				<div
					className='h-full bg-primary transition-all duration-300'
					style={{ width: `${progress}%` }}
				/>
			</div>

			{/* Main Content */}
			<div className='flex-1 overflow-y-auto no-scrollbar'>
				{/* Current Step */}
				<div className='p-4 space-y-4 border-b border-border'>
					{/* Title */}
					<div>
						<h3 className='text-lg font-bold text-foreground flex items-center gap-2'>
							<span className='text-xl'>{currentStep.icon}</span>
							{currentStep.title}
						</h3>
						<p className='text-sm text-muted-foreground mt-2'>{currentStep.description}</p>
					</div>

					{/* Long Description */}
					{currentStep.longDescription && (
						<div className='bg-blue-50 dark:bg-blue-950 p-3 rounded-md border border-blue-200 dark:border-blue-800'>
							<p className='text-sm text-foreground'>{currentStep.longDescription}</p>
						</div>
					)}

					{/* Tips */}
					{currentStep.tips && currentStep.tips.length > 0 && (
						<div className='bg-amber-50 dark:bg-amber-950 p-3 rounded-md border border-amber-200 dark:border-amber-800'>
							<div className='flex items-start gap-2'>
								<Lightbulb size={16} className='text-amber-600 dark:text-amber-400 mt-0.5 shrink-0' />
								<div className='flex-1 min-w-0'>
									<h4 className='text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1'>
										Tips for this step:
									</h4>
									<ul className='space-y-1'>
										{currentStep.tips.map((tip, idx) => (
											<li key={idx} className='text-xs text-amber-800 dark:text-amber-200'>
												✓ {tip}
											</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					)}

					{/* Action Button */}
					{currentStep.action && (
						<Button
							onClick={handleStepAction}
							className='w-full bg-primary hover:bg-primary/90'
							size='sm'
						>
							✨ Auto-Add This Section
						</Button>
					)}
				</div>

				{/* Upcoming Steps */}
				<div className='p-4 space-y-2'>
					<h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
						Upcoming Steps
					</h4>
					<div className='space-y-2'>
						{steps.map((step, idx) => {
							if (idx <= currentStepIndex) return null
							const isExpanded = expandedSteps.has(step.id)

							return (
								<div
									key={step.id}
									className='border border-border rounded-md overflow-hidden hover:border-primary/50 transition-colors'
								>
									<button
										onClick={() => toggleExpandStep(step.id)}
										className='w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors text-left'
									>
										<div className='flex items-center gap-2 min-w-0'>
											<span className='text-base shrink-0'>{step.icon}</span>
											<div className='min-w-0 flex-1'>
												<p className='text-sm font-medium text-foreground truncate'>{step.title}</p>
												<p className='text-xs text-muted-foreground'>Step {idx + 1}</p>
											</div>
										</div>
										<ChevronRight
											size={16}
											className={cn(
												'text-muted-foreground shrink-0 transition-transform',
												isExpanded && 'rotate-90'
											)}
										/>
									</button>

									{isExpanded && (
										<div className='px-3 py-2 bg-muted/30 border-t border-border'>
											<p className='text-xs text-muted-foreground'>{step.description}</p>
										</div>
									)}
								</div>
							)
						})}
					</div>
				</div>
			</div>

			{/* Footer Navigation */}
			<div className='p-4 border-t border-border bg-muted/30 space-y-3'>
				{/* Skip Button */}
				<Button
					onClick={() => goToNextStep()}
					variant='outline'
					size='sm'
					className='w-full'
				>
					Skip for now
				</Button>

				{/* Navigation Buttons */}
				<div className='flex gap-2'>
					<Button
						onClick={goToPreviousStep}
						disabled={currentStepIndex === 0}
						variant='outline'
						size='sm'
						className='flex-1'
					>
						<ChevronLeft size={16} className='mr-1' />
						Previous
					</Button>
					<Button
						onClick={goToNextStep}
						disabled={currentStepIndex === totalSteps - 1}
						size='sm'
						className='flex-1'
					>
						Next
						<ChevronRight size={16} className='ml-1' />
					</Button>
				</div>

				{/* Completion Message */}
				{currentStepIndex === totalSteps - 1 && (
					<div className='bg-green-50 dark:bg-green-950 p-3 rounded-md border border-green-200 dark:border-green-800 text-center'>
						<div className='flex items-center justify-center gap-2 mb-1'>
							<CheckCircle2 size={16} className='text-green-600 dark:text-green-400' />
							<p className='text-sm font-semibold text-green-900 dark:text-green-100'>
								Tutorial Complete!
							</p>
						</div>
						<p className='text-xs text-green-800 dark:text-green-200'>
							Great job! You now have a solid foundation. Customize as needed.
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
