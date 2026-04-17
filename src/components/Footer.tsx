import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [logoUrl, setLogoUrl] = useState<string>("https://cdn-icons-png.flaticon.com/512/4341/4341139.png");

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
      if (doc.exists()) {
        setLogoUrl(doc.data().logoUrl || "https://cdn-icons-png.flaticon.com/512/4341/4341139.png");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src={logoUrl} 
                  alt={t('nav.company_name')} 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                {t('nav.company_name')} <span className="text-teal-500">{t('nav.chemicals_llc')}</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              {t('footer.motto')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-teal-500 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-teal-500 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-teal-500 transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="hover:text-teal-500 transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">{t('footer.quick_links')}</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">{t('nav.chemicals')}</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">{t('nav.services')}</Link></li>
              <li><Link to="/gallery" className="hover:text-white transition-colors">{t('nav.gallery')}</Link></li>
              <li><Link to="/membership" className="hover:text-white transition-colors">{t('nav.account')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">{t('footer.support')}</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/contact" className="hover:text-white transition-colors">{t('nav.contact')}</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.cookies')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.accessibility')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.sitemap')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('common.info')}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">{t('footer.contact')}</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-teal-500 mt-0.5" />
                <span>
                  {t('nav.company_name')}<br />
                  {t('contact.info.address.street')}<br />
                  {t('contact.info.address.zone')}<br />
                  {t('contact.info.address.village')}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-teal-500" />
                <span>{t('contact.info.phone')}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-teal-500" />
                <div className="flex flex-col">
                  <span>{t('contact.info.email.sales')}</span>
                  <span>{t('contact.info.email.info')}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>&copy; {currentYear} {t('nav.company_name')} {t('nav.chemicals_llc')}. {t('footer.rights')}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">{t('footer.cookies')}</a>
            <a href="#" className="hover:text-white">{t('footer.accessibility')}</a>
            <a href="#" className="hover:text-white">{t('footer.sitemap')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
