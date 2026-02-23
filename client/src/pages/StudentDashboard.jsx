import { useState, useEffect, useRef, memo, useMemo, forwardRef } from 'react';
import axios from 'axios';
import { SparklesIcon, BookOpenIcon, PlusCircleIcon, ArrowRightIcon, FireIcon, MagnifyingGlassIcon, FunnelIcon, LinkIcon, DocumentIcon, PlayIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import RouteTransition from '../components/RouteTransition';
import RequestCourseModal from '../components/RequestCourseModal';
import CourseSkeleton from '../components/CourseSkeleton';
import ThemeToggle from '../components/ThemeToggle';
import LevelUpModal from '../components/LevelUpModal';

import { API_ENDPOINTS, getApiUrl } from '../config/api';
import GamificationCard from '../components/GamificationCard';
import { useToast } from '../context/ToastContext'; // Added Toast
import { Dialog } from '@headlessui/react'; // For confirmations
import AnnouncementFeed from '../components/AnnouncementFeed';
import { MegaphoneIcon } from '@heroicons/react/24/outline';
// import StudentProfileCard from '../components/StudentProfileCard';


const Counter = memo(({ value }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseInt(value);
        if (start === end) {
            setCount(end);
            return;
        }
        let totalMiliseconds = 1500;
        let incrementTime = Math.max(totalMiliseconds / end, 16);
        let timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start === end) clearInterval(timer);
        }, incrementTime);
        return () => clearInterval(timer);
    }, [value]);
    return <span>{count}</span>;
});

const DEPT_MAP = {
    'CSE': 'Computer Science and Engineering',
    'IT': 'Information Technology',
    'AIDS': 'Artificial Intelligence and Data Science',
    'AIML': 'Artificial Intelligence and Machine Learning',
    'ISE': 'Information Science and Engineering',
    'CT': 'Computer Technology',
    'ECE': 'Electronics and Communication Engineering',
    'EEE': 'Electrical and Electronics Engineering',
    'Mechanical': 'Mechanical Engineering',
    'Civil': 'Civil Engineering',
    'Biotechnology': 'Biotechnology',
    'Aerospace': 'Aerospace Engineering',
    'Automobile': 'Automobile Engineering',
    'Robotics': 'Robotics and Automation',
    'CSBS': 'Computer Science and Business Systems',
    'Agrl': 'Agricultural Engineering',
    'Biomedical': 'Biomedical Engineering',
    'EIE': 'Electronics and Instrumentation Engineering',
    'Mechatronics': 'Mechatronics Engineering',
    'CSD': 'Computer Science and Design',
    'Chemical': 'Chemical Engineering',
    'Fashion': 'Fashion Technology',
    'Food': 'Food Technology',
    'Textile': 'Textile Technology',
    'MBA': 'Master of Business Administration'
};

const PREFERRED_DEPT_ORDER = [
    'All',
    DEPT_MAP['CSE'],
    DEPT_MAP['IT'],
    DEPT_MAP['AIDS'],
    DEPT_MAP['AIML'],
    DEPT_MAP['ECE'],
    DEPT_MAP['EEE'],
    DEPT_MAP['Mechanical'],
    DEPT_MAP['Civil'],
    DEPT_MAP['Biotechnology'],
    DEPT_MAP['Aerospace'],
    DEPT_MAP['Automobile'],
    DEPT_MAP['Robotics'],
    DEPT_MAP['CSBS'],
    'Computer Technology',
    'Information Science and Engineering',
    'Textile Technology',
    'Fashion Technology',
    'Food Technology',
    'Agricultural Engineering',
    'Biomedical Engineering',
    DEPT_MAP['EIE'],
    DEPT_MAP['Mechatronics'],
    DEPT_MAP['CSD'],
    'Chemical Engineering',
    DEPT_MAP['MBA']
];

