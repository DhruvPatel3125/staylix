const User = requier('../models/user.js')
const Booking = require('../models/booking')

exports.getAllUsers = async(req,res) =>{
    const users = await User.find();
    res.json(users);
};

exports.blockUser = async(req,res) =>{
    const user = await User.findById(req.params.id);
    user.isBlocked = true;
    await user.save();
    res.json({message:'user blocked'})
};

exports.getDashbordStats = async(req,res)=>{
    const totalUsers = await User.countDocuments();
     const totalBookings = await Booking.countDocuments();
     const revenue = await Booking.aggregate([
        { $group:{_id:null,total:{$sum:"$totalAmmount"}}}
     ]);
     res.json({
         totalUsers,
         totalBookings,
         revenue:revenue[0]?.total || 0
     })
};
