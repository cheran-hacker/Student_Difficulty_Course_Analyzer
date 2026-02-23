import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserIcon, FunnelIcon, MagnifyingGlassIcon, SparklesIcon, KeyIcon, PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { getApiUrl } from '../config/api';
import { exportToCSV } from '../utils/csvExport';
import AddStudentModal from './AddStudentModal';
import BulkImportModal from './BulkImportModal';

const timeAgo = (date) => {
    if (!date) return 'Offline';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hrs ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "Just now";
};

const StudentList = ({ externalSearchTerm }) => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkImportModal, setShowBulkImportModal] = useState(false);
    const [resetStudent, setResetStudent] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    // Use external search term if provided, else use local
    const finalSearchTerm = externalSearchTerm !== undefined ? externalSearchTerm : searchTerm;

    const fetchStudents = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (userInfo?.token) {
                const { data } = await axios.get(getApiUrl('/api/auth/users'), {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setStudents(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);


    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to remove this student from the records?')) {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                await axios.delete(getApiUrl(`/api/auth/users/${id}`), {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setStudents(students.filter(s => s._id !== id));
            } catch (error) {
                console.error(error);
                alert('Failed to delete student');
            }
        }
    };

    const handleResetInit = (student, e) => {
        e.stopPropagation();
        setResetStudent(student);
        setNewPassword('');
        setShowResetModal(true);
    };

    const submitResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) return alert('Password must be at least 6 chars');

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.put(getApiUrl(`/api/auth/users/${resetStudent._id}/reset-password`),
                { password: newPassword },
                { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );
            alert('Password reset successfully');
            setShowResetModal(false);
        } catch (error) {
            console.error(error);
            alert('Failed to reset password');
        }
    };



    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.name.toLowerCase().includes(finalSearchTerm.toLowerCase()) ||
            (student.studentId && student.studentId.toLowerCase().includes(finalSearchTerm.toLowerCase()));
        const matchesDept = !filterDept || student.department === filterDept;
        const matchesYear = !filterYear || student.year === filterYear;
        return matchesSearch && matchesDept && matchesYear;
    });

    const departments = [...new Set(students.map(s => s.department))].filter(Boolean).sort();
    const years = [...new Set(students.map(s => s.year))].filter(Boolean).sort();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden mb-8 relative z-10"
        >
            <div className="p-8 pb-4 border-b border-gray-100 dark:border-gray-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            <UserIcon className="w-6 h-6" />
                        </span>
                        Student Corps
                        <span className="self-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-full ml-2">
                            {students.length} Active
                        </span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 ml-14">
                        Manage registered student profiles and academic statuses.
                    </p>
                </div>

                {!externalSearchTerm && (
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => exportToCSV(filteredStudents, 'Student_Corps')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-black text-sm shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:bg-white dark:hover:bg-indigo-900/50 transition-all border border-indigo-100 dark:border-indigo-500/20"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span className="hidden lg:inline uppercase tracking-widest">Export CSV</span>
                            <span className="lg:hidden uppercase tracking-widest text-xs">Export</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowBulkImportModal(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-black text-sm shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
                        >
                            <span className="hidden lg:inline uppercase tracking-widest">Import CSV</span>
                            <span className="lg:hidden uppercase tracking-widest text-xs">CSV</span>
                        </motion.button>
                        <div className="relative group w-full md:w-80">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search student..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-4 px-8 py-4 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500 mr-2">
                    <FunnelIcon className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Filter Corps</span>
                </div>
                <div className="flex-grow flex flex-wrap gap-4">
                    <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 dark:text-gray-300 min-w-[160px]"
                    >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 dark:text-gray-300 min-w-[120px]"
                    >
                        <option value="">All Years</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    {(filterDept || filterYear || (!externalSearchTerm && searchTerm)) && (
                        <button
                            onClick={() => {
                                setFilterDept('');
                                setFilterYear('');
                                setSearchTerm('');
                            }}
                            className="px-4 py-2 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-8 py-5">Profile</th>
                            <th className="px-8 py-5">Department</th>
                            <th className="px-8 py-5">Academic Year</th>
                            <th className="px-8 py-5">Last Active</th>
                            <th className="px-8 py-5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {filteredStudents.map((student, i) => (
                            <motion.tr
                                key={student._id}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                className="group hover:bg-indigo-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                onClick={() => navigate(`/admin/student/${student._id}`)}
                            >
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {student.name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                                                {student.studentId || 'NO_ID'} • {student.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {student.department || 'General'}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                    {student.year || 'Freshman'}
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${timeAgo(student.updatedAt) === 'Just now' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'} shadow-[0_0_8px_rgba(34,197,94,0.5)]`}></div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{timeAgo(student.updatedAt)}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/student/${student._id}`) }}
                                            className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => handleResetInit(student, e)}
                                            className="px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-bold hover:bg-orange-100 dark:hover:bg-orange-900/40 transition flex items-center gap-1"
                                            title="Reset Password"
                                        >
                                            <KeyIcon className="w-3 h-3" />
                                            Pwd
                                        </button>

                                        <button
                                            onClick={(e) => handleDelete(student._id, e)}
                                            className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                {filteredStudents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No students found matching "{searchTerm}"</p>
                    </div>
                )}
            </div>
            {/* Reset Password Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100 dark:border-gray-700"
                    >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Reset Password for {resetStudent?.name}
                        </h3>
                        <form onSubmit={submitResetPassword}>
                            <input
                                type="text"
                                placeholder="New Password (min 6 chars)"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 mb-4 text-gray-900 dark:text-white"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowResetModal(false)}
                                    className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700"
                                >
                                    Set Password
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            {/* Add Student Modal removed in favor of dedicated page */}
            {showBulkImportModal && (
                <BulkImportModal
                    onClose={() => setShowBulkImportModal(false)}
                    onSuccess={() => {
                        fetchStudents();
                        alert('Students imported successfully!');
                    }}
                    role="student"
                />
            )}
        </motion.div>
    );
};

export default StudentList;
