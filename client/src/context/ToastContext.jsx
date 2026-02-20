import { createContext, useState, useContext, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const ToastContext = createContext();

const toastVariants = {
    initial: { opacity: 0, x: 100, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    error: <XCircleIcon className="w-6 h-6 text-red-500" />,
    warning: <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />,
    info: <InformationCircleIcon className="w-6 h-6 text-blue-500" />
};

const borderColors = {
    success: 'border-green-500/20',
    error: 'border-red-500/20',
    warning: 'border-amber-500/20',
    info: 'border-blue-500/20'
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            layout
                            variants={toastVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className={`pointer-events-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border ${borderColors[toast.type]} shadow-2xl rounded-2xl p-4 flex items-start gap-4 w-96 max-w-[90vw] relative overflow-hidden group`}
                        >
                            {/* Icon */}
                            <div className="flex-shrink-0 mt-0.5 bg-gray-100 dark:bg-gray-700/50 p-2 rounded-xl">
                                {icons[toast.type]}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 capitalize mb-0.5">
                                    {toast.type}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed break-words">
                                    {toast.message}
                                </p>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition p-1 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>

                            {/* Progress Bar */}
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: toast.duration / 1000, ease: "linear" }}
                                className={`absolute bottom-0 left-0 h-1 ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'success' ? 'bg-green-500' : 'bg-blue-500'} opacity-30`}
                            ></motion.div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
