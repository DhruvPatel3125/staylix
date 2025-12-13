const Hotel = require('../models/hotel')

exports.createHotel = async(req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({
                success: false,
                message: "Hotel name is required"
            });
        }

        const hotel = await Hotel.create({ ...req.body, ownerId: req.user._id });
        res.status(201).json({
            success: true,
            hotel
        });
    } catch (error) {
        console.error("Hotel creation error:", error);
        res.status(500).json({
            success: false,
            message: "Hotel creation failed"
        });
    }
};

exports.getAllHotels = async(req, res) => {
    try {
        const hotels = await Hotel.find({ isActive: true });
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

exports.getSingleHotel = async(req, res) => {
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

        res.json({
            success: true,
            hotel
        });
    } catch (error) {
        console.error("Get hotel error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch hotel"
        });
    }
};

exports.updateHotel = async(req, res) => {
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

        if (hotel.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this hotel"
            });
        }

        const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({
            success: true,
            hotel: updatedHotel
        });
    } catch (error) {
        console.error("Update hotel error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update hotel"
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

        if (hotel.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this hotel"
            });
        }

        await Hotel.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: "Hotel deleted successfully"
        });
    } catch (error) {
        console.error("Delete hotel error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete hotel"
        });
    }
};