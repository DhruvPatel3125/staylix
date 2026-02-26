const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleWare");
const {
  toggleWishlist,
  getWishlist,
} = require("../controllers/wishlistController");

router.post("/wishlist/:hotelId", protect, toggleWishlist);
router.get("/wishlist", protect, getWishlist);

module.exports = router;
