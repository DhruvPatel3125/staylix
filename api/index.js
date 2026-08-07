// ============================================================
// Vercel Serverless Function Entry Point
// This file MUST set up mongoose BEFORE importing the Express app
// because app.js imports models which start buffering commands.
// ============================================================

const mongoose = require('mongoose');

// 1) DISABLE BUFFERING FIRST — before any model is imported
mongoose.set('bufferCommands', false);

// 2) Set fallback env vars (Vercel provides env vars from dashboard,
//    but we set defaults so the function doesn't crash if they're missing)
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb+srv://staylix:Dhruv%40123@cluster0.yfioohd.mongodb.net/staylix';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'djpatel';
}
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// 3) Force Redis disabled on Vercel if no REDIS_URL is provided
//    This prevents redis.js from trying to connect to localhost:6379
if (!process.env.REDIS_URL) {
  process.env.REDIS_DISABLED = 'true';
}

// 4) NOW import the Express app (this triggers all route/controller/model imports)
const app = require('../server/src/app');

// 5) Connection caching for serverless warm starts
let isConnected = false;

async function connectToDatabase() {
  // If already connected from a previous invocation (warm start), skip
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  // If mongoose is already connected (e.g. from another concurrent request)
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('[Vercel] MongoDB connected successfully');
    return true;
  } catch (err) {
    console.error('[Vercel] MongoDB connection error:', err.message);
    isConnected = false;
    return false;
  }
}

// 6) Export the serverless handler
module.exports = async (req, res) => {
  // Normalize URL: Vercel rewrites strip /api prefix, but Express routes need it
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  // Connect to DB before handling the request
  const connected = await connectToDatabase();
  if (!connected) {
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please verify MONGO_URI and MongoDB Atlas IP whitelist (0.0.0.0/0).'
    });
  }

  // Hand off to Express
  return app(req, res);
};
