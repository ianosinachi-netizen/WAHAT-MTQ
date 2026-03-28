import React, { useState } from 'react';
import { X, Star, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  rating: number;
  img: string;
  stock: number;
  desc: string;
  details: string;
  specs: string[];
  sdsUrl?: string;
}

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onOrder: (quantity: number) => void;
  orderLoading: boolean;
  orderSuccess: boolean;
}

export default function ProductDetail({ 
  product, 
  onClose, 
  onOrder,
  orderLoading,
  orderSuccess 
}: ProductDetailProps) {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-gray-900 transition-colors shadow-lg"
        >
          <X size={24} />
        </button>

        <div className="lg:w-2/5 h-64 lg:h-auto relative">
          <img 
            src={product.img} 
            alt={t(product.name)} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
          <div className="absolute bottom-6 left-6 hidden lg:block">
            <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-teal-900 font-bold shadow-xl border border-white/20">
              {product.price === 'Quote' ? t('Quote') : product.price}
            </span>
          </div>
        </div>

        <div className="lg:w-3/5 p-8 lg:p-12 overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest">
                {t(product.category)}
              </span>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{t(product.name)}</h2>
            
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                ))}
                <span className="ml-2 text-sm font-bold text-gray-700">{product.rating}</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className={`font-bold ${product.stock > 0 ? 'text-teal-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} ${t('Units In Stock')}` : t('Out of Stock')}
              </span>
            </div>

            <div className="relative">
              <div className="space-y-4 transition-all duration-500">
                <h4 className="font-bold text-gray-900 text-lg">{t('Product Overview')}</h4>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {t(product.details)}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            {/* Technical Specs */}
            <div className="space-y-6">
              <h4 className="font-bold text-gray-900 flex items-center text-lg">
                <CheckCircle2 className="mr-2 text-teal-600" size={24} />
                {t('Technical Specifications')}
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specs.map((spec, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3" />
                    {t(spec)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
