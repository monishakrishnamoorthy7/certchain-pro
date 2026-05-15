const mongoose = require('mongoose');

const ProcessedEventSchema = new mongoose.Schema({
  network: { type: String, required: true },
  txHash: { type: String, required: true },
  logIndex: { type: Number, required: true },
  blockNumber: { type: Number },
  blockHash: { type: String },
  processedAt: { type: Date, default: Date.now }
});

ProcessedEventSchema.index({ network: 1, txHash: 1, logIndex: 1 }, { unique: true });

module.exports = mongoose.model('ProcessedEvent', ProcessedEventSchema);
