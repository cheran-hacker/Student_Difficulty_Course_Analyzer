const validator = require('validator');

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return validator.escape(input.trim());
    }
    if (typeof input === 'object' && input !== null) {
        const sanitized = {};
        for (const key in input) {
            sanitized[key] = sanitizeInput(input[key]);
        }
        return sanitized;
    }
    return input;
};

// Validate course request
const validateCourseRequest = (req, res, next) => {
    const { courseCode, courseName, department } = req.body;

    if (!courseCode || !courseName || !department) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validator.isLength(courseCode, { min: 3, max: 20 })) {
        return res.status(400).json({ message: 'Course code must be 3-20 characters' });
    }

    if (!validator.isLength(courseName, { min: 3, max: 100 })) {
        return res.status(400).json({ message: 'Course name must be 3-100 characters' });
    }

    if (!validator.isLength(department, { min: 2, max: 50 })) {
        return res.status(400).json({ message: 'Department must be 2-50 characters' });
    }

    // Sanitize inputs
    req.body.courseCode = sanitizeInput(courseCode);
    req.body.courseName = sanitizeInput(courseName);
    req.body.department = sanitizeInput(department);

    next();
};

// Validate feedback  
const validateFeedback = (req, res, next) => {
    const { difficultyIndex, timeCommitment, comments } = req.body;

    if (difficultyIndex !== undefined) {
        if (!validator.isInt(String(difficultyIndex), { min: 0, max: 10 })) {
            return res.status(400).json({ message: 'Difficulty must be 0-10' });
        }
    }

    if (timeCommitment !== undefined) {
        if (!validator.isInt(String(timeCommitment), { min: 0, max: 168 })) {
            return res.status(400).json({ message: 'Time commitment must be 0-168 hours' });
        }
    }

    if (comments && !validator.isLength(comments, { max: 2000 })) {
        return res.status(400).json({ message: 'Comments must be less than 2000 characters' });
    }

    // Sanitize
    if (comments) {
        req.body.comments = sanitizeInput(comments);
    }

    next();
};

// Validate email
const validateEmail = (req, res, next) => {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
    }

    req.body.email = validator.normalizeEmail(email);
    next();
};

module.exports = {
    validateCourseRequest,
    validateFeedback,
    validateEmail,
    sanitizeInput
};
