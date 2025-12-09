const Booking = require("../models/booking");
const Room = require("../models/room");

exports.createBooking = async(req,res) =>{
    try{
        const {roomId,checkIn,checkOut,guests,totalAmmount,hotelId,ownerId} = req.body;

        const activeBookings = await Booking.find({
            roomId,
            bookingStatus:{$in:["pending","confirmed"]},
            checkOut:{$gt:new Date(checkIn)},
            checkIn:{$lt:new Date(checkOut)}
        });

        const room = await Room.findById(roomId);
        if(activeBookings.length >= room.totalRooms){
            return res.status(400).json({message:"Room not available"});
        }

        const booking = await Booking.create({
            userId:req.user._id,
            ownerId,
            hotelId,
            roomId,
            checkIn,
            checkOut,
            guests,
            totalAmmount
        })
        res.json(booking);
    }
    catch(err){
          res.status(500).json({ message: "Booking failed" });
    }
};

exports.getUserBookings = async(req,res) =>{
    try{
        const bookings = await Booking.find({userId:req.user._id}).populate("hotelId roomId");
        res.json(bookings)
    }
    catch(err){
         res.status(500).json({ message: err.message });
    }
};

exports.getOwnerBookings = async(req,res) =>{
    try {
        const bookings = await Booking.find({ownerId:req.user._id}).populate("userId hotelId roomId");
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.cancelBooking = async(req,res) =>{
    try{
        const booking = await Booking.findById(req.params.id);
        booking.bookingStatus="cancelled";
        await booking.save();
        res.json({message:"Booking cancelled successfully"});
    }
    catch(error){
        res.status(500).json({ message:error.message});
    }
};