import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightOnRectangleIcon, ChartBarIcon, SparklesIcon, BoltIcon, TrophyIcon } from '@heroicons/react/24/solid';
import ThemeToggle from './ThemeToggle';
import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import StudentProfileCard from './StudentProfileCard';
import axios from 'axios';
import { getApiUrl } from '../config/api';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [userInfo, setUserUserInfo] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Sync Auth State on Location Change
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('userInfo'));
        setUserUserInfo(storedUser);
    }, [location]);

    // Detect Scroll for Glass Effect intensity
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const logoutHandler = () => {
        const role = userInfo?.role;
        localStorage.removeItem('userInfo');
        setUserUserInfo(null);

        if (role === 'admin') {
            navigate('/admin/login');
        } else {
            navigate('/login');
        }
    };

    const isAuthPage = ['/login', '/register', '/admin/login', '/'].includes(location.pathname);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 w-full z-50 transition-all duration-500 theme-transition ${scrolled || !isAuthPage ? 'bg-white/95 dark:bg-[#030712]/95 shadow-lg shadow-indigo-500/5 border-b border-slate-200/50 dark:border-white/5' : 'bg-transparent border-transparent'}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo Section */}
                    <Link to="/" className="group flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:rotate-12 transition-transform duration-300">
                            <BoltIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                                Student<span className="text-indigo-500">IQ</span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500 group-hover:text-indigo-500 transition-colors">
                                Analytics OS
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        <ThemeToggle />

                        <div className="h-8 w-px bg-slate-200 dark:bg-gray-800"></div>

                        {userInfo ? (
                            <div className="flex items-center gap-4">
                                {/* Hiding Rankings as requested
                                {userInfo.role !== 'admin' && (
                                    <Link
                                        to="/leaderboard"
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 dark:text-gray-300 font-bold text-sm hover:text-amber-500 dark:hover:text-amber-400 transition-all group"
                                    >
                                        <TrophyIcon className="w-4 h-4 group-hover:scale-110 transition-transform text-amber-500" />
                                        <span>Rankings</span>
                                    </Link>
                                )}
                                */}

                                <Link
                                    to={userInfo.role === 'admin' ? '/admin' : (userInfo.role === 'faculty' ? '/faculty/dashboard' : '/dashboard')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 font-bold text-sm hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-all group border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30"
                                >
                                    <ChartBarIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    {userInfo.role === 'admin' ? 'Command Center' : (userInfo.role === 'faculty' ? 'Faculty Portal' : 'Dashboard')}
                                </Link>

                                {userInfo.role === 'faculty' && (
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 dark:text-gray-400 font-bold text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                                    >
                                        <SparklesIcon className="w-4 h-4" />
                                        <span>Student View</span>
                                    </Link>
                                )}

                                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-gray-800">
                                    <div className="text-right hidden lg:block">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-none mb-1">{userInfo.name.split(' ')[0]}</p>
                                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-700 text-[9px] font-bold text-slate-400 uppercase tracking-wider">{userInfo.role}</span>
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                            if (userInfo.role === 'admin') {
                                                navigate('/admin/profile');
                                            } else {
                                                navigate('/profile');
                                            }
                                        }}
                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-md cursor-pointer hover:shadow-indigo-500/40 transition-shadow"
                                    >
                                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-xs font-black text-slate-600 dark:text-gray-300">
                                            {userInfo.name.charAt(0)}
                                        </div>
                                    </motion.div>
                                    <button
                                        onClick={logoutHandler}
                                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                        title="Disconnect"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-gray-300 hover:text-indigo-500 transition">Log In</Link>
                                <Link to="/register" className="group relative px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all overflow-hidden border border-transparent dark:border-white/10">
                                    <span className="relative z-10 flex items-center gap-2">
                                        Get Started <SparklesIcon className="w-4 h-4 text-yellow-400" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </motion.nav>
    );
};

export default Navbar;
