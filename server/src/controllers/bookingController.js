const Booking = require("../models/booking");
const Room = require("../models/room");

exports.createBooking = async(req, res) => {
    try {
        const { roomId, checkIn, checkOut, guests, totalAmount, hotelId, ownerId } = req.body;

        if (!roomId || !checkIn || !checkOut || !guests || !totalAmount || !hotelId || !ownerId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkInDate >= checkOutDate) {
            return res.status(400).json({
                success: false,
                message: "Check-out date must be after check-in date"
            });
        }

        if (guests <= 0) {
            return res.status(400).json({
                success: false,
                message: "Number of guests must be greater than 0"
            });
        }

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        const activeBookings = await Booking.find({
            roomId,
            bookingStatus: { $in: ["pending", "confirmed"] },
            checkOut: { $gt: checkInDate },
            checkIn: { $lt: checkOutDate }
        });

        if (activeBookings.length >= room.totalRooms) {
            return res.status(400).json({
                success: false,
                message: "Room not available for selected dates"
            });
        }

        const booking = await Booking.create({
            userId: req.user._id,
            ownerId,
            hotelId,
            roomId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests,
            totalAmount
        });

        res.status(201).json({
            success: true,
            booking
        });
    } catch (err) {
        console.error("Booking creation error:", err);
        res.status(500).json({
            success: false,
            message: "Booking failed"
        });
    }
};

exports.getUserBookings = async(req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id }).populate("hotelId roomId");
        res.json({
            success: true,
            bookings
        });
    } catch (err) {
        console.error("Get user bookings error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch bookings"
        });
    }
};

exports.getOwnerBookings = async(req, res) => {
    try {
        const bookings = await Booking.find({ ownerId: req.user._id }).populate("userId hotelId roomId");
        res.json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error("Get owner bookings error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch bookings"
        });
    }
};

exports.cancelBooking = async(req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required"
            });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to cancel this booking"
            });
        }

        if (booking.bookingStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled"
            });
        }

        booking.bookingStatus = "cancelled";
        await booking.save();

        res.json({
            success: true,
            message: "Booking cancelled successfully",
            booking
        });
    } catch (error) {
        console.error("Cancel booking error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to cancel booking"
        });
    }
};