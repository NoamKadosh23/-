// [עברית] קובץ זה הוא נקודת הכניסה (Entry Point) של כל האפליקציה.
// הוא כמו המנוע שמתניע את כל המכונית.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // [עברית] ייבוא של הקומפוננטה הראשית של האפליקציה, שמרכזת את כל הלוגיקה והתצוגה.

// [עברית] אנו מחפשים בדף האינטרנט (index.html) אלמנט עם מזהה 'root'.
// זה המקום שבו כל האפליקציה שלנו "תגור".
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// [עברית] כאן אנחנו יוצרים את "השורש" של אפליקציית הריאקט שלנו.
// תהליך זה מכין את האזור שבו האפליקציה תוצג.
const root = ReactDOM.createRoot(rootElement);

// [עברית] הפקודה 'render' היא זו שממש "מציירת" את האפליקציה על המסך.
// אנחנו אומרים לריאקט לקחת את קומפוננטת 'App' ולהציג אותה בתוך ה-'root'.
// 'React.StrictMode' היא עטיפה שעוזרת למפתחים למצוא טעויות פוטנציאליות בקוד בזמן הפיתוח.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
