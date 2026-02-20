import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center justify-between w-14 h-8 px-1 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors duration-500 group overflow-hidden"
            aria-label="Toggle Dark Mode"
        >
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                className="z-10 w-6 h-6 rounded-full bg-white dark:bg-indigo-500 shadow-md flex items-center justify-center overflow-hidden"
                animate={{ x: theme === 'dark' ? 24 : 0 }}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {theme === 'dark' ? (
                        <motion.div
                            key="moon"
                            initial={{ y: 20, opacity: 0, rotate: -45 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            exit={{ y: -20, opacity: 0, rotate: 45 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MoonIcon className="h-3.5 w-3.5 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun"
                            initial={{ y: 20, opacity: 0, rotate: -45 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            exit={{ y: -20, opacity: 0, rotate: 45 }}
                            transition={{ duration: 0.2 }}
                        >
                            <SunIcon className="h-3.5 w-3.5 text-amber-500" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Background elements for extra flair */}
            <div className="absolute inset-x-0 inset-y-0 pointer-events-none flex items-center justify-around opacity-40">
                <SunIcon className="h-3 w-3 text-amber-600 dark:text-transparent transition-colors duration-500" />
                <MoonIcon className="h-3 w-3 text-transparent dark:text-indigo-400 transition-colors duration-500" />
            </div>
        </button>
    );
};

export default ThemeToggle;
