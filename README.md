# Learning Companion

A production-grade, AI-powered adaptive learning platform.

## Features
- **AI Tutors**: Explanations via Google Gemini 1.5 Pro.
- **Adaptive Quizzes**: AI-generated MCQs tailored to your level.
- **Smart Evaluation**: Semantic grading for quiz responses.
- **Conversational Chat**: A context-aware chatbot tutor.
- **Personalized Path**: Topic tracking, streak tracking, and AI-powered recommendations.

## Requirements
- Python 3.10+
- Node.js 18+
- A Google Gemini API Key
- A Firebase Project (Auth & Firestore)

---

## 🛠 Setup Instructions

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

1. Copy `.env.example` to `.env` inside the `backend` folder.
2. Add your `GOOGLE_GEMINI_API_KEY`.
3. Set up a Firebase project:
   - Enable **Authentication** (Email/Password & Google Sign-In)
   - Enable **Firestore Database**
   - Go to Project Settings > Service Accounts > Generate new private key
   - Save the `.json` file to the `backend/` directory and update the path in `.env`.

### 2. Frontend Setup

```bash
cd frontend
npm install
```

1. Copy `.env.example` to `.env` in the `frontend` folder.
2. Update the `VITE_FIREBASE_*` variables with your client config.

---

## 🚀 Running Locally

You'll need two terminals.

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
API runs at `http://localhost:8000`. Swagger docs at `/docs`.

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
App runs at `http://localhost:5173`.

---

## 🧪 Testing

The backend includes a comprehensive `pytest` suite for auth, API routes, and the mocked AI engine.

```bash
cd backend
pytest -v
```

---

## 📦 Deployment Overview

**Backend (Google Cloud Run / Render / Railway):**
- Can be containerized easily using the included fastAPI standard deployment practices.
- Ensure all environment variables are securely added to the deployment environment.

**Frontend (Vercel / Firebase Hosting):**
- Ensure `VITE_API_BASE_URL` points to your production backend URL.
- Run `npm run build` and deploy the `dist/` directory.
