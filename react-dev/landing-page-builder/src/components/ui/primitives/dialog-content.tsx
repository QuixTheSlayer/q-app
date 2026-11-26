import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/libs/cn"

const dialogVariants = cva(
  "fixed z-[1000] h-fit gap-4 bg-background shadow-lg transition linear data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-200",
  {
    variants: {
      position: {
        top: "inset-x-0 top-0 w-full data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 w-full data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full max-w-[425px] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        right: "inset-y-0 right-0 h-full max-w-[425px] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        center: "left-1/2 top-1/2 max-w-[425px] -translate-x-1/2 -translate-y-1/2 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2",
      },
    },
    defaultVariants: {
      position: "center",
    },
  }
)

interface DialogOverlayProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> {
  opacity?: number
  blur?: number
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(({ className, opacity = 30, blur, style, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[1000] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    style={{
      background: `rgb(0 0 0 / ${opacity / 100})`,
      backdropFilter: blur ? `blur(${blur}px)` : undefined,
      ...style,
    }}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogVariants> {
  opacity?: number
  blur?: number
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, position, opacity, blur, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay opacity={opacity} blur={blur} />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(dialogVariants({ position }), className)}
      {...props}
    >
      <div>{children}</div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-[15.5px] font-bold text-foreground mb-[13px]", className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn(className)} {...props} />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

function DialogFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex justify-end gap-[10px] mt-[18.5px]", className)} {...props}>
      {children}
    </div>
  )
}

export interface DialogProps extends React.ComponentProps<typeof DialogContent> {
  isOpen?: boolean
  onOpenChange?: (v: boolean) => void
  renderTrigger?: React.ReactElement
}

function Dialog({ isOpen, onOpenChange, renderTrigger, children, ...props }: DialogProps) {
  const [open, setOpen] = React.useState(false)

  const handleOpenChange = (v: boolean) => {
    if (onOpenChange) {
      onOpenChange(v)
    } else {
      setOpen(v)
    }
  }

  return (
    <DialogPrimitive.Root open={isOpen || open} onOpenChange={handleOpenChange}>
      {renderTrigger && <DialogPrimitive.Trigger asChild>{renderTrigger}</DialogPrimitive.Trigger>}
      <DialogContent position="center" className="rounded-[9px] p-[16.5px] px-[17.5px]" {...props}>
        {children}
      </DialogContent>
    </DialogPrimitive.Root>
  )
}

export { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription, DialogFooter }
