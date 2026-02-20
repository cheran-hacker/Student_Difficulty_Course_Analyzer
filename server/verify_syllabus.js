const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api';
let token = '';
let courseId = '';

const login = async () => {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com', // Assuming admin credentials
            password: 'admin' // Assuming default password, might need adjustment based on seed
        });
        token = res.data.token;
        console.log('Login successful');
    } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error.message);
        // Try alternate admin credentials if simple admin fails
        try {
            const res2 = await axios.post(`${API_URL}/auth/login`, {
                email: 'cheran@123',
                password: 'cheran'
            });
            token = res2.data.token;
            console.log('Login successful with cheran credentials');
        } catch (err2) {
            console.error('Second login attempt failed:', err2.response ? err2.response.data : err2.message);
            process.exit(1);
        }
    }
};

const createTestCourse = async () => {
    try {
        const res = await axios.post(`${API_URL}/courses`, {
            code: 'TEST999',
            name: 'Syllabus Test Course',
            department: 'Computer Science',
            semester: 'Semester 1',
            instructors: [],
            description: 'Test course for syllabus'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        courseId = res.data._id;
        console.log('Test course created:', courseId);
    } catch (error) {
        // If course exists, try to fetch it
        if (error.response && error.response.status === 400) {
            console.log('Course exists, fetching...');
            const courses = await axios.get(`${API_URL}/courses?limit=1000`);
            const course = courses.data.courses.find(c => c.code === 'TEST999');
            if (course) {
                courseId = course._id;
                console.log('Found existing course:', courseId);
                return;
            }
        }
        console.error('Create course failed:', error.response ? error.response.data : error.message);
    }
};

const uploadSyllabus = async () => {
    try {
        const formData = new FormData();
        // Create a dummy pdf file
        const filePath = path.join(__dirname, 'test_syllabus.pdf');
        fs.writeFileSync(filePath, 'Dummy PDF Content');
        formData.append('syllabus', fs.createReadStream(filePath));

        const res = await axios.post(`${API_URL}/courses/${courseId}/syllabus`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Syllabus upload successful');
        console.log('AI Analysis:', res.data.analysis);

        // Cleanup dummy file
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Upload failed:', error.response ? error.response.data : error.message);
    }
};

const deleteSyllabus = async () => {
    try {
        const res = await axios.delete(`${API_URL}/courses/${courseId}/syllabus`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Delete successful:', res.data.message);
    } catch (error) {
        console.error('Delete failed:', error.response ? error.response.data : error.message);
    }
};

const verify = async () => {
    await login();
    await createTestCourse();
    if (courseId) {
        await uploadSyllabus();
        await deleteSyllabus();
    }
};

verify();
