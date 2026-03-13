const Review = require("../models/review");
const mongoose = require('mongoose');
const Hotel = require('../models/hotel');

exports.addReview = async (req, res) => {
    try {
        const { hotelId, rating, comment } = req.body;

        if (!hotelId || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Hotel ID and rating (1-5) are required"
            });
        }

        const review = await Review.create({
            hotelId,
            rating: Number(rating),
            comment: comment || '',
            userId: req.user._id
        });

        // Calculate average rating and count using aggregation
        const stats = await Review.aggregate([
            { $match: { hotelId: new mongoose.Types.ObjectId(hotelId) } },
            {
                $group: {
                    _id: "$hotelId",
                    avgRating: { $avg: "$rating" },
                    reviewsCount: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            await Hotel.findByIdAndUpdate(hotelId, {
                rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal place
                reviewsCount: stats[0].reviewsCount
            });
        }

        res.status(201).json({
            success: true,
            review
        });
    } catch (error) {
        console.error("Add review error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add review"
        });
    }
};

exports.getHotelReviews = async (req, res) => {
    try {
        if (!req.params.hotelId) {
            return res.status(400).json({
                success: false,
                message: "Hotel ID is required"
            });
        }

        const reviews = await Review.find({ hotelId: req.params.hotelId }).populate("userId", "name");
        res.json({
            success: true,
            reviews
        });
    } catch (error) {
        console.error("Get reviews error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reviews"
        });
    }
};