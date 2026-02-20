import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpenIcon, FolderIcon, TrashIcon, ArrowTopRightOnSquareIcon, MagnifyingGlassIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { getApiUrl } from '../config/api';

const SyllabusManager = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchCoursesWithSyllabus = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.get(getApiUrl('/api/courses?limit=1000'), {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            const coursesWithSyllabus = (data.courses || []).filter(c => c.syllabus && c.syllabus.path);
            setCourses(coursesWithSyllabus);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoursesWithSyllabus();
    }, []);

    const handleDeleteSyllabus = async (courseId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.delete(getApiUrl(`/api/courses/${courseId}/syllabus`), {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setDeleteConfirm(null);
            fetchCoursesWithSyllabus();
        } catch (error) {
            console.error(error);
            alert('Failed to delete syllabus');
        }
    };

    const filteredCourses = courses.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 glass-ultra p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 tracking-tighter kinetic-text">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 icon-glow">
                            <FolderIcon className="w-8 h-8" />
                        </div>
                        Digital Resource Vault
                    </h2>
                    <p className="text-slate-500 dark:text-gray-400 text-sm font-bold mt-2 uppercase tracking-[0.2em] opacity-80 dark:opacity-70">Centralized Syllabus & Academic Repository</p>
                </div>

                <div className="relative group w-full lg:w-96 relative z-10">
                    <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors duration-300" />
                    <input
                        type="text"
                        placeholder="Search Repository..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-7 py-5 bg-black/5 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 font-bold backdrop-blur-xl"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-32">
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                    </div>
                </div>
            ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredCourses.map((course, idx) => (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5, delay: idx * 0.05, type: "spring" }}
                                className="group glass-ultra rounded-[3rem] p-8 border border-white/5 hover:border-indigo-500/40 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(99,102,241,0.15)] relative overflow-hidden interaction-card holographic-shine h-full flex flex-col"
                            >
                                <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500/5 rounded-full blur-[60px] group-hover:bg-indigo-500/10 transition-colors duration-700"></div>

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="p-4 rounded-[1.5rem] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 icon-glow shadow-inner">
                                        <BookOpenIcon className="w-8 h-8" />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="px-4 py-1.5 rounded-xl bg-white/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 group-hover:border-indigo-500/30 transition-colors">
                                            {course.code}
                                        </span>
                                        {course.syllabus?.difficultyLevel && (
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${course.syllabus.difficultyLevel === 'Hard' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                                'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                }`}>
                                                {course.syllabus.difficultyLevel}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="relative z-10 flex-grow">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-400 dark:group-hover:text-indigo-400 transition-colors tracking-tight leading-tight">{course.name}</h3>
                                    <p className="text-indigo-600/70 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-90 dark:opacity-60">{course.department}</p>

                                    {course.syllabus?.detectedKeywords && (
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {course.syllabus.detectedKeywords.slice(0, 4).map((kw, i) => (
                                                <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-200/50 dark:bg-black/40 text-slate-700 dark:text-gray-400 text-[9px] font-black border border-slate-300/30 dark:border-white/5 group-hover:border-indigo-500/20 transition-all uppercase">
                                                    {kw.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 relative z-10 pt-6 border-t border-white/5">
                                    <div className="flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 group-hover:border-indigo-500/20 transition-all shadow-inner">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse"></div>
                                            <span className="text-xs text-slate-600 dark:text-gray-300 font-black truncate max-w-[140px] uppercase tracking-wider">
                                                {course.syllabus.originalName}
                                            </span>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => {
                                                const uploadPath = course.syllabus.path.replace(/\\/g, '/');
                                                window.open(getApiUrl(`/${uploadPath}`), '_blank');
                                            }}
                                            className="p-3 rounded-2xl bg-indigo-500 text-white hover:bg-indigo-400 transition-all shadow-[0_10px_20px_rgba(99,102,241,0.3)] border border-white/20"
                                        >
                                            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                        </motion.button>
                                    </div>

                                    <motion.button
                                        whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.2)" }}
                                        onClick={() => setDeleteConfirm(course._id)}
                                        className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] border border-red-500/20 hover:border-red-500/50 transition-all flex items-center justify-center gap-3"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Purge Resource
                                    </motion.button>
                                </div>

                                {/* Delete Confirmation Overlay */}
                                <AnimatePresence>
                                    {deleteConfirm === course._id && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 z-20 bg-[#0f1014]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                                        >
                                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
                                                <ExclamationCircleIcon className="w-10 h-10 text-red-500" />
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight kinetics-text">Purge this resource?</h4>
                                            <p className="text-gray-400 text-xs font-bold mb-8 uppercase tracking-widest leading-relaxed">This action cannot be undone and will disconnect the syllabus from {course.code}.</p>
                                            <div className="flex flex-col w-full gap-3">
                                                <button
                                                    onClick={() => handleDeleteSyllabus(course._id)}
                                                    className="w-full py-4 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-600/30 border border-white/10"
                                                >
                                                    Confirm Purge
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(null)}
                                                    className="w-full py-4 rounded-2xl bg-white/5 text-gray-400 font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 border border-white/5 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-32 glass-ultra rounded-[4rem] border border-white/5 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-28 h-28 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-inner group">
                            <ExclamationCircleIcon className="w-14 h-14 text-indigo-400/30 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-500" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter kinetic-text">Laboratory Empty</h3>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.4em] opacity-60">Zero encrypted resources detected.</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default SyllabusManager;
