const User = require('../models/user.js')
const Booking = require('../models/booking')
const Hotel = require('../models/hotel')
const Room = require('../models/room')
const OwnerRequest = require('../models/ownerRequest')

exports.getAllUsers = async(req, res) => {
    try {
        const users = await User.find().select("-passwordHash");// Exclude passwordHash field from the response
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

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({
            success: true,
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`
        });
    } catch (error) {
        console.error("Block user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to block user"
        });
    }
};

exports.deleteUser = async(req, res) => {
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

        await User.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete user"
        });
    }
};

exports.getDashboardStats = async(req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });
        const totalBookings = await Booking.countDocuments({ bookingStatus: { $ne: 'cancelled' } });
        const totalHotels = await Hotel.countDocuments();
        const totalRooms = await Room.countDocuments();
        const activeUsers = await User.countDocuments({ isBlocked: false });
        const blockedUsers = await User.countDocuments({ isBlocked: true });
        const verifiedOwners = await User.countDocuments({ role: 'owner' });
        const pendingOwnerRequests = await OwnerRequest.countDocuments({ status: 'pending' });
        const totalReviews = await require('../models/review').countDocuments().catch(() => 0);
        const revenue = await Booking.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalBookings,
                cancelledBookings,
                totalHotels,
                totalRooms,
                activeUsers,
                blockedUsers,
                verifiedOwners,
                unverifiedOwners: totalUsers - verifiedOwners - 1,
                pendingOwnerRequests,
                totalReviews: totalReviews || 0,
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

exports.getAllHotels = async(req, res) => {
    try {
        const hotels = await Hotel.find().populate('ownerId', 'name email');
        res.json({
            success: true,
            hotels
        });
    } catch (error) {
        console.error("Get hotels error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch hotels"
        });
    }
};

exports.deleteHotel = async(req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                message: "Hotel ID is required"
            });
        }

        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        await Hotel.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: "Hotel deleted successfully"
        });
    } catch (error) {
        console.error("Delete hotel error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete hotel"
        });
    }
};

exports.getAllRooms = async(req, res) => {
    try {
        const rooms = await Room.find().populate({
            path: 'hotelId',
            populate: { path: 'ownerId', select: 'name email' }
        });
        res.json({
            success: true,
            rooms
        });
    } catch (error) {
        console.error("Get rooms error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch rooms"
        });
    }
};

exports.deleteRoom = async(req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                message: "Room ID is required"
            });
        }

        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        await Room.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: "Room deleted successfully"
        });
    } catch (error) {
        console.error("Delete room error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete room"
        });
    }
};

exports.getOwnerRequests = async(req, res) => {
    try {
        const requests = await OwnerRequest.find().populate('userId', 'name email businessName');
        res.json({
            success: true,
            requests
        });
    } catch (error) {
        console.error("Get owner requests error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch owner requests"
        });
    }
};

exports.approveOwnerRequest = async(req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                message: "Request ID is required"
            });
        }

        const request = await OwnerRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        if (request.status === "approved") {
            return res.status(400).json({
                success: false,
                message: "Request is already approved"
            });
        }

        request.status = "approved";
        await request.save();
        await User.findByIdAndUpdate(request.userId, { role: "owner", isApproved: true });

        res.json({
            success: true,
            message: "Owner request approved successfully"
        });
    } catch (error) {
        console.error("Approve request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to approve request"
        });
    }
};

exports.rejectOwnerRequest = async(req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                message: "Request ID is required"
            });
        }

        const request = await OwnerRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        if (request.status === "rejected") {
            return res.status(400).json({
                success: false,
                message: "Request is already rejected"
            });
        }

        request.status = "rejected";
        await request.save();

        res.json({
            success: true,
            message: "Owner request rejected successfully"
        });
    } catch (error) {
        console.error("Reject request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reject request"
        });
    }
};


