import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, ChartBarIcon, ClockIcon, AcademicCapIcon } from '@heroicons/react/24/solid';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getApiUrl } from '../config/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

                const courseRes = await axios.get(getApiUrl(`/api/courses/${id}`), config);
                try {
                    const analyticsRes = await axios.get(getApiUrl(`/api/feedback/analytics/${id}`), config);
                    setAnalytics(analyticsRes.data);
                } catch (err) {
                    console.log("No analytics yet");
                    setAnalytics(null);
                }

                setCourse(courseRes.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="text-center mt-20 text-gray-400">Loading course analysis...</div>;
    if (!course) return <div className="text-center mt-20 text-red-400">Course not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-400 hover:text-white mb-6 transition"
            >
                <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back
            </button>

            {/* Header Card */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <span className="bg-blue-900/50 text-blue-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                        {course.department}
                    </span>
                    <h1 className="text-4xl font-bold text-white mb-2">{course.name}</h1>
                    <div className="flex items-center gap-4 text-gray-400">
                        <span className="font-mono text-gray-300">{course.code}</span>
                        <span>•</span>
                        <span>{course.semester}</span>
                        <span>•</span>
                        <span>{course.instructors?.join(', ')}</span>
                    </div>
                </div>
            </div>

            {/* Analytics Section */}
            {analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Score Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700"
                    >
                        <h3 className="text-gray-400 text-sm font-medium mb-4 flex items-center gap-2">
                            <ChartBarIcon className="w-4 h-4 text-primary" /> Overall Difficulty
                        </h3>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-bold text-white">{analytics.averageDifficulty.toFixed(1)}</span>
                            <span className="text-gray-500 mb-2">/ 5.0</span>
                        </div>
                        <div className="w-full bg-gray-700 h-2 rounded-full mt-4 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-green-400 to-red-500 h-full"
                                style={{ width: `${(analytics.averageDifficulty / 5) * 100}%` }}
                            ></div>
                        </div>
                    </motion.div>

                    {/* Time Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700"
                    >
                        <h3 className="text-gray-400 text-sm font-medium mb-4 flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-orange-400" /> Avg. Time Commitment
                        </h3>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-bold text-white">{analytics.averageTime.toFixed(1)}</span>
                            <span className="text-gray-500 mb-2">hrs/week</span>
                        </div>
                    </motion.div>

                    {/* Sentiment Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700"
                    >
                        <h3 className="text-gray-400 text-sm font-medium mb-4 flex items-center gap-2">
                            <AcademicCapIcon className="w-4 h-4 text-purple-400" /> Student Sentiment
                        </h3>
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Positive', value: analytics.sentimentAnalysis.positive },
                                            { name: 'Neutral', value: analytics.sentimentAnalysis.neutral },
                                            { name: 'Negative', value: analytics.sentimentAnalysis.negative },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {COLORS.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 text-xs text-gray-400 mt-2">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#0088FE]"></div> Positive</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#00C49F]"></div> Neutral</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FFBB28]"></div> Negative</span>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div className="p-12 bg-gray-800/30 rounded-2xl border border-dashed border-gray-700 text-center text-gray-500 mb-8">
                    No feedback data available for analysis yet.
                </div>
            )}
        </div>
    );
};

export default CourseDetails;
