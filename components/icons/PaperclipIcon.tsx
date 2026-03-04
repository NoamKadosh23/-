// [עברית] קומפוננטה פשוטה שמייצגת אייקון של מהדק נייר (אטב), המשמש בדרך כלל לייצוג של צירוף קבצים.
// היא מחזירה קוד SVG.

import React from 'react';

export const PaperclipIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a3 3 0 10-6 0v4a1 1 0 102 0V7a1 1 0 112 0v4a3 3 0 11-6 0V7a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);
