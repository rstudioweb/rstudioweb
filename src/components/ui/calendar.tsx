"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("tw-p-3", className)}
      classNames={{
        months: "tw-flex tw-flex-col sm:tw-flex-row tw-gap-2",
        month: "tw-flex tw-flex-col tw-gap-4",
        caption: "tw-flex tw-justify-center tw-pt-1 tw-relative tw-items-center tw-w-full",
        caption_label: "tw-text-sm tw-font-medium",
        nav: "tw-flex tw-items-center tw-gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "tw-size-7 tw-bg-transparent tw-p-0 tw-opacity-50 hover:tw-opacity-100"
        ),
        nav_button_previous: "tw-absolute tw-left-1",
        nav_button_next: "tw-absolute tw-right-1",
        table: "tw-w-full tw-border-collapse tw-space-x-1",
        head_row: "tw-flex",
        head_cell:
          "tw-text-muted-foreground tw-rounded-md tw-w-8 tw-font-normal tw-text-[0.8rem]",
        row: "tw-flex tw-w-full tw-mt-2",
        cell: cn(
          "tw-relative tw-p-0 tw-text-center tw-text-sm focus-within:tw-relative focus-within:tw-z-20 [&:has([aria-selected])]:tw-bg-accent [&:has([aria-selected].day-range-end)]:tw-rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:tw-rounded-r-md [&:has(>.day-range-start)]:tw-rounded-l-md first:[&:has([aria-selected])]:tw-rounded-l-md last:[&:has([aria-selected])]:tw-rounded-r-md"
            : "[&:has([aria-selected])]:tw-rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "tw-size-8 tw-p-0 tw-font-normal aria-selected:tw-opacity-100"
        ),
        day_range_start:
          "tw-day-range-start aria-selected:tw-bg-primary aria-selected:tw-text-primary-foreground",
        day_range_end:
          "tw-day-range-end aria-selected:tw-bg-primary aria-selected:tw-text-primary-foreground",
        day_selected:
          "tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary hover:tw-text-primary-foreground focus:tw-bg-primary focus:tw-text-primary-foreground",
        day_today: "tw-bg-accent tw-text-accent-foreground",
        day_outside:
          "tw-day-outside tw-text-muted-foreground aria-selected:tw-text-muted-foreground",
        day_disabled: "tw-text-muted-foreground tw-opacity-50",
        day_range_middle:
          "aria-selected:tw-bg-accent aria-selected:tw-text-accent-foreground",
        day_hidden: "tw-invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("tw-size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("tw-size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}

export { Calendar }
