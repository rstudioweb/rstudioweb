"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("tw-grid tw-gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "tw-border-input tw-text-primary focus-visible:tw-border-ring focus-visible:tw-ring-ring/50 aria-invalid:tw-ring-destructive/20 dark:aria-invalid:tw-ring-destructive/40 aria-invalid:tw-border-destructive dark:tw-bg-input/30 tw-aspect-square tw-size-4 tw-shrink-0 tw-rounded-full tw-border tw-shadow-xs tw-transition-[color,box-shadow] tw-outline-none focus-visible:tw-ring-[3px] disabled:tw-cursor-not-allowed disabled:tw-opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="tw-relative tw-flex tw-items-center tw-justify-center"
      >
        <CircleIcon className="tw-fill-primary tw-absolute tw-top-1/2 tw-left-1/2 tw-size-2 tw--translate-x-1/2 tw--translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
