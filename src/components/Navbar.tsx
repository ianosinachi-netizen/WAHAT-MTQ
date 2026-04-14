import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, Shield, ChevronDown, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Barite', path: '/barite' },
  { name: 'Chemicals', path: '/products' },
  { 
    name: 'Capabilities', 
    path: '/capabilities',
    dropdown: [
      { name: 'Services', path: '/services' },
    ]
  },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [productDropdown, setProductDropdown] = useState(false);
  const location = useLocation();
  const { profile, user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [logoUrl, setLogoUrl] = useState<string>("https://cdn-icons-png.flaticon.com/512/4341/4341139.png");

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
      if (doc.exists()) {
        const url = doc.data().logoUrl || "https://cdn-icons-png.flaticon.com/512/4341/4341139.png";
        setLogoUrl(url);
        
        // Update Favicon
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (favicon) {
          favicon.href = url;
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setProductDropdown(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src={logoUrl} 
                alt="Wahat Mtq Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className={`text-xl font-bold tracking-tight text-teal-900`}>
              {t('WAHAT MTQ')} <span className="text-teal-600">{t('Chemicals')}</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                {link.dropdown ? (
                  <div 
                    className="flex items-center space-x-1 cursor-pointer"
                    onMouseEnter={() => setProductDropdown(true)}
                    onMouseLeave={() => setProductDropdown(false)}
                  >
                    <Link
                      to={link.path}
                      className={`text-sm font-medium transition-colors hover:text-teal-600 ${
                        location.pathname === link.path ? 'text-teal-600' : 'text-gray-700'
                      }`}
                    >
                      {t(link.name)}
                    </Link>
                    <ChevronDown size={14} className="text-gray-400 group-hover:text-teal-600 transition-colors" />
                    
                    <AnimatePresence>
                      {productDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 w-56 bg-white shadow-xl rounded-2xl py-4 mt-2 border border-gray-100"
                        >
                          {link.dropdown.map((sub) => (
                            <Link
                              key={sub.name}
                              to={sub.path}
                              className="block px-6 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                            >
                              {t(sub.name)}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to={link.path}
                    className={`text-sm font-medium transition-colors hover:text-teal-600 ${
                      location.pathname === link.path ? 'text-teal-600' : 'text-gray-700'
                    }`}
                  >
                    {t(link.name)}
                  </Link>
                )}
              </div>
            ))}
            
            {profile?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1 text-sm font-bold transition-colors hover:text-teal-600 ${
                  location.pathname === '/admin' ? 'text-teal-600' : 'text-teal-700'
                }`}
              >
                <Shield size={16} />
                <span>{t('Admin')}</span>
              </Link>
            )}

            <div className="flex items-center space-x-4 ml-4">
              <Link
                to="/membership"
                className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-teal-600 ${
                  location.pathname === '/membership' ? 'text-teal-600' : 'text-gray-700'
                }`}
              >
                <User size={18} />
                <span>{user ? t('Account') : t('Login')}</span>
              </Link>
              
              <div className="border-l border-gray-200 h-8 mx-2" />
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-4">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-teal-900 focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: isRTL ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} bottom-0 w-[85%] max-w-sm bg-white z-50 lg:hidden shadow-2xl flex flex-col`}
            >
              <div className="p-6 flex justify-between items-center border-b border-gray-100">
                <Link to="/" className="flex items-center space-x-3" onClick={() => setIsOpen(false)}>
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img 
                      src={logoUrl} 
                      alt="Wahat Mtq Logo" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-lg font-bold text-teal-900">WAHAT MTQ</span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                {navLinks.map((link) => (
                  <div key={link.name} className="space-y-1">
                    {link.dropdown ? (
                      <div className="space-y-1">
                        <div className="px-4 py-3 text-xs font-bold text-teal-600 uppercase tracking-wider">
                          {t(link.name)}
                        </div>
                        {link.dropdown.map((sub) => (
                          <Link
                            key={sub.name}
                            to={sub.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all ${
                              location.pathname === sub.path ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span>{t(sub.name)}</span>
                            <ChevronRight size={16} className={`${isRTL ? 'rotate-180' : ''} opacity-40`} />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-4 py-4 rounded-xl text-lg font-bold transition-all ${
                          location.pathname === link.path ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{t(link.name)}</span>
                        <ChevronRight size={18} className={`${isRTL ? 'rotate-180' : ''} opacity-40`} />
                      </Link>
                    )}
                  </div>
                ))}
                
                <div className="pt-6 mt-6 border-t border-gray-100 space-y-2">
                  <Link
                    to="/membership"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-4 py-4 rounded-xl text-lg font-bold transition-all ${
                      location.pathname === '/membership' ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <User size={20} />
                      </div>
                      <span>{user ? t('My Account') : t('Login')}</span>
                    </div>
                    <ChevronRight size={18} className={`${isRTL ? 'rotate-180' : ''} opacity-40`} />
                  </Link>

                  {profile?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-4 py-4 rounded-xl text-lg font-bold transition-all ${
                        location.pathname === '/admin' ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                          <Shield size={20} />
                        </div>
                        <span>{t('Admin Panel')}</span>
                      </div>
                      <ChevronRight size={18} className={`${isRTL ? 'rotate-180' : ''} opacity-40`} />
                    </Link>
                  )}
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">{t('Language')}</span>
                  <LanguageSwitcher />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
