import { useState, useRef } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CloudArrowUpIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { getApiUrl } from '../config/api';

const BulkImportModal = ({ onClose, onSuccess, role = 'faculty' }) => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const fullDataRef = useRef([]);
    const [validationErrors, setValidationErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error'
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validExtensions = ['.csv', '.xls', '.xlsx'];
            const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));

            if (!validExtensions.includes(fileExtension)) {
                setValidationErrors(['Invalid file type. Please upload a .csv, .xls, or .xlsx file.']);
                setFile(null);
                return;
            }

            setFile(selectedFile);
            parseAndValidateFile(selectedFile);
        }
    };

    const processDataRows = (data, role) => {
        if (!data || !Array.isArray(data) || data.length === 0) return { success: false, error: 'Empty file' };

        const firstRow = data[0];
        console.log("Matrix Processing Start - First Row Keys:", Object.keys(firstRow));

        const normalize = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
        const headers = Object.keys(firstRow).map(normalize);
        console.log("Matrix Normalized Headers:", headers);

        let requiredFields = ['name', 'email', 'password', 'department'];
        if (role === 'student') requiredFields = [...requiredFields, 'studentid', 'year'];

        const missing = requiredFields.filter(f => !headers.includes(f));
        if (missing.length > 0) return { success: false, error: 'Missing required columns: ' + missing.join(', ') };

        const processedData = [];
        const errors = [];
        data.forEach((rowData, i) => {
            if (!rowData || Object.values(rowData).every(v => v === null || v === undefined || v === '')) return;
            const normalizedRow = {};
            Object.keys(rowData).forEach(key => normalizedRow[normalize(key)] = rowData[key]);

            const rowEmail = String(normalizedRow.email || '').trim();
            if (!rowEmail || !rowEmail.includes('@')) errors.push('Row ' + (i + 1) + ': Invalid email format');
            const studentID = String(normalizedRow.studentid || '').trim();
            if (role === 'student' && !studentID) errors.push('Row ' + (i + 1) + ': Student ID missing');

            const finalRow = { ...normalizedRow, role };
            finalRow.name = String(normalizedRow.name || '').trim();
            finalRow.email = rowEmail;
            finalRow.department = String(normalizedRow.department || '').trim();
            if (normalizedRow.facultyid) finalRow.facultyId = String(normalizedRow.facultyid).trim();
            if (normalizedRow.studentid) finalRow.studentId = studentID;

            if (role === 'student') {
                finalRow.semester = String(normalizedRow.semester || '1').trim();
                const y = String(normalizedRow.year || '').trim().toUpperCase();
                if (['1', '1ST', 'I', 'FIRST'].includes(y)) finalRow.year = 'I';
                else if (['2', '2ND', 'II', 'SECOND'].includes(y)) finalRow.year = 'II';
                else if (['3', '3RD', 'III', 'THIRD'].includes(y)) finalRow.year = 'III';
                else if (['4', '4TH', 'IV', 'FOURTH'].includes(y)) finalRow.year = 'IV';
                else finalRow.year = y || 'I';
                if (normalizedRow.gpa) finalRow.gpa = parseFloat(normalizedRow.gpa) || 0;
                if (normalizedRow.cgpa) finalRow.cgpa = parseFloat(normalizedRow.cgpa) || 0;
            }
            processedData.push(finalRow);
        });
        return { success: true, processedData, errors: errors.slice(0, 50) };
    };

    const parseAndValidateFile = (file) => {
        setLoading(true);
        setValidating(true);
        setPreviewData([]);
        fullDataRef.current = [];
        setValidationErrors([]);

        const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

        const tryMainThreadFallback = () => {
            console.log("Worker failed or restricted. Attempting Matrix Main-Thread Fallback...");
            if (isExcel) {
                setValidationErrors(['Excel background engine failed. Please try CSV format for reliability.']);
                setLoading(false);
                setValidating(false);
                return;
            }

            Papa.parse(file, {
                header: true,
                skipEmptyLines: 'greedy',
                complete: (results) => {
                    console.log("PapaParse Fallback Complete. Raw Results:", results);
                    const res = processDataRows(results.data, role);
                    if (res.success) {
                        console.log("Matrix Fallback Success:", res.processedData.length, "rows");
                        fullDataRef.current = res.processedData;
                        setPreviewData(res.processedData.slice(0, 100));
                        setValidationErrors(res.errors);
                    } else {
                        console.warn("Matrix Fallback Processing Failure:", res.error);
                        setValidationErrors([res.error]);
                    }
                    setLoading(false);
                    setValidating(false);
                },
                error: (err) => {
                    setValidationErrors(['Main Engine Failure: ' + err.message]);
                    setLoading(false);
                    setValidating(false);
                }
            });
        };

        const workerBlob = new Blob([`
            let Papa, XLSX;
            try {
                // Using multiple CDNs for reliability
                importScripts('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
                importScripts('https://cdn.jsdelivr.net/npm/papaparse@5.3.2/papaparse.min.js');
                XLSX = self.XLSX;
                Papa = self.Papa;
            } catch (e) {
                console.warn("Worker Library Load Failure:", e);
            }

            self.onmessage = function(e) {
                const { file, isExcel, role } = e.data;
                if ((isExcel && !XLSX) || (!isExcel && !Papa)) {
                    self.postMessage({ fallback: true, error: 'Library failed to load in background context' });
                    return;
                }

                function process(data) {
                    try {
                        if (!data || data.length === 0) {
                            self.postMessage({ success: false, error: 'No data found in grid.' });
                            return;
                        }
                        const firstRow = data[0];
                        const rawHeaders = Object.keys(firstRow);
                        const normalize = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
                        const headers = rawHeaders.map(normalize);

                        let requiredFields = ['name', 'email', 'password', 'department'];
                        if (role === 'student') requiredFields = [...requiredFields, 'studentid', 'year'];

                        const missing = requiredFields.filter(f => !headers.includes(f));
                        if (missing.length > 0) {
                            self.postMessage({ success: false, error: 'Missing columns: ' + missing.join(', ') });
                            return;
                        }

                        const processedData = [];
                        const errors = [];
                        data.forEach((rowData, i) => {
                            if (!rowData || Object.values(rowData).every(v => v === null || v === undefined || v === '')) return;
                            const normalizedRow = {};
                            Object.keys(rowData).forEach(key => normalizedRow[normalize(key)] = rowData[key]);
                            
                            const rowEmail = String(normalizedRow.email || '').trim();
                            if (!rowEmail || !rowEmail.includes('@')) errors.push('Row ' + (i + 1) + ': Invalid email format');
                            const studentID = String(normalizedRow.studentid || '').trim();
                            if (role === 'student' && !studentID) errors.push('Row ' + (i + 1) + ': Student ID missing');

                            const finalRow = { ...normalizedRow, role };
                            finalRow.name = String(normalizedRow.name || '').trim();
                            finalRow.email = rowEmail;
                            finalRow.department = String(normalizedRow.department || '').trim();
                            if (normalizedRow.facultyid) finalRow.facultyId = String(normalizedRow.facultyid).trim();
                            if (normalizedRow.studentid) finalRow.studentId = studentID;

                            if (role === 'student') {
                                finalRow.semester = String(normalizedRow.semester || '1').trim();
                                const y = String(normalizedRow.year || '').trim().toUpperCase();
                                if (['1', '1ST', 'I', 'FIRST'].includes(y)) finalRow.year = 'I';
                                else if (['2', '2ND', 'II', 'SECOND'].includes(y)) finalRow.year = 'II';
                                else if (['3', '3RD', 'III', 'THIRD'].includes(y)) finalRow.year = 'III';
                                else if (['4', '4TH', 'IV', 'FOURTH'].includes(y)) finalRow.year = 'IV';
                                else finalRow.year = y || 'I';
                                if (normalizedRow.gpa) finalRow.gpa = parseFloat(normalizedRow.gpa) || 0;
                                if (normalizedRow.cgpa) finalRow.cgpa = parseFloat(normalizedRow.cgpa) || 0;
                            }
                            processedData.push(finalRow);
                        });
                        self.postMessage({ success: true, processedData, errors: errors.slice(0, 50) });
                    } catch (err) {
                        self.postMessage({ success: false, error: 'Matrix Sink Error: ' + err.message });
                    }
                }

                try {
                    const reader = new FileReaderSync();
                    if (isExcel) {
                        const arrayBuffer = reader.readAsArrayBuffer(file);
                        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                        const sheetName = workbook.SheetNames[0];
                        const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                        process(json);
                    } else {
                        const text = reader.readAsText(file);
                        Papa.parse(text, {
                            header: true,
                            skipEmptyLines: 'greedy',
                            complete: function(r) { process(r.data); },
                            error: function(err) { self.postMessage({ success: false, error: 'CSV Sink Error: ' + err.message }); }
                        });
                    }
                } catch (err) {
                    self.postMessage({ success: false, error: 'Sink Access Error: ' + err.message });
                }
            };
        `], { type: 'application/javascript' });

        const worker = new Worker(URL.createObjectURL(workerBlob));
        worker.postMessage({ file, isExcel, role });

        worker.onmessage = (e) => {
            const { success, error, processedData, errors, fallback } = e.data;
            if (fallback) {
                tryMainThreadFallback();
            } else if (success) {
                fullDataRef.current = processedData;
                setPreviewData(processedData.slice(0, 100));
                setValidationErrors(errors);
                setLoading(false);
                setValidating(false);
            } else {
                setValidationErrors([error || 'Critical background failure']);
                setLoading(false);
                setValidating(false);
            }
            worker.terminate();
        };

        worker.onerror = (err) => {
            console.warn("Background Engine Error:", err);
            tryMainThreadFallback();
            worker.terminate();
        };
    };

    const handleUpload = async () => {
        if (!fullDataRef.current.length) return;
        setLoading(true);
        setUploadStatus(null);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            await axios.post(getApiUrl('/api/auth/users/bulk'), fullDataRef.current, config);

            setUploadStatus('success');
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Matrix Upload Failure:", error);
            if (error.response) {
                console.error("Server Response Data:", error.response.data);
            }
            setUploadStatus('error');
            setValidationErrors([error.response?.data?.message || 'Upload failed']);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white/90 dark:bg-gray-900/40 backdrop-blur-[80px] rounded-[3rem] p-12 w-full max-w-[95vw] shadow-[0_0_100px_-20px_rgba(79,70,229,0.3)] border border-indigo-500/20 dark:border-white/10 relative overflow-hidden flex flex-col max-h-[85vh] h-full"
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-600/5 blur-[120px] rounded-full animate-pulse-slow pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/5 blur-[120px] rounded-full animate-pulse-slow pointer-events-none [animation-delay:2s]" />

                <button onClick={onClose} className="absolute top-10 right-10 p-2.5 rounded-full bg-gray-100/50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors z-20 border border-gray-200/50 dark:border-white/5">
                    <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>

                <div className="mb-8 relative z-10">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
                            <CloudArrowUpIcon className="w-8 h-8 text-white" />
                        </div>
                        Bulk Import {role === 'faculty' ? 'Faculty' : 'Students'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 ml-2 font-medium">Upload a CSV or Excel file to create multiple accounts at once with premium sync technology.</p>
                </div>

                {/* File Upload Section */}
                {!previewData.length && !validationErrors.length ? (
                    <div className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-3xl flex flex-col items-center justify-center p-12 relative hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group">
                        {loading ? (
                            <ArrowPathIcon className="w-16 h-16 text-indigo-500 animate-spin mb-4" />
                        ) : (
                            <CloudArrowUpIcon className="w-16 h-16 text-gray-400 group-hover:text-indigo-500 mb-4 transition-colors" />
                        )}
                        <p className="text-lg font-bold text-gray-600 dark:text-gray-300">
                            {loading ? (validating ? 'Analyzing Data...' : 'Processing File...') : 'Click to upload CSV or Excel'}
                        </p>
                        <div className="text-xs text-gray-400 mt-2">
                            {validating ? 'Background matrix sync active...' : (
                                <div className="flex flex-col items-center gap-1">
                                    <span>Required: name, email, password, department {role === 'student' && ', student id, year'}</span>
                                    <a
                                        href="/sample_student_import.csv"
                                        download
                                        className="text-indigo-500 hover:text-indigo-600 font-bold underline cursor-pointer mt-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Download Sample CSV
                                    </a>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onClick={(e) => (e.target.value = null)}
                        />
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                Loaded {previewData.length} rows from <span className="text-indigo-600">{file?.name}</span>
                            </div>
                            <button
                                onClick={() => { setFile(null); setPreviewData([]); setValidationErrors([]); }}
                                className="text-xs text-red-500 hover:underline font-bold"
                            >
                                Clear File
                            </button>
                        </div>

                        {/* Validation Errors */}
                        {validationErrors.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 mb-4 overflow-y-auto max-h-32">
                                <h4 className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm mb-2">
                                    <ExclamationCircleIcon className="w-5 h-5" />
                                    Validation Errors
                                </h4>
                                <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-300 space-y-1">
                                    {validationErrors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Data Preview */}
                        <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-xl custom-scrollbar relative">
                            <div className="min-w-full inline-block align-middle">
                                <div className="overflow-x-auto min-w-[800px]">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
                                            <tr>
                                                <th className="p-3 font-bold text-gray-600 dark:text-gray-300">Name</th>
                                                <th className="p-3 font-bold text-gray-600 dark:text-gray-300">Email</th>
                                                <th className="p-3 font-bold text-gray-600 dark:text-gray-300">Dept</th>
                                                <th className="p-3 font-bold text-gray-600 dark:text-gray-300">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {previewData.slice(0, 50).map((row, i) => (
                                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                    <td className="p-3 text-gray-800 dark:text-gray-200">{row.name}</td>
                                                    <td className="p-3 text-gray-800 dark:text-gray-200">{row.email}</td>
                                                    <td className="p-3 text-gray-800 dark:text-gray-200">{row.department}</td>
                                                    <td className="p-3">
                                                        {(!row.email || !row.email.includes('@')) ? (
                                                            <span className="text-red-500 font-bold text-xs">Invalid</span>
                                                        ) : (
                                                            <span className="text-green-500 font-bold text-xs">OK</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {previewData.length > 50 && (
                                                <tr>
                                                    <td colSpan="4" className="p-4 text-center text-gray-500 text-sm font-medium bg-gray-50/50 dark:bg-gray-800/50">
                                                        ... and {previewData.length - 50} more rows
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 relative z-10">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold text-gray-600 dark:text-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={loading || previewData.length === 0 || validationErrors.length > 0}
                        className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                    >
                        {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <CheckCircleIcon className="w-5 h-5" />}
                        {loading ? (validating ? 'Analyzing...' : 'Importing...') : 'Confirm Import'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default BulkImportModal;
