import { motion } from 'framer-motion';
import { WrenchScrewdriverIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const MaintenancePage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-[9999] absolute inset-0 transition-colors duration-300 overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] transform -translate-x-1/2 animate-pulse"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-10 max-w-lg relative z-10"
            >
                <div className="flex justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full"></div>
                    <div className="relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-orange-100 dark:border-orange-900/30">
                        <WrenchScrewdriverIcon className="w-16 h-16 text-orange-500" />
                    </div>
                </div>

                <h1 className="text-4xl font-black text-gray-800 dark:text-white mb-4 tracking-tight">System Under Maintenance</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                    We are currently upgrading our servers to specific enhance performance.
                    <br />The system will be back online shortly.
                </p>

                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400 text-sm font-bold border border-orange-100 dark:border-orange-900/30 w-fit mx-auto">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span>Estimated Downtime: ~15 Mins</span>
                </div>
            </motion.div>
        </div>
    );
};

export default MaintenancePage;
