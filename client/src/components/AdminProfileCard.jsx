import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import axios from 'axios';
import {
    UserIcon,
    IdentificationIcon,
    EnvelopeIcon,
    CpuChipIcon,
    ShieldCheckIcon,
    AcademicCapIcon,
    UserGroupIcon,
    BoltIcon,
    KeyIcon,
    XMarkIcon,
    LockClosedIcon,
} from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';
import { useToast } from '../context/ToastContext';
import { getApiUrl } from '../config/api';

// Optimized HUD Animations
const hudStyles = `
@keyframes scan {
  0% { left: -10%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { left: 110%; opacity: 0; }
}
.animate-scan {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: currentColor;
  box-shadow: 0 0 15px currentColor;
  animation: scan 4s linear infinite;
  pointer-events: none;
}
`;

const BackgroundOrbs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 transition-opacity duration-1000" />
        <div className="absolute -bottom-60 -right-60 w-[800px] h-[800px] rounded-full bg-indigo-600/10 transition-opacity duration-1000" />
    </div>
);

const CircularMetric = ({ value, label, type, description, accentColor = "blue" }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className={`flex-1 rounded-xl p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-center border-[2px] border-slate-200 dark:border-white/10 shadow-2xl group transition-all duration-300 relative overflow-hidden transform-gpu antialiased contain-content`}
        >
            <div className="absolute inset-0 bg-white dark:bg-[#0a0f1d] z-0 pointer-events-none" />

            <div className={`absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-${accentColor}-500/40 z-10`} />
            <div className={`absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-${accentColor}-500/40 z-10`} />

            <div className={`absolute inset-0 bg-gradient-to-br from-${accentColor}-500/[0.03] to-indigo-500/[0.03] z-0`} />

            <div className="relative flex-shrink-0 z-10">
                <div className={`w-20 h-20 rounded-full border-2 border-${accentColor}-500/40 flex flex-col items-center justify-center bg-transparent relative overflow-hidden transition-all duration-300 group-hover:bg-${accentColor}-500/5`}>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-2xl font-black text-${accentColor}-500 leading-none tracking-tighter`}
                    >
                        {value}
                    </motion.span>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{type}</span>
                </div>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-[-15px] p-1 border border-dashed border-${accentColor}-500/10 rounded-full`}
                >
                    <div className={`w-2.5 h-2.5 rounded-full bg-${accentColor}-500 shadow-[0_0_15px_#3b82f6] absolute top-0 left-1/2 -translate-x-1/2`} />
                </motion.div>
            </div>

            <div className="flex-1 relative z-10 text-center sm:text-left">
                <h4 className={`text-[12px] font-black text-${accentColor}-500 uppercase tracking-[0.4em] mb-4`}>{label}</h4>
                <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-bold tracking-tight">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};

