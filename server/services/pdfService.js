const fs = require('fs');
const pdfParse = require('pdf-parse');
const { predictDifficulty } = require('./aiService');

const extractTextFromPDF = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
};

const analyzeSyllabusContext = async (text) => {
    // Basic analysis of the syllabus text
    const words = text.split(/\s+/).length;

    // Use the AI Predictive Engine logic
    const difficultyScore = predictDifficulty(text);

    return {
        wordCount: words,
        difficultyScore: difficultyScore,
        estimatedHoursRequest: Math.max(5, Math.round(words / 200)), // Crude heuristics
        topics: ['Introduction', 'Core Concepts', 'Advanced Theory'], // Mock extraction for now
        summary: `Syllabus contains approx ${words} words. Rated difficulty: ${difficultyScore}/5.0`
    };
};

module.exports = { extractTextFromPDF, analyzeSyllabusContext };
