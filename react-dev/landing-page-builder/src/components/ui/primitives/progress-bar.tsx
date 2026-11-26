import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/libs/cn"

export interface ProgressBarProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, "ref"> {
  indicatorColor?: string
}

const ProgressBar = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressBarProps
>(({ className, value, indicatorColor = "#3b82f6", ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)`, background: indicatorColor }}
    />
  </ProgressPrimitive.Root>
))
ProgressBar.displayName = ProgressPrimitive.Root.displayName

export { ProgressBar }
