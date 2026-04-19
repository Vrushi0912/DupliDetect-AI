import React from 'react';
import { useNavigate } from 'react-router-dom';
import GlobeCanvas from './GlobeCanvas';
import LanguageBoxes from './LanguageBox';
import { auth } from '../firebase';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="hero" id="home">
      {/* Background gradient */}
      <div className="hero__bg-glow hero__bg-glow--purple" />
      <div className="hero__bg-glow hero__bg-glow--blue" />

      <div className="hero__container">
        {/* Left: Text content */}
        <div className="hero__left">


          <h1 className="hero__title">
            Detect Duplicate<br />
            Records Across<br />
            <span className="hero__title-gradient">Languages Instantly</span>
          </h1>

          <p className="hero__desc">
            Our AI engine understands meaning, not just words.<br />
            Find duplicates in any language with semantic intelligence.
          </p>

          <div className="hero__actions">
            <button className="hero__btn hero__btn--primary" onClick={() => navigate(auth.currentUser ? '/dashboard' : '/auth')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload Dataset
            </button>
            <button className="hero__btn hero__btn--secondary" onClick={() => navigate(auth.currentUser ? '/dashboard' : '/auth')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              Explore Dashboard
            </button>
          </div>


        </div>

        {/* Right: Globe + Language boxes */}
        <div className="hero__right">
          <div className="hero__globe-wrapper">
            <LanguageBoxes />
            <div className="hero__globe-center">
              <GlobeCanvas />
            </div>
          </div>

          {/* Side icon strip */}

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero__scroll-hint">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
