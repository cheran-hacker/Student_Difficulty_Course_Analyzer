import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import API_BASE_URL from '../config/api';
import {
    ClockIcon,
    ShieldExclamationIcon,
    ArrowRightOnRectangleIcon,
    XMarkIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline'; // Using outline for cleaner look on dark bg

const IDLE_TIMEOUT = 14 * 60 * 1000; // 14 Minutes
const GRACE_PERIOD = 60 * 1000;      // 1 Minute (Total 15 mins)

const socket = io(API_BASE_URL || window.location.origin);

const SessionSync = () => {
    const navigate = useNavigate();
    const [showWarning, setShowWarning] = useState(false);
    const [isRestricted, setIsRestricted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo')));
    const warningTimerRef = useRef(null);
    const logoutTimerRef = useRef(null);

    // Helper to get formatted time
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        window.dispatchEvent(new Event('storage')); // Notify other tabs
        window.location.href = '/login'; // Force reload/redirect
    };

    const resetTimer = () => {
        if (!localStorage.getItem('userInfo')) return; // Don't track if not logged in

        const now = Date.now();
        localStorage.setItem('lastActivity', now.toString());

        // Clear existing timers
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

        setShowWarning(false);
        setTimeLeft(60);

        // Set new timers
        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);

            // Start countdown for grace period
            let remaining = 60;
            const interval = setInterval(() => {
                remaining -= 1;
                setTimeLeft(remaining);
                if (remaining <= 0) clearInterval(interval);
            }, 1000);

            // Set hard logout timer
            logoutTimerRef.current = setTimeout(() => {
                clearInterval(interval);
                logout();
            }, GRACE_PERIOD);

        }, IDLE_TIMEOUT);
    };

    // 1. Storage Sync (Multi-tab support)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'userInfo') {
                if (!e.newValue) {
                    // Logged out in another tab
                    setUserInfo(null);
                    window.location.href = '/login';
                } else {
                    // Logged in/updated in another tab, reload to sync state if needed
                    const data = JSON.parse(e.newValue);
                    setUserInfo(data);
                    const current = JSON.parse(localStorage.getItem('userInfo'));
                    if (!current) window.location.reload();
                }
            }
            if (e.key === 'lastActivity') {
                // Activity in another tab -> reset local timers silently
                if (!showWarning) resetTimer();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [showWarning]); // dependency on showWarning to avoid resetting if warning is already shown? 
    // Actually, if activity in another tab, we SHOULD hide warning.

    // 2. Activity & Socket Listeners
    useEffect(() => {
        if (userInfo && userInfo._id) {
            console.log(`[Socket] Joining personal room: ${userInfo._id}`);
            socket.emit('join_user_room', userInfo._id);
        }

        socket.on('user_restricted', (data) => {
            console.log('[Socket] Account restricted event received!');
            setIsRestricted(true);
            setShowWarning(false);

            // Perform automatic logout after a short delay
            setTimeout(() => {
                logout();
            }, 5000);
        });

        // Throttle activity updates
        let lastUpdate = 0;
        const onUserActivity = () => {
            const now = Date.now();
            if (now - lastUpdate > 5000) { // Update every 5s max
                lastUpdate = now;
                resetTimer();
            }
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, onUserActivity));

        // Initial start
        resetTimer();

        return () => {
            events.forEach(event => window.removeEventListener(event, onUserActivity));
            socket.off('user_restricted');
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        };
    }, [userInfo?._id]);

    // 3. Check for external updates (e.g. from other tabs updating lastActivity)
    useEffect(() => {
        const interval = setInterval(() => {
            const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0', 10);
            const now = Date.now();

            // If activity happened recently in another tab (e.g. within 5 sec), and we are showing warning, hide it
            if (showWarning && (now - lastActivity < 10000)) {
                setShowWarning(false);
                resetTimer();
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [showWarning]);


    return (
        <AnimatePresence>
            {/* restriction Overlay */}
            {isRestricted && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 40 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-[#0f1014] border-2 border-red-500/20 rounded-[3rem] p-12 max-w-md w-full shadow-[0_0_100px_rgba(239,68,68,0.15)] relative overflow-hidden text-center"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-3xl bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20 shadow-inner">
                                <LockClosedIcon className="w-12 h-12 text-red-500 animate-bounce" />
                            </div>

                            <h3 className="text-3xl font-black text-white mb-4 tracking-tighter spec-glow">Access Restricted</h3>
                            <p className="text-gray-400 text-sm mb-10 leading-relaxed font-bold uppercase tracking-widest">
                                Your account has been restricted by the administrator. Disconnecting your current session...
                            </p>

                            <div className="w-full flex justify-center">
                                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-red-400 text-xs font-black uppercase tracking-widest">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                                    Syncing Status
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {showWarning && !isRestricted && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-[#0f1014] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden text-center"
                    >
                        {/* Ambient Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 rounded-full blur-[50px] pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 animate-pulse">
                                <ClockIcon className="w-8 h-8 text-indigo-400" />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">Session Expiring</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                For your security, you will be automatically logged out due to inactivity in:
                            </p>

                            <div className="text-4xl font-black text-indigo-400 font-mono mb-8 tracking-wider">
                                {formatTime(timeLeft)}
                            </div>

                            <div className="w-full space-y-3">
                                <button
                                    onClick={resetTimer}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                                >
                                    Stay Signed In
                                </button>
                                <button
                                    onClick={logout}
                                    className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-sm border border-white/5 transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                    Logout Now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SessionSync;
