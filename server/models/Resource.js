const mongoose = require('mongoose');

const resourceSchema = mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileType: {
        type: String // 'pdf', 'video', 'link'
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;
