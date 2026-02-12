"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectInputOption = { label: string; value: string };

type SelectInputProps = {
    value?: string;
    onChange: (value: string) => void;
    options: SelectInputOption[];
    placeholder?: string;
    allowCustom?: boolean;
    disabled?: boolean;
};

const SelectInput = ({
    value,
    onChange,
    options,
    placeholder,
    allowCustom = true,
    disabled = false,
}: SelectInputProps) => {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value ?? "");

    // Helper function to get the display value (label if it matches an option, otherwise the raw value)
    const getDisplayValue = (val: string | undefined) => {
        if (!val) return "";
        const matchedOption = options.find((option) => option.value === val);
        return matchedOption ? matchedOption.label : val;
    };

    useEffect(() => {
        setInputValue(getDisplayValue(value));
    }, [value]);

    const filteredOptions = useMemo(() => {
        const term = inputValue.trim().toLowerCase();
        if (!term) return options;
        return options.filter((option) =>
            `${option.label} ${option.value}`.toLowerCase().includes(term)
        );
    }, [inputValue, options]);

    const resolveOptionValue = (raw: string) => {
        const normalized = raw.trim().toLowerCase();
        if (!normalized) return "";
        const match = options.find(
            (option) =>
                option.value.toLowerCase() === normalized ||
                option.label.toLowerCase() === normalized
        );
        if (match) return match.value;
        return allowCustom ? raw.trim() : "";
    };

    const commitValue = (raw: string) => {
        const resolved = resolveOptionValue(raw);
        if (!resolved) {
            if (!allowCustom) {
                setInputValue(getDisplayValue(value));
            }
            return;
        }
        onChange(resolved);
        setInputValue(getDisplayValue(resolved));
        setOpen(false);
    };

    return (
        <div className="relative">
            <input
                className={cn(
                    "h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
                    "focus-visible:border-slate-400 focus-visible:ring-slate-200 focus-visible:ring-2 hover:border-slate-300",
                    "dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-700/60 dark:hover:border-slate-600",
                    "disabled:pointer-events-none disabled:opacity-50"
                )}
                placeholder={placeholder}
                value={inputValue}
                onChange={(event) => {
                    const nextValue = event.target.value;
                    setInputValue(nextValue);
                    if (allowCustom) {
                        onChange(nextValue);
                    }
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => {
                    setTimeout(() => setOpen(false), 120);
                    if (allowCustom) {
                        commitValue(inputValue);
                    } else {
                        setInputValue(getDisplayValue(value));
                    }
                }}
                onKeyDown={(event) => {
                    if (["Enter", "Tab", ","].includes(event.key)) {
                        event.preventDefault();
                        commitValue(inputValue);
                    }
                }}
                disabled={disabled}
            />
            {open && filteredOptions.length > 0 && (
                <div className="absolute z-20 mt-2 max-h-[30vh] w-full overflow-y-auto rounded-md border border-blue-100 bg-white p-2 shadow-lg dark:border-slate-700/60 dark:bg-slate-900">
                    {filteredOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onMouseDown={(event) => {
                                event.preventDefault();
                                commitValue(option.value);
                            }}
                            className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-slate-800"
                        >
                            <span>{option.label}</span>
                            {value === option.value && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SelectInput;