const CourseCard = memo(forwardRef(({ course, idx, isEnrolled, onEnroll, onDrop }, ref) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

    const [resources, setResources] = useState([]);
    const [loadingResources, setLoadingResources] = useState(false);

    useEffect(() => {
        if (isEnrolled && course._id) {
            const fetchResources = async () => {
                setLoadingResources(true);
                try {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                    const { data } = await axios.get(getApiUrl(`/api/courses/${course._id}/resources`), config);
                    setResources(data.slice(0, 3)); // show only top 3
                } catch (error) {
                    console.error("Error fetching resources for student", error);
                } finally {
                    setLoadingResources(false);
                }
            };
            fetchResources();
        }
    }, [isEnrolled, course._id]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay: Math.min(idx * 0.03, 0.3),
                ease: "easeOut"
            }}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ y: -10, scale: 1.02 }}
        >
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="p-8 pb-4 flex-grow relative z-10" style={{ transform: "translateZ(50px)" }}>
                <div className="flex justify-between items-start mb-8">
                    <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm relative overflow-hidden icon-glow flex items-center justify-center"
                    >
                        <BookOpenIcon className="w-8 h-8 relative z-10" />
                    </motion.div>
                    <div className="flex flex-col items-end">
                        <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                            {course.semester}
                        </span>
                    </div>
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                    {course.name}
                </h3>

                {/* Status Badge */}
                <div className="mb-4">
                    {isEnrolled ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Active Enrollment
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">
                            Available Now
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <span className="text-[10px] font-black font-mono text-indigo-500 dark:text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/10">
                        {course.code}
                    </span>
                    <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-gray-600"></div>
                    <p className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-[0.2em] truncate max-w-[150px] opacity-80">
                        {course.department}
                    </p>
                </div>

                {/* Assets Section */}
                {isEnrolled && (resources.length > 0 || loadingResources) && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">Learning Assets</h4>
                            <span className="text-[8px] font-black text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase">Latest</span>
                        </div>
                        <div className="space-y-2">
                            {loadingResources ? (
                                <div className="h-4 bg-slate-100 dark:bg-white/5 animate-pulse rounded-full w-3/4"></div>
                            ) : (
                                resources.map(res => (
                                    <a
                                        key={res._id}
                                        href={res.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:shadow-sm transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10 group/asset"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                                                {res.fileType === 'link' ? <LinkIcon className="w-3.5 h-3.5" /> :
                                                    res.fileType === 'video' ? <PlayIcon className="w-3.5 h-3.5" /> :
                                                        <DocumentIcon className="w-3.5 h-3.5" />}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-gray-400 truncate group-hover/asset:text-indigo-600 dark:group-hover/asset:text-indigo-400">{res.title}</span>
                                        </div>
                                        <ArrowRightIcon className="w-3 h-3 text-slate-300 group-hover/asset:text-indigo-500 transition-colors" />
                                    </a>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 px-8 pb-8 mt-auto relative z-10" style={{ transform: "translateZ(30px)" }}>
                <div className="flex flex-col gap-3">
                    {isEnrolled ? (
                        <>
                            {course.syllabus && course.syllabus.path && (
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <button
                                        onClick={() => {
                                            const uploadPath = course.syllabus.path.replace(/\\/g, '/');
                                            window.open(getApiUrl(`/${uploadPath}`), '_blank');
                                        }}
                                        className="w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-black text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all group/syllabus border border-indigo-100 dark:border-indigo-500/20"
                                    >
                                        <span className="relative z-10 font-black">View Syllabus</span>
                                        <BookOpenIcon className="w-5 h-5 group-hover/syllabus:scale-11 transition-transform relative z-10" />
                                    </button>
                                </motion.div>
                            )}

                            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                                <Link
                                    to={`/feedback/${course._id}`}
                                    className="w-full flex items-center justify-between px-6 py-5 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all group/btn shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 relative overflow-hidden border-beam-container"
                                >
                                    <div className="border-beam"></div>
                                    <span className="relative z-10">Evaluate Subject</span>
                                    <ArrowRightIcon className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform relative z-10" />
                                </Link>
                            </motion.div>

                            <button
                                onClick={() => onDrop(course)}
                                className="w-full text-center text-xs font-bold text-red-400 hover:text-red-500 mt-2 py-2 opacity-60 hover:opacity-100 transition-opacity"
                            >
                                Drop Course
                            </button>
                        </>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onEnroll(course)}
                            className="w-full flex items-center justify-between px-6 py-5 rounded-[1.5rem] bg-indigo-600 text-white font-black text-sm hover:bg-indigo-500 transition-all group/enroll shadow-xl shadow-indigo-600/30 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/enroll:translate-x-[100%] transition-transform duration-1000" />
                            <span className="relative z-10">Enroll Now</span>
                            <PlusCircleIcon className="w-6 h-6 relative z-10" />
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}));

const StudentDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRequestOpen, setIsRequestOpen] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const [activeDept, setActiveDept] = useState(userInfo?.department || 'All');
    const [departments, setDepartments] = useState(['All']);
    const [userCoursesIds, setUserCoursesIds] = useState(userInfo?.courses || []);
    const { addToast } = useToast();

    // Mouse tracking for background mesh
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const mouseXSpring = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const mouseYSpring = useSpring(mouseY, { stiffness: 50, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(API_ENDPOINTS.DEPARTMENTS, config);

                const sortedDepts = ['All'];

                PREFERRED_DEPT_ORDER.forEach(pref => {
                    if (pref === 'All') return;
                    const match = data.find(d => d.toLowerCase() === pref.toLowerCase());
                    if (match && !sortedDepts.includes(match)) {
                        sortedDepts.push(match);
                    }
                });

                const remaining = data
                    .filter(d => !sortedDepts.some(sd => sd.toLowerCase() === d.toLowerCase()))
                    .sort();
                sortedDepts.push(...remaining);

                setDepartments(sortedDepts);
            } catch (error) {
                console.error('Error fetching departments:', error);
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('userInfo');
                    window.location.href = '/login';
                }
            }
        };

        const fetchCourses = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`${API_ENDPOINTS.COURSES}?limit=1000`, config);
                const coursesData = data.courses || [];
                setCourses(coursesData);
                setFilteredCourses(coursesData);

                // Also fetch fresh student data to get latest courses
                try {
                    const studentRes = await axios.get(getApiUrl('/api/student/dashboard'), config);
                    if (studentRes.data.enrolledCourses) {
                        const ids = studentRes.data.enrolledCourses.map(c => c._id);
                        setUserCoursesIds(ids);
                        // Update local storage to keep sync
                        const updatedUser = { ...userInfo, courses: ids };
                        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                    }
                } catch (err) {
                    console.error("Failed to sync student data", err);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching courses:', error);
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('userInfo');
                    window.location.href = '/login';
                }
                setLoading(false);
            }
        };

        fetchDepartments();
        fetchCourses();
    }, []);


    const handleEnroll = async (course) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post(getApiUrl('/api/student/enroll'), { courseId: course._id }, config);

            const newCourses = [...userCoursesIds, course._id];
            setUserCoursesIds(newCourses);
            addToast(`Successfully enrolled in ${course.code}`, 'success');

            // Update Local Storage
            const updatedUser = { ...userInfo, courses: newCourses };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        } catch (error) {
            addToast(error.response?.data?.message || 'Enrollment failed', 'error');
        }
    };

    const handleDrop = async (course) => {
        if (!window.confirm(`Are you sure you want to drop ${course.name}?`)) return;

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post(getApiUrl('/api/student/drop'), { courseId: course._id }, config);

            const newCourses = userCoursesIds.filter(id => id !== course._id);
            setUserCoursesIds(newCourses);
            addToast(`Dropped ${course.code}`, 'info');

            // Update Local Storage
            const updatedUser = { ...userInfo, courses: newCourses };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        } catch (error) {
            addToast(error.response?.data?.message || 'Drop failed', 'error');
        }
    };

    useEffect(() => {
        let result = courses;

        // Filter by Tab (All vs My Courses)
        if (activeTab === 'my') {
            result = result.filter(c => userCoursesIds.includes(c._id));
        }

        // Filter by Department
        if (activeDept !== 'All') {
            result = result.filter(c => c.department === activeDept);
        }

        // Filter by Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(lowerTerm) ||
                c.code.toLowerCase().includes(lowerTerm)
            );
        }
        setFilteredCourses(result);
    }, [searchTerm, activeDept, courses, activeTab]);

    // Kinetic Typography for Welcome Text
    const welcomeTitle = `Welcome, ${userInfo?.name?.split(' ')[0] || 'Student'}`;
    const words = welcomeTitle.split(" ");

    return (
        <RouteTransition>
            <div className="min-h-screen pt-28 pb-12 px-4 bg-slate-50 dark:bg-[#030712] transition-colors duration-700 relative overflow-hidden">
                {/* Ultra Ambient Background */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[150px] animate-pulse-slow mix-blend-multiply dark:mix-blend-screen animate-light-leak"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[150px] animate-pulse-slow delay-1000 mix-blend-multiply dark:mix-blend-screen animate-light-leak" style={{ animationDelay: '-5s' }}></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 brightness-100 contrast-150"></div>
                </div>

                <style>
                    {`
                        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
                        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 10px; }
                        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 10px; }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.6); }
                        .glass-glow { box-shadow: 0 0 40px -10px rgba(99, 102, 241, 0.3); }
                        .text-glow { text-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
                    `}
                </style>

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Header Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                        <div className="lg:col-span-2 flex flex-col justify-center">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-black mb-8 self-start border border-indigo-100 dark:border-indigo-500/30 shadow-sm backdrop-blur-md"
                            >
                                <SparklesIcon className="w-4 h-4" />
                                <span className="uppercase tracking-[0.2em]">Student Intelligence Portal v6.0</span>
                            </motion.div>

                            <h1 className="text-7xl lg:text-9xl font-black text-slate-900 dark:text-white mb-6 leading-[0.9] tracking-tighter kinetic-text">
                                {words.map((word, i) => (
                                    <span key={i} className="inline-block mr-6">
                                        {word.split("").map((char, j) => (
                                            <motion.span
                                                key={j}
                                                initial={{ opacity: 0, rotateX: 90, y: 20 }}
                                                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: (i * 0.2) + (j * 0.05),
                                                    type: "spring", stiffness: 100
                                                }}
                                                className={`inline-block ${word === userInfo?.name?.split(' ')[0] ? "text-indigo-600 dark:text-indigo-400 specular-glow" : ""}`}
                                            >
                                                {char}
                                            </motion.span>
                                        ))}
                                    </span>
                                ))}
                            </h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="text-xl text-slate-500 dark:text-indigo-300/60 max-w-xl font-bold leading-relaxed uppercase tracking-[0.1em]"
                            >
                                Precision analytics for your academic journey. Navigate your curriculum with clarity and impact.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                            className="h-full relative group"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <GamificationCard user={userInfo} />
                        </motion.div>
                    </div>

                    {/* Global Communications for Students */}

                    {/* Global Communications for Students */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mb-16 glass-ultra rounded-[3rem] p-10 shadow-2xl holographic-shine relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-10">
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-5 tracking-tighter">
                                    <div className="p-4 rounded-[1.5rem] bg-indigo-500/10 text-indigo-500 icon-glow shadow-inner">
                                        <MegaphoneIcon className="w-8 h-8" />
                                    </div>
                                    Neural Broadcasts
                                </h2>
                                <p className="text-[11px] text-slate-500 dark:text-indigo-400 mt-3 font-black uppercase tracking-[0.3em] opacity-60">Synchronized updates across your active curriculum</p>
                            </div>
                            <div className="h-px flex-1 bg-slate-100 dark:bg-white/5 hidden md:block mx-8 opacity-50"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                            {userCoursesIds.length > 0 ? (
                                courses.filter(c => userCoursesIds.includes(c._id)).map((course, idx) => (
                                    <div key={course._id} className="bg-white/40 dark:bg-white/5 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/10 hover:border-indigo-500/30 transition-all hover:bg-white dark:hover:bg-white/10 group/item">
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] whitespace-nowrap">{course.code}</span>
                                            <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                                        </div>
                                        <AnnouncementFeed courseId={course._id} limit={1} title="" />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-16 text-center">
                                    <p className="text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest text-xs">Enroll in courses to receive neural broadcast updates</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Enhanced Filter Section */}
                    <motion.div
                        className="mb-12 sticky top-24 z-40"
                    >
                        <div className="glass-ultra p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden holographic-shine">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
                            <div className="flex flex-col xl:flex-row gap-8 items-center justify-between relative z-10">
                                {/* Search & Tab Toggle */}
                                <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
                                    <div className="relative w-full md:w-80 group">
                                        <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-all" />
                                        <input
                                            type="text"
                                            placeholder="Search subjects..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all font-black text-sm uppercase tracking-widest outline-none"
                                        />
                                    </div>

                                    <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 w-full md:w-auto">
                                        {['all', 'my'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`relative px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === tab ? 'text-white' : 'text-slate-500 dark:text-gray-400 hover:text-indigo-500'}`}
                                            >
                                                {activeTab === tab && (
                                                    <motion.div
                                                        layoutId="activeTabBg"
                                                        className="absolute inset-0 bg-indigo-600 rounded-xl shadow-xl shadow-indigo-600/30"
                                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                    />
                                                )}
                                                <span className="relative z-10">{tab === 'all' ? 'Discovery' : 'Registered'}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Department Scroll */}
                                <div className="w-full xl:flex-1 overflow-hidden">
                                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar no-scrollbar scroll-smooth">
                                        {departments.map((dept) => (
                                            <button
                                                key={dept}
                                                onClick={() => setActiveDept(dept)}
                                                className={`px-6 py-4 rounded-xl text-[10px] font-black whitespace-nowrap transition-all uppercase tracking-[0.2em] border ${activeDept === dept
                                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30'
                                                    : 'bg-white/40 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {dept}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsRequestOpen(true)}
                                    className="flex items-center gap-4 px-10 py-5 rounded-2xl bg-indigo-600 text-white font-black shadow-2xl shadow-indigo-600/40 hover:bg-indigo-500 transition-all whitespace-nowrap text-xs uppercase tracking-[0.2em] group/req overflow-hidden relative border-beam-container"
                                >
                                    <div className="border-beam"></div>
                                    <PlusCircleIcon className="w-6 h-6 relative z-10 animate-pulse" />
                                    <span className="relative z-10">Sync Required</span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    <div className="mb-8 flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <div className="h-px w-12 bg-indigo-500/30" />
                            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] text-glow">
                                Analytics Catalog / {filteredCourses.length} subjects found
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>

                    {loading ? (
                        <CourseSkeleton />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <AnimatePresence mode='popLayout'>
                                {filteredCourses.map((course, idx) => (
                                    <CourseCard
                                        key={course._id}
                                        course={course}
                                        idx={idx}
                                        isEnrolled={userCoursesIds.includes(course._id)}
                                        onEnroll={handleEnroll}
                                        onDrop={handleDrop}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {!loading && filteredCourses.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-40 glass-ultra rounded-[4rem] holographic-shine relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                            <FunnelIcon className="w-24 h-24 text-indigo-500/20 mx-auto mb-8 animate-pulse" />
                            <h3 className="text-3xl font-black text-slate-400 dark:text-indigo-400/40 mb-2 uppercase tracking-tighter">No synchronization found</h3>
                            <p className="text-slate-400 dark:text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Please adjust parameters to re-align data</p>
                        </motion.div>
                    )}
                </div>
            </div>
            <RequestCourseModal isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} />
            <LevelUpModal isOpen={showLevelUp} onClose={() => setShowLevelUp(false)} newLevel={userInfo?.level || 1} />
        </RouteTransition>
    );
};

export default StudentDashboard;
