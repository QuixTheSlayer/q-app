"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import {cn} from "@/libs/cn"


function Tabs ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-[0.25em]", className)}
      style={{
        fontSize: '1em'
      }}
      {...props}
    />
  )
}

function TabsList ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
    
      data-slot="tabs-list"
      className={cn(
        "flex gap-[0.75em] w-fit items-center",
        className
      )}
      style={{
        fontSize: 'inherit'
      }}
      {...props}
    />
  )
}

function TabsTrigger ({ 
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
    
      data-slot="tabs-trigger"
      className={cn(
        "p-[1em] py-[0.75em] pb-[0.5em] text-[1em] border-b-[0.16em] border-primary/30 focus-visible:outline-ring text-muted-foreground hover:text-foreground hover:bg-accent/40 inline-flex h-[calc(100%)] flex-1 items-center justify-center gap-[0.375em] font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[state=active]:bg-primary/10 data-[state=active]:border-primary data-[state=active]:text-primary",
        className
      )}
      {...props}
    />
  )
}

function TabsContent ({
  className,
  style,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none p-[0.5em]", className)}
      style={{
        ...style,
        fontSize: 'inherit'
      }}
      {...props}
    />
  )
}

export {Tabs, TabsList, TabsTrigger, TabsContent}
