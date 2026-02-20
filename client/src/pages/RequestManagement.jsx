import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PencilSquareIcon,
    TrashIcon,
    PlusIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    InboxIcon,
    ArrowDownTrayIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon
} from '@heroicons/react/24/solid';
import { getApiUrl } from '../config/api';
import { useToast } from '../components/Toast';
import { exportToCSV } from '../utils/exportUtils';
import TableSkeleton from '../components/TableSkeleton';

const RequestManagement = () => {
    const [requests, setRequests] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRequest, setEditingRequest] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

    const { success, error: showError } = useToast();

    const [formData, setFormData] = useState({
        studentId: '',
        courseCode: '',
        courseName: '',
        department: '',
        semester: '',
        instructors: '',
        status: 'pending'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

            console.log(`[RequestManagement] Fetching: ${getApiUrl('/api/admin/requests/all')}`);
            const [requestsRes, studentsRes, statsRes] = await Promise.all([
                axios.get(getApiUrl('/api/admin/requests/all'), config).catch(e => {
                    console.error('[RequestManagement] Requests Load Fail:', e.response?.status, e.response?.data || e.message);
                    throw new Error(`Requests Error (Status ${e.response?.status}): ${e.response?.data?.message || e.message}`);
                }),
                axios.get(getApiUrl('/api/admin/students'), config).catch(e => {
                    console.error('[RequestManagement] Students Load Fail:', e.response?.status, e.response?.data || e.message);
                    throw new Error(`Students Error (Status ${e.response?.status}): ${e.response?.data?.message || e.message}`);
                }),
                axios.get(getApiUrl('/api/admin/requests/stats'), config).catch(e => {
                    console.error('[RequestManagement] Stats Load Fail:', e.response?.status, e.response?.data || e.message);
                    throw new Error(`Stats Error (Status ${e.response?.status}): ${e.response?.data?.message || e.message}`);
                })
            ]);

            setRequests(requestsRes.data);
            setStudents(studentsRes.data);
            setStats(statsRes.data);
            setLoading(false);
        } catch (err) {
            console.error('[RequestManagement] Data Fetch Error:', err);
            showError(err.message || 'Failed to fetch data');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this request permanently?')) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

            await axios.delete(getApiUrl(`/api/admin/requests/${id}`), config);
            success('Request deleted successfully');
            fetchData();
        } catch (err) {
            showError(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

            if (editingRequest) {
                await axios.put(getApiUrl(`/api/admin/requests/${editingRequest._id}`), formData, config);
                success('Request updated successfully');
            } else {
                await axios.post(getApiUrl('/api/admin/requests/create'), formData, config);
                success('Request created successfully');
            }

            setShowModal(false);
            setEditingRequest(null);
            resetForm();
            fetchData();
        } catch (err) {
            showError(err.response?.data?.message || 'Action failed');
        }
    };

    const resetForm = () => {
        setFormData({
            studentId: '',
            courseCode: '',
            courseName: '',
            department: '',
            semester: '',
            instructors: '',
            status: 'pending'
        });
    };

    const openEditModal = (request) => {
        setEditingRequest(request);
        setFormData({
            studentId: request.student?._id || '',
            courseCode: request.courseCode,
            courseName: request.courseName,
            department: request.department,
            semester: request.semester,
            instructors: request.instructors || '',
            status: request.status
        });
        setShowModal(true);
    };

    const formatRequestsForExport = (requests) => {
        return requests.map(req => ({
            Student: req.student?.name || 'N/A',
            Email: req.student?.email || 'N/A',
            StudentID: req.student?.studentId || 'N/A',
            CourseCode: req.courseCode,
            CourseName: req.courseName,
            Department: req.department,
            Semester: req.semester,
            Instructors: req.instructors || 'N/A',
            Status: req.status,
            RequestedAt: new Date(req.createdAt).toLocaleString()
        }));
    };

    const filteredRequests = requests.filter(req => {
        const studentName = req.student?.name || 'Unknown Student';
        const courseCode = req.courseCode || '';
        const courseName = req.courseName || '';
        const term = searchTerm.toLowerCase();

        const matchesSearch =
            studentName.toLowerCase().includes(term) ||
            courseCode.toLowerCase().includes(term) ||
            courseName.toLowerCase().includes(term);

        const matchesStatus = !filterStatus || req.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: ClockIcon },
            approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircleIcon },
            rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: XCircleIcon }
        };
        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text} flex items-center gap-1 w-fit`}>
                <Icon className="w-3 h-3" />
                {status.toUpperCase()}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 pt-32">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8">Request Management</h1>
                    <TableSkeleton rows={8} columns={7} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <InboxIcon className="w-10 h-10 text-indigo-500" />
                        Course Request Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage all student course requests - Create, edit, approve, or reject
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Requests</p>
                        <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{stats.total}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700/50">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                        <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-200 dark:border-green-700/50">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Approved</p>
                        <p className="text-3xl font-black text-green-600 dark:text-green-400">{stats.approved}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-red-200 dark:border-red-700/50">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rejected</p>
                        <p className="text-3xl font-black text-red-600 dark:text-red-400">{stats.rejected}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="relative md:col-span-2">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student, code, or course..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 transition-all"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const formatted = formatRequestsForExport(filteredRequests);
                                exportToCSV(formatted, 'course_requests_export');
                                success('Exported to CSV successfully');
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105"
                            title="Export to CSV"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span className="hidden lg:inline">CSV</span>
                        </button>
                        <button
                            onClick={() => {
                                resetForm();
                                setEditingRequest(null);
                                setShowModal(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:scale-105"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span className="hidden lg:inline">Add</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Semester</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Instructors</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Requested</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredRequests.map((request) => (
                                    <motion.tr
                                        key={request._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{request.student?.name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500">{request.student?.studentId}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900 dark:text-white">{request.courseName}</p>
                                            <p className="text-xs text-gray-500">{request.courseCode}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{request.department}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-bold">
                                                SEM {request.semester}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {request.instructors || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(request)}
                                                    className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-all group"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(request._id)}
                                                    className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-all group"
                                                >
                                                    <TrashIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredRequests.length === 0 && (
                            <div className="py-20 text-center">
                                <InboxIcon className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 font-semibold">No requests found</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                    {editingRequest ? 'Edit Request' : 'Create New Request'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Student *
                                    </label>
                                    <select
                                        required
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    >
                                        <option value="">Select Student</option>
                                        {students.map(student => (
                                            <option key={student._id} value={student._id}>
                                                {student.name} ({student.studentId})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Course Code *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.courseCode}
                                            onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            placeholder="e.g., CS101"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Semester *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.semester}
                                            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            placeholder="e.g., 1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Course Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.courseName}
                                        onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        placeholder="e.g., Introduction to Computer Science"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Department *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        placeholder="e.g., Computer Science"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Instructors
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.instructors}
                                        onChange={(e) => setFormData({ ...formData, instructors: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        placeholder="e.g., Dr. Smith, Prof. Johnson"
                                    />
                                </div>

                                {editingRequest && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-xl"
                                    >
                                        {editingRequest ? 'Update Request' : 'Create Request'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RequestManagement;
