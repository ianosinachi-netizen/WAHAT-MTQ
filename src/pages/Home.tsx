import { ArrowRight, Beaker, FlaskConical, Droplets, ShieldCheck, Globe, Users, Award, Star, X, Shield, Clock, CheckCircle, FileText, Zap, Activity, Microscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';

const iconMap: Record<string, any> = {
  Beaker,
  FlaskConical,
  Droplets,
  ShieldCheck,
  Globe,
  Zap,
  Activity,
  Microscope
};

const heroImages = [
  "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=2000", // Barite/Industrial placeholder
  "https://images.unsplash.com/photo-1581093577421-f561a654a353?auto=format&fit=crop&q=80&w=2000", // Lab placeholder
  "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?auto=format&fit=crop&q=80&w=2000", // Industry placeholder
  "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&q=80&w=2000"  // Chemical placeholder
];

const bariteImages = [
  "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1581093577421-f561a654a353?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&q=80&w=1000"
];

export default function Home() {
  const { t } = useLanguage();
  const [currentHero, setCurrentHero] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedService, setSelectedService] = useState<{title: string, desc: string, details: string, bg: string} | null>(null);
  const [heroContent, setHeroContent] = useState<{ imageUrl: string; imageUrls?: string[]; title?: string; description?: string } | null>(null);
  const [aboutContent, setAboutContent] = useState<{ imageUrl?: string; title?: string; description?: string } | null>(null);
  const [dynamicServices, setDynamicServices] = useState<any[]>([]);
  const [dynamicTestimonials, setDynamicTestimonials] = useState<any[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const unsubscribeHero = onSnapshot(doc(db, 'page_content', 'home-hero'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setHeroContent(data);
        setCurrentHeroIndex(0);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'page_content/home-hero');
    });

    const unsubscribeAbout = onSnapshot(doc(db, 'page_content', 'home-about'), (docSnap) => {
      if (docSnap.exists()) {
        setAboutContent(docSnap.data() as any);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'page_content/home-about');
    });

    const qServices = query(collection(db, 'services'), orderBy('createdAt', 'asc'));
    const unsubscribeServices = onSnapshot(qServices, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (servicesData.length > 0) setDynamicServices(servicesData);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'services');
    });

    const qTestimonials = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    const unsubscribeTestimonials = onSnapshot(qTestimonials, (snapshot) => {
      const testimonialsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (testimonialsData.length > 0) setDynamicTestimonials(testimonialsData);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'testimonials');
    });

    return () => {
      unsubscribeHero();
      unsubscribeAbout();
      unsubscribeServices();
      unsubscribeTestimonials();
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bariteImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const services = [
    { 
      icon: Beaker, 
      title: t('Custom Blending'), 
      desc: t('Tailored chemical formulations designed to meet your specific industrial performance criteria.'),
      bg: "https://images.unsplash.com/photo-1532187863486-abf9d39d6618?auto=format&fit=crop&q=80&w=1000",
      details: t('Our custom blending services provide precise formulations for various industries. We use advanced mixing technology to ensure homogeneity and performance. Whether you need small batches or large-scale production, our team can handle complex chemical requirements with ease.')
    },
    { 
      icon: FlaskConical, 
      title: t('Lab Analysis'), 
      desc: t('State-of-the-art testing facilities ensuring the highest purity and consistency standards.'),
      bg: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000",
      details: t('Our laboratory is equipped with the latest analytical instruments. We perform rigorous testing on all raw materials and finished products. Our services include purity analysis, stability testing, and performance verification to guarantee ISO compliance.')
    },
    { 
      icon: Droplets, 
      title: t('Supply Chain'), 
      desc: t('Efficient chemical logistics and inventory management solutions for global distribution.'),
      bg: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000",
      details: t('We offer a robust supply chain network that spans the globe. Our logistics experts ensure timely delivery and safe handling of hazardous and non-hazardous chemicals. We provide real-time tracking and inventory management to keep your operations running smoothly.')
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-teal-900 text-white py-24 lg:py-40 min-h-[70vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          {heroContent?.imageUrls && heroContent.imageUrls.length > 0 ? (
            <div className="relative w-full h-full">
              <AnimatePresence mode="wait">
                <motion.img
                  key={heroContent.imageUrls[currentHeroIndex]}
                  src={heroContent.imageUrls[currentHeroIndex]}
                  alt="Home Hero"
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
              <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 via-teal-900/20 to-transparent"></div>
            </div>
          ) : heroContent?.imageUrl ? (
            <div className="relative w-full h-full">
              <img
                src={heroContent.imageUrl}
                alt="Home Hero"
                className="w-full h-full object-cover opacity-100"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://picsum.photos/seed/chemical/1920/1080";
                  target.onerror = null;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 via-teal-900/20 to-transparent"></div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentHero}
                src={heroImages[currentHero]} 
                alt={t('Chemical Laboratory')} 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.4, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
          )}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1 rounded-full bg-teal-500/20 backdrop-blur-sm border border-teal-500/30 text-teal-300 text-sm font-bold mb-6"
            >
              {t('ISO 9001:2015 Certified Company')}
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
            >
              {t(heroContent?.title || '') || (
                <>
                  {t('Advanced Chemical Solutions for')} <span className="text-teal-400">{t('Global Industries')}</span>
                </>
              )}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-teal-100 mb-10 leading-relaxed"
            >
              {t(heroContent?.description || '') || t('WAHAT MTQ Chemicals LLC delivers high-performance industrial chemicals, specialized additives, and custom formulations designed to optimize your production processes.')}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 mt-8"
            >
              <Link to="/contact" className="bg-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-400 transition-all flex items-center justify-center group shadow-lg shadow-teal-500/20 active:scale-95">
                {t('Request a Quote')}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link to="/products" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all text-center active:scale-95">
                {t('View Products')}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Overview Section (Merged from About) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center space-x-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Clock size={16} />
                <span>13 {t('Years Experience')}</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                {t(aboutContent?.title || '') || t('A Leading Provider of Specialized Products and Services')}
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {t(aboutContent?.description || '') || t('WAHAT MTQ LLC As a leading provider of specialized products and services, our company offers a unique combination of solutions to meet the needs of multiple industries. We are committed to delivering the best possible products and services to our customers.')}
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {t('From high-performance oilfield chemicals (WAHAT chemicals) to cutting-edge electronics (WAHAT view), we are committed to delivering the best possible products and services to our customers. With a focus on quality, innovation, and customer satisfaction, we have built a reputation for excellence that spans multiple industries.')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-teal-600 mt-1" size={20} />
                  <span className="text-gray-700 font-medium">{t('Quality Innovation')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-teal-600 mt-1" size={20} />
                  <span className="text-gray-700 font-medium">{t('Customer Satisfaction')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-teal-600 mt-1" size={20} />
                  <span className="text-gray-700 font-medium">{t('Safety Excellence')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-teal-600 mt-1" size={20} />
                  <span className="text-gray-700 font-medium">{t('Global Standards')}</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img 
                src={aboutContent?.imageUrl || "https://siddachem.com/images/home8-images/welcome-img.jpg"} 
                alt={t('Welcome')} 
                className="rounded-[3rem] shadow-2xl relative z-10 w-full"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://picsum.photos/seed/lab/800/600";
                  target.onerror = null;
                }}
              />
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-teal-500/10 rounded-full -z-0 blur-2xl"></div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12 mb-24">
            <div className="bg-gray-50 p-8 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-gray-100 hover:shadow-xl transition-shadow">
              <Shield className="text-teal-600 mb-6" size={40} />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('Safety Commitment')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('We understand the importance of safety in the oilfield and take our responsibility seriously. That\'s why we only source our chemicals from trusted suppliers and rigorously test each batch before it is shipped to our customers.')}
              </p>
            </div>
            <div className="bg-gray-50 p-8 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-gray-100 hover:shadow-xl transition-shadow">
              <Award className="text-teal-600 mb-6" size={40} />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('Expert Team')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('Our team of experts has extensive experience in the oil and gas industry and is dedicated to finding innovative solutions to the challenges our customers face.')}
              </p>
            </div>
            <div className="bg-gray-50 p-8 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-gray-100 hover:shadow-xl transition-shadow">
              <Globe className="text-teal-600 mb-6" size={40} />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('Sustainability')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('We take pride in our commitment to sustainability and are constantly exploring new ways to reduce our environmental impact through eco-friendly production methods.')}
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-600 space-y-8 mb-24">
            <p>
              {t('At WAHAT MTQ LLC, our mission is to help our customers succeed by providing them with the products and support they need to operate efficiently and safely. We believe in building long-term relationships with our customers and are committed to earning their trust through our actions.')}
            </p>
            <p>
              {t('Our product line includes a wide range of chemicals, from drilling muds and cement additives to corrosion inhibitors and scale inhibitors. We can also provide customized blends to meet specific customer requirements. Whatever your needs, we are confident that we can provide a solution that works for you.')}
            </p>
          </div>

          {/* Barite Slider Section (Merged from About) */}
          <div className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('Our Premium Mineral Resources')}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{t('Explore our high-grade Barite and industrial minerals sourced from the finest deposits.')}</p>
            </div>
            <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={bariteImages[currentSlide]}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {bariteImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-3 h-3 rounded-full transition-all ${currentSlide === i ? 'bg-white w-8' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-3">{t('Our Services')}</h2>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">{t('Specialized Solutions for Every Need')}</h3>
            <p className="text-lg text-gray-600">{t('From custom blending to technical consulting, we provide end-to-end support for your chemical requirements.')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(dynamicServices.length > 0 ? dynamicServices : services).map((service, i) => {
              const IconComponent = iconMap[service.icon] || Beaker;
              return (
                <div key={i} className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-teal-900/5 transition-all group min-h-[400px] flex flex-col">
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity">
                    <img 
                      src={service.bg} 
                      alt={service.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://picsum.photos/seed/service/800/600";
                        target.onerror = null;
                      }}
                    />
                  </div>
                  <div className="relative z-10 p-10 flex flex-col h-full bg-white/80 backdrop-blur-sm">
                    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-teal-600 transition-colors">
                      <IconComponent className="text-teal-600 group-hover:text-white transition-colors" size={32} />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-4">{t(service.title)}</h4>
                    <p className="text-gray-600 leading-relaxed mb-6 flex-grow">{t(service.desc)}</p>
                    <button 
                      onClick={() => setSelectedService(service)}
                      className="text-teal-600 font-bold inline-flex items-center group-hover:translate-x-1 transition-transform text-left"
                    >
                      {t('Learn More')} <ArrowRight className="ml-2" size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X size={24} />
              </button>
              <div className="h-48 relative">
                <img 
                  src={selectedService.bg} 
                  alt={selectedService.title} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://picsum.photos/seed/service/800/600";
                    target.onerror = null;
                  }}
                />
                <div className="absolute inset-0 bg-teal-900/40 flex items-center justify-center">
                  <h2 className="text-3xl font-bold text-white">{t(selectedService.title)}</h2>
                </div>
              </div>
              <div className="p-10">
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  {t(selectedService.details)}
                </p>
                <div className="flex justify-end">
                  <button 
                    onClick={() => setSelectedService(null)}
                    className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors"
                  >
                    {t('Close')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Testimonials Section */}
      <section className="py-24 bg-teal-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-800 rounded-full -mr-48 -mt-48 opacity-20 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-teal-400 font-bold tracking-widest uppercase text-sm mb-3">{t('Testimonials')}</h2>
            <h3 className="text-4xl font-bold">{t('Trusted by Industry Leaders')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(dynamicTestimonials.length > 0 ? dynamicTestimonials : [
              { name: t('David Miller'), company: t('Global PetroCorp'), text: t('WAHAT MTQ has been our primary chemical supplier for 5 years. Their consistency in quality and reliability in delivery is unmatched in the industry.') },
              { name: t('Sarah Al-Fayed'), company: t('Emirates Water Solutions'), text: t('The technical support we receive from their lab team is exceptional. They helped us optimize our treatment process, saving us significant costs.') },
              { name: t('Robert Chen'), company: t('TechPolymer Industries'), text: t('Finding a partner that understands specialized chemical requirements is rare. WAHAT MTQ delivers custom blends that meet our exact specs every time.') },
            ]).map((testimonial, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10">
                <div className="flex text-teal-400 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <p className="text-teal-100 italic mb-8 leading-relaxed">"{t(testimonial.text)}"</p>
                <div>
                  <h4 className="font-bold text-lg">{t(testimonial.name)}</h4>
                  <p className="text-teal-400 text-sm">{t(testimonial.company)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-teal-600 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-teal-600/20">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <img 
                src="https://images.unsplash.com/photo-1532187863486-abf9d39d6618?auto=format&fit=crop&q=80&w=2070" 
                alt={t('Background')} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8">{t('Ready to Optimize Your Chemical Supply?')}</h2>
              <p className="text-teal-100 text-lg mb-10 max-w-2xl mx-auto">{t('Contact our technical experts today to discuss your requirements and receive a customized quote.')}</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/contact" className="bg-white text-teal-700 px-10 py-4 rounded-full font-bold text-lg hover:bg-teal-50 transition-all shadow-xl">
                  {t('Request a Quote')}
                </Link>
                <Link to="/contact" className="bg-teal-700 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-teal-800 transition-all">
                  {t('Contact Sales')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
