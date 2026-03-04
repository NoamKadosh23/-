// [עברית] רכיב כותרת ייעודי עבור פורטל הניהול.
// הוא מציג את הכותרת בעיצוב המתאים (שחור/אדום) ומכיל את כפתור היציאה.

import React from 'react';

interface AdminHeaderProps {
    onExit: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onExit }) => {
    return (
        <header className="text-center mb-8 w-full">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
              פורטל ניהול
            </h1>
            <p className="text-lg text-gray-400 mt-2">
              כלי ליצירה ועריכה של תלושי הדגמה
            </p>
            <div className="flex justify-center items-center gap-4 mt-4">
                 <button
                    onClick={onExit}
                    className="px-4 py-2 bg-red-900/80 text-red-200 font-semibold rounded-full shadow-sm hover:bg-red-800/80 border border-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors"
                    aria-label="צא ממצב ניהול"
                >
                    צא ממצב ניהול
                </button>
            </div>
        </header>
    );
};

export default AdminHeader;
