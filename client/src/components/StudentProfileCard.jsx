import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

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
import {
    UserIcon,
    IdentificationIcon,
    EnvelopeIcon,
    AcademicCapIcon,
    CalendarIcon,
    ShieldCheckIcon,
    CpuChipIcon,
    CubeTransparentIcon,
    SwatchIcon,
} from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const BackgroundOrbs = ({ role }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full ${role === 'faculty' ? 'bg-emerald-500/10' : 'bg-indigo-500/5'} transition-opacity duration-1000`} />
        <div className={`absolute -bottom-60 -right-60 w-[800px] h-[800px] rounded-full ${role === 'faculty' ? 'bg-teal-600/10' : 'bg-purple-500/5'} transition-opacity duration-1000`} />
    </div>
);

const CircularMetric = ({ value, label, type, description, delay = 0, role }) => {
    const isFaculty = role === 'faculty';
    const accentColor = isFaculty ? "amber" : "indigo";

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className={`flex-1 rounded-xl p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-center border-[2px] border-slate-200 dark:border-white/10 shadow-2xl group transition-all duration-300 relative overflow-hidden transform-gpu antialiased contain-content`}
        >
            {/* HUD Sharp Layer - Removed all blurs for total clarity */}
            <div className="absolute inset-0 bg-white dark:bg-[#0a0f1d] z-0 pointer-events-none" />

            {/* Technical Bracket Corners */}
            <div className={`absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 ${isFaculty ? 'border-amber-500/40' : 'border-indigo-500/40'} z-10`} />
            <div className={`absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 ${isFaculty ? 'border-amber-500/40' : 'border-indigo-500/40'} z-10`} />

            <div className={`absolute inset-0 bg-gradient-to-br ${isFaculty ? 'from-amber-500/[0.03] to-orange-500/[0.03]' : 'from-indigo-500/[0.02] to-purple-500/[0.02]'} z-0`} />


            <div className="relative flex-shrink-0 z-10">
                <div className={`w-20 h-20 rounded-full border-2 ${isFaculty ? 'border-emerald-500/40' : 'border-indigo-500/40'} flex flex-col items-center justify-center bg-transparent relative overflow-hidden transition-all duration-300 group-hover:bg-${accentColor}-500/5`}>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-3xl font-black ${isFaculty ? 'text-emerald-500' : 'text-indigo-500'} leading-none tracking-tighter`}
                    >
                        {Number(value).toFixed(2)}
                    </motion.span>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{type}</span>
                </div>
                {/* Orbital System */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-15px] p-1 border border-dashed border-indigo-500/10 rounded-full"
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_15px_#6366f1] absolute top-0 left-1/2 -translate-x-1/2" />
                </motion.div>
            </div>

            <div className="flex-1 relative z-10 text-center sm:text-left">
                <h4 className={`text-[12px] font-black ${isFaculty ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400/90'} uppercase tracking-[0.4em] mb-4`}>{label}</h4>
                <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-bold tracking-tight">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};

