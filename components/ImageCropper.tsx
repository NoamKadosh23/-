// [עברית] קומפוננטה חדשה המאפשרת למשתמש לסמן אזורים על גבי תמונת התלוש שהעלה.
// היא משתמשת באלמנט <canvas> כדי לצייר את התמונה ולאפשר ציור אינטראקטיבי של מלבנים.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FullScreenIcon } from './icons/FullScreenIcon';
import { ExitFullScreenIcon } from './icons/ExitFullScreenIcon';


// [עברית] הגדרת טיפוס נתונים עבור מלבן (קואורדינטות ומידות).
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// [עברית] הגדרת ה-Props של הקומפוננטה.
interface ImageCropperProps {
  imageSrcs: string[]; // [עברית] מערך של כתובות תמונה (עבור כל עמוד במסמך).
  onCropComplete: (files: File[]) => void; // [עברית] פונקציה שתופעל בסיום, עם מערך של קבצי התמונה החתוכים.
}


const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrcs, onCropComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRefs = useRef<{ [key: number]: HTMLImageElement }>({});

    const [allRectangles, setAllRectangles] = useState<{ [key: number]: Rect[] }>({});
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [firstClickPoint, setFirstClickPoint] = useState<{ x: number, y: number } | null>(null);
    const [currentRect, setCurrentRect] = useState<Rect | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hoveredDeleteIndex, setHoveredDeleteIndex] = useState<number | null>(null);

    const DELETE_BUTTON_RADIUS = 10;
    const isMultiPage = imageSrcs.length > 1;

    // --- פונקציות עזר לחישובים ---
    const getDeleteButtonPosition = useCallback((rect: Rect): { x: number; y: number } => {
        return { x: rect.x + rect.width, y: rect.y };
    }, []);

    const isOverDeleteButton = useCallback((pos: { x: number, y: number }, rect: Rect): boolean => {
        const buttonPos = getDeleteButtonPosition(rect);
        const dx = pos.x - buttonPos.x;
        const dy = pos.y - buttonPos.y;
        return dx * dx + dy * dy < DELETE_BUTTON_RADIUS * DELETE_BUTTON_RADIUS;
    }, [getDeleteButtonPosition]);


    // [עברית] אפקט שמטפל בלחיצה על מקש 'Escape' כדי לצאת ממצב מסך מלא.
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    // [עברית] אפקט מרכזי שמטפל בטעינת התמונה, שינוי גודל הקנבס, וציור הכל מחדש.
    // הוא מופעל מחדש כשהתמונה משתנה, כשנכנסים/יוצאים ממסך מלא, או כשהסימונים משתנים.
     useEffect(() => {
        const image = new Image();
        image.src = imageSrcs[currentPageIndex];
        imageRefs.current[currentPageIndex] = image;

        const handleResizeAndDraw = () => {
            const canvas = canvasRef.current;
            if (!canvas || !image.complete || image.naturalHeight === 0) return;

            const imageAspectRatio = image.naturalWidth / image.naturalHeight;
            let targetWidth: number;
            let targetHeight: number;

            if (isFullscreen) {
                const padding = 120; // [עברית] מרווח עבור כפתורים והוראות
                const availableWidth = window.innerWidth - padding;
                const availableHeight = window.innerHeight - padding;
                
                if (availableWidth / availableHeight > imageAspectRatio) {
                    targetHeight = availableHeight;
                    targetWidth = availableHeight * imageAspectRatio;
                } else {
                    targetWidth = availableWidth;
                    targetHeight = availableWidth / imageAspectRatio;
                }
            } else {
                const container = canvas.parentElement?.parentElement;
                if (container) {
                    targetWidth = container.clientWidth;
                    targetHeight = targetWidth / imageAspectRatio;
                } else { return; }
            }
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            
            const rectanglesForCurrentPage = allRectangles[currentPageIndex] || [];
            rectanglesForCurrentPage.forEach((rect, index) => {
                // [עברית] ציור המלבן
                ctx.strokeStyle = 'rgba(75, 145, 250, 1)';
                ctx.lineWidth = 3;
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                
                // [עברית] ציור מספר המלבן
                ctx.fillStyle = 'rgba(75, 145, 250, 1)';
                ctx.font = 'bold 16px Rubik, sans-serif';
                ctx.fillText((index + 1).toString(), rect.x + 5, rect.y + 20);

                // [עברית] ציור כפתור המחיקה
                const buttonPos = getDeleteButtonPosition(rect);
                ctx.beginPath();
                ctx.arc(buttonPos.x, buttonPos.y, DELETE_BUTTON_RADIUS, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'; // red-500
                ctx.fill();
                
                // [עברית] ציור ה-X
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(buttonPos.x - 4, buttonPos.y - 4);
                ctx.lineTo(buttonPos.x + 4, buttonPos.y + 4);
                ctx.moveTo(buttonPos.x + 4, buttonPos.y - 4);
                ctx.lineTo(buttonPos.x - 4, buttonPos.y + 4);
                ctx.stroke();
            });

            if (currentRect) {
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
                ctx.setLineDash([]);
            }
        };
        
        image.onload = handleResizeAndDraw;
        window.addEventListener('resize', handleResizeAndDraw);
        handleResizeAndDraw(); // [עברית] קריאה ראשונית להפעלה

        return () => window.removeEventListener('resize', handleResizeAndDraw);
    }, [imageSrcs, currentPageIndex, isFullscreen, allRectangles, currentRect, getDeleteButtonPosition]);


    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): { x: number, y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isProcessing) return;
        
        if (hoveredDeleteIndex !== null) {
            const currentRects = allRectangles[currentPageIndex] || [];
            const newRects = currentRects.filter((_, i) => i !== hoveredDeleteIndex);
            setAllRectangles(prev => ({...prev, [currentPageIndex]: newRects }));
            setHoveredDeleteIndex(null);
            if (canvasRef.current) {
                canvasRef.current.style.cursor = 'crosshair';
            }
            return;
        }

        setStartPoint(getMousePos(e));
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const pos = getMousePos(e);
        const currentRects = allRectangles[currentPageIndex] || [];

        if (!isDragging && !startPoint) {
            let hoveringIndex: number | null = null;
            for (let i = currentRects.length - 1; i >= 0; i--) {
                if (isOverDeleteButton(pos, currentRects[i])) {
                    hoveringIndex = i;
                    break;
                }
            }

            if (hoveringIndex !== null) {
                canvas.style.cursor = 'pointer';
                setHoveredDeleteIndex(hoveringIndex);
            } else {
                canvas.style.cursor = 'crosshair';
                setHoveredDeleteIndex(null);
            }
        }


        if (startPoint && !isDragging) {
            const dx = pos.x - startPoint.x;
            const dy = pos.y - startPoint.y;
            if (Math.sqrt(dx * dx + dy * dy) > 5) {
                setIsDragging(true);
            }
        }

        let rectToShow: Rect | null = null;
        if (isDragging && startPoint) {
            const width = pos.x - startPoint.x;
            const height = pos.y - startPoint.y;
            rectToShow = {
                x: width > 0 ? startPoint.x : pos.x,
                y: height > 0 ? startPoint.y : pos.y,
                width: Math.abs(width),
                height: Math.abs(height)
            };
        } else if (firstClickPoint) {
             const width = pos.x - firstClickPoint.x;
            const height = pos.y - firstClickPoint.y;
            rectToShow = {
                x: width > 0 ? firstClickPoint.x : pos.x,
                y: height > 0 ? firstClickPoint.y : pos.y,
                width: Math.abs(width),
                height: Math.abs(height)
            };
        }
        setCurrentRect(rectToShow);
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!startPoint) return;
        
        const addRect = (rect: Rect) => {
             if (rect.width > 10 && rect.height > 10) {
                const currentRects = allRectangles[currentPageIndex] || [];
                setAllRectangles(prev => ({...prev, [currentPageIndex]: [...currentRects, rect] }));
            }
        };

        if (isDragging) {
             if (currentRect) addRect(currentRect);
        } else { // It's a click
            const pos = getMousePos(e);
            if (firstClickPoint) {
                const width = pos.x - firstClickPoint.x;
                const height = pos.y - firstClickPoint.y;
                const newRect: Rect = {
                    x: width > 0 ? firstClickPoint.x : pos.x,
                    y: height > 0 ? firstClickPoint.y : pos.y,
                    width: Math.abs(width),
                    height: Math.abs(height)
                };
                addRect(newRect);
                setFirstClickPoint(null);
            } else {
                setFirstClickPoint(pos);
            }
        }

        setStartPoint(null);
        setIsDragging(false);
        setCurrentRect(null);
    };

    const handleMouseLeave = () => {
        if (isDragging) {
             if (currentRect && currentRect.width > 10 && currentRect.height > 10) {
                const currentRects = allRectangles[currentPageIndex] || [];
                setAllRectangles(prev => ({...prev, [currentPageIndex]: [...currentRects, currentRect] }));
            }
        }
        setStartPoint(null);
        setIsDragging(false);
        setCurrentRect(null);
    };

    const handleReset = () => {
        setAllRectangles({});
        setFirstClickPoint(null);
    };

    const handleAnalyze = async () => {
        const canvas = canvasRef.current;
        if (!canvas || Object.keys(allRectangles).length === 0 || isProcessing) return;

        setIsProcessing(true);
        const allFiles: File[] = [];
        let partCounter = 1;

        for (const pageIndexStr in allRectangles) {
            const pageIndex = parseInt(pageIndexStr, 10);
            const rectsForPage = allRectangles[pageIndex];

            if (rectsForPage && rectsForPage.length > 0) {
                const image = imageRefs.current[pageIndex];
                if (!image || !image.complete) {
                    // Load image if not already loaded
                    const tempImage = new Image();
                    tempImage.src = imageSrcs[pageIndex];
                    await new Promise(resolve => tempImage.onload = resolve);
                    imageRefs.current[pageIndex] = tempImage;
                }

                const currentImage = imageRefs.current[pageIndex];
                const scaleX = currentImage.naturalWidth / canvas.width;
                const scaleY = currentImage.naturalHeight / canvas.height;

                const cropPromises = rectsForPage.map((rect) => {
                    return new Promise<File>((resolve, reject) => {
                        const tempCanvas = document.createElement('canvas');
                        const tempCtx = tempCanvas.getContext('2d');
                        if (!tempCtx) return reject(new Error('Failed to get canvas context'));

                        const cropX = rect.x * scaleX;
                        const cropY = rect.y * scaleY;
                        const cropWidth = rect.width * scaleX;
                        const cropHeight = rect.height * scaleY;
                        
                        tempCanvas.width = cropWidth;
                        tempCanvas.height = cropHeight;

                        tempCtx.drawImage(currentImage, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

                        tempCanvas.toBlob(blob => {
                            if (blob) {
                                const file = new File([blob], `part_${partCounter++}.png`, { type: 'image/png' });
                                resolve(file);
                            } else {
                                reject(new Error('Canvas toBlob returned null'));
                            }
                        }, 'image/png');
                    });
                });
                const croppedFiles = await Promise.all(cropPromises);
                allFiles.push(...croppedFiles);
            }
        }
        
        onCropComplete(allFiles);
    };

    const goToPrevPage = () => setCurrentPageIndex(prev => Math.max(0, prev - 1));
    const goToNextPage = () => setCurrentPageIndex(prev => Math.min(imageSrcs.length - 1, prev + 1));
    const totalRects = Object.values(allRectangles).flat().length;

    return (
        <div className={isFullscreen ? "fixed inset-0 z-50 bg-black/90 flex flex-col p-4 gap-4" : "flex flex-col items-center w-full"}>
            <div className="flex-shrink-0 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 w-full text-center flex justify-between items-center">
                <p className="text-md text-blue-800 dark:text-blue-200">
                    <strong>גרור</strong> כדי לסמן אזור, או <strong>לחץ בשתי נקודות</strong> כדי ליצור מלבן.
                     {firstClickPoint && <span className="font-bold block mt-1">לחץ שוב כדי להשלים את הסימון.</span>}
                </p>
                 <button 
                    onClick={() => setIsFullscreen(!isFullscreen)} 
                    className="p-2 rounded-full text-blue-800 dark:text-blue-200 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    aria-label={isFullscreen ? "צא ממסך מלא" : "הצג במסך מלא"}
                >
                    {isFullscreen ? <ExitFullScreenIcon /> : <FullScreenIcon />}
                </button>
            </div>
            
             <div className="relative w-full flex-grow flex items-center justify-center min-h-0">
                <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 p-1 inline-block">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        className="cursor-crosshair rounded-md"
                    />
                </div>
            </div>
            
             {isMultiPage && (
                <div className="flex-shrink-0 flex justify-center items-center gap-4 my-2">
                    <button onClick={goToPrevPage} disabled={currentPageIndex === 0} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50">הקודם</button>
                    <span className="font-bold text-lg text-gray-700 dark:text-gray-200">עמוד {currentPageIndex + 1} מתוך {imageSrcs.length}</span>
                    <button onClick={goToNextPage} disabled={currentPageIndex === imageSrcs.length - 1} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50">הבא</button>
                </div>
            )}

            <div className="flex-shrink-0 flex items-center justify-between w-full mt-auto">
                <button
                    onClick={handleReset}
                    disabled={totalRects === 0 || isProcessing}
                    className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    נקה הכל
                </button>
                <div className="text-lg font-medium text-gray-700 dark:text-gray-200">
                    <span className="font-bold">{totalRects}</span> אזורים נבחרו
                </div>
                <div className="flex items-center gap-2">
                     {!isMultiPage && (
                        <button
                            onClick={async () => {
                                if (isProcessing) return;
                                setIsProcessing(true);
                                const response = await fetch(imageSrcs[0]);
                                const blob = await response.blob();
                                const file = new File([blob], "full_payslip.png", { type: blob.type });
                                onCropComplete([file]);
                            }}
                            disabled={isProcessing}
                            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            aria-label="נתח את התמונה המלאה ללא סימון אזורים"
                        >
                            {isProcessing ? 'מעבד...' : 'נתח תמונה מלאה'}
                        </button>
                     )}
                    <button
                        onClick={handleAnalyze}
                        disabled={totalRects === 0 || isProcessing}
                        className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'מעבד...' : `נתח אזורים (${totalRects})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;