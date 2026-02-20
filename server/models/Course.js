const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    semester: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    instructors: [{
        type: String,
    }],
    // Upload tracking
    uploadStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
    },
    // Syllabus file metadata
    syllabus: {
        originalName: String,
        path: String,
        size: Number,
        mimeType: String,
        uploadedAt: Date,
        detectedKeywords: [String],
        difficultyLevel: String,
        topicCount: {
            type: Number,
            default: 0
        },
        weeklyWorkload: [Number] // Number of topics or hours per week
    },
    // Analytics data
    analytics: {
        studentCount: {
            type: Number,
            default: 0,
        },
        completionRate: {
            type: Number,
            default: 0,
        },
    },
}, {
    timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
