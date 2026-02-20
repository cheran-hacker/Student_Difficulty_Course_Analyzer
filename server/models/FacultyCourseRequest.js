const mongoose = require('mongoose');

const facultyRequestSchema = mongoose.Schema({
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    courseName: {
        type: String,
        required: true,
    },
    courseCode: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    justification: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    adminComments: {
        type: String
    }
}, {
    timestamps: true,
});

const FacultyCourseRequest = mongoose.model('FacultyCourseRequest', facultyRequestSchema);
module.exports = FacultyCourseRequest;
