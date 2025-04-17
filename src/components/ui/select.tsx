'use client';

import * as React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils'; // utility for class merging (optional)

export const Select = RadixSelect.Root;

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-between w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition',
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
  </RadixSelect.Trigger>
));
SelectTrigger.displayName = RadixSelect.Trigger.displayName;

export const SelectValue = RadixSelect.Value;

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Content>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Portal>
    <RadixSelect.Content
      ref={ref}
      position="popper"
      sideOffset={8}
      className={cn(
        'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl',
        className
      )}
      {...props}
    >
      <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>
    </RadixSelect.Content>
  </RadixSelect.Portal>
));
SelectContent.displayName = RadixSelect.Content.displayName;

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Item>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Item>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Item
    ref={ref}
    className={cn(
      'relative cursor-pointer select-none px-4 py-2 rounded-md text-sm text-zinc-700 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none focus:bg-red-100 dark:focus:bg-red-800',
      className
    )}
    {...props}
  >
    <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    <RadixSelect.ItemIndicator className="absolute right-3 top-1/2 -translate-y-1/2">
      <Check className="h-4 w-4 text-red-600" />
    </RadixSelect.ItemIndicator>
  </RadixSelect.Item>
));
SelectItem.displayName = RadixSelect.Item.displayName;
