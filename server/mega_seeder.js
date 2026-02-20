require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

// Common Foundation (Sem 1 & 2) - 2 Courses Each
const commonSem1 = [
    { sem: '1', name: 'Communicative English', code: 'HS101' },
    { sem: '1', name: 'Engineering Mathematics I', code: 'MA101' }
];

const commonSem2 = [
    { sem: '2', name: 'Technical English', code: 'HS102' },
    { sem: '2', name: 'Engineering Mathematics II', code: 'MA102' }
];

// Common Project (Sem 8)
const sem8Project = { sem: '8', name: 'Capstone Project', code: 'PROJ800' };

// Department Specific Cores (Sem 3-7)
// Goal: Ensure at least 1 course for Sems 3, 4, 5, 6, 7.
// Target: 12 courses per dept = 2(S1) + 2(S2) + 7(S3-7) + 1(S8) = 12 courses
// 25 departments × 12 = 300 total courses

const departments = [
    {
        name: 'Computer Science and Engineering', code: 'CSE', courses: [
            { sem: '3', name: 'Data Structures', code: 'CS301' },
            { sem: '4', name: 'Algorithms', code: 'CS401' },
            { sem: '5', name: 'Operating Systems', code: 'CS501' },
            { sem: '6', name: 'Computer Networks', code: 'CS601' },
            { sem: '7', name: 'Compiler Design', code: 'CS701' },
            { sem: '3', name: 'Database Systems', code: 'CS302' },
            { sem: '6', name: 'Software Engineering', code: 'CS602' }
        ]
    },
    {
        name: 'Information Technology', code: 'IT', courses: [
            { sem: '3', name: 'Java Programming', code: 'IT301' },
            { sem: '4', name: 'DBMS', code: 'IT401' },
            { sem: '5', name: 'Web Tech', code: 'IT501' },
            { sem: '6', name: 'Mobile Computing', code: 'IT601' },
            { sem: '7', name: 'Cloud Computing', code: 'IT701' },
            { sem: '4', name: 'Python Programming', code: 'IT402' },
            { sem: '5', name: 'Software Testing', code: 'IT502' }
        ]
    },
    {
        name: 'Artificial Intelligence and Data Science', code: 'AIDS', courses: [
            { sem: '3', name: 'Python for Data Science', code: 'AD301' },
            { sem: '4', name: 'Statistics for AI', code: 'AD401' },
            { sem: '5', name: 'Machine Learning', code: 'AD501' },
            { sem: '6', name: 'Deep Learning', code: 'AD601' },
            { sem: '7', name: 'Natural Language Processing', code: 'AD701' },
            { sem: '5', name: 'Big Data Analytics', code: 'AD502' },
            { sem: '6', name: 'Data Visualization', code: 'AD602' }
        ]
    },
    {
        name: 'Artificial Intelligence and Machine Learning', code: 'AIML', courses: [
            { sem: '3', name: 'AI Principles', code: 'AM301' },
            { sem: '4', name: 'Data Mining', code: 'AM401' },
            { sem: '5', name: 'Neural Networks', code: 'AM501' },
            { sem: '6', name: 'Computer Vision', code: 'AM601' },
            { sem: '7', name: 'Reinforcement Learning', code: 'AM701' },
            { sem: '4', name: 'Pattern Recognition', code: 'AM402' },
            { sem: '5', name: 'Expert Systems', code: 'AM502' }
        ]
    },
    {
        name: 'Information Science and Engineering', code: 'ISE', courses: [
            { sem: '3', name: 'Digital Logic', code: 'IS301' },
            { sem: '4', name: 'Microprocessors', code: 'IS401' },
            { sem: '5', name: 'Software Engg', code: 'IS501' },
            { sem: '6', name: 'Data Analytics', code: 'IS601' },
            { sem: '7', name: 'Information Security', code: 'IS701' },
            { sem: '4', name: 'System Analysis', code: 'IS402' },
            { sem: '5', name: 'Cloud Tech', code: 'IS502' }
        ]
    },
    {
        name: 'Computer Technology', code: 'CT', courses: [
            { sem: '3', name: 'C++ Programming', code: 'CT301' },
            { sem: '4', name: 'Multimedia Systems', code: 'CT401' },
            { sem: '5', name: 'Computer Graphics', code: 'CT501' },
            { sem: '6', name: 'Network Security', code: 'CT601' },
            { sem: '7', name: 'IoT Architecture', code: 'CT701' },
            { sem: '3', name: 'Data Structures', code: 'CT302' },
            { sem: '6', name: 'Embedded Systems', code: 'CT602' }
        ]
    },
    {
        name: 'Electronics and Communication Engineering', code: 'ECE', courses: [
            { sem: '3', name: 'Signals and Systems', code: 'EC301' },
            { sem: '4', name: 'Analog Circuits', code: 'EC401' },
            { sem: '5', name: 'Digital Communication', code: 'EC501' },
            { sem: '6', name: 'VLSI', code: 'EC601' },
            { sem: '7', name: 'Wireless Communication', code: 'EC701' },
            { sem: '3', name: 'Network Analysis', code: 'EC302' },
            { sem: '5', name: 'Microwave Engg', code: 'EC502' }
        ]
    },
    {
        name: 'Electrical and Electronics Engineering', code: 'EEE', courses: [
            { sem: '3', name: 'Circuit Theory', code: 'EE301' },
            { sem: '4', name: 'Electrical Machines', code: 'EE401' },
            { sem: '5', name: 'Control Systems', code: 'EE501' },
            { sem: '6', name: 'Power Systems', code: 'EE601' },
            { sem: '7', name: 'Renewable Energy', code: 'EE701' },
            { sem: '4', name: 'Power Electronics', code: 'EE402' },
            { sem: '6', name: 'Smart Grid', code: 'EE602' }
        ]
    },
    {
        name: 'Mechanical Engineering', code: 'MECH', courses: [
            { sem: '3', name: 'Engg Mechanics', code: 'ME301' },
            { sem: '4', name: 'Thermodynamics', code: 'ME401' },
            { sem: '5', name: 'Fluid Mechanics', code: 'ME501' },
            { sem: '6', name: 'Machine Design', code: 'ME601' },
            { sem: '7', name: 'Automobile Engg', code: 'ME701' },
            { sem: '3', name: 'Manufacturing', code: 'ME302' },
            { sem: '5', name: 'Heat Transfer', code: 'ME502' }
        ]
    },
    {
        name: 'Civil Engineering', code: 'CIVIL', courses: [
            { sem: '3', name: 'Surveying', code: 'CE301' },
            { sem: '4', name: 'Soil Mechanics', code: 'CE401' },
            { sem: '5', name: 'Structural Analysis', code: 'CE501' },
            { sem: '6', name: 'Highway Engg', code: 'CE601' },
            { sem: '7', name: 'Construction Mgmt', code: 'CE701' },
            { sem: '4', name: 'Concrete Tech', code: 'CE402' },
            { sem: '5', name: 'Water Resources', code: 'CE502' }
        ]
    },
    {
        name: 'Chemical Engineering', code: 'CHEM', courses: [
            { sem: '3', name: 'Organic Chemistry', code: 'CH301' },
            { sem: '4', name: 'Chemical Process Calc', code: 'CH401' },
            { sem: '5', name: 'Heat Transfer', code: 'CH501' },
            { sem: '6', name: 'Mass Transfer', code: 'CH601' },
            { sem: '7', name: 'Process Control', code: 'CH701' },
            { sem: '3', name: 'Inorganic Chemistry', code: 'CH302' },
            { sem: '6', name: 'Reactor Design', code: 'CH602' }
        ]
    },
    {
        name: 'Biotechnology', code: 'BIO', courses: [
            { sem: '3', name: 'Cell Biology', code: 'BT301' },
            { sem: '4', name: 'Microbiology', code: 'BT401' },
            { sem: '5', name: 'Biochemistry', code: 'BT501' },
            { sem: '6', name: 'Genetic Engineering', code: 'BT601' },
            { sem: '7', name: 'Bioinformatics', code: 'BT701' },
            { sem: '4', name: 'Molecular Biology', code: 'BT402' },
            { sem: '5', name: 'Immunology', code: 'BT502' }
        ]
    },
    {
        name: 'Aerospace Engineering', code: 'AE', courses: [
            { sem: '3', name: 'Fluid Dynamics', code: 'AE301' },
            { sem: '4', name: 'Aerodynamics', code: 'AE401' },
            { sem: '5', name: 'Propulsion', code: 'AE501' },
            { sem: '6', name: 'Flight Mechanics', code: 'AE601' },
            { sem: '7', name: 'Avionics', code: 'AE701' },
            { sem: '3', name: 'Aircraft Structures', code: 'AE302' },
            { sem: '5', name: 'Space Mechanics', code: 'AE502' }
        ]
    },
    {
        name: 'Automobile Engineering', code: 'AUTO', courses: [
            { sem: '3', name: 'Automotive Chassis', code: 'AU301' },
            { sem: '4', name: 'Internal Combustion Engines', code: 'AU401' },
            { sem: '5', name: 'Vehicle Dynamics', code: 'AU501' },
            { sem: '6', name: 'Automotive Electricals', code: 'AU601' },
            { sem: '7', name: 'Electric Vehicles', code: 'AU701' },
            { sem: '4', name: 'Transmission Systems', code: 'AU402' },
            { sem: '6', name: 'Hybrid Vehicles', code: 'AU602' }
        ]
    },
    {
        name: 'Robotics and Automation', code: 'ROBO', courses: [
            { sem: '3', name: 'Sensors and Actuators', code: 'RO301' },
            { sem: '4', name: 'Kinematics', code: 'RO401' },
            { sem: '5', name: 'Microcontrollers', code: 'RO501' },
            { sem: '6', name: 'Industrial Robots', code: 'RO601' },
            { sem: '7', name: 'Machine Vision', code: 'RO701' },
            { sem: '4', name: 'Control Systems', code: 'RO402' },
            { sem: '5', name: 'Robot Programming', code: 'RO502' }
        ]
    },
    {
        name: 'Computer Science and Business Systems', code: 'CSBS', courses: [
            { sem: '3', name: 'Business Comm', code: 'CB301' },
            { sem: '4', name: 'Software Design', code: 'CB401' },
            { sem: '5', name: 'Financial Mgmt', code: 'CB501' },
            { sem: '6', name: 'Services Science', code: 'CB601' },
            { sem: '7', name: 'Marketing Mgmt', code: 'CB701' },
            { sem: '3', name: 'Economics', code: 'CB302' },
            { sem: '5', name: 'E-Commerce', code: 'CB502' }
        ]
    },
    {
        name: 'Agricultural Engineering', code: 'AGRI', courses: [
            { sem: '3', name: 'Crop Production', code: 'AG301' },
            { sem: '4', name: 'Farm Power', code: 'AG401' },
            { sem: '5', name: 'Irrigation Engg', code: 'AG501' },
            { sem: '6', name: 'Food Processing', code: 'AG601' },
            { sem: '7', name: 'Dairy Engg', code: 'AG701' },
            { sem: '3', name: 'Soil Science', code: 'AG302' },
            { sem: '6', name: 'Renewable Energy', code: 'AG602' }
        ]
    },
    {
        name: 'Biomedical Engineering', code: 'BME', courses: [
            { sem: '3', name: 'Human Anatomy', code: 'BM301' },
            { sem: '4', name: 'Biomedical Sensors', code: 'BM401' },
            { sem: '5', name: 'Medical Instrumentation', code: 'BM501' },
            { sem: '6', name: 'Diagnostic Techniques', code: 'BM601' },
            { sem: '7', name: 'Rehabilitation Engg', code: 'BM701' },
            { sem: '4', name: 'Biomechanics', code: 'BM402' },
            { sem: '5', name: 'Signal Processing', code: 'BM502' }
        ]
    },
    {
        name: 'Fashion Technology', code: 'FT', courses: [
            { sem: '3', name: 'Textile Science', code: 'FT301' },
            { sem: '4', name: 'Garment Construction', code: 'FT401' },
            { sem: '5', name: 'Fashion Illustration', code: 'FT501' },
            { sem: '6', name: 'Apparel Merchandising', code: 'FT601' },
            { sem: '7', name: 'Fashion Marketing', code: 'FT701' },
            { sem: '3', name: 'Pattern Making', code: 'FT302' },
            { sem: '5', name: 'Accessory Design', code: 'FT502' }
        ]
    },
    {
        name: 'Food Technology', code: 'FOOD', courses: [
            { sem: '3', name: 'Food Chemistry', code: 'FD301' },
            { sem: '4', name: 'Food Microbiology', code: 'FD401' },
            { sem: '5', name: 'Food Preservation', code: 'FD501' },
            { sem: '6', name: 'Food Packaging', code: 'FD601' },
            { sem: '7', name: 'Quality Control', code: 'FD701' },
            { sem: '4', name: 'Food Processing', code: 'FD402' },
            { sem: '6', name: 'Nutrition Science', code: 'FD602' }
        ]
    },
    {
        name: 'Textile Technology', code: 'TXT', courses: [
            { sem: '3', name: 'Yarn Manufacture', code: 'TX301' },
            { sem: '4', name: 'Fabric Manufacture', code: 'TX401' },
            { sem: '5', name: 'Textile Testing', code: 'TX501' },
            { sem: '6', name: 'Chemical Processing', code: 'TX601' },
            { sem: '7', name: 'Technical Textiles', code: 'TX701' },
            { sem: '3', name: 'Fiber Science', code: 'TX302' },
            { sem: '5', name: 'Dyeing Tech', code: 'TX502' }
        ]
    },
    {
        name: 'Electronics and Instrumentation Engineering', code: 'EIE', courses: [
            { sem: '3', name: 'Transducers', code: 'EI301' },
            { sem: '4', name: 'Measurements', code: 'EI401' },
            { sem: '5', name: 'Control Systems', code: 'EI501' },
            { sem: '6', name: 'Industrial Inst', code: 'EI601' },
            { sem: '7', name: 'Process Control', code: 'EI701' },
            { sem: '4', name: 'Analog Electronics', code: 'EI402' },
            { sem: '6', name: 'Digital Systems', code: 'EI602' }
        ]
    },
    {
        name: 'Mechatronics Engineering', code: 'MCT', courses: [
            { sem: '3', name: 'Manufacturing Tech', code: 'MC301' },
            { sem: '4', name: 'Metrology', code: 'MC401' },
            { sem: '5', name: 'CNC Machines', code: 'MC501' },
            { sem: '6', name: 'Pneumatics', code: 'MC601' },
            { sem: '7', name: 'Indus. Robotics', code: 'MC701' },
            { sem: '3', name: 'CAD/CAM', code: 'MC302' },
            { sem: '5', name: 'Automation Systems', code: 'MC502' }
        ]
    },
    {
        name: 'Computer Science and Design', code: 'CSD', courses: [
            { sem: '3', name: 'Design Fundamentals', code: 'CD301' },
            { sem: '4', name: 'HCI', code: 'CD401' },
            { sem: '5', name: 'Web Dev', code: 'CD501' },
            { sem: '6', name: 'Game Dev', code: 'CD601' },
            { sem: '7', name: 'XR Design', code: 'CD701' },
            { sem: '3', name: 'UI/UX Design', code: 'CD302' },
            { sem: '5', name: 'Mobile App Design', code: 'CD502' }
        ]
    },
    {
        name: 'Master of Business Administration', code: 'MBA', courses: [
            { sem: '1', name: 'Management Concepts', code: 'BA101' },
            { sem: '2', name: 'Org Behavior', code: 'BA201' },
            { sem: '3', name: 'Marketing Mgmt', code: 'BA301' },
            { sem: '4', name: 'Financial Mgmt', code: 'BA401' },
            { sem: '1', name: 'Accounting', code: 'BA102' },
            { sem: '2', name: 'HR Management', code: 'BA202' },
            { sem: '3', name: 'Operations Mgmt', code: 'BA302' },
            { sem: '4', name: 'Strategic Mgmt', code: 'BA402' },
            { sem: '3', name: 'Business Law', code: 'BA303' },
            { sem: '4', name: 'Entrepreneurship', code: 'BA403' }
        ]
    }
];

