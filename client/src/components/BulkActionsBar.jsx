import { motion } from 'framer-motion';
import { TrashIcon, ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/24/solid';

const BulkActionsBar = ({ selectedCount, onBulkDelete, onBulkExport, onClearSelection }) => {
    if (selectedCount === 0) return null;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-6 z-50"
        >
            {/* Selected Count */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-5 h-5" />
                </div>
                <span className="font-bold">
                    {selectedCount} {selectedCount === 1 ? 'course' : 'courses'} selected
                </span>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-white/30" />

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onBulkExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all"
                    title="Export selected courses"
                >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                </button>



                <button
                    onClick={onBulkDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all"
                    title="Delete selected courses"
                >
                    <TrashIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                </button>

                <button
                    onClick={onClearSelection}
                    className="px-4 py-2 hover:bg-white/10 rounded-xl font-semibold transition-all"
                >
                    Clear
                </button>
            </div>
        </motion.div>
    );
};

export default BulkActionsBar;
