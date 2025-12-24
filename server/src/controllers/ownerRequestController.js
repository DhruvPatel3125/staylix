const OwnerRequest = require("../models/ownerRequest.js")
const User = require('../models/user');

exports.createRequest = async(req, res) => {
    try {
        const { businessName } = req.body;
        const document = req.file ? req.file.path : null;

        if (!businessName || !document) {
            return res.status(400).json({
                success: false,
                message: "Business name and document are required"
            });
        }

        const existingRequest = await OwnerRequest.findOne({ userId: req.user._id });
        if (existingRequest && existingRequest.status === "pending") {
            return res.status(400).json({
                success: false,
                message: "You already have a pending request"
            });
        }

        const request = await OwnerRequest.create({
            userId: req.user._id,
            businessName,
            document
        });

        res.status(201).json({
            success: true,
            request
        });
    } catch (error) {
        console.error("Create owner request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create request"
        });
    }
};

exports.getAllRequests = async (req, res) => {
    try {
        let requests;
        if (req.user.role === "admin") {
            requests = await OwnerRequest.find().populate("userId", "name email");
        } else {
            requests = await OwnerRequest.find({ userId: req.user._id }).populate("userId", "name email");
        }
        res.json({
            success: true,
            requests
        });
    } catch (error) {
        console.error("Get owner requests error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch requests"
        });
    }
};

exports.approveRequest = async(req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                message: "Request ID is required"
            });
        }

        const request = await OwnerRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        if (request.status === "approved") {
            return res.status(400).json({
                success: false,
                message: "Request is already approved"
            });
        }

        request.status = "approved";
        await request.save();
        await User.findByIdAndUpdate(request.userId, { role: "owner", isApproved: true });

        res.json({
            success: true,
            message: "Owner request approved successfully"
        });
    } catch (error) {
        console.error("Approve request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to approve request"
        });
    }
};

exports.rejectRequest = async(req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                message: "Request ID is required"
            });
        }

        const request = await OwnerRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        if (request.status === "rejected") {
            return res.status(400).json({
                success: false,
                message: "Request is already rejected"
            });
        }

        request.status = "rejected";
        await request.save();

        res.json({
            success: true,
            message: "Owner request rejected successfully"
        });
    } catch (error) {
        console.error("Reject request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reject request"
        });
    }
};