import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import MosiShopPage from './pages/MosiShopPage';
import CigarHistoryPage from './pages/CigarHistoryPage';
import SearchPage from './pages/SearchPage';
import SavedCigarsPage from './pages/SavedCigarsPage';
import React from 'react';
import { Agentation } from 'agentation';
import Navbar from './components/Navbar';
import AgeGate from './components/AgeGate';
import './App.css';

function App() {
  return (
    <>
      <AgeGate />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product-details/:slug" element={<ProductDetailPage />} />
        <Route path="/shop/mosi-oa-tunya" element={<MosiShopPage />} />
        <Route path="/cigar-history" element={<CigarHistoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/wishlist" element={<SavedCigarsPage />} />
        <Route path="/saved-cigars" element={<Navigate to="/wishlist" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {import.meta.env.DEV && <Agentation />}
    </>
  );
}

export default App;
