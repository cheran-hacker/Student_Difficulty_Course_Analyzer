import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    UserCircleIcon,
    EnvelopeIcon,
    LockClosedIcon,
    ArrowRightIcon,
    IdentificationIcon,
    BuildingLibraryIcon,
    AcademicCapIcon,
    BookOpenIcon,
    CalendarIcon
} from '@heroicons/react/24/solid';
import { API_ENDPOINTS } from '../config/api';
import { DEPARTMENTS } from '../config/departments';

const BackgroundOrbs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none transform-gpu">
        <motion.div
            animate={{
                x: [0, 80, -40, 0],
                y: [0, -80, 40, 0],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] will-change-transform"
        />
        <motion.div
            animate={{
                x: [0, -60, 100, 0],
                y: [0, 100, -60, 0],
            }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-60 -right-60 w-[700px] h-[700px] bg-purple-500/10 rounded-full blur-[130px] will-change-transform"
        />
    </div>
);

const Register = () => {
    const [formData, setFormData] = useState({
        studentId: '',
        name: '',
        department: '',
        year: '',
        semester: '',
        course: '', // Primary course selection
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [availableCourses, setAvailableCourses] = useState([]);
    const [isAdminRegistration, setIsAdminRegistration] = useState(false);
    const [secretKey, setSecretKey] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            navigate(userInfo.role === 'admin' ? '/admin' : '/dashboard');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchCoursesByDept = async () => {
            if (!formData.department) {
                setAvailableCourses([]);
                return;
            }
            try {
                const { data } = await axios.get(`${API_ENDPOINTS.COURSES}?department=${encodeURIComponent(formData.department)}`);
                setAvailableCourses(data.courses || []);
            } catch (error) {
                console.error("Failed to fetch courses", error);
                setAvailableCourses([]);
            }
        };
        fetchCoursesByDept();
    }, [formData.department]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const { password, confirmPassword, email } = formData;

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        if (!email.toLowerCase().endsWith('@bitsathy.ac.in')) {
            alert("Access Restricted: Please use your institutional email (@bitsathy.ac.in)");
            return;
        }

        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            let role = 'student';
            if (isAdminRegistration) {
                if (secretKey !== 'admin123') {
                    alert("Invalid Admin Key");
                    return;
                }
                role = 'admin';
            }

            const { data } = await axios.post(API_ENDPOINTS.REGISTER, { ...formData, role }, config);
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.dispatchEvent(new Event('storage'));
            navigate(data.role === 'admin' ? '/admin' : '/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Registration failed');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const years = ['I', 'II', 'III', 'IV'];
    const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0c10] text-slate-900 dark:text-white flex items-center justify-center p-4 py-16 relative overflow-hidden font-sans selection:bg-indigo-500/30 transition-colors duration-500">
            <BackgroundOrbs />

            <div className="absolute inset-0 bg-slate-100/20 dark:bg-[#0a0c10]/20 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.01] dark:via-white/[0.01] to-transparent bg-[length:100%_4px] opacity-30" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-2xl relative z-10"
            >
                <div className="relative rounded-[4rem] p-8 md:p-14 border border-slate-200 dark:border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden transform-gpu antialiased transition-all duration-500">
                    <div className="absolute inset-0 bg-white/80 dark:bg-[#12141a]/95 backdrop-blur-[40px] z-0" />

                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative z-10">
                        <div className="text-center mb-12">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 mb-8 shadow-3xl shadow-indigo-500/20 relative group"
                            >
                                <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />
                                <AcademicCapIcon className="w-12 h-12 text-white relative z-10" />
                            </motion.div>
                            <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase leading-[0.9]">
                                Create Account
                            </h2>
                            <div className="flex items-center justify-center gap-4">
                                <div className="h-px w-8 bg-indigo-500/20 dark:bg-indigo-500/40" />
                                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.5em]">Academic Network node</p>
                                <div className="h-px w-8 bg-indigo-500/20 dark:bg-indigo-500/40" />
                            </div>
                        </div>

                        <motion.form
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            onSubmit={handleRegister}
                            className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-7"
                        >
                            <motion.div variants={itemVariants} className="md:col-span-6 space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300 ml-1">Register Number</label>
                                <div className="relative group/input">
                                    <IdentificationIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-600 dark:group-focus-within/input:text-white transition-colors" />
                                    <input
                                        type="text"
                                        name="studentId"
                                        className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 focus:border-indigo-500/40 rounded-2xl py-4.5 pl-12 pr-4 outline-none text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-gray-600 transition-all focus:bg-white focus:dark:bg-white/[0.05]"
                                        placeholder="e.g. 7376231CS101"
                                        value={formData.studentId}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="md:col-span-6 space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300 ml-1">Full Name</label>
                                <div className="relative group/input">
                                    <UserCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-600 dark:group-focus-within/input:text-white transition-colors" />
                                    <input
                                        type="text"
                                        name="name"
                                        className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 focus:border-indigo-500/40 rounded-2xl py-4.5 pl-12 pr-4 outline-none text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-gray-600 transition-all focus:bg-white focus:dark:bg-white/[0.05]"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="md:col-span-12 space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300 ml-1">Department</label>
                                <div className="relative group/input">
                                    <BuildingLibraryIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-600 dark:group-focus-within/input:text-white transition-colors" />
                                    <select
                                        name="department"
                                        className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 focus:border-indigo-500/40 rounded-2xl py-4.5 pl-12 pr-10 outline-none text-slate-900 dark:text-white font-bold appearance-none transition-all focus:bg-white focus:dark:bg-white/[0.05] cursor-pointer"
                                        value={formData.department}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled className="bg-white dark:bg-[#1a1c23] text-slate-400 dark:text-gray-500">Select Department</option>
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept} className="bg-white dark:bg-[#1a1c23] text-slate-900 dark:text-white">{dept}</option>
                                        ))}
                                    </select>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="md:col-span-6 space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300 ml-1">Year</label>
                                <div className="relative group/input">
                                    <AcademicCapIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-600 dark:group-focus-within/input:text-white transition-colors" />
                                    <select
                                        name="year"
                                        className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 focus:border-indigo-500/40 rounded-2xl py-4.5 pl-12 pr-10 outline-none text-slate-900 dark:text-white font-bold appearance-none transition-all focus:bg-white focus:dark:bg-white/[0.05] cursor-pointer"
                                        value={formData.year}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled className="bg-white dark:bg-[#1a1c23] text-slate-400 dark:text-gray-500">Select Year</option>
                                        {years.map(y => (
                                            <option key={y} value={y} className="bg-white dark:bg-[#1a1c23] text-slate-900 dark:text-white">Year {y}</option>
                                        ))}
                                    </select>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="md:col-span-6 space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300 ml-1">Semester</label>
                                <div className="relative group/input">
                                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-600 dark:group-focus-within/input:text-white transition-colors" />
                                    <select
                                        name="semester"
                                        className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 focus:border-indigo-500/40 rounded-2xl py-4.5 pl-12 pr-10 outline-none text-slate-900 dark:text-white font-bold appearance-none transition-all focus:bg-white focus:dark:bg-white/[0.05] cursor-pointer"
                                        value={formData.semester}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled className="bg-white dark:bg-[#1a1c23] text-slate-400 dark:text-gray-500">Select Semester</option>
                                        {semesters.map(s => (
                                            <option key={s} value={s} className="bg-white dark:bg-[#1a1c23] text-slate-900 dark:text-white">Semester {s}</option>
                                        ))}
                                    </select>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="md:col-span-12 space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300 ml-1">Course (Optional)</label>
                                <div className="relative group/input">
                                    <BookOpenIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-600 dark:group-focus-within/input:text-white transition-colors" />
                                    <select
                                        name="course"
                                        className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 focus:border-indigo-500/40 rounded-2xl py-4.5 pl-12 pr-10 outline-none text-slate-900 dark:text-white font-bold appearance-none transition-all focus:bg-white focus:dark:bg-white/[0.05] cursor-pointer"
                                        value={formData.course}
                                        onChange={handleChange}
                                    >
                                        <option value="" className="bg-white dark:bg-[#1a1c23] text-slate-400 dark:text-gray-500">-- Select a Course --</option>
                                        {availableCourses.map(c => (
                                            <option key={c._id} value={c._id} className="bg-white dark:bg-[#1a1c23] text-slate-900 dark:text-white">{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="md:col-span-12 space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300 ml-1">Email Address</label>
                                <div className="relative group/input">
                                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-600 dark:group-focus-within/input:text-white transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 focus:border-indigo-500/40 rounded-2xl py-4.5 pl-12 pr-4 outline-none text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-gray-600 transition-all focus:bg-white focus:dark:bg-white/[0.05]"
                                        placeholder="student@bitsathy.ac.in"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="md:col-span-6 space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300 ml-1">Password</label>
                                <div className="relative group/input">
                                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-600 dark:group-focus-within/input:text-white transition-colors" />
                                    <input
                                        type="password"
                                        name="password"
                                        className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 focus:border-indigo-500/40 rounded-2xl py-4.5 pl-12 pr-4 outline-none text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-gray-600 transition-all focus:bg-white focus:dark:bg-white/[0.05]"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="md:col-span-6 space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300 ml-1">Confirm Password</label>
                                <div className="relative group/input">
                                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-600 dark:group-focus-within/input:text-white transition-colors" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 focus:border-indigo-500/40 rounded-2xl py-4.5 pl-12 pr-4 outline-none text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-gray-600 transition-all focus:bg-white focus:dark:bg-white/[0.05]"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.button
                                variants={itemVariants}
                                whileHover={{ scale: 1.01, boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.4)" }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="md:col-span-12 font-black py-5 rounded-[2rem] bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-3xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-4 mt-8 text-xs uppercase tracking-[0.35em] border border-white/10"
                            >
                                Initialize Profile <ArrowRightIcon className="w-5 h-5" />
                            </motion.button>
                        </motion.form>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="mt-12 text-center"
                        >
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-white/5 to-transparent mb-8" />
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                                Established Entity?{' '}
                                <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-white transition-colors ml-2">
                                    Portal Authentication
                                </Link>
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
