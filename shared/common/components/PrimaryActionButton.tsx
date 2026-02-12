import * as React from "react";

import { cn } from "@/lib/utils";

type PrimaryActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const PrimaryActionButton = ({ className, ...props }: PrimaryActionButtonProps) => {
    return (
        <button
            type="button"
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-md border border-blue-400/60 bg-linear-to-r from-[#009ad5] to-[#005ca9] px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-200/60 transition-all",
                "hover:from-[#00b1e8] hover:to-[#0070c9] hover:shadow-lg hover:shadow-blue-200/80",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                "disabled:pointer-events-none disabled:opacity-60 dark:shadow-none dark:focus-visible:ring-offset-slate-950",
                className
            )}
            {...props}
        />
    );
};

export default PrimaryActionButton;

