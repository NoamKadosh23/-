
import React, { useState, useEffect } from 'react';
import { AppStates } from './types';
import type { PayslipData, AppState, ChatMessage } from './types';
import { analyzePayslipImage, answerUserQuestion } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import PayslipAnalysis from './components/PayslipAnalysis';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppStates.AWAITING_UPLOAD);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageData, setUploadedImageData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [payslipData, setPayslipData] = useState<PayslipData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('payslipAnalyzerSession');
      if (savedSession) {
        const data = JSON.parse(savedSession);
        if (data.appState && data.uploadedImage && data.payslipData && data.chatMessages && data.uploadedImageData) {
            setAppState(data.appState);
            setUploadedImage(data.uploadedImage);
            setPayslipData(data.payslipData);
            setChatMessages(data.chatMessages);
            setUploadedImageData(data.uploadedImageData);
        }
      }
    } catch (e) {
      console.error("Failed to load session from local storage.", e);
      localStorage.removeItem('payslipAnalyzerSession');
    }
  }, []);

  useEffect(() => {
    if (appState === AppStates.ANALYZING || !payslipData) {
        return;
    }
    const sessionData = {
        appState,
        uploadedImage,
        payslipData,
        chatMessages,
        uploadedImageData,
    };
    localStorage.setItem('payslipAnalyzerSession', JSON.stringify(sessionData));
  }, [appState, uploadedImage, payslipData, chatMessages, uploadedImageData]);


  const handleImageUpload = async (file: File) => {
    setError(null);
    setAppState(AppStates.ANALYZING);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64Image = dataUrl.split(',')[1];
      setUploadedImage(dataUrl);
      setUploadedImageData({ base64: base64Image, mimeType: file.type });
      try {
        const data = await analyzePayslipImage(base64Image, file.type);
        setPayslipData(data);
        setChatMessages([{ sender: 'bot', text: "שלום אני גרזני האם יש לך שאלות על התלוש?", options: ["כן", "לא"] }]);
        setAppState(AppStates.DISPLAYING_DATA);
      } catch (err) {
        console.error(err);
        setError("מצטער, הייתה שגיאה בניתוח התלוש. אנא נסה שוב עם תמונה ברורה יותר.");
        setAppState(AppStates.AWAITING_UPLOAD);
        setUploadedImage(null);
        setUploadedImageData(null);
      }
    };
    reader.onerror = () => {
      setError("שגיאה בקריאת קובץ התמונה.");
      setAppState(AppStates.AWAITING_UPLOAD);
    };
  };
  
  const addBotMessage = (text: string, options: string[] = []) => {
    setChatMessages(prev => [...prev, { sender: 'bot', text, options }]);
  };
  
  const addUserMessage = (text: string) => {
    setChatMessages(prev => [...prev, { sender: 'user', text }]);
  };

  const handleUserResponse = (response: string) => {
    addUserMessage(response);
    if (appState === AppStates.DISPLAYING_DATA) {
      if (response === 'כן') {
        setAppState(AppStates.FREE_CHAT);
        addBotMessage("בטח, שאל מה שתרצה לדעת על התלוש.");
      } else { // response is 'לא'
        addBotMessage("אוקי יום טוב ועל תשכח להכין למאור פסטה פיטריות.");
        setAppState(AppStates.DONE);
      }
    }
  };

  const handleFreeFormSubmit = async (question: string) => {
    if (!uploadedImageData || isAnswering) return;

    addUserMessage(question);
    setIsAnswering(true);
    addBotMessage("גרזני חושב...");

    try {
        const answer = await answerUserQuestion(uploadedImageData.base64, uploadedImageData.mimeType, question);
        
        setChatMessages(prev => {
            const filtered = prev.filter(msg => !(msg.sender === 'bot' && msg.text === "גרזני חושב..."));
            return [...filtered, { sender: 'bot', text: answer }];
        });

    } catch (err) {
        console.error(err);
        setChatMessages(prev => {
            const filtered = prev.filter(msg => !(msg.sender === 'bot' && msg.text === "גרזני חושב..."));
            return [...filtered, { sender: 'bot', text: "מצטער, הייתה לי בעיה בעיבוד השאלה. אפשר לנסות שוב?" }];
        });
    } finally {
        setIsAnswering(false);
    }
  };

  const handleReset = () => {
    setAppState(AppStates.AWAITING_UPLOAD);
    setUploadedImage(null);
    setUploadedImageData(null);
    setPayslipData(null);
    setChatMessages([]);
    setError(null);
    setIsAnswering(false);
    localStorage.removeItem('payslipAnalyzerSession');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      <div className="w-full max-w-6xl mx-auto flex flex-col flex-grow">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
            מנתח תלושי שכר חכם
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            העלה תמונה של תלוש השכר שלך, וקבל הסבר מפורט על כל סעיף
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">שלב 1: העלאת תלוש</h2>
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              isLoading={appState === AppStates.ANALYZING} 
              uploadedImage={uploadedImage}
            />
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">שלב 2: ניתוח ושיחה</h2>
            {appState === AppStates.AWAITING_UPLOAD && <div className="text-center text-gray-500 pt-16">ממתין להעלאת תלוש...</div>}
            {appState === AppStates.ANALYZING && <div className="text-center text-gray-500 pt-16">מנתח את התלוש, נא להמתין...</div>}
            {payslipData && appState !== AppStates.ANALYZING && (
              <div className="flex flex-col gap-6">
                <PayslipAnalysis data={payslipData} />
                <ChatBot 
                    messages={chatMessages} 
                    onUserResponse={handleUserResponse}
                    isInputVisible={appState === AppStates.FREE_CHAT}
                    onTextInputSubmit={handleFreeFormSubmit}
                    isSubmitting={isAnswering}
                />
              </div>
            )}
          </div>
        </main>
        
        {appState !== AppStates.AWAITING_UPLOAD && (
            <footer className="text-center mt-8 py-4">
                <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors"
                    aria-label="התחל מחדש עם תלוש חדש"
                >
                    העלה תלוש חדש
                </button>
            </footer>
        )}
      </div>
    </div>
  );
};

export default App;
