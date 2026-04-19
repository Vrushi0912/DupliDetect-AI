import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  BarChart2,
  Globe,
  Settings,
  Cpu,
  Layers,
  Copy,
  Package,
  Target,
  PieChart,
  Download,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import './Dashboard.css';
import './UploadSection.css';
import { detectDuplicates, translateTexts, LANGUAGE_MAP } from '../api/apiClient';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// ── Sidebar step definitions ───────────────────────────────────────────────────
const DASHBOARD_STEPS = [
  { id: 'upload',      label: 'Upload Dataset',      icon: Upload    },
  { id: 'analyze',     label: 'Analyze Dataset',     icon: BarChart2 },
  { id: 'languages',   label: 'Detect Languages',    icon: Globe     },
  { id: 'preprocess',  label: 'Preprocess Text',     icon: Settings  },
  { id: 'embeddings',  label: 'Generate Embeddings', icon: Cpu       },
  { id: 'similarity',  label: 'Calculate Similarity',icon: Layers    },
  { id: 'duplicates',  label: 'Identify Duplicates', icon: Copy      },
  { id: 'clusters',    label: 'Create Clusters',     icon: Package   },
  { id: 'confidence',  label: 'Confidence Score',    icon: Target    },
  { id: 'visualize',   label: 'Visualize Results',   icon: PieChart  },
  { id: 'export',      label: 'Export Dataset',      icon: Download  },
];

