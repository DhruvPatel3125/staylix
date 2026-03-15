const express = require('express');

const router = express.Router();
const {
    confirmBooking,
    getUserBookings,
    getOwnerBookings,
    cancelBooking,
    createPaymentOrder,
    checkAvailability
} = require('../controllers/bookingController');

const { protect, owner } = require("../middlewares/authMiddleWare");

router.post('/', protect, confirmBooking);
router.post('/create-payment-order', protect, createPaymentOrder);
router.get("/my", protect, getUserBookings);
router.get("/owner", protect, owner, getOwnerBookings);
router.put("/cancel/:id", protect, cancelBooking);
router.post("/check-availability", checkAvailability);

module.exports = router;
