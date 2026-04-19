import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__logo">
        <div className="navbar__logo-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="10" cy="10" r="8" stroke="#a855f7" strokeWidth="2" fill="none" />
            <circle cx="18" cy="18" r="8" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.8" />
            <circle cx="10" cy="10" r="3" fill="#a855f7" />
            <circle cx="18" cy="18" r="3" fill="#3b82f6" />
          </svg>
        </div>
        <span className="navbar__logo-text">
          DupliDetect <span className="navbar__logo-ai">AI</span>
        </span>
      </div>

      <ul className="navbar__links">
        <li><a href="#home" className="navbar__link navbar__link--active">Home</a></li>
        <li><a href="#how" className="navbar__link">How It Works</a></li>
        <li><a href="#dashboard" className="navbar__link" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>Dashboard</a></li>
        <li><a href="#pricing" className="navbar__link">Pricing</a></li>
        <li><a href="#contact" className="navbar__link">Contact</a></li>
      </ul>

      <div className="navbar__actions">
        <Link to="/auth" className="navbar__cta" style={{ textDecoration: 'none' }}>
          Try Live Demo <span>→</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
