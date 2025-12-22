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

const {protect,owner,approvedOwner} = require("../middlewares/authMiddleWare")
const upload = require("../middlewares/uploadMiddleware")

router.post("/",protect,approvedOwner,upload.array('photos',5),createHotel);
router.get("/",getAllHotels);
router.get("/owner/my-hotels",protect,approvedOwner,getOwnerHotels);
router.get("/:id",getSingleHotel);
router.put("/:id",protect,approvedOwner,upload.array('photos',5),updateHotel);
router.delete("/:id",protect,approvedOwner,deleteHotel);

module.exports = router;