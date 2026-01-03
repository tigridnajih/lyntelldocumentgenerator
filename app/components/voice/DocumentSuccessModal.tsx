"use client";

import { Check, Download, ExternalLink, X } from "lucide-react";

interface DocumentSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    downloadUrl: string;
    viewUrl?: string;
    docType?: string;
}

export function DocumentSuccessModal({
    isOpen,
    onClose,
    fileName,
    downloadUrl,
    viewUrl,
    docType,
}: DocumentSuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative bg-[#111111] border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center space-y-6">
                    {/* Success Icon */}
                    <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto border border-orange-500/20">
                        <Check className="w-8 h-8 text-orange-500" />
                    </div>

                    {/* Text Content */}
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white leading-tight">
                            Document Generated!
                        </h3>
                        <p className="text-neutral-400 text-sm">
                            Your <span className="text-white font-medium">{(docType || "document").toUpperCase()}</span> document is ready.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        {viewUrl && (
                            <a
                                href={viewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-all font-medium"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Preview
                            </a>
                        )}
                        {downloadUrl && (
                            <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all font-medium shadow-lg shadow-orange-500/20 ${!viewUrl ? "col-span-2" : ""
                                    }`}
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </a>
                        )}
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
