import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import {
    UserIcon,
    LockClosedIcon,
    AcademicCapIcon,
    BuildingLibraryIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
    SparklesIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

const Login = () => {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // 'student' or 'faculty'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Role-specific aesthetic mapping
    const aesthetics = {
        student: {
            primary: '#0D9488', // Teal 600
            bg: 'from-teal-500/10 to-indigo-500/10',
            glow: 'shadow-teal-500/30',
            border: 'group-focus-within:border-teal-500/30',
            icon: 'text-teal-600',
            button: 'bg-[#0D9488] hover:bg-[#0F766E] shadow-teal-500/20'
        },
        faculty: {
            primary: '#6366F1', // Indigo 500 (Brighter)
            bg: 'from-indigo-500/10 to-purple-500/10',
            glow: 'shadow-indigo-500/30',
            border: 'group-focus-within:border-indigo-500/40',
            icon: 'text-indigo-400',
            button: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
        }
    };

    const currentStyle = aesthetics[role];

    useEffect(() => {
        if (location.state?.role) {
            setRole(location.state.role);
        }

        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'faculty') navigate('/faculty/dashboard');
            else navigate('/dashboard');
        }
    }, [navigate, location]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.post(
                '/api/auth/login',
                { email, password }
            );

            localStorage.setItem('userInfo', JSON.stringify(data));

            if (data.role === 'admin') navigate('/admin');
            else if (data.role === 'faculty') navigate('/faculty/dashboard'); // Correct route for faculty
            else if (data.role === 'student') navigate('/dashboard');
            else navigate('/dashboard'); // Fallback
        } catch (err) {
            setError(err.response?.data?.message || 'Access Denied: Terminal mismatch or invalid keys');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden selection:bg-teal-500 selection:text-white transition-colors duration-1000">
            {/* Background Architecture */}
            <div className="absolute inset-0 pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={role}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br ${currentStyle.bg} rounded-full blur-[140px]`}
                    />
                </AnimatePresence>

                {/* HUD Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-[480px] relative z-10"
            >
                {/* Main Card */}
                <div className="w-full relative group">
                    {/* Animated Border Beam - Only visible in dark mode or on hover to add depth */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent rounded-[3rem] opacity-0 dark:opacity-20 group-hover:opacity-100 blur-[2px] transition-opacity duration-1000 animate-border-beam pointer-events-none"></div>

                    <div className="bg-white/90 dark:bg-[#0A0F1E] rounded-[3rem] p-8 sm:p-10 md:p-12 overflow-hidden relative border border-white dark:border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] dark:shadow-[0_0_50px_-12px_rgba(13,148,136,0.1)] interaction-card transition-all duration-700">
                        {/* Inner Depth Glow */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5 pointer-events-none"></div>

                        {/* Header: Dynamic Icon & Title */}
                        <div className="flex flex-col items-center mb-10 text-center">
                            <motion.div
                                animate={{ backgroundColor: currentStyle.primary }}
                                className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl ${currentStyle.glow} border-4 border-white dark:border-white/10 transition-all duration-700`}
                            >
                                <AnimatePresence mode="wait">
                                    {role === 'student' ? (
                                        <motion.div
                                            key="stud-icon"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                        >
                                            <AcademicCapIcon className="w-12 h-12 text-white" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="fac-icon"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                        >
                                            <BuildingLibraryIcon className="w-12 h-12 text-white" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            <div className="space-y-3">
                                <AnimatePresence mode="wait">
                                    <motion.h1
                                        key={role}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-4xl md:text-5xl font-black tracking-[-0.05em] text-[#1E293B] dark:text-white leading-none uppercase"
                                    >
                                        {role === 'student' ? 'STUDENT' : 'FACULTY'}<br />ACCESS
                                    </motion.h1>
                                </AnimatePresence>
                                <div className="flex items-center gap-4 py-1">
                                    <div className="h-[1px] flex-1 bg-slate-100 dark:bg-white/20"></div>
                                    <span className={`text-[10px] font-black tracking-[0.4em] uppercase whitespace-nowrap transition-colors ${role === 'faculty' ? 'text-indigo-300' : 'text-slate-400 dark:text-slate-300'}`}>Academic Network Node</span>
                                    <div className="h-[1px] flex-1 bg-slate-100 dark:bg-white/20"></div>
                                </div>
                            </div>
                        </div>

                        {/* Role Switcher: Professional Toggle */}
                        <div className="flex p-1.5 bg-slate-100/50 dark:bg-white/5 rounded-2xl mb-12 relative border border-slate-200 dark:border-white/5">
                            <motion.div
                                layoutId="activeRole"
                                className={`absolute inset-y-1.5 shadow-lg ${currentStyle.glow} rounded-xl`}
                                animate={{ backgroundColor: currentStyle.primary }}
                                style={{
                                    width: 'calc(50% - 6px)',
                                    left: role === 'student' ? '6px' : 'calc(50% + 6px)'
                                }}
                                transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                            />
                            <button
                                onClick={() => setRole('student')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-[10px] font-black tracking-widest transition-all duration-500 relative z-10 ${role === 'student' ? 'text-white' : 'text-slate-400 dark:text-gray-400'}`}
                            >
                                <UserIcon className="w-4 h-4" /> STUDENT
                            </button>
                            <button
                                onClick={() => setRole('faculty')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-[10px] font-black tracking-widest transition-all duration-500 relative z-10 ${role === 'faculty' ? 'text-white' : 'text-slate-400 dark:text-gray-400'}`}
                            >
                                <BuildingLibraryIcon className="w-4 h-4" /> FACULTY
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={submitHandler} className="space-y-8">
                            <div className="space-y-3 group">
                                <label className={`text-[10px] font-black tracking-widest uppercase ml-1 flex justify-between transition-colors ${role === 'faculty' ? 'text-indigo-300' : 'text-[#64748B] dark:text-white/90'}`}>
                                    {role === 'student' ? 'Register Number / Email' : 'Professional Identifer'}
                                    <span className="opacity-60">{loading ? 'VERIFYING...' : 'REQUIRED'}</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <UserIcon className={`h-5 w-5 ${currentStyle.icon} opacity-30 group-focus-within:opacity-100 transition-all duration-500`} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`block w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-white/[0.1] border-2 border-slate-100 dark:border-white/20 ${currentStyle.border} rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/70 transition-all outline-none font-bold text-sm`}
                                        placeholder={role === 'student' ? "yourbox@bitsathy.ac.in" : "faculty.name@bitsathy.ac.in"}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 group">
                                <label className={`text-[10px] font-black tracking-widest uppercase ml-1 flex justify-between transition-colors ${role === 'faculty' ? 'text-indigo-300' : 'text-[#64748B] dark:text-white/90'}`}>
                                    Security Portal Key
                                    <LockClosedIcon className="w-3 h-3 opacity-20" />
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <LockClosedIcon className={`h-5 w-5 ${currentStyle.icon} opacity-30 group-focus-within:opacity-100 transition-all duration-500`} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`block w-full pl-14 pr-12 py-5 bg-slate-50 dark:bg-white/[0.1] border-2 border-slate-100 dark:border-white/20 ${currentStyle.border} rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/60 transition-all outline-none font-bold text-sm tracking-widest`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="hidden"
                                    />
                                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${rememberMe ? `${currentStyle.button} border-transparent` : 'bg-slate-50 dark:bg-white/10 border-slate-200 dark:border-white/20 group-hover:border-slate-300'}`}>
                                        {rememberMe && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors ${role === 'faculty' ? 'text-indigo-300/90 group-hover:text-white' : 'text-slate-500 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-white'}`}>Session Lock</span>
                                </label>
                                <Link to="/recovery" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${role === 'faculty' ? 'text-indigo-300/80 hover:text-white' : 'text-slate-400 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-teal-400'}`}>Recovery</Link>
                            </div>

                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-3 backdrop-blur-md"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full relative group overflow-hidden ${currentStyle.button} text-white py-6 rounded-2xl font-black text-sm tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-4 disabled:opacity-50 holographic-shine`}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        INITIALIZE HASH
                                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer: Multi-Action Area */}
                        <div className="mt-10 flex flex-col items-center gap-8">
                            {/* Registration Link: Consolidated for professional layout */}
                            <Link to="/register" className="group flex flex-col items-center gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${role === 'faculty' ? 'text-indigo-300/60 group-hover:text-white' : 'text-slate-400 dark:text-slate-400 group-hover:dark:text-white'}`}>Non-Enrolled Entity?</span>
                                <div className="px-8 py-3 rounded-2xl border border-slate-100 dark:border-white/10 group-hover:border-teal-500/50 group-hover:bg-teal-500/5 transition-all duration-500">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-[#1E293B] dark:text-white/90 flex items-center gap-3 group-hover:dark:text-white">
                                        CREATE ACCOUNT <SparklesIcon className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
                                    </span>
                                </div>
                            </Link>

                            <Link
                                to="/admin/login"
                                className="flex items-center gap-3 group transition-all duration-500"
                            >
                                <ShieldCheckIcon className={`w-4 h-4 transition-colors ${role === 'faculty' ? 'text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-amber-500'}`} />
                                <span className={`text-[9px] font-black tracking-[0.4em] uppercase transition-colors ${role === 'faculty' ? 'text-indigo-300/70 group-hover:text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white'}`}>Secure Admin Override</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
