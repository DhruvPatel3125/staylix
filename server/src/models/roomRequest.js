const mongoose = require("mongoose");

const roomRequestSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true
  },

  roomType: {
    type: String,
    enum: ["single", "double", "deluxe", "suite"],
    required: true
  },

  pricePerNight: {
    type: Number,
    required: true
  },

  totalRooms: {
    type: Number,
    required: true
  },

  availableRooms: {
    type: Number,
    required: true
  },

  amenities: [String],

  description: String,

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  rejectionReason: String

}, { timestamps: true });

module.exports = mongoose.model("RoomRequest", roomRequestSchema);
