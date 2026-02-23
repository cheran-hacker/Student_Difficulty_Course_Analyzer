const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('[Auth] Token found, verifying...');

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('[Auth] Token decoded for ID:', decoded.id);

            req.user = await User.findById(decoded.id).select('-password');

            // If not found in User collection, check Admin collection
            if (!req.user) {
                console.log('[Auth] User not in Student collection, checking Admin...');
                const Admin = require('../models/Admin');
                req.user = await Admin.findById(decoded.id).select('-password');
                if (req.user) req.user.role = 'admin'; // Ensure role is set
            }

            if (!req.user) {
                console.warn('[Auth] JWT Valid but User NO LONGER in DB:', decoded.id);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Check if login is allowed (for students and faculty)
            if (req.user.role !== 'admin' && req.user.isLoginAllowed === false) {
                console.warn(`[Auth] User restricted, blocking access: ${req.user.name}`);
                return res.status(401).json({ message: 'Access denied. Your account is restricted.' });
            }

            console.log(`[Auth] Authenticated user: ${req.user.name} (${req.user.role})`);
            return next();
        } catch (error) {
            console.error('[Auth] Token Verification Failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.warn('[Auth] No token provided in headers');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        console.log('[Auth] Admin access granted to:', req.user.name);
        next();
    } else {
        console.warn('[Auth] Admin access DENIED to:', req.user?.name || 'Unknown');
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const faculty = (req, res, next) => {
    if (req.user && (req.user.role === 'faculty' || req.user.role === 'admin')) {
        console.log('[Auth] Faculty access granted to:', req.user.name);
        next();
    } else {
        console.warn('[Auth] Faculty access DENIED to:', req.user?.name || 'Unknown');
        res.status(401).json({ message: 'Not authorized as faculty' });
    }
};

module.exports = { protect, admin, faculty };

