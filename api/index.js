const mongoose = require('mongoose');

// MUST be set BEFORE importing app.js (which loads models)
mongoose.set('bufferCommands', false);

// Fallback env vars for Vercel (in case dashboard vars are missing)
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb+srv://staylix:Dhruv%40123@cluster0.yfioohd.mongodb.net/staylix';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'djpatel';
}
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

const app = require('../server/src/app');

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return true;
  if (mongoose.connection.readyState === 1) { isConnected = true; return true; }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('[Vercel] MongoDB connected');
    return true;
  } catch (err) {
    console.error('[Vercel] MongoDB error:', err.message);
    isConnected = false;
    return false;
  }
}

module.exports = async (req, res) => {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  const ok = await connectDB();
  if (!ok) {
    return res.status(500).json({
      success: false,
      message: 'DB connection failed. Check MONGO_URI and Atlas IP whitelist.'
    });
  }

  return app(req, res);
};
