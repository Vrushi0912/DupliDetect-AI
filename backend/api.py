"""
DupliDetect FastAPI Wrapper
===========================
Wraps existing model.py / utils.py / translator.py WITHOUT modifying them.
Exposes REST endpoints consumed by the React (duplidetect) frontend.

Endpoints
---------
POST /api/detect       → Dashboard steps: embeddings + duplicate detection
POST /api/translate    → Dashboard step: translate clean dataset
GET  /api/health       → Liveliness probe (StatsBar, hero live counters)
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import io
import time

# ── Import existing, unmodified core logic ─────────────────────────────────────
from model import get_embeddings
from utils import find_duplicates_faiss
from translator import translate_batch
# ──────────────────────────────────────────────────────────────────────────────

app = FastAPI(title="DupliDetect API", version="1.0.0")

# ── CORS: allow React dev server ───────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────── Models ───────────────────────────────────────────────

class TranslationRequest(BaseModel):
    texts: List[str]
    target_lang: str          # e.g. "hi", "ja", "de", "fr", "es"
    max_workers: Optional[int] = 10


# ─────────────────────── Routes ───────────────────────────────────────────────

@app.get("/api/health")
def health():
    """
    Used by: StatsBar (live counters) — always returns immediately.
    """
    return {
        "status": "success",
        "message": "API is healthy",
        "data": {
            "model": "paraphrase-multilingual-MiniLM-L12-v2"
        }
    }


@app.post("/api/detect")
async def detect_duplicates(
    file: UploadFile = File(...),
    text_column: Optional[str] = Form(None),
):
    """
    Used by: Dashboard steps — upload → analyze → embeddings → similarity →
             duplicates → clusters → confidence → visualize → export.

    Accepts: multipart/form-data  {file: <csv>, text_column?: <string>}
    Returns: JSON  {
        status, total_records, clean_records, duplicate_groups,
        languages_detected, speed_rec_per_sec,
        records: [...],       # all rows + group label
        duplicates: [...],    # only flagged rows
        clean: [...]          # de-duplicated rows
    }
    """
    if not file.filename.endswith(".csv"):
        return JSONResponse(status_code=400, content={
            "status": "error",
            "message": "Only .csv files are accepted.",
            "data": None
        })

    try:
        raw = await file.read()
        df = pd.read_csv(io.BytesIO(raw))
        t0 = time.time()

        # ── Auto-detect text column (mirrors app.py logic exactly) ────────────
        if text_column and text_column in df.columns:
            col = text_column
        elif "text" in df.columns:
            col = "text"
        else:
            col = df.columns[1]

        texts = df[col].astype(str).str.lower().str.strip().tolist()

        # ── Step 1: Embeddings (model.py — unmodified) ────────────────────────
        embeddings = get_embeddings(texts)

        # ── Step 2: Find duplicates (utils.py — unmodified) ───────────────────
        labels = find_duplicates_faiss(embeddings)

        total_time = time.time() - t0
        df["group"] = labels

        # ── Build response datasets ───────────────────────────────────────────
        all_records  = df.to_dict(orient="records")
        clean_rows   = df.drop_duplicates(subset=["group"]).drop(columns=["group"])
        dup_rows     = df[df.duplicated(subset=["group"], keep=False)].sort_values("group")
        n_groups     = len(set(labels))

        return {
            "status": "success",
            "message": "Detection completed successfully.",
            "data": {
                "text_column": col,
                "total_records": len(df),
                "clean_records": len(clean_rows),
                "duplicate_groups": n_groups,
                "languages_detected": "auto",
                "speed_rec_per_sec": round(len(df) / max(total_time, 0.001)),
                "processing_time_sec": round(total_time, 2),
                "records": all_records,
                "duplicates": dup_rows.to_dict(orient="records"),
                "clean": clean_rows.to_dict(orient="records"),
            }
        }

    except Exception as exc:
        return JSONResponse(status_code=500, content={
            "status": "error",
            "message": str(exc),
            "data": None
        })


@app.post("/api/translate")
async def translate_texts(req: TranslationRequest):
    """
    Used by: Dashboard → Translate step.

    Accepts: JSON  { texts: [...], target_lang: "hi", max_workers?: 10 }
    Returns: JSON  { status, translated_texts: [...] }
    """
    VALID_LANGS = {"en", "hi", "ja", "de", "fr", "es", "zh", "ar", "pt", "ru"}
    if req.target_lang not in VALID_LANGS:
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "message": f"Unsupported language. Choose from {sorted(VALID_LANGS)}",
                "data": None
            }
        )
    try:
        # translator.py — unmodified
        result = translate_batch(req.texts, req.target_lang, req.max_workers)
        return {
            "status": "success",
            "message": "Translation completed successfully.",
            "data": {
                "translated_texts": result
            }
        }
    except Exception as exc:
        return JSONResponse(status_code=500, content={
            "status": "error",
            "message": str(exc),
            "data": None
        })


# ── Dev entry-point ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
