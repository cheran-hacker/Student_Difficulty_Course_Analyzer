import AdminLogin from './pages/AdminLogin.jsx';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import MaintenanceGuard from './components/MaintenanceGuard';
import Navbar from './components/Navbar';
import Login from './pages/Login.jsx';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FeedbackForm from './pages/FeedbackForm';
import AdminDashboard from './pages/AdminDashboard';
import CourseAnalysis from './pages/CourseAnalysis';
import StudentDetails from './pages/StudentDetails';
import FeedbackManagement from './pages/FeedbackManagement';
import CourseManagement from './pages/CourseManagement';
import RequestManagement from './pages/RequestManagement';
import LandingPage from './pages/LandingPage';
import RegisterStudent from './pages/RegisterStudent';
import Leaderboard from './pages/Leaderboard';
import PrivateRoute from './components/PrivateRoute';
import SessionSync from './components/SessionSync';
import { ToastProvider } from './components/Toast';
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyCourseDetails from './pages/FacultyCourseDetails';
import Profile from './pages/Profile';
import AdminProfile from './pages/AdminProfile';

function AppContent() {
    const location = useLocation();
    const isRegistrationPage = location.pathname === '/admin/register-student';
    // const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    return (
        <MaintenanceGuard>
            <SessionSync />
            {!isRegistrationPage && <Navbar />}
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes: Student */}
                <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<StudentDashboard />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/feedback/:courseId" element={<FeedbackForm />} />
                </Route>

                {/* Protected Routes: Shared (Admin & Student) */}
                <Route element={<PrivateRoute allowShared={true} />}>
                    <Route path="/analysis/:courseId" element={<CourseAnalysis />} />
                </Route>

                {/* Protected Routes: Admin Only */}
                <Route element={<PrivateRoute adminOnly={true} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/student/:id" element={<StudentDetails />} />
                    <Route path="/admin/feedback-management" element={<FeedbackManagement />} />
                    <Route path="/admin/course-management" element={<CourseManagement />} />
                    <Route path="/admin/request-management" element={<RequestManagement />} />
                    <Route path="/admin/register-student" element={<RegisterStudent />} />
                    <Route path="/admin/profile" element={<AdminProfile />} />
                </Route>

                {/* Protected Routes: Faculty & Admin */}
                <Route element={<PrivateRoute allowedRoles={['faculty', 'admin']} />}>
                    <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
                    <Route path="/faculty/course/:courseId" element={<FacultyCourseDetails />} />
                </Route>

                {/* Catch All - Redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </MaintenanceGuard>
    );
}

function App() {
    return (
        <ToastProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AppContent />
            </Router>
        </ToastProvider>
    );
}

export default App;
