const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const verifyViaApi = async () => {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'cheran@123',
            password: 'cheran'
        });
        const { token } = loginRes.data;
        console.log('Login successful.');

        // 2. Fetch Courses
        console.log('Fetching courses...');
        const coursesRes = await axios.get(`${API_URL}/courses`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const courses = coursesRes.data;
        console.log(`Fetched ${courses.length} courses.`);

        // 3. Check Instructors
        const coursesWithInstructors = courses.filter(c => c.instructors && c.instructors.length > 0);
        console.log(`Courses with instructors: ${coursesWithInstructors.length}`);

        if (coursesWithInstructors.length > 0) {
            console.log('Sample Instructor:', coursesWithInstructors[0].instructors);
        } else {
            console.log('No courses have instructors assigned.');
        }

    } catch (error) {
        console.error('Verification failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
};

verifyViaApi();
