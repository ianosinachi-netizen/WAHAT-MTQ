import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translateText } from '../services/translationService';

export interface Language {
  code: string;
  name: string;
  isRTL?: boolean;
  flag?: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'sq', name: 'Albanian', flag: '🇦🇱' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  { code: 'ar', name: 'Arabic', isRTL: true, flag: '🇸🇦' },
  { code: 'hy', name: 'Armenian', flag: '🇦🇲' },
  { code: 'az', name: 'Azerbaijani', flag: '🇦🇿' },
  { code: 'eu', name: 'Basque', flag: '🇪🇸' },
  { code: 'be', name: 'Belarusian', flag: '🇧🇾' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'bs', name: 'Bosnian', flag: '🇧🇦' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'ca', name: 'Catalan', flag: '🇪🇸' },
  { code: 'ceb', name: 'Cebuano', flag: '🇵🇭' },
  { code: 'ny', name: 'Chichewa', flag: '🇲🇼' },
  { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'co', name: 'Corsican', flag: '🇫🇷' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'eo', name: 'Esperanto', flag: '🌍' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'fy', name: 'Frisian', flag: '🇳🇱' },
  { code: 'gl', name: 'Galician', flag: '🇪🇸' },
  { code: 'ka', name: 'Georgian', flag: '🇬🇪' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'ht', name: 'Haitian Creole', flag: '🇭🇹' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'haw', name: 'Hawaiian', flag: '🇺🇸' },
  { code: 'he', name: 'Hebrew', isRTL: true, flag: '🇮🇱' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'hmn', name: 'Hmong', flag: '🏳️' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'is', name: 'Icelandic', flag: '🇮🇸' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ga', name: 'Irish', flag: '🇮🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'jw', name: 'Javanese', flag: '🇮🇩' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'kk', name: 'Kazakh', flag: '🇰🇿' },
  { code: 'km', name: 'Khmer', flag: '🇰🇭' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ku', name: 'Kurdish (Kurmanji)', isRTL: true, flag: '🇹🇷' },
  { code: 'ky', name: 'Kyrgyz', flag: '🇰🇬' },
  { code: 'lo', name: 'Lao', flag: '🇱🇦' },
  { code: 'la', name: 'Latin', flag: '🇻🇦' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
  { code: 'lb', name: 'Luxembourgish', flag: '🇱🇺' },
  { code: 'mk', name: 'Macedonian', flag: '🇲🇰' },
  { code: 'mg', name: 'Malagasy', flag: '🇲🇬' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'mt', name: 'Maltese', flag: '🇲🇹' },
  { code: 'mi', name: 'Maori', flag: '🇳🇿' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'mn', name: 'Mongolian', flag: '🇲🇳' },
  { code: 'my', name: 'Myanmar (Burmese)', flag: '🇲🇲' },
  { code: 'ne', name: 'Nepali', flag: '🇳🇵' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'or', name: 'Odia (Oriya)', flag: '🇮🇳' },
  { code: 'ps', name: 'Pashto', isRTL: true, flag: '🇦🇫' },
  { code: 'fa', name: 'Persian', isRTL: true, flag: '🇮🇷' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'sm', name: 'Samoan', flag: '🇼🇸' },
  { code: 'gd', name: 'Scots Gaelic', flag: '🇬🇧' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'st', name: 'Sesotho', flag: '🇱🇸' },
  { code: 'sn', name: 'Shona', flag: '🇿🇼' },
  { code: 'sd', name: 'Sindhi', isRTL: true, flag: '🇵🇰' },
  { code: 'si', name: 'Sinhala', flag: '🇱🇰' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'so', name: 'Somali', flag: '🇸🇴' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'su', name: 'Sundanese', flag: '🇮🇩' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'tg', name: 'Tajik', flag: '🇹🇯' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'tt', name: 'Tatar', flag: '🇷🇺' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'tk', name: 'Turkmen', flag: '🇹🇲' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'ur', name: 'Urdu', isRTL: true, flag: '🇵🇰' },
  { code: 'ug', name: 'Uyghur', isRTL: true, flag: '🇨🇳' },
  { code: 'uz', name: 'Uzbek', flag: '🇺🇿' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'cy', name: 'Welsh', flag: '🇬🇧' },
  { code: 'xh', name: 'Xhosa', flag: '🇿🇦' },
  { code: 'yi', name: 'Yiddish', isRTL: true, flag: '🇮🇱' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (text: string) => string;
  translateText: (text: string) => Promise<string>;
  isRTL: boolean;
  isLoading: boolean;
  quotaExceeded: boolean;
  translationMode: 'auto' | 'manual';
  setTranslationMode: (mode: 'auto' | 'manual') => void;
  translatePage: () => void;
  clearCache: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Common static translations to reduce API load
const STATIC_TRANSLATIONS: Record<string, Record<string, string>> = {
  'ar': {
    'Home': 'الرئيسية',
    'Barite': 'باريت',
    'Chemicals': 'كيماويات',
    'Capabilities': 'القدرات',
    'Services': 'الخدمات',
    'Gallery': 'المعرض',
    'Contact': 'اتصل بنا',
    'Login': 'تسجيل الدخول',
    'Account': 'الحساب',
    'Admin': 'مسؤول',
    'Select Language': 'اختر اللغة',
    'Search languages...': 'البحث عن اللغات...',
    'Loading...': 'جاري التحميل...',
    'Submit': 'إرسال',
    'Cancel': 'إلغاء',
    'Save': 'حفظ',
    'Delete': 'حذف',
    'Edit': 'تعديل',
    'Add': 'إضافة',
    'View Details': 'عرض التفاصيل',
    'Order Now': 'اطلب الآن',
    'Learn More': 'اقرأ أكثر',
    'Read More': 'اقرأ المزيد',
    'Back': 'رجوع',
    'Next': 'التالي',
    'Previous': 'السابق',
    'All': 'الكل',
    'Search': 'بحث',
    'Filter': 'تصفية',
    'Sort': 'فرز',
    'Price': 'السعر',
    'Description': 'الوصف',
    'Category': 'الفئة',
    'Name': 'الاسم',
    'Email': 'البريد الإلكتروني',
    'Phone': 'الهاتف',
    'Message': 'الرسالة',
    'Subject': 'الموضوع',
    'Send': 'إرسال',
    'Success': 'نجاح',
    'Error': 'خطأ',
    'Warning': 'تحذير',
    'Info': 'معلومات',
    'Translation error': 'خطأ في الترجمة',
    'Translation quota exceeded. Showing original text.': 'تم تجاوز حصة الترجمة. يتم عرض النص الأصلي.',
    'Wrong password': 'كلمة مرور خاطئة',
    'User not found. Please sign up first.': 'المستخدم غير موجود. يرجى التسجيل أولاً.',
    'Invalid credentials. Please check your email and password or sign up.': 'بيانات الاعتماد غير صالحة. يرجى التحقق من بريدك الإلكتروني وكلمة المرور أو التسجيل.',
  },
  'fr': {
    'Home': 'Accueil',
    'Barite': 'Barytine',
    'Chemicals': 'Produits Chimiques',
    'Capabilities': 'Capacités',
    'Services': 'Services',
    'Gallery': 'Galerie',
    'Contact': 'Contact',
    'Login': 'Connexion',
    'Account': 'Compte',
    'Admin': 'Admin',
    'Select Language': 'Choisir la langue',
    'Search languages...': 'Rechercher des langues...',
    'Loading...': 'Chargement...',
    'Submit': 'Soumettre',
    'Cancel': 'Annuler',
    'Save': 'Enregistrer',
    'Delete': 'Supprimer',
    'Edit': 'Modifier',
    'Add': 'Ajouter',
    'View Details': 'Voir les détails',
    'Order Now': 'Commander maintenant',
    'Learn More': 'En savoir plus',
    'Read More': 'Lire la suite',
    'Back': 'Retour',
    'Next': 'Suivant',
    'Previous': 'Précédent',
    'All': 'Tout',
    'Search': 'Rechercher',
    'Filter': 'Filtrer',
    'Sort': 'Trier',
    'Price': 'Prix',
    'Description': 'Description',
    'Category': 'Catégorie',
    'Name': 'Nom',
    'Email': 'E-mail',
    'Phone': 'Téléphone',
    'Message': 'Message',
    'Subject': 'Sujet',
    'Send': 'Envoyer',
    'Success': 'Succès',
    'Error': 'Erreur',
    'Warning': 'Avertissement',
    'Info': 'Info',
    'Translation error': 'Erreur de traduction',
    'Translation quota exceeded. Showing original text.': 'Quota de traduction dépassé. Affichage du texte original.',
    'Wrong password': 'Mot de passe incorrect',
    'User not found. Please sign up first.': 'Utilisateur non trouvé. Veuillez vous inscrire d\'abord.',
    'Invalid credentials. Please check your email and password or sign up.': 'Identifiants invalides. Veuillez vérifier votre e-mail et votre mot de passe ou vous inscrire.',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return LANGUAGES[0];
      }
    }
    return LANGUAGES[0];
  });

  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>(() => {
    const saved = localStorage.getItem('app_translations');
    return saved ? JSON.parse(saved) : {};
  });

  const [isLoading, setIsLoading] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [translationMode, setTranslationMode] = useState<'auto' | 'manual'>(() => {
    const saved = localStorage.getItem('app_translation_mode');
    return (saved as 'auto' | 'manual') || 'auto';
  });
  
  const translationQueue = React.useRef<Set<string>>(new Set());
  const pendingRequests = React.useRef<Set<string>>(new Set());
  const batchTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const lastRequestTime = React.useRef<number>(0);
  const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between batches (increased)

  useEffect(() => {
    localStorage.setItem('app_translation_mode', translationMode);
  }, [translationMode]);

  useEffect(() => {
    localStorage.setItem('app_language', JSON.stringify(currentLanguage));
    document.documentElement.dir = currentLanguage.isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage.code;
    
    // Reset quota error on language change
    setQuotaExceeded(false);
  }, [currentLanguage]);

  useEffect(() => {
    localStorage.setItem('app_translations', JSON.stringify(translations));
  }, [translations]);

  const processQueue = useCallback(async () => {
    if (translationQueue.current.size === 0 || quotaExceeded) return;

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      if (batchTimeout.current) clearTimeout(batchTimeout.current);
      batchTimeout.current = setTimeout(processQueue, MIN_REQUEST_INTERVAL - timeSinceLastRequest + 100);
      return;
    }

    const textsToTranslate = Array.from(translationQueue.current).filter(t => !pendingRequests.current.has(t));
    if (textsToTranslate.length === 0) {
      translationQueue.current.clear();
      return;
    }

    textsToTranslate.forEach(t => pendingRequests.current.add(t));
    translationQueue.current.clear();

    const targetLang = currentLanguage.name;
    const langCode = currentLanguage.code;

    setIsLoading(true);
    lastRequestTime.current = Date.now();
    
    try {
      const { translateBatch } = await import('../services/translationService');
      const translatedTexts = await translateBatch(textsToTranslate, targetLang);
      
      setTranslations(prev => {
        const newCache = { ...(prev[langCode] || {}) };
        textsToTranslate.forEach((text, index) => {
          newCache[text] = translatedTexts[index] || text;
        });
        return {
          ...prev,
          [langCode]: newCache
        };
      });
      setQuotaExceeded(false);
    } catch (error: any) {
      console.error("Batch translation failed", error);
      if (error.message?.includes('quota') || error.status === 429) {
        setQuotaExceeded(true);
      }
    } finally {
      textsToTranslate.forEach(t => pendingRequests.current.delete(t));
      setIsLoading(false);
    }
  }, [currentLanguage.code, currentLanguage.name, quotaExceeded]);

