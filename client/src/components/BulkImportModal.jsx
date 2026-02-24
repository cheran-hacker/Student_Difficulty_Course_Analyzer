import { useState, useRef } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CloudArrowUpIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { getApiUrl } from '../config/api';

const BulkImportModal = ({ onClose, onSuccess, role = 'faculty' }) => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [validationErrors, setValidationErrors] = useState([]);
    const [loading, setLoading] = useState(false);
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
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file) => {
        setLoading(true);
        setPreviewData([]);
        setValidationErrors([]);

        // Give UI a moment to render loading state
        setTimeout(() => {
            const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

            if (isExcel) {
                // Use a Web Worker for Excel parsing to prevent freezing the main thread
                const workerCode = `
                    importScripts('https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js');
                    
                    self.onmessage = function(e) {
                        try {
                            const data = e.data;
                            const workbook = XLSX.read(data, { type: 'array' });
                            const sheetName = workbook.SheetNames[0];
                            const worksheet = workbook.Sheets[sheetName];
                            const json = XLSX.utils.sheet_to_json(worksheet);
                            self.postMessage({ success: true, data: json });
                        } catch (error) {
                            self.postMessage({ success: false, error: error.message });
                        }
                    };
                `;

                const blob = new Blob([workerCode], { type: 'application/javascript' });
                const worker = new Worker(URL.createObjectURL(blob));

                const reader = new FileReader();
                reader.onload = (e) => {
                    worker.postMessage(e.target.result);
                };

                worker.onmessage = (e) => {
                    if (e.data.success) {
                        const rawData = e.data.data;
                        // Normalize keys
                        const data = rawData.map(row => {
                            const newRow = {};
                            Object.keys(row).forEach(key => {
                                newRow[key.toString().trim().toLowerCase()] = row[key];
                            });
                            return newRow;
                        });
                        validateAndSetData(data);
                    } else {
                        console.error("Worker Error:", e.data.error);
                        setValidationErrors(['Failed to parse Excel file']);
                        setLoading(false);
                    }
                    worker.terminate();
                };

                reader.readAsArrayBuffer(file);
            } else {
                // Use PapaParse with worker for CSV
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    worker: true, // Offload to worker thread
                    complete: (results) => {
                        // Normalize keys (PapaParse keeps original case headers)
                        const data = results.data.map(row => {
                            const newRow = {};
                            Object.keys(row).forEach(key => {
                                newRow[key.trim().toLowerCase()] = row[key];
                            });
                            return newRow;
                        });
                        validateAndSetData(data);
                    },
                    error: (error) => {
                        console.error(error);
                        setValidationErrors(['Failed to parse CSV file']);
                        setLoading(false);
                    }
                });
            }
        }, 100);
    };

    const validateAndSetData = (data) => {
        // Dynamic validation of headers based on role
        // Check if data is empty or first row keys
        if (data.length === 0) {
            setValidationErrors(['File is empty']);
            setLoading(false);
            return;
        }

        const headers = Object.keys(data[0]);
        let requiredHeaders = ['name', 'email', 'password', 'department'];
        if (role === 'student') {
            requiredHeaders = [...requiredHeaders, 'studentid', 'year'];
        }

        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
            setValidationErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
            setLoading(false);
            return;
        }

        const processedData = [];
        const errors = [];

        data.forEach((rowData, i) => {
            // Row-level validation
            if (!rowData.email || !rowData.email.includes('@')) {
                errors.push(`Row ${i + 1}: Invalid email`);
            }
            if (role === 'student' && !rowData.studentid && !rowData.studentId) {
                errors.push(`Row ${i + 1}: Missing Student ID`);
            }

            // Normalize fields to camelCase for the model
            const finalRow = { ...rowData, role };
            if (rowData.facultyid) finalRow.facultyId = rowData.facultyid;
            if (rowData.studentid) finalRow.studentId = rowData.studentid;

            // Add role and default semester for students if missing
            if (role === 'student') {
                if (!finalRow.semester) finalRow.semester = '1';

                // Normalize Year to Roman Numerals
                const y = String(finalRow.year || '').trim().toUpperCase();
                if (['1', '1ST', 'I', 'FIRST'].includes(y)) finalRow.year = 'I';
                else if (['2', '2ND', 'II', 'SECOND'].includes(y)) finalRow.year = 'II';
                else if (['3', '3RD', 'III', 'THIRD'].includes(y)) finalRow.year = 'III';
                else if (['4', '4TH', 'IV', 'FOURTH'].includes(y)) finalRow.year = 'IV';
            }

            processedData.push(finalRow);
        });

        setPreviewData(processedData);
        setValidationErrors(errors);
        setLoading(false);
    };

    const handleUpload = async () => {
        setLoading(true);
        setUploadStatus(null);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            await axios.post(getApiUrl('/api/auth/users/bulk'), previewData, config);

            setUploadStatus('success');
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (error) {
            console.error(error);
            setUploadStatus('error');
            setValidationErrors([error.response?.data?.message || 'Upload failed']);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 w-full max-w-4xl shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden flex flex-col max-h-[90vh]"
            >
                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors z-10">
                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <CloudArrowUpIcon className="w-8 h-8 text-indigo-600" />
                        Bulk Import {role === 'faculty' ? 'Faculty' : 'Students'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Upload a CSV or Excel file to create multiple accounts at once.</p>
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
                            {loading ? 'Processing File...' : 'Click to upload CSV or Excel'}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Required columns: name, email, password, department {role === 'student' && ', studentid, year'}
                        </p>
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
                        <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-xl custom-scrollbar">
                            <table className="w-full text-left text-sm">
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
                )}

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
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
                        {loading ? 'Importing...' : 'Confirm Import'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default BulkImportModal;
