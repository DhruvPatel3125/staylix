const express = require('express');
const router = express.Router();
const {
    addRoom,
    getRoomsByHotel,
    updateRoom,
    deleteRoom,
    getOwnerRooms,
    toggleRoomAvailability,
    createRoomRequest,
    getOwnerRoomRequests
} = require('../controllers/roomController');

const { protect, owner } = require("../middlewares/authMiddleWare");

router.post("/", protect, owner, addRoom);
router.get("/:hotelId", getRoomsByHotel);
router.put("/:id", protect, owner, updateRoom);
router.delete("/:id", protect, owner, deleteRoom);

router.get("/owner/all", protect, owner, getOwnerRooms);
router.put("/:id/toggle", protect, owner, toggleRoomAvailability);
router.post("/request/create", protect, owner, createRoomRequest);
router.get("/request/all", protect, owner, getOwnerRoomRequests);

module.exports = router;