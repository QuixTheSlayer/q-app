"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import {ChevronDownIcon, ChevronRight} from "lucide-react"
import {cn} from "@/libs/cn"


function Accordion ({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem ({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex accordion-header ">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "accordion-button flex items-center gap-[0.625em] [&[data-state=open]>span]:rotate-90",
          className
        )}
        {...props}
      >
        <span style={{
          color:props.style?.color
        }} className="accordion-icon transition-transform duration-200">
          <ChevronRight size={18} />
        </span>
        {children}
        {/* <ChevronDownIcon className="text-muted-foreground pointer-events-none size-[1em] shrink-0 translate-y-0.5 transition-transform duration-200" /> */}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}
// function AccordionTrigger ({
//   className,
//   children,
//   ...props
// }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
//   return (
//     <AccordionPrimitive.Header className="flex">
//       <AccordionPrimitive.Trigger
//         data-slot="accordion-trigger"
//         className={cn(
//           "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-[1em] text-left transition-all focus-visible:ring-[3px] font-normal disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
//           className
//         )}
//         {...props}
//       >
//         {children}
//         <ChevronDownIcon className="text-muted-foreground pointer-events-none size-[1em] shrink-0 translate-y-0.5 transition-transform duration-200" />
//       </AccordionPrimitive.Trigger>
//     </AccordionPrimitive.Header>
//   )
// }

function AccordionContent ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-[1em]"
      {...props}
    >
      <div className={cn("pt-0 pb-[1en]", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export {Accordion, AccordionItem, AccordionTrigger, AccordionContent}
