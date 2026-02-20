import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { motion } from 'framer-motion';

const DifficultyChart = ({ data, type = 'bar' }) => {
    // data format: { ratings: { syllabus: 5, ... } } -> needs transformation for charts

    const transformData = () => {
        if (!data || !data.ratings) return [];
        return Object.keys(data.ratings).map(key => ({
            subject: key.charAt(0).toUpperCase() + key.slice(1),
            A: data.ratings[key],
            fullMark: 10,
        }));
    };

    const chartData = transformData();

    if (type === 'radar') {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="h-80 w-full"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} />
                        <Radar name="Difficulty" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)', borderRadius: '8px', border: 'none' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-80 w-full"
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="subject" tick={{ fill: '#6b7280' }} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#6b7280' }} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="A" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export default DifficultyChart;
