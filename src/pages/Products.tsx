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
    { fluid: t('Water-Based Mud'), type: t('Film-forming amines'), dosage: '1–5% ' + t('by volume of mud') },
    { fluid: t('Oil-Based Mud'), type: t('Oil-soluble inhibitors'), dosage: '0.5–2% ' + t('by volume') },
    { fluid: t('Completion Fluid'), type: t('Liquid amine-based'), dosage: '0.2–1% ' + t('by volume') },
    { fluid: t('Acidizing / Stimulation'), type: t('Organic amines'), dosage: '0.5–3% ' + t('of acid volume') },
    { fluid: t('Pipelines / Flowlines'), type: t('Continuous injection'), dosage: '1–5 ppm ' + t('in produced water') },
  ];

  const packagingFormats = [
    { type: t('Plastic Jerrycans / Bottles'), volume: '5–25 ' + t('liters'), use: t('Small-scale operations, lab tests, or emergency use') },
    { type: t('Plastic or Metal Drums'), volume: '200–220 ' + t('liters (≈55 gallons)'), use: t('Standard field supply for drilling or completion operations') },
    { type: t('Intermediate Bulk Containers (IBC / Tote Bags)'), volume: '1000 ' + t('liters (≈264 gallons)'), use: t('Large field operations, offshore rigs, or continuous injection systems') },
    { type: t('Bulk Tankers / Tank Trucks'), volume: '5000–25,000 ' + t('liters'), use: t('Major supply for continuous injection, pipeline corrosion prevention, or large mud systems') },
  ];

  const surfactantUses = [
    t('Surfactants are added to drilling fluids (muds).'),
    t('They help reduce friction and stabilize the wellbore, allowing smoother drilling.'),
    t('Emulsifying Oil and Water.'),
    t('Surfactants allow oil, water, and other fluids to mix in the drilling mud.'),
    t('This prevents separation and ensures the mud carries rock cuttings to the surface efficiently.'),
    t('Enhanced Oil Recovery (EOR).'),
    t('Surfactants are injected into wells to reduce surface tension between oil and rock pores.'),
    t('This helps mobilize trapped oil and improves overall extraction.'),
    t('Corrosion and Scale Control.'),
    t('Certain surfactants can clean pipes and prevent buildup of deposits during drilling and production.'),
    t('Foaming and Cleaning.'),
    t('Used in well cleaning operations to remove debris and improve flow.')
  ];

  const surfactantPrices = [
    { label: t('Bio-based surfactants'), price: '$18–$20 ' + t('per kg') },
    { label: t('Basic anionic/nonionic polymers'), price: '$1–$12 ' + t('per kg') },
    { label: t('Commodity surfactants'), price: '$1–$3 ' + t('per kg') },
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative bg-teal-900 text-white py-24 overflow-hidden min-h-[500px] flex items-center">
        <div className="absolute inset-0">
          {heroContent?.imageUrl ? (
            <img
              src={heroContent.imageUrl}
              alt="Chemicals Hero"
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
                {t(heroContent?.title || '') || (
                  <>
                    {t('Advanced')} <span className="text-teal-400">{t('Chemical')}</span> {t('Solutions')}
                  </>
                )}
              </h1>
              <p className="text-lg sm:text-xl text-teal-100 leading-relaxed mb-8">
                {t(heroContent?.description || '') || t('WAHAT MTQ Chemicals LLC delivers high-performance industrial chemicals, specialized additives, and custom formulations designed to optimize your production processes.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#order-form" className="bg-teal-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20 text-center active:scale-95">
                  {t('Place Order Now')}
                </a>
                <a href="#corrosion-inhibitors" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all text-center active:scale-95">
                  {t('Technical Specs')}
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
            <h2 className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-3">{t('Specialized Additives')}</h2>
            <h3 className="text-4xl font-bold text-gray-900">{t('CORROSION INHIBITORS')}</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <h4 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Activity className="mr-3 text-teal-600" size={28} />
                {t('Typical Dosage Ranges')}
              </h4>
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-0">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-sm font-bold text-gray-700">{t('Fluid Type')}</th>
                      <th className="px-4 py-3 text-sm font-bold text-gray-700">{t('Inhibitor Type')}</th>
                      <th className="px-4 py-3 text-sm font-bold text-gray-700">{t('Typical Dosage')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dosageRanges.map((item, i) => (
                      <tr key={i} className="hover:bg-teal-50/30 transition-colors">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.fluid}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{item.type}</td>
                        <td className="px-4 py-4 text-sm font-bold text-teal-700">{item.dosage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Package className="mr-3 text-teal-600" size={28} />
                {t('Common Packaging Formats')}
              </h4>
              <div className="space-y-4">
                {packagingFormats.map((item, i) => (
                  <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-teal-200 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900">{item.type}</span>
                      <span className="text-teal-600 font-bold text-sm">{item.volume}</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.use}</p>
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
              <h2 className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-3">{t('Surface Active Agents')}</h2>
              <h3 className="text-4xl font-bold text-gray-900 mb-8">{t('SURFACTANTS')}</h3>
              <p className="text-xl text-gray-700 leading-relaxed mb-8 italic border-l-4 border-teal-500 pl-6">
                {t('SURFACTANTS are chemicals that reduce the surface tension between two substances, like oil and water, so they can mix or interact more easily.')}
              </p>
              
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                <h4 className="text-xl font-bold text-teal-900 mb-6 flex items-center">
                  <Info className="mr-2 text-teal-600" size={24} />
                  {t('WAHAT MTQ Prices (Industrial Surfactants)')}
                </h4>
                <div className="space-y-4">
                  <p className="text-teal-800 font-medium mb-4">{t('All prices converted to Metric Ton equivalent:')}</p>
                  {surfactantPrices.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                      <span className="text-gray-700 font-medium">{item.label}</span>
                      <span className="text-teal-700 font-bold">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="space-y-6">
              <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Droplets className="mr-3 text-teal-600" size={28} />
                {t('Uses in Oil Drilling')}
              </h4>
              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-lg space-y-4">
                <p className="font-bold text-teal-800 mb-4">{t('Drilling Mud Additives & More:')}</p>
                <div className="grid grid-cols-1 gap-3">
                  {surfactantUses.map((use, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600 leading-relaxed">{use}</p>
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
            <h2 className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-3">{t('Procurement')}</h2>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">{t('Place Your Chemical Order')}</h3>
            <p className="text-lg text-gray-600">{t('Select your required chemical type and quantity. Our logistics team handles global distribution.')}</p>
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
                    <label className="text-sm font-bold text-gray-700 ml-1">{t('Your Email')}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="email" 
                        name="email"
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('Enter your email for confirmation')}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                      />
                    </div>
                    <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-500 text-xs mt-1 ml-1" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 ml-1">{t('Chemical Type')}</label>
                      <div className="relative">
                        <FlaskConical className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <select 
                          name="chemicalType"
                          required
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all appearance-none bg-white"
                        >
                    <option value="Corrosion Inhibitors">{t('Corrosion Inhibitors')}</option>
                    <option value="Surfactants">{t('Surfactants')}</option>
                    <option value="Biocides">{t('Biocides')}</option>
                    <option value="Scale Inhibitors">{t('Scale Inhibitors')}</option>
                    <option value="Defoamers">{t('Defoamers')}</option>
                    {dynamicProducts.map(p => (
                      <option key={p.id} value={p.name || p.title}>{t(p.name || p.title)}</option>
                    ))}
                    <option value="Other">{t('Other Specialty Chemicals')}</option>
                        </select>
                      </div>
                      <ValidationError prefix="Chemical Type" field="chemicalType" errors={state.errors} className="text-red-500 text-xs mt-1 ml-1" />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 ml-1">{t('Quantity (Tons)')}</label>
                      <select 
                          name="quantity"
                          required
                          className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all appearance-none bg-white"
                        >
                          <option value="1-10">1 - 10 {t('Tons')}</option>
                          <option value="10-50">10 - 50 {t('Tons')}</option>
                          <option value="50-100">50 - 100 {t('Tons')}</option>
                          <option value="100-500">100 - 500 {t('Tons')}</option>
                          <option value="500+">500+ {t('Tons')}</option>
                        </select>
                      <ValidationError prefix="Quantity" field="quantity" errors={state.errors} className="text-red-500 text-xs mt-1 ml-1" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1">{t('Additional Requirements')}</label>
                    <textarea 
                      name="requirements"
                      rows={4}
                      className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all resize-none"
                      placeholder={t('Packaging requirements, delivery timeline, or specific technical specifications...')}
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
                        {t('Sending...')}
                      </>
                    ) : t('Submit Order Request')}
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
                <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('Order Request Received')}</h2>
                <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg mx-auto">
                  {t('Thank you for your interest in Wahat MTQ Chemicals. Our technical sales team will review your request and contact you within 24 hours with a formal quote.')}
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
              <h2 className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-3">{t('Product Catalog')}</h2>
              <h3 className="text-4xl font-bold text-gray-900">{t('Our Chemical Range')}</h3>
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
                      alt={product.name || product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://picsum.photos/seed/chemical/800/600";
                        target.onerror = null;
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-teal-700 font-bold text-sm">
                      {product.category || t('Specialty')}
                    </div>
                  </div>
                  <div className="p-8">
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">{t(product.name || product.title)}</h4>
                    <p className="text-gray-600 mb-6 line-clamp-3">{t(product.desc || product.description)}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-teal-600 font-bold text-xl">{t(product.price || t('Contact for Quote'))}</span>
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
