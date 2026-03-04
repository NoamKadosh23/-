// [עברית] זוהי קומפוננטת הצ'אט, הלב של האינטראקציה עם המשתמש לאחר ניתוח התלוש.
// היא אחראית על הצגת היסטוריית השיחה, קבלת קלט מהמשתמש (טקסט או כפתורים), וטיפול בשליחת הקלט ללוגיקה הראשית.

import React, { useRef, useEffect, useState } from 'react';
import type { ChatMessage } from '../../types';
import { BotIcon } from '../icons/BotIcon';
import { UserIcon } from '../icons/UserIcon';
import { SendIcon } from '../icons/SendIcon';
import { PaperclipIcon } from '../icons/PaperclipIcon';

// [עברית] הגדרת ה-Props שהקומפוננטה מקבלת.
interface ChatBotProps {
  messages: ChatMessage[]; // מערך כל הודעות השיחה.
  onUserResponse: (response: string) => void; // פונקציה להפעלה כשהמשתמש לוחץ על כפתור אופציה.
  isInputVisible?: boolean; // האם להציג את תיבת הטקסט לקלט?
  onTextInputSubmit?: (text: string) => void; // פונקציה להפעלה כשהמשתמש שולח טקסט חופשי.
  isSubmitting?: boolean; // האם הבוט חושב כרגע? (כדי לנעול את הקלט).
  isCorrectionMode?: boolean; // האם אנחנו במצב של קבלת תיקון?
  onCorrectionSubmit?: (text: string, image?: File) => void; // פונקציה להפעלה כשהמשתמש שולח תיקון.
  isFollowUp: boolean; // [עברית] האם השאלה הבאה היא שאלת המשך?
  onFollowUpChange: (checked: boolean) => void; // [עברית] פונקציה לעדכון מצב שאלת ההמשך.
}

