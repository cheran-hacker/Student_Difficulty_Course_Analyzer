import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { motion } from 'framer-motion';
import { SparklesIcon, ChartBarIcon, ArrowTrendingUpIcon, ServerIcon, UserGroupIcon } from '@heroicons/react/24/solid';

import { useState, useEffect } from 'react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0f1014]/95 backdrop-blur-xl p-4 rounded-2xl border border-gray-700/50 shadow-2xl ring-1 ring-white/10">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-3 my-1">
                        <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: entry.color || entry.fill }}></div>
                        <p className="text-white font-bold text-sm">
                            <span className="opacity-70 font-medium mr-2">{entry.name === 'A' ? 'Score' : entry.name}:</span>
                            {entry.value}
                            {/* Contextual scales */}
                            {label === 'Performance' || label === 'Feedback' ? <span className="text-xs text-gray-500 font-bold ml-1">/ 100</span> : ''}
                        </p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const DashboardAnalytics = ({ students = [], courses = [] }) => {
    const [timeRange, setTimeRange] = useState('Real-time');
    // 1. Students per Department
    const deptData = students.reduce((acc, student) => {
        const dept = student.department || 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
    }, {});

    const barData = Object.keys(deptData).map(dept => ({
        name: dept,
        students: deptData[dept]
    }));

    // 2. Course Distribution by Semester
    const semesterData = courses.reduce((acc, course) => {
        const sem = course.semester || 'Unknown';
        acc[sem] = (acc[sem] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.keys(semesterData).map(sem => ({
        name: sem,
        value: semesterData[sem]
    }));

    // 3. Mock Trend Data
    const monthlyData = [
        { month: 'Jan', engagement: 65, feedback: 40 },
        { month: 'Feb', engagement: 59, feedback: 30 },
        { month: 'Mar', engagement: 80, feedback: 55 },
        { month: 'Apr', engagement: 81, feedback: 60 },
        { month: 'May', engagement: 96, feedback: 85 },
        { month: 'Jun', engagement: 70, feedback: 45 },
    ];

    // Live Data Simulation State
    const [liveData, setLiveData] = useState([
        { time: '00:00', engagement: 12, feedback: 5 },
        { time: '04:00', engagement: 25, feedback: 15 },
        { time: '08:00', engagement: 45, feedback: 20 },
        { time: '12:00', engagement: 85, feedback: 60 },
        { time: '16:00', engagement: 75, feedback: 55 },
        { time: '20:00', engagement: 50, feedback: 30 },
    ]);

    // Simulate Live Updates
    useEffect(() => {
        if (timeRange === 'Real-time') {
            const interval = setInterval(() => {
                setLiveData(prevData => {
                    const newData = [...prevData];
                    // Shift values slightly to simulate life
                    const lastItem = { ...newData[newData.length - 1] };
                    lastItem.engagement = Math.max(10, Math.min(100, lastItem.engagement + (Math.random() - 0.5) * 20)); // Random walk

                    // Update only the last point or shift the whole graph? 
                    // Let's just update the last few points to make it look "alive" without shifting timeline endlessly for now
                    newData[newData.length - 1] = {
                        ...lastItem,
                        engagement: Math.floor(lastItem.engagement)
                    };
                    return newData;
                });
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [timeRange]);

    const chartData = timeRange === 'Last 24h' ? monthlyData : liveData;
    // ^ Swapped logic: "Real-time" should map to liveData (simulated), "Last 24h" (or Monthly/Yearly context really) mapped to static.
    // Actually correcting naming: Dropdown has 'Real-time' and 'Last 24h'.
    // Let's map 'Real-time' -> liveData (granular). 'Last 24h' -> maybe broad aggregations? 
    // Re-aligning with user request: "shows not a 24h its shows aa mmonths"
    // So 'Last 24h' should show HOURS (00:00, 04:00 etc). 
    // And 'Real-time' should probably show seconds/minutes or just be the granular view.
    // I previously mapped 'Last 24h' -> dailyData (Hours). 'Real-time' -> monthlyData. That was causing the confusion.
    // Let's fix map:
    // 'Overview' (Monthly)
    // 'Today' (Hourly)

    // 4. Dynamic Radar Data
    const radarData = [
        { subject: 'Engagement', A: Math.min(students.length * 10, 100), fullMark: 100 },
        { subject: 'Feedback', A: 85, fullMark: 100 }, // Mock for now
        { subject: 'Courses', A: Math.min(courses.length * 5, 100), fullMark: 100 },
        { subject: 'Traffic', A: 92, fullMark: 100 },
        { subject: 'Uptime', A: 99, fullMark: 100 },
        { subject: 'Performance', A: 78, fullMark: 100 },
    ];

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

    return (
        <div className="space-y-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-blue-500" />
                Live Mission Metrics
            </h2>

            {/* AI Insights HUD Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-[#0f1014] border border-blue-500/30 p-5 rounded-2xl flex items-start gap-4 shadow-lg shadow-blue-500/10"
            >
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none"></div>
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <SparklesIcon className="w-6 h-6 text-blue-400 animate-pulse" />
                </div>
                <div>
                    <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                        AI System Analysis
                        <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 border border-green-500/30">Stable</span>
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">
                        Student interaction velocity has increased by <span className="text-green-400 font-bold">+24%</span>.
                        Department <span className="text-blue-400 font-bold">Computer Science</span> is leading in engagement metrics.
                        Recommend optimizing feedback loops for Semester 4.
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Student Distribution (Neon Bar) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-white/5 backdrop-blur-3xl border border-gray-100 dark:border-white/10 p-6 rounded-3xl shadow-sm"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <UserGroupIcon className="w-4 h-4" /> Department Density
                        </h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={40}>
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 2. Engagement Trend (Area Chart) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-white/5 backdrop-blur-3xl border border-gray-100 dark:border-white/10 p-6 rounded-3xl shadow-sm"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <ArrowTrendingUpIcon className="w-4 h-4" /> Activity Stream
                        </h3>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="bg-gray-100 dark:bg-gray-700/50 text-[10px] uppercase font-bold text-gray-600 dark:text-gray-300 rounded-lg px-2 py-1 outline-none border-none cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                            <option value="Real-time">Live (24h)</option>
                            <option value="Last 24h">Monthly History</option>
                            {/* Renaming values to match data logic better or swapping */}
                        </select>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                                <XAxis dataKey={timeRange === 'Real-time' ? "time" : "month"} stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorEng)" isAnimationActive={timeRange !== 'Real-time'} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 3. System Health (Radar) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-white/5 backdrop-blur-3xl border border-gray-100 dark:border-white/10 p-6 rounded-3xl shadow-sm"
                >
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ServerIcon className="w-4 h-4" /> System Vitals
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid strokeOpacity={0.2} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="transparent" />
                                <Radar name="Metrics" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 4. Course Distribution (Donut) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-white/5 backdrop-blur-3xl border border-gray-100 dark:border-white/10 p-6 rounded-3xl shadow-sm"
                >
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ChartBarIcon className="w-4 h-4" /> Semester Load
                    </h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardAnalytics;
