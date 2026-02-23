const { addXP, checkBadges } = require('../services/gamificationService');
const { logAudit } = require('../utils/auditLogger');
const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const logDebug = (msg) => {
    const debugLogPath = path.join(__dirname, '../debug_auth.log');
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg}\n`;
    try {
        fs.appendFileSync(debugLogPath, logMsg);
    } catch (e) {
        console.error('Failed to write to debug log', e);
    }
    console.log(msg); // Also log to console
};

// @desc    Get user by ID
// @route   GET /api/auth/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip;

    logDebug(`[Auth Debug] Login attempt for: ${email}`);

    try {
        // Check Admin Collection first
        let user = await Admin.findOne({ email });
        let collection = 'Admin';
        logDebug(`[Auth Debug] Admin lookup result: ${user ? 'Found' : 'Not Found'}`);

        if (!user) {
            user = await User.findOne({ email });
            collection = 'User';
            logDebug(`[Auth Debug] User lookup result: ${user ? 'Found' : 'Not Found'}`);
        }

        if (user && user.role !== 'admin') {
            // Check if login is allowed
            if (user.isLoginAllowed === false) {
                logDebug(`[Auth Debug] Login restricted for: ${email}`);
                return res.status(403).json({ message: 'Your account has been restricted. Please contact the administrator.' });
            }

            // Institutional Email Enforcement
            if (!email.toLowerCase().endsWith('@bitsathy.ac.in')) {
                logDebug(`[Auth Debug] Domain check failed for: ${email}`);
                return res.status(401).json({ message: 'Domain Access Denied: Institutional email required' });
            }
        }

        if (user && (await user.matchPassword(password))) {
            logDebug(`[Auth Debug] Password matched for: ${email}`);

            // Gamification: Daily Streak & XP
            let gamificationStats = null;
            try {
                logDebug(`[Auth Debug] Starting gamification logic...`);
                const now = new Date();
                const lastLogin = user.streak?.lastLogin ? new Date(user.streak.lastLogin) : null;

                // SKIP GAMIFICATION FOR ADMINS - They don't have streaks or XP in the schema
                if (user.role === 'admin' || collection === 'Admin') {
                    logDebug(`[Auth Debug] Skipping gamification for Admin role.`);
                } else {
                    // Initialize streak if missing
                    if (!user.streak) user.streak = { current: 0, lastLogin: null };

                    let awardXP = false;
                    let isStreakExtended = false;

                    if (!lastLogin) {
                        // First ever login
                        user.streak.current = 1;
                        user.streak.lastLogin = now;
                        awardXP = true;
                    } else {
                        // Check if last login was today
                        const isToday = lastLogin.toDateString() === now.toDateString();

                        if (!isToday) {
                            const yesterday = new Date(now);
                            yesterday.setDate(yesterday.getDate() - 1);
                            const isYesterday = lastLogin.toDateString() === yesterday.toDateString();

                            if (isYesterday) {
                                user.streak.current += 1;
                                isStreakExtended = true;
                            } else {
                                // Streak broken
                                user.streak.current = 1;
                            }
                            user.streak.lastLogin = now;
                            awardXP = true;
                        }
                    }

                    await user.save(); // Save streak update
                    logDebug(`[Auth Debug] Streak updated and saved. AwardXP: ${awardXP}`);

                    if (awardXP) {
                        const xpAmount = isStreakExtended ? 10 : 5;
                        gamificationStats = await addXP(user._id, xpAmount, 'DAILY_LOGIN');
                        if (isStreakExtended) {
                            try {
                                await checkBadges(user._id, 'LOGIN');
                            } catch (e) {
                                console.error('Badge check failed', e);
                            }
                        }
                    }
                }
            } catch (gErr) {
                logDebug(`Gamification Error (Non-blocking): ${gErr.message}`);
            }

            // Audit Log
            logDebug(`[Auth Debug] Logging audit...`);
            await logAudit(user._id, 'LOGIN', 'User logged in successfully', ip);

            logDebug(`[Auth Debug] Sending response...`);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                xp: gamificationStats ? gamificationStats.newXP : user.xp,
                level: gamificationStats ? gamificationStats.newLevel : user.level,
                badges: user.badges,
                streak: user.streak,
                department: user.department,
                semester: user.semester,
                year: user.year,
                studentId: user.studentId,
                gpa: user.gpa,
                cgpa: user.cgpa,
                courses: user.courses || []
            });
        } else {
            logDebug(`[Auth Debug] login failed: Invalid email or password`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        logDebug(`[Auth Debug] CRITICAL ERROR in authUser: ${error.message}\nStack: ${error.stack}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, studentId, department, year, semester, courses } = req.body;
    const ip = req.ip;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Institutional Email Check (Students Only)
        const targetRole = role || 'student';
        if (targetRole === 'student' && !email.toLowerCase().endsWith('@bitsathy.ac.in')) {
            return res.status(400).json({ message: 'Registration Restricted: Use valid @bitsathy.ac.in email' });
        }

        const user = await User.create({
            name, email, password, role: targetRole, studentId, department, year, semester: semester || '1', courses: courses || []
        });

        if (user) {
            await logAudit(user._id, 'REGISTER', 'New user registered', ip);

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                semester: user.semester,
                year: user.year,
                studentId: user.studentId,
                gpa: user.gpa,
                cgpa: user.cgpa,
                courses: user.courses || [],
                token: generateToken(user._id),
                xp: user.xp || 0,
                level: user.level || 1,
                badges: user.badges || [],
                streak: user.streak || { current: 0, lastLogin: null }
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all users (with optional role filter)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        console.log(`[API Debug] getUsers called with role: '${role}' type: ${typeof role}`);
        const query = role ? { role } : {}; // If role is provides, filter by it, else fetch all (or default to student if preferred, but flexible is better)

        // If no role specified, maybe just return all non-admins or keep existing behavior (students only)
        // Let's make it flexible: if ?role=x, get x. If no role, get 'student' to preserve existing behavior for now, or all.
        // Existing behavior was: const users = await User.find({ role: 'student' })
        // Let's default to student if no role is passed to avoid breaking existing calls, OR check if client sends role.

        let filter = {};
        if (role) {
            filter.role = role.trim();
        } else {
            // Default behavior: show students if no role specified, or handled by client logic
            // If the client relies on getting students by default, keep it.
            // But let's check: AdminDashboard calls /api/auth/users for students list without params.
            filter.role = 'student';
        }

        console.log(`[API Debug] getUsers Final Filter:`, filter);

        const users = await User.find(filter).select('-password');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id || req.user?._id;
        let user = await User.findById(userId);
        let isAdminCollection = false;

        if (!user) {
            user = await Admin.findById(userId);
            isAdminCollection = true;
        }

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (!isAdminCollection) {
                if (req.body.department) user.department = req.body.department;
                if (req.body.year) user.year = req.body.year;
                if (req.body.semester) user.semester = req.body.semester;
                if (req.body.studentId) user.studentId = req.body.studentId;
                if (req.body.gpa !== undefined) user.gpa = req.body.gpa;
                if (req.body.cgpa !== undefined) user.cgpa = req.body.cgpa;
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                xp: updatedUser.xp,
                level: updatedUser.level,
                streak: updatedUser.streak,
                badges: updatedUser.badges,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/auth/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.password = password; // Will be hashed by pre-save hook
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Admin create a new user (Student or Faculty)
// @route   POST /api/auth/users
// @access  Private/Admin
const adminCreateUser = async (req, res) => {
    const { name, email, password, role, studentId, department, year, semester, gpa, cgpa } = req.body;
    const ip = req.ip;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Institutional Email Check
        if (!email.toLowerCase().endsWith('@bitsathy.ac.in')) {
            return res.status(400).json({ message: 'Registration Restricted: Use valid @bitsathy.ac.in email' });
        }

        // Validate Role
        const validRoles = ['student', 'faculty', 'admin'];
        const assignedRole = (role && validRoles.includes(role)) ? role : 'student';

        // Student ID Logic: Only check/require if role is student
        if (assignedRole === 'student') {
            if (!studentId) {
                return res.status(400).json({ message: 'Student ID is required for students' });
            }
            const idExists = await User.findOne({ studentId });
            if (idExists) {
                return res.status(400).json({ message: 'User already exists with this Student ID' });
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            role: assignedRole,
            studentId: assignedRole === 'student' ? studentId : undefined,
            department,
            year: assignedRole === 'student' ? (year || 'III') : undefined,
            semester: assignedRole === 'student' ? (semester || '1') : undefined,
            gpa: assignedRole === 'student' ? (gpa || 0) : undefined,
            cgpa: assignedRole === 'student' ? (cgpa || 0) : undefined,
            courses: []
        });

        if (user) {
            await logAudit(req.user?._id || 'ADMIN', 'ADMIN_CREATE_USER', `Admin created ${assignedRole}: ${user.email}`, ip);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
                department: user.department,
                year: user.year,
                semester: user.semester,
                gpa: user.gpa,
                cgpa: user.cgpa
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Admin Create User Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get leaderboard
// @route   GET /api/auth/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
    try {
        // Debugging: Check if students exist
        let studentCount = await User.countDocuments({ role: 'student' });
        console.log(`[Leaderboard Debug] Total students found: ${studentCount}`);

        if (studentCount === 0) {
            console.log('[Leaderboard Debug] No students found. Attempting to fix missing roles...');
            // Auto-fix: Set role to 'student' for users without a role or with null role, excluding known admins if any
            // We assume users without role are students for now to populate leaderboard
            const result = await User.updateMany(
                { $or: [{ role: { $exists: false } }, { role: null }, { role: '' }] },
                { $set: { role: 'student' } }
            );
            console.log(`[Leaderboard Debug] Updated ${result.modifiedCount} users to student role.`);

            // Re-count
            studentCount = await User.countDocuments({ role: 'student' });
        }

        const topStudents = await User.find({ role: 'student' })
            .select('name xp level badges department createdAt')
            .sort({ xp: -1, level: -1, createdAt: 1 })
            .limit(20);

        console.log(`[Leaderboard Debug] Top students retrieved: ${topStudents.length}`);
        if (topStudents.length > 0) {
            console.log(`[Leaderboard Debug] First student: ${topStudents[0].name}, XP: ${topStudents[0].xp}`);
        }

        const currentUser = await User.findById(req.user._id);

        // Calculate Rank Deterministically:
        // 1. Strictly better XP
        // 2. Same XP but better Level
        // 3. Same XP, Same Level, but registered earlier (seniority)
        const betterPlayersCount = await User.countDocuments({
            role: 'student',
            $or: [
                { xp: { $gt: currentUser.xp } },
                { xp: currentUser.xp, level: { $gt: currentUser.level } },
                { xp: currentUser.xp, level: currentUser.level, createdAt: { $lt: currentUser.createdAt } }
            ]
        });

        const rank = betterPlayersCount + 1;

        // Calculate gap to next rank
        let nextRival = null;
        if (rank > 1) {
            const rival = await User.findOne({
                role: 'student',
                $or: [
                    { xp: { $gt: currentUser.xp } },
                    { xp: currentUser.xp, level: { $gt: currentUser.level } },
                    { xp: currentUser.xp, level: currentUser.level, createdAt: { $lt: currentUser.createdAt } }
                ]
            })
                .sort({ xp: 1, level: 1, createdAt: -1 }) // Find the lowest of the better players
                .select('name xp');

            if (rival) {
                nextRival = {
                    name: rival.name,
                    xpGap: Math.max(0, rival.xp - currentUser.xp), // 0 if only level/time difference
                    pointsToOvertake: (rival.xp - currentUser.xp) + 10 // Approximation or just use gap
                };
            }
        }

        const totalStudents = await User.countDocuments({ role: 'student' });

        res.json({
            topStudents,
            userRank: {
                rank,
                total: totalStudents,
                xp: currentUser.xp,
                level: currentUser.level,
                nextRival
            }
        });
    } catch (error) {
        console.error('Leaderboard Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get courses assigned to a specific user (Faculty)
// @route   GET /api/auth/users/:id/courses
// @access  Private/Admin
const getUserAssignedCourses = async (req, res) => {
    try {
        const Course = require('../models/Course');
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const courses = await Course.find({
            instructors: { $in: [user.email] }
        });
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all faculty members
// @route   GET /api/auth/faculty
// @access  Private
// Bulk create users (Faculty/Student)
const bulkCreateUsers = async (req, res) => {
    try {
        const users = req.body; // Expecting an array of user objects
        if (!Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ message: 'Invalid data format. Expected an array of users.' });
        }

        const errors = [];
        const validUsers = [];
        const emails = new Set();

        // 1. Client-side duplicate check (within the batch)
        for (const [index, user] of users.entries()) {
            if (!user.name || !user.email || !user.password || !user.department) {
                errors.push(`Row ${index + 1}: Missing required fields (Name, Email, Password, Department)`);
                continue;
            }
            if (emails.has(user.email)) {
                errors.push(`Row ${index + 1}: Duplicate email in batch (${user.email})`);
                continue;
            }
            emails.add(user.email);

            // Hash password before adding
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            validUsers.push({ ...user, password: hashedPassword, role: user.role || 'student' }); // Default to student if not specified, but usually passed
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        // 2. Database duplicate check
        const existingUsers = await User.find({ email: { $in: Array.from(emails) } });
        if (existingUsers.length > 0) {
            const existingEmails = existingUsers.map(u => u.email).join(', ');
            return res.status(400).json({ message: `The following emails already exist: ${existingEmails}` });
        }

        // 3. Insert
        await User.insertMany(validUsers);

        res.status(201).json({ message: `Successfully imported ${validUsers.length} users` });

    } catch (error) {
        console.error('Bulk create error:', error);
        res.status(500).json({ message: 'Server Error during bulk import' });
    }
};

const getAllFaculty = async (req, res) => {
    try {
        const faculty = await User.find({ role: 'faculty' }).select('name email department');
        res.json(faculty);
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Toggle user login status
// @route   PATCH /api/admin/users/:id/toggle-login
// @access  Private/Admin
const toggleUserLoginStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isLoginAllowed = user.isLoginAllowed === false ? true : false;
            await user.save();

            // Emit socket event for real-time logout
            const io = req.app.get('io');
            if (io && user.isLoginAllowed === false) {
                console.log(`[Socket] Emitting restriction event for candidate: ${user._id}`);
                // Emit to a room named after the userId
                io.to(user._id.toString()).emit('user_restricted', {
                    message: 'Your account has been restricted. Please contact the administrator.'
                });
            }

            res.json({ message: `Login status for ${user.name} toggled to ${user.isLoginAllowed}`, isLoginAllowed: user.isLoginAllowed });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    authUser,
    registerUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    resetPassword,
    adminCreateUser,
    getLeaderboard,
    getUserAssignedCourses,
    getAllFaculty,
    bulkCreateUsers,
    toggleUserLoginStatus
};
