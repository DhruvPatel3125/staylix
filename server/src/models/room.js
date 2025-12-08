const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true
  },

  title: {
    type: String,
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

  photos: [String]

}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
