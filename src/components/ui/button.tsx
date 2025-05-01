import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-rounded-md tw-text-sm tw-font-medium tw-transition-all disabled:tw-pointer-events-none disabled:tw-opacity-50 [&_svg]:tw-pointer-events-none [&_svg:not([class*=size-])]:tw-size-4 tw-shrink-0 [&_svg]:tw-shrink-0 tw-outline-none focus-visible:tw-border-neutral-950 focus-visible:tw-ring-neutral-950/50 focus-visible:tw-ring-[3px] aria-invalid:tw-ring-red-500/20 dark:aria-invalid:tw-ring-red-500/40 aria-invalid:tw-border-red-500 dark:focus-visible:tw-border-neutral-300 dark:focus-visible:tw-ring-neutral-300/50 dark:aria-invalid:tw-ring-red-900/20 dark:dark:aria-invalid:tw-ring-red-900/40 dark:aria-invalid:tw-border-red-900",
  {
    variants: {
      variant: {
        default:
          "tw-bg-neutral-900 tw-text-neutral-50 tw-shadow-xs hover:tw-bg-neutral-900/90 dark:tw-bg-neutral-50 dark:tw-text-neutral-900 dark:hover:tw-bg-neutral-50/90",
        destructive:
          "tw-bg-red-500 tw-text-white tw-shadow-xs hover:tw-bg-red-500/90 focus-visible:tw-ring-red-500/20 dark:focus-visible:tw-ring-red-500/40 dark:tw-bg-red-500/60 dark:tw-bg-red-900 dark:hover:tw-bg-red-900/90 dark:focus-visible:tw-ring-red-900/20 dark:dark:focus-visible:tw-ring-red-900/40 dark:dark:tw-bg-red-900/60",
        outline:
          "tw-border tw-bg-white tw-shadow-xs hover:tw-bg-neutral-100 hover:tw-text-neutral-900 dark:tw-bg-neutral-200/30 dark:tw-border-neutral-200 dark:hover:tw-bg-neutral-200/50 dark:tw-bg-neutral-950 dark:hover:tw-bg-neutral-800 dark:hover:tw-text-neutral-50 dark:dark:tw-bg-neutral-800/30 dark:dark:tw-border-neutral-800 dark:dark:hover:tw-bg-neutral-800/50",
        secondary:
          "tw-bg-neutral-100 tw-text-neutral-900 tw-shadow-xs hover:tw-bg-neutral-100/80 dark:tw-bg-neutral-800 dark:tw-text-neutral-50 dark:hover:tw-bg-neutral-800/80",
        ghost:
          "hover:tw-bg-neutral-100 hover:tw-text-neutral-900 dark:hover:tw-bg-neutral-100/50 dark:hover:tw-bg-neutral-800 dark:hover:tw-text-neutral-50 dark:dark:hover:tw-bg-neutral-800/50",
        link: "tw-text-neutral-900 tw-underline-offset-4 hover:tw-underline dark:tw-text-neutral-50",
      },
      size: {
        default: "tw-h-9 tw-px-4 tw-py-2 has-[>svg]:tw-px-3",
        sm: "tw-h-8 tw-rounded-md tw-gap-1.5 tw-px-3 has-[>svg]:tw-px-2.5",
        lg: "tw-h-10 tw-rounded-md tw-px-6 has-[>svg]:tw-px-4",
        icon: "tw-size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
