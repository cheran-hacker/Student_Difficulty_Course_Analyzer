import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    UserPlusIcon,
    EnvelopeIcon,
    KeyIcon,
    IdentificationIcon,
    AcademicCapIcon,
    CalendarDaysIcon,
    ExclamationTriangleIcon,
    SunIcon,
    MoonIcon,
    ShieldCheckIcon,
    ChartBarIcon
} from '@heroicons/react/24/solid';
import { API_ENDPOINTS } from '../config/api';
import { DEPARTMENTS } from '../config/departments';

const RegisterStudent = () => {
    const [darkMode, setDarkMode] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        department: '',
        email: '',
        password: '',
        year: 'III',
        semester: '5',
        gpa: 0,
        cgpa: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const departments = DEPARTMENTS;

    useEffect(() => {
        document.title = "Cadet Registration | Secure Terminal";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo?.token) {
                setError('Unauthorized: Admin session required');
                setLoading(false);
                return;
            }

            if (!formData.email.toLowerCase().endsWith('@bitsathy.ac.in')) {
                setError('Domain Access Denied: Official @bitsathy.ac.in email required');
                setLoading(false);
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            await axios.post(API_ENDPOINTS.USERS_ADMIN, formData, config);
            setSuccess(true);
            setTimeout(() => {
                window.close();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to initialize cadet account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${darkMode ? 'dark' : ''}`}>
            <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-500 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden font-outfit">

                {/* Ultra Background Layer */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/20 dark:bg-indigo-600/10 blur-[150px] rounded-full animate-float" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/20 dark:bg-purple-600/10 blur-[150px] rounded-full animate-float [animation-delay:2s]" />
                    <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] rounded-full animate-float [animation-delay:4s]" />
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    {/* Scanline Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent h-[40vh] w-full animate-scanline z-50 pointer-events-none opacity-50" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-6xl bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-[40px] rounded-[4rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] border border-white/40 dark:border-white/10 relative z-10 overflow-hidden flex flex-col md:flex-row min-h-[85vh]"
                >
                    {/* Left Panel: Information & Branding */}
                    <div className="md:w-[35%] bg-indigo-600 dark:bg-indigo-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-800 opacity-50" />
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 100 L100 0 L100 100 Z" fill="currentColor" />
                            </svg>
                        </div>

                        <div className="relative z-10">
                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl w-fit mb-8 border border-white/20">
                                <ShieldCheckIcon className="w-10 h-10" />
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tighter mb-6">Cadet Unified Enrollment</h1>
                            <p className="text-indigo-100/80 font-medium text-lg leading-relaxed">
                                Initialize high-fidelity student records within the academic analysis matrix.
                            </p>
                        </div>

                        <div className="relative z-10 space-y-6 pt-12 border-t border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
                                    <AcademicCapIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm uppercase tracking-widest text-indigo-200">System Priority</h4>
                                    <p className="text-xs text-white/60 font-medium">REAL-TIME DATA SYNC ENABLED</p>
                                </div>
                            </div>
                            <div className="text-[10px] uppercase font-black tracking-[0.3em] text-indigo-300">
                                SECURE TERMINAL V4.2.0RC
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: The Form */}
                    <div className="flex-grow p-8 md:p-14 overflow-y-auto max-h-[90vh] custom-scrollbar">
                        {/* Control Bar */}
                        <div className="flex justify-between items-center mb-12">
                            <div className="space-y-1">
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Onboarding Interface</h2>
                                <p className="text-3xl font-black text-slate-900 dark:text-white">Registration Portal</p>
                            </div>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-indigo-500/20 transition-all border border-transparent dark:border-white/5 active:scale-95"
                            >
                                {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                            </button>
                        </div>

                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center h-full text-center space-y-6 py-20"
                            >
                                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/20">
                                    <ShieldCheckIcon className="w-12 h-12 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Deployment Successful</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">The cadet has been successfully onboarded. This window will now close.</p>
                                </div>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-12">
                                {error && !error.includes('Domain') && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-4"
                                    >
                                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                                        {error}
                                    </motion.div>
                                )}

                                {/* Form Section: Identity */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-indigo-400">
                                            <IdentificationIcon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Identity Specifications</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-7 py-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg shadow-sm"
                                                placeholder="e.g. MARCUS AURELIUS"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Registration ID</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-7 py-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg shadow-sm"
                                                placeholder="7376XXXXXXXX"
                                                value={formData.studentId}
                                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Form Section: Academic */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-indigo-400">
                                            <AcademicCapIcon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Academic Deployment</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Department Sector</label>
                                            <div className="relative group">
                                                <select
                                                    required
                                                    className="w-full px-7 py-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer text-lg shadow-sm"
                                                    value={formData.department}
                                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                >
                                                    <option value="" disabled>SELECT ASSIGNED DEPARTMENT...</option>
                                                    {departments.map(dept => (
                                                        <option key={dept} value={dept} className="bg-white dark:bg-slate-900">{dept}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg className="w-6 h-6 border-l pl-2 border-slate-300 dark:border-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
                                            <div className="grid grid-cols-4 gap-4">
                                                {['I', 'II', 'III', 'IV'].map(y => (
                                                    <button
                                                        key={y}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, year: y })}
                                                        className={`py-5 rounded-2xl font-black text-lg transition-all border-2 ${formData.year === y
                                                            ? 'bg-indigo-600 border-indigo-600 dark:border-indigo-500 text-white shadow-xl shadow-indigo-600/30'
                                                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:border-indigo-500/30'
                                                            }`}
                                                    >
                                                        {y}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Section: Performance */}
                                <div className="space-y-8 bg-indigo-50/50 dark:bg-indigo-500/5 p-10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-500/10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-indigo-500 shadow-sm">
                                            <ChartBarIcon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Performance Baseline</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Current Semester</label>
                                            <select
                                                required
                                                className="w-full px-7 py-5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg shadow-sm appearance-none cursor-pointer"
                                                value={formData.semester}
                                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                                    <option key={s} value={s.toString()}>Semester {s}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Initial GPA</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full px-7 py-5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg shadow-sm"
                                                placeholder="0.00"
                                                value={formData.gpa}
                                                onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Initial CGPA</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full px-7 py-5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg shadow-sm"
                                                placeholder="0.00"
                                                value={formData.cgpa}
                                                onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Form Section: Auth */}
                                <div className="space-y-8 bg-slate-50 dark:bg-black/30 p-10 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-inner">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-slate-400 dark:text-indigo-400 shadow-sm">
                                            <KeyIcon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Security Credentials</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Official Email Address</label>
                                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">SECURE DOMAIN REQUIRED</span>
                                            </div>
                                            <input
                                                required
                                                type="email"
                                                className={`w-full px-7 py-5 rounded-2xl bg-white dark:bg-black border ${error && error.includes('Domain') ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200 dark:border-white/10'} text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg shadow-sm`}
                                                placeholder="cadet@bitsathy.ac.in"
                                                value={formData.email}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, email: e.target.value });
                                                    if (error && error.includes('Domain')) setError('');
                                                }}
                                            />
                                            <AnimatePresence>
                                                {error && error.includes('Domain') && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="mt-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-3"
                                                    >
                                                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                                                        {error}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Terminal Password</label>
                                            <input
                                                required
                                                type="password"
                                                className="w-full px-7 py-5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg shadow-sm"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-7 rounded-[2rem] bg-indigo-600 dark:bg-indigo-500 text-white font-black text-xl shadow-[0_20px_60px_rgba(79,70,229,0.4)] hover:shadow-[0_25px_80px_rgba(79,70,229,0.5)] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-4 group uppercase tracking-widest"
                                    >
                                        {loading ? (
                                            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-4 animate-pulse">
                                                    <UserPlusIcon className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                                                    Initialize Cadet Lifecycle
                                                </div>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>

                {/* Meta Info Footer */}
                <div className="mt-8 relative z-10 flex items-center gap-4 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Secure Transaction Layer Active
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export default RegisterStudent;
