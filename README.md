# Student Difficulty Course Analyzer 🎓

A comprehensive MERN stack application designed to analyze university course difficulty, predict student workload, and foster academic collaboration through gamification and social learning.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Active-success.svg)

## 🚀 Key Features

### 🧠 Predictive Analytics
- **Workload Forecasting**: AI-driven models to predict expected weekly hours based on historical data.
- **Difficulty Predictor**: Regression algorithms to estimate course difficulty relative to student GPAs.
- **Sentiment Analysis**: NLP-powered insights from course reviews.

### 🎮 Gamification & Engagement
- **XP & Leveling System**: Earn XP for contributing reviews and helping peers (Novice -> Oracle).
- **Leaderboards**: Monthly top contributor rankings.
- **Achievement Badges**: Unlock "Pioneer", "Helper", and "Dean's List" badges.

### 🤝 Social Learning Hub
- **Real-Time Discussions**: Socket.io-powered chat channels for every course.
- **Peer Upvoting**: "Helpful" tags and reputation systems.
- **Study Buddy Finder**: Matchmaking based on study habits and schedules.

### 🛡️ Enterprise-Grade Security
- **RBAC 2.0**: Granular Role-Based Access Control for students, faculty, and admins.
- **Audit Logs**: Immutable records of administrative actions.
- **Honeypot Protection**: Advanced security against bot interactions.

## 🛠️ Technology Stack

**Frontend**
- **Framework**: React (Vite)
- **Styling**: TailwindCSS, "Ultra" Glassmorphism UI
- **Animation**: Framer Motion
- **Data Viz**: Recharts

**Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Real-time**: Socket.io

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cheran-hacker/Student_Difficulty_Course_Analyzer.git
   cd Student_Difficulty_Course_Analyzer
   ```

2. **Install Dependencies**
   ```bash
   # Server
   cd server
   npm install

   # Client
   cd ../client
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `server` directory with your credentials (see `DEPLOYMENT.md` for details).

4. **Run the Application**
   ```bash
   # Run both client and server concurrently (if configured) or separate terminals:
   
   # Terminal 1 (Server)
   cd server
   npm start

   # Terminal 2 (Client)
   cd client
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
