import React from 'react';
import { motion } from 'motion/react';
import { Factory, FlaskConical, Package, ShieldCheck, Truck, BarChart3 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const capabilities = [
  {
    title: 'Industrial Chemical Supply',
    description: 'We provide a vast range of high-quality industrial chemicals sourced from global manufacturers, ensuring reliability and consistency for your production needs.',
    icon: Factory,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Laboratory Services',
    description: 'Our state-of-the-art laboratory facilities offer comprehensive testing, analysis, and quality verification services to meet stringent industry standards.',
    icon: FlaskConical,
    color: 'bg-teal-50 text-teal-600',
  },
  {
    title: 'Bulk Manufacturing',
    description: 'Equipped with advanced processing units, we specialize in the bulk manufacturing of chemical formulations tailored to specific industrial requirements.',
    icon: Package,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Quality Control Systems',
    description: 'Our rigorous quality control systems monitor every stage of the supply chain, from sourcing to delivery, ensuring the highest level of product integrity.',
    icon: ShieldCheck,
    color: 'bg-green-50 text-green-600',
  },
  {
    title: 'Logistics and Distribution',
    description: 'With a robust logistics network, we ensure safe and timely distribution of chemical products across diverse geographical locations.',
    icon: Truck,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    title: 'Technical Consultation',
    description: 'Our team of experts provides technical guidance and consultation to help you optimize your chemical processes and achieve operational excellence.',
    icon: BarChart3,
    color: 'bg-rose-50 text-rose-600',
  },
];

export default function Capabilities() {
  const { t } = useLanguage();

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            {t('Our Capabilities')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            {t('Leveraging advanced technology and deep industry expertise to deliver comprehensive chemical solutions for global industrial challenges.')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
            >
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t(item.title)}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t(item.description)}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 bg-teal-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">{t('Ready to optimize your supply chain?')}</h2>
            <p className="text-teal-100 mb-8 max-w-2xl mx-auto">
              {t('Partner with us to leverage our extensive capabilities and drive efficiency in your chemical procurement and manufacturing processes.')}
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-white text-teal-900 px-10 py-4 rounded-2xl font-bold hover:bg-teal-50 transition-all shadow-lg"
            >
              {t('Contact Our Experts')}
            </a>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full -ml-32 -mb-32 blur-3xl" />
        </motion.div>
      </div>
    </div>
  );
}
