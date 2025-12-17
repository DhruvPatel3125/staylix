const express = require('express');
const router = express.Router();
const {
    createHotel,
    getAllHotels,
    getSingleHotel,
    updateHotel,
    deleteHotel,
    getOwnerHotels
} = require('../controllers/hotelController');

const {protect,owner} = require("../middlewares/authMiddleWare")
const upload = require("../middlewares/uploadMiddleware")

router.post("/",protect,owner,upload.array('photos',5),createHotel);
router.get("/",getAllHotels);
router.get("/owner/my-hotels",protect,owner,getOwnerHotels);
router.get("/:id",getSingleHotel);
router.put("/:id",protect,owner,upload.array('photos',5),updateHotel);
router.delete("/:id",protect,owner,deleteHotel);

module.exports = router;