const User = require("../models/user");

exports.toggleWishlist = async (req, res) => {
  const userId = req.user._id;
  const { hotelId } = req.params;

  try {
    const user = await User.findById(userId);

    const isWishlisted = user.wishlist.includes(hotelId);

    if (isWishlisted) {
      user.wishlist.pull(hotelId);
    } else {
      user.wishlist.push(hotelId);
    }

    await user.save();

    const populatedUser = await User.findById(userId).populate("wishlist");
    const wishlistIds = populatedUser.wishlist.map((hotel) => String(hotel._id));

    res.status(200).json({
      success: true,
      wishlisted: !isWishlisted,
      wishlist: populatedUser.wishlist,
      wishlistIds,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Wishlist operation failed",
    });
  }
};

// ✅ ADD THIS
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    const wishlistIds = user.wishlist.map((hotel) => String(hotel._id));

    res.status(200).json({
      success: true,
      wishlist: user.wishlist,
      wishlistIds,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};
