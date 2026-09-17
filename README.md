# IntervueLive — AI-Powered Resume-Based Real-Time Interview Platform

**IntervueLive** is a professional full-stack web application designed for conducting real-time technical software interviews. Candidates upload their resumes (PDF/DOCX) to extract technical skills and projects. The platform leverages LLM AI APIs to auto-generate customized interview questions and provides a collaborative interview room featuring a live Monaco code editor, Socket.IO real-time chat, synchronized timer, presence tracking, and post-interview AI feedback reports.

---

## Technical Stack

- **Frontend**: React.js (Vite), Tailwind CSS (Monochromatic SaaS theme), Monaco Editor (`@monaco-editor/react`), Recharts, Lucide Icons, Socket.IO Client.
- **Backend**: Node.js, Express.js, Socket.IO, Multer, `pdf-parse`, `mammoth`.
- **Database**: MongoDB & Mongoose (with automatic `mongodb-memory-server` fallback for zero-configuration local execution).
- **Authentication**: JWT & bcryptjs password hashing with role-based access (`candidate` & `interviewer`).
- **AI Integration**: Google Gemini API (`@google/generative-ai`) for resume extraction, question generation, and candidate feedback reports (with fallback heuristic parser when offline/no API key).

---

## Features

1. **Monochrome SaaS Interface**: Modern grey/white minimal aesthetic with zero emojis and clean typography.
2. **Resume Analysis & Extraction**: Parse skills, frameworks, internships, projects, and technologies from PDF and DOCX files.
3. **AI Question Generation**: Automatically generates categorized questions (`Technical`, `Project`, `Programming`, `Behavioral`, `HR`).
4. **Room ID System**: Interviewers create unique room codes (e.g., `INT-8F42K`) to share with candidates.
5. **Real-Time Synchronized Room**:
   - Live presence indicator (Online/Offline status).
   - Instant WebSocket chat with message history.
   - Synchronized question switching.
   - Synchronized interview countdown timer with pause/start controls.
   - Monaco Live Code Editor supporting JavaScript, Python, and Java with real-time code submission.
6. **Post-Interview AI Report**: Performance breakdown charts using Recharts, key strengths, improvement areas, recommended study topics, and detailed Q&A logs.

---

## Project Structure

```
IntervueLive/
├── server/
│   ├── config/          # Database connection (MongoDB + Memory Server fallback)
│   ├── controllers/     # Auth, Resume, Interview, Feedback controllers
│   ├── middleware/      # JWT verification & Multer file upload validation
│   ├── models/          # User, Resume, Interview, Question, ChatMessage, Feedback schemas
│   ├── routes/          # REST API route definitions
│   ├── services/        # resumeService, aiService (Gemini API)
│   ├── socket/          # interviewSocket.js (Socket.IO event handlers)
│   ├── .env.example
│   └── server.js        # Server entry point
│
├── client/
│   ├── src/
│   │   ├── components/  # Navbar, Footer, ProtectedRoute
│   │   ├── context/     # AuthContext, SocketContext
│   │   ├── pages/       # LandingPage, LoginPage, RegisterPage, CandidateDashboard,
│   │   │                # InterviewerDashboard, ResumeUploadPage, InterviewCreatePage,
│   │   │                # InterviewRoom, InterviewReportPage
│   │   ├── services/    # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
└── README.md
```

---

## Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0+
- **NPM**: v9.0+

### 2. Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Environment Configuration (`.env`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/intervuelive
   JWT_SECRET=intervuelive_secret_jwt_key_2026_super_secure
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: If `GEMINI_API_KEY` is omitted, the app will use its built-in fallback parser to generate questions).*

3. Run Server:
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Start Development Server:
   ```bash
   npm run dev
   ```
3. Open browser at: `http://localhost:5173`

---

## REST API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (`candidate` / `interviewer`) |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated profile details |
| `POST` | `/api/resumes/upload` | Upload PDF/DOCX resume file & extract profile |
| `GET` | `/api/resumes/my-resume` | Get uploaded resume & extracted skills |
| `POST` | `/api/interviews` | Create interview room & auto-generate AI questions |
| `GET` | `/api/interviews` | List scheduled & past interviews |
| `GET` | `/api/interviews/room/:roomId` | Fetch interview session by Room ID (e.g. `INT-8F42K`) |
| `PUT` | `/api/interviews/question/:id/response` | Save candidate answer & Monaco code submission |
| `GET` | `/api/feedback/:interviewId` | Generate & retrieve AI post-interview report |

---

## Socket.IO Real-Time Events

- `joinRoom` / `presenceUpdate`: Manages room joining and participant online/offline states.
- `sendMessage` / `receiveMessage`: Live chat messaging.
- `sendQuestion` / `receiveQuestion`: Synchronized active question navigation across interviewer & candidate.
- `startTimer` / `pauseTimer` / `timerTick`: Synchronized countdown timer.
- `codeUpdate` / `codeSubmit`: Real-time Monaco code editing & code submission sync.
- `endInterview`: State transition to finished evaluation report.
