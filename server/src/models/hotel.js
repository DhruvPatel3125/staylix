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
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },

  description: {
    type: String,
    default: ''
  },

  amenities: {
    type: [String],
    default: []
  },

  photos: {
    type: [String],
    default: []
  },

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
