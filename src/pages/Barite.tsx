import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { sendEmail } from '../lib/email';
import { ShoppingCart, Package, Info, CheckCircle, ArrowRight, Beaker, ShieldCheck, Globe, Zap, Activity, Microscope, ChevronLeft, ChevronRight, Mail, Loader2, Database } from 'lucide-react';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useForm, ValidationError } from '@formspree/react';

export default function Barite() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [state, handleSubmit] = useForm('mlgadnva');
  const [email, setEmail] = useState(user?.email || '');
  const [heroContent, setHeroContent] = useState<{ imageUrl: string; imageUrls?: string[]; title?: string; description?: string } | null>(null);
  const [dynamicProperties, setDynamicProperties] = useState<any[]>([]);
  const [dynamicApplications, setDynamicApplications] = useState<any[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    const unsubscribeHero = onSnapshot(doc(db, 'page_content', 'barite-hero'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setHeroContent(data);
        setCurrentHeroIndex(0);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'page_content/barite-hero');
    });

    const qProps = query(collection(db, 'barite_properties'), orderBy('createdAt', 'asc'));
    const unsubscribeProps = onSnapshot(qProps, (snapshot) => {
      const propsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (propsData.length > 0) setDynamicProperties(propsData);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'barite_properties');
    });

    const qApps = query(collection(db, 'barite_applications'), orderBy('createdAt', 'asc'));
    const unsubscribeApps = onSnapshot(qApps, (snapshot) => {
      const appsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (appsData.length > 0) setDynamicApplications(appsData);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'barite_applications');
    });

    return () => {
      unsubscribeHero();
      unsubscribeProps();
      unsubscribeApps();
    };
  }, []);

  // Timer for rotating dynamic hero images
  useEffect(() => {
    if (heroContent?.imageUrls && heroContent.imageUrls.length > 1) {
      const timer = setInterval(() => {
        setCurrentHeroIndex((prev) => {
          const next = prev + 1;
          return next >= heroContent.imageUrls!.length ? 0 : next;
        });
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [heroContent?.imageUrls]);

  // Reset index if it goes out of bounds (e.g. after deletion)
  useEffect(() => {
    if (heroContent?.imageUrls && currentHeroIndex >= heroContent.imageUrls.length) {
      setCurrentHeroIndex(0);
    }
  }, [heroContent?.imageUrls, currentHeroIndex]);

  const baritePrices = [
    { label: 'barite.properties.high_purity', price: '$498 – $1,000+' },
    { label: 'barite.properties.drilling_grade', price: '$147 – $760' },
    { label: 'barite.properties.commercial_grade', price: '$100 – $300' },
    { label: 'barite.properties.low_grade', price: '$90 – $110' },
  ];

  const properties = [
    { label: 'barite.properties.chemical_formula', value: 'BaSO₄ (barium sulfate)' },
    { label: 'barite.properties.color_label', value: 'barite.properties.color_value' },
    { label: 'barite.properties.gravity', value: '4.2 – 4.5' },
    { label: 'barite.properties.hardness', value: '3 – 3.5' },
    { label: 'barite.properties.luster_label', value: 'barite.properties.luster_value' },
    { label: 'barite.properties.streak_label', value: 'barite.properties.streak_value' },
    { label: 'barite.properties.solubility_label', value: 'barite.properties.solubility_value' },
  ];

  const applications = [
    { title: t('barite.applications.oil_gas.title'), desc: t('barite.applications.oil_gas.desc') },
    { title: t('barite.applications.paints.title'), desc: t('barite.applications.paints.desc') },
    { title: t('barite.applications.chemical.title'), desc: t('barite.applications.chemical.desc') },
    { title: t('barite.applications.construction.title'), desc: t('barite.applications.construction.desc') },
    { title: t('barite.applications.medical.title'), desc: t('barite.applications.medical.desc') },
    { title: t('barite.applications.plastics.title'), desc: t('barite.applications.plastics.desc') },
    { title: t('barite.applications.automotive.title'), desc: t('barite.applications.automotive.desc') },
  ];

  const treatmentSteps = [
    t('barite.treatment.steps.mining'), 
    t('barite.treatment.steps.crushing'), 
    t('barite.treatment.steps.grinding'), 
    t('barite.treatment.steps.washing'), 
    t('barite.treatment.steps.gravity'), 
    t('barite.treatment.steps.drying'), 
    t('barite.treatment.steps.pulverizing'), 
    t('barite.treatment.steps.final')
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative bg-teal-900 text-white py-32 lg:py-48 overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0">
          {heroContent?.imageUrls && heroContent.imageUrls.length > 0 ? (
            <div className="relative w-full h-full">
              <AnimatePresence mode="wait">
                <motion.img
                  key={heroContent.imageUrls[currentHeroIndex]}
                  src={heroContent.imageUrls[currentHeroIndex]}
                  alt={t('barite.hero.title')}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://picsum.photos/seed/chemical/1920/1080";
                    target.onerror = null;
                  }}
                />
              </AnimatePresence>
            </div>
          ) : heroContent?.imageUrl ? (
            <img
              src={heroContent.imageUrl}
              alt={t('barite.hero.title')}
              className="w-full h-full object-cover opacity-100"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://picsum.photos/seed/chemical/1920/1080";
                target.onerror = null;
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-teal-900"></div>
          )}
          {/* Lighter overlay to ensure image clarity while maintaining text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 via-teal-900/20 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] sm:leading-tight">
                {heroContent?.title ? t(heroContent.title) : t('barite.hero.title')}
              </h1>
              <p className="text-lg sm:text-xl text-teal-100 leading-relaxed mb-8">
                {heroContent?.description ? t(heroContent.description) : t('barite.hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#order"
                  className="bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t('common.order_now')}
                </a>
                <a
                  href="#properties"
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all backdrop-blur-sm border border-white/20 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Info className="w-5 h-5" />
                  {t('common.technical_specs')}
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full hidden lg:block"
            >
              <div className="relative aspect-[4/3] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border-4 sm:border-8 border-white/10 backdrop-blur-sm bg-teal-800/50 flex items-center justify-center group">
                <AnimatePresence mode="wait">
                  {heroContent?.imageUrls && heroContent.imageUrls.length > 0 ? (
                    <motion.img
                      key={heroContent.imageUrls[currentHeroIndex]}
                      src={heroContent.imageUrls[currentHeroIndex]}
                      alt="Barite Showcase"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : heroContent?.imageUrl ? (
                    <motion.img
                      key="primary-image"
                      src={heroContent.imageUrl}
                      alt="Barite Showcase"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Database size={120} className="text-teal-400/30" />
                  )}
                </AnimatePresence>
                
                {/* Decorative Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-teal-950/40 to-transparent pointer-events-none" />
                
                {/* Image Indicators */}
                {heroContent?.imageUrls && heroContent.imageUrls.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {heroContent.imageUrls.map((_, idx) => (
                      <div 
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentHeroIndex ? 'w-8 bg-teal-400' : 'w-2 bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section id="properties" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('barite.properties.title')}</h2>
            <div className="w-20 h-1 bg-teal-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-teal-700">
                <Beaker className="w-6 h-6" />
                {t('barite.properties.chemical')}
              </h3>
              <div className="space-y-4">
                {(dynamicProperties.length > 0 ? dynamicProperties : properties).map((prop, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-50 last:border-0 gap-1 sm:gap-4">
                    <span className="text-gray-600 font-medium text-sm sm:text-base">{t(prop.label)}</span>
                    <span className="text-gray-900 font-bold text-sm sm:text-base">{t(prop.value)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-teal-700">
                <Activity className="w-6 h-6" />
                {t('barite.properties.price')}
              </h3>
              <div className="space-y-4">
                {baritePrices.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-50 last:border-0 gap-1 sm:gap-4">
                    <span className="text-gray-600 font-medium text-sm sm:text-base">{t(item.label)}</span>
                    <span className="text-teal-600 font-bold text-sm sm:text-base">{t(item.price)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-gray-500 italic">
                * {t('barite.properties.price_note')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('barite.applications.title')}</h2>
            <div className="w-20 h-1 bg-teal-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(dynamicApplications.length > 0 ? dynamicApplications : applications).map((app, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-teal-200 transition-colors"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t(app.title)}</h3>
                <p className="text-gray-600 leading-relaxed">{t(app.desc)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Treatment Process */}
      <section className="py-20 bg-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('barite.treatment.title')}</h2>
            <div className="w-20 h-1 bg-teal-400 mx-auto"></div>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-teal-800 -translate-y-1/2"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
              {treatmentSteps.map((step, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center font-bold text-lg mb-4 relative z-10 shadow-lg shadow-teal-500/20">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-medium text-teal-100">{t(step)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Order Section */}
      <section id="order" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-teal-50 rounded-3xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 lg:p-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('barite.quote.title')}</h2>
                <p className="text-gray-600 mb-8">
                  {t('barite.quote.desc')}
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-teal-600" />
                    </div>
                    <span className="text-gray-700">{t('barite.quote.meshes')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-teal-600" />
                    </div>
                    <span className="text-gray-700">{t('barite.quote.shipping')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-teal-600" />
                    </div>
                    <span className="text-gray-700">{t('barite.quote.support')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-12 lg:p-16 border-l border-teal-100">
                {state.succeeded ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('common.success')}</h3>
                    <p className="text-gray-600 mb-8">{t('contact.form.success_desc')}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.email')}</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        placeholder="your@email.com"
                      />
                      <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-500 text-xs mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('products.order.quantity_label')}</label>
                        <input
                          type="number"
                          name="quantity"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          placeholder="500"
                        />
                        <ValidationError prefix="Quantity" field="quantity" errors={state.errors} className="text-red-500 text-xs mt-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('products.order.type_label')}</label>
                        <select
                          name="grade"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        >
                      <option>{t('barite.order.grades.drilling')}</option>
                      <option>{t('barite.order.grades.chemical')}</option>
                      <option>{t('barite.order.grades.paint')}</option>
                      <option>{t('barite.order.grades.micronized')}</option>
                        </select>
                        <ValidationError prefix="Grade" field="grade" errors={state.errors} className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('products.order.requirements_label')}</label>
                      <textarea
                        name="requirements"
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        placeholder={t('contact.form.placeholder.message')}
                      ></textarea>
                      <ValidationError prefix="Requirements" field="requirements" errors={state.errors} className="text-red-500 text-xs mt-1" />
                    </div>
                    <button
                      type="submit"
                      disabled={state.submitting}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {state.submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          {t('common.get_quote')}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
