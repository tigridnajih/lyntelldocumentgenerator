import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
    title: string;
    children: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function Section({ title, children, action, className }: SectionProps) {
    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-teal-700 tracking-wide">{title}</h2>
                {action}
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}
