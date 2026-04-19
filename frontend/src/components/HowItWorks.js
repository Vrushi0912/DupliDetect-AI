import React, { useEffect, useRef } from 'react';
import './HowItWorks.css';

const STEPS = [
  {
    step: '01',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    color: '#7c3aed',
    gradFrom: '#7c3aed',
    gradTo: '#8b5cf6',
    title: 'Upload Dataset',
    desc: 'User uploads records in CSV, Excel, or database format containing names or descriptions in different languages.',
  },
  {
    step: '02',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    color: '#3b82f6',
    gradFrom: '#3b82f6',
    gradTo: '#60a5fa',
    title: 'Analyze Dataset',
    desc: 'System reads the data and identifies important fields like name, description, and category for comparison.',
  },
  {
    step: '03',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M5 8l6 6" />
        <path d="M4 14l6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="M22 22l-5-10-5 10" />
        <path d="M14 18h6" />
      </svg>
    ),
    color: '#0ea5e9',
    gradFrom: '#0ea5e9',
    gradTo: '#38bdf8',
    title: 'Detect Languages',
    desc: 'Automatically detects the language of each record to support multilingual processing.',
  },
  {
    step: '04',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    color: '#10b981',
    gradFrom: '#10b981',
    gradTo: '#34d399',
    title: 'Generate Embeddings',
    desc: 'Converts text from different languages into meaningful numeric representations using AI models.',
  },
  {
    step: '05',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    color: '#f59e0b',
    gradFrom: '#f59e0b',
    gradTo: '#fbbf24',
    title: 'Calculate Similarity',
    desc: 'Compares records based on meaning rather than spelling using semantic similarity techniques.',
  },
  {
    step: '06',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M12 18v-6" />
        <path d="M8 15h8" />
      </svg>
    ),
    color: '#ec4899',
    gradFrom: '#ec4899',
    gradTo: '#f472b6',
    title: 'Identify Duplicates',
    desc: 'Detects records that represent the same item based on similarity score thresholds.',
  },
];

const HowItWorks = () => {
  const stepsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('hiw-step--visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    stepsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hiw" id="how">
      <div className="hiw__header">
        <span className="hiw__label">The Strategy</span>
        <h2 className="hiw__title">
          From Raw Records to <span className="hiw__title-gradient">Clean Data</span>
          <br />in 6 Semantic Steps
        </h2>
        <p className="hiw__subtitle">
          Watch our AI pipeline transform your dataset into a high-fidelity duplicate-free asset.
        </p>
      </div>

      <div className="hiw__steps">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className="hiw-step"
            ref={(el) => (stepsRef.current[i] = el)}
            style={{ '--step-color': s.color, '--grad-from': s.gradFrom, '--grad-to': s.gradTo, animationDelay: `${i * 0.12}s` }}
          >
            {/* Connector line */}
            {i < STEPS.length - 1 && <div className="hiw-step__connector" />}

            <div className="hiw-step__number">{s.step}</div>

            <div className="hiw-step__card">
              <div className="hiw-step__icon-wrap">
                <div className="hiw-step__icon-glow" />
                <div className="hiw-step__icon">{s.icon}</div>
              </div>
              <h3 className="hiw-step__title">{s.title}</h3>
              <p className="hiw-step__desc">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA strip */}

    </section>
  );
};

export default HowItWorks;
