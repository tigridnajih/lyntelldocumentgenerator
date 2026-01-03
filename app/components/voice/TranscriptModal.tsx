"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptModalProps {
    isOpen: boolean;
    transcript: string;
    isProcessing: boolean;
    onClose: () => void;
    onProceed: (finalText: string) => void;
}

export function TranscriptModal({
    isOpen,
    transcript,
    isProcessing,
    onClose,
    onProceed,
}: TranscriptModalProps) {
    const [text, setText] = useState(transcript);

    useEffect(() => {
        setText(transcript);
    }, [transcript]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Review Transcript</h3>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="text-neutral-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-neutral-400">
                        Edit the text if needed before extraction:
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isProcessing}
                        className="w-full h-40 bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono text-sm leading-relaxed"
                        placeholder="Transcript will appear here..."
                    />
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onProceed(text)}
                        disabled={isProcessing || !text.trim()}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-lg bg-orange-500 text-white font-medium transition-all",
                            isProcessing
                                ? "opacity-70 cursor-wait"
                                : "hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
                        )}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Proceed
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
