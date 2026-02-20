# 📘 MASTER APPLICATION REQUIREMENT MODULES
> Consolidated Specification Document for Student Analytics Platform

---

## 🟣 MODULE 1: AI PREDICTIVE ENGINE
**Status: 🚧 Partial / In-Progress**

### Core Capabilities
1.  **Difficulty Prediction Algorithm**
    *   **Input**: Syllabus text (PDF), Historic Grade distribution, Time to complete.
    *   **Output**: 1-5 Difficulty Index.
    *   **Logic**: `(Avg_Hours / 15) * 0.4 + (Fail_Rate * 10) * 0.6` (Simplified).

2.  **Sentiment Analysis Engine**
    *   **Input**: Student textual feedback.
    *   **Model**: TF-IDF / Naive Bayes (or Gemini API Integration).
    *   **Output**: Positive/Neutral/Negative classification + "Controversy Score".

3.  **Dropout Risk Detector**
    *   **Triggers**: Missing 3+ assignments, Grade drop > 15%, Login activity < 1/week.
    *   **Action**: Flag to Admin Dashboard for intervention.

---

## 🟡 MODULE 2: GAMIFICATION & REWARDS
**Status: ✅ IMPLEMENTED**

### Core Capabilities
1.  **XP (Experience Points) System**
    *   **Login**: +5 XP (Daily Cap).
    *   **Review**: +10 XP (Quick), +50 XP (Detailed > 50 chars).
    *   **Levels**:
        *   Lvl 1-5: "Fresher" to "Sophomore"
        *   Lvl 6-10: "Scholar" to "Dean's List"

2.  **Badges & Achievements**
    *   **"First Mover"**: First to review a course.
    *   **"Streaker"**: 7-day login streak.
    *   **"Top Critic"**: 50+ Upvotes on reviews.

3.  **Leaderboards**
    *   Rank students by XP within their Department/Year.

---

## 🟣 MODULE 3: SOCIAL LEARNING HUB
**Status: ✅ IMPLEMENTED**

### Core Capabilities
1.  **Real-Time Course Chat**
    *   **Tech Stack**: Socket.io + React.
    *   **Feature**: Dedicated chat room for every course ID.
    *   **Privacy**: Students only.

2.  **Study Group Finder (LFG)**
    *   **Status Indicators**: "Looking to Study", "Busy", "Online".
    *   **Grouping**: Auto-match based on Course Schedule overlap.

---

## 🟢 MODULE 4: FORTRESS SECURITY
**Status: ✅ IMPLEMENTED**

### Core Capabilities
1.  **RBAC 2.0 (Role-Based Access Control)**
    *   **Roles**: Super Admin, Course Admin, Moderator, Student.
    *   **Middleware**: `authorize('admin', 'moderator')` granular checks.

2.  **Audit Logging System**
    *   **Events**: Login, Register, Create_Course, Delete_Course, Upload_Syllabus.
    *   **Storage**: MongoDB `AuditLog` collection.
    *   **Fields**: `userId`, `action`, `ip_address`, `timestamp`, `details`.

3.  **Data Protection**
    *   **Encryption**: `bcryptjs` for passwords.
    *   **Sanitization**: `xss-clean` and `mongo-sanitize` inputs.

---

## 📂 FILE STRUCTURE MAP

```text
/server
  /models
    User.js         (Auth + Gamification Fields)
    Course.js       (Syllabus + Analytics Data)
    AuditLog.js     (Security Logs)
  /controllers
    authController.js    (Login + XP Awarding + Audit Log)
    courseController.js  (Course Mgmt + Audit Log)
  /utils
    gamification.js (XP Calculation Logic)
    auditLogger.js  (Security Logging Logic)
    
/client
  /src/pages
    CourseAnalysis.jsx  (AI Visuals + Chat Window)
    AdminDashboard.jsx  (Requirements Tab + System Health)
  /src/components
    ChatWindow.jsx      (Socket.io Chat UI)
    ThemeToggle.jsx     (UI Enhancement)
```
