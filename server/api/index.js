const mongoose = require('mongoose');
const app = require('../src/app');

// Connect to MongoDB
if (process.env.MONGO_URI && !mongoose.connections[0].readyState) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB via Vercel Serverless'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Export the Express app for Vercel
module.exports = app;
