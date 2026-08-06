const mongoose = require('mongoose');
const app = require('../server/src/app');

let isConnected = false;

async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI environment variable is missing!');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log('Connected to MongoDB via Vercel Serverless');
  } catch (err) {
    console.error('MongoDB connection error in Vercel Serverless:', err);
  }
}

module.exports = async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};
