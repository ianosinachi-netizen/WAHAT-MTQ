import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle2, AlertCircle, Globe } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { sendEmail } from '../lib/email';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Product Quote',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Save to Firestore
      await addDoc(collection(db, 'contact_messages'), {
        ...formData,
        createdAt: serverTimestamp()
      });

      // 2. Send Email Notification
      await sendEmail({
        userEmail: formData.email,
        type: 'contact_message',
        details: `Name: ${formData.name}\nSubject: ${formData.subject}\nMessage: ${formData.message}`
      });

      setSuccess(true);
      setFormData({ name: '', email: '', subject: 'Product Quote', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'contact_messages');
      setError(t('Failed to send message. Please try again later.'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{t('Contact Us')}</h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">{t("Have a question or ready to start your project? We'd love to hear from you. Our team is here to help.")}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-teal-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-white shadow-xl shadow-teal-900/20"
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-8 sm:mb-10">{t('Get in Touch')}</h2>
              <div className="space-y-8 sm:space-y-10">
                <div className="flex items-start space-x-4 sm:space-x-5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-800 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-teal-300 text-xs font-medium mb-1 uppercase tracking-wider">{t('Call Us')}</p>
                    <p className="text-base sm:text-lg font-bold">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 sm:space-x-5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-800 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-teal-300 text-xs font-medium mb-1 uppercase tracking-wider">{t('Email Us')}</p>
                    <p className="text-base sm:text-lg font-bold break-all">sales@wahatmtqcl.com</p>
                    <p className="text-base sm:text-lg font-bold break-all">customercare@wahatmtqcl.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 sm:space-x-5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-800 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-teal-300 text-xs font-medium mb-1 uppercase tracking-wider">{t('Visit Us')}</p>
                    <p className="text-base sm:text-lg font-bold">
                      {t('WAHAT MTQ CHEMICALS Building')}<br />
                      {t('Al Quds Street')}<br />
                      {t('Dubai Airport Free Zone')}<br />
                      {t('Dubai Cargo Village')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 sm:space-x-5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-800 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Globe size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-teal-300 text-xs font-medium mb-1 uppercase tracking-wider">{t('Sub-Offices')}</p>
                    <p className="text-base sm:text-lg font-bold">{t('Asia • Africa • Europe')}</p>
                    <p className="text-xs text-teal-200 mt-1 italic">{t('More Offices to be established')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Clock className="mr-3 text-teal-600" size={24} />
                {t('Business Hours')}
              </h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center pb-4 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">{t('Monday - Friday')}</span>
                  <span className="font-bold text-gray-900">{t('8:00 AM - 5:00 PM')}</span>
                </li>
                <li className="flex justify-between items-center pb-4 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">{t('Saturday')}</span>
                  <span className="font-bold text-gray-900">{t('9:00 AM - 1:00 PM')}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">{t('Sunday')}</span>
                  <span className="font-bold text-gray-400">{t('Closed')}</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 shadow-sm relative overflow-hidden"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('Send us a Message')}</h2>
              
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-green-50 border border-green-100 rounded-3xl p-10 text-center"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-green-900 mb-2">{t('Message Sent!')}</h3>
                    <p className="text-green-700">{t('Thank you for reaching out. Our team will get back to you shortly.')}</p>
                    <button 
                      onClick={() => setSuccess(false)}
                      className="mt-8 text-green-800 font-bold hover:underline"
                    >
                      {t('Send another message')}
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    onSubmit={handleSubmit} 
                    className="space-y-6"
                  >
                    {error && (
                      <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-center space-x-3">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">{error}</span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">{t('Full Name')}</label>
                        <input 
                          required
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all bg-gray-50/50" 
                          placeholder={t('John Doe')} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">{t('Email Address')}</label>
                        <input 
                          required
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all bg-gray-50/50" 
                          placeholder={t('john@example.com')} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">{t('Subject')}</label>
                      <select 
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all appearance-none bg-gray-50/50"
                      >
                        <option value="Product Quote">{t('Product Quote')}</option>
                        <option value="Technical Support">{t('Technical Support')}</option>
                        <option value="Custom Blending">{t('Custom Blending')}</option>
                        <option value="Partnership">{t('Partnership')}</option>
                        <option value="Other Inquiry">{t('Other Inquiry')}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">{t('Message')}</label>
                      <textarea 
                        required
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5} 
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all resize-none bg-gray-50/50" 
                        placeholder={t('Describe your chemical requirements...')}
                      ></textarea>
                    </div>

                    <button 
                      disabled={loading}
                      type="submit"
                      className="w-full bg-teal-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-teal-800 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-teal-900/20 disabled:opacity-70"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>{t('Submit Request')}</span>
                          <Send size={20} />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Map Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-4 border border-gray-100 shadow-sm overflow-hidden h-[400px] relative group"
        >
          <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <MapPin size={40} className="text-teal-600" />
            </div>
            <p className="font-bold text-gray-900 text-xl mb-2">{t('Dubai Airport Free Zone')}</p>
            <p className="text-gray-500">{t('Dubai Cargo Village')}</p>
          </div>
          {/* Overlay for aesthetic */}
          <div className="absolute inset-0 bg-teal-900/5 pointer-events-none"></div>
        </motion.div>
      </div>
    </div>
  );
}
