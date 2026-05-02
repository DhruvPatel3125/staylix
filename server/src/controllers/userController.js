const User = require('../models/user');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters'
      });
    }

    const updateData = { name: name.trim() };

    // Handle profile image upload to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'profiles');
      updateData.profileImage = result.url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

