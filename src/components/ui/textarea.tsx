import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "tw-border-input placeholder:tw-text-muted-foreground focus-visible:tw-border-ring focus-visible:tw-ring-ring/50 aria-invalid:tw-ring-destructive/20 dark:aria-invalid:tw-ring-destructive/40 aria-invalid:tw-border-destructive dark:tw-bg-input/30 tw-flex tw-field-sizing-content tw-min-h-16 tw-w-full tw-rounded-md tw-border tw-bg-transparent tw-px-3 tw-py-2 tw-text-base tw-shadow-xs tw-transition-[color,box-shadow] tw-outline-none focus-visible:tw-ring-[3px] disabled:tw-cursor-not-allowed disabled:tw-opacity-50 md:tw-text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
