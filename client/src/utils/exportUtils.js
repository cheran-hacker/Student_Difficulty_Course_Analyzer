// Utility functions for exporting data to CSV and JSON

export const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
        console.error('No data to export');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle nested objects and arrays
                if (typeof value === 'object' && value !== null) {
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                }
                // Escape commas and quotes
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToJSON = (data, filename) => {
    if (!data) {
        console.error('No data to export');
        return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Format feedback data for export
export const formatFeedbackForExport = (feedback) => {
    return feedback.map(item => ({
        Student: item.user?.name || 'N/A',
        Email: item.user?.email || 'N/A',
        Course: item.course?.name || 'N/A',
        CourseCode: item.course?.code || 'N/A',
        Department: item.course?.department || 'N/A',
        DifficultyIndex: item.difficultyIndex || 0,
        TimeCommitment: item.timeCommitment || 0,
        ContentQuality: item.contentQuality || 0,
        InstructorEffectiveness: item.instructorEffectiveness || 0,
        OverallSatisfaction: item.overallSatisfaction || 0,
        Comments: item.comments || '',
        SubmittedAt: new Date(item.createdAt).toLocaleString()
    }));
};

// Format students data for export
export const formatStudentsForExport = (students) => {
    return students.map(student => ({
        Name: student.name,
        Email: student.email,
        Role: student.role,
        CoursesEnrolled: student.courses?.length || 0,
        RegisteredAt: new Date(student.createdAt).toLocaleString()
    }));
};

// Format courses data for export
export const formatCoursesForExport = (courses) => {
    return courses.map(course => ({
        Code: course.code,
        Name: course.name,
        Department: course.department,
        Semester: course.semester,
        Instructors: Array.isArray(course.instructors) ? course.instructors.join('; ') : course.instructors,
        Description: course.description || '',
        CreatedAt: new Date(course.createdAt).toLocaleString()
    }));
};
