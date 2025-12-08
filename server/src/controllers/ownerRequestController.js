const OwnerRequest = requier("../models/ownerRequest.js")
const User = require('../models/user');

exports.createRequest = async(req,res) =>{
    const request = await OwnerRequest.create({
        userId:req.user._id,
        businessName:req.body.businessName,
        document:req.body.document,
    });
    res.json(request);
}

exports.getAllRequests = async (req,res) =>{
    const requests = await OwnerRequest.find().populate("userId");
    res.json(requests);
}

exports.approveRequest = async(req,res) =>{
    const request = await OwnerRequest.findById(req.params.id);
    request.status = "approved";
    await request.save();
    await User.findByIdAndUpdate(request.userId, {role:"owner"})
    res.json({message:"Owner approved"})
}

exports.rejectRequest = async(req,res) =>{
    const request = await OwnerRequest.findById(req.params.id);
    request.status = "rejected";
    await request.save();
    res.json({message:"Owner rejected"})
}