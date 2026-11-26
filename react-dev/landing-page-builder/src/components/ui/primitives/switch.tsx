import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/libs/cn"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref} 
    className={cn( 
      "pointer-events-auto h-[1.65rem] w-[3rem] rounded-full p-1 ring-1 ring-inset transition duration-200 ease-in-out bg-muted ring-border data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted hover:data-[state=checked]:brightness-[105%] hover:data-[state=unchecked]:bg-muted/70",
      className
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "z-[2] h-full aspect-square rounded-full bg-background shadow-sm ring-1 ring-border/50 transition duration-200 ease-in-out flex items-center justify-center data-[state=checked]:translate-x-[1.36rem] data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
