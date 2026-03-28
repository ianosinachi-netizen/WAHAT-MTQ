import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AIChat from '../components/AIChat';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export default function MainLayout() {
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="flex-grow pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      <AIChat />
    </div>
  );
}
