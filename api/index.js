const mongoose = require('mongoose');
const app = require('../server/src/app');

let isConnected = false;

async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://staylix:Dhruv%40123@cluster0.yfioohd.mongodb.net/staylix';
  if (!mongoUri) {
    console.error('MONGO_URI environment variable is missing on Vercel!');
    return false;
  }

  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'djpatel';
  }

  try {
    mongoose.set('bufferCommands', false);
    const db = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('Connected to MongoDB via Vercel Serverless');
    return isConnected;
  } catch (err) {
    console.error('MongoDB connection error in Vercel Serverless:', err.message);
    isConnected = false;
    return false;
  }
}

module.exports = async (req, res) => {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  const connected = await connectToDatabase();
  if (!connected && mongoose.connection.readyState !== 1) {
    return res.status(500).json({
      success: false,
      message: 'Database connection failed on Vercel. Please check MONGO_URI in Vercel settings and allow 0.0.0.0/0 in MongoDB Atlas Network Access.'
    });
  }
  return app(req, res);
};