const ChatBot: React.FC<ChatBotProps> = ({ 
  messages, 
  onUserResponse, 
  isInputVisible = false, 
  onTextInputSubmit, 
  isSubmitting = false,
  isCorrectionMode = false,
  onCorrectionSubmit,
  isFollowUp,
  onFollowUpChange
}) => {
  // [עברית] useRef הוא 'הוק' של ריאקט שמאפשר ליצור הפניה (reference) לאלמנט HTML.
  // אנו משתמשים בו כדי שנוכל לגלול את תיבת הצ'אט לתחתית באופן אוטומטי כשהודעה חדשה נוספת.
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // [עברית] הפניה חדשה ל-textarea.
  // [עברית] משתני מצב (state) לניהול תוכן תיבת הטקסט והקובץ המצורף.
  const [inputValue, setInputValue] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  // [עברית] הפניה נוספת, הפעם לאלמנט ה-input של הקובץ, כדי שנוכל "ללחוץ" עליו דרך קוד.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // [עברית] פונקציה שמבצעת את הגלילה לתחתית תיבת ההודעות.
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // [עברית] אפקט חדש שמטפל בשינוי גודל אוטומטי של ה-textarea.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // [עברית] מאפסים את הגובה כדי לחשב מחדש.
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`; // [עברית] מגדירים את הגובה לגובה הגלילה.
    }
  }, [inputValue]); // [עברית] מופעל מחדש בכל פעם שהטקסט משתנה.

  // [עברית] useEffect שמופעל בכל פעם שמערך ההודעות (messages) משתנה.
  // התוצאה: בכל פעם שנוספת הודעה, המסך גולל למטה.
  useEffect(scrollToBottom, [messages]);
  
  // [עברית] useEffect נוסף, שמטפל בהדבקת תמונות לתוך תיבת הטקסט במצב תיקון.
  useEffect(() => {
    if (!isInputVisible || !isCorrectionMode) return;

    const handlePaste = (event: ClipboardEvent) => {
      if (event.clipboardData?.files && event.clipboardData.files.length > 0) {
        const imageFile = Array.from(event.clipboardData.files).find(file => file.type.startsWith('image/'));
        if (imageFile) {
          event.preventDefault(); // [עברית] מונעים מהדפדפן להדביק את התמונה כטקסט.
          setAttachment(imageFile); // [עברית] שומרים את קובץ התמונה במשתנה המצב.
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [isInputVisible, isCorrectionMode]);

  // [עברית] פונקציה המטפלת בשליחת הטופס (כשהמשתמש לוחץ Enter או על כפתור השליחה).
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // [עברית] בודקים אם אנחנו במצב תיקון או במצב שאלה חופשית, ומפעילים את הפונקציה המתאימה.
    if (isCorrectionMode && onCorrectionSubmit) {
      if (inputValue.trim() || attachment) {
        onCorrectionSubmit(inputValue.trim(), attachment || undefined);
        setInputValue('');
        setAttachment(null);
      }
    } else if (onTextInputSubmit && inputValue.trim()) {
        onTextInputSubmit(inputValue.trim());
        setInputValue('');
    }
  };

  // [עברית] מטפל בלחיצת מקשים ב-textarea, כדי לשלוח עם Enter (ולרדת שורה עם Shift+Enter).
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleFormSubmit(e);
      }
  };
  
  // [עברית] פונקציות עזר לטיפול בקבצים מצורפים.
  const handleAttachmentClick = () => {
    fileInputRef.current?.click(); // [עברית] מדמה לחיצה על כפתור בחירת הקובץ הנסתר.
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = ""; // [עברית] מאפסים את הערך כדי שאפשר יהיה להעלות את אותו קובץ שוב.
    }
  }

  // [עברית] משתני עזר לבדיקת תנאים, כדי לשמור על קוד ה-JSX נקי יותר.
  const lastMessage = messages[messages.length - 1];
  const lastMessageIsBot = lastMessage?.sender === 'bot';
  // [עברית] עדכון לוגיקה: הצג כפתורים אם קיימים, גם אם תיבת הטקסט גלויה.
  const showOptions = lastMessageIsBot && lastMessage.options && lastMessage.options.length > 0;

  return (
    <div className="flex flex-col h-[28rem] bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
      {/* [עברית] אזור הצגת ההודעות */}
      <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'flex-col'}`}>
            <div className={`flex items-start gap-3 w-full ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'bot' && <div className="flex-shrink-0"><BotIcon /></div>}
                <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl whitespace-pre-wrap ${
                  msg.sender === 'bot' 
                    ? 'bg-blue-100 dark:bg-blue-900/70 rounded-tl-none' 
                    : 'bg-gray-200 dark:bg-gray-600 rounded-tr-none'
                }`}>
                  {/* [עברית] אם הבוט חושב, נציג אנימציית נקודות במקום הטקסט "יועץ הכלכלה שלך חושב...". */}
                  {isSubmitting && msg.sender === 'bot' && msg.text.includes('חושב...') ? (
                    <div className="flex items-center gap-2">
                      <span>חושב...</span>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
                {msg.sender === 'user' && <div className="flex-shrink-0"><UserIcon /></div>}
            </div>
            {/* [עברית] הצגת מקורות אם קיימים */}
            {msg.sender === 'bot' && msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 ml-11 max-w-xs md:max-w-md">
                    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">מקורות:</h4>
                    <ul className="space-y-1">
                        {msg.sources.map((source, i) => (
                            <li key={i} className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate">
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" title={source.title} className="flex items-center gap-1.5">
                                  <span>-</span>
                                  <span className="truncate">{source.title || new URL(source.uri).hostname}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        ))}
        {/* [עברית] האלמנט הריק שאליו אנו גוללים. */}
        <div ref={messagesEndRef} />
      </div>

      {/* [עברית] אם צריך להציג כפתורי אופציות, הם יופיעו כאן. */}
      {showOptions && (
        <div className="flex-shrink-0 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap justify-center gap-2">
            {lastMessage.options?.map((option, i) => (
              <button
                key={i}
                onClick={() => onUserResponse(option)}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-transparent rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/80 dark:text-blue-200 dark:hover:bg-blue-900"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* [עברית] אם צריך להציג את תיבת הטקסט, היא תופיע כאן. */}
      {isInputVisible && (
        <div className="flex-shrink-0 pt-4 border-t border-gray-200 dark:border-gray-600">
          <form onSubmit={handleFormSubmit}>
            {attachment && (
              <div className="flex items-center justify-between p-2 mb-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-sm">
                <span className="text-gray-700 dark:text-gray-200 truncate pr-2">{attachment.name}</span>
                <button onClick={removeAttachment} type="button" className="text-red-500 font-bold text-lg leading-none p-1">&times;</button>
              </div>
            )}
            <div className="flex items-start gap-2">
                {isCorrectionMode && (
                <>
                    <button
                        type="button"
                        onClick={handleAttachmentClick}
                        className="p-2.5 text-gray-500 bg-gray-200 rounded-full hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 focus:outline-none flex-shrink-0"
                        aria-label="צרף תמונה לתיקון"
                    >
                        <PaperclipIcon />
                    </button>
                    {/* [עברית] אלמנט הקלט הנסתר לצירוף קבצים. */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg"
                        capture="environment"
                    />
                </>
                )}
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isCorrectionMode ? "הסבר, צרף או הדבק (Ctrl+V) תמונה..." : "שאל את יועץ הכלכלה שלך..."}
                  className="flex-1 w-full px-4 py-2 text-gray-800 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 resize-none overflow-y-hidden"
                  disabled={isSubmitting}
                  aria-label="הקלד את שאלתך כאן"
                  rows={1}
                />
                <button
                  type="submit"
                  className="p-2.5 text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors self-end flex-shrink-0"
                  disabled={isSubmitting || (!inputValue.trim() && !attachment)}
                  aria-label="שלח שאלה"
                >
                  <SendIcon />
                </button>
            </div>
            {/* [עברית] המתג החדש לשליטה על הקשר השיחה. */}
            <div className="mt-3 flex items-center justify-center">
                <input
                  id="followUp"
                  type="checkbox"
                  checked={isFollowUp}
                  onChange={(e) => onFollowUpChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-200 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500 cursor-pointer"
                />
                <label htmlFor="followUp" className="ms-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  התייחס לשיחה הקודמת
                </label>
              </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;