const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const checkFeedback = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const Feedback = require('./models/Feedback');
        const count = await Feedback.countDocuments();

        console.log(`Total Feedback: ${count}`);

        if (count > 0) {
            const sample = await Feedback.findOne();
            console.log('Sample:', sample);
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkFeedback();
