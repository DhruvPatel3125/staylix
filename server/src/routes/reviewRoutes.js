const express = require('express');

const router = express.Router();
const {
    addReview,
    getHotelReviews,
    getAllReviews,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

// const {createReview} = require('../')
const { protect, admin } = require('../middlewares/authMiddleWare');

router.post("/", protect, addReview);
router.get("/:hotelId", getHotelReviews);
router.get("/", protect, admin, getAllReviews);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;