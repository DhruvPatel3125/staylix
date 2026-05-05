const express = require('express');
const router = express.Router();
const {
    createHotel,
    getAllHotels,
    getSingleHotel,
    updateHotel,
    deleteHotel,
    getOwnerHotels,
    getNearbyHotels
} = require('../controllers/hotelController');
const cacheMiddleware  = require('../middlewares/cacheMiddleware')

const { protect, owner, approvedOwner } = require("../middlewares/authMiddleWare")
const upload = require("../middlewares/uploadMiddleware")

router.post("/", protect, approvedOwner, upload.array('photos', 5), createHotel);
router.get("/", cacheMiddleware(3600),getAllHotels);
router.get("/owner/my-hotels", protect, approvedOwner, getOwnerHotels);
router.get("/nearby", getNearbyHotels);
router.get("/:id", cacheMiddleware(1800),getSingleHotel);
router.put("/:id", protect, approvedOwner, upload.array('photos', 5), updateHotel);
router.delete("/:id", protect, approvedOwner, deleteHotel);


module.exports = router;