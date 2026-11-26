import React from 'react'
import { cn } from '@/libs/cn'

export interface PlainTextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

function PlainTextInput({ className, ...props }: PlainTextInputProps) {
  return (
    <input
      type="text"
      className={cn('bg-transparent text-[13px] flex-1 min-w-0 focus:outline-none', className)}
      {...props}
    />
  )
}

export default PlainTextInput
