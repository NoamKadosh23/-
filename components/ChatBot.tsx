
import React, { useRef, useEffect, useState } from 'react';
import type { ChatMessage } from '../types';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import { SendIcon } from './icons/SendIcon';

interface ChatBotProps {
  messages: ChatMessage[];
  onUserResponse: (response: string) => void;
  isInputVisible?: boolean;
  onTextInputSubmit?: (text: string) => void;
  isSubmitting?: boolean;
}

const ChatBot: React.FC<ChatBotProps> = ({ 
  messages, 
  onUserResponse, 
  isInputVisible = false, 
  onTextInputSubmit, 
  isSubmitting = false 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && onTextInputSubmit && !isSubmitting) {
      onTextInputSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  const lastMessage = messages[messages.length - 1];
  const lastMessageIsBot = lastMessage?.sender === 'bot';
  const showOptions = lastMessageIsBot && lastMessage.options && lastMessage.options.length > 0;

  return (
    <div className="flex flex-col h-[28rem] bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
      <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && <div className="flex-shrink-0"><BotIcon /></div>}
            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl whitespace-pre-wrap ${
              msg.sender === 'bot' 
                ? 'bg-blue-100 dark:bg-blue-900/70 rounded-tl-none' 
                : 'bg-gray-200 dark:bg-gray-600 rounded-tr-none'
            }`}>
              {msg.text}
            </div>
             {msg.sender === 'user' && <div className="flex-shrink-0"><UserIcon /></div>}
          </div>
        ))}
        {isSubmitting && messages[messages.length - 1]?.text === 'גרזני חושב...' && (
          <div className="flex items-start gap-3">
             <div className="flex-shrink-0"><BotIcon /></div>
              <div className="max-w-xs md:max-w-md px-4 py-2 rounded-2xl bg-blue-100 dark:bg-blue-900/70 rounded-tl-none">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showOptions && !isInputVisible && (
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

      {isInputVisible && (
        <div className="flex-shrink-0 pt-4 border-t border-gray-200 dark:border-gray-600">
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="שאל את גרזני על התלוש..."
              className="flex-1 w-full px-4 py-2 text-gray-800 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
              disabled={isSubmitting}
              aria-label="הקלד את שאלתך כאן"
            />
            <button
              type="submit"
              className="p-2.5 text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={isSubmitting || !inputValue.trim()}
              aria-label="שלח שאלה"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
