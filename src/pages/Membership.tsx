import React, { useState } from 'react';
import { LogIn, UserPlus, LogOut, FileText, MapPin, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Membership() {
  const { t } = useLanguage();
  const { user, profile, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (err: any) {
      // Don't log the full error to console to avoid confusing the user
      if (err.code === 'auth/network-request-failed') {
        setError('auth.errors.network');
      } else if (err.code === 'auth/wrong-password') {
        setError('auth.errors.wrong_password');
      } else if (err.code === 'auth/user-not-found') {
        setError('auth.errors.user_not_found');
      } else if (err.code === 'auth/invalid-credential') {
        // This is the new Firebase error code for both wrong password and user not found
        setError('auth.errors.invalid_credentials');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('auth.errors.email_in_use');
      } else if (err.code === 'auth/weak-password') {
        setError('auth.errors.weak_password');
      } else {
        setError('auth.errors.default');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (user && profile) {
    return (
      <div className="py-20 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('auth.account.welcome')}, {profile.displayName || user.email}</h1>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-700">
                  {t('auth.account.status')}
                </span>
                {profile.role === 'admin' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                    {t('nav.admin')}
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors font-semibold"
            >
              <LogOut size={20} />
              <span>{t('auth.account.signout')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Dashboard Stats */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-6">
                    <FileText size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{t('auth.account.orders')}</h3>
                  <p className="text-3xl font-bold text-teal-900">0</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-6">
                    <MapPin size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{t('auth.account.locations')}</h3>
                  <p className="text-3xl font-bold text-teal-900">0</p>
                </div>
              </div>

               {/* Account Info */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{t('auth.account.details')}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray-50">
                    <span className="text-gray-500">{t('common.email')}</span>
                    <span className="font-medium text-gray-900">{user.email}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-50">
                    <span className="text-gray-500">{t('common.category')}</span>
                    <span className="font-medium text-gray-900 uppercase">{t(`auth.roles.${profile.role}`)}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-gray-500">{t('auth.account.member_since')}</span>
                    <span className="font-medium text-gray-900">{t('month.march')} 2026</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-8">
              <div className="bg-teal-900 rounded-3xl p-8 text-white">
                <h3 className="text-xl font-bold mb-6">{t('auth.account.quick_actions')}</h3>
                <div className="space-y-4">
                  <Link to="/products" className="block w-full bg-white text-teal-900 py-3 rounded-xl font-bold text-center hover:bg-teal-50 transition-all">
                    {t('auth.account.browse')}
                  </Link>
                  <button className="w-full bg-teal-700 text-white py-3 rounded-xl font-bold hover:bg-teal-600 transition-all">
                    {t('auth.account.profile')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-xl border border-gray-100"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-teal-600">
              {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
            </div>
             <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? t('auth.signin.title') : t('auth.signup.title')}
            </h1>
            <p className="text-gray-500 font-medium">
              {t('auth.signup.subtitle')}
            </p>
          </div>

          <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                isLogin ? 'bg-white text-teal-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('nav.sign_in')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                !isLogin ? 'bg-white text-teal-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('auth.form.signup')}
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="signup-name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-bold text-gray-700">{t('common.name')}</label>
                  <input 
                    type="text" 
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all" 
                    placeholder={t('contact.form.placeholder.name')} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t('auth.form.email')}</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all" 
                placeholder={t('contact.form.placeholder.email')} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t('auth.form.password')}</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all" 
                placeholder="••••••••" 
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-xl text-sm"
              >
                <AlertCircle size={18} />
                <span>{t(error)}</span>
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={authLoading}
              className="w-full bg-teal-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-800 transition-all shadow-lg shadow-teal-900/20 flex items-center justify-center"
            >
              {authLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>{isLogin ? t('nav.sign_in') : t('auth.form.signup')}</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <Link to="/products" className="text-gray-500 font-bold hover:text-teal-600 transition-colors flex items-center justify-center space-x-2">
              <span>{t('auth.form.guest')}</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