  const setLanguage = useCallback((lang: Language) => {
    setCurrentLanguageState(lang);
  }, []);

  const t = useCallback((text: string): string => {
    if (!text || currentLanguage.code === 'en') return text;

    // Check static translations first
    if (STATIC_TRANSLATIONS[currentLanguage.code]?.[text]) {
      return STATIC_TRANSLATIONS[currentLanguage.code][text];
    }

    const langCache = translations[currentLanguage.code] || {};
    if (langCache[text]) return langCache[text];

    // If already pending, just return original for now
    if (pendingRequests.current.has(text)) return text;

    // If in manual mode, don't queue automatically
    if (translationMode === 'manual') return text;

    // Add to queue
    translationQueue.current.add(text);
    
    // Debounce processing
    if (batchTimeout.current) clearTimeout(batchTimeout.current);
    batchTimeout.current = setTimeout(processQueue, 2000); // 2 second debounce (increased)

    return text;
  }, [currentLanguage, translations, processQueue, translationMode]);

  const translatePage = useCallback(() => {
    // This will trigger processQueue for anything currently in the queue
    // In manual mode, we might need a way to populate the queue
    // For now, we'll just reset quota and try processing
    setQuotaExceeded(false);
    processQueue();
  }, [processQueue]);

  const translateTextWrapper = useCallback(async (text: string): Promise<string> => {
    if (!text || currentLanguage.code === 'en') return text;
    
    const langCache = translations[currentLanguage.code] || {};
    if (langCache[text]) return langCache[text];

    if (quotaExceeded) return text;

    try {
      const { translateText } = await import('../services/translationService');
      const translated = await translateText(text, currentLanguage.name);
      
      setTranslations(prev => ({
        ...prev,
        [currentLanguage.code]: {
          ...(prev[currentLanguage.code] || {}),
          [text]: translated
        }
      }));
      
      return translated;
    } catch (error: any) {
      if (error.message?.includes('quota') || error.status === 429) {
        setQuotaExceeded(true);
      }
      return text;
    }
  }, [currentLanguage, translations, quotaExceeded]);

  const clearCache = useCallback(() => {
    setTranslations({});
    localStorage.removeItem('app_translations');
  }, []);

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      setLanguage, 
      t, 
      translateText: translateTextWrapper,
      isRTL: !!currentLanguage.isRTL,
      isLoading,
      quotaExceeded,
      translationMode,
      setTranslationMode,
      translatePage,
      clearCache
    }}>
      {children}
      {quotaExceeded && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-red-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl z-[9999] border border-red-500/50 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm">{t('Translation error')}</p>
              <p className="text-xs text-red-100 opacity-80">{t('Translation quota exceeded. Showing original text.')}</p>
            </div>
            <button 
              onClick={() => setQuotaExceeded(false)}
              className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={translatePage}
              className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all"
            >
              {t('Retry Translation')}
            </button>
            <button
              onClick={clearCache}
              className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-xs font-bold transition-all"
            >
              {t('Clear Cache')}
            </button>
          </div>
        </div>
      )}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
