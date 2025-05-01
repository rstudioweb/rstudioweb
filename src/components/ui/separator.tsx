"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "tw-bg-neutral-200 tw-shrink-0 data-[orientation=horizontal]:tw-h-px data-[orientation=horizontal]:tw-w-full data-[orientation=vertical]:tw-h-full data-[orientation=vertical]:tw-w-px dark:tw-bg-neutral-800",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
