<div align="center">
  <h1>🚀 DupliDetect</h1>
  <p><b>An AI-Powered Duplicate Detection & Multilingual Translation System</b></p>

  <!-- Badges -->
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-green?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/AI-PyTorch-ee4c2c?style=for-the-badge&logo=pytorch" alt="PyTorch" />
  <img src="https://img.shields.io/badge/Vector%20Search-FAISS-ff69b4?style=for-the-badge" alt="FAISS" />
</div>

<br />

## 📖 Introduction
**DupliDetect** is a full-stack, enterprise-grade AI system designed for extreme precision in detecting duplicate text records. Built with a modern **React** frontend and a robust **Python (FastAPI)** backend, it leverages state-of-the-art Natural Language Processing (`Sentence-Transformers`) and lightning-fast vector similarity search (`FAISS`) to seamlessly cluster contextual duplicates across multiple languages.

## ✨ Key Features
- **🧠 Advanced AI Processing**: Semantic clustering using state-of-the-art transformer models (`paraphrase-multilingual-MiniLM-L12-v2`).
- **⚡ Blazing Fast Search**: Uses Facebook's FAISS for ultra-fast, high-dimensional vector similarity detection.
- **🌍 Multilingual Translation**: Native support to translate overlapping datasets across multiple languages (English, Hindi, Japanese, French, etc.) via a batch-translated pipeline.
- **📊 Interactive UI Dashboard**: Modern, responsive React components styled with TailwindCSS, providing real-time data insights, charts, and table visualizations.
- **📥 Seamless Data Flow**: Upload your raw CSV dataset, and securely analyze, visualize, and export the deduplicated data with a single click.

## 🏗 Architecture Overview
DupliDetect efficiently separates concerns between the user interface and the AI engine.

- **Frontend (`frontend/`)**: A single-page application built with React, consuming REST APIs for real-time state management.
- **Backend (`backend/`)**: A FastAPI microservice wrapper around our AI inference scripts.
  1. **Upload**: Receives uploaded data via HTTP requests.
  2. **Process**: Embeds textual column(s) into dense vector representations.
  3. **Detect**: Clusters semantically similar vectors via FAISS.
  4. **Deliver**: Returns enriched analytics payloads to the React dashboard.

## 📂 Folder Structure
The repository is intuitively split into two primary environments:

```text
📦 DupliDetect
 ┣ 📂 frontend/                    # React Frontend Interface
 ┃ ┣ 📂 public/                   
 ┃ ┣ 📂 src/                      
 ┃ ┣ 📜 package.json              
 ┃ ┗ ...
 ┗ 📂 backend/                     # Python FastAPI / AI Backend
   ┣ 📜 api.py                     # FastAPI REST Endpoints
   ┣ 📜 app.py                     # Legacy Streamlit App
   ┣ 📜 model.py                   # Embedding & Transformer Logic
   ┣ 📜 translator.py              # Deep Translation Module
   ┣ 📜 utils.py                   # FAISS & Deduplication Operations
   ┣ 📜 requirements.txt        
   ┗ ...
```

## ⚙️ Environment Requirements

Before running the application locally, ensure your system meets the following requirements:
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher
- **Python**: v3.9+
- **Machine**: Standard CPU (FAISS-CPU) or CUDA-enabled GPU (PyTorch Native Support)

## 🚀 Installation Guide

Follow these step-by-step instructions to get the application running smoothly on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/Vrushi0912/DupliDetect-AI.git
cd DupliDetect-AI
```

## 🌐 Deployment Guide (Recommended)

To handle large AI models and high-performance React hosting, we recommend the following split:

### A. Backend (Render)
1. **Create a New Web Service** on [Render](https://render.com).
2. Connect this GitHub repository.
3. Render will detect the `backend/Dockerfile` automatically.
4. **Important**: Set the **Root Directory** to `backend` in the Render dashboard settings.
5. Once deployed, copy your Render URL (e.g., `https://your-app.onrender.com`).

