const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  address: {
    city: String,
    state: String,
    country: String,
    pincode: String
  },

  description: {
    type: String
  },

  amenities: [String],

  photos: [String],

  rating: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Hotel", hotelSchema);
