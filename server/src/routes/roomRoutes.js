const express = require('express');
const router = express.Router();
const {
    addRoom,
    getRoomsByHotel,
    updateRoom,
    deleteRoom
} = require('../controllers/roomController');

const {protect,owner} = require("../middlewares/authMiddleWare");

router.post("/:hotelId",protect,owner,addRoom)
router.get("/:hotelId",getRoomsByHotel);
router.put("/:roomId",protect,owner,updateRoom);
router.delete("/:roomId",protect,owner,deleteRoom);

module.exports = router;