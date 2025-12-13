const express = require('express');

const router = express.Router();
const { getDashboardStats, getAllUsers, blockUser } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleWare');

router.get("/stats", protect, admin, getDashboardStats);
router.get("/users", protect, admin, getAllUsers);
router.put("/users/block/:id", protect, admin, blockUser);

module.exports = router;