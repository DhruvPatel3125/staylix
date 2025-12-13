const express = require('express');

const router = express.Router();
const {
    addReview,
    getHotelReviews
} = require('../controllers/reviewController');

const { protect } = require('../middlewares/authMiddleWare');

router.post("/", protect, addReview);
router.get("/:hotelId", getHotelReviews);

module.exports = router;