import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const CourseSkeleton = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(count).fill(0).map((_, i) => (
                <div key={i} className="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <Skeleton width={60} height={20} borderRadius={20} />
                        <Skeleton width={80} />
                    </div>
                    <Skeleton height={28} className="mb-2" />
                    <Skeleton width={120} className="mb-4" />
                    <div className="mt-4 pt-4 border-t border-gray-200/50">
                        <Skeleton height={40} borderRadius={8} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CourseSkeleton;
