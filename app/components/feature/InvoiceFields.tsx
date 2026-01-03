"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Section } from "@/components/ui/Section";
import { DocumentFormData } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Tag, IndianRupee, Hash, Percent } from "lucide-react";

export function InvoiceFields() {
    const { register, control } = useFormContext<DocumentFormData>();

    const {
        fields: itemFields,
        append: appendItem,
        remove: removeItem,
    } = useFieldArray({
        control,
        name: "items",
    });

    const {
        fields: gstFields,
        append: appendGst,
        remove: removeGst,
    } = useFieldArray({
        control,
        name: "gstList",
    });

    return (
        <>
            <Section
                title="Item Details"
                action={
                    <button
                        type="button"
                        onClick={() => appendItem({ name: "", rate: 0, quantity: 0 })}
                        className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Item
                    </button>
                }
            >
                <AnimatePresence mode="popLayout">
                    {itemFields.map((field, index) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            key={field.id}
                            className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                        >
                            <div className="sm:col-span-6">
                                <Input
                                    {...register(`items.${index}.name` as const)}
                                    placeholder="Item Name"
                                    startIcon={<Tag className="w-4 h-4" />}
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <Input
                                    {...register(`items.${index}.rate` as const, { valueAsNumber: true })}
                                    placeholder="Rate"
                                    type="number"
                                    startIcon={<IndianRupee className="w-4 h-4" />}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Input
                                    {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                                    placeholder="Qty"
                                    type="number"
                                    startIcon={<Hash className="w-4 h-4" />}
                                />
                            </div>
                            <div className="sm:col-span-1 text-right sm:text-center">
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </Section>

            <Section
                title="GST Details"
                action={
                    <button
                        type="button"
                        onClick={() => appendGst({ type: "CGST", rate: 0 })}
                        className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add GST
                    </button>
                }
            >
                <AnimatePresence mode="popLayout">
                    {gstFields.map((field, index) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            key={field.id}
                            className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-center"
                        >
                            <div className="sm:col-span-2 relative">
                                <select
                                    {...register(`gstList.${index}.type` as const)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none"
                                >
                                    <option value="CGST">CGST</option>
                                    <option value="SGST">SGST</option>
                                    <option value="IGST">IGST</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <Input
                                    {...register(`gstList.${index}.rate` as const, { valueAsNumber: true })}
                                    placeholder="GST %"
                                    type="number"
                                    startIcon={<Percent className="w-4 h-4" />}
                                />
                            </div>

                            <div className="sm:col-span-1 text-right sm:text-center">
                                <button
                                    type="button"
                                    onClick={() => removeGst(index)}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </Section>
        </>
    );
}
