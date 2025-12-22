const express = require('express');
const router = express.Router();
const {
    addRoom,
    getRoomsByHotel,
    updateRoom,
    deleteRoom,
    getOwnerRooms,
    toggleRoomAvailability
} = require('../controllers/roomController');

const { protect, owner, approvedOwner } = require("../middlewares/authMiddleWare");
const upload = require("../middlewares/uploadMiddleware");

router.post("/", protect, approvedOwner, upload.single('image'), addRoom);
router.get("/:hotelId", getRoomsByHotel);
router.put("/:id", protect, approvedOwner, upload.single('image'), updateRoom);
router.delete("/:id", protect, approvedOwner, deleteRoom);

router.get("/owner/all", protect, approvedOwner, getOwnerRooms);
router.put("/:id/toggle", protect, approvedOwner, toggleRoomAvailability);

module.exports = router;