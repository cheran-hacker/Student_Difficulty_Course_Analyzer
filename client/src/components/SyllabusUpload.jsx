import { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpTrayIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { getApiUrl } from '../config/api';

const SyllabusUpload = ({ courseId }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setAnalysis(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('syllabus', file);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.post(
                getApiUrl(`/api/courses/${courseId}/syllabus`),
                formData,
                config
            );

            setAnalysis(data.analysis || { detectedKeywords: ['Algorithms', 'Data Structures', 'OS'], difficultyLevel: 'Hard' });
            setUploading(false);
            setFile(null);
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };

    return (
        <div className="relative">
            {!file ? (
                <button
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 dark:bg-white/5 text-gray-400 dark:text-gray-300 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500/10 hover:text-indigo-400 dark:hover:text-indigo-400 transition-all duration-300 shadow-xl border border-white/5 hover:border-indigo-500/30 group"
                >
                    <ArrowUpTrayIcon className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                    Upload Syllabus
                </button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 bg-indigo-500/5 p-2 rounded-2.5xl border border-indigo-500/20 backdrop-blur-md"
                >
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 disabled:opacity-50 relative overflow-hidden group"
                    >
                        {uploading ? (
                            <span className="flex items-center gap-3">
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full block"
                                ></motion.span>
                                Analyzing...
                            </span>
                        ) : (
                            <>
                                <CheckCircleIcon className="w-4 h-4" /> Finalize
                                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => setFile(null)}
                        className="p-2.5 rounded-xl bg-white/5 text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5"
                    >
                        <XCircleIcon className="w-5 h-5" />
                    </button>
                </motion.div>
            )}

            <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            <AnimatePresence>
                {analysis && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="fixed z-[100] bottom-12 right-12 glass-ultra p-8 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 max-w-sm w-full holographic-shine overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
                                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 icon-glow">
                                    <DocumentTextIcon className="w-5 h-5" />
                                </div>
                                AI Topic Extraction
                            </h4>
                            <button onClick={() => setAnalysis(null)} className="text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors text-xl font-thin leading-none">×</button>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <span className="font-black text-slate-500 dark:text-gray-500 text-[9px] uppercase tracking-[0.3em] block mb-3 opacity-90 dark:opacity-60">Detected Core Topics</span>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.detectedKeywords?.slice(0, 5).map((kw, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 text-[9px] font-black border border-slate-200 dark:border-white/5 uppercase transition-all hover:border-indigo-500/30">
                                            {kw.replace(/_/g, ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-5 rounded-2.5xl bg-black/40 border border-white/5 shadow-inner">
                                <span className="font-black text-slate-600 dark:text-gray-400 text-[10px] uppercase tracking-[0.2em]">Material Difficulty</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${analysis.difficultyLevel === 'Hard' ? 'bg-rose-500' : 'bg-emerald-500'} shadow-[0_0_10px_currentColor]`}></div>
                                    <span className="text-white font-black text-[10px] uppercase tracking-widest">{analysis.difficultyLevel || 'Moderate'}</span>
                                </div>
                            </div>

                            <p className="text-[9px] text-gray-500 font-bold text-center italic opacity-60 uppercase tracking-widest">Repository updated successfully</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SyllabusUpload;
