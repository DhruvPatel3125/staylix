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
  category: {
    type: String,
    enum: ['luxury', 'resort', 'boutique', 'business', 'none'],
    default: 'none'
  },
  photos: {
    type: [String],
    default: []
  },

  rating: {
    type: Number,
    default: 0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0.0, 0.0]
    }
  }

}, { timestamps: true });

hotelSchema.index({ location: '2dsphere' });

module.exports = mongoose.model("Hotel", hotelSchema);
