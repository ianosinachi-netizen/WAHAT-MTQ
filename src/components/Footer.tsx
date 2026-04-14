import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                {t('WAHAT MTQ')} <span className="text-teal-500">{t('Chemicals')}</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              {t('Leading the way in chemical innovation and industrial excellence. WAHAT MTQ Chemicals LLC provides high-quality solutions for global industrial needs.')}
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
            <h3 className="text-white font-semibold text-lg mb-6">{t('Quick Links')}</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">{t('About Us')}</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">{t('Our Products')}</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">{t('Services')}</Link></li>
              <li><Link to="/gallery" className="hover:text-white transition-colors">{t('Gallery')}</Link></li>
              <li><Link to="/membership" className="hover:text-white transition-colors">{t('Membership')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">{t('Support')}</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/contact" className="hover:text-white transition-colors">{t('Contact Us')}</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('Privacy Policy')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('Terms of Service')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('FAQs')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('Help Center')}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">{t('Contact Us')}</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-teal-500 mt-0.5" />
                <span>
                  {t('WAHAT MTQ CHEMICALS Building')}<br />
                  {t('Al Quds Street')}<br />
                  {t('Dubai Airport Free Zone')}<br />
                  {t('Dubai Cargo Village')}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-teal-500" />
                <span>+1 (503) 832 0116</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-teal-500" />
                <div className="flex flex-col">
                  <span>Sales@wahatmtq.com</span>
                  <span>Info@wahatmtq.com</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>&copy; {currentYear} {t('WAHAT MTQ Chemicals LLC. All rights reserved.')}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">{t('Cookie Settings')}</a>
            <a href="#" className="hover:text-white">{t('Accessibility')}</a>
            <a href="#" className="hover:text-white">{t('Sitemap')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
