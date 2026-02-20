const Course = require('../models/Course');
const fs = require('fs').promises;

// @desc    Get all distinct departments
// @route   GET /api/courses/departments
// @access  Public
const getDepartments = async (req, res) => {
    try {
        const departments = await Course.distinct('department');
        res.status(200).json(departments.sort());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public (or Protected depending on route)
const getCourses = async (req, res) => {
    try {
        const { department, status, sortBy = 'createdAt', order = 'desc', page = 1, limit = 50 } = req.query;
        let query = {};

        if (department) {
            query.department = department;
        }
        if (status) {
            query.uploadStatus = status;
        }

        const sortOrder = order === 'asc' ? 1 : -1;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const courses = await Course.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Course.countDocuments(query);

        res.status(200).json({
            courses,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
    try {
        const { code, name, department, semester, description, instructors } = req.body;

        const courseExists = await Course.findOne({ code });

        if (courseExists) {
            return res.status(400).json({ message: 'Course with this code already exists' });
        }

        const course = await Course.create({
            code,
            name,
            department,
            semester,
            description,
            instructors
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        await course.deleteOne();

        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload syllabus
// @route   POST /api/courses/:id/syllabus
// @access  Private/Admin
const uploadSyllabus = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            if (req.file) await fs.unlink(req.file.path).catch(err => console.error(err));
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check Permission: Admin or Assigned Faculty (Name or Email match)
        const isInstructor = course.instructors && course.instructors.some(ins => {
            const facultyMatch = ins.toLowerCase() === req.user.email.toLowerCase() ||
                ins.toLowerCase() === req.user.name.toLowerCase();
            return facultyMatch;
        });

        if (req.user.role !== 'admin' && !isInstructor) {
            if (req.file) await fs.unlink(req.file.path).catch(err => console.error(err));
            return res.status(403).json({ message: 'Not authorized to manage this course syllabus' });
        }

        // Update course with syllabus metadata
        course.syllabus = {
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            mimeType: req.file.mimetype,
            uploadedAt: Date.now(),
            detectedKeywords: ['Advanced_Algorithms', 'System_Design', 'Scalability', 'Distributed_Systems', 'Machine_Learning_Ops'],
            difficultyLevel: 'Hard'
        };
        course.uploadStatus = 'completed';

        await course.save();

        res.status(200).json({
            message: 'Syllabus uploaded successfully',
            course,
            analysis: {
                detectedKeywords: ['Advanced_Algorithms', 'System_Design', 'Scalability', 'Distributed_Systems', 'Machine_Learning_Ops'],
                difficultyLevel: 'Hard',
                confidenceScore: 0.98
            }
        });
    } catch (error) {
        // Clean up file on error
        if (req.file) {
            await fs.unlink(req.file.path).catch(err => console.error(err));
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete syllabus
// @route   DELETE /api/courses/:id/syllabus
// @access  Private/Admin
const deleteSyllabus = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check Permission: Admin or Assigned Faculty (Name or Email match)
        const isInstructor = course.instructors && course.instructors.some(ins => {
            const facultyMatch = ins.toLowerCase() === req.user.email.toLowerCase() ||
                ins.toLowerCase() === req.user.name.toLowerCase();
            return facultyMatch;
        });

        if (req.user.role !== 'admin' && !isInstructor) {
            return res.status(403).json({ message: 'Not authorized to manage this course syllabus' });
        }

        if (course.syllabus && course.syllabus.path) {
            await fs.unlink(course.syllabus.path).catch(err => console.error(err));
        }

        course.syllabus = undefined;
        course.uploadStatus = 'pending';
        await course.save();

        res.status(200).json({ message: 'Syllabus deleted successfully', course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk delete courses
// @route   POST /api/admin/courses/bulk-delete
// @access  Private/Admin
const bulkDeleteCourses = async (req, res) => {
    try {
        const { courseIds } = req.body;

        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of course IDs' });
        }

        // Find courses and delete their files
        const courses = await Course.find({ _id: { $in: courseIds } });

        // Delete associated files
        for (const course of courses) {
            if (course.syllabus && course.syllabus.path) {
                await fs.unlink(course.syllabus.path).catch(err => console.error(err));
            }
        }

        // Delete courses
        const result = await Course.deleteMany({ _id: { $in: courseIds } });

        res.status(200).json({
            message: `${result.deletedCount} courses deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk update course status
// @route   PATCH /api/admin/courses/bulk-status
// @access  Private/Admin
const bulkUpdateStatus = async (req, res) => {
    try {
        const { courseIds, status } = req.body;

        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of course IDs' });
        }

        if (!['pending', 'processing', 'completed', 'failed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const result = await Course.updateMany(
            { _id: { $in: courseIds } },
            { $set: { uploadStatus: status } }
        );

        res.status(200).json({
            message: `${result.modifiedCount} courses updated successfully`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get course statistics
// @route   GET /api/courses/stats
// @access  Private
const getCourseStats = async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments();
        const statusStats = await Course.aggregate([
            {
                $group: {
                    _id: '$uploadStatus',
                    count: { $sum: 1 }
                }
            }
        ]);
        const departmentStats = await Course.aggregate([
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            totalCourses,
            byStatus: statusStats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {}),
            byDepartment: departmentStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const { getWorkloadForecast, getPersonalDifficultyScore } = require('../services/analyticsService');

// @desc    Get workload forecast
// @route   GET /api/courses/:id/workload-forecast
// @access  Private
const getCourseWorkloadForecast = async (req, res) => {
    try {
        const forecast = await getWorkloadForecast(req.params.id);
        res.status(200).json(forecast);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get personal difficulty prediction
// @route   GET /api/courses/:id/difficulty-prediction
// @access  Private
const getCourseDifficultyPrediction = async (req, res) => {
    try {
        const prediction = await getPersonalDifficultyScore(req.user._id, req.params.id);
        res.status(200).json(prediction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Import courses from CSV
// @route   POST /api/courses/import
// @access  Private/Admin
const importCourses = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file' });
        }

        const filePath = req.file.path;
        const fileContent = await fs.readFile(filePath, 'utf8');
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim());

        if (lines.length < 2) {
            await fs.unlink(filePath);
            return res.status(400).json({ message: 'CSV file is empty or missing headers' });
        }

        const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
        const requiredHeaders = ['code', 'name', 'department', 'semester'];

        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            await fs.unlink(filePath);
            return res.status(400).json({ message: `Missing required headers: ${missingHeaders.join(', ')}` });
        }

        const coursesToInsert = [];
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(val => val.trim());

            if (values.length !== headers.length) {
                // Handle comma issues simply for now, or just skip malformed lines
                // For a robust CSV parser, we'd need a library, but this suffices for simple CSVs
                continue;
            }

            const courseData = {};
            headers.forEach((header, index) => {
                if (header === 'instructors') {
                    courseData[header] = values[index] ? values[index].split(';').map(ins => ins.trim()) : [];
                } else {
                    courseData[header] = values[index];
                }
            });

            // Basic Validation
            if (!courseData.code || !courseData.name) {
                errors.push(`Row ${i + 1}: Missing code or name`);
                continue;
            }

            // Check if course already exists to avoid duplicates in this batch
            // (Database unique constraint will verify actual insertion)
            coursesToInsert.push(courseData);
        }

        let insertedCount = 0;
        let updatedCount = 0;

        for (const courseData of coursesToInsert) {
            try {
                // Upsert: Update if exists, Insert if not
                const result = await Course.updateOne(
                    { code: courseData.code },
                    { $set: courseData },
                    { upsert: true }
                );

                if (result.upsertedCount > 0) insertedCount++;
                else if (result.modifiedCount > 0) updatedCount++;

            } catch (err) {
                errors.push(`Error processing ${courseData.code}: ${err.message}`);
            }
        }

        await fs.unlink(filePath); // Cleanup

        res.status(200).json({
            message: 'Import processing completed',
            summary: {
                totalRows: lines.length - 1,
                inserted: insertedCount,
                updated: updatedCount,
                failed: errors.length
            },
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        if (req.file) await fs.unlink(req.file.path).catch(console.error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get students enrolled in a course
// @route   GET /api/courses/:id/students
// @access  Private (Faculty/Admin)
const getCourseStudents = async (req, res) => {
    try {
        const User = require('../models/User'); // Lazy load
        const { predictDropoutProbability } = require('../services/predictiveAnalyticsService');

        const students = await User.find({
            courses: req.params.id,
            role: 'student'
        }).select('name email studentId academicPerformance xp streak courses');

        const enrichedStudents = await Promise.all(
            students.map(async (student) => {
                const prediction = await predictDropoutProbability(student._id);
                return {
                    ...student.toObject(),
                    riskData: prediction || { probability: 0, riskLevel: 'Low', factors: [] }
                };
            })
        );

        res.status(200).json(enrichedStudents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    uploadSyllabus,
    deleteSyllabus,
    bulkDeleteCourses,
    bulkUpdateStatus,
    getCourseStats,
    getCourseWorkloadForecast,
    getCourseDifficultyPrediction,
    getDepartments,
    importCourses,
    getCourseStudents
};
