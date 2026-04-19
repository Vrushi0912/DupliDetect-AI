import React from 'react';
import './StatsBar.css';

const STATS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
    color: '#7c3aed',
    value: '12,540',
    label: 'Total Records',
    sublabel: 'Processed',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    color: '#3b82f6',
    value: '1,324',
    label: 'Duplicates Found',
    sublabel: 'Across Dataset',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    color: '#10b981',
    value: '8',
    label: 'Languages Detected',
    sublabel: 'Automatically',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    color: '#f59e0b',
    value: '230',
    label: 'Clusters Created',
    sublabel: 'Smart Grouping',
  },
];

const StatsBar = () => (
  <div className="stats-bar">
    {STATS.map((s, i) => (
      <div key={i} className="stats-bar__item">
        <div className="stats-bar__icon" style={{ '--icon-color': s.color }}>
          {s.icon}
        </div>
        <div className="stats-bar__info">
          <span className="stats-bar__value">{s.value}</span>
          <span className="stats-bar__label">{s.label}</span>
          <span className="stats-bar__sublabel">{s.sublabel}</span>
        </div>
      </div>
    ))}
  </div>
);

export default StatsBar;
