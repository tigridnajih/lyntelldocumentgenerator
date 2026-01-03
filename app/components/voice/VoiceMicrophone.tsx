"use client";

import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceMicrophoneProps {
    isListening: boolean;
    onToggle: () => void;
}

export function VoiceMicrophone({ isListening, onToggle }: VoiceMicrophoneProps) {
    return (
        <button
            onClick={onToggle}
            type="button"
            className={cn(
                "fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-lg transition-all duration-300",
                isListening
                    ? "bg-red-600 hover:bg-red-700 animate-pulse"
                    : "bg-teal-600 hover:bg-teal-500 hover:scale-105"
            )}
            title={isListening ? "Stop Recording" : "Start Voice Input"}
        >
            {isListening ? (
                <Square className="w-6 h-6 text-white fill-current" />
            ) : (
                <Mic className="w-6 h-6 text-white" />
            )}
        </button>
    );
}