// ── Small helper: generic data table ──────────────────────────────────────────
function DataTable({ rows, maxRows = 200 }) {
  if (!rows || rows.length === 0) {
    return <p style={{ color: '#94a3b8', textAlign: 'center' }}>No data to display.</p>;
  }
  const cols = Object.keys(rows[0]);
  const visible = rows.slice(0, maxRows);
  return (
    <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead style={{ position: 'sticky', top: 0, background: '#1e1b4b' }}>
          <tr>
            {cols.map((c) => (
              <th key={c} style={{ padding: '10px 14px', textAlign: 'left', color: '#a5b4fc', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
              {cols.map((c) => (
                <td key={c} style={{ padding: '9px 14px', color: '#e2e8f0', borderBottom: '1px solid rgba(255,255,255,0.05)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {String(row[c] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <p style={{ textAlign: 'center', color: '#64748b', padding: 10, fontSize: 12 }}>
          Showing {maxRows} of {rows.length} rows
        </p>
      )}
    </div>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────
function Metric({ label, value, color = '#a855f7' }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '18px 22px', minWidth: 140 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value ?? '—'}</div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState('upload');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ── Upload state ─────────────────────────────────────────────────────────
  const [dragActive, setDragActive]   = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | success | error
  const [fileName, setFileName]       = useState('');
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef(null);

  // ── API result state ──────────────────────────────────────────────────────
  const [result, setResult] = useState(null); // full /api/detect response

  // ── Translate state ───────────────────────────────────────────────────────
  const [targetLang, setTargetLang]         = useState('Hindi');
  const [translateLoading, setTranslateLoading] = useState(false);
  const [translateError, setTranslateError]     = useState('');
  const [translated, setTranslated]             = useState(null);

  // ── Auth logout handler ──────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/'); // fallback
    }
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  // ── Core: call POST /api/detect ───────────────────────────────────────────
  const processFile = async (file) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file only.');
      return;
    }
    setFileName(file.name);
    setUploadState('uploading');
    setUploadError('');
    setResult(null);

    try {
      // → POST /api/detect (backend: get_embeddings + find_duplicates_faiss)
      const data = await detectDuplicates(file);
      setResult(data);
      setUploadState('success');

      // ── Save metadata to Cloud Firestore ──────────────────────────────────
      if (auth.currentUser) {
        try {
          await addDoc(collection(db, 'scans'), {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            fileName: file.name,
            totalRecords: data.total_records,
            cleanRecords: data.clean_records,
            duplicateGroups: data.duplicate_groups,
            processingTime: data.processing_time_sec,
            createdAt: serverTimestamp(),
          });
          console.log('✅ Scan metadata stored in Firestore');
        } catch (fsErr) {
          console.error('❌ Firestore write error:', fsErr);
        }
      }
    } catch (err) {
      setUploadError(err.message);
      setUploadState('error');
    }
  };

  // ── Core: call POST /api/translate ────────────────────────────────────────
  const handleTranslate = async () => {
    if (!result?.clean) return;
    const texts = result.clean.slice(0, 50).map((r) => String(Object.values(r)[1] ?? Object.values(r)[0]));
    setTranslateLoading(true);
    setTranslateError('');
    setTranslated(null);

    try {
      // → POST /api/translate (backend: translate_batch)
      const res = await translateTexts(texts, LANGUAGE_MAP[targetLang]);
      setTranslated(res.translated_texts);
    } catch (err) {
      setTranslateError(err.message);
    } finally {
      setTranslateLoading(false);
    }
  };

  // ── CSV download helper ───────────────────────────────────────────────────
  const downloadCSV = (rows, filename) => {
    if (!rows?.length) return;
    const cols = Object.keys(rows[0]);
    const csv  = [cols.join(','), ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render per-step content ───────────────────────────────────────────────
  const activeStepData = DASHBOARD_STEPS.find((s) => s.id === activeStep);

  const renderContent = () => {
    const Icon = activeStepData?.icon || FileText;

    // ── UPLOAD ──────────────────────────────────────────────────────────────
    if (activeStep === 'upload') {
      return (
        <div className="dash-main__content-inner">
          <h2 className="dash-main__title">Upload Dataset</h2>
          <p className="dash-main__subtitle">Securely upload your CSV for instant AI deduplication.</p>

          <div className="upload__box-wrap" style={{ maxWidth: '100%' }}>
            <div
              className={`upload__box ${dragActive ? 'upload__box--drag-active' : ''} upload__box--${uploadState === 'error' ? 'idle' : uploadState}`}
              onDragEnter={handleDrag} onDragLeave={handleDrag}
              onDragOver={handleDrag}  onDrop={handleDrop}
              onClick={() => uploadState === 'idle' && inputRef.current.click()}
              style={{ cursor: uploadState === 'idle' ? 'pointer' : 'default' }}
            >
              <input ref={inputRef} type="file" accept=".csv" onChange={handleChange} className="upload__input" />

              {/* IDLE */}
              {(uploadState === 'idle' || uploadState === 'error') && (
                <div className="upload__content">
                  <div className="upload__icon"><Upload size={48} strokeWidth={1.5} /></div>
                  <h3 className="upload__box-title">Drag & Drop your CSV file here</h3>
                  <p className="upload__box-desc">or click to browse your files (Max size: 50 MB)</p>
                  {uploadError && <p style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>⚠ {uploadError}</p>}
                  <button className="upload__btn" onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}>
                    Upload Dataset
                  </button>
                </div>
              )}

              {/* UPLOADING / PROCESSING */}
              {uploadState === 'uploading' && (
                <div className="upload__content upload__content--loading">
                  <div className="upload__spinner">
                    <div className="upload__spinner-ring" />
                    <div className="upload__spinner-core" />
                  </div>
                  <h3 className="upload__box-title">Processing '{fileName}'…</h3>
                  <p className="upload__box-desc">Running AI embeddings & duplicate detection</p>
                </div>
              )}

              {/* SUCCESS */}
              {uploadState === 'success' && result && (
                <div className="upload__content upload__content--success">
                  <div className="upload__icon upload__icon--success">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h3 className="upload__box-title">Detection Complete!</h3>
                  <p className="upload__box-desc"><strong>{fileName}</strong> — {result.total_records} records processed in {result.processing_time_sec}s</p>
                  <div className="upload__success-actions">
                    <button className="upload__btn upload__btn--primary" onClick={(e) => { e.stopPropagation(); setActiveStep('analyze'); }}>
                      Continue to Analysis →
                    </button>
                    <button className="upload__btn--text" onClick={(e) => { e.stopPropagation(); setUploadState('idle'); setResult(null); }}>
                      Upload another file
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // ── ANALYZE ─────────────────────────────────────────────────────────────
    if (activeStep === 'analyze') {
      return (
        <div className="dash-main__content-inner">
          <h2 className="dash-main__title">Analyze Dataset</h2>
          <p className="dash-main__subtitle">Summary metrics from the AI pipeline.</p>
          {!result ? (
            <p style={{ color: '#94a3b8' }}>Please upload a dataset first (Step 1).</p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
                <Metric label="Total Records"     value={result.total_records}    color="#7c3aed" />
                <Metric label="Clean Records"     value={result.clean_records}    color="#10b981" />
                <Metric label="Duplicate Groups"  value={result.duplicate_groups} color="#ef4444" />
                <Metric label="Speed (rec/sec)"   value={result.speed_rec_per_sec} color="#3b82f6" />
                <Metric label="Processing Time"   value={`${result.processing_time_sec}s`} color="#f59e0b" />
              </div>
              <h3 style={{ color: '#e2e8f0', marginBottom: 12 }}>All Records (with group labels)</h3>
              <DataTable rows={result.records} />
            </>
          )}
        </div>
      );
    }

    // ── DUPLICATES ───────────────────────────────────────────────────────────
    if (activeStep === 'duplicates') {
      return (
        <div className="dash-main__content-inner">
          <h2 className="dash-main__title">Identified Duplicates</h2>
          <p className="dash-main__subtitle">Records flagged as semantic duplicates by FAISS.</p>
          {!result ? (
            <p style={{ color: '#94a3b8' }}>Please upload a dataset first (Step 1).</p>
          ) : (
            <>
              <p style={{ color: '#94a3b8', marginBottom: 16 }}>
                {result.duplicates.length} duplicate records across {result.duplicate_groups} groups.
              </p>
              <DataTable rows={result.duplicates} />
            </>
          )}
        </div>
      );
    }

    // ── EXPORT ───────────────────────────────────────────────────────────────
    if (activeStep === 'export') {
      return (
        <div className="dash-main__content-inner">
          <h2 className="dash-main__title">Export Dataset</h2>
          <p className="dash-main__subtitle">Download clean or raw results as CSV.</p>
          {!result ? (
            <p style={{ color: '#94a3b8' }}>Please upload a dataset first (Step 1).</p>
          ) : (
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
              <button
                style={{ padding: '12px 24px', borderRadius: 10, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => downloadCSV(result.clean, 'clean_dataset.csv')}
              >
                📥 Download Clean Dataset ({result.clean_records} rows)
              </button>
              <button
                style={{ padding: '12px 24px', borderRadius: 10, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => downloadCSV(result.duplicates, 'duplicates.csv')}
              >
                📥 Download Duplicates Only ({result.duplicates.length} rows)
              </button>
              <button
                style={{ padding: '12px 24px', borderRadius: 10, background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => downloadCSV(result.records, 'all_records_with_groups.csv')}
              >
                📥 Download All Records ({result.total_records} rows)
              </button>
            </div>
          )}
        </div>
      );
    }

    // ── TRANSLATE (languages step repurposed) ────────────────────────────────
    if (activeStep === 'languages') {
      return (
        <div className="dash-main__content-inner">
          <h2 className="dash-main__title">Translate Clean Dataset</h2>
          <p className="dash-main__subtitle">Translate the de-duplicated records to a target language.</p>

          {!result ? (
            <p style={{ color: '#94a3b8' }}>Please upload a dataset first (Step 1).</p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: 8, background: '#1e1b4b', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.15)', fontSize: 14 }}
                >
                  {Object.keys(LANGUAGE_MAP).map((l) => <option key={l}>{l}</option>)}
                </select>
                <button
                  onClick={handleTranslate}
                  disabled={translateLoading}
                  style={{ padding: '10px 24px', borderRadius: 8, background: '#7c3aed', color: '#fff', border: 'none', cursor: translateLoading ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: translateLoading ? 0.6 : 1 }}
                >
                  {translateLoading ? 'Translating…' : `Translate to ${targetLang}`}
                </button>
              </div>

              {translateError && <p style={{ color: '#f87171', marginBottom: 14 }}>⚠ {translateError}</p>}

              {translated && (
                <>
                  <h3 style={{ color: '#e2e8f0', marginBottom: 10 }}>Translation Results (first 50 rows)</h3>
                  <div style={{ overflowX: 'auto', maxHeight: 380, overflowY: 'auto', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#1e1b4b' }}>
                        <tr>
                          <th style={{ padding: '10px 14px', textAlign: 'left', color: '#a5b4fc', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Original</th>
                          <th style={{ padding: '10px 14px', textAlign: 'left', color: '#a5b4fc', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{targetLang} Translation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {translated.map((t, i) => {
                          const originalRow = result.clean[i] ?? {};
                          const original = String(Object.values(originalRow)[1] ?? Object.values(originalRow)[0] ?? '');
                          return (
                            <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                              <td style={{ padding: '9px 14px', color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{original}</td>
                              <td style={{ padding: '9px 14px', color: '#e2e8f0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{t}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      );
    }

    // ── All other steps: show results table if available, else placeholder ───
    const stepResultMap = {
      embeddings:  { title: 'Generated Embeddings',    data: result?.records,    note: 'Semantic vectors computed via paraphrase-multilingual-MiniLM-L12-v2.' },
      similarity:  { title: 'Similarity Calculation',  data: result?.records,    note: 'Cosine similarity computed via FAISS IndexFlatIP.' },
      clusters:    { title: 'Duplicate Clusters',      data: result?.duplicates, note: 'Records grouped by semantic similarity group ID.' },
      confidence:  { title: 'Confidence Scores',       data: result?.records,    note: 'Group IDs act as cluster confidence labels (threshold: 0.7).' },
      visualize:   { title: 'Result Visualization',    data: result?.records,    note: 'Raw result table — chart library integration coming soon.' },
      preprocess:  { title: 'Preprocessed Records',    data: result?.records,    note: 'Text lowercased and stripped before embedding.' },
    };

    const mapped = stepResultMap[activeStep];
    if (mapped) {
      return (
        <div className="dash-main__content-inner">
          <h2 className="dash-main__title">{activeStepData?.label}</h2>
          <p className="dash-main__subtitle">{mapped.note}</p>
          {!result ? (
            <p style={{ color: '#94a3b8' }}>Please upload a dataset first (Step 1).</p>
          ) : (
            <DataTable rows={mapped.data} />
          )}
        </div>
      );
    }

    // fallback placeholder
    return (
      <div className="dash-main__content-inner">
        <h2 className="dash-main__title">{activeStepData?.label}</h2>
        <p className="dash-main__subtitle">Operation: {activeStep}</p>
        <div className="dash-placeholder">
          <div className="dash-placeholder__icon"><Icon size={64} strokeWidth={1} /></div>
          <h3>Module Ready</h3>
          <p>This module will be activated once a valid dataset is processed through the previous steps.</p>
          <div className="dash-placeholder__loader">
            <div className="dash-placeholder__loader-bar" />
          </div>
        </div>
      </div>
    );
  };

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`dash-sidebar ${isSidebarOpen ? '' : 'dash-sidebar--closed'}`}>
        <div className="dash-sidebar__header">
          <div className="dash-sidebar__logo">
            <div className="dash-sidebar__logo-icon" />
            <span>DupliDetect AI</span>
          </div>
          <button className="dash-sidebar__toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="dash-sidebar__nav">
          {DASHBOARD_STEPS.map((step) => (
            <button
              key={step.id}
              className={`dash-sidebar__item ${activeStep === step.id ? 'dash-sidebar__item--active' : ''}`}
              onClick={() => setActiveStep(step.id)}
            >
              <span className="dash-sidebar__item-icon">
                <step.icon size={18} strokeWidth={activeStep === step.id ? 2.5 : 2} />
              </span>
              <span className="dash-sidebar__item-label">{step.label}</span>
            </button>
          ))}
        </nav>

        <div className="dash-sidebar__footer">
          <div className="dash-sidebar__user">
            <div className="dash-sidebar__user-avatar">
              {auth.currentUser?.displayName ? 
                auth.currentUser.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 
                auth.currentUser?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="dash-sidebar__user-info">
              <p className="dash-sidebar__user-name">
                {auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Guest User'}
              </p>
              <p className="dash-sidebar__user-plan">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <header className="dash-main__header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="dash-main__back-btn" onClick={() => navigate('/')} title="Back to Home">
              <ArrowLeft size={18} />
            </button>
            <div className="dash-main__breadcrumb">
              <span>Workspace</span> / <span>Dashboard</span> / <span className="active">{activeStepData?.label}</span>
            </div>
          </div>
          <div className="dash-main__actions">
            <button className="dash-main__btn-icon"><Bell size={18} /></button>
            <button className="dash-main__btn-icon"><Settings size={18} /></button>
            <button className="dash-main__logout" onClick={handleLogout}>
              <LogOut size={14} style={{ marginRight: 8 }} />
              Logout
            </button>
          </div>
        </header>

        <section className="dash-main__content">{renderContent()}</section>
      </main>
    </div>
  );
};

export default Dashboard;
