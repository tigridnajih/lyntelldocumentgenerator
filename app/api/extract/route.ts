import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "",
});

const systemPrompt = `
You are a precise data extraction assistant for a business document generator.
Your task is to extract structured client and invoice details from a voice transcript.

STRICT EXTRACTION RULES:
1. Extract these fields:
    - clientDetails: { clientName, clientCompany, clientEmail, clientLocality, clientCity, clientPincode, clientState }
    - invoiceDetails: { invoiceNumber, invoiceDate }
    - items: array of { name, rate, quantity }
    - gstList: array of { type (CGST/SGST/IGST), rate }

2. TRANSLATION & NAMES (CRITICAL):
    - Input transcript may be in any language (e.g., Malayalam, Hindi).
    - YOU MUST INTELLIGENTLY TRANSLATE values to English (e.g., "കണ്ണൂർ" -> "Kannur").
    - PROPER NAMES: Transliterate to English script.

3. Return JSON ONLY.
    - Format: { "clientDetails": { ... }, "invoiceDetails": { ... }, "items": [ ... ], "gstList": [ ... ] }
    - If a field is not mentioned, exclude it or set it to null.
    - Do not return markdown code blocks. Just the raw JSON.
`;

export async function POST(req: Request) {
    console.log("Debug [Extract]: GROQ_API_KEY loaded?", !!process.env.GROQ_API_KEY);

    try {
        const body = await req.json();
        const { text } = body;

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json({ error: "Groq API Key not configured" }, { status: 500 });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Extract data from this transcript: "${text}"` },
            ],
            model: "llama-3.3-70b-versatile", // Fast and good enough for extraction
            temperature: 0,
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No content from Groq");
        }

        const extractedData = JSON.parse(content);

        return NextResponse.json({ success: true, data: extractedData });
    } catch (error: any) {
        console.error("Extraction error details:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to extract data" },
            { status: 500 }
        );
    }
}
