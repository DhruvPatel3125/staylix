const Hotel = require('../models/hotel')

exports.createHotel = async(req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({
                success: false,
                message: "Hotel name is required"
            });
        }

        let amenities = [];
        if (req.body.amenities) {
            try {
                amenities = typeof req.body.amenities === 'string' 
                    ? JSON.parse(req.body.amenities) 
                    : req.body.amenities;
            } catch (e) {
                amenities = [];
            }
        }

        const hotelData = {
            name: req.body.name,
            description: req.body.description || '',
            amenities: amenities,
            ownerId: req.user._id,
            address: {
                city: req.body.city || '',
                state: req.body.state || '',
                country: req.body.country || '',
                pincode: req.body.pincode || ''
            }
        };

        if (req.files && req.files.length > 0) {
            hotelData.photos = req.files.map(file => `/uploads/hotels/${file.filename}`);
        }

        const hotel = await Hotel.create(hotelData);
        res.status(201).json({
            success: true,
            hotel
        });
    } catch (error) {
        console.error("Hotel creation error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Hotel creation failed"
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

        let amenities = hotel.amenities || [];
        if (req.body.amenities) {
            try {
                amenities = typeof req.body.amenities === 'string' 
                    ? JSON.parse(req.body.amenities) 
                    : req.body.amenities;
            } catch (e) {
                amenities = hotel.amenities || [];
            }
        }

        const updateData = {
            name: req.body.name || hotel.name,
            description: req.body.description !== undefined ? req.body.description : hotel.description,
            amenities: amenities,
            address: {
                city: req.body.city || hotel.address?.city || '',
                state: req.body.state || hotel.address?.state || '',
                country: req.body.country || hotel.address?.country || '',
                pincode: req.body.pincode || hotel.address?.pincode || ''
            }
        };

        if (req.files && req.files.length > 0) {
            const newPhotos = req.files.map(file => `/uploads/hotels/${file.filename}`);
            updateData.photos = req.body.keepExistingPhotos === 'true' 
                ? [...(hotel.photos || []), ...newPhotos]
                : newPhotos;
        }

        const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, updateData, { new: true });
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

exports.getOwnerHotels = async(req, res) => {
    try {
        const hotels = await Hotel.find({ ownerId: req.user._id });
        res.json({
            success: true,
            hotels
        });
    } catch (error) {
        console.error("Get owner hotels error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch owner hotels"
        });
    }
};