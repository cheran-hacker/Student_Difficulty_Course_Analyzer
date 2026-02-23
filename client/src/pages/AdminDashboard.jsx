import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom'; // Added useSearchParams
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS, getApiUrl } from '../config/api';
import {
    PlusIcon, ChartPieIcon, AcademicCapIcon, UserGroupIcon,
    InboxStackIcon, MagnifyingGlassIcon, ExclamationTriangleIcon, CheckBadgeIcon, CpuChipIcon,
    BoltIcon, ChatBubbleLeftRightIcon, BookOpenIcon, FunnelIcon, ClockIcon,
    ShieldExclamationIcon, ArrowRightOnRectangleIcon, UserCircleIcon, XMarkIcon
} from '@heroicons/react/24/solid';
import SyllabusUpload from '../components/SyllabusUpload';
import AdminRequests from '../components/AdminRequests';
import StudentList from '../components/StudentList';
import FacultyList from '../components/FacultyList';
import DashboardAnalytics from '../components/DashboardAnalytics';
import ThemeToggle from '../components/ThemeToggle';
import RequirementsDocs from '../components/RequirementsDocs';
import SyllabusManager from '../components/SyllabusManager';
import FacultyRequestList from '../components/FacultyRequestList';
import AdminProfileCard from '../components/AdminProfileCard';
import RegisterStudent from './RegisterStudent';
import { DEPARTMENTS } from '../config/departments';

const AdminDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [facultyList, setFacultyList] = useState([]); // For Course Modal
    const [requests, setRequests] = useState([]); // For Stats
    const [showModal, setShowModal] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    const setActiveTab = (tab) => setSearchParams({ tab });
    const [searchTerm, setSearchTerm] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [accessFilter, setAccessFilter] = useState('all'); // all, student, faculty
    // Removed duplicate declaration of [courses, setCourses]
    const [filterDept, setFilterDept] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const navigate = useNavigate(); // For redirect

    const [newCourse, setNewCourse] = useState({
        code: '', name: '', department: '', semester: '', instructors: []
    });

    const [userInfo, setUserInfo] = useState(null); // Local state for safety
    const [maintenance, setMaintenance] = useState(false);

    // Auth Check & Initialization
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('userInfo'));
        if (!storedUser || !storedUser.token || storedUser.role !== 'admin') {
            navigate('/admin/login');
        } else {
            setUserInfo(storedUser);
        }
    }, [navigate]);

    // Derived State for Search and Filter
    const filteredCourses = courses.filter(course => {
        const matchesSearch =
            course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = !filterDept || course.department === filterDept;
        const matchesSem = !filterSemester || course.semester === filterSemester;
        return matchesSearch && matchesDept && matchesSem;
    });

    const departments = DEPARTMENTS;
    const semesters = [...new Set(courses.map(c => c.semester))].filter(Boolean).sort();

    const fetchCourses = async (token) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_ENDPOINTS.COURSES}?limit=1000`, config);
            setCourses(data.courses || []);
        } catch (error) { console.error(error); }
    };

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get(API_ENDPOINTS.SETTINGS);
            setMaintenance(data.isMaintenanceMode);
        } catch (error) { console.error(error); }
    };

    const fetchStudents = async (token) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(getApiUrl('/api/auth/users'), config);
            setStudents(data);
        } catch (error) { console.error(error); }
    };

    const fetchFacultyUsers = async (token) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(getApiUrl('/api/auth/users?role=faculty'), config);
            setFacultyList(data);
        } catch (error) { console.error(error); }
    };

    const fetchRequests = async (token) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(API_ENDPOINTS.REQUESTS, config);
            setRequests(data);
        } catch (error) { console.error(error); }
    };

    // Load Data once User is Verified
    useEffect(() => {
        if (userInfo) {
            fetchCourses(userInfo.token);
            fetchSettings();
            fetchStudents(userInfo.token);
            fetchRequests(userInfo.token);
            fetchFacultyUsers(userInfo.token);
        }
    }, [userInfo]);

    // Refetch faculty when modal opens to ensure up-to-date list
    useEffect(() => {
        if (showModal && userInfo) {
            fetchFacultyUsers(userInfo.token);
        }
    }, [showModal, userInfo]);

    const toggleMaintenance = async () => {
        if (!userInfo) return;
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.put(API_ENDPOINTS.MAINTENANCE, {
                isMaintenanceMode: !maintenance
            }, config);
            setMaintenance(data.isMaintenanceMode);
        } catch (error) { console.error('Maintenance Toggle Error:', error); }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        // Optimistic update
        const updateList = (list) => list.map(u =>
            u._id === userId ? { ...u, isLoginAllowed: !currentStatus, isToggling: true } : u
        );

        setStudents(prev => updateList(prev));
        setFacultyList(prev => updateList(prev));

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.patch(getApiUrl(`/api/admin/users/${userId}/toggle-login`), {}, config);

            // Clean up toggling state
            const finishToggle = (list) => list.map(u => u._id === userId ? { ...u, isToggling: false } : u);
            setStudents(prev => finishToggle(prev));
            setFacultyList(prev => finishToggle(prev));
        } catch (err) {
            console.error('Toggle failed:', err);
            // Revert on error
            const revert = (list) => list.map(u =>
                u._id === userId ? { ...u, isLoginAllowed: currentStatus, isToggling: false } : u
            );
            setStudents(prev => revert(prev));
            setFacultyList(prev => revert(prev));
        }
    };

    const handleBulkToggle = async (status) => {
        const filteredUsers = [...students, ...facultyList].filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                u.email.toLowerCase().includes(userSearch.toLowerCase());
            const matchesRole = accessFilter === 'all' || u.role === accessFilter;
            return matchesSearch && matchesRole;
        });

        if (filteredUsers.length === 0) return;
        if (!window.confirm(`Are you sure you want to ${status ? 'ALLOW' : 'RESTRICT'} access for ${filteredUsers.length} users?`)) return;

        // Process sequentially or in chunks to avoid overwhelming server/socket
        for (const user of filteredUsers) {
            if (user.isLoginAllowed !== status) {
                await handleToggleStatus(user._id, !status);
            }
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post(API_ENDPOINTS.COURSES, {
                ...newCourse,
                // Instructors are now selected from list, assume array of emails or IDs.
                // Backend expects array of strings (emails presumably, based on previous manual entry).
                // Let's ensure newCourse.instructors is an array of emails.
            }, config);
            setShowModal(false);
            setNewCourse({ code: '', name: '', department: '', semester: '', instructors: [] });
            fetchCourses(userInfo.token);
        } catch (error) { console.error(error); }
    };

    const navItems = [
        { id: 'overview', label: 'Mission Control', icon: <ChartPieIcon className="w-5 h-5" /> },
        { id: 'courses', label: 'Course Grid', icon: <AcademicCapIcon className="w-5 h-5" /> },
        { id: 'faculty', label: 'Faculty', icon: <UserGroupIcon className="w-5 h-5" /> },
        { id: 'students', label: 'Student Corps', icon: <UserGroupIcon className="w-5 h-5" /> },
        { id: 'requests', label: 'Inbox', icon: <InboxStackIcon className="w-5 h-5" /> },
        { id: 'syllabus', label: 'Vault', icon: <BookOpenIcon className="w-5 h-5" /> },
        { id: 'settings', label: 'Settings', icon: <CpuChipIcon className="w-5 h-5" /> },
        { id: 'profile', label: 'Admin Profile', icon: <UserCircleIcon className="w-5 h-5" /> },
    ];

    if (!userInfo) return null; // Prevent render until auth check

    return (
        <div className="min-h-screen pt-24 px-4 pb-12 bg-gray-50 dark:bg-[#0f1014] text-gray-900 dark:text-white transition-colors duration-500 relative overflow-hidden">
            {/* Background Effects - Dynamic for Light/Dark */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-blue-100/50 dark:bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none transition-colors duration-500"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-100/50 dark:bg-purple-900/10 rounded-full blur-[120px] pointer-events-none transition-colors duration-500"></div>

            {/* Noise Overlay */}
            <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>

            <div className="max-w-[1600px] mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-600/20">
                                <BoltIcon className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                System Overview
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            Secure Uplink Active • Officer {userInfo?.name.split(' ')[0]}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        <ThemeToggle />

                        {/* Quick Access Management Links */}
                        <div className="flex gap-2">
                            <Link
                                to="/admin/course-management"
                                className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                            >
                                <AcademicCapIcon className="w-4 h-4" />
                                <span className="hidden md:inline">Courses</span>
                            </Link>
                            <Link
                                to="/admin/feedback-management"
                                className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                            >
                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                <span className="hidden md:inline">Feedback</span>
                            </Link>
                            <Link
                                to="/admin/request-management"
                                className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                            >
                                <InboxStackIcon className="w-4 h-4" />
                                <span className="hidden md:inline">Requests</span>
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <div className="relative group">
                            <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition" />
                            <input
                                type="text"
                                placeholder="Search Database..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition w-72 text-sm font-mono text-gray-900 dark:text-white placeholder:text-gray-400 shadow-sm"
                            />
                        </div>

                        <button
                            onClick={toggleMaintenance}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition shadow-lg ${maintenance
                                ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 animate-pulse'
                                : 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-600 dark:text-green-400'
                                }`}
                        >
                            {maintenance ? <ExclamationTriangleIcon className="w-4 h-4" /> : <CheckBadgeIcon className="w-4 h-4" />}
                            {maintenance ? 'Lockdown Mode' : 'Systems Normal'}
                        </button>
                    </div>
                </div>

                {/* Glass Navigation Dock */}
                <div className="flex overflow-x-auto gap-2 mb-10 p-2 bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700/50 w-full md:w-fit mx-auto md:mx-0 shadow-sm">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap relative overflow-hidden shrink-0 ${activeTab === item.id
                                ? 'text-white shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {item.icon}
                            {item.label}
                            {activeTab === item.id && <div className="absolute inset-0 bg-white/20 animate-pulse-slow pointer-events-none"></div>}
                        </button>
                    ))}
                </div>

                {/* Content Area with Transitions */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <DashboardAnalytics students={students} courses={courses} />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <AdminRequests />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <AdminProfileCard
                                user={userInfo}
                                stats={{
                                    totalCourses: courses.length,
                                    totalStudents: students.length,
                                    totalFaculty: facultyList.length,
                                    pendingRequests: requests.filter(r => r.status === 'pending').length
                                }}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'courses' && (
                        <motion.div
                            key="courses"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 flex items-center gap-2">
                                    <AcademicCapIcon className="w-7 h-7 text-blue-500" />
                                    Course Directory
                                </h2>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition transform font-bold text-sm uppercase tracking-wide"
                                >
                                    <PlusIcon className="w-5 h-5" /> Initialize Course
                                </button>
                            </div>

                            {/* Filter Bar */}
                            <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white/40 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 px-2">
                                    <FunnelIcon className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-widest">Filter Matrix</span>
                                </div>

                                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <select
                                        value={filterDept}
                                        onChange={(e) => setFilterDept(e.target.value)}
                                        className="px-4 py-2.5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm font-bold text-gray-700 dark:text-gray-200"
                                    >
                                        <option value="">All Departments</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={filterSemester}
                                        onChange={(e) => setFilterSemester(e.target.value)}
                                        className="px-4 py-2.5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm font-bold text-gray-700 dark:text-gray-200"
                                    >
                                        <option value="">All Semesters</option>
                                        {semesters.map(sem => (
                                            <option key={sem} value={sem}>{sem}</option>
                                        ))}
                                    </select>

                                    {(filterDept || filterSemester || searchTerm) && (
                                        <button
                                            onClick={() => {
                                                setFilterDept('');
                                                setFilterSemester('');
                                                setSearchTerm('');
                                            }}
                                            className="px-4 py-2.5 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition"
                                        >
                                            Clear All Filters
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {filteredCourses.length > 0 ? (
                                    filteredCourses.map(course => (
                                        <motion.div
                                            key={course._id}
                                            layout
                                            className="bg-white dark:bg-gray-800/40 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:border-blue-500/50 hover:shadow-lg transition group"
                                        >
                                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black font-mono text-sm border border-blue-100 dark:border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
                                                        {course.code.substring(0, 3)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{course.name}</h3>
                                                        <div className="flex gap-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1.5 font-mono">
                                                            <span className="text-gray-500 dark:text-blue-300/70">{course.department}</span>
                                                            <span className="w-px h-3 bg-gray-300 dark:bg-gray-600 my-auto"></span>
                                                            <span>{course.semester}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <SyllabusUpload courseId={course._id} />
                                                    <Link
                                                        to={`/analysis/${course._id}`}
                                                        className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black hover:shadow-md transition border border-transparent dark:border-gray-600 dark:hover:border-white"
                                                    >
                                                        Analytics
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 text-gray-500 bg-white dark:bg-gray-800/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                        No courses found matching "{searchTerm}"
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'faculty' && (
                        <motion.div
                            key="faculty"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        >
                            <FacultyList />
                        </motion.div>
                    )}

                    {activeTab === 'students' && (
                        <motion.div
                            key="students"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 flex items-center gap-2">
                                    <UserGroupIcon className="w-7 h-7 text-indigo-500" />
                                    Student Corps
                                </h2>
                                <button
                                    onClick={() => window.open('/admin/register-student', 'RegistrationForm', 'width=1200,height=900,scrollbars=yes')}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition transform font-bold text-sm uppercase tracking-wide"
                                >
                                    <PlusIcon className="w-5 h-5" /> Enroll Cadet
                                </button>
                            </div>
                            <StudentList externalSearchTerm={searchTerm} />
                        </motion.div>
                    )}

                    {activeTab === 'requests' && (
                        <motion.div
                            key="requests"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-12"
                        >
                            <AdminRequests />
                            <div className="pt-8 border-t border-gray-200 dark:border-white/10">
                                <FacultyRequestList />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-md p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">User Access Dashboard</h2>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Monitor and manage institutional access</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={toggleMaintenance}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${maintenance ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                        >
                                            Maintenance: {maintenance ? 'ON' : 'OFF'}
                                        </button>
                                    </div>
                                </div>

                                {/* Access Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {[
                                        { label: 'Total Accounts', count: students.length + facultyList.length, color: 'indigo', icon: <UserCircleIcon className="w-5 h-5" />, bg: 'bg-indigo-500/10', text: 'text-indigo-600' },
                                        { label: 'Allowed Access', count: [...students, ...facultyList].filter(u => u.isLoginAllowed !== false).length, color: 'blue', icon: <CheckBadgeIcon className="w-5 h-5" />, bg: 'bg-blue-500/10', text: 'text-blue-600' },
                                        { label: 'Restricted', count: [...students, ...facultyList].filter(u => u.isLoginAllowed === false).length, color: 'red', icon: <ShieldExclamationIcon className="w-5 h-5" />, bg: 'bg-red-500/10', text: 'text-red-600' }
                                    ].map((stat, i) => (
                                        <div key={i} className={`p-6 rounded-[2rem] bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-transparent border border-gray-100 dark:border-white/5 shadow-sm`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.text}`}>
                                                    {stat.icon}
                                                </div>
                                                <span className={`text-2xl font-black text-gray-900 dark:text-white`}>{stat.count}</span>
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-8 border-b border-gray-100 dark:border-white/5">
                                    <div className="flex p-1.5 bg-gray-100 dark:bg-gray-900/50 rounded-2xl w-full md:w-auto">
                                        {['all', 'student', 'faculty'].map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setAccessFilter(tab)}
                                                className={`px-6 py-2 rounded-xl text-xs font-bold capitalize transition-all ${accessFilter === tab ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-white'}`}
                                            >
                                                {tab === 'all' ? 'All Roles' : tab + 's'}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => handleBulkToggle(true)}
                                            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all"
                                        >
                                            Allow View
                                        </button>
                                        <button
                                            onClick={() => handleBulkToggle(false)}
                                            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            Restrict View
                                        </button>
                                    </div>
                                </div>

                                <div className="relative mb-6">
                                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, ID or email..."
                                        className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-white/5 rounded-3xl text-sm focus:ring-2 focus:ring-blue-500/30 transition-all outline-none"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                    />
                                </div>

                                <div className="overflow-x-auto overflow-y-visible">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-white/5">
                                                <th className="px-4 py-4">Identity</th>
                                                <th className="px-4 py-4">Role</th>
                                                <th className="px-4 py-4">Last Active</th>
                                                <th className="px-4 py-4">Access Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                            {[...students, ...facultyList]
                                                .filter(u => (accessFilter === 'all' || u.role === accessFilter) &&
                                                    (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())))
                                                .map((user) => (
                                                    <tr key={user._id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                                                        <td className="px-4 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative">
                                                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
                                                                        {user.name.charAt(0)}
                                                                    </div>
                                                                    <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#1a1b20] ${user.isLoginAllowed !== false ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{user.name}</div>
                                                                    <div className="text-[10px] text-gray-400 font-mono tracking-tight">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-5 font-bold">
                                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${user.role === 'faculty' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-5">
                                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                                <ClockIcon className="w-3.5 h-3.5" />
                                                                <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                                                                    {user.streak?.lastLogin ? new Date(user.streak.lastLogin).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <button
                                                                    disabled={user.isToggling}
                                                                    onClick={() => handleToggleStatus(user._id, user.isLoginAllowed !== false)}
                                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none ${user.isLoginAllowed !== false ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-gray-200 dark:bg-white/5'
                                                                        } ${user.isToggling ? 'opacity-50 cursor-wait scale-90' : 'hover:scale-110'}`}
                                                                >
                                                                    <motion.span
                                                                        layout
                                                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xl ring-0 ${user.isLoginAllowed !== false ? 'translate-x-5' : 'translate-x-0'
                                                                            }`}
                                                                    />
                                                                </button>
                                                                <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${user.isLoginAllowed !== false ? 'text-blue-500' : 'text-gray-400'}`}>
                                                                    {user.isLoginAllowed !== false ? 'ACCESS GRANTED' : 'RESTRICTED'}
                                                                    {user.isToggling && <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'modules_docs' && (
                        <motion.div
                            key="modules_docs"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        >
                            <RequirementsDocs />
                            <button className="mt-4 text-sm text-blue-500 font-bold" onClick={() => setActiveTab('settings')}>← Back to Settings</button>
                        </motion.div>
                    )}

                    {activeTab === 'syllabus' && (
                        <motion.div
                            key="syllabus"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        >
                            <SyllabusManager />
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* Add Course Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Initialize New Course</h2>
                                <button onClick={() => setShowModal(false)} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                                    <PlusIcon className="w-5 h-5 transform rotate-45 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateCourse} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-blue-400 tracking-wider ml-1">Code</label>
                                        <input type="text" placeholder="CS101" required
                                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-gray-900 dark:text-white font-mono placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                            value={newCourse.code} onChange={e => setNewCourse({ ...newCourse, code: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-blue-400 tracking-wider ml-1">Semester</label>
                                        <input type="text" placeholder="Semester 3" required
                                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                            value={newCourse.semester} onChange={e => setNewCourse({ ...newCourse, semester: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-blue-400 tracking-wider ml-1">Course Name</label>
                                    <input type="text" placeholder="Data Structures" required
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                        value={newCourse.name} onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-blue-400 tracking-wider ml-1">Department</label>
                                    <select
                                        required
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                                        value={newCourse.department}
                                        onChange={e => setNewCourse({ ...newCourse, department: e.target.value })}
                                    >
                                        <option value="">Select Department</option>
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-blue-400 tracking-wider ml-1">Instructors</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {newCourse.instructors.map(email => (
                                            <span key={email} className="px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1">
                                                {email}
                                                <button type="button" onClick={() => setNewCourse({
                                                    ...newCourse,
                                                    instructors: newCourse.instructors.filter(i => i !== email)
                                                })}>&times;</button>
                                            </span>
                                        ))}
                                    </div>
                                    <select
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                                        onChange={(e) => {
                                            if (e.target.value && !newCourse.instructors.includes(e.target.value)) {
                                                setNewCourse({
                                                    ...newCourse,
                                                    instructors: [...newCourse.instructors, e.target.value]
                                                });
                                            }
                                            e.target.value = '';
                                        }}
                                    >
                                        <option value="">+ Add Instructor</option>
                                        {facultyList.map(f => (
                                            <option key={f._id} value={f.email}>{f.name} ({f.email})</option>
                                        ))}
                                    </select>
                                </div>

                                <button type="submit" className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition transform hover:scale-[1.01] uppercase tracking-wider text-sm">
                                    Confirm Creation
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
