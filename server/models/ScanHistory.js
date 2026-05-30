const mongoose = require("mongoose");

const scanHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  plantName: {
    type: String,
    required: true,
    trim: true,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  topPredictions: [
    {
      label: { type: String, required: true },
      confidence: { type: Number, required: true },
    },
  ],
  scannedAt: {
    type: Date,
    default: Date.now,
  },
});

// Sort by most recent first
scanHistorySchema.index({ userId: 1, scannedAt: -1 });

module.exports = mongoose.model("ScanHistory", scanHistorySchema);
