// [עברית] קומפוננטה זו אחראית על ממשק העלאת קובץ בודד.
// היא מאפשרת למשתמש לבחור קובץ, לגרור אותו לאזור המיועד, או להדביק אותו מהזיכרון (clipboard).

import React, { useCallback, useState, useEffect } from 'react';
import { UploadIcon } from './icons/UploadIcon';

// [עברית] הגדרת ה"חוזים" של הקומפוננטה (Props). אלו הם הנתונים שהיא מקבלת מבחוץ (מהקומפוננטה שמשתמשת בה).
interface ImageUploaderProps {
  onFileUpload: (file: File) => void; // פונקציה שתופעל כשהמשתמש יעלה קובץ (תמונה או PDF).
  isLoading: boolean;                     // האם להציג מצב טעינה?
  uploadedImage: string | null;           // התמונה שכבר הועלתה, אם קיימת.
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileUpload, isLoading, uploadedImage }) => {
  // [עברית] משתנה מצב (state) שעוקב האם המשתמש גורר קובץ מעל האזור המיועד.
  const [isDragging, setIsDragging] = useState(false);

  // [עברית] פונקציה המטפלת בקבצים שנבחרו.
  // useCallback היא אופטימיזציה של ריאקט שמונעת יצירה מחדש של הפונקציה בכל רינדור.
  const handleFileChange = useCallback((files: FileList | null) => {
    if (files && files[0]) {
       const file = files[0];
      // [עברית] בדיקה שהקובץ הוא תמונה או PDF.
      if (file.type.startsWith('image/') || file.type === 'application/pdf') { 
        onFileUpload(file); // [עברית] מפעילים את הפונקציה שקיבלנו מבחוץ עם הקובץ החדש.
      }
    }
  }, [onFileUpload]);

  // [עברית] useEffect הוא 'הוק' של ריאקט שמאפשר להריץ קוד בתגובה לאירועים מסוימים במחזור החיים של הקומפוננטה.
  // כאן, אנו משתמשים בו כדי להוסיף מאזין לאירוע 'paste' (הדבקה) על כל המסמך.
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      // [עברית] אם יש קבצים בהדבקה, נטפל בהם.
      handleFileChange(event.clipboardData?.files ?? null);
    };

    document.addEventListener('paste', handlePaste);
    // [עברית] פונקציית הניקיון: מסירים את המאזין כשהקומפוננטה יורדת מהמסך, למניעת דליפות זיכרון.
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handleFileChange]);

  // [עברית] פונקציות המטפלות באירועי גרירה ושחרור (Drag and Drop).
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // [עברית] מונעים את התנהגות ברירת המחדל של הדפדפן.
    setIsDragging(true); // [עברית] מעדכנים את המצב כדי לשנות את העיצוב.
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileChange(event.dataTransfer.files); // [עברית] מטפלים בקבצים שנזרקו.
  }, [handleFileChange]);

  // [עברית] מבנה ה-HTML של הקומפוננטה.
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {uploadedImage && !isLoading ? (
        // [עברית] אם יש תמונה שהועלתה, נציג אותה.
        <div className="w-full p-2 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600">
            <img src={uploadedImage} alt="Uploaded Payslip" className="max-h-80 w-auto mx-auto rounded-md" />
        </div>
      ) : (
        // [עברית] אחרת, נציג את אזור ההעלאה.
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          // [עברית] העיצוב משתנה דינמית אם המשתמש גורר קובץ מעל האזור.
          className={`relative flex flex-col items-center justify-center w-full h-auto min-h-64 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          {isLoading ? (
            // [עברית] אם בטעינה, נציג אנימציה.
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">מעבד קובץ...</p>
            </div>
          ) : (
            // [עברית] אם לא בטעינה, נציג את ההוראות.
            <>
              <div className="flex flex-col items-center justify-center text-center pt-5 pb-6">
                <UploadIcon />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">לחץ להעלאה</span>, גרור קובץ או הדבק (Ctrl+V)</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, PDF (עד 10MB)</p>
                <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 w-full max-w-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>טיפ:</strong> אחרי ההעלאה תוכל לסמן אזורים ספציפיים. זה מאוד עוזר למערכת לקרוא ולפרק את המידע בצורה מדויקת!
                    </p>
                </div>
              </div>
              {/* [עברית] זהו אלמנט ה-input האמיתי לבחירת קובץ. הוא מוסתר, והלחיצה עליו מופעלת דרך ה-div שעוטף אותו. */}
              <input 
                id="dropzone-file" 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={(e) => handleFileChange(e.target.files)} 
                accept="image/png, image/jpeg, application/pdf" 
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;