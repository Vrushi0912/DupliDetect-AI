import React, { useState } from 'react';
import './Pricing.css';

const PLANS = [
  {
    name: 'Starter',
    price: { monthly: 0, yearly: 0 },
    desc: 'Perfect for individuals and small projects.',
    color: '#3b82f6',
    features: [
      'Up to 5,000 records/month',
      '3 languages supported',
      'Basic duplicate detection',
      'CSV export',
      'Email support',
    ],
    missing: ['Semantic AI matching', 'API access', 'Custom rules'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: { monthly: 49, yearly: 39 },
    desc: 'For teams that need powerful multilingual matching.',
    color: '#7c3aed',
    badge: 'Most Popular',
    features: [
      'Up to 200,000 records/month',
      '50+ languages supported',
      'Semantic AI matching',
      'API access',
      'Custom confidence rules',
      'Smart clustering',
      'Priority support',
    ],
    missing: [],
    cta: 'Start Pro Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: 199, yearly: 159 },
    desc: 'Unlimited scale, custom integrations, and SLA.',
    color: '#10b981',
    features: [
      'Unlimited records',
      '100+ languages',
      'On-premise deployment',
      'Custom AI model training',
      'SSO & RBAC',
      'Dedicated account manager',
      'Custom SLA & uptime',
    ],
    missing: [],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const Pricing = () => {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="pricing" id="pricing">
      <div className="pricing__header">
        <span className="pricing__label">Transparent Pricing</span>
        <h2 className="pricing__title">
          Plans That Scale<br />
          <span className="pricing__title-gradient">With Your Data</span>
        </h2>
        <p className="pricing__subtitle">Start free, upgrade when ready. No hidden fees.</p>

        {/* Toggle */}
        <div className="pricing__toggle">
          <span className={!yearly ? 'pricing__toggle-label--active' : 'pricing__toggle-label'}>Monthly</span>
          <button
            className={`pricing__toggle-btn ${yearly ? 'pricing__toggle-btn--on' : ''}`}
            onClick={() => setYearly(!yearly)}
            aria-label="Toggle billing period"
          >
            <div className="pricing__toggle-knob" />
          </button>
          <span className={yearly ? 'pricing__toggle-label--active' : 'pricing__toggle-label'}>
            Yearly <span className="pricing__toggle-save">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="pricing__grid">
        {PLANS.map((p, i) => (
          <div
            key={i}
            className={`pricing-card ${p.highlight ? 'pricing-card--highlight' : ''}`}
            style={{ '--plan-color': p.color }}
          >
            {p.badge && <div className="pricing-card__badge">{p.badge}</div>}

            <div className="pricing-card__top">
              <h3 className="pricing-card__name">{p.name}</h3>
              <p className="pricing-card__desc">{p.desc}</p>

              <div className="pricing-card__price">
                {p.price.monthly === 0 ? (
                  <span className="pricing-card__amount">Free</span>
                ) : (
                  <>
                    <span className="pricing-card__currency">$</span>
                    <span className="pricing-card__amount">
                      {yearly ? p.price.yearly : p.price.monthly}
                    </span>
                    <span className="pricing-card__period">/mo</span>
                  </>
                )}
              </div>
            </div>

            <ul className="pricing-card__features">
              {p.features.map((f, j) => (
                <li key={j} className="pricing-card__feature pricing-card__feature--yes">
                  <span className="pricing-card__check">✓</span> {f}
                </li>
              ))}
              {p.missing.map((f, j) => (
                <li key={j} className="pricing-card__feature pricing-card__feature--no">
                  <span className="pricing-card__cross">✕</span> {f}
                </li>
              ))}
            </ul>

            <button className="pricing-card__cta" onClick={() => window.parent.postMessage('goto:dashboard', '*')}>{p.cta}</button>
          </div>
        ))}
      </div>

      <p className="pricing__note">
        All plans include a 14-day free trial. No credit card required.
      </p>
    </section>
  );
};

export default Pricing;
