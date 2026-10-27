# TILSHUNOS — Advanced Language Learning Platform

[![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-10.0_LTS-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-FF5722?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

**Tilshunos** is a full-stack, production-grade language learning platform designed with **Apple × Samsung** glassmorphic aesthetics, anti-fraud learning verification, level-adapted multi-genre educational content, collaborative teacher-student workflows, a writing studio with auto-saving drafts and AI evaluations, and server-persisted device management.

---

## 🌟 Key Features & Architectural Highlights

### 1. 🛡️ Anti-Fraud Learning Verification Engine
- **No Self-Declared Mastery:** Users cannot manually mark words as "Learned".
- **Strict Verification Criterion:** A word only moves from `Planned` / `InProgress` to `Learned` after **3 consecutive correct answers** without using hints during active practice sessions.
- **Wrong Answer Penalty:** Any incorrect attempt immediately sets consecutive correct count to 0 and shifts the state to `NeedsReview`.
- **Capped Hint System:** Strict server-side ceiling of maximum **3 hints per practice session**. Attempting to request a 4th hint triggers a `400 Bad Request`.
- **Anti-Replay Protection:** Attempt IDs and practice question sessions are validated server-side to prevent duplicate score submission.

### 2. 📱 Apple × Samsung Mobile-First PWA & Device Manager
- **Server-Persisted Device Hub:** Unlike simple cookies, installations and logged-in devices are tracked in PostgreSQL (`registered_devices`).
- **Platform & OS Recognition:** Identifies desktop, tablet, and mobile platforms (iOS, Android, Windows, macOS, Linux).
- **PWA Installation Status:** Distinguishes between standard browser visits and standalone home-screen PWA installations.
- **Remote Management:** Rename devices (e.g., "Soxibjon's iPhone") and revoke/unregister stale devices directly from the user profile.

### 3. 📚 Structured Educational Library (CEFR Pre-A1 to C2)
- **Leveled Stories & News:** Switch between different CEFR versions of the same core story (e.g. A1 beginner vs. B1 intermediate).
- **Audio & Video Lessons:** Embedded audio dialogues and YouTube video drills with comprehension questions.
- **Grammar Breakdowns:** Structured grammar explanations with interactive practice checks.
- **Speaking Clubs & Community:** Integrated Telegram audio community directory and speech shadowing.

### 4. ✍️ Writing Studio & Draft Autosave
- **Genre Templates:** Essays, formal/informal letters, official requests, and traditional Uzbek *Tilxat* formats.
- **Draft Autosave:** Automatically persists drafts locally and to the backend.
- **Dual Evaluation System:** AI provides immediate preliminary rubric feedback (coherence, grammar, vocabulary, estimated score) clearly labeled with disclaimers, while certified human teachers provide formal grades and rubric feedback.

### 5. 👨‍🏫 Teacher-Student Collaboration
- **Verified Instructor Directory:** Search qualified teachers with CEFR specializations and bios.
- **Structured Connections:** Connection requests, approvals, and student roster management.
- **Task Assignments:** Teachers assign vocabulary lists, grammar quizzes, reading tasks, or writing assignments with due dates and rubric grading.

### 6. 🤖 Intelligent AI Tutor
- Real integration supporting **OpenRouter / OpenAI / Google Gemini** via transactional REST client with an integrated deterministic fallback tutor when offline.
- Context-aware explanations, CEFR-tailored dialogue practice, vocabulary breakdowns, and grammar analysis.

### 7. 👑 Operational Governance & Admin Console
- **Role-Based Access Control:** Learner, Teacher, Admin, and SuperAdmin roles.
- **CMS Publishing:** Create, publish, level-adapt, and delete learning materials.
- **Audit Logs:** Immutable audit trail recording user modifications, material additions, and administrative actions.

---

## 🗄️ Database Architecture (`tilshunos_db`)

The PostgreSQL relational schema comprises 16 normalized tables:
- `users`, `user_profiles`, `user_learning_languages`, `registered_devices`
- `personal_vocabulary_entries`, `vocabulary_practice_sessions`, `vocabulary_practice_attempts`, `published_vocabulary_collections`
- `content_groups`, `learning_materials`, `material_progress`
- `teacher_profiles`, `teacher_student_connections`, `assignments`, `assignment_submissions`
- `ai_conversations`, `ai_messages`, `in_app_notifications`, `audit_logs`

---

## 🔑 Pre-Seeded Test Accounts

| Role | Email | Password | Access / Capabilities |
|---|---|---|---|
| **Administrator** | `admin@tilshunos.app` | `Admin123!` | System stats, user governance, content CMS, audit trail |
| **Teacher** | `teacher@tilshunos.app` | `Teacher123!` | Teacher profile, student tasks, submissions review |
| **Learner** | `learner@tilshunos.app` | `Learner123!` | Notebook, practice drills, AI tutor, materials, writing |

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- [.NET 10 LTS SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+ & npm](https://nodejs.org/)
- [PostgreSQL 17+](https://www.postgresql.org/download/)

### 1. Database Setup
Ensure PostgreSQL is running locally on port `5432`:
```sql
CREATE DATABASE tilshunos_db;
```

### 2. Configure Backend (`src/LanguageLearning.Api/appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=tilshunos_db;Username=postgres;Password=password"
  },
  "Jwt": {
    "Secret": "TilshunosSuperSecretSecurityKeyWithHighEntropy2026!#",
    "Issuer": "TilshunosApp",
    "Audience": "TilshunosClients"
  }
}
```

### 3. Start Backend API Server
```powershell
dotnet run --project src/LanguageLearning.Api --urls="http://localhost:5200"
```
*The database automatically creates all tables and seeds the demo curriculum on first startup.*

### 4. Start Frontend Client
```powershell
cd frontend
npm install --legacy-peer-deps
npx vite
```
The client will launch on `http://localhost:3000/` with proxying configured to `http://localhost:5200`.

---

## 🧪 Automated Testing & Verification

### 1. Domain & Business Logic Unit Tests
Execute the .NET unit test suite:
```powershell
dotnet test tests/LanguageLearning.UnitTests
```
*Tests cover: Anti-fraud consecutive correct count, hint ceiling of 3, password hashing, and user role constraints.*

### 2. Full Integration Verification Script
Run the automated end-to-end PowerShell script:
```powershell
powershell -ExecutionPolicy Bypass -File .\test_integration.ps1
```
*Verifies: Auth token issuance, device registration, vocabulary addition, practice session creation, AI tutor reply, and admin statistics.*

### 3. Production Frontend Build
Verify TypeScript strict compilation and asset bundling:
```powershell
cd frontend
npm run build
```

---

## 📂 Project Structure

```
TILSHUNOS APP/
├── src/
│   ├── LanguageLearning.Domain/          # Core entities, Enums, anti-fraud domain logic
│   ├── LanguageLearning.Application/     # DTOs, interfaces, FluentValidation validators
│   ├── LanguageLearning.Infrastructure/  # EF Core AppDbContext, DbSeeder, JWT & AI services
│   └── LanguageLearning.Api/             # Controllers, middleware, Program.cs (.NET 10)
├── frontend/
│   ├── public/                           # Manifest.json, sw.js (PWA service worker), logos
│   ├── src/
│   │   ├── app/                          # App routing, layouts, and route guards
│   │   ├── components/                   # Navbar, MobileBottomNav, PwaInstallModal
│   │   ├── features/                     # Feature modules (auth, dashboard, vocabulary, etc.)
│   │   ├── lib/                          # api client, auth context, theme, PWA device hooks
│   │   ├── types/                        # TypeScript interfaces and domain types
│   │   ├── index.css                     # Apple × Samsung design tokens & glassmorphism
│   │   └── main.tsx                      # React 19 entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── tests/
│   └── LanguageLearning.UnitTests/       # Domain and business rules unit tests
├── test_integration.ps1                  # End-to-end integration verification script
└── README.md
```

---

## 📄 License
This project is proprietary software developed for educational and professional language learning excellence.
