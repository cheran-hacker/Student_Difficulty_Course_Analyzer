import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { getApiUrl } from '../config/api';

const StudentRequestModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        courseCode: '',
        courseName: '',
        department: '',
        semester: '1',
        instructors: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await axios.post(getApiUrl('/api/requests'), formData, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            alert('Request submitted successfully!');
            onClose();
            setFormData({ courseCode: '', courseName: '', department: '', semester: '1', instructors: '' });
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Request New Course</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g., CS101"
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.courseCode}
                                        onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g., CSE"
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.department}
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g., Intro to Computer Science"
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.courseName}
                                    onChange={e => setFormData({ ...formData, courseName: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.semester}
                                        onChange={e => setFormData({ ...formData, semester: e.target.value })}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                            <option key={n} value={n}>Semester {n}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructors</label>
                                    <input
                                        type="text"
                                        placeholder="Comma separated"
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.instructors}
                                        onChange={e => setFormData({ ...formData, instructors: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : (
                                    <>
                                        <PaperAirplaneIcon className="w-5 h-5" />
                                        Submit Request
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StudentRequestModal;
