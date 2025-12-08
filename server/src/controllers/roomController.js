const Room = require("../models/room");

exports.addRoom = async (req,res) =>{
    const room = await Room.create(req.body);
    res.json(room);
};

exports.getRoomsByHotel = async (req,res) =>{
    const rooms = await Room.find({hotelId:req.params.hotelId});
    res.json(rooms);
};

exports.updateRoom = async(req,res) =>{
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {new:true});
    res.json(room);
}

exports.deleteRoom = async(req,res)=>{
    const room = await Room.findByIdAndDelete(req.params.id);
    res.json({message:"Room deleted"});
}