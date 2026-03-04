// [עברית] זהו הקובץ המרכזי של האפליקציה, הקומפוננטה 'App'.
// היא כמו המוח של הפעולה - מנהלת את כל המצבים, הנתונים והאינטראקציות עם המשתמש.

import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { AppStates } from './types';
import type { PayslipData, AppState, ChatMessage, PayslipSession } from './types';
import { analyzePayslipParts, answerUserQuestion, correctPayslipData, answerGlobalQuestion } from './services/geminiService';
import { DEMO_SESSIONS } from './services/demoData';
import ImageUploader from './components/ImageUploader';
import PayslipAnalysis from './components/PayslipAnalysis';
import ChatBot from './components/admin/ChatBot';
import PresentationMode from './components/PresentationMode';
import { PresentationIcon } from './components/icons/PresentationIcon';
import ImageCropper from './components/ImageCropper';
import { AdminIcon } from './components/icons/AdminIcon';
import { DatabaseIcon } from './components/icons/DatabaseIcon';
import AdminPortal from './components/AdminPortal'; // [עברית] ייבוא פורטל הניהול החדש והנפרד

// [עברית] הגדרת המיקום של קובץ העזר (worker) של ספריית ה-PDF.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';

const App: React.FC = () => {
  // --- ניהול מצב האפליקציה (State) ---

  const [appState, setAppState] = useState<AppState>(AppStates.AWAITING_UPLOAD);
  const [sessions, setSessions] = useState<PayslipSession[]>([]);
  const [nextSessionId, setNextSessionId] = useState(1);
  const [imagesForCropping, setImagesForCropping] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  
  // [עברית] מצבים עבור הצ'אט הגלובלי
  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);
  const [globalChatMessages, setGlobalChatMessages] = useState<ChatMessage[]>([]);
  const [isFollowUp, setIsFollowUp] = useState(true);

  // [עברית] מצבים עבור מצב ניהול - עכשיו רק שולטים בכניסה/יציאה
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // [עברית] מצב חדש לשליטה על חלון בחירת תלושי הדגמה
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // [עברית] מצבים עבור הצגת תמונה מוגדלת וזום
  const [zoomedImageSrc, setZoomedImageSrc] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const startPositionRef = useRef({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);


  // --- פונקציות המטפלות בפעולות המשתמש ---
  
  const handleLoadDemoData = () => {
    // [עברית] פותח את חלון בחירת תלושי ההדגמה.
    if (DEMO_SESSIONS.length === 0) {
      alert("עדיין לא הוגדרו תלושי הדגמה.");
      return;
    }
    setIsDemoModalOpen(true);
  };

  const handleSelectDemo = (sessionId: number) => {
    // [עברית] מוסיף תלוש הדגמה נבחר לרשימת הסשנים.
    const sessionToLoad = DEMO_SESSIONS.find(s => s.id === sessionId);
    if (sessionToLoad && !sessions.some(s => s.id === sessionId)) {
      setSessions(prev => [...prev, sessionToLoad]);
      setAppState(AppStates.SESSION_VIEW);
    }
    setIsDemoModalOpen(false); // [עברית] סוגר את החלון בכל מקרה
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);

    const processImages = (dataUrls: string[]) => {
      setImagesForCropping(dataUrls);
      setAppState(AppStates.CROPPING);
      setIsUploading(false);
    };
    
    const reader = new FileReader();
    reader.onerror = () => {
      setError("שגיאה בקריאת הקובץ.");
      setAppState(sessions.length > 0 ? AppStates.SESSION_VIEW : AppStates.AWAITING_UPLOAD);
      setIsUploading(false);
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
            if (!context) throw new Error('לא ניתן היה ליצור קונטקסט לקנבס');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport, canvas } as any).promise;
            pageImages.push(canvas.toDataURL('image/png'));
          }
          processImages(pageImages);

        } catch (err) {
          console.error("שגיאה בעיבוד PDF:", err);
          setError("שגיאה בעיבוד קובץ ה-PDF.");
          setAppState(sessions.length > 0 ? AppStates.SESSION_VIEW : AppStates.AWAITING_UPLOAD);
        } finally {
          setIsUploading(false);
        }
      };
    } else {
      setError("סוג קובץ לא נתמך. אנא העלה קובץ תמונה (PNG, JPG) או PDF.");
      setIsUploading(false);
    }
  };

  const handleCropComplete = async (files: File[]) => {
    if (files.length === 0) {
        setError("לא נבחרו אזורים לניתוח. אנא סמן לפחות אזור אחד.");
        setAppState(AppStates.CROPPING);
        return;
    }
    await handlePartsUpload(files);
  };
  
  const handlePartsUpload = async (files: File[]) => {
      setError(null);
      setAppState(AppStates.ANALYZING);

      try {
          const imagePayloads = await Promise.all(files.map(file => 
            new Promise<{ base64Image: string; mimeType: string }>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const dataUrl = reader.result as string;
                    resolve({ base64Image: dataUrl.split(',')[1], mimeType: file.type });
                };
                reader.onerror = reject;
            })
          ));

          const data = await analyzePayslipParts(imagePayloads); // [עברית] שימוש בפונקציית הניתוח הרגילה למשתמש
          const newSession: PayslipSession = {
            id: nextSessionId,
            title: `תלוש #${nextSessionId} - ${data.payPeriod || 'תקופה לא ידועה'}`,
            uploadedImage: imagesForCropping[0], 
            payslipData: data,
            chatMessages: [{ 
                sender: 'bot', 
                text: `סיימתי לנתח את התלוש. הנתונים מוצגים לצד הצ'אט.\n\nעכשיו אפשר לשאול אותי כל שאלה, או ללחוץ על כל סעיף ברשימה לקבלת הסבר.`
            }]
          };

          setSessions(prev => [...prev, newSession]);
          setNextSessionId(prev => prev + 1);
          setImagesForCropping([]);
          setAppState(AppStates.SESSION_VIEW);
          
      } catch (err) {
          console.error(err);
          const errorMessage = err instanceof Error ? err.message : "מצטער, הייתה שגיאה בניתוח חלקי התלוש. אנא נסה שוב.";
          setError(errorMessage);
          setAppState(sessions.length > 0 ? AppStates.SESSION_VIEW : AppStates.AWAITING_UPLOAD);
          setImagesForCropping([]);
      }
  };

  const updateSessionChat = (sessionId: number, newMessages: ChatMessage[]) => {
    setSessions(prevSessions => prevSessions.map(session => 
      session.id === sessionId ? { ...session, chatMessages: newMessages } : session
    ));
  };
  
  const handleFreeFormSubmit = async (question: string, sessionId: number) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session?.payslipData || isAnswering) return;

    const relevantHistory = isFollowUp
      ? session.chatMessages.filter(msg => msg.sender === 'user' || (msg.sender === 'bot' && !msg.text.startsWith('סיימתי לנתח')))
      : [];
      
    const updatedMessagesWithUser = [...session.chatMessages, { sender: 'user', text: question } as ChatMessage];
    updateSessionChat(sessionId, updatedMessagesWithUser);
    
    setIsAnswering(true);
    
    const updatedMessagesWithThinking = [...updatedMessagesWithUser, { sender: 'bot', text: "יועץ הכלכלה שלך חושב..." } as ChatMessage];
    updateSessionChat(sessionId, updatedMessagesWithThinking);

    try {
        const answerText = await answerUserQuestion(session.payslipData, question, relevantHistory);
        const finalMessages = [...updatedMessagesWithUser, { sender: 'bot', text: answerText } as ChatMessage];
        updateSessionChat(sessionId, finalMessages);
    } catch (err) {
        console.error(err);
        const errorMessages = [...updatedMessagesWithUser, { sender: 'bot', text: "מצטער, הייתה לי בעיה בעיבוד השאלה. אפשר לנסות שוב?" } as ChatMessage];
        updateSessionChat(sessionId, errorMessages);
    } finally {
        setIsAnswering(false);
        setIsFollowUp(true);
    }
  };

  const handleGlobalFreeFormSubmit = async (question: string) => {
    const allPayslipData = sessions.map(s => s.payslipData).filter((d): d is PayslipData => d !== null);
    if (allPayslipData.length === 0 || isAnswering) return;

    const relevantHistory = isFollowUp ? globalChatMessages : [];
      
    setGlobalChatMessages(prev => [...prev, { sender: 'user', text: question }]);
    setIsAnswering(true);
    setGlobalChatMessages(prev => [...prev, { sender: 'bot', text: "יועץ הכלכלה שלך חושב..." }]);

    try {
        const answerText = await answerGlobalQuestion(allPayslipData, question, relevantHistory);
        setGlobalChatMessages(prev => {
            const filtered = prev.filter(msg => !(msg.sender === 'bot' && msg.text === "יועץ הכלכלה שלך חושב..."));
            return [...filtered, { sender: 'bot', text: answerText }];
        });
    } catch (err) {
        console.error(err);
        setGlobalChatMessages(prev => {
            const filtered = prev.filter(msg => !(msg.sender === 'bot' && msg.text === "יועץ הכלכלה שלך חושב..."));
            return [...filtered, { sender: 'bot', text: "מצטער, הייתה לי בעיה בעיבוד השאלה. אפשר לנסות שוב?" }];
        });
    } finally {
        setIsAnswering(false);
        setIsFollowUp(true);
    }
  };

  const handleAnalysisItemClick = (itemDescription: string, sessionId: number) => {
    const question = `תוכל להסביר לי בפירוט מה זה "${itemDescription}" ואיך זה מחושב בתלוש שלי?`;
    handleFreeFormSubmit(question, sessionId);
  };

  const handleReset = () => {
    setAppState(AppStates.AWAITING_UPLOAD);
    setSessions([]);
    setNextSessionId(1);
    setImagesForCropping([]);
    setGlobalChatMessages([]);
    setError(null);
    setIsAnswering(false);
    setIsGlobalChatOpen(false);
    // [עברית] איפוס מצב ניהול
    setIsAdminMode(false);
    setIsPasswordModalOpen(false);
    setPasswordInput('');
  };

    // --- פונקציות מצב ניהול ---
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '123456789') {
        setIsAdminMode(true);
        setIsPasswordModalOpen(false);
    } else {
        alert('סיסמה שגויה');
    }
    setPasswordInput('');
  };
  
    // --- פונקציות עבור מודל התמונה המוגדלת ---
    const handleResetZoom = () => {
      setZoomScale(1);
      setZoomPosition({ x: 0, y: 0 });
    };

    const openZoomModal = (src: string) => {
        handleResetZoom();
        setZoomedImageSrc(src);
    };

    const handleCloseZoomModal = () => {
        setZoomedImageSrc(null);
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const zoomFactor = 1.1;
        const newScale = e.deltaY < 0 ? zoomScale * zoomFactor : zoomScale / zoomFactor;
        const clampedScale = Math.max(1, Math.min(newScale, 10));

        if (clampedScale === zoomScale) return;

        const rect = imageContainerRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newPosX = zoomPosition.x + mouseX * (1 / zoomScale - 1 / clampedScale);
        const newPosY = zoomPosition.y + mouseY * (1 / zoomScale - 1 / clampedScale);

        setZoomScale(clampedScale);
        setZoomPosition({ x: newPosX, y: newPosY });

        if (clampedScale === 1) {
            handleResetZoom();
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0 || zoomScale <= 1) return;
        e.preventDefault();
        setIsPanning(true);
        panStartRef.current = { x: e.clientX, y: e.clientY };
        startPositionRef.current = { ...zoomPosition };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPanning) return;
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        const newX = startPositionRef.current.x + dx / zoomScale;
        const newY = startPositionRef.current.y + dy / zoomScale;
        setZoomPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };
    
    const handleZoom = (direction: 'in' | 'out') => {
        const container = imageContainerRef.current;
        if (!container) return;

        const zoomFactor = 1.2;
        const newScale = direction === 'in' ? zoomScale * zoomFactor : zoomScale / zoomFactor;
        const clampedScale = Math.max(1, Math.min(newScale, 10));

        if (clampedScale === zoomScale) return;

        const rect = container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const newPosX = zoomPosition.x + centerX * (1 / zoomScale - 1 / clampedScale);
        const newPosY = zoomPosition.y + centerY * (1 / zoomScale - 1 / clampedScale);
        
        setZoomScale(clampedScale);
        setZoomPosition({ x: newPosX, y: newPosY });

        if (clampedScale === 1) {
            handleResetZoom();
        }
    };
    const handleZoomIn = () => handleZoom('in');
    const handleZoomOut = () => handleZoom('out');

  const getFlowTitle = () => {
    switch(appState) {
        case AppStates.AWAITING_UPLOAD:
            return `שלב 1: העלאת תלוש ${sessions.length > 0 ? `#${sessions.length + 1}` : ''}`;
        case AppStates.CROPPING:
            return `שלב 2: סימון אזורים לניתוח`;
        case AppStates.ANALYZING:
            return `שלב 3: מנתח את התלוש...`;
        default:
            return 'לוח הבקרה';
    }
  }
  
  // [עברית] משתני עזר לחישוב אילו תלושי הדגמה זמינים.
  const loadedDemoIds = sessions.map(s => s.id);
  const availableDemos = DEMO_SESSIONS.filter(demo => !loadedDemoIds.includes(demo.id));


  const renderUploadFlow = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">
            {getFlowTitle()}
        </h2>
        {appState === AppStates.AWAITING_UPLOAD && (
            <ImageUploader onFileUpload={handleFileUpload} isLoading={isUploading} uploadedImage={null} />
        )}
        {appState === AppStates.CROPPING && imagesForCropping.length > 0 && (
            <ImageCropper imageSrcs={imagesForCropping} onCropComplete={handleCropComplete} />
        )}
        {appState === AppStates.ANALYZING && (
             <div className="flex flex-col items-center justify-center w-full h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">{getFlowTitle()}</p>
            </div>
        )}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        {sessions.length > 0 && appState !== AppStates.ANALYZING && (
             <div className="text-center mt-6">
                <button
                    onClick={() => { setAppState(AppStates.SESSION_VIEW); setError(null); setImagesForCropping([]); }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-colors"
                    aria-label="חזור לתצוגת התלושים"
                >
                    בטל וחזור
                </button>
            </div>
        )}
    </div>
  );

  const renderSessionsView = () => (
    <div className="flex flex-col gap-8">
      {sessions.map(session => session.payslipData && (
        <details key={session.id} open className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 group">
          <summary className="text-2xl font-semibold cursor-pointer list-none flex justify-between items-center">
            {session.title}
             <svg className="w-6 h-6 transform transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
             <div 
                className="w-full p-2 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 relative group/zoom cursor-pointer"
                onClick={() => openZoomModal(session.uploadedImage!)}
            >
                <img 
                    src={session.uploadedImage} 
                    alt={`Payslip ${session.id}`} 
                    className="max-h-96 w-auto mx-auto rounded-md"
                />
                <div className="absolute inset-2 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover/zoom:opacity-100 transition-opacity rounded-md">
                    <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        <span className="mt-2 font-semibold">הגדל תמונה</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col h-full">
              <div className="flex-grow overflow-y-auto pr-2 -mr-2 mb-4">
                  <PayslipAnalysis data={session.payslipData} onItemClick={(desc) => handleAnalysisItemClick(desc, session.id)} />
              </div>
              <ChatBot 
                  messages={session.chatMessages} 
                  onUserResponse={() => {}}
                  isInputVisible={true}
                  onTextInputSubmit={(q) => handleFreeFormSubmit(q, session.id)}
                  isSubmitting={isAnswering}
                  isFollowUp={isFollowUp}
                  onFollowUpChange={setIsFollowUp}
              />
            </div>
          </div>
        </details>
      ))}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl">
        <button
          onClick={() => { setAppState(AppStates.AWAITING_UPLOAD); setError(null); }}
          className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
        >
          הוסף תלוש חדש
        </button>
        {availableDemos.length > 0 && (
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
          >
            טען הדגמה נוספת
          </button>
        )}
        {sessions.length > 1 && (
          <button
            onClick={() => setIsGlobalChatOpen(true)}
            className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-transform transform hover:scale-105"
          >
            שאל על כל התלושים
          </button>
        )}
      </div>
    </div>
  );
  
  // [עברית] אם אנחנו במצב ניהול, נציג את הפורטל הנפרד.
  if (isAdminMode) {
    return <AdminPortal onExit={handleReset} />
  }

  // [עברית] התצוגה הרגילה של האפליקציה
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      <div className="fixed top-4 right-4 z-40 text-xs text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-black/70 p-2 rounded-lg backdrop-blur-sm shadow-md">
          <p className="font-bold">נוצר על ידי:</p>
          <ul className="mt-1 space-y-1">
              <li>נעם קדוש - 332136340</li>
              <li>יהונתן עדה - 216654822</li>
              <li>מרום בציר - 216152595</li>
          </ul>
      </div>

      {showPresentation && <PresentationMode onClose={() => setShowPresentation(false)} />}
      
       <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="fixed bottom-4 left-4 z-50 p-3 bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
          aria-label="פתח מצב ניהול"
          title="פתח מצב ניהול"
       >
          <AdminIcon />
       </button>

      <div className="w-full max-w-7xl mx-auto flex flex-col flex-grow">
        <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
              מנתח תלושי שכר חכם
            </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            העלה תלושים, קבל ניתוח חכם, והשווה תקופות עם יועץ הכלכלה שלך.
          </p>
           <div className="flex justify-center items-center gap-4 mt-4">
              <button 
                onClick={() => setShowPresentation(true)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                >
                    <PresentationIcon />
                    הצגת יכולות
              </button>
              {sessions.length === 0 && DEMO_SESSIONS.length > 0 && (
                <button 
                  onClick={handleLoadDemoData}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                >
                  <DatabaseIcon />
                  טען תלושי הדגמה
                </button>
              )}
              {sessions.length > 0 && (
                 <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-50 text-red-700 font-semibold rounded-full shadow-sm hover:bg-red-100 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900/80 border border-red-200 dark:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors"
                    aria-label="התחל הכל מחדש"
                >
                    התחל הכל מחדש
                </button>
              )}
           </div>
        </header>

        <main className="w-full flex-grow">
          {appState === AppStates.SESSION_VIEW ? renderSessionsView() : renderUploadFlow()}
        </main>
      </div>

       {isDemoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setIsDemoModalOpen(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-center mb-6">בחר תלוש הדגמה לטעינה</h2>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {availableDemos.length > 0 ? (
                        availableDemos.map(demo => (
                            <button
                                key={demo.id}
                                onClick={() => handleSelectDemo(demo.id)}
                                className="w-full text-right px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors text-lg"
                            >
                                {demo.title}
                            </button>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">כל תלושי ההדגמה כבר נטענו.</p>
                    )}
                </div>
                <div className="flex justify-center mt-6">
                    <button onClick={() => setIsDemoModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                        ביטול
                    </button>
                </div>
            </div>
        </div>
      )}
      
      {isGlobalChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setIsGlobalChatOpen(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] max-h-[700px] flex flex-col p-6 sm:p-8 transform transition-all duration-300 scale-95 animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-cyan-400">
                        שיחה על כל התלושים
                    </h2>
                    <button
                        onClick={() => setIsGlobalChatOpen(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        aria-label="Close global chat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-6">כאן אפשר לשאול שאלות השוואתיות, למשל: "מה היה הברוטו הממוצע שלי?" או "השווה את ניכויי המס בין החודשים".</p>
                <div className="flex-grow min-h-0">
                    <ChatBot 
                        messages={globalChatMessages} 
                        onUserResponse={() => {}}
                        isInputVisible={true}
                        onTextInputSubmit={handleGlobalFreeFormSubmit}
                        isSubmitting={isAnswering}
                        isFollowUp={isFollowUp}
                        onFollowUpChange={setIsFollowUp}
                    />
                </div>
            </div>
             <style>{`
                @keyframes scale-in {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                animation: scale-in 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
                }
            `}</style>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-center mb-4">כניסה למצב ניהול</h2>
                <form onSubmit={handlePasswordSubmit}>
                    <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full px-4 py-2 text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        placeholder="הזן סיסמה"
                        autoFocus
                    />
                    <div className="flex justify-center gap-4 mt-6">
                        <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300">ביטול</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700">כניסה</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {zoomedImageSrc && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-[100] p-4 backdrop-blur-sm animate-fade-in-fast" 
          onClick={handleCloseZoomModal}
        >
          <div
            ref={imageContainerRef}
            className="relative max-w-[95vw] max-h-[95vh] w-auto h-auto overflow-hidden rounded-lg shadow-2xl"
            style={{ cursor: isPanning ? 'grabbing' : (zoomScale > 1 ? 'grab' : 'default') }}
            onClick={e => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img 
              src={zoomedImageSrc} 
              alt="Payslip zoomed" 
              className="w-full h-full object-contain"
              style={{
                transform: `scale(${zoomScale}) translate(${zoomPosition.x}px, ${zoomPosition.y}px)`,
                transformOrigin: '0 0',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
          <button
              onClick={handleCloseZoomModal}
              className="absolute top-4 right-4 text-white bg-gray-800 rounded-full p-2 hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close zoomed image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800/70 backdrop-blur-sm p-2 rounded-full flex items-center gap-2 text-white shadow-lg">
              <div className="text-xs px-2 text-gray-300 hidden sm:block">
                Scroll to zoom, drag to pan
              </div>
              <button onClick={handleZoomOut} title="Zoom Out" className="w-8 h-8 rounded-full hover:bg-white/20 text-xl font-bold flex items-center justify-center">－</button>
              <span className="w-16 text-center text-sm font-mono tabular-nums">{(zoomScale * 100).toFixed(0)}%</span>
              <button onClick={handleZoomIn} title="Zoom In" className="w-8 h-8 rounded-full hover:bg-white/20 text-xl font-bold flex items-center justify-center">＋</button>
              <div className="w-px h-5 bg-gray-500 mx-1"></div>
              <button onClick={handleResetZoom} disabled={zoomScale === 1 && zoomPosition.x === 0 && zoomPosition.y === 0} className="px-3 h-8 text-sm rounded-full hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-transparent">Reset</button>
          </div>
          <style>{`
            @keyframes fade-in-fast {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in-fast {
                animation: fade-in-fast 0.2s ease-out forwards;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default App;