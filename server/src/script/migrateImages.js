// ----------------------------------------------------
// migrateImages.js – one‑off migration of old local uploads to Cloudinary
// ----------------------------------------------------
require('dotenv').config();
const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// -------------------------------------------------------------------
// Configuration
// -------------------------------------------------------------------
// Absolute path to the folder that actually contains the old uploads.
// In this repo the uploads live under server/uploads
const uploadsRoot = path.resolve(__dirname, '../../uploads');

// Import models that may contain image URLs
const Hotel = require('../models/hotel');
const Room = require('../models/room');
const User = require('../models/user');
const OwnerRequest = require('../models/ownerRequest');

/** Helper: upload a local file buffer to Cloudinary and return the URL */
async function uploadFile(buffer, folder) {
  const result = await uploadToCloudinary(buffer, folder);
  return result.url;
}

/** Helper: migrate an array of image paths (e.g. hotel.photos) */
async function migrateArray(arr, folder) {
  const newArr = [];
  for (const item of arr) {
    if (typeof item === 'string' && item.includes('/uploads/')) {
      // Resolve the *real* absolute path on disk
      const absPath = path.join(uploadsRoot, item.replace(/^.*\/uploads\//, '')); // strip leading segment
      try {
        const buf = await fs.readFile(absPath);
        const url = await uploadFile(buf, folder);
        newArr.push(url);
      } catch (e) {
        console.warn(`⚠️ Unable to read ${absPath}: ${e.message}`);
        newArr.push(item); // keep original if file missing
      }
    } else {
      newArr.push(item);
    }
  }
  return newArr;
}

// -------------------------------------------------------------------
// Main migration
// -------------------------------------------------------------------
(async () => {
  try {
    // Newer Mongoose versions do NOT require old parser flags
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ----- Hotels -----
    const hotels = await Hotel.find({ photos: { $elemMatch: { $regex: '/uploads/' } } });
    for (const hotel of hotels) {
      if (!hotel.photos || !Array.isArray(hotel.photos)) continue;
      hotel.photos = await migrateArray(hotel.photos, 'hotels');
      await hotel.save();
      console.log(`🔄 Hotel ${hotel._id} updated`);
    }

    // ----- Rooms -----
    const rooms = await Room.find({ image: { $regex: '/uploads/' } });
    for (const room of rooms) {
      if (room.image && room.image.includes('/uploads/')) {
        const absPath = path.join(
          uploadsRoot,
          room.image.replace(/^.*\/uploads\//, '')
        );
        try {
          const buf = await fs.readFile(absPath);
          room.image = await uploadFile(buf, 'rooms');
          await room.save();
          console.log(`🔄 Room ${room._id} updated`);
        } catch (e) {
          console.warn(`⚠️ Unable to read ${absPath}: ${e.message}`);
        }
      }
    }

    // ----- Users (profile pictures) -----
    const users = await User.find({ profileImage: { $regex: '/uploads/' } });
    for (const user of users) {
      if (!user.profileImage || !user.profileImage.includes('/uploads/')) continue;
      const absPath = path.join(
        uploadsRoot,
        user.profileImage.replace(/^.*\/uploads\//, '')
      );
      try {
        const buf = await fs.readFile(absPath);
        user.profileImage = await uploadFile(buf, 'profiles');
        await user.save();
        console.log(`🔄 User ${user._id} updated`);
      } catch (e) {
        console.warn(`⚠️ Unable to read ${absPath}: ${e.message}`);
      }
    }

    // ----- Owner Requests (documents) -----
    const requests = await OwnerRequest.find({ document: { $regex: '/uploads/' } });
    for (const req of requests) {
      if (!req.document || !req.document.includes('/uploads/')) continue;
      const absPath = path.join(
        uploadsRoot,
        req.document.replace(/^.*\/uploads\//, '')
      );
      try {
        const buf = await fs.readFile(absPath);
        req.document = await uploadFile(buf, 'documents');
        await req.save();
        console.log(`🔄 OwnerRequest ${req._id} updated`);
      } catch (e) {
        console.warn(`⚠️ Unable to read ${absPath}: ${e.message}`);
      }
    }

    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
})();
