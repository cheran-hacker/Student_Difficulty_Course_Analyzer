import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import {
    ShieldCheckIcon,
    LockClosedIcon,
    EnvelopeIcon,
    ArrowRightIcon,
    ExclamationTriangleIcon,
    CommandLineIcon,
    CpuChipIcon,
    KeyIcon
} from '@heroicons/react/24/outline';

const AdminLogin = () => {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'faculty') navigate('/faculty/dashboard');
            else navigate('/dashboard');
        }
    }, [navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.post(
                '/api/auth/login',
                { email, password }
            );

            if (data.role !== 'admin') {
                setError('PERMISSION_DENIED: ADMINISTRATIVE_KEY_REQUIRED');
                setLoading(false);
                return;
            }

            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'PROTOCOL_ERROR: INVALID_CREDENTIALS');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden selection:bg-indigo-500 selection:text-white transition-colors duration-1000">
            {/* Professional Background Architecture */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{
                        opacity: [0.1, 0.2, 0.1],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-[160px]"
                />
                <motion.div
                    animate={{
                        opacity: [0.05, 0.1, 0.05],
                        scale: [1.3, 1, 1.3]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-slate-500/10 dark:bg-slate-600/5 rounded-full blur-[160px]"
                />

                {/* HUD Scanline & Grid */}
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-[480px] relative z-10"
            >
                {/* ID Card Shell */}
                <div className="w-full relative group">
                    {/* Security Border Beam */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent rounded-[3rem] opacity-0 dark:opacity-20 group-hover:opacity-100 blur-[2px] transition-opacity duration-1000 animate-border-beam pointer-events-none"></div>

                    <div className="bg-white/90 dark:bg-[#0A0F1E] border border-white dark:border-white/10 rounded-[3rem] p-8 sm:p-10 md:p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] dark:shadow-[0_0_50px_-12px_rgba(79,70,229,0.1)] relative overflow-hidden interaction-card group transition-all duration-700">
                        {/* Inner Depth Glow */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5 pointer-events-none"></div>

                        {/* Professional Security Corner Decor */}
                        <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-slate-100 dark:border-white/5 rounded-tl-[3rem] pointer-events-none"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-slate-100 dark:border-white/5 rounded-br-[3rem] pointer-events-none"></div>

                        {/* Central Identity Header */}
                        <div className="flex flex-col items-center mb-12 text-center">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-24 h-24 rounded-[2.5rem] bg-slate-900 dark:bg-white/5 border-4 border-white dark:border-white/10 flex items-center justify-center mb-8 relative group cursor-pointer shadow-2xl shadow-slate-900/20 dark:shadow-none"
                            >
                                <div className="absolute inset-0 bg-indigo-500/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <ShieldCheckIcon className="w-12 h-12 text-white dark:text-indigo-400 relative z-10" />
                            </motion.div>

                            <div className="space-y-3">
                                <h1 className="text-4xl md:text-5xl font-black tracking-[-0.05em] text-[#1E293B] dark:text-white mb-1 uppercase leading-none">
                                    CENTRAL<br /><span className="text-indigo-600 dark:text-indigo-400 font-black">OVERRIDE</span>
                                </h1>
                                <div className="flex items-center gap-4 w-full opacity-40">
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-400 dark:to-white"></div>
                                    <span className="text-[10px] font-black tracking-[0.5em] text-[#64748B] dark:text-white/60 uppercase whitespace-nowrap">Root Administrator</span>
                                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-400 dark:to-white"></div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Status Module */}
                        <div className="bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-[1.5rem] p-5 mb-10 flex items-center gap-5 group/status transition-all hover:bg-slate-50 dark:hover:bg-black/40">
                            <div className="relative">
                                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                <div className="absolute inset-0 w-3 h-3 rounded-full bg-indigo-500 animate-ping opacity-50"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-[#1E293B] dark:text-white uppercase tracking-[0.1em] mb-0.5">Instance: Secured</span>
                                <span className="text-[9px] font-mono text-slate-400 dark:text-white/40 uppercase tracking-widest whitespace-nowrap">Awaiting Protocol Authorization...</span>
                            </div>
                            <div className="ml-auto opacity-10 group-hover/status:opacity-40 transition-opacity">
                                <CommandLineIcon className="w-5 h-5 text-slate-900 dark:text-white" />
                            </div>
                        </div>

                        {/* Secure Entry Protocol */}
                        <form onSubmit={submitHandler} className="space-y-8">
                            <div className="space-y-3 group/input">
                                <label className="text-[10px] font-black tracking-[0.3em] text-[#64748B] dark:text-white/90 uppercase ml-1 flex justify-between">
                                    Admin Protocol ID
                                    <KeyIcon className="w-3.5 h-3.5 text-indigo-500 opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <EnvelopeIcon className="h-5 w-5 text-slate-300 dark:text-white/20 group-focus-within/input:text-indigo-600 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-white/[0.1] border-2 border-slate-100 dark:border-white/20 focus:border-indigo-500/30 rounded-2xl text-[#1E293B] dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/60 transition-all outline-none font-bold text-sm"
                                        placeholder="root@studentiq.sys"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 group/input">
                                <label className="text-[10px] font-black tracking-[0.3em] text-[#64748B] dark:text-white/90 uppercase ml-1 flex justify-between">
                                    Security Access Key
                                    <LockClosedIcon className="w-3.5 h-3.5 text-indigo-500 opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-5 w-5 text-slate-300 dark:text-white/20 group-focus-within/input:text-indigo-600 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-white/[0.1] border-2 border-slate-100 dark:border-white/20 focus:border-indigo-500/30 rounded-2xl text-[#1E293B] dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/60 transition-all outline-none text-sm font-bold tracking-[0.3em]"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-5 bg-red-500/5 border-2 border-red-500/20 rounded-2xl flex items-center gap-4 backdrop-blur-md"
                                    >
                                        <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-tight">{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative group overflow-hidden bg-[#1E293B] dark:bg-white text-white dark:text-[#1E293B] py-6 rounded-2xl font-black text-sm tracking-[0.4em] uppercase transition-all shadow-2xl hover:-translate-y-1 hover:shadow-indigo-500/20 flex items-center justify-center gap-4 disabled:opacity-50 holographic-shine"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        AUTHORIZE ACCESS
                                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Exit Strategy */}
                        <div className="mt-12 flex flex-col items-center">
                            <Link
                                to="/login"
                                className="flex items-center gap-3 py-3 px-8 rounded-full border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group/exit"
                            >
                                <CommandLineIcon className="w-4 h-4 text-slate-300 group-hover/exit:text-indigo-600 transition-colors" />
                                <span className="text-[9px] font-black text-slate-400 dark:text-white/80 uppercase tracking-[0.3em] group-hover/exit:text-[#1E293B] dark:group-hover/exit:text-white transition-colors">Terminate Admin Session</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Secure Vault Diagnostic Footer */}
                <div className="mt-12 flex flex-col items-center opacity-20 hover:opacity-100 transition-opacity duration-700">
                    <div className="flex gap-6 mb-4 items-center">
                        <CpuChipIcon className="w-6 h-6 text-[#1E293B] dark:text-white" />
                        <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-400 dark:via-white to-transparent"></div>
                        <div className="flex gap-2.5 font-mono text-[9px] text-[#1E293B] dark:text-white font-bold">
                            <span>4096-BIT</span>
                            <span className="text-indigo-600 dark:text-indigo-400">ENCRYPTED</span>
                        </div>
                    </div>
                    <span className="text-[8px] font-black text-[#64748B] dark:text-white/80 uppercase tracking-[0.8em]">System Architecture v8.1.0 - Professional Instance</span>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
