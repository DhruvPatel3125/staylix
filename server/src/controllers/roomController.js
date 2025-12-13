const Room = require("../models/room");

exports.addRoom = async (req, res) => {
    try {
        const { hotelId, title, roomType, pricePerNight, totalRooms, availableRooms } = req.body;

        if (!hotelId || !title || !roomType || !pricePerNight || !totalRooms || availableRooms === undefined) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (availableRooms > totalRooms) {
            return res.status(400).json({
                success: false,
                message: "Available rooms cannot exceed total rooms"
            });
        }

        const room = await Room.create(req.body);
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
        if (!req.params.hotelId) {
            return res.status(400).json({
                success: false,
                message: "Hotel ID is required"
            });
        }

        const rooms = await Room.find({ hotelId: req.params.hotelId });
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

exports.updateRoom = async(req, res) => {
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

        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
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