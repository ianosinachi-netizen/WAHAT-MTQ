import React from 'react';
import { FileText, TrendingUp, Award, Shield, Download, Search, Filter, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const reports = [
  {
    title: 'Global Chemical Market Trends Q1 2026',
    category: 'Market Analysis',
    date: 'March 15, 2026',
    size: '4.2 MB',
    type: 'PDF',
    desc: 'Deep dive into solvent pricing and global supply chain shifts.'
  },
  {
    title: 'Industrial Safety Compliance Audit: MENA Region',
    category: 'Compliance',
    date: 'February 28, 2026',
    size: '2.8 MB',
    type: 'PDF',
    desc: 'Updated safety standards for chemical storage and handling.'
  },
  {
    title: 'Sustainable Chemical Formulations Report',
    category: 'Innovation',
    date: 'February 10, 2026',
    size: '5.1 MB',
    type: 'PDF',
    desc: 'Exploring eco-friendly alternatives for industrial cleaning agents.'
  },
  {
    title: 'Petrochemical Pricing Forecast: 2026-2027',
    category: 'Forecasting',
    date: 'January 22, 2026',
    size: '3.5 MB',
    type: 'PDF',
    desc: 'Predictive analysis of raw material costs for the next 18 months.'
  }
];

export default function Reports() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('reports.title')}</h1>
            <p className="text-gray-600">{t('reports.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full font-bold text-sm">
            <Shield size={18} />
            <span>{t('reports.premium.verified')}</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder={t('reports.search.placeholder')}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all bg-white shadow-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all bg-white shadow-sm appearance-none font-semibold text-gray-700">
              <option>{t('reports.categories.all')}</option>
              <option>{t('reports.categories.market')}</option>
              <option>{t('reports.categories.compliance')}</option>
              <option>{t('reports.categories.innovation')}</option>
              <option>{t('reports.categories.forecasting')}</option>
            </select>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reports.map((report, index) => (
            <div key={index} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-teal-900/5 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <FileText size={28} />
                </div>
                <span className="px-4 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                  {t(report.category)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
                {t(report.title)}
              </h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                {t(report.desc)}
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="font-medium">{t(report.date)}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="font-medium">{report.size}</span>
                </div>
                <button className="flex items-center space-x-2 text-teal-600 font-bold hover:text-teal-800 transition-colors">
                  <Download size={18} />
                  <span>{t('reports.btn.download')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Banner */}
        <div className="mt-20 bg-teal-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-800 rounded-full -mr-32 -mt-32 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-800 rounded-full -ml-24 -mb-24 opacity-20"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">{t('reports.custom.title')}</h2>
            <p className="text-teal-100 mb-8 max-w-2xl mx-auto">
              {t('reports.custom.subtitle')}
            </p>
            <button className="bg-white text-teal-900 px-10 py-4 rounded-xl font-bold hover:bg-teal-50 transition-all shadow-lg shadow-teal-900/20 flex items-center justify-center space-x-2 mx-auto">
              <span>{t('reports.custom.btn')}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
