import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import AdminProfileCard from '../components/AdminProfileCard';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import RouteTransition from '../components/RouteTransition';

const AdminProfile = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [adminStats, setAdminStats] = useState({
        totalCourses: 0, totalStudents: 0, totalFaculty: 0, pendingRequests: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const storedUser = JSON.parse(localStorage.getItem('userInfo'));
            if (storedUser) {
                try {
                    const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };

                    // Fetch stats for AdminProfileCard
                    const [coursesRes, studentsRes, facultyRes, requestsRes] = await Promise.all([
                        axios.get(`${API_ENDPOINTS.COURSES}?limit=1`, config).catch(e => ({ data: {} })),
                        axios.get(getApiUrl('/api/auth/users?role=student'), config).catch(e => ({ data: [] })),
                        axios.get(getApiUrl('/api/auth/users?role=faculty'), config).catch(e => ({ data: [] })),
                        axios.get(API_ENDPOINTS.REQUESTS, config).catch(e => ({ data: [] }))
                    ]);

                    setAdminStats({
                        totalCourses: coursesRes.data.pagination?.total || coursesRes.data.totalCourses || coursesRes.data.courses?.length || 0,
                        totalStudents: Array.isArray(studentsRes.data) ? studentsRes.data.length : (studentsRes.data.users?.length || 0),
                        totalFaculty: Array.isArray(facultyRes.data) ? facultyRes.data.length : (facultyRes.data.users?.length || 0),
                        pendingRequests: Array.isArray(requestsRes.data) ? requestsRes.data.filter(r => r.status === 'pending').length : 0
                    });
                    setUserInfo(storedUser);
                } catch (error) {
                    console.error("Failed to fetch admin stats", error);
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
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <RouteTransition>
            <div className="min-h-screen pt-28 pb-12 px-4 bg-slate-50 dark:bg-[#030712] transition-colors duration-700 relative overflow-hidden">
                {/* HUD Background Elements */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[150px] animate-pulse-slow mix-blend-multiply dark:mix-blend-screen"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[150px] animate-pulse-slow delay-1000 mix-blend-multiply dark:mix-blend-screen"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 brightness-100 contrast-150"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex items-center justify-between"
                    >
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Admin Profile</h2>
                            <p className="text-sm font-bold text-blue-500 uppercase tracking-widest">Command Center // Identity Card</p>
                        </div>
                    </motion.div>

                    <AdminProfileCard user={userInfo} stats={adminStats} />
                </div>
            </div>
        </RouteTransition>
    );
};

export default AdminProfile;
