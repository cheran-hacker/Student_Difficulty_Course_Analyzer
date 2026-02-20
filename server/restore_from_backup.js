const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration for restoration
const RESTORE_CONFIG = [
    {
        filename: 'student_analyzer.users.json',
        modelName: 'User',
        modelFile: './models/User'
    },
    {
        filename: 'student_analyzer.courses.json',
        modelName: 'Course',
        modelFile: './models/Course'
    },
    {
        filename: 'student_analyzer.courserequests.json',
        modelName: 'CourseRequest',
        modelFile: './models/CourseRequest'
    },
    {
        filename: 'student_analyzer.facultycourserequests.json',
        modelName: 'FacultyCourseRequest',
        modelFile: './models/FacultyCourseRequest'
    }
];

const transformData = (data) => {
    if (!Array.isArray(data)) return [];

    return data.map(item => {
        // Transform _id
        if (item._id && item._id.$oid) {
            item._id = new mongoose.Types.ObjectId(item._id.$oid);
        }

        // Transform Dates (recursively or specifically?)
        // Let's do a specific check for known date fields or traverse keys
        Object.keys(item).forEach(key => {
            if (item[key] && typeof item[key] === 'object') {
                if (item[key].$date) {
                    item[key] = new Date(item[key].$date);
                } else if (key === 'syllabus' && item[key].uploadedAt && item[key].uploadedAt.$date) {
                    item[key].uploadedAt = new Date(item[key].uploadedAt.$date);
                }
            }
        });

        // Specific nested logic for syllabus uploadedAt if deeper structure
        if (item.syllabus && item.syllabus.uploadedAt && item.syllabus.uploadedAt.$date) {
            item.syllabus.uploadedAt = new Date(item.syllabus.uploadedAt.$date);
        }

        // Remove __v to avoid version error
        delete item.__v;
        return item;
    });
};

const restore = async () => {
    try {
        console.log('Connecting to Cloud DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        for (const config of RESTORE_CONFIG) {
            const filePath = path.join(__dirname, config.filename);

            if (fs.existsSync(filePath)) {
                console.log(`\nProcessing ${config.filename}...`);

                try {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    const rawData = JSON.parse(fileContent);
                    const documents = transformData(rawData);

                    if (documents.length === 0) {
                        console.log(`Skipping ${config.filename}: No data found.`);
                        continue;
                    }

                    const Model = require(config.modelFile);

                    // Clear existing data?
                    console.log(`Clearing existing ${config.modelName} collection...`);
                    await Model.deleteMany({});

                    console.log(`Inserting ${documents.length} documents into ${config.modelName}...`);
                    await Model.insertMany(documents);

                    console.log(`Successfully restored ${config.modelName}.`);

                } catch (err) {
                    console.error(`Error processing ${config.filename}:`, err.message);
                }
            } else {
                console.log(`\nSkipping ${config.filename}: File not found.`);
            }
        }

        fs.writeFileSync(path.join(__dirname, 'restore_success.txt'), 'Restoration completed successfully at ' + new Date().toISOString());
        console.log('\nAll restoration tasks completed.');
        process.exit(0);

    } catch (error) {
        fs.writeFileSync(path.join(__dirname, 'restore_error.txt'), 'Restoration failed: ' + error.message);
        console.error('Global Restore Failed:', error);
        process.exit(1);
    }
};

restore();
