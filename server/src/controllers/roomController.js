const Room = require("../models/room");
const Hotel = require("../models/hotel");
const Booking = require("../models/booking");

exports.addRoom = async (req, res) => {
    try {
        const { hotelId, title, roomType, pricePerNight, totalRooms, guestCapacity, amenities } = req.body;

        if (!hotelId || !title || !roomType || !pricePerNight || !totalRooms || !guestCapacity) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        let amenitiesList = [];
        if (amenities) {
            try {
                amenitiesList = typeof amenities === 'string'
                    ? JSON.parse(amenities)
                    : amenities;
            } catch (e) {
                amenitiesList = [];
            }
        }

        const roomData = {
            hotelId,
            title,
            roomType,
            pricePerNight,
            totalRooms,
            guestCapacity,
            amenities: amenitiesList
        };

        if (req.file) {
            roomData.image = `/uploads/rooms/${req.file.filename}`;
        }

        const room = await Room.create(roomData);
        res.status(201).json({
            success: true,
            room
        });
    } catch (error) {
        console.error("Add room error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add room"
        });
    }
};

exports.getRoomsByHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { checkIn, checkOut } = req.query;

        if (!hotelId) {
            return res.status(400).json({
                success: false,
                message: "Hotel ID is required"
            });
        }

        const rooms = await Room.find({ hotelId, isAvailable: true });
        
        // If dates are provided, calculate live availability for each room
        const roomsWithLiveAvailability = await Promise.all(rooms.map(async (room) => {
            if (checkIn && checkOut) {
                const checkInDate = new Date(checkIn);
                const checkOutDate = new Date(checkOut);
                const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

                const activeBookings = await Booking.find({
                    roomId: room._id,
                    $or: [
                        { bookingStatus: "confirmed" },
                        { 
                            bookingStatus: "pending", 
                            createdAt: { $gt: tenMinutesAgo } 
                        }
                    ],
                    checkOut: { $gt: checkInDate },
                    checkIn: { $lt: checkOutDate }
                });

                const occupiedCount = activeBookings.length;
                const totalCapacity = room.totalRooms || 0;
                
                return {
                    ...room.toObject(),
                    liveAvailableCount: Math.max(0, totalCapacity - occupiedCount),
                    isSoldOut: occupiedCount >= totalCapacity
                };
            }
            return {
                ...room.toObject(),
                liveAvailableCount: room.totalRooms,
                isSoldOut: (room.totalRooms || 0) <= 0
            };
        }));

        res.json({
            success: true,
            rooms: roomsWithLiveAvailability
        });
    } catch (error) {
        console.error("Get rooms error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch rooms"
        });
    }
};

exports.updateRoom = async (req, res) => {
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

        const updateData = { ...req.body };

        if (req.file) {
            updateData.image = `/uploads/rooms/${req.file.filename}`;
        }

        let amenities = updateData.amenities;
        if (amenities && typeof amenities === 'string') {
            try {
                updateData.amenities = JSON.parse(amenities);
            } catch (e) {
                updateData.amenities = [];
            }
        }

        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({
            success: true,
            room: updatedRoom
        });
    } catch (error) {
        console.error("Update room error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update room"
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

exports.getOwnerRooms = async (req, res) => {
    try {
        const hotels = await Hotel.find({ ownerId: req.user._id });
        const hotelIds = hotels.map(h => h._id);

        const rooms = await Room.find({ hotelId: { $in: hotelIds } }).populate('hotelId', 'name');
        res.json({
            success: true,
            rooms
        });
    } catch (error) {
        console.error("Get owner rooms error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch rooms"
        });
    }
};

exports.toggleRoomAvailability = async (req, res) => {
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

        room.isAvailable = !room.isAvailable;
        await room.save();

        res.json({
            success: true,
            message: `Room ${room.isAvailable ? 'activated' : 'deactivated'} successfully`,
            room
        });
    } catch (error) {
        console.error("Toggle room availability error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle room availability"
        });
    }
};

