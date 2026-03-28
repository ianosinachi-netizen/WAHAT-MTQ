import React, { useState, useRef, useEffect } from 'react';
import { Globe, Search, ChevronDown, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage, LANGUAGES, Language } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { 
    t, 
    currentLanguage, 
    setLanguage, 
    isLoading, 
    translationMode, 
    setTranslationMode, 
    translatePage,
    quotaExceeded
  } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredLanguages = LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        {translationMode === 'manual' && currentLanguage.code !== 'en' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={translatePage}
            disabled={isLoading || quotaExceeded}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
            {t('Translate Page')}
          </motion.button>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white shadow-sm hover:shadow-md transition-all border border-gray-100 group"
        >
          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-100 transition-colors">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Globe size={18} />}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">{t('Select Language')}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700">{currentLanguage.flag} {currentLanguage.name}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
          >
            <div className="p-4 border-b border-gray-50 bg-gray-50/30">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('Translation Mode')}</span>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setTranslationMode('auto')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      translationMode === 'auto' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t('Auto')}
                  </button>
                  <button
                    onClick={() => setTranslationMode('manual')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      translationMode === 'manual' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t('Manual')}
                  </button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder={t('Search languages...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto py-2 custom-scrollbar">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-all hover:bg-teal-50/50 ${
                      currentLanguage.code === lang.code ? 'text-teal-600 font-bold bg-teal-50/30' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{lang.name}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-mono">{lang.code}</span>
                      </div>
                    </div>
                    {currentLanguage.code === lang.code && (
                      <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-12 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                    <Globe size={24} />
                  </div>
                  <p className="text-gray-400 text-sm">{t('No languages found matching your search')}</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-50 bg-gray-50/30">
              <button
                onClick={() => {
                  setLanguage(LANGUAGES[0]); // Default to English
                  setIsOpen(false);
                }}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-teal-600 transition-colors font-bold uppercase tracking-widest"
              >
                {t('Reset to English')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
