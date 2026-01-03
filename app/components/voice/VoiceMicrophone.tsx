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
                    ? "bg-teal-700 hover:bg-teal-800 animate-pulse ring-4 ring-teal-500/30"
                    : "bg-teal-600 hover:bg-teal-500 hover:scale-105 shadow-lg shadow-teal-500/20"
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
