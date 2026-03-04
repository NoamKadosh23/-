// [עברית] זוהי קומפוננטה חדשה לגמרי שנועדה להציג "מצגת" קצרה על יכולות האפליקציה.
// היא מופיעה כחלון קופץ (מודאל) מעל האפליקציה, ומדריכה את המשתמש שלב אחר שלב.

import React, { useState, useEffect } from 'react';

// [עברית] הגדרת מבנה הנתונים (Interface) עבור כל "שקף" במצגת.
interface PresentationSlide {
  title: string;  // הכותרת של השלב
  content: React.ReactNode; // תוכן ההסבר, יכול להכיל גם רכיבי JSX
}

// [עברית] מערך המכיל את כל שלבי המצגת. קל לערוך ולהוסיף שלבים כאן.
const slides: PresentationSlide[] = [
  {
    title: 'שלב 1: מתחילים!',
    content: 'מעלים תמונה ברורה או קובץ PDF של תלוש השכר. זו נקודת הפתיחה למסע שלכם להבנת המשכורת.',
  },
  {
    title: 'שלב 2: דיוק הוא שם המשחק',
    content: 'לאחר ההעלאה, תתבקשו לסמן את האזורים המרכזיים בתלוש (טבלאות, סיכומים וכו\'). שלב זה קריטי ועוזר להבטיח שהניתוח יהיה מדויק ככל האפשר. התהליך כולו לוקח כדקה.',
  },
  {
    title: 'למה לסמן?',
    content: 'יכולנו לבקש רק תמונה, אבל גילינו שתלושי שכר מגיעים במבנים שונים ומערכות אוטומטיות מתבלבלות. הסימון שלכם משפר באופן דרמטי את יכולת הבוט להבין את המבנה הייחודי של התלוש שלכם. למעשה, שלב זה כל כך חיוני שבלי המיקוד הזה, סביר להניח שהניתוח היה יוצא מבולבל ולא מדויק.',
  },
   {
    title: 'מאחורי הקלעים: הפיכת תמונה לטקסט',
    content: 'כאן מתחיל הקסם. המערכת לוקחת את האזורים שסימנתם ומשתמשת בטכנולוגיית זיהוי התווים האופטי (OCR) המתקדמת המובנית במודל Gemini, כדי להפוך כל תמונה לטקסט דיגיטלי מדויק.',
  },
  {
    title: 'המוח: ניתוח עם Gemini Flash 2.5',
    content: 'הטקסט הדיגיטלי נשלח למודל הבינה המלאכותית Gemini Flash 2.5. בחרנו בו כי הוא המהיר והמדויק ביותר למשימה של הבנת מבנים מורכבים כמו תלושי שכר, והוא יודע לסדר את המידע בקטגוריות באופן אוטומטי.',
  },
  {
    title: 'הטכנולוגיה: איך בנינו את זה?',
    content: (
        <>
            את המבנה והעיצוב של האפליקציה בנינו באמצעות <strong>HTML</strong>, השפה הבסיסית של האינטרנט.
            <br/><br/>
            כל הלוגיקה, האינטראקציות והתקשורת עם הבינה המלאכותית נכתבו ב-<strong>TypeScript</strong>, גרסה מתקדמת של JavaScript שמוסיפה בטיחות ויציבות לקוד.
        </>
    ),
  },
  {
    title: 'התוצאה: תצוגה חכמה',
    content: 'בסוף התהליך, המידע מוצג בצורה נקייה ומסודרת. המערכת דינמית ומציגה רק את מה שקיים בתלוש שלכם, בלי תבניות קבועות מראש.',
  },
  {
    title: 'אינטראקציה וחקירה',
    content: 'התלוש המעובד הוא אינטראקטיבי. תוכלו לעבור על כל הנתונים, ואם תרצו, ללחוץ על כל שורת מידע כדי לשאול את "יועץ הכלכלה שלך" ולקבל עליה הסבר מיידי.',
  },
  {
    title: 'הכירו את "יועץ הכלכלה שלך"',
    content: (
        <>
            לצד הנתונים נמצא "יועץ הכלכלה שלך", צ'אטבוט מומחה המבוסס גם הוא על Gemini Flash 2.5, אך עם מערכת הוראות ייעודית שהופכת אותו ליועץ פיננסי אישי. לדוגמה, חלק מההוראה שלו הוא:
            <blockquote className="mt-2 p-2 text-sm text-left dir-ltr bg-gray-100 dark:bg-gray-700 border-l-4 border-blue-500 italic">
                "You are 'Your Economics Advisor', a personal assistant... Answer directly, explain simply, and base your answers on the provided payslip data."
            </blockquote>
        </>
    ),
  },
  {
    title: 'מבט רחב יותר',
    content: 'סיימתם עם תלוש אחד? תוכלו להעלות עוד תלושים באותה הדרך. לאחר ניתוח של יותר מתלוש אחד, יופיע כפתור "שאל על כל התלושים", שיאפשר לכם לבצע השוואות, לחשב ממוצעים ולזהות מגמות לאורך זמן.',
  },
  {
    title: 'אתם מוכנים!',
    content: 'זהו, סיימנו את הסיור. עכשיו אתם מכירים את כל התהליך. לחצו על הכפתור למטה כדי להתחיל לנתח את תלוש השכר שלכם ולהפוך אותו לברור ונהיר יותר מאי פעם.',
  }
];

