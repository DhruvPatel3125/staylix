const mongoose = require("mongoose");

const webhookLogSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    index: true
  },
  payload: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  errorMessage: {
    type: String
  },
  responseTime: {
    type: Number // in ms
  }
}, { timestamps: true });

module.exports = mongoose.model("WebhookLog", webhookLogSchema);
