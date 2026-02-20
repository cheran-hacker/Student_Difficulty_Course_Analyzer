const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
// const xss = require('xss-clean'); // Commented out as per previous state
// const mongoSanitize = require('express-mongo-sanitize'); // Commented out
// const rateLimit = require('express-rate-limit'); // Commented out
const connectDB = require('./config/db');
const socketIO = require('socket.io');

const path = require('path');
const fs = require('fs');
const app = express();

dotenv.config();

connectDB().then(() => {
    // Sync Admin Credentials after DB connection
    const syncAdmin = require('./utils/syncAdmin');
    syncAdmin();
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for dev flexibility
}));
app.use(express.json());
app.use(cors());

// Removed redundant uploadsPath here, using the one closer to the asset vault

// --- DEBUG FILE LOGGER ---
app.use((req, res, next) => {
    const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}\n`;
    try {
        fs.appendFileSync(path.join(__dirname, 'server_access.log'), log);
    } catch (e) {
        console.error('Logging failed:', e);
    }
    console.log(`[Server] ${req.method} ${req.originalUrl}`);
    next();
});

// Serve static files from the React app
const distPath = path.resolve(__dirname, '../client/dist');
console.log(`[Server] --- DEPLOYMENT DIAGNOSTICS ---`);
console.log(`[Server] Current Dir (__dirname): ${__dirname}`);
console.log(`[Server] Searching for client/dist at: ${distPath}`);

if (fs.existsSync(distPath)) {
    console.log(`[Server] ✅ FOUND client/dist. Contents:`, fs.readdirSync(distPath));
} else {
    console.error(`[Server] ❌ MISSING client/dist!`);
    try {
        const parentPath = path.resolve(__dirname, '..');
        console.log(`[Server] Parent directory (${parentPath}) contents:`, fs.readdirSync(parentPath));
        const clientPath = path.resolve(__dirname, '../client');
        if (fs.existsSync(clientPath)) {
            console.log(`[Server] Client directory (${clientPath}) contents:`, fs.readdirSync(clientPath));
        }
    } catch (err) {
        console.error(`[Server] Path listing failed:`, err.message);
    }
}

app.use(express.static(distPath));

// API Status Check
app.get('/api/status', (req, res) => {
    res.json({
        message: 'Student Analyzer API is running...',
        version: '2.1.1-diagnostic',
        timestamp: new Date().toISOString()
    });
});



// Temporary Route Debugger
app.get('/api/debug-routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach(middleware => {
        if (middleware.route) {
            routes.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
        } else if (middleware.name === 'router') {
            const base = middleware.regexp.toString().replace('/^\\', '').replace('\\/?(?=\\/|$)/i', '');
            middleware.handle.stack.forEach(handler => {
                if (handler.route) {
                    routes.push(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${base}${handler.route.path}`);
                }
            });
        }
    });
    res.json({
        total: routes.length,
        routes: routes.sort()
    });
});

app.get('/api/ping', (req, res) => res.send('pong'));

console.log('[Server] Registering routes...');

// Direct Route removed - handled by authRoutes

const { protect, admin } = require('./middleware/authMiddleware');
const { resetPassword } = require('./controllers/authController');

// Direct Auth routes handled by authRoutes.js

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/settings', require('./routes/systemRoutes'));

// Admin Routes - More specific first
console.log('[Server] Registering Admin routes...');
app.use('/api/admin/requests', require('./routes/adminRequestRoutes'));
app.use('/api/admin/faculty-requests', require('./routes/adminFacultyRequestRoutes'));
app.use('/api/admin/feedback', require('./routes/adminFeedbackRoutes'));
app.use('/api/admin/courses', require('./routes/adminCourseRoutes'));
app.use('/api/admin/students', require('./routes/adminRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));

// General Requests
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/student', require('./routes/studentRoutes')); // Student Routes
console.log('[Server] Route registration complete.');

// --- SECURE ASSET VAULT (Static Files) ---
const uploadsPath = path.join(__dirname, 'uploads');
console.log(`[Server] Mounting Asset Vault: ${uploadsPath}`);

// Diagnostic helper: Check if file exists before 404ing
app.get('/uploads/*', (req, res, next) => {
    const relativePath = req.params[0];
    const fullPath = path.join(uploadsPath, relativePath);

    if (fs.existsSync(fullPath)) {
        console.log(`[AssetVault] HIT: ${relativePath}`);
        return next();
    } else {
        console.log(`[AssetVault] MISS: ${relativePath}`);
        console.log(`[AssetVault] Full Path tried: ${fullPath}`);
        res.status(404).json({
            error: 'File not found in vault',
            path: relativePath,
            vault: uploadsPath
        });
    }
});

app.use('/uploads', express.static(uploadsPath, {
    setHeaders: (res, path) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Content-Disposition', 'inline');
    }
}));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    // Smart catch-all: If the request has an extension (e.g. .js, .css), 
    // it's a MISSING asset, not a navigation. Return 404 instead of index.html
    // to prevent MIME type mismatch errors in the browser.
    const ext = path.extname(req.originalUrl);
    const isNavigation = !ext && !req.originalUrl.startsWith('/api/');

    if (isNavigation) {
        const indexPath = path.resolve(__dirname, '../client/dist/index.html');
        if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
        } else {
            return res.status(404).send('Frontend build index.html not found. Please check build logs.');
        }
    }

    // It's a missing file/asset/API route
    res.status(404).json({
        message: `Asset or Route ${req.originalUrl} not found`,
        type: ext ? 'Missing File' : 'Broken API Link'
    });
});

// Final 404 Catch-all Logger
app.use((req, res) => {
    const errorLog = `[${new Date().toISOString()}] [Server 404] No match for: ${req.method} ${req.originalUrl}\n`;
    try {
        fs.appendFileSync(path.join(__dirname, 'server_access.log'), errorLog);
    } catch (e) {
        console.error('Logging failed:', e);
    }
    console.log(`[Server 404] No match for: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        message: `Route ${req.originalUrl} not found`,
        suggestion: "Check route registration in index.js and path in frontend"
    });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    const startupMsg = `[${new Date().toISOString()}] 🚀 SERVER RESTART: ${process.pid} - UNIQUE_ID: ${Date.now()}\n`;
    try { fs.appendFileSync(path.join(__dirname, 'server_access.log'), startupMsg); } catch (e) { }
    console.log(`\n================================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🆔 PID: ${process.pid}`);
    console.log(`🔗 Primary API: http://localhost:${PORT}/api`);
    console.log(`🛠️ Debug: http://localhost:${PORT}/api/debug-routes`);
    console.log(`================================================\n`);
});

// --- SOCAL HUB: Real-Time Communication ---
const io = socketIO(server, {
    cors: {
        origin: "*", // Allow all origins for dev simplicity
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a specific course chat room
    socket.on('join_room', (courseId) => {
        socket.join(courseId);
        console.log(`User ${socket.id} joined room: ${courseId}`);
        socket.to(courseId).emit('user_joined', { userId: socket.id, message: 'A new student has joined the chat' });
    });

    // Handle sending messages
    socket.on('send_message', (data) => {
        // data: { room, author, message, time }
        console.log(`Message in ${data.room}: ${data.message}`);
        socket.to(data.room).emit('receive_message', data);
    });

    // Handle Live Pulse (Real-time Feedback)
    socket.on('send_pulse', (data) => {
        // data: { courseId, type } e.g. 'confused', 'slow_down'
        console.log(`Pulse in ${data.courseId}: ${data.type}`);
        // Broadcast to everyone in the room INCLUDING sender (so they see their own pulse effect)
        io.in(data.courseId).emit('receive_pulse', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
