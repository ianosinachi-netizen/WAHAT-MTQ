/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const Services = lazy(() => import('./pages/Services'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Membership = lazy(() => import('./pages/Membership'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Reports = lazy(() => import('./pages/Reports'));
const Orders = lazy(() => import('./pages/Orders'));
const Capabilities = lazy(() => import('./pages/Capabilities'));
const Barite = lazy(() => import('./pages/Barite'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="barite" element={<Barite />} />
            <Route path="products" element={<Products />} />
            <Route path="services" element={<Services />} />
            <Route path="capabilities" element={<Capabilities />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="membership" element={<Membership />} />
            <Route path="contact" element={<Contact />} />
            <Route path="orders" element={<Orders />} />
            <Route path="admin" element={<AdminPanel />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

