const fs = require('fs');
const path = require('path');

const API_PATHS = [
    'http://localhost:5001/api',
    'http://127.0.0.1:5001/api',
    'http://localhost:5000/api',
    'http://127.0.0.1:5000/api'
];

let API_URL = '';
let token = '';
let courseId = '';

const checkConnection = async () => {
    for (const url of API_PATHS) {
        try {
            console.log(`Trying ${url}...`);
            const res = await fetch(`${url}/courses/departments`);
            if (res.ok) {
                API_URL = url;
                console.log(`Connected to ${API_URL}`);
                return true;
            }
        } catch (e) {
            console.log(`Failed to connect to ${url}: ${e.message}`);
        }
    }
    return false;
};

const login = async () => {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'admin' })
        });

        if (res.ok) {
            const data = await res.json();
            token = data.token;
            console.log('Login successful');
            return;
        }

        // Try alternate
        const res2 = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'cheran@123', password: 'cheran' })
        });

        if (res2.ok) {
            const data = await res2.json();
            token = data.token;
            console.log('Login successful with cheran credentials');
        } else {
            console.error('Login failed');
            process.exit(1);
        }
    } catch (error) {
        console.error('Login error:', error.message);
        process.exit(1);
    }
};

const createTestCourse = async () => {
    // Check if course exists first
    try {
        const res = await fetch(`${API_URL}/courses?limit=1000`);
        const data = await res.json();
        const existing = (data.courses || []).find(c => c.code === 'TEST999');
        if (existing) {
            courseId = existing._id;
            console.log('Found existing course:', courseId);
            return;
        }
    } catch (e) { }

    try {
        const res = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                code: 'TEST999',
                name: 'Syllabus Test Course',
                department: 'Computer Science',
                semester: 'Semester 1',
                instructors: [],
                description: 'Test course for syllabus'
            })
        });

        if (res.ok) {
            const data = await res.json();
            courseId = data._id;
            console.log('Test course created:', courseId);
        } else {
            const err = await res.text();
            console.error('Create course failed:', err);
        }
    } catch (error) {
        console.error('Create course error:', error.message);
    }
};

const uploadSyllabus = async () => {
    try {
        const filePath = path.join(__dirname, 'test_syllabus.pdf');
        fs.writeFileSync(filePath, 'Dummy PDF Content');

        const fileContent = fs.readFileSync(filePath);
        const formData = new FormData();
        const blob = new Blob([fileContent], { type: 'application/pdf' });
        formData.append('syllabus', blob, 'test_syllabus.pdf');

        const res = await fetch(`${API_URL}/courses/${courseId}/syllabus`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            console.log('Syllabus upload successful');
            console.log('AI Analysis:', data.analysis);
        } else {
            const err = await res.text();
            console.error('Upload failed:', err);
        }

        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Upload error:', error.message);
        // cleanup if needed
        try { fs.unlinkSync(path.join(__dirname, 'test_syllabus.pdf')); } catch (e) { }
    }
};

const deleteSyllabus = async () => {
    try {
        const res = await fetch(`${API_URL}/courses/${courseId}/syllabus`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            console.log('Delete successful:', data.message);
        } else {
            const err = await res.text();
            console.error('Delete failed:', err);
        }
    } catch (error) {
        console.error('Delete error:', error.message);
    }
};

const verify = async () => {
    if (await checkConnection()) {
        await login();
        await createTestCourse();
        if (courseId) {
            await uploadSyllabus();
            await deleteSyllabus();
        }
    } else {
        console.error('Could not connect to API server.');
    }
};

verify();
