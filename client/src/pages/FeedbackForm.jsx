// ... imports ...
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { SparklesIcon, TrophyIcon, FireIcon, PaperAirplaneIcon, ArrowLeftIcon, StarIcon, BoltIcon } from '@heroicons/react/24/solid';
import { API_ENDPOINTS } from '../config/api';

const FeedbackForm = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [ratings, setRatings] = useState({
        syllabus: 5,
        methodology: 5,
        workload: 5,
        assessment: 5,
        resources: 5
    });

    const [timeCommitment, setTimeCommitment] = useState(5);
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRatingChange = (category, value) => {
        setRatings(prev => ({ ...prev, [category]: parseInt(value) }));
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.post(
                API_ENDPOINTS.FEEDBACK,
                { courseId, ratings, timeCommitment, comments },
                config
            );

            // Synchronize Local State with updated XP/Level
            if (data.user) {
                const updatedUserInfo = { ...userInfo, ...data.user, token: userInfo.token };
                localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
            }

            const earnedXP = data.xpAwarded || 10;
            addToast(`Quest Completed! +${earnedXP} XP Awarded!`, 'success');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.message || 'Mission Failed. Please try again.', 'error');
            setLoading(false);
        }
    };

    const categories = [
        { id: 'syllabus', label: 'Syllabus Clarity', icon: '📜', color: 'accent-blue-500', rangeColor: 'bg-blue-500' },
        { id: 'methodology', label: 'Teaching Style', icon: '👨‍🏫', color: 'accent-purple-500', rangeColor: 'bg-purple-500' },
        { id: 'workload', label: 'Workload Balance', icon: '⚖️', color: 'accent-red-500', rangeColor: 'bg-red-500' },
        { id: 'assessment', label: 'Grading Fairness', icon: '🛡️', color: 'accent-green-500', rangeColor: 'bg-green-500' },
        { id: 'resources', label: 'Material Quality', icon: '📚', color: 'accent-yellow-500', rangeColor: 'bg-yellow-500' },
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 dark:bg-[#0f1014] transition-colors duration-500 relative selection:bg-indigo-500 selection:text-white">
            {/* Noise Overlay */}
            <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>

            {/* Gamification Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white mb-8 transition group font-medium"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Abandon Quest
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/50 dark:border-white/10 relative overflow-hidden"
                >
                    {/* Quest Header */}
                    <div className="text-center mb-12 relative">
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                            className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-yellow-500/30 transform rotate-6 ring-4 ring-white dark:ring-gray-800"
                        >
                            <TrophyIcon className="w-10 h-10 text-white" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        >
                            <span className="px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 text-xs font-black uppercase tracking-widest mb-3 inline-block">
                                Daily Quest
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Course Review</h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto text-lg">Complete this evaluation to earn <span className="text-yellow-500 font-bold">up to 50 XP</span> and unlock new badges.</p>
                        </motion.div>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-12">
                        {/* Rating Sliders */}
                        <div className="grid grid-cols-1 gap-8">
                            {categories.map((cat, index) => (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + (index * 0.1) }}
                                    className="bg-gray-50 dark:bg-black/20 p-6 rounded-3xl border border-gray-100 dark:border-white/10 hover:border-indigo-500/30 transition-all group duration-300 hover:shadow-lg dark:hover:shadow-none"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <label className="text-xl font-bold flex items-center gap-3 text-gray-800 dark:text-white">
                                            <span className="text-2xl filter drop-shadow-sm">{cat.icon}</span> {cat.label}
                                        </label>
                                        <span className={`text-2xl font-black ${ratings[cat.id] >= 8 ? 'text-green-500' : ratings[cat.id] >= 5 ? 'text-indigo-500' : 'text-orange-500'}`}>
                                            {ratings[cat.id]}<span className="text-sm text-gray-400 font-bold">/10</span>
                                        </span>
                                    </div>

                                    <div className="relative h-4 w-full">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${cat.rangeColor}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${ratings[cat.id] * 10}%` }}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={ratings[cat.id]}
                                            onChange={(e) => handleRatingChange(cat.id, e.target.value)}
                                            className="absolute top-[-6px] left-0 w-full h-4 opacity-0 cursor-pointer z-10"
                                        />
                                        <div
                                            className="absolute top-[-4px] w-4 h-4 bg-white border-2 border-indigo-500 rounded-full shadow-md pointer-events-none transition-all duration-75"
                                            style={{ left: `calc(${ratings[cat.id] * 10}% - 8px)` }}
                                        />
                                    </div>

                                    <div className="flex justify-between text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest">
                                        <span>Needs Improvement</span>
                                        <span>Average</span>
                                        <span>World Class</span>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Time Commitment Slider */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.9 }}
                                className="bg-gray-50 dark:bg-black/20 p-6 rounded-3xl border border-gray-100 dark:border-white/10 hover:border-orange-500/30 transition-all group"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <label className="text-xl font-bold flex items-center gap-3 text-gray-800 dark:text-white">
                                        <span className="text-2xl">⏳</span> Weekly Hours
                                    </label>
                                    <span className="text-2xl font-black text-orange-500">
                                        {timeCommitment}<span className="text-sm text-gray-400 font-bold"> hrs</span>
                                    </span>
                                </div>
                                <div className="relative h-4 w-full">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-orange-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(timeCommitment / 20) * 100}%` }}
                                        />
                                    </div>
                                    <input
                                        type="range" min="1" max="20" value={timeCommitment} onChange={(e) => setTimeCommitment(parseInt(e.target.value))}
                                        className="absolute top-[-6px] left-0 w-full h-4 opacity-0 cursor-pointer z-10"
                                    />
                                    <div
                                        className="absolute top-[-4px] w-4 h-4 bg-white border-2 border-orange-500 rounded-full shadow-md pointer-events-none"
                                        style={{ left: `calc(${(timeCommitment / 20) * 100}% - 8px)` }}
                                    />
                                </div>
                            </motion.div>
                        </div>

                        {/* Text Area */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
                            className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-200 dark:border-white/5 focus-within:border-indigo-500/50 transition-colors shadow-sm"
                        >
                            <label className="block text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                                <SparklesIcon className="w-6 h-6 text-yellow-400" />
                                Wisdom & Feedback
                            </label>
                            <textarea
                                rows="4"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-gray-800 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-gray-400 font-medium transition-all"
                                placeholder="Share your knowledge for future students..."
                            ></textarea>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.3)" }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            type="submit"
                            className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black py-6 rounded-2xl shadow-2xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 uppercase tracking-wider ${loading ? 'opacity-70 grayscale cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <><BoltIcon className="w-6 h-6 animate-spin" /> Syncing Progress...</>
                            ) : (
                                <><FireIcon className="w-6 h-6 animate-pulse" /> Complete Quest</>
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default FeedbackForm;
