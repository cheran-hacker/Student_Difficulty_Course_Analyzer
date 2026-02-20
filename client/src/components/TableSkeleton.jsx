import { motion } from 'framer-motion';

const TableSkeleton = ({ rows = 5, columns = 5 }) => {
    return (
        <div className="w-full">
            {/* Table Header Skeleton */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-t-2xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0.6 }}
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                            className="h-4 bg-gray-300 dark:bg-gray-600 rounded"
                        />
                    ))}
                </div>
            </div>

            {/* Table Body Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-b-2xl border-x border-b border-gray-200 dark:border-gray-700">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="p-4 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
                    >
                        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <motion.div
                                    key={colIndex}
                                    initial={{ opacity: 0.6 }}
                                    animate={{ opacity: [0.6, 1, 0.6] }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: (rowIndex * columns + colIndex) * 0.05
                                    }}
                                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableSkeleton;
