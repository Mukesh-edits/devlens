# 🔍 DevLens

> **AI-powered GitHub repository analysis and codebase chat platform**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-devlens--blush.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://devlens-blush.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)

---

## ✨ What is DevLens?

DevLens lets you drop any public GitHub repository URL and instantly get:

- 📊 **Deep quality analysis** — documentation, testing, CI/CD, security, community health scored out of 100
- 🔍 **Language breakdown** — visual chart of every language used with percentages
- 🛡️ **Security audit** — detects exposed secrets, missing licenses, no CI/CD, inactive repos
- 💬 **AI chat with the codebase** — ask anything about the code, architecture, or how things work using RAG (Retrieval-Augmented Generation)

---

## 🚀 Live Demo

👉 **[https://devlens-blush.vercel.app](https://devlens-blush.vercel.app)**

1. Sign up for a free account
2. Paste any public GitHub repo URL
3. Click **Analyze** to get a full quality report
4. Click **Index Repository** to enable AI chat
5. Ask anything about the codebase!

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, JWT Auth, Octokit (GitHub API) |
| **ML Service** | Python, FastAPI, LangChain, Google Gemini, Pinecone |
| **Database** | MongoDB Atlas |
| **Deployment** | Vercel (frontend), Render (backend + ML) |

---

## 🧠 How the AI Chat Works

1. When you index a repo, the ML service **fetches all code files** from GitHub
2. Files are **chunked and embedded** using Google Gemini embeddings
3. Embeddings are stored in **Pinecone** vector database
4. When you ask a question, the system finds the most relevant code chunks (RAG)
5. **Gemini LLM** generates a detailed answer grounded in the actual code

---

## 📁 Project Structure

```
devlens/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── pages/          # Landing, Dashboard, RepoDetail, Chat
│   │   ├── components/     # Reusable UI components
│   │   └── utils/          # Axios config
│   └── vercel.json         # Vercel routing config
│
├── server/                 # Node.js + Express backend
│   ├── controllers/        # repoController, authController
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   └── server.js
│
└── ml_service/             # Python FastAPI ML service
    ├── main.py             # FastAPI app, /index and /chat endpoints
    └── requirements.txt
```

---

## ⚙️ Running Locally

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB running locally
- GitHub Token, Gemini API Key, Pinecone API Key

### 1. Clone the repo
```bash
git clone https://github.com/Mukesh-edits/devlens.git
cd devlens
```

### 2. Backend
```bash
cd server
npm install
# create .env with MONGO_URI, JWT_SECRET, GITHUB_TOKEN, ML_SERVICE_URL
npm run dev
```

### 3. ML Service
```bash
cd ml_service
python -m venv venv
source venv/Scripts/activate  # Windows
pip install -r requirements.txt
# create .env with GEMINI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX, GITHUB_TOKEN
uvicorn main:app --reload
```

### 4. Frontend
```bash
cd client
npm install
# create .env with VITE_API_URL=http://localhost:5000/api
npm run dev
```

---

## 🔑 Environment Variables

### Server (`server/.env`)
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GITHUB_TOKEN=your_github_token
ML_SERVICE_URL=http://localhost:8000
```

### ML Service (`ml_service/.env`)
```env
GEMINI_API_KEY=your_gemini_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=devlens-embeddings
GITHUB_TOKEN=your_github_token
OPENROUTER_API_KEY=your_openrouter_key
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📊 Quality Score Breakdown

DevLens scores repositories across 5 dimensions:

| Category | Max Score | What's Checked |
|----------|-----------|----------------|
| Documentation | 25 pts | README, description, CONTRIBUTING, CHANGELOG |
| Testing | 20 pts | Test files, test coverage ratio |
| DevOps | 15 pts | CI/CD pipelines, Dockerfile |
| Community | 15 pts | Contributors, topics, recent activity |
| License | 5 pts | License file presence |

---

## 👨‍💻 Author

Built by **Mukesh Kumar** — [GitHub](https://github.com/Mukesh-edits)

---

## 📄 License

MIT License — feel free to use, modify, and distribute.