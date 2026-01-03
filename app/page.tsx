"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, Building2, Mail, MapPin, Map, Navigation, FileText, FileCheck, FileSpreadsheet, Hash, Calendar } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Section } from "@/components/ui/Section";
import { DocCard } from "@/components/ui/DocCard";
import { ShineButton } from "@/components/ui/ShineButton";
import { InvoiceFields } from "@/components/feature/InvoiceFields";
import { LiveTotal } from "@/components/feature/LiveTotal";
import { VoiceManager } from "@/components/voice/VoiceManager";
import { DocumentSuccessModal } from "@/components/voice/DocumentSuccessModal";
import { DocType } from "@/lib/types";
import { API_URL } from "@/lib/constants";
import { documentFormSchema, DocumentFormValues } from "@/lib/schemas";

export default function Home() {
  const [docType, setDocType] = useState<DocType>("proposal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    fileName: string;
    downloadUrl: string;
    viewUrl?: string;
  } | null>(null);

  // Initialize form
  const methods = useForm({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      clientDetails: {
        clientName: "",
        clientCompany: "",
        clientEmail: "",
      },
      items: [{ name: "", rate: 0, quantity: 1 }],
      gstList: [{ type: "CGST", rate: 9 }],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  async function onSubmit(values: DocumentFormValues) {
    setIsSubmitting(true);
    const loadingToast = toast.loading("Generating document...");

    try {
      // transform data to match the legacy payload structure expected by n8n
      const data: Record<string, string | number | string[] | null | undefined> = {
        clientName: values.clientDetails.clientName,
        clientCompany: values.clientDetails.clientCompany,
        clientEmail: values.clientDetails.clientEmail,
        clientLocality: values.clientDetails.clientLocality,
        clientCity: values.clientDetails.clientCity,
        clientPincode: values.clientDetails.clientPincode,
        clientState: values.clientDetails.clientState,
        invoiceNumber: values.invoiceDetails?.invoiceNumber,
        invoiceDate: values.invoiceDetails?.invoiceDate,
      };

      // Manually index items as item_1_name, item_1_rate, etc.
      values.items.forEach((item, i) => {
        const index = i + 1;
        data[`item_${index}_name`] = item.name;
        data[`item_${index}_rate`] = String(item.rate);
        data[`item_${index}_quantity`] = String(item.quantity);
      });

      // Pass GST arrays exactly as they are? 
      // Checking original code: it was passing "gst_type[]" and "c_gst[]" via formData entries.
      // So we should construct arrays for these if the backend expects arrays.
      // Wait, original code:
      // const itemNames = formData.getAll("item_name[]");
      // ...
      // for (const [key, value] of formData.entries()) ...
      //
      // It excluded item_*[] from `data` object but included others.
      // GST fields were "gst_type[]" and "c_gst[]".
      // They were NOT specially handled like items, so they were added to `data` as arrays (if getAll) or individual values?
      // "for (const [key, value] of formData.entries())" only iterates one value per key if duplicates exist?
      // No, entries() allows duplicates. But:
      // "data[key] = value;" - this overwrites. So if multiple "gst_type[]" exist, only the LAST one is kept?
      // That sounds like a bug in the original code OR the n8n expects single values or specific handling.
      // Actually, standard FormData entries iteration yields multiple entries. `data[key] = value` overwrites.
      // So the original code MIGHT have been broken for multiple GSTs unless n8n handles it or I misunderstood `entries()`.
      // Let's assume we should send arrays for GST if we want to be safe, or just follow the overwrite behavior if that was intended (unlikely).

      // Let's look closely at original code:
      // const data: Record<string, any> = {};
      // for (const [key, value] of formData.entries()) { ... data[key] = value; }
      //
      // If I interpret this JS correctly, `ost[key] = val` overwrites.
      // So only the last GST row was being sent?
      // That seems wrong. Maybe n8n reads `gst_type[]` as an array automatically?
      // But `data` is a plain JS object here.
      //
      // Let's try to mimic sending arrays for GST if there are multiple.
      // Or maybe just send them as `gst_type`: [v1, v2] if standard JSON handling.
      // The original code was: `body: JSON.stringify(payload)`.
      // If `data` had overwrite, then `JSON.stringify` would show only one.

      // Calculate totals
      const subTotal = values.items.reduce((sum, item) => {
        return sum + (Number(item.rate) || 0) * (Number(item.quantity) || 0);
      }, 0);

      console.log("Generating Invoice Payload v1.2");

      let cgstPrice = 0;
      let sgstPrice = 0;
      let igstPrice = 0;

      // Map GST list to specific keys and calculate prices
      if (values.gstList && values.gstList.length > 0) {
        values.gstList.forEach((gst) => {
          const rate = Number(gst.rate) || 0;
          const taxAmount = (subTotal * rate) / 100;

          if (gst.type === "CGST") {
            data["c_gst"] = String(rate);
            cgstPrice += taxAmount;
            data["cgst_price"] = taxAmount.toFixed(2);
          }
          if (gst.type === "SGST") {
            data["s_gst"] = String(rate);
            sgstPrice += taxAmount;
            data["sgst_price"] = taxAmount.toFixed(2);
          }
          if (gst.type === "IGST") {
            data["i_gst"] = String(rate);
            igstPrice += taxAmount;
            data["igst_price"] = taxAmount.toFixed(2);
          }
        });
      }

      const grandTotal = subTotal + cgstPrice + sgstPrice + igstPrice;

      // Add calculated values to payload
      data["subtotal"] = subTotal.toFixed(2);
      data["total"] = grandTotal.toFixed(2);
      // 'value' often refers to the taxable value or subtotal in some contexts, 
      // or the total value. Mapping subtotal to 'value' as well for potential compatibility.
      data["value"] = subTotal.toFixed(2);

      const payload = {
        documentType: docType,
        data,
      };

      console.log("FINAL PAYLOAD:", payload);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("API Status:", res.status);

      if (!res.ok) throw new Error("Request failed");

      let result = await res.json();
      console.log("Raw API Response:", result);

      // Handle n8n response structure (can be array or object, possibly nested)
      let finalItem = Array.isArray(result) ? result[0] : result;

      // If it's an array, look for an item that is an actual evaluated result (no {{ expression }})
      if (Array.isArray(result)) {
        const evaluatedItem = result.find(
          (item) => {
            const dUrl = item.downloadUrl || item.downloadUrl1;
            return dUrl && !dUrl.includes("{{");
          }
        );
        if (evaluatedItem) finalItem = evaluatedItem;
      }

      // Check for nested data in common n8n wrappers
      const docResponse = finalItem?.data || finalItem?.json || finalItem;

      if (docResponse?.success || docResponse?.downloadUrl || docResponse?.downloadUrl1 || docResponse?.viewUrl || docResponse?.previewUrl1) {
        toast.dismiss(loadingToast);

        // Sanitize URLs (n8n sometimes adds "- " or whitespace)
        const sanitizeUrl = (url: any) => {
          if (typeof url !== "string") return "";
          let sanitized = url.trim().replace(/^- /, "");
          // If the URL still starts with {{, it's an unevaluated n8n expression
          return sanitized.startsWith("{{") || sanitized.startsWith("={{") ? "" : sanitized;
        };

        const finalData = {
          fileName: String(docResponse.fileName || "document.pdf"),
          downloadUrl: sanitizeUrl(docResponse.downloadUrl || docResponse.downloadUrl1),
          viewUrl: sanitizeUrl(docResponse.viewUrl || docResponse.previewUrl || docResponse.previewUrl1 || docResponse.viewUrl1),
        };

        // If even then we have an expression in fileName, try to clean it
        if (typeof finalData.fileName === "string" && finalData.fileName.includes("{{")) {
          finalData.fileName = "document.pdf";
        }

        console.log("SETTING SUCCESS DATA:", finalData);
        setSuccessData(finalData);
        setShowSuccessModal(true);

        toast.success(docResponse.message || "Document generated successfully");
      } else {
        console.error("Response check failed:", result);
        throw new Error("The server responded but did not provide a document URL.");
      }
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(`Failed to generate document: ${err.message || "Unknown error"}`);
      console.error("Submission Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center">
          <Image
            src="/logo.png"
            alt="Tigrid Technologies"
            width={110}
            height={28}
            priority
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <div className="text-center space-y-2">
          <h1 className="font-bold tracking-tight text-3xl sm:text-4xl">
            Business Document <span className="text-teal-600">Generator</span>
          </h1>
          <p className="text-sm text-slate-500">
            Generate professional business documents instantly
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DocCard
            label="Proposal"
            description="Create proposal document"
            type="proposal"
            currentType={docType}
            onSelect={setDocType}
            icon={<FileText className="w-6 h-6" />}
          />
          <DocCard
            label="Quotation"
            description="Create quotation document"
            type="quotation"
            currentType={docType}
            onSelect={setDocType}
            icon={<FileCheck className="w-6 h-6" />}
          />
          <DocCard
            label="Invoice"
            description="Create invoice document"
            type="invoice"
            currentType={docType}
            onSelect={setDocType}
            icon={<FileSpreadsheet className="w-6 h-6" />}
          />
        </div>

        <FormProvider {...methods}>
          <VoiceManager />
          <DocumentSuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            fileName={successData?.fileName || ""}
            downloadUrl={successData?.downloadUrl || ""}
            viewUrl={successData?.viewUrl}
            docType={docType}
          />
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm"
          >
            <Section title="Client Details">
              <Input
                {...register("clientDetails.clientName")}
                placeholder="Client Name"
                startIcon={<User className="w-4 h-4" />}
              />
              {errors.clientDetails?.clientName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.clientDetails.clientName.message}
                </p>
              )}
              <Input
                {...register("clientDetails.clientCompany")}
                placeholder="Client Company"
                startIcon={<Building2 className="w-4 h-4" />}
              />
              <Input
                {...register("clientDetails.clientEmail")}
                placeholder="Client Email"
                type="email"
                startIcon={<Mail className="w-4 h-4" />}
              />
              {errors.clientDetails?.clientEmail && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.clientDetails.clientEmail.message}
                </p>
              )}
              {docType === "invoice" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-[fade-in_0.3s_ease-out]">
                  <Input
                    {...register("clientDetails.clientLocality")}
                    placeholder="Locality"
                    startIcon={<MapPin className="w-4 h-4" />}
                  />
                  <Input
                    {...register("clientDetails.clientCity")}
                    placeholder="City"
                    startIcon={<Building2 className="w-4 h-4" />}
                  />
                  <Input
                    {...register("clientDetails.clientPincode")}
                    placeholder="Pincode"
                    type="number"
                    startIcon={<Navigation className="w-4 h-4" />}
                  />
                  <Input
                    {...register("clientDetails.clientState")}
                    placeholder="State"
                    startIcon={<Map className="w-4 h-4" />}
                  />
                </div>
              )}
            </Section>

            {docType === "invoice" && (
              <Section title="Invoice Details" className="animate-[fade-in_0.4s_ease-out]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    {...register("invoiceDetails.invoiceNumber")}
                    placeholder="Invoice Number"
                    startIcon={<Hash className="w-4 h-4" />}
                  />
                  <Input
                    {...register("invoiceDetails.invoiceDate")}
                    placeholder="Invoice Date (DD/MM/YYYY)"
                    type="date"
                    startIcon={<Calendar className="w-4 h-4" />}
                  />
                </div>
              </Section>
            )}

            {docType === "invoice" && (
              <>
                <InvoiceFields />
                <LiveTotal />
              </>
            )}

            <ShineButton
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Generating..." : `Generate ${docType}`}
            </ShineButton>
          </form>
        </FormProvider>
      </div>
    </main>
  );
}