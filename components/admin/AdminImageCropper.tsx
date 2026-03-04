// [עברית] גרסה ייעודית של רכיב סימון האזורים, המעוצבת במיוחד עבור פורטל הניהול.
// היא משתמשת בסכמת הצבעים של שחור/אפור/אדום.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FullScreenIcon } from '../icons/FullScreenIcon';
import { ExitFullScreenIcon } from '../icons/ExitFullScreenIcon';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AdminImageCropperProps {
  imageSrcs: string[];
  onCropComplete: (files: File[]) => void;
}

const AdminImageCropper: React.FC<AdminImageCropperProps> = ({ imageSrcs, onCropComplete }) => {
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

    const getDeleteButtonPosition = useCallback((rect: Rect): { x: number; y: number } => {
        return { x: rect.x + rect.width, y: rect.y };
    }, []);

    const isOverDeleteButton = useCallback((pos: { x: number, y: number }, rect: Rect): boolean => {
        const buttonPos = getDeleteButtonPosition(rect);
        const dx = pos.x - buttonPos.x;
        const dy = pos.y - buttonPos.y;
        return dx * dx + dy * dy < DELETE_BUTTON_RADIUS * DELETE_BUTTON_RADIUS;
    }, [getDeleteButtonPosition]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

     useEffect(() => {
        const image = new Image();
        image.src = imageSrcs[currentPageIndex];
        imageRefs.current[currentPageIndex] = image;

        const handleResizeAndDraw = () => {
            const canvas = canvasRef.current;
            if (!canvas || !image.complete || image.naturalHeight === 0) return;

            const imageAspectRatio = image.naturalWidth / image.naturalHeight;
            let targetWidth: number, targetHeight: number;

            if (isFullscreen) {
                const padding = 120;
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
                } else return;
            }
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            
            const rectanglesForCurrentPage = allRectangles[currentPageIndex] || [];
            rectanglesForCurrentPage.forEach((rect, index) => {
                ctx.strokeStyle = '#ef4444'; // red-500
                ctx.lineWidth = 3;
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                
                ctx.fillStyle = '#ef4444'; // red-500
                ctx.font = 'bold 16px Rubik, sans-serif';
                ctx.fillText((index + 1).toString(), rect.x + 5, rect.y + 20);

                const buttonPos = getDeleteButtonPosition(rect);
                ctx.beginPath();
                ctx.arc(buttonPos.x, buttonPos.y, DELETE_BUTTON_RADIUS, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'; // red-500
                ctx.fill();
                
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
                ctx.strokeStyle = 'rgba(252, 165, 165, 0.8)'; // red-300
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
                ctx.setLineDash([]);
            }
        };
        
        image.onload = handleResizeAndDraw;
        window.addEventListener('resize', handleResizeAndDraw);
        handleResizeAndDraw();

        return () => window.removeEventListener('resize', handleResizeAndDraw);
    }, [imageSrcs, currentPageIndex, isFullscreen, allRectangles, currentRect, getDeleteButtonPosition]);

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): { x: number, y: number } => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isProcessing) return;
        
        if (hoveredDeleteIndex !== null) {
            const currentRects = allRectangles[currentPageIndex] || [];
            const newRects = currentRects.filter((_, i) => i !== hoveredDeleteIndex);
            setAllRectangles(prev => ({...prev, [currentPageIndex]: newRects }));
            setHoveredDeleteIndex(null);
            if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
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
            canvas.style.cursor = hoveringIndex !== null ? 'pointer' : 'crosshair';
            setHoveredDeleteIndex(hoveringIndex);
        }

        if (startPoint && !isDragging) {
            const dx = pos.x - startPoint.x;
            const dy = pos.y - startPoint.y;
            if (Math.sqrt(dx * dx + dy * dy) > 5) setIsDragging(true);
        }

        let rectToShow: Rect | null = null;
        if (isDragging && startPoint) {
            const width = pos.x - startPoint.x;
            const height = pos.y - startPoint.y;
            rectToShow = { x: width > 0 ? startPoint.x : pos.x, y: height > 0 ? startPoint.y : pos.y, width: Math.abs(width), height: Math.abs(height) };
        } else if (firstClickPoint) {
            const width = pos.x - firstClickPoint.x;
            const height = pos.y - firstClickPoint.y;
            rectToShow = { x: width > 0 ? firstClickPoint.x : pos.x, y: height > 0 ? firstClickPoint.y : pos.y, width: Math.abs(width), height: Math.abs(height) };
        }
        setCurrentRect(rectToShow);
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!startPoint) return;
        
        const addRect = (rect: Rect) => {
             if (rect.width > 10 && rect.height > 10) {
                setAllRectangles(prev => ({...prev, [currentPageIndex]: [...(prev[currentPageIndex] || []), rect] }));
            }
        };

        if (isDragging) {
             if (currentRect) addRect(currentRect);
        } else {
            const pos = getMousePos(e);
            if (firstClickPoint) {
                const width = pos.x - firstClickPoint.x;
                const height = pos.y - firstClickPoint.y;
                addRect({ x: width > 0 ? firstClickPoint.x : pos.x, y: height > 0 ? firstClickPoint.y : pos.y, width: Math.abs(width), height: Math.abs(height) });
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
        if (isDragging && currentRect && currentRect.width > 10 && currentRect.height > 10) {
            setAllRectangles(prev => ({...prev, [currentPageIndex]: [...(prev[currentPageIndex] || []), currentRect] }));
        }
        setStartPoint(null);
        setIsDragging(false);
        setCurrentRect(null);
    };

    const handleAnalyze = async () => {
        const canvas = canvasRef.current;
        if (!canvas || Object.values(allRectangles).flat().length === 0 || isProcessing) return;

        setIsProcessing(true);
        const allFiles: File[] = [];
        let partCounter = 1;

        for (const pageIndexStr in allRectangles) {
            const pageIndex = parseInt(pageIndexStr, 10);
            const rectsForPage = allRectangles[pageIndex];
            if (rectsForPage && rectsForPage.length > 0) {
                const image = imageRefs.current[pageIndex] || await new Promise<HTMLImageElement>(resolve => {
                    const temp = new Image();
                    temp.src = imageSrcs[pageIndex];
                    temp.onload = () => resolve(temp);
                });

                const scaleX = image.naturalWidth / canvas.width;
                const scaleY = image.naturalHeight / canvas.height;

                const cropPromises = rectsForPage.map(rect => new Promise<File>((resolve, reject) => {
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d')!;
                    const cropX = rect.x * scaleX, cropY = rect.y * scaleY, cropWidth = rect.width * scaleX, cropHeight = rect.height * scaleY;
                    tempCanvas.width = cropWidth;
                    tempCanvas.height = cropHeight;
                    tempCtx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
                    tempCanvas.toBlob(blob => blob ? resolve(new File([blob], `part_${partCounter++}.png`, { type: 'image/png' })) : reject(), 'image/png');
                }));
                allFiles.push(...(await Promise.all(cropPromises)));
            }
        }
        onCropComplete(allFiles);
    };

    const totalRects = Object.values(allRectangles).flat().length;

    return (
        <div className={isFullscreen ? "fixed inset-0 z-50 bg-black/95 flex flex-col p-4 gap-4" : "flex flex-col items-center w-full"}>
            <div className="flex-shrink-0 p-4 bg-red-900/30 rounded-lg border border-red-800 w-full text-center flex justify-between items-center">
                <p className="text-md text-red-200">
                    <strong>שלב 2:</strong> גרור כדי לסמן אזור, או לחץ בשתי נקודות.
                     {firstClickPoint && <span className="font-bold block mt-1">לחץ שוב כדי להשלים.</span>}
                </p>
                 <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 rounded-full text-red-200 hover:bg-white/10 transition-colors" aria-label={isFullscreen ? "צא ממסך מלא" : "מסך מלא"}>
                    {isFullscreen ? <ExitFullScreenIcon /> : <FullScreenIcon />}
                </button>
            </div>
            
             <div className="relative w-full flex-grow flex items-center justify-center min-h-0 my-4">
                <div className="border-2 border-dashed rounded-lg border-gray-600 p-1 inline-block">
                    <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave} className="cursor-crosshair rounded-md" />
                </div>
            </div>
            
             {isMultiPage && (
                <div className="flex-shrink-0 flex justify-center items-center gap-4 my-2">
                    <button onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))} disabled={currentPageIndex === 0} className="px-4 py-2 bg-gray-700 text-gray-200 font-semibold rounded-lg hover:bg-gray-600 disabled:opacity-50">הקודם</button>
                    <span className="font-bold text-lg">עמוד {currentPageIndex + 1} מתוך {imageSrcs.length}</span>
                    <button onClick={() => setCurrentPageIndex(p => Math.min(imageSrcs.length - 1, p + 1))} disabled={currentPageIndex === imageSrcs.length - 1} className="px-4 py-2 bg-gray-700 text-gray-200 font-semibold rounded-lg hover:bg-gray-600 disabled:opacity-50">הבא</button>
                </div>
            )}

            <div className="flex-shrink-0 flex items-center justify-between w-full mt-auto bg-gray-800 p-4 rounded-b-lg border-t border-gray-700">
                <button onClick={() => setAllRectangles({})} disabled={totalRects === 0 || isProcessing} className="px-6 py-2 bg-gray-600 text-gray-200 font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-50">נקה הכל</button>
                <div className="text-lg font-medium"><span className="font-bold">{totalRects}</span> אזורים נבחרו</div>
                <div className="flex items-center gap-2">
                    <button onClick={handleAnalyze} disabled={totalRects === 0 || isProcessing} className="px-8 py-3 bg-red-700 text-white font-bold rounded-lg shadow-md hover:bg-red-800 transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isProcessing ? 'מעבד...' : `נתח ${totalRects} אזורים`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminImageCropper;
