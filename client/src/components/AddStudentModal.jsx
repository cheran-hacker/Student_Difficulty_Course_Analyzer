import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserPlusIcon, EnvelopeIcon, KeyIcon, IdentificationIcon, AcademicCapIcon, CalendarDaysIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { API_ENDPOINTS } from '../config/api';
import { DEPARTMENTS } from '../config/departments';

const AddStudentModal = ({ isOpen, onClose, onStudentAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        department: '',
        email: '',
        password: '',
        year: 'III'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const departments = DEPARTMENTS;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            await axios.post(API_ENDPOINTS.USERS_ADMIN, formData, config);
            onStudentAdded();
            onClose();
            setFormData({
                name: '',
                studentId: '',
                department: '',
                email: '',
                password: '',
                year: 'III'
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[95vh] relative z-10 flex flex-col border-4 border-indigo-500/20 overflow-hidden"
                    >
                        {/* Simplified Header */}
                        <div className="p-8 bg-indigo-600 text-white shrink-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-4xl font-black tracking-tight">Register New Cadet</h2>
                                    <p className="text-indigo-100 font-bold mt-1">Complete all fields to initialize account</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all"
                                >
                                    <XMarkIcon className="w-8 h-8" />
                                </button>
                            </div>
                        </div>

                        {/* Spacious Body */}
                        <div className="overflow-y-auto px-10 py-10 flex-grow bg-white dark:bg-slate-900">
                            <form onSubmit={handleSubmit} className="space-y-12">
                                {error && (
                                    <div className="p-6 rounded-2xl bg-red-500 text-white font-bold flex items-center gap-4">
                                        <ExclamationTriangleIcon className="w-6 h-6" />
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Personal Info */}
                                    <div className="space-y-8">
                                        <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-100 dark:border-indigo-900/50 pb-2">Personal Details</h3>

                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-slate-500 dark:text-slate-400">FULL NAME</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-8 py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-xl font-bold dark:text-white transition-all"
                                                placeholder="e.g. John Doe"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-slate-500 dark:text-slate-400">REGISTRATION NUMBER</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-8 py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-xl font-mono font-bold dark:text-white transition-all"
                                                placeholder="7376222XXXX"
                                                value={formData.studentId}
                                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Academic Info */}
                                    <div className="space-y-8">
                                        <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-100 dark:border-indigo-900/50 pb-2">Academic Info</h3>

                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-slate-500 dark:text-slate-400">DEPARTMENT</label>
                                            <select
                                                required
                                                className="w-full px-8 py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-xl font-bold dark:text-white appearance-none transition-all"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            >
                                                <option value="" disabled>Choose Department</option>
                                                {departments.map(dept => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-slate-500 dark:text-slate-400">CURRENT YEAR</label>
                                            <div className="grid grid-cols-4 gap-4">
                                                {['I', 'II', 'III', 'IV'].map(y => (
                                                    <button
                                                        key={y}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, year: y })}
                                                        className={`py-4 rounded-xl font-black text-lg transition-all border-2 ${formData.year === y
                                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                                            : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400 dark:text-slate-500'
                                                            }`}
                                                    >
                                                        {y}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Info */}
                                <div className="space-y-8 mt-12 bg-indigo-50 dark:bg-indigo-900/10 p-10 rounded-[2rem]">
                                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-200 dark:border-indigo-800 pb-2">Security & Access</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-slate-500 dark:text-slate-400">OFFICIAL EMAIL</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full px-8 py-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-xl font-bold dark:text-white transition-all"
                                                placeholder="cadet@bitsathy.ac.in"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-slate-500 dark:text-slate-400">INITIAL PASSWORD</label>
                                            <input
                                                required
                                                type="password"
                                                className="w-full px-8 py-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none text-xl font-bold dark:text-white transition-all"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="h-10" /> {/* Spacer */}
                            </form>
                        </div>

                        {/* Fixed Actions */}
                        <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t-2 border-slate-100 dark:border-slate-800 shrink-0">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-8 rounded-3xl bg-indigo-600 text-white font-black text-2xl shadow-2xl hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                            >
                                {loading ? (
                                    <div className="w-10 h-10 border-6 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <UserPlusIcon className="w-10 h-10" />
                                        Initialize Cadet System
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddStudentModal;
