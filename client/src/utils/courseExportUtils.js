import { exportToCSV, exportToJSON } from './exportUtils';

// Format courses data for export
export const formatCoursesForExport = (courses) => {
    return courses.map(course => ({
        Code: course.code,
        Name: course.name,
        Department: course.department,
        Semester: course.semester,
        Instructors: Array.isArray(course.instructors) ? course.instructors.join('; ') : course.instructors || '',
        CreatedAt: new Date(course.createdAt).toLocaleString(),
        UpdatedAt: new Date(course.updatedAt).toLocaleString()
    }));
};

// Bulk create courses from CSV
export const parseCourseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const course = {};

        headers.forEach((header, index) => {
            course[header.toLowerCase()] = values[index];
        });

        return course;
    });
};

export { exportToCSV, exportToJSON };
