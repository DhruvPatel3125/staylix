const Review = require("../models/review");
const mongoose = require('mongoose');
const Hotel = require('../models/hotel');

exports.createReview = async(req,res) => {

try{
    const userId = req.user._id;
    const {hotelId,rating,comment} = req.body;

    if(!hotelId || !rating){
        return res.status(400).json({success:false, message:"hotelId and rating are required"})
    }

    const review = await Review.create({
        hotel:hotelId,
        user:userId,
        rating:Number(rating),
        comment:comment || ''
    });

    const agg = await Review.aggregate([
        {$match: {hotel:mongoose.Types.ObjectId(hotelId)}},
        {$group:{_id:'$hotel',avgRating:{$avg:'$rating'},count:{$sum:1}}}
    ]);

    const avgRating = agg[0]?.avgRating ?? 0;
    const reviewsCount = agg[0]?.count ?? 0;

    await Hotel.findByIdAndUpdate(hotelId,{rating:avgRating,reviewsCount});

    return res.json({success:true,review});
} catch(err){
    console.error('Create review error',err);
    return res.status(500).json({success:false,message: err.message || 'Searver error'})
    
}
}
exports.addReview = async(req, res) => {
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
            rating,
            comment,
            userId: req.user._id
        });

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

exports.getHotelReviews = async(req, res) => {
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