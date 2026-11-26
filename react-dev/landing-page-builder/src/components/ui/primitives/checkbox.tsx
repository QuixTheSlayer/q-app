import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/libs/cn"

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, "disabled"> {
  className?: string
  tickSize?: number
  isDisabled?: boolean
  isInvalid?: boolean
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, isDisabled, isInvalid, children, ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <CheckboxPrimitive.Root
          ref={ref}
          disabled={isDisabled}
          className={cn(
            "peer shrink-0 focus-visible:outline-1 focus:outline-offset-1 focus:outline-primary disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden h-[20.8px] w-[20.8px] text-white rounded-[5.2px] bg-muted hover:bg-muted/80 border border-input data-[state=checked]:border-primary data-[state=checked]:!bg-primary",
            isInvalid && "border border-solid !border-destructive",
            className
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current h-full w-full">
            <Check size={13} />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {children && <span>{children}</span>}
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