const StatItem = ({ icon: Icon, label, value, delay = 0, accent = "blue" }) => {
    const accentColors = {
        blue: "text-blue-500 bg-blue-500/10 shadow-blue-500/20",
        indigo: "text-indigo-500 bg-indigo-500/10 shadow-indigo-500/20",
        purple: "text-purple-500 bg-purple-500/10 shadow-purple-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 shadow-emerald-500/20",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="flex-1 min-w-[150px] rounded-xl p-5 sm:p-7 border-[2px] border-slate-200 dark:border-white/10 group transition-all duration-300 bg-white dark:bg-[#0a0f1d] relative overflow-hidden flex flex-col items-center text-center transform-gpu antialiased contain-content"
        >
            <div className={`absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-${accent}-500/40`} />
            <div className={`absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-${accent}-500/40`} />

            <div className={`w-14 h-14 rounded-lg ${accentColors[accent]} flex items-center justify-center mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="w-7 h-7" />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                <h4 className="text-[14px] font-black text-slate-900 dark:text-white tracking-tight leading-relaxed uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                    {value}
                </h4>
            </div>
        </motion.div>
    );
};

const AdminProfileCard = ({ user, stats }) => {
    const cardRef = useRef(null);
    const { addToast } = useToast();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 40, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 40, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addToast("Passwords do not match", "error");
            return;
        }

        setIsUpdating(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(getApiUrl(`/api/auth/users/${user._id}`), {
                password: passwordData.newPassword
            }, config);
            addToast("Command Pulse Updated Successfully", "success");
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            addToast(error.response?.data?.message || "Protocol Failure: Update Denied", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="w-full relative py-8 sm:py-12" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <style>{hudStyles}</style>
            <BackgroundOrbs />

            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-[1440px] mx-auto px-6 mb-12 relative"
            >
                <div className="flex items-center gap-6 overflow-hidden">
                    <div className="w-16 h-[2px] bg-blue-500/40" />
                    <h3 className="text-[12px] font-black text-blue-500 uppercase tracking-[0.8em] leading-relaxed relative flex items-center">
                        ADMINISTRATOR COMMAND CORE // V9.5.0
                        <div className="absolute h-full w-px bg-blue-400 z-10 animate-scan" />
                    </h3>
                </div>
            </motion.div>

            <motion.div
                ref={cardRef}
                style={{ rotateX, rotateY, perspective: 1500, willChange: "transform", transformStyle: "preserve-3d" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-[1440px] mx-auto relative group px-6 transform-gpu"
            >
                <div className="absolute -inset-20 bg-blue-500/5 rounded-[6rem] blur-[160px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                <div className="relative rounded-[2rem] p-10 lg:p-14 border-[3px] border-slate-200 dark:border-white/10 shadow-[0_80px_160px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden transition-all duration-300 transform-gpu backface-visibility-hidden contain-layout">
                    <div className="absolute inset-0 bg-white dark:bg-[#050810] z-0 pointer-events-none" />

                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] lg:[background-size:32px_32px]" />

                    <div className="absolute top-0 right-0 w-32 h-32 border-r-[4px] border-t-[4px] border-blue-500/20 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 border-l-[4px] border-b-2 border-blue-500/20 pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative z-20">
                        <div className="lg:col-span-4 space-y-12">
                            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                                <div className="relative mb-8">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="w-40 h-40 sm:w-48 sm:h-48 rounded-[3.5rem] bg-gradient-to-br from-blue-600 via-indigo-500 to-violet-600 p-1.5 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.2)] shadow-blue-500/20 overflow-hidden relative group/avatar cursor-pointer transform-gpu"
                                    >
                                        <div className="w-full h-full bg-white dark:bg-[#0a0c10] rounded-[3.35rem] flex items-center justify-center overflow-hidden transition-colors transform-gpu">
                                            <span className="text-8xl font-black text-slate-900 dark:text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] select-none">
                                                {user?.name?.substring(0, 1).toUpperCase() || 'A'}
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-[-1rem] border border-dashed border-blue-500/10 rounded-[3.5rem]"
                                    />
                                </div>

                                <div className="space-y-6">
                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight uppercase"
                                    >
                                        {user?.name || 'ADMINISTRATOR'}
                                    </motion.h1>

                                    <div className="inline-flex items-center gap-5 px-6 py-4 rounded-xl bg-blue-500/5 border-blue-500/40 border shadow-2xl w-full sm:w-auto">
                                        <div className="w-3.5 h-3.5 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="text-[12px] font-black text-blue-500 uppercase tracking-[0.4em]">
                                            LEVEL: SUPREME COMMAND
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-xl p-6 border-[2px] border-slate-200 dark:border-white/10 flex items-center gap-6 bg-white dark:bg-[#0a0f1d] shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
                                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-lg">
                                        <EnvelopeIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Primary Uplink</span>
                                        <p className="text-[14px] font-black text-slate-900 dark:text-slate-100 tracking-tight break-all">
                                            {user?.email?.toLowerCase() || 'admin@bitsathy.ac.in'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="w-full rounded-xl p-6 border-[2px] border-slate-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#0a0f1d] shadow-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all text-left"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-lg group-hover:scale-110 transition-transform">
                                            <KeyIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Security Protocol</span>
                                            <p className="text-[14px] font-black text-slate-900 dark:text-slate-100 tracking-tight">Change Command Pulse</p>
                                        </div>
                                    </div>
                                    <BoltIcon className="w-5 h-5 text-indigo-400 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all" />
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-8 flex flex-col justify-center space-y-12">
                            <div className="flex flex-col md:flex-row gap-8">
                                <CircularMetric
                                    value="99.98"
                                    type="%"
                                    label="System Stability"
                                    description="Live integrity check across all data nodes and neural interfaces."
                                    accentColor="blue"
                                />
                                <CircularMetric
                                    value={stats.pendingRequests || 0}
                                    type="Units"
                                    label="Priority Queue"
                                    description="Active operational requests requiring immediate authorization."
                                    accentColor="indigo"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatItem
                                    icon={AcademicCapIcon}
                                    label="COURSES"
                                    value={stats.totalCourses || 0}
                                    accent="blue"
                                />
                                <StatItem
                                    icon={UserGroupIcon}
                                    label="STUDENTS"
                                    value={stats.totalStudents || 0}
                                    accent="indigo"
                                />
                                <StatItem
                                    icon={IdentificationIcon}
                                    label="FACULTY"
                                    value={stats.totalFaculty || 0}
                                    accent="purple"
                                />
                                <StatItem
                                    icon={ShieldCheckIcon}
                                    label="STATUS"
                                    value="AUTHORISED"
                                    accent="emerald"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Change Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg bg-white dark:bg-[#0a0f1d] rounded-[2rem] border-[3px] border-blue-500/20 shadow-[0_0_100px_rgba(59,130,246,0.1)] overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />

                            <div className="p-10 relative z-10">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                            <LockClosedIcon className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Command Pulse Update</h2>
                                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em]">Security Access // Authorized</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                        <XMarkIcon className="w-8 h-8" />
                                    </button>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">New Terminal Secret</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-blue-500/50 transition-all font-mono"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Confirm Secret Alignment</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl px-6 py-4 text-slate-900 dark:text-white outline-none focus:border-blue-500/50 transition-all font-mono"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-5 rounded-xl uppercase tracking-widest shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isUpdating ? (
                                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <ShieldCheckIcon className="w-6 h-6" />
                                                Authorize Protocol Update
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminProfileCard;
