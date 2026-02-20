import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    AcademicCapIcon,
    EnvelopeIcon,
    PencilSquareIcon,
    ChevronRightIcon,
    InformationCircleIcon,
    XMarkIcon,
    ArrowUpTrayIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';
import { getApiUrl } from '../config/api';
import { DEPARTMENTS } from '../config/departments';
import BulkImportModal from './BulkImportModal';

// --- Sub-components (Modals) ---

const FacultyFormModal = ({ initialData, onClose, onSubmit, title, buttonText, isEdit }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '', email: '', password: '', department: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden"
            >
                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>

                <h2 className="text-2xl font-black mb-6 text-gray-900 dark:text-white tracking-tight">{title}</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(formData);
                }} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">Full Name</label>
                        <input
                            type="text" required
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-indigo-500 dark:text-white"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">Email Address</label>
                        <input
                            type="email" required
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-indigo-500 dark:text-white"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">
                            {isEdit ? 'New Access Token (Leave blank to keep)' : 'Access Token (Password)'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required={!isEdit}
                                placeholder={isEdit ? 'Enter new password to update' : ''}
                                className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-indigo-500 dark:text-white"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">Academic Unit</label>
                        <select
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                            value={formData.department}
                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                        >
                            <option value="">Select Department</option>
                            {DEPARTMENTS.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-gray-700 font-bold text-gray-600 dark:text-gray-300 transition-all"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all"
                        >
                            {buttonText}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const FacultyDetailModal = ({ faculty, courses, loading, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>

                <div className="flex items-center gap-8 mb-10 pb-10 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
                        <UserIcon className="w-12 h-12" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{faculty.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mt-1">{faculty.department} Department</p>
                        <div className="flex items-center gap-2 mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                            <EnvelopeIcon className="w-4 h-4" />
                            {faculty.email}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <AcademicCapIcon className="w-6 h-6 text-indigo-500" />
                        Assigned Course Registry
                    </h3>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {courses.length > 0 ? (
                                courses.map(course => (
                                    <div key={course._id} className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex justify-between items-center group hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-500/20">
                                                {course.code?.substring(0, 3) || 'CRS'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{course.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{course.code}</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-[10px] font-black text-gray-600 dark:text-gray-400">
                                            {course.semester}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                    <InformationCircleIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">No courses currently assigned to this operative.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const FacultyList = () => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkImportModal, setShowBulkImportModal] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [viewingFaculty, setViewingFaculty] = useState(null);
    const [assignedCourses, setAssignedCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(false);

    const fetchFaculty = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(getApiUrl('/api/auth/users?role=faculty'), config);
            setFaculty(data);
        } catch (error) {
            console.error('Error fetching faculty:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    const handleAddFaculty = async (formData) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post(getApiUrl('/api/auth/users'), { ...formData, role: 'faculty' }, config);
            setShowAddModal(false);
            fetchFaculty();
            alert('Faculty added successfully!');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to add faculty');
        }
    };

    const handleUpdateFaculty = async (formData) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(getApiUrl(`/api/auth/users/${editingFaculty._id}`), formData, config);
            setEditingFaculty(null);
            fetchFaculty();
            alert('Faculty updated successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to update faculty');
        }
    };

    const handleDeleteFaculty = async (id) => {
        if (!window.confirm('Are you sure you want to remove this faculty member?')) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(getApiUrl(`/api/auth/users/${id}`), config);
            setFaculty(faculty.filter(f => f._id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to delete faculty');
        }
    };

    const fetchAssignedCourses = async (facultyId) => {
        setCoursesLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(getApiUrl(`/api/auth/users/${facultyId}/courses`), config);
            setAssignedCourses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setCoursesLoading(false);
        }
    };

    const handleViewDetails = (member) => {
        setViewingFaculty(member);
        fetchAssignedCourses(member._id);
    };

    const filteredFaculty = faculty.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search faculty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowBulkImportModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5" />
                        Import CSV
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Faculty
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredFaculty.map((member) => (
                        <motion.div
                            key={member._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ y: -5 }}
                            className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-[2rem] border border-gray-200 dark:border-gray-700/50 shadow-xl shadow-indigo-500/5 hover:border-indigo-500/30 transition-all duration-300 relative group overflow-hidden"
                        >
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setEditingFaculty(member); }}
                                    className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteFaculty(member._id); }}
                                    className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                    <UserIcon className="w-8 h-8" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white truncate tracking-tight">{member.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/10">
                                            {member.role}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{member.department}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 font-medium text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                                        <EnvelopeIcon className="w-4 h-4" />
                                    </div>
                                    <span className="truncate">{member.email}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleViewDetails(member)}
                                className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all group"
                            >
                                <span>Academic Portfolio</span>
                                <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showAddModal && <FacultyFormModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddFaculty}
                    title="Add New Faculty"
                    buttonText="Create Faculty"
                />}

                {editingFaculty && <FacultyFormModal
                    initialData={editingFaculty}
                    onClose={() => setEditingFaculty(null)}
                    onSubmit={handleUpdateFaculty}
                    title="Edit Faculty Profile"
                    buttonText="Update Profile"
                    isEdit
                />}

                {viewingFaculty && (
                    <FacultyDetailModal
                        faculty={viewingFaculty}
                        courses={assignedCourses}
                        loading={coursesLoading}
                        onClose={() => setViewingFaculty(null)}
                    />
                )}

                {showBulkImportModal && (
                    <BulkImportModal
                        onClose={() => setShowBulkImportModal(false)}
                        onSuccess={() => {
                            fetchFaculty();
                            alert('Faculty imported successfully!');
                        }}
                        role="faculty"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default FacultyList;
