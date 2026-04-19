import React from 'react';
import './Footer.css';

const LINKS = {
  Product: ['Features', 'How It Works', 'Pricing', 'Changelog', 'Roadmap'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Developers: ['API Docs', 'SDK', 'Webhooks', 'Status'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
};

const SOCIALS = [
  {
    label: 'Twitter',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg>,
  },
  {
    label: 'GitHub',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>,
  },
  {
    label: 'LinkedIn',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>,
  },
];

const Footer = () => (
  <footer className="footer" id="contact">
    {/* Top CTA Banner */}
    <div className="footer__banner">
      <div className="footer__banner-glow footer__banner-glow--left" />
      <div className="footer__banner-glow footer__banner-glow--right" />

    </div>

    {/* Main footer */}
    <div className="footer__main">
      <div className="footer__brand">
        <div className="footer__logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="10" cy="10" r="8" stroke="#a855f7" strokeWidth="2" fill="none" />
            <circle cx="18" cy="18" r="8" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.8" />
            <circle cx="10" cy="10" r="3" fill="#a855f7" />
            <circle cx="18" cy="18" r="3" fill="#3b82f6" />
          </svg>
          <span className="footer__logo-text">DupliDetect <span className="footer__logo-ai">AI</span></span>
        </div>
        <p className="footer__brand-desc">
          The intelligent, multilingual duplicate detection platform for modern data teams.
        </p>
        <div className="footer__socials">
          {SOCIALS.map((s) => (
            <a key={s.label} href="#contact" className="footer__social" aria-label={s.label}>{s.icon}</a>
          ))}
        </div>
      </div>

      {Object.entries(LINKS).map(([cat, items]) => (
        <div key={cat} className="footer__col">
          <h4 className="footer__col-title">{cat}</h4>
          <ul className="footer__col-links">
            {items.map((item) => (
              <li key={item}>
                <a href="#home" className="footer__col-link">{item}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {/* Bottom bar */}
    <div className="footer__bottom">
      <span className="footer__copy">© 2026 DupliDetect AI. All rights reserved.</span>
      <div className="footer__bottom-links">
        <a href="#home" className="footer__bottom-link">Privacy</a>
        <a href="#home" className="footer__bottom-link">Terms</a>
        <a href="#home" className="footer__bottom-link">Cookies</a>
      </div>
    </div>
  </footer>
);

export default Footer;
