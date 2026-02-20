import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    UserIcon, ArrowLeftIcon, ArrowRightIcon, PencilSquareIcon, CheckIcon, XMarkIcon,
    EnvelopeIcon, IdentificationIcon, BuildingOfficeIcon, CalendarDaysIcon, StarIcon,
    ChartBarIcon, FireIcon, HandThumbUpIcon, SparklesIcon, AcademicCapIcon, ClockIcon,
    TrophyIcon, ChatBubbleLeftRightIcon
} from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from 'recharts';
import { getApiUrl } from '../config/api';
import { DEPARTMENTS } from '../config/departments';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0f1014]/95 backdrop-blur-xl p-4 rounded-2xl border border-gray-700/50 shadow-2xl ring-1 ring-white/10">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-3 my-1">
                        <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: entry.color || entry.fill || '#8b5cf6' }}></div>
                        <p className="text-white font-bold text-sm">
                            <span className="opacity-70 font-medium mr-2">{entry.name}:</span>
                            {entry.value}
                        </p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const StudentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [student, setStudent] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ avgDifficulty: 0, avgWorkload: 0, totalFeedback: 0 });

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '', studentId: '', email: '', department: '', year: '',
        semester: '1', gpa: 0, cgpa: 0
    });

    const years = ['I', 'II', 'III', 'IV'];

    const departments = DEPARTMENTS;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo) { navigate('/login'); return; }
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

                const studentRes = await axios.get(getApiUrl(`/api/auth/users/${id}`), config);
                const feedbackRes = await axios.get(getApiUrl(`/api/feedback/user/${id}`), config);

                setStudent(studentRes.data);
                setFormData({
                    name: studentRes.data.name,
                    studentId: studentRes.data.studentId || '',
                    email: studentRes.data.email,
                    department: studentRes.data.department || '',
                    year: studentRes.data.year || '',
                    semester: studentRes.data.semester || '1',
                    gpa: studentRes.data.gpa || 0,
                    cgpa: studentRes.data.cgpa || 0
                });
                setFeedback(feedbackRes.data);

                // Calculate Stats
                if (feedbackRes.data.length > 0) {
                    const totalDiff = feedbackRes.data.reduce((acc, curr) => acc + (curr.difficultyIndex || 5), 0);
                    const totalWork = feedbackRes.data.reduce((acc, curr) => acc + (curr.timeCommitment || 0), 0);
                    setStats({
                        avgDifficulty: (totalDiff / feedbackRes.data.length).toFixed(1),
                        avgWorkload: (totalWork / feedbackRes.data.length).toFixed(1),
                        totalFeedback: feedbackRes.data.length
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
                if (error.response?.status === 401) {
                    addToast('Session expired, please login again', 'error');
                    navigate('/login');
                }
            }
        };
        fetchData();
    }, [id, navigate, addToast]); // Added dependencies

    const handleUpdate = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.put(getApiUrl(`/api/auth/users/${id}`), formData, config);
            setStudent(data);
            setIsEditing(false);
            addToast('Student details updated successfully', 'success');
        } catch (error) {
            console.error(error);
            addToast('Failed to update student', 'error');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full animate-bounce mb-4"></div>
                <p className="text-gray-500 animate-pulse font-medium">Analyzing Student Profile...</p>
            </div>
        </div>
    );

    if (!student) return <div className="text-center mt-20 text-red-400">Student not found</div>;

    // Chart Data Preparation - Enhanced for Visuals
    const dnaData = [
        { subject: 'Theory', A: stats.avgDifficulty * 10 || 65, fullMark: 100 },
        { subject: 'Practical', A: (stats.avgWorkload / 20) * 100 || 80, fullMark: 100 },
        { subject: 'Consistency', A: 85, fullMark: 100 },
        { subject: 'Engagement', A: Math.min(100, feedback.length * 15 + 40), fullMark: 100 },
        { subject: 'Punctuality', A: 75, fullMark: 100 },
    ];

    const academicMetrics = [
        { label: 'Register Number', value: student.studentId || 'N/A', icon: IdentificationIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Current Semester', value: `Semester ${formData.semester}`, icon: CalendarDaysIcon, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Academic Year', value: `Year ${formData.year}`, icon: AcademicCapIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Department', value: student.department || 'General Engineering', icon: BuildingOfficeIcon, color: 'text-cyan-500', bg: 'bg-cyan-500/10' }
    ];

    return (
        <div className="min-h-screen pt-24 px-4 pb-12 bg-gray-50 dark:bg-[#0a0a0c] transition-colors duration-500 relative overflow-x-hidden">
            {/* Ultra Ambient Background System */}
            <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-gradient-to-tl from-cyan-500/10 via-blue-500/10 to-transparent rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(-1)}
                    className="flex items-center text-slate-400 hover:text-indigo-500 mb-10 transition-all group font-black text-[10px] uppercase tracking-[0.3em]"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-3 group-hover:-translate-x-2 transition-transform" />
                    Return to Student Corpus
                </motion.button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                    {/* Bento Box: Primary Profile */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-8 bg-white/60 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] p-10 lg:p-14 border border-white/40 dark:border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] relative overflow-hidden group"
                    >
                        {/* Interactive Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>

                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="absolute top-10 right-10 flex items-center gap-3 px-6 py-3 bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_15px_30px_-5px_rgba(79,70,229,0.4)] hover:shadow-[0_20px_40px_-5px_rgba(79,70,229,0.5)] hover:scale-105 transition-all z-20"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                                Edit Dossier
                            </button>
                        )}

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10 h-full">
                            <div className="relative group/avatar">
                                <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[3rem] blur-2xl opacity-20 group-hover/avatar:opacity-40 transition duration-700"></div>
                                <div className="w-40 h-40 rounded-[3rem] bg-[#0a0a0c] flex items-center justify-center border border-white/20 shadow-3xl transform group-hover/avatar:rotate-3 transition duration-500 overflow-hidden relative">
                                    <span className="text-6xl font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                        {student.name.substring(0, 1).toUpperCase()}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent"></div>
                                </div>
                                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center border-4 border-[#0a0a0c] shadow-xl">
                                    <SparklesIcon className="w-6 h-6 text-white animate-pulse" />
                                </div>
                            </div>

                            <div className="flex-1 w-full text-center md:text-left">
                                {isEditing ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-black/40 p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cadet ID</label>
                                            <input type="text" value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} className="w-full bg-white dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Access</label>
                                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                                            <select
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                className="w-full bg-white dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold"
                                            >
                                                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
                                                <select
                                                    value={formData.year}
                                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                                    className="w-full bg-white dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold"
                                                >
                                                    {years.map(y => <option key={y} value={y}>Year {y}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                                                <select
                                                    value={formData.semester}
                                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                                    className="w-full bg-white dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold"
                                                >
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s.toString()}>Sem {s}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GPA</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.gpa || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                        setFormData({ ...formData, gpa: isNaN(val) ? 0 : val });
                                                    }}
                                                    className="w-full bg-white dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CGPA</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.cgpa || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                        setFormData({ ...formData, cgpa: isNaN(val) ? 0 : val });
                                                    }}
                                                    className="w-full bg-white dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-full flex justify-end gap-4 pt-6">
                                            <button onClick={() => setIsEditing(false)} className="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-200">Cancel Override</button>
                                            <button onClick={handleUpdate} className="px-8 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all">Authorize Update</button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-8">
                                        <div>
                                            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white overflow-hidden pb-1">
                                                {student.name}
                                            </h1>

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                {academicMetrics.map((m, i) => (
                                                    <div key={i} className="flex flex-col gap-2 p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 items-center md:items-start group/stat hover:bg-white dark:hover:bg-white/10 transition-all">
                                                        <div className={`w-10 h-10 rounded-xl ${m.bg} ${m.color} flex items-center justify-center mb-1 group-hover/stat:scale-110 transition-transform`}>
                                                            <m.icon className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{m.label}</span>
                                                        <span className="text-sm font-black text-slate-800 dark:text-slate-200 truncate w-full">{m.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                            <div className="flex flex-col gap-4 p-8 rounded-[2.5rem] bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 relative group/metric overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover/metric:scale-150 transition-transform duration-1000"></div>
                                                <div className="flex justify-between items-center text-indigo-500">
                                                    <StarIcon className="w-8 h-8 filter drop-shadow-[0_0_8px_currentColor]" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Performance Index</span>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{student.gpa || '0.00'}</span>
                                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">GPA</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-500 dark:text-indigo-300/60 leading-relaxed uppercase tracking-widest">Calculated across current academic cycle</p>
                                            </div>

                                            <div className="flex flex-col gap-4 p-8 rounded-[2.5rem] bg-fuchsia-500/5 dark:bg-fuchsia-500/10 border border-fuchsia-500/10 relative group/metric overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover/metric:scale-150 transition-transform duration-1000"></div>
                                                <div className="flex justify-between items-center text-fuchsia-500">
                                                    <TrophyIcon className="w-8 h-8 filter drop-shadow-[0_0_8px_currentColor]" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Lifecycle Total</span>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{student.cgpa || '0.00'}</span>
                                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">CGPA</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-500 dark:text-fuchsia-300/60 leading-relaxed uppercase tracking-widest">Cumulative institutional standing</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Bento Box: DNA Intelligence */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-4 bg-white/60 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] p-10 border border-white/40 dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-between group"
                    >
                        <div className="w-full flex justify-between items-start mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Intelligence DNA</h3>
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 group-hover:rotate-12 transition-transform">
                                <SparklesIcon className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="w-full h-72 relative z-10 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dnaData}>
                                    <PolarGrid stroke="#88888820" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: '900', letterSpacing: '0.1em' }} />
                                    <PolarRadiusAxis stroke="#88888820" tick={false} axisLine={false} />
                                    <Radar name="Cadet" dataKey="A" stroke="#6366f1" strokeWidth={3} fill="url(#dnaGradient)" fillOpacity={0.6} />
                                    <defs>
                                        <linearGradient id="dnaGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip content={<CustomTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="w-full space-y-4 pt-6">
                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-100 dark:border-white/5 pt-6">
                                <span>Engagement Profile</span>
                                <span className="text-indigo-500">Enhanced</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 italic text-center leading-relaxed">
                                "Strong multi-dimensional capability detected. High potential for complex problem solving."
                            </p>
                        </div>
                    </motion.div>
                </div>

                <div className="flex items-center gap-4 mb-10 pt-10">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-xl shadow-indigo-500/10">
                        <ChartBarIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Intelligence Matrix</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cross-correlated course feedback and performance vectors</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {feedback.map((item, index) => {
                        const difficulty = item.difficultyIndex || 5;
                        const isRated = !!item.ratings;

                        return (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white/60 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/40 dark:border-white/10 shadow-xl group hover:border-indigo-500/50 transition-all duration-500"
                            >
                                <div className="flex justify-between items-start mb-8 text-center md:text-left">
                                    <div className="flex-1">
                                        <h3 className="font-black text-xl text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors leading-tight mb-2 selection:bg-indigo-500">
                                            {item.course?.name || 'Unknown Module'}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg uppercase tracking-widest">
                                                {item.course?.code}
                                            </span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/10" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.course?.department?.split(' ').map(w => w[0]).join('')}</span>
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-2xl text-center shadow-lg transform group-hover:rotate-6 transition-transform ${isRated
                                        ? (difficulty > 7 ? 'bg-red-500 text-white'
                                            : difficulty > 4 ? 'bg-orange-500 text-white'
                                                : 'bg-emerald-500 text-white')
                                        : 'bg-slate-200 text-slate-500 dark:bg-white/5 dark:text-slate-600'
                                        }`}>
                                        <div className="text-[8px] font-black uppercase tracking-widest opacity-70 mb-1">Index</div>
                                        <div className="text-xl font-black">{isRated ? difficulty : '--'}</div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-black/40 p-6 rounded-3xl mb-8 relative border border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-3 text-indigo-500 mb-2">
                                        <ChatBubbleLeftRightIcon className="w-5 h-5 opacity-30" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Intelligence Log</span>
                                    </div>
                                    {item.comments ? (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed">"{item.comments}"</p>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No supplemental logs detected.</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-white dark:bg-white/5 p-4 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-white/5 group/substat hover:border-indigo-500/30 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                            <ClockIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Temporal</span>
                                            <span className="text-sm font-black text-slate-800 dark:text-slate-200">{item.timeCommitment || 0}h</span>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-white/5 p-4 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-white/5 group/substat hover:border-emerald-500/30 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                            <HandThumbUpIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Utility</span>
                                            <span className="text-sm font-black text-slate-800 dark:text-slate-200">{item.ratings?.resources || '--'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.3em]">Log Timestamp</span>
                                        <span className="text-[10px] font-black text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <Link to={`/analysis/${item.course?._id}`} className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-indigo-500/5 text-indigo-500 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all group/link">
                                        Deeper Insight
                                        <ArrowRightIcon className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}

                    {feedback.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-inner flex flex-col items-center justify-center gap-6">
                            <div className="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-700">
                                <AcademicCapIcon className="w-12 h-12" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">Insufficient Data Vectors</h3>
                                <p className="text-xs font-bold text-slate-400/60 uppercase tracking-widest mt-2">Zero course interactions detected for this cadet.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Intelligence Accent */}
                <div className="mt-20 flex justify-center py-10 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-6 opacity-30 text-[8px] font-black uppercase tracking-[0.8em] text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        Intelligence Engine Version 6.0 Stable
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetails;
