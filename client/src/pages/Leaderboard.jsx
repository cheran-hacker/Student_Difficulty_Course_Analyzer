import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, StarIcon, FireIcon, AcademicCapIcon, UserIcon, ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import RouteTransition from '../components/RouteTransition';

const LeaderboardRank = ({ rank, name, xp, level, badges, department, isCurrentPlayer }) => {
    const isTopThree = rank <= 3;
    const rankColors = {
        1: 'from-amber-400 to-yellow-600 shadow-amber-500/20',
        2: 'from-slate-300 to-slate-500 shadow-slate-400/20',
        3: 'from-orange-400 to-orange-700 shadow-orange-500/20'
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: rank * 0.05 }}
            className={`relative group flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-500 ${isCurrentPlayer
                ? 'bg-indigo-600/10 border-indigo-500/50 shadow-2xl shadow-indigo-500/10 z-10'
                : 'bg-white/40 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-indigo-500/30 dark:hover:border-white/20 hover:bg-white/60 dark:hover:bg-white/10'
                }`}
        >
            {/* Rank Badge */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${isTopThree
                ? `bg-gradient-to-br ${rankColors[rank]} text-white shadow-lg`
                : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10'
                }`}>
                {rank === 1 ? <TrophyIcon className="w-8 h-8" /> : rank}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-black text-lg truncate ${isCurrentPlayer ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                        {name}
                    </h3>
                    {isCurrentPlayer && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-[10px] font-black uppercase tracking-tighter text-white">
                            You
                        </span>
                    )}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold truncate tracking-wide uppercase">{department}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 shrink-0">
                <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Level</p>
                    <div className="flex items-center gap-1.5 justify-center">
                        <StarIcon className="w-4 h-4 text-amber-500" />
                        <span className="text-gray-900 dark:text-white font-black">{level}</span>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">XP Points</p>
                    <div className="flex items-center gap-1.5 justify-center">
                        <FireIcon className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-900 dark:text-white font-black">{xp.toLocaleString()}</span>
                    </div>
                </div>
                <div className="hidden md:block text-center">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Badges</p>
                    <div className="flex items-center gap-1.5 justify-center">
                        <AcademicCapIcon className="w-4 h-4 text-indigo-400" />
                        <span className="text-gray-900 dark:text-white font-black">{badges?.length || 0}</span>
                    </div>
                </div>
            </div>

            {/* Hover Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
        </motion.div>
    );
};

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                setCurrentUser(userInfo);
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`${API_ENDPOINTS.AUTH}/leaderboard`, config);
                setLeaderboard(data.topStudents || []);
                setUserRank(data.userRank);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <RouteTransition>
            <div className="min-h-screen pt-32 pb-20 px-4 bg-gray-50 dark:bg-[#030712] relative overflow-hidden transition-colors duration-500">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 dark:bg-indigo-600/10 rounded-full blur-[120px]"></div>
                    <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-purple-200/40 dark:bg-purple-600/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-4xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                        <div>
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 dark:hover:text-white transition-colors mb-6 group text-sm font-bold"
                            >
                                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Return to Command Center
                            </Link>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
                                    <TrophyIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">
                                        Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Champions</span>
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 font-bold tracking-wide uppercase text-xs">Global Ranking • Academic Excellence leaderboard</p>
                                </div>
                            </div>
                        </div>

                        {/* Top Performer Badge */}
                        {!loading && leaderboard.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/10 p-4 rounded-3xl backdrop-blur-xl flex items-center gap-4 shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                                    <SparklesIcon className="w-6 h-6 text-amber-500" />
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Global Top Student</p>
                                    <p className="text-gray-900 dark:text-white font-black truncate max-w-[120px]">{leaderboard[0].name}</p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Current User Summary Card */}
                    <AnimatePresence>
                        {!loading && userRank && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 p-8 rounded-[2.5rem] bg-indigo-600 border border-indigo-400/50 shadow-2xl shadow-indigo-500/20 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-tighter leading-none mb-1">Rank</p>
                                            <p className="text-3xl font-black text-white">#{userRank.rank}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">Your Global Standing</h2>
                                        <p className="text-indigo-100/70 font-bold text-sm">Top {Math.max(1, Math.round((userRank.rank / userRank.total) * 100))}% of all students</p>
                                    </div>
                                </div>

                                <div className="flex gap-8 relative z-10">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Total XP</p>
                                        <p className="text-2xl font-black text-white">{userRank.xp.toLocaleString()}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Current Level</p>
                                        <p className="text-2xl font-black text-white">{userRank.level}</p>
                                    </div>
                                    {userRank.nextRival && (
                                        <div className="text-center hidden sm:block border-l border-indigo-400/30 pl-8">
                                            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">To Next Rank</p>
                                            <div className="flex flex-col">
                                                <span className="text-xl font-black text-white">+{userRank.nextRival.xpGap} XP</span>
                                                <span className="text-[10px] text-indigo-200 truncate max-w-[100px]">vs {userRank.nextRival.name}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Rankings List */}
                    <div className="space-y-4">
                        {loading ? (
                            Array(10).fill(0).map((_, i) => (
                                <div key={i} className="h-24 bg-white/40 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] animate-pulse"></div>
                            ))
                        ) : leaderboard.length > 0 ? (
                            <AnimatePresence>
                                {leaderboard.map((student, index) => (
                                    <LeaderboardRank
                                        key={student._id}
                                        rank={index + 1}
                                        name={student.name}
                                        xp={student.xp}
                                        level={student.level}
                                        badges={student.badges}
                                        department={student.department}
                                        isCurrentPlayer={student._id === currentUser?._id}
                                    />
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="text-center py-20 bg-white/40 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[3rem]">
                                <UserIcon className="w-16 h-16 text-gray-400 dark:text-gray-700 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">The arena is empty...</h3>
                                <p className="text-gray-500">Be the first to claim your spot in the Hall of Champions.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-500 dark:text-gray-600 text-xs font-bold uppercase tracking-[0.2em]">
                            Updated live • Based on verifiable academic contributions and engagement
                        </p>
                    </div>
                </div>
            </div>
        </RouteTransition>
    );
};

export default Leaderboard;
