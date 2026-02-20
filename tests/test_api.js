const axios = require('axios');

const testAPI = async () => {
    try {
        console.log('Testing /api/courses/departments...');
        const deptRes = await axios.get('http://localhost:5000/api/courses/departments');
        console.log(`✅ Departments Response (${deptRes.data.length} departments):`);
        console.log(deptRes.data);

        console.log('\nTesting /api/courses...');
        const coursesRes = await axios.get('http://localhost:5000/api/courses');
        console.log(`✅ Courses Response:`);
        console.log(`Total: ${coursesRes.data.total || '?'}`);
        console.log(`Returned: ${coursesRes.data.courses?.length || 0} courses`);

    } catch (error) {
        console.error('❌ API Error:', error.response?.data || error.message);
    }
};

testAPI();
