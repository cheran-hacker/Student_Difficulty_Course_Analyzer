import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ChatBubbleBottomCenterTextIcon,
    AcademicCapIcon,
    IdentificationIcon,
    BuildingOfficeIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { getApiUrl } from '../config/api';

const FacultyRequestList = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchRequests = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(getApiUrl('/api/admin/faculty-requests'), config);
            setRequests(data);
        } catch (error) {
            console.error('Error fetching faculty requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        const comments = window.prompt(`Optional: Add comments for this ${status}ion:`);
        setProcessingId(id);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(getApiUrl(`/api/admin/faculty-requests/${id}`), {
                status,
                adminComments: comments
            }, config);

            // Refresh requests
            fetchRequests();
            alert(`Request ${status}ed successfully!`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert(error.response?.data?.message || 'Failed to update request');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'rejected': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            default: return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Faculty Course Requests</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Review and provision course access for academic staff.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20">
                        <ClockIcon className="w-4 h-4" />
                        {requests.filter(r => r.status === 'pending').length} Pending
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                    {requests.length > 0 ? (
                        requests.map((request, index) => (
                            <motion.div
                                key={request._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-[2.5rem] border border-gray-200 dark:border-gray-700/50 p-8 shadow-xl shadow-indigo-500/5 relative overflow-hidden group"
                            >
                                {/* Status Badge */}
                                <div className={`absolute top-8 right-8 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusColor(request.status)}`}>
                                    {request.status}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    {/* Requester Info */}
                                    <div className="lg:col-span-4 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                                                <IdentificationIcon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{request.faculty?.name}</h3>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{request.faculty?.department} Faculty</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                <AcademicCapIcon className="w-5 h-5 text-indigo-500" />
                                                <span>{request.courseCode}: {request.courseName}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                <BuildingOfficeIcon className="w-5 h-5 text-purple-500" />
                                                <span>{request.department} Unit</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Justification & Actions */}
                                    <div className="lg:col-span-8 flex flex-col justify-between">
                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 relative">
                                            <div className="absolute -top-3 left-6 flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full">
                                                <ChatBubbleBottomCenterTextIcon className="w-3 h-3 text-indigo-500" />
                                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Statement of Purpose</span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-medium pt-2 italic">
                                                "{request.justification}"
                                            </p>

                                            {request.adminComments && (
                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-start gap-2">
                                                    <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5" />
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                                                        Admin: {request.adminComments}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {request.status === 'pending' && (
                                            <div className="flex gap-4 mt-8">
                                                <button
                                                    onClick={() => handleUpdateStatus(request._id, 'approved')}
                                                    disabled={processingId === request._id}
                                                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircleIcon className="w-5 h-5" />
                                                    Grant Access & Provision
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(request._id, 'rejected')}
                                                    disabled={processingId === request._id}
                                                    className="flex-1 py-4 bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-2xl font-black text-sm hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <XCircleIcon className="w-5 h-5" />
                                                    Decline Request
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-gray-50 dark:bg-gray-800/30 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <ClockIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">All Scanned. No Pending Requests.</h3>
                            <p className="text-sm text-gray-400 mt-2">Check back later for new faculty submissions.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FacultyRequestList;
