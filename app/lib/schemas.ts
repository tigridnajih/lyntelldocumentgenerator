import { z } from "zod";

export const documentFormSchema = z.object({
    clientDetails: z.object({
        clientName: z.string().min(1, "Client name is required"),
        clientCompany: z.string().optional(),
        clientEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
        clientLocality: z.string().optional(),
        clientCity: z.string().optional(),
        clientPincode: z.string().or(z.number()).optional(),
        clientState: z.string().optional(),
    }),
    invoiceDetails: z.object({
        invoiceNumber: z.string().optional(),
        invoiceDate: z.string().optional(),
    }).optional(),
    items: z.array(
        z.object({
            name: z.string().min(1, "Item name is required"),
            rate: z.coerce.number().min(0),
            quantity: z.coerce.number().min(1),
        })
    ),
    gstList: z.array(
        z.object({
            type: z.enum(["CGST", "SGST", "IGST"]),
            rate: z.coerce.number().min(0),
        })
    ).optional(),
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;
