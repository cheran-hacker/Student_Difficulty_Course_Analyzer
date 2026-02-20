import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import StudentProfileCard from '../components/StudentProfileCard';
import AdminProfileCard from '../components/AdminProfileCard';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import RouteTransition from '../components/RouteTransition';

const Profile = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [adminStats, setAdminStats] = useState({
        totalCourses: 0, totalStudents: 0, totalFaculty: 0, pendingRequests: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const storedUser = JSON.parse(localStorage.getItem('userInfo'));
            if (storedUser) {
                if (storedUser.role === 'student') {
                    try {
                        const config = {
                            headers: { Authorization: `Bearer ${storedUser.token}` }
                        };
                        const { data } = await axios.get(getApiUrl(`/api/student/dashboard`), config);
                        const updatedUser = { ...storedUser, ...data.student };
                        setUserInfo(updatedUser);
                        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                    } catch (error) {
                        console.error("Failed to fetch fresh student profile data", error);
                        setUserInfo(storedUser);
                    }
                } else if (storedUser.role === 'faculty') {
                    try {
                        const config = {
                            headers: { Authorization: `Bearer ${storedUser.token}` }
                        };
                        const { data } = await axios.get(getApiUrl(`/api/faculty/dashboard`), config);
                        const updatedUser = {
                            ...storedUser,
                            rating: data.avgRating,
                            impact: data.gamification?.impactScore,
                            totalCourses: data.totalCourses,
                            totalFeedbacks: data.totalFeedbacks,
                            badges: data.gamification?.badges || []
                        };
                        setUserInfo(updatedUser);
                    } catch (error) {
                        console.error("Failed to fetch fresh faculty profile data", error);
                        setUserInfo(storedUser);
                    }
                } else if (storedUser.role === 'admin') {
                    try {
                        const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
                        const [coursesRes, studentsRes, facultyRes, requestsRes] = await Promise.all([
                            axios.get(`${API_ENDPOINTS.COURSES}?limit=1`, config),
                            axios.get(getApiUrl('/api/auth/users?role=student'), config),
                            axios.get(getApiUrl('/api/auth/users?role=faculty'), config),
                            axios.get(API_ENDPOINTS.REQUESTS, config)
                        ]);

                        setAdminStats({
                            totalCourses: coursesRes.data.totalCourses || coursesRes.data.courses?.length || 0,
                            totalStudents: studentsRes.data.length || 0,
                            totalFaculty: facultyRes.data.length || 0,
                            pendingRequests: requestsRes.data.filter(r => r.status === 'pending').length
                        });
                        setUserInfo(storedUser);
                    } catch (error) {
                        console.error("Failed to fetch admin stats", error);
                        setUserInfo(storedUser);
                    }
                } else {
                    setUserInfo(storedUser);
                }
            }
            setLoading(false);
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#030712]">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <RouteTransition>
            <div className="min-h-screen pt-28 pb-12 px-4 bg-slate-50 dark:bg-[#030712] transition-colors duration-700 relative overflow-hidden">
                {/* Ultra Ambient Background */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[150px] animate-pulse-slow mix-blend-multiply dark:mix-blend-screen animate-light-leak"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[150px] animate-pulse-slow delay-1000 mix-blend-multiply dark:mix-blend-screen animate-light-leak" style={{ animationDelay: '-5s' }}></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 brightness-100 contrast-150"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    {userInfo?.role === 'admin' ? (
                        <AdminProfileCard user={userInfo} stats={adminStats} />
                    ) : (
                        <StudentProfileCard user={userInfo} />
                    )}
                </div>
            </div>
        </RouteTransition>
    );
};

export default Profile;
