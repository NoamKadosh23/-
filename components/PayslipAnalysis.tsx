// [עברית] קומפוננטה זו אחראית אך ורק על הצגת הנתונים המנותחים של תלוש השכר.
// היא מקבלת את אובייקט הנתונים (data) ומציגה אותו בצורה מסודרת וקריאה למשתמש.
// היא "טיפשה" בכוונה - אין לה לוגיקה, רק תצוגה.

import React from 'react';
import type { PayslipData, PayslipCategory, PayslipItem } from '../types';

// [עברית] הגדרת ה-Props (המידע שהקומפוננטה מקבלת מבחוץ).
interface PayslipAnalysisProps {
  data: PayslipData; // [עברית] אובייקט הנתונים המלא של התלוש.
  onItemClick?: (itemDescription: string) => void; // [עברית] פונקציה אופציונלית המופעלת בלחיצה על פריט.
}

/**
 * [עברית] קומפוננטת עזר קטנה ופנימית להצגת כרטיס מידע (כמו שכר ברוטו/נטו).
 */
const InfoCard: React.FC<{ title: string; value: number; className?: string; }> = ({ title, value, className }) => (
    <div className={`p-4 rounded-lg shadow-inner ${className}`}>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <div className="text-2xl font-bold">
         {`${value.toLocaleString()} ₪`}
      </div>
    </div>
);


// [עברית] הקומפוננטה הראשית של הקובץ.
const PayslipAnalysis: React.FC<PayslipAnalysisProps> = ({ data, onItemClick }) => {

  return (
    // [עברית] מבנה ה-HTML (JSX) של תצוגת הנתונים.
    <div className="space-y-6 h-full">
      {/* [עברית] הצגת פרטים כלליים בראש הדף. */}
      <div className="text-center">
        <h3 className="text-xl font-semibold">
           {data.employerName}
        </h3>
        <p className="text-md text-gray-500 dark:text-gray-400">
            תלוש שכר עבור {data.employeeName} ({data.employeeId})
        </p>
         <p className="text-md text-gray-500 dark:text-gray-400">
            תקופה: {data.payPeriod}
        </p>
      </div>

      {/* [עברית] הצגת הסיכום שנוצר על ידי ה-AI, רק אם הוא קיים. */}
      {data.summary && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">סיכום ממבט על</h4>
          <p className="text-gray-600 dark:text-gray-300">
            {data.summary}
          </p>
        </div>
      )}

      {/* [עברית] הצגת שלושת כרטיסי המידע הראשיים. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard title="שכר ברוטו" value={data.grossSalary} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200" />
        <InfoCard title="סך ניכויים" value={data.totalDeductions} className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200" />
        <InfoCard title="שכר נטו" value={data.netSalary} className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200" />
      </div>

      {/* [עברית] כאן אנו עוברים בלולאה על כל הקטגוריות שקיבלנו מה-AI. */}
      <div className="space-y-4">
        {data.categories.map((category, catIndex) => (
          // [עברית] עבור כל קטגוריה, אנו יוצרים בלוק HTML חדש.
          <div key={catIndex} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-semibold text-lg mb-2">
                {category.categoryTitle}
            </h4>
            <div className="space-y-2 text-sm">
              {/* [עברית] בתוך כל קטגוריה, אנו עוברים בלולאה על כל הפריטים שלה. */}
              {category.items.map((item, itemIndex) => (
                // [עברית] ועבור כל פריט, אנו יוצרים שורה המציגה את התיאור והערך.
                <div 
                  key={itemIndex} 
                  className={`flex justify-between items-center gap-2 p-1 -m-1 rounded-md transition-colors ${onItemClick ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600/50' : ''}`}
                  onClick={() => onItemClick && onItemClick(item.description)}
                  title={onItemClick ? `לחץ לקבלת הסבר על ${item.description}` : ''}
                  tabIndex={onItemClick ? 0 : -1} // [עברית] הוספת נגישות למקלדת
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onItemClick && onItemClick(item.description)}
                >
                   <span>{item.description}</span>
                   <span className="font-mono font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PayslipAnalysis;