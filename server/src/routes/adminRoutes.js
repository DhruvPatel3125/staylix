const express = require('express');

const router = express.Router();
const {
    getDashboardStats,
    getAllUsers,
    blockUser,
    deleteUser,
    getAllHotels,
    deleteHotel,
    getAllRooms,
    deleteRoom,
    getOwnerRequests,
    approveOwnerRequest,
    rejectOwnerRequest,
    getRoomRequests,
    approveRoomRequest,
    rejectRoomRequest
} = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleWare');

router.get("/stats", protect, admin, getDashboardStats);
router.get("/users", protect, admin, getAllUsers);
router.put("/users/block/:id", protect, admin, blockUser);
router.delete("/users/:id", protect, admin, deleteUser);

router.get("/hotels", protect, admin, getAllHotels);
router.delete("/hotels/:id", protect, admin, deleteHotel);

router.get("/rooms", protect, admin, getAllRooms);
router.delete("/rooms/:id", protect, admin, deleteRoom);

router.get("/owner-requests", protect, admin, getOwnerRequests);
router.put("/owner-requests/approve/:id", protect, admin, approveOwnerRequest);
router.put("/owner-requests/reject/:id", protect, admin, rejectOwnerRequest);

router.get("/room-requests", protect, admin, getRoomRequests);
router.put("/room-requests/approve/:id", protect, admin, approveRoomRequest);
router.put("/room-requests/reject/:id", protect, admin, rejectRoomRequest);

module.exports = router;