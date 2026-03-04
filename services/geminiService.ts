// [עברית] קובץ זה הוא "מרכז התקשורת" שלנו עם הבינה המלאכותית של גוגל (Gemini).
// כל הפונקציות כאן אחראיות על הכנת הבקשות (פרומפטים), שליחתן למודל, ועיבוד התשובות.

import { GoogleGenAI, Type } from '@google/genai';
import type { PayslipData, ChatMessage } from '../types';

// --- הגדרת החיבור ל-API ---
// [עברית] כאן אנו יוצרים אובייקט חדש שדרכו נתקשר עם ה-API של Gemini.
// הוא משתמש ב"מפתח API" סודי שנמצא במשתני הסביבה כדי לאמת אותנו מול השירות של גוגל.
const geminiAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
// --- סוף ההגדרה ---

// [עברית] זוהי "סכמה", או תבנית, שאנו נותנים למודל ה-AI.
// אנחנו אומרים לו: "כשתנתח את התלוש, אני רוצה שתחזיר לי תשובה אך ורק במבנה JSON המדויק הזה".
// זה מבטיח שאנחנו תמיד נקבל נתונים מסודרים שאנחנו יודעים איך לעבוד איתם.
const payslipSchema = {
    type: Type.OBJECT, // [עברית] סוג הנתון הראשי הוא אובייקט
    properties: {      // [עברית] והנה השדות (properties) שלו:
        employeeName: { type: Type.STRING, description: "שם העובד" },
        employeeId: { type: Type.STRING, description: "תעודת זהות של העובד" },
        employerName: { type: Type.STRING, description: "שם המעסיק" },
        payPeriod: { type: Type.STRING, description: "חודש ושנת התשלום, למשל 'מאי 2024'" },
        grossSalary: { type: Type.NUMBER, description: "סה\"כ ברוטו לתשלום" },
        netSalary: { type: Type.NUMBER, description: "הנטו לתשלום (הסכום הסופי)" },
        totalDeductions: { type: Type.NUMBER, description: "סה\"כ ניכויים" },
        summary: { type: Type.STRING, description: "סיכום קצר בעברית של עיקרי התלוש בפסקה אחת." },
        categories: {
            type: Type.ARRAY, // [עברית] שדה זה הוא מערך (רשימה) של קטגוריות
            description: "רשימה של כל הקטגוריות המופיעות בתלוש, עם הפריטים המשויכים לכל אחת.",
            items: { // [עברית] כל פריט במערך הוא אובייקט...
                type: Type.OBJECT,
                properties: { // [עברית] ...עם השדות הבאים:
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
    // [עברית] רשימת כל שדות החובה שהמודל חייב להחזיר.
    required: ["employeeName", "employeeId", "employerName", "payPeriod", "grossSalary", "netSalary", "totalDeductions", "summary", "categories"]
};

/**
 * [עברית] פונקציה זו מנתחת מספר תמונות (חלקים) של תלוש שכר.
 * היא קודם כל מבצעת זיהוי טקסט (OCR) על כל תמונה בנפרד, מאחדת את כל הטקסט, ואז שולחת את הטקסט המאוחד לניתוח.
 * @param parts - מערך של אובייקטים, כל אחד מכיל תמונה וסוג קובץ.
 * @returns - הבטחה לנתוני התלוש המנותחים.
 */
export const analyzePayslipParts = async (parts: { base64Image: string, mimeType: string }[]): Promise<PayslipData> => {
    console.log(`Starting multi-part analysis for ${parts.length} parts...`);

    // [עברית] שלב 1: זיהוי טקסט (OCR) בכל תמונה.
    console.log("Step 1: Performing OCR on all parts...");
    const ocrPromises = parts.map(part => {
        return geminiAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: part.base64Image,
                            mimeType: part.mimeType,
                        },
                    },
                    { text: "בצע זיהוי תווים אופטי (OCR) על התמונה הזו וחלץ את כל הטקסט שאתה רואה, בדיוק כפי שהוא מופיע. פלט רק את הטקסט הגולמי." }
                ]
            }
        });
    });

    const ocrResponses = await Promise.all(ocrPromises);
    const combinedText = ocrResponses.map(response => response.text).join('\n\n---\n\n');
    console.log("OCR complete. Combined text generated.");

    // [עברית] שלב 2: ניתוח הטקסט המאוחד.
    console.log("Step 2: Analyzing combined text...");
    const analysisPrompt = `נתח את הטקסט הבא, המייצג תלוש שכר ישראלי שהורכב ממספר חלקים. חלץ את כל המידע באופן מקיף ומדויק.
**הערה חשובה: הטקסט חולץ באמצעות זיהוי תווים אופטי (OCR) ועלול להכיל שגיאות כתיב קטנות. השתמש בידע שלך על מונחים פיננסיים ובעברית כדי לפרש נכון מילים שנראות שגויות. לדוגמה, 'אשה' צריכה להתפרש כ'אישה', וכן הלאה.**

**הנחיה קריטית: עליך לזהות ולהעתיק את כל הטבלאות והחלקים מהטקסט, כל אחד בתור קטגוריה נפרדת.**
ודא שאתה כולל את כל הקטגוריות, במיוחד:
- 'תשלומים'
- 'ניכויים' (כולל פירוט ניכויי חובה ורשות)
- 'הפרשות מעסיק'
- **'סכומים מצטברים לשנת המס'** (אם קיים)
- כל טבלה או קטגוריה אחרת המופיעה בטקסט.

הפלט שלך חייב להיות אובייקט JSON התואם במדויק למבנה שסופק.

הטקסט לניתוח:
\`\`\`text
${combinedText}
\`\`\`
`;

    const analysisResponse = await geminiAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [{ text: analysisPrompt }]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: payslipSchema
        }
    });
    
    const jsonText = analysisResponse.text.trim();
    try {
        console.log("Multi-part text analysis complete. Parsing JSON...");
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Failed to parse JSON from Gemini response:", jsonText);
        throw new Error("התשובה שחזרה מהבינה המלאכותית לא הייתה בפורמט JSON תקין.");
    }
};


