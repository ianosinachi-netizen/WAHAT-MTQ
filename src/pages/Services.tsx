import { Beaker, FlaskConical, Droplets, ShieldCheck, Globe, Rocket, TrendingUp, X, ArrowRight, CheckCircle, Loader2, Microscope, Activity, Zap, Shield, Truck, Settings, Users, Lightbulb, Search, BarChart, HardHat, Warehouse, Construction, Anchor, Plane, Ship, Factory, Hammer, Wrench, PenTool, Briefcase, Heart, Star, Award, Target, Zap as ZapIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const iconMap: { [key: string]: any } = {
  Beaker, FlaskConical, Droplets, ShieldCheck, Globe, Rocket, TrendingUp, 
  Microscope, Activity, Zap, Shield, Truck, Settings, Users, Lightbulb, 
  Search, BarChart, HardHat, Warehouse, Construction, Anchor, Plane, 
  Ship, Factory, Hammer, Wrench, PenTool, Briefcase, Heart, Star, 
  Award, Target, ZapIcon
};

export default function Services() {
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [dynamicServices, setDynamicServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDynamicServices(servicesData);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'services');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const services = [
    {
      icon: Beaker,
      title: 'Custom Blending',
      desc: 'Tailored chemical formulations designed to meet your specific industrial performance criteria.',
      bg: "https://images.unsplash.com/photo-1532187863486-abf9d39d6618?auto=format&fit=crop&q=80&w=2070",
      details: 'Our custom blending services provide precise formulations for various industries. We use advanced mixing technology to ensure homogeneity and performance. Whether you need small batches or large-scale production, our team can handle complex chemical requirements with ease. We specialize in aqueous and solvent-based blends, ensuring each product meets your exact specifications.'
    },
    {
      icon: FlaskConical,
      title: 'Lab Analysis',
      desc: 'State-of-the-art testing facilities ensuring the highest purity and consistency standards.',
      bg: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2070",
      details: 'Our laboratory is equipped with the latest analytical instruments, including HPLC, GC, and ICP-MS. We perform rigorous testing on all raw materials and finished products. Our services include purity analysis, stability testing, and performance verification to guarantee ISO compliance and exceed industry standards.'
    },
    {
      icon: Droplets,
      title: 'Supply Chain',
      desc: 'Efficient chemical logistics and inventory management solutions for global distribution.',
      bg: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2070",
      details: 'We offer a robust supply chain network that spans the globe. Our logistics experts ensure timely delivery and safe handling of hazardous and non-hazardous chemicals. We provide real-time tracking, optimized routing, and strategic inventory management to keep your operations running smoothly without interruptions.'
    },
    {
      icon: ShieldCheck,
      title: 'Compliance Consulting',
      desc: 'Expert guidance on regulatory compliance and safety standards for chemical handling.',
      bg: "https://images.unsplash.com/photo-1454165833767-027ffea9e778?auto=format&fit=crop&q=80&w=2070",
      details: 'Navigating the complex landscape of chemical regulations is challenging. Our experts provide comprehensive support for REACH, GHS, and local environmental standards. We help you develop Safety Data Sheets (SDS), implement safety protocols, and ensure your facility meets all legal requirements for chemical storage and transport.'
    },
    {
      icon: Globe,
      title: 'Global Sourcing',
      desc: 'Direct access to a worldwide network of high-quality chemical manufacturers.',
      bg: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=2070",
      details: 'Leverage our extensive network of vetted manufacturers across Asia, Europe, and the Americas. We source hard-to-find chemicals and negotiate competitive pricing while maintaining strict quality control. Our global presence allows us to mitigate supply chain risks and ensure a steady flow of raw materials for your business.'
    },
    {
      icon: Rocket,
      title: 'R&D Support',
      desc: 'Collaborative research and development to create next-generation chemical solutions.',
      bg: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=2070",
      details: 'Innovation is at the heart of what we do. Our R&D team works closely with clients to develop new products, improve existing formulations, and find sustainable alternatives. From initial concept to pilot-scale testing, we provide the technical expertise and laboratory resources needed to bring your chemical innovations to market.'
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 rounded-full bg-teal-50 text-teal-600 text-sm font-bold mb-6"
          >
            {t('Expert Technical Services')}
          </motion.div>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            {t('Industrial')} <span className="text-teal-600">{t('Services')}</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('We provide a comprehensive range of technical services tailored to the chemical industry, ensuring quality, safety, and innovation at every step.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
            </div>
          ) : (dynamicServices.length > 0 ? dynamicServices : services).map((service, i) => {
            const IconComponent = typeof service.icon === 'string' ? (iconMap[service.icon] || Beaker) : service.icon;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-teal-900/10 transition-all flex flex-col min-h-[420px]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <img src={service.bg || service.imageUrl} alt={service.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="relative z-10 p-10 flex flex-col h-full">
                  <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-teal-600 transition-colors duration-300">
                    <IconComponent className="text-teal-600 group-hover:text-white transition-colors duration-300" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{t(service.title)}</h3>
                  <p className="text-gray-600 leading-relaxed mb-8 flex-grow">{t(service.desc)}</p>
                  <button 
                    onClick={() => setSelectedService(service)}
                    className="mt-auto text-teal-600 font-bold flex items-center space-x-2 group-hover:translate-x-2 transition-transform"
                  >
                    <span>{t('Learn More')}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Technical Expertise Section */}
        <div className="mt-32 bg-teal-900 rounded-[3rem] p-8 lg:p-20 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-800 rounded-full -mr-48 -mt-48 opacity-20 blur-3xl"></div>
          <div className="lg:w-1/2 relative z-10">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8 leading-tight">
              {t('Technical Expertise at Your Service')}
            </h2>
            <p className="text-teal-100 text-lg mb-10 leading-relaxed">
              {t('Our team of chemical engineers and industry specialists are ready to help you solve your most complex technical challenges with precision and safety.')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {['Custom Formulations', 'Regulatory Support', 'Quality Control', 'Technical Training'].map((item, i) => (
                <div key={i} className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                  <CheckCircle className="text-teal-400" size={20} />
                  <span className="font-bold text-white">{t(item)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <img 
                src="https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=2070" 
                alt={t('Technical Support')} 
                className="rounded-3xl shadow-2xl border-8 border-white/5"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>

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
              <div className="h-64 relative">
                <img src={selectedService.bg || selectedService.imageUrl} alt={selectedService.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-teal-900/60 flex items-center justify-center p-12 text-center">
                  <h2 className="text-4xl font-bold text-white">{t(selectedService.title)}</h2>
                </div>
              </div>
              <div className="p-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                    {(() => {
                      const IconComp = typeof selectedService.icon === 'string' ? (iconMap[selectedService.icon] || Beaker) : selectedService.icon;
                      return <IconComp className="text-teal-600" size={24} />;
                    })()}
                  </div>
                  <span className="text-teal-600 font-bold uppercase tracking-widest text-sm">{t('Service Details')}</span>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed mb-10">
                  {t(selectedService.details)}
                </p>
                <div className="flex justify-end">
                  <button 
                    onClick={() => setSelectedService(null)}
                    className="bg-teal-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
                  >
                    {t('Close')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
