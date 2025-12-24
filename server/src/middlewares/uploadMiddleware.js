const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = 'uploads/hotels';
    if (req.baseUrl && req.baseUrl.includes('/rooms')) {
      dir = 'uploads/rooms';
    } else if (req.baseUrl && req.baseUrl.includes('/owner-request')) {
      dir = 'uploads/documents';
    }
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    let prefix = 'hotel-';
    if (req.baseUrl && req.baseUrl.includes('/rooms')) {
      prefix = 'room-';
    } else if (req.baseUrl && req.baseUrl.includes('/owner-request')) {
      prefix = 'doc-';
    }
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files and PDFs are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

module.exports = upload;
