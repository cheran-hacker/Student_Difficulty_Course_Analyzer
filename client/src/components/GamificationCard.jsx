
import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TrophyIcon, FireIcon, StarIcon, SparklesIcon, ChartBarIcon } from '@heroicons/react/24/solid';

const GamificationCard = ({ user }) => {
    // Default values if user data isn't fully populated yet
    const xp = user?.xp || 0;
    const level = user?.level || 1;
    const streak = user?.streak?.current || 0;

    // Calculate Thresholds (matching backend)
    const LEVEL_THRESHOLDS = [0, 200, 400, 700, 1000, 1500, 2200, 3000, 4000, 5000];
    const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]; // Cap at max
    const progress = Math.min(100, Math.max(0, ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100));

    // 3D Tilt Logic
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

    const handleMouseMove = (e) => {
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d"
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-12 md:col-span-4 relative group perspective-1000 holographic-shine interaction-card"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative h-full p-8 rounded-[2.5rem] glass-ultra shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>

                {/* Header */}
                <div className="flex justify-between items-start mb-6" style={{ transform: "translateZ(20px)" }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/20">
                            <TrophyIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">Student Rank</h3>
                            <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Level {level}</p>
                        </div>
                    </div>

                    {/* Streak Badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 backdrop-blur-md">
                        <FireIcon className="w-4 h-4 text-orange-500 animate-pulse" />
                        <span className="text-xs font-black text-orange-600 dark:text-orange-400">{streak} Day Streak</span>
                    </div>
                </div>

                {/* Progress Circle & Stats */}
                <div className="flex items-center justify-between mb-8" style={{ transform: "translateZ(30px)" }}>
                    <div className="relative">
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-cyan-400 kinetic-text drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            {xp.toLocaleString()}
                        </div>
                        <p className="text-[10px] font-black text-slate-500 dark:text-indigo-400/70 uppercase tracking-[0.2em] mt-1">Total Integrity Points</p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-500 dark:text-gray-500">Next Level</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{nextThreshold.toLocaleString()} XP</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-4 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden mb-6 shadow-inner" style={{ transform: "translateZ(25px)" }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                    </motion.div>
                </div>

                {/* Badges Preview (Mini) */}
                <div className="flex gap-2" style={{ transform: "translateZ(15px)" }}>
                    {user?.badges?.slice(0, 4).map((badge, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm shadow-sm" title={badge.name}>
                            {badge.icon}
                        </div>
                    ))}
                    {(!user?.badges || user.badges.length === 0) && (
                        <p className="text-xs text-gray-400 italic">No badges earned yet.</p>
                    )}
                </div>

                {/* Floating Particles */}
                {/* Optimized background accents - removed blurs */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-cyan-500/5 rounded-full pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500/5 rounded-full pointer-events-none" />
            </div>
        </motion.div>
    );
};

export default GamificationCard;
