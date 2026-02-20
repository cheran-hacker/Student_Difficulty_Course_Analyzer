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
    AcademicCapIcon,
    UserIcon,
    ChatBubbleLeftRightIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/solid';
import { getApiUrl } from '../config/api';
import { useToast } from '../components/Toast';
import { exportToCSV, exportToJSON, formatFeedbackForExport } from '../utils/exportUtils';
import TableSkeleton from '../components/TableSkeleton';

const FeedbackManagement = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingFeedback, setEditingFeedback] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCourse, setFilterCourse] = useState('');

    const { success, error: showError } = useToast();

    const [formData, setFormData] = useState({
        userId: '',
        courseId: '',
        difficultyIndex: 5,
        timeCommitment: 10,
        sentimentScore: 0,
        comments: '',
        ratings: {
            syllabus: 5,
            methodology: 5,
            workload: 5,
            assessment: 5,
            resources: 5
        }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

            const [feedbackRes, usersRes, coursesRes] = await Promise.all([
                axios.get(getApiUrl('/api/admin/feedback/all'), config),
                axios.get(getApiUrl('/api/admin/students'), config),
                axios.get(getApiUrl('/api/courses'), config)
            ]);

            setFeedbacks(feedbackRes.data);
            setUsers(usersRes.data);
            setCourses(coursesRes.data.courses || coursesRes.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this feedback permanently?')) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
            await axios.delete(getApiUrl(`/api/feedback/${id}`), config);
            success('Feedback deleted successfully');
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

            if (editingFeedback) {
                await axios.put(getApiUrl(`/api/admin/feedback/${editingFeedback._id}`), formData, config);
                success('Feedback updated successfully');
            } else {
                await axios.post(getApiUrl('/api/admin/feedback'), formData, config);
                success('Feedback created successfully');
            }

            setShowModal(false);
            setEditingFeedback(null);
            resetForm();
            fetchData();
        } catch (err) {
            showError(err.response?.data?.message || 'Action failed');
        }
    };

    const resetForm = () => {
        setFormData({
            userId: '',
            courseId: '',
            difficultyIndex: 5,
            timeCommitment: 10,
            sentimentScore: 0,
            comments: '',
            ratings: { syllabus: 5, methodology: 5, workload: 5, assessment: 5, resources: 5 }
        });
    };

    const openEditModal = (feedback) => {
        setEditingFeedback(feedback);
        setFormData({
            userId: feedback.user?._id || '',
            courseId: feedback.course?._id || '',
            difficultyIndex: feedback.difficultyIndex || 5,
            timeCommitment: feedback.timeCommitment || 10,
            sentimentScore: feedback.sentimentScore || 0,
            comments: feedback.comments || '',
            ratings: feedback.ratings || { syllabus: 5, methodology: 5, workload: 5, assessment: 5, resources: 5 }
        });
        setShowModal(true);
    };

    const filteredFeedbacks = feedbacks.filter(fb => {
        const matchesSearch = fb.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fb.course?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = !filterCourse || fb.course?._id === filterCourse;
        return matchesSearch && matchesCourse;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 pt-32">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8">Feedback Management</h1>
                    <TableSkeleton rows={8} columns={6} />
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
                        <ChatBubbleLeftRightIcon className="w-10 h-10 text-indigo-500" />
                        Feedback Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Create, edit, and manage all student feedback</p>
                </motion.div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="relative md:col-span-2">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student or course..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={filterCourse}
                            onChange={(e) => setFilterCourse(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                        >
                            <option value="">All Courses</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>{course.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const formatted = formatFeedbackForExport(filteredFeedbacks);
                                exportToCSV(formatted, 'feedback_export');
                                success('Exported to CSV successfully');
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105"
                            title="Export to CSV"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">CSV</span>
                        </button>
                        <button
                            onClick={() => {
                                resetForm();
                                setEditingFeedback(null);
                                setShowModal(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:scale-105"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Add</span>
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
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Difficulty</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Sentiment</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredFeedbacks.map((fb) => (
                                    <motion.tr
                                        key={fb._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                    <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{fb.user?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{fb.user?.studentId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900 dark:text-white">{fb.course?.name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500">{fb.course?.code}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${fb.difficultyIndex > 6 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                fb.difficultyIndex > 3 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                {fb.difficultyIndex}/10
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                                            {fb.timeCommitment} hrs/wk
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${fb.sentimentScore > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                fb.sentimentScore < 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {fb.sentimentScore > 0 ? 'Positive' : fb.sentimentScore < 0 ? 'Negative' : 'Neutral'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(fb)}
                                                    className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-all group"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(fb._id)}
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

                        {filteredFeedbacks.length === 0 && (
                            <div className="py-20 text-center">
                                <AcademicCapIcon className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 font-semibold">No feedback found</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div >

            {/* Modal */}
            < AnimatePresence >
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
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                    {editingFeedback ? 'Edit Feedback' : 'Add New Feedback'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Student</label>
                                        <select
                                            required
                                            value={formData.userId}
                                            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        >
                                            <option value="">Select Student</option>
                                            {users.map(user => (
                                                <option key={user._id} value={user._id}>{user.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Course</label>
                                        <select
                                            required
                                            value={formData.courseId}
                                            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        >
                                            <option value="">Select Course</option>
                                            {courses.map(course => (
                                                <option key={course._id} value={course._id}>{course.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Difficulty (1-10)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={formData.difficultyIndex}
                                            onChange={(e) => setFormData({ ...formData, difficultyIndex: Number(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Time (hrs/week)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.timeCommitment}
                                            onChange={(e) => setFormData({ ...formData, timeCommitment: Number(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Sentiment (-1 to 1)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="-1"
                                            max="1"
                                            value={formData.sentimentScore}
                                            onChange={(e) => setFormData({ ...formData, sentimentScore: Number(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Comments</label>
                                    <textarea
                                        rows="4"
                                        value={formData.comments}
                                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                                        placeholder="Student's comments about the course..."
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {['syllabus', 'methodology', 'workload', 'assessment', 'resources'].map(key => (
                                        <div key={key}>
                                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 capitalize">
                                                {key}
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={formData.ratings[key]}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    ratings: { ...formData.ratings, [key]: Number(e.target.value) }
                                                })}
                                                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-xl"
                                    >
                                        {editingFeedback ? 'Update Feedback' : 'Create Feedback'}
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
            </AnimatePresence >
        </div >
    );
};

export default FeedbackManagement;
