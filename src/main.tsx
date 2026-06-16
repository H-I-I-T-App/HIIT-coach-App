import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import WebApp from './WebApp.tsx';
import LandingPage from './pages/LandingPage.tsx';
import PrivacyPolicy from './pages/PrivacyPolicy.tsx';
import Support from './pages/Support.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/support" element={<Support />} />
        <Route path="/app" element={<WebApp />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
