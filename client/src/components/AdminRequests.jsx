import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon, CheckIcon, XMarkIcon,
    AcademicCapIcon, BuildingLibraryIcon
} from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS, getApiUrl } from '../config/api';

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const { addToast } = useToast();

    const fetchRequests = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (userInfo?.token) {
                const { data } = await axios.get(API_ENDPOINTS.REQUESTS, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setRequests(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatus = async (id, status) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const { data } = await axios.put(getApiUrl(`/api/requests/${id}`), { status }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            addToast(`Request ${status}`, 'success');
            fetchRequests();
        } catch (error) {
            addToast('Failed to update status', 'error');
        }
    };

    if (requests.length === 0) return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-white/5 backdrop-blur-3xl p-12 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/10 text-center flex flex-col items-center justify-center min-h-[300px]"
        >
            <div className="w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
                <CheckCircleIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">All Clear, Commander</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto">
                No pending course requests requiring your authorization at this time.
            </p>
        </motion.div>
    );

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500">
                        <ClockIcon className="w-6 h-6" />
                    </span>
                    Pending Authorizations
                    <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
                        {requests.filter(r => r.status === 'pending').length} Priority
                    </span>
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {requests.map((req, index) => (
                        <motion.div
                            key={req._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white dark:bg-white/5 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 group hover:border-indigo-500/30 hover:shadow-indigo-500/5 transition-all"
                        >
                            <div className="flex items-start gap-5">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30 transform group-hover:scale-105 transition-transform duration-300">
                                    {req.courseCode.substring(0, 3)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-black text-gray-900 dark:text-white text-lg">{req.courseName}</h3>
                                        <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                                            {req.courseCode}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <UserIcon className="w-4 h-4 text-indigo-400" />
                                            <span className="text-gray-700 dark:text-gray-300">{req.student?.name}</span>
                                        </span>
                                        <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                        <span className="flex items-center gap-1.5">
                                            <BuildingLibraryIcon className="w-4 h-4 text-gray-400" />
                                            {req.department}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full lg:w-auto pl-21 lg:pl-0">
                                {req.status === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => handleStatus(req._id, 'approved')}
                                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all font-bold text-sm"
                                        >
                                            <CheckIcon className="w-4 h-4" /> Authorize
                                        </button>
                                        <button
                                            onClick={() => handleStatus(req._id, 'rejected')}
                                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/30 transition-all font-bold text-sm shadow-sm"
                                        >
                                            <XMarkIcon className="w-4 h-4" /> Deny
                                        </button>
                                    </>
                                ) : (
                                    <span className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-inner ${req.status === 'approved'
                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30'
                                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30'
                                        }`}>
                                        {req.status === 'approved' ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminRequests;
