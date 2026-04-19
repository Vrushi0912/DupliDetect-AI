import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorks from './components/HowItWorks';
import UploadSection from './components/UploadSection';
import DashboardPreview from './components/DashboardPreview';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <UploadSection />
      <DashboardPreview />
      <Pricing />
      <Footer />
    </>
  );
}

function AppContent() {
  return (
    <div className="app">
      <ParticleBackground />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router initialEntries={[window.INITIAL_ROUTE === 'login' ? '/auth' : (window.INITIAL_ROUTE === 'dashboard' ? '/dashboard' : '/') ]}>
      <AppContent />
    </Router>
  );
}

export default App;
