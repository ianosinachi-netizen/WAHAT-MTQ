import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, Shield, ChevronDown, User, Home, Box, Droplets, Image as ImageIcon, Phone, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const navLinks = [
  { name: 'nav.home', path: '/', icon: Home },
  { name: 'nav.barite', path: '/barite', icon: Box },
  { name: 'nav.chemicals', path: '/products', icon: Droplets },
  { 
    name: 'nav.capabilities', 
    path: '/capabilities',
    icon: Layers,
    dropdown: [
      { name: 'nav.services', path: '/services' },
    ]
  },
  { name: 'nav.gallery', path: '/gallery', icon: ImageIcon },
  { name: 'nav.contact', path: '/contact', icon: Phone },
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
                alt={t('nav.company_name')} 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className={`text-xl font-bold tracking-tight text-teal-900`}>
              {t('nav.company_name')} <span className="text-teal-600">{t('nav.chemicals_llc')}</span>
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
                <span>{t('nav.admin')}</span>
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
                <span>{user ? t('nav.account') : t('nav.login')}</span>
              </Link>
              
              <div className="border-l border-gray-200 h-8 mx-2" />
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-12 h-12 flex items-center justify-center bg-teal-50 text-teal-700 rounded-2xl hover:bg-teal-100 transition-all active:scale-95 shadow-sm border border-teal-100"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
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
              className="fixed inset-0 bg-teal-900/20 backdrop-blur-md z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: isRTL ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} bottom-0 w-[90%] max-w-sm bg-white z-50 lg:hidden shadow-2xl flex flex-col rounded-l-[2.5rem] overflow-hidden`}
            >
              {/* Mobile Drawer Header */}
              <div className="p-8 flex justify-between items-center bg-gradient-to-br from-teal-50 to-white border-b border-teal-100">
                <Link to="/" className="flex items-center space-x-3" onClick={() => setIsOpen(false)}>
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center p-2 border border-teal-50">
                    <img 
                      src={logoUrl} 
                      alt={t('nav.company_name')} 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-teal-900 leading-none">{t('nav.company_name')}</span>
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.2em] mt-1">{t('nav.chemicals_llc')}</span>
                  </div>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-teal-50 text-teal-900 hover:bg-teal-50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Drawer Content */}
              <div className="flex-1 overflow-y-auto py-8 px-6 space-y-8 custom-scrollbar">
                {/* Main Navigation Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path || (link.dropdown?.some(sub => location.pathname === sub.path));
                    
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex flex-col items-start p-5 rounded-3xl transition-all duration-300 border ${
                          isActive 
                            ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-200' 
                            : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-teal-50 hover:border-teal-100'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${
                          isActive ? 'bg-white/20' : 'bg-white shadow-sm'
                        }`}>
                          <Icon size={20} className={isActive ? 'text-white' : 'text-teal-600'} />
                        </div>
                        <span className="text-sm font-bold tracking-tight">{t(link.name)}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Account & Admin Section */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">{t('nav.account_access')}</h3>
                  <div className="space-y-2">
                    <Link
                      to="/membership"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
                        location.pathname === '/membership' 
                          ? 'bg-teal-50 border-teal-200 text-teal-700' 
                          : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          location.pathname === '/membership' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <User size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{user ? t('nav.my_profile') : t('nav.sign_in')}</span>
                          <span className="text-[10px] text-gray-400">{user ? user.email : t('nav.account_access')}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className={isRTL ? 'rotate-180' : ''} />
                    </Link>

                    {profile?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
                          location.pathname === '/admin' 
                            ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-100' 
                            : 'bg-teal-50 border-teal-100 text-teal-700 hover:bg-teal-100'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            location.pathname === '/admin' ? 'bg-white/20 text-white' : 'bg-white text-teal-600 shadow-sm'
                          }`}>
                            <Shield size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{t('nav.admin_panel')}</span>
                            <span className={`text-[10px] ${location.pathname === '/admin' ? 'text-teal-100' : 'text-teal-600/60'}`}>{t('nav.system_management')}</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className={isRTL ? 'rotate-180' : ''} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="p-8 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('nav.language_settings')}</span>
                  </div>
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
