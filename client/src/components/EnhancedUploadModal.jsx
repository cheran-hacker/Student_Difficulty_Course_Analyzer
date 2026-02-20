import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    CloudArrowUpIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    TrashIcon,
    AcademicCapIcon,
    BuildingLibraryIcon,
    BookOpenIcon
} from '@heroicons/react/24/solid';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import { useToast } from './Toast';
import { DEPARTMENTS } from '../config/departments';

const EnhancedUploadModal = ({ isOpen, onClose, onUploadComplete, facultyList = [], course = null }) => {
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const { success, error: showError } = useToast();

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        department: '',
        semester: '',
        instructors: ''
    });

    useEffect(() => {
        if (course) {
            setFormData({
                code: course.code || '',
                name: course.name || '',
                department: course.department || '',
                semester: course.semester || '',
                instructors: course.instructors ? course.instructors.join(', ') : ''
            });
            // Note: We don't pre-fill files as that would require re-downloading/mocking.
            // The user can upload new files to valid overwrite or add (backend logic specific).
            // Current backend uploadSyllabus is separate. We might just handle metadata edits here.
        } else {
            // Reset form when not editing or when course becomes null (handled by resetForm in handleClose/Upload, but good to be explicit if modal stays open)
        }
    }, [course, isOpen]);

    // File validation
    const validateFile = (file) => {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: 'Only PDF, DOC, and DOCX files are allowed' };
        }
        if (file.size > maxSize) {
            return { valid: false, error: 'File size must be less than 10MB' };
        }
        return { valid: true };
    };

    // Handle file selection
    const handleFileSelect = (selectedFiles) => {
        const newFiles = Array.from(selectedFiles).map(file => {
            const validation = validateFile(file);
            return {
                file,
                id: `${file.name}-${Date.now()}-${Math.random()}`,
                status: validation.valid ? 'ready' : 'error',
                error: validation.error,
                progress: 0
            };
        });

        setFiles(prev => [...prev, ...newFiles]);
    };

    // Drag and drop handlers
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    }, []);

    // Remove file
    const removeFile = (fileId) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
        });
    };

    // Upload with course creation
    const handleUpload = async () => {
        if (!formData.code || !formData.name || !formData.department || !formData.semester) {
            showError('Please fill in all required course fields');
            return;
        }

        const validFiles = files.filter(f => f.status === 'ready');
        if (validFiles.length === 0) {
            showError('No valid files to upload');
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

            // Create course first
            const coursePayload = {
                ...formData,
                instructors: formData.instructors.split(',').map(i => i.trim()).filter(i => i)
            };

            let responseData;

            if (course) {
                // Edit Mode
                const { data } = await axios.put(getApiUrl(`/api/admin/courses/${course._id}`), coursePayload, config);
                responseData = data;
                success('Course updated successfully');
            } else {
                // Create Mode
                const { data } = await axios.post(getApiUrl('/api/admin/courses'), coursePayload, config);
                responseData = data;
            }

            // Upload syllabus if file exists
            if (validFiles.length > 0) {
                const file = validFiles[0]; // Use first file as syllabus
                const formDataUpload = new FormData();
                formDataUpload.append('syllabus', file.file);

                const targetId = course ? course._id : responseData._id;

                setFiles(prev => prev.map(f =>
                    f.id === file.id ? { ...f, status: 'uploading' } : f
                ));

                const uploadConfig = {
                    ...config,
                    headers: {
                        ...config.headers,
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(prev => ({ ...prev, [file.id]: percentCompleted }));
                    }
                };

                await axios.post(
                    getApiUrl(`/api/courses/${targetId}/syllabus`),
                    formDataUpload,
                    uploadConfig
                );

                setFiles(prev => prev.map(f =>
                    f.id === file.id ? { ...f, status: 'completed' } : f
                ));
            }

            if (!course) {
                success('Course created and syllabus uploaded successfully!');
            }

            // Reset and close after delay
            setTimeout(() => {
                resetForm();
                onUploadComplete?.();
                onClose();
            }, 1500);

        } catch (err) {
            showError(err.response?.data?.message || 'Upload failed');
            setFiles(prev => prev.map(f =>
                f.status === 'uploading' ? { ...f, status: 'error', error: 'Upload failed' } : f
            ));
        }
    };

    const resetForm = () => {
        setFiles([]);
        setUploadProgress({});
        setFormData({
            code: '',
            name: '',
            department: '',
            semester: '',
            instructors: ''
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-hidden"
                    onClick={handleClose}
                >
                    {/* Ambient Background Glow */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
                    </div>

                    <motion.div
                        initial={{ scale: 0.9, y: 30, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 30, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#0f1014]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar relative z-10"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#0f1014]/95 backdrop-blur-md border-b border-white/5 p-8 flex items-center justify-between z-20">
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                    <BookOpenIcon className="w-8 h-8 text-indigo-500" />
                                    {course ? 'Edit Course' : 'Upload New Course'}
                                </h2>
                                <p className="text-sm text-gray-400 mt-2 font-medium">
                                    {course ? 'Update course details and manage instructors' : 'Initialize course structure and syllabus content'}
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2.5 hover:bg-white/5 rounded-xl transition-all group border border-transparent hover:border-white/10"
                            >
                                <XMarkIcon className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Course Details Form */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-8 h-[1px] bg-indigo-500/50"></span>
                                    Course Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 group/input">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 group-hover/input:text-indigo-400 transition-colors">Course Code *</label>
                                        <div className="relative">
                                            <AcademicCapIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors duration-300" />
                                            <input
                                                type="text"
                                                required
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                className="w-full bg-black/20 border border-white/5 focus:border-indigo-500/50 rounded-2xl py-3.5 pl-12 pr-4 outline-none text-white font-mono font-bold placeholder:text-gray-600 transition-all focus:bg-black/40 focus:shadow-[0_0_20px_rgba(79,70,229,0.1)]"
                                                placeholder="e.g., CS101"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 group/input">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 group-hover/input:text-indigo-400 transition-colors">Semester *</label>
                                        <div className="relative">
                                            <BuildingLibraryIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors duration-300" />
                                            <select
                                                required
                                                value={formData.semester}
                                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                                className="w-full bg-black/20 border border-white/5 focus:border-indigo-500/50 rounded-2xl py-3.5 pl-12 pr-4 outline-none text-white font-bold placeholder:text-gray-600 transition-all focus:bg-black/40 focus:shadow-[0_0_20px_rgba(79,70,229,0.1)] appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled className="bg-[#0f1014] text-gray-500">Select Semester</option>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                                    <option key={sem} value={sem} className="bg-[#0f1014] text-white">Semester {sem}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 group/input">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 group-hover/input:text-indigo-400 transition-colors">Course Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/20 border border-white/5 focus:border-indigo-500/50 rounded-2xl py-3.5 px-4 outline-none text-white font-bold placeholder:text-gray-600 transition-all focus:bg-black/40 focus:shadow-[0_0_20px_rgba(79,70,229,0.1)]"
                                        placeholder="e.g., Introduction to Computer Science"
                                    />
                                </div>

                                <div className="space-y-2 group/input">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 group-hover/input:text-indigo-400 transition-colors">Department *</label>
                                    <select
                                        required
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full bg-black/20 border border-white/5 focus:border-indigo-500/50 rounded-2xl py-3.5 px-4 outline-none text-white font-bold placeholder:text-gray-600 transition-all focus:bg-black/40 focus:shadow-[0_0_20px_rgba(79,70,229,0.1)] appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled className="bg-[#0f1014] text-gray-500">Select Department</option>
                                        {DEPARTMENTS.map((dept) => (
                                            <option key={dept} value={dept} className="bg-[#0f1014] text-white">{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2 group/input">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 group-hover/input:text-indigo-400 transition-colors">Instructors</label>

                                    {/* Selected Instructors Chips */}
                                    {formData.instructors && (
                                        <div className="flex flex-wrap gap-2 mb-3 p-1">
                                            {formData.instructors.split(',').filter(i => i.trim()).map((email, idx) => (
                                                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold shadow-lg">
                                                    {email.trim()}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const current = formData.instructors.split(',').map(i => i.trim()).filter(i => i);
                                                            const newInstructors = current.filter(i => i !== email.trim());
                                                            setFormData(prev => ({ ...prev, instructors: newInstructors.join(', ') }));
                                                        }}
                                                        className="hover:text-white transition-colors"
                                                    >
                                                        <XMarkIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Faculty Dropdown */}
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const current = formData.instructors.split(',').map(i => i.trim()).filter(i => i);
                                                if (!current.includes(e.target.value)) {
                                                    const newInstructors = [...current, e.target.value];
                                                    setFormData(prev => ({ ...prev, instructors: newInstructors.join(', ') }));
                                                }
                                                e.target.value = ''; // Reset select
                                            }
                                        }}
                                        className="w-full bg-black/20 border border-white/5 focus:border-indigo-500/50 rounded-2xl py-3.5 px-4 outline-none text-white font-medium placeholder:text-gray-600 transition-all focus:bg-black/40 focus:shadow-[0_0_20px_rgba(79,70,229,0.1)] appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-[#0f1014] text-gray-500">+ Add Faculty Instructor</option>
                                        {facultyList && facultyList.map(faculty => (
                                            <option key={faculty._id} value={faculty.email} className="bg-[#0f1014] text-white">
                                                {faculty.name} ({faculty.email})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-500 mt-1.5 ml-1">Select from list to authorize access</p>
                                </div>
                            </div>

                            {/* File Upload Zone */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-8 h-[1px] bg-indigo-500/50"></span>
                                    Syllabus Content
                                </h3>

                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all overflow-hidden group ${isDragging
                                        ? 'border-indigo-500 bg-indigo-500/10'
                                        : 'border-white/10 hover:border-indigo-500/50 hover:bg-black/20'
                                        }`}
                                >
                                    <div className="relative z-10">
                                        <CloudArrowUpIcon className={`w-16 h-16 mx-auto mb-4 transition-all duration-500 ${isDragging ? 'text-indigo-400 scale-110' : 'text-gray-600 group-hover:text-indigo-400 group-hover:scale-110'
                                            }`} />
                                        <p className="text-xl font-black text-white mb-2">
                                            {isDragging ? 'Drop files now' : 'Drag & Drop Syllabus'}
                                        </p>
                                        <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors mb-4">
                                            PDF, DOCX formats supported
                                        </p>
                                        <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 group-hover:border-indigo-500/30 transition-all">
                                            Max Size: 10MB
                                        </span>
                                    </div>

                                    {/* Grid Pattern Background */}
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onChange={(e) => handleFileSelect(e.target.files)}
                                        className="hidden"
                                        multiple
                                    />
                                </div>

                                {/* File List */}
                                <AnimatePresence>
                                    {files.map((fileItem) => (
                                        <motion.div
                                            key={fileItem.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="bg-black/20 border border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:border-white/10 transition-all"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform">
                                                <DocumentTextIcon className="w-6 h-6 text-indigo-400" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-white truncate text-sm">
                                                    {fileItem.file.name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {formatFileSize(fileItem.file.size)}
                                                </p>

                                                {/* Progress Bar */}
                                                {fileItem.status === 'uploading' && (
                                                    <div className="mt-3">
                                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${uploadProgress[fileItem.id] || 0}%` }}
                                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {fileItem.error && (
                                                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                                        <ExclamationCircleIcon className="w-3 h-3" />
                                                        {fileItem.error}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Status Icon */}
                                            <div className="flex-shrink-0">
                                                {fileItem.status === 'completed' && (
                                                    <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                                                )}
                                                {fileItem.status === 'error' && (
                                                    <ExclamationCircleIcon className="w-6 h-6 text-red-500" />
                                                )}
                                                {(fileItem.status === 'ready' || fileItem.status === 'uploading') && (
                                                    <button
                                                        onClick={() => removeFile(fileItem.id)}
                                                        className="p-2 hover:bg-red-500/10 rounded-xl text-gray-600 hover:text-red-400 transition-all"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-[#0f1014]/95 backdrop-blur-md border-t border-white/5 p-8 flex gap-4 z-20">
                            <button
                                onClick={handleClose}
                                className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/5 hover:border-white/20"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={files.some(f => f.status === 'uploading')}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-white/10"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <CloudArrowUpIcon className="w-5 h-5" />
                                    {course ? 'Save Changes' : 'Initialize Course & Upload'}
                                </span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EnhancedUploadModal;
