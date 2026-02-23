const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'faculty'],
        default: 'student',
    },
    studentId: {
        type: String,
        unique: true,
        sparse: true // Allows null/undefined for admins
    },
    facultyId: {
        type: String,
        unique: true,
        sparse: true
    },
    department: {
        type: String,
    },
    year: {
        type: String, // e.g., "Sophomore", "2024"
    },
    // Gamification Module
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    badges: [{
        id: String,
        name: String,
        icon: String, // HeroIcon name or Emoji
        dateEarned: { type: Date, default: Date.now }
    }],
    streak: {
        current: { type: Number, default: 0 },
        lastLogin: Date
    },
    // Social Module
    bio: String,
    socialLinks: {
        linkedin: String,
        github: String
    },
    // Course Enrollment
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    // Academic Data for Predictive Engine
    gpa: {
        type: Number,
        default: 0
    },
    academicPerformance: {
        type: String,
        enum: ['Excellent', 'Good', 'Average', 'Poor', 'N/A'],
        default: 'N/A'
    },
    cgpa: {
        type: Number,
        default: 0
    },
    semester: {
        type: String,
        default: '1'
    },
    isLoginAllowed: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
