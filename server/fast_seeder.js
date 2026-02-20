require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

// Simplified fast seeder - 12 courses per department
const commonSem1 = [
    { sem: '1', name: 'Communicative English', code: 'HS101' },
    { sem: '1', name: 'Engineering Mathematics I', code: 'MA101' }
];

const commonSem2 = [
    { sem: '2', name: 'Technical English', code: 'HS102' },
    { sem: '2', name: 'Engineering Mathematics II', code: 'MA102' }
];

const deptCourses = [
    { sem: '3', name: 'Core Subject 1', code: '301' },
    { sem: '4', name: 'Core Subject 2', code: '401' },
    { sem: '5', name: 'Core Subject 3', code: '501' },
    { sem: '6', name: 'Core Subject 4', code: '601' },
    { sem: '7', name: 'Core Subject 5', code: '701' },
    { sem: '3', name: 'Elective 1', code: '302' },
    { sem: '5', name: 'Elective 2', code: '502' },
    { sem: '8', name: 'Capstone Project', code: '800' }
];

const departments = [
    { name: 'Computer Science and Engineering', code: 'CSE' },
    { name: 'Information Technology', code: 'IT' },
    { name: 'Artificial Intelligence and Data Science', code: 'AIDS' },
    { name: 'Artificial Intelligence and Machine Learning', code: 'AIML' },
    { name: 'Information Science and Engineering', code: 'ISE' },
    { name: 'Computer Technology', code: 'CT' },
    { name: 'Electronics and Communication Engineering', code: 'ECE' },
    { name: 'Electrical and Electronics Engineering', code: 'EEE' },
    { name: 'Mechanical Engineering', code: 'MECH' },
    { name: 'Civil Engineering', code: 'CIVIL' },
    { name: 'Chemical Engineering', code: 'CHEM' },
    { name: 'Biotechnology', code: 'BIO' },
    { name: 'Aerospace Engineering', code: 'AE' },
    { name: 'Automobile Engineering', code: 'AUTO' },
    { name: 'Robotics and Automation', code: 'ROBO' },
    { name: 'Computer Science and Business Systems', code: 'CSBS' },
    { name: 'Agricultural Engineering', code: 'AGRI' },
    { name: 'Biomedical Engineering', code: 'BME' },
    { name: 'Fashion Technology', code: 'FT' },
    { name: 'Food Technology', code: 'FOOD' },
    { name: 'Textile Technology', code: 'TXT' },
    { name: 'Electronics and Instrumentation Engineering', code: 'EIE' },
    { name: 'Mechatronics Engineering', code: 'MCT' },
    { name: 'Computer Science and Design', code: 'CSD' }
];

const seed = async () => {
    try {
        console.log('Connecting...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        console.log('Clearing...');
        await Course.deleteMany({});

        const courses = [];

        // Engineering departments - 12 courses each
        for (const { name: dept, code: deptCode } of departments) {

            // Sem 1 & 2 (4 courses)
            commonSem1.forEach(c => courses.push({
                code: `${deptCode}${c.code}`,
                name: c.name,
                department: dept,
                semester: c.sem,
                description: `Core course for ${dept}`,
                instructors: ['Dr. Faculty'],
                uploadStatus: Math.random() < 0.4 ? 'completed' : 'pending'
            }));

            commonSem2.forEach(c => courses.push({
                code: `${deptCode}${c.code}`,
                name: c.name,
                department: dept,
                semester: c.sem,
                description: `Core course for ${dept}`,
                instructors: ['Dr. Faculty'],
                uploadStatus: Math.random() < 0.4 ? 'completed' : 'pending'
            }));

            // Sem 3-8 (8 courses)
            deptCourses.forEach(c => courses.push({
                code: `${deptCode}${c.code}`,
                name: `${dept.split(' ')[0]} ${c.name}`,
                department: dept,
                semester: c.sem,
                description: `Core course for ${dept}`,
                instructors: ['Dr. Faculty'],
                uploadStatus: Math.random() < 0.4 ? 'completed' : 'pending'
            }));
        }

        // MBA - 10 courses
        const mbaCourses = [
            { sem: '1', name: 'Management Concepts', code: 'BA101' },
            { sem: '1', name: 'Accounting', code: 'BA102' },
            { sem: '2', name: 'Org Behavior', code: 'BA201' },
            { sem: '2', name: 'HR Management', code: 'BA202' },
            { sem: '3', name: 'Marketing Mgmt', code: 'BA301' },
            { sem: '3', name: 'Operations Mgmt', code: 'BA302' },
            { sem: '3', name: 'Business Law', code: 'BA303' },
            { sem: '4', name: 'Financial Mgmt', code: 'BA401' },
            { sem: '4', name: 'Strategic Mgmt', code: 'BA402' },
            { sem: '4', name: 'Entrepreneurship', code: 'BA403' }
        ];

        mbaCourses.forEach(c => courses.push({
            code: c.code,
            name: c.name,
            department: 'Master of Business Administration',
            semester: c.sem,
            description: 'MBA course',
            instructors: ['Dr. Faculty'],
            uploadStatus: Math.random() < 0.4 ? 'completed' : 'pending'
        }));

        console.log(`Creating ${courses.length} courses...`);
        await Course.insertMany(courses);

        console.log(`\n✅ Seeding Complete! Total: ${courses.length} courses`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

seed();
