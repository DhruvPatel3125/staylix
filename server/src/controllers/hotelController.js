const Hotel = require('../models/hotel')

exports.createHotel = async(req,res) =>{
    try {
        const hotel = await Hotel.create({...req.body,ownerId:req.user._id});
        res.json(hotel);
    } catch (error) {
        res.status(500).json({message:"Hotel creation failed"})
    }
};

exports.getAllHotels = async(req,res)=>{
    const hotels = await Hotel.find({isActive:true});
    res.json(hotels);
};


exports.getSingleHotel = async(req,res)=>{
    try{
        const hotel = await Hotel.findById(req.params.id);
        if(!hotel) return res.status(404).json({message:"Hotel not found"});
        res.json(hotel);
    }catch(error){
        console.log(error.message);
        res.status(500).json({message:error.message})
    }
};

exports.updateHotel = async(req,res)=>{
    try{
        const hotel = await Hotel.findByIdAndUpdate(req.params.id,req.body,{new:true})
        res.json(hotel);
    }catch(error){
        console.log(error.message);
        res.status(500).json({message:error.message})
    }
};

exports.deleteHotel = async(req,res)=>{
    try{
        await Hotel.findByIdAndDelete(req.params.id);
        res.json({message:'Hotel deleted'});
    }catch(error){
        console.log(error.message);
        res.status(500).json({message:error.message})
    }
};