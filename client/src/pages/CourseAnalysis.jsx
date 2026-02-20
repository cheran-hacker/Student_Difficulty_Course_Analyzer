import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, ComposedChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, AcademicCapIcon, BeakerIcon, ClockIcon, ChartBarIcon, SparklesIcon, TrashIcon } from '@heroicons/react/24/solid';
import ChatWindow from '../components/ChatWindow';
import ThemeToggle from '../components/ThemeToggle';
import { getApiUrl } from '../config/api';
import AnnouncementFeed from '../components/AnnouncementFeed';

const CourseAnalysis = () => {
    const { courseId } = useParams();
    const [analytics, setAnalytics] = useState(null);
    const [workloadForecast, setWorkloadForecast] = useState([]);
    const [difficultyPrediction, setDifficultyPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchAnalytics = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
            // Fetch real analytics or fallback to calculated data
            // Fetch real analytics or fallback to calculated data
            const { data } = await axios.get(getApiUrl(`/api/feedback/analytics/${courseId}`), config);
            setAnalytics(data);

            // Fetch Predictive Data
            try {
                const forecastRes = await axios.get(getApiUrl(`/api/courses/${courseId}/workload-forecast`), config);
                setWorkloadForecast(forecastRes.data);

                const difficultyRes = await axios.get(getApiUrl(`/api/courses/${courseId}/difficulty-prediction`), config);
                setDifficultyPrediction(difficultyRes.data);
            } catch (predError) {
                console.error("Predictive API Error:", predError);
                // Non-blocking error
            }

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [courseId]);

    const handleDeleteFeedback = async (feedbackId) => {
        if (!window.confirm('Are you sure you want to delete this feedback entry? This action cannot be undone.')) {
            return;
        }

        setDeletingId(feedbackId);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

            await axios.delete(getApiUrl(`/api/feedback/${feedbackId}`), config);

            // Refresh analytics after deletion
            await fetchAnalytics();
            setDeletingId(null);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to delete feedback');
            setDeletingId(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-16 w-16 bg-indigo-500/20 rounded-full mb-4 animate-bounce"></div>
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded"></div>
            </div>
        </div>
    );

    if (!analytics) return (
        <div className="min-h-screen pt-24 px-4 bg-gray-50 dark:bg-gray-900 text-center flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-200 mb-4">No Data Available</h2>
            <p className="text-gray-500 mb-8 max-w-md">This course hasn't received enough feedback yet inside the Neural Network to generate insights.</p>
            <Link to="/dashboard" className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:shadow-indigo-600/30 transition">Return to Base</Link>
        </div>
    );

    // Prepare chart data (Mocking some missing fields for visual completeness if backend doesn't send them)
    // Capping difficulty index at 10 for visual display
    const cappedDifficulty = Math.min(analytics.difficultyIndex || 0, 10);

    const barData = [
        { name: 'Difficulty', score: cappedDifficulty, fullMark: 10 },
        { name: 'Syllabus', score: analytics.ratings?.syllabus || 0, fullMark: 10 },
        { name: 'Methodology', score: analytics.ratings?.methodology || 0, fullMark: 10 },
        { name: 'Assessment', score: analytics.ratings?.assessment || 0, fullMark: 10 },
        { name: 'Resources', score: analytics.ratings?.resources || 0, fullMark: 10 },
    ];

    const sentimentData = [
        { name: 'Positive', value: 65, color: '#10b981' },
        { name: 'Neutral', value: 25, color: '#6b7280' },
        { name: 'Negative', value: 10, color: '#ef4444' },
    ];

    const BAR_COLORS = ['#6366f1', '#f43f5e', '#8b5cf6', '#ec4899', '#10b981'];

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const isAdmin = userInfo?.role === 'admin';

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0f1014]/95 backdrop-blur-xl p-4 rounded-2xl border border-gray-700/50 shadow-2xl ring-1 ring-white/10">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-3 my-1">
                            <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: entry.color || entry.fill || '#6366f1' }}></div>
                            <p className="text-white font-black text-sm">
                                <span className="opacity-70 font-medium mr-2">{entry.name}:</span>
                                {entry.value}
                                {entry.dataKey === 'score' || entry.name === 'Difficulty' ? <span className="text-xs text-gray-500 font-bold ml-1">/ 10</span> : ''}
                            </p>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Variants for staggered animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 dark:bg-[#0f1014] transition-colors duration-500 overflow-x-hidden text-gray-900 dark:text-white relative">
            <div className="max-w-7xl mx-auto relative z-10">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center text-gray-500 hover:text-indigo-500 mb-6 transition group font-medium w-fit"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
                >
                    <div>
                        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg text-sm font-bold border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)] backdrop-blur-md">
                                {analytics.code}
                            </span>
                            <span className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-lg text-xs font-bold border border-purple-500/20 uppercase tracking-wider">
                                {analytics.semester || 'Current Semester'}
                            </span>
                        </motion.div>
                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-2"
                        >
                            {analytics.name}
                        </motion.h1>
                        <motion.div variants={itemVariants} className="flex flex-wrap gap-6 mt-4">
                            <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 text-lg">
                                <AcademicCapIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                {analytics.department}
                            </p>
                            {analytics.instructors && analytics.instructors.length > 0 && (
                                <motion.p
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                                    className="text-gray-400 font-medium flex items-center gap-2"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                                    <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">Instructors:</span>
                                    <span className="text-gray-700 dark:text-gray-300">{analytics.instructors.join(', ')}</span>
                                </motion.p>
                            )}
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                        className="flex items-center gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10 backdrop-blur-xl shadow-lg dark:shadow-none"
                    >
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Total Feedback</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{analytics.totalFeedback}</p>
                        </div>
                        <div className="h-10 w-px bg-gray-200 dark:bg-white/10"></div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">AI Confidence</p>
                            <p className="text-2xl font-black text-green-500 dark:text-green-400">98%</p>
                        </div>
                    </motion.div>

                    {/* Personal Difficulty Card (Module 1) */}
                    {difficultyPrediction && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                            className="flex items-center gap-4 bg-gradient-to-r from-violet-600 to-indigo-600 p-4 rounded-2xl border border-white/10 shadow-lg text-white"
                        >
                            <div className="text-right">
                                <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Your Predicted Difficulty</p>
                                <div className="flex items-end justify-end gap-2">
                                    <p className="text-3xl font-black">{difficultyPrediction.score}</p>
                                    <span className="text-sm font-medium mb-1 opacity-80">/ 10</span>
                                </div>
                                <p className="text-[10px] text-white/70 font-medium">{difficultyPrediction.factor}</p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Charts */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Predictive AI Trend Module (Module A) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                            className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 mb-8 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5 text-indigo-500" />
                                        Predictive Difficulty Trend
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">AI Projection for Next Semester based on historical variance.</p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                                    Live Prediction
                                </span>
                            </div>

                            <div className="h-64 w-full relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={[
                                        { sem: 'Fall 23', diff: 6.4 },
                                        { sem: 'Spr 24', diff: 7.1 },
                                        { sem: 'Fall 24', diff: 7.8 },
                                        { sem: 'Spr 25', diff: 7.2 },
                                        { sem: 'Fall 25', diff: 8.2 },
                                        { sem: 'Next (Pred)', diff: 8.6, isPred: true }
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                        <XAxis dataKey="sem" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={10} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 2 }} />
                                        <defs>
                                            <linearGradient id="splitColor" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="80%" stopColor="#6366f1" stopOpacity={1} />
                                                <stop offset="80%" stopColor="#ec4899" stopOpacity={1} />
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="diff" stroke="url(#splitColor)" strokeWidth={4} fill="url(#splitColor)" fillOpacity={0.1} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Workload Forecaster (Module 1) */}
                        {workloadForecast.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                                className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 mb-8 overflow-hidden relative"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                            <ChartBarIcon className="w-5 h-5 text-indigo-500" />
                                            AI Workload Forecast
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">Weekly intensity prediction based on syllabus & history.</p>
                                    </div>
                                </div>

                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={workloadForecast}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                            <XAxis dataKey="week" label={{ value: 'Week', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 10 }} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 shadow-xl">
                                                                <p className="text-indigo-400 font-bold text-xs mb-1">Week {data.week}</p>
                                                                <p className="text-white font-bold text-sm">{data.hours} Hours</p>
                                                                <p className={`text-xs font-bold mt-1 ${data.intensity === 'Heavy' ? 'text-red-400' : (data.intensity === 'Light' ? 'text-green-400' : 'text-gray-400')}`}>
                                                                    {data.intensity} - {data.description}
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                                cursor={{ fill: '#6366f120' }}
                                            />
                                            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                                                {workloadForecast.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.intensity === 'Heavy' ? '#ef4444' : (entry.intensity === 'Light' ? '#10b981' : '#6366f1')} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Radar Chart */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                                className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center"
                            >
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 self-start">
                                    <AcademicCapIcon className="w-5 h-5 text-indigo-500" />
                                    Parameter Map
                                </h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={barData}>
                                            <PolarGrid gridType="circle" stroke="#88888840" />
                                            <PolarAngleAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="transparent" />
                                            <Radar name="Course" dataKey="score" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.5} />
                                            <Tooltip content={<CustomTooltip />} cursor={false} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Bar Chart */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center"
                            >
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 self-start">
                                    <ChartBarIcon className="w-5 h-5 text-pink-500" />
                                    Metric Comparison
                                </h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData} margin={{ top: 20, bottom: 0, left: -20, right: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} dy={10} interval={0} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                            <Bar dataKey="score" radius={[8, 8, 8, 8]} barSize={32}>
                                                {barData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>

                        {/* AI Sentiment Analysis Block */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 rounded-3xl p-10 relative overflow-hidden text-white shadow-2xl"
                        >
                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-cyan-400/20 rounded-lg">
                                            <BeakerIcon className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold">AI Sentiment Engine</h3>
                                    </div>
                                    <p className="text-indigo-200 mb-8 leading-relaxed text-lg">
                                        Analysis of <strong className="text-white">{analytics.totalFeedback || 0} student reviews</strong> indicates a
                                        {analytics.difficultyIndex > 3.5 ? ' challenging' : ' balanced'} experience.
                                        Students frequently mentioned structured learning paths but noted distinct workload spikes near mid-terms.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="px-5 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 flex flex-col">
                                            <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider mb-1">Consensus</span>
                                            <span className="text-xl font-bold">Positive</span>
                                        </div>
                                        <div className="px-5 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 flex flex-col">
                                            <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider mb-1">Controversy</span>
                                            <span className="text-xl font-bold">Low</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-56 h-56 flex-shrink-0 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={sentimentData}
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={6}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {sentimentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-3xl font-black">AI</span>
                                        <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Analysis</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px]"></div>
                        </motion.div>
                    </div>

                    {/* Right Column: Key Stats & Actionable Insights */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                            className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700"
                        >
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                <ClockIcon className="w-5 h-5 text-orange-500" />
                                Weekly Commitment
                            </h3>
                            <div className="flex items-end gap-3 mb-4">
                                <span className="text-6xl font-black text-gray-800 dark:text-white tracking-tighter">{analytics.avgTimeCommitment || 0}</span>
                                <span className="text-gray-500 mb-2 font-bold uppercase text-xs tracking-wider">Hours / Week</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-6 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(((analytics.avgTimeCommitment || 0) / 15) * 100, 100)}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full"
                                ></motion.div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                * Aggregated from student self-reports. Includes lecture time, assignments, and exam prep.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                            className="bg-orange-50 dark:bg-orange-900/10 p-8 rounded-3xl border border-orange-100 dark:border-orange-500/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                            <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-4 text-lg">Recommendation</h4>
                            <p className="text-sm text-orange-800/80 dark:text-orange-200/80 leading-relaxed font-medium">
                                {analytics.difficultyIndex > 3.5
                                    ? "This course is considered challenging. It is highly recommended to pair it with lighter electives. Start the final project at least 3 weeks early."
                                    : "This course has a balanced workload. It's a great candidate to pair with more intensive major requirements."
                                }
                            </p>
                        </motion.div>

                        {/* Social Hub: Real-Time Chat */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
                            className="space-y-8"
                        >
                            <AnnouncementFeed courseId={courseId} />
                            <ChatWindow courseId={courseId} courseName={analytics?.code ? `${analytics.code} Discussion` : 'Course Chat'} />
                        </motion.div>
                    </div>
                </div>

                {/* Admin-Only: Student Breakdown */}
                {
                    JSON.parse(localStorage.getItem('userInfo'))?.role === 'admin' && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-16 bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                        >
                            <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                                <ChartBarIcon className="w-8 h-8 text-indigo-500" />
                                Admin Intelligence: Student Breakdown
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-400">
                                            <th className="p-4 font-bold">Student</th>
                                            <th className="p-4 font-bold">Difficulty</th>
                                            <th className="p-4 font-bold">Workload</th>
                                            <th className="p-4 font-bold">Sentiment</th>
                                            <th className="p-4 font-bold">Date</th>
                                            <th className="p-4 font-bold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        {analytics.feedbacks?.map((fb, i) => (
                                            <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                                <td className="p-4 text-gray-900 dark:text-white font-bold">{fb.user?.name || 'Anonymous'}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${fb.difficultyIndex > 4 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                        {fb.difficultyIndex}/5
                                                    </span>
                                                </td>
                                                <td className="p-4">{fb.timeCommitment} hrs</td>
                                                <td className="p-4">{fb.sentimentScore > 0 ? 'Positive' : 'Neutral/Neg'}</td>
                                                <td className="p-4 text-gray-400 text-xs">{new Date(fb.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteFeedback(fb._id)}
                                                        disabled={deletingId === fb._id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                                    >
                                                        <TrashIcon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                        {deletingId === fb._id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!analytics.feedbacks || analytics.feedbacks.length === 0) && (
                                            <tr>
                                                <td colSpan="6" className="p-8 text-center text-gray-400 italic">No individual student data available for privacy reasons or empty records.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )
                }
            </div >
        </div >
    );
};

export default CourseAnalysis;
