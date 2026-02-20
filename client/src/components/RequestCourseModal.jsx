
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { XMarkIcon, PaperAirplaneIcon, BookOpenIcon, BuildingLibraryIcon, ChevronDownIcon, CheckIcon, UserIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { API_ENDPOINTS } from '../config/api';
import { DEPARTMENTS } from '../config/departments';
import ThemeToggle from './ThemeToggle';

const MagneticButton = ({ children, className, onClick, type = "button" }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { damping: 15, stiffness: 150 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;
        x.set(distanceX * 0.4);
        y.set(distanceY * 0.4);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
            onClick={onClick}
            type={type}
            className={className}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </motion.button>
    );
};

const KineticTitle = ({ text }) => {
    return (
        <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 overflow-hidden">
            <motion.div
                animate={{
                    rotateY: [0, 360],
                    scale: [1, 1.2, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <BookOpenIcon className="w-6 h-6 text-indigo-500" />
            </motion.div>
            <span className="flex">
                {text.split('').map((char, i) => (
                    <motion.span
                        key={i}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            delay: i * 0.03,
                            type: "spring",
                            stiffness: 200
                        }}
                        className={char === ' ' ? 'mr-2' : ''}
                    >
                        {char}
                    </motion.span>
                ))}
            </span>
        </h3>
    );
};

// --- ELITE CUSTOM COMPONENTS ---

const CustomSelect = ({ label, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find(opt => opt.value === value)?.label || 'Select...';

    return (
        <div className="space-y-2.5 group relative" ref={containerRef}>
            <label className="text-xs font-black uppercase text-indigo-700 dark:text-cyan-400 tracking-[0.25em] ml-2 transition-colors group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400">
                {label}
            </label>
            <div className="relative">
                <motion.button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-7 py-5 rounded-2xl bg-white dark:bg-black/60 border ${isOpen ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-200 dark:border-white/10'} outline-none transition-all text-left flex items-center justify-between font-black text-lg text-slate-900 dark:text-white shadow-sm relative z-10`}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="truncate">{selectedLabel}</span>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-500' : ''}`} />
                </motion.button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 mt-2 p-2 bg-white/95 dark:bg-[#0a0a0c]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar"
                        >
                            {options.map((opt) => (
                                <motion.button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 rounded-xl flex items-center justify-between text-sm font-bold transition-all ${value === opt.value
                                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                                        : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'
                                        }`}
                                    whileHover={{ x: 4 }}
                                >
                                    <span>{opt.label}</span>
                                    {value === opt.value && <CheckIcon className="w-4 h-4" />}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const CustomAutocomplete = ({ label, value, options, onChange, placeholder, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initial value setup
    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-2.5 group relative" ref={containerRef}>
            <label className="text-xs font-black uppercase text-indigo-700 dark:text-cyan-400 tracking-[0.25em] ml-2 transition-colors group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400">
                {label}
            </label>
            <div className="relative">
                {Icon && <Icon className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors z-20 ${isOpen ? 'text-cyan-500' : 'text-cyan-500/40'}`} />}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        onChange(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className={`w-full ${Icon ? 'pl-14' : 'px-7'} pr-7 py-5 rounded-2xl bg-white dark:bg-black/60 border ${isOpen ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-200 dark:border-white/10'} outline-none transition-all font-black text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 shadow-sm relative z-10`}
                />

                <AnimatePresence>
                    {isOpen && filteredOptions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 mt-2 p-2 bg-white/95 dark:bg-[#0a0a0c]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar"
                        >
                            {filteredOptions.map((opt) => (
                                <motion.button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm(opt);
                                        onChange(opt);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 rounded-xl flex items-center justify-between text-sm font-bold transition-all ${value === opt
                                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                                        : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'
                                        }`}
                                    whileHover={{ x: 4 }}
                                >
                                    <span>{opt}</span>
                                    {value === opt && <CheckIcon className="w-4 h-4" />}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const RequestCourseModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        courseCode: '',
        courseName: '',
        department: '',
        semester: 1,
        instructors: '',
        instructorName: '' // For display purposes
    });
    const [facultyOptions, setFacultyOptions] = useState([]);
    const { addToast } = useToast();
    const modalRef = useRef(null);

    // 3D Tilt Effect Values
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);

    // Smooth Tilt Spring
    const tiltConfig = { damping: 20, stiffness: 100 };
    const springRotateX = useSpring(rotateX, tiltConfig);
    const springRotateY = useSpring(rotateY, tiltConfig);

    const handleMouseMove = (e) => {
        if (!modalRef.current) return;
        const { left, top, width, height } = modalRef.current.getBoundingClientRect();
        const mouseX = e.clientX - left;
        const mouseY = e.clientY - top;
        const centerX = width / 2;
        const centerY = height / 2;

        // Calculate tilt angles (limited range for subtlety)
        rotateY.set((mouseX - centerX) / (width / 15));
        rotateX.set((centerY - mouseY) / (height / 15));
    };

    const handleMouseLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
        rotateY.set(0);
    };

    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                };
                const { data } = await axios.get(API_ENDPOINTS.FACULTY, config);
                // Map faculty to options: "Name (Department)"
                setFacultyOptions(data.map(f => ({
                    label: `${f.name} (${f.department || 'N/A'})`,
                    value: f.email // We submit the email
                })));
            } catch (error) {
                console.error("Failed to fetch faculty", error);
                addToast("Failed to load faculty list", "error");
            }
        };

        if (isOpen) {
            fetchFaculty();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'application/json'
                }
            };
            await axios.post(API_ENDPOINTS.REQUESTS, formData, config);
            addToast('Course request submitted successfully!', 'success');
            setFormData({ courseCode: '', courseName: '', department: '', semester: 1, instructors: '' });
            onClose();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to submit request', 'error');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    const semesterOptions = [
        { value: 1, label: 'Semester 1' },
        { value: 2, label: 'Semester 2' },
        { value: 3, label: 'Semester 3' },
        { value: 4, label: 'Semester 4' },
        { value: 5, label: 'Semester 5' },
        { value: 6, label: 'Semester 6' },
        { value: 7, label: 'Semester 7' },
        { value: 8, label: 'Semester 8' },
    ];

    const departments = DEPARTMENTS;

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 perspective-1000"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-2xl"
                    ></motion.div>

                    {/* Modal Content - Enhanced Background & Sizing */}
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotateX: 15 }}
                        style={{
                            rotateX: springRotateX,
                            rotateY: springRotateY,
                            transformStyle: "preserve-3d"
                        }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative glass-ultra rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(31,38,135,0.3)] w-full max-w-2xl overflow-hidden holographic-shine interaction-card"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
                        {/* Spatial Particles - Dynamic Orbits (Fixed Background) */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.5rem] z-0" style={{ transform: "translateZ(-20px)" }}>
                            {[...Array(10)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 bg-cyan-400/40 dark:bg-cyan-500/30 rounded-full blur-[2px]"
                                    animate={{
                                        x: [Math.random() * 500, Math.random() * 500, Math.random() * 500],
                                        y: [Math.random() * 500, Math.random() * 500, Math.random() * 500],
                                        scale: [1, 1.5, 1],
                                        opacity: [0, 0.6, 0]
                                    }}
                                    transition={{
                                        duration: 8 + Math.random() * 12,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}
                        </div>

                        {/* Top Accent Glow - Electric Cyan */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-90 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-20"></div>

                        {/* Scrollable Content Container */}
                        <div className="overflow-y-auto custom-scrollbar relative z-10 flex-1 p-10 md:p-12">
                            <div className="flex justify-between items-start mb-8">
                                <motion.div variants={itemVariants} initial="hidden" animate="visible">
                                    <KineticTitle text="Request New Course" />
                                    <p className="text-slate-500 dark:text-cyan-400/60 text-xs mt-2 font-black uppercase tracking-[0.35em] flex items-center gap-2">
                                        <motion.span
                                            initial={{ width: 0 }}
                                            animate={{ width: 32 }}
                                            transition={{ duration: 0.8, delay: 0.5 }}
                                            className="h-[2px] bg-cyan-500/50"
                                        ></motion.span>
                                        Strategic Intelligence Deployment
                                    </p>
                                </motion.div>
                                <motion.div variants={itemVariants} initial="hidden" animate="visible" className="flex items-center gap-4 sticky top-0 z-50">
                                    <ThemeToggle />
                                    <MagneticButton
                                        onClick={onClose}
                                        className="p-3 rounded-2xl bg-white/50 dark:bg-white/5 text-slate-400 dark:text-white/20 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 hover:text-rose-500 transition-all border border-slate-200/50 dark:border-white/5 shadow-sm"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </MagneticButton>
                                </motion.div>
                            </div>

                            <motion.form
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                onSubmit={handleSubmit}
                                className="space-y-8"
                            >
                                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3 group">
                                        <label className="text-xs font-black uppercase text-indigo-700 dark:text-cyan-400 tracking-[0.25em] ml-2 transition-colors group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400">Course Identifier</label>
                                        <div className="relative overflow-hidden rounded-2xl group/input">
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-7 py-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-indigo-500/50 dark:focus:border-indigo-500/50 transition-all font-black text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 shadow-sm relative z-10"
                                                placeholder="e.g. CS303"
                                                value={formData.courseCode}
                                                onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500" />
                                        </div>
                                    </div>

                                    {/* Custom Select for Semester */}
                                    <CustomSelect
                                        label="Semester"
                                        value={formData.semester}
                                        options={semesterOptions}
                                        onChange={(val) => setFormData({ ...formData, semester: val })}
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-3 group">
                                    <label className="text-xs font-black uppercase text-indigo-700 dark:text-cyan-400 tracking-[0.25em] ml-2 transition-colors group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400">Descriptive Title</label>
                                    <div className="relative overflow-hidden rounded-2xl">
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-7 py-5 rounded-2xl bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 outline-none focus:border-cyan-500/50 dark:focus:border-cyan-500/50 transition-all text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 font-black shadow-sm relative z-10"
                                            placeholder="e.g. Artificial Intelligence"
                                            value={formData.courseName}
                                            onChange={e => setFormData({ ...formData, courseName: e.target.value })}
                                        />
                                        <motion.div
                                            className="absolute inset-0 bg-cyan-500/5 dark:bg-cyan-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
                                        />
                                    </div>
                                </motion.div>

                                {/* Custom Autocomplete for Department */}
                                <motion.div variants={itemVariants} className="z-30 relative">
                                    <CustomAutocomplete
                                        label="Department"
                                        value={formData.department}
                                        options={departments}
                                        onChange={(val) => setFormData({ ...formData, department: val })}
                                        placeholder="e.g. Computer Science"
                                        icon={BuildingLibraryIcon}
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-3 group z-20 relative">
                                    <label className="text-xs font-black uppercase text-indigo-600 dark:text-cyan-400 tracking-[0.25em] ml-2 transition-colors group-focus-within:text-cyan-500">Academic Leadership</label>
                                    <div className="relative">
                                        {/* Using CustomAutocomplete adapted for Name/Email pair is complex with current component. 
                                            The current CustomAutocomplete expects simple string options. 
                                            Let's use a specialized Autocomplete or modify CustomAutocomplete. 
                                            
                                            Actually, let's use a new simpler implementation for this specific field or adapt CustomAutocomplete.
                                            The CustomAutocomplete takes `options` as string array.
                                            We need to map labels to values. 
                                            
                                            Let's use a modified CustomAutocomplete that handles objects? 
                                            Or given the constraints, let's just pass labels to CustomAutocomplete and find the email on change.
                                         */}
                                        <CustomAutocomplete
                                            label="" // Label is outside
                                            value={formData.instructorName}
                                            options={facultyOptions.map(f => f.label)}
                                            onChange={(val) => {
                                                const selected = facultyOptions.find(f => f.label === val);
                                                setFormData({
                                                    ...formData,
                                                    instructorName: val,
                                                    instructors: selected ? selected.value : val
                                                });
                                            }}
                                            placeholder="Select Instructor..."
                                            icon={UserIcon}
                                        />
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <MagneticButton
                                        type="submit"
                                        className="w-full py-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white font-black rounded-[1.25rem] shadow-[0_24px_48px_-12px_rgba(124,58,237,0.5)] hover:shadow-[0_24px_72px_-8px_rgba(244,63,94,0.4)] transform transition-all flex items-center justify-center gap-4 uppercase tracking-[0.4em] text-xs mt-8 border border-white/20 group relative overflow-hidden"
                                    >
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
                                        />
                                        <PaperAirplaneIcon className="w-5 h-5 -rotate-45 mb-1 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300" />
                                        <span>Initiate Request</span>
                                    </MagneticButton>
                                </motion.div>
                            </motion.form>
                        </div>

                        {/* Final Polish Layers */}
                        <div className="absolute last-shine bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-cyan-500/10 dark:from-indigo-500/20 to-transparent pointer-events-none rounded-b-[2.5rem]" style={{ transform: "translateZ(30px)" }}></div>
                        <div className="absolute inset-0 rounded-[2.5rem] border border-white/40 dark:border-white/5 pointer-events-none shadow-[inset_0_0_120px_rgba(255,255,255,0.1)] dark:shadow-[inset_0_0_80px_rgba(124,58,237,0.1)]" style={{ transform: "translateZ(40px)" }}></div>

                        {/* Interactive Border Edge */}
                        <motion.div
                            className="absolute inset-0 rounded-[2.5rem] pointer-events-none"
                            animate={{
                                boxShadow: [
                                    "inset 0 0 0px rgba(34,211,238,0)",
                                    "inset 0 0 20px rgba(34,211,238,0.1)",
                                    "inset 0 0 0px rgba(34,211,238,0)"
                                ]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />
                    </motion.div >
                </div >
            )}
        </AnimatePresence >
    );
};

export default RequestCourseModal;
