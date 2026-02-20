const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'uploads', 'syllabi', 'Student_Course_Difficulty_Analyzer_____Srs__1_-1770956652694-169000913.pdf');

console.log('Checking file:', filePath);
if (fs.existsSync(filePath)) {
    console.log('✅ File exists on disk');
    const stats = fs.statSync(filePath);
    console.log('Size:', stats.size, 'bytes');
    console.log('Permissions:', stats.mode.toString(8));
} else {
    console.log('❌ File does NOT exist on disk');

    const syllabiDir = path.join(__dirname, 'uploads', 'syllabi');
    if (fs.existsSync(syllabiDir)) {
        console.log('Contents of', syllabiDir, ':');
        console.log(fs.readdirSync(syllabiDir));
    } else {
        console.log('❌ Directory', syllabiDir, 'does not exist');
    }
}
