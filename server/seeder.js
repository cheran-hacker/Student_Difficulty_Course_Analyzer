const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User');
const Course = require('./models/Course');
const Feedback = require('./models/Feedback');
const connectDB = require('./config/db');

dotenv.config({ path: './server/.env' });

// Removed top-level connectDB() to allow runSeeder to handle await properly

const importData = async () => {
  try {
    console.log('Starting data purge...'.yellow);
    console.log('Deleting Users...'.yellow);
    await User.deleteMany();
    console.log('Users deleted.'.green);
    console.log('Deleting Courses...'.yellow);
    await Course.deleteMany();
    console.log('Courses deleted.'.green);
    console.log('Deleting Feedbacks...'.yellow);
    await Feedback.deleteMany();
    console.log('Feedbacks deleted.'.green);
    console.log('Data Destroyed...'.red.inverse);

    console.log('Creating users...'.yellow);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        studentId: 'ADMIN001'
      },
      {
        name: 'Student One',
        email: 'student1@example.com',
        password: 'password123',
        role: 'student',
        studentId: 'STU001',
        department: 'CSE',
        year: '2024'
      },
      {
        name: 'Student Two',
        email: 'student2@example.com',
        password: 'password123',
        role: 'student',
        studentId: 'STU002',
        department: 'ECE',
        year: '2023'
      }
    ];

    // Use create to trigger pre-save hooks (hashing password)
    const createdUsers = [];
    for (const user of users) {
      const newUser = await User.create(user);
      createdUsers.push(newUser);
    }

    console.log(`${createdUsers.length} Users Created`.green.inverse);

    const departments = [
      'CSE',
      'IT',
      'ECE',
      'AIDS',
      'AIML',
      'EEE',
      'Mechanical',
      'Civil',
      'Biotechnology',
      'AIS',
      'Food Technology',
      'Textile Technology',
      'Fashion Technology',
      'Biomedical',
      'Chemical',
      'Aerospace',
      'Mechatronics',
      'Automobile',
      'Robotics',
      'Environmental',
      'Instrumentation',
      'Metallurgical',
      'Production',
      'Mining',
      'Marine',
      'Agricultural',
      'Petroleum',
      'MBA'
    ];

    const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
    const instructorsList = ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown', 'Dr. Jones', 'Dr. Alan Turing', 'Dr. Grace Hopper', 'Prof. Bjarne Stroustrup'];

    const courseSubjects = [
      'Strategic Management', 'Marketing Analysis', 'Financial Accounting', 'Organizational Behavior',
      'Digital Signal Processing', 'Microprocessors & Microcontrollers', 'Control Systems', 'Electromagnetic Theory',
      'Data Structures', 'Design of Algorithms', 'Cloud Computing', 'Network Security',
      'Fluid Mechanics', 'Thermodynamics', 'Machine Design', 'Manufacturing Technology',
      'Structural Analysis', 'Transportation Engineering', 'Geotechnical Engineering', 'Environmental Science',
      'Apparel Manufacturing', 'Textile Chemical Processing', 'Fashion Illustration', 'Pattern Making',
      'Food Chemistry', 'Food Microbiology', 'Unit Operations in Food Processing', 'Dairy Technology',
      'Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Computer Vision',
      'Power Systems', 'Control Theory', 'Electric Circuits', 'Semiconductor Devices',
      'Heat Transfer', 'Mass Transfer', 'Chemical Kinetics', 'Process Dynamics',
      'Aerodynamics', 'Propulsion Systems', 'Aircraft Structures', 'Flight Dynamics',
      'Medical Imaging', 'Biomaterials', 'Bioinstrumentation', 'Biomechanics'
    ];

    const courses = [];

    // Generate 492 courses distributed across departments
    for (let i = 1; i <= 492; i++) {
      // Ensure even distribution or slightly more for the "Majors"
      const deptIdx = i % departments.length;
      const dept = departments[deptIdx];
      const sem = semesters[Math.floor(Math.random() * semesters.length)];
      const subject = courseSubjects[Math.floor(Math.random() * courseSubjects.length)];

      const randomCode = Math.floor(100 + Math.random() * 900);
      const level = Math.floor(Math.random() * 3) + 1;

      courses.push({
        code: `${dept.substring(0, 2).toUpperCase()}${randomCode}-${i}`,
        name: `${subject} - Level ${level}`,
        department: dept,
        semester: sem.replace('Semester ', ''), // Just numbers as requested in schema usually
        description: `A comprehensive course about ${subject} in the ${dept} department.`,
        instructors: [instructorsList[Math.floor(Math.random() * instructorsList.length)]]
      });
    }

    const createdCourses = await Course.insertMany(courses);

    console.log(`Imported ${createdCourses.length} Courses!`.green.inverse);
    console.log('BIT UNIQUE SEEDING COMPLETE!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Course.deleteMany();
    await Feedback.deleteMany();

    console.log('Data Destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const runSeeder = async () => {
  try {
    await connectDB();
    if (process.argv[2] === '-d') {
      await destroyData();
    } else {
      await importData();
    }
  } catch (error) {
    console.error(`Seeder failed: ${error.message}`);
    process.exit(1);
  }
};

runSeeder();
