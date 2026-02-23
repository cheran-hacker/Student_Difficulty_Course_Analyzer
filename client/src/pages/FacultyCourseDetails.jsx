import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeftIcon,
    ChatBubbleLeftRightIcon,
    PencilSquareIcon,
    StarIcon,
    ExclamationTriangleIcon,
    SparklesIcon,
    CheckCircleIcon,
    MegaphoneIcon,
    FolderOpenIcon,
    PlusIcon,
    LinkIcon,
    DocumentTextIcon,
    ClockIcon,
    UserGroupIcon,
    BookOpenIcon,
    TrashIcon,
    ArrowTopRightOnSquareIcon,
    EnvelopeIcon,
    CloudArrowUpIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import { useToast } from '../context/ToastContext';

const FacultyCourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [resources, setResources] = useState([]);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('feedbacks'); // feedbacks, announcements, resources, syllabus, students

    // Forms State
    const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
    const [showResourceForm, setShowResourceForm] = useState(false);
    const [syllabusFile, setSyllabusFile] = useState(null);
    const [uploadingSyllabus, setUploadingSyllabus] = useState(false);

    // New Data State
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'normal' });
    const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
    const [newResource, setNewResource] = useState({ title: '', description: '', fileUrl: '', fileType: 'link' });
    const [editingResourceId, setEditingResourceId] = useState(null);

    const [courseAnalytics, setCourseAnalytics] = useState(null);

    const user = JSON.parse(localStorage.getItem('userInfo'));
    const config = {
        headers: { Authorization: `Bearer ${user?.token}` }
    };

    const fetchAllData = async () => {
        try {
            const [courseRes, studentsRes, feedbacksRes, announcementsRes, resourcesRes, analyticsRes] = await Promise.all([
                axios.get(getApiUrl(`/api/courses/${courseId}`), config),
                axios.get(getApiUrl(`/api/courses/${courseId}/students`), config),
                axios.get(getApiUrl(`/api/faculty/course/${courseId}/feedbacks`), config),
                axios.get(getApiUrl(`/api/courses/${courseId}/announcements`), config),
                axios.get(getApiUrl(`/api/faculty/course/${courseId}/resources`), config),
                axios.get(getApiUrl(`/api/faculty/analytics/course/${courseId}`), config)
            ]);

            setCourse(courseRes.data);
            setStudents(studentsRes.data);
            setFeedbacks(feedbacksRes.data);
            setAnnouncements(announcementsRes.data);
            setResources(resourcesRes.data);
            setCourseAnalytics(analyticsRes.data);
        } catch (error) {
            console.error(error);
            addToast('Failed to load course data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token) fetchAllData();
    }, [courseId]);


    // --- Handlers ---

    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        try {
            if (editingAnnouncementId) {
                await axios.put(getApiUrl(`/api/faculty/announcement/${editingAnnouncementId}`), newAnnouncement, config);
                addToast('Announcement updated!', 'success');
            } else {
                await axios.post(getApiUrl('/api/faculty/announcement'), { courseId, ...newAnnouncement }, config);
                addToast('Announcement posted!', 'success');
            }
            setShowAnnouncementForm(false);
            setEditingAnnouncementId(null);
            setNewAnnouncement({ title: '', content: '', priority: 'normal' });
            // Refresh announcements
            const { data } = await axios.get(getApiUrl(`/api/courses/${courseId}/announcements`), config);
            setAnnouncements(data);
        } catch (error) {
            addToast(editingAnnouncementId ? 'Failed to update announcement' : 'Failed to post announcement', 'error');
        }
    };

    const handleDeleteAnnouncement = async (annId) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await axios.delete(getApiUrl(`/api/faculty/announcement/${annId}`), config);
            addToast('Announcement deleted', 'success');
            setAnnouncements(prev => prev.filter(a => a._id !== annId));
        } catch (error) {
            addToast('Failed to delete announcement', 'error');
        }
    };

    const handleEditAnnouncement = (ann) => {
        setNewAnnouncement({ title: ann.title, content: ann.content, priority: ann.priority });
        setEditingAnnouncementId(ann._id);
        setShowAnnouncementForm(true);
    };

    const handleUploadResource = async (e) => {
        e.preventDefault();
        try {
            if (editingResourceId) {
                await axios.put(getApiUrl(`/api/faculty/resource/${editingResourceId}`), newResource, config);
                addToast('Resource updated!', 'success');
            } else {
                await axios.post(getApiUrl('/api/faculty/resource'), { courseId, ...newResource }, config);
                addToast('Resource shared!', 'success');
            }
            setShowResourceForm(false);
            setEditingResourceId(null);
            setNewResource({ title: '', description: '', fileUrl: '', fileType: 'link' });
            // Refresh resources
            const { data } = await axios.get(getApiUrl(`/api/faculty/course/${courseId}/resources`), config);
            setResources(data);
        } catch (error) {
            addToast(editingResourceId ? 'Failed to update resource' : 'Failed to share resource', 'error');
        }
    };

    const handleDeleteResource = async (resId) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;
        try {
            await axios.delete(getApiUrl(`/api/faculty/resource/${resId}`), config);
            addToast('Resource removed', 'success');
            setResources(prev => prev.filter(r => r._id !== resId));
        } catch (error) {
            addToast('Failed to delete resource', 'error');
        }
    };

    const handleEditResource = (res) => {
        setNewResource({ title: res.title, description: res.description, fileUrl: res.fileUrl, fileType: res.fileType });
        setEditingResourceId(res._id);
        setShowResourceForm(true);
    };

    const handleSyllabusUpload = async (e) => {
        e.preventDefault();
        if (!syllabusFile) return;

        const formData = new FormData();
        formData.append('syllabus', syllabusFile);

        setUploadingSyllabus(true);
        try {
            await axios.post(getApiUrl(`/api/courses/${courseId}/syllabus`), formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            addToast('Syllabus uploaded successfully', 'success');
            setSyllabusFile(null);
            // Refresh course info
            const { data } = await axios.get(getApiUrl(`/api/courses/${courseId}`), config);
            setCourse(data);
        } catch (error) {
            console.error(error);
            addToast('Failed to upload syllabus', 'error');
        } finally {
            setUploadingSyllabus(false);
        }
    };

    const handleDeleteSyllabus = async () => {
        if (!window.confirm('Are you sure you want to delete the syllabus?')) return;
        try {
            await axios.delete(getApiUrl(`/api/courses/${courseId}/syllabus`), config);
            addToast('Syllabus deleted', 'info');
            // Refresh course info
            const { data } = await axios.get(getApiUrl(`/api/courses/${courseId}`), config);
            setCourse(data);
        } catch (error) {
            addToast('Failed to delete syllabus', 'error');
        }
    };

    const handleEmailStudent = (email) => {
        window.location.href = `mailto:${email}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f1014] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0f1014] to-[#0f1014]"></div>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="relative z-10 w-24 h-24 rounded-full border-t-4 border-r-4 border-indigo-500 border-b-4 border-transparent border-l-4 border-indigo-500/30"
                />
            </div>
        );
    }

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all relative overflow-hidden text-[10px] uppercase tracking-[0.2em] shadow-lg ${activeTab === id
                ? 'text-white'
                : 'text-slate-500 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/5'
                }`}
        >
            {activeTab === id && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-600 shadow-xl shadow-indigo-600/40 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
            <span className="relative z-10 flex items-center gap-2">
                <Icon className={`w-4 h-4 transition-transform duration-300 ${activeTab === id ? 'scale-110' : 'group-hover:scale-110'}`} />
                {label}
            </span>
        </button>
    );

    return (
        <div className="min-h-screen pt-28 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#0f1014] text-slate-900 dark:text-white font-sans relative overflow-hidden selection:bg-indigo-500/30 transition-colors duration-500">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow-reverse"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 dark:opacity-20 pointer-events-none"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                {/* Navigation Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-12">
                    <button
                        onClick={() => navigate('/faculty/dashboard')}
                        className="flex items-center gap-2 text-slate-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-all group font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm"
                    >
                        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Portal Overview
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest shadow-sm">
                            Syllabus Intelligence OS v0.8
                        </span>
                    </div>
                </motion.div>

                {/* Course Header */}
                <div className="mb-12">
                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight drop-shadow-sm">
                        {course?.name} <span className="text-indigo-600 dark:text-indigo-400">{course?.code}</span>
                    </h2>
                    <p className="mt-4 text-[10px] font-black text-slate-500 dark:text-indigo-300 uppercase tracking-[0.4em] backdrop-blur-sm">
                        Curriculum Meta-Analysis + Student Voice Mining + Resource Engineering
                    </p>
                </div>

                {/* Tab Buttons */}
                <div className="flex gap-2 p-2 bg-white dark:bg-white/5 rounded-[2rem] md:backdrop-blur-2xl border border-slate-200 dark:border-white/5 shadow-2xl dark:shadow-inner overflow-x-auto max-w-full holographic-shine mb-12">
                    <TabButton id="feedbacks" label="Insights" icon={ChatBubbleLeftRightIcon} />
                    <TabButton id="syllabus" label="Syllabus" icon={BookOpenIcon} />
                    <TabButton id="students" label="Registry" icon={UserGroupIcon} />
                    <TabButton id="announcements" label="Broadcast" icon={MegaphoneIcon} />
                    <TabButton id="resources" label="Assets" icon={FolderOpenIcon} />
                </div>

                {/* Tab Content */}
                <div className="min-h-[500px]">

                    {/* --- FEEDBACK TAB --- */}
                    {activeTab === 'feedbacks' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-6"
                        >
                            {/* Course Risk Profile Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tighter">
                                                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 icon-glow">
                                                    <SparklesIcon className="w-5 h-5" />
                                                </div>
                                                Risk Intelligence
                                            </h3>
                                            <p className="text-[10px] text-slate-500 dark:text-indigo-300 font-black uppercase tracking-[0.2em] mt-2">Predictive Neural Dropout Analysis</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 specular-glow">
                                                {courseAnalytics ? Math.round(((courseAnalytics.riskDistribution?.critical || 0) / (courseAnalytics.totalStudents || 1)) * 100) : 0}%
                                            </div>
                                            <div className="text-[9px] text-slate-400 dark:text-indigo-300 font-black uppercase tracking-[0.4em] opacity-40">Aggregate Risk</div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {[
                                            { label: 'High Risk', count: courseAnalytics?.riskDistribution?.critical || 0, color: 'bg-rose-500', icon: ExclamationTriangleIcon },
                                            { label: 'Moderate Risk', count: courseAnalytics?.riskDistribution?.moderate || 0, color: 'bg-amber-500', icon: ClockIcon },
                                            { label: 'Stable', count: courseAnalytics?.riskDistribution?.low || 0, color: 'bg-emerald-500', icon: CheckCircleIcon }
                                        ].map((risk, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex justify-between items-end px-1">
                                                    <span className="text-xs font-black text-slate-600 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                                        <risk.icon className={`w-3.5 h-3.5 ${risk.label === 'High Risk' ? 'text-rose-500' : 'text-slate-400 dark:text-gray-400'}`} />
                                                        {risk.label}
                                                    </span>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">{risk.count} Students</span>
                                                </div>
                                                <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex shadow-inner">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${courseAnalytics?.totalStudents > 0 ? (risk.count / courseAnalytics.totalStudents) * 100 : 0}%` }}
                                                        transition={{ duration: 1, delay: idx * 0.2 }}
                                                        className={`h-full ${risk.color} shadow-[0_0_10px_rgba(0,0,0,0.2)]`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                                    <div className="relative z-10 h-full flex flex-col justify-between">
                                        <div>
                                            <div className="p-3 w-fit rounded-2xl bg-white/20 backdrop-blur-md mb-6">
                                                <SparklesIcon className="w-6 h-6 text-white" />
                                            </div>
                                            <h4 className="text-2xl font-black leading-tight mb-2">AI Retention Strategy</h4>
                                            <p className="text-indigo-50 text-sm font-medium leading-relaxed">
                                                Based on recent activity peaks, sending an announcement regarding "Week 4 Resources" could reduce moderate risk by ~12%.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('announcements')}
                                            className="mt-8 w-full py-4 bg-white text-indigo-900 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                                        >
                                            Execute Guidance
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 flex justify-between items-center backdrop-blur-2xl transition-all hover:bg-white/60 dark:hover:bg-slate-900/60 shadow-sm">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                        <SparklesIcon className="w-6 h-6 text-amber-500 dark:text-amber-400" /> Student Voices
                                    </h3>
                                    <p className="text-slate-600 dark:text-indigo-200 font-medium mt-1">Real-time feedback collected from students.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {feedbacks.length > 0 ? (
                                    feedbacks.map((item, index) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={item._id}
                                            className="group relative bg-white dark:bg-[#0a0a0a]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-6 hover:border-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                                        >
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border border-white/10 shadow-inner">
                                                        {item.student?.name?.[0] || 'S'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{item.student?.name || 'Anonymous'}</p>
                                                        <p className="text-xs text-slate-500 dark:text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                {item.sentimentScore !== undefined && (
                                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${item.sentimentScore >= 70 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.1)]' :
                                                        item.sentimentScore >= 40 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.1)]' :
                                                            'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.1)]'
                                                        }`}>
                                                        {item.sentimentScore >= 70 ? 'Positive' : item.sentimentScore >= 40 ? 'Neutral' : 'Critical'}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="relative z-10">
                                                <p className="text-slate-600 dark:text-gray-300 italic text-sm leading-relaxed mb-4">"{item.comments}"</p>

                                                <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                                    <div className="flex items-center gap-1 text-amber-500">
                                                        <StarIcon className="w-4 h-4 fill-current" />
                                                        <span className="text-sm font-black text-slate-900 dark:text-white">{item.rating || 'N/A'}</span>
                                                    </div>
                                                    {item.categories && item.categories.length > 0 && (
                                                        <div className="flex gap-2">
                                                            {item.categories.map((cat, i) => (
                                                                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-white/5">
                                                                    {cat}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 dark:text-gray-500 bg-white/40 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                                        <ChatBubbleLeftRightIcon className="w-12 h-12 mb-4 opacity-50" />
                                        <p>No feedback collected yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* --- SYLLABUS TAB --- */}
                    {activeTab === 'syllabus' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white/60 dark:bg-[#0a0a0a]/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-xl"
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                        <BookOpenIcon className="w-8 h-8 text-indigo-500" /> Syllabus Management
                                    </h3>
                                    <p className="text-slate-500 dark:text-gray-300 mt-2 text-lg">Manage the course syllabus and automated topic extraction.</p>
                                </div>
                            </div>

                            {course?.syllabus && course?.syllabus?.path ? (
                                <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-8 border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                            <DocumentTextIcon className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{course.syllabus.originalName}</h4>
                                            <p className="text-slate-500 dark:text-gray-500 text-sm mb-3">Uploaded on {course.syllabus.uploadedAt ? new Date(course.syllabus.uploadedAt).toLocaleDateString() : 'N/A'}</p>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                                                <CheckCircleIcon className="w-3.5 h-3.5" /> Processed & Analyzed
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => window.open(getApiUrl(`/${course.syllabus.path.replace(/\\/g, '/')}`), '_blank')}
                                            className="p-4 rounded-xl bg-white dark:bg-white/5 text-slate-600 dark:text-white hover:bg-indigo-50 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-slate-200 dark:border-white/5 shadow-sm"
                                        >
                                            <ArrowTopRightOnSquareIcon className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={handleDeleteSyllabus}
                                            className="p-4 rounded-xl bg-rose-50 dark:bg-red-500/10 text-rose-600 dark:text-red-500 hover:bg-rose-500 dark:hover:bg-red-500 hover:text-white transition-all border border-rose-100 dark:border-red-500/20 shadow-sm"
                                        >
                                            <TrashIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] p-16 text-center bg-slate-50/[0.3] dark:bg-white/[0.02] hover:bg-slate-50/[0.5] dark:hover:bg-white/[0.04] transition-colors group cursor-pointer relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
                                    <div className="relative z-10">
                                        <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 border border-slate-200 dark:border-white/5 group-hover:border-indigo-500/30 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] shadow-sm">
                                            <CloudArrowUpIcon className="w-12 h-12 text-slate-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">No Syllabus Uploaded</h4>
                                        <p className="text-slate-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Upload a PDF syllabus to automatically generate topics and workload estimates for this course.</p>

                                        <form onSubmit={handleSyllabusUpload} className="max-w-sm mx-auto flex flex-col gap-4">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => setSyllabusFile(e.target.files[0])}
                                                className="block w-full text-sm text-slate-500 dark:text-gray-400
                                                    file:mr-4 file:py-3 file:px-6
                                                    file:rounded-full file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-indigo-50 dark:file:bg-indigo-500/10 file:text-indigo-600 dark:file:text-indigo-400
                                                    hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/20
                                                    file:cursor-pointer cursor-pointer
                                                "
                                            />
                                            <button
                                                type="submit"
                                                disabled={!syllabusFile || uploadingSyllabus}
                                                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                                            >
                                                {uploadingSyllabus ? 'Analyzing...' : 'Upload & Analyze Syllabus'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* --- STUDENTS TAB --- */}
                    {activeTab === 'students' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    <UserGroupIcon className="w-8 h-8 text-indigo-500" /> Enrolled Students
                                    <span className="px-3 py-1 bg-indigo-50 dark:bg-white/10 rounded-full text-sm text-indigo-600 dark:text-gray-300 font-bold border border-indigo-100 dark:border-white/5">{students.length}</span>
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {students.length > 0 ? (
                                    students.map((student, i) => (
                                        <motion.div
                                            key={student._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="glass-ultra rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all group holographic-shine relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                            <div className="flex items-center gap-5 relative z-10">
                                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500 relative overflow-hidden ${student.riskData?.riskLevel === 'High' ? 'bg-rose-500 text-white' :
                                                    student.riskData?.riskLevel === 'Moderate' ? 'bg-amber-500 text-white' :
                                                        'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                                    }`}>
                                                    <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                                                    <span className="relative z-10">{student.name.charAt(0)}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <h4 className="font-black text-slate-900 dark:text-white text-lg truncate group-hover:text-indigo-500 transition-colors uppercase tracking-tight">{student.name}</h4>
                                                        {student.riskData && (
                                                            <span className={`text-[8px] font-black px-2 py-1 rounded-lg border uppercase tracking-widest shadow-sm ${student.riskData.riskLevel === 'High' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse' :
                                                                student.riskData.riskLevel === 'Moderate' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                                }`}>
                                                                {student.riskData.riskLevel}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] text-slate-400 dark:text-indigo-300 font-black font-mono tracking-widest">{student.studentId || 'NO_ID'}</p>
                                                        {student.riskData && (
                                                            <span className="text-[10px] font-black text-indigo-500 specular-glow">
                                                                {Math.round(student.riskData.probability * 100)}% RISK
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {student.riskData?.factors?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {student.riskData.factors.slice(0, 3).map((f, idx) => (
                                                        <span key={idx} className="text-[8px] font-bold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-1.5 py-0.5 rounded uppercase">
                                                            {f.split('_').pop()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="border-t border-white/5 pt-4 flex justify-between items-center mt-auto">
                                                <div className="flex flex-col">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border mb-1 w-fit ${student.academicPerformance === 'Excellent' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                        student.academicPerformance === 'Good' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                                                            'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                        }`}>
                                                        {student.academicPerformance?.toUpperCase() || 'N/A'}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-gray-500 font-bold">
                                                        <SparklesIcon className="w-3 h-3 text-amber-500 dark:text-amber-400" /> {student.xp || 0} XP
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEmailStudent(student.email); }}
                                                    className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-400 hover:bg-indigo-600 hover:text-white transition-all border border-slate-200 dark:border-white/5 hover:border-indigo-500/50 shadow-lg"
                                                    title="Send Email"
                                                >
                                                    <EnvelopeIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center text-slate-500 dark:text-gray-500 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50 dark:bg-white/5">
                                        <UserGroupIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No students enrolled yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* --- ANNOUNCEMENTS TAB --- */}
                    {activeTab === 'announcements' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-8"
                        >
                            {!showAnnouncementForm ? (
                                <button
                                    onClick={() => {
                                        setEditingAnnouncementId(null);
                                        setNewAnnouncement({ title: '', content: '', priority: 'normal' });
                                        setShowAnnouncementForm(true);
                                    }}
                                    className="w-full py-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group flex flex-col items-center justify-center gap-3 bg-white dark:bg-white/[0.02] shadow-sm"
                                >
                                    <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform border border-indigo-100 dark:border-indigo-500/20 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                                        <PlusIcon className="w-7 h-7" />
                                    </div>
                                    <span className="text-slate-500 dark:text-gray-400 font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Create New Announcement</span>
                                </button>
                            ) : (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white/80 dark:bg-[#0a0a0a]/60 border border-slate-200 dark:border-white/5 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                    <div className="flex justify-between items-center mb-8 relative z-10">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-4 tracking-tighter">
                                            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 icon-glow">
                                                <MegaphoneIcon className="w-6 h-6" />
                                            </div>
                                            {editingAnnouncementId ? 'Update Neural Broadcast' : 'New Broadcast'}
                                        </h3>
                                        <button onClick={() => setShowAnnouncementForm(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <form onSubmit={handlePostAnnouncement} className="space-y-6 relative z-10">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-300 ml-1">Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Midterm Exam Schedule"
                                                value={newAnnouncement.title}
                                                onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:border-indigo-500/50 outline-none transition-all focus:bg-white dark:focus:bg-black/40 font-bold placeholder:text-slate-400 dark:placeholder:text-gray-600 shadow-inner"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-300 ml-1">Message</label>
                                            <textarea
                                                placeholder="Write your message to the class..."
                                                value={newAnnouncement.content}
                                                onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:border-indigo-500/50 outline-none transition-all focus:bg-white dark:focus:bg-black/40 min-h-[150px] placeholder:text-slate-400 dark:placeholder:text-gray-400 text-sm leading-relaxed custom-scrollbar shadow-inner"
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <select
                                                value={newAnnouncement.priority}
                                                onChange={e => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                                                className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-300 text-sm outline-none focus:border-indigo-500/50 transition-all hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer font-bold shadow-sm"
                                            >
                                                <option value="normal" className="bg-white dark:bg-[#0f1014] text-slate-900 dark:text-white">Normal Priority</option>
                                                <option value="high" className="bg-white dark:bg-[#0f1014] text-slate-900 dark:text-white">High Priority</option>
                                                <option value="urgent" className="bg-white dark:bg-[#0f1014] text-slate-900 dark:text-white">Urgent</option>
                                            </select>
                                            <div className="flex gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowAnnouncementForm(false); setEditingAnnouncementId(null); }}
                                                    className="px-8 py-3.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-400 rounded-xl font-bold text-sm transition-all border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                                <button type="submit" className="flex-1 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 border border-white/10">
                                                    Post Update
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-8">
                                    {announcements.map((ann, idx) => (
                                        <motion.div
                                            key={ann._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="relative pl-10 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-white/5 before:rounded-full group"
                                        >
                                            <div className={`absolute left-[-5px] top-10 w-4 h-4 rounded-full border-4 border-white dark:border-[#030712] transition-colors z-10 ${ann.priority === 'urgent' ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' :
                                                ann.priority === 'high' ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]' :
                                                    'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]'
                                                }`}></div>

                                            <div className="glass-ultra rounded-[2.5rem] p-10 hover:border-indigo-500/30 transition-all group-hover:bg-white/[0.03] holographic-shine relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                                <div className="flex justify-between items-start mb-6 relative z-10">
                                                    <div className="flex-1">
                                                        <h4 className="text-2xl font-black text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors tracking-tight">{ann.title}</h4>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center bg-white/5 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEditAnnouncement(ann)}
                                                                className="p-2 hover:text-indigo-500 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <PencilSquareIcon className="w-5 h-5" />
                                                            </button>
                                                            <div className="w-px h-4 bg-white/10"></div>
                                                            <button
                                                                onClick={() => handleDeleteAnnouncement(ann._id)}
                                                                className="p-2 hover:text-red-500 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                        <span className={`text-[9px] uppercase font-black px-3 py-1 rounded-xl border-2 ${ann.priority === 'urgent' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                            ann.priority === 'high' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                                'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                                                            }`}>
                                                            {ann.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 dark:text-indigo-300 leading-relaxed text-sm whitespace-pre-wrap relative z-10 font-medium">{ann.content}</p>
                                                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400 dark:text-gray-400 font-black uppercase tracking-widest flex justify-between items-center relative z-10">
                                                    <div className="flex items-center gap-3">
                                                        <ClockIcon className="w-4 h-4 text-slate-400 dark:text-gray-400" />
                                                        <span>{new Date(ann.createdAt).toLocaleDateString()} • {new Date(ann.createdAt).toLocaleTimeString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                                                        <span className="opacity-40">Source Author</span>
                                                        <span className="text-indigo-600 dark:text-indigo-500 specular-glow">{ann.author?.name || 'Faculty'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* --- RESOURCES TAB --- */}
                    {activeTab === 'resources' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-8"
                        >
                            {!showResourceForm ? (
                                <button
                                    onClick={() => {
                                        setEditingResourceId(null);
                                        setNewResource({ title: '', description: '', fileUrl: '', fileType: 'link' });
                                        setShowResourceForm(true);
                                    }}
                                    className="w-full py-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group flex flex-col items-center justify-center gap-3 bg-white dark:bg-white/[0.02] shadow-sm"
                                >
                                    <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform border border-indigo-100 dark:border-indigo-500/20 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                                        <PlusIcon className="w-7 h-7" />
                                    </div>
                                    <span className="text-slate-500 dark:text-gray-400 font-bold group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">Share New Resource</span>
                                </button>
                            ) : (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white/80 dark:bg-[#0a0a0a]/60 border border-slate-200 dark:border-white/5 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                    <div className="flex justify-between items-center mb-8 relative z-10">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter">
                                            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 icon-glow">
                                                <FolderOpenIcon className="w-6 h-6" />
                                            </div>
                                            {editingResourceId ? 'Update Learning Asset' : 'Share Resource'}
                                        </h3>
                                        <button onClick={() => { setShowResourceForm(false); setEditingResourceId(null); }} className="p-3 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleUploadResource} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                        <div className="space-y-2 group/input">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1 group-hover/input:text-emerald-600 dark:group-hover/input:text-emerald-500 transition-colors">Resource Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Lecture Notes - Week 1"
                                                value={newResource.title}
                                                onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:border-emerald-500/50 outline-none transition-all focus:bg-white dark:focus:bg-black/40 font-bold placeholder:text-slate-400 dark:placeholder:text-gray-600 shadow-inner"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 group/input">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1 group-hover/input:text-emerald-600 dark:group-hover/input:text-emerald-500 transition-colors">Link / URL</label>
                                            <input
                                                type="url"
                                                placeholder="https://"
                                                value={newResource.fileUrl}
                                                onChange={e => setNewResource({ ...newResource, fileUrl: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:border-emerald-500/50 outline-none transition-all focus:bg-white dark:focus:bg-black/40 font-mono text-sm placeholder:text-slate-400 dark:placeholder:text-gray-600 shadow-inner"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 group/input md:col-span-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-500 ml-1 group-hover/input:text-emerald-600 dark:group-hover/input:text-emerald-500 transition-colors">Description (Optional)</label>
                                            <textarea
                                                placeholder="Briefly describe the resource..."
                                                value={newResource.description}
                                                onChange={e => setNewResource({ ...newResource, description: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:border-emerald-500/50 outline-none transition-all focus:bg-white dark:focus:bg-black/40 min-h-[80px] placeholder:text-slate-400 dark:placeholder:text-gray-600 text-sm leading-relaxed custom-scrollbar shadow-inner"
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex justify-between items-center pt-2">
                                            <select
                                                value={newResource.fileType}
                                                onChange={e => setNewResource({ ...newResource, fileType: e.target.value })}
                                                className="bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-700 dark:text-gray-300 text-sm outline-none focus:border-indigo-500/50 transition-all hover:bg-slate-200 dark:hover:bg-white/5 cursor-pointer appearance-none font-bold shadow-sm"
                                            >
                                                <option value="link" className="bg-white dark:bg-[#0f1014] text-slate-900 dark:text-white">External Link</option>
                                                <option value="pdf" className="bg-white dark:bg-[#0f1014] text-slate-900 dark:text-white">PDF Document</option>
                                                <option value="video" className="bg-white dark:bg-[#0f1014] text-slate-900 dark:text-white">Video Lecture</option>
                                            </select>
                                            <div className="flex gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowResourceForm(false); setEditingResourceId(null); }}
                                                    className="px-8 py-3.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 rounded-xl font-bold text-sm transition-all border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                                <button type="submit" className="flex-1 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 border border-white/10">
                                                    {editingResourceId ? 'Update Asset' : 'Share Resource'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {resources.map((res, idx) => (
                                    <motion.div
                                        key={res._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group glass-ultra rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all flex items-start gap-7 hover:bg-emerald-500/5 holographic-shine relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                        <div className="w-20 h-20 rounded-[1.8rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-gray-500 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all duration-500 border border-slate-200 dark:border-white/5 group-hover:border-emerald-500/20 shadow-xl relative z-10">
                                            {res.fileType === 'video' ? <MegaphoneIcon className="w-10 h-10 animate-scanline" /> :
                                                res.fileType === 'pdf' ? <DocumentTextIcon className="w-10 h-10" /> :
                                                    <LinkIcon className="w-10 h-10" />}
                                        </div>
                                        <div className="flex-1 min-w-0 py-1 relative z-10">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-black text-slate-900 dark:text-white truncate text-xl group-hover:text-emerald-500 transition-colors tracking-tight">{res.title}</h4>
                                                <div className="flex items-center bg-white/5 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => handleEditResource(res)}
                                                        className="p-2 hover:text-emerald-500 transition-colors text-slate-400"
                                                        title="Edit Asset"
                                                    >
                                                        <PencilSquareIcon className="w-4 h-4" />
                                                    </button>
                                                    <div className="w-px h-4 bg-white/10"></div>
                                                    <button
                                                        onClick={() => handleDeleteResource(res._id)}
                                                        className="p-2 hover:text-red-500 transition-colors text-slate-400"
                                                        title="Delete Asset"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 dark:text-gray-300 font-black uppercase tracking-widest mt-1 line-clamp-2 leading-relaxed">{res.description || 'No specialized metadata provided.'}</p>
                                            <a
                                                href={res.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-6 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all bg-indigo-500/10 px-5 py-3 rounded-2xl border border-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/20"
                                            >
                                                Launch Asset <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default FacultyCourseDetails;
