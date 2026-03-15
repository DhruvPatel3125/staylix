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

  // Available rooms is now calculated dynamically based on date-overlaps
  // availableRooms: {
  //   type: Number,
  //   required: true
  // },

  guestCapacity: {
    type: Number,
    required: true,
    default: 1
  },

  amenities: [String],

  image: {
    type: String,
    default: null
  },

  photos: [String],

  isAvailable: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
