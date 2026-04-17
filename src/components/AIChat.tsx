import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { getAIResponse, ChatMessage } from '../services/aiService';
import { useLanguage } from '../contexts/LanguageContext';

const STORAGE_KEY = 'mrs_susan_chat_history';

export default function AIChat() {
  const { t, currentLanguage, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const INITIAL_MESSAGE: ChatMessage = { 
    role: 'assistant', 
    content: t('chat.initial_message') 
  };

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        } else {
          setMessages([INITIAL_MESSAGE]);
        }
      } catch (e) {
        console.error('Failed to parse chat history', e);
        setMessages([INITIAL_MESSAGE]);
      }
    } else {
      setMessages([INITIAL_MESSAGE]);
    }
  }, []);

  // Save history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAIResponse([...messages, userMessage], currentLanguage.name);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: t('chat.error') }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm(t('chat.clear_confirm'))) {
      setMessages([INITIAL_MESSAGE]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] ${isRTL ? 'right-auto left-4 md:left-6' : ''}`}>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 md:w-16 md:h-16 bg-teal-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-teal-800 transition-all hover:scale-110 active:scale-95 group"
          >
            <MessageSquare size={24} className="group-hover:rotate-12 transition-transform md:hidden" />
            <MessageSquare size={28} className="group-hover:rotate-12 transition-transform hidden md:block" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 rounded-full border-2 border-white animate-pulse"></div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '64px' : 'min(600px, calc(100vh - 8rem))',
              width: 'min(400px, calc(100vw - 2rem))'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="bg-teal-900 p-4 flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-800 rounded-xl flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{t('chat.name')}</h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-teal-300 font-medium uppercase tracking-wider">{t('chat.status')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {!isMinimized && messages.length > 1 && (
                  <button 
                    onClick={clearHistory}
                    title={t('chat.clear_tooltip')}
                    className="p-2 hover:bg-red-800/50 rounded-lg transition-colors text-teal-300 hover:text-white"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-teal-800 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-teal-800 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          msg.role === 'user' ? 'bg-teal-100 text-teal-700 ml-2' : 'bg-white border border-gray-100 text-teal-900 mr-2 shadow-sm'
                        }`}>
                          {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-teal-900 text-white rounded-br-none' 
                            : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                        }`}>
                          <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                            <ReactMarkdown>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-end gap-2">
                        <div className="w-8 h-8 bg-white border border-gray-100 text-teal-900 rounded-lg flex items-center justify-center mr-2 shadow-sm">
                          <Bot size={16} />
                        </div>
                        <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2">
                          <Loader2 size={16} className="animate-spin text-teal-600" />
                          <span className="text-xs text-gray-400 font-medium">{t('chat.thinking')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form 
                  onSubmit={handleSend}
                  className="p-4 bg-white border-t border-gray-100 flex items-center space-x-3"
                >
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('chat.placeholder')}
                    className="flex-grow px-5 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all text-sm"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-12 h-12 bg-teal-900 text-white rounded-xl flex items-center justify-center hover:bg-teal-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-900/20"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
