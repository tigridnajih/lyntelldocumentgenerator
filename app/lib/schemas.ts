import { z } from "zod";

export const purchaseOrderDetailsSchema = z.object({
    material: z.string().optional(),
    quantity: z.union([z.string(), z.number()]).optional(),
    variant: z.string().optional(),
    brand: z.string().optional(),
    unit: z.string().optional(),
    vendors: z.union([z.string(), z.array(z.string())]).optional(),
    description: z.string().optional(),
});

export const documentFormSchema = z.object({
    clientDetails: z.object({
        clientName: z.string().optional(),
        clientCompany: z.string().optional(),
        clientEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
        clientLocality: z.string().optional(),
        clientCity: z.string().optional(),
        clientPincode: z.union([z.string(), z.number()]).optional(),
        clientState: z.string().optional(),
    }).optional(),
    invoiceDetails: z.object({
        invoiceNumber: z.string().optional(),
        invoiceDate: z.string().optional(),
    }).optional(),
    items: z.array(
        z.object({
            name: z.string().optional(),
            rate: z.number().optional(),
            quantity: z.number().optional(),
        })
    ).optional(),
    gstList: z.array(
        z.object({
            type: z.enum(["CGST", "SGST", "IGST"]),
            rate: z.number().optional(),
        })
    ).optional(),
    purchaseOrderDetails: purchaseOrderDetailsSchema.optional(),
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;
export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderDetailsSchema>;
