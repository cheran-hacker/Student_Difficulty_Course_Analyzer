import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PencilSquareIcon,
    TrashIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    AcademicCapIcon,
    ArrowDownTrayIcon,
    BookOpenIcon,
    Squares2X2Icon,
    ListBulletIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationCircleIcon,
    DocumentTextIcon
} from '@heroicons/react/24/solid';
import { getApiUrl } from '../config/api';
import { useToast } from '../components/Toast';
import { formatCoursesForExport, exportToCSV } from '../utils/courseExportUtils';
import { formatFileSize, formatRelativeTime } from '../utils/fileUtils';
import TableSkeleton from '../components/TableSkeleton';
import EnhancedUploadModal from '../components/EnhancedUploadModal';
import BulkActionsBar from '../components/BulkActionsBar';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [viewMode, setViewMode] = useState(localStorage.getItem('courseViewMode') || 'grid');
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [editingCourse, setEditingCourse] = useState(null);


    const { success, error: showError } = useToast();

    const departments = [...new Set(courses.map(c => c.department))];
    const semesters = [...new Set(courses.map(c => c.semester))].sort();

    useEffect(() => {
        fetchCourses();
        fetchFaculty();
    }, [sortBy, sortOrder, filterStatus]);

    const fetchFaculty = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
            const { data } = await axios.get(getApiUrl('/api/auth/users?role=faculty'), config);
            setFacultyList(data);
        } catch (error) { console.error('Error fetching faculty:', error); }
    };


    const fetchCourses = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

            const params = new URLSearchParams({
                sortBy,
                order: sortOrder,
                limit: 1000,
                ...(filterStatus && { status: filterStatus })
            });

            const { data } = await axios.get(getApiUrl(`/api/courses?${params}`), config);

            // Handle both old and new response formats
            const coursesData = data.courses || data;
            setCourses(coursesData);
            setLoading(false);
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to fetch courses');
            setLoading(false);
        }
    };



    const handleEdit = (course) => {
        setEditingCourse(course);
        setShowUploadModal(true);
    };

    const handleModalClose = () => {
        setShowUploadModal(false);
        setEditingCourse(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this course? This will remove all associated data.')) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

            await axios.delete(getApiUrl(`/api/admin/courses/${id}`), config);
            success('Course deleted successfully');
            fetchCourses();
            setSelectedCourses(prev => prev.filter(courseId => courseId !== id));
        } catch (err) {
            showError(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedCourses.length === 0) return;

        if (!window.confirm(`Delete ${selectedCourses.length} selected courses? This will remove all associated data.`)) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

            await axios.post(getApiUrl('/api/courses/bulk/delete'), { courseIds: selectedCourses }, config);
            success(`${selectedCourses.length} courses deleted successfully`);
            setSelectedCourses([]);
            fetchCourses();
        } catch (err) {
            showError(err.response?.data?.message || 'Bulk delete failed');
        }
    };

    const handleBulkExport = () => {
        const selectedCourseData = courses.filter(c => selectedCourses.includes(c._id));
        const formatted = formatCoursesForExport(selectedCourseData);
        exportToCSV(formatted, `courses_export_${Date.now()}`);
        success(`${selectedCourses.length} courses exported successfully`);
    };

    const handleImportCSV = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo?.token}`
                }
            };

            const { data } = await axios.post(getApiUrl('/api/courses/import'), formData, config);

            success(data.message);
            if (data.summary) {
                console.log('Import Summary:', data.summary);
                // Optionally show a more detailed modal with summary
            }
            if (data.errors && data.errors.length > 0) {
                showError(`Import completed with ${data.errors.length} errors. Check console for details.`);
                console.warn('Import Errors:', data.errors);
            }

            fetchCourses();
        } catch (err) {
            showError(err.response?.data?.message || 'Import failed');
        } finally {
            event.target.value = null; // Reset input
        }
    };

    const toggleCourseSelection = (courseId) => {
        setSelectedCourses(prev =>
            prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedCourses.length === filteredCourses.length) {
            setSelectedCourses([]);
        } else {
            setSelectedCourses(filteredCourses.map(c => c._id));
        }
    };

    const toggleViewMode = (mode) => {
        setViewMode(mode);
        localStorage.setItem('courseViewMode', mode);
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch =
            course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.code?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = !filterDept || course.department === filterDept;
        const matchesSem = !filterSemester || course.semester === filterSemester;
        return matchesSearch && matchesDept && matchesSem;
    });

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: ClockIcon, text: 'Pending' },
            processing: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: ClockIcon, text: 'Processing' },
            completed: { color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: CheckCircleIcon, text: 'Completed' },
            failed: { color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', icon: ExclamationCircleIcon, text: 'Failed' }
        };

        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                <Icon className="w-3 h-3" />
                {badge.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 pt-32">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8">Course Management</h1>
                    <TableSkeleton rows={10} columns={6} />
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
                        <BookOpenIcon className="w-10 h-10 text-blue-500" />
                        Course Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage all courses - Create, edit, delete, and export with advanced features
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Courses</p>
                        <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{courses.length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Departments</p>
                        <p className="text-3xl font-black text-green-600 dark:text-green-400">{departments.length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Filtered Results</p>
                        <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{filteredCourses.length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Selected</p>
                        <p className="text-3xl font-black text-orange-600 dark:text-orange-400">{selectedCourses.length}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                        {/* Search */}
                        <div className="relative md:col-span-4">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        {/* Filters */}
                        <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="md:col-span-2 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 transition-all"
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>

                        <select
                            value={filterSemester}
                            onChange={(e) => setFilterSemester(e.target.value)}
                            className="md:col-span-2 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 transition-all"
                        >
                            <option value="">All Semesters</option>
                            {semesters.map(sem => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="md:col-span-2 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 transition-all"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </select>

                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [newSortBy, newOrder] = e.target.value.split('-');
                                setSortBy(newSortBy);
                                setSortOrder(newOrder);
                            }}
                            className="md:col-span-2 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 transition-all"
                        >
                            <option value="createdAt-desc">Recent First</option>
                            <option value="createdAt-asc">Oldest First</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="department-asc">Department (A-Z)</option>
                        </select>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                                onChange={toggleSelectAll}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Select All ({filteredCourses.length})
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* View Toggle */}
                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => toggleViewMode('grid')}
                                    className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                                    title="Grid View"
                                >
                                    <Squares2X2Icon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => toggleViewMode('list')}
                                    className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                                    title="List View"
                                >
                                    <ListBulletIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleImportCSV}
                                    className="hidden"
                                    id="csv-upload"
                                />
                                <label
                                    htmlFor="csv-upload"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer"
                                    title="Import from CSV"
                                >
                                    <ArrowDownTrayIcon className="w-5 h-5 rotate-180" />
                                    <span className="hidden lg:inline">Import CSV</span>
                                </label>
                            </div>

                            <button
                                onClick={() => {
                                    const formatted = formatCoursesForExport(filteredCourses);
                                    exportToCSV(formatted, 'courses_export');
                                    success('Exported to CSV successfully');
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105"
                                title="Export to CSV"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                <span className="hidden lg:inline">Export</span>
                            </button>

                            <button
                                onClick={() => {
                                    setEditingCourse(null);
                                    setShowUploadModal(true);
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:scale-105"
                            >
                                <PlusIcon className="w-5 h-5" />
                                <span>New Course</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Course Display */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredCourses.map((course) => (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all cursor-pointer ${selectedCourses.includes(course._id)
                                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedCourses.includes(course._id)}
                                                onChange={() => toggleCourseSelection(course._id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            {getStatusBadge(course.uploadStatus)}
                                        </div>

                                        <div className="mb-4">
                                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold">
                                                {course.code}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
                                            {course.name}
                                        </h3>

                                        <div className="space-y-2 mb-4 text-sm">
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <strong>Department:</strong> {course.department}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                <strong>Semester:</strong> {course.semester}
                                            </p>
                                            {course.syllabus && (
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <DocumentTextIcon className="w-4 h-4" />
                                                    <span className="text-xs">{formatFileSize(course.syllabus.size)}</span>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                {formatRelativeTime(course.createdAt)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(course);
                                                }}
                                                className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-all font-semibold text-sm"
                                            >
                                                <PencilSquareIcon className="w-4 h-4 inline mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(course._id);
                                                }}
                                                className="flex-1 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-all font-semibold text-sm"
                                            >
                                                <TrashIcon className="w-4 h-4 inline mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Course Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Semester</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredCourses.map((course) => (
                                        <motion.tr
                                            key={course._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${selectedCourses.includes(course._id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                                }`}
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCourses.includes(course._id)}
                                                    onChange={() => toggleCourseSelection(course._id)}
                                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold">
                                                    {course.code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900 dark:text-white">{course.name}</p>
                                                {course.syllabus && (
                                                    <p className="text-xs text-gray-500 mt-1">{formatFileSize(course.syllabus.size)}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{course.department}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-bold">
                                                    SEM {course.semester}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(course.uploadStatus)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(course)}
                                                        className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-all group"
                                                    >
                                                        <PencilSquareIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(course._id)}
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

                            {filteredCourses.length === 0 && (
                                <div className="py-20 text-center">
                                    <AcademicCapIcon className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400 font-semibold">No courses found</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Enhanced Upload Modal */}
            <EnhancedUploadModal
                isOpen={showUploadModal}
                onClose={handleModalClose}
                onUploadComplete={fetchCourses}
                facultyList={facultyList}
                course={editingCourse}
            />

            {/* Bulk Actions Bar */}
            <AnimatePresence>
                {selectedCourses.length > 0 && (
                    <BulkActionsBar
                        selectedCount={selectedCourses.length}
                        onBulkDelete={handleBulkDelete}
                        onBulkExport={handleBulkExport}
                        onClearSelection={() => setSelectedCourses([])}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CourseManagement;
