/**
 * apiClient.js — Centralized API service layer for DupliDetect
 * =============================================================
 *
 * All HTTP communication with the FastAPI backend lives here.
 * React components import only named functions from this file.
 *
 * Base URL: http://localhost:8000
 *
 * Endpoint map
 * ─────────────────────────────────────────────────────────────────────
 * UI Component/Step          Method  Endpoint               Backend fn
 * ─────────────────────────────────────────────────────────────────────
 * UploadSection (landing)    POST    /api/detect            get_embeddings
 *                                                           find_duplicates_faiss
 * Dashboard → upload         POST    /api/detect            get_embeddings
 *                                                           find_duplicates_faiss
 * Dashboard → translate      POST    /api/translate         translate_batch
 * StatsBar (live probe)      GET     /api/health            —
 * ─────────────────────────────────────────────────────────────────────
 */

import axios from 'axios';

// ── Base configuration ─────────────────────────────────────────────────────────
const BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000' 
  : window.location.origin;


const client = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000, // 2-min timeout — embeddings can be slow on first run
});

// Global response interceptor: normalise error messages
client.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && body.status === 'success' && body.data !== undefined) {
      return body.data;
    }
    if (body && body.status === 'error') {
      return Promise.reject(new Error(body.message || 'Unknown API Error'));
    }
    return body;
  },
  (err) => {
    const detail =
      err?.response?.data?.message ||
      err?.response?.data?.detail ||
      err?.message ||
      'Unknown error — is the backend running on port 8000?';
    return Promise.reject(new Error(detail));
  }
);


// ────────────────────────────────────────────────────────────────────────────────
// 1. Health check
//    Used by: StatsBar (optional live probe)
// ────────────────────────────────────────────────────────────────────────────────
export async function checkHealth() {
  return client.get('/api/health');
}


// ────────────────────────────────────────────────────────────────────────────────
// 2. Detect duplicates
//    Used by: UploadSection (landing page quick-scan)
//             Dashboard steps: upload → analyze → embeddings → similarity →
//             duplicates → clusters → confidence → visualize → export
//
//    @param {File}   file        — CSV file object from <input type="file">
//    @param {string} textColumn  — (Optional) override auto-detected text column
//    @returns {Promise<DetectResult>}
// ────────────────────────────────────────────────────────────────────────────────
export async function detectDuplicates(file, textColumn = null) {
  const form = new FormData();
  form.append('file', file);
  if (textColumn) form.append('text_column', textColumn);

  return client.post('/api/detect', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}


// ────────────────────────────────────────────────────────────────────────────────
// 3. Translate texts
//    Used by: Dashboard → Translate step
//
//    @param {string[]} texts      — array of strings to translate
//    @param {string}   targetLang — ISO 639-1 code: "hi" | "ja" | "de" | "fr" | "es" | …
//    @param {number}   maxWorkers — parallel threads (default 10)
//    @returns {Promise<TranslationResult>}
// ────────────────────────────────────────────────────────────────────────────────
export async function translateTexts(texts, targetLang, maxWorkers = 10) {
  return client.post('/api/translate', {
    texts,
    target_lang: targetLang,
    max_workers: maxWorkers,
  });
}


// ── Language code map (mirrors app.py lang_map) ──────────────────────────────
export const LANGUAGE_MAP = {
  English: 'en',
  Hindi: 'hi',
  Japanese: 'ja',
  German: 'de',
  French: 'fr',
  Spanish: 'es',
  Chinese: 'zh',
  Arabic: 'ar',
  Portuguese: 'pt',
  Russian: 'ru',
};
