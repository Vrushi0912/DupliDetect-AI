import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './UploadSection.css';
import { detectDuplicates } from '../api/apiClient';
import { auth } from '../firebase';

/**
 * UploadSection — Landing-page quick-scan widget
 * ───────────────────────────────────────────────
 * API mapping:
 *   POST /api/detect  →  get_embeddings() + find_duplicates_faiss()
 *
 * On success, a summary toast is shown and the user is directed
 * to the full Dashboard for detailed results.
 */
const UploadSection = () => {
  const [dragActive, setDragActive]   = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | success | error
  const [fileName, setFileName]       = useState('');
  const [apiError, setApiError]       = useState('');
  const [summary, setSummary]         = useState(null);  // { total, clean, groups }
  const navigate = useNavigate();
  const inputRef = useRef(null);

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

  const onButtonClick = () => inputRef.current.click();

  // ── Call POST /api/detect ────────────────────────────────────────────────
  const processFile = async (file) => {
    setFileName(file.name);
    setUploadState('uploading');
    setApiError('');
    setSummary(null);

    try {
      const data = await detectDuplicates(file);
      setSummary({
        total:  data.total_records,
        clean:  data.clean_records,
        groups: data.duplicate_groups,
        speed:  data.speed_rec_per_sec,
      });
      setUploadState('success');
    } catch (err) {
      setApiError(err.message);
      setUploadState('error');
    }
  };

  const reset = () => {
    setUploadState('idle');
    setApiError('');
    setSummary(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section className="upload-section" id="upload">
      <div className="upload__container">
        <div className="upload__header">
          <span className="upload__label">Try It Out</span>
          <h2 className="upload__title">Analyze Your Dataset Now</h2>
          <p className="upload__subtitle">Securely upload your CSV for instant AI deduplication.</p>
        </div>

        <div className="upload__box-wrap">
          <div
            className={`upload__box ${dragActive ? 'upload__box--drag-active' : ''} upload__box--${uploadState === 'error' ? 'idle' : uploadState}`}
            onDragEnter={handleDrag} onDragLeave={handleDrag}
            onDragOver={handleDrag}  onDrop={handleDrop}
          >
            <input ref={inputRef} type="file" accept=".csv" onChange={handleChange} className="upload__input" />

            {/* IDLE / ERROR */}
            {(uploadState === 'idle' || uploadState === 'error') && (
              <div className="upload__content">
                <div className="upload__icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                </div>
                <h3 className="upload__box-title">Drag & Drop your CSV file here</h3>
                <p className="upload__box-desc">or click to browse your files (Max size: 50 MB)</p>
                {apiError && (
                  <p style={{ color: '#f87171', fontSize: 13, marginTop: 8, maxWidth: 420, textAlign: 'center' }}>
                    ⚠ Backend error: {apiError}
                  </p>
                )}
                <button className="upload__btn" onClick={onButtonClick}>Upload Dataset</button>
              </div>
            )}

            {/* UPLOADING */}
            {uploadState === 'uploading' && (
              <div className="upload__content upload__content--loading">
                <div className="upload__spinner">
                  <div className="upload__spinner-ring" />
                  <div className="upload__spinner-core" />
                </div>
                <h3 className="upload__box-title">Running AI on '{fileName}'…</h3>
                <p className="upload__box-desc">Generating embeddings & detecting duplicates</p>
              </div>
            )}

            {/* SUCCESS */}
            {uploadState === 'success' && summary && (
              <div className="upload__content upload__content--success">
                <div className="upload__icon upload__icon--success">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3 className="upload__box-title">Scan Complete!</h3>
                <p className="upload__box-desc">
                  <strong>{summary.total}</strong> records &nbsp;·&nbsp;
                  <strong style={{ color: '#ef4444' }}>{summary.total - summary.clean} duplicates</strong> &nbsp;·&nbsp;
                  <strong style={{ color: '#10b981' }}>{summary.clean} clean</strong> &nbsp;·&nbsp;
                  {summary.groups} groups &nbsp;·&nbsp; {summary.speed} rec/s
                </p>
                <div className="upload__success-actions">
                  <button onClick={() => navigate(auth.currentUser ? '/dashboard' : '/auth')} className="upload__btn upload__btn--primary" style={{ textDecoration: 'none', border: 'none', cursor: 'pointer' }}>
                    Open Full Dashboard →
                  </button>
                  <button className="upload__btn--text" onClick={reset}>
                    Upload another file
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UploadSection;
