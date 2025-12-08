const Review = require("../models/review");

exports.addReview = async(req,res) =>{
    const review = await Review.create({
        ...req.body,
        userId:req.user._id
    });
    res.json(review);
};

exports.getHotelReviews = async(req,res) =>{
    const reviews = await Review.find({hotelId:req.params.hotelId})
    .populate("userId","name");
    res.json(reviews);
}