// [עברית] קובץ זה מגדיר את "מבני הנתונים" של האפליקציה.
// הוא כמו תוכנית בניין לאדריכל - מגדיр בדיוק אילו שדות מידע כל אובייקט צריך להכיל.
// שימוש בקובץ כזה עוזר למנוע טעויות ומקל על הבנת הקוד.

/**
 * [עברית] Enum (אינאם) הוא דרך להגדיר קבוצה של קבועים בעלי שם.
 * כאן, אנו מגדירים את כל המצבים האפשריים של האפליקציה.
 * זה מונע מאיתנו להשתמש במחרוזות טקסט רגילות (שקל לטעות בהן) ושומר על קוד נקי.
 */
export enum AppStates {
    AWAITING_UPLOAD = 'AWAITING_UPLOAD', // בתהליך הוספת תלוש חדש: ממתין להעלאה
    CROPPING = 'CROPPING',               // בתהליך הוספת תלוש חדש: סימון אזורים
    ANALYZING = 'ANALYZING',             // בתהליך הוספת תלוש חדש: מנתח
    SESSION_VIEW = 'SESSION_VIEW',       // התצוגה הראשית המציגה את כל התלושים שנותחו
    ADMIN_PORTAL = 'ADMIN_PORTAL',       // [עברית] במצב ניהול, מציג את הפורטל הנפרד
}
// [עברית] הגדרת טיפוס שיכול לקבל רק אחד מהערכים שהוגדרו ב-AppStates.
export type AppState = AppStates;

/**
 * [עברית] ממשק (Interface) המגדיר פריט בודד בתוך קטגוריה בתלוש.
 * למשל: { description: 'שכר יסוד', value: '10,000 ש"ח' }
 */
export interface PayslipItem {
    description: string; // תיאור הפריט (למשל, 'מס הכנסה')
    value: string;       // הערך של הפריט (יכול להיות מספר, מטבע, ימים וכו', לכן הוא מסוג טקסט)
}

/**
 * [עברית] ממשק המגדיר קטגוריה שלמה בתלוש, שמכילה רשימה של פריטים.
 * למשל: { categoryTitle: 'ניכויי חובה', items: [...] }
 */
export interface PayslipCategory {
    categoryTitle: string;  // שם הקטגוריה (למשל, 'תשלומים', 'הפרשות מעסיק')
    items: PayslipItem[];   // מערך (רשימה) של כל הפריטים תחת קטגוריה זו
}

/**
 * [עברית] הממשק הראשי שמגדיר את כל מבנה הנתונים של תלוש שכר מנותח.
 * זהו המבנה שאנחנו מבקשים מהבינה המלאכותית להחזיר לנו.
 */
export interface PayslipData {
    employeeName: string;    // שם העובד
    employeeId: string;      // תעודת זהות
    employerName: string;    // שם המעסיק
    payPeriod: string;       // תקופת התשלום
    grossSalary: number;     // שכר ברוטו
    netSalary: number;       // שכר נטו
    totalDeductions: number; // סך כל הניכויים
    summary: string;         // סיכום קצר של התלוש במילים
    // [עברית] מערך גמיש של קטגוריות, כדי להתאים לכל מבנה אפשרי של תלוש.
    categories: PayslipCategory[];
}

/**
 * [עברית] ממשק המגדיר הודעת צ'אט בודדת.
 */
export interface ChatMessage {
    sender: 'user' | 'bot'; // מי שלח את ההודעה: 'משתמש' או 'בוט'
    text: string;           // תוכן ההודעה
    options?: string[];     // מערך אופציונלי של כפתורי תגובה מהירה
    sources?: { uri: string; title: string }[]; // [עברית] מערך אופציונלי של מקורות מידע מהאינטרנט.
}

/**
 * [עברית] ממשק המגדיר "סשן" שלם של ניתוח תלוש.
 * הוא מכיל את כל המידע הקשור לתלוש אחד ספציפי.
 */
export interface PayslipSession {
    id: number;
    title: string;
    uploadedImage: string | null;
    payslipData: PayslipData | null;
    chatMessages: ChatMessage[];
}