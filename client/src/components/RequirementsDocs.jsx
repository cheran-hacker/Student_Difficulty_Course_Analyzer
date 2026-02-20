import { useState } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, ShieldCheckIcon, UserGroupIcon, CpuChipIcon, CodeBracketSquareIcon, BriefcaseIcon, HeartIcon, GlobeAmericasIcon } from '@heroicons/react/24/solid';

const RequirementsDocs = () => {
    const [activeModule, setActiveModule] = useState(0);

    const modules = [
        {
            title: "1. AI Predictive Engine",
            icon: <CpuChipIcon className="w-6 h-6 text-cyan-400" />,
            color: "from-cyan-500 to-blue-500",
            specs: [
                "Workload Forecasting: Predicts hours/week based on syllabus analysis.",
                "Difficulty Prediction: Compares student GPA vs course history.",
                "Sentiment Analysis: NLP on student feedback to determine mood.",
                "Dropout Risk: Flags students with < 50% consistency."
            ]
        },
        {
            title: "2. Gamification & Rewards",
            icon: <SparklesIcon className="w-6 h-6 text-yellow-400" />,
            color: "from-yellow-400 to-orange-500",
            specs: [
                "XP System: Awards 10 XP per review, 50 XP for details.",
                "Leveling: Fresher (Lvl 1) -> Scholar -> Dean's List (Lvl 10).",
                "Badges: 'First Mover', 'Top Critic', 'Streaker'.",
                "Leaderboards: Semester-wise top student ranking."
            ]
        },
        {
            title: "3. Social Learning Hub",
            icon: <UserGroupIcon className="w-6 h-6 text-purple-400" />,
            color: "from-purple-500 to-pink-500",
            specs: [
                "Real-Time Chat: Socket.io powered course rooms.",
                "Study Groups: 'Looking for Group' status toggles.",
                "Peer Verification: Upvote/Downvote helpful reviews.",
                "Live Presence: 'Who is online' counters."
            ]
        },
        {
            title: "4. Fortress Security",
            icon: <ShieldCheckIcon className="w-6 h-6 text-green-400" />,
            color: "from-green-500 to-emerald-600",
            specs: [
                "RBAC 2.0: Granular permissions for Admin/Mod/Student.",
                "Audit Logs: Immutable tracking of all critical actions.",
                "Bot Defense: Rate limiting and honeypot forms.",
                "Data Encryption: At-rest encryption for sensitive IDs."
            ]
        },
        {
            title: "5. System Architecture & Routes",
            icon: <CodeBracketSquareIcon className="w-6 h-6 text-indigo-400" />,
            color: "from-indigo-500 to-blue-600",
            specs: [
                "Frontend: /login, /register, /dashboard, /admin, /feedback/:id",
                "APIAuth: POST /api/auth/login, /register (JWT Secured)",
                "APISys: PUT /api/settings (Maintenance Toggle), GET /api/audit"
            ]
        },
        {
            title: "6. Career Compass",
            icon: <BriefcaseIcon className="w-6 h-6 text-rose-400" />,
            color: "from-rose-500 to-red-600",
            specs: [
                "Skill Gap Analysis: Matches current course grades with industry job descriptions.",
                "Placement Predictor: AI probability score for Tier-1 companies.",
                "Resume Builder: Auto-generates CV points from course projects.",
                "Alumni Connect: Smart matching with seniors in target roles."
            ]
        },
        {
            title: "7. Mental Resiliency",
            icon: <HeartIcon className="w-6 h-6 text-pink-400" />,
            color: "from-pink-500 to-rose-400",
            specs: [
                "Burnout Detection: Alerts when workload exceeds 60hrs/week.",
                "Wellness Check-ins: Micro-surveys during high-stress exam periods.",
                "Zen Mode: UI toggle to hide competitive stats (Leaderboards/XP).",
                "Support Uplink: One-click anonymous connection to counselors."
            ]
        },
        {
            title: "8. Global Benchmarking",
            icon: <GlobeAmericasIcon className="w-6 h-6 text-blue-400" />,
            color: "from-blue-400 to-cyan-300",
            specs: [
                "University Rank: Live comparison with peer institutions.",
                "Standardization: Normalizes grades against international scales (GPA/CGPA).",
                "Research Impact: Tracks citations and paper publications per department.",
                "Diversity Index: Real-time stats on gender and regional diversity."
            ]
        }
    ];

    const toggleModule = (index) => {
        // Mock toggle for visual effect
        const newModules = [...modules];
        newModules[index].active = !newModules[index].active;
        // Force re-render logic if needed, or just rely on state if we move modules to state
    };

    return (
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/20 dark:border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-end mb-8 relative z-10">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <CpuChipIcon className="w-8 h-8 text-indigo-500 animate-pulse-slow" />
                        System Kernel
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage and deploy advanced system capabilities.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Core Online
                    </div>
                    <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        v2.4.0
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Module List */}
                <div className="col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {modules.map((mod, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveModule(idx)}
                            className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${activeModule === idx
                                ? 'border-transparent ring-2 ring-indigo-500 bg-white dark:bg-white/10 shadow-lg shadow-indigo-500/10'
                                : 'border-gray-100 dark:border-white/5 hover:border-indigo-500/30 hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${mod.color} shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                                    {mod.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-sm ${activeModule === idx ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {mod.title.split('. ')[1]}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`w-1.5 h-1.5 rounded-full ${idx < 5 ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                        <span className="text-[10px] uppercase font-bold text-gray-400">{idx < 5 ? 'Active' : 'Standby'}</span>
                                    </div>
                                </div>
                                {activeModule === idx && <div className="w-1 h-8 bg-indigo-500 rounded-full absolute right-0"></div>}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Module Detail View */}
                <div className="lg:col-span-2">
                    <motion.div
                        key={activeModule}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50 dark:bg-black/20 rounded-3xl p-8 border border-gray-100 dark:border-white/5 h-full relative overflow-hidden"
                    >
                        {/* Ambient Glow */}
                        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${modules[activeModule].color} opacity-10 blur-[80px] pointer-events-none`}></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{modules[activeModule].title.split('. ')[1]}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-mono uppercase tracking-widest">Module ID: MOD-{String(activeModule + 1).padStart(3, '0')}</p>
                                </div>
                                <button className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 bg-gradient-to-r ${modules[activeModule].color} hover:opacity-90`}>
                                    {activeModule < 5 ? 'Manage Config' : 'Deploy Module'}
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-white/10 pb-2">Technical Specifications</h4>
                                    <ul className="space-y-4">
                                        {modules[activeModule].specs.map((spec, i) => (
                                            <li key={i} className="flex items-start gap-4 text-gray-700 dark:text-gray-300">
                                                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${modules[activeModule].color}`}></div>
                                                <span className="leading-relaxed font-medium">{spec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</div>
                                        <div className={`text-lg font-black ${activeModule < 5 ? 'text-green-500' : 'text-gray-500'}`}>
                                            {activeModule < 5 ? 'Operational' : 'Offline'}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Resource Load</div>
                                        <div className="text-lg font-black text-gray-900 dark:text-white">
                                            {activeModule < 5 ? Math.floor(Math.random() * 30) + 10 : 0}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default RequirementsDocs;
