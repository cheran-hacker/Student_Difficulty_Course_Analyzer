// This service handles interactions with AI providers and local NLP
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const analyzeSentiment = async (text) => {
    try {
        // Use local Sentiment library for robust scoring
        const result = sentiment.analyze(text);

        // result.score: Score calculated by adding the sentiment values of recognized words.
        // result.comparative: Comparative score of the input string.

        // Normalize comparative score to -1 to 1 range essentially
        // Ideally comparative is already somewhat normalized (score / number of words)

        return result.comparative;
    } catch (error) {
        console.error("AI Sentiment Error:", error);
        return 0; // Neutral fallback
    }
};

const predictDifficulty = (syllabusText) => {
    // Advanced heuristic for difficulty prediction based on syllabus content
    // This mocks a "Predictive AI" by scanning for known difficulty indicators

    // 1. Complexity Keywords
    const complexityKeywords = ['advanced', 'intensive', 'project', 'capstone', 'thesis', 'calculus', 'physics', 'quantum', 'algorithm'];
    const textLower = syllabusText.toLowerCase();

    let difficultyScore = 3.0; // Base difficulty

    complexityKeywords.forEach(word => {
        if (textLower.includes(word)) difficultyScore += 0.5;
    });

    // 2. Workload Indicators
    if (textLower.includes('weekly assignments')) difficultyScore += 0.3;
    if (textLower.includes('final exam') && textLower.includes('midterm')) difficultyScore += 0.4;

    // Cap at 5.0
    return Math.min(difficultyScore, 5.0);
};

const predictTopicComplexity = (topicName) => {
    // Returns a complexity score (1-10) for a given topic based on keywords
    const highComplexity = ['advanced', 'quantum', 'optimization', 'architecture', 'distributed', 'compiler', 'cryptography', 'calculus', 'thermodynamics'];
    const mediumComplexity = ['intermediate', 'database', 'network', 'operating', 'system', 'structure', 'analysis', 'design'];

    const lowerTopic = topicName.toLowerCase();

    if (highComplexity.some(keyword => lowerTopic.includes(keyword))) return 8;
    if (mediumComplexity.some(keyword => lowerTopic.includes(keyword))) return 5;
    return 3; // Default for basic topics
};

module.exports = { analyzeSentiment, predictDifficulty, predictTopicComplexity };
