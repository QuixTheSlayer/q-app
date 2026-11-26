import React, { type ComponentProps } from 'react'
import {
  NumberField as AriaNumberField,
  Group,
  Input,
  Button,
} from 'react-aria-components'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/libs/cn'

const NumberField = AriaNumberField

const sizeClasses = {
  sm: 'h-9 text-[13px]',
  md: 'h-12 text-[13.6px]',
}

const stepperIconSize = {
  sm: 10,
  md: 14,
}

interface FieldGroupProps extends ComponentProps<typeof Group> {
  size?: 'sm' | 'md'
}

function FieldGroup({ className, size = 'md', ...props }: FieldGroupProps) {
  return (
    <Group
      {...props}
      className={cn(
        'group/NumberField  relative flex items-center overflow-hidden rounded-md border border-input bg-input focus-within:border-ring',
        sizeClasses[size],
        className as string
      )}
    />
  )
}

function NumberFieldSteppers({ size = 'md', className }: { size?: 'sm' | 'md'; className?: string | boolean }) {
  return (
    <div className={cn('flex flex-col border-l border-input', className as string)}>
      <Button
        slot="increment"
        className="flex flex-1 items-center justify-center px-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
      >
        <ChevronUp size={stepperIconSize[size]} />
      </Button>
      <Button
        slot="decrement"
        className="flex flex-1 items-center justify-center px-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 border-t border-input"
      >
        <ChevronDown size={stepperIconSize[size]} />
      </Button>
    </div>
  )
}

export interface NumberFieldInputProps extends ComponentProps<typeof FieldGroup> {
  hideStepper?: boolean
}

function NumberFieldInput({ className, size = 'md', hideStepper = false, ...props }: NumberFieldInputProps) {
  return (
    <FieldGroup size={size} className={className as string} {...props}>
      <Input className="min-w-0 flex-1 border-r border-transparent px-2 !bg-transparent outline outline-0 focus:outline-none" />
      <NumberFieldSteppers size={size} className={hideStepper && 'hidden group-hover/NumberField:flex'} />
    </FieldGroup>
  )
}

export { NumberField, NumberFieldInput, NumberFieldSteppers }
