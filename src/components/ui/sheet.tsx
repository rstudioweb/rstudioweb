"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 tw-fixed tw-inset-0 tw-z-50 tw-bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "tw-bg-background data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out tw-fixed tw-z-50 tw-flex tw-flex-col tw-gap-4 tw-shadow-lg tw-transition tw-ease-in-out data-[state=closed]:tw-duration-300 data-[state=open]:tw-duration-500",
          side === "right" &&
            "data-[state=closed]:tw-slide-out-to-right data-[state=open]:tw-slide-in-from-right tw-inset-y-0 tw-right-0 tw-h-full tw-w-3/4 tw-border-l sm:tw-max-w-sm",
          side === "left" &&
            "data-[state=closed]:tw-slide-out-to-left data-[state=open]:tw-slide-in-from-left tw-inset-y-0 tw-left-0 tw-h-full tw-w-3/4 tw-border-r sm:tw-max-w-sm",
          side === "top" &&
            "data-[state=closed]:tw-slide-out-to-top data-[state=open]:tw-slide-in-from-top tw-inset-x-0 tw-top-0 tw-h-auto tw-border-b",
          side === "bottom" &&
            "data-[state=closed]:tw-slide-out-to-bottom data-[state=open]:tw-slide-in-from-bottom tw-inset-x-0 tw-bottom-0 tw-h-auto tw-border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="tw-ring-offset-background focus:tw-ring-ring data-[state=open]:tw-bg-secondary tw-absolute tw-top-4 tw-right-4 tw-rounded-xs tw-opacity-70 tw-transition-opacity hover:tw-opacity-100 focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-outline-hidden disabled:tw-pointer-events-none">
          <XIcon className="tw-size-4" />
          <span className="tw-sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("tw-flex tw-flex-col tw-gap-1.5 tw-p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("tw-mt-auto tw-flex tw-flex-col tw-gap-2 tw-p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("tw-text-foreground tw-font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("tw-text-muted-foreground tw-text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
