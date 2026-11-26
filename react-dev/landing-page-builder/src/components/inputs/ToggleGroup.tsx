"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import {cva, type VariantProps} from "class-variance-authority"

import {cn} from "@/libs/cn"

const toggleVariants = cva(
  "inline-flex flex-1 text-muted-foreground items-center justify-center text-sm font-medium transition-colors hover:!bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:!bg-primary  data-[state=on]:text-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-[40.5px] px-2 min-w-9",
        sm: "h-[34px] px-1.5 min-w-8",
        // lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & 
  VariantProps<typeof toggleVariants>
>(({className, variant, size, children, ...props}, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("metronic-input [&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-r-[#dbdfe9] p-0 h-auto flex items-center justify-evenly overflow-hidden", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{variant, size}}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>
>(({className, children, variant, size, ...props}, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export {ToggleGroup, ToggleGroupItem}
