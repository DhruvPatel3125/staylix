const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },

  description: {
    type: String,
    required: true
  },

  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "percentage"
  },

  discountValue: {
    type: Number,
    required: true
  },

  minBookingAmount: {
    type: Number,
    default: 0
  },

  applicableHotels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel"
  }],

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },

  usageLimit: {
    type: Number,
    default: null
  },

  usageCount: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  requestStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved"
  },

  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  rejectionReason: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("Discount", discountSchema);
