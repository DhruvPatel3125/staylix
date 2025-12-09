const express = require('express');

const router = express.Router();
const {
    createBooking,
    getUserBookings,
    getOwnerBookings,
    cancleBooking,
} = require('../controllers/bookingController');

const {protect,owner} = require("../middleware/authMiddleware");

router.post('/', protect,createBooking);
router.get("/my",protect,getUserBookings);
router.get("/owner",protect,owner,getOwnerBookings)
router.put("/cancel/:id",protect,cancleBooking);
module.exports=router;
