"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { DocumentFormData } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

export function LiveTotal() {
    const { control } = useFormContext<DocumentFormData>();

    // Watch all relevant fields to trigger re-renders
    const items = useWatch({ control, name: "items" }) || [];
    const gstList = useWatch({ control, name: "gstList" }) || [];

    // Calculate totals
    const subTotal = items.reduce((sum, item) => {
        return sum + (Number(item.rate) || 0) * (Number(item.quantity) || 0);
    }, 0);

    const gstTotal = gstList.reduce((sum, gst) => {
        return sum + (subTotal * (Number(gst.rate) || 0)) / 100;
    }, 0);

    const grandTotal = subTotal + gstTotal;

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(amount);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4"
        >
            <h3 className="font-semibold text-teal-700 tracking-wide">Payment Summary</h3>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subTotal)}</span>
                </div>

                <AnimatePresence>
                    {gstList.map((gst, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex justify-between text-slate-600"
                        >
                            <span>{gst.type} ({gst.rate}%)</span>
                            <span>{formatCurrency((subTotal * (Number(gst.rate) || 0)) / 100)}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="border-t border-slate-200 pt-4 flex justify-between font-bold text-lg">
                <span className="text-slate-900">Total</span>
                <span className="text-teal-600">{formatCurrency(grandTotal)}</span>
            </div>
        </motion.div>
    );
}
