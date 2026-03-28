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

        await review.populate('userId', 'name email');

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

const updateHotelStats = async (hotelId) => {
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
            rating: Math.round(stats[0].avgRating * 10) / 10,
            reviewsCount: stats[0].reviewsCount
        });
    } else {
        await Hotel.findByIdAndUpdate(hotelId, {
            rating: 0,
            reviewsCount: 0
        });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to edit this review" });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        await review.save();

        await updateHotelStats(review.hotelId);

        res.json({ success: true, review });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update review" });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not authorized to delete this review" });
        }

        const hotelId = review.hotelId;
        await Review.findByIdAndDelete(req.params.id);

        await updateHotelStats(hotelId);

        res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete review" });
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("userId", "name email")
            .populate("hotelId", "name")
            .sort("-createdAt");
            
        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch all reviews" });
    }
};