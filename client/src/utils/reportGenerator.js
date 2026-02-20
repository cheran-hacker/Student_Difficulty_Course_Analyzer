import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateSemesterReport = (stats, user) => {
    const doc = new jsPDF();

    // -- Header --
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Semester Performance Report', 14, 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Faculty: ${user.name}`, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 30);

    // -- Executive Summary --
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 14, 55);

    const summaryData = [
        ['Total Courses', stats.totalCourses],
        ['Total Students', stats.courses.reduce((acc, c) => acc + (c.studentCount || 0), 0)],
        ['Average Rating', `${stats.avgRating} / 5.0`],
        ['Impact Score', stats.gamification?.impactScore || 0]
    ];

    autoTable(doc, {
        startY: 60,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 12 }
    });

    // -- Sentiment Analysis --
    let yPos = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.text('Student Sentiment Analysis', 14, yPos);

    const sentimentData = [
        ['Teaching Quality', stats.sentimentBreakdown?.teaching || 0],
        ['Course Content', stats.sentimentBreakdown?.content || 0],
        ['Assessment', stats.sentimentBreakdown?.assessment || 0],
        ['Resources', stats.sentimentBreakdown?.resources || 0]
    ];

    autoTable(doc, {
        startY: yPos + 5,
        head: [['Category', 'Positive Sentiment Count']],
        body: sentimentData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }, // Emerald
    });

    // -- Course Breakdown --
    yPos = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.text('Course Details', 14, yPos);

    const courseRows = stats.courses.map(c => [
        c.code,
        c.name,
        c.studentCount || 0,
        c.avgRating || 'N/A'
    ]);

    autoTable(doc, {
        startY: yPos + 5,
        head: [['Code', 'Course Name', 'Students', 'Avg Rating']],
        body: courseRows,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] }, // Amber
    });

    // -- Footer --
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('StudentAnalyzer Pro © 2026', 14, 285);
        doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
    }

    doc.save(`Semester_Report_${user.name.replace(/\s+/g, '_')}.pdf`);
};