/**
 * [עברית] פונקציה זו מתקנת נתוני תלוש קיימים על סמך משוב מהמשתמש.
 * @param payslipData - אובייקט הנתונים הנוכחי (עם הטעות).
 * @param correctionText - ההסבר של המשתמש מה צריך לתקן.
 * @param correctionImage - תמונה אופציונלית שהמשתמש צירף להמחשת התיקון.
 * @returns - הבטחה לאובייקט הנתונים המתוקן.
 */
export const correctPayslipData = async (
    payslipData: PayslipData, 
    correctionText: string,
    correctionImage?: { base64Image: string; mimeType: string }
): Promise<PayslipData> => {
    console.log("Starting data correction...");

    const parts: any[] = [];

    if (correctionImage) {
        parts.push({
            inlineData: {
                data: correctionImage.base64Image,
                mimeType: correctionImage.mimeType,
            },
        });
    }

    const prompt = `You are an assistant correcting a JSON object representing a payslip based on user feedback.
The user has identified an error in the following data:
\`\`\`json
${JSON.stringify(payslipData, null, 2)}
\`\`\`
The user's correction instruction is: "${correctionText}".
${correctionImage ? "The user has also provided an image snippet highlighting the correct information. Prioritize the information in the image." : ""}
Please analyze the user's correction and the original data. Return a new, complete JSON object with the corrected information. The returned JSON object MUST conform to the original schema.
Only output the raw JSON object, with no other text, markdown, or explanations.`;

    parts.push({ text: prompt });
    
    const response = await geminiAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            responseMimeType: 'application/json',
            responseSchema: payslipSchema, // [עברית] אנו משתמשים באותה סכמה כדי לוודא שגם הפלט המתוקן שומר על המבנה הנכון.
        },
    });

    const jsonText = response.text.trim();
    try {
        console.log("Correction complete. Parsing JSON...");
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Failed to parse JSON from Gemini correction response:", jsonText);
        throw new Error("התשובה שחזרה מהבינה המלאכותית לא הייתה בפורמט JSON תקין.");
    }
};


/**
 * [עברית] עונה על שאלה חופשית של המשתמש, תוך שימוש בנתוני התלוש וחיפוש באינטרנט.
 * @param payslipData - נתוני התלוש המאומתים בפורמט JSON.
 * @param question - שאלת המשתמש החדשה.
 * @param history - מערך של הודעות קודמות בשיחה, לקבלת הקשר.
 * @returns - הבטחה לתשובת הבוט כטקסט.
 */
