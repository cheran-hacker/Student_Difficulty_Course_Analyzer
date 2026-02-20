
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { SparklesIcon } from '@heroicons/react/24/solid';

const LevelUpModal = ({ isOpen, onClose, newLevel }) => {

    useEffect(() => {
        if (isOpen) {
            // Trigger Confetti Explosion
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0, y: 50 }}
                        transition={{ type: "spring", damping: 15, stiffness: 200 }}
                        className="relative w-full max-w-sm glass-ultra rounded-[2.5rem] p-10 text-center shadow-[0_32px_128px_-16px_rgba(234,179,8,0.2)] overflow-hidden holographic-shine interaction-card border-yellow-500/20"
                    >
                        {/* Radiant Background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 via-transparent to-transparent pointer-events-none" />

                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 mb-6 relative z-10"
                        >
                            <SparklesIcon className="w-12 h-12 text-white" />
                        </motion.div>

                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-[0.2em]"
                        >
                            Level Up!
                        </motion.h2>

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-6 drop-shadow-sm"
                        >
                            {newLevel}
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-slate-500 dark:text-gray-400 mb-8"
                        >
                            Congratulations! You've reached a new academic milestone. Keep pushing boundaries.
                        </motion.p>

                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="w-full py-5 rounded-2xl bg-yellow-500 text-black font-black uppercase tracking-[0.3em] shadow-xl shadow-yellow-500/20 hover:bg-yellow-400 transition-all border-beam-container overflow-hidden text-xs"
                        >
                            <div className="border-beam" style={{ backgroundColor: '#000' }}></div>
                            <span className="relative z-10">Claim Rewards</span>
                        </motion.button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LevelUpModal;
