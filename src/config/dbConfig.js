const mongoose = require('mongoose');
require('dotenv').config();

const dbConfig = {
    url: process.env.MONGODB_URI,
    //   options: {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    //   },
};

const connectDB = async () => {
    try {
        await mongoose.connect(dbConfig.url);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

module.exports = { connectDB, dbConfig };