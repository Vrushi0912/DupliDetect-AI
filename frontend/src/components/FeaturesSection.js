import React from 'react';
import './FeaturesSection.css';

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    color: '#3b82f6',
    title: 'Multilingual Detection',
    desc: 'Detect duplicates across 100+ languages and scripts.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    color: '#7c3aed',
    title: 'Semantic AI Engine',
    desc: 'Understands meaning, not just spelling or keywords.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    color: '#10b981',
    title: 'Confidence Scoring',
    desc: 'Get AI-powered confidence scores for every match.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    color: '#f59e0b',
    title: 'Smart Clustering',
    desc: 'Group similar records into intelligent clusters.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    color: '#ec4899',
    title: 'Analytics & Insights',
    desc: 'Visualize patterns and gain actionable insights.',
  },
];

const FeaturesSection = () => (
  <section className="features" id="features">
    <div className="features__grid">
      {FEATURES.map((f, i) => (
        <div key={i} className="feature-card" style={{ '--f-color': f.color }}>
          <div className="feature-card__icon">{f.icon}</div>
          <div className="feature-card__body">
            <h3 className="feature-card__title">{f.title}</h3>
            <p className="feature-card__desc">{f.desc}</p>
            <a href="#features" className="feature-card__link">
              Learn more <span>→</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default FeaturesSection;
