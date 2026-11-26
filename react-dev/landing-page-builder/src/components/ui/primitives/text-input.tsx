import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/libs/cn"

const textInputVariant = cva(
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[invalid=true]:!border-destructive data-[invalid=true]:outline-destructive",
  {
    variants: {
      size: {
        sm: "h-9 px-2 text-xs",
        md: "h-12 px-3 text-sm",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "disabled" | "size">,
    VariantProps<typeof textInputVariant> {
  isInvalid?: boolean
  isDisabled?: boolean
  type?: "text" | "number" | "password" | "email" | "tel" | "url" | "search"
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, size, type = "text", isInvalid = false, isDisabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        disabled={isDisabled}
        data-invalid={isInvalid}
        className={cn(textInputVariant({ size }), className)}
        {...props}
      />
    )
  }
)
TextInput.displayName = "TextInput"

export { TextInput }
