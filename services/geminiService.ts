
import { GoogleGenAI, Type } from '@google/genai';
import type { PayslipData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const payslipSchema = {
    type: Type.OBJECT,
    properties: {
        employeeName: { type: Type.STRING, description: "שם העובד" },
        employeeId: { type: Type.STRING, description: "תעודת זהות של העובד" },
        employerName: { type: Type.STRING, description: "שם המעסיק" },
        payPeriod: { type: Type.STRING, description: "חודש ושנת התשלום, למשל 'מאי 2024'" },
        grossSalary: { type: Type.NUMBER, description: "סה\"כ ברוטו לתשלום" },
        netSalary: { type: Type.NUMBER, description: "הנטו לתשלום (הסכום הסופי)" },
        totalDeductions: { type: Type.NUMBER, description: "סה\"כ ניכויים" },
        payments: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING, description: "שם רכיב התשלום (למשל 'שכר יסוד')" },
                    amount: { type: Type.NUMBER, description: "סכום הרכיב" }
                },
                required: ["description", "amount"]
            }
        },
        deductions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING, description: "שם רכיב הניכוי (למשל 'מס הכנסה')" },
                    amount: { type: Type.NUMBER, description: "סכום הניכוי" }
                },
                required: ["description", "amount"]
            }
        }
    },
    required: ["employeeName", "employeeId", "employerName", "payPeriod", "grossSalary", "netSalary", "totalDeductions", "payments", "deductions"]
};

export const analyzePayslipImage = async (base64Image: string, mimeType: string): Promise<PayslipData> => {
    // First Pass: Initial data extraction
    const initialPrompt = "Analyze the provided Israeli payslip image and extract the key information according to the JSON schema. This is a first pass, so do your best to capture everything. Be accurate and translate Hebrew terms to the corresponding schema fields. If a field is not found, use a sensible default like an empty string or 0.";
    
    const initialResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType: mimeType } },
                { text: initialPrompt }
            ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: payslipSchema
        }
    });

    const initialJsonText = initialResponse.text.trim();
    const initialData = JSON.parse(initialJsonText);

    // Second Pass: Verification and refinement
    const refinementPrompt = `You are a meticulous financial auditor. An initial analysis of a payslip image has been performed, resulting in the following JSON data. Your task is to carefully review this data against the original image.
    
    Please perform a second pass to:
    1. Verify the accuracy of every field.
    2. Correct any mistakes found in the initial extraction.
    3. Most importantly, identify and add any missing items, especially in the 'payments' and 'deductions' lists. Sometimes the first pass misses line items.
    
    Return the final, complete, and corrected JSON object that perfectly reflects the payslip in the image.

    Initial Extracted Data:
    ${JSON.stringify(initialData, null, 2)}
    `;
    
    const refinedResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType: mimeType } },
                { text: refinementPrompt }
            ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: payslipSchema
        }
    });
    
    const refinedJsonText = refinedResponse.text.trim();
    return JSON.parse(refinedJsonText);
};

export const answerUserQuestion = async (base64Image: string, mimeType: string, question: string): Promise<string> => {
    const prompt = `אתה "גרזני", בוט חכם וידידותי שמנתח תלושי שכר.
    ענה על שאלת המשתמש אך ורק בהתבסס על תמונת תלוש השכר המצורפת.
    סרוק את התמונה בקפידה כדי למצוא את התשובה. אם המידע לא קיים בתמונה, ציין זאת בנימוס. השב בעברית.

    שאלת המשתמש:
    "${question}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType: mimeType } },
                { text: prompt }
            ]
        },
        config: {
            systemInstruction: "You are 'Garnizi', a helpful bot that answers questions about a payslip based ONLY on the provided image. You must answer in Hebrew.",
        }
    });

    return response.text;
};
