"use client";

import { useFormContext } from "react-hook-form";
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { VoiceMicrophone } from "./VoiceMicrophone";
import { TranscriptModal } from "./TranscriptModal";

// Define strict types for window.SpeechRecognition
type SpeechRecognitionEvent = Event & {
    results: {
        [index: number]: {
            [index: number]: {
                transcript: string;
            };
        };
        length: number;
    };
};

type SpeechRecognitionErrorEvent = Event & {
    error: string;
    message?: string;
};

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
    new(): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}

export function VoiceManager() {
    const { setValue } = useFormContext();
    const [isListening, setIsListening] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showPermissionHelp, setShowPermissionHelp] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isListeningRef = useRef(false); // Helper ref for immediate logic

    useEffect(() => {
        // Initialize SpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
                // ZOMBIE FIX: strict check
                if (!isListeningRef.current) return;

                let finalTranscript = "";
                for (let i = 0; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result && result[0]) {
                        finalTranscript += result[0].transcript;
                    }
                }
                setTranscript(finalTranscript);
            };

            recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error("Speech Recognition Error:", event.error);
                if (event.error === "not-allowed") {
                    setShowPermissionHelp(true);
                    toast.error("Microphone blocked.");
                }
                stopRecordingState();
            };

            recognitionRef.current.onend = () => {
                // Auto-stop if silent or explicitly stopped
                stopRecordingState();
            };
        }
    }, []);

    const stopRecordingState = () => {
        isListeningRef.current = false;
        setIsListening(false);
    };

    const checkMicrophoneAccess = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((track) => track.stop());
            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                errorName: error.name || "UnknownError",
            };
        }
    };

    const toggleListening = useCallback(async () => {
        if (!recognitionRef.current) {
            toast.error("Voice input is not supported in this browser.");
            return;
        }

        if (isListening) {
            // STOP COMMAND
            isListeningRef.current = false; // Immediate flag kill
            setIsListening(false);
            recognitionRef.current.stop();
            setShowModal(true);
        } else {
            // START COMMAND
            const result = await checkMicrophoneAccess();

            if (!result.success) {
                if (result.errorName === "NotAllowedError" || result.errorName === "PermissionDeniedError") {
                    setShowPermissionHelp(true);
                } else {
                    toast.error("Microphone check failed. Please check connection.");
                }
                return;
            }

            setTranscript("");
            setShowPermissionHelp(false);
            try {
                isListeningRef.current = true;
                setIsListening(true);
                recognitionRef.current.start();
                toast.info("Listening... Speak now.");
            } catch (err) {
                console.error(err);
                toast.error("Failed to start recording");
                stopRecordingState();
            }
        }
    }, [isListening]);

    const handleProceed = async (finalText: string) => {
        setIsProcessing(true);
        try {
            const response = await fetch("/api/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: finalText }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Extraction failed");
            }

            const { data } = await response.json();

            let updatedCount = 0;
            const processFields = (obj: any, prefix: string = "") => {
                Object.keys(obj).forEach(key => {
                    const value = obj[key];

                    if (value !== null && value !== undefined && value !== "") {
                        if (typeof value === 'object' && !Array.isArray(value)) {
                            // Recursively process nested objects (like clientDetails)
                            processFields(value, prefix ? `${prefix}.${key}` : key);
                        } else {
                            // Directly set fields or arrays (items/gstList)
                            const fieldPath = prefix ? `${prefix}.${key}` : key;
                            setValue(fieldPath as any, value, {
                                shouldValidate: true,
                                shouldDirty: true,
                                shouldTouch: true
                            });
                            updatedCount++;
                        }
                    }
                });
            };

            processFields(data);

            if (updatedCount > 0) {
                toast.success(`Updated ${updatedCount} fields successfully`);
            } else {
                toast.info("No matching fields found in transcript");
            }

            setShowModal(false);
            setTranscript("");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to process command");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <VoiceMicrophone isListening={isListening} onToggle={toggleListening} />

            <TranscriptModal
                isOpen={showModal}
                transcript={transcript}
                isProcessing={isProcessing}
                onClose={() => setShowModal(false)}
                onProceed={handleProceed}
            />

            {showPermissionHelp && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
                    {/* Same modal content as before */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md shadow-2xl p-6 text-center space-y-6">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                            <div className="w-8 h-8 text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">Microphone Blocked</h3>
                            <p className="text-neutral-400 text-sm">Permission was denied.</p>
                        </div>
                        <div className="bg-neutral-950 rounded-lg p-4 text-left space-y-3 text-sm border border-neutral-800">
                            <p className="font-semibold text-white">Enable access:</p>
                            <ol className="list-decimal list-inside space-y-2 text-neutral-400">
                                <li>Click <span className="text-white font-medium">Lock Icon 🔒</span> in URL bar.</li>
                                <li>Toggle <strong>Microphone</strong> to <span className="text-green-500 font-medium">Allow</span>.</li>
                                <li>Refresh.</li>
                            </ol>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowPermissionHelp(false)} className="flex-1 px-4 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition">Close</button>
                            <button onClick={() => window.location.reload()} className="flex-1 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition">Reload Page</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
