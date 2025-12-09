const express = require('express');
const router = express.Router();
const {
    createHotel,
    getAllHotels,
    getSingleHotel,
    updateHotel,
    deleteHotel
} = require('../controllers/hotelController');

const {protect,owner} = require("../middlewares/authMiddleWare")

router.post("/",protect,owner,createHotel);
router.get("/",getAllHotels);
router.get("/:id",getSingleHotel);
router.put("/:id",protect,owner,updateHotel);
router.delete("/:id",protect,owner,deleteHotel);

module.exports = router;