const StatItem = ({ icon: Icon, label, value, delay = 0, accent = "indigo" }) => {
    const accentColors = {
        indigo: "text-indigo-500 bg-indigo-500/10 shadow-indigo-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 shadow-emerald-500/20",
        purple: "text-purple-500 bg-purple-500/10 shadow-purple-500/20",
        rose: "text-rose-500 bg-rose-500/10 shadow-rose-500/20",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="flex-1 min-w-[150px] rounded-xl p-5 sm:p-7 border-[2px] border-slate-200 dark:border-white/10 group transition-all duration-300 bg-white dark:bg-[#0a0f1d] relative overflow-hidden flex flex-col items-center text-center transform-gpu antialiased contain-content"
        >
            {/* Technical Accents */}
            <div className={`absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 ${accent === 'indigo' ? 'border-indigo-500/40' : 'border-purple-500/40'}`} />
            <div className={`absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 ${accent === 'indigo' ? 'border-indigo-500/40' : 'border-purple-500/40'}`} />

            <div className={`w-14 h-14 rounded-lg ${accentColors[accent]} flex items-center justify-center mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="w-7 h-7" />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                <h4 className="text-[14px] font-black text-slate-900 dark:text-white tracking-tight leading-relaxed uppercase">
                    {value}
                </h4>
            </div>
        </motion.div>
    );
};

const getStatusInfo = (level) => {
    if (level >= 20) return { text: 'TITAN TIER', color: 'text-amber-500' };
    if (level >= 15) return { text: 'ELITE TIER', color: 'text-indigo-500' };
    if (level >= 10) return { text: 'DEAN\'S LIST', color: 'text-blue-500' };
    if (level >= 5) return { text: 'SCHOLAR TIER', color: 'text-emerald-500' };
    return { text: 'NOVICE TIER', color: 'text-slate-500' };
};

const StudentProfileCard = ({ user }) => {
    const cardRef = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 40, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 40, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);
    const shineX = useTransform(mouseXSpring, [-0.5, 0.5], ["-10%", "110%"]);
    const shineY = useTransform(mouseYSpring, [-0.5, 0.5], ["-10%", "110%"]);

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

    return (
        <div className="w-full relative py-12 sm:py-20" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <style>{hudStyles}</style>
            <BackgroundOrbs role={user?.role} />

            {/* Top Identity Matrix Header */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-[1440px] mx-auto px-6 mb-16 relative"
            >
                <div className="flex items-center gap-6 overflow-hidden">
                    <div className={`w-16 h-[2px] ${user?.role === 'faculty' ? 'bg-emerald-500/60' : 'bg-indigo-500/40'}`} />
                    <h3 className={`text-[12px] font-black ${user?.role === 'faculty' ? 'text-emerald-500' : 'text-indigo-500'} uppercase tracking-[0.8em] leading-relaxed relative flex items-center`}>
                        {user?.role === 'faculty' ? 'FACULTY SCHOLAR IDENTITY MATRIX // V7.6.0' : 'ACADEMIC CORPUS IDENTITY MATRIX // V7.6.0'}
                        {/* Scanning beam */}
                        <div className={`absolute h-full w-px ${user?.role === 'faculty' ? 'bg-emerald-400' : 'bg-indigo-400'} z-10 animate-scan`} />
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
                {/* Massive Glow Aura */}
                <div className={`absolute -inset-20 ${user?.role === 'faculty' ? 'bg-emerald-500/5' : 'bg-indigo-500/5'} rounded-[6rem] blur-[160px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none`} />

                <div className="relative rounded-[2rem] p-10 lg:p-14 border-[3px] border-slate-200 dark:border-white/10 shadow-[0_80px_160px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden transition-all duration-300 transform-gpu backface-visibility-hidden contain-layout">
                    {/* HUD Absolute Sharp Layer */}
                    <div className="absolute inset-0 bg-white dark:bg-[#050810] z-0 pointer-events-none" />

                    {/* Technical Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] lg:[background-size:32px_32px]" />

                    {/* Role-Specific Technical Accents */}
                    <div className={`absolute top-0 right-0 w-32 h-32 border-r-[4px] border-t-[4px] ${user?.role === 'faculty' ? 'border-emerald-500/20' : 'border-indigo-500/20'} pointer-events-none`} />
                    <div className={`absolute bottom-0 left-0 w-32 h-32 border-l-[4px] border-b-[4px] ${user?.role === 'faculty' ? 'border-emerald-500/20' : 'border-indigo-500/20'} pointer-events-none`} />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative z-20">
                        {/* LEFT: Personal Identity */}
                        <div className="lg:col-span-5 space-y-12">
                            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                                {/* Enhanced Avatar with Orbital system */}
                                <div className="relative mb-8">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className={`w-44 h-44 sm:w-52 sm:h-52 rounded-[3.5rem] bg-gradient-to-br ${user?.role === 'faculty' ? 'from-emerald-600 via-emerald-500 to-teal-600' : 'from-indigo-600 via-indigo-500 to-purple-600'} p-1.5 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.2)] ${user?.role === 'faculty' ? 'shadow-emerald-500/30' : 'shadow-indigo-500/20'} overflow-hidden relative group/avatar cursor-pointer transform-gpu`}
                                    >
                                        <div className="w-full h-full bg-white dark:bg-[#0a0c10] rounded-[3.35rem] flex items-center justify-center overflow-hidden transition-colors transform-gpu">
                                            <span className={`text-9xl font-black ${user?.role === 'faculty' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'} drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] select-none`}>
                                                {user?.name?.substring(0, 1).toUpperCase() || 'S'}
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                                        </div>
                                    </motion.div>
                                    {/* Avatar Orbits */}
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-[-1rem] border border-dashed border-indigo-500/10 rounded-[3.5rem]"
                                    />
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-[-2rem] border border-indigo-500/5 rounded-[4.5rem]"
                                    />
                                </div>

                                <div className="space-y-6">
                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight uppercase"
                                    >
                                        {user?.role === 'faculty' ? (user?.name || 'FACULTY NAME') : (user?.name || 'STUDENT NAME')}
                                    </motion.h1>

                                    <div className={`inline-flex items-center gap-5 px-8 py-5 rounded-xl ${user?.role === 'faculty' ? 'bg-emerald-500/5 border-emerald-500/40' : 'bg-indigo-500/5 border-indigo-500/40'} border shadow-2xl w-full sm:w-auto`}>
                                        <div className={`w-3.5 h-3.5 rounded-full ${user?.role === 'faculty' ? 'bg-emerald-500' : 'bg-indigo-500'} animate-pulse`} />
                                        <span className={`text-[14px] font-black ${user?.role === 'faculty' ? 'text-emerald-500' : getStatusInfo(user?.level || 1).color} uppercase tracking-[0.6em]`}>
                                            {user?.role === 'faculty' ? 'STATUS: DISTINGUISHED' : `STATUS: ${getStatusInfo(user?.level || 1).text}`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Email Box & Theme Control */}
                            {/* Full-Width Communications HUD */}
                            <div className="space-y-6">
                                <div className="rounded-xl p-6 border-[2px] border-slate-200 dark:border-white/10 flex items-center gap-8 bg-white dark:bg-[#0a0f1d] shadow-2xl relative overflow-hidden group transition-all duration-300">
                                    {/* Bracket Accents */}
                                    <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-emerald-500/40" />

                                    <div className="w-14 h-14 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-lg">
                                        <EnvelopeIcon className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Primary Uplink</span>
                                        <p className="text-[16px] font-black text-slate-900 dark:text-slate-100 tracking-tight break-all">
                                            {user?.email?.toLowerCase() || 'student@bitsathy.ac.in'}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl p-8 border-[2px] border-slate-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#0a0f1d] shadow-2xl relative overflow-hidden">
                                    {/* Bracket Accents */}
                                    <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-indigo-500/40" />

                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">System Protocol</span>
                                        <h4 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Neural Interface Switch</h4>
                                    </div>
                                    <ThemeToggle />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Performance & Academic Specs */}
                        <div className="lg:col-span-7 flex flex-col justify-center space-y-12">
                            {/* Cinematic Metrics */}
                            <div className="flex flex-col md:flex-row gap-8">
                                <CircularMetric
                                    value={user?.role === 'faculty' ? (user?.rating || 0) : (user?.gpa || 0)}
                                    type={user?.role === 'faculty' ? "Rating" : "GPA"}
                                    label={user?.role === 'faculty' ? "Instructional Quality" : "Academic Velocity"}
                                    description={user?.role === 'faculty'
                                        ? "Calculated average based on validated student feedback loops."
                                        : "Live performance vector based on cumulative unit completion."}
                                    delay={0.4}
                                    role={user?.role}
                                />
                                <CircularMetric
                                    value={user?.role === 'faculty' ? (user?.impact || 0) : (user?.cgpa || 0)}
                                    type={user?.role === 'faculty' ? "Impact" : "CGPA"}
                                    label={user?.role === 'faculty' ? "Engagement Index" : "Neural Index"}
                                    description={user?.role === 'faculty'
                                        ? "Overall sentiment and resource contribution weightage."
                                        : "Historical data stabilization complete across all active cycles."}
                                    delay={0.5}
                                    role={user?.role}
                                />
                            </div>

                            {/* Stat Grid - responsive adjust to prevent truncation */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                                <StatItem
                                    icon={IdentificationIcon}
                                    label="REGISTRY"
                                    value={user?.studentId || (user?.role === 'faculty' ? 'ST-7376-FAC' : '7376232IT122')}
                                    accent={user?.role === 'faculty' ? "emerald" : "indigo"}
                                    delay={0.6}
                                />
                                <StatItem
                                    icon={AcademicCapIcon}
                                    label="DEPT"
                                    value={user?.department || (user?.role === 'faculty' ? 'General Engineering' : 'Information Technology')}
                                    accent={user?.role === 'faculty' ? "purple" : "purple"}
                                    delay={0.7}
                                />
                                <StatItem
                                    icon={user?.role === 'faculty' ? SwatchIcon : CalendarIcon}
                                    label={user?.role === 'faculty' ? "COURSES" : "SEMESTER"}
                                    value={user?.role === 'faculty' ? (user?.totalCourses || '0') : (user?.semester || '6')}
                                    accent={user?.role === 'faculty' ? "emerald" : "emerald"}
                                    delay={0.8}
                                />
                                <StatItem
                                    icon={user?.role === 'faculty' ? CpuChipIcon : CubeTransparentIcon}
                                    label={user?.role === 'faculty' ? "REVIEWS" : "YEAR"}
                                    value={user?.role === 'faculty' ? (user?.totalFeedbacks || '0') : (user?.year || 'III')}
                                    accent={user?.role === 'faculty' ? "rose" : "rose"}
                                    delay={0.9}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StudentProfileCard;
