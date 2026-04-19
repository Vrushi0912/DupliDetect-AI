import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPreview.css';

const RECORDS = [
  { id: '001', name: 'John Smith',       lang: 'EN', match: 98, status: 'duplicate' },
  { id: '002', name: 'Jon Smith',         lang: 'EN', match: 98, status: 'duplicate' },
  { id: '003', name: 'ジョン・スミス',       lang: 'JA', match: 95, status: 'duplicate' },
  { id: '004', name: 'جون سميث',         lang: 'AR', match: 91, status: 'duplicate' },
  { id: '005', name: 'María González',   lang: 'ES', match: 87, status: 'review' },
  { id: '006', name: 'Maria Gonzalez',   lang: 'EN', match: 87, status: 'review' },
  { id: '007', name: '玛丽亚·冈萨雷斯',    lang: 'ZH', match: 83, status: 'review' },
];

const LANG_COLOR = {
  EN: '#3b82f6', JA: '#10b981', AR: '#f59e0b',
  ES: '#ec4899', ZH: '#7c3aed',
};

const STATUS_BADGE = {
  duplicate: { label: 'Duplicate', color: '#ef4444' },
  review: { label: 'Review', color: '#f59e0b' },
  unique: { label: 'Unique', color: '#10b981' },
};

const DashboardPreview = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(new Set([0, 1, 2, 3]));
  const sectionRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const toggleRow = (i) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <section className="dash" id="dashboard" ref={sectionRef}>
      <div className={`dash__inner ${visible ? 'dash__inner--visible' : ''}`}>
        {/* Left: text */}
        <div className="dash__text">
          <span className="dash__label">Live Dashboard</span>
          <h2 className="dash__title">
            See Every Duplicate,<br />
            <span className="dash__title-gradient">Across Every Language</span>
          </h2>
          <p className="dash__desc">
            Our intuitive dashboard gives you full visibility into duplicate clusters,
            confidence scores, and per-language breakdowns — all in real time.
          </p>

          <ul className="dash__bullets">
            {[
              'Cross-language record grouping',
              'Color-coded confidence score badges',
              'One-click merge & de-duplicate',
              'Export clean data as CSV/JSON',
            ].map((b, i) => (
              <li key={i} className="dash__bullet">
                <span className="dash__bullet-icon">✓</span> {b}
              </li>
            ))}
          </ul>

          <button className="dash__cta" onClick={() => navigate('/dashboard')}>Explore Dashboard →</button>
        </div>

        {/* Right: mock dashboard UI */}
        <div className="dash__preview">
          {/* Top bar */}
          <div className="dash__preview-bar">
            <div className="dash__preview-dot" style={{ background: '#ef4444' }} />
            <div className="dash__preview-dot" style={{ background: '#f59e0b' }} />
            <div className="dash__preview-dot" style={{ background: '#10b981' }} />
            <span className="dash__preview-title">DupliDetect — Results</span>
          </div>

          {/* Metrics row */}
          <div className="dash__metrics">
            {[
              { label: 'Total Records', value: '12,540', color: '#7c3aed' },
              { label: 'Duplicates', value: '1,324', color: '#ef4444' },
              { label: 'Unique', value: '11,216', color: '#10b981' },
              { label: 'Confidence', value: '96%', color: '#3b82f6' },
            ].map((m, i) => (
              <div key={i} className="dash__metric" style={{ '--mc': m.color }}>
                <span className="dash__metric-value">{m.value}</span>
                <span className="dash__metric-label">{m.label}</span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="dash__table-wrap">
            <table className="dash__table">
              <thead>
                <tr>
                  <th></th>
                  <th>ID</th>
                  <th>Record</th>
                  <th>Lang</th>
                  <th>Match %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {RECORDS.map((r, i) => {
                  const st = STATUS_BADGE[r.status];
                  return (
                    <tr
                      key={i}
                      className={`dash__row ${selected.has(i) ? 'dash__row--selected' : ''}`}
                      onClick={() => toggleRow(i)}
                      style={{ animationDelay: `${i * 0.07}s` }}
                    >
                      <td>
                        <div className={`dash__check ${selected.has(i) ? 'dash__check--on' : ''}`}>
                          {selected.has(i) && <svg width="10" height="10" viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                        </div>
                      </td>
                      <td className="dash__cell-id">{r.id}</td>
                      <td className="dash__cell-name">{r.name}</td>
                      <td>
                        <span className="dash__lang" style={{ '--lc': LANG_COLOR[r.lang] || '#7c3aed' }}>
                          {r.lang}
                        </span>
                      </td>
                      <td>
                        <div className="dash__bar-wrap">
                          <div className="dash__bar" style={{ '--pct': r.match + '%', '--bc': st.color }} />
                          <span className="dash__pct">{r.match}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="dash__badge" style={{ '--bc': st.color }}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom action bar */}
          <div className="dash__actions-bar">
            <span className="dash__sel-count">{selected.size} selected</span>
            <button className="dash__act-btn dash__act-btn--merge">Merge Duplicates</button>
            <button className="dash__act-btn dash__act-btn--export">Export Clean Data</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
