const mongoose = require('mongoose');

const requestSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    courseCode: {
        type: String,
        required: true,
    },
    courseName: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    semester: {
        type: String,
        default: '1',
    },
    instructors: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

const CourseRequest = mongoose.model('CourseRequest', requestSchema);
module.exports = CourseRequest;
