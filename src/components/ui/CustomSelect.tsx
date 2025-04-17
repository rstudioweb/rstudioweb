"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Option = {
    label: string;
    value: string;
};

type CustomSelectProps = {
    options: Option[];
    placeholder?: string;
    onChange: (value: string) => void;
    value?: string;
};

export default function CustomSelect({
    options,
    placeholder = "Select an option",
    onChange,
    value,
}: CustomSelectProps) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-red-500"
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent
                position="popper"
                side="top"
                sideOffset={4}
                className="z-[9999] w-[var(--radix-select-trigger-width)] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl"
            >
                {options.map((option) => (
                    <SelectItem
                        key={option.value}
                        value={option.value}
                        className="px-3 py-2 cursor-pointer text-sm text-gray-900 dark:text-white hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    >
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
