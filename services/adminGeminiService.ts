// [עברית] קובץ שירות חדש ונפרד זה מיועד אך ורק ללוגיקה של מצב הניהול.
// הוא מכיל פונקציית ניתוח עומק חזקה יותר מהגרסה הרגילה.

import { GoogleGenAI, Type } from '@google/genai';
import type { PayslipData } from '../types';

// [עברית] הגדרת החיבור ל-API
const geminiAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

// [עברית] הסכמה נשארת זהה, מכיוון שמבנה הנתונים הסופי שאנו רוצים לשמור הוא עקבי.
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
        summary: { type: Type.STRING, description: "סיכום קצר בעברית של עיקרי התלוש בפסקה אחת." },
        categories: {
            type: Type.ARRAY,
            description: "רשימה של כל הקטגוריות המופיעות בתלוש, עם הפריטים המשויכים לכל אחת.",
            items: {
                type: Type.OBJECT,
                properties: {
                    categoryTitle: { 
                        type: Type.STRING, 
                        description: "שם הקטגוריה בדיוק כפי שמופיע בתלוש (למשל, 'תשלומים', 'ניכויי חובה', 'הפרשות מעסיק')." 
                    },
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                description: { type: Type.STRING, description: "שם הפריט או הרכיב (למשל 'שכר יסוד', 'מס הכנסה')." },
                                value: { type: Type.STRING, description: "הערך של הפריט (יכול להיות סכום כספי, מספר ימים, אחוז, וכו'). יש לכלול סמל מטבע או יחידה במידת הצורך." }
                            },
                            required: ["description", "value"]
                        }
                    }
                },
                required: ["categoryTitle", "items"]
            }
        }
    },
    required: ["employeeName", "employeeId", "employerName", "payPeriod", "grossSalary", "netSalary", "totalDeductions", "summary", "categories"]
};

/**
 * [עברית] פונקציית ניתוח העומק החדשה למצב ניהול.
 * היא משתמשת בפרומפט קפדני יותר ובמודל חזק יותר כדי להבטיח דיוק מרבי.
 * @param parts - מערך של חלקי התמונה לניתוח.
 * @returns - הבטחה לנתוני התלוש המנותחים.
 */
export const deepAnalyzePayslip = async (parts: { base64Image: string, mimeType: string }[]): Promise<PayslipData> => {
    console.log(`Starting ADMIN deep analysis for ${parts.length} parts...`);

    // [עברית] שלב 1: זיהוי טקסט (OCR) - זהה לשירות הרגיל.
    const ocrPromises = parts.map(part => {
        return geminiAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: part.base64Image, mimeType: part.mimeType } },
                    { text: "בצע זיהוי תווים אופטי (OCR) על התמונה הזו וחלץ את כל הטקסט שאתה רואה, בדיוק כפי שהוא מופיע. פלט רק את הטקסט הגולמי." }
                ]
            }
        });
    });

    const ocrResponses = await Promise.all(ocrPromises);
    const combinedText = ocrResponses.map(response => response.text).join('\n\n---\n\n');
    console.log("Admin OCR complete. Combined text generated.");

    // [עברית] שלב 2: ניתוח עומק עם פרומפט מחוזק.
    const analysisPrompt = `
אתה מומחה לחילוץ נתונים פיננסיים עם דיוק של 100%. משימתך היא לבצע ניתוח עומק קפדני של הטקסט הבא, אשר חולץ מתלוש שכר ישראלי באמצעות OCR. המטרה שלך היא שלמות ודיוק מוחלטים.

**הוראות מחייבות:**
1.  **בחינת כל פרט:** אל תתעלם מאף מספר או מילה. חלץ הכל, כולל הערות שוליים, סיכומים וטבלאות נתונים מצטברים (כמו 'סכומים מצטברים לשנת המס').
2.  **תיקון עצמי:** טקסט ה-OCR עלול להכיל שגיאות. השתמש בידע שלך בעברית ובמונחים פיננסיים כדי לפרש ולתקן אותם. לדוגמה, אם אתה רואה 'שכר יסור', עליך לתקן אותו ל'שכר יסוד'.
3.  **בניית מבנה קפדנית:** עליך לזהות כל טבלה ומקטע נפרדים וליצור עבורם קטגוריה נפרדת בפלט ה-JSON. זה כולל, בין היתר: 'תשלומים', 'ניכויים', 'ניכויי חובה', 'ניכויי רשות', 'הפרשות מעסיק', 'סכומים מצטברים לשנת המס', 'נתונים ויתרות חופשה'. כותרת הקטגוריה חייבת להיות זהה לכותרת שבתלוש.
4.  **חילוץ מלא:** ודא שכל פריט בתוך כל קטגוריה מחולץ עם התיאור והערך התואמים לו. אל תפספס אף שורה.
5.  **פורמט JSON:** הפלט הסופי חייב להיות אובייקט JSON גולמי יחיד התואם בקפדנות לסכמה שסופקה. אל תכלול שום טקסט הסבר, עיצוב Markdown, או כל דבר אחר מלבד אובייקט ה-JSON עצמו.

נתח את הטקסט הבא בדיוק המרבי:
\`\`\`text
${combinedText}
\`\`\`
`;

    const analysisResponse = await geminiAI.models.generateContent({
        model: 'gemini-2.5-pro', // [עברית] שימוש במודל חזק יותר לניתוח עומק
        contents: { parts: [{ text: analysisPrompt }] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: payslipSchema
        }
    });
    
    const jsonText = analysisResponse.text.trim();
    try {
        console.log("Admin deep analysis complete. Parsing JSON...");
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Failed to parse JSON from Admin Gemini response:", jsonText);
        throw new Error("התשובה שחזרה מהבינה המלאכותית לא הייתה בפורמט JSON תקין.");
    }
};