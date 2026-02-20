const mongoose = require('mongoose');

const feedbackSchema = mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Course',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    ratings: {
        syllabus: { type: Number, required: true, min: 1, max: 10 },
        methodology: { type: Number, required: true, min: 1, max: 10 },
        workload: { type: Number, required: true, min: 1, max: 10 },
        assessment: { type: Number, required: true, min: 1, max: 10 },
        resources: { type: Number, required: true, min: 1, max: 10 },
    },
    timeCommitment: {
        type: Number, // Hours per week
        required: true,
    },
    comments: {
        type: String,
    },
    sentimentScore: {
        type: Number, // Calculated by AI service (-1 to 1)
        default: 0,
    },
    difficultyIndex: { // Weighted score for this specific feedback
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

// Pre-save hook to calculate difficulty index locally before advanced AI processing
feedbackSchema.pre('save', function (next) {
    if (this.ratings) {
        // Example weights: Workload (30%), Assessment (25%), Syllabus (20%), Methodology (15%), Resources (10%)
        // Normalized to 1.0
        const weights = {
            workload: 0.3,
            assessment: 0.25,
            syllabus: 0.20,
            methodology: 0.15,
            resources: 0.10
        };

        let weightedSum =
            (this.ratings.workload * weights.workload) +
            (this.ratings.assessment * weights.assessment) +
            (this.ratings.syllabus * weights.syllabus) +
            (this.ratings.methodology * weights.methodology) +
            (this.ratings.resources * weights.resources);

        this.difficultyIndex = weightedSum.toFixed(2);
    }
    next();
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
