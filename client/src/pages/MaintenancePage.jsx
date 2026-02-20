import { WrenchScrewdriverIcon } from '@heroicons/react/24/solid';

const MaintenancePage = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <WrenchScrewdriverIcon className="w-12 h-12 text-indigo-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                Under Maintenance
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-lg mb-8 leading-relaxed">
                We're currently performing scheduled updates to improve your experience.
                Please check back shortly.
            </p>
            <div className="px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-xs font-mono text-gray-400">
                System Status: <span className="text-yellow-500 font-bold">MAINTENANCE_MODE</span>
            </div>
        </div>
    );
};

export default MaintenancePage;
