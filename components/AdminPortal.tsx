// [עברית] קומפוננטה חדשה זו היא "העולם הנפרד" של מצב הניהול.
// היא מנהלת את כל זרימת העבודה של המנהל: העלאה, סימון, ניתוח עומק ועריכה.
// היא מעוצבת בסכמת צבעים ייחודית (שחור/אפור/אדום) כדי להבדיל אותה בבירור מהאפליקציה הרגילה.

import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { deepAnalyzePayslip } from '../services/adminGeminiService';
import type { PayslipData, PayslipSession } from '../types';
import AdminHeader from './admin/AdminHeader';
import AdminImageUploader from './admin/AdminImageUploader';
import AdminImageCropper from './admin/AdminImageCropper';
import AdminEditor from './AdminEditor';

// [עברית] הגדרת המצבים הפנימיים של פורטל הניהול.
enum AdminState {
    AWAITING_UPLOAD = 'AWAITING_UPLOAD',
    CROPPING = 'CROPPING',
    ANALYZING = 'ANALYZING',
    EDITING = 'EDITING',
}

interface AdminPortalProps {
    onExit: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ onExit }) => {
    const [adminState, setAdminState] = useState<AdminState>(AdminState.AWAITING_UPLOAD);
    const [imagesForCropping, setImagesForCropping] = useState<string[]>([]);
    const [adminSession, setAdminSession] = useState<Partial<PayslipSession> & {payslipData: PayslipData | null} | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (file: File) => {
        setError(null);
        setIsProcessing(true);

        const processImages = (dataUrls: string[]) => {
            setImagesForCropping(dataUrls);
            setAdminState(AdminState.CROPPING);
            setIsProcessing(false);
        };
        
        const reader = new FileReader();
        reader.onerror = () => {
            setError("שגיאה בקריאת הקובץ.");
            setAdminState(AdminState.AWAITING_UPLOAD);
            setIsProcessing(false);
        };

        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
            reader.onload = () => processImages([reader.result as string]);
        } else if (file.type === 'application/pdf') {
            reader.readAsArrayBuffer(file);
            reader.onload = async () => {
                try {
                    const pdfData = new Uint8Array(reader.result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
                    const pageImages: string[] = [];
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 2.5 });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        if (!context) throw new Error('Failed to create canvas context');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        await page.render({ canvasContext: context, viewport, canvas } as any).promise;
                        pageImages.push(canvas.toDataURL('image/png'));
                    }
                    processImages(pageImages);
                } catch (err) {
                    setError("שגיאה בעיבוד קובץ ה-PDF.");
                    setAdminState(AdminState.AWAITING_UPLOAD);
                } finally {
                    setIsProcessing(false);
                }
            };
        } else {
            setError("סוג קובץ לא נתמך.");
            setIsProcessing(false);
        }
    };

    const handleCropComplete = async (files: File[]) => {
        if (files.length === 0) {
            setError("לא נבחרו אזורים לניתוח.");
            setAdminState(AdminState.CROPPING);
            return;
        }
        
        setError(null);
        setAdminState(AdminState.ANALYZING);

        try {
            const imagePayloads = await Promise.all(files.map(file => 
                new Promise<{ base64Image: string; mimeType: string }>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve({ base64Image: (reader.result as string).split(',')[1], mimeType: file.type });
                    reader.onerror = reject;
                })
            ));

            const data = await deepAnalyzePayslip(imagePayloads);
            setAdminSession({
                uploadedImage: imagesForCropping[0],
                payslipData: data,
            });
            setImagesForCropping([]);
            setAdminState(AdminState.EDITING);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "שגיאה בניתוח העומק.";
            setError(errorMessage);
            setAdminState(AdminState.AWAITING_UPLOAD);
            setImagesForCropping([]);
        }
    };

    const renderContent = () => {
        switch (adminState) {
            case AdminState.AWAITING_UPLOAD:
                return <AdminImageUploader onFileUpload={handleFileUpload} isLoading={isProcessing} />;
            case AdminState.CROPPING:
                return <AdminImageCropper imageSrcs={imagesForCropping} onCropComplete={handleCropComplete} />;
            case AdminState.ANALYZING:
                return (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                        <p className="mt-4 text-lg text-gray-400">מבצע ניתוח עומק...</p>
                    </div>
                );
            case AdminState.EDITING:
                 if (adminSession?.payslipData) {
                    return <AdminEditor 
                        initialData={adminSession.payslipData}
                        uploadedImage={adminSession.uploadedImage!}
                        onExit={onExit}
                    />
                 }
                 // Fallback if data is missing
                 setAdminState(AdminState.AWAITING_UPLOAD);
                 return null;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
             <div className="w-full flex flex-col flex-grow">
                <AdminHeader onExit={onExit} />
                <main className={`w-full flex-grow flex flex-col ${adminState !== AdminState.EDITING ? 'items-center justify-center' : ''}`}>
                    {error && <p className="w-full text-red-400 bg-red-900/50 border border-red-700 p-4 rounded-lg mb-6 text-center">{error}</p>}
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminPortal;
