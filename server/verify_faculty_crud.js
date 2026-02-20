const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api';
const FACULTY_EMAIL = 'faculty@bitsathy.ac.in';
const FACULTY_PASSWORD = 'password123';

const runVerification = async () => {
    try {
        console.log('--- 1. Logging in as Faculty ---');
        const loginRes = await axios.post(`${API_URL}/users/login`, {
            email: FACULTY_EMAIL,
            password: FACULTY_PASSWORD
        });
        const { token, _id: facultyId } = loginRes.data;
        console.log('Login successful. Token received.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        console.log('\n--- 2. Fetching Faculty Courses ---');
        // Fetch ALL courses to find one deployed or create one?
        // Let's first get general courses.
        const coursesRes = await axios.get(`${API_URL}/courses`, config);
        let course = coursesRes.data.courses[0];

        if (!course) {
            console.log('No courses found. Cannot proceed properly without a course.');
            // Attempt to create one if admin? No, we are faculty.
            // We'll rely on seed data having courses.
            return;
        }
        console.log(`Using Course: ${course.name} (${course._id})`);

        console.log('\n--- 3. Testing Course Update (PUT) ---');
        const updateData = {
            description: `Updated description at ${new Date().toISOString()}`
        };
        const updateRes = await axios.put(`${API_URL}/courses/${course._id}`, updateData, config);
        console.log('Update Status:', updateRes.status);
        console.log('Updated Description:', updateRes.data.description);

        if (updateRes.data.description !== updateData.description) {
            throw new Error('Update failed: Description mismatch');
        }

        console.log('\n--- 4. Testing Get Enrolled Students ---');
        const studentsRes = await axios.get(`${API_URL}/courses/${course._id}/students`, config);
        console.log('Students Status:', studentsRes.status);
        console.log('Enrolled Students Count:', studentsRes.data.length);
        if (studentsRes.data.length > 0) {
            console.log('Sample Student:', studentsRes.data[0].name);
        }

        console.log('\n--- 5. Testing Syllabus Upload ---');
        // Create dummy PDF
        const pdfPath = path.join(__dirname, 'dummy_syllabus.pdf');
        fs.writeFileSync(pdfPath, 'Dummy PDF Content');

        const formData = new FormData();
        formData.append('syllabus', fs.createReadStream(pdfPath));

        try {
            const uploadRes = await axios.post(`${API_URL}/courses/${course._id}/syllabus`, formData, {
                headers: {
                    ...config.headers,
                    ...formData.getHeaders()
                }
            });
            console.log('Upload Status:', uploadRes.status);
            console.log('Syllabus Message:', uploadRes.data.message);
        } catch (err) {
            console.error('Upload Failed:', err.response?.data || err.message);
        }

        console.log('\n--- 6. Testing Syllabus Deletion ---');
        try {
            const deleteRes = await axios.delete(`${API_URL}/courses/${course._id}/syllabus`, config);
            console.log('Delete Status:', deleteRes.status);
            console.log('Delete Message:', deleteRes.data.message);
        } catch (err) {
            console.error('Delete Failed:', err.response?.data || err.message);
        }

        // Cleanup
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
        console.log('\n--- verification Completed Successfully ---');

    } catch (error) {
        console.error('Verification Failed:', error.response?.data || error.message);
    }
};

runVerification();
