"use client";

import { useFormContext } from "react-hook-form";

export function PurchaseOrderFields() {
    const { register } = useFormContext();

    return (
        <div className="space-y-5 animate-[fade-in_0.3s_ease-out]">
            {/* Material */}
            <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                    Material<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                    {...register("purchaseOrderDetails.material")}
                    placeholder="Select Material..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all placeholder:text-slate-400 text-slate-900"
                />
            </div>

            {/* Quantity & Variant Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Quantity */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800">
                        Quantity<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                        {...register("purchaseOrderDetails.quantity")}
                        placeholder="e.g. 500"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all placeholder:text-slate-400 text-slate-900"
                    />
                </div>

                {/* Variant */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800">
                        Variant<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                        {...register("purchaseOrderDetails.variant")}
                        placeholder="e.g. Grade A"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all placeholder:text-slate-400 text-slate-900"
                    />
                </div>
            </div>

            {/* Brand & Unit Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800">
                        Brand<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                        {...register("purchaseOrderDetails.brand")}
                        placeholder="e.g. Brand A"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all placeholder:text-slate-400 text-slate-900"
                    />
                </div>

                {/* Unit */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800">
                        Unit<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                        {...register("purchaseOrderDetails.unit")}
                        placeholder="Select or type unit"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all placeholder:text-slate-400 text-slate-900"
                    />
                </div>
            </div>

            {/* Vendors (Multiple) */}
            <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                    Vendors (Multiple)<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                    {...register("purchaseOrderDetails.vendors")}
                    placeholder="Select Vendors..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all placeholder:text-slate-400 text-slate-900"
                />
            </div>

            {/* Description (Optional) */}
            <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                    Description <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                </label>
                <textarea
                    {...register("purchaseOrderDetails.description")}
                    rows={4}
                    placeholder="Add any specific requirements..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all placeholder:text-slate-400 text-slate-900 resize-y"
                />
            </div>
        </div>
    );
}
