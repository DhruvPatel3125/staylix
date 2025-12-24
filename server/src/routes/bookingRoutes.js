const express = require('express');

const router = express.Router();
const {
    createBooking,
    getUserBookings,
    getOwnerBookings,
    cancelBooking,
    createPaymentOrder
} = require('../controllers/bookingController');

const { protect, owner } = require("../middlewares/authMiddleWare");

router.post('/', protect, createBooking);
router.post('/create-payment-order', protect, createPaymentOrder);
router.get("/my", protect, getUserBookings);
router.get("/owner", protect, owner, getOwnerBookings);
router.put("/cancel/:id", protect, cancelBooking);

module.exports = router;
