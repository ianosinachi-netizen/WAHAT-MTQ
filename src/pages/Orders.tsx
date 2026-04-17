import React, { useEffect, useState } from 'react';
import { Package, Clock, Truck, CheckCircle, Search, Filter, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface Order {
  orderId: string;
  uid: string;
  chemicalName: string;
  quantity: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: any;
}

export default function Orders() {
  const { t } = useLanguage();
  const { user, profile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => doc.data() as Order);
      setOrders(ordersData);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.chemicalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-amber-500" size={20} />;
      case 'processing': return <Package className="text-blue-500" size={20} />;
      case 'shipped': return <Truck className="text-purple-500" size={20} />;
      case 'delivered': return <CheckCircle className="text-green-500" size={20} />;
      default: return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'delivered': return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-md border border-gray-100">
          <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-teal-600">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('orders.access.title')}</h2>
          <p className="text-gray-500 mb-8">{t('orders.access.subtitle')}</p>
          <Link 
            to="/membership" 
            className="block w-full bg-teal-900 text-white py-4 rounded-2xl font-bold hover:bg-teal-800 transition-all shadow-lg shadow-teal-900/20"
          >
            {t('membership.auth.signin')} / {t('membership.auth.signup')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('orders.title')}</h1>
            <p className="text-gray-600">{t('orders.subtitle')}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder={t('orders.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all bg-white shadow-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all bg-white shadow-sm appearance-none font-semibold text-gray-700"
            >
              <option value="All">{t('orders.status.all')}</option>
              <option value="Pending">{t('orders.status.pending')}</option>
              <option value="Processing">{t('orders.status.processing')}</option>
              <option value="Shipped">{t('orders.status.shipped')}</option>
              <option value="Delivered">{t('orders.status.delivered')}</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <motion.div
                  layout
                  key={order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start space-x-6">
                      <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 flex-shrink-0">
                        <Package size={32} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{order.chemicalName}</h3>
                          <span className="text-sm text-gray-400 font-mono">#{order.orderId}</span>
                        </div>
                        <p className="text-gray-500 mb-4">{t('orders.details.quantity')}: <span className="font-bold text-gray-900">{order.quantity} {t('orders.details.units')}</span></p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{t('orders.details.placed_on')} {order.createdAt?.toDate().toLocaleDateString() || t('common.loading')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl border font-bold ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{t(`orders.status.${order.status}`)}</span>
                      </div>
                      <button className="w-full sm:w-auto px-8 py-3 rounded-2xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-all">
                        {t('orders.details.btn')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <Package size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('orders.empty.title')}</h3>
                <p className="text-gray-500 mb-8">{t('orders.empty.subtitle')}</p>
                <Link 
                  to="/products" 
                  className="inline-flex items-center space-x-2 bg-teal-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-800 transition-all shadow-lg shadow-teal-900/20"
                >
                  {t('orders.empty.browse')}
                </Link>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
