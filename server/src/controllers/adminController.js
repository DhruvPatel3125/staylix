const User = require('../models/user.js')
const Booking = require('../models/booking')
const Hotel = require('../models/hotel')
const Room = require('../models/room')
const OwnerRequest = require('../models/ownerRequest')
const Review = require('../models/review')

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email')
            .populate('hotelId', 'name address')
            .populate('roomId', 'title roomType pricePerNight');

        res.json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error("Get all bookings error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch all bookings"
        });
    }
}; exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select("-passwordHash");// Exclude passwordHash field and admin users
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

exports.blockUser = async (req, res) => {
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

exports.deleteUser = async (req, res) => {
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

        // If user is an owner, handle their hotels and rooms
        if (user.role === 'owner') {
            const hotels = await Hotel.find({ ownerId: user._id });
            const hotelIds = hotels.map(h => h._id);

            // Check if any of their hotels have active bookings
            const activeBookings = await Booking.find({
                hotelId: { $in: hotelIds },
                bookingStatus: { $in: ['pending', 'confirmed'] },
                checkOut: { $gt: new Date() }
            });

            if (activeBookings.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot delete owner. Some of their hotels have active or upcoming bookings."
                });
            }

            // Delete all rooms associated with their hotels
            await Room.deleteMany({ hotelId: { $in: hotelIds } });
            
            // Delete all bookings associated with their hotels
            await Booking.deleteMany({ hotelId: { $in: hotelIds } });

            // Delete all reviews associated with their hotels
            await Review.deleteMany({ hotelId: { $in: hotelIds } });

            // Remove their hotels from all users' wishlists
            await User.updateMany(
                { wishlist: { $in: hotelIds } },
                { $pull: { wishlist: { $in: hotelIds } } }
            );

            // Delete the hotels
            await Hotel.deleteMany({ ownerId: user._id });
        }

        // Delete any owner requests (whether pending or approved)
        await OwnerRequest.deleteMany({ userId: user._id });

        // Also delete guest bookings and reviews written by this user
        await Booking.deleteMany({ userId: user._id });
        await Review.deleteMany({ userId: user._id });

        await User.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: "User and all associated data deleted successfully"
        });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete user and associated data"
        });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
        const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });
        const totalBookings = await Booking.countDocuments({ bookingStatus: { $ne: 'cancelled' } });
        const totalHotels = await Hotel.countDocuments();
        const totalRooms = await Room.countDocuments();
        const activeUsers = await User.countDocuments({ isBlocked: false, role: { $ne: 'admin' } });
        const blockedUsers = await User.countDocuments({ isBlocked: true, role: { $ne: 'admin' } });
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
                unverifiedOwners: totalUsers - verifiedOwners,
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

exports.getAllHotels = async (req, res) => {
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

exports.deleteHotel = async (req, res) => {
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

        // Check for active bookings
        const activeBookings = await Booking.find({
            hotelId: req.params.id,
            bookingStatus: { $in: ['pending', 'confirmed'] },
            checkOut: { $gt: new Date() }
        });

        if (activeBookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete hotel. There are active or upcoming bookings."
            });
        }

        // Delete all rooms associated with this hotel
        await Room.deleteMany({ hotelId: req.params.id });
        
        // Delete all bookings associated with this hotel
        await Booking.deleteMany({ hotelId: req.params.id });

        // Delete all reviews associated with this hotel
        await Review.deleteMany({ hotelId: req.params.id });

        // Remove this hotel from all users' wishlists
        await User.updateMany(
            { wishlist: req.params.id },
            { $pull: { wishlist: req.params.id } }
        );

        await Hotel.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: "Hotel and all associated rooms and bookings deleted successfully"
        });
    } catch (error) {
        console.error("Delete hotel error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete hotel and associated data"
        });
    }
};

exports.getAllRooms = async (req, res) => {
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

exports.deleteRoom = async (req, res) => {
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

        // Check for active bookings for this room
        const activeBookings = await Booking.find({
            roomId: req.params.id,
            bookingStatus: { $in: ['pending', 'confirmed'] },
            checkOut: { $gt: new Date() }
        });

        if (activeBookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete room. There are active or upcoming bookings for this room."
            });
        }

        // Delete all bookings associated with this room
        await Booking.deleteMany({ roomId: req.params.id });

        await Room.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: "Room and associated bookings deleted successfully"
        });
    } catch (error) {
        console.error("Delete room error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete room and its bookings"
        });
    }
};

exports.getOwnerRequests = async (req, res) => {
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

exports.approveOwnerRequest = async (req, res) => {
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

exports.rejectOwnerRequest = async (req, res) => {
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


