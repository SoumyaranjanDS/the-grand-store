import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Agentation } from 'agentation'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home from './pages/Home'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import DisclaimerPage from './pages/DisclaimerPage'

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <div className="site-frame">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
      </Routes>
      <Footer />
      {import.meta.env.DEV && <Agentation />}
    </div>
  )
}

export default App
