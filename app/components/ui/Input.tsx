import { ComponentProps, forwardRef, ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends ComponentProps<"input"> {
    startIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, startIcon, ...props }, ref) => {
        return (
            <div className="relative w-full">
                {startIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                        {startIcon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-neutral-600",
                        startIcon ? "pl-10" : "",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);
Input.displayName = "Input";
