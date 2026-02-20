import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MegaphoneIcon, ClockIcon, ExclamationCircleIcon, UserIcon } from '@heroicons/react/24/outline';
import { getApiUrl } from '../config/api';

const AnnouncementFeed = ({ courseId, title = "Course Announcements", limit = 5 }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(getApiUrl(`/api/courses/${courseId}/announcements`), config);
                setAnnouncements(data.slice(0, limit));
            } catch (error) {
                console.error('Error fetching announcements:', error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchAnnouncements();
        }
    }, [courseId, limit]);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <MegaphoneIcon className="w-6 h-6 text-indigo-500" />
                {title}
            </h3>

            {announcements.length === 0 ? (
                <div className="p-12 text-center bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                    <p className="text-gray-500 font-medium">No announcements posted for this course yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {announcements.map((ann, idx) => (
                            <motion.div
                                key={ann._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group p-6 rounded-3xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-indigo-500/30 transition-all hover:shadow-xl relative overflow-hidden h-full"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${ann.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                        ann.priority === 'normal' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                            'bg-gray-500/10 border-gray-500/20 text-gray-500'
                                        }`}>
                                        {ann.priority}
                                    </span>
                                </div>

                                <div className="flex flex-col h-full">
                                    <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2 pr-12 line-clamp-1">{ann.title}</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">{ann.content}</p>

                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                                <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{ann.author?.name || 'Instructor'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <ClockIcon className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                                {new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AnnouncementFeed;