const seedCourses = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // CLEANUP: Wipe clean
        console.log('Clearing existing courses...');
        await Course.deleteMany({});
        console.log('Courses cleared.');

        const allCourses = [];

        for (const dept of departments) {
            console.log(`\nPreparing ${dept.name} (${dept.code})...`);

            let fullCourseList = [...dept.courses];

            if (dept.code !== 'MBA') {
                const sem1 = commonSem1.map(c => ({ ...c, code: `${dept.code}${c.code}` }));
                const sem2 = commonSem2.map(c => ({ ...c, code: `${dept.code}${c.code}` }));
                fullCourseList = [...sem1, ...sem2, ...fullCourseList];

                if (!fullCourseList.some(c => c.sem === '8')) {
                    fullCourseList.push({ ...sem8Project, code: `${dept.code}${sem8Project.code}` });
                }
            }

            for (const course of fullCourseList) {
                allCourses.push({
                    code: course.code,
                    name: course.name,
                    department: dept.name,
                    semester: course.sem,
                    description: `Core course for ${dept.name}, Semester ${course.sem}.`,
                    instructors: ['Dr. Faculty', 'Prof. Lecturer'],
                    uploadStatus: Math.random() < 0.4 ? 'completed' : 'pending',
                });
            }
        }

        console.log(`Injecting ${allCourses.length} courses...`);
        await Course.insertMany(allCourses);
        console.log(`\n\nSeeding Complete! Created: ${allCourses.length} courses`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedCourses();
