import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface ShineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const ShineButton = forwardRef<HTMLButtonElement, ShineButtonProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-orange-600 px-6 py-3.5 font-semibold text-white transition-all hover:bg-orange-500 hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
                    className
                )}
                {...props}
            >
                <span className="absolute inset-0 flex h-full w-full -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative z-10">{children}</span>
            </button>
        );
    }
);
ShineButton.displayName = "ShineButton";