// [עברית] הגדרת ה-Props של הקומפוננטה.
interface PresentationModeProps {
  onClose: () => void; // פונקציה שתופעל כשהמשתמש ירצה לסגור את המצגת.
}

const PresentationMode: React.FC<PresentationModeProps> = ({ onClose }) => {
  // [עברית] משתנה מצב (state) שעוקב אחר מספר השקף הנוכחי במצגת.
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // [עברית] פונקציית סגירה עם אנימציה
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // [עברית] תואם למשך האנימציה
  };

  // [עברית] אפקט למעבר שקפים עם המקלדת (חיצים ימינה ושמאלה)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') {
            goToNext();
        } else if (e.key === 'ArrowLeft') {
            goToPrev();
        } else if (e.key === 'Escape') {
            handleClose();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlide]);

  // [עברית] פונקציות ניווט בין השלבים.
  const goToNext = () => {
    if (currentSlide < slides.length - 1) {
        setCurrentSlide(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentSlide > 0) {
        setCurrentSlide(prev => prev - 1);
    }
  };

  // [עברית] שולפים את פרטי השלב הנוכחי מהמערך.
  const slide = slides[currentSlide];

  return (
    // [עברית] המעטפת החיצונית: יוצרת רקע שחור חצי-שקוף על כל המסך.
    <div 
      className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleClose} 
    >
      {/* [עברית] תיבת התוכן המרכזית של המצגת. */}
      <div 
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col relative transform transition-all duration-300 ${isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        onClick={e => e.stopPropagation()} 
        style={{height: '600px', maxHeight: '90vh'}}
      >
        <div className="p-6 sm:p-8 flex-grow flex flex-col justify-center text-center">
            <div key={currentSlide} className="animate-fade-in">
                <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400 mb-4">
                {slide.title}
                </h2>
                <div className="text-gray-600 dark:text-gray-300 text-lg mb-8 min-h-[150px] flex items-center justify-center">
                    <div>{slide.content}</div>
                </div>
            </div>
        </div>

        <div className="flex-shrink-0 p-6 sm:p-8 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
            {/* [עברית] נקודות ניווט המציינות את מיקום המשתמש במצגת. */}
            <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
                <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${currentSlide === index ? 'bg-blue-500 scale-125' : 'bg-gray-300 dark:bg-gray-600'}`}
                aria-label={`Go to slide ${index + 1}`}
                />
            ))}
            </div>

            {/* [עברית] כפתורי הניווט "הבא" ו"הקודם". */}
            <div className="flex justify-between items-center">
            <button
                onClick={goToPrev}
                disabled={currentSlide === 0}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                הקודם
            </button>
            
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {currentSlide + 1} / {slides.length}
            </div>
            
            {/* [עברית] בשלב האחרון, הכפתור משתנה ל"הבנתי, בואו נתחיל!". */}
            {currentSlide === slides.length - 1 ? (
                <button
                    onClick={handleClose}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-transform transform hover:scale-105"
                >
                    הבנתי, בואו נתחיל!
                </button>
            ) : (
                <button
                    onClick={goToNext}
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                >
                    הבא
                </button>
            )}
            </div>
        </div>
        
        {/* [עברית] כפתור סגירה (X) בפינה. */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close presentation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* [עברית] תגית style להוספת אנימציית כניסה נחמדה לשקפים. */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PresentationMode;