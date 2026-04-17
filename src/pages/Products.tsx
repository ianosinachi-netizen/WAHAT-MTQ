import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingCart, 
  Package, 
  Info, 
  CheckCircle, 
  ArrowRight, 
  Beaker, 
  ShieldCheck, 
  Globe, 
  Zap, 
  Activity, 
  Microscope, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Loader2,
  Droplets,
  FlaskConical,
  Truck,
  Layers,
  Database,
  Star,
  Tag
} from 'lucide-react';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useForm, ValidationError } from '@formspree/react';

export default function Products() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [state, handleSubmit] = useForm('mlgadnva');
  const [email, setEmail] = useState(profile?.email || '');
  const [heroContent, setHeroContent] = useState<{ imageUrl: string; imageUrls?: string[]; title?: string; description?: string } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (heroContent?.imageUrls) {
      if (currentImageIndex >= heroContent.imageUrls.length) {
        setCurrentImageIndex(0);
      }
    }
  }, [heroContent?.imageUrls]);

  useEffect(() => {
    if (heroContent?.imageUrls && heroContent.imageUrls.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroContent.imageUrls!.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroContent?.imageUrls]);
  const [dynamicProducts, setDynamicProducts] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.email) setEmail(profile.email);
  }, [profile]);

  useEffect(() => {
    const unsubscribeHero = onSnapshot(doc(db, 'page_content', 'chemicals-hero'), (docSnap) => {
      if (docSnap.exists()) {
        setHeroContent(docSnap.data() as any);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'page_content/chemicals-hero');
    });

    const qProducts = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDynamicProducts(productsData);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'products');
    });

    return () => {
      unsubscribeHero();
      unsubscribeProducts();
    };
  }, []);

  const dosageRanges = [
    { fluid: 'products.dosages.water_based.fluid', type: 'products.dosages.water_based.type', dosage: '1–5% ' + t('products.dosages.by_volume_mud') },
    { fluid: 'products.dosages.oil_based.fluid', type: 'products.dosages.oil_based.type', dosage: '0.5–2% ' + t('products.dosages.by_volume') },
    { fluid: 'products.dosages.completion.fluid', type: 'products.dosages.completion.type', dosage: '0.2–1% ' + t('products.dosages.by_volume') },
    { fluid: 'products.dosages.acidizing.fluid', type: 'products.dosages.acidizing.type', dosage: '0.5–3% ' + t('products.dosages.of_acid') },
    { fluid: 'products.dosages.pipelines.fluid', type: 'products.dosages.pipelines.type', dosage: '1–5 ppm ' + t('products.dosages.in_water') },
  ];

  const packagingFormats = [
    { type: 'products.packaging.jerrycans.type', volume: '5–25 ' + t('products.packaging.liters'), use: 'products.packaging.jerrycans.use' },
    { type: 'products.packaging.drums.type', volume: '200–220 ' + t('products.packaging.liters_gallons'), use: 'products.packaging.drums.use' },
    { type: 'products.packaging.ibc.type', volume: '1000 ' + t('products.packaging.liters_gallons_ibc'), use: 'products.packaging.ibc.use' },
    { type: 'products.packaging.tankers.type', volume: '5000–25,000 ' + t('products.packaging.liters'), use: 'products.packaging.tankers.use' },
  ];

  const surfactantUses = [
    'products.surfactants.uses.drilling_mud',
    'products.surfactants.uses.friction_reduction',
    'products.surfactants.uses.emulsifying',
    'products.surfactants.uses.separation_prevention',
    'products.surfactants.uses.cuttings_transport',
    'products.surfactants.uses.eor',
    'products.surfactants.uses.surface_tension',
    'products.surfactants.uses.mobilize_oil',
    'products.surfactants.uses.corrosion_control',
    'products.surfactants.uses.foaming',
  ];

  const surfactantPrices = [
    { label: 'products.surfactants.prices.bio', price: '$18–$20 ' + t('products.surfactants.prices.per_kg') },
    { label: 'products.surfactants.prices.anionic', price: '$1–$12 ' + t('products.surfactants.prices.per_kg') },
    { label: 'products.surfactants.prices.commodity', price: '$1–$3 ' + t('products.surfactants.prices.per_kg') },
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative bg-teal-900 text-white py-24 overflow-hidden min-h-[500px] flex items-center">
        <div className="absolute inset-0">
          {heroContent?.imageUrl ? (
            <img
              src={heroContent.imageUrl}
              alt={heroContent.title ? t(heroContent.title) : t('products.hero.title')}
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
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900 via-teal-900/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] sm:leading-tight">
                {heroContent?.title ? t(heroContent.title) : (
                  <>
                    {t('products.hero.title')}
                  </>
                )}
              </h1>
              <p className="text-lg sm:text-xl text-teal-100 leading-relaxed mb-8">
                {heroContent?.description ? t(heroContent.description) : t('products.hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#order-form" className="bg-teal-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20 text-center active:scale-95">
                  {t('products.hero.cta.order')}
                </a>
                <a href="#corrosion-inhibitors" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all text-center active:scale-95">
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
                      key={heroContent.imageUrls[currentImageIndex]}
                      src={heroContent.imageUrls[currentImageIndex]}
                      alt="Chemicals Showcase"
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
                      alt="Chemicals Showcase"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <FlaskConical size={120} className="text-teal-400/30" />
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
                          idx === currentImageIndex ? 'w-8 bg-teal-400' : 'w-2 bg-white/30'
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

      {/* Corrosion Inhibitors Section */}
      <section className="py-24 bg-white" id="corrosion-inhibitors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-3">{t('products.additives.subtitle')}</h2>
            <h3 className="text-4xl font-bold text-gray-900">{t('products.additives.title')}</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <h4 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Activity className="mr-3 text-teal-600" size={28} />
                {t('products.dosages.title')}
              </h4>
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-0">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-sm font-bold text-gray-700">{t('products.dosages.fluid_header')}</th>
                      <th className="px-4 py-3 text-sm font-bold text-gray-700">{t('products.dosages.inhibitor_header')}</th>
                      <th className="px-4 py-3 text-sm font-bold text-gray-700">{t('products.dosages.dosage_header')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dosageRanges.map((item, i) => (
                      <tr key={i} className="hover:bg-teal-50/30 transition-colors">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{t(item.fluid)}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{t(item.type)}</td>
                        <td className="px-4 py-4 text-sm font-bold text-teal-700">{t(item.dosage)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Package className="mr-3 text-teal-600" size={28} />
                {t('products.packaging.title')}
              </h4>
              <div className="space-y-4">
                {packagingFormats.map((item, i) => (
                  <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-teal-200 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900">{t(item.type)}</span>
                      <span className="text-teal-600 font-bold text-sm">{t(item.volume)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{t(item.use)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Surfactants Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-3">{t('products.surfactants.subtitle')}</h2>
              <h3 className="text-4xl font-bold text-gray-900 mb-8">{t('products.surfactants.title')}</h3>
              <p className="text-xl text-gray-700 leading-relaxed mb-8 italic border-l-4 border-teal-500 pl-6">
                {t('products.surfactants.description')}
              </p>
              
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                <h4 className="text-xl font-bold text-teal-900 mb-6 flex items-center">
                  <Info className="mr-2 text-teal-600" size={24} />
                  {t('products.surfactants.prices.title')}
                </h4>
                <div className="space-y-4">
                  <p className="text-teal-800 font-medium mb-4">{t('products.surfactants.prices.note')}</p>
                  {surfactantPrices.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                      <span className="text-gray-700 font-medium">{t(item.label)}</span>
                      <span className="text-teal-700 font-bold">{t(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="space-y-6">
              <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Droplets className="mr-3 text-teal-600" size={28} />
                {t('products.surfactants.uses.title')}
              </h4>
              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-lg space-y-4">
                <p className="font-bold text-teal-800 mb-4">{t('products.surfactants.uses.subtitle')}</p>
                <div className="grid grid-cols-1 gap-3">
                  {surfactantUses.map((use, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600 leading-relaxed">{t(use)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Form Section */}
      <section className="py-24 bg-white" id="order-form">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-3">{t('products.order.subtitle')}</h2>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">{t('products.order.title')}</h3>
            <p className="text-lg text-gray-600">{t('products.order.desc')}</p>
          </div>

          <AnimatePresence mode="wait">
            {!state.succeeded ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-10 lg:p-16 rounded-[3.5rem] shadow-2xl border border-gray-100"
              >
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1">{t('common.email')}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="email" 
                        name="email"
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('contact.form.placeholder.email')}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                      />
                    </div>
                    <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-500 text-xs mt-1 ml-1" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 ml-1">{t('products.order.type_label')}</label>
                      <div className="relative">
                        <FlaskConical className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <select 
                          name="chemicalType"
                          required
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all appearance-none bg-white"
                        >
                    <option value="Corrosion Inhibitors">{t('products.additives.title')}</option>
                    <option value="Surfactants">{t('products.surfactants.title')}</option>
                    <option value="Biocides">{t('products.order.biocides')}</option>
                    <option value="Scale Inhibitors">{t('products.order.scale')}</option>
                    <option value="Defoamers">{t('products.order.defoamers')}</option>
                    {dynamicProducts.map(p => (
                      <option key={p.id} value={p.name || p.title}>{t(p.name || p.title)}</option>
                    ))}
                    <option value="Other">{t('products.order.other')}</option>
                        </select>
                      </div>
                      <ValidationError prefix="Chemical Type" field="chemicalType" errors={state.errors} className="text-red-500 text-xs mt-1 ml-1" />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 ml-1">{t('products.order.quantity_label')}</label>
                      <select 
                          name="quantity"
                          required
                          className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all appearance-none bg-white"
                        >
                          <option value="1-10">1 - 10 {t('products.order.tons')}</option>
                          <option value="10-50">10 - 50 {t('products.order.tons')}</option>
                          <option value="50-100">50 - 100 {t('products.order.tons')}</option>
                          <option value="100-500">100 - 500 {t('products.order.tons')}</option>
                          <option value="500+">500+ {t('products.order.tons')}</option>
                        </select>
                      <ValidationError prefix="Quantity" field="quantity" errors={state.errors} className="text-red-500 text-xs mt-1 ml-1" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1">{t('products.order.requirements_label')}</label>
                    <textarea 
                      name="requirements"
                      rows={4}
                      className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all resize-none"
                      placeholder={t('products.order.requirements_placeholder')}
                    ></textarea>
                    <ValidationError prefix="Requirements" field="requirements" errors={state.errors} className="text-red-500 text-xs mt-1 ml-1" />
                  </div>

                  <button 
                    type="submit"
                    disabled={state.submitting}
                    className="w-full bg-teal-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-teal-800 transition-all transform hover:scale-[1.02] shadow-xl shadow-teal-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {state.submitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={20} />
                        {t('common.sending')}
                      </>
                    ) : t('products.order.submit')}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-12 lg:p-20 rounded-[3.5rem] shadow-2xl text-center border border-teal-100"
              >
                <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-8">
                  <CheckCircle size={48} />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('products.order.success_title')}</h2>
                <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg mx-auto">
                  {t('products.order.success_desc')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Product Catalog Section */}
      {dynamicProducts.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-3">{t('products.catalog.subtitle')}</h2>
              <h3 className="text-4xl font-bold text-gray-900">{t('products.catalog.title')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dynamicProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 group"
                >
                  <div className="h-64 relative overflow-hidden">
                    <img 
                      src={product.imageUrl || product.img || 'https://picsum.photos/seed/chemical/800/600'} 
                      alt={t(product.name || product.title)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://picsum.photos/seed/chemical/800/600";
                        target.onerror = null;
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-teal-700 font-bold text-sm">
                      {t(product.category) || t('common.specialty')}
                    </div>
                  </div>
                  <div className="p-8">
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">{t(product.name || product.title)}</h4>
                    <p className="text-gray-600 mb-6 line-clamp-3">{t(product.desc || product.description)}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-teal-600 font-bold text-xl">{t(product.price) || t('common.contact_quote')}</span>
                      <a href="#order-form" className="p-3 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-600 hover:text-white transition-colors">
                        <ShoppingCart size={20} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
