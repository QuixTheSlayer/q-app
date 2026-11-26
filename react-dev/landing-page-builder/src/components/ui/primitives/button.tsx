import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/libs/cn"

export type ButtonVariants = "primary" | "destructive" | "outline" | "secondary" | "ghost" | "text" | "link"
export type ButtonSizes = "md" | "sm" | "lg"

const buttonVariants = cva(
  "inline-flex p-0 items-center justify-center gap-[9.75px] whitespace-nowrap rounded-md text-[11.375px] font-medium transition-colors focus-visible:outline-offset-1 focus-visible:outline-2 disabled:pointer-events-none disabled:opacity-50 focus:outline-0",
  {
    variants: {
      variant: {
        primary: "text-white",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border bg-transparent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        text: "border border-transparent bg-transparent",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-12 px-4",
        lg: "h-14 px-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    VariantProps<typeof buttonVariants> {
  color?: string
  isDisabled?: boolean
}

function colorStyle(variant: ButtonVariants | null | undefined, color: string): React.CSSProperties {
  switch (variant) {
    case "primary":
      return { backgroundColor: color }
    case "outline":
      return { borderWidth: 1, borderStyle: "solid", borderColor: `${color}99`, color }
    case "ghost":
      return { backgroundColor: `${color}15`, color }
    case "text":
      return { borderColor: `${color}20`, color }
    case "link":
      return { color: `${color}df` }
    default:
      return {}
  }
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", color = "#1B84FF", isDisabled, type = "button", style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(buttonVariants({ variant, size }), className)}
        style={{ ...colorStyle(variant, color), ...style }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