export const answerUserQuestion = async (
    payslipData: PayslipData,
    question: string,
    history: ChatMessage[]
): Promise<string> => {

    let historyPrompt = "";
    if (history && history.length > 0) {
        const formattedHistory = history
            .map(msg => `${msg.sender === 'user' ? 'המשתמש' : 'אתה'}: ${msg.text}`)
            .join('\n');
        
        historyPrompt = `
להלן היסטוריית השיחה האחרונה. השתמש בה כדי להבין את ההקשר של השאלה החדשה:
--- היסטוריית שיחה ---
${formattedHistory}
--- סוף היסטוריית שיחה ---
`;
    }

    const prompt = `
נתוני התלוש של המשתמש:
\`\`\`json
${JSON.stringify(payslipData, null, 2)}
\`\`\`
${historyPrompt}
שאלת המשתמש החדשה: "${question}"`;

    const response = await geminiAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] },
        config: {
            systemInstruction: `אתה 'יועץ הכלכלה שלך', עוזר אישי שמבין גם בכלכלה וגם בחיי היומיום של העובד. הטון שלך מקצועי אך אנושי.

הנחיות הפעולה המחמירות שלך:
1.  **תשובות ישירות ולעניין:** ענה תמיד תשובות ישירות ולעניין. אל תכתוב פתיחים או סיכומים. אם נשאלת שאלה שמצריכה חישוב או ניתוח – הצג רק את המידע הדרוש ואת התוצאה, בלי הרחבות מיותרות.
2.  **הסברים פשוטים:** אם המשתמש מבקש הסבר, הסבר בצורה פשוטה, קצרה וברורה, בלי להשתמש במונחים מקצועיים מסובכים.
3.  **קישור לתלוש:** אם השאלה אינה קשורה ישירות לתלוש השכר, ענה עליה בכל זאת, אך נסה לקשר את הנושא לתלוש או להשפעות כלכליות על העובד, בהתבסס על נתוני ה-JSON שסופקו.
4.  **שימוש באינטרנט:** כאשר אתה משתמש בחיפוש גוגל כדי לענות על שאלה, **לעולם אל תחזיר קישורים או תציין מקורות**. במקום זאת, סנתז את המידע מהחיפוש וכתוב את התשובה המלאה במילים שלך, בצורה ישירה וברורה. המשתמש צריך לקבל תשובה מוכנה בלי צורך לפתוח קישורים.
5.  **זהות:** אל תציג את עצמך. פשוט ספק את התשובה.`,
            tools: [{googleSearch: {}}],
        }
    });

    return response.text;
};

/**
 * [עברית] עונה על שאלה חופשית של המשתמש, בהתבסס על מערך של מספר תלושי שכר.
 * @param allPayslipData - מערך של כל נתוני התלושים המאומתים.
 * @param question - שאלת המשתמש החדשה.
 * @param history - היסטוריית השיחה הגלובלית.
 * @returns - הבטחה לתשובת הבוט כטקסט.
 */
export const answerGlobalQuestion = async (
    allPayslipData: PayslipData[],
    question: string,
    history: ChatMessage[]
): Promise<string> => {
    let historyPrompt = "";
    if (history && history.length > 0) {
        const formattedHistory = history
            .map(msg => `${msg.sender === 'user' ? 'המשתמש' : 'אתה'}: ${msg.text}`)
            .join('\n');
        
        historyPrompt = `
להלן היסטוריית השיחה האחרונה. השתמש בה כדי להבין את ההקשר של השאלה החדשה:
--- היסטוריית שיחה ---
${formattedHistory}
--- סוף היסטוריית שיחה ---
`;
    }

    const prompt = `
אתה מקבל מערך של אובייקטי JSON, כאשר כל אובייקט מייצג תלוש שכר של המשתמש מתקופה אחרת.
נתוני התלושים של המשתמש:
\`\`\`json
${JSON.stringify(allPayslipData, null, 2)}
\`\`\`
${historyPrompt}
ענה על שאלת המשתמש החדשה בהתבסס על **כל** נתוני התלושים שסופקו. בצע השוואות, סיכומים וחישובים לפי הצורך.
שאלת המשתמש החדשה: "${question}"`;

    const response = await geminiAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] },
        config: {
            systemInstruction: `אתה 'יועץ הכלכלה שלך', עוזר אישי שמבין גם בכלכלה וגם בחיי היומיום של העובד. אתה מומחה בניתוח והשוואה של מספר תלושי שכר לאורך זמן.

הנחיות הפעולה המחמירות שלך:
1.  **תשובות ישירות ולעניין:** ענה תמיד תשובות ישירות ולעניין. אל תכתוב פתיחים או סיכומים. אם נשאלת שאלה שמצריכה חישוב או ניתוח – הצג רק את המידע הדרוש ואת התוצאה, בלי הרחבות מיותרות.
2.  **הסברים פשוטים:** אם המשתמש מבקש הסבר, הסבר בצורה פשוטה, קצרה וברורה, בלי להשתמש במונחים מקצועיים מסובכים.
3.  **שימוש באינטרנט:** כאשר אתה משתמש בחיפוש גוגל כדי לענות על שאלה, **לעולם אל תחזיר קישורים או תציין מקורות**. במקום זאת, סנתז את המידע מהחיפוש וכתוב את התשובה המלאה במילים שלך, בצורה ישירה וברורה. המשתמש צריך לקבל תשובה מוכנה בלי צורך לפתוח קישורים.
4.  **זהות:** אל תציג את עצמך. פשוט ספק את התשובה.`,
            tools: [{googleSearch: {}}],
        }
    });

    return response.text;
};