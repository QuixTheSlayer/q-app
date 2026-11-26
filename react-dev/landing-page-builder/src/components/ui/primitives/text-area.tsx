import * as React from "react"
import { cn } from "@/libs/cn"

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "disabled"> {
  isDisabled?: boolean
  isInvalid?: boolean
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, isInvalid = false, isDisabled, rows = 5, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={isDisabled}
        data-invalid={isInvalid}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[invalid=true]:!border-destructive data-[invalid=true]:!outline-destructive",
          className
        )}
        {...props}
      />
    )
  }
)
TextArea.displayName = "TextArea"

export { TextArea }
