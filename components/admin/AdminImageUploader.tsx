// [עברית] גרסה ייעודית של רכיב העלאת הקבצים, המעוצבת במיוחד עבור פורטל הניהול.
// היא משתמשת בסכמת הצבעים של שחור/אפור/אדום.

import React, { useCallback, useState, useEffect } from 'react';
import { UploadIcon } from '../icons/UploadIcon';

interface AdminImageUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const AdminImageUploader: React.FC<AdminImageUploaderProps> = ({ onFileUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (files && files[0]) {
       const file = files[0];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') { 
        onFileUpload(file);
      }
    }
  }, [onFileUpload]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      handleFileChange(event.clipboardData?.files ?? null);
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handleFileChange]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileChange(event.dataTransfer.files);
  }, [handleFileChange]);

  return (
    <div className="w-full">
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-600 text-gray-100">
                שלב 1: העלאת תלוש ליצירת הדגמה
            </h2>
            <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`relative flex flex-col items-center justify-center w-full h-auto min-h-64 p-4 mt-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                    ${isDragging ? 'border-red-500 bg-red-900/20' : 'border-gray-600 hover:bg-gray-700'}`}
                >
                {isLoading ? (
                    <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                    <p className="mt-4 text-lg text-gray-400">מעבד קובץ...</p>
                    </div>
                ) : (
                    <>
                    <div className="flex flex-col items-center justify-center text-center pt-5 pb-6">
                        <UploadIcon />
                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">לחץ להעלאה</span>, גרור קובץ או הדבק (Ctrl+V)</p>
                        <p className="text-xs text-gray-400">PNG, JPG, PDF</p>
                        <div className="mt-6 p-3 bg-red-900/30 rounded-lg border border-red-800 w-full max-w-md">
                            <p className="text-sm text-red-200">
                                <strong>הערה:</strong> לאחר ההעלאה תוכל לסמן אזורים ספציפיים לניתוח עומק.
                            </p>
                        </div>
                    </div>
                    <input 
                        id="admin-dropzone-file" 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        onChange={(e) => handleFileChange(e.target.files)} 
                        accept="image/png, image/jpeg, application/pdf" 
                    />
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

export default AdminImageUploader;
