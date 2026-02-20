import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpenIcon,
    ChatBubbleLeftRightIcon,
    StarIcon,
    ArrowTrendingUpIcon,
    PencilSquareIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
    EnvelopeIcon,
    TrophyIcon,
    DocumentArrowDownIcon,
    LockClosedIcon,
    XMarkIcon,
    CheckIcon,
    PlusIcon,
    PaperAirplaneIcon,
    MegaphoneIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getApiUrl } from '../config/api';
import FacultyAIWidget from '../components/FacultyAIWidget';
import { useToast } from '../context/ToastContext';
import { generateSemesterReport } from '../utils/reportGenerator';
import { DEPARTMENTS } from '../config/departments';
import AnnouncementFeed from '../components/AnnouncementFeed';

// --- Semantic Badge Icons ---
const BadgeIcons = {
    FolderOpenIcon: BookOpenIcon,
    MegaphoneIcon: ChatBubbleLeftRightIcon,
    StarIcon: StarIcon,
    ChatBubbleLeftRightIcon: ChatBubbleLeftRightIcon
};

// --- Helper Components ---
const StatCard = ({ title, value, icon: Icon, color, delay }) => {
    const isRating = title === "Avg Rating";
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="relative group overflow-hidden glass-ultra rounded-[2rem] p-6 transition-all duration-500 shadow-xl interaction-card holographic-shine"
        >
            <div className={`absolute -right-12 -top-12 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl group-hover:bg-${color}-500/20 transition-all duration-700`}></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl bg-${color}-50 dark:bg-${color}-500/10 text-${color}-600 dark:text-${color}-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm icon-glow`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[10px] uppercase font-black text-slate-500 dark:text-gray-400 tracking-widest">
                        <ArrowTrendingUpIcon className="w-3 h-3 text-emerald-500" />
                        <span>+12%</span>
                    </div>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                    <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter drop-shadow-sm dark:drop-shadow-lg kinetic-text">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </h3>
                    {isRating && (
                        <span className="text-lg font-bold text-slate-400 dark:text-gray-500">/ 10</span>
                    )}
                </div>
                <p className="text-[10px] font-black text-slate-500 dark:text-indigo-400/70 mt-1 uppercase tracking-[0.2em] opacity-80">{title}</p>
            </div>
        </motion.div>
    );
};

const EditCourseModal = ({ course, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: course?.name || '',
        description: course?.description || '',
        semester: course?.semester || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onUpdate(course._id, formData);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#0f1014] w-full max-w-lg rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
            >
                <div className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <PencilSquareIcon className="w-6 h-6 text-indigo-500" />
                            Edit Course
                        </h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                            <XMarkIcon className="w-6 h-6 text-slate-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Course Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Semester</label>
                            <input
                                type="text"
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white h-32 resize-none"
                            />
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Saving...' : (
                                    <>
                                        <CheckIcon className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

const RequestAccessModal = ({ onClose, onSubmit, departments }) => {
    const [formData, setFormData] = useState({
        courseCode: '',
        courseName: '',
        department: departments[0] || '',
        justification: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(formData);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#0f1014] w-full max-w-lg rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
            >
                <div className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <LockClosedIcon className="w-6 h-6 text-indigo-500" />
                            Request Course Access
                        </h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                            <XMarkIcon className="w-6 h-6 text-slate-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Course Code</label>
                            <input
                                type="text"
                                placeholder="e.g. CS101"
                                value={formData.courseCode}
                                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Course Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Introduction to Computing"
                                value={formData.courseName}
                                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Department</label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                                required
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept} className="bg-white dark:bg-[#0f1014]">{dept}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Justification</label>
                            <textarea
                                placeholder="Why do you need access to this course?"
                                value={formData.justification}
                                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white h-24 resize-none"
                                required
                            />
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Sending...' : (
                                    <>
                                        <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                                        Send Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

const EditRequestModal = ({ request, onClose, onSubmit, departments }) => {
    const [formData, setFormData] = useState({
        courseCode: request?.courseCode || '',
        courseName: request?.courseName || '',
        department: request?.department || departments[0] || '',
        justification: request?.justification || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(request._id, formData);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-[#0f1014] w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden relative holographic-shine"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
                <div className="p-8 md:p-10 relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                                <PencilSquareIcon className="w-6 h-6" />
                            </div>
                            Update Request
                        </h2>
                        <button onClick={onClose} className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
                            <XMarkIcon className="w-6 h-6 text-slate-500 dark:text-gray-400 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-indigo-400/70 tracking-[0.2em] ml-1">Code</label>
                                <input
                                    type="text"
                                    value={formData.courseCode}
                                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-slate-900 dark:text-white font-mono placeholder:text-slate-400"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-indigo-400/70 tracking-[0.2em] ml-1">Department</label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-slate-900 dark:text-white appearance-none cursor-pointer"
                                    required
                                >
                                    {departments.map(dept => (
                                        <option key={dept} value={dept} className="bg-white dark:bg-[#0f1014]">{dept}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-indigo-400/70 tracking-[0.2em] ml-1">Course Title</label>
                            <input
                                type="text"
                                value={formData.courseName}
                                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-400"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-indigo-400/70 tracking-[0.2em] ml-1">Justification</label>
                            <textarea
                                value={formData.justification}
                                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-slate-900 dark:text-white h-28 resize-none text-sm font-medium italic"
                                required
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 px-6 rounded-2xl font-black text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-sm uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] py-4 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                            >
                                {loading ? 'Syncing...' : (
                                    <>
                                        <SparklesIcon className="w-5 h-5 animate-pulse" />
                                        Update Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

const FacultyDashboard = () => {
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalFeedbacks: 0,
        avgSentiment: 0,
        avgRating: 0,
        courses: [],
        sentimentBreakdown: { teaching: 0, content: 0, assessment: 0, resources: 0 },
        gamification: { impactScore: 0, badges: [], level: 1 }
    });
    const [atRiskStudents, setAtRiskStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInsights, setShowInsights] = useState(false); // Insights Modal State
    const [editingCourse, setEditingCourse] = useState(null); // Edit Course Modal State
    const [showRequestModal, setShowRequestModal] = useState(false); // Request Course Modal State
    const [editingRequest, setEditingRequest] = useState(null); // Edit Request Modal State
    const [courseRequests, setCourseRequests] = useState([]); // Faculty's own course requests

    const navigate = useNavigate();
    const { addToast } = useToast();
    const user = JSON.parse(localStorage.getItem('userInfo'));

    // Memoized state for charts to reduce re-renders during theme switching
    const sentimentData = useMemo(() => [
        { subject: 'Teaching', A: stats?.sentimentBreakdown?.teaching || 0 },
        { subject: 'Content', A: stats?.sentimentBreakdown?.content || 0 },
        { subject: 'Assessment', A: stats?.sentimentBreakdown?.assessment || 0 },
        { subject: 'Resources', A: stats?.sentimentBreakdown?.resources || 0 },
    ], [stats?.sentimentBreakdown]);

    const fetchDashboardData = async () => {
        if (!user) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            // Parallel Fetch
            const [statsRes, atRiskRes, requestsRes] = await Promise.all([
                axios.get(getApiUrl('/api/faculty/dashboard'), config),
                axios.get(getApiUrl('/api/faculty/at-risk'), config),
                axios.get(getApiUrl('/api/faculty/my-requests'), config)
            ]);

            setStats(statsRes.data);
            setAtRiskStudents(atRiskRes.data);
            setCourseRequests(requestsRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            addToast('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token) {
            console.log('[FacultyDashboard] Fetching data...');
            fetchDashboardData();
        }
    }, [user?.token, addToast]);

    // --- Interaction Handlers ---

    const handleGenerateReport = async () => {
        addToast('Generating Semester Report...', 'info');
        try {
            await generateSemesterReport(stats, user);
            addToast('Report downloaded successfully!', 'success');
        } catch (err) {
            console.error(err);
            addToast('Failed to generate report', 'error');
        }
    };

    const handleInsightsToggle = () => {
        setShowInsights(!showInsights);
    };

    const handleEmailStudent = (studentEmail) => {
        window.location.href = `mailto:${studentEmail}`;
        addToast(`Opened mail client for ${studentEmail}`, 'info');
    };

    const handleEditCourse = (course) => {
        setEditingCourse(course);
    };

    const handleUpdateCourse = async (courseId, updatedData) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.put(getApiUrl(`/api/courses/${courseId}`), updatedData, config);
            addToast('Course updated successfully', 'success');
            setEditingCourse(null);
            fetchDashboardData(); // Refresh data
        } catch (error) {
            console.error('Error updating course:', error);
            addToast('Failed to update course', 'error');
        }
    };

    const handleRequestCourse = async (requestData) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.post(getApiUrl('/api/faculty/request-access'), requestData, config);
            addToast('Request sent successfully! Admin will review it.', 'success');
            setShowRequestModal(false);
            fetchDashboardData();
        } catch (error) {
            console.error('Error requesting course:', error);
            addToast(error.response?.data?.message || 'Failed to send request', 'error');
        }
    };

    const handleUpdateRequest = async (requestId, updatedData) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.put(getApiUrl(`/api/faculty/request/${requestId}`), updatedData, config);
            addToast('Request updated successfully', 'success');
            setEditingRequest(null);
            fetchDashboardData();
        } catch (error) {
            console.error('Error updating request:', error);
            addToast(error.response?.data?.message || 'Failed to update request', 'error');
        }
    };

    const handleDeleteRequest = async (requestId) => {
        if (!window.confirm('Are you sure you want to retract this request?')) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.delete(getApiUrl(`/api/faculty/request/${requestId}`), config);
            addToast('Request retracted', 'success');
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting request:', error);
            addToast(error.response?.data?.message || 'Failed to delete request', 'error');
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f1014] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-50 to-slate-50 dark:from-indigo-900/20 dark:via-[#0f1014] dark:to-[#0f1014]"></div>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="relative z-10 w-24 h-24 rounded-full border-t-4 border-r-4 border-indigo-600 dark:border-indigo-500 border-b-4 border-transparent border-l-4 border-indigo-200 dark:border-indigo-500/30"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#0f1014] text-slate-900 dark:text-white font-sans relative overflow-hidden selection:bg-indigo-500/30">
            {/* Ultra Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[150px] animate-pulse-slow mix-blend-multiply dark:mix-blend-screen animate-light-leak"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[150px] animate-pulse-slow delay-1000 mix-blend-multiply dark:mix-blend-screen animate-light-leak" style={{ animationDelay: '-5s' }}></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 brightness-100 contrast-150"></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-10 relative z-10 pb-20">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest shadow-sm icon-glow">
                                Faculty Portal v2.0
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 animate-gradient-x">{user?.name?.split(' ')[0]}</span>
                        </h1>
                        <p className="mt-4 text-lg text-slate-600 dark:text-gray-400 max-w-2xl leading-relaxed font-medium">
                            Your centralized command center for monitoring course efficacy and student engagement metrics.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleGenerateReport}
                            className="relative px-6 py-3.5 rounded-2xl bg-indigo-600 text-white font-black shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1 transition-all flex items-center gap-3 group text-xs uppercase tracking-[0.2em] overflow-hidden border-beam-container"
                        >
                            <div className="border-beam"></div>
                            <DocumentArrowDownIcon className="w-5 h-5 group-hover:animate-bounce relative z-10" />
                            <span className="relative z-10">Export Report</span>
                        </button>
                        <button
                            onClick={handleInsightsToggle}
                            className={`px-6 py-3.5 rounded-2xl font-black border transition-all flex items-center gap-3 backdrop-blur-md text-xs uppercase tracking-[0.2em] specular-glow ${showInsights ? 'bg-white/20 border-white/30 text-indigo-600 dark:text-white' : 'bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-slate-700 dark:text-white border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-white/20'}`}
                        >
                            <SparklesIcon className={`w-5 h-5 ${showInsights ? 'text-indigo-600 dark:text-indigo-400 animate-pulse' : 'text-yellow-500 dark:text-yellow-400'}`} />
                            Insights
                        </button>
                    </div>
                </motion.div>

                {/* Insights Panel (Conditionally Rendered) */}
                <AnimatePresence>
                    {showInsights && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, mb: 0 }}
                            animate={{ opacity: 1, height: 'auto', mb: 20 }}
                            exit={{ opacity: 0, height: 0, mb: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 backdrop-blur-xl border border-indigo-200 dark:border-indigo-500/30 rounded-[2rem] p-8 shadow-2xl relative">
                                <div className="absolute top-4 right-4 cursor-pointer p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors" onClick={() => setShowInsights(false)}>
                                    <XMarkIcon className="w-6 h-6 text-slate-500 dark:text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                                    AI-Powered Insights
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                                        <h4 className="font-bold text-indigo-600 dark:text-indigo-300 mb-2">Student Engagement</h4>
                                        <p className="text-sm text-slate-600 dark:text-gray-300">Engagement in "Data Structures" has dropped by <span className="text-red-500 dark:text-red-400">5%</span> this week. Consider releasing a quick quiz.</p>
                                    </div>
                                    <div className="p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                                        <h4 className="font-bold text-purple-600 dark:text-purple-300 mb-2">Topic Difficulty</h4>
                                        <p className="text-sm text-slate-600 dark:text-gray-300">Multiple students flagged "Recursion" as difficult. A remedial session is recommended.</p>
                                    </div>
                                    <div className="p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                                        <h4 className="font-bold text-emerald-600 dark:text-emerald-300 mb-2">Positive Trends</h4>
                                        <p className="text-sm text-slate-600 dark:text-gray-300">Satisfaction with "Database Design" teaching methods is up directly following the last workshop.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Gamification Badge Section - Ultra Glass */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-white/60 dark:bg-white/5 backdrop-blur-3xl border border-slate-200 dark:border-white/10 p-8 md:p-12 shadow-2xl interaction-card"
                >
                    {/* Inner Glow */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10">
                        <div className="flex items-center gap-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-amber-400 dark:bg-amber-500 blur-2xl opacity-20 rounded-full"></div>
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 dark:from-yellow-400 dark:to-amber-600 p-[2px] shadow-2xl relative z-10">
                                    <div className="w-full h-full rounded-full bg-slate-50 dark:bg-[#0f1014] flex items-center justify-center border-4 border-slate-50 dark:border-[#0f1014]">
                                        <TrophyIcon className="w-10 h-10 text-yellow-500 dark:text-yellow-500 drop-shadow-md" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Impact Level {stats?.gamification?.level || 1}</h2>
                                <p className="text-slate-600 dark:text-gray-400 max-w-lg font-medium text-lg">
                                    You are in the top <span className="text-emerald-500 dark:text-emerald-400 font-bold">5%</span> of faculty this semester.
                                    Keep engaging to unlock the "Master Educator" tier.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 md:gap-16 w-full xl:w-auto overflow-x-auto pb-4 xl:pb-0 custom-scrollbar">
                            {/* Impact Score */}
                            <div className="text-center min-w-[120px]">
                                <div className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm dark:drop-shadow-2xl">{stats?.gamification?.impactScore || 0}</div>
                                <div className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-2">Impact Score</div>
                            </div>

                            <div className="w-px h-20 bg-gradient-to-b from-transparent via-slate-300 dark:via-white/10 to-transparent hidden md:block"></div>

                            {/* Badges */}
                            <div className="flex gap-5">
                                {stats?.gamification?.badges?.map((badge, i) => {
                                    const BIcon = BadgeIcons[badge.icon] || StarIcon;
                                    return (
                                        <div key={i} className="group relative">
                                            <div className={`w-16 h-16 rounded-2xl bg-${badge.color}-100 dark:bg-${badge.color}-500/10 border border-${badge.color}-200 dark:border-${badge.color}-500/20 flex items-center justify-center text-${badge.color}-500 dark:text-${badge.color}-400 group-hover:bg-${badge.color}-200 dark:group-hover:bg-${badge.color}-500/20 group-hover:scale-110 group-hover:shadow-md dark:group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300 cursor-help`}>
                                                <BIcon className="w-8 h-8" />
                                            </div>
                                            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-black/80 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap shadow-xl z-50 pointer-events-none">
                                                {badge.name}
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!stats?.gamification?.badges || stats.gamification.badges.length === 0) && (
                                    <div className="flex items-center gap-3 text-slate-400 dark:text-gray-500 italic text-sm font-medium">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center">
                                            <LockClosedIcon className="w-6 h-6 opacity-30" />
                                        </div>
                                        <span>No badges yet</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Active Courses"
                        value={stats?.totalCourses || 0}
                        icon={BookOpenIcon}
                        color="indigo"
                        delay={0.1}
                    />
                    <StatCard
                        title="Total Reviews"
                        value={stats?.totalFeedbacks || 0}
                        icon={ChatBubbleLeftRightIcon}
                        color="purple"
                        delay={0.2}
                    />
                    <StatCard
                        title="Avg Sentiment"
                        value={stats?.avgSentiment || '0.00'}
                        icon={StarIcon}
                        color="amber"
                        delay={0.3}
                    />
                    <StatCard
                        title="Avg Rating"
                        value={stats?.avgRating || '0.0'}
                        icon={ArrowTrendingUpIcon}
                        color="emerald"
                        delay={0.4}
                    />
                </div>

                {/* Global Announcements Widget for Faculty */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-ultra rounded-[2.5rem] p-8 md:p-10 shadow-2xl holographic-shine relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 tracking-tight">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 icon-glow">
                                    <MegaphoneIcon className="w-7 h-7" />
                                </div>
                                Recent Communications
                            </h2>
                            <p className="text-slate-500 dark:text-gray-400 mt-2 font-medium">Broadcasts across your active courses.</p>
                        </div>
                        <button
                            onClick={() => navigate('/faculty/announcements')}
                            className="px-6 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-sm border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                        >
                            View All Broadcasts
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {stats?.courses?.slice(0, 3).map((course, idx) => (
                            <div key={course._id} className="bg-white/40 dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/10">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{course.code}</span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                                </div>
                                <AnnouncementFeed courseId={course._id} limit={1} title="" />
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Courses Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                <BookOpenIcon className="w-7 h-7" />
                            </div>
                            Assigned Courses
                        </h2>
                        <button
                            onClick={() => setShowRequestModal(true)}
                            className="px-5 py-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-slate-700 dark:text-white font-bold text-sm transition-all flex items-center gap-2"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Request Access
                        </button>
                    </div>

                    {/* Course Requests Subsection (Addressing user query) */}
                    {courseRequests && courseRequests.length > 0 && courseRequests.some(r => r.status === 'pending') && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-10 p-8 bg-white/40 dark:bg-white/5 border border-amber-500/20 rounded-[2.5rem] backdrop-blur-3xl shadow-xl shadow-amber-500/5"
                        >
                            <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 mb-6 flex items-center gap-3 tracking-tight">
                                <div className="p-2 rounded-lg bg-amber-500/10">
                                    <SparklesIcon className="w-5 h-5 animate-pulse" />
                                </div>
                                Pending Course Requests
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courseRequests.filter(r => r.status === 'pending').map(req => (
                                    <motion.div
                                        layout
                                        key={req._id}
                                        className="group p-6 rounded-3xl bg-white/60 dark:bg-white/5 border border-amber-500/10 hover:border-amber-500/40 hover:bg-white/80 dark:hover:bg-white/10 transition-all shadow-lg hover:shadow-xl relative overflow-hidden holographic-shine"
                                    >
                                        <div className="flex flex-col gap-4 relative z-10">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                                                    <span className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-[0.2em]">Deployment Pending</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEditingRequest(req); }}
                                                        className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                                        title="Edit Request"
                                                    >
                                                        <PencilSquareIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteRequest(req._id); }}
                                                        className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                        title="Retract Request"
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-tight mb-1">{req.courseName}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-indigo-300 bg-slate-100 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">{req.courseCode}</span>
                                                    <span className="text-[11px] font-bold text-slate-400 dark:text-gray-500 tracking-wider">/</span>
                                                    <span className="text-[11px] font-bold text-slate-400 dark:text-gray-500 tracking-wider uppercase">{req.department}</span>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                                                <p className="text-[10px] text-slate-500 dark:text-gray-400 italic line-clamp-1">"{req.justification}"</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stats?.courses?.length > 0 ? (
                            stats.courses.map((course, index) => (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + (index * 0.1) }}
                                    className="group relative bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 hover:border-indigo-500/30 transition-all duration-500 overflow-hidden hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] hover:-translate-y-2 cursor-pointer"
                                    onClick={() => navigate(`/faculty/course/${course._id}`)}
                                >
                                    {/* Hover Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="px-3 py-1.5 rounded-lg bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-300">
                                                {course.code}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">Active</span>
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 min-h-[4rem]">
                                            {course.name}
                                        </h3>

                                        <div className="flex items-center gap-4 py-6 border-t border-slate-200 dark:border-white/5 mt-4">
                                            <div className="flex -space-x-3">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white dark:border-[#0f1014] bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-700 dark:text-white font-bold ring-2 ring-slate-100 dark:ring-white/5">
                                                        {String.fromCharCode(65 + i)}
                                                    </div>
                                                ))}
                                                <div className="w-9 h-9 rounded-full border-2 border-white dark:border-[#0f1014] bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] text-slate-600 dark:text-white font-bold ring-2 ring-slate-100 dark:ring-white/5">
                                                    +{course.studentCount > 3 ? course.studentCount - 3 : 0}
                                                </div>
                                            </div>
                                            <span className="text-sm text-slate-500 dark:text-gray-400 font-bold">
                                                {course.studentCount || 0} Students
                                            </span>
                                        </div>

                                        <div className="flex gap-3 mt-4" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => navigate(`/faculty/course/${course._id}`)}
                                                className="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-600/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                            >
                                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                                View Analytics
                                            </button>
                                            <button
                                                onClick={() => handleEditCourse(course)}
                                                className="px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-white/5"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full py-24 text-center bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-slate-300 dark:border-white/10"
                            >
                                <BookOpenIcon className="w-20 h-20 mx-auto mb-6 text-slate-400 dark:text-gray-800" />
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">No courses assigned</h3>
                                <p className="text-slate-500 dark:text-gray-500 mt-2 font-medium">Contact administrator to assign courses to your profile.</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Main Content Grid: Chart & At-Risk */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Sentiment Analysis */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="lg:col-span-2 glass-ultra rounded-[2.5rem] p-8 md:p-10 shadow-2xl holographic-shine relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-4 tracking-tight relative z-10">
                            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 icon-glow">
                                <SparklesIcon className="w-7 h-7" />
                            </div>
                            Predictive Sentiment Analysis
                        </h3>
                        <div className="h-80 w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sentimentData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="subject" type="category" width={100} tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 900, className: 'text-slate-500 dark:text-indigo-400/60 uppercase tracking-widest' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(15, 16, 20, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', color: '#fff', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}
                                        cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 12 }}
                                        itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                                    />
                                    <Bar dataKey="A" barSize={32} radius={[0, 12, 12, 0]}>
                                        {sentimentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#6366f1', '#a855f7', '#f59e0b', '#10b981'][index % 4]} className="drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Right: At-Risk Students */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-ultra rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl group holographic-shine"
                    >
                        {/* Red GloW */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none group-hover:bg-rose-500/20 transition-all duration-700"></div>

                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4 relative z-10 tracking-tight">
                            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 icon-glow animate-pulse">
                                <ExclamationTriangleIcon className="w-7 h-7" />
                            </div>
                            Critical Attention
                        </h3>

                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                            {atRiskStudents.length === 0 ? (
                                <div className="text-center py-16 text-slate-500 dark:text-gray-500 bg-white/50 dark:bg-white/5 rounded-[2rem] border border-slate-200 dark:border-white/5 relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="block text-5xl mb-4 group-hover:scale-125 transition-transform">✨</span>
                                    <p className="font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest text-xs">All Students Optimized</p>
                                    <p className="text-[10px] mt-2 text-slate-500 dark:text-indigo-400/40 font-bold uppercase tracking-widest">Efficiency 100%</p>
                                </div>
                            ) : (
                                atRiskStudents.map(student => (
                                    <div key={student._id} className="flex flex-col gap-3 p-5 rounded-3xl bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 hover:bg-white/80 dark:hover:bg-white/10 transition-all group cursor-pointer shadow-sm hover:shadow-xl relative overflow-hidden" onClick={() => handleEmailStudent(student.email)}>
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-110 transition-transform ${student.riskData?.riskLevel === 'High' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-500' :
                                                student.riskData?.riskLevel === 'Moderate' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-500' :
                                                    'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500'
                                                }`}>
                                                {student.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-base font-black text-slate-800 dark:text-white truncate tracking-tight uppercase">{student.name}</h4>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${student.riskData?.riskLevel === 'High' ? 'bg-rose-500 text-white animate-pulse' :
                                                        student.riskData?.riskLevel === 'Moderate' ? 'bg-amber-500 text-white' :
                                                            'bg-indigo-500 text-white'
                                                        }`}>
                                                        {student.riskData?.riskLevel} Risk
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(student.riskData?.probability || 0) * 100}%` }}
                                                            className={`h-full rounded-full ${student.riskData?.probability > 0.7 ? 'bg-rose-500' :
                                                                student.riskData?.probability > 0.4 ? 'bg-amber-500' :
                                                                    'bg-indigo-500'
                                                                }`}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400">
                                                        {Math.round((student.riskData?.probability || 0) * 100)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {student.riskData?.factors && student.riskData.factors.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-1 relative z-10">
                                                {student.riskData.factors.map((factor, idx) => (
                                                    <span key={idx} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/5 uppercase tracking-tighter">
                                                        {factor.replace(/_/g, ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-3 rounded-xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20">
                                                <EnvelopeIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
            <FacultyAIWidget />

            <AnimatePresence>
                {editingCourse && (
                    <EditCourseModal
                        course={editingCourse}
                        onClose={() => setEditingCourse(null)}
                        onUpdate={handleUpdateCourse}
                    />
                )}
            </AnimatePresence>

            {/* Request Access Modal */}
            <AnimatePresence>
                {showRequestModal && (
                    <RequestAccessModal
                        onClose={() => setShowRequestModal(false)}
                        onSubmit={handleRequestCourse}
                        departments={DEPARTMENTS}
                    />
                )}
            </AnimatePresence>

            {/* Edit Request Modal */}
            <AnimatePresence>
                {editingRequest && (
                    <EditRequestModal
                        request={editingRequest}
                        onClose={() => setEditingRequest(null)}
                        onSubmit={handleUpdateRequest}
                        departments={DEPARTMENTS}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default FacultyDashboard;
