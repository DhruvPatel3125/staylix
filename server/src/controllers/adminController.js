const User = require('../models/user.js')
const Booking = require('../models/booking')

exports.getAllUsers = async(req, res) => {
    try {
        const users = await User.find().select("-passwordHash");
        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};

exports.blockUser = async(req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.isBlocked = true;
        await user.save();

        res.json({
            success: true,
            message: "User blocked successfully"
        });
    } catch (error) {
        console.error("Block user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to block user"
        });
    }
};

exports.getDashboardStats = async(req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const revenue = await Booking.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalBookings,
                revenue: revenue[0]?.total || 0
            }
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard stats"
        });
    }
};
