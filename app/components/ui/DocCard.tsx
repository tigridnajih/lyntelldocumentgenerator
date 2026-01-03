"use client";

import { useRef, useState, MouseEvent, ReactNode } from "react";
import { DocType } from "@/lib/types";
import { clsx } from "clsx";

interface DocCardProps {
    label: string;
    description: string;
    type: DocType;
    currentType: DocType;
    onSelect: (type: DocType) => void;
    icon?: ReactNode;
}

export function DocCard({
    label,
    description,
    type,
    currentType,
    onSelect,
    icon,
}: DocCardProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleMouseEnter = () => {
        setIsFocused(true);
    };

    const handleMouseLeave = () => {
        setIsFocused(false);
    };

    const active = currentType === type;

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onSelect(type)}
            className={clsx(
                "relative overflow-hidden rounded-2xl border bg-white p-5 cursor-pointer transition-colors duration-300 group shadow-sm hover:shadow-md",
                active ? "border-teal-500 ring-1 ring-teal-500" : "border-slate-200 hover:border-slate-300"
            )}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(13,148,136,.1), transparent 40%)`,
                }}
            />
            <div className="relative z-10">
                {icon && <div className={clsx("mb-3 transition-colors", active ? "text-teal-600" : "text-slate-500 group-hover:text-teal-600")}>{icon}</div>}
                <h3 className={clsx("font-semibold mb-1 transition-colors", active ? "text-teal-900" : "text-slate-900")}>{label}</h3>
                <p className="text-sm text-slate-500 group-hover:text-slate-600">{description}</p>
            </div>

            {active && (
                <div className="absolute inset-0 bg-teal-50/50 pointer-events-none" />
            )}
        </div>
    );
}
