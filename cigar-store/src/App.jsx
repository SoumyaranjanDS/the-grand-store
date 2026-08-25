import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import MosiShopPage from "./pages/MosiShopPage";
import CigarHistoryPage from "./pages/CigarHistoryPage";
import SearchPage from "./pages/SearchPage";
import SavedCigarsPage from "./pages/SavedCigarsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import TermsConditionsPage from "./pages/TermsConditionsPage";
import TermsServicePage from "./pages/TermsServicePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import CookiesPolicyPage from "./pages/CookiesPolicyPage";
import ExclusiveCollectionPage from "./pages/ExclusiveCollectionPage";
import React from "react";
import { Agentation } from "agentation";
import Navbar from "./components/Navbar";
import AgeGate from "./components/AgeGate";
import "./App.css";

function App() {
  return (
    <>
      <AgeGate />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product-details/:slug" element={<ProductDetailPage />} />
        <Route path="/shop/mosi-oa-tunya" element={<MosiShopPage />} />
        <Route path="/exclusive-collection" element={<ExclusiveCollectionPage />} />
        <Route path="/cigar-history" element={<CigarHistoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/wishlist" element={<SavedCigarsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms-conditions" element={<TermsConditionsPage />} />
        <Route path="/terms-service" element={<TermsServicePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/cookies-policy" element={<CookiesPolicyPage />} />
        <Route
          path="/saved-cigars"
          element={<Navigate to="/wishlist" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {import.meta.env.DEV && <Agentation />}
    </>
  );
}

export default App;
