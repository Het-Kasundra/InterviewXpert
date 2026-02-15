# 🎓 InterviewXpert – AI-Powered Interview Preparation Platform

> An AI-driven mock interview platform that simulates real technical interviews with dynamic questions, real-time evaluation, and intelligent performance analytics.

---

## 🚀 Overview

**InterviewXpert** is a full-stack AI-powered platform designed to help students and professionals prepare for technical interviews in a realistic and structured way.

Powered by **Meta Llama 3.3 (70B)** via the **A4F API**, the platform delivers adaptive mock interviews, automated code evaluation, instant AI feedback, and detailed performance insights — all within a modern, responsive web experience.

---

## ✨ Core Features

### 🧠 AI-Powered Mock Interviews
- Dynamic question generation based on role & difficulty
- Supports MCQs, theoretical Q&A, coding challenges, and debugging rounds
- Timer-based sessions to simulate real interview pressure
- Adaptive questioning powered by AI

---

### 📊 Intelligent Evaluation System
- Automated grading based on:
  - Accuracy  
  - Clarity  
  - Completeness  
- Real-time code execution & test case validation
- Detailed AI-generated improvement suggestions
- Structured performance scoring

---

### 📈 Performance Analytics & Career Tracking
- Personal dashboard with statistics & insights
- Interview history with trend analysis
- Session-based performance comparison
- Calendar scheduling for upcoming interviews

---

### 🔐 Authentication & Security
- Secure authentication via Supabase
- JWT-based session handling
- Row-Level Security (RLS) for complete data isolation
- Protected API architecture

---

## 🛠️ Tech Stack

### 🎨 Frontend
- **React 19 (Vite 7)**
- **TypeScript 5.8**
- **Tailwind CSS**
- **Framer Motion**
- React Router DOM
- Lucide React & Remix Icons

---

### ⚙️ Backend
- **Node.js**
- **Express.js**
- **Supabase (PostgreSQL 15+)**
- RESTful APIs with CORS & Helmet security
- AI Integration via A4F API (Meta Llama 3.3 70B)

---

### 🧰 Dev Tools
- Vite (SWC)
- ESLint & Prettier
- Git & GitHub

---

## 📂 Project Structure

```
interview_expert/
│
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # Global state (Auth, Theme)
│   ├── lib/             # Utilities & services
│   ├── pages/           # Application routes
│   └── styles/          # Tailwind global styles
│
├── server/
│   └── index.js         # Express backend server
│
└── supabase/            # Database migrations & types
```

---

# ⚡ Getting Started

## 📌 Prerequisites

Ensure you have:

- Node.js (v18 or higher)
- npm or yarn
- A Supabase project
- An A4F API Key

---

## 🚀 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/interview-expert.git
cd interview-expert
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
A4F_API_KEY=your_a4f_api_key
A4F_BASE_URL=https://api.a4f.co/v1
PORT=3001
VITE_API_BASE_URL=http://localhost:3001
```

---

## ▶️ Running the Project

### Run Frontend & Backend Together

```bash
npm run dev:full
```

---

### Or Run Separately

#### Terminal 1 – Frontend

```bash
npm run dev
```

#### Terminal 2 – Backend

```bash
npm run server
```

---

# 🔮 Future Roadmap (Phase II)

- 🚀 Advanced Gamification (XP system, Leaderboards, Daily Streaks)
- ⚔️ Challenge Arena (Competitive coding battles)
- 🗂 Project Portfolio Section
- 📄 AI Resume Analyzer (ATS compatibility checker)
- 📱 Progressive Web App (Offline + Mobile-first experience)
- 🌍 Multi-language interview support

---

# 🎯 Vision

InterviewXpert aims to bridge the gap between preparation and real-world interviews by combining AI intelligence with structured evaluation and analytics — helping candidates build confidence, clarity, and competence.

---

# 📜 License

This project is built for educational and portfolio purposes.

---

⭐ If you found this project useful, consider giving it a star.
