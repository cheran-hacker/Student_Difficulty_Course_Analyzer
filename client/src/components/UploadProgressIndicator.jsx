import { motion } from 'framer-motion';

const UploadProgressIndicator = ({ progress, status, fileName }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'uploading':
                return 'bg-blue-500';
            case 'processing':
                return 'bg-yellow-500';
            case 'completed':
                return 'bg-green-500';
            case 'failed':
                return 'bg-red-500';
            default:
                return 'bg-gray-400';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'uploading':
                return 'Uploading';
            case 'processing':
                return 'Processing';
            case 'completed':
                return 'Completed';
            case 'failed':
                return 'Failed';
            default:
                return 'Pending';
        }
    };

    return (
        <div className="fixed bottom-8 right-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-80 border border-gray-200 dark:border-gray-700 z-50">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Upload Progress</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor()}`}>
                    {getStatusText()}
                </span>
            </div>

            {/* Circular Progress */}
            <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                    />
                    <motion.circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className={getStatusColor().replace('bg-', 'text-')}
                        initial={{ strokeDasharray: '0 352' }}
                        animate={{
                            strokeDasharray: `${(progress / 100) * 352} 352`
                        }}
                        transition={{ duration: 0.5 }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                        {progress}%
                    </span>
                </div>
            </div>

            {/* File Name */}
            {fileName && (
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 truncate">
                    {fileName}
                </p>
            )}

            {/* Time Estimate */}
            {status === 'uploading' && progress < 100 && (
                <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {progress < 30 ? 'Estimating...' : `~${Math.ceil((100 - progress) / 10)} seconds remaining`}
                </p>
            )}
        </div>
    );
};

export default UploadProgressIndicator;
