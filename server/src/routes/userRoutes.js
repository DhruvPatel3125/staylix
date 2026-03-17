const express = require("express");
const router = express.Router();
const { updateProfile, getProfile } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleWare");
const { uploadImage } = require("../middlewares/uploadMiddleware");

// Admin routes
const {getAllUsers,blockUser} = require("../controllers/adminController")
const { admin } = require("../middlewares/authMiddleWare");

router.get("/", protect, admin, getAllUsers);
router.put("/block/:id", protect, admin, blockUser);

// User profile routes
const uploadProfile = require("../middlewares/uploadProfileMiddleware");
router.put("/profile", protect, uploadProfile.single('profileImage'), updateProfile);
router.get("/profile", protect, getProfile);

module.exports = router;