### B. Frontend (Vercel)
1. **Create a New Project** on [Vercel](https://vercel.com).
2. Connect this GitHub repository.
3. In the "Project Settings":
   - Set **Root Directory** to `frontend`.
   - Add an **Environment Variable**: 
     - Key: `REACT_APP_API_URL`
     - Value: `https://your-app.onrender.com` (Your Render URL)
4. Deploy!

## 🚀 Local Installation
### 2. Backend Setup (AI Engine)
Navigate to the backend directory, install the required packages, and start the FastAPI server.

```bash
# Step A: Navigate to the backend application folder
cd backend

# Step B: Create and activate a Virtual Environment (Recommended)
# For Mac/Linux:
python -m venv venv
source venv/bin/activate
# For Windows:
python -m venv venv
venv\Scripts\activate

# Step C: Install the AI and server dependencies
pip install -r requirements.txt

# Step D: Start the backend local server
uvicorn api:app --reload
```
*✨ The API server is now live at: `http://localhost:8000`*

### 3. Frontend Setup (React UI)
Open a **new terminal window** or tab, navigate to the frontend directory, and run the developer client.

```bash
# Step A: Navigate to the frontend directory
cd frontend

# Step B: Install node dependencies
npm install

# Step C: Start the React development server
npm start
```
*✨ The web interface will launch automatically at: `http://localhost:3000`*

## 💡 Usage Instructions

1. **Launch the Dashboard:** Open `http://localhost:3000` in your web browser.
2. **Upload Dataset:** Click the upload area and drop in a `.csv` file. Ensure there is a column containing textual data (the system handles detection of conventional column names like `text`).
3. **Run Detection:** Click **"Process Dataset"**. The UI will display a loading stage while the FastAPI server calculates high-dimensional embeddings and executes semantic deduping.
4. **Review Results:** Engage with the interactive tables and insightful cards showing total records analyzed, amount of duplicates clustered, and API processing speeds.
5. **Download Clean Data:** Once reviewed, seamlessly download the deduplicated CSV file.
6. **(Optional) Translate records:** Run your isolated datasets through the translation pipeline step via the UI.

## 🔌 API Endpoints
An overview of the REST API endpoints securely facilitating data transmission.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | System health check and liveliness probe for UI verification. |
| `/api/detect` | `POST` | Core Engine: Ingests file, computes embeddings, detects duplicates, and clusters results. |
| `/api/translate` | `POST` | Asynchronously batch-translates an array of textual entries to a designated target language. |


## 📸 Screenshots
*(Coming soon — Feel free to add interactive interface screenshots right here once deployed!)*
> **Tip:** Add images visualizing the Dashboard, File Upload flow, and The Data Tables structure to provide context at a glance.

## 🤝 Contributing Guide

Whether you're developing new internal AI models or enhancing the developer experience, we'd love your contributions! 

1. **Fork the repository** to your personal GitHub account.
2. Create a fresh branch: `git checkout -b feature/awesome-new-capability`
3. Make your changes and commit: `git commit -m "Add amazing functionality"`
4. Push the branch upstream: `git push origin feature/awesome-new-capability`
5. Open a **Pull Request**.

*(Please verify that no native Python AI processing logic within `model.py` or `utils.py` fails its existing unit tests prior to pull requests.)*

## 🔮 Future Improvements
- [ ] Migrate the React application to **Next.js** for SSR support.
- [ ] Enable **Docker** configuration via `docker-compose` to run the stack seamlessly.
- [ ] Setup a background queue runner (Celery or RQ) for massive (`>100k+` entry) datasets.

## 📄 License
This project is comfortably licensed under the [MIT License](LICENSE). Feel free to use, reuse, and build upon it!

---
<div align="center">
  <b>Built with 💙 for the Open Source Community.</b>
</div>
