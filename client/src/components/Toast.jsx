import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
    const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
    const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
    const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const Toast = ({ id, message, type, onClose }) => {
    const config = {
        success: {
            icon: CheckCircleIcon,
            bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
            textColor: 'text-white',
            borderColor: 'border-green-400'
        },
        error: {
            icon: ExclamationTriangleIcon,
            bgColor: 'bg-gradient-to-r from-red-500 to-rose-500',
            textColor: 'text-white',
            borderColor: 'border-red-400'
        },
        warning: {
            icon: ExclamationTriangleIcon,
            bgColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
            textColor: 'text-white',
            borderColor: 'border-amber-400'
        },
        info: {
            icon: InformationCircleIcon,
            bgColor: 'bg-gradient-to-r from-indigo-500 to-purple-500',
            textColor: 'text-white',
            borderColor: 'border-indigo-400'
        }
    };

    const { icon: Icon, bgColor, textColor, borderColor } = config[type] || config.info;

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`${bgColor} ${textColor} px-6 py-4 rounded-2xl shadow-2xl border-2 ${borderColor} backdrop-blur-xl pointer-events-auto min-w-[320px] max-w-md`}
        >
            <div className="flex items-start gap-3">
                <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <p className="flex-1 font-semibold text-sm leading-relaxed">{message}</p>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
};

export default Toast;
