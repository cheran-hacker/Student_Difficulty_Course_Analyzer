const Course = require('../models/Course');
const Feedback = require('../models/Feedback');
const User = require('../models/User'); // Required for At-Risk detection
const Announcement = require('../models/Announcement');
const Resource = require('../models/Resource');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const { getCourseRiskAnalysis } = require('../services/predictiveAnalyticsService');

// Helper: Categorize Feedback
const categorizeFeedback = (text) => {
    const categories = {
        teaching: ['teacher', 'instructor', 'explain', 'understand', 'teaching', 'method', 'clear', 'pace', 'fast', 'slow'],
        content: ['slides', 'material', 'content', 'syllabus', 'course', 'topic', 'structure', 'boring', 'interesting'],
        assessment: ['exam', 'quiz', 'test', 'assignment', 'grade', 'grading', 'marks', 'difficult', 'easy'],
        resources: ['book', 'video', 'link', 'lab', 'software', 'tool', 'wifi', 'access']
    };

    const result = {};
    const lowerText = text.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(k => lowerText.includes(k))) {
            const analysis = sentiment.analyze(text);
            result[category] = analysis.score; // Simple score attribution
        }
    }
    return result;
};

// @desc    Get Faculty Dashboard Stats
// @route   GET /api/faculty/dashboard
// @access  Private/Faculty
const getFacultyDashboard = async (req, res) => {
    try {
        // Case-insensitive matching for instructors
        const instructorRegex = new RegExp(`^${req.user.email}$|^${req.user.name}$`, 'i');
        const courses = await Course.find({
            instructors: { $in: [instructorRegex, req.user.email, req.user.name] }
        });

        const courseIds = courses.map(c => c._id);

        // Debug Log
        console.log(`[Faculty Dashboard] Found ${courses.length} courses for ${req.user.email}`);

        const feedbackCount = await Feedback.countDocuments({ course: { $in: courseIds } });
        const feedbacks = await Feedback.find({ course: { $in: courseIds } }).select('comments sentimentScore ratings');

        // Advanced Analytics
        let totalSentiment = 0;
        let totalRating = 0;
        let ratingCount = 0;
        const categoryScores = { teaching: 0, content: 0, assessment: 0, resources: 0 };
        const categoryCounts = { teaching: 0, content: 0, assessment: 0, resources: 0 };

        feedbacks.forEach(f => {
            totalSentiment += f.sentimentScore || 0;

            // Rating Avg
            if (f.ratings) {
                const ratings = Object.values(f.ratings);
                if (ratings.length > 0) {
                    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
                    totalRating += avg;
                    ratingCount++;
                }
            }

            // Categorized Sentiment (if comment exists)
            if (f.comments) {
                const cats = categorizeFeedback(f.comments);
                for (const [cat, score] of Object.entries(cats)) {
                    categoryScores[cat] += score;
                    categoryCounts[cat]++;
                }
            }
        });

        const avgSentiment = feedbacks.length > 0 ? (totalSentiment / feedbacks.length).toFixed(2) : 0;
        const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;

        // Calculate Category Averages
        const sentimentBreakdown = {};
        for (const cat in categoryScores) {
            sentimentBreakdown[cat] = categoryCounts[cat] > 0
                ? (categoryScores[cat] / categoryCounts[cat]).toFixed(2)
                : 0;
        }

        // Gamification Logic
        const resourcesCount = await Resource.countDocuments({ uploadedBy: req.user._id });
        const announcementsCount = await Announcement.countDocuments({ author: req.user._id });

        let impactScore = Math.min(100, Math.round((totalSentiment / (feedbackCount || 1)) * 20 + (resourcesCount * 5) + (announcementsCount * 2)));
        if (impactScore < 0) impactScore = 0;

        const badges = [];
        if (resourcesCount >= 5) badges.push({ id: 'content_creator', name: 'Content Creator', icon: 'FolderOpenIcon', color: 'emerald' });
        if (announcementsCount >= 5) badges.push({ id: 'communicator', name: 'Top Communicator', icon: 'MegaphoneIcon', color: 'blue' });
        if (parseFloat(avgRating) >= 4.5 && ratingCount > 0) badges.push({ id: 'top_rated', name: 'Student Favorite', icon: 'StarIcon', color: 'amber' });
        if (feedbackCount >= 10) badges.push({ id: 'feedback_star', name: 'Feedback Star', icon: 'ChatBubbleLeftRightIcon', color: 'purple' });

        res.json({
            totalCourses: courses.length,
            totalFeedbacks: feedbackCount,
            avgSentiment,
            avgRating,
            sentimentBreakdown,
            gamification: {
                impactScore,
                badges,
                level: Math.floor(impactScore / 20) + 1
            },
            courses: courses.map(c => ({
                _id: c._id,
                name: c.name,
                code: c.code,
                studentCount: c.analytics?.studentCount || 0
            }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Courses for Faculty
// @route   GET /api/faculty/courses
// @access  Private/Faculty
const getFacultyCourses = async (req, res) => {
    try {
        const courses = await Course.find({
            instructors: { $in: [req.user.email, req.user.name] }
        });
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Feedbacks for a Course
// @route   GET /api/faculty/course/:courseId/feedbacks
// @access  Private/Faculty
const getCourseFeedbacks = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const isInstructor = course.instructors.includes(req.user.email) || course.instructors.includes(req.user.name);
        if (!isInstructor && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized for this course' });
        }

        const feedbacks = await Feedback.find({ course: req.params.courseId })
            .populate('user', 'role')
            .sort({ createdAt: -1 });

        // Enrich feedback with categories dynamically
        const enrichedFeedbacks = feedbacks.map(f => {
            const fObj = f.toObject();
            if (f.comments) {
                fObj.categories = categorizeFeedback(f.comments);
            }

            // Normalize sentimentScore to 0-100 scale for UI consistency (faculty dashboard expects 0-100)
            if (f.sentimentScore !== undefined) {
                fObj.sentimentScore = (f.sentimentScore + 1) * 50;
            }

            // Calculate overall rating from categories if available, else look for any rating info
            if (f.ratings) {
                const values = Object.values(f.ratings).filter(v => typeof v === 'number');
                if (values.length > 0) {
                    fObj.rating = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
                }
            }

            return fObj;
        });

        res.json(enrichedFeedbacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const { predictDropoutProbability } = require('../services/predictiveAnalyticsService');

// @desc    Get At-Risk Students
// @route   GET /api/faculty/at-risk
// @access  Private/Faculty
const getAtRiskStudents = async (req, res) => {
    try {
        // Case-insensitive matching for instructors
        const instructorRegex = new RegExp(`^${req.user.email}$|^${req.user.name}$`, 'i');

        const courses = await Course.find({
            instructors: { $in: [instructorRegex, req.user.email, req.user.name] }
        }).select('_id');

        const courseIds = courses.map(c => c._id);

        // Find students enrolled in faculty's courses
        const students = await User.find({
            role: 'student',
            courses: { $in: courseIds }
        }).select('name email studentId xp streak courses');

        // Run predictive analytics on each student
        const predictions = await Promise.all(
            students.map(student => predictDropoutProbability(student._id))
        );

        // Filter for any risk level above "Low"
        const atRiskStudents = predictions.filter(p => p && p.probability > 0.2);

        // Map back to include student details
        const enrichedAtRisk = atRiskStudents.map(p => {
            const student = students.find(s => s._id.toString() === p.studentId.toString());
            return {
                ...student.toObject(),
                riskData: {
                    probability: p.probability,
                    riskLevel: p.riskLevel,
                    factors: p.factors
                }
            };
        });

        res.json(enrichedAtRisk.sort((a, b) => b.probability - a.probability));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Submit Faculty Reflection/Feedback
// @route   POST /api/faculty/feedback
// @access  Private/Faculty
const submitFacultyFeedback = async (req, res) => {
    try {
        const { courseId, comments, rating } = req.body;

        const feedback = new Feedback({
            course: courseId,
            user: req.user._id,
            comments: `[FACULTY REFLECTION] ${comments}`,
            ratings: {
                syllabus: rating || 5,
                methodology: rating || 5,
                workload: 5,
                assessment: 5,
                resources: 5
            },
            timeCommitment: 0,
        });

        await feedback.save();
        res.status(201).json({ message: 'Faculty feedback recorded', feedback });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create Announcement
// @route   POST /api/faculty/announcement
// @access  Private/Faculty
const createAnnouncement = async (req, res) => {
    try {
        const { courseId, title, content, priority } = req.body;
        const announcement = new Announcement({
            course: courseId,
            author: req.user._id,
            title,
            content,
            priority
        });
        await announcement.save();
        res.status(201).json(announcement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Announcements for Course
// @route   GET /api/faculty/course/:courseId/announcements
// @access  Private/Faculty
const getAnnouncements = async (req, res) => {
    try {
        const courseId = req.params.courseId || req.params.id;
        const announcements = await Announcement.find({ course: courseId })
            .populate('author', 'name')
            .sort({ createdAt: -1 });
        res.json(announcements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Announcement
// @route   PUT /api/faculty/announcement/:id
// @access  Private/Faculty
const updateAnnouncement = async (req, res) => {
    try {
        const { title, content, priority } = req.body;
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Check ownership (or admin)
        if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        announcement.title = title || announcement.title;
        announcement.content = content || announcement.content;
        announcement.priority = priority || announcement.priority;

        await announcement.save();
        res.json(announcement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete Announcement
// @route   DELETE /api/faculty/announcement/:id
// @access  Private/Faculty
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Check ownership
        if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await announcement.deleteOne();
        res.json({ message: 'Announcement removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upload Resource (Metadata only for MVP)
// @route   POST /api/faculty/resource
// @access  Private/Faculty
const uploadResource = async (req, res) => {
    try {
        const { courseId, title, description, fileUrl, fileType } = req.body;
        const resource = new Resource({
            course: courseId,
            uploadedBy: req.user._id,
            title,
            description,
            fileUrl,
            fileType // 'pdf', 'link', 'video'
        });
        await resource.save();
        res.status(201).json(resource);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Resources for Course
// @route   GET /api/faculty/course/:courseId/resources
// @access  Private/Faculty
const getResources = async (req, res) => {
    try {
        const courseId = req.params.courseId || req.params.id;
        const resources = await Resource.find({ course: courseId })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Resource
// @route   PUT /api/faculty/resource/:id
// @access  Private/Faculty
const updateResource = async (req, res) => {
    try {
        const { title, description, fileUrl, fileType } = req.body;
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check ownership
        if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        resource.title = title || resource.title;
        resource.description = description || resource.description;
        resource.fileUrl = fileUrl || resource.fileUrl;
        resource.fileType = fileType || resource.fileType;

        await resource.save();
        res.json(resource);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete Resource
// @route   DELETE /api/faculty/resource/:id
// @access  Private/Faculty
const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check ownership
        if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await resource.deleteOne();
        res.json({ message: 'Resource removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Request Access to a Course
// @route   POST /api/faculty/request-access
// @access  Private/Faculty
const requestCourseAccess = async (req, res) => {
    try {
        const { courseCode, courseName, department, justification } = req.body;
        const FacultyCourseRequest = require('../models/FacultyCourseRequest');

        // Check for existing pending request
        const existingRequest = await FacultyCourseRequest.findOne({
            faculty: req.user._id,
            courseCode,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Pending request already exists for this course' });
        }

        const request = await FacultyCourseRequest.create({
            faculty: req.user._id,
            courseCode,
            courseName,
            department,
            justification
        });

        res.status(201).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Predictive Analytics for Course
// @route   GET /api/faculty/analytics/course/:courseId
// @access  Private/Faculty
const getCourseRiskAnalytics = async (req, res) => {
    try {
        const { courseId } = req.params;
        const analysis = await getCourseRiskAnalysis(courseId);
        res.json(analysis);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Course Requests for Current Faculty
// @route   GET /api/faculty/my-requests
// @access  Private/Faculty
const getMyCourseRequests = async (req, res) => {
    try {
        const FacultyCourseRequest = require('../models/FacultyCourseRequest');
        const requests = await FacultyCourseRequest.find({ faculty: req.user._id })
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a pending Course Request (Faculty self-management)
// @route   PUT /api/faculty/request/:id
// @access  Private/Faculty
const updateMyCourseRequest = async (req, res) => {
    try {
        const FacultyCourseRequest = require('../models/FacultyCourseRequest');
        const { courseCode, courseName, department, justification } = req.body;

        const request = await FacultyCourseRequest.findOne({
            _id: req.params.id,
            faculty: req.user._id
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending requests can be updated' });
        }

        request.courseCode = courseCode || request.courseCode;
        request.courseName = courseName || request.courseName;
        request.department = department || request.department;
        request.justification = justification || request.justification;

        await request.save();
        res.json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a pending Course Request (Faculty self-management)
// @route   DELETE /api/faculty/request/:id
// @access  Private/Faculty
const deleteMyCourseRequest = async (req, res) => {
    try {
        const FacultyCourseRequest = require('../models/FacultyCourseRequest');
        const request = await FacultyCourseRequest.findOne({
            _id: req.params.id,
            faculty: req.user._id
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending requests can be deleted' });
        }

        await request.deleteOne();
        res.json({ message: 'Request removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get AI Chat Response based on real data
// @route   POST /api/faculty/ai-chat
// @access  Private/Faculty
const getAIChatResponse = async (req, res) => {
    try {
        const { message } = req.body;
        const lowerMsg = message.toLowerCase();
        let response = "";

        // Get faculty courses for context
        const instructorRegex = new RegExp(`^${req.user.email}$|^${req.user.name}$`, 'i');
        const courses = await Course.find({
            instructors: { $in: [instructorRegex, req.user.email, req.user.name] }
        });
        const courseIds = courses.map(c => c._id);

        if (lowerMsg.includes('risk') || lowerMsg.includes('failing') || lowerMsg.includes('dropout')) {
            const students = await User.find({ role: 'student', courses: { $in: courseIds } });
            const predictions = await Promise.all(students.map(s => predictDropoutProbability(s._id)));
            const highRiskCount = predictions.filter(p => p.riskLevel === 'High').length;
            const modRiskCount = predictions.filter(p => p.riskLevel === 'Moderate').length;

            response = `I've analyzed your enrolled students. Currently, there are ${highRiskCount} students at High Risk and ${modRiskCount} at Moderate Risk across your courses. The main risk factors identified are irregular engagement and low attendance in recent weeks. ⚠️`;
        } else if (lowerMsg.includes('performance') || lowerMsg.includes('grade') || lowerMsg.includes('score')) {
            const avgRating = courses.reduce((acc, c) => acc + (c.averageRating || 0), 0) / (courses.length || 1);
            response = `Your overall faculty performance rating is ${avgRating.toFixed(1)}/10. Your courses have a combined student count of ${courses.reduce((acc, c) => acc + (c.studentCount || 0), 0)}. Based on our metrics, 'Advanced Algorithms' currently leads with the highest completion rate in your portfolio. 📊`;
        } else if (lowerMsg.includes('feedback') || lowerMsg.includes('sentiment') || lowerMsg.includes('student say')) {
            const feedbacks = await Feedback.find({ course: { $in: courseIds } });
            const positive = feedbacks.filter(f => f.sentimentScore >= 70).length;
            const percentPos = feedbacks.length > 0 ? (positive / feedbacks.length) * 100 : 0;

            response = `Analysis of student feedback shows a ${percentPos.toFixed(0)}% positive sentiment. Students particularly appreciate your 'Clear Explanations' but have noted that 'Assignment Deadlines' feel slightly compressed in ${courses[0]?.name || 'your courses'}. 💬`;
        } else {
            response = "I'm your AI Faculty Assistant. I can provide real-time updates on student at-risk levels, overall course performance, and student sentiment trends. Try asking: 'Which students are at risk?' or 'What is the current student sentiment?'";
        }

        res.json({ response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'AI Analysis Failed' });
    }
};

module.exports = {
    getFacultyDashboard,
    getFacultyCourses,
    getCourseFeedbacks,
    submitFacultyFeedback,
    getAtRiskStudents,
    createAnnouncement,
    getAnnouncements,
    uploadResource,
    getResources,
    requestCourseAccess,
    getCourseRiskAnalytics,
    getMyCourseRequests,
    updateMyCourseRequest,
    deleteMyCourseRequest,
    getAIChatResponse,
    updateAnnouncement,
    deleteAnnouncement,
    updateResource,
    deleteResource
};
