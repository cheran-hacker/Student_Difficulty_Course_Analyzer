import { useState, useEffect, useEffect as useEffect2 } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { HandThumbUpIcon, QuestionMarkCircleIcon, ClockIcon } from '@heroicons/react/24/outline'; // Using available icons
// Assuming API_URL or localhost for socket
import API_BASE_URL from '../config/api';

const SOCKET_URL = API_BASE_URL || window.location.origin;

const PulseButton = ({ type, icon: Icon, label, color, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClick(type)}
        className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 text-${color}-500 hover:bg-${color}-500/20 transition-all`}
    >
        <Icon className="w-8 h-8 mb-2" />
        <span className="text-xs font-bold uppercase">{label}</span>
    </motion.button>
);

const LivePulse = ({ courseId, userRole }) => {
    const [socket, setSocket] = useState(null);
    const [pulses, setPulses] = useState([]);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.emit('join_room', courseId);

        newSocket.on('receive_pulse', (data) => {
            // Add pulse to state to trigger animation
            const id = Date.now() + Math.random();
            setPulses(prev => [...prev, { ...data, id }]);

            // Remove pulse after animation
            setTimeout(() => {
                setPulses(prev => prev.filter(p => p.id !== id));
            }, 2000);
        });

        return () => newSocket.close();
    }, [courseId]);

    const sendPulse = (type) => {
        if (socket) {
            socket.emit('send_pulse', { courseId, type });
        }
    };

    // Visualization for Faculty
    if (userRole === 'faculty') {
        return (
            <div className="relative h-40 bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 overflow-hidden flex items-center justify-center">
                <div className="absolute top-4 left-6">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Live Class Pulse
                    </h3>
                </div>

                <div className="flex gap-8 items-end h-full pt-8 w-full justify-around px-10">
                    <PulseVisualizer pulses={pulses} type="understood" color="emerald" label="Understood" />
                    <PulseVisualizer pulses={pulses} type="confused" color="amber" label="Confused" />
                    <PulseVisualizer pulses={pulses} type="too_fast" color="purple" label="Too Fast" />
                </div>
            </div>
        );
    }

    // Controls for Student
    return (
        <div className="grid grid-cols-3 gap-4">
            <PulseButton type="understood" icon={HandThumbUpIcon} label="Got it!" color="emerald" onClick={sendPulse} />
            <PulseButton type="confused" icon={QuestionMarkCircleIcon} label="Confused" color="amber" onClick={sendPulse} />
            <PulseButton type="too_fast" icon={ClockIcon} label="Too Fast" color="purple" onClick={sendPulse} />
        </div>
    );
};

// Helper for visualizing pulses
const PulseVisualizer = ({ pulses, type, color, label }) => {
    const activePulses = pulses.filter(p => p.type === type);

    return (
        <div className="flex flex-col items-center justify-end h-full w-20 relative">
            <AnimatePresence>
                {activePulses.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 1, y: 0, scale: 0.5 }}
                        animate={{ opacity: 0, y: -50, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className={`absolute bottom-8 w-8 h-8 rounded-full bg-${color}-500/50 blur-sm`}
                    />
                ))}
            </AnimatePresence>
            <div className={`relative z-10 p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20 text-${color}-400`}>
                <div className="text-center font-black text-xl">{activePulses.length}</div>
            </div>
            <span className="text-[10px] font-bold text-gray-500 mt-2 uppercase">{label}</span>
        </div>
    );
};

export default LivePulse;
