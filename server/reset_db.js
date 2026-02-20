const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');

dotenv.config();

const courses = [
    // Computer Science (15 courses)
    { code: 'CS101', name: 'Intro to Computer Science', department: 'Computer Science', semester: 'Semester 1', instructors: ['Dr. Alan Turing'] },
    { code: 'CS102', name: 'Data Structures & Algorithms', department: 'Computer Science', semester: 'Semester 2', instructors: ['Dr. Grace Hopper'] },
    { code: 'CS201', name: 'Object Oriented Programming', department: 'Computer Science', semester: 'Semester 3', instructors: ['Prof. Bjarne Stroustrup'] },
    { code: 'CS202', name: 'Database Management Systems', department: 'Computer Science', semester: 'Semester 3', instructors: ['Dr. Edgar Codd'] },
    { code: 'CS301', name: 'Operating Systems', department: 'Computer Science', semester: 'Semester 4', instructors: ['Linus Torvalds'] },
    { code: 'CS302', name: 'Computer Networks', department: 'Computer Science', semester: 'Semester 4', instructors: ['Vint Cerf'] },
    { code: 'CS303', name: 'Artificial Intelligence', department: 'Computer Science', semester: 'Semester 5', instructors: ['Dr. John McCarthy'] },
    { code: 'CS304', name: 'Machine Learning', department: 'Computer Science', semester: 'Semester 5', instructors: ['Dr. Geoffrey Hinton'] },
    { code: 'CS401', name: 'Compiler Design', department: 'Computer Science', semester: 'Semester 6', instructors: ['Grace Hopper'] },
    { code: 'CS402', name: 'Web Technology', department: 'Computer Science', semester: 'Semester 6', instructors: ['Tim Berners-Lee'] },
    { code: 'CS403', name: 'Software Engineering', department: 'Computer Science', semester: 'Semester 6', instructors: ['Margaret Hamilton'] },
    { code: 'CS501', name: 'High Performance Computing', department: 'Computer Science', semester: 'Semester 7', instructors: ['Seymour Cray'] },
    { code: 'CS502', name: 'Distributed Systems', department: 'Computer Science', semester: 'Semester 7', instructors: ['Leslie Lamport'] },
    { code: 'CS601', name: 'Computer Graphics', department: 'Computer Science', semester: 'Semester 8', instructors: ['Ivan Sutherland'] },
    { code: 'CS602', name: 'Human Computer Interaction', department: 'Computer Science', semester: 'Semester 8', instructors: ['Douglas Engelbart'] },

    // Information Technology (10 courses)
    { code: 'IT101', name: 'Intro to IT', department: 'Information Technology', semester: 'Semester 1', instructors: ['Bill Gates'] },
    { code: 'IT201', name: 'Information Theory', department: 'Information Technology', semester: 'Semester 3', instructors: ['Claude Shannon'] },
    { code: 'IT202', name: 'Data Communication', department: 'Information Technology', semester: 'Semester 3', instructors: ['Bob Kahn'] },
    { code: 'IT301', name: 'Cloud Computing', department: 'Information Technology', semester: 'Semester 5', instructors: ['Satya Nadella'] },
    { code: 'IT302', name: 'Big Data Analytics', department: 'Information Technology', semester: 'Semester 5', instructors: ['Doug Cutting'] },
    { code: 'IT401', name: 'Cyber Security', department: 'Information Technology', semester: 'Semester 7', instructors: ['Kevin Mitnick'] },
    { code: 'IT402', name: 'Blockchain Technology', department: 'Information Technology', semester: 'Semester 7', instructors: ['Satoshi Nakamoto'] },
    { code: 'IT501', name: 'Internet of Things', department: 'Information Technology', semester: 'Semester 8', instructors: ['Kevin Ashton'] },
    { code: 'IT502', name: 'Enterprise Resource Planning', department: 'Information Technology', semester: 'Semester 8', instructors: ['Hasso Plattner'] },
    { code: 'IT601', name: 'Digital Marketing', department: 'Information Technology', semester: 'Semester 8', instructors: ['Philip Kotler'] },

    // Electronics & Communication (10 courses)
    { code: 'EC101', name: 'Basic Electronics', department: 'Electronics & Comm', semester: 'Semester 1', instructors: ['Thomas Edison'] },
    { code: 'EC201', name: 'Digital Logic Design', department: 'Electronics & Comm', semester: 'Semester 3', instructors: ['George Boole'] },
    { code: 'EC202', name: 'Signals and Systems', department: 'Electronics & Comm', semester: 'Semester 3', instructors: ['Fourier'] },
    { code: 'EC203', name: 'Analog Circuits', department: 'Electronics & Comm', semester: 'Semester 4', instructors: ['Robert Widlar'] },
    { code: 'EC301', name: 'Microprocessors', department: 'Electronics & Comm', semester: 'Semester 5', instructors: ['Federico Faggin'] },
    { code: 'EC302', name: 'VLSI Design', department: 'Electronics & Comm', semester: 'Semester 6', instructors: ['Gordon Moore'] },
    { code: 'EC303', name: 'Digital Signal Processing', department: 'Electronics & Comm', semester: 'Semester 6', instructors: ['Nyquist'] },
    { code: 'EC401', name: 'Wireless Communication', department: 'Electronics & Comm', semester: 'Semester 7', instructors: ['Marconi'] },
    { code: 'EC402', name: 'Optical Communication', department: 'Electronics & Comm', semester: 'Semester 7', instructors: ['Charles Kao'] },
    { code: 'EC501', name: 'Satellite Communication', department: 'Electronics & Comm', semester: 'Semester 8', instructors: ['Arthur C. Clarke'] },

    // Mechanical Engineering (10 courses)
    { code: 'ME101', name: 'Engineering Mechanics', department: 'Mechanical Eng', semester: 'Semester 1', instructors: ['Isaac Newton'] },
    { code: 'ME102', name: 'Material Science', department: 'Mechanical Eng', semester: 'Semester 2', instructors: ['Hooke'] },
    { code: 'ME201', name: 'Thermodynamics', department: 'Mechanical Eng', semester: 'Semester 3', instructors: ['Carnot'] },
    { code: 'ME202', name: 'Fluid Mechanics', department: 'Mechanical Eng', semester: 'Semester 3', instructors: ['Bernoulli'] },
    { code: 'ME203', name: 'Kinematics of Machinery', department: 'Mechanical Eng', semester: 'Semester 4', instructors: ['Reuleaux'] },
    { code: 'ME301', name: 'Manufacturing Processes', department: 'Mechanical Eng', semester: 'Semester 5', instructors: ['Henry Ford'] },
    { code: 'ME302', name: 'Heat Transfer', department: 'Mechanical Eng', semester: 'Semester 5', instructors: ['Fourier'] },
    { code: 'ME303', name: 'Design of Machine Elements', department: 'Mechanical Eng', semester: 'Semester 6', instructors: ['Timoshenko'] },
    { code: 'ME401', name: 'Robotics', department: 'Mechanical Eng', semester: 'Semester 7', instructors: ['Asimov'] },
    { code: 'ME402', name: 'Automobile Engineering', department: 'Mechanical Eng', semester: 'Semester 7', instructors: ['Benz'] },

    // Civil Engineering (8 courses)
    { code: 'CE101', name: 'Structural Mechanics', department: 'Civil Eng', semester: 'Semester 1', instructors: ['Eiffel'] },
    { code: 'CE102', name: 'Construction Materials', department: 'Civil Eng', semester: 'Semester 2', instructors: ['Aspdin'] },
    { code: 'CE201', name: 'Surveying', department: 'Civil Eng', semester: 'Semester 3', instructors: ['Everest'] },
    { code: 'CE202', name: 'Fluid Mechanics for Civil', department: 'Civil Eng', semester: 'Semester 3', instructors: ['Navier'] },
    { code: 'CE301', name: 'Geotechnical Engineering', department: 'Civil Eng', semester: 'Semester 5', instructors: ['Terzaghi'] },
    { code: 'CE302', name: 'Transportation Engineering', department: 'Civil Eng', semester: 'Semester 6', instructors: ['McAdam'] },
    { code: 'CE401', name: 'Environmental Engineering', department: 'Civil Eng', semester: 'Semester 7', instructors: ['Snow'] },
    { code: 'CE402', name: 'Bridge Engineering', department: 'Civil Eng', semester: 'Semester 8', instructors: ['Roebling'] },

    // Electrical Engineering (8 courses)
    { code: 'EE101', name: 'Intro to Electrical Eng', department: 'Electrical Eng', semester: 'Semester 1', instructors: ['Nikola Tesla'] },
    { code: 'EE102', name: 'Electrical Circuits', department: 'Electrical Eng', semester: 'Semester 2', instructors: ['Ohm'] },
    { code: 'EE201', name: 'Circuit Theory', department: 'Electrical Eng', semester: 'Semester 3', instructors: ['Kirchhoff'] },
    { code: 'EE202', name: 'Electrical Machines', department: 'Electrical Eng', semester: 'Semester 4', instructors: ['Faraday'] },
    { code: 'EE301', name: 'Power Systems', department: 'Electrical Eng', semester: 'Semester 5', instructors: ['Westinghouse'] },
    { code: 'EE302', name: 'Control Systems', department: 'Electrical Eng', semester: 'Semester 6', instructors: ['Nyquist'] },
    { code: 'EE401', name: 'High Voltage Engineering', department: 'Electrical Eng', semester: 'Semester 7', instructors: ['Van de Graaff'] },
    { code: 'EE402', name: 'Renewable Energy Systems', department: 'Electrical Eng', semester: 'Semester 8', instructors: ['Musk'] },

    // Chemical Engineering
    { code: 'CH101', name: 'Intro to Chemical Eng', department: 'Chemical Eng', semester: 'Semester 1', instructors: ['Haber'] },
    { code: 'CH201', name: 'Chemical Thermodynamics', department: 'Chemical Eng', semester: 'Semester 3', instructors: ['Gibbs'] },
    { code: 'CH301', name: 'Heat Transfer', department: 'Chemical Eng', semester: 'Semester 5', instructors: ['Fourier'] },
    { code: 'CH302', name: 'Mass Transfer', department: 'Chemical Eng', semester: 'Semester 5', instructors: ['Fick'] },
    { code: 'CH401', name: 'Process Control', department: 'Chemical Eng', semester: 'Semester 7', instructors: ['Laplace'] },

    // Biotechnology
    { code: 'BT101', name: 'Intro to Biotechnology', department: 'Biotechnology', semester: 'Semester 1', instructors: ['Darwin'] },
    { code: 'BT201', name: 'Microbiology', department: 'Biotechnology', semester: 'Semester 3', instructors: ['Pasteur'] },
    { code: 'BT301', name: 'Genetics', department: 'Biotechnology', semester: 'Semester 5', instructors: ['Mendel'] },
    { code: 'BT302', name: 'Bioinformatics', department: 'Biotechnology', semester: 'Semester 5', instructors: ['Dayhoff'] },
    { code: 'BT401', name: 'Genetic Engineering', department: 'Biotechnology', semester: 'Semester 7', instructors: ['Watson'] },

    // Aerospace Engineering
    { code: 'AE101', name: 'Intro to Aerospace', department: 'Aerospace Eng', semester: 'Semester 1', instructors: ['Wright Brothers'] },
    { code: 'AE201', name: 'Aerodynamics', department: 'Aerospace Eng', semester: 'Semester 3', instructors: ['Bernoulli'] },
    { code: 'AE301', name: 'Flight Mechanics', department: 'Aerospace Eng', semester: 'Semester 5', instructors: ['Zhukovsky'] },
    { code: 'AE401', name: 'Propulsion', department: 'Aerospace Eng', semester: 'Semester 7', instructors: ['Von Braun'] },
];

const resetAndSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // 1. CLEAR EXISTING DATA
        console.log('Clearing existing courses...');
        await Course.deleteMany({});
        console.log('Courses cleared.');

        // 2. INSERT NEW DATA
        console.log(`Seeding ${courses.length} courses...`);
        await Course.insertMany(courses); // insertMany is faster and simpler for fresh seed

        // 3. VERIFY
        const count = await Course.countDocuments();
        console.log(`[VERIFY] Total Courses in DB: ${count}`);

        if (count < 50) {
            throw new Error(`Seeding failed. Expected >50, got ${count}`);
        }

        console.log('SUCCESS: Database reset and populated.');
        process.exit();
    } catch (error) {
        console.error(`FATAL ERROR: ${error}`);
        process.exit(1);
    }
};

resetAndSeed();
