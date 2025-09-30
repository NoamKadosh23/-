
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isLoading: boolean;
  uploadedImage: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isLoading, uploadedImage }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      onImageUpload(files[0]);
    }
  };

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileChange(event.dataTransfer.files);
  }, [onImageUpload]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {uploadedImage && !isLoading ? (
        <div className="w-full p-2 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600">
            <img src={uploadedImage} alt="Uploaded Payslip" className="max-h-80 w-auto mx-auto rounded-md" />
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">מנתח את התלוש...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadIcon />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">לחץ להעלאה</span> או גרור קובץ לכאן</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG (עד 10MB)</p>
              </div>
              <input 
                id="dropzone-file" 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={(e) => handleFileChange(e.target.files)} 
                accept="image/png, image/jpeg" 
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
