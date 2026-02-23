import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MegaphoneIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
    ArrowPathIcon,
    BookOpenIcon,
    ChevronRightIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';

const FacultyBroadcasts = () => {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');

    const user = JSON.parse(localStorage.getItem('userInfo'));
    const config = {
        headers: { Authorization: `Bearer ${user?.token}` }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: coursesData } = await axios.get(getApiUrl('/api/faculty/dashboard'), config);
            const activeCourses = coursesData.courses || [];
            setCourses(activeCourses);

            const allAnnouncements = await Promise.all(
                activeCourses.map(async (course) => {
                    const { data: courseAnnouncements } = await axios.get(
                        getApiUrl(`/api/courses/${course._id}/announcements`),
                        config
                    );
                    return courseAnnouncements.map(ann => ({
                        ...ann,
                        courseCode: course.code,
                        courseName: course.name,
                        courseId: course._id
                    }));
                })
            );

            const flattened = allAnnouncements.flat().sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setAnnouncements(flattened);
        } catch (error) {
            console.error('Error fetching broadcasts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token) fetchData();
    }, []);

    const filteredAnnouncements = announcements.filter(ann => {
        const matchesSearch = ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ann.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = selectedCourse === 'all' || ann.courseId === selectedCourse;
        const matchesPriority = selectedPriority === 'all' || ann.priority === selectedPriority;
        return matchesSearch && matchesCourse && matchesPriority;
    });

    if (loading) {
        return (
            <div className="min-h-screen pt-28 flex items-center justify-center dark:bg-[#030712]">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#030712] transition-colors duration-700 relative overflow-hidden">
            {/* Ultra Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[150px] animate-pulse-slow mix-blend-multiply dark:mix-blend-screen animate-light-leak"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[150px] animate-pulse-slow delay-1000 mix-blend-multiply dark:mix-blend-screen animate-light-leak" style={{ animationDelay: '-5s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 icon-glow">
                                <MegaphoneIcon className="w-8 h-8" />
                            </div>
                            <span className="text-[12px] font-black text-indigo-500 uppercase tracking-[0.4em]">Communications Archive</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Course <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient-x">Broadcasts</span>
                        </h1>
                        <p className="mt-4 text-slate-500 dark:text-gray-400 font-medium max-w-xl">
                            A comprehensive registry of all student communications issued across your active academic course portfolio.
                        </p>
                    </div>
                </div>

                {/* Filter Matrix */}
                <div className="glass-ultra rounded-[2.5rem] p-8 mb-10 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                        <div className="md:col-span-2 relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filter by keyword or title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium"
                            />
                        </div>
                        <div className="relative">
                            <BookOpenIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest appearance-none cursor-pointer"
                            >
                                <option value="all">All Courses</option>
                                {courses.map(course => (
                                    <option key={course._id} value={course._id}>{course.code}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative">
                            <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                value={selectedPriority}
                                onChange={(e) => setSelectedPriority(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest appearance-none cursor-pointer"
                            >
                                <option value="all">Any Priority</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Broadcast List */}
                <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                        {filteredAnnouncements.length > 0 ? (
                            filteredAnnouncements.map((ann, index) => (
                                <motion.div
                                    key={ann._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass-ultra rounded-[2rem] p-8 border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 transition-all duration-500 group shadow-xl hover:shadow-indigo-500/10 relative overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-xs border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                                {ann.courseCode}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ann.priority === 'urgent' ? 'bg-rose-500 text-white animate-pulse' :
                                                        ann.priority === 'high' ? 'bg-amber-500 text-white' :
                                                            'bg-indigo-500 text-white'
                                                    }`}>
                                                    {ann.priority}
                                                </span>
                                                <div className="flex items-center gap-2 text-slate-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    {new Date(ann.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {ann.title}
                                            </h3>
                                            <p className="text-slate-600 dark:text-gray-400 font-medium line-clamp-2 leading-relaxed">
                                                {ann.content}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-3 w-full md:w-auto">
                                            <button
                                                onClick={() => navigate(`/faculty/course/${ann.courseId}`)}
                                                className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2"
                                            >
                                                Course Hub
                                                <ChevronRightIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tech Ornament */}
                                    <div className="absolute bottom-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                                        <ClockIcon className="w-20 h-20" />
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-32 text-center glass-ultra rounded-[3rem] border-2 border-dashed border-slate-300 dark:border-white/10"
                            >
                                <ExclamationTriangleIcon className="w-20 h-20 mx-auto mb-6 text-slate-300 dark:text-gray-700" />
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Communications Found</h3>
                                <p className="text-slate-500 dark:text-gray-500 mt-2 font-medium">Adjust your parameters or initiate a new broadcast from the course hub.</p>
                                <button
                                    onClick={() => fetchData()}
                                    className="mt-8 px-8 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all flex items-center gap-3 mx-auto"
                                >
                                    <ArrowPathIcon className="w-5 h-5" />
                                    Reset Archive
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default FacultyBroadcasts;
