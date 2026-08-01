# 🎓 MindCraft AI - AI-Powered PDF Reader, Explainer & Intelligent Question Generator

> **Full-Stack Monorepo Architecture**: Separated Express.js Node.js REST API Backend (`/backend`) + React TypeScript Vite Frontend (`/frontend`).

---

## 🌟 Key Features

- **📄 PDF Upload & Server-side Scanning**: Parse and analyze any textbook, research paper, or notes PDF.
- **💬 Interactive Chat with PDF**: Ask questions and receive context-aware answers with page citations (`[Page X]`).
- **🧠 AI Explainer & Summarizer**:
  - **3 Explanation Levels**: 🎈 **ELI5 (Simple)**, 📘 **Standard**, and 🔬 **Advanced Technical**.
  - **Multi-Language Output**: English, Kannada (ಕನ್ನಡ), Hindi (हिंदी), Spanish (Español), and French (Français).
  - **Automatic Chapter Summaries**: Section-by-section summaries with key takeaways and key term definitions.
- **⭐ Important Questions (2, 5 & 10 Marks)**:
  - Generates **18+ questions** categorized into 2-mark (definitions), 5-mark (conceptual), and 10-mark (comprehensive) categories.
  - **10-Mark Model Answers**: Structured into 5 detailed sections (Executive Summary, Equations, 5-Step Algorithmic Workflow, Real-world Applications, Advantages/Disadvantages).
  - Clean watermark & header noise sanitization (`vtucircle.com`, `Page X` stripped out).
- **📚 Question Paper Generator**: Builds university-formatted model question papers with print layout & solution hints.
- **🔥 PYQ vs PDF Trend Analyzer**: Cross-references Previous Year Question papers against study notes to generate frequency heatmaps and predicted exam questions.
- **📥 Export Capabilities**: Download summaries, question banks, and question papers as formatted **PDF** or **TXT**.

---

## 🏗️ Repository Architecture

```
AI powered pdf reader/
├── package.json              # Monorepo concurrent execution scripts
├── README.md                 # Project documentation
├── .gitignore                # Git ignore rules for node_modules & env
├── backend/                  # Node.js + Express REST API Backend
│   ├── package.json
│   ├── index.js              # Express API Server (Port 5000)
│   ├── .env.example          # Environment variables template
│   ├── routes/
│   │   └── api.js            # Express API endpoints
│   └── services/
│       ├── pdfParser.js      # Server-side pdf-parse service
│       ├── geminiService.js  # Google Gemini AI integration
│       └── nlpEngine.js      # Dynamic 18+ question generator & clean answers
└── frontend/                 # Vite + React + TypeScript Frontend
    ├── package.json
    ├── vite.config.ts        # Vite config with /api proxy to backend
    ├── index.html
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── index.css         # Tailwind v4 + Glassmorphism styling
        ├── types/index.ts
        ├── services/apiClient.ts # REST API integration client
        └── components/       # UI Components
```

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/ai-powered-pdf-reader.git
cd ai-powered-pdf-reader

# Install root dependencies
npm install

# Install backend & frontend dependencies
npm run install:all
```

### 2. Configure Environment Variables

Create `.env` in `backend/`:

```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Run Development Servers

Start both Backend (Port 5000) and Frontend (Port 5173) concurrently:

```bash
npm start
```

- **Frontend App**: `http://localhost:5173/`
- **Backend API**: `http://localhost:5000/api`
- **Backend Health Check**: `http://localhost:5000/health`

---

## 📡 REST API Endpoints Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/upload-pdf` | `POST` | Upload & extract text from PDF document (`multipart/form-data`) |
| `/api/chat` | `POST` | Ask contextual question regarding uploaded PDF |
| `/api/questions` | `POST` | Generate 18+ exam questions with 5-section model answers |
| `/api/explain` | `POST` | Generate ELI5 / Standard / Advanced explanations |
| `/api/generate-paper`| `POST` | Build university model question paper |
| `/api/pyq-compare` | `POST` | Cross-reference PYQ paper vs study notes |

---

## 📄 License

MIT License. Free to use for study, research, and educational projects.